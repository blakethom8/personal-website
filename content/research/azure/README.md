# Email Agent — Local AI Email Intelligence

## Purpose

An ambient email intelligence layer that runs locally on your machine. The agent continuously ingests your Outlook inbox and sent items into a local database, then lets you interrogate your email with natural language: "What needs my attention?" "Summarize everything from Dr. Jones this week." "Generate a digest of action items."

**Zero PHI risk:** All email data stays on your local machine. The only outbound call is to your Azure OpenAI endpoint (covered by your BAA), exactly like Teams Copilot.

**Zero new tools for users:** Reps and liaisons interact via the CLI or a daily digest emailed to themselves. No app to learn.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       LOCAL MACHINE                               │
│                                                                  │
│  Outlook (Inbox + Sent)                                          │
│       │                                                          │
│       │  monitor.py  (NATIVE — Windows COM, Task Scheduler)     │
│       │  --backfill 14  on first run                            │
│       ▼                                                          │
│  ./data/email_agent.duckdb   ◄── shared via Docker volume       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  inbox        — all emails (inbox + sent, last N days)  │    │
│  │  threads      — conversation groupings by ConversationID│    │
│  │  action_items — LLM-extracted tasks and deadlines       │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │  read-only mount                     │
│  ┌────────────────────────▼────────────────────────────────┐    │
│  │   Docker container  (email-agent:latest)  port 8508     │    │
│  │                                                         │    │
│  │   FastAPI app.py                                        │    │
│  │      AgentSession + 6 email tools                       │    │
│  │      /api/chat  /api/digest  /api/status                │    │
│  │                                                         │    │
│  │   static/index.html  — chat UI                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Also available natively (no Docker):                           │
│     ask.py (CLI)     digest.py (daily digest → file/email)      │
└──────────────────────────────────────────────────────────────────┘
                           │
                           │  HTTPS — API calls only
                           ▼
              Azure OpenAI (csmn-bd-openai.openai.azure.com)
              PHI-covered endpoint — your BAA applies
```

### Why the monitor stays native

`monitor.py` uses `pywin32` (Outlook COM automation), which requires a running
Outlook session on a Windows machine. Linux Docker containers cannot call Windows COM.
The monitor is a lightweight background poller — it runs invisibly via Task Scheduler
and writes to the DuckDB file. The Docker container mounts that file read-only and
handles all the intelligence (agent, chat, digest).

This is the cleanest split: data collection stays native and easy, interface runs
containerized and portable.

---

## Agent Tools

The agent uses Azure OpenAI GPT-4o with tool calling. It decides which tools to invoke based on your question — you never need to specify.

| Tool | Purpose |
|---|---|
| `search_emails` | Full-text search by keyword, sender, subject, date range |
| `get_thread` | Full conversation in chronological order by thread ID |
| `get_email` | Single email with full body |
| `get_unreplied` | Inbox emails that haven't received a reply from you |
| `get_emails_by_sender` | All email involving a specific person (sent + received) |
| `list_threads` | Active conversation threads, most recent first |
| `draft_reply` | Compose a reply to an email — renders a draft card in the UI with Save to Outlook Drafts button |

---

## File Structure

```
applications/email-agent/
  app.py              # FastAPI web server (chat, digest, status, email browser)
  agent.py            # AgentSession — Azure OpenAI + 6 email tools
  prompts.py          # System prompt builder
  db.py               # DuckDB schema (inbox, threads, action_items)
  config.py           # Config loader (config.yaml → env vars → defaults)
  monitor.py          # [NATIVE] Outlook COM polling — ingests all email to DuckDB
  ask.py              # [NATIVE] CLI entry point (interactive or single-shot)
  digest.py           # [NATIVE] Daily digest generator (print / save / email)
  setup.py            # [NATIVE] Guided setup wizard for new users
  Dockerfile          # Web app container (Python 3.12-slim, no pywin32)
  docker-compose.yml  # Service definition — mounts ./data, reads .env.local
  .env.local.example  # Env var template — copy to .env.local, fill in key
  requirements-web.txt # Docker dependencies (no pywin32)
  requirements.txt    # Native/full dependencies (includes pywin32)
  config.yaml.example # Config template — copy to ~/email_agent/config.yaml
  bridge.py           # [NATIVE] Outlook COM bridge — exposes /save-draft on port 8509
  launch.bat          # Start Docker web UI → http://localhost:8508
  bridge.bat          # Start Outlook bridge → http://localhost:8509
  ask.bat             # Windows launcher for CLI
  digest.bat          # Windows launcher for daily digest
  run_monitor.bat     # Windows launcher for continuous Outlook polling
  install.ps1         # PowerShell installer for new users (run once)
  diagnose.ps1        # Pre-flight diagnostic — checks prereqs without installing anything
  SETUP.md            # End-user setup guide (non-technical, step-by-step)
  static/
    index.html        # Chat UI (markdown rendering, sidebar email browser)
  data/
    email_agent.duckdb  # Local email store (auto-created by monitor)
  digests/              # Saved digest files (auto-created by digest.py --save)
```

---

## Quick Start (Docker)

```bash
cd applications/email-agent

# 1. Configure
cp .env.local.example .env.local
#    → edit .env.local: add AZURE_OPENAI_API_KEY and your name/email

# 2. Pull email history (native — Outlook must be open)
pip install pywin32 duckdb pyyaml
python monitor.py --backfill 14

# 3. Start the web UI
launch.bat          # or: docker compose --env-file .env.local up --build -d
# → http://localhost:8508

# 4. Keep email current — run in background via Task Scheduler
run_monitor.bat
```

---

## Sharing with Colleagues

The simplest distribution method is a ZIP file or Teams file share of the `email-agent` folder. The recipient runs two scripts:

### Step 1 — Pre-flight check (read-only, nothing installed)

```powershell
powershell -ExecutionPolicy Bypass -File diagnose.ps1
```

`diagnose.ps1` checks 10 things and exits with PASS/WARN/FAIL per item:
- Windows 10/11
- Python 3.11+ on PATH with pip
- Docker Desktop installed and daemon running
- WSL2 (Docker backend)
- Outlook installed, running, and COM-accessible
- PowerShell execution policy (not blocked by MachinePolicy)
- Admin rights (for Task Scheduler registration)
- Ports 8508 and 8509 free
- 3+ GB free disk space
- Azure OpenAI endpoint + Docker Hub reachable

To save the output and send it to you for troubleshooting:
```powershell
powershell -ExecutionPolicy Bypass -File diagnose.ps1 > diag-report.txt 2>&1
```

### Step 2 — Install

```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

`install.ps1` steps (fully automated with prompts):
1. Checks Python 3.11+ (errors with download link if missing)
2. Checks Docker Desktop + daemon (errors with download link if missing)
3. Checks Outlook is open (warns if not, waits for user)
4. `pip install -r requirements.txt`
5. Prompts for name, work email, Azure OpenAI API key → writes `.env.local`
6. Prompts for backfill days → runs `python monitor.py --backfill N`
7. Registers Task Scheduler tasks: `EmailAgentMonitor` and `EmailAgentBridge` (at logon)
8. `docker compose --env-file .env.local up --build -d`
9. Opens browser to `http://localhost:8508`

### Common blockers

| Blocker | Symptom | Fix |
|---|---|---|
| Docker not installed | `[FAIL] Docker Desktop not found` | Install Docker Desktop, open it, wait for whale icon |
| Docker daemon not running | `[FAIL] Docker daemon not running` | Open Docker Desktop from Start menu |
| PowerShell execution policy | Script won't run | Run with: `powershell -ExecutionPolicy Bypass -File install.ps1` |
| Outlook COM blocked | `[FAIL] Outlook COM blocked by security policy` | IT policy issue — contact IT help desk |
| Port in use | `[WARN] Port 8508 is in use` | Another app on same port; check `netstat -ano | findstr :8508` |
| Not admin | `[WARN] Not running as Administrator` | Non-blocking — Task Scheduler tasks may need manual `.bat` launchers |

See `SETUP.md` for the non-technical end-user version of these instructions.

---

## Setup (New User — Full Detail)

### Prerequisites
- Python 3.11+ installed
- Outlook open and logged in
- Azure OpenAI API key from Blake

### Installation

```bash
cd applications/email-agent

# Install dependencies
pip install -r requirements.txt

# Run setup wizard (creates ~/email_agent/config.yaml)
python setup.py

# Pull last 2 weeks of email
python monitor.py --backfill 14

# Test the agent
python ask.py "what needs my attention this week?"
```

### Configuration

Copy `config.yaml.example` to `~/email_agent/config.yaml` and fill in your values:

```yaml
azure_openai:
  endpoint: https://csmn-bd-openai.openai.azure.com/
  api_key: YOUR_KEY_HERE
  deployment: gpt-4o

ingestion:
  lookback_days: 1          # how far back each regular poll looks
  poll_interval_seconds: 300

user:
  name: Your Name
  email: your.email@csmc.edu
```

---

## Running

### Ask a question

```bash
# Interactive session
python ask.py

# Single-shot query
python ask.py "what emails from last week haven't I replied to?"
python ask.py "summarize everything from the finance team this month"
python ask.py "did anyone ask me for data about thoracic surgery?"
python ask.py "what deadlines do I have coming up?"
```

### Daily digest

```bash
python digest.py              # print to terminal
python digest.py --save       # save to digests/digest_YYYY-MM-DD.md
python digest.py --email      # email digest to yourself via Outlook
```

### Keep inbox current

```bash
# Continuous polling (every 5 min) — run via Task Scheduler
python monitor.py

# Manual one-time poll
python monitor.py --once

# Backfill N days of history
python monitor.py --backfill 14
```

### Windows bat launchers

```
ask.bat             # double-click or pin to taskbar
digest.bat          # run from Task Scheduler for daily digest
run_monitor.bat     # Task Scheduler continuous polling
```

---

## Example Queries

```
"What needs my attention today?"
"What emails haven't I replied to in the last week?"
"Summarize the conversation thread about the Q4 budget"
"What did Dr. Kim's coordinator say last week?"
"Did anyone from Huntington reach out this month?"
"What meetings were scheduled via email this week?"
"What data requests are sitting in my inbox?"
"Show me everything from the finance team in February"
"What's been going on with the SGV analysis project?"
"Generate my morning briefing"
```

---

## Database Schema

```sql
-- inbox: one row per email ingested (Inbox + Sent)
inbox (
    id              VARCHAR PRIMARY KEY,   -- Outlook EntryID
    thread_id       VARCHAR,               -- ConversationID (groups thread)
    folder          VARCHAR,               -- 'Inbox' | 'Sent'
    from_email      VARCHAR,
    from_name       VARCHAR,
    recipients_to   VARCHAR,               -- semicolon-separated
    recipients_cc   VARCHAR,
    subject         VARCHAR,
    body_text       TEXT,
    received_at     TIMESTAMPTZ,
    is_read         BOOLEAN,
    importance      VARCHAR,               -- Low | Normal | High
    has_attachments BOOLEAN,
    attachment_names VARCHAR,              -- semicolon-separated filenames
    processed       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ
)

-- threads: one row per conversation
threads (
    thread_id         VARCHAR PRIMARY KEY,
    subject           VARCHAR,
    participant_emails VARCHAR,             -- semicolon-separated unique addresses
    first_email_at    TIMESTAMPTZ,
    last_email_at     TIMESTAMPTZ,
    email_count       INTEGER,
    has_my_reply      BOOLEAN,             -- at least one Sent email in thread
    last_updated      TIMESTAMPTZ
)

-- action_items: LLM-extracted tasks from emails
action_items (
    id           INTEGER PRIMARY KEY,
    inbox_id     VARCHAR,                  -- source email
    description  TEXT,                     -- what needs to be done
    priority     VARCHAR,                  -- High | Medium | Low
    due_date     VARCHAR,                  -- free-text ("Friday", "end of month")
    status       VARCHAR,                  -- open | done | dismissed
    extracted_at TIMESTAMPTZ
)
```

---

## PHI and Security

| What | Where it goes | Safe? |
|---|---|---|
| Email bodies + subjects | Azure OpenAI (your BAA-covered endpoint) | Yes |
| Raw email database | Local DuckDB file only — never leaves machine | Yes |
| Email attachments | Metadata only (filenames). Content never processed | Yes |
| API key | `~/email_agent/config.yaml` on local machine | Yes — don't commit to git |

**Never use the public `api.openai.com` endpoint for this.** Always use your Azure OpenAI endpoint.

---

## Running the Three Services

All three run on your local machine. The Docker web UI and Task Scheduler jobs start automatically after setup.

| Service | How to start | Port | Required? |
|---|---|---|---|
| **Web UI** (Docker) | `launch.bat` | 8508 | Yes — the chat interface |
| **Email sync** (native) | `run_monitor.bat` or Task Scheduler | — | Yes — keeps inbox current |
| **Outlook bridge** (native) | `bridge.bat` | 8509 | Only needed for Save to Drafts |

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| Phase 1 | ✅ Done | Outlook COM ingestion for "agent request" emails |
| Phase 2 | ✅ Done | Full inbox ingestion, thread grouping, AgentSession with 6 tools |
| Phase 3 | ✅ Done | Docker web UI — chat interface on localhost:8508 |
| Phase 4 | ✅ Done | Draft reply — compose + save to Outlook Drafts via bridge |
| Phase 5 | Next | CRM writer — log Salesforce activity from email description |
| Phase 6 | Planned | Action item extraction — scheduled LLM pass → `action_items` table |
| Phase 7 | Planned | Sender analytics — response time, volume trends, relationship health |
| Phase 8 | Planned | Multi-user — shared PostgreSQL + Graph API (replaces Outlook COM) |
