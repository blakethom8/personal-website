---
title: "System Architecture: Where Does Everything Live?"
description: "A non-technical guide to understanding the layers of a modern AI application — where your data goes, what happens to it, and who's responsible."
date: 2026-02-26
draft: true
tags: ["learning", "architecture", "explainer"]
series: "Learn With Me"
---

# System Architecture: Where Does Everything Live?

When you use an app — any app — stuff is happening in multiple places at once. Your phone, someone's server, a database in Virginia, an AI model running on a GPU cluster in Texas. It's a relay race, and every leg matters.

This guide breaks down where everything actually lives. No jargon dumps. Just: what's where, what does it do, and what breaks when it goes down.

---

## The Big Picture

Here are the five layers of a modern AI-powered application:

```
┌─────────────────────────────────────────────────────┐
│                    THE INTERNET                      │
│                                                      │
│   ┌───────────┐                    ┌─────────────┐  │
│   │           │                    │             │  │
│   │  YOUR     │◄──── HTTPS ──────►│  THE SERVER  │  │
│   │  BROWSER  │                    │  (API)       │  │
│   │           │                    │             │  │
│   └───────────┘                    └──────┬──────┘  │
│                                           │         │
│                                    ┌──────┴──────┐  │
│                                    │             │  │
│                               ┌────┤  BUSINESS   ├────┐
│                               │    │  LOGIC      │    │
│                               │    └─────────────┘    │
│                               │                       │
│                               ▼                       ▼
│                        ┌────────────┐          ┌────────────┐
│                        │            │          │            │
│                        │  DATABASE  │          │ LLM        │
│                        │            │          │ PROVIDER   │
│                        └────────────┘          └────────────┘
│                                                      │
└──────────────────────────────────────────────────────┘

    And then, off to the side, running everything:

                      ┌─────────────────┐
                      │                 │
                      │  YOUR LOCAL     │
                      │  MACHINE        │
                      │  (development,  │
                      │   agents, you)  │
                      │                 │
                      └─────────────────┘
```

Let's walk through each one.

---

## Layer 1: Your Browser

**What lives here:** HTML, CSS, JavaScript. The visual stuff — buttons, text, images, animations.

**What it does:** Your browser is a *viewer*. It's like a TV. It doesn't store your shows — it just displays whatever signal it receives. When you visit a website, the browser downloads some code (HTML for structure, CSS for styling, JavaScript for interactivity) and renders it on your screen.

When you click a button or submit a form, the browser packages up your input and sends it over the internet to a server. Then it waits for a response and displays it.

**Built with:** React, Next.js, Vue, Svelte, or plain vanilla JavaScript. These are all just different ways of writing the code that runs in your browser.

**What happens if it goes down:** Nothing catastrophic. You close the tab, you lose what's on screen. But all your data is safe because it was never *here* — it was on the server and in the database. You refresh, everything comes back.

**The key insight:** Your browser holds almost nothing. It's a window, not a warehouse.

```
┌─────────────── YOUR BROWSER ───────────────────┐
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │          │  │          │  │              │  │
│  │   HTML   │  │   CSS    │  │  JavaScript  │  │
│  │ structure│  │  styling │  │  behavior    │  │
│  │          │  │          │  │              │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                  │
│  What you see    How it       What happens      │
│  on the page     looks        when you click    │
│                                                  │
│  "Find me a      Colors,      Sends your search │
│   cardiologist"  layout,      to the server,    │
│                  fonts        shows results     │
│                                                  │
└──────────────────────────────────────────────────┘
         │                          ▲
         │  "Hey server, user       │  Server responds
         │   searched for           │  with a list of
         │   cardiologists"         │  matching doctors
         ▼                          │
    ─────────── THE INTERNET ───────────────
```

---

## Layer 2: The Server (API)

**What lives here:** Your application logic. The rules. The brains.

**What it does:** The server receives requests from the browser, figures out what to do, does it, and sends back a response. It's the coordinator — it talks to databases, calls external services, enforces rules, and assembles the final answer.

An API (Application Programming Interface) is just a structured way for programs to talk to each other. The browser says "give me cardiologists near 90210" and the API responds with a list in a predictable format (usually JSON).

**Built with:** FastAPI (Python), Express (Node.js), Django, Rails — these are frameworks for building APIs.

**Where it lives:** On a server somewhere. Could be:
- A VPS (Virtual Private Server) on **Hetzner** or **DigitalOcean** — you rent a Linux machine for $5-50/month
- A cloud service like **AWS**, **Google Cloud**, or **Azure** — pay-per-use, scales automatically
- A platform like **Vercel** or **Railway** — handles the infrastructure for you

**What happens if it goes down:** This is bad. The browser has nothing to talk to. Users see errors, spinning wheels, blank pages. The database is fine — the data isn't lost — but nobody can access it. This is what people mean when they say "the site is down."

**Real example:** Blake's provider-search API runs on FastAPI. When you search for a doctor, this server receives your request, calls Google Places for location data, queries the NPPES federal database for provider details, combines the results, stores them, and sends back a clean response.

```
┌─────────────── THE SERVER (API) ────────────────┐
│                                                   │
│  Incoming request: "cardiologists near 90210"     │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │              BUSINESS LOGIC                 │  │
│  │                                             │  │
│  │  1. Validate the request                    │  │
│  │  2. Call Google Places API                  │  │
│  │  3. Call NPPES federal database             │  │
│  │  4. Merge and deduplicate results           │  │
│  │  5. Store in database for caching           │  │
│  │  6. Format response as JSON                 │  │
│  │  7. Send back to browser                    │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│         │              │              │            │
│         ▼              ▼              ▼            │
│    ┌─────────┐   ┌─────────┐   ┌──────────┐      │
│    │ Google  │   │  NPPES  │   │ Database │      │
│    │ Places  │   │  (govt) │   │          │      │
│    └─────────┘   └─────────┘   └──────────┘      │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## Layer 3: The Database

**What lives here:** Data. Persistent, survives-a-restart, actually-saved data.

**What it does:** When the server turns off and back on, it forgets everything. Variables, in-memory calculations, temporary results — gone. The database is what *remembers*. It's the filing cabinet.

Every user account, every search result, every saved preference — it lives in the database. The server reads from it, writes to it, and queries it.

**Built with:**
- **PostgreSQL** — the workhorse. Handles structured data beautifully. Most web apps use this.
- **DuckDB** — built for analytics. Crazy fast for reading millions of rows. Great for data pipelines.
- **Supabase** — PostgreSQL with a nice dashboard and auth built in. Popular for quick projects.
- **SQLite** — a database in a single file. Simple, local, no server needed.

**What happens if it goes down:** The server can still receive requests, but it can't look anything up or save anything. It's like a librarian with no library. Some apps will partially work (serving cached data), but most things break.

**Real example:** The CMS data pipeline uses DuckDB to process 90 million rows of healthcare provider data. That's every doctor, nurse, and therapist in the United States, their specialties, locations, and affiliations. DuckDB chews through all of it on a single machine because it's designed for exactly this kind of analytical workload.

```
┌─────────────── THE DATABASE ────────────────────┐
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  TABLE: providers                           │  │
│  ├──────────┬───────────┬──────────┬───────────┤  │
│  │ npi      │ name      │ specialty│ city      │  │
│  ├──────────┼───────────┼──────────┼───────────┤  │
│  │ 12345678 │ Dr. Smith │ Cardio   │ LA        │  │
│  │ 23456789 │ Dr. Jones │ Cardio   │ LA        │  │
│  │ 34567890 │ Dr. Patel │ Neuro    │ SF        │  │
│  │ ...      │ ...       │ ...      │ ...       │  │
│  │          │      90 MILLION ROWS             │  │
│  └──────────┴───────────┴──────────┴───────────┘  │
│                                                   │
│  Server asks: "SELECT * FROM providers            │
│                WHERE specialty = 'Cardiology'     │
│                AND city = 'Los Angeles'"           │
│                                                   │
│  Database responds: here are 847 matching rows    │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## Layer 4: The LLM Provider

**What lives here:** The AI model. Massive neural networks running on clusters of expensive GPUs.

**What it does:** You send text in, you get text back. That's it. The LLM (Large Language Model) doesn't store your data, doesn't run your app, doesn't know your database schema. It's a very sophisticated text-completion engine that lives on someone else's hardware.

When your server needs AI capabilities — summarizing text, answering questions, classifying data — it sends an API call to the LLM provider. The provider runs the model, generates a response, and sends it back. You pay per token (roughly per word).

**The providers:**
- **Anthropic** (Claude) — strong reasoning, good at following instructions
- **OpenAI** (GPT) — the original, massive ecosystem
- **Google** (Gemini) — integrated with Google's services

**What happens if it goes down:** Any AI features stop working. But the rest of your app is fine. Search still works, data still loads, users can still browse. You just lose the "smart" parts. This is why good architecture doesn't make the LLM a single point of failure.

**The cost reality:** Running a large model costs real money. A single complex request might cost $0.05-0.50 in API fees. That doesn't sound like much, but multiply by thousands of users and it adds up fast. This is why you cache results, limit unnecessary calls, and choose the right model size for each task.

```
┌─────────── LLM PROVIDER (e.g., Anthropic) ──────┐
│                                                   │
│  YOUR SERVER                    THEIR SERVERS     │
│  sends a request:               process it:       │
│                                                   │
│  ┌──────────────┐    HTTPS    ┌───────────────┐  │
│  │ "Summarize   │───────────►│               │  │
│  │  this doctor's│            │  ██████████   │  │
│  │  profile for │            │  ██ GPU ████   │  │
│  │  a patient"  │            │  ██ CLUSTER██  │  │
│  │              │◄───────────│  ██████████   │  │
│  │              │            │               │  │
│  └──────────────┘            └───────────────┘  │
│                                                   │
│  Response: "Dr. Smith is a board-certified        │
│  cardiologist with 15 years of experience..."     │
│                                                   │
│  Cost: ~$0.03 for this request                    │
│  Time: ~2 seconds                                 │
│                                                   │
│  YOU DON'T OWN THESE GPUS.                        │
│  You're renting compute time.                     │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## Layer 5: Your Local Machine

**What lives here:** Your development environment. Your terminal. Your files. Your AI agent.

**What it does:** This is where *you* work. Code gets written here, tested here, and deployed from here. If you're using a tool like OpenClaw, the agent runs on your machine — reading your files, executing commands, talking to LLM APIs, all from your laptop.

This is fundamentally different from the other layers. The other four are about serving users. This one is about building and controlling everything else.

**What happens if it goes down:** Your laptop dies? You can't develop. But your deployed app keeps running — the server, database, and LLM provider don't care about your laptop. They're independent. You fix your machine, open your terminal, and pick up where you left off.

**The privacy angle:** When your AI agent runs locally (like OpenClaw does), your files, your code, your conversations — they stay on your machine. The only thing that leaves is the text you send to the LLM provider for processing. No third-party server holds your workspace. That's a deliberate choice.

```
┌─────────── YOUR LOCAL MACHINE ───────────────────┐
│                                                    │
│  ┌─────────┐  ┌──────────┐  ┌────────────────┐   │
│  │         │  │          │  │                │   │
│  │ Terminal│  │  Code    │  │  OpenClaw      │   │
│  │         │  │  Editor  │  │  Agent         │   │
│  │ git     │  │  (VS     │  │                │   │
│  │ python  │  │   Code,  │  │  Reads files   │   │
│  │ node    │  │   Cursor) │  │  Runs commands │   │
│  │ docker  │  │          │  │  Calls LLM API │   │
│  │         │  │          │  │  Full control   │   │
│  └─────────┘  └──────────┘  └────────────────┘   │
│                                                    │
│  Everything here is YOURS.                         │
│  Your files. Your machine. Your rules.             │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Diagram 1: Complete Request Lifecycle

Here's what actually happens when you search for a doctor on provider-search. Every arrow is a network request crossing the internet.

```
USER TYPES: "find cardiologists near me"

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 1: Browser → Server                                        │
│                                                                  │
│  ┌──────────┐         POST /api/search              ┌─────────┐ │
│  │          │  { query: "cardiologists",    ───────► │         │ │
│  │ BROWSER  │    location: "90210" }                 │ FastAPI │ │
│  │          │                                        │ SERVER  │ │
│  └──────────┘                                        └────┬────┘ │
│                                                           │      │
│  STEP 2: Server → External APIs                           │      │
│                                                           │      │
│       ┌───────────────────────────────────────────────────┘      │
│       │                                                          │
│       ▼                              ▼                           │
│  ┌──────────────┐             ┌──────────────┐                   │
│  │ Google       │             │ NPPES        │                   │
│  │ Places API   │             │ (Federal DB) │                   │
│  │              │             │              │                   │
│  │ "What's near │             │ "Give me NPI │                   │
│  │  90210?"     │             │  details for │                   │
│  │              │             │  these docs" │                   │
│  │ Returns:     │             │              │                   │
│  │ names, addrs,│             │ Returns:     │                   │
│  │ coordinates  │             │ specialties, │                   │
│  └──────┬───────┘             │ credentials  │                   │
│         │                     └──────┬───────┘                   │
│         │                            │                           │
│         └──────────┬─────────────────┘                           │
│                    │                                             │
│  STEP 3: Server merges, deduplicates, enriches                   │
│                    │                                             │
│                    ▼                                             │
│             ┌─────────────┐                                      │
│             │   MERGE &   │                                      │
│             │   ENRICH    │                                      │
│             │             │                                      │
│             │ Combine     │                                      │
│             │ Google +    │                                      │
│             │ NPPES data  │                                      │
│             └──────┬──────┘                                      │
│                    │                                             │
│  STEP 4: Server → Database (cache for next time)                 │
│                    │                                             │
│                    ▼                                             │
│             ┌─────────────┐                                      │
│             │  DATABASE   │                                      │
│             │  (DuckDB)   │                                      │
│             │             │                                      │
│             │ INSERT INTO │                                      │
│             │ providers...│                                      │
│             └─────────────┘                                      │
│                    │                                             │
│  STEP 5: Server → Browser (JSON response)                        │
│                    │                                             │
│                    ▼                                             │
│  ┌──────────┐  ◄── { providers: [{name: "Dr. Smith",   ──────── │
│  │          │       specialty: "Cardiology",                     │
│  │ BROWSER  │       distance: "0.3 mi", ...}, ...] }            │
│  │          │                                                    │
│  └──────────┘                                                    │
│                                                                  │
│  STEP 6: Browser renders cards + map                             │
│                                                                  │
│  ┌──────────────────────────────────────────┐                    │
│  │  🔍 Cardiologists near 90210             │                    │
│  │                                          │                    │
│  │  ┌──────────────┐  ┌─────────────────┐  │                    │
│  │  │ Dr. Smith    │  │                 │  │                    │
│  │  │ ⭐ 4.8       │  │     [MAP]       │  │                    │
│  │  │ 0.3 mi away  │  │                 │  │                    │
│  │  ├──────────────┤  │   📍 📍 📍       │  │                    │
│  │  │ Dr. Jones    │  │                 │  │                    │
│  │  │ ⭐ 4.6       │  │                 │  │                    │
│  │  │ 0.7 mi away  │  │                 │  │                    │
│  │  └──────────────┘  └─────────────────┘  │                    │
│  └──────────────────────────────────────────┘                    │
│                                                                  │
│  TOTAL TIME: ~800ms                                              │
│  NETWORK HOPS: 5 (browser→server, server→google,                │
│                     server→nppes, server→db, server→browser)     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Diagram 2: OpenClaw Architecture

Here's what happens when you send a message to your AI agent through Telegram. This is a different kind of architecture — it's about a local agent, not a web app.

```
YOU SEND: "What's in my project folder?"

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 1: Telegram → Gateway                                     │
│                                                                  │
│  ┌──────────┐     Telegram Bot API      ┌───────────────────┐   │
│  │          │  ─────────────────────►   │                   │   │
│  │ Telegram │                           │  OpenClaw         │   │
│  │ App      │  Your message travels     │  GATEWAY          │   │
│  │ (phone)  │  to Telegram's servers,   │                   │   │
│  │          │  then to your machine     │  Running on YOUR  │   │
│  └──────────┘                           │  laptop/server    │   │
│                                          └────────┬──────────┘   │
│                                                   │              │
│  STEP 2: Gateway → Agent Session                  │              │
│                                                   ▼              │
│                                          ┌───────────────────┐   │
│                                          │                   │   │
│                                          │  AGENT SESSION    │   │
│                                          │                   │   │
│                                          │  Loads context:   │   │
│                                          │  - SOUL.md        │   │
│                                          │  - USER.md        │   │
│                                          │  - Memory files   │   │
│                                          │  - Conversation   │   │
│                                          │                   │   │
│                                          └────────┬──────────┘   │
│                                                   │              │
│  STEP 3: Agent → LLM API (thinking)              │              │
│                                                   ▼              │
│             ┌──────────────┐            ┌───────────────────┐    │
│             │              │  ◄────────►│                   │    │
│             │  Anthropic   │   HTTPS    │  Agent formats    │    │
│             │  Claude API  │            │  the prompt:      │    │
│             │              │            │  system + context │    │
│             │  (their GPU  │            │  + user message   │    │
│             │   cluster)   │            │                   │    │
│             └──────────────┘            └────────┬──────────┘    │
│                                                  │               │
│  STEP 4: LLM responds with tool calls           │               │
│                                                  ▼               │
│                                         ┌────────────────────┐   │
│   Claude says:                          │                    │   │
│   "I'll read the directory"             │  TOOL EXECUTION    │   │
│                                         │                    │   │
│   Tool call:                            │  exec: "ls -la     │   │
│   exec("ls -la ~/project/")            │   ~/project/"      │   │
│                                         │                    │   │
│   This runs LOCALLY                     │  Runs on YOUR      │   │
│   on YOUR machine                       │  machine, not in   │   │
│                                         │  the cloud         │   │
│                                         └────────┬───────────┘   │
│                                                  │               │
│  STEP 5: Tool results → back to LLM             │               │
│                                                  ▼               │
│             ┌──────────────┐            ┌────────────────────┐   │
│             │  Anthropic   │  ◄────────│  Tool output:      │   │
│             │  Claude API  │            │  "README.md        │   │
│             │              │  ────────► │   src/             │   │
│             │  Reads the   │            │   package.json"    │   │
│             │  output,     │            │                    │   │
│             │  formulates  │            │  Claude summarizes │   │
│             │  response    │            │  the contents      │   │
│             └──────────────┘            └────────┬───────────┘   │
│                                                  │               │
│  STEP 6: Response → Gateway → Telegram           │               │
│                                                  ▼               │
│  ┌──────────┐                           ┌────────────────────┐   │
│  │          │  ◄──────────────────────  │  Gateway sends     │   │
│  │ Telegram │  "Your project has 3      │  response back     │   │
│  │ App      │   files: README.md,       │  through Telegram  │   │
│  │          │   a src/ folder, and      │  Bot API           │   │
│  │          │   package.json"           │                    │   │
│  └──────────┘                           └────────────────────┘   │
│                                                                  │
│  WHAT STAYED LOCAL: your files, the command execution,           │
│                     your agent's memory and context               │
│                                                                  │
│  WHAT LEFT YOUR MACHINE: the text of your message and            │
│                          the directory listing (sent to           │
│                          Anthropic for processing)               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## How Data Flows Between Layers

Every arrow in those diagrams is a **network request**. Here's what that actually means:

```
┌─────────┐   HTTPS request    ┌─────────┐
│         │  ────────────────► │         │
│  Thing  │                    │  Other  │
│    A    │  ◄──────────────── │  Thing  │
│         │   HTTPS response   │         │
└─────────┘                    └─────────┘

Every request has:
  • A URL (where to go)
  • A method (GET = read, POST = create, PUT = update)
  • Headers (metadata like auth tokens)
  • A body (the actual data, usually JSON)

Every response has:
  • A status code (200 = OK, 404 = not found, 500 = server broke)
  • A body (the data you asked for)
```

Data flows **one direction at a time**. The browser asks, the server answers. The server asks the database, the database answers. It's always request → response. No layer reaches into another layer and grabs data — it always asks politely.

---

## What Breaks When Each Layer Dies

| Layer | Goes Down | What Happens | User Sees |
|-------|-----------|--------------|-----------|
| **Browser** | Tab closes, JS crashes | User refreshes, tries again | Blank page or error |
| **Server** | Crashes, runs out of memory | Nothing works | "Connection refused" or spinner forever |
| **Database** | Disk full, connection limit | Server can't read/write data | Partial errors, missing data |
| **LLM Provider** | Anthropic outage, rate limit | AI features fail, rest works | "AI unavailable" or degraded responses |
| **Local Machine** | Laptop dies | Development stops, but deployed app is fine | (Only you notice) |

The most important takeaway: **these layers are independent**. Your database doesn't care if the LLM provider is down. Your browser doesn't care if your laptop is off. Each layer does its job and communicates through well-defined interfaces.

---

## Why This Matters

Understanding where stuff lives helps you:

1. **Debug problems.** "The site is slow" — is it the browser rendering? The server processing? The database query? The LLM call? Knowing the layers lets you isolate the issue.

2. **Understand costs.** Server hosting: $20/month. Database: $15/month. LLM API calls: $200/month. The AI is usually the most expensive part.

3. **Make privacy decisions.** What data leaves your machine? What stays? When you use OpenClaw locally, your files stay local. When you use a web app, your data lives on someone else's server.

4. **Talk to engineers.** You don't need to code to understand "the API is returning 500 errors" or "the database query is slow." These are layer-specific problems with layer-specific solutions.

The magic of modern software is that these layers can be anywhere in the world, built by different teams, using different languages, and they all work together because they agreed on how to talk to each other. That agreement — APIs, protocols, data formats — is what makes the whole thing possible.

---

*Next in the series: [How APIs Actually Work](/learn/apis) — what's really inside those HTTPS requests.*
