# Prompt 02: Home Page

## Context

Read `CLAUDE.md` → `docs/DESIGN-SYSTEM.md` → `docs/WEBSITE-SPEC.md` (Home section).

The project scaffold is complete (Prompt 01). Now build the home page.

## Design Direction

**DO NOT** build the default AI layout: centered hero → three cards → recent posts grid. That's exactly what we're avoiding.

Study the "Offset Hero" pattern from the design system. The home page should feel like opening a well-designed magazine — confident, spacious, with a clear point of view.

## Layout Concept

Think of the home page as **three acts**:

### Act 1: The Introduction (Above the Fold)

The hero is NOT centered text with a subtitle. It's an editorial composition:

- Blake's name in large display serif (72-96px desktop), left-aligned
- A thin horizontal rule as a divider
- Positioning statement below in body text — conversational, not tagline-y
- Something like: *"I help healthcare organizations turn their data into intelligence — using AI that lives inside their walls, not ours."*
- The right side can have a subtle element: a monospaced text block showing a live detail (current location, latest post title, a rotating thought), or simply breathe as whitespace
- **No "Get Started" button. No gradient. No illustration.**

Consider something unexpected: a monospaced sidebar element that updates, a subtle grid texture, or a typographic detail that rewards attention.

### Act 2: What Blake Does (The Work)

NOT three identical cards. Try:

- **An asymmetric layout** where each area of focus gets different treatment
- One might be a large text block with a bold statement
- Another might be a compact card with an icon
- A third might be a full-width strip with monospaced details

Three areas:
1. **Healthcare Data Strategy** — "Understanding the ecosystem. Claims data, provider networks, patient flows."
2. **AI-Powered Applications** — "Bespoke tools deployed in your environment. Your data never leaves."
3. **Education & Writing** — "Demystifying AI for people who make decisions about it."

### Act 3: Latest & Featured

- **Latest Ideas:** Pull 3-4 recent blog posts. Use the compact list style from the design system (title + category + date on one line). Not cards.
- **Featured Project:** One project spotlight. Could be a wide card with a screenshot or code snippet. Currently: Provider Search Tool (mydoclist.com).
- **A closing statement or CTA** — something human, like "Want to talk about what AI could do for your organization? [Get in touch →]"

## Implementation

### Files to Create/Modify

- `src/app/page.tsx` — Home page
- `src/components/home/Hero.tsx` — The introduction
- `src/components/home/FocusAreas.tsx` — What Blake does
- `src/components/home/LatestIdeas.tsx` — Recent posts (can use mock data for now)
- `src/components/home/FeaturedProject.tsx` — Project spotlight

### Mock Data

Until MDX is wired up, use realistic mock data:

```typescript
const latestPosts = [
  { title: "The Death of Multi-Tenant SaaS", category: "business", date: "Feb 25, 2026", slug: "death-of-multi-tenant", readTime: "8 min" },
  { title: "Azure for Vibe Coders", category: "technology", date: "Feb 25, 2026", slug: "azure-for-vibe-coders", readTime: "12 min" },
  { title: "Entity Resolution in Healthcare", category: "healthcare", date: "Feb 20, 2026", slug: "entity-resolution", readTime: "10 min" },
];

const featuredProject = {
  title: "Provider Search",
  description: "A clean search interface for physician liaisons to find and evaluate healthcare providers. Google Places integration, compact card UI, interactive maps.",
  url: "https://mydoclist.com",
  stack: ["FastAPI", "React", "Supabase", "Docker"],
};
```

### Animations

From the design system:
- Elements in Act 1 appear immediately (no animation — it's above the fold)
- Act 2 and Act 3 elements fade in + translateY(8px) on scroll into view
- Stagger siblings by 60ms
- Duration: 400ms, easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Respect `prefers-reduced-motion`

### WebMCP Tools (Register on This Page)

```typescript
useWebMCPTool({
  name: "get_site_overview",
  description: "Get a structured overview of Blake Thomson's website including sections and recent content",
  execute: () => ({ /* structured site data */ })
});

useWebMCPTool({
  name: "navigate_to_section",
  description: "Navigate to a specific section of the site",
  inputSchema: { type: "object", properties: { section: { type: "string" } } },
  execute: ({ section }) => { /* router.push */ }
});
```

## Quality Check

- Does it look like something a design agency would build? Not a developer's weekend project?
- Is the typography doing real work (scale contrast, weight, spacing)?
- Does the layout have tension and rhythm, or is it just stacked boxes?
- On mobile — does it feel like a designed mobile experience, not a squished desktop?
- In dark mode — does it feel moody and intentional?
- If you screenshot it, would someone know it's NOT AI-generated?
