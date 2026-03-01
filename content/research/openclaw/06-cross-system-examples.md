# Cross-System Navigation: How OpenClaw Actually Works

## The Secret Sauce

When someone says "OpenClaw can check my email, summarize a YouTube video, and update my Notion board" — how does that actually work under the hood? There's no email plugin, no YouTube plugin, no Notion plugin in the traditional sense.

The answer is a combination of three things:
1. **Bash access** to the entire Unix toolchain
2. **Markdown skills** that teach the agent about specific systems
3. **The agent loop** that chains operations adaptively

This document traces through real-world scenarios step by step, showing exactly what tool calls fire, what results come back, and how the agent reasons through multi-system workflows.

---

## Scenario 1: "Review my emails and create a report"

### What the user sees
> "Hey, review my emails from today and give me a summary"

A few seconds later, a structured report appears with categories, action items, and a saved file.

### What actually happens (tool-by-tool)

```
┌──────────────────────────────────────────────────────────┐
│ TURN 1: Agent reads context                              │
│                                                          │
│ [Read] TOOLS.md                                          │
│   → Finds: Gmail CLI configured, API key in credentials/ │
│   → Finds: email skill loaded from ~/clawd/skills/email  │
│                                                          │
│ Agent reasoning: "I have gmail-cli available. Let me      │
│ fetch today's emails."                                    │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ TURN 2: Fetch email list                                 │
│                                                          │
│ [Bash] gmail-cli list --after "2026-03-01" --format json │
│                                                          │
│ Result: [                                                │
│   {"id": "msg001", "from": "boss@company.com",          │
│    "subject": "Q1 Planning - Action Needed",             │
│    "snippet": "Please review the attached..."},          │
│   {"id": "msg002", "from": "client@acme.com",           │
│    "subject": "Feedback on prototype",                   │
│    "snippet": "The team loved the demo..."},             │
│   {"id": "msg003", "from": "newsletter@techdigest.com", │
│    "subject": "This Week in AI",                         │
│    "snippet": "GPT-5 rumors, OpenClaw 2.0..."},         │
│   ... (20 more emails)                                   │
│ ]                                                        │
│                                                          │
│ Agent reasoning: "23 emails. Let me categorize by        │
│ sender/subject, then read the important ones in full."   │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ TURN 3-5: Read important emails                          │
│                                                          │
│ [Bash] gmail-cli read msg001 --format text               │
│   → Full email from boss about Q1 planning               │
│                                                          │
│ [Bash] gmail-cli read msg002 --format text               │
│   → Client feedback with specific requests               │
│                                                          │
│ [Bash] gmail-cli read msg007 --format text               │
│   → Team member asking for code review                   │
│                                                          │
│ Agent reasoning: "I've identified 3 action-required      │
│ emails, 8 FYI, and 12 newsletters. Let me build          │
│ the report."                                             │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ TURN 6: Generate and save report                         │
│                                                          │
│ [Write] workspace/reports/email-summary-2026-03-01.md    │
│                                                          │
│ Content:                                                 │
│ # Email Summary — March 1, 2026                          │
│                                                          │
│ ## Action Required (3)                                   │
│ - **Q1 Planning** from boss@company.com                  │
│   Review attached roadmap by Friday. Reply with feedback.│
│ - **Code Review Request** from dev@company.com           │
│   PR #247 needs review. Estimated 30 min.                │
│ - **Client Feedback** from client@acme.com               │
│   3 specific change requests on prototype.               │
│                                                          │
│ ## FYI (8)                                               │
│ - Project status updates (3)                             │
│ - Meeting notes from yesterday (2)                       │
│ - HR announcements (3)                                   │
│                                                          │
│ ## Newsletters (12)                                      │
│ - Tech digests, industry news, promotional               │
│                                                          │
│ Agent reasoning: "Report saved. Let me also update       │
│ TODO.md with the action items."                          │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ TURN 7: Update task list                                 │
│                                                          │
│ [Edit] workspace/TODO.md                                 │
│   → Appends:                                             │
│   - [ ] Review Q1 roadmap and reply to boss (by Friday)  │
│   - [ ] Review PR #247 (~30 min)                         │
│   - [ ] Address client feedback on prototype             │
│                                                          │
│ [Edit] memory/2026-03-01.md                              │
│   → Appends: "Reviewed 23 emails. 3 action items added   │
│     to TODO. Full report in workspace/reports/"          │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ TURN 8: Respond to user                                  │
│                                                          │
│ "Here's your email summary for today:                    │
│  - 3 emails need action (Q1 planning, code review,       │
│    client feedback)                                      │
│  - 8 FYI emails (status updates, meeting notes, HR)      │
│  - 12 newsletters                                        │
│                                                          │
│  Action items added to your TODO. Full report saved to   │
│  workspace/reports/email-summary-2026-03-01.md"          │
└──────────────────────────────────────────────────────────┘
```

### Systems traversed
Email API → File system → Task management → Daily memory log

### Total tool calls: ~8-10
- 1 Read (check available tools)
- 1 Bash (list emails)
- 3 Bash (read important emails)
- 1 Write (save report)
- 2 Edit (update TODO, update daily log)

---

## Scenario 2: "Download this YouTube video and make a report"

### What the user sees
> "Download https://youtube.com/watch?v=abc123 and summarize the key points for me"

### What actually happens

```
┌──────────────────────────────────────────────────────────┐
│ TURN 1: Download video                                   │
│                                                          │
│ [Bash] yt-dlp "https://youtube.com/watch?v=abc123"      │
│        --print title --print duration --print channel    │
│        --skip-download                                   │
│                                                          │
│ Result:                                                  │
│   Title: "The Future of AI Agents in 2026"               │
│   Duration: 42:15                                        │
│   Channel: "Tech Explained"                              │
│                                                          │
│ Agent reasoning: "42 minutes — too long for direct       │
│ transcription in one shot. Let me get subtitles first,   │
│ fall back to Whisper if needed."                         │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ TURN 2: Try to get existing subtitles                    │
│                                                          │
│ [Bash] yt-dlp --write-auto-subs --sub-lang en            │
│        --skip-download --sub-format vtt                   │
│        -o "/tmp/yt-abc123"                               │
│        "https://youtube.com/watch?v=abc123"              │
│                                                          │
│ Result: Auto-subtitles downloaded to                     │
│         /tmp/yt-abc123.en.vtt                            │
│                                                          │
│ Agent reasoning: "Got auto-captions. Let me clean them   │
│ up — VTT format has timestamps and duplicates."          │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ TURN 3: Clean and read transcript                        │
│                                                          │
│ [Bash] python3 -c "                                      │
│   import re                                              │
│   with open('/tmp/yt-abc123.en.vtt') as f:               │
│       text = f.read()                                    │
│   # Remove timestamps and formatting                     │
│   lines = [l for l in text.split('\n')                   │
│            if not re.match(r'^\d|^$|^WEBVTT|^Kind', l)] │
│   # Deduplicate overlapping captions                     │
│   clean = list(dict.fromkeys(lines))                     │
│   with open('/tmp/yt-abc123-clean.txt', 'w') as f:       │
│       f.write('\n'.join(clean))                          │
│ "                                                        │
│                                                          │
│ [Read] /tmp/yt-abc123-clean.txt                          │
│ Result: Full cleaned transcript (~8,000 words)           │
│                                                          │
│ Agent reasoning: "Good transcript. Now I can analyze     │
│ the content and create a structured summary."            │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ TURN 4: Generate report (LLM reasoning, no tool call)    │
│                                                          │
│ The model processes the full transcript and generates:    │
│ - Executive summary                                      │
│ - Key points by topic                                    │
│ - Notable claims and data points                         │
│ - Timeline of topics discussed                           │
│ - Potential action items or follow-ups                   │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ TURN 5: Save report                                      │
│                                                          │
│ [Write] workspace/reports/youtube-abc123-summary.md      │
│                                                          │
│ Content:                                                 │
│ # Video Summary: The Future of AI Agents in 2026         │
│ **Channel**: Tech Explained                              │
│ **Duration**: 42:15                                      │
│ **Date Watched**: March 1, 2026                          │
│                                                          │
│ ## Executive Summary                                     │
│ [3-4 sentence overview]                                  │
│                                                          │
│ ## Key Points                                            │
│ 1. [Major topic 1 with details]                          │
│ 2. [Major topic 2 with details]                          │
│ 3. [Major topic 3 with details]                          │
│                                                          │
│ ## Notable Claims                                        │
│ - [Specific data point or prediction]                    │
│ - [Specific data point or prediction]                    │
│                                                          │
│ ## Topic Timeline                                        │
│ - 0:00-5:30 — Introduction and context setting           │
│ - 5:30-15:00 — [Topic 1]                                │
│ - 15:00-28:00 — [Topic 2]                               │
│ - 28:00-38:00 — [Topic 3]                               │
│ - 38:00-42:15 — Conclusions and predictions              │
│                                                          │
│ ## Follow-up Ideas                                       │
│ - [Potential research or action items]                   │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ TURN 6: Cleanup and respond                              │
│                                                          │
│ [Bash] rm /tmp/yt-abc123*                                │
│   → Clean up temporary files                             │
│                                                          │
│ Response to user:                                        │
│ "Here's the summary of 'The Future of AI Agents in 2026'│
│  by Tech Explained (42 min):                             │
│                                                          │
│  [Executive summary]                                     │
│                                                          │
│  Key points:                                             │
│  1. [Point 1]                                            │
│  2. [Point 2]                                            │
│  3. [Point 3]                                            │
│                                                          │
│  Full report: workspace/reports/youtube-abc123-summary.md│
└──────────────────────────────────────────────────────────┘
```

### Error handling: What if yt-dlp isn't installed?

```
[Bash] yt-dlp --version
Result: command not found

Agent reasoning: "yt-dlp not installed. Let me install it."

[Bash] pip install yt-dlp
Result: Successfully installed yt-dlp-2026.2.28

(continues with the workflow above)
```

### Error handling: What if auto-captions aren't available?

```
[Bash] yt-dlp --write-auto-subs --skip-download ...
Result: WARNING: No subtitles available

Agent reasoning: "No captions. I'll need to download the
audio and transcribe with Whisper."

[Bash] yt-dlp -x --audio-format mp3 -o "/tmp/yt-abc123.mp3" ...
[Bash] whisper /tmp/yt-abc123.mp3 --model base --output_format txt
[Read] /tmp/yt-abc123.txt

(continues with report generation)
```

### Systems traversed
YouTube → filesystem → Python (text processing) → LLM analysis → file output

### Total tool calls: ~6-8
- 2-3 Bash (metadata + subtitles/download)
- 1 Bash (text cleaning)
- 1 Read (transcript)
- 1 Write (report)
- 1 Bash (cleanup)

---

## Scenario 3: "Check my calendar, compare with my TODO, and plan my day"

### What actually happens

```
TURN 1: Check calendar
    [Bash] gcalcli agenda "2026-03-01" "2026-03-02" --tsv
    → 9:00 AM  Standup
    → 11:00 AM  Client Demo
    → 2:00 PM  1:1 with Manager
    → 4:00 PM  Sprint Planning

TURN 2: Read current TODOs
    [Read] workspace/TODO.md
    → 12 pending tasks, 3 marked urgent

TURN 3: Check recent context
    [Read] memory/2026-02-28.md
    → Yesterday's notes: "Client demo prep not finished"

TURN 4: Generate plan and update files
    [Write] workspace/daily-plan-2026-03-01.md
    → Structured plan:
      Before 9 AM: Finish client demo prep (urgent, 30 min)
      9:00-9:30: Standup
      9:30-11:00: Deep work on PR #247 review
      11:00-12:00: Client Demo
      12:00-1:00: Lunch
      1:00-2:00: Address client feedback from email
      2:00-2:30: 1:1 with Manager
      2:30-4:00: Q1 roadmap review (boss's request)
      4:00-5:00: Sprint Planning

    [Edit] workspace/TODO.md
    → Reorders tasks by today's priority

TURN 5: Respond
    → "Here's your day plan. You have 4 meetings and
       3 urgent tasks. I've reorganized your TODO list
       to match. The client demo prep from yesterday
       still needs 30 min — I've scheduled that first."
```

### Systems traversed
Google Calendar → Task list → Daily memory → Day planner → Task list update

---

## The Pattern: Why This Works

Every cross-system scenario follows the same pattern:

```
1. READ CONTEXT  → What tools/APIs are available? What does the user need?
2. FETCH DATA    → Use Bash (curl, CLI tools) to pull from external systems
3. PROCESS       → Read results, let the LLM analyze and synthesize
4. PRODUCE       → Write output files, edit existing files
5. PERSIST       → Update memory, task lists, daily logs
6. RESPOND       → Summarize for the user
```

The key insight is that **steps 2-4 can repeat as many times as needed**. The agent loop doesn't stop after one tool call — it keeps going until the task is done. And because each step is a primitive operation (Bash, Read, Write, Edit), the agent can compose arbitrarily complex workflows from simple building blocks.

---

## How NanoClaw Handles the Same Scenarios

NanoClaw takes a different approach to cross-system navigation because of container isolation:

```
OpenClaw:                           NanoClaw:
┌─────────────────────┐           ┌─────────────────────┐
│ Agent Process        │           │ Container            │
│   → bash: gmail-cli  │           │   → Claude Agent SDK │
│   → bash: yt-dlp     │           │   → IPC: {           │
│   → bash: gcalcli    │           │       "action":      │
│   → bash: curl       │           │       "send_message",│
│   (direct access)    │           │       "target": "..."│
│                      │           │     }                │
│                      │           │   → Host validates   │
│                      │           │   → Host executes    │
│                      │           │   → Result via IPC   │
└─────────────────────┘           └─────────────────────┘
```

NanoClaw's container can't directly access Gmail or YouTube. It must:
1. Write a JSON request to the IPC directory
2. Wait for the host to validate and execute
3. Read the result from the IPC response

This adds latency and limits what the agent can do, but ensures the agent never directly accesses systems it shouldn't.

---

## Key Takeaway

OpenClaw's cross-system navigation works because of a simple but powerful formula:

**Bash + LLM reasoning + adaptive looping = access to any system**

The agent doesn't need dedicated integrations for each external service. It needs a shell, knowledge of available CLI tools (from skills), and the ability to chain operations based on intermediate results. The same four tools that read a file can download a video, query a database, deploy a container, and send a message — because Bash is the universal interface to everything a computer can do.
