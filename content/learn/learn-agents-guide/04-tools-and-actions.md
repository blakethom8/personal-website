# Module 4: Tools & Actions

**How AI agents interact with the real world — the "claws" that turn a chatbot into something useful.**

---

## The Limitation

By now you understand that an LLM can only do one thing: take text in, produce text out. It can't check your email. It can't search a database. It can't book a meeting. It can't read a file on your computer. Without tools, the smartest model in the world is stuck inside a text box.

**Tools are what break it out.**

A tool is a function that the harness makes available to the model. When the model determines it needs real-world information or needs to take an action, it requests a tool call. The harness executes it and sends the result back. We saw this briefly in Module 2 — now let's go deep.

---

## A Day in the Life of a CRM Agent

To make tools concrete, let's follow a realistic example. Imagine a sales team at a healthcare company uses an AI-powered CRM assistant. The assistant has tools that connect it to their systems.

Here are the tools available to this agent:

```
┌──────────────────────────────────────────────────────┐
│           CRM AGENT — AVAILABLE TOOLS                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📇 search_contacts                                  │
│     Search the CRM for contacts by name, company,    │
│     specialty, or location                           │
│                                                      │
│  📋 get_contact_details                              │
│     Pull full profile for a specific contact          │
│                                                      │
│  📊 get_recent_activity                              │
│     Show recent interactions, meetings, emails        │
│     for a contact or account                         │
│                                                      │
│  📅 check_calendar                                   │
│     View upcoming meetings and availability           │
│                                                      │
│  ✉️  send_email                                       │
│     Draft and send an email                          │
│                                                      │
│  📝 create_task                                      │
│     Add a follow-up task to the CRM                  │
│                                                      │
│  🔍 search_web                                       │
│     Search the internet for public information        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Now watch what happens when a sales rep asks: *"I have a meeting with Dr. Patel tomorrow. Give me a prep brief."*

```
┌──────────────────────────────────────────────────────┐
│           TOOL CALLS IN ACTION                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  USER: "I have a meeting with Dr. Patel tomorrow.    │
│         Give me a prep brief."                       │
│                                                      │
│  ── Turn 1: Model thinks ──                          │
│  "I need to find Dr. Patel in the CRM, check         │
│   recent activity, and see what's on the calendar."  │
│                                                      │
│  TOOL CALL: search_contacts(name: "Dr. Patel")      │
│  RESULT: Found — Dr. Anita Patel, Cardiology,       │
│          Cedars-Sinai, ID: 4829                      │
│                                                      │
│  ── Turn 2: Model needs more info ──                 │
│  TOOL CALL: get_contact_details(id: 4829)            │
│  RESULT: Last meeting: Jan 15. Notes: "Interested    │
│          in data analytics platform. Wants to see    │
│          demo of provider search tool."              │
│                                                      │
│  TOOL CALL: get_recent_activity(id: 4829)            │
│  RESULT: Feb 10 — Opened proposal email.             │
│          Feb 18 — Visited pricing page (2 min).      │
│          Feb 22 — Downloaded case study PDF.          │
│                                                      │
│  ── Turn 3: Model composes the brief ──              │
│                                                      │
│  "Here's your prep brief for Dr. Anita Patel:        │
│                                                      │
│   👤 Cardiologist at Cedars-Sinai                    │
│   📅 Last meeting: Jan 15 — showed interest in       │
│      data analytics, wanted a demo                   │
│   📊 Recent signals:                                 │
│      • Opened your proposal email (Feb 10)           │
│      • Browsed pricing page (Feb 18)                 │
│      • Downloaded the cardiology case study (Feb 22) │
│                                                      │
│   💡 Recommendation: She's been actively engaging    │
│      with your materials. Come prepared with the     │
│      demo she requested and reference the case       │
│      study she downloaded — she's done her           │
│      homework."                                      │
│                                                      │
│  Model calls: 3                                      │
│  Tool executions: 3                                  │
│  Time: ~4 seconds                                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Three tool calls. Four seconds. The rep walks into that meeting prepared in a way that would have taken 20 minutes of manual CRM clicking.

---

## How Tools Are Defined

The model doesn't magically know what tools exist. The harness tells it — in the same structured message format we covered in Module 2. Each tool is described with:

1. **A name** — what to call it
2. **A description** — what it does (in plain language the model can understand)
3. **Parameters** — what inputs it needs

Here's how the `search_contacts` tool gets defined:

```
┌──────────────────────────────────────────────────────┐
│              TOOL DEFINITION                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Name: search_contacts                               │
│                                                      │
│  Description:                                        │
│  "Search the CRM database for contacts. Can search   │
│   by name, company, specialty, or location.          │
│   Returns matching contacts with basic info."        │
│                                                      │
│  Parameters:                                         │
│    • name (text, optional) — Contact name            │
│    • company (text, optional) — Organization         │
│    • specialty (text, optional) — Medical specialty  │
│    • location (text, optional) — City or region      │
│    • limit (number, optional) — Max results          │
│                                                      │
│  The model reads this definition and decides          │
│  when and how to use the tool based on the           │
│  user's request.                                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

The key insight: **the model chooses which tool to use based on the description.** If you write a clear description, the model will use the tool correctly. If the description is vague, the model might misuse it or ignore it.

This is why building good tools is as much about clear writing as it is about code.

---

## Basic Tools vs. Purpose-Built Tools

Tools exist on a spectrum from general to specialized:

### Basic Tools — The Swiss Army Knife

Some tools are general-purpose and compose into almost anything:

```
┌──────────────────────────────────────────────────────┐
│              BASIC TOOLS                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📖 read     — Read any file                         │
│  ✍️  write    — Create or modify any file             │
│  ⚡ exec     — Run any terminal command              │
│  🔍 search   — Search the web                        │
│  🌐 browser  — Control a web browser                 │
│                                                      │
│  With JUST these five tools, an agent can:           │
│                                                      │
│  • Write and edit code                               │
│  • Query databases (via terminal)                    │
│  • Send emails (via terminal)                        │
│  • Install software                                  │
│  • Manage files and folders                          │
│  • Browse websites                                   │
│  • Deploy applications                               │
│  • ... basically anything a human can do             │
│    on a computer                                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

There's a philosophy in agent design that says **"bash is all you need"** — give the model a terminal and file access, and it can figure out the rest. You don't need a dedicated "send email" tool when `exec` can run a command that sends email.

This is how coding agents like Claude Code and OpenClaw work. A small set of powerful, composable tools that handle nearly anything.

### Purpose-Built Tools — The Power Drill

For business applications, you often want tools that do one thing well:

```
┌──────────────────────────────────────────────────────┐
│           PURPOSE-BUILT TOOLS                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  For a healthcare CRM:                               │
│    📇 search_contacts — Search the CRM               │
│    📊 get_referral_patterns — Show referral data      │
│    💊 check_formulary — Look up drug coverage         │
│    📈 generate_market_report — Create analytics       │
│                                                      │
│  For an HR assistant:                                │
│    📋 lookup_policy — Search company policies         │
│    🏖️  check_pto_balance — Get remaining PTO          │
│    📝 submit_request — File an HR request             │
│    📅 find_open_enrollment — Benefits deadlines       │
│                                                      │
│  For a financial analyst:                            │
│    📊 query_financials — Pull financial data          │
│    📈 run_forecast — Generate projections             │
│    📑 get_filings — Retrieve SEC filings              │
│    🔄 compare_periods — Year-over-year analysis       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Purpose-built tools are **safer** (limited scope), **faster** (direct database queries vs. terminal commands), and **easier for the model to use correctly** (clear, specific descriptions).

Most production agents use a combination: basic tools for flexibility, purpose-built tools for core workflows.

---

## MCP: The Universal Connector

Here's a practical problem: every agent platform used to define tools differently. Tools built for LangChain didn't work with OpenClaw. Tools built for ChatGPT's plugins didn't work with Claude. Building tools meant locking into one platform.

**MCP (Model Context Protocol)** solves this. It's an open standard — a shared language for defining tools that any compatible agent can use.

```
┌──────────────────────────────────────────────────────┐
│              MCP — THE UNIVERSAL ADAPTER              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Before MCP:                                         │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     │
│  │ Agent A  │────▶│ Tool     │     │ Agent B  │     │
│  │          │     │ (format A)│     │          │     │
│  └──────────┘     └──────────┘     └──────────┘     │
│                                     Can't use it! ❌ │
│                                                      │
│  With MCP:                                           │
│  ┌──────────┐                      ┌──────────┐     │
│  │ Agent A  │──┐                ┌──│ Agent B  │     │
│  └──────────┘  │  ┌──────────┐ │  └──────────┘     │
│                ├─▶│ MCP Tool │◀┤                     │
│  ┌──────────┐  │  │ Server   │ │  ┌──────────┐     │
│  │ Agent C  │──┘  └──────────┘ └──│ Agent D  │     │
│  └──────────┘                     └──────────┘     │
│                                                      │
│  Build once, use everywhere. ✅                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Think of MCP like USB for AI tools. Before USB, every device had its own proprietary connector. USB gave us one standard plug that works everywhere. MCP does the same for AI tools.

### How MCP Works in Practice

An MCP server is a small program that:
1. **Exposes tools** — "Here are the things I can do"
2. **Accepts requests** — "Search for cardiologists in LA"
3. **Returns results** — "Found 47 matches, here they are"

Any MCP-compatible agent can connect to it and use those tools. For example:

- I build an MCP server that connects to a healthcare database
- Now **Claude Desktop** can query that database
- And **OpenClaw** can query that database
- And **any future MCP-compatible agent** can query that database
- Without changing a single line of the MCP server

This is a big deal for businesses. Build your tools once as MCP servers, and they work with whatever AI platform you (or your clients) choose to use.

---

## Tool Safety: The Guardrails

Giving an AI the ability to act in the real world raises obvious questions. What if it sends an email you didn't want? Deletes a file? Runs a dangerous command?

This is where the harness earns its name. Like a climbing harness that keeps you safe, the agent harness controls what the model can and can't do:

```
┌──────────────────────────────────────────────────────┐
│              TOOL SAFETY LAYERS                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Layer 1: Tool Availability                          │
│  The harness only registers tools the agent          │
│  should have. No email tool = can't send email.      │
│  Simple but effective.                               │
│                                                      │
│  Layer 2: Parameter Validation                       │
│  Before executing, the harness checks: are the       │
│  inputs valid? Is the SQL query read-only? Is        │
│  the file path within allowed directories?           │
│                                                      │
│  Layer 3: Confirmation Gates                         │
│  For sensitive actions (sending messages, deleting   │
│  files, spending money), require human approval      │
│  before executing.                                   │
│                                                      │
│  Layer 4: Audit Logging                              │
│  Every tool call gets logged — what was requested,   │
│  what was executed, what was returned. Full           │
│  accountability trail.                               │
│                                                      │
│  ┌─────────────────────────────────────────────┐     │
│  │  Model: "I want to delete all files"        │     │
│  │  Harness: "That requires confirmation." 🛑  │     │
│  │  User: [Approve / Deny]                     │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  The model proposes. The harness disposes.            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Remember: the model never executes tools directly. It generates text requesting a tool call. The harness is regular software with full control over whether to actually execute it. This separation is the foundation of AI safety in agentic systems.

---

## Tools in the Wild: Real Examples

To ground this further, here's what tools look like across different AI products you may have encountered:

### ChatGPT
- **Web browsing** — searches the internet for current information
- **Code interpreter** — runs Python code in a sandbox
- **DALL-E** — generates images from descriptions
- **File analysis** — reads uploaded documents

### Claude Desktop (with MCP)
- **File system** — reads and writes files on your computer
- **Web search** — searches the internet
- **Custom MCP servers** — whatever tools you connect (databases, APIs, internal systems)

### A Custom Business Agent
- **CRM queries** — search contacts, accounts, opportunities
- **Document generation** — create proposals, reports, summaries
- **Database access** — query internal data warehouses
- **Calendar management** — check availability, book meetings
- **Email integration** — draft and send communications

### Coding Agents (Claude Code, Copilot)
- **File read/write/edit** — modify source code
- **Terminal execution** — run builds, tests, deployments
- **Web search** — look up documentation
- **Browser** — check running applications

The tools define the agent's capabilities. Same model, different tools = completely different agent.

---

## Key Takeaways

1. **Tools are how agents act** — without tools, a model can only generate text
2. **The model requests, the harness executes** — the model never directly runs tools; it asks, and the harness decides
3. **Tools range from basic to specialized** — composable basics (read, write, exec) vs. purpose-built (search_contacts, query_claims)
4. **MCP standardizes tools** — build once, use with any compatible agent (like USB for AI)
5. **Safety comes from the harness** — tool availability, validation, confirmation gates, and audit logs
6. **Tools define the product** — the same model with different tools creates fundamentally different experiences

Tools are what make the car go somewhere. The engine generates power (text). The tools are the wheels, steering, and transmission that translate that power into motion. And the harness is the driver, deciding when to accelerate, brake, or turn.

---

**Next up:** [Module 5 — Agentic Patterns →](./05-agentic-patterns.md)

You now understand all the components. Next, we'll see how they compose into strategies — the patterns that separate a simple chatbot from a truly autonomous agent.
