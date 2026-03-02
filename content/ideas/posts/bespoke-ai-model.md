---
title: "The Bespoke AI Model: Why We Build Inside Your Walls"
date: "2026-02-26"
tags: ["the-shifting-model", "business"]
excerpt: "Forget SaaS. Forget multi-tenant. The future of enterprise AI is bespoke applications deployed inside the client's own infrastructure. Here's the business model — and why it works."
readTime: "12 min"
featured: false
category: "product-business"
---

# The Bespoke AI Model: Why We Build Inside Your Walls

*The bottleneck was never code — it's knowing what to build.*

---

## The Problem With How We Sell Software

The SaaS model has been gospel for two decades: build once, deploy to many, charge monthly. It's efficient. It scales. And for most of enterprise software's history, it was the only economically viable approach.

But it has a fatal flaw in regulated industries like healthcare:

**Your data has to leave your building.**

Every SaaS application requires your data to travel to someone else's server. In healthcare, that means:
- Business Associate Agreements (BAAs) for every vendor
- Vendor risk assessments that take 3-6 months
- Security reviews, penetration testing, compliance audits
- Data transit encryption, residency requirements, access controls
- And a constant, low-grade anxiety: *who else can see our patients' data?*

This friction isn't a bug in the procurement process. It's a feature. It exists because sending sensitive data to third parties is genuinely risky.

**What if the software came to the data instead?**

---

## The Bespoke Model

Here's what I do differently:

```
Traditional SaaS:
  Client's Data  ──→  My Server  ──→  My Application
  (Data leaves)      (I host)       (I control)

Bespoke Model:
  Client's Data  ──→  Client's Azure  ──→  Custom Application
  (Data stays)       (They host)         (I build, they own)
```

I build custom AI applications and deploy them **inside the client's own Azure tenant.** Their data never leaves their environment. There's no BAA for data transit. No vendor risk assessment for hosting. The application runs in their infrastructure, governed by their policies, managed by their IT team.

I'm not selling software. I'm selling the **capability to build it.**

---

## What This Looks Like In Practice

### The Three Products

**1. Agent Data Catalog** ($15-40K, 2-4 weeks)

The foundation. I run workshops with the client's team to document everything they know but have never written down:
- Business rules ("readmission" means within 30 days, not 60)
- Data sources (which databases, which fields, which quirks)
- KPI definitions (how exactly do we calculate market share?)
- Domain vocabulary (what does "attribution" mean in THIS organization?)

This becomes a structured knowledge repository — the "brain" that powers everything else. It's not a document. It's a machine-readable catalog that AI agents use to understand the client's world.

**2. Conversational AI Bots** ($10-25K per bot, 1-2 weeks)

Purpose-built bots deployed in Microsoft Teams (or web):

```
┌──────────────────────────────────────────┐
│  "Show me referral patterns from         │
│   Cedars to outside cardiologists        │
│   in the past 6 months"                  │
│                                          │
│  📊 Found 847 referrals to 34 unique    │
│  cardiologists. Top 5:                   │
│                                          │
│  1. Dr. Patel (Valley Heart) — 127      │
│  2. Dr. Chen (UCLA Med) — 94            │
│  3. Dr. Williams (Private) — 78         │
│  ...                                     │
│                                          │
│  [View Full Report] [Export CSV]         │
└──────────────────────────────────────────┘
```

Each bot does one thing well:
- **Data Reporting Bot** — Query claims data, generate reports, answer questions
- **Roster Management Bot** — Track provider relationships, manage outreach
- **Market Intelligence Bot** — Competitive analysis, patient migration patterns
- **Operations Bot** — Scheduling, resource utilization, KPI dashboards

The bots read from the Agent Data Catalog. When business rules change, you update the catalog — the bots adapt automatically.

**3. Dashboards & Custom Applications** ($15-50K, 1-3 weeks)

Web applications deployed as Azure Container Apps:
- Analytics dashboards with real-time data
- Provider search tools (like mydoclist.com)
- Workflow applications for specific teams
- Reporting portals with scheduled exports

These aren't generic dashboards. They're built for the specific questions the client's team asks every day.

---

## The Economics

### Why Clients Buy This

The alternative: hire a data engineer ($130K), a frontend developer ($140K), and a product manager ($120K). Wait 6 months for them to build something. Total: **$270K+ per year, plus 6 months before you see anything.**

My model:
- **Week 1-4:** Agent Data Catalog ($25K) — we document everything
- **Week 5-6:** First bot deployed ($15K) — team is using it
- **Week 7-8:** Dashboard live ($20K) — leadership has visibility
- **Ongoing:** $3-5K/month for data intelligence + maintenance

**Total first engagement: ~$55K. Time to first value: 5 weeks.** 

The math isn't even close. And the output is better, because I've spent years in healthcare BD building these exact capabilities. I'm not starting from scratch — I'm configuring a proven architecture for their specific needs.

### Why This Works for Me

Each client deployment strengthens my component library:
- Data pipeline templates
- Bot conversation frameworks  
- Dashboard layouts and patterns
- Entity resolution algorithms
- CMS data enrichment pipelines

Deployment #5 is 3x faster than deployment #1. The code isn't copy-paste (it's bespoke), but the patterns are reusable. **Each project makes the next one cheaper to deliver.**

```
Project 1: Build everything from scratch
            Revenue: $55K  |  Effort: 8 weeks  |  Margin: 40%

Project 5: Configure and customize
            Revenue: $55K  |  Effort: 3 weeks  |  Margin: 75%

Project 10: Nearly turnkey
             Revenue: $55K  |  Effort: 2 weeks  |  Margin: 85%
```

### The Recurring Revenue

Beyond the initial build:
- **Data Intelligence Subscription** ($2-5K/month) — I maintain CMS data pipelines, web crawls, third-party data enrichment. The client's data stays fresh.
- **Maintenance & Support** ($1.5-3K/month) — Updates, bug fixes, new features as needs evolve.

---

## The Five-Layer Moat

Why can't someone undercut me with a cheaper chatbot wrapper?

```
Layer 5: Ongoing Intelligence (subscription data keeps improving)
         ─────────────────────────────────────────────────
Layer 4: Speed (days vs months, compounding with each project)
         ─────────────────────────────────────────────────
Layer 3: Component Library (each deployment strengthens it)
         ─────────────────────────────────────────────────
Layer 2: Data Architecture (CMS pipelines, entity resolution)
         ─────────────────────────────────────────────────
Layer 1: Domain Knowledge (years in healthcare BD, claims, networks)
         ─────────────────────────────────────────────────
```

**Layer 1** is the hardest to replicate. I know how healthcare business development actually works — not from reading about it, but from doing it at Cedars-Sinai for 2+ years. I know what physician liaisons need. I know how claims data tells stories. I know which questions leadership asks and which metrics matter.

A developer can build a chatbot. But building the **right** chatbot — one that answers the questions the team actually asks, using data they actually trust, in language they actually use — requires domain knowledge that doesn't come from a tutorial.

---

## Why Not SaaS?

"Why not just build this as a multi-tenant platform?"

Three reasons:

1. **Healthcare clients won't send data.** The compliance friction of data-in-transit kills deals before they start. "It lives in your Azure" removes the objection entirely.

2. **Every client is different.** The KPIs, the data sources, the business rules, the workflows — they're different at every health system. A one-size-fits-all platform would require so many configuration options it would be more complex than building bespoke.

3. **Bespoke IS the value.** My clients aren't buying software features. They're buying the fact that someone who understands their domain built exactly what they need, in their environment, in weeks. That's not a bug in the model — it's the entire product.

*For more on why multi-tenant is becoming optional, read: [The Death of Multi-Tenant SaaS →](/ideas/death-of-multi-tenant)*

---

## Getting Started

If you're in healthcare leadership and this resonates, here's what an engagement looks like:

**Week 1: Discovery**
- 2-3 workshops with your team
- Map your data sources, business rules, key questions
- Identify quick wins and high-impact use cases

**Week 2-4: Build the Catalog**
- Structure everything into a machine-readable knowledge base
- Your domain expertise + my technical architecture = the foundation

**Week 5+: Deploy**
- First bot or dashboard goes live
- Team starts using it immediately
- Iterate based on real feedback

Everything deploys in your Azure tenant. Your data never leaves. You own the code. I'm the architect, not the landlord.

---

*Interested in exploring what this looks like for your organization? [Let's talk →](/contact)*
