# Technical Architecture: The Minimal Corporate Email Agent

## Design Principles

1. **Minimal surface area** — Only the tools the agent actually needs
2. **Local-first** — Email never leaves the machine; only summaries go to the LLM
3. **Auditable** — Every action logged, every report timestamped
4. **No dependencies on infrastructure** — No servers, no databases (initially), no containers
5. **Runnable by the user** — No admin privileges, no service installation

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     User's Corporate Laptop                   │
│                          (Windows)                            │
│                                                               │
│  ┌─────────────┐    COM/MAPI     ┌──────────────────────┐   │
│  │  Microsoft   │◄──────────────►│   Email Agent         │   │
│  │  Outlook     │   (local IPC)  │   (Python script)     │   │
│  │  (Desktop)   │                │                        │   │
│  └─────────────┘                │   ┌──────────────────┐ │   │
│                                  │   │ Tool: read_emails│ │   │
│                                  │   │ Tool: search     │ │   │
│                                  │   │ Tool: draft      │ │   │
│                                  │   │ Tool: write_file │ │   │
│                                  │   └────────┬─────────┘ │   │
│                                  │            │            │   │
│                                  │   ┌────────▼─────────┐ │   │
│                                  │   │ Agent Loop        │ │   │
│                                  │   │ (while tool_use)  │ │   │
│                                  │   └────────┬─────────┘ │   │
│                                  └────────────┼────────────┘   │
│                                               │                │
│                                    HTTPS      │                │
│                                  (encrypted)  │                │
└──────────────────────────────────────────────┼────────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │  Anthropic API       │
                                    │  api.anthropic.com   │
                                    │                      │
                                    │  - SOC 2 Type II     │
                                    │  - No training on    │
                                    │    API data          │
                                    │  - 30-day retention  │
                                    │    (configurable)    │
                                    └─────────────────────┘

Output:
    ~/email-agent/
    ├── reports/           ← HTML reports (email summaries, action items)
    ├── drafts/            ← Saved draft text (for review before sending)
    ├── logs/
    │   ├── audit.jsonl    ← Every tool call and LLM interaction
    │   └── errors.log     ← Error tracking
    └── config.json        ← User preferences (report style, schedule)
```

---

## The Four Tools

### Tool 1: `read_emails`

Reads recent emails from Outlook inbox via COM.

```
Input:  { days_back: int, max_count: int }
Output: JSON array of email objects
```

Each email object contains:
- `id` — Outlook EntryID (for referencing later)
- `subject` — Email subject line
- `sender_name` — Display name of sender
- `sender_email` — Email address
- `received_time` — ISO timestamp
- `body_preview` — First 500 characters of body (not full body by default)
- `has_attachments` — Boolean
- `importance` — Low/Normal/High
- `is_read` — Boolean

**Why body_preview instead of full body**: Reduces token usage. The agent sees enough to categorize and summarize. If it needs the full body for a specific email, it can request it via `search_emails` with the specific ID.

**Security note**: This tool reads from the user's own Outlook profile. It cannot access other users' mailboxes or shared mailboxes (unless explicitly configured to do so with IT approval).

### Tool 2: `search_emails`

Filters and retrieves specific emails, including full body when needed.

```
Input:  {
  query: string,        // Subject/sender keyword search
  sender: string,       // Filter by sender email
  days_back: int,       // How far back to search
  folder: string,       // "Inbox", "Sent Items", etc.
  email_id: string,     // Retrieve specific email by ID (full body)
  max_count: int
}
Output: JSON array of email objects (with full body if single ID requested)
```

This is the "deep read" tool. When the agent identifies an email worth reading fully (from `read_emails` preview), it uses `search_emails` with the specific `email_id` to get the complete body.

### Tool 3: `create_draft`

Creates a draft email in Outlook's Drafts folder.

```
Input:  {
  to: string,           // Recipient email address
  subject: string,      // Email subject
  body: string,         // Email body (plain text or HTML)
  reply_to_id: string   // Optional: creates a reply draft to this email
}
Output: "Draft created: [subject] to [recipient]"
```

**Critical design decision**: The agent creates DRAFTS, not sent emails. The user must open Outlook, review the draft, and click Send themselves. This eliminates:
- Impersonation risk
- Hallucinated content being sent without review
- Compliance issues around automated email sending

### Tool 4: `write_report`

Writes an HTML or Markdown file to the sandboxed output directory.

```
Input:  {
  filename: string,     // e.g., "daily-summary-2026-03-01.html"
  content: string       // HTML or Markdown content
}
Output: "Report saved to ~/email-agent/reports/[filename]"
```

**Sandbox enforcement**: The tool validates that the filename doesn't contain path traversal (`../`) and writes ONLY to `~/email-agent/reports/`. This is enforced in code:

```python
def write_report(filename: str, content: str) -> str:
    # Normalize and validate path
    safe_name = os.path.basename(filename)  # Strip any directory components
    output_dir = os.path.expanduser("~/email-agent/reports")
    filepath = os.path.join(output_dir, safe_name)

    os.makedirs(output_dir, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return f"Report saved to {filepath}"
```

---

## The Agent Loop

The entire agent is a single Python script with a simple loop:

```
User prompt (e.g., "Summarize my emails from today")
    │
    ▼
┌──────────────────────────────────┐
│ Send to Claude API:              │
│   - System prompt (agent role)   │
│   - Tool definitions (4 tools)   │
│   - User message                 │
│   - Conversation history         │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Claude responds with:            │
│   - Text (reasoning/response)    │
│   - Tool calls (if needed)       │
└──────────┬───────────────────────┘
           │
     ┌─────┴─────┐
     │ Tool calls │
     │ present?   │
     └─────┬─────┘
      Yes  │  No
     ┌─────┘  └──────────────┐
     ▼                       ▼
┌──────────────┐    ┌───────────────┐
│ Execute each │    │ Display final │
│ tool locally │    │ text response │
│ Log to audit │    │ to user       │
└──────┬───────┘    └───────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Feed tool results back to Claude │
│ (loop continues)                 │
└──────────────────────────────────┘
```

**Key property**: The loop runs entirely on the user's machine. The only network call is to `api.anthropic.com`. Email data is read locally via COM. Reports are written locally. The agent never opens a socket to anything except the Anthropic API.

---

## System Prompt

The agent's system prompt is minimal and purpose-built:

```
You are an email assistant for a corporate professional. You help manage,
summarize, and respond to email.

You have four tools:
- read_emails: Read recent emails from the user's Outlook inbox
- search_emails: Search for specific emails or read full email bodies
- create_draft: Create a draft email reply (the user will review and send)
- write_report: Save an HTML report to the user's reports folder

Guidelines:
- Always read emails before summarizing (don't guess at content)
- When creating drafts, match the user's professional tone
- Create drafts, never claim to have "sent" an email
- Generate clear, well-structured HTML reports with inline CSS
- Categorize emails: Action Required, FYI, Newsletters, Low Priority
- Extract specific action items with deadlines when present
- If an email seems sensitive or confidential, note it but don't summarize
  the sensitive content in detail

You do NOT have access to:
- The filesystem (beyond your reports folder)
- The internet (beyond this conversation)
- Other applications on the user's machine
- Other people's email accounts
```

This prompt is ~200 tokens. Compare to OpenClaw's full context assembly (thousands of tokens) or Claude Code's system prompt. Minimal prompt = more context window available for actual email content.

---

## Data Flow: What Goes Where

```
┌─ LOCAL ONLY (never leaves the machine) ─────────────────────┐
│                                                              │
│  Outlook mailbox → COM → Python reads email objects          │
│  Python writes → ~/email-agent/reports/*.html                │
│  Python writes → ~/email-agent/logs/audit.jsonl              │
│  Python writes → ~/email-agent/drafts/*.txt                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ SENT TO ANTHROPIC API (encrypted HTTPS) ───────────────────┐
│                                                              │
│  System prompt (static, ~200 tokens)                         │
│  User message ("summarize my emails from today")             │
│  Email content (subjects, senders, body text)                │
│  Tool results (email data returned from read/search)         │
│                                                              │
│  NOT sent: attachments, binary files, system info,           │
│            credentials, file contents outside sandbox        │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ RETURNED FROM ANTHROPIC API ────────────────────────────────┐
│                                                              │
│  Claude's analysis, summaries, categorizations               │
│  Tool call requests (Claude asks to call a tool)             │
│  Draft email text (for create_draft tool)                    │
│  HTML report content (for write_report tool)                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Dependencies (Minimal)

```
Python 3.10+          (typically pre-installed or IT-approved)
pywin32               (Outlook COM access)
anthropic             (Claude API client)
```

That's it. Three dependencies. No web framework, no database, no Docker, no Node.js, no build tools.

Optional additions for Tier 2+:
```
sqlite3               (built into Python — task tracking database)
jinja2                (report templating, if needed)
```

---

## How It Runs

### Option A: CLI Script (Simplest)

```bash
# User opens terminal and types:
python email-agent.py "Summarize my emails from today"

# Agent runs, produces report, prints summary
# Report saved to ~/email-agent/reports/daily-2026-03-01.html
```

### Option B: Interactive Session

```bash
python email-agent.py --interactive

> Summarize my emails from today
[Agent reads emails, generates report]
Your daily email summary is ready at ~/email-agent/reports/daily-2026-03-01.html

> Draft a reply to the email from Dave about the Q1 review
[Agent searches for Dave's email, creates a draft]
Draft created in Outlook. Please review before sending.

> What action items do I have from this week?
[Agent searches recent emails, extracts action items]
...

> exit
```

### Option C: Scheduled Task (Daily Briefing)

Windows Task Scheduler runs the agent at 7 AM:
```bash
python email-agent.py "Generate my daily morning briefing"
```

Report is waiting in `~/email-agent/reports/` when the user arrives.

---

## Token Usage and Cost

### Typical Daily Usage

| Operation | Input Tokens | Output Tokens | Cost (Sonnet) |
|-----------|-------------|--------------|---------------|
| Read 30 emails (previews) | ~6,000 | ~100 | $0.02 |
| Read 5 full emails | ~5,000 | ~100 | $0.02 |
| Generate daily summary | ~1,000 | ~2,000 | $0.02 |
| Draft 3 replies | ~3,000 | ~1,500 | $0.02 |
| **Daily total** | **~15,000** | **~3,700** | **~$0.08** |

**Monthly cost**: ~$2-3 for a typical user. This is 10x cheaper than Microsoft Copilot ($30/month) and runs locally.

### Model Choice

| Model | Speed | Quality | Cost/Day | Recommendation |
|-------|-------|---------|----------|----------------|
| Claude Haiku | Fast | Good for simple summaries | ~$0.02 | Budget option |
| Claude Sonnet | Medium | Excellent for analysis | ~$0.08 | **Default** |
| Claude Opus | Slower | Best for nuanced drafts | ~$0.40 | Premium option |

Sonnet is the sweet spot: fast enough for interactive use, smart enough for nuanced email analysis, cheap enough that cost is negligible.

---

## What This Architecture Explicitly Prevents

| Threat | How It's Prevented |
|--------|-------------------|
| Email data exfiltration | No network access except Anthropic API |
| Unauthorized email sending | Draft-only (user must click Send) |
| File system damage | Sandbox — can only write to ~/email-agent/ |
| Arbitrary code execution | No shell access, no eval, no exec |
| Credential exposure | No credential handling in the agent |
| Privilege escalation | Runs as normal user, no admin rights |
| Other app access | No COM access except Outlook |
| Lateral movement | No SSH, no network tools |

---

## Key Takeaway

This architecture is **aggressively minimal by design**. The entire agent could be reviewed by an IT security team in under an hour. The attack surface is: one Python script, one local COM interface, one HTTPS connection. Every action is logged. Every output is sandboxed.

The power comes not from the architecture's complexity but from Claude's capability. A 200-line Python script with 4 tools, backed by a frontier LLM, can genuinely save a knowledge worker 30-60 minutes per day. That's the pitch: **massive value from minimal risk**.
