# Blake Thomson — Personal Website Specification

*Living document — last updated: 2026-02-25*
*This is the source of truth for website design, content, and structure.*
*Hand sections of this to Claude Code as prompts when building.*

---

## Vision

A personal website that represents Blake as a person, professional, and builder. Not a corporate landing page. Not a developer portfolio. Something that reflects someone who bridges healthcare strategy, data expertise, and AI — and who's genuinely curious about teaching others how this stuff works.

**Tone:** Warm but sharp. Credible but approachable. The vibe of someone you'd want to grab coffee with and end up in a 2-hour conversation about where AI is heading.

**Audience:**
- Potential clients (healthcare orgs evaluating AI solutions)
- Professional peers (BD, strategy, health system leaders)
- Friends and family (who want to understand what Blake actually does)
- Curious people (who want to learn about LLMs and AI)

---

## Site Structure

### Navigation

```
Blake Thomson
├── Home
├── About
├── Work
├── Ideas        (blog / essays / discussions)
├── Learn        (interactive education modules)
└── Contact
```

---

## Pages

### 🏠 Home

**Purpose:** First impression. Who is Blake, what does he do, why should you care.

**Sections:**
1. **Hero** — Name, one-line positioning, subtle animation or visual
   - Something like: "I help healthcare organizations turn their data into intelligence — using AI tools that live inside their own walls."
   - Or more personal: "Healthcare strategist. Data architect. Building the tools I wish existed."
2. **What I Do** — 3 cards or blocks:
   - Healthcare Data Strategy
   - AI-Powered Applications
   - Education & Writing
3. **Latest** — Recent blog posts / ideas (auto-pulled from Ideas section)
4. **Featured Project** — Rotating spotlight (Provider Search, CMS Pipeline, etc.)

**WebMCP tools for this page:**
- `get_site_overview` — Returns structured summary of all sections and recent content
- `navigate_to_section` — Jump to any section of the site

---

### 👤 About

**Purpose:** The full Blake story. Professional credibility + personal warmth.

**Sections:**

1. **The Short Version**
   - Blake Thomson. 32. Santa Monica, CA.
   - Master's in Biomedical Engineering.
   - Currently on the Business Development team at Cedars-Sinai Health System.
   - Building bespoke AI solutions for healthcare organizations on the side.
   - Getting married June 2026 in Napa Valley.

2. **The Longer Version** (expandable or scrollable)
   - **Career arc:** Biotech startup in Bay Area → Consulting (med tech & pharma, sales consulting, translating complex info) → Cedars-Sinai (2+ years, data strategy, claims data, the "data guru")
   - **What I actually do at Cedars:** I help our team understand the LA County health ecosystem — where patients go, how providers connect, where the opportunities are. I'm the person who can zoom out to strategy and zoom in to the SQL query.
   - **The venture:** I started building AI tools because I kept seeing the same problem — smart people in healthcare drowning in data they can't access. So I'm building the bridge.
   - **Education passion:** I believe the biggest barrier to AI adoption isn't technology — it's understanding. I create interactive learning modules to demystify LLMs for non-technical people.

3. **Personal**
   - Engaged to Devon (wedding June 2026, Napa Valley)
   - Building a custom home in Orinda (the long game)
   - Interests: surfing, architecture, systems thinking, good food
   - Based in Santa Monica, CA

4. **Photo** — Professional but not stiff. Ideally candid or environmental.

**WebMCP tools:**
- `get_about_info` — Returns structured bio data

---

### 💼 Work

**Purpose:** Professional portfolio. What Blake builds and how he thinks about it.

**Sections:**

1. **Services Overview** (from the business framework)
   - Bespoke AI solutions deployed in your environment
   - The "build inside your walls" value prop
   - Three products: Agent Data Catalog, Conversational AI Bots, Dashboards & Apps
   - Link to full framework or a condensed version

2. **Featured Projects**

   **Provider Search Tool**
   - What it is: Search interface for physician liaisons to find providers
   - Stack: FastAPI + React + Supabase + Docker
   - Live at: mydoclist.com
   - Key features: Google Places integration, compact card UI, Leaflet maps
   - Screenshot / demo

   **CMS Healthcare Data Pipeline**
   - What it is: 90M+ row database of Medicare claims, provider data, Open Payments
   - What it enables: Entity resolution, provider matching, market intelligence
   - Key insight: Cascading NPI match engine with specialty stemming

   **Match Engine**
   - What it is: Google Places → NPI matching → CMS enrichment
   - The "secret sauce" — entity resolution across data sources

   **Analytics Dashboard** (for Provider Search)
   - Real-time usage tracking, top searches, daily reports

3. **Approach / Philosophy**
   - "The bottleneck was never code — it's knowing what to build"
   - Deploy in client's environment, data never leaves
   - Domain expertise + data architecture + speed
   - The 5-layer moat (from business framework)

4. **Technologies**
   - Python (FastAPI, Django), React, DuckDB, Supabase, Docker
   - Azure (Container Apps, OpenAI Service)
   - MCP, WebMCP, Tambo (generative UI)
   - CMS data (NPPES, Medicare claims, Open Payments, MIPS)

**WebMCP tools:**
- `get_projects` — Returns structured list of all projects with descriptions
- `get_project_details` — Deep dive on a specific project
- `get_services_overview` — Business services summary

---

### 💡 Ideas (Blog / Discussion)

**Purpose:** Blake's thinking out loud. Technical posts, business strategy, industry observations.

**Content Categories (tags, not separate sections):**
- `technology` — WebMCP, MCP, AI architecture, agent systems, generative UI
- `business` — Healthcare AI business models, pricing, go-to-market, industry analysis
- `healthcare` — Claims data insights, provider networks, health system dynamics
- `building` — Project updates, technical deep-dives, lessons learned
- `personal` — Observations, interests, life updates

**Initial Posts (from content we've already created):**
1. "The Bespoke AI Model: Why We Build Inside Your Walls" (from business framework)
2. "WebMCP: Making Websites AI-Native" (from technical overview)
3. "Old Model vs. New Model: How AI Changed the Software Business" (excerpt from framework)
4. "Entity Resolution in Healthcare: The Matching Problem" (from CMS pipeline work)

**Page Design:**
- Card-based grid or list layout
- Filter by category/tag
- Each post has: title, date, category tags, excerpt, estimated read time
- Individual post pages with clean typography

**WebMCP tools:**
- `search_posts` — Search blog posts by topic or keyword
- `get_latest_posts` — Returns recent posts with summaries
- `get_post_by_topic` — Find posts about a specific subject

---

### 🎓 Learn (Interactive Education)

**Purpose:** Interactive modules that teach LLM concepts to non-technical people. This is Blake's education mission — making AI understandable.

**Target audience:** Friends, family, colleagues, healthcare professionals, anyone curious but not technical.

**Module Ideas:**

1. **"What Is an LLM?"**
   - Visual: Token prediction animation
   - Interactive: Type a sentence, see how the model "thinks" about the next word
   - Concept: It's prediction, not understanding
   - Analogy: World's best autocomplete

2. **"How ChatGPT Actually Works"**
   - Visual: The training pipeline (pre-training → fine-tuning → RLHF)
   - Interactive: Slider showing temperature (creative vs. deterministic)
   - Concept: Training vs. inference, why it "hallucinates"

3. **"What Are Tokens?"**
   - Interactive: Paste text, see it tokenized in real-time
   - Visual: Token cost calculator
   - Concept: Why "cheaper" models matter, context windows

4. **"Agents: AI That Takes Action"**
   - Visual: The agent loop (think → use tool → observe → repeat)
   - Interactive: Simple agent demo — give it a task, watch it break it down
   - Concept: Tools, MCP, function calling
   - Connect to: WebMCP, how websites become AI-accessible

5. **"AI in Healthcare: What's Real, What's Hype"**
   - Visual: Use case matrix (what works today vs. what's coming)
   - Interactive: "Ask me about a healthcare AI use case"
   - Concept: Where AI actually helps vs. where it's oversold

6. **"Prompt Engineering for Normal People"**
   - Interactive: Side-by-side — bad prompt vs. good prompt with live results
   - Concept: Why specificity matters, system prompts, context
   - Practical: Templates people can actually use

**Design Principles for Learn section:**
- Mobile-first (people will share these with friends)
- Progressive disclosure (start simple, click to go deeper)
- Every module should be completable in 5-10 minutes
- Real interactions, not just text — people learn by doing
- No jargon without explanation
- Connect to Blake's GitHub education repo

**GitHub Integration:**
- Link to education repository
- Module source code is open source
- Encourage contributions and forks

**WebMCP tools:**
- `list_modules` — Returns available learning modules with descriptions
- `get_module_content` — Returns structured content for a specific module
- `suggest_module` — Based on what the user wants to learn, recommend a module

---

### 📬 Contact

**Purpose:** Simple, clean way to reach Blake.

**Content:**
- Contact form (declarative WebMCP — auto-fillable by AI agents)
- Email: blakethomson8@gmail.com (or professional email if preferred)
- LinkedIn
- GitHub: blakethom8
- Twitter/X (if applicable)
- Location: Santa Monica, CA

**Form fields:**
- Name
- Email
- Subject (dropdown: General, Business Inquiry, Collaboration, Speaking, Other)
- Message

**WebMCP tools (declarative):**
- Contact form with `tool-name="send_message"` attributes

---

## Design Direction

### Visual Style
- **Clean, modern, minimal** — lots of whitespace
- **Dark mode support** — toggle or system preference
- **Accent color:** Something warm but professional — consider deep teal (#0d9488) or muted blue-green
- **Typography:** System fonts or clean sans-serif (Inter, DM Sans). Monospace for code (JetBrains Mono, Fira Code).
- **Animations:** Subtle, purposeful. Fade-ins on scroll. No flashy transitions.
- **Photography:** If used, environmental/candid. Not stock.

### Technical Stack (for Claude Code)
- **Framework:** Whatever Blake + Claude Code decide (likely Next.js or Astro given the content-heavy nature)
- **Styling:** Tailwind CSS
- **Hosting:** TBD (Vercel, Azure Static Web Apps, or similar)
- **CMS for blog:** MDX files, or headless CMS
- **Interactive modules:** React components with client-side interactivity
- **WebMCP:** Progressive enhancement layer on every page

### Responsive
- Mobile-first design
- Breakpoints: mobile (< 640px), tablet (640-1024px), desktop (1024px+)
- Touch-friendly interactions on Learn modules

---

## WebMCP Strategy (Site-Wide)

Every page registers contextual tools. The site itself becomes an AI-native experience — a demo of the very technology Blake writes about.

**Global tools (available on every page):**
- `get_site_map` — Returns site structure and available pages
- `navigate_to` — Navigate to any page/section
- `get_blake_info` — Quick bio and contact info

**Page-specific tools:** Listed under each page section above.

**This serves dual purpose:**
1. Makes the site genuinely AI-accessible (practice what you preach)
2. Acts as a live demo of WebMCP for the Technology blog posts

---

## Content Pipeline

1. **Chief (me)** drafts content, specs, copy in `~/openclaw/workspace/website/`
2. **Blake** reviews and refines
3. **Claude Code** builds pages from specs, iterates on design in Figma/code
4. **Chief** reviews output, suggests content/copy adjustments
5. Repeat

### Workspace File Structure
```
~/openclaw/workspace/website/
├── WEBSITE-SPEC.md          ← This file (living spec)
├── content/
│   ├── about.md             ← About page copy
│   ├── work.md              ← Work/services copy
│   └── posts/               ← Blog post drafts
│       ├── bespoke-ai-model.md
│       ├── webmcp-overview.md
│       └── ...
├── prompts/
│   ├── claude-code-setup.md ← Initial project setup prompt
│   ├── page-home.md         ← Prompt for building Home page
│   ├── page-about.md        ← Prompt for building About page
│   └── ...
└── assets/
    └── (screenshots, diagrams, etc.)
```

---

## Open Questions

- [ ] Domain name? (blakethomson.com? blakethomson.dev? something else?)
- [ ] Professional email for contact form?
- [ ] Photo assets — do we have headshots or environmental photos?
- [ ] GitHub education repo — does it exist yet or do we need to create it?
- [ ] Hosting preference — Vercel, Azure, Netlify?
- [ ] Blog CMS — MDX in repo, or headless CMS (Sanity, Contentful)?
- [ ] Analytics — what tracking do we want?

---

*This spec will evolve. Update it as decisions are made.*
