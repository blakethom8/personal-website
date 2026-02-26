# CLAUDE.md — Agent Instructions for Personal Website

## ⚠️ READ THIS FIRST

This is Blake Thomson's personal website. It must look like a **human designed it**, not a language model. If you catch yourself reaching for a hero section with centered text and three feature cards below it — stop. That's the AI slop default. We're better than that.

**Read these docs in order:**
1. `docs/DESIGN-SYSTEM.md` — **THE design bible.** Every visual decision flows from here.
2. `docs/WEBSITE-SPEC.md` — Content, structure, pages, WebMCP integration
3. `docs/ARCHITECTURE.md` — Technical stack, deployment, performance
4. `docs/WEBMCP-GUIDE.md` — WebMCP implementation patterns

## Project Structure

```
personal-website/
├── CLAUDE.md                ← You are here
├── docs/                    ← Specs, architecture, design system
├── prompts/                 ← Task prompts (numbered, sequential)
├── content/
│   ├── drafts/              ← WIP content (Chief writes these)
│   ├── posts/               ← Published blog posts (MDX)
│   ├── modules/             ← Learning module content
│   └── research/            ← Raw research by topic subfolder
├── assets/
│   ├── images/
│   └── diagrams/
└── src/                     ← Website source code (YOU build here)
    ├── app/                 ← Next.js App Router pages
    ├── components/          ← React components
    ├── hooks/               ← Custom hooks (WebMCP, etc.)
    ├── lib/                 ← Utilities
    └── styles/              ← Global styles, design tokens
```

## Design Rules (Non-Negotiable)

1. **Nature backgrounds + elevated content panels.** This is the core pattern. Full-bleed nature photography with a warm overlay; content lives in white/dark panels floating on top.
2. **No centered hero + three cards layout.** Ever. Find a better composition.
3. **Earthy and calming.** Warm sand, ocean teal, stone grays. Not corporate blue. Not tech-dark.
4. **Typography IS the design** inside panels. Serif headings (Instrument Serif), clean sans body (Inter).
5. **Readable density.** Lots of content per page, well-organized. Inspired by Arco Design's clean spacing and simple borders.
6. **Panels create structure.** No colored section backgrounds. Use panels with warm borders to organize content.
7. **Motion is calming.** Slow fades (500-700ms), gentle rises. Nothing jarring. The whole site should slow you down.
8. **Real nature photography only.** No AI images, no stock illustrations, no abstract SVGs. Ocean, mountains, fog, water.

Read `docs/DESIGN-SYSTEM.md` for the full system. These rules are a summary.

## Content Pipeline

`content/research/` → `content/drafts/` → `content/posts/`

- Chief (Blake's assistant) writes content in drafts
- Blake reviews and refines
- You build the pages and components to display it
- Final blog posts go in `content/posts/` as MDX

## Conventions

- **MDX frontmatter:** title, date, tags, excerpt, readTime, featured, category
- **Components in MDX:** `<Callout>`, `<CodeBlock>`, `<Interactive>`, `<Diagram>`, `<Demo>`
- **WebMCP:** Progressive enhancement. Feature-detect `navigator.modelContext`. Site works without it.
- **Images:** Next.js `<Image>` component. Always optimize. Descriptive filenames.
- **No external dependencies without justification.** Every npm package must earn its bytes.

## Deployment

- **Host:** Hetzner VPS via Docker
- **Build:** `docker compose up` and it works
- **CI:** GitHub Actions → build → push image → deploy to Hetzner
- See `docs/ARCHITECTURE.md` for full deployment flow.

## Quality Bar

Before considering any page "done":
- [ ] Lighthouse Performance > 95
- [ ] Works beautifully on iPhone SE (smallest common viewport)
- [ ] Dark mode feels warm and cozy, not just inverted
- [ ] Background images load gracefully (blur-up, no layout shift)
- [ ] Content panels are always readable regardless of background image
- [ ] Animations are slow and calming (500ms+), not snappy
- [ ] The page makes you want to slow down and read
- [ ] It feels like a high-end editorial site, not a tech portfolio
