# The Capability vs. Security Tradeoff: Finding the Sweet Spot

## The Central Tension

Every AI agent exists on a spectrum:

```
Zero Risk                                                   Maximum Power
(can do nothing)                                           (can do anything)
    │                                                              │
    ▼                                                              ▼
┌────────┬────────────┬──────────────┬───────────────┬────────────┐
│ No     │ Read-only  │ Read + Write │ Read + Write  │ Full shell │
│ tools  │ email      │ sandboxed    │ + web search  │ access     │
│        │            │ files        │ + file browse │ (OpenClaw) │
└────────┴────────────┴──────────────┴───────────────┴────────────┘
                                │
                                │ ← THE SWEET SPOT
                                │    for corporate deployment
```

OpenClaw lives at the far right: Bash access, full filesystem, install anything, connect anywhere. That's what makes it incredible for personal use and terrifying for corporate IT.

The corporate email agent needs to live in the middle: **enough capability to be genuinely useful, constrained enough that IT can approve it in a single meeting**.

---

## The Three Axes

### Axis 1: File Access

| Level | What the agent can do | Risk | IT Concern |
|-------|----------------------|------|------------|
| **None** | No file system access | Zero | "What does it actually do then?" |
| **Write-only sandbox** | Write reports to `~/agent-output/` | Very low | "Can it escape the sandbox?" |
| **Read sandbox** | Read files from `~/agent-output/` only | Low | "It can see its own past reports" |
| **Read project folder** | Read files in a designated project directory | Medium | "What if sensitive docs are in there?" |
| **Read anywhere** | Read any file the user has access to | High | "This is basically spyware" |
| **Write anywhere** | Modify any file | Very high | "This could destroy work" |

**Recommendation for corporate**: Write-only sandbox + read own output. The agent generates reports into `~/email-agent/reports/`. It can read its own previous reports for continuity. It cannot read arbitrary files on the machine.

### Axis 2: Network Access

| Level | What the agent can do | Risk | IT Concern |
|-------|----------------------|------|------------|
| **LLM API only** | Calls Claude API, nothing else | Very low | "Email content goes to Anthropic" |
| **+ Web search** | Can search the web for context | Low-Medium | "What data is in the search queries?" |
| **+ Arbitrary HTTP** | Can call any URL (curl-like) | High | "Data exfiltration risk" |
| **+ SSH/tunneling** | Can connect to remote machines | Very high | "Lateral movement risk" |

**Recommendation for corporate**: LLM API only. Web search is a nice-to-have but dramatically increases the attack surface and the IT conversation.

### Axis 3: Email Access

| Level | What the agent can do | Risk | IT Concern |
|-------|----------------------|------|------------|
| **Read inbox** | See email subjects, senders, bodies | Medium | "It sees our confidential email" |
| **Read + search** | Filter by date, sender, subject | Medium | Same as above, more targeted |
| **Read + draft** | Create draft emails (user sends manually) | Medium | "What if drafts contain hallucinated content?" |
| **Read + send** | Send email on behalf of user | High | "Impersonation risk, compliance nightmare" |
| **Read + delete** | Delete or move emails | Very high | "Data loss, retention policy violations" |

**Recommendation for corporate**: Read + search + draft. The agent can read emails and create drafts, but the user always clicks "Send" themselves. No deletion, no automatic sending.

---

## The Sweet Spot: What We're Building

```
┌─────────────────────────────────────────────────────────┐
│              CORPORATE EMAIL AGENT v1                     │
│                                                          │
│  Email Access:                                           │
│    ✓ Read inbox (via Outlook COM, local only)            │
│    ✓ Search/filter by date, sender, subject              │
│    ✓ Create drafts (user reviews and sends)              │
│    ✗ Send email automatically                            │
│    ✗ Delete or move emails                               │
│    ✗ Access other people's mailboxes                     │
│                                                          │
│  File Access:                                            │
│    ✓ Write reports to ~/email-agent/reports/             │
│    ✓ Read own previous reports                           │
│    ✓ Write logs to ~/email-agent/logs/                   │
│    ✗ Read arbitrary files on the machine                 │
│    ✗ Write outside the sandbox directory                 │
│    ✗ Execute files or scripts                            │
│                                                          │
│  Network Access:                                         │
│    ✓ Anthropic API (api.anthropic.com)                   │
│    ✗ Web browsing/searching                              │
│    ✗ Arbitrary HTTP requests                             │
│    ✗ SSH or tunnel connections                           │
│                                                          │
│  System Access:                                          │
│    ✗ No shell/bash                                       │
│    ✗ No package installation                             │
│    ✗ No system settings modification                     │
│    ✗ No access to other applications                     │
│                                                          │
│  Audit:                                                  │
│    ✓ Every tool call logged to audit.jsonl               │
│    ✓ Every LLM call logged (prompt hash, not content)    │
│    ✓ Reports timestamped and immutable                   │
└─────────────────────────────────────────────────────────┘
```

---

## Comparison: Corporate Email Agent vs. OpenClaw vs. NanoClaw

| Dimension | Corporate Email Agent | NanoClaw | OpenClaw |
|-----------|----------------------|----------|----------|
| Lines of code | ~200 | ~3,900 | ~434,000 |
| Tools | 3-4 (email-specific) | SDK-provided + IPC | 4 (Read/Write/Edit/Bash) |
| File access | Sandbox only | Container-mounted dirs | Full filesystem |
| Network | LLM API only | Container-limited | Unrestricted |
| Shell access | None | Container-isolated | Full Bash |
| Email access | Outlook COM (local) | Via host IPC | Via bash (curl/CLI) |
| Setup time | 15 minutes | 1-2 hours | 2-4 hours |
| IT approval | Easy (minimal scope) | Moderate (containers) | Difficult (full access) |
| Target user | Corporate knowledge worker | Personal + multi-user | Personal power user |
| Can install software | No | Within container | Yes |
| Audit trail | Built-in, comprehensive | Container logs | Opt-in via hooks |

---

## The Capability Expansion Path

The corporate email agent is designed to be **expandable**. Start minimal, prove value, then add capabilities with IT approval at each step:

```
Tier 1: Email Reader (Day 1)
    ├── Read emails
    ├── Summarize inbox
    ├── Generate HTML reports
    └── Create email drafts
         │
         │ (IT approves after 30 days of clean audit logs)
         ▼
Tier 2: Project Tracker (Month 2)
    ├── Everything in Tier 1
    ├── Read files in a designated project folder
    ├── Track action items across emails
    ├── Generate project status reports
    └── Maintain a simple SQLite task database
         │
         │ (IT approves after demonstrating value + clean logs)
         ▼
Tier 3: Research Assistant (Month 3+)
    ├── Everything in Tier 2
    ├── Web search (via controlled API, not raw browsing)
    ├── Generate research summaries
    ├── Cross-reference email topics with web sources
    └── Create presentation-ready reports
         │
         │ (This is where most corporate deployments would stop)
         ▼
Tier 4: Workspace Assistant (Month 6+)
    ├── Everything in Tier 3
    ├── Read/write across designated project folders
    ├── Calendar integration (read-only)
    ├── Generate lightweight HTML applications
    └── Approaching OpenClaw-level capability (with guardrails)
```

Each tier is a separate conversation with IT. Each tier has a clean boundary. Each tier builds on proven trust from the previous one.

---

## What Data Goes to the LLM?

This is the #1 question IT will ask. The answer matters:

### What DOES go to Anthropic's API:
- Email subjects and sender names (for categorization)
- Email body text (for summarization)
- Your prompts ("summarize my emails from today")
- Tool call results (email content passed back to Claude)

### What does NOT go to Anthropic's API:
- Attachments (binary files are not sent)
- Email headers/routing information
- Other users' mailboxes
- Files from outside the sandbox
- System information, credentials, tokens

### The Anthropic Data Policy:
- API calls are NOT used for model training (per Anthropic's data usage policy)
- Data is retained for 30 days for abuse monitoring, then deleted
- Enterprise customers can negotiate zero-retention agreements
- SOC 2 Type II certified

### Mitigation Options for Sensitive Environments:
1. **Summarize locally first**: Pre-process emails to extract only non-sensitive metadata, send summaries instead of full bodies
2. **Redact before sending**: Strip names, account numbers, identifiers before LLM call
3. **Use Claude on-premise** (when available): Anthropic is working on private deployments
4. **Use the client's own API key**: Client controls the billing and data relationship directly

**Option 4 is what we'll recommend**: The client gets their own Anthropic API key, pays Anthropic directly, and has a direct contractual relationship for data handling. We don't touch their data at all.

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Email access method | Outlook COM (win32com) | Zero IT approval needed, entirely local, no cloud APIs |
| LLM provider | Claude (Anthropic) | Best tool-use capabilities, SOC 2, no training on API data |
| File access | Sandboxed write-only + read own output | Minimal surface area, still useful for reports |
| Network access | LLM API only | Eliminates data exfiltration risk |
| Email sending | Draft only (user sends) | Eliminates impersonation risk |
| Audit logging | Mandatory, built-in | Required for IT approval and compliance |
| Expansion model | Tiered, IT-approved at each level | Builds trust incrementally |

---

## Key Takeaway

The optimal spot on the capability/security spectrum for corporate deployment is:

**Read emails locally → Summarize via Claude API → Write reports to a sandbox → Log everything**

This is enough capability to save a knowledge worker 30-60 minutes per day (real value), while being constrained enough that IT can approve it based on a 2-page security review. It's not OpenClaw — it's not trying to be. It's the version of an AI agent that actually gets deployed in enterprise, because it respects the constraints that enterprise demands.
