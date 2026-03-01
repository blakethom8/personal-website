---
title: "200 Lines of Python That Save Me 90 Minutes a Day"
date: "2026-03-01"
tags: ["corporate-ai", "email-agent", "enterprise", "ai-agents"]
excerpt: "The entire agent is 200 lines. It has 4 tools. It talks to one API. Here's every design decision, every tradeoff, and a real trace of the agent loop in action."
readTime: "12 min"
featured: false
category: "rethinking-saas"
---

# 200 Lines of Python That Save Me 90 Minutes a Day

*This is the technical companion to "Why I Built an Email Agent That IT Actually Approved." That post told the story. This one shows the architecture.*

---

## The Architecture, In One Diagram

```
┌─────────────────────────────────────────────────────┐
│              Your Corporate Laptop (Windows)          │
│                                                       │
│  ┌──────────┐   COM/MAPI    ┌───────────────────┐   │
│  │ Microsoft │◄────────────►│   email-agent.py   │   │
│  │ Outlook   │  (local IPC) │                     │   │
│  │ (Desktop) │              │   4 tools:          │   │
│  └──────────┘              │   - read_emails     │   │
│                             │   - search_emails   │   │
│                             │   - create_draft    │   │
│                             │   - write_report    │   │
│                             └─────────┬───────────┘   │
│                                       │               │
│                             HTTPS (encrypted)         │
└───────────────────────────────────────┼───────────────┘
                                        │
                              ┌─────────▼─────────┐
                              │  Anthropic API     │
                              │  (SOC 2 Type II)   │
                              └───────────────────┘

Output: ~/email-agent/reports/*.html
Logs:   ~/email-agent/logs/audit.jsonl
```

No servers. No databases. No containers. No web frameworks. A Python script that talks to Outlook locally and Claude remotely.

---

## The Four Tools

Each tool was designed around one question: what's the minimum capability the agent needs, and what's the maximum damage it could do?

### `read_emails`

Reads recent emails from Outlook via Windows COM — the same local interface that Outlook's own VBA macros use.

```python
import win32com.client

outlook = win32com.client.Dispatch("Outlook.Application")
inbox = outlook.GetNamespace("MAPI").GetDefaultFolder(6)
```

The tool returns subject, sender, timestamp, and a **500-character preview** — not the full body. This is deliberate. Sending 200 full emails to the LLM would burn tokens and send more data to the API than necessary. The agent triages on previews, then deep-reads only the emails that matter.

**What it can't do**: Access other users' mailboxes. COM authenticates as the current Windows user — it can only see mailboxes that user's Outlook profile has access to.

### `search_emails`

The "deep read" tool. Searches by date, sender, or keyword. Can also retrieve a specific email's full body by its Outlook Entry ID.

The workflow: `read_emails` returns 30 previews. The agent identifies 4 that need attention. `search_emails` retrieves those 4 in full. The other 26 never leave the machine as full text.

### `create_draft`

Creates a draft email in Outlook's Drafts folder. **The user must open it and click Send.**

This is the single most important design decision in the entire agent. The agent can *compose*, but it cannot *send*. The human is always the last step before an email leaves the organization.

Why not let it send? Three reasons:
1. **Hallucination risk.** The agent might get a detail wrong. A human catches that in 5 seconds during review.
2. **Compliance.** Many organizations have policies about automated email sending. Draft-only bypasses that entirely.
3. **Trust building.** IT teams are much more comfortable approving an agent that writes drafts than one that sends email.

### `write_report`

Writes an HTML file to `~/email-agent/reports/`. The sandbox enforcement is three lines of code:

```python
def write_report(filename: str, content: str) -> str:
    safe_name = os.path.basename(filename)  # Strip directory components
    output_dir = os.path.expanduser("~/email-agent/reports")
    filepath = os.path.join(output_dir, safe_name)
    os.makedirs(output_dir, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    return f"Report saved to {filepath}"
```

`os.path.basename()` is the security boundary. If the agent tries to write to `../../.ssh/authorized_keys`, `basename` strips it to `authorized_keys`, and the file lands in the reports folder. The agent can only write to its sandbox. Period.

---

## The Agent Loop

The heart of the entire system is a while loop:

```
User prompt
    │
    ▼
Send to Claude API:
  - System prompt (~200 tokens)
  - Tool definitions (4 tools)
  - User message
  - Conversation history
    │
    ▼
Claude responds with:
  - Text (reasoning) and/or
  - Tool calls (if needed)
    │
    ├── Tool calls present?
    │       │
    │   Yes │  No
    │       │    └── Display final response to user. Done.
    │       │
    │       ▼
    │   Execute each tool locally.
    │   Log to audit.jsonl.
    │   Feed results back to Claude.
    │       │
    │       └── (loop continues)
```

In Python, that's roughly:

```python
while True:
    response = client.messages.create(
        model="claude-sonnet-4-5-20250514",
        system=SYSTEM_PROMPT,
        tools=TOOL_DEFINITIONS,
        messages=conversation
    )

    # Process response content
    for block in response.content:
        if block.type == "text":
            print(block.text)
        elif block.type == "tool_use":
            result = execute_tool(block.name, block.input)
            log_to_audit(block.name, block.input, result)
            conversation.append(tool_result(block.id, result))

    if response.stop_reason != "tool_use":
        break  # Agent is done
```

The loop runs entirely on your machine. The only network call is to `api.anthropic.com`. Email data is read locally. Reports are written locally. The agent never opens a connection to anything except the Anthropic API.

---

## A Real Trace: Morning Briefing

Here's what actually happens when the agent generates a daily briefing at 7 AM:

**Turn 1** — The agent reads the inbox:
```
→ Tool: read_emails({ days_back: 1, max_count: 50 })
← 28 emails. Subjects, senders, timestamps, 500-char previews.
```

**Turn 2** — The agent identifies important emails and reads them:
```
→ Tool: search_emails({ email_id: "AAMk..." })  // Sarah's Q1 email
← Full body: "Hi team, please review slides 12-18..."

→ Tool: search_emails({ email_id: "AAMk..." })  // Dave's client email
← Full body: "The team loved the demo. When can we schedule..."

→ Tool: search_emails({ email_id: "AAMk..." })  // IT security audit
← Full body: "Annual security questionnaire attached, due EOD..."
```

**Turn 3** — No tool call. The agent synthesizes everything and generates an HTML report.

**Turn 4** — The agent saves the report:
```
→ Tool: write_report({
    filename: "morning-briefing-2026-03-01.html",
    content: "<html>..."
  })
← Report saved to ~/email-agent/reports/morning-briefing-2026-03-01.html
```

**Total: 5 tool calls. ~15,000 input tokens. ~3,000 output tokens. Cost: ~$0.06.**

The report is waiting in the reports folder when I sit down at 7:30. I scan it in 3 minutes. The 30-minute inbox triage is now 3 minutes of focused review.

---

## The System Prompt

The entire agent personality fits in ~200 tokens:

```
You are an email assistant for a corporate professional. You help
manage, summarize, and respond to email.

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

You do NOT have access to:
- The filesystem (beyond your reports folder)
- The internet (beyond this conversation)
- Other applications on the user's machine
```

Compare this to a typical agent framework's system prompt — thousands of tokens documenting dozens of tools. Every token spent on tool documentation is a token NOT available for email content. Our prompt is small enough that the agent can hold the full body of 5-10 emails in a single context window.

---

## What I Didn't Build (and Why)

Every feature I left out is a security decision:

| Not Included | Why |
|---|---|
| **Shell access** | A bash shell can do anything. That's the power — and the problem. IT will never approve it. |
| **Web browsing** | Adds an entire attack surface. The agent doesn't need the internet to read your email. |
| **File system access** | Beyond the reports sandbox, the agent can't read or write files on your machine. |
| **Email sending** | Drafts only. Human reviews. Human clicks Send. |
| **Attachment handling** | The agent notes when attachments exist but doesn't download or process them. |
| **Calendar access** | That's Tier 2. You earn it by proving Tier 1 is clean. |
| **Database** | No persistence beyond HTML files. Stateless by design. |

Each "not" is something I could have built. Each would have made the agent more useful. And each would have made the IT conversation harder. The point of Tier 1 is to be **so obviously safe** that the approval meeting is boring.

---

## The Cost

Real numbers from a month of daily use:

| Metric | Value |
|--------|-------|
| Emails processed per day | ~30-50 |
| Full emails read per day | ~5-8 |
| Reports generated per day | 1-2 |
| Drafts created per day | 2-4 |
| Input tokens per day | ~15,000 |
| Output tokens per day | ~4,000 |
| **Daily cost (Sonnet)** | **~$0.08** |
| **Monthly cost** | **~$2.50** |

Microsoft Copilot: $30/user/month. This agent: $2.50/user/month. A **12x cost difference** for a tool that's more focused, more private, and runs entirely on your machine.

Could I use a cheaper model? Yes. Haiku would cost about $0.02/day. But Sonnet's analysis quality is noticeably better for nuanced email triage — it catches the ask buried in paragraph three that Haiku sometimes misses. At $2.50/month, Sonnet is the obvious choice.

---

## The Dependencies

```
Python 3.10+    (pre-installed or IT-approved on most corporate machines)
pywin32         (Outlook COM access — the same library that powers VBA macros)
anthropic       (Claude API client — pure Python, no native extensions)
```

Three dependencies. No web framework. No database driver. No Docker. No Node.js. No build tools.

Compare to a typical enterprise AI deployment: Kubernetes, Redis, PostgreSQL, a message queue, three microservices, and a CI/CD pipeline. We have a script.

---

## The Audit Trail

Every tool call is logged to `~/email-agent/logs/audit.jsonl`:

```json
{"timestamp": "2026-03-01T07:00:12Z", "tool": "read_emails", "input": {"days_back": 1, "max_count": 50}, "result_summary": "28 emails returned"}
{"timestamp": "2026-03-01T07:00:14Z", "tool": "search_emails", "input": {"email_id": "AAMk..."}, "result_summary": "Full body: Q1 Planning from Sarah"}
{"timestamp": "2026-03-01T07:00:15Z", "tool": "search_emails", "input": {"email_id": "AAMk..."}, "result_summary": "Full body: Prototype feedback from Dave"}
{"timestamp": "2026-03-01T07:00:18Z", "tool": "write_report", "input": {"filename": "morning-briefing-2026-03-01.html"}, "result_summary": "Report saved"}
```

IT can review exactly what the agent did, when, and what data it accessed. There's no "trust us" — there's a log file that proves it.

---

## How to Run It

Three modes:

**CLI** — Run a single command:
```bash
python email-agent.py "Summarize my emails from today"
```

**Interactive** — Conversational session:
```bash
python email-agent.py --interactive

> What action items do I have from this week?
> Draft a reply to Dave about scheduling the follow-up call
> exit
```

**Scheduled** — Windows Task Scheduler runs at 7 AM:
```bash
python email-agent.py "Generate my daily morning briefing"
```

The scheduled mode is where the real value is. You don't think about the agent. You don't open a terminal. You just arrive at your desk and the briefing is waiting.

---

## The Lesson

Building an AI tool for enterprise isn't about capability. It's about **auditability**. The architecture is boring on purpose. Python script. Four tools. One API. Sandboxed output. Logged everything.

My IT team approved it because they could understand it. Not in theory — they read the actual code, the actual 200 lines, and understood what every line does. That's not possible with a 434,000-line agent framework. It's not possible with a cloud platform that processes your email on someone else's servers.

The hardest part of building AI for enterprise isn't making it powerful enough. It's making it **small enough that security can say yes**.
