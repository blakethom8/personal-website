---
title: "The Death of Multi-Tenant"
date: "2026-02-25"
tags: ["business", "technology", "healthcare-ai", "architecture"]
excerpt: "Why the SaaS model you grew up on is already obsolete — and what replaces it."
readTime: "10 min"
featured: false
category: "rethinking-saas"
---

# The Death of Multi-Tenant

*Why the SaaS model you grew up on is already obsolete — and what replaces it.*

---

## The Sacred Cow

For twenty years, the software industry has operated on a single article of faith: **multi-tenancy is the way.** Build one product. Host it on your servers. Sell subscriptions. Share the infrastructure across customers. Scale horizontally. This is how you build a billion-dollar software company.

And for twenty years, that was true. Building software was hard. Building it for each customer was insane. The economics only worked if you amortized the development cost across hundreds or thousands of tenants sharing the same architecture.

**That constraint no longer exists.**

AI-accelerated development has collapsed the cost of building bespoke software from months to days. The question isn't whether you *can* build custom software for each client anymore — it's whether you *should* still be forcing everyone onto the same platform.

I think the answer is no. And I think multi-tenant SaaS is about to have its Blockbuster moment.

---

## The Lie You've Been Sold

Here's what the SaaS pitch sounds like:

> "We'll host your data on our servers. We'll manage the infrastructure. You don't have to worry about anything. Just pay us monthly and we'll take care of it."

Sounds great. Until you think about what you're actually agreeing to:

- **Your data lives on someone else's servers.** You're trusting a vendor with your most sensitive information — patient records, financial data, competitive intelligence. You signed a BAA, sure. But your data is sitting in a database next to your competitor's data, separated by a `tenant_id` column.

- **You're constrained by their architecture.** Want a custom field? Submit a feature request. Want a different data model? Too bad, the schema serves 500 other customers. Want to integrate with your specific systems? Hope they have an API for that.

- **You're paying for everyone else's complexity.** Half the features exist because some other customer asked for them. You're subsidizing functionality you'll never use, running on infrastructure designed for the lowest common denominator.

- **You can't leave.** Your data is in their format, on their servers, accessible through their API. Migration is a project measured in months, not days. They know this. That's the business model.

Peter Steinberger put it bluntly on Lex Fridman's podcast: *"Every app is just a very slow API now, whether it wants to be or not."* The same is true of SaaS platforms. They're just slow, expensive, opinionated wrappers around your own data.

---

## What Changed

Two things happened simultaneously:

### 1. Building Software Got Absurdly Fast

I built a Microsoft Teams data analyst bot for a healthcare organization last week. It queries claims data, matches providers across datasets, generates reports, and renders interactive visualizations. It took two days.

Not two days because I cut corners. Two days because the architecture was already proven, the data pipeline was already built, and AI-assisted development handles the implementation at a speed that would've been science fiction three years ago.

This isn't a hack. It's a configured instance of proven infrastructure — component libraries, data schemas, pipeline templates, tool definitions. Each deployment gets faster because the library gets stronger.

When building custom software took six months, multi-tenancy made sense. When it takes two days, **why would you force a client onto shared infrastructure?**

### 2. The Data Sovereignty Question Got Loud

Especially in healthcare — but increasingly everywhere — organizations are asking a question they never bothered with before: **Why is our data on someone else's servers?**

The answer used to be: "Because that's the only way to get the software." That's no longer true.

In healthcare, the security and compliance gauntlet for SaaS adoption is brutal. BAA negotiation. Vendor risk assessment. Data governance review. Security architecture review. SOC 2 audit review. The sales cycle alone can take 6-12 months and kill a startup before it closes its first deal.

But deploy the same application *inside the client's own Azure tenant?* Their data stays in their environment. The AI runs on their Azure OpenAI instance. IT can inspect every container, every API call, every model interaction. Decommissioning is simple — it's their infrastructure.

You skip the entire procurement gauntlet. The CISO's biggest objection — "where does the data go?" — is answered before they ask it: **Nowhere. It stays right here.**

---

## The Schema Myth

There's a common objection: "But multi-tenant lets us iterate on the schema for everyone at once! How do you manage schema changes across bespoke deployments?"

This sounds scary until you think about it clearly.

**In the multi-tenant world,** schema changes are terrifying. One migration affects every customer. You need backward compatibility, feature flags, gradual rollouts, migration scripts that handle edge cases across hundreds of tenants. A bad migration takes everyone down. Every schema decision is a negotiation between what different customers need.

**In the bespoke world,** schemas are liberated. Each client's data model reflects *their* reality, not a compromise across a hundred different realities. Want to restructure your provider taxonomy? Go ahead — it's your database. Need a custom field for a workflow unique to your organization? Add it. It doesn't affect anyone else.

The key insight: **as long as the data persists, you can always build new features around it.** The data is the durable layer. The application is the ephemeral layer. When building a new application takes days, not months, the cost of rebuilding features around an evolved schema drops to near zero.

This is the opposite of how SaaS companies think. They treat the application as durable and the data as captive. We're flipping it: **your data is sovereign, and the application serves it.**

---

## "But What About Updates?"

Another objection: "If every client has their own deployment, how do you push updates?"

A few responses:

**First, not every client needs the same updates.** In multi-tenant, a feature one customer requested gets pushed to everyone. In bespoke, updates are intentional — you ship what adds value for that specific client.

**Second, the deployment model handles this.** Configuration-as-product means most "updates" are configuration changes, not code changes. New data sources, new tool definitions, new component schemas — these deploy without rebuilding the application.

**Third, when code changes are needed, they're fast.** The same AI-accelerated development that built the app in two days can update it in hours. Push a new container image, roll it in the client's environment. Done.

**Fourth — and this is the real point — bespoke doesn't mean disconnected.** Think of it like this: each deployment is a configured instance of a shared architecture. The component library, the data pipeline templates, the tool definitions — those evolve centrally. Each client gets the improvements that are relevant to them, deployed on their schedule, in their environment.

---

## Apps Are Already APIs

Here's the deeper shift that makes this inevitable. Peter Steinberger argues that every application is already an API — a "slow API" — whether the developer intended it or not.

If an agent can open a browser and interact with your SaaS product, your SaaS product is an API. A slow, expensive, opinionated API that the agent has to screenshot and HTML-parse to use.

The same logic applies in reverse. If I can expose my client's data and tools as a clean API (via MCP, WebMCP, or just well-structured endpoints), then any AI — Claude, Gemini, Copilot, whatever comes next — can interact with it directly. No screenshots. No parsing. No SaaS platform in the middle taking a cut and constraining the interaction.

**The SaaS platform becomes the unnecessary middleman.** The data has an API. The AI has the intelligence. The client has the infrastructure. What exactly is the multi-tenant platform contributing?

---

## The 80% of Apps Thesis

Steinberger predicts that 80% of apps will disappear. Not because the functionality goes away, but because **agents have more context than any single app.**

Why does your physician liaison need a separate CRM, a separate analytics platform, a separate market intelligence tool, and a separate report generator? They don't. They need an agent that understands their data, their workflows, and their goals — and can pull from any source to deliver what they need.

Multi-tenant SaaS exists because building all that functionality was expensive. Now it's not. The agent *is* the interface. The data layer *is* the platform. The bespoke deployment *is* the product.

---

## What Replaces Multi-Tenant

I'm not arguing against shared infrastructure or reusable components. I'm arguing against the *distribution model* that forces every customer onto the same architecture, the same schema, the same feature set, hosted on someone else's servers.

What replaces it:

**1. Bespoke deployment, shared intelligence.** Each client gets their own environment. The component library, data architectures, and tool definitions evolve centrally. Each deployment is a configured instance, not a fork.

**2. Data sovereignty by default.** The client's data lives in the client's environment. Full stop. No BAAs for data transit. No vendor risk assessments for hosting. The application comes to the data, not the other way around.

**3. AI as the interface layer.** Instead of building elaborate UIs that try to serve every use case, expose clean tools and let the AI (whether it's a Teams bot, a browser agent via WebMCP, or Claude Desktop) create the right experience for the moment.

**4. Configuration as product.** The value isn't the code — it's the blueprint. Which data sources matter, how they connect, what questions the business needs answered, what the schemas should look like. That's domain expertise encoded as configuration. It's what you're actually paying for.

**5. Subscription on intelligence, not infrastructure.** The recurring revenue isn't "hosting your data." It's enriching it — fresh external datasets, improved matching algorithms, new data sources, ongoing expertise. You're paying for the intelligence layer, not the compute.

---

## Who This Threatens

Let's be honest about who should be worried:

- **Horizontal SaaS platforms** that compete on features rather than domain expertise. When building features is cheap, your feature moat evaporates.
- **Analytics/BI tools** that host customer data centrally. When the client can have their own AI-powered analytics deployed locally, why send data to Tableau's servers?
- **Any platform where the primary value is "we host it for you."** Hosting is a commodity. Expertise is not.

## Who Wins

- **Domain experts who can build.** If you understand the industry AND can deploy AI solutions, you're the architect in a world where bricks are free.
- **Data infrastructure companies.** The ones building the plumbing (Azure, DuckDB, Supabase) — they win regardless of whether the deployment is multi-tenant or bespoke.
- **Clients.** They get exactly what they need, in their own environment, for a fraction of what they'd pay for a team of hires trying to make a SaaS platform do what they want.

---

## The Uncomfortable Truth

The uncomfortable truth for SaaS founders is this: **multi-tenancy was always a compromise, not a feature.** It was the only economically viable way to distribute software when building was expensive. The economics have changed. The compromise is no longer necessary.

Your customers never *wanted* to share infrastructure. They wanted the software. Now they can have the software — built for them, deployed in their environment, powered by their data — without the compromises that multi-tenancy forced on them.

The death of multi-tenant isn't a prediction. It's already happening. The companies that recognize it first will build the next generation of software businesses. The rest will be Blockbuster, wondering why nobody's coming to the store anymore.

---

*Blake Thomson is a healthcare data strategist and AI solutions builder based in Santa Monica, CA. He deploys bespoke AI applications inside healthcare organizations' own environments — because their data should never have to leave.*
