# Ideas Section — Content Plan

*Created: 2026-02-26*
*This is the blueprint for the Ideas (blog) section of blakethomson.com*

---

## Learning Modules (Interactive)

### Module 1: "LLMs & Agents in 4 Steps"
*Simplify the entire agent stack for non-technical people*

**Step 1: The Model** — What is an LLM? It predicts the next word. That's it. (Use existing ConversationSimulator to show a simple chat request/response)

**Step 2: Memory & State** — LLMs are stateless. Every message includes the full conversation history. Context windows, token limits, why agents need files for persistent memory. (Show: the messages array growing with each turn)

**Step 3: The Harness** — The while loop that gives agents "claws." Tools (read, write, edit, exec) let the model interact with the real world. The harness is the loop: think → call tool → observe → think again. (Use OpenClaw terminal simulator scenarios)

**Step 4: The Bot Pattern** — Putting it all together: API layer, tool registration, streaming responses, user-facing interface. Reference project-base architecture. (Show: full stack diagram)

### Module 2: "System Architecture: Where Does Everything Live?"
*Interactive visual: server vs database vs browser vs local machine*

- **Your browser** — The UI, JavaScript, what the user sees and clicks
- **The server (API)** — FastAPI/Express processing requests, calling LLMs
- **The database** — Where data persists (PostgreSQL, DuckDB, Supabase)
- **The LLM provider** — Claude/GPT API (someone else's server)
- **Your local machine** — Where OpenClaw runs, your files, your terminal
- Interactive: click on each layer to see what flows between them
- Show a real request lifecycle: user types → browser → API → LLM → tools → database → back

### Module 3: "project-base Tutorial Series"
*Adapt the existing ~/Repo/project_base/docs/ curriculum*

The project-base repo has a full 11-phase tutorial from FastAPI basics through agentic patterns:
- Phase 1-4: Foundation (FastAPI, Pydantic, SQLAlchemy, Alembic)
- Phase 5: Sync vs Async
- Phase 6: LLM Basics + Advanced (Pydantic AI, structured outputs)
- Phase 7: Tool Fundamentals, Database Tools, Analyst Agent
- Phase 8: Agentic Patterns, Framework Comparison, Advanced Patterns
- Phase 9-10: Frontend patterns, Vercel AI SDK
- Phase 11: Provider Classification Workflow (real-world example)

### Website as CMS Data Showcase
*Chat interface + beautiful charts + CMS healthcare data*

Build an interactive showcase on the website that demos:
- Chat sidebar that queries CMS data (90M+ rows)
- Beautiful charts rendered in real-time from chat commands
- "Show me cardiologists in LA by Medicare volume" → instant bar chart
- Uses the projection space pattern from mydoclist.com
- This becomes both a product demo AND a learning module

### GitHub Overview (Plain Language)
*Explain GitHub to non-developers in language that makes sense*
- What's a repository? (A project folder with memory)
- What's a commit? (A save point)
- What's a branch? (A parallel universe for your code)
- What's a PR? (A review before merging changes)
- Why it matters for AI agents (they can read/write code via gh CLI)

---

## Category Rethink

The old categories (technology, business, healthcare, building, personal) are generic. Here's the new structure — each category is a **concept area** that Blake is genuinely exploring:

### 1. 🔄 The Shifting Model
*How business models, value creation, and user experience are changing because of AI*

- The Death of Multi-Tenant SaaS ✅ (drafted)
- The Bespoke AI Model: Building Inside Your Walls
- Why Configuration Is the New Product
- The 5-Layer Moat: Domain Knowledge in an AI World
- Old Model vs New Model (from business framework)
- Pricing AI Services: Value vs. Time

### 2. 🖥️ The Terminal & The Agent
*OpenClaw, bash-driven agents, terminal-first computing, agent platforms*

- OpenClaw Deep Dive: What Happens When Your Terminal Gets a Brain
- Bash Is All You Need: The Pi Philosophy
- Prompt Injection: The Unsolved Security Problem
- Agent Architecture 101: The While Loop That Changes Everything
- Building in Public: How I Use OpenClaw Daily
- Corporate Agent Platforms: Navigating Azure, Teams, and Enterprise AI

### 3. 🏠 The Personal Assistant
*Local-first AI, personal agents, keeping data close, privacy*

- My Personal AI Setup (OpenClaw + local tools)
- Why Your AI Should Live on Your Machine
- The Case for Local: Privacy, Speed, and Control
- What My AI Assistant Actually Does in a Day

### 4. 🌐 The Future of Applications
*How AI changes what applications look like, WebMCP, agent-native design, browser agents*

- The Future of Browser Applications ✅ (drafted)
- WebMCP: Making Websites Talk to AI
- Agent-Native Design: Building for the Second User
- AI as the Glue: Connecting Everything Without Building Everything
- Generative UI: When the Interface Builds Itself (Tambo research)
- Chat + Dashboard: How AI Copilots Reshape Enterprise Tools

### 5. 🏥 Healthcare & Data
*Claims data, provider networks, health system dynamics, CMS insights*

- Entity Resolution in Healthcare: The Matching Problem
- CMS Data: What 90 Million Rows Tell You About American Healthcare
- The Provider Intelligence Stack: Google Places → NPI → CMS
- Building a Match Engine: From 38% to 62%
- What Physician Liaisons Actually Need (and Don't)

### 6. 🎙️ Podcast Notes
*Summaries and takeaways from podcasts Blake follows*

- Syntax 976: Pi & OpenClaw Architecture (Peter Steinberger) ✅ (summarized)
- Peter Steinberger: AI-Friendly Apps & The Death of 80% of Applications
- [Future episodes as Blake listens]

---

## Content We Already Have (Ready to Adapt)

| Content | Location | Target Category |
|---------|----------|-----------------|
| Business Framework Report | `reports/2026-02-25_bespoke-ai-business-framework.html` | The Shifting Model |
| Death of Multi-Tenant | `content/drafts/post-death-of-multi-tenant.md` | The Shifting Model |
| Azure for Vibe Coders | `content/drafts/post-azure-for-vibe-coders.html` | The Terminal & The Agent |
| Future of Browser Apps | `content/drafts/post-future-of-browser-apps.md` | The Future of Applications |
| WebMCP Technical Overview | `reports/2026-02-25_webmcp-technical-overview.html` | The Future of Applications |
| Agent-Native Architecture | `content/research/webmcp/2026-02-25_agent-native-app-architecture.md` | The Future of Applications |
| Tambo Review | `content/research/venture/2026-02-25_tambo-generative-ui-review.md` | The Future of Applications |
| Chat-Dashboard Sync | `content/research/venture/2026-02-25_chat-dashboard-sync-architecture.md` | The Future of Applications |
| Agent-to-Agent Teams | `content/research/azure/agent-to-agent-teams.md` | The Terminal & The Agent |
| Syntax 976 Summary | `~/openclaw/workspace/podcasts/2026-02-22_blog-analysis-ai-friendly-apps.md` | Podcast Notes |
| OpenClaw Architecture Guide | `~/Repo/chief/software-development-concept/openclaw-architecture-guide.md` | The Terminal & The Agent |

---

## Design Direction for Ideas Section

### Terminal-Style Aesthetic
- Reading experience should feel like reading a well-formatted markdown file
- Code blocks, terminal output, command examples woven through posts
- Bold text for emphasis, clean hierarchy
- Charts and diagrams inline (not in sidebars or popups)
- Inspired by Claude Code's interface — clean monospace sections mixed with prose

### Interactive Elements
- **Flowcharts:** Architecture diagrams that are interactive (click to expand nodes)
- **Terminal simulations:** Embedded terminal-style blocks showing command → output flows
- **Charts:** Data visualizations inline (Recharts or similar)
- **Before/After comparisons:** Side-by-side views (especially for agent-native posts)
- **Expandable sections:** Click to dive deeper on technical concepts

### Each Post Should Have
- A clear thesis/hook in the first paragraph
- At least one diagram or chart
- Real examples from Blake's work (not hypothetical)
- A "So What?" section — why this matters practically
- Links to related posts in the same concept area

---

## Work Section — Project Detail Pages

Each project on the Work page should link to a deeper page:

### Provider Search (mydoclist.com)
- Screenshots of the UI (search, cards, map, table view)
- Architecture diagram (FastAPI + React + Supabase + Docker)
- The agent-native layer story (before/after)
- Link to live site

### CMS Healthcare Data Pipeline  
- Data source breakdown (visual: what tables, how many rows, what they contain)
- The matching engine flowchart (Google Places → NPI → CMS cascade)
- Key stats (90M+ rows, 30 tables, 5.5GB)
- Entity resolution explanation with examples

### Personal AI Assistant (OpenClaw)
- What it does day-to-day
- Architecture diagram
- Example workflows (email check, calendar, proactive alerts)
- The memory system (MEMORY.md, daily notes, heartbeats)

### Conversational AI Bots
- Teams bot architecture
- Azure Container Apps deployment diagram
- The agent-to-agent pattern
- Demo screenshots/videos when available
