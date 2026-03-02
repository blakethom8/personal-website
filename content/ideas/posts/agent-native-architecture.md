---
title: "Agent-Native Architecture: Building Apps That Serve Humans and AI Simultaneously"
date: "2026-02-26"
excerpt: "AI browser agents can now interact with web apps in real-time. This changes how we build — apps need to serve two users: humans clicking buttons, and AI agents calling tools."
readTime: "10 min"
category: "technical-deep-dives"
tags: ["agents", "architecture", "webmcp", "ai", "web"]
featured: false
---

# Agent-Native Architecture: Building Apps That Serve Humans and AI Simultaneously

I was testing Gemini's new browser side panel on mydoclist.com when it hit me.

The agent could *see* the search results. It read the provider cards, understood the filters, and answered questions about the data — all without any special API integration. Just the visual UI, like a human would use.

But then I thought: what if the agent didn't have to *parse* the DOM? What if the app just told it what was there?

And then: what if the agent could *call functions* instead of clicking buttons?

That's when I realized we're building web apps wrong. Not for humans — they're fine. But for the next user: **AI agents that operate browsers in real-time.**

This is the agent-native architecture pattern I'm implementing on mydoclist.com. It's designed for two users simultaneously:
1. **Humans** — visual UI, clicking, scrolling, reading
2. **AI agents** — structured data, tool APIs, programmatic control

---

## The Three-Layer Architecture

I'm building three parallel interfaces into the same application. Each layer serves both users, but optimizes for different capabilities.

### Layer 1: AI Observability (DOM Anchors)

**For agents that navigate visually.**

Make the existing UI instantly parseable. Add semantic markers so agents don't have to guess what things are.

```html
<!-- Provider card becomes AI-readable -->
<div data-ai-target="provider-card" 
     data-provider-id="npi-1234567890"
     data-specialty="Cardiology"
     data-rating="4.8">
  
  <button data-ai-action="update-status" 
          data-provider-id="npi-1234567890">
    Tag as High Priority
  </button>
</div>

<!-- Page-level state -->
<body data-auth-state="logged-in" 
      data-view="search-results" 
      data-result-count="40">
```

**Why this helps:**
- Current agents (Gemini, Claude) navigate visually — they screenshot, parse, click
- Data attributes give them instant context without OCR guesswork
- Reduces parsing time from seconds to milliseconds
- Makes actions unambiguous ("click the button with `data-ai-action='update-status'`")

**JSON-LD for structured data:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SearchResultsPage",
  "query": "cardiologist 90401",
  "numberOfResults": 40,
  "results": [
    {
      "@type": "Physician",
      "name": "Dr. Jane Smith",
      "npi": "1234567890",
      "specialty": "Cardiology",
      "rating": 4.8,
      "distance": 3.2,
      "address": "1234 Ocean Ave, Santa Monica, CA 90401"
    }
  ]
}
</script>
```

This is what Google uses for rich snippets. Agents can read it too. The entire search result set becomes a single structured object they can reason about instantly.

**Lifespan:** Useful now with current-gen agents. Becomes a nice-to-have once WebMCP tools are the primary interface.

---

### Layer 2: Agent Action API (WebMCP Tools)

**For agents that call functions.**

This is the primary interface for AI interaction. Register discoverable tools that agents can invoke directly — no clicking, no DOM parsing, just function calls.

I'm exposing these core tools for Provider Search:

```javascript
// Read tools (public, no auth needed)
search_providers       → Query by name, specialty, location, radius
get_provider_details   → Deep profile (NPI, ratings, affiliations, volume data)
get_current_results    → Return the current search results as structured JSON
get_available_filters  → List all filter options (specialties, statuses, ranges)

// Write tools (authenticated users only)
update_provider_status → Tag a provider (High Priority, Tier 2, etc.)
bulk_classify          → Tag multiple providers at once
add_to_campaign        → Add provider to an outreach campaign
create_campaign        → Create a new campaign
export_to_csv          → Export current view or query results

// Async tools (returns Promise, shows loading state)
run_deep_search        → Cross-reference provider against CMS, NPI, affiliations
run_territory_analysis → Analyze a geographic area for density + opportunities
```

**Implementation pattern:**

```javascript
// Register with WebMCP
navigator.modelContext.registerTool({
  name: "search_providers",
  description: "Search the provider database by name, specialty, location. Returns structured results.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Provider name or specialty" },
      location: { type: "string", description: "City, ZIP, or address" },
      radius: { type: "number", description: "Search radius in miles", default: 10 },
      specialty: { type: "string", description: "Filter by specialty" }
    },
    required: ["query"]
  },
  execute: async (params) => {
    // Call your existing API
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await response.json();
    
    // Optionally update the visual UI too
    updateSearchResultsUI(data);
    
    return data; // Structured response to the agent
  }
});

// Fallback for non-WebMCP agents
window.AITools = window.AITools || {};
window.AITools.searchProviders = (params) => { /* same logic */ };
```

**Key principle:** WebMCP tools call the same internal functions as the UI buttons. One codebase, two interfaces. When the agent calls `update_provider_status()`, it's running the exact same logic as when a human clicks "Tag as High Priority."

No duplicate code. No API-vs-UI divergence. Just two entry points into the same functions.

---

### Layer 3: Agent Projection Space (Dynamic UI)

**For agents that want to render visualizations.**

The agent can command the web app to render components in a designated area. Not static text responses — actual interactive widgets.

**The Projection Space:**
- A slide-out panel on the right side (doesn't block main content)
- Can also render inline (expand a section within the results)
- User can pin, close, or resize AI-generated widgets
- Widgets are native React components, not iframes or images

**The tool:**

```javascript
navigator.modelContext.registerTool({
  name: "render_visualization",
  description: "Render a chart, table, or dashboard widget in the app's projection space",
  inputSchema: {
    type: "object",
    properties: {
      type: { 
        enum: ["bar-chart", "pie-chart", "scatter-plot", "table", "map-overlay", "summary-card"] 
      },
      title: { type: "string" },
      data: { type: "array" },
      options: { type: "object" }
    }
  },
  execute: async (config) => {
    // Update React state → component renders
    renderInProjectionSpace(config);
    return { rendered: true, widgetId: generateId() };
  }
});
```

**Supported widget types:**
- Bar/pie/scatter charts (using Recharts)
- Data tables (sortable, filterable)
- Map overlays (highlight providers on the Leaflet map)
- Summary cards (key stats, comparisons)
- Territory heatmaps

**Example interaction:**

```
User: "Show me the top specialties in Santa Monica"

Agent calls: search_providers({ location: "Santa Monica, CA", radius: 5 })
Agent receives: 147 providers across 12 specialties

Agent calls: render_visualization({
  type: "bar-chart",
  title: "Top Specialties in Santa Monica (5mi radius)",
  data: [
    { specialty: "Internal Medicine", count: 34 },
    { specialty: "Family Practice", count: 28 },
    { specialty: "Cardiology", count: 19 },
    ...
  ]
})

Human sees: Beautiful bar chart slides in on the right panel
```

Both users get value from the same action. The agent answers the question programmatically. The human sees a visualization.

---

## Security Model

Not all tools are available to everyone. I'm applying the same auth logic as the visual UI:

- **Read tools:** Available to any agent, no auth required (public search data)
- **Write tools:** Require authenticated session (check cookie/token)
- **No credential passing:** Never expose `login(email, password)` as a tool
- **Rate limiting:** Apply same API rate limits to tool calls as regular requests
- **Audit log:** Log all tool invocations (who, what, when)

The key insight: **Tools inherit the user's session.** When an agent calls `update_provider_status()`, it's running with the permissions of the currently logged-in user. No separate API keys, no OAuth dance. If the user can click the button, the agent can call the tool.

---

## The Deep Search Pattern

Some operations take time. Searching CMS data, running entity resolution, cross-referencing affiliations — these aren't instant. But the user (human AND agent) needs to know something's happening.

Here's the pattern:

```
Agent calls: run_deep_search("npi-1234567890")
                    │
                    ▼
┌─ Human sees: ────────────────────────────────┐
│  Dr. Smith's card shows:                     │
│  "🔍 AI is analyzing affiliations..."        │
│  [beautiful skeleton/shimmer animation]      │
└──────────────────────────────────────────────┘
                    │
         (backend processing 2-5s)
                    │
                    ▼
┌─ Agent receives: ────────────────────────────┐
│  {                                           │
│    provider: "Dr. Jane Smith",               │
│    npi: "1234567890",                        │
│    affiliations: [...],                      │
│    medicareVolume: 1247,                     │
│    topProcedures: [...],                     │
│    matchConfidence: 0.94                     │
│  }                                           │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌─ Human sees: ────────────────────────────────┐
│  Dr. Smith's card updates with rich data:   │
│  - Hospital affiliations                     │
│  - Medicare volume                           │
│  - Quality scores                            │
│  - Prescribing patterns                      │
└──────────────────────────────────────────────┘
```

Both users get a great experience from the same action. The agent gets structured data it can reason about. The human gets a beautifully rendered update to the UI.

**Implementation:**

```javascript
navigator.modelContext.registerTool({
  name: "run_deep_search",
  description: "Run comprehensive provider analysis using CMS data, affiliations, and quality scores. Takes 2-5 seconds.",
  execute: async (params) => {
    // Show loading state in UI
    showLoadingIndicator(params.npi);
    
    // Make the API call
    const response = await fetch(`/api/providers/${params.npi}/deep-search`, {
      method: 'POST'
    });
    const data = await response.json();
    
    // Update UI with results
    updateProviderCard(params.npi, data);
    
    return data; // Return to agent
  }
});
```

---

## Product Implications

This architecture IS the product differentiation.

### The Pricing Model

- **Free tier:** Visual UI only (what exists today)
- **Pro tier ($49/mo):** AI tools enabled
  - WebMCP tools registered
  - Deep search available
  - Projection space active
  - Async operations
  - Export tools
- **Enterprise ($custom):** Same architecture, client's data, their Azure tenant

The agent-native layer is the premium feature. It's what makes a provider search tool worth paying for — because it works seamlessly with the AI assistant that's already in your browser.

You're not just paying for search. You're paying for **agent-interoperability.**

### Why This Matters for Business

Most SaaS apps will add "AI chat" as a feature. A chatbot in the corner that answers questions about your data.

But that chatbot is *outside* the app. It's a separate interface. Users have to context-switch between the chat and the UI. The chat can describe the data, but it can't manipulate it. It can answer questions, but it can't take actions.

**Agent-native architecture is different.** The AI agent operates *through* the app, not alongside it. It calls the same tools, sees the same data, triggers the same workflows. When the agent classifies 50 providers, they're actually tagged in the database. When it exports a report, you get a real CSV. When it renders a chart, it's a native component in the app.

The app becomes the **shared workspace** for human and AI collaboration.

---

## Why Not Just Build a Chat Interface?

You might think: "Why not just build a chatbot that talks to your backend?"

Because **I want the agent to use the app, not replace it.**

If I build a chat interface, I've created a second UI. Now I have to maintain two interfaces to the same data:
- The visual web app (for humans)
- The chat interface (for AI)

They'll diverge. Features will ship to one but not the other. The chat will be missing context that the visual UI has. Or vice versa.

**Agent-native architecture unifies them.** There's one UI with two entry points:
1. Humans click buttons and fill forms
2. Agents call tools

Both paths lead to the same functions. No divergence. No duplication.

---

## Implementation Checklist

Here's what I'm actually building on mydoclist.com:

**Phase 1: DOM Observability (Done)**
- ✅ Add `data-ai-target` attributes to all interactive elements
- ✅ Add `data-provider-id` to provider cards
- ✅ Add JSON-LD structured data for search results
- ✅ Test with Gemini side panel — verify it can read the data

**Phase 2: WebMCP Tools (In Progress)**
- 🔄 Create WebMCP hook in React
- 🔄 Register 3 read tools (search, get_details, get_current_results)
- 🔄 Test tool discovery and invocation
- ⬜ Add 3 write tools (update_status, bulk_classify, export)
- ⬜ Implement auth checks on write tools
- ⬜ Add audit logging

**Phase 3: Async + Projection Space (Next)**
- ⬜ Implement Deep Search tool with Promise pattern
- ⬜ Build projection space React component
- ⬜ Register render_visualization tool
- ⬜ Add widget types: bar chart, pie chart, table, map overlay
- ⬜ Test with agent-generated visualizations

**Phase 4: Polish + Documentation**
- ⬜ Write developer docs (how to use the tools)
- ⬜ Record demo video
- ⬜ Blog post: "How We Made Provider Search Agent-Native"
- ⬜ Open-source the WebMCP integration pattern

---

## The Real Unlock

Here's what changes when your app is agent-native:

**Before:** "Show me cardiologists in Santa Monica"
- Agent searches Google
- Agent reads 10 different websites
- Agent summarizes what it found
- You manually open each site to verify
- You copy-paste data into your own spreadsheet

**After:** "Show me cardiologists in Santa Monica"
- Agent calls `search_providers({ specialty: "Cardiology", location: "90401" })`
- Agent gets structured results in 100ms
- Agent calls `render_visualization()` to show you a map
- You see results instantly, in the app you're already using
- You ask "Tag the top 10 by volume" → Agent calls `bulk_classify()`
- Done. 10 providers tagged in your database in 2 seconds.

The agent isn't summarizing the web for you. It's *operating your tools.*

That's the difference.

---

## What This Means for the Future

If agent-native architecture becomes standard, web apps won't just be "websites." They'll be **tool platforms** that serve two types of users:

1. **Humans** who prefer visual interfaces, clicking, and reading
2. **AI agents** who prefer structured APIs, tool calls, and programmatic control

Apps that support both will win. Apps that only serve humans will feel like they're missing something — like a car with no API.

And the best part? You don't have to rebuild from scratch. You're adding a parallel interface to what already exists. Layer 1 is just data attributes. Layer 2 is just function registration. Layer 3 is just a React component.

**The app stays the same. The interface doubles.**

---

I'm building this on mydoclist.com right now. It's not theoretical — it's shipping. The tools are registering. The agents are calling them.

And it's wild to watch an AI agent tag 50 providers in 3 seconds by calling a tool, when it would've taken me 10 minutes of clicking.

The future isn't AI replacing apps. It's AI *using* apps alongside us.

Let's build for both users.
