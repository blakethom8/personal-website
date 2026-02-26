# Research — How We Work Together

*This is our shared research space. Blake brings topics, Chief processes them.*

---

## What Goes Here

Any research that might eventually become website content:
- Podcast summaries and breakdowns
- Technical deep-dives (AI architecture, MCP, healthcare data, etc.)
- Business strategy analysis
- Article/video notes
- Topic explorations and "what if" thinking
- Conference/talk summaries

**What does NOT go here:**
- Project-specific work (house build → `~/Repo/chief/house-build/`)
- Code repositories (provider search → `~/Repo/provider-search/`)
- Personal/private notes (wedding → `~/Repo/chief/wedding/`)
- Daily work logs (→ `~/openclaw/workspace/memory/`)

---

## How It Works

### Quick Research (one message)

> **Blake:** "Hey Chief, what's the deal with [topic]?"
> **Chief:** Researches, writes summary, saves to `content/research/`

### Deep Dive (podcast, video, article)

> **Blake:** "Review this [link] and create a rough draft summary"
> **Chief:**
> 1. Downloads/fetches content
> 2. Processes (transcript, extract key points)
> 3. Writes structured summary → `content/research/YYYY-MM-DD_[type]-[topic].md`
> 4. Responds with highlights and where the file is saved

### Research → Blog Post

> **Blake:** "Turn that [topic] research into a blog post"
> **Chief:**
> 1. Reads the research file
> 2. Refines into blog format with Blake's voice
> 3. Saves to `content/drafts/post-[topic].md`
> 4. Blake reviews, provides feedback
> 5. Final version → `content/posts/[topic].mdx`

---

## File Naming

```
content/research/
├── 2026-02-25_podcast-syntax-976-pi-architecture.md
├── 2026-02-25_tech-webmcp-browser-api.md
├── 2026-02-25_biz-bespoke-ai-framework.md
├── 2026-02-26_article-healthcare-ai-adoption.md
├── 2026-02-26_video-tambo-generative-ui.md
└── 2026-02-26_notes-mcp-vs-webmcp-comparison.md
```

**Prefix convention:**
- `podcast-` — Podcast episode summaries
- `tech-` — Technical deep-dives
- `biz-` — Business strategy/analysis
- `article-` — Article summaries
- `video-` — Video breakdowns
- `notes-` — Freeform notes and explorations

---

## Research File Template

```markdown
---
type: podcast | tech | biz | article | video | notes
source: "[URL or title]"
date: YYYY-MM-DD
status: raw | summarized | draft-ready
tags: ["topic1", "topic2"]
blog_potential: high | medium | low
---

# Title

## Summary
[2-3 sentence overview]

## Key Points
- Point 1
- Point 2

## Detailed Notes
[Full content]

## Relevance to Blake's Work
[How this connects to the venture, website content, etc.]

## Potential Blog Angles
- [Angle 1]
- [Angle 2]
```

---

## Existing Research (to migrate)

These already exist in other locations and could be referenced or migrated:

| Content | Current Location | Migrate? |
|---------|-----------------|----------|
| Syntax 976 podcast summary | `~/openclaw/workspace/podcasts/` | Yes — tech content |
| OpenClaw Architecture Guide | `~/Repo/chief/software-development-concept/` | Reference only |
| Business Framework | `~/openclaw/workspace/reports/2026-02-25_*` | Yes — blog post |
| WebMCP Overview | `~/openclaw/workspace/reports/2026-02-25_webmcp-*` | Already here as asset |
| Prompt-to-App concept | `~/openclaw/workspace/business-concepts/` | Yes — blog post |
| Data Agent concept | `~/openclaw/workspace/business-concepts/` | Yes — blog post |
