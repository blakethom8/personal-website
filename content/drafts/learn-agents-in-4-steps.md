---
title: "LLMs & Agents in 4 Steps"
description: "How AI agents actually work — from autocomplete to autonomous assistant, explained without code jargon."
date: 2026-02-26
draft: true
tags: ["ai", "llm", "agents", "learning"]
---

# LLMs & Agents in 4 Steps

You've probably used ChatGPT, Claude, or Copilot. Maybe you've heard people say "AI agents" like it's something different. It is — but not in the way most people think.

This guide breaks down the entire AI agent stack in four steps. No programming experience required. By the end, you'll understand exactly what's happening when an AI assistant reads your files, searches the web, or writes code on your behalf.

Let's start with the engine that powers all of it.

---

## Step 1: The Model (World's Best Autocomplete)

Here's the most important thing to understand about Large Language Models: **they predict the next word.**

That's it. Not thinking. Not reasoning. Not understanding. Predicting.

When you type "The capital of France is ___", the model calculates that "Paris" is the most likely next word based on patterns it learned from billions of pages of text. It's autocomplete — just absurdly good autocomplete.

### How It Actually Works

An LLM was trained by reading enormous amounts of text — books, websites, code, conversations — and learning patterns. Not facts, exactly, but *statistical relationships between words*. After seeing millions of sentences, it learned that certain words tend to follow other words in certain contexts.

When you send a message, the model doesn't retrieve an answer from a database. It generates one, token by token (a token is roughly ¾ of a word), by repeatedly asking: "Given everything so far, what's the most likely next token?"

```
┌──────────────────────────────────────────────────────┐
│              HOW AN LLM GENERATES TEXT                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Input: "The best way to learn is"                   │
│                                                      │
│  Step 1: P("by")     = 0.35  ← highest              │
│          P("to")     = 0.25                          │
│          P("through")= 0.20                          │
│          P("from")   = 0.15                          │
│          ...                                         │
│                                                      │
│  Picks: "by"                                         │
│                                                      │
│  Step 2: "The best way to learn is by"               │
│          P("doing")   = 0.45  ← highest              │
│          P("reading") = 0.20                         │
│          P("practice")= 0.15                         │
│          ...                                         │
│                                                      │
│  Picks: "doing"                                      │
│                                                      │
│  Result: "The best way to learn is by doing"         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Temperature: The Creativity Dial

You might have heard of "temperature" in AI settings. It controls how adventurous the model is when picking the next word.

- **Temperature 0** → Always pick the most likely word. Consistent, predictable.
- **Temperature 1** → Sometimes pick less likely words. Creative, varied.
- **Temperature 2** → Frequently pick unlikely words. Wild, sometimes nonsensical.

Think of it like a chef. Temperature 0 is "follow the recipe exactly." Temperature 1 is "improvise a little." Temperature 2 is "throw random ingredients in and see what happens."

### What a Chat Request Actually Looks Like

When you type a message into ChatGPT, your app sends something like this to the AI company's servers:

```
┌──────────────────────────────────────────────────────┐
│                  YOUR MESSAGE                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  To: api.anthropic.com                               │
│                                                      │
│  Model: claude-sonnet                                │
│  Temperature: 0.7                                    │
│                                                      │
│  Messages:                                           │
│    [You]: "What's the tallest mountain in the        │
│            solar system?"                             │
│                                                      │
├──────────────────────────────────────────────────────┤
│                  THE RESPONSE                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Assistant]: "Olympus Mons on Mars, at roughly      │
│   21.9 km (13.6 miles) — about 2.5 times the        │
│   height of Mount Everest."                          │
│                                                      │
│  Tokens used: 42                                     │
│  Cost: $0.001                                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

That's the whole interaction. You send text in, you get text back. The model has no memory of you, no ongoing relationship, no internal state. Each request is completely independent.

Which brings us to the first big problem...

---

## Step 2: Memory & State (The Goldfish Problem)

**LLMs have no memory.**

Every single time you send a message, the model starts completely fresh. It doesn't remember your previous question. It doesn't know your name. It doesn't know what you talked about five seconds ago.

So how does ChatGPT seem to remember your conversation? Simple: **your app re-sends the entire conversation every time.**

### The Illusion of Memory

When you're five messages into a chat, here's what actually gets sent on your sixth message:

```
┌──────────────────────────────────────────────────────┐
│          WHAT GETS SENT ON MESSAGE #6                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Messages:                                           │
│                                                      │
│  1. [You]: "Hi, I'm planning a trip to Japan"       │
│  2. [AI]:  "That sounds exciting! When are..."       │
│  3. [You]: "Next April, for two weeks"               │
│  4. [AI]:  "April is perfect for cherry blossom..."  │
│  5. [You]: "I love hiking. Any recommendations?"     │
│  6. [AI]:  "For hiking in Japan during cherry..."    │
│  7. [You]: "What about budget?"        ← NEW        │
│                                                      │
│  Total: ALL seven messages sent together             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

The model reads the entire conversation from scratch and generates a response that *sounds* like it remembers — because it can see the whole history right there in the input.

### The Context Window: A Hard Limit

That conversation history has a size limit called the **context window**. Think of it as the model's short-term working memory — how much text it can look at in one go.

```
┌──────────────────────────────────────────────────────┐
│              CONTEXT WINDOW SIZES                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Model            │ Context Window │ Roughly...      │
│  ─────────────────┼────────────────┼──────────────── │
│  GPT-3 (2020)     │   4K tokens    │ ~3,000 words    │
│  GPT-4 (2023)     │  128K tokens   │ ~96,000 words   │
│  Claude (2025)    │  200K tokens   │ ~150,000 words  │
│                                                      │
│  For reference:                                      │
│  • A typical email       = ~200 words                │
│  • A short novel         = ~50,000 words             │
│  • The entire Harry      = ~1,100,000 words          │
│    Potter series           (wouldn't fit!)            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Once your conversation exceeds the context window, older messages get dropped. The model literally forgets them because they're no longer in the input.

### Why Agents Need External Memory

If you're building an AI assistant that needs to remember things long-term — your preferences, past projects, important decisions — you can't rely on the context window. You need **external memory**: files, databases, or documents that the agent can read and write to.

This is exactly what my AI assistant, OpenClaw, does. It keeps a file called `MEMORY.md` — like a personal journal — that it reads at the start of every session and updates with important information. When it wakes up tomorrow with a completely blank slate, it reads that file and "remembers" everything that matters.

```
┌──────────────────────────────────────────────────────┐
│            HOW EXTERNAL MEMORY WORKS                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Session 1 (Monday):                                 │
│    Agent learns: "Blake prefers morning meetings"    │
│    Agent writes to MEMORY.md: ✍️                     │
│                                                      │
│  ─── model forgets everything ───                    │
│                                                      │
│  Session 2 (Tuesday):                                │
│    Agent starts fresh (blank slate)                  │
│    Agent reads MEMORY.md: 📖                         │
│    Agent knows: "Blake prefers morning meetings"     │
│                                                      │
│  It's not memory. It's note-taking.                  │
│  But the effect is the same.                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

This pattern — stateless engine + external storage = apparent memory — is one of the most important ideas in AI agents. The model itself never changes. We just give it better notes to read.

Now, reading and writing files sounds like something a computer program does, not a language model. How does a text-prediction engine interact with the real world?

That's Step 3.

---

## Step 3: The Harness (Giving AI "Claws")

Here's where it gets interesting.

A raw LLM can only do one thing: take text in and produce text out. It can't read your files. It can't search the web. It can't send an email. It can't do *anything* except generate the next word.

So how does Claude edit your code? How does ChatGPT browse the internet? How does an AI assistant manage your calendar?

The answer: **a harness** — the code that wraps around the model and gives it the ability to act in the real world.

### The Loop: Think → Act → Observe → Repeat

An AI agent is fundamentally a **while loop** — a repeating cycle that goes like this:

```
┌──────────────────────────────────────────────────────┐
│                THE AGENT LOOP                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│              ┌──────────────┐                        │
│    ┌────────►│    THINK     │                        │
│    │         │  (LLM call)  │                        │
│    │         └──────┬───────┘                        │
│    │                │                                │
│    │                ▼                                │
│    │         ┌──────────────┐         ┌────────┐    │
│    │         │  ACT         │────────►│  DONE  │    │
│    │         │  (use tool?) │  No     │        │    │
│    │         └──────┬───────┘  tools  └────────┘    │
│    │                │ Yes                             │
│    │                ▼                                │
│    │         ┌──────────────┐                        │
│    │         │   OBSERVE    │                        │
│    └─────────│  (get result)│                        │
│              └──────────────┘                        │
│                                                      │
│  This loop continues until the model decides         │
│  it has enough information to give a final answer.   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

1. **Think**: The model looks at the conversation and decides what to do next.
2. **Act**: If it needs information or needs to do something, it requests a tool call.
3. **Observe**: The harness executes the tool and sends the result back to the model.
4. **Repeat**: The model looks at the result and decides if it needs to do more, or if it can respond.

### What Are "Tools"?

Tools are functions that the harness makes available to the model. They're described in plain language so the model knows what they do and when to use them.

For example, OpenClaw (the system I use) gives its model these core tools:

```
┌──────────────────────────────────────────────────────┐
│                OPENCLAW'S TOOLS                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📖 read    — Read the contents of a file            │
│  ✍️  write   — Create or overwrite a file             │
│  ✏️  edit    — Make precise changes to a file         │
│  ⚡ exec    — Run a shell command                    │
│  🔍 search  — Search the web                         │
│  🌐 browser — Control a web browser                  │
│                                                      │
│  That's it. With just these tools, the agent can:    │
│                                                      │
│  • Write and edit code                               │
│  • Manage files and folders                          │
│  • Install software                                  │
│  • Search the internet                               │
│  • Read documentation                                │
│  • Run programs and check output                     │
│  • Deploy websites                                   │
│  • ... basically anything you can do on a computer   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

There's a philosophy here that I love: **"bash is all you need."** Give an AI a terminal and file access, and it can figure out the rest. You don't need a special "send email" tool — you can use `exec` to run a command that sends email. You don't need a "create database" tool — you can use `exec` to run SQL commands. The simple tools compose into everything.

### How Tool Calling Actually Works

Let's trace through a real example. Say you ask: *"What files are in my project folder?"*

```
┌──────────────────────────────────────────────────────┐
│          TOOL CALLING: STEP BY STEP                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  YOU: "What files are in my project folder?"         │
│                                                      │
│  ── Step 1: Harness sends your message to LLM ──    │
│                                                      │
│  LLM RESPONDS (not with text, but with a request):  │
│                                                      │
│    "I'd like to call the 'exec' tool with:           │
│     command: ls ~/project"                           │
│                                                      │
│  ── Step 2: Harness runs the command ──              │
│                                                      │
│  RESULT:                                             │
│    README.md                                         │
│    src/                                              │
│    package.json                                      │
│    .gitignore                                        │
│                                                      │
│  ── Step 3: Harness sends result back to LLM ──     │
│                                                      │
│  LLM RESPONDS (now with text for you):               │
│                                                      │
│    "Your project folder has 4 items:                 │
│     - README.md (documentation)                      │
│     - src/ (source code directory)                   │
│     - package.json (dependencies)                    │
│     - .gitignore (git config)"                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Notice what happened: the model never *actually* ran a command. It outputted text that *described* which command it wanted to run. The harness (regular code, not AI) read that description, ran the real command, and fed the result back.

The model is still just predicting text. But the harness turns those text predictions into real actions. That's the "claws" in OpenClaw — the ability to reach out and touch the real world.

### The Key Insight

The model doesn't *do* anything. It *asks* for things to be done, and the harness decides whether to actually do them. This is important for safety — the harness can refuse dangerous requests, require confirmation for destructive actions, or limit what tools are available.

An AI agent isn't a model that gained superpowers. It's a model wrapped in code that *lends it* the ability to act. Take away the harness, and it's back to just being really good autocomplete.

---

## Step 4: The Full Stack (Putting It All Together)

Now let's zoom out and see how a complete AI-powered application works — from the moment you type a message to the moment you get a response.

### The Architecture

Whether it's ChatGPT, a Teams bot, or a custom AI assistant, the architecture looks roughly the same:

```
┌──────────────────────────────────────────────────────┐
│              THE FULL AGENT STACK                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  FRONTEND (what you see)                       │  │
│  │  Chat window, web app, Teams, Slack, terminal  │  │
│  └──────────────────────┬─────────────────────────┘  │
│                         │ Your message                │
│                         ▼                             │
│  ┌────────────────────────────────────────────────┐  │
│  │  API LAYER (traffic cop)                       │  │
│  │  Receives requests, validates them,            │  │
│  │  manages sessions, enforces limits             │  │
│  └──────────────────────┬─────────────────────────┘  │
│                         │                             │
│           ┌─────────────┼─────────────┐               │
│           ▼             ▼             ▼               │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────┐     │
│  │  DATABASE    │ │  LLM     │ │   TOOLS      │     │
│  │             │ │  LAYER   │ │              │     │
│  │ History,    │ │ Harness, │ │ read, write, │     │
│  │ users,      │ │ agents,  │ │ exec, search │     │
│  │ memory      │ │ prompts  │ │              │     │
│  └──────────────┘ └──────────┘ └──────────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### A Real Request, End to End

Let's trace a complete request through a production AI application — like a Teams bot that helps employees search for healthcare providers:

```
┌──────────────────────────────────────────────────────┐
│        COMPLETE REQUEST LIFECYCLE                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. USER types in Teams:                             │
│     "Find me a dentist near Portland that            │
│      accepts Blue Cross"                             │
│           │                                          │
│           ▼                                          │
│  2. API receives the message                         │
│     • Authenticates the user                         │
│     • Loads their conversation history               │
│     • Formats everything for the LLM                 │
│           │                                          │
│           ▼                                          │
│  3. LLM LAYER sends to Claude/GPT:                   │
│     • System prompt: "You help find providers..."    │
│     • Conversation history (from database)           │
│     • Available tools: [search_providers,            │
│       check_insurance, get_reviews]                  │
│     • User's new message                             │
│           │                                          │
│           ▼                                          │
│  4. MODEL thinks, then requests a tool:              │
│     → search_providers(                              │
│         specialty="dentist",                         │
│         location="Portland, OR",                     │
│         insurance="Blue Cross")                      │
│           │                                          │
│           ▼                                          │
│  5. HARNESS runs the search                          │
│     → Returns 8 matching dentists                    │
│           │                                          │
│           ▼                                          │
│  6. MODEL sees results, requests another tool:       │
│     → get_reviews(provider_ids=[...])                │
│           │                                          │
│           ▼                                          │
│  7. HARNESS fetches reviews                          │
│     → Returns ratings and review summaries           │
│           │                                          │
│           ▼                                          │
│  8. MODEL composes final answer:                     │
│     "I found 8 dentists near Portland accepting      │
│      Blue Cross. Here are the top 3 by rating:       │
│      1. Dr. Smith (4.9★) - Pearl District..."        │
│           │                                          │
│           ▼                                          │
│  9. API saves the exchange to the database           │
│     and sends the response back to Teams             │
│                                                      │
│  Total time: ~3-8 seconds                            │
│  LLM calls: 3 (think, tool, tool, respond)           │
│  Cost: ~$0.01-0.05                                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### The Technology Stack

In a real production application, each layer uses specific technology. Here's a common stack:

```
┌──────────────────────────────────────────────────────┐
│           PRODUCTION TECH STACK                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  LAYER          │ TECHNOLOGY       │ WHAT IT DOES    │
│  ───────────────┼──────────────────┼──────────────── │
│  Frontend       │ React / Teams /  │ What users      │
│                 │ Slack / Terminal  │ interact with   │
│                 │                  │                 │
│  API            │ FastAPI          │ Handles HTTP    │
│                 │ (Python)         │ requests,       │
│                 │                  │ routing, auth   │
│                 │                  │                 │
│  Validation     │ Pydantic         │ Makes sure data │
│                 │                  │ is the right    │
│                 │                  │ shape/type      │
│                 │                  │                 │
│  LLM Framework  │ Pydantic AI      │ Manages agents, │
│                 │                  │ structured      │
│                 │                  │ outputs, tools  │
│                 │                  │                 │
│  Database       │ SQLAlchemy +     │ Stores users,   │
│                 │ SQLite/Postgres  │ history, data   │
│                 │                  │                 │
│  Tools          │ Python functions │ Actions the LLM │
│                 │                  │ can call        │
│                 │                  │                 │
│  LLM Provider   │ Anthropic /      │ The actual AI   │
│                 │ OpenAI           │ model (API)     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

You don't need to know these technologies to understand the concept. The point is: **an AI agent isn't one thing. It's a stack of layers**, each with a job. The LLM is just one piece — arguably not even the hardest piece to build.

### Three Real Examples

**1. ChatGPT / Claude.ai**
The chat interface you're probably familiar with. Frontend is a web app. The API manages your conversations. The LLM layer talks to their models. Tools include web browsing, code execution, and file analysis. The database stores your chat history.

**2. OpenClaw (My Personal Assistant)**
OpenClaw runs on my laptop. The "frontend" is a chat window or Telegram. The harness gives Claude access to my files, terminal, web browser, and connected devices. It reads MEMORY.md for long-term context and daily notes for recent history. It can control my phone's camera, manage my calendar, search the web, and write code. Same pattern — just with different tools plugged in.

**3. A Corporate Teams Bot**
A company builds a bot that helps employees with HR questions. Frontend is Microsoft Teams. The API is a FastAPI server. The LLM is Claude with a system prompt about company policies. Tools include a database of policies, a benefits calculator, and a PTO lookup function. The database stores employee interactions for compliance.

Same architecture. Different tools. Different prompts. Different frontends. But the same four-step stack underneath.

---

## The Whole Picture

Let's put all four steps together in one view:

```
┌──────────────────────────────────────────────────────┐
│         THE COMPLETE AI AGENT — ALL 4 STEPS          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  STEP 1: THE MODEL                                   │
│  ┌────────────────────────────────────────────────┐  │
│  │  Prediction engine. Text in, text out.         │  │
│  │  Doesn't think. Doesn't remember. Predicts.    │  │
│  └────────────────────────────────────────────────┘  │
│                         +                             │
│  STEP 2: MEMORY                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Conversation history re-sent every time.      │  │
│  │  External files for long-term memory.          │  │
│  │  Context window = hard limit on attention.     │  │
│  └────────────────────────────────────────────────┘  │
│                         +                             │
│  STEP 3: THE HARNESS                                 │
│  ┌────────────────────────────────────────────────┐  │
│  │  While loop: think → act → observe → repeat.   │  │
│  │  Tools let the model interact with the world.  │  │
│  │  The model asks; the harness does.             │  │
│  └────────────────────────────────────────────────┘  │
│                         +                             │
│  STEP 4: THE STACK                                   │
│  ┌────────────────────────────────────────────────┐  │
│  │  Frontend → API → LLM + Tools → Database.      │  │
│  │  Every AI product is this stack with different  │  │
│  │  tools, prompts, and frontends plugged in.     │  │
│  └────────────────────────────────────────────────┘  │
│                         =                             │
│                                                      │
│              🤖 AN AI AGENT                           │
│                                                      │
│  Not magic. Not sentient. Not thinking.              │
│  A prediction engine, wrapped in memory,             │
│  given tools, served through a stack.                │
│                                                      │
│  That's the whole thing.                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Common Misconceptions

Now that you know how it works, let's clear up some things people get wrong:

**"AI understands what I'm saying."**
It doesn't. It predicts what text should come next based on patterns. The result *looks like* understanding because the patterns are incredibly sophisticated. But there's no comprehension happening — just math.

**"AI is getting smarter over time."**
Not from your conversations. The model is frozen after training. When Claude seems to "learn your preferences," it's because your conversation history (or a memory file) is being included in every request. The model itself hasn't changed.

**"AI agents are a totally different thing from chatbots."**
They're the same model, wrapped in more code. A chatbot is Step 1 + Step 2. An agent adds Step 3 (tools) and Step 4 (the full stack). The "intelligence" is identical — the difference is what it's allowed to *do*.

**"Agents can do anything."**
Only what their tools allow. An agent with no tools is just a chatbot. An agent with file access can read and write files. An agent with internet access can browse the web. The capabilities come from the harness, not the model.

**"AI will replace programmers."**
AI agents are *written by* programmers. The model predicts text. Everything else — the harness, the tools, the API, the database, the safety checks, the deployment — is traditional software engineering. AI agents actually create *more* demand for good engineering, not less.

---

## Want to Go Deeper?

If you want to build this stuff yourself, here's where to start:

1. **Play with the API directly.** Get an Anthropic or OpenAI API key and send raw requests. Seeing the actual JSON helps everything click.

2. **Build a simple harness.** Write a Python script that calls the API in a loop and gives the model one tool (like reading files). You'll have a basic agent in ~50 lines of code.

3. **Study an open system.** OpenClaw is open-source. Look at how the harness works, how tools are defined, how memory is managed.

4. **Read about agentic patterns.** ReAct (think-act-observe), Plan-and-Execute (plan first, then do), Reflection (self-critique and improve). These are the building blocks of sophisticated agents.

The stack is simpler than it looks. A prediction engine, some memory, a loop with tools, and a web server. That's all there is.

Now you know how the claws work. 🦞
