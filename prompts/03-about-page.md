# Prompt 03: About Page

## Context

Read `CLAUDE.md` → `docs/DESIGN-SYSTEM.md` → `docs/WEBSITE-SPEC.md` (About section).

## Design Direction

The About page is Blake's story. It should feel like a long-form magazine profile, not a LinkedIn bio dump.

**Key tension:** Professional credibility + personal warmth. Blake is 32, getting married, building a house, surfing on weekends — AND is the "data guru" at Cedars-Sinai building AI tools for healthcare. Both are true. Both should come through.

## Layout

### Opening

Large display serif: just his name. Below it, a single line — his age, city, what he does. Understated.

```
Blake Thomson
──────
32. Santa Monica. Healthcare data strategist building AI tools
that live inside your walls.
```

Below that, the full narrative flows as body text with typographic variety.

### The Story (Not Sections with Headers)

Don't chunk this into "Education" / "Experience" / "Personal" sections with H2s. That's a resume. Instead, write it as a **narrative with rhythm**:

1. **The short version** — 3-4 sentences that capture everything. Bold, scannable.

2. **The career arc** — Told as a story, not a timeline:
   - Master's in Biomedical Engineering
   - Biotech startup in the Bay Area (where he learned to ship)
   - Consulting in med tech & pharma (where he learned to translate — complex info into stories that move stakeholders)
   - Cedars-Sinai Health System (where he became the "data guru" — the person who can zoom from boardroom strategy to SQL query)
   - Now: building bespoke AI solutions for healthcare on the side

3. **What he actually does** — In plain language:
   > "I spend my days understanding the LA County health ecosystem — where patients go, how providers connect, where the gaps are. I'm one of the few people who can sit in a strategy meeting and then go build the analysis that proves (or disproves) the idea."

4. **The venture** — Why he started building:
   > "I kept watching smart healthcare professionals drown in data they couldn't access. The tools existed. The expertise existed. But nobody was connecting them. So I started building the bridge."

5. **Personal** — Woven in naturally, not quarantined in its own section:
   - Engaged to Devon (June 2026, Napa Valley)
   - Building a custom home in Orinda
   - Surfs in Santa Monica
   - Interested in architecture, systems thinking, great food

### Visual Treatment

- A photo of Blake (placeholder for now — use a styled empty frame with his initials)
- The photo should be placed **asymmetrically** — not a centered circle. Maybe a rectangular frame that breaks the grid slightly.
- Pull quotes in large serif for key statements
- A timeline could work as a **subtle vertical line** with years marked, not a horizontal corporate timeline

### Optional: A "Currently" Block

A small monospaced block showing current status:

```
Currently
─────────
Building    bespoke AI tools for healthcare
Reading     [whatever Blake's reading]
Location    Santa Monica, CA
Listening   [current interest]
```

This adds personality and can be updated easily.

## Implementation

- `src/app/about/page.tsx`
- `src/components/about/Narrative.tsx` — The flowing story
- `src/components/about/PhotoFrame.tsx` — Placeholder that looks intentional
- `src/components/about/Currently.tsx` — The status block (optional)
- `src/components/about/PullQuote.tsx` — Large serif quote (reusable)

## WebMCP Tools

```typescript
useWebMCPTool({
  name: "get_about_info",
  description: "Get Blake Thomson's bio, background, and current focus areas",
  execute: () => ({
    name: "Blake Thomson",
    age: 32,
    location: "Santa Monica, CA",
    role: "Business Development, Cedars-Sinai Health System",
    venture: "Bespoke AI solutions for healthcare organizations",
    education: "MS Biomedical Engineering",
    interests: ["surfing", "architecture", "systems thinking", "AI/ML"]
  })
});
```

## Content

Use the real content from `docs/WEBSITE-SPEC.md` About section. Don't placeholder it — the About page IS content. Write it warmly and directly, as if Blake were talking over coffee.
