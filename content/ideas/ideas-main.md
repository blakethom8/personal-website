---
title: "Ideas & Writing"
lastUpdated: "2026-03-01"
source: "src/src/app/ideas/page.tsx, src/src/lib/categories.ts, src/src/components/ideas/IdeasView.tsx"
---

# Ideas Main Page

## Page Header

**Label (mono):**
ideas

**Headline:**
Ideas & Writing

**Body:**
A collective exploration of agents, applications, healthcare data, and whatever else is on my mind. Pick a topic below or browse everything.

---

## Categories

These are the cards on the main ideas page. Changing labels or descriptions here requires syncing to `src/src/lib/categories.ts`.

---

### 01 — Product & Business of AI
`id: product-business`

**Label:**
Product & Business of AI

**Short label:**
Product & Business

**Description:**
How to think about software products and business models when the cost of custom software collapses. The death of multi-tenant, the rise of bespoke, and what it means to actually build and sell in this space. Less about the technology, more about the shift.

**Posts:**
- ai-is-the-glue
- bespoke-ai-model
- death-of-multi-tenant

---

### 02 — Technical Deep Dives
`id: technical-deep-dives`

**Label:**
Technical Deep Dives

**Short label:**
Technical

**Description:**
Architecture, deployment, tools, and the mechanics of building with agents. OpenClaw, Azure, data pipelines, and how things actually work under the hood. Where the learning guides and hands-on explorations live.

**Posts:**
- agent-native-architecture
- azure-for-vibe-coders
- building-cms-pipeline
- future-of-browser-apps
- openclaw-deep-dive

---

### 03 — Healthcare Data & Analysis
`id: healthcare-data`

**Label:**
Healthcare Data & Analysis

**Short label:**
Healthcare

**Description:**
Using Medicare claims data, CMS datasets, and NPI records to drive real insights. Entity resolution, provider networks, fraud patterns — the research is early but the data is rich. More coming here.

**Posts:**
- entity-resolution-healthcare
- why-your-doctor-doesnt-know-your-name

---

### 04 — Thoughts on the Water
`id: thoughts-on-the-water`

**Label:**
Thoughts on the Water

**Short label:**
Thoughts

**Description:**
Sometimes you notice things. Random observations, half-formed opinions, and whatever doesn't fit anywhere else. A lot of this gets captured with Local Chief — the unfiltered stuff.

**Posts:**
- (none yet)

---

### 05 — In My Feed
`id: in-my-feed`

**Label:**
In My Feed

**Short label:**
In My Feed

**Description:**
Podcasts, YouTube videos, tweets, and articles I'm finding useful. Less analysis, more signal. A running catalog of what's worth your time — the things shaping how I think about this space.

> Note: Building this out as a proper catalog/library — screenshots, thumbnails, source labels. More structure coming.

**Feed items (content/ideas/feed/):**
- podcast-steinberger
- podcast-syntax-openclaw
- podcast-webmcp

---

## Folder Structure

```
content/ideas/
├── ideas-main.md           ← This file — page config, categories, structure
├── posts/                  ← Written articles and essays
│   ├── agent-native-architecture.md    (technical-deep-dives)
│   ├── ai-is-the-glue.md               (product-business)
│   ├── azure-for-vibe-coders.md        (technical-deep-dives)
│   ├── bespoke-ai-model.md             (product-business)
│   ├── building-cms-pipeline.md        (technical-deep-dives)
│   ├── death-of-multi-tenant.md        (product-business)
│   ├── entity-resolution-healthcare.md (healthcare-data)
│   ├── future-of-browser-apps.md       (technical-deep-dives)
│   ├── openclaw-deep-dive.md           (technical-deep-dives)
│   └── why-your-doctor-doesnt-know-your-name.md (healthcare-data)
└── feed/                   ← In My Feed items
    ├── podcast-steinberger.md
    ├── podcast-syntax-openclaw.md
    └── podcast-webmcp.md
```
