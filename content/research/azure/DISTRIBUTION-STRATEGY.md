# Email Agent — Distribution Strategy & Technical Plan

**Document status:** Draft for internal review and feedback
**Author:** Blake Thomson
**Date:** February 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Core Philosophy: Local-First Architecture](#core-philosophy)
4. [Application Architecture](#application-architecture)
5. [Frontend & User Experience](#frontend--user-experience)
6. [Distribution Strategies](#distribution-strategies)
7. [Technical Distribution Challenges](#technical-distribution-challenges)
8. [IT Approval & Vendor Onboarding](#it-approval--vendor-onboarding)
9. [Recurring Revenue Models](#recurring-revenue-models)
10. [Update Delivery](#update-delivery)
11. [Future Feature Roadmap](#future-feature-roadmap)
12. [Open Questions for Discussion](#open-questions-for-discussion)

---

## Executive Summary

The Email Agent is a local AI assistant that reads a user's Outlook inbox and lets them query, summarize, and act on their email through natural language. It is designed to run entirely on the user's machine with a single, auditable outbound connection: their own Azure OpenAI API endpoint.

This document covers how we distribute this product to external clients, how we protect recurring revenue, how we handle IT approval and security concerns, and how we plan to grow the platform over time. Two distribution models are evaluated — a self-serve commodity approach and a high-touch bespoke model — with a recommendation to launch commodity-first to validate the market, with bespoke as the path to higher-value clients.

The defining competitive advantage of this product is trust. By keeping all data local and making that architecture fully transparent and auditable, we can enter regulated and security-conscious organizations that would never accept a cloud-first email tool.

---

## Product Overview

The Email Agent gives knowledge workers a conversational interface to their own email history. Instead of manually searching, scrolling, and triaging, users ask plain English questions:

- *"What needs my attention today?"*
- *"Summarize everything from Dr. Jones this month."*
- *"What deadlines do I have coming up?"*
- *"Draft a reply to Sarah saying the data will be ready by Friday."*

The agent reads the full Outlook inbox and sent items, stores them in a local database, and uses Azure OpenAI (GPT-4o) to answer questions with full context. It also generates structured daily digests and can compose draft replies that save directly to Outlook Drafts — the user always reviews before sending.

**Target users:** Knowledge workers at small-to-mid-size organizations who live in Outlook and are overwhelmed by email volume — outreach liaisons, account managers, coordinators, business development professionals, and clinical administrators in healthcare settings.

---

## Core Philosophy

### Local-First: Data Never Leaves the Machine

This is the non-negotiable foundation of the product and the primary reason clients in regulated industries will be able to adopt it without lengthy approval processes.

```
What stays on the client's machine:
  - The full email database (DuckDB file on local disk)
  - All email bodies, subjects, senders, thread history
  - Attachment filenames (content is never processed)
  - The AI agent, web server, and all application logic

What leaves the machine:
  - Natural language queries sent to the client's Azure OpenAI endpoint
  - No email metadata, no addresses, no organizational data goes to us
  - No telemetry, no analytics, no usage data sent to our servers
  - The only exception: a license validation call (key + machine hash) to our license server
```

**Why this matters for adoption:**

Most organizations have clear policies about email data leaving the corporate environment. Cloud-based email AI tools (Copilot, Google Gemini, third-party plugins) require detailed IT review, legal approval, and sometimes a business associate agreement (BAA). Our product sidesteps this entire process because there is no cloud data transfer to evaluate — the data never leaves the machine in the first place.

The only outbound call that carries any email content is to the client's own Azure OpenAI endpoint — the same endpoint their organization already approved for use in Teams Copilot and other Microsoft integrations. This means the data governance question is already answered before we show up.

### Transparency as a Feature

We actively encourage clients to inspect the application. The local database is a standard DuckDB file they can open and query themselves. The network traffic is limited to one known endpoint. We can provide a network traffic log on request. This transparency is the trust mechanism — we are not asking clients to take our word that data is safe, we are showing them that there is no technical path for data to leave.

---

## Application Architecture

The application runs as three separate services, all on the local machine:

```
LOCAL MACHINE
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Microsoft Outlook (must be running)                            │
│       │                                                         │
│       │  [Service 1] Email Sync Monitor                        │
│       │  Polls Outlook via Windows COM every 5 minutes         │
│       │  Writes inbox + sent items to local database           │
│       ▼                                                         │
│  email_agent.duckdb  (local file — all email stored here)      │
│       │                                                         │
│       │  [Service 2] Web Interface                             │
│       │  FastAPI server on localhost:8508                       │
│       │  Serves chat UI, digest, email browser                 │
│       │  Reads database (read-only)                             │
│       │  Calls Azure OpenAI for AI responses                   │
│       │                                                         │
│  [Service 3] Outlook Bridge                                     │
│  FastAPI server on localhost:8509                               │
│  Receives "Save to Drafts" requests from the UI                 │
│  Creates Outlook MailItem via COM (never sends automatically)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │  HTTPS (email content in query only)
                          ▼
           Client's Azure OpenAI Endpoint
           (e.g., client-openai.openai.azure.com)
           Covered by their existing BAA / data agreement
```

### Why Three Services

**Service 1 (Email Sync)** uses Windows COM automation (pywin32) to talk directly to the running Outlook application. This cannot run inside a Linux Docker container — it requires a live Windows session with Outlook open. It runs as a native Windows process, invisibly, via Windows Task Scheduler.

**Service 2 (Web Interface)** is a pure web server with no Outlook dependency. It only reads the database file. In the current developer version this runs in Docker. In the client distribution (PyInstaller), it runs as a native Windows executable — no Docker required.

**Service 3 (Outlook Bridge)** also requires Windows COM, for the reverse direction: writing draft emails back into Outlook. This is optional — it is only needed for the "Save to Outlook Drafts" button. Without it, the agent can still compose drafts that the user copies manually.

### Database

All email data is stored in a single DuckDB file (`email_agent.duckdb`) in a user-controlled directory. DuckDB is an embedded database — there is no database server, no network port, no external process. The file can be copied, backed up, or deleted by the user at any time.

**Schema overview:**

| Table | Contents |
|---|---|
| `inbox` | One row per email — subject, body, sender, recipients, date, folder, thread ID |
| `threads` | One row per conversation thread — participants, email count, reply status |
| `action_items` | LLM-extracted tasks and deadlines (Phase 6, planned) |

---

## Frontend & User Experience

The web interface is accessible at `http://localhost:8508` in any browser. It is a single-page application built with vanilla HTML, CSS, and JavaScript — no framework dependencies, no external CDN calls except for the markdown rendering library (marked.js, loaded once at startup).

### Chat Interface

The primary view is a conversational chat window. Users type natural language questions and receive markdown-formatted responses. The agent automatically selects which tools to use — the user never specifies how to retrieve information, they just ask.

The agent has seven tools it uses transparently:

| Tool | What it does |
|---|---|
| `search_emails` | Full-text search by keyword, sender, subject, date range |
| `get_thread` | Retrieves a full conversation in chronological order |
| `get_email` | Fetches a single email with full body |
| `get_unreplied` | Finds inbox emails that haven't received a reply |
| `get_emails_by_sender` | All correspondence involving a specific person |
| `list_threads` | Active conversation threads, most recent first |
| `draft_reply` | Composes a reply and renders it as an editable draft card |

**Quick prompt chips** appear above the chat input for one-click access to common questions: "What needs my attention today?", "Show unreplied emails", "Generate digest", and others.

### Email Browser Sidebar

The left panel shows a scrollable list of recent inbox and sent emails with tabs to switch between them. Clicking any email surfaces it in the chat context, making it easy to ask the agent about a specific message.

### Daily Digest

The "Daily Digest" button generates a structured morning briefing using a dedicated prompt that instructs the agent to organize output into five sections:
- **Action Required** — unreplied emails, sorted by urgency and age
- **Active Threads** — conversations with recent activity, with waiting-on status
- **Upcoming Deadlines & Meetings** — emails with explicit dates extracted
- **FYI / Low Priority** — count only, no detail
- **Inbox Summary** — two-to-three sentence overview with the single most important action

### Draft Reply Cards

When the agent composes a reply, it renders in a distinct blue card with:
- **To**, **Subject**, and **Body** fields
- **Edit button** — makes the body directly editable in place
- **Copy button** — copies the draft body to clipboard
- **Save to Outlook Drafts button** — sends the draft to the Outlook bridge, which creates a MailItem in the user's Drafts folder for review and send

The agent never sends email automatically. Every draft requires an explicit user action.

### Status Indicators

The header shows live counts from the database: total emails indexed, inbox count, sent count, unreplied in the last 7 days, active threads, and time of last sync. A colored pill shows bridge connection status (online/offline), controlling whether the "Save to Drafts" button is shown.

---

## Distribution Strategies

### Option A — Commodity / Self-Serve

**Target:** Organizations or individuals at $50–150/month per seat, low-touch, self-onboarding, 20–100 clients.

**How it works:**

The client receives a single installer executable (`EmailAgent-Setup.exe`). They run it, answer three prompts (name, work email, API key), and the agent is running in 10–15 minutes. No IT involvement required in most environments.

The installer is built using PyInstaller, which bundles Python, all libraries, and the application into a self-contained Windows executable. The client machine needs no Python installation, no Docker, no package manager. Everything is included.

**Client receives:**
```
EmailAgent-Setup.exe      ← single file, ~80–120 MB
```

**What the installer does (automated):**
1. Checks that Outlook is installed and running
2. Creates install directory at `%LOCALAPPDATA%\EmailAgent\`
3. Extracts three executables: `EmailAgent-App.exe`, `EmailAgent-Monitor.exe`, `EmailAgent-Bridge.exe`
4. Prompts for name, work email, and Azure OpenAI API key — writes to local config
5. Prompts for initial backfill period (default 14 days) — runs email sync
6. Registers two Windows Task Scheduler tasks (user-level, no admin required): email sync and bridge
7. Starts the web interface
8. Opens browser to `http://localhost:8508`

**Admin rights:** Not required for any step. All files install to the user's own AppData directory. Task Scheduler tasks are registered at the current user level.

**Revenue enforcement:** A license key is required at install time. The app validates the key against our license server on startup (one HTTPS call, key + machine hash, no email data). If the subscription lapses, the key is deactivated and the app exits with a renewal message on next start.

---

### Option B — Bespoke / High-Touch

**Target:** Larger organizations, teams, or clients who need custom features, integrations, or workflow automation at $500+/month.

**How it works:**

Installation is performed by the developer (screen share or on-site). The client relationship is treated as a consulting engagement rather than a software subscription. Custom features are built on top of the shared base product using a config-and-module architecture:

- **Base product** (maintained centrally): core chat, digest, tools, Outlook sync
- **Per-client config**: feature flags, custom prompt context, integration endpoints
- **Bespoke modules**: client-specific tools (CRM writer, report dispatcher, custom digest templates)

**Examples of bespoke features:**
- Salesforce CRM writer: agent logs email interactions as Salesforce Tasks on the relevant contact
- Custom report generation: agent queries internal data sources and emails results
- Multi-inbox support: agent monitors multiple Outlook profiles
- Shared team digest: daily briefing emailed to a distribution list each morning
- Custom integrations: Slack notifications, calendar summaries, EHR task creation

**Revenue enforcement:** At this price point, enforcement is contractual and relational. A basic license check is still included for professionalism and as a soft mechanism, but the primary lever is the ongoing service relationship.

---

### Comparison

| Factor | Option A (Commodity) | Option B (Bespoke) |
|---|---|---|
| Price | $50–150/month | $500+/month + setup fee |
| Clients needed for $3K MRR | 20–60 | 6–10 |
| Installation | Self-serve | Developer-assisted |
| IT involvement | Minimal (see below) | Full vendor relationship |
| Features | Core product | Core + custom modules |
| Update delivery | Automated version check | Deployed per engagement |
| Code signing needed | Yes | Yes |
| License server | Critical | Nice-to-have |
| Revenue model | Subscription via license key | Retainer + project fees |
| Time to first revenue | Faster | Slower (longer sales cycle) |

**Recommendation:** Launch commodity-first to build evidence of value and a client base. Use bespoke engagements to fund development of features that later flow back into the commodity product. A CRM writer built for one $500/month client eventually becomes a feature toggle in the commodity product available to all subscribers.

---

## Technical Distribution Challenges

### 1. Python Dependency Management

**Problem:** Distributing Python source code requires clients to have the correct Python version, run `pip install`, and hope all packages resolve correctly on their machine. pywin32 in particular has a secondary post-install registration step that many instructions miss, causing silent COM failures.

**Solution: PyInstaller**

PyInstaller freezes the entire Python environment — interpreter, all libraries, all DLLs — into a single executable. The client machine needs nothing. The exact library versions from the build machine are what run on the client machine. Version drift, pip conflicts, and platform differences are eliminated.

```
EmailAgent-App.exe bundles:
  Python 3.12 interpreter
  FastAPI + uvicorn (web server)
  DuckDB 1.4.x (database engine)
  pywin32 (Outlook COM automation)
  openai SDK (Azure OpenAI calls)
  pyyaml, pytz, pydantic
  static/index.html (chat UI)
  All supporting modules
```

**Build process:** A `build.bat` script runs PyInstaller for each of the three components, producing three `.exe` files and an installer that packages them together. The build runs on a Windows 10/11 machine and the output is compatible with any Windows 10/11 machine.

**Known edge case:** PyInstaller-built executables are occasionally flagged by antivirus engines as suspicious because the format is also used by malware. The fix is a code signing certificate (see below).

---

### 2. Antivirus and Windows SmartScreen

**Problem:** An unsigned `.exe` from an unknown publisher triggers Windows SmartScreen ("Windows protected your PC") and may be blocked outright by corporate endpoint protection software (CrowdStrike, SentinelOne, Microsoft Defender for Endpoint in strict policy mode).

**Solution: Code Signing Certificate**

A code signing certificate from a Certificate Authority (DigiCert, Sectigo, or similar) signs the executable with the publisher's verified identity. Once signed:
- SmartScreen warning is suppressed
- Most antivirus engines trust the binary
- Corporate endpoint protection whitelists known publishers

**Cost:** $100–300/year for an Individual or Organization Validation (OV) certificate.

**Process:** Certificate is purchased, a `.pfx` file is used to sign the `.exe` during the build step using Microsoft's `signtool`. This adds approximately 5 minutes to the build process.

For organizations with Extended Validation (EV) certificates, SmartScreen reputation is established immediately. For standard OV certificates, reputation builds over time as more users download and run the application without flagging it.

---

### 3. Docker Dependency (Current Limitation)

**Problem:** The current installer requires Docker Desktop to be installed on the client machine. Docker Desktop requires administrator privileges to install, requires WSL2 (a Windows feature that may need IT enablement), and is a heavyweight dependency (~500 MB) that many corporate IT policies require approval for.

**Resolution:** Docker is only used in the current developer setup for convenience. For client distribution, the web interface (`app.py`) will run as a native PyInstaller executable instead. The Docker setup is retained for developer use only. No client-facing distribution will require Docker.

This is the single highest-priority technical change before external distribution.

---

### 4. Windows Task Scheduler and Background Services

**Problem:** The email sync monitor and Outlook bridge need to start automatically when the user logs in and run continuously in the background.

**Solution:** Windows Task Scheduler with user-level tasks. Tasks registered at the user scope (not the system scope) do not require administrator privileges. The tasks launch the respective `.exe` files at login and restart them if they crash.

**User experience:** These tasks are invisible. The user does not interact with them. If a task fails (e.g., Outlook is closed), it exits silently and restarts on the next login. A manual `.bat` file for each service is provided as a fallback for troubleshooting.

**Limitation:** Task Scheduler registration may fail silently if the user's corporate policy restricts it. In that case, the user can start the monitor and bridge manually by double-clicking the provided `.bat` launchers. The core chat functionality is unaffected — only automatic background sync is impacted.

---

### 5. Outlook COM Automation

**Problem:** The email sync and draft bridge use Windows COM automation to communicate with the running Outlook application. Some corporate IT policies disable COM automation for security reasons (it can be used to read or send email programmatically).

**Assessment:** COM automation is standard and is used by many legitimate tools including Microsoft's own add-ins, calendar sync utilities, and backup tools. Outright blocking of Outlook COM is uncommon outside of highly regulated financial or government environments.

**If COM is blocked:** This would prevent both email sync and the Save to Drafts feature. The core chat functionality against an existing database would still work; only new email ingestion would be affected. This is a genuine hard dependency for the product's core value proposition.

**Mitigation for future versions:** Microsoft Graph API is a modern, REST-based alternative to COM that does not require Outlook to be running and works remotely. Migrating sync to Graph API eliminates the COM dependency entirely but requires an Azure AD app registration and user OAuth consent — a more formal IT process. This is planned for Phase 8 (multi-user).

---

### 6. Pre-Flight Diagnostic

Before any installation attempt, clients run `diagnose.ps1` — a read-only pre-flight script that checks all 10 requirements and produces a pass/fail report. This script:

- Verifies Windows version (10 or 11)
- Checks Python is installed and on PATH (3.11+)
- Checks Docker status (currently; removed in PyInstaller distribution)
- Confirms Outlook is installed and running
- Tests Outlook COM accessibility (inbox item count)
- Evaluates PowerShell execution policy
- Checks admin rights (affects Task Scheduler registration)
- Verifies ports 8508 and 8509 are free
- Confirms sufficient disk space (3 GB minimum)
- Tests Azure OpenAI endpoint and Docker registry reachability

Clients can save the output to a text file and send it to us before attempting install. This eliminates the most common support scenario ("it didn't install, I don't know why") by catching blockers in advance.

---

## IT Approval & Vendor Onboarding

### What We Require from IT

| Requirement | Notes |
|---|---|
| Outlook installed and running | Standard for any Outlook user |
| Outbound HTTPS to client's Azure OpenAI endpoint | Already approved for Teams Copilot |
| Outbound HTTPS to our license server | One call on startup, key + machine hash only |
| Ports 8508 and 8509 open on localhost | Localhost only — no inbound network exposure |
| User-level Task Scheduler access | Standard user permission; no admin needed |

**What we do not require:**
- No admin/elevated privileges for normal operation
- No inbound firewall rules or port forwards
- No VPN changes
- No database server or network service installation
- No MDM enrollment or policy changes

### The Local-First Advantage for IT

The typical IT objection to third-party software accessing email is: *"Where does the data go?"* Our answer is documented, auditable, and technically verifiable: **it doesn't go anywhere.** The email database is a file on the user's machine. The only outbound call that includes any email content goes to the client's own Azure OpenAI endpoint — infrastructure they already control.

This means:
1. There is no vendor data processing agreement needed for email data (data doesn't reach us)
2. There is no HIPAA BAA needed from us (we never receive PHI)
3. The client's existing Azure BAA covers the only external call
4. IT can verify data handling by inspecting network traffic or reviewing the open source code

We can provide:
- A one-page data flow diagram for IT security review
- A network traffic log showing the exact outbound calls
- Source code access for security review (under NDA if preferred)
- Written attestation that we do not collect, store, or process client email data

### Formal Vendor Onboarding (Bespoke Model)

For high-value bespoke clients, formal IT vendor onboarding is appropriate and expected. At $500+/month, the client is making a real purchasing decision and their IT team will be involved. We enter this process as a legitimate software vendor, not a shadow IT workaround.

Documents typically requested in healthcare IT vendor onboarding:
- Business Associate Agreement (BAA) — we sign this but note that email content does not pass through our systems
- SOC 2 report or security questionnaire — we complete the questionnaire; SOC 2 is a longer-term goal
- Data flow diagram — provided
- Penetration test results — not required for local software; we note the attack surface is the client's own machine
- Insurance certificate — general liability and E&O coverage

### Shadow IT vs. Formal Vendor (Commodity Model)

For the commodity self-serve model targeting individual users or small teams, the install profile is designed to require no IT interaction:
- No admin rights
- No network configuration
- No firewall rules
- No email to IT
- Localhost-only web server

This is the same profile as many legitimate productivity tools (Obsidian, Notion desktop client, various utility apps) that employees install without IT review. The product is not asking for anything unusual.

---

## Recurring Revenue Models

### License Key + Subscription

The recommended model for the commodity approach:

1. **New client pays** via Stripe, Paddle, or direct invoice
2. **License key is generated** — a unique key tied to one machine (by hostname + MAC hash)
3. **Key is delivered** with the download link for `EmailAgent-Setup.exe`
4. **App validates key on startup** by calling our license server
5. **Key stays valid** while subscription is current
6. **Key is deactivated** when subscription lapses — app exits with renewal message on next start

**Machine binding** prevents a single license being used on multiple machines. If a client needs multiple seats, they purchase one license per user. A grace period (7 days offline) prevents disruption from network issues or travel.

### License Server Architecture

The license server is a small, standalone service:

```
Stack:
  FastAPI (Python) — ~100 lines
  PostgreSQL (licenses table)
  Hosted on: Azure Container App / Render / Railway (~$5–10/month)

licenses table:
  key           VARCHAR PRIMARY KEY   -- XXXX-XXXX-XXXX format
  machine_hash  VARCHAR               -- set on first activation
  client_name   VARCHAR
  client_email  VARCHAR
  plan          VARCHAR               -- monthly | annual | trial
  status        VARCHAR               -- active | expired | cancelled
  expires_at    TIMESTAMP
  created_at    TIMESTAMP

Endpoints:
  POST /validate  { key, machine_id } → { valid, expires, latest_version, installer_url }
  POST /activate  { key, machine_id } → sets machine_hash on first use
  GET  /admin     → license dashboard (internal only)
```

The validate endpoint serves double duty: it confirms the license is active and returns the current version number. If the client's installed version is behind, the app shows an update prompt. One server call handles both license enforcement and update notification.

### Pricing Options

| Model | Price | Notes |
|---|---|---|
| Monthly subscription | $75–150/user/month | Auto-renewing, hard-enforced by license |
| Annual subscription | $750–1,500/user/year | ~15% discount vs monthly |
| Setup fee | $200–500 one-time | Covers onboarding call, initial config, first backfill |
| Bespoke retainer | $500+/month | Includes development hours for custom features |
| Trial | 14-day free, no credit card | License key with 14-day expiry |

**Revenue projections (commodity model):**

| Clients | Monthly per seat | MRR |
|---|---|---|
| 10 | $100 | $1,000 |
| 25 | $100 | $2,500 |
| 50 | $100 | $5,000 |
| 10 bespoke | $500 | $5,000 |

---

## Update Delivery

### Problem

Without an update mechanism, clients stay on whatever version they installed indefinitely. Six months later they are missing major features, running against deprecated API versions, and generating support tickets about bugs that were fixed long ago.

### Approach: Version Check on Startup (Prompted)

On every startup, the app calls the license validation endpoint. The response includes:

```json
{
  "valid": true,
  "expires": "2026-06-01",
  "current_version": "1.0.0",
  "latest_version": "1.3.0",
  "installer_url": "https://..."
}
```

If the installed version is behind:
- A non-blocking banner appears at the top of the UI
- Clicking "Update" downloads the new installer and launches it
- The user can dismiss the banner and update later

**Why prompted rather than silent:** Silent auto-update on a business workstation can surprise users and interrupt work. A visible prompt respects user agency and avoids "my tool updated and something changed" support tickets.

**Technical note:** A running `.exe` on Windows cannot replace itself (the file is locked). The update flow downloads a new installer, runs it, and exits the old app. The installer overwrites the previous version in place.

### Version Rollout Strategy

For bespoke clients, updates are deployed deliberately — often in a call where new features are demonstrated and explained. For commodity clients, updates roll out via the version check mechanism. A staged rollout (e.g., 10% of clients get `latest_version` bumped first for a week before full rollout) can be implemented by adding a `rollout_pct` field to the version record.

---

## Future Feature Roadmap

The current product covers email reading, summarization, draft composition, and daily digest. The roadmap expands the agent's ability to take actions and integrate with external systems.

### Phase 5 — CRM Writer (Next)

**What it does:** When a user asks the agent to log a meeting or interaction, the agent extracts structured fields (contact, account, activity type, notes) from the email or conversation description and creates a Salesforce Task on the relevant contact record.

**Example:**
> *"Log a call with Dr. Chen. I spoke with her about the Q2 referral volume. She's interested in a demo."*

**Why it matters:** Salesforce data entry is one of the most disliked tasks for outreach reps. Doing it from email context — which already contains all the relevant information — eliminates most of the friction.

**Technical path:** Salesforce REST API via `simple-salesforce` Python library. Requires a connected app in the client's Salesforce org (OAuth or API key). This becomes the first external-write integration, which is a meaningful expansion of the product's trust model that needs to be communicated clearly to clients.

---

### Phase 6 — Action Item Extraction

**What it does:** A scheduled background process runs through all unprocessed emails, passes them through GPT-4o with a structured extraction prompt, and populates the `action_items` table with tasks, deadlines, and priorities.

**Example output:**
- *(High)* Reply to Dr. Martinez re: referral data request — due Friday
- *(Medium)* Send Q4 summary to finance team — mentioned Jan 15
- *(Low)* Follow up with coordinator at Huntington — no specific deadline

These surface in the digest and can be queried directly: *"What tasks are overdue?"*

**Technical path:** Background processor runs on a schedule (e.g., nightly or every few hours). The `action_items` table already exists in the schema, ready to receive data.

---

### Phase 7 — Sender Analytics

**What it does:** Aggregate statistics about email relationships — response time, volume trends, conversation depth, and relationship health scores.

**Example queries:**
- *"Who am I most responsive to? Who takes me the longest to reply to?"*
- *"Which contacts have I not emailed in over 30 days?"*
- *"Show me all contacts where response time has increased over the last month."*

**Why it matters:** For account managers and outreach professionals, relationship health is a key metric. This surfaces it from data that already exists in the inbox without requiring any additional data entry.

**Technical path:** Computed fields added to the `threads` table. Scheduled aggregation job that runs weekly to update relationship metrics.

---

### Phase 8 — Microsoft Graph API Migration

**What it does:** Replaces the Windows COM (Outlook Desktop) dependency with Microsoft Graph API for email sync and draft creation.

**Why it matters:**
- Outlook does not need to be running for sync to work
- Works on machines where Outlook COM is disabled
- Enables server-side or multi-user deployments (Phase 9)
- Opens the door to non-Windows clients (Mac, Linux)
- Graph API is the modern, supported Microsoft path for email access

**Technical path:** OAuth 2.0 flow with an Azure AD application registration in the client's tenant. The client or their IT admin grants the app `Mail.Read` and `Mail.ReadWrite` delegated permissions. Sync runs against the Graph API rather than local COM, so it functions even when Outlook is closed.

**Trade-off:** Requires more IT involvement (Azure AD app registration). For clients who can't do COM (locked-down IT environments), this is the enabling unlock. For clients who can do COM, it is optional but recommended for reliability.

---

### Phase 9 — Multi-User / Team Deployment

**What it does:** A single shared instance of the Email Agent serves a whole team, with each user's email in their own partition, and shared features (team digest, cross-inbox search with permission controls) available across the group.

**Architecture shift:** Moves from a local DuckDB file to a shared PostgreSQL database (hosted on the client's Azure or AWS). The web interface and agent become a shared service rather than a per-machine application. Email sync becomes a server-side process using Graph API.

**Why it matters:** The current per-machine model doesn't scale to teams. A manager who wants to see their team's collective action items, or an organization that wants a unified digest across ten reps, needs a shared backend.

**Revenue impact:** Shifts from per-seat licensing to per-organization licensing, with a higher base price and potentially consumption-based pricing for API usage.

---

### Summary Roadmap

| Phase | Status | Description | Revenue Impact |
|---|---|---|---|
| 1 | Done | Email ingestion for agent-request workflow | Foundation |
| 2 | Done | Full inbox ingestion, thread grouping, 6 tools | Core product |
| 3 | Done | Docker web UI, chat interface | Distributable |
| 4 | Done | Draft reply, Outlook bridge, installer | Ready for distribution |
| 5 | Next | CRM writer (Salesforce) | Key differentiator for sales teams |
| 6 | Planned | Action item extraction, `action_items` table | Daily utility driver |
| 7 | Planned | Sender analytics, relationship health | Retention feature |
| 8 | Planned | Microsoft Graph API (no Outlook required) | Removes key IT blocker |
| 9 | Planned | Multi-user, shared PostgreSQL + Graph | Team/enterprise tier |

---

## Open Questions for Discussion

These are the key decisions that benefit from stakeholder input before we move forward:

**1. Which distribution model first?**
Commodity self-serve requires completing the PyInstaller build and license server before the first client. Bespoke requires neither — we can do the first install manually today. Is there a specific client opportunity in front of us that should drive this choice?

**2. Pricing validation**
The $75–150/month commodity pricing is an initial estimate. Is there a specific target market (healthcare outreach, pharma, other) where we have enough context to validate willingness to pay before building the billing infrastructure?

**3. Code signing timing**
A code signing certificate is needed before commodity distribution to avoid SmartScreen / antivirus friction. Should this be acquired as part of the PyInstaller build work, or only after we have a confirmed first external client?

**4. Salesforce CRM writer scope**
Phase 5 requires the client to have a Salesforce org and be willing to grant API access. Is this a hard requirement for our initial target clients, or should Phase 6 (action items — fully local) be prioritized first since it requires no external integration?

**5. Microsoft Graph API timeline**
Some target organizations may have COM automation disabled by IT policy. Does the current COM-only approach block known opportunities, or can we proceed to first client with COM and plan Graph API for a later phase?

**6. Multi-user demand signal**
Phase 9 (team deployment) is a significant architectural change. Is there a team-level use case in our initial target market that would justify accelerating this, or is individual per-seat distribution sufficient for the near term?

---

*Questions, feedback, and alternative approaches welcome. The goal of this document is to surface assumptions and trade-offs before we commit engineering time to the distribution infrastructure.*
