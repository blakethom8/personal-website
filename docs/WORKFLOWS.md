# Workflows — How We Work Together

*Chief (AI assistant) + Blake + Claude Code*

---

## Roles

### Chief (OpenClaw Assistant)
- **Content architect** — writes specs, drafts, blog post copy
- **Research processor** — summarizes podcasts, articles, videos into draft content
- **Design reviewer** — reviews what Claude Code builds, suggests improvements
- **Memory keeper** — maintains docs, tracks decisions, keeps things organized
- **WebMCP strategist** — designs tool definitions and integration patterns

### Blake
- **Creative director** — final say on design, tone, content
- **Claude Code operator** — hands prompts to Claude Code, works with Figma
- **Publisher** — reviews drafts, approves content, pushes to production

### Claude Code
- **Builder** — writes the actual code, implements designs, handles Figma integration
- **Takes direction from** — `CLAUDE.md` + `docs/` + `prompts/` in this workspace

---

## Content Pipeline

```
RESEARCH → DRAFT → REVIEW → PUBLISH

content/research/    content/drafts/    (Blake reviews)    content/posts/
```

### Stage 1: Research (`content/research/`)

Raw material. Anything that might become content:
- Podcast transcript summaries
- Article notes and highlights
- Video breakdowns
- Technical explorations
- Random ideas and observations

**Naming:** `YYYY-MM-DD_topic-description.md`

**Example workflow:**
> Blake: "Hey Chief, review this podcast and create a rough draft summary"
> Chief: Downloads transcript → writes summary → saves to `content/research/YYYY-MM-DD_podcast-name.md`
> Later: Blake says "turn that into a blog post" → Chief moves refined version to `content/drafts/`

### Stage 2: Drafts (`content/drafts/`)

Work-in-progress content being shaped for the site:
- Blog post drafts (will become MDX)
- Page copy drafts (About, Work, etc.)
- Learning module outlines

**Naming:** `[section]-topic-description.md`
- `post-webmcp-overview.md` (blog post draft)
- `page-about-copy.md` (page copy draft)
- `module-what-is-an-llm.md` (learning module draft)

**Status tracking in frontmatter:**
```yaml
---
status: draft | review | ready
target: posts | pages | modules
created: 2026-02-25
updated: 2026-02-25
notes: "Needs Blake's input on the healthcare examples"
---
```

### Stage 3: Published (`content/posts/`, `content/modules/`)

Final MDX files with proper frontmatter, ready for the site build.

---

## Prompt Pipeline (for Claude Code)

```
prompts/
├── 01-project-setup.md        ← Initial scaffold
├── 02-page-home.md            ← Build the home page
├── 03-page-about.md           ← Build the about page
├── ...
```

**How it works:**
1. Chief writes a prompt in `prompts/`
2. Blake hands it to Claude Code (or points Claude Code at it)
3. Claude Code reads `CLAUDE.md` → referenced docs → builds
4. Blake reviews the output
5. Chief suggests refinements if needed

---

## Research Space

This workspace doubles as a personal research space. Files accumulate over time — that's fine.

### What Goes Where

| Content Type | Location |
|---|---|
| Podcast summaries | `content/research/YYYY-MM-DD_podcast-*.md` |
| Article notes | `content/research/YYYY-MM-DD_article-*.md` |
| Video breakdowns | `content/research/YYYY-MM-DD_video-*.md` |
| Technical explorations | `content/research/YYYY-MM-DD_tech-*.md` |
| Business ideas/analysis | `content/research/YYYY-MM-DD_biz-*.md` |
| Random notes | `content/research/YYYY-MM-DD_notes-*.md` |

### Quick Commands for Blake

- **"Review this podcast/video/article"** → Chief processes it → saves to `content/research/`
- **"Turn that into a blog post"** → Chief refines → moves to `content/drafts/`
- **"This is ready to publish"** → Chief formats as MDX → moves to `content/posts/`
- **"Write me a prompt for Claude Code to build X"** → Chief writes → saves to `prompts/`

---

## Decision Log

Track important decisions so we don't revisit them:

| Date | Decision | Context |
|------|----------|---------|
| 2026-02-25 | Next.js + Tailwind + MDX | Content-heavy site with interactive islands |
| 2026-02-25 | Hetzner VPS + Docker | Already have infrastructure, full control |
| 2026-02-25 | MDX in repo (no external CMS) | Simple, version controlled, no dependencies |
| 2026-02-25 | WebMCP as progressive enhancement | Site works without it, AI capabilities are additive |
| 2026-02-25 | Workspace = code + content + research | Single location, Chief + Claude Code both access |

---

## Maintenance

### Weekly (during heartbeats)
- Check `content/drafts/` for stale drafts
- Review research backlog
- Update WEBSITE-SPEC.md if design direction has evolved

### On Publish
- Ensure frontmatter is complete
- Verify images are optimized
- Check WebMCP tools on new pages
- Update site map tool data if pages added
