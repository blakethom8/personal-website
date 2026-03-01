# Agent Patterns: How OpenClaw Navigates Across Systems

## What Makes an "Agent" Different from a "Chatbot"

A chatbot answers questions. An agent **takes actions**. The fundamental difference is the loop:

- **Chatbot**: User asks → Model responds → Done
- **Agent**: User asks → Model reasons → Model calls tool → Observes result → Reasons again → Calls another tool → ... → Responds when done

OpenClaw is an agent framework. It doesn't just answer "how would I check my email" — it checks your email, processes the results, and builds you a report. Understanding how it achieves this requires understanding three patterns: the session lifecycle, the skills system, and cross-system navigation.

---

## Pattern 1: The Session Lifecycle

### Session Start: Boot Sequence

Every OpenClaw session follows a consistent boot sequence:

```
1. Load configuration (openclaw.json)
   ├── Model selection (claude-sonnet-4-5 with fallbacks)
   ├── Gateway config (localhost:18789)
   ├── Channel config (Telegram, etc.)
   └── Context pruning settings (cache-TTL, 1hr)

2. Read bootstrap context files
   ├── SOUL.md (identity)
   ├── USER.md (user profile)
   ├── WORK.md (professional context)
   ├── PERSONAL.md (personal context)
   ├── AGENTS.md (operating procedures)
   ├── TOOLS.md (capabilities)
   └── HEARTBEAT.md (periodic tasks)

3. Assemble system prompt
   ├── Base prompt
   ├── Skills manifest
   ├── Bootstrap context
   └── Per-run overrides (channel, task-specific)

4. Ready for interaction
```

At this point, the agent knows:
- Who it is and how to behave
- Who the user is and their preferences
- What projects exist and their status
- What tools and APIs are available
- What tasks are pending

### Mid-Session: The Agent Loop

The core execution loop handles each user message:

```
User Message
    │
    ▼
┌─────────────┐
│  Reasoning   │ ← Model decides what to do
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────────┐
│ Tool Call?   │────▶│ Execute Tool      │
│             │ Yes │ (Read/Write/Edit/ │
└──────┬──────┘     │  Bash)            │
       │ No         └────────┬─────────┘
       │                     │
       ▼                     ▼
┌─────────────┐     ┌──────────────────┐
│ Respond to  │     │ Observe Result    │
│ User        │     │ Feed back to LLM  │
└─────────────┘     └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ More tools       │
                    │ needed?          │
                    └────────┬─────────┘
                        Yes  │  No
                        │    │
                        ▼    ▼
                    (loop)  (respond)
```

Key properties:
- **No predetermined execution plan** — the model decides the next step based on the previous result
- **Streaming** — partial results are visible in real time
- **Adaptive** — if a tool fails, the model can try a different approach
- **Chained** — complex tasks emerge from sequences of simple tool calls

### Session End: Memory Persistence

When a session ends (or approaches context limits):

1. Memory flush triggers (writes important context to daily log)
2. Context state is saved for potential session resume
3. Any modified workspace files persist for future sessions

---

## Pattern 2: The Skills System

### What Skills Are

Skills are **Markdown files that teach the agent new capabilities**. They don't add new tools — they add new knowledge about how to use existing tools.

```
~/clawd/skills/
├── google-calendar/
│   └── SKILL.md    → How to interact with Google Calendar via API
├── email-summary/
│   └── SKILL.md    → How to fetch, filter, and summarize emails
├── youtube-download/
│   └── SKILL.md    → How to download and process YouTube videos
└── web-research/
    └── SKILL.md    → How to perform structured web research
```

A SKILL.md file contains:
- **Natural language instructions** — "To check Google Calendar, use the `gcalcli` CLI tool..."
- **Examples** — "When the user asks for today's schedule, run `gcalcli agenda`..."
- **Configuration** — API endpoints, required credentials, expected formats
- **Error handling** — "If authentication fails, run `gcalcli init`..."

### Why Markdown Skills Are Powerful

This is one of OpenClaw's most elegant patterns. Instead of writing code for each integration:

1. **Anyone can write a skill** — it's just instructions in English
2. **The LLM generalizes** — skills don't need to cover every edge case because the model can improvise
3. **Skills compose** — a "daily briefing" skill can reference the calendar skill, weather skill, and email skill
4. **5,400+ community skills** — massive ecosystem because the barrier to contribution is so low

### How Skills Load at Runtime

```
Session Start
    → Scan skill directories
    → Read each SKILL.md
    → Compile into skills prompt (compact summary)
    → Inject into system context
    → Agent now "knows" these capabilities
```

Skills don't add new tool definitions to the API. They add **knowledge to the system prompt** about how to use the four existing tools (Read, Write, Edit, Bash) to achieve specific goals.

---

## Pattern 3: Cross-System Navigation

This is where OpenClaw's architecture really shines. Let's trace through two real-world examples.

### Example 1: "Review my emails and create a report"

```
User: "Review my emails from today and create a summary report"

┌─── Agent Reasoning ─────────────────────────────────┐
│ I need to:                                           │
│ 1. Access the user's email (check TOOLS.md for how) │
│ 2. Filter for today's emails                         │
│ 3. Read and categorize them                          │
│ 4. Generate a structured report                      │
│ 5. Save it somewhere useful                          │
└─────────────────────────────────────────────────────┘

Step 1: Check available tools
    → Read TOOLS.md
    → Finds: Gmail API access via `gmail-cli` or Python script

Step 2: Fetch today's emails
    → Bash: `gmail-cli list --after today --format json`
    → Result: JSON array of 23 emails with subject, sender, snippet

Step 3: Read important emails in detail
    → Bash: `gmail-cli read <id1> --format text` (from the boss)
    → Bash: `gmail-cli read <id2> --format text` (project update)
    → Bash: `gmail-cli read <id3> --format text` (client feedback)
    (Agent selects which emails warrant full reading based on subjects/senders)

Step 4: Generate report
    → The LLM synthesizes all email content into a structured report
    → Categories: Action Required, FYI, Newsletters, Spam

Step 5: Save report
    → Write: `workspace/reports/email-summary-2026-03-01.md`
    → Also appends key items to TODO.md if action required

Step 6: Respond to user
    → "Here's your email summary for today: [report preview]
        3 emails need action, 8 are FYI, 12 are newsletters.
        Full report saved to workspace/reports/."
```

**Key insight**: The agent crossed from messaging platform → email system → filesystem → task management, all using Bash + Read + Write. No email plugin. No task management integration. Just tool composition.

### Example 2: "Download this YouTube video and make a report"

```
User: "Download https://youtube.com/watch?v=abc123 and summarize the key points"

┌─── Agent Reasoning ─────────────────────────────────┐
│ I need to:                                           │
│ 1. Download the video                                │
│ 2. Extract the audio/transcript                      │
│ 3. Summarize the content                             │
│ 4. Create a structured report                        │
└─────────────────────────────────────────────────────┘

Step 1: Download video
    → Bash: `yt-dlp "https://youtube.com/watch?v=abc123" -o "video.mp4"`
    → Result: Video downloaded (or error if yt-dlp not installed)

    [If yt-dlp not installed]
    → Bash: `pip install yt-dlp`
    → Bash: `yt-dlp "https://youtube.com/watch?v=abc123" -o "video.mp4"`

Step 2: Get transcript (multiple strategies)
    Strategy A — YouTube captions:
    → Bash: `yt-dlp --write-auto-subs --sub-lang en --skip-download "https://..." -o "subs"`
    → If captions available → Read subtitle file

    Strategy B — Audio transcription:
    → Bash: `whisper video.mp4 --model base --output_format txt`
    → Read transcript file

    Strategy C — If whisper not available:
    → Bash: `pip install openai-whisper`
    → Retry transcription

Step 3: Process transcript
    → Read: transcript.txt
    → LLM processes the full text, identifying:
       - Main topics and arguments
       - Key quotes and data points
       - Actionable insights
       - Timeline of topics discussed

Step 4: Generate report
    → Write: `workspace/reports/youtube-summary-abc123.md`

    Report structure:
    - Video metadata (title, channel, duration, date)
    - Executive summary (3-4 sentences)
    - Key points (bulleted list)
    - Detailed notes by topic
    - Notable quotes
    - Related links/references mentioned

Step 5: Respond
    → "Here's the summary of [Video Title] by [Channel Name]:
        [Executive summary]

        Key points:
        - [Point 1]
        - [Point 2]
        - [Point 3]

        Full report saved to workspace/reports/"
```

**Key insight**: The agent navigated YouTube → filesystem → audio processing → text analysis → report generation. It also handled missing dependencies by installing them. The agent's adaptability means it doesn't fail when a tool isn't installed — it installs it.

### Example 3: Multi-System Orchestration

```
User: "Check if any of my healthcare research patients have
       new claims data, then update the Notion tracker"

Step 1: Read project context
    → Read: WORK.md (find healthcare research project details)
    → Read: workspace/Repo/provider-search/TODO.md (current tasks)

Step 2: Query claims database
    → Bash: `curl -H "Authorization: Bearer $TOKEN" \
             https://api.claims-data.com/v1/patients?updated_since=2026-02-28`
    → Result: 4 patients with new claims

Step 3: Process each patient
    → For each patient:
        → Bash: `curl https://api.claims-data.com/v1/patients/{id}/claims`
        → Parse and analyze new claims

Step 4: Update Notion tracker
    → Bash: `curl -X PATCH https://api.notion.com/v1/pages/{page_id} \
             -H "Authorization: Bearer $NOTION_TOKEN" \
             -d '{"properties": {"Status": "Updated", ...}}'`

Step 5: Update memory
    → Edit: memory/2026-03-01.md (append update log)
    → Edit: TODO.md (mark task complete)

Step 6: Respond
    → "Updated 4 patient records with new claims data.
        Notion tracker updated. Key findings: [summary]"
```

**Key insight**: Claims API → data processing → Notion API → filesystem memory — all through Bash (curl) + Read + Write.

---

## The Gateway: How External Systems Reach OpenClaw

OpenClaw runs a local HTTP gateway (port 18789 by default) that enables external systems to trigger the agent:

```
External Event (webhook, cron, API call)
    → HTTP POST to localhost:18789
    → Gateway authenticates (token)
    → Routes to agent session
    → Agent processes and responds
```

This is how Telegram messages, cron jobs, and other external triggers reach the agent without the agent polling constantly.

---

## Agent Concurrency Model

OpenClaw supports multiple concurrent agent instances:

| Instance Type | Purpose | Concurrency |
|--------------|---------|-------------|
| Main agent | Interactive user session | 1 |
| Subagents | Parallel task execution | Up to 8 |
| Cron agents | Scheduled background work | Separate from interactive |

The main agent can spawn subagents for parallelizable work (e.g., "research three competitors simultaneously"), while cron agents handle periodic tasks independently.

---

## Comparison: Cross-System Navigation Approaches

### OpenClaw
- **Bash-first**: Use CLI tools and `curl` for everything
- **Skills as knowledge**: Markdown files teach the agent about APIs
- **Adaptive**: Install missing tools, handle errors, try alternative approaches
- **Gateway for inbound**: HTTP endpoint for webhooks and triggers

### Claude Code (with MCP)
- **MCP protocol**: Structured tool servers for external services
- **Rich integrations**: Figma, Notion, Chrome browser, databases
- **Type-safe**: Tool inputs/outputs are schema-defined
- **Sandboxed**: Permission prompts for dangerous operations

### NanoClaw
- **Container-isolated**: Each agent runs in its own container
- **IPC for host access**: JSON files for container-to-host communication
- **Restricted by default**: Non-main groups have limited capabilities
- **Agent swarms**: Multiple isolated agents collaborating

### The Tradeoff Spectrum

```
More Structure / Safety ◄──────────────────────► More Flexibility / Power

NanoClaw          Claude Code          OpenClaw
(Container       (MCP + Permissions)   (Bash + Skills,
 isolation,                             minimal
 IPC only)                              constraints)
```

---

## Key Takeaway

OpenClaw's agent patterns are built on a simple but powerful idea: **give a capable LLM access to a shell, teach it about your systems through Markdown files, and let it figure out the rest**. The agent loop, streaming execution, and chaining behavior emerge from just four tools composed by the model's reasoning.

What makes this work isn't the technology — it's the trust model. OpenClaw trusts the LLM to reason through multi-step workflows, install missing tools, handle errors gracefully, and compose operations across systems. This produces remarkable flexibility but requires careful consideration of security boundaries — which is exactly what NanoClaw was built to address.
