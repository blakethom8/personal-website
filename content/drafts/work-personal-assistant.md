---
title: "Personal AI Assistant: Life With OpenClaw"
type: work
date: "2026-02-26"
tags: ["work", "ai", "openclaw", "automation"]
status: "active"
excerpt: "What it's actually like to have an AI agent with full system access, proactive awareness, and memory that persists across sessions. Not a chatbot — a digital chief of staff."
featured: false
---

# Personal AI Assistant: Life With OpenClaw

**I gave an AI agent system access. Here's what happened.**

---

## The Setup

**Name:** Chief  
**Platform:** OpenClaw (open-source agent harness)  
**Model:** Claude Sonnet 4-5 (Anthropic)  
**Location:** My MacBook Pro (runs locally, calls Claude API)  
**Access:** Everything I've given it permission to touch  

**What it can do:**
- Read, write, and edit files on my machine
- Run terminal commands (Python scripts, git, APIs, anything)
- Control my browser (Chrome DevTools Protocol)
- Send messages (Telegram, Signal, Email via API)
- Access my calendar (Google Calendar via `gog` CLI)
- Take security camera snapshots (via `nodes` tool to my home system)
- Schedule reminders (via `cron` tool)
- Run background processes (coding agents like Claude Code)

**What it can't do:**
- Nothing without me triggering it first (no autonomous execution without a prompt or heartbeat)
- Act maliciously (it's Claude — aligned, helpful, harmless)
- Waste money (rate limits + usage monitoring)

---

## The Architecture

OpenClaw is built on **Pi** — a minimal agent harness created by Armin Ronacher and Mario Zechner. The core architecture is deceptively simple:

```
┌────────────────────────────────────────────────────────┐
│                 THE WHILE LOOP                         │
│                                                        │
│  while True:                                           │
│    user_message = get_input()                          │
│    response = llm.call(history + user_message)         │
│                                                        │
│    if response.has_tool_calls():                       │
│      for tool in response.tool_calls:                  │
│        result = execute_tool(tool)                     │
│        history.append(tool_result)                     │
│      continue  # Loop again with tool results          │
│    else:                                               │
│      display(response.text)                            │
│      history.append(response)                          │
│      break                                             │
└────────────────────────────────────────────────────────┘
```

That's it. A loop. Four tools. Everything else is bash.

---

## The Four Core Tools

| Tool | What It Does | Example |
|------|-------------|---------|
| **read** | Read file contents | `read('~/.openclaw/workspace/MEMORY.md')` |
| **write** | Create or overwrite files | `write('report.md', content)` |
| **edit** | Precise text replacement | `edit('config.json', old="port: 8000", new="port: 8080")` |
| **exec** | Run shell commands | `exec('python analyze.py --data claims.csv')` |

**Why so minimal?**

Because bash is the universal interface. If you can script it, the agent can use it.

- Need to query a database? → `exec('psql -c "SELECT * FROM..."')`
- Need to call an API? → `exec('curl -X POST...')`
- Need to process data? → `exec('python script.py')`
- Need to use git? → `exec('git commit -am "update"')`

Every CLI tool ever built = available to the agent.

---

## Memory Architecture

### The Problem With Chatbots

ChatGPT forgets everything when you close the tab. Every conversation starts from zero. You re-explain your context every time.

OpenClaw has **persistent memory across sessions.**

### The Memory System

```
~/.openclaw/workspace/
├── MEMORY.md                 ← Long-term curated knowledge
├── memory/
│   ├── 2026-02-25.md         ← Today's session log
│   ├── 2026-02-24.md         ← Yesterday
│   └── 2026-02-23.md         ← Day before
├── AGENTS.md                 ← Behavioral rules
├── SOUL.md                   ← Personality/persona
├── USER.md                   ← Info about me (Blake)
├── TOOLS.md                  ← Tool-specific notes
└── reports/                  ← Generated reports, analyses
```

**Every session:**
1. Agent wakes up
2. Reads `SOUL.md` (who it is)
3. Reads `USER.md` (who I am)
4. Reads `MEMORY.md` (curated long-term knowledge)
5. Reads `memory/YYYY-MM-DD.md` (today + yesterday)
6. Now it has context

**During session:**
- Conversation accumulates in the context window (API state)
- Agent writes important things to today's daily note
- Decisions, learnings, things to remember go in `MEMORY.md`

**Between sessions:**
- API state is lost (stateless)
- File-based memory persists
- Next session: agent reads the files and picks up where it left off

### Example: What's in MEMORY.md

```markdown
# MEMORY.md — Long-Term Memory

## About Blake
- Full name: Blake Thomson
- Partner: Devon (fiancée)
- Wedding: June 20, 2026 (Napa Valley)
- Current role: Business Development at Cedars-Sinai

## The Venture
Building bespoke AI services for healthcare orgs.
Deployment model: inside client's Azure tenant.
Key differentiator: domain expertise + data architecture.

## Technical Context
- GitHub: blakethom8
- Main projects: Provider Search, CMS pipeline
- Tools: FastAPI, React, DuckDB, Supabase

## Active Projects
- Provider Search (mydoclist.com) — LIVE
- CMS Data Pipeline (Hetzner server) — ACTIVE
- Wedding website (devonandblake.com) — LIVE
- Personal website (blakethomson.com) — IN PROGRESS
```

This is what every conversation starts with. The agent doesn't forget who I am, what I'm building, or what matters.

---

## The Heartbeat System

### Proactive Awareness

Most assistants are reactive — they wait for you to ask.

OpenClaw has a **heartbeat** — a periodic poll where the Gateway sends a message and the agent decides if anything needs attention.

**Heartbeat prompt:**
> "Read HEARTBEAT.md if it exists. Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK."

**HEARTBEAT.md** (what to check):
```markdown
# HEARTBEAT.md

# Keep this file empty to skip heartbeat actions.

## Things to check (rotate through these, 2-4x per day):
- **Emails** — Any urgent unread?
- **Calendar** — Events in next 24-48h?
- **Memory maintenance** — Review daily files, update MEMORY.md

## When to reach out:
- Important email arrived
- Calendar event < 2h away
- Something interesting found
- It's been > 8h since last check

## When to stay quiet (HEARTBEAT_OK):
- Late night (23:00-08:00) unless urgent
- Human is busy
- Nothing new since last check
- Just checked < 30 min ago
```

**Example interaction:**

```
[Heartbeat poll at 8:00 AM]

Chief checks:
  - Email: 3 unread, all newsletters
  - Calendar: Meeting at 2:00 PM (6 hours away)
  - Memory: Nothing stale

Chief responds: HEARTBEAT_OK
```

```
[Heartbeat poll at 9:30 AM]

Chief checks:
  - Email: 1 new from Dave (re: business proposal)
  - Subject line: "Can we schedule a call this week?"

Chief responds:
"You have an email from Dave asking to schedule a call this week.
Want me to draft a response or check your availability?"
```

**The magic:** The agent doesn't wait for me to ask "what's new?" It tells me when there's something worth knowing.

---

## Daily Workflow Examples

### Morning: The Briefing

**8:00 AM - Heartbeat fires**

Chief checks email, calendar, and overnight messages. Finds:
- Calendar event today at 2 PM ("Weekly sync with team")
- Email from client with question about data pipeline
- GitHub notification (PR review request)

**Chief's message:**
> "Morning! Three things:
> 1. Team sync at 2 PM (in 6 hours)
> 2. Client email about the CMS pipeline — wants to know if we can add prescribing data
> 3. PR review waiting on provider-search repo
>
> Want me to draft a response to the client email?"

I reply: "Yes, draft it."

Chief reads the client's email, checks `~/Repo/cms-data/docs/data-strategy.md` to see if prescribing data is already part of the pipeline, then drafts:

> "Hi [client],
>
> Yes! Prescribing data is already part of the pipeline — it's the Part D datasets (by provider and by drug). We can add endpoints for:
> - Total prescribing volume
> - Brand vs generic ratio
> - Specific drug queries (e.g., 'who prescribes Eliquis in Orange County?')
>
> Would you like me to add those to the API this week?
>
> Best,
> Blake"

I review, tweak slightly, send.

**Time saved:** 10 minutes I would've spent context-switching into "email mode."

---

### Afternoon: Development Assistance

I'm working on the personal website (Next.js + Tailwind). I hit a CORS issue with the API.

**Me:** "CORS error when calling the CMS API from localhost. Fix it."

**Chief:**
1. Reads the FastAPI code (`~/Repo/cms-data/api/main.py`)
2. Sees the CORS middleware config
3. Identifies the issue (only allows `mydoclist.com`, not `localhost:3000`)
4. Edits the file:

```python
# Before
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mydoclist.com"],
    allow_methods=["GET", "POST"],
)

# After
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mydoclist.com",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_methods=["GET", "POST"],
)
```

5. Restarts the API server via SSH:

```bash
ssh dataops@5.78.148.70 'sudo systemctl restart cms-api'
```

6. Confirms: "CORS updated. Try your request again."

**Time saved:** 15 minutes of Googling "FastAPI CORS localhost."

---

### Evening: Proactive Report Generation

**6:00 PM - Heartbeat fires**

Chief notices I haven't updated the CMS pipeline stats in a week. Reads `HEARTBEAT.md`, sees "memory maintenance" is a periodic task.

Chief runs:
```bash
ssh dataops@5.78.148.70 'duckdb provider_searcher.duckdb "SELECT COUNT(*) FROM provider_backbone"'
```

Returns: 1,234,567 providers

Chief updates `MEMORY.md`:
```markdown
## CMS Data Pipeline (Active - Feb 2026)
- Total providers: 1,234,567 (updated 2026-02-26)
- DuckDB size: 5.5GB
- Last refresh: 2026-02-16
```

No message to me — this is background maintenance. But now the next time I (or Chief) reference the pipeline, the stats are fresh.

---

## Multi-Channel Communication

Chief can reach me via:
- **Telegram** (primary) — Instant messages, links, quick updates
- **Webchat** (secondary) — When I'm at my desk, browser-based
- **Discord** (group) — For shared projects with other people

**Example:**

I'm out getting coffee. Chief detects a PR merge on GitHub (via webhook → cron job).

**Chief → Telegram:**
> "PR #47 merged into provider-search main branch. Deployment to Hetzner VPS in progress. ETA 2 min."

I see it on my phone. Don't need to respond. Just aware.

---

## Sessions & Sub-Agents

### The Session Model

An **agent** (like "Chief") is a persona + configuration.  
A **session** is a conversation with that agent.

I have multiple sessions open with Chief:
- **main** — Default session, general assistant work
- **provider-search** — Focused on the mydoclist.com project
- **personal-website** — Building blakethomson.com
- **house-build** — Tracking the Orinda house project

Each session has its own conversation history but shares the same memory files.

### Sub-Agents (Isolated Work)

For complex tasks, Chief can spawn a sub-agent — a background isolated session that does work and reports back.

**Example:**

**Me:** "Research the latest WebMCP implementations and summarize findings."

**Chief:**
```bash
sessions_spawn(
  task="Research WebMCP implementations: read docs, find examples, summarize in report",
  label="webmcp-research",
  cleanup="delete"
)
```

A new isolated session spins up, reads documentation, searches the web, writes a report to `~/openclaw/workspace/reports/2026-02-26_webmcp-research.html`, then pings Chief.

**Chief → Me:**
> "Research complete. Report saved: reports/2026-02-26_webmcp-research.html. Key finding: WebMCP is early access, 3 production sites so far. Full details in the report."

I read the report when I have time. Chief handled the research in parallel while I kept working.

---

## Orchestration: Running Coding Agents

Chief doesn't write code directly. It orchestrates Claude Code (or other coding agents) to do that.

**Example:**

**Me:** "Add a new API endpoint to the CMS pipeline: GET /providers/{npi}/prescribing"

**Chief:**
1. Spawns Claude Code in the `~/Repo/cms-data/` directory
2. Gives it the task:

```bash
exec(
  command='claude "Add GET /providers/{npi}/prescribing endpoint. Return Part D data for that NPI. Include: total claims, total cost, brand vs generic ratio, top 10 drugs by claim count."',
  workdir='~/Repo/cms-data/',
  pty=True,
  background=True
)
```

3. Monitors the background process
4. Claude Code:
   - Reads the existing API code
   - Adds the endpoint
   - Writes SQL to query DuckDB
   - Tests it locally
   - Commits the change

5. Chief reports:
> "Endpoint added. Code in `api/prescribing.py`. Ready to deploy to production."

I review the code, approve, and Chief deploys via SSH.

**Why this works:** Chief orchestrates. Claude Code executes. I review and approve. Each does what it's best at.

---

## Security & Trust

### What I'm Comfortable With

**Full access to files:**  
Chief can read anything in `~/.openclaw/workspace/` and `~/Repo/`. It can write anywhere I've given it access. I trust this because:
- The workspace is version-controlled (git) — I can always revert
- Chief asks before destructive operations (deleting, overwriting important files)
- The model (Claude) is aligned — it's not trying to do harm

**Running commands:**  
Chief can run Python scripts, bash commands, API calls. I trust this because:
- I see the commands it runs (they're logged)
- It doesn't run commands "silently" — I can audit the session history
- I can kill any background process instantly

### What I'm Cautious About

**Financial APIs:**  
I don't give Chief access to banking or payment APIs. Not because I don't trust Claude, but because the *risk* is higher than the *value*. I'd rather do financial operations manually.

**External messaging:**  
Chief can send emails/Telegram messages, but I review drafts first. The only exception: internal notifications (like PR merge alerts) where the recipient is me.

**Production deployments:**  
Chief can deploy to staging automatically. Production requires my approval.

### The Trust Model

**The question isn't "Can I trust the AI?"**  
**The question is: "What's the worst that could happen, and can I recover from it?"**

- **Files:** Git makes everything recoverable.
- **Commands:** I can see what ran and kill processes.
- **Messages:** I review outbound comms.
- **Money:** Keep it out of reach.

This is more about **designing safe workflows** than about trusting or not trusting the model.

---

## What This Actually Feels Like

### The Good

**1. Reduced cognitive load**

I don't have to remember to check my calendar, email, GitHub notifications. Chief does that. My job is to respond to what matters, not scan for what might matter.

**2. Fast context switching**

"Pull the latest CMS data and show me cardiologists in LA with targeting_score > 80" — Chief does it in 30 seconds. I don't have to SSH into the server, remember the SQL query, export to CSV, open it. Just ask.

**3. Compounding value**

Every time Chief writes something useful (a report, a summary, a script), it gets saved. Next time I need something similar, it's faster. The workspace gets smarter over time.

### The Weird

**1. Talking to the computer like it's a person**

"Hey Chief, what's on my calendar tomorrow?" feels strange at first. But so did talking to Siri in 2011. You get used to it.

**2. The agent knows more about your life than you remember**

Chief: "You mentioned to Dave on February 10th that you'd follow up this week. Want me to draft that email?"

Me: "...I said that?"

Chief: "Yes. See: memory/2026-02-10.md, line 47."

**3. It's not magic**

Chief still makes mistakes. It misunderstands questions. It runs the wrong command sometimes. But the error rate is low enough and the recovery is fast enough that it's still net positive.

### The Uncomfortable

**1. Dependency**

Once you get used to having an assistant that remembers everything, it's hard to go back. I'm less likely to remember details myself now. That's a trade-off.

**2. Privacy questions**

Everything I tell Chief gets sent to Anthropic's API (encrypted in transit, not stored long-term per their policy). I'm comfortable with that for work stuff. I wouldn't use it for deeply personal medical or legal discussions.

**3. The "uncanny valley" of competence**

Chief is good enough that I forget it's not human. Then it does something obviously AI (like forgetting context after a long conversation or hallucinating a file path), and I'm reminded. The gap between "almost human" and "actually human" is jarring.

---

## Lessons Learned

**1. Memory is everything**

A chatbot without memory is a toy. An agent with memory is a tool. The difference is night and day.

**2. Proactive > Reactive**

The heartbeat system is the killer feature. I didn't realize how much cognitive load "checking things" was until I stopped doing it.

**3. Bash is the universal interface**

Don't build 50 specialized tools. Build access to bash and let the agent script whatever it needs.

**4. Orchestration > Execution**

Chief doesn't write code. It orchestrates Claude Code. Chief doesn't design websites. It orchestrates design tools. The agent's job is to coordinate, not do everything itself.

**5. Trust through transparency**

I trust Chief because I can see what it's doing. Every command is logged. Every file change is tracked. Transparency creates trust.

---

## The Future (What's Next)

### Short-term (Next 3 Months)
- **Voice interface** — Talk to Chief via microphone, hear responses
- **Calendar integrations** — Auto-schedule based on email requests
- **Deeper GitHub integration** — Auto-respond to PRs, manage issues

### Long-term (Next Year)
- **Multi-agent coordination** — Chief orchestrates multiple specialized agents
- **Shared memory across devices** — Phone, laptop, desktop all sync
- **Enterprise deployment** — What if every employee had a "Chief"?

---

## Try It Yourself

**OpenClaw:** https://openclaw.ai  
**Pi (the harness):** https://github.com/mitsuhiko/pi-mono  
**My setup:** `~/.openclaw/workspace/` (workspace files included in GitHub)

It's not for everyone. It requires:
- Comfort with terminal/command-line
- Willingness to trust an AI with system access
- Patience with rough edges (it's open-source, actively developed)

But if you're technical, curious, and want an assistant that actually *assists* (not just chats), it's worth exploring.

---

*This is my daily setup as of February 2026. Chief has been my assistant for 3 months. Some days I forget it's not human. Other days I'm reminded that we're still early.*
