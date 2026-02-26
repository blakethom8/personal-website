# Agent-Native Web Application Architecture

*Date: 2026-02-25*
*Context: Blake's experience with Gemini browser side panel on mydoclist.com*

## The Insight

AI browser agents (Gemini side panel, Claude browser use, future WebMCP-native agents) can interact with web applications in real-time. This changes how we build web apps — they need to serve TWO users simultaneously:
1. **Humans** — visual UI, clicking, scrolling, reading
2. **AI agents** — structured data, programmatic APIs, tool discovery

## The Three-Layer Architecture

### Layer 1: AI Observability (DOM Anchors)

Make the existing visual UI instantly parseable by AI agents.

**Data attributes for anchoring:**
```html
<div data-ai-target="provider-card" data-provider-id="npi-1234567890">
<button data-ai-action="update-status" data-provider-id="npi-1234567890">
<body data-auth-state="logged-in" data-view="search-results" data-result-count="40">
```

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

**Purpose:** Helps current-generation agents (Gemini, Claude) that navigate visually. Reduces parsing time from seconds to milliseconds.

**Lifespan:** Useful now, becomes a nice-to-have once WebMCP tools are primary interface.

### Layer 2: Agent Action API (WebMCP Tools)

Register tools that agents auto-discover. This is the primary interface for AI interaction.

**Core tools for Provider Search:**

```javascript
// Read tools (any agent can use)
search_providers       → Query providers by name, specialty, location, radius
get_provider_details   → Deep profile for a specific provider (NPI, ratings, affiliations)
get_current_results    → Return the current search results as structured JSON
get_available_filters  → List all filter options (specialties, statuses, distance ranges)

// Write tools (authenticated agents)
update_provider_status → Tag a provider (High Priority, Tier 2, etc.)
bulk_classify          → Tag multiple providers at once
add_to_campaign        → Add provider to an outreach campaign
create_campaign        → Create a new campaign
export_to_csv          → Export current view or query results

// Async tools (returns Promise, shows loading state)
run_deep_search        → Cross-reference provider against CMS, NPI, affiliations
run_territory_analysis → Analyze a geographic area for provider density and opportunities
```

**Implementation pattern:**
```javascript
// Register tool with WebMCP
navigator.modelContext.registerTool({
  name: "search_providers",
  description: "Search the provider database by name, specialty, location. Returns structured results.",
  inputSchema: { /* JSON Schema */ },
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

// Fallback for agents without WebMCP support
window.AITools = window.AITools || {};
window.AITools.searchProviders = (params) => /* same logic */;
```

**Key principle:** WebMCP tools call the same internal functions as the UI. One codebase, two interfaces.

### Layer 3: Agent Projection Space (Dynamic UI)

The AI can command the web app to render components in a designated area.

**The Projection Space:**
- A slide-out panel on the right side (doesn't block main content)
- Can also render inline (expand a section within the results)
- User can pin, close, or resize AI-generated widgets
- Widgets are native React components, not iframes or images

**Tool:**
```javascript
navigator.modelContext.registerTool({
  name: "render_visualization",
  description: "Render a chart, table, or dashboard widget in the app's projection space",
  inputSchema: {
    type: "object",
    properties: {
      type: { enum: ["bar-chart", "pie-chart", "scatter-plot", "table", "map-overlay", "summary-card"] },
      title: { type: "string" },
      data: { type: "array" },
      options: { type: "object" }
    }
  },
  execute: async (config) => {
    renderInProjectionSpace(config); // Updates React state → renders component
    return { rendered: true, widgetId: generateId() };
  }
});
```

**Supported widget types:**
- Bar/pie/scatter charts (Recharts or similar)
- Data tables (sortable, filterable)
- Map overlays (highlight providers on the Leaflet map)
- Summary cards (key stats, comparisons)
- Territory heatmaps

## Security Model

- **Read tools:** Available to any agent, no auth required (public search data)
- **Write tools:** Require authenticated session (check cookie/token)
- **No credential passing:** Never expose login(email, password) as a tool
- **Rate limiting:** Apply same API rate limits to tool calls as regular API calls
- **Audit log:** Log all tool invocations (who, what, when)

## The Deep Search Pattern

```
Agent calls: run_deep_search("npi-1234567890")
                    │
                    ▼
┌─ Human sees: ────────────────────────────┐
│  Dr. Smith's card shows:                 │
│  "🔍 AI is analyzing affiliations..."    │
│  [beautiful skeleton/shimmer animation]  │
└──────────────────────────────────────────┘
                    │
         (backend processing 2-5s)
                    │
                    ▼
┌─ Agent receives: ────────────────────────┐
│  {                                       │
│    provider: "Dr. Jane Smith",           │
│    npi: "1234567890",                    │
│    affiliations: [...],                  │
│    medicareVolume: 1247,                 │
│    topProcedures: [...],                 │
│    matchConfidence: 0.94                 │
│  }                                       │
└──────────────────────────────────────────┘
                    │
                    ▼
┌─ Human sees: ────────────────────────────┐
│  Dr. Smith's card updates with rich      │
│  data: affiliations, volume, quality     │
│  scores — beautifully rendered           │
└──────────────────────────────────────────┘
```

Both users (human AND agent) get a great experience from the same action.

## Product Implications for the Business

This architecture IS the product differentiation:

- **Free tier:** Visual UI only (what exists today)
- **Pro tier:** AI tools enabled (WebMCP tools registered, deep search available, projection space active)
- **Client deployments:** Same architecture, their data, their Azure tenant

The agent-native layer is the premium feature. It's what makes a $15K dashboard worth $15K — because it works with the AI assistant that's already in the user's browser.

## Relationship to WebMCP Blog Post

This real-world implementation on mydoclist.com becomes content for the blog:
- "How We Made Provider Search Agent-Native"
- Live demo on the site (the site IS the proof of concept)
- Technical deep-dive on the three layers

## Next Steps

1. Implement Layer 1 (data attributes + JSON-LD) on current Provider Search
2. Create the WebMCP hook and register first 3 read tools
3. Test with Gemini side panel — verify tool discovery
4. Implement the Deep Search Promise pattern
5. Build the projection space component
6. Write the blog post about the experience
