---
title: "AI Agents Explained: A 5-Step Guide"
description: "How AI agents actually work — from JSON messages to autonomous systems. For colleagues, clients, and family who need to understand what you're building."
author: Blake Thomson
date: 2026-02-26
duration: "20 min"
difficulty: "Beginner"
tags: ["agents", "systems", "architecture", "learning"]
---

# AI Agents Explained: A 5-Step Guide

**For:** Colleagues, clients, family — anyone who needs to understand what an "AI agent" actually is.

**Not about:** How models are trained, transformer architecture, or deep learning math.

**About:** The systems, harnesses, tools, and architecture that turn an LLM into an agent that takes action.

---

## Why This Guide Exists

When I tell people "I build AI agents," they think ChatGPT. But ChatGPT is just the engine. An agent is the entire car — engine + steering + brakes + GPS. It's the **system around the model** that makes it useful.

This guide walks through the 5 core components:

1. **The Message Format (JSON)** — How you actually talk to an AI
2. **The Agent Loop** — How it thinks, acts, and repeats
3. **Tools & Function Calling** — How it interacts with the real world
4. **Memory & Context** — How it remembers (and forgets)
5. **The Harness** — The system that orchestrates everything

By the end, you'll understand exactly what I'm building — and why it matters.

---

## Step 1: The Message Format (JSON)

**Core concept:** You don't "chat" with an LLM. You send structured data packets.

### What a Chat Request Actually Looks Like

When you type into ChatGPT, your browser sends something like this to OpenAI's servers:

```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "What's the capital of France?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150
}
```

That's it. A JSON object with:
- **model**: Which AI to use
- **messages**: The conversation history
- **temperature**: How creative (0 = predictable, 1 = creative)
- **max_tokens**: Maximum response length

The API sends back:

```json
{
  "id": "chatcmpl-abc123",
  "model": "gpt-4",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      }
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 8,
    "total_tokens": 23
  }
}
```

### Why This Matters

**This is the entire interface.** All of AI — ChatGPT, Claude, Copilot, every agent — is built on top of sending JSON messages to an API.

Understanding this structure is the first step to understanding agents. Everything else is layers on top of this basic request/response pattern.

### Terminal Example

```bash
# Send a request to Claude API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 100,
    "messages": [
      {"role": "user", "content": "Explain AI agents in one sentence."}
    ]
  }'
```

### Prompt for Deeper Dive

> "Explain the structure of an LLM API request in detail. What are tokens? Why does the API charge per token? What's the difference between prompt_tokens and completion_tokens?"

---

## Step 2: The Agent Loop (Think → Act → Observe)

**Core concept:** An agent isn't a single API call. It's a loop.

### The Basic Agent Pattern

```
┌─────────────────────────────────────────────────┐
│              THE AGENT LOOP                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. THINK    → "What should I do next?"         │
│  2. ACT      → Use a tool or respond            │
│  3. OBSERVE  → See the result                   │
│  4. REPEAT   → Loop until task complete         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Example: "Check the weather in Paris"

**Turn 1 (Think):**
- Agent: "I need to look up the weather. I have a `get_weather` tool."

**Turn 2 (Act):**
- Agent calls: `get_weather(location="Paris")`

**Turn 3 (Observe):**
- Tool returns: `{"temp": 12, "condition": "cloudy", "unit": "celsius"}`

**Turn 4 (Respond):**
- Agent: "It's 12°C and cloudy in Paris."

This is **4 API calls**, not one. Each step is a separate request/response.

### Why ChatGPT Feels Different

ChatGPT (basic version) doesn't loop — it responds once and stops. That's why it can't:
- Search the web (no tool access)
- Read your files (no file system access)
- Run code (no execution environment)

An **agent** has tools and loops until the task is done.

### What This Looks Like in Practice

Here's a real sequence for "Create a report on Q4 sales":

```
Turn 1:  [Agent]  "I need to query the database for Q4 sales data."
Turn 2:  [Tool]   sql_query("SELECT * FROM sales WHERE quarter='Q4'")
Turn 3:  [Result] {...3,847 rows of data...}
Turn 4:  [Agent]  "Now I'll calculate the totals and trends."
Turn 5:  [Tool]   python_execute("pandas dataframe analysis...")
Turn 6:  [Result] {"total": "$1.2M", "growth": "+15%", ...}
Turn 7:  [Agent]  "I'll create a chart visualization."
Turn 8:  [Tool]   generate_chart(data=..., type="bar")
Turn 9:  [Result] "chart.png saved"
Turn 10: [Agent]  "Here's your Q4 sales report: ..."
```

**10 turns. One task.**

### Terminal Example

```bash
# Run an agent task (conceptual — actual syntax varies)
agent run "Find all PDFs in ~/Documents and summarize them"

# The agent will:
# 1. List files in ~/Documents
# 2. Filter for .pdf files
# 3. Read each PDF
# 4. Summarize content
# 5. Compile final report

# Each step is a separate "think → act → observe" cycle
```

### Prompt for Deeper Dive

> "Walk me through the agent loop in more detail. How does the agent decide which tool to use? What happens if a tool fails? How does it know when to stop looping?"

---

## Step 3: Tools & Function Calling

**Core concept:** Tools are how agents interact with the real world.

### What Is a Tool?

A tool is a function the agent can call. Examples:
- `search_web(query)` — Search Google
- `read_file(path)` — Read a file
- `send_email(to, subject, body)` — Send an email
- `query_database(sql)` — Run SQL query
- `create_chart(data, type)` — Generate visualization

**Without tools, an LLM can only generate text.**

**With tools, it becomes an agent that can:**
- Access real-time data
- Manipulate files
- Control applications
- Interact with APIs
- Execute code

### How Tool Calling Works

You define tools in your API request:

```json
{
  "model": "claude-sonnet-4",
  "messages": [
    {"role": "user", "content": "What's the weather in NYC?"}
  ],
  "tools": [
    {
      "name": "get_weather",
      "description": "Get current weather for a location",
      "input_schema": {
        "type": "object",
        "properties": {
          "location": {"type": "string"},
          "units": {"type": "string", "enum": ["celsius", "fahrenheit"]}
        },
        "required": ["location"]
      }
    }
  ]
}
```

The model responds:

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "tool_use",
      "name": "get_weather",
      "input": {
        "location": "New York City",
        "units": "fahrenheit"
      }
    }
  ]
}
```

**The model didn't execute the tool** — it just said "I want to use this tool with these parameters."

**Your code** executes the tool and sends the result back:

```json
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_abc123",
      "content": "{\"temp\": 68, \"condition\": \"sunny\"}"
    }
  ]
}
```

Then the agent loops again with the new information.

### MCP: The Universal Tool Protocol

**Problem:** Every agent system had different ways to define tools.

**Solution:** Model Context Protocol (MCP) — a standard for connecting tools to LLMs.

With MCP:
- Tools are defined once
- Any MCP-compatible agent can use them
- Tools can be servers (running separately)
- Connects LLMs to databases, APIs, applications

**Example:** I build an MCP server that connects to your CMS data. Any MCP agent (Claude Desktop, OpenClaw, etc.) can now query your data.

### Tools I Build for Healthcare Clients

- `search_providers(specialty, location)` — Find providers in network
- `get_referral_patterns(provider_id)` — Show referral relationships  
- `query_claims_data(sql)` — Run queries on Medicare claims
- `match_npi(name, address)` — Entity resolution (provider matching)
- `generate_market_report(geography, specialty)` — Create intelligence reports

These tools turn an LLM into a **business intelligence agent**.

### Terminal Example

```bash
# List available MCP tools
mcp tools list

# Call a tool manually (for testing)
mcp tools call search_providers \
  --specialty "cardiology" \
  --location "Los Angeles, CA"

# Returns: [... list of providers ...]
```

### Prompt for Deeper Dive

> "Explain MCP in more detail. How does an agent discover available tools? How are tools defined and registered? What's the difference between a tool and an API?"

---

## Step 4: Memory & Context (What Gets Remembered)

**Core concept:** The API is stateless. The agent system manages memory.

### The Context Window

Every API call includes the **full conversation history**:

```json
{
  "messages": [
    {"role": "user", "content": "What's 2+2?"},
    {"role": "assistant", "content": "4"},
    {"role": "user", "content": "What about 5+5?"},
    {"role": "assistant", "content": "10"},
    {"role": "user", "content": "What was my first question?"}
  ]
}
```

**All previous messages are resent every time.**

This is how the agent "remembers" — the entire conversation is in every request.

### Token Limits (The Forgetting Problem)

Models have a **context window** limit:
- GPT-4: 128K tokens (~96K words)
- Claude Sonnet: 200K tokens (~150K words)

When you hit the limit, **old messages get dropped**. The agent forgets.

### Memory Solutions

**Short-term (within session):**
- Full conversation history (until context limit)
- Tool results and observations

**Long-term (across sessions):**
- Files: `MEMORY.md`, daily logs
- Databases: Store facts, decisions, preferences
- Vector search: Semantic search over past conversations

**Example:** OpenClaw writes daily memory files:

```
~/.openclaw/workspace/memory/
├── 2026-02-26.md    ← Today's raw log
├── 2026-02-25.md    ← Yesterday
└── MEMORY.md        ← Curated long-term memory
```

Each session, the agent reads today + yesterday + MEMORY.md to "remember."

### Why Memory Architecture Matters

**Without memory:** The agent forgets you every session. Like memento.

**With memory:** The agent builds continuity. Learns preferences. Improves over time.

This is the difference between:
- "AI assistant" (starts fresh each time)
- "AI colleague" (remembers context and history)

### Terminal Example

```bash
# Show current context window usage
agent context status

# Output:
# Context: 45,234 / 200,000 tokens (23%)
# Messages: 87
# Oldest message: 2 hours ago

# Search memory for past decisions
agent memory search "deployment strategy"

# Returns: References to past conversations about deployment
```

### Prompt for Deeper Dive

> "How do agents manage memory when context windows are limited? What's the difference between short-term and long-term memory? How does vector search work for finding relevant past conversations?"

---

## Step 5: The Harness (Orchestrating Everything)

**Core concept:** The harness is the system that runs the agent loop, manages tools, and handles memory.

### What Is a Harness?

A harness is the code that:
1. Receives your request
2. Constructs the API call (with history, tools, system prompt)
3. Sends it to the LLM
4. Receives the response
5. Executes any tool calls
6. Loops until complete
7. Saves memory
8. Returns the result

**Examples of harnesses:**
- ChatGPT's web interface
- Claude Desktop app
- OpenClaw Gateway
- LangChain
- AutoGPT

**The model is the engine. The harness is the car.**

### What a Harness Handles

```
┌───────────────────────────────────────────────────┐
│           AGENT HARNESS ARCHITECTURE              │
├───────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────────┐                                 │
│  │   USER      │  "Build a report on Q4 sales"   │
│  └──────┬──────┘                                 │
│         │                                         │
│         ▼                                         │
│  ┌─────────────────────────────────┐             │
│  │        HARNESS                  │             │
│  │                                 │             │
│  │  • Load conversation history    │             │
│  │  • Add system prompt            │             │
│  │  • Register available tools     │             │
│  │  • Construct API request        │             │
│  │                                 │             │
│  └──────┬────────────────┬─────────┘             │
│         │                │                        │
│         ▼                ▼                        │
│  ┌───────────┐    ┌─────────────┐                │
│  │   LLM     │    │   TOOLS     │                │
│  │   API     │    │             │                │
│  │           │    │  • Database │                │
│  │  Claude   │    │  • Files    │                │
│  │  GPT-4    │    │  • Web      │                │
│  │  Gemini   │    │  • Email    │                │
│  └─────┬─────┘    └──────┬──────┘                │
│        │                 │                        │
│        └────────┬────────┘                        │
│                 │                                 │
│                 ▼                                 │
│         ┌───────────────┐                         │
│         │    MEMORY     │                         │
│         │               │                         │
│         │  • Session    │                         │
│         │  • Files      │                         │
│         │  • Database   │                         │
│         └───────────────┘                         │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Why the Harness Matters

**Bad harness:**
- Single-shot responses (no looping)
- No tool access
- No memory management
- No error handling

**Good harness:**
- Handles multi-turn conversations
- Manages tool execution safely
- Stores and retrieves memory
- Recovers from errors
- Logs everything for debugging

### Examples of Harnesses in the Wild

**OpenClaw:**
- Local harness running on your Mac
- Manages sessions with multiple agents
- Provides tools (browser, filesystem, exec, messaging)
- Memory stored in workspace files
- Can spawn sub-agents for parallel work

**Claude Desktop:**
- Desktop app harness
- MCP tool integration
- File system access
- Project-based memory

**Custom healthcare agent (what I build):**
- Azure-hosted harness
- Tools: CMS data, Supabase, Excel, web search
- Memory: Agent data catalog (knowledge base)
- Deployed in client's tenant (data never leaves)

### Terminal Example

```bash
# Start an agent session
openclaw start

# The harness is now running:
# - Listening for your messages
# - Managing conversation context
# - Ready to execute tools
# - Logging to session transcript

# Check harness status
openclaw status

# Output:
# Gateway: running
# Sessions: 1 active (main)
# Tools available: 47
# Memory: MEMORY.md + today's log loaded
```

### Prompt for Deeper Dive

> "What makes a good harness? How do you handle errors when tools fail? How do you prevent infinite loops? What's the difference between a harness and a framework like LangChain?"

---

## Putting It All Together

Now you understand the 5 layers:

1. **JSON Messages** — The interface to the LLM
2. **Agent Loop** — Think → Act → Observe → Repeat
3. **Tools** — How agents interact with the world
4. **Memory** — What gets remembered and how
5. **Harness** — The system orchestrating everything

**When I say "I build AI agents," this is what I mean:**

I build the harness, define the tools, architect the memory system, and design the agent loop — all customized for a specific business need (usually healthcare data intelligence).

The LLM is just the reasoning engine. The agent is the entire system.

---

## Real-World Example: Provider Search Agent

Let me show you how all 5 layers work together in a real system I built:

**User request:** "Find cardiologists in West LA who accept referrals from Cedars-Sinai"

**Step 1 (JSON):** Request sent to Claude with tools and conversation history

**Step 2 (Loop Turn 1):** Agent thinks: "I need to search Google Places for cardiologists"

**Step 3 (Tool Call):** `search_providers(specialty="cardiology", location="West LA")`

**Step 4 (Memory):** Agent remembers "Cedars-Sinai" from earlier in conversation

**Step 5 (Harness):** Orchestrates the tool call, receives 47 providers

**Loop Turn 2:** Agent thinks: "Now I need to check which ones have referral relationships"

**Tool Call:** `get_referral_patterns(provider_ids=[...])`

**Loop Turn 3:** Agent thinks: "I'll match these against NPI data for more details"

**Tool Call:** `match_npi(names_and_addresses=[...])`

**Final response:** "I found 12 cardiologists in West LA with active Cedars referral patterns. Here's the list..."

**All of this:**
- Happened in ~6 API calls (loop turns)
- Used 3 custom tools I built
- Leveraged memory (remembered Cedars from context)
- Orchestrated by the harness
- User just sees: natural conversation

---

## Why This Matters for Your Understanding

When evaluating AI solutions or understanding what I build:

**Don't ask:** "Which model do you use?"
**Ask:** 
- What tools does the agent have?
- How does it manage memory?
- What's the agent loop look like?
- How is the harness architected?
- Where does data live?

The model is commodity. The system is the differentiator.

---

## Next Steps

Now that you understand the architecture, you can:

1. **Ask better questions** about AI products and capabilities
2. **Understand trade-offs** (speed vs. accuracy, memory vs. cost)
3. **Evaluate vendors** (are they just wrapping ChatGPT, or building real agents?)
4. **Design use cases** (what tools would your agent need?)
5. **Understand my work** (I build harnesses + tools + memory systems)

Want to go deeper on any of these? Use the prompts scattered throughout — ask an LLM to explain further.

---

**Created by:** Blake Thomson  
**Purpose:** Explain AI agents to colleagues, clients, family  
**Focus:** Systems and architecture, not model training  
**Expand on flight:** Add examples, refine terminal commands, clarify concepts

---

## Expand This During Your Flight

### Sections to flesh out:
- [ ] Add more real-world healthcare examples
- [ ] Expand tool catalog (show actual tool definitions)
- [ ] Add diagrams for each step (ASCII art or simple flowcharts)
- [ ] Include failure scenarios (what happens when tools break?)
- [ ] Add cost analysis (tokens, API calls, pricing)
- [ ] Security considerations (tool permissions, data access)
- [ ] Comparison table: ChatGPT vs Claude Desktop vs Custom Agent

### Terminal interactions to add:
- [ ] Show actual curl commands for each step
- [ ] Include response examples for tool calls
- [ ] Add MCP server setup example
- [ ] Show memory search commands

### Deep dive prompts to include:
- "How do you prevent agents from getting stuck in loops?"
- "What's the difference between few-shot and zero-shot tool calling?"
- "How do you test and debug agent systems?"
- "What are the security risks of giving agents tool access?"
