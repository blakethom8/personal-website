---
title: "The Future of Browser Applications: Building for the Agent That's Already Here"
date: "2026-02-26"
tags: ["technology", "webmcp", "ai", "building"]
excerpt: "I gave an AI agent access to my web app. Then I rebuilt the app to actually talk back. Here's what happened — and why every web developer should be paying attention."
readTime: "14 min"
featured: true
category: "technology"
---

# The Future of Browser Applications: Building for the Agent That's Already Here

*Last night I watched an AI agent try to use my website. It was painful. So I rebuilt the site to speak its language — and the result changed how I think about building web applications entirely.*

---

## The Moment It Clicked

I was sitting at my desk with Google Chrome open to [mydoclist.com](https://mydoclist.com) — a provider search tool I built for healthcare teams. Gemini was open in the side panel. On a whim, I asked it to help me find cardiologists near Santa Monica.

What happened next was... clumsy.

The AI could *see* the page. It could read the search results. But it was working so hard to do it — scanning the DOM, parsing card layouts, trying to figure out which button did what. It was like watching someone read a book through a keyhole.

**[SCREENSHOT: Before — Gemini struggling to parse the visual UI, reading individual cards]**

And then a thought hit me: *What if the website could just... talk to the agent directly?*

Not through the visual UI. Not through DOM scraping. Through a structured, instant, programmatic interface that the AI discovers automatically. What if the website was *designed* for this?

So I rebuilt it. In one night.

**[SCREENSHOT: After — Gemini executing tools instantly, getting structured data back]**

---

## The Problem: Websites Were Built for Eyes, Not Agents

Every website on the internet was designed for a single user: a human with eyes, a mouse, and a scroll wheel. We obsess over pixel-perfect layouts, hover states, and responsive breakpoints. We build for eyeballs.

But there's a new user in the browser now.

AI agents — Gemini in Chrome's side panel, Claude in its desktop app, Copilot in Edge — are sitting right next to the webpage, and they're trying to *use* it. Today, they do this the hard way:

1. **Read the DOM** — parse HTML elements, guess what's a button vs. a label
2. **Scrape the content** — extract text from cards, tables, lists
3. **Infer the structure** — figure out that these 40 divs are search results, each with a name, rating, and address
4. **Click things** — find the right button, simulate a click, wait for the page to update

It works. Barely. It's slow, fragile, and breaks whenever you change a CSS class name.

This is like giving someone a library card and making them read every book by holding each page up to a window from outside the building.

**What if we just gave them a key?**

---

## The Solution: Three Layers of Agent-Native Design

I rebuilt mydoclist.com with three layers, each building on the last. The entire refactor took one evening. The impact was immediate.

### Layer 1: Make the Page Readable (5 minutes of work)

The cheapest, easiest win. Two changes:

**Data attributes on every interactive element:**
```html
<!-- Before: The AI has to guess what this div does -->
<div class="card shadow-md rounded-lg p-4">
  <h3 class="font-bold">Dr. Jane Smith</h3>
  <span class="text-gray-500">Cardiology</span>
</div>

<!-- After: The AI knows exactly what this is -->
<div class="card shadow-md rounded-lg p-4" 
     data-ai-target="provider-card" 
     data-provider-id="npi-1234567890"
     data-provider-name="Dr. Jane Smith"
     data-specialty="Cardiology">
```

**Structured data injected as JSON-LD:**
```html
<script type="application/ld+json">
{
  "query": "cardiologist 90401",
  "resultCount": 40,
  "results": [
    { "name": "Dr. Jane Smith", "npi": "1234567890", 
      "specialty": "Cardiology", "rating": 4.8, "distance": 3.2 }
  ]
}
</script>
```

Before: The AI spends 3-5 seconds visually parsing 40 provider cards.
After: The AI reads all 40 results in **under 100 milliseconds.**

**[SCREENSHOT: Side-by-side — AI slowly reading cards vs. instantly parsing JSON-LD]**

That alone is a game-changer. But we're just getting started.

### Layer 2: Give the Agent Tools (The Real Power)

Reading is nice. But what about *doing*?

This is where WebMCP comes in. WebMCP (Model Context Protocol) is an emerging browser standard that lets web pages register **tools** that AI agents can discover and call programmatically. Think of it as an API, but instead of the developer calling it — the AI agent does.

Here's what I registered on the Provider Search page:

```javascript
// The AI can now search without touching the UI
navigator.modelContext.registerTool({
  name: "search_providers",
  description: "Search for healthcare providers by name, specialty, and location",
  inputSchema: { /* ... */ },
  execute: async ({ query, location, specialty }) => {
    const results = await api.search({ query, location, specialty });
    updateUI(results);     // Visual UI updates for the human
    return results;         // Structured data returns to the agent
  }
});
```

I registered tools for:
- **Searching** — query providers without touching the search bar
- **Reading details** — get a provider's full profile as structured JSON
- **Tagging** — classify providers as "High Priority" or "Tier 2" 
- **Bulk operations** — tag 20 providers at once with a single call
- **Exporting** — generate a CSV of the current results
- **Deep analysis** — cross-reference a provider against CMS Medicare data

The result? The AI doesn't click buttons anymore. It calls functions.

**[VIDEO: Asking Gemini "Tag all the cardiologists within 5 miles as High Priority" — watch it bulk-classify 12 providers in under 2 seconds]**

Try doing that by clicking.

### Layer 3: Let the Agent Paint on Your Canvas (The Magic)

This is the part that made my jaw drop.

I created an "Agent Projection Space" — a panel in the app where the AI can render native UI components. Charts, tables, comparisons, map overlays. Not in the chat sidebar. *In the app itself.*

```javascript
navigator.modelContext.registerTool({
  name: "render_visualization",
  description: "Render a chart or dashboard widget in the app",
  execute: async ({ type, title, data }) => {
    renderInProjectionSpace({ type, title, data });
    return { rendered: true };
  }
});
```

Now when I ask Gemini "Show me a chart of these providers by rating," it doesn't describe a chart in text. It *renders a real interactive chart* directly in my web app.

**[SCREENSHOT: A Recharts bar graph appearing in the projection panel, showing providers sorted by rating — native, interactive, beautiful]**

**[VIDEO: The full workflow — search → bulk classify → "now chart them by distance" → native chart appears]**

The AI is no longer just reading the web app. It's *co-creating the interface in real-time.*

---

## The Before and After

Let me show you the same workflow, twice.

### Before: Agent vs. Regular Website

**Task:** "Find cardiologists near Santa Monica, identify the top 5 by rating, tag them as High Priority, and show me a comparison."

**[SCREENSHOT SEQUENCE: Before]**
1. AI reads the page... slowly scans each card... (3-4 seconds)
2. AI tries to identify ratings by reading text... misses one... 
3. AI says "I can see Dr. Smith has 4.8 stars..." (it's reading out loud what it sees)
4. AI tries to click a status dropdown... it can't find the right element...
5. AI gives up on the chart: "I can't create visualizations, but here's a text summary..."

**Time: ~45 seconds. Accuracy: ~80%. Chart: impossible.**

### After: Agent + Agent-Native Website

**Task:** Same task.

**[SCREENSHOT SEQUENCE: After]**
1. AI calls `search_providers({ specialty: "Cardiology", location: "Santa Monica" })` → 40 results, instant
2. AI reads the structured JSON, sorts by rating in its head
3. AI calls `bulk_classify({ providerIds: [top5], tag: "High Priority" })` → all 5 tagged in 200ms
4. UI updates: 5 cards now show "High Priority" badge
5. AI calls `render_visualization({ type: "comparison", data: [top5 with metrics] })`
6. A native comparison widget slides into the projection panel

**Time: ~4 seconds. Accuracy: 100%. Chart: native and interactive.**

**[SIDE-BY-SIDE VIDEO: Same prompt, both versions, real-time]**

---

## Why This Matters (Beyond the Cool Demo)

### For Users

The AI assistant in your browser just became 10x more useful — but only on sites that are built for it. Users will gravitate toward agent-native applications because the experience is dramatically better. It's the difference between a smart assistant that can actually *do things* versus one that just narrates what it sees.

### For Developers

This is a new surface area to build for. Just like we learned responsive design for mobile and accessibility for screen readers, **agent-native design is the next required capability.** And it's not hard — Layer 1 takes five minutes.

### For Businesses

This is a moat. The first healthcare app that's agent-native has a massive advantage: every user with a browser AI becomes a power user overnight. The complexity of your application stops being a barrier — the agent handles it.

> My provider search tool has 40 results, filters, map interactions, status management, and CMS data enrichment. A new user would take 20 minutes to learn the interface. With the agent layer, they just *ask for what they want* on their first visit.

### For the Web

The web just got a second user. We spent 30 years building for human eyeballs. Now we need to build for both. The sites that adapt will thrive. The ones that don't will feel like they're stuck in 2025.

---

## A Note on Authentication

One question I get immediately: "If the AI can call functions on your site, what stops it from doing things the user isn't allowed to do?"

Short answer: the same thing that stops a user — authentication.

Every write tool checks the session before executing. If you're not logged in, the tool doesn't fail silently — it tells the agent why:

```javascript
execute: async ({ providerId, status }) => {
  if (!isAuthenticated()) {
    return { 
      error: "auth_required", 
      message: "You need to sign in to update provider status.",
      loginUrl: "/login"
    };
  }
  return await api.updateStatus(providerId, status);
}
```

The agent gets a clear signal: "I can't do this yet — the user needs to authenticate." It can then guide the user to sign in, and retry. Read tools (searching, viewing results) stay open. Write tools (tagging, classifying, exporting) require a session. Same permission model as your regular UI, just applied to the tool layer.

**One rule I'd strongly recommend: never expose credentials through tools.** No `login(email, password)` function. Let authentication happen through the normal UI flow — OAuth, SSO, whatever your app uses. The tools operate *within* an authenticated session, they don't *create* one.

---

## The Technical Architecture

For developers who want to implement this, here's the stack:

```
┌─ Layer 3: Projection Space ────────────────┐
│  AI renders native charts, tables, widgets │
│  in a designated app panel                 │
│  Tool: render_visualization(config)        │
├─ Layer 2: WebMCP Tools ────────────────────┤
│  Programmatic actions the AI discovers     │
│  and calls directly (search, tag, export)  │
│  Standard: navigator.modelContext          │
├─ Layer 1: DOM Observability ───────────────┤
│  data-ai-* attributes + JSON-LD           │
│  Makes existing UI instantly parseable     │
└────────────────────────────────────────────┘
```

Each layer is independent. You can ship Layer 1 today in five minutes and get immediate value. Layers 2 and 3 are where the magic happens — and they're closer to production-ready than you think.

**The key insight:** Your WebMCP tools should call the same internal functions as your UI. One codebase, two interfaces. When the AI calls `search_providers`, it hits the same API endpoint as the search bar. The tools are just a new front door.

---

## What I'm Building Next

mydoclist.com is my proving ground, but the pattern applies everywhere. I'm now building agent-native features into every application I create for clients:

- **Healthcare dashboards** that AI assistants can query and visualize
- **Data tools** where the agent handles the complexity and the user gets the insights
- **Internal apps** where non-technical staff use natural language to operate sophisticated systems

The browser agent isn't coming. It's here. The question is whether your application is ready to work with it.

---

## Try It Yourself

**Layer 1 (5 minutes):**
1. Add `data-ai-target` and `data-ai-action` attributes to your interactive elements
2. Inject a `<script type="application/ld+json">` with your page's structured data
3. Open Gemini side panel and ask it about your page

**Layer 2 (1-2 hours):**
1. Create a `useWebMCPTool` hook (see [WebMCP docs](#))
2. Register 2-3 read tools for your core data
3. Test: ask the browser AI to query your app through the tools

**Layer 3 (half a day):**
1. Install Recharts (or your preferred chart library)
2. Build a projection space component (a slide-out panel)
3. Register a `render_visualization` tool
4. Test: ask the AI to "show me a chart of..." — and watch it appear in your app

The future of browser applications isn't about prettier UIs. It's about building for the second user that's already sitting in every Chrome tab.

---

*Blake Thomson builds bespoke AI solutions for healthcare organizations. He's based in Santa Monica, CA, and is unreasonably excited about the intersection of web applications and AI agents.*

*Want to see the live demo? Visit [mydoclist.com](https://mydoclist.com) and open Gemini in the side panel.*

*Have questions or want to collaborate? [Get in touch →](/contact)*
