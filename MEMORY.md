# Personal Website — Session Memory & Project State

**Last updated:** 2026-02-26
**Git repo:** `/Users/blake/openclaw/workspace/personal-website/` (independent repo, not nested in workspace)
**Dev server:** `npm run dev` from `src/` directory, port **3001** (configured in `.claude/launch.json`)
**Parent workspace:** `/Users/blake/openclaw/workspace/` has `personal-website/` in `.gitignore`

---

## Tech Stack

- **Framework:** Next.js 16.1.6, React 19, App Router
- **Styling:** Tailwind CSS 4 with `@import "tailwindcss"` + `@theme inline` for design tokens
- **Build:** Turbopack (dev), Docker for production
- **Fonts:** Instrument Serif (headings), Inter (body), JetBrains Mono (code) — loaded via Google Fonts
- **Markdown:** `gray-matter` for frontmatter parsing, `remark` + `remark-html` for rendering
- **Deploy target:** Hetzner VPS via Docker (not yet deployed)
- **No external animation libraries** — all animations are native CSS + setInterval

---

## Project Structure

```
personal-website/
├── CLAUDE.md                 ← Agent instructions (design rules, conventions, quality bar)
├── MEMORY.md                 ← YOU ARE HERE
├── ADMIN-EDITOR-PLAN.md      ← Architecture plan for admin/CMS editor
├── CODEX-PROMPT-admin-editor.md ← Codex prompt for admin editor implementation
├── IDEAS-PLAN.md → content/  ← Moved to content/
├── WORK-SUMMARY-2026-02-26.md← Summary of overnight content generation session
├── docs/
│   ├── DESIGN-SYSTEM.md      ← THE design bible (read this for visual decisions)
│   ├── WEBSITE-SPEC.md       ← Content, structure, pages, WebMCP integration
│   ├── ARCHITECTURE.md       ← Technical stack, deployment, performance
│   ├── WEBMCP-GUIDE.md       ← WebMCP implementation patterns
│   ├── RESEARCH.md           ← Research sources
│   └── WORKFLOWS.md          ← Content workflows
├── prompts/                  ← Task prompts (01 through 07, one per page)
├── content/
│   ├── IDEAS-PLAN.md         ← Master content plan (categories, posts, modules, design direction)
│   ├── posts/                ← 9 published markdown posts (read by lib/posts.ts)
│   ├── drafts/               ← WIP content (blog posts, learning modules, work pages, specs)
│   └── research/             ← Raw research by topic (azure/, venture/, webmcp/, healthcare-cost-analysis/)
├── src/                      ← Next.js project root (package.json lives here)
│   ├── src/app/              ← App Router pages
│   ├── src/components/       ← React components
│   ├── src/hooks/            ← Custom hooks
│   ├── src/lib/              ← Data + utilities
│   ├── src/fonts/            ← Local font files (Instrument Serif)
│   └── public/images/bg/     ← 6 nature background photos
└── .claude/launch.json       ← Dev server config (port 3001)
```

**Important:** The Next.js project root is `src/` (that's where package.json is). Source code is at `src/src/`. So component paths look like `src/src/components/learn/LearnTabs.tsx`. The `@/` alias resolves to `src/src/`.

---

## Pages (Current State)

### Working Pages
| Route | File | Status |
|-------|------|--------|
| `/` | `app/page.tsx` | ✅ Complete — hero with nature bg |
| `/about` | `app/about/page.tsx` | ✅ Complete |
| `/work` | `app/work/page.tsx` | ✅ Complete |
| `/ideas` | `app/ideas/page.tsx` | ✅ Dynamic — reads from `content/posts/` via `getAllPosts()` |
| `/ideas/[slug]` | `app/ideas/[slug]/page.tsx` | ✅ Dynamic — renders markdown with remark, SSG with `generateStaticParams` |
| `/learn` | `app/learn/page.tsx` | ✅ Complete — 5-tab interactive interface |
| `/contact` | `app/contact/page.tsx` | ✅ Complete |
| `/structure` | `app/structure/page.tsx` | ✅ Documentation page showing site structure |

### Ideas/Blog System
- **Posts loaded from filesystem:** `content/posts/*.md` via `lib/posts.ts`
- **Frontmatter fields:** title, date, tags, excerpt, readTime, category, featured, summary, status
- **9 published posts** covering: business models, healthcare, WebMCP, OpenClaw, podcasts, AI-as-glue
- **Rendering:** remark → HTML, displayed with Tailwind prose classes
- **Category filtering:** Sidebar buttons exist but are **not yet functional** (static, no state)

---

## Learn Page — Detailed Architecture

The Learn page is the most complex section. It's a tabbed interface at `/learn`.

### Component Tree
```
LearnTabs (state: activeTab)
├── OverviewTab (default)
│   ├── TypewriterBlock          ← Terminal animation, types line-by-line
│   ├── Section preview cards    ← Click navigates to other tabs
│   └── ApiCallBanner            ← Example LLM API request/response
├── ConversationSimulator (embedded)
│   ├── Scenario tabs (4 scenarios)
│   ├── ChatPane → ChatMessage[] ← User sees conversation
│   └── ApiPane → JsonBlock[]    ← User sees API mechanics
├── LearnExplorer (file browser)
│   ├── FileTree                 ← Unix-style tree with folders
│   └── FileViewer               ← Renders markdown or JSON files
├── ToolboxTab                   ← Grid of tools Blake uses
└── ReposTab                     ← GitHub repo cards
```

### Key Files (Learn System)
| File | Lines | Purpose |
|------|-------|---------|
| `components/learn/LearnTabs.tsx` | 80 | Root tab container, manages activeTab state |
| `components/learn/OverviewTab.tsx` | 95 | Landing: typewriter + cards + API banner |
| `components/learn/TypewriterBlock.tsx` | 189 | Terminal typewriter animation |
| `components/learn/ConversationSimulator.tsx` | 176 | Interactive LLM conversation player |
| `components/learn/ChatPane.tsx` | 94 | Chat message display with auto-scroll |
| `components/learn/ApiPane.tsx` | 81 | API block display (JSON + annotations) |
| `components/learn/ChatMessage.tsx` | 151 | Individual message with typewriter effect |
| `components/learn/JsonBlock.tsx` | 114 | JSON syntax highlighter (no deps) |
| `components/learn/FileTree.tsx` | 104 | Hierarchical folder browser |
| `components/learn/FileViewer.tsx` | 164 | Markdown/JSON content viewer |
| `components/learn/ApiCallBanner.tsx` | 42 | LLM API request/response example |
| `components/learn/ToolboxTab.tsx` | 54 | Tool cards grid |
| `components/learn/ReposTab.tsx` | 52 | GitHub repo cards |
| `hooks/useSimulator.ts` | 165 | Playback state machine for simulator |
| `lib/conversation-scenarios.ts` | 524 | 4 conversation scenarios (simple-chat, tool-use, structured-output, agent-loop) |
| `lib/openclaw-terminal-scenarios.ts` | 801 | OpenClaw-specific terminal scenarios |
| `lib/learn-modules.ts` | 336 | 6 learning modules (1 available, 5 coming soon) |
| `lib/learn-data.ts` | 99 | Tools (6) and repos (3) metadata |

### TypewriterBlock — Known Fix
The typewriter animation uses a **module-level variable** (`hasCompletedOnce`) instead of a React ref. This is intentional — it prevents React StrictMode from breaking the animation (StrictMode double-runs effects, which was causing the ref to be set before animation completed). The module-level var only gets set to `true` when typing finishes, so StrictMode's second run restarts cleanly. On tab re-visits, the text shows immediately (desired behavior).

### useSimulator — Known Fix
The `state.isLoading` is intentionally **NOT** in the useEffect dependency array. Including it would cause the cleanup function to cancel the advancement timer when the loading indicator kicks in, stalling playback. There's an eslint-disable comment explaining this.

---

## Design System (Quick Reference)

Read `docs/DESIGN-SYSTEM.md` for the full system. Key rules:

### Core Pattern
**Nature backgrounds + elevated content panels.** Full-bleed nature photography with warm overlay; content lives in white/dark panels floating on top.

### Colors (CSS Custom Properties)
```css
/* Light */
--bg: #F5F2ED         /* Warm sand */
--bg-panel: #FFFFFF    /* White panels */
--fg: #2C2825          /* Warm dark brown */
--accent: #2B7A6F      /* Ocean teal */
--code-bg: #1E1B19     /* Dark terminal */
--code-fg: #E8E4DE     /* Light code text */

/* Dark (.dark class on html) */
--bg: #1A1816          /* Dark warm brown */
--accent: #4ECDC4      /* Brighter teal */
```

### Anti-Patterns (NEVER DO)
- No centered hero + three cards layout
- No corporate blue
- No AI-generated images
- No snappy animations (always 500ms+)
- No colored section backgrounds (use panels)

### Typography
- Headings: Instrument Serif
- Body: Inter (system)
- Code/mono: JetBrains Mono
- Label pattern: `.label-mono` = uppercase, 11px, monospace, tracking-wider

---

## Content Inventory

### Published Posts (content/posts/)
| Slug | Category | Featured |
|------|----------|----------|
| `future-of-browser-apps` | technology | ✅ Yes |
| `bespoke-ai-model` | the-shifting-model | No |
| `death-of-multi-tenant` | (draft frontmatter, needs cleanup) | No |
| `entity-resolution-healthcare` | healthcare-and-data | No |
| `openclaw-deep-dive` | the-terminal-and-the-agent | No |
| `ai-is-the-glue` | the-future-of-applications | No |
| `podcast-steinberger` | podcast-notes | No |
| `podcast-syntax-openclaw` | podcast-notes | No |
| `podcast-webmcp` | podcast-notes | No |

**Note:** `death-of-multi-tenant.md` and `entity-resolution-healthcare.md` have old draft-style frontmatter (status/target/created instead of title/date/excerpt). They may not render properly in the Ideas listing — frontmatter needs standardization.

### Drafts (content/drafts/)
- Blog posts: post-ai-is-the-glue, post-azure-for-vibe-coders, post-bespoke-ai-model, post-death-of-multi-tenant, post-entity-resolution-healthcare, post-future-of-browser-apps, post-openclaw-deep-dive, post-podcast-* (3)
- Learning modules: learn-agents-in-4-steps, learn-openclaw-deep-dive, learn-system-architecture
- OpenClaw terminal scenarios (TypeScript)
- Work detail pages: work-cms-pipeline, work-personal-assistant, work-provider-search
- Specs: spec-cms-chat-showcase

### Research (content/research/)
- **azure/**: Email Agent architecture, distribution strategy, Teams bot guide, infrastructure, agent-to-agent patterns
- **venture/**: Bespoke AI business framework, chat-dashboard sync, Tambo generative UI review
- **webmcp/**: WebMCP overview, WebMCP vs standard MCP, agent-native app architecture
- **healthcare-cost-analysis/**: New research area (README, calculations, data inventory, literature, research spec)

---

## New Category Structure (From IDEAS-PLAN.md)

Blake is moving away from generic categories to **concept areas**:

1. **The Shifting Model** — Business models changing because of AI (death of multi-tenant, bespoke AI, pricing)
2. **The Terminal & The Agent** — OpenClaw, bash agents, terminal computing, enterprise agent platforms
3. **The Personal Assistant** — Local-first AI, personal agents, privacy, daily workflows
4. **The Future of Applications** — WebMCP, agent-native design, AI as glue, generative UI
5. **Healthcare & Data** — Claims data, entity resolution, provider networks, CMS insights
6. **Podcast Notes** — Summaries from podcasts Blake follows (Steinberger, Syntax, etc.)

**Category filtering on the Ideas page is not yet functional** — the sidebar buttons are rendered but don't filter.

---

## What's Been Built (Overnight Sessions)

After the initial build session (this memory), other agent sessions added:

1. **Blog post system** (`lib/posts.ts`): Filesystem-based post loading with gray-matter + remark
2. **Dynamic slug pages** (`ideas/[slug]/page.tsx`): SSG post rendering with prose styling
3. **9 published posts** moved from drafts to `content/posts/`
4. **OpenClaw terminal scenarios** (`lib/openclaw-terminal-scenarios.ts`): 801-line scenario file for terminal-style demos
5. **Learning module content drafts**: agents-in-4-steps, system-architecture, OpenClaw deep dive
6. **Work detail page drafts**: provider-search, cms-pipeline, personal-assistant
7. **Site structure page** (`/structure`): Documentation page showing site map
8. **Admin editor plan** (`ADMIN-EDITOR-PLAN.md`): Architecture for a CMS/admin editor
9. **Healthcare cost analysis research**: New research subfolder with 5 docs

---

## Current Projects to Feature

### Social Media Exchange Platform ⭐ FLAGSHIP (March 2026)
- **Launch post:** `content/drafts/post-social-media-exchange.md` (ready for Blake's review)
- **Project repo:** `~/openclaw/workspace/social-media-exchange/` (separate project, comprehensive docs)
- **Mission:** Open-source platform to share Twitter feeds, break information silos
- **Tech:** Next.js 14 + TypeScript + PostgreSQL + Twitter API
- **Timeline:** MVP by March 30, public launch April 2026
- **Why feature:** This is Blake's flagship open-source project, mission-driven (not commercial), strong narrative
- **Post status:** Draft written, needs Blake's approval before publishing
- **Where to showcase:**
  - Work page: Add as featured project with link to GitHub (once public)
  - Ideas: Publish the announcement post
  - Learn: Could create module on building social platforms (future)

---

## Known Issues & TODO

### Bugs / Cleanup
- [ ] `death-of-multi-tenant.md` and `entity-resolution-healthcare.md` in `content/posts/` have non-standard frontmatter (draft-style instead of published-style) — needs title/date/excerpt/readTime/category/featured fields
- [ ] Category filtering on Ideas page is not wired up (buttons don't filter)
- [ ] The categories list in `ideas/page.tsx` still uses old category names (`["all", "technology", "business", "healthcare", "building", "personal"]`), not the new concept areas from IDEAS-PLAN.md

### Features Planned
- [ ] Category filtering (client-side state or URL params)
- [ ] Work detail pages (content exists in drafts, needs routes + components)
- [ ] Interactive learning modules (agents-in-4-steps, system-architecture content drafted)
- [ ] CMS chat showcase (spec exists in drafts)
- [ ] Admin editor / content management (plan documented in ADMIN-EDITOR-PLAN.md)
- [ ] WebMCP integration (docs exist, not yet implemented)
- [ ] Docker deployment to Hetzner

### Design Direction Blake Wants
- **Terminal/code aesthetic** — reading posts should feel like reading a markdown file in a code editor
- **Charts and diagrams inline** — not sidebars or popups
- **Interactive elements** in posts: flowcharts, terminal simulations, before/after comparisons
- **Claude Code interface** aesthetic is liked and intentional
- **Each post should have:** clear thesis, at least one diagram, real examples, "So What?" section

---

## How to Run

```bash
cd /Users/blake/openclaw/workspace/personal-website/src
npm run dev -- -p 3001
```

Or use Claude's preview tools with the launch.json config (server name: `dev`).

---

## Git State

- **Repo:** Independent git repo at `/Users/blake/openclaw/workspace/personal-website/`
- **Branch:** `main`
- **Latest commit:** `6345cfb` — "feat: add site structure documentation page at /structure"
- **5 total commits** (initial + 4 content/feature additions)
- **Untracked files:** `content/drafts/learn-openclaw-deep-dive.md`, `content/research/healthcare-cost-analysis/`
