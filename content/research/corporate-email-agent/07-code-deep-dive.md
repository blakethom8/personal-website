# Code Deep Dive: Building the Corporate Email Agent

## How to Read This Document

This document walks through the **complete project structure** of the corporate email agent — every directory, every file, what it does, and why it's there. Where relevant, we show the actual Python code using the real Anthropic SDK patterns.

The goal: after reading this, you should understand exactly what "200 lines of Python" looks like and how the ReAct (Reason + Act) loop works at the code level.

---

## Directory Structure

```
email-agent/
├── email_agent.py          ← THE ENTIRE AGENT (main script, ~200 lines)
├── tools.py                ← Tool definitions (4 functions + schemas)
├── config.py               ← Configuration and constants
├── requirements.txt        ← 3 dependencies
├── .env.example            ← Template for API key setup
│
├── reports/                ← Agent's sandboxed output folder
│   ├── morning-briefing-2026-03-01.html
│   ├── morning-briefing-2026-02-28.html
│   └── weekly-summary-2026-02-24.html
│
├── drafts/                 ← Saved draft text (for audit trail)
│   ├── reply-dave-2026-03-01.txt
│   └── reply-sarah-2026-02-28.txt
│
└── logs/
    ├── audit.jsonl         ← Every tool call, timestamped
    └── errors.log          ← Error tracking
```

**That's it.** No `src/` folder. No `tests/` directory (yet). No `docker-compose.yml`. No `package.json`. Three Python files and three output folders.

Let's walk through each file.

---

## File 1: `requirements.txt`

```
anthropic>=0.40.0
pywin32>=306
python-dotenv>=1.0.0
```

Three dependencies:
- **`anthropic`** — The official Anthropic Python SDK. Handles API calls, streaming, tool use message formatting.
- **`pywin32`** — Windows COM interface. This is what lets Python talk to Outlook through the same local IPC that VBA macros use.
- **`python-dotenv`** — Loads the API key from a `.env` file so it never gets hardcoded.

Install: `pip install -r requirements.txt`

---

## File 2: `.env.example`

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

The user copies this to `.env` and pastes their API key. The `.env` file is gitignored. The API key never touches source control.

---

## File 3: `config.py` — Constants and Settings

This is the simplest file. It defines the agent's identity and boundaries.

```python
"""Configuration for the corporate email agent."""

import os
from dotenv import load_dotenv

load_dotenv()

# --- API Configuration ---
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = "claude-sonnet-4-5"  # Sonnet: best balance of speed/quality/cost
MAX_TOKENS = 4096

# --- Agent Identity ---
SYSTEM_PROMPT = """You are an email assistant for a corporate professional.
You help manage, summarize, and respond to email.

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
- If an email seems sensitive or confidential, note it but don't
  summarize the sensitive content in detail

You do NOT have access to:
- The filesystem (beyond your reports folder)
- The internet (beyond this conversation)
- Other applications on the user's machine
- Other people's email accounts"""

# --- Sandbox Boundaries ---
REPORTS_DIR = os.path.expanduser("~/email-agent/reports")
DRAFTS_DIR = os.path.expanduser("~/email-agent/drafts")
LOGS_DIR = os.path.expanduser("~/email-agent/logs")

# --- Defaults ---
DEFAULT_DAYS_BACK = 1
DEFAULT_MAX_EMAILS = 50
BODY_PREVIEW_LENGTH = 500
```

### Why this matters

The `SYSTEM_PROMPT` is ~200 tokens. Compare that to OpenClaw, which assembles thousands of tokens of context from SOUL.md, USER.md, WORK.md, skills, and memory files. Our prompt is deliberately tiny because every token spent on instructions is a token NOT available for email content. With a 200K context window, we can hold dozens of full email bodies alongside this prompt.

The `MODEL` is set to `claude-sonnet-4-5` — not Opus. For email triage, Sonnet's quality is more than sufficient, and at $3/$15 per million tokens (vs Opus at $5/$25), the cost savings matter for a product we're selling at scale. Haiku ($1/$5) would be even cheaper but misses nuance in complex emails.

---

## File 4: `tools.py` — The Four Tool Definitions

This is where the ReAct pattern starts. Each tool is:
1. A **JSON schema** that tells Claude what parameters the tool accepts
2. A **Python function** that actually executes the tool

### The Tool Schemas (What Claude Sees)

The Anthropic API uses JSON Schema to define tools. Claude reads these schemas to understand what tools are available and what arguments they accept. This is the "vocabulary" the agent reasons over.

```python
"""Tool definitions for the corporate email agent.

Each tool has two parts:
1. TOOL_SCHEMA — JSON Schema that Claude reads to understand the tool
2. execute_* function — Python code that runs when Claude calls the tool
"""

import os
import json
import datetime
import win32com.client

from config import (
    REPORTS_DIR, DRAFTS_DIR, LOGS_DIR,
    DEFAULT_DAYS_BACK, DEFAULT_MAX_EMAILS, BODY_PREVIEW_LENGTH
)


# ============================================================
# TOOL SCHEMAS — These are sent to the Anthropic API.
# Claude reads these to decide which tool to call and with
# what arguments. The descriptions are critical — they're
# how Claude understands what each tool does.
# ============================================================

TOOLS = [
    {
        "name": "read_emails",
        "description": (
            "Read recent emails from the user's Outlook inbox. "
            "Returns email metadata and a short body preview (first 500 chars). "
            "Use this for initial triage. For full email bodies, use search_emails "
            "with a specific email_id."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "days_back": {
                    "type": "integer",
                    "description": "How many days back to read. Default: 1",
                    "default": 1
                },
                "max_count": {
                    "type": "integer",
                    "description": "Maximum emails to return. Default: 50",
                    "default": 50
                }
            },
            "required": []
        }
    },
    {
        "name": "search_emails",
        "description": (
            "Search for specific emails or retrieve a full email body by ID. "
            "Use email_id to get the complete body of a specific email identified "
            "during read_emails triage. Use query/sender to search across emails."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "email_id": {
                    "type": "string",
                    "description": "Outlook EntryID to retrieve full body for a specific email"
                },
                "query": {
                    "type": "string",
                    "description": "Search term for subject/body keyword match"
                },
                "sender": {
                    "type": "string",
                    "description": "Filter by sender email address"
                },
                "days_back": {
                    "type": "integer",
                    "description": "How many days back to search. Default: 7"
                },
                "max_count": {
                    "type": "integer",
                    "description": "Maximum results. Default: 10"
                }
            },
            "required": []
        }
    },
    {
        "name": "create_draft",
        "description": (
            "Create a draft email in Outlook's Drafts folder. "
            "The user will review and send it manually. "
            "IMPORTANT: This creates a DRAFT only — it does NOT send the email. "
            "Never tell the user you 'sent' an email."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "to": {
                    "type": "string",
                    "description": "Recipient email address"
                },
                "subject": {
                    "type": "string",
                    "description": "Email subject line"
                },
                "body": {
                    "type": "string",
                    "description": "Email body text (plain text or HTML)"
                },
                "reply_to_id": {
                    "type": "string",
                    "description": "Optional: Outlook EntryID to create as a reply to that email"
                }
            },
            "required": ["to", "subject", "body"]
        }
    },
    {
        "name": "write_report",
        "description": (
            "Save an HTML or Markdown report to the user's reports folder. "
            "Use this to create structured summaries, daily briefings, or "
            "action item lists. Reports are saved to ~/email-agent/reports/."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "filename": {
                    "type": "string",
                    "description": "Filename for the report (e.g., 'daily-summary-2026-03-01.html')"
                },
                "content": {
                    "type": "string",
                    "description": "The report content (HTML with inline CSS, or Markdown)"
                }
            },
            "required": ["filename", "content"]
        }
    }
]
```

### How Claude Reads These Schemas

When the agent loop sends a request to the API, it includes the `TOOLS` list. Claude sees something like:

> "I have 4 tools available. `read_emails` gets recent emails with a short preview. `search_emails` gets full bodies or searches. `create_draft` makes a draft but doesn't send. `write_report` saves an HTML file."

The **descriptions** are the most important part. Claude uses them to decide:
- *Which* tool to use ("I need the full body → `search_emails` with `email_id`")
- *When* to use it ("The user asked for a summary → start with `read_emails` for triage")
- *What NOT to do* ("It says DRAFT only → I should never say 'I sent the email'")

---

### The Tool Functions (What Actually Runs)

Now the Python code that executes when Claude calls each tool:

```python
# ============================================================
# TOOL IMPLEMENTATIONS — These run locally on the user's machine.
# They never call any external API. All Outlook access is via
# local COM (same interface as VBA macros).
# ============================================================

def _get_outlook():
    """Get a reference to the running Outlook application via COM."""
    return win32com.client.Dispatch("Outlook.Application")


def execute_read_emails(days_back: int = 1, max_count: int = 50) -> str:
    """Read recent emails from Outlook inbox via COM/MAPI."""
    outlook = _get_outlook()
    namespace = outlook.GetNamespace("MAPI")
    inbox = namespace.GetDefaultFolder(6)  # 6 = olFolderInbox

    # Calculate the date filter
    since = datetime.datetime.now() - datetime.timedelta(days=days_back)
    since_str = since.strftime("%m/%d/%Y %H:%M %p")

    # DASL filter for date range
    messages = inbox.Items
    messages.Sort("[ReceivedTime]", True)  # Newest first
    messages = messages.Restrict(f"[ReceivedTime] >= '{since_str}'")

    results = []
    for i, msg in enumerate(messages):
        if i >= max_count:
            break
        try:
            results.append({
                "id": msg.EntryID,
                "subject": msg.Subject,
                "sender_name": msg.SenderName,
                "sender_email": str(msg.SenderEmailAddress),
                "received_time": str(msg.ReceivedTime),
                "body_preview": msg.Body[:BODY_PREVIEW_LENGTH] if msg.Body else "",
                "has_attachments": msg.Attachments.Count > 0,
                "importance": ["Low", "Normal", "High"][msg.Importance],
                "is_read": msg.UnRead == False
            })
        except Exception:
            continue  # Skip malformed emails

    return json.dumps(results, indent=2)


def execute_search_emails(
    email_id: str = None,
    query: str = None,
    sender: str = None,
    days_back: int = 7,
    max_count: int = 10
) -> str:
    """Search emails or retrieve full body by EntryID."""
    outlook = _get_outlook()
    namespace = outlook.GetNamespace("MAPI")

    # If a specific email ID is provided, retrieve it directly
    if email_id:
        try:
            msg = namespace.GetItemFromID(email_id)
            return json.dumps({
                "id": msg.EntryID,
                "subject": msg.Subject,
                "sender_name": msg.SenderName,
                "sender_email": str(msg.SenderEmailAddress),
                "received_time": str(msg.ReceivedTime),
                "body": msg.Body,  # FULL body — not preview
                "has_attachments": msg.Attachments.Count > 0,
                "importance": ["Low", "Normal", "High"][msg.Importance]
            }, indent=2)
        except Exception as e:
            return json.dumps({"error": f"Could not retrieve email: {str(e)}"})

    # Otherwise, search by query/sender
    inbox = namespace.GetDefaultFolder(6)
    messages = inbox.Items
    messages.Sort("[ReceivedTime]", True)

    since = datetime.datetime.now() - datetime.timedelta(days=days_back)
    since_str = since.strftime("%m/%d/%Y %H:%M %p")
    messages = messages.Restrict(f"[ReceivedTime] >= '{since_str}'")

    results = []
    for msg in messages:
        if len(results) >= max_count:
            break
        try:
            match = True
            if query and query.lower() not in (msg.Subject + msg.Body).lower():
                match = False
            if sender and sender.lower() not in str(msg.SenderEmailAddress).lower():
                match = False
            if match:
                results.append({
                    "id": msg.EntryID,
                    "subject": msg.Subject,
                    "sender_name": msg.SenderName,
                    "received_time": str(msg.ReceivedTime),
                    "body_preview": msg.Body[:BODY_PREVIEW_LENGTH] if msg.Body else ""
                })
        except Exception:
            continue

    return json.dumps(results, indent=2)


def execute_create_draft(
    to: str,
    subject: str,
    body: str,
    reply_to_id: str = None
) -> str:
    """Create a draft email in Outlook's Drafts folder."""
    outlook = _get_outlook()

    if reply_to_id:
        # Create as a reply to an existing email
        namespace = outlook.GetNamespace("MAPI")
        try:
            original = namespace.GetItemFromID(reply_to_id)
            draft = original.Reply()
            draft.Body = body + "\n\n" + draft.Body  # Prepend to quoted reply
        except Exception as e:
            return json.dumps({"error": f"Could not create reply: {str(e)}"})
    else:
        # Create a new email
        draft = outlook.CreateItem(0)  # 0 = olMailItem
        draft.To = to
        draft.Subject = subject
        draft.Body = body

    draft.Save()  # Save to Drafts — does NOT send

    # Also save a copy to our audit trail
    audit_path = os.path.join(DRAFTS_DIR, f"draft-{datetime.datetime.now():%Y%m%d-%H%M%S}.txt")
    os.makedirs(DRAFTS_DIR, exist_ok=True)
    with open(audit_path, "w", encoding="utf-8") as f:
        f.write(f"To: {to}\nSubject: {subject}\n\n{body}")

    return f"Draft created: '{subject}' to {to}. Saved in Outlook Drafts folder."


def execute_write_report(filename: str, content: str) -> str:
    """Write a report to the sandboxed reports directory."""
    # SECURITY: Strip directory components to prevent path traversal
    safe_name = os.path.basename(filename)
    if not safe_name or safe_name in (".", ".."):
        return json.dumps({"error": "Invalid filename"})

    os.makedirs(REPORTS_DIR, exist_ok=True)
    filepath = os.path.join(REPORTS_DIR, safe_name)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return f"Report saved to {filepath}"


# ============================================================
# TOOL DISPATCHER — Maps tool names to their execute functions.
# The agent loop calls this with whatever Claude requested.
# ============================================================

TOOL_DISPATCH = {
    "read_emails": execute_read_emails,
    "search_emails": execute_search_emails,
    "create_draft": execute_create_draft,
    "write_report": execute_write_report,
}


def execute_tool(tool_name: str, tool_input: dict) -> str:
    """Execute a tool by name with the given input arguments.

    Returns the result as a string (JSON for data tools, plain text for actions).
    If the tool fails, returns a JSON error message.
    """
    func = TOOL_DISPATCH.get(tool_name)
    if not func:
        return json.dumps({"error": f"Unknown tool: {tool_name}"})

    try:
        return func(**tool_input)
    except Exception as e:
        return json.dumps({"error": f"Tool '{tool_name}' failed: {str(e)}"})
```

### Key Design Decisions in the Tools

1. **`read_emails` returns previews, not full bodies.** The 500-char preview is enough for Claude to triage. Full bodies come from `search_emails` — this saves tokens and sends less data to the API.

2. **`create_draft` calls `draft.Save()`, never `draft.Send()`.** This is the single most important security decision. The method literally doesn't exist in our code.

3. **`write_report` uses `os.path.basename()`.** If Claude somehow tries to write to `../../.ssh/authorized_keys`, basename strips it to `authorized_keys` and it lands safely in the reports folder.

4. **`execute_tool` catches all exceptions.** If Outlook crashes or COM throws an error, the tool returns a structured error message instead of crashing the agent. Claude sees the error and can decide what to do (retry, ask the user, skip that email).

---

## File 5: `email_agent.py` — The ReAct Loop

This is the heart of everything. The full agent in one file.

```python
"""
Corporate Email Agent — ReAct Loop Implementation

The ReAct (Reason + Act) pattern:
1. Claude REASONS about what to do (text response)
2. Claude ACTS by calling a tool (tool_use response)
3. We execute the tool and feed the result back
4. Claude REASONS about the result and decides next action
5. Repeat until Claude has no more tool calls (stop_reason = "end_turn")

This loop is the same pattern used by OpenClaw, Claude Code, and every
other agent framework. The difference is scope: we have 4 tools instead
of unlimited bash access.
"""

import os
import sys
import json
import datetime
import anthropic

from config import ANTHROPIC_API_KEY, MODEL, MAX_TOKENS, SYSTEM_PROMPT, LOGS_DIR
from tools import TOOLS, execute_tool


# ============================================================
# AUDIT LOGGING
# ============================================================

def log_to_audit(tool_name: str, tool_input: dict, result: str):
    """Append a tool call record to the audit log."""
    os.makedirs(LOGS_DIR, exist_ok=True)
    log_path = os.path.join(LOGS_DIR, "audit.jsonl")

    record = {
        "timestamp": datetime.datetime.now().isoformat(),
        "tool": tool_name,
        "input": tool_input,
        "result_length": len(result),
        "result_preview": result[:200]  # First 200 chars for quick review
    }

    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")


# ============================================================
# THE AGENT LOOP — This is the ReAct pattern
# ============================================================

def run_agent(user_message: str, verbose: bool = False) -> str:
    """
    Run the email agent with a single user message.

    This implements the ReAct loop:
      while Claude keeps calling tools:
          1. Send messages to Claude API (with tool definitions)
          2. Claude responds with text and/or tool_use blocks
          3. For each tool_use block:
             a. Execute the tool locally
             b. Log to audit trail
             c. Append the result to conversation
          4. If stop_reason != "tool_use", we're done

    Args:
        user_message: The user's request (e.g., "Summarize my emails from today")
        verbose: If True, print each tool call as it happens

    Returns:
        Claude's final text response
    """
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    # The conversation history — sent in full to the API each turn
    messages = [
        {"role": "user", "content": user_message}
    ]

    # --- The Loop ---
    while True:
        # 1. Call the Claude API
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages
        )

        # 2. Check if Claude is done (no more tool calls)
        if response.stop_reason == "end_turn":
            # Extract the final text response
            final_text = ""
            for block in response.content:
                if block.type == "text":
                    final_text += block.text
            return final_text

        # 3. Process tool calls
        #    Claude's response may contain BOTH text blocks and tool_use blocks.
        #    We need to:
        #    a. Append Claude's FULL response (including tool_use blocks) as
        #       an assistant message
        #    b. Execute each tool
        #    c. Append all tool results as a single user message

        # Append Claude's response (text + tool_use blocks together)
        messages.append({"role": "assistant", "content": response.content})

        # Find all tool_use blocks in the response
        tool_use_blocks = [b for b in response.content if b.type == "tool_use"]

        # Execute each tool and collect results
        tool_results = []
        for tool_block in tool_use_blocks:
            if verbose:
                print(f"  → Tool: {tool_block.name}({json.dumps(tool_block.input)[:80]}...)")

            # Execute the tool locally
            result = execute_tool(tool_block.name, tool_block.input)

            # Log to audit trail
            log_to_audit(tool_block.name, tool_block.input, result)

            if verbose:
                print(f"  ← Result: {result[:100]}...")

            # Build the tool_result message
            # CRITICAL: tool_use_id must match the tool_use block's id
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_block.id,
                "content": result
            })

        # Append all tool results as a single user message
        messages.append({"role": "user", "content": tool_results})

        # Loop continues — Claude will see the tool results and decide
        # whether to call more tools or give a final response


# ============================================================
# CLI INTERFACE
# ============================================================

def main():
    """Entry point: CLI or interactive mode."""

    if len(sys.argv) > 1:
        if sys.argv[1] == "--interactive":
            # Interactive mode
            print("Email Agent (type 'exit' to quit)")
            print("-" * 40)
            while True:
                try:
                    user_input = input("\n> ").strip()
                    if user_input.lower() in ("exit", "quit"):
                        break
                    if not user_input:
                        continue
                    response = run_agent(user_input, verbose=True)
                    print(f"\n{response}")
                except KeyboardInterrupt:
                    break
        else:
            # Single command mode
            user_message = " ".join(sys.argv[1:])
            response = run_agent(user_message, verbose=True)
            print(response)
    else:
        # Default: daily morning briefing
        response = run_agent(
            "Generate my daily morning briefing. Read today's emails, "
            "categorize them, identify action items, and save an HTML report.",
            verbose=True
        )
        print(response)


if __name__ == "__main__":
    main()
```

---

## The ReAct Loop, Annotated

Let's trace through exactly what happens when you run:

```bash
python email_agent.py "Summarize my emails from today"
```

### Turn 1: Claude Reasons → Acts

**What we send to the API:**

```json
{
  "model": "claude-sonnet-4-5",
  "max_tokens": 4096,
  "system": "You are an email assistant...",
  "tools": [
    {"name": "read_emails", "description": "...", "input_schema": {...}},
    {"name": "search_emails", "description": "...", "input_schema": {...}},
    {"name": "create_draft", "description": "...", "input_schema": {...}},
    {"name": "write_report", "description": "...", "input_schema": {...}}
  ],
  "messages": [
    {"role": "user", "content": "Summarize my emails from today"}
  ]
}
```

**What Claude responds with:**

```json
{
  "content": [
    {"type": "text", "text": "I'll check your emails from today."},
    {
      "type": "tool_use",
      "id": "toolu_01ABC123",
      "name": "read_emails",
      "input": {"days_back": 1, "max_count": 50}
    }
  ],
  "stop_reason": "tool_use"
}
```

Claude returned BOTH a text block ("I'll check your emails") AND a tool_use block. The `stop_reason` is `"tool_use"`, which means **Claude is not done yet** — it's waiting for the tool result.

### Between Turns: We Execute the Tool

Our code calls `execute_read_emails(days_back=1, max_count=50)`. This talks to Outlook via COM and returns JSON with 28 email previews. We log it to `audit.jsonl`.

### Turn 2: We Feed Results Back → Claude Reasons Again

**What we send to the API (cumulative conversation):**

```json
{
  "messages": [
    {"role": "user", "content": "Summarize my emails from today"},
    {"role": "assistant", "content": [
      {"type": "text", "text": "I'll check your emails from today."},
      {"type": "tool_use", "id": "toolu_01ABC123", "name": "read_emails",
       "input": {"days_back": 1, "max_count": 50}}
    ]},
    {"role": "user", "content": [
      {"type": "tool_result", "tool_use_id": "toolu_01ABC123",
       "content": "[{\"id\": \"AAMk...\", \"subject\": \"Q1 Planning\", ...}, ...]"}
    ]}
  ]
}
```

Notice the structure:
- The assistant message contains Claude's original response **including the tool_use block**
- The tool result is sent as a **user message** with `tool_use_id` matching the tool call's `id`

Claude sees the 28 email previews and decides to read 3 in full:

```json
{
  "content": [
    {"type": "text", "text": "I see 28 emails. Let me read the important ones in detail."},
    {"type": "tool_use", "id": "toolu_02DEF456", "name": "search_emails",
     "input": {"email_id": "AAMk...001"}},
    {"type": "tool_use", "id": "toolu_03GHI789", "name": "search_emails",
     "input": {"email_id": "AAMk...002"}},
    {"type": "tool_use", "id": "toolu_04JKL012", "name": "search_emails",
     "input": {"email_id": "AAMk...007"}}
  ],
  "stop_reason": "tool_use"
}
```

**Claude called three tools in one turn.** The API supports parallel tool calls — Claude can request multiple tools simultaneously when it knows it needs all of them.

### Turn 3: Three Results → Claude Synthesizes → Writes Report

We execute all three `search_emails` calls, feed all three results back. Claude now has full bodies for the 3 important emails. It reasons over everything and calls `write_report`:

```json
{
  "content": [
    {"type": "text", "text": "I've analyzed all emails. Creating your summary report."},
    {"type": "tool_use", "id": "toolu_05MNO345", "name": "write_report",
     "input": {
       "filename": "morning-briefing-2026-03-01.html",
       "content": "<html><head><style>...</style></head><body>..."
     }}
  ],
  "stop_reason": "tool_use"
}
```

### Turn 4: Final Response

After we feed back the `write_report` result ("Report saved to ~/email-agent/reports/morning-briefing-2026-03-01.html"), Claude gives its final response:

```json
{
  "content": [
    {"type": "text", "text": "Here's your morning briefing:\n\n**Action Required (3)**\n- Q1 Planning from Sarah — review slides 12-18 by Friday\n- Client follow-up from Dave — schedule call this week\n- Code review from teammate — PR #247, ~30 min\n\n**FYI (8)**: Status updates, meeting notes, HR announcements\n**Newsletters (12)**: Tech digests, promotional\n\nFull report saved to ~/email-agent/reports/morning-briefing-2026-03-01.html"}
  ],
  "stop_reason": "end_turn"
}
```

`stop_reason` is `"end_turn"` → our while loop breaks → we return the text to the user.

**Total: 4 API round-trips. 5 tool executions. ~$0.06 in API costs.**

---

## How This Compares to OpenClaw

The ReAct loop is **identical in structure**. OpenClaw's Pi engine does the same thing:

```
              OpenClaw                    Corporate Email Agent
              --------                    ---------------------
Tools:        Read, Write, Edit, Bash     read_emails, search_emails,
                                          create_draft, write_report

Loop:         while (stop_reason ==       while True:
                "tool_use")                 if stop_reason == "end_turn":
                execute tools                  break
                feed results back             execute tools
                                              feed results back

Model:        claude-sonnet-4-5           claude-sonnet-4-5
              (configurable)              (configurable)

System        SOUL.md + USER.md +         200-token static prompt
Prompt:       WORK.md + MEMORY.md +
              skills + context assembly

Capability:   Anything bash can do        4 specific operations
```

The loop is the same. The tools are different. That's the whole architectural difference between "an AI that can do anything" and "an AI that can only do email." The ReAct pattern is universal — what changes between agents is the set of tools you give them.

---

## The Audit Trail

Every tool call produces a line in `~/email-agent/logs/audit.jsonl`:

```jsonl
{"timestamp": "2026-03-01T07:00:12", "tool": "read_emails", "input": {"days_back": 1, "max_count": 50}, "result_length": 8234, "result_preview": "[{\"id\": \"AAMk...\", \"subject\": \"Q1 Planning\"..."}
{"timestamp": "2026-03-01T07:00:14", "tool": "search_emails", "input": {"email_id": "AAMk...001"}, "result_length": 3421, "result_preview": "{\"id\": \"AAMk...001\", \"subject\": \"Q1 Planning..."}
{"timestamp": "2026-03-01T07:00:15", "tool": "search_emails", "input": {"email_id": "AAMk...002"}, "result_length": 2187, "result_preview": "{\"id\": \"AAMk...002\", \"subject\": \"Prototype fee..."}
{"timestamp": "2026-03-01T07:00:16", "tool": "search_emails", "input": {"email_id": "AAMk...007"}, "result_length": 1543, "result_preview": "{\"id\": \"AAMk...007\", \"subject\": \"Code Review..."}
{"timestamp": "2026-03-01T07:00:18", "tool": "write_report", "input": {"filename": "morning-briefing-2026-03-01.html"}, "result_length": 48, "result_preview": "Report saved to /Users/blake/email-agent/reports/m..."}
```

IT can review this file and see exactly what the agent did, when, and what data it touched. There's no "trust us" — there's a log.

---

## Key Takeaways

1. **The ReAct loop is ~20 lines of Python.** The `while True` → `create` → check `stop_reason` → `execute_tool` → `append` pattern is the entire agent architecture. Everything else is tool definitions and configuration.

2. **Tool schemas are the agent's vocabulary.** Claude can only do what the schemas describe. No schema for "send email" = agent cannot send email. No schema for "run bash command" = agent cannot run bash. The schemas ARE the security boundary.

3. **The conversation is stateless.** We send the full `messages` array every API call. The Anthropic API doesn't remember previous calls. This means each run is independent — no persistent agent state to corrupt.

4. **`tool_use_id` is the critical linkage.** Every tool result must reference the exact `id` from the tool_use block it responds to. Get this wrong and the API returns an error.

5. **Claude can call multiple tools per turn.** When it needs three email bodies, it requests all three in one response. We execute all three and send all three results back in one user message.

6. **This is the same pattern as every major agent.** OpenClaw, Claude Code, NanoClaw — they all implement this loop. The difference is what tools they provide and what security boundaries they enforce. Understanding this loop means understanding how ALL of them work.
