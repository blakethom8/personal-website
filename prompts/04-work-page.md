# Prompt 04: Work Page

## Context

Read `CLAUDE.md` → `docs/DESIGN-SYSTEM.md` → `docs/WEBSITE-SPEC.md` (Work section).

Also read the business framework research: `content/research/venture/2026-02-25_bespoke-ai-business-framework.md`

## Design Direction

This page needs to do two things simultaneously:
1. **Attract potential clients** — credible, specific, not salesy
2. **Showcase technical depth** — for peers who want to see what Blake actually builds

It should NOT look like a SaaS pricing page or a consulting firm's "Our Services" section. Think: a detailed project portfolio from an architecture firm.

## Layout

### Opening Statement

Large, confident, left-aligned:

> "The bottleneck was never code — it's knowing what to build."

Then a paragraph in body text explaining the approach:
> "I build AI-powered tools for healthcare organizations. Not off-the-shelf platforms — bespoke applications deployed inside your own Azure environment. Your data never leaves your walls."

### What I Build (The Three Products)

Present these as distinct blocks with different visual treatments, not identical cards:

**1. Agent Data Catalog**
The foundation. A structured knowledge repository of your business rules, data sources, KPIs, and domain context. Built through workshops and discovery. The "brain" that powers everything else.
- Typical engagement: 2-4 weeks
- *Think of it as: "We document everything your team knows but has never written down — in a format AI can use."*

**2. Conversational AI Bots**
Purpose-built Teams/web bots: Data Reporting, Roster Management, Market Intelligence, Operations. Each does one thing well.
- Deployed in your Azure tenant
- *Think of it as: "Instead of training everyone on the BI tool, give them a bot that speaks English."*

**3. Dashboards & Applications**
Web apps for analytics, provider search, workflow automation, reporting portals. Generative UI where it makes sense.
- *Think of it as: "The custom internal tools you need but could never justify building."*

### Featured Projects

Use the **staggered card layout** from the design system. Each project gets different treatment:

**Provider Search Tool** (large card, prominent)
- What: Search interface for physician liaisons
- Stack: FastAPI, React, Supabase, Docker, Leaflet
- Live: mydoclist.com
- Visual: screenshot or styled code block showing the API

**CMS Healthcare Data Pipeline** (wide, text-heavy)
- What: 90M+ row DuckDB database — Medicare claims, NPPES providers, Open Payments
- Key stat: "30 tables. 5.5GB. Every Medicare provider in the country."
- Visual: table showing data sources and row counts

**Match Engine** (compact, technical)
- What: Entity resolution across Google Places → NPI → CMS data
- Key stat: "38% → 62% match rate through cascading strategies"
- Visual: matching flow diagram or code snippet

**Analytics Dashboard** (small card)
- What: Real-time usage tracking for Provider Search
- Visual: mini dashboard screenshot

### The Approach

A horizontal strip or sidebar element:
```
Deploy in your environment  →  Your data stays yours
Domain expertise first      →  We know what to build because we've lived it
Speed as advantage          →  Days, not months. Each project strengthens the next.
```

### Technologies

Not a logo wall. A clean monospaced list grouped by category:

```
Languages     Python · TypeScript · SQL
Frameworks    FastAPI · React · Next.js · Django
Data          DuckDB · Supabase · PostgreSQL
Cloud         Azure Container Apps · Azure OpenAI
AI/ML         MCP · WebMCP · Tambo · LangChain
Healthcare    NPPES · CMS Claims · Open Payments · MIPS
```

## Implementation

- `src/app/work/page.tsx`
- `src/components/work/OpeningStatement.tsx`
- `src/components/work/Products.tsx`
- `src/components/work/ProjectCard.tsx` (variants: large, wide, compact, small)
- `src/components/work/Approach.tsx`
- `src/components/work/TechStack.tsx`

## WebMCP Tools

```typescript
useWebMCPTool({
  name: "get_services_overview",
  description: "Get an overview of Blake's AI consulting services and products",
  execute: () => ({ /* three products with descriptions and pricing context */ })
});

useWebMCPTool({
  name: "get_projects",
  description: "List Blake's featured projects with descriptions and tech stacks",
  execute: () => ({ /* project array */ })
});

useWebMCPTool({
  name: "get_project_details",
  description: "Get detailed information about a specific project",
  inputSchema: { type: "object", properties: { name: { type: "string" } } },
  execute: ({ name }) => ({ /* specific project details */ })
});
```
