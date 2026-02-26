---
title: "OpenClaw Deep Dive: What Actually Happens When You Talk to an Agent"
description: "A detailed technical walkthrough of OpenClaw's architecture — from keystroke to completed task. ASCII diagrams, real tool calls, and the full agent loop revealed."
date: 2026-02-26
draft: true
tags: ["openclaw", "agents", "architecture", "terminal", "learning"]
---

# OpenClaw Deep Dive

You type a message. Seconds later, files appear, commands run, dashboards spin up. But what actually happened between your keystroke and the result?

This guide pulls back every layer. You will see the exact JSON that flows between components, the bash commands that execute on your machine, and the context window assembly that makes it all work. If you have read the introductory guide on LLMs and agents, this is where we go deeper.

---

## Video Reference

**Terminal Basics for Beginners**
https://www.youtube.com/watch?v=5XgBd6rjuDQ

This video covers the fundamentals of working with a command-line terminal -- navigating directories, running programs, piping output between tools. Every concept in that video maps directly to how OpenClaw operates under the hood. The terminal is not just a developer tool here. It is the universal interface through which an AI agent controls your computer.

If you are comfortable with `cd`, `ls`, `cat`, and pipes, you already understand the execution layer of every AI agent built on this architecture. If not, watch the video first. Everything below will make more sense.

---

## The Architecture at a Glance

Before we trace a single interaction, here is the full system:

```
    YOU (browser, Telegram, Discord, etc.)
     |
     | message
     v
+-----------------------+
|    OpenClaw Gateway    |    <-- runs on your machine
|                        |
|  - session management  |
|  - conversation history|
|  - tool definitions    |
|  - context assembly    |
+-----------------------+
     |                ^
     | full context   | tool results
     v                |
+-----------------------+
|    LLM API            |    <-- Claude, hosted by Anthropic
|    (stateless)        |
|                        |
|  - receives full       |
|    conversation each   |
|    time                |
|  - returns text or     |
|    tool_use blocks     |
+-----------------------+
     |
     | tool_use request
     v
+-----------------------+
|    Gateway (executor)  |    <-- same process, local machine
|                        |
|  - runs bash commands  |
|  - reads/writes files  |
|  - controls browser    |
|  - captures output     |
+-----------------------+
     |
     | result sent back to LLM
     v
   (loop continues until LLM gives final text response)
```

Two things to notice. First, the LLM API is stateless -- it remembers nothing between calls. The Gateway manages all conversation state locally. Second, the LLM never executes anything. It requests actions. The Gateway executes them on your machine and reports results back.

---

## The Full Flow: One Interaction, Every Layer

Let us trace a real interaction from start to finish. You open webchat and type:

> "What's in my Downloads folder? Summarize the largest files."

Here is every step that happens.

### Step 1 -- Message Capture

Your message arrives at the Gateway via WebSocket (webchat) or webhook (Telegram/Discord). The Gateway appends it to the conversation history for your session.

```
Session: main
History before: [system_prompt, ...previous messages...]
History after:  [system_prompt, ...previous messages..., {role: "user", content: "What's in my Downloads folder? Summarize the largest files."}]
```

### Step 2 -- Context Window Assembly

This is where it gets interesting. The Gateway builds the full payload for the LLM API call. The LLM will see exactly this and nothing else.

```
┌─────────────────────────────────────────────────────┐
│              CONTEXT WINDOW (sent to API)            │
│                                                     │
│  1. System prompt           ~2,000 tokens           │
│     - personality, rules, workspace path            │
│     - safety constraints                            │
│     - tool usage instructions                       │
│                                                     │
│  2. Tool definitions        ~3,000 tokens           │
│     - exec (run shell commands)                     │
│     - read (read files)                             │
│     - write (create files)                          │
│     - edit (modify files)                           │
│     - browser (control browser)                     │
│     - web_search, web_fetch                         │
│     - message, nodes, tts, etc.                     │
│                                                     │
│  3. Conversation history    variable                │
│     - all prior messages this session               │
│     - includes previous tool calls and results      │
│                                                     │
│  4. Current user message    ~20 tokens              │
│     "What's in my Downloads folder?                 │
│      Summarize the largest files."                  │
│                                                     │
│  TOTAL: ~5,000-50,000+ tokens depending on history  │
└─────────────────────────────────────────────────────┘
```

The LLM is blind. It has no filesystem access, no terminal, no browser. It sees only this block of text. Everything it knows about your computer comes from previous tool results in the conversation history.

### Step 3 -- API Call

The Gateway sends an HTTPS POST to `api.anthropic.com` with this payload. The request includes:

```json
{
  "model": "claude-sonnet-4-5-20250514",
  "max_tokens": 8096,
  "system": "You are a personal assistant running inside OpenClaw...",
  "tools": [
    {
      "name": "exec",
      "description": "Execute shell commands...",
      "input_schema": {
        "type": "object",
        "properties": {
          "command": {"type": "string"},
          "timeout": {"type": "number"},
          "workdir": {"type": "string"}
        }
      }
    }
  ],
  "messages": [
    {"role": "user", "content": "What's in my Downloads folder? Summarize the largest files."}
  ]
}
```

Note: tool definitions are JSON Schema. The LLM learned during training how to produce valid calls against these schemas.

### Step 4 -- LLM Response (Tool Call)

The LLM decides it needs to see the filesystem. It cannot look directly. So it responds with a tool call:

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_01ABC123",
      "name": "exec",
      "input": {
        "command": "ls -lhS ~/Downloads | head -20",
        "timeout": 10
      }
    }
  ]
}
```

The LLM chose `ls -lhS` because `-S` sorts by size (largest first) and `-h` makes sizes human-readable. This is exactly the kind of bash knowledge the video above teaches -- and exactly the knowledge that makes an agent effective.

### Step 5 -- Local Execution

The Gateway receives the tool call and executes it on your machine. This is a real bash command running in a real shell:

```
$ ls -lhS ~/Downloads | head -20
total 12G
-rw-r--r--  1 blake  staff   4.2G Feb 15 09:30 ubuntu-24.04-desktop.iso
-rw-r--r--  1 blake  staff   1.8G Feb 20 14:22 project-backup.tar.gz
-rw-r--r--  1 blake  staff   890M Jan 30 11:45 training-data.csv
-rw-r--r--  1 blake  staff   340M Feb 24 16:10 presentation.pptx
-rw-r--r--  1 blake  staff    45M Feb 25 08:00 design-mockups.fig
...
```

### Step 6 -- Result Injection

The Gateway takes this output and appends it to the conversation as a tool result:

```json
{
  "role": "tool",
  "tool_use_id": "toolu_01ABC123",
  "content": "total 12G\n-rw-r--r--  1 blake  staff   4.2G Feb 15 09:30 ubuntu-24.04-desktop.iso\n..."
}
```

The full conversation now looks like:

```
[system] + [tools] + [user message] + [assistant tool_call] + [tool result]
```

And the Gateway sends ALL of this back to the API for another turn.

### Step 7 -- LLM Synthesis

The LLM now sees the directory listing in its context. It has what it needs. It responds with plain text:

```
Your Downloads folder contains about 12GB across these notable files:

- ubuntu-24.04-desktop.iso (4.2 GB) -- Linux installer image from Feb 15
- project-backup.tar.gz (1.8 GB) -- compressed archive from Feb 20
- training-data.csv (890 MB) -- large dataset from Jan 30
- presentation.pptx (340 MB) -- PowerPoint from Feb 24
- design-mockups.fig (45 MB) -- Figma file from yesterday

The ISO and backup archive account for most of the space.
If you are done with the Ubuntu installer, removing it would
free up 4.2 GB immediately.
```

### Step 8 -- Delivery

The Gateway sends this text response back to your interface (webchat, Telegram, Discord). From your perspective, you asked a question and got an answer. Behind the scenes: two API round-trips, one bash command, and a full context window rebuild.

---

## The Agent Loop

That single interaction demonstrated the core pattern. Here it is abstracted:

```
                    ┌──────────────┐
                    │  User sends  │
                    │  message     │
                    └──────┬───────┘
                           │
                           v
                    ┌──────────────┐
                    │  Assemble    │
              ┌────>│  context     │
              │     │  window      │
              │     └──────┬───────┘
              │            │
              │            v
              │     ┌──────────────┐
              │     │  Send to     │
              │     │  LLM API     │
              │     └──────┬───────┘
              │            │
              │            v
              │     ┌──────────────┐
              │     │  LLM returns │
              │     │  response    │
              │     └──────┬───────┘
              │            │
              │       ┌────┴─────┐
              │       │          │
              │       v          v
              │  ┌─────────┐ ┌──────────┐
              │  │ tool_use │ │ text     │
              │  │ request  │ │ (final)  │
              │  └────┬─────┘ └────┬─────┘
              │       │            │
              │       v            v
              │  ┌──────────┐  ┌───────────┐
              │  │ Execute  │  │ Deliver   │
              │  │ locally  │  │ to user   │
              │  └────┬─────┘  └───────────┘
              │       │
              │       v
              │  ┌──────────┐
              └──│ Append   │
                 │ result   │
                 └──────────┘
```

The loop continues until the LLM returns a text response instead of a tool call. A complex task might loop 20 or 30 times. A simple question might not loop at all.

This is the entire architecture of Pi (the engine behind OpenClaw), described by its creators as: "a while loop that calls an LLM with four tools."

---

## The Context Window Reveal

What does the LLM actually see? Not your screen. Not your filesystem. Not the internet. It sees a structured text document assembled by the Gateway. Let us look at it in full.

### Anatomy of an API Call

```
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM PROMPT                                          ~2k tok  │
│                                                                 │
│ "You are a personal assistant running inside OpenClaw.          │
│  Your working directory is /Users/blake/openclaw/workspace      │
│  Tool availability: read, write, edit, exec, browser,           │
│  web_search, web_fetch, message, nodes, tts, image              │
│  ...                                                            │
│  Safety rules, formatting preferences, workspace files..."      │
├─────────────────────────────────────────────────────────────────┤
│ TOOL DEFINITIONS                                       ~3k tok  │
│                                                                 │
│ [                                                               │
│   {                                                             │
│     "name": "exec",                                             │
│     "description": "Execute shell commands with background      │
│      continuation...",                                          │
│     "input_schema": {                                           │
│       "properties": {                                           │
│         "command": {"type": "string"},                          │
│         "timeout": {"type": "number"},                          │
│         "workdir": {"type": "string"},                          │
│         "pty": {"type": "boolean"}                              │
│       },                                                        │
│       "required": ["command"]                                   │
│     }                                                           │
│   },                                                            │
│   { "name": "read", ... },                                      │
│   { "name": "write", ... },                                     │
│   { "name": "edit", ... },                                      │
│   { "name": "browser", ... },                                   │
│   ...10 more tools                                              │
│ ]                                                               │
├─────────────────────────────────────────────────────────────────┤
│ CONVERSATION HISTORY                              variable size  │
│                                                                 │
│ [                                                               │
│   { "role": "user", "content": "earlier message" },             │
│   { "role": "assistant", "content": "earlier response" },       │
│   { "role": "user", "content": "What's in my Downloads..." },  │
│ ]                                                               │
├─────────────────────────────────────────────────────────────────┤
│ (after first tool call, also includes:)                         │
│                                                                 │
│   { "role": "assistant", "content": [tool_use block] },        │
│   { "role": "tool", "content": "ls output..." },               │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Matters

The LLM is stateless. Each API call sends the entire conversation from scratch. The API does not remember your last message. It processes the full context, generates a response, and forgets everything.

This has two major implications:

1. **Context is precious.** A 200,000-token window sounds large, but tool results accumulate fast. A single `cat` of a large file can consume thousands of tokens. The Gateway must manage this -- pruning old tool results, summarizing when needed.

2. **The LLM has no hidden state.** There is no secret memory, no background process, no persistent understanding. If information is not in the context window, the LLM does not know it. This is why agents write to files -- files persist across sessions. The context window does not.

```
    What you think happens          What actually happens
    ──────────────────────          ──────────────────────

    You: "remember X"              Context: [msg1, msg2, ..., msgN]
    LLM stores X somewhere         LLM sees X in message history
    ...                            ...
    Later: "what was X?"           Context: [msg1, msg2, ..., msgN, ..., msgM]
    LLM recalls X                  LLM finds X by scanning the text
                                   (if pruned, X is gone forever)
```

This is why OpenClaw's `MEMORY.md` and daily memory files exist. They are the agent's workaround for having no persistent memory. Write it to a file. Read it next session.

---

## Interactive Scenarios

Let us walk through three real scenarios to see the agent loop in action.

### Scenario 1: Navigate Filesystem and Create a Report

**You type:** "Analyze the git repos in ~/Repo and create a report showing commit activity this month."

**Turn 1 -- Discovery**

```
LLM thinks: I need to find all git repos first.

Tool call:
  exec: "find ~/Repo -maxdepth 2 -name .git -type d | head -20"

Result:
  /Users/blake/Repo/provider-search/.git
  /Users/blake/Repo/personal-website/.git
  /Users/blake/Repo/chief/.git
  /Users/blake/Repo/openclaw/.git
```

**Turn 2 -- Data Collection**

```
LLM thinks: Now I need commit counts for each repo this month.

Tool call:
  exec: "for repo in provider-search personal-website chief openclaw; do
    echo \"=== $repo ===\"
    cd ~/Repo/$repo
    git log --oneline --after='2026-02-01' | wc -l
    git log --oneline --after='2026-02-01' | head -5
    echo
  done"

Result:
  === provider-search ===
  47
  a1b2c3d Refactor entity resolution pipeline
  e4f5g6h Add NPI validation endpoint
  ...

  === personal-website ===
  23
  h7i8j9k Add deep-dive learning module
  ...
```

**Turn 3 -- Report Generation**

```
LLM thinks: I have the data. Now write the report.

Tool call:
  write:
    path: ~/openclaw/workspace/reports/git-activity-feb-2026.md
    content: |
      # Git Activity Report -- February 2026

      ## Summary
      | Repository       | Commits | Most Active Day |
      |-----------------|---------|-----------------|
      | provider-search  | 47      | Feb 12 (8)      |
      | personal-website | 23      | Feb 26 (6)      |
      | chief            | 31      | Feb 8 (5)       |
      | openclaw         | 12      | Feb 15 (4)      |

      ## Details
      ...
```

**Turn 4 -- Final Response**

```
LLM returns text:
  "Created the report at ~/openclaw/workspace/reports/git-activity-feb-2026.md.
   Provider-search was the most active repo with 47 commits.
   Here's the summary: ..."
```

Four turns. Three tool calls. One report. The user saw a single response.

---

### Scenario 2: Build a Quick Dashboard

**You type:** "Create a simple dashboard showing system stats -- CPU, memory, disk. Serve it on port 8080."

**Turn 1 -- Write the App**

```
Tool call:
  write:
    path: ~/openclaw/workspace/dashboard/app.py
    content: |
      from fastapi import FastAPI
      from fastapi.responses import HTMLResponse
      import psutil, json

      app = FastAPI()

      @app.get("/", response_class=HTMLResponse)
      def dashboard():
          cpu = psutil.cpu_percent(interval=1)
          mem = psutil.virtual_memory()
          disk = psutil.disk_usage("/")
          return f"""
          <html><body style="font-family: monospace; padding: 2rem;">
          <h1>System Dashboard</h1>
          <pre>
          CPU Usage:    {cpu}%
          Memory:       {mem.percent}% ({mem.used // (1024**3)}GB / {mem.total // (1024**3)}GB)
          Disk:         {disk.percent}% ({disk.used // (1024**3)}GB / {disk.total // (1024**3)}GB)
          </pre>
          </body></html>"""
```

**Turn 2 -- Install and Launch**

```
Tool call:
  exec: "cd ~/openclaw/workspace/dashboard && pip install fastapi uvicorn psutil -q && uvicorn app:app --port 8080 &"
  background: true
```

**Turn 3 -- Verify**

```
Tool call:
  exec: "sleep 2 && curl -s localhost:8080 | head -5"

Result:
  <html><body style="font-family: monospace; padding: 2rem;">
  <h1>System Dashboard</h1>
  <pre>
  CPU Usage:    12.3%
  Memory:       67.2% (16GB / 24GB)
```

**Final Response:**

```
Dashboard is running at http://localhost:8080. It shows live CPU,
memory, and disk usage. The FastAPI server is running in the background.
```

Three turns. A working web app. The agent wrote Python, installed dependencies, launched a server, and verified it -- all through bash.

---

### Scenario 3: Check Calendar and Draft Email

**You type:** "Check my calendar for tomorrow and draft an email to the team about the standup time."

**Turn 1 -- Calendar Check**

```
Tool call:
  exec: "gcalcli agenda '2026-02-27' '2026-02-28' --details=length"

Result:
   9:00am  Team Standup (30 min)
  10:30am  Design Review (1 hour)
   2:00pm  Sprint Planning (1.5 hours)
```

**Turn 2 -- Draft Email**

```
Tool call:
  write:
    path: ~/openclaw/workspace/drafts/standup-email.md
    content: |
      Subject: Tomorrow's standup -- 9:00 AM as usual

      Hey team,

      Quick reminder that our standup is at 9:00 AM tomorrow (Friday).
      Same Zoom link as always. Please have your updates ready:
      - What you shipped this week
      - Any blockers
      - Plan for next week

      See you there.
```

**Final Response:**

```
Tomorrow's calendar:
- 9:00 AM -- Team Standup (30 min)
- 10:30 AM -- Design Review (1 hour)
- 2:00 PM -- Sprint Planning (1.5 hours)

I've drafted the standup email at ~/openclaw/workspace/drafts/standup-email.md.
Want me to send it, or would you like to edit it first?
```

Notice the agent stops before sending. It drafted but did not email. This is the safety model in action -- external actions (sending emails, posting publicly) require confirmation.

---

## Why Bash is the Universal Interface

The Pi philosophy is: "Bash is all you need." Here is why.

Every tool you have ever installed on your computer is accessible through bash. The agent does not need a custom integration for each one. It just runs the command.

```
  Need              Command                    No plugin required
  ──────────────    ─────────────────────────  ──────────────────
  Version control   git log, git commit         just bash
  Package mgmt      npm install, pip install    just bash
  Data processing   python script.py            just bash
  API calls         curl https://api.example    just bash
  File search       grep -r "pattern" .         just bash
  System info       df -h, top, ps aux          just bash
  Cloud deploy      ssh server "deploy.sh"      just bash
  Database query    psql -c "SELECT ..."        just bash
  PDF generation    pandoc report.md -o out.pdf just bash
  Image processing  ffmpeg -i input.mp4 ...     just bash
```

### Composition Through Pipes

Bash's pipe operator lets you chain tools together. The agent uses this constantly:

```bash
# Find large files, sort by size, format as table
find . -type f -exec du -h {} + | sort -rh | head -20

# Get API data, extract fields, save as CSV
curl -s api.example.com/data | jq -r '.items[] | [.name, .value] | @csv' > report.csv

# Check all repos for uncommitted changes
for d in ~/Repo/*/; do
  cd "$d" && [ -n "$(git status --porcelain)" ] && echo "DIRTY: $d"
done
```

Each pipe character connects the output of one program to the input of the next. The agent can compose arbitrarily complex workflows from simple tools -- the same way a human would in a terminal.

### Why Not Custom Tools?

Other agent frameworks build dozens of specialized tools: a GitHub tool, a Slack tool, a database tool, a file search tool. Each needs maintenance, documentation, and updates when APIs change.

The bash approach: if there is a CLI for it, the agent can use it. No wrapper needed. When a new tool appears (a new CLI, a new API), the agent can use it immediately through `curl` or the tool's command-line interface. Zero integration work.

The trade-off is trust. Bash can do anything -- including destructive things. This is why OpenClaw's safety layer exists: confirmation prompts for dangerous commands, sandboxing options, and the principle that external actions require human approval.

---

## Under the Hood: Tool Call Anatomy

Every tool call follows the same structure. Here is the complete JSON for a real tool call and its result:

### The Request (LLM to Gateway)

```json
{
  "type": "tool_use",
  "id": "toolu_01XR9CNkYqLmKfH8v2B7DGZP",
  "name": "exec",
  "input": {
    "command": "find ~/Repo -maxdepth 2 -name '*.md' | wc -l",
    "timeout": 10
  }
}
```

### The Result (Gateway to LLM)

```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_01XR9CNkYqLmKfH8v2B7DGZP",
  "content": "247"
}
```

The `tool_use_id` links request to result. The LLM can issue multiple tool calls in a single response (parallel execution), and the Gateway matches results back by ID.

### Multiple Tool Calls in One Turn

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_01AAA",
      "name": "exec",
      "input": {"command": "cat ~/.config/settings.json"}
    },
    {
      "type": "tool_use",
      "id": "toolu_01BBB",
      "name": "web_search",
      "input": {"query": "FastAPI websocket tutorial"}
    }
  ]
}
```

The Gateway executes both simultaneously, then sends both results back. This is how agents stay fast -- independent operations run in parallel.

---

## Context Window Management

As conversations grow, the context window fills. At roughly 200,000 tokens (about 150,000 words), even Claude's large context has limits. Tool results are the primary consumer.

```
  Token Budget Breakdown (typical long session)
  ──────────────────────────────────────────────
  System prompt + tools:     ~5,000 tokens    (fixed)
  Workspace files:           ~2,000 tokens    (fixed)
  Conversation messages:     ~3,000 tokens    (grows slowly)
  Tool results:             ~40,000 tokens    (grows fast)
  ──────────────────────────────────────────────
  Total after 30 min:       ~50,000 tokens
  Total after 2 hours:     ~180,000 tokens    (approaching limit)
```

When the window fills, the Gateway must prune. Strategy:

1. Old tool results go first (large, least relevant)
2. Middle conversation messages get summarized
3. System prompt and recent messages always stay
4. Recent tool results are preserved (agent might reference them)

This is invisible to you. The agent keeps working. But it explains why very long sessions sometimes "forget" things discussed an hour ago -- that context was pruned to make room.

---

## The Stateless Paradox

The most counterintuitive fact about this architecture: the LLM has no memory between API calls. Every call sends the full conversation. The API processes it, responds, and immediately forgets.

```
Call 1:  [System + Tools + "Hello"]                          --> "Hi!"
Call 2:  [System + Tools + "Hello" + "Hi!" + "What's 2+2?"] --> "4"
Call 3:  [System + Tools + "Hello" + "Hi!" + "What's 2+2?"
          + "4" + "Thanks!"]                                 --> "You're welcome!"
```

The LLM re-reads the entire conversation each time. "Hello" is sent three times. This is why prompt caching exists -- Anthropic caches the unchanged prefix so repeated content processes faster. But the full payload is still transmitted.

This design gives the Gateway total control. It can edit history, retry failed turns, inject system messages, or prune context without the LLM knowing or caring. The LLM just processes whatever text it receives, every single time.

---

## Putting It Together

The entire system reduces to a simple loop:

```
1. User speaks
2. Gateway assembles context (system + tools + history + message)
3. Gateway calls LLM API with full context
4. LLM returns tool_use or text
5. If tool_use: execute locally, append result, go to step 2
6. If text: deliver to user, done
```

That is it. A while loop with four tools (read, write, edit, exec) and a stateless API. Everything else -- browser automation, web search, calendar integration, email drafting, dashboard building -- is just bash commands and file operations running inside that loop.

The creators of Pi (the engine powering OpenClaw) put it this way:

> "Pi is a while loop that calls an LLM with four tools. The LLM gives back tool calls or not and that is it."

The simplicity is the point. Bash is the universal interface. The terminal is the control plane. And the context window is all the agent ever sees.

---

## Key Takeaways

**The LLM is blind.** It sees only the text in its context window. No filesystem, no network, no screen. Tools are its only connection to your computer.

**The Gateway is the brain.** It manages state, assembles context, executes tools, and delivers responses. The LLM is the reasoning engine, but the Gateway is the nervous system.

**Bash is the universal adapter.** Any CLI tool becomes an agent capability. No plugins, no integrations, no APIs to maintain. If you can type it in a terminal, the agent can run it.

**Stateless means rebuildable.** Every API call is self-contained. The conversation can be edited, pruned, replayed, or branched. There is no hidden state to corrupt.

**The loop is simple.** Message in, context assembled, LLM called, tool executed, result appended, repeat. Complex behaviors emerge from simple loops running many times.

Understanding this architecture changes how you use agents. You stop thinking of them as magic and start thinking of them as automated terminal sessions with very good judgment about what to type next.
