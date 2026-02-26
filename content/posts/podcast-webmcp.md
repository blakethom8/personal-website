---
title: "WebMCP: Making Websites Talk to AI (Without Building an API)"
date: 2026-02-26
category: podcast-notes
tags: [webmcp, agents, AI, web, architecture, APIs]
summary: "WebMCP is like responsive design for AI — annotate your website once, and agents can discover and use your tools automatically. No separate MCP server needed."
podcast: "Syntax #979 - WebMCP: New Standard to Expose Your Apps to AI"
status: draft
---

# WebMCP: Making Websites Talk to AI (Without Building an API)

*Notes from Syntax #979 with Wes Bos & Scott Tolinski*

---

## The TL;DR

**WebMCP** = Annotate your website so AI agents can discover and use tools **through your actual web UI** (no separate MCP server needed!)

It's like **responsive design for AI**:
- 2010: "Add a media query, now your site works on mobile"
- 2026: "Add WebMCP annotations, now your site works with AI"

---

## The Problem WebMCP Solves

### Three Ways AI Can Interact With Apps Today

| Approach | How It Works | Problems |
|----------|-------------|----------|
| **Built-in AI** | Embed AI directly in your app | Expensive, you foot the LLM bill |
| **MCP Server** | Separate server exposes tools | Need to build/maintain separate backend |
| **Playwright** | AI scrapes HTML/screenshots | Fragile, slow, breaks on redesign |
| **WebMCP** ⭐ | Annotate your existing UI | Low barrier to entry, works with auth |

### Why Playwright Sucks

**Traditional browser automation:**
1. Launch browser
2. Visit site
3. Dump entire HTML (or take screenshot)
4. Use vision model to guess what to click
5. Hope it works
6. Repeat

**Problems:**
- **Slow** (screenshots + vision models = seconds per action)
- **Fragile** (UI changes break it)
- **No context** (what does this button actually do?)
- **Expensive** (vision model calls add up)

### WebMCP Approach

1. Launch browser
2. Visit site
3. Read WebMCP annotations (built into HTML)
4. Discover tools ("add_item", "delete_item", "search")
5. Execute tools directly
6. Done

**Benefits:**
- **Fast** (no vision model needed)
- **Reliable** (tools are self-documenting)
- **Works with authentication** (AI uses your logged-in session)
- **Low barrier to entry** (just annotate your existing HTML)

---

## Demo: Grocery List App

Wes built a demo grocery app (Kanban-style):
- Multiple stores (Costco, Trader Joe's, etc.)
- Items under each store
- Operations: add, delete, check off, reorder

### Without WebMCP

**Agent experience:**
1. Visit grocery app
2. See giant blob of HTML
3. Try to find "add item" button in 2,000 lines of HTML
4. Click wrong button
5. Try again
6. Eventually give up or get lucky

### With WebMCP

**Agent experience:**
1. Visit grocery app
2. Read WebMCP tool definitions (built into page)
3. See: `add_item`, `delete_item`, `mark_complete`, `reorder`
4. Call `add_item({ store: "Costco", item: "milk" })`
5. Done

**User sees:** Item appears in UI in real-time (they're watching their actual grocery app, not just chat)

---

## How WebMCP Works (Technical)

### Annotate Your Forms

**Before (regular HTML):**
```html
<form action="/add-item" method="POST">
  <input name="store" placeholder="Store" />
  <input name="item" placeholder="Item" />
  <button type="submit">Add Item</button>
</form>
```

**After (WebMCP):**
```html
<form 
  action="/add-item" 
  method="POST"
  webmcp-tool="add_item"
  webmcp-description="Add an item to a grocery list">
  
  <input 
    name="store" 
    placeholder="Store"
    webmcp-param="store"
    webmcp-param-description="Store name (Costco, Trader Joe's, etc.)" />
  
  <input 
    name="item" 
    placeholder="Item"
    webmcp-param="item"
    webmcp-param-description="Item to add to the list" />
  
  <button type="submit">Add Item</button>
</form>
```

Now agents can **discover** this tool automatically by reading the annotations.

### Publish Tool Definitions

**In your JavaScript:**
```javascript
// Register tools with WebMCP
WebMCP.registerTools([
  {
    name: "add_item",
    description: "Add an item to a grocery list",
    parameters: {
      store: { type: "string", description: "Store name" },
      item: { type: "string", description: "Item to add" }
    }
  },
  {
    name: "delete_item",
    description: "Delete an item from a list",
    parameters: {
      item_id: { type: "string", description: "Item ID to delete" }
    }
  }
]);
```

Agents can now query: *"What tools are available on this page?"*

---

## WebMCP vs API: Why This Matters

### The API Problem

**What happened:**
- 2010s: Every app had a free API (Twitter, Reddit, Instagram)
- Developers built amazing tools (100+ Twitter clients!)
- Companies realized: *"Wait, we want people on OUR platform"*

**Current state:**
- Twitter API: $200 per 1,000 requests (was free)
- Reddit API: Gone entirely
- Instagram API: Impossible to use

**Why:** Companies want you using their platform so they can monetize.

### WebMCP as the Solution

**Not everyone will:**
- Build an MCP server (too complex)
- Create ChatGPT apps (too much work)
- Open up their APIs (not profitable)

**But WebMCP?**
- Small changes to existing HTML
- No separate server needed
- Like responsive design ("just a few tweaks and now it works")
- **Low barrier to entry for AI-friendliness**

From Wes:
> "I think this is a very good bridge... somebody can simply just add a couple properties to forms on their HTML or publish whatever tools they want... and your website is just ready."

---

## Real-World Use Case: mydoclist.com

I'm building [mydoclist.com](https://mydoclist.com) — a provider search tool for physician liaisons (healthcare BD).

### Current State

**Without WebMCP:**
- Users manually search (type specialty, location, click search)
- Results display in browser
- No AI integration

**Agent interaction requires:**
- Reverse-engineer API (if it exists)
- Or use Playwright (brittle browser automation)
- Or users can't use it with agents

### With WebMCP (Proposed)

**Annotate search form:**
```html
<form webmcp-tool="search_providers">
  <input 
    name="specialty" 
    placeholder="Specialty"
    webmcp-param="specialty"
    webmcp-param-description="Medical specialty (e.g., Cardiology, Endocrinology)" />
  
  <input 
    name="location" 
    placeholder="Location"
    webmcp-param="location"
    webmcp-param-description="City or ZIP code" />
  
  <button type="submit">Search</button>
</form>
```

**Agent interaction:**
1. User: *"Find cardiologists near Cedars-Sinai"*
2. ChatGPT opens `mydoclist.com`
3. Discovers `search_providers` tool
4. Fills form: `specialty="Cardiology"`, `location="Cedars-Sinai"`
5. Submits
6. Results appear in UI (user sees familiar Provider Search interface)

**Key benefit:** Users see the *actual Provider Search UI*, not just data in chat.

---

## Current Status & Limitations

### As of Feb 2025

**Early access:**
- Brand new (early access signups)
- Chrome sidebar for testing (not final UI)
- Spec still being defined
- Will likely integrate with ChatGPT/Claude eventually

**Open questions:**
- **Cross-app coordination?** Can AI visit multiple WebMCP sites in one task?
- **Headless operation?** Can agents use WebMCP without opening visible browser?
- **Authentication patterns?** How does AI log in as user? (cookies? OAuth?)

### Wes's Prediction

> "I think this is a very good bridge... somebody can simply just add a couple properties to forms on their HTML or publish whatever tools they want... and your website is just ready."

---

## Three Paths Forward (For Builders)

### Option 1: Wait for WebMCP (Early Access)

**Pros:**
- Cleanest approach
- No separate server needed
- Low maintenance

**Cons:**
- Brand new, spec still evolving
- Not widely supported yet

**Timeline:** Available now in early access

### Option 2: Build Puppeteer MCP (Works Today)

**Pros:**
- Works immediately
- Full control

**Cons:**
- More brittle
- Requires Playwright/Puppeteer knowledge

**Timeline:** Could build in a day

### Option 3: Hybrid Approach

**API** for fast data operations  
**WebMCP/Puppeteer** for UI interactions when user wants to see the app

**Example:**
- *"Get me provider data"* → API (fast, data-only response)
- *"Show me providers in the app"* → WebMCP (user sees actual UI)

**Timeline:** Build iteratively

---

## Why UI Matters (Sometimes)

### The Case For Showing The UI

Not everything should be API-only. Sometimes users **want to see the interface.**

**Example use cases:**

**1. Exploratory search:**
- User: *"Show me cardiologists in LA"*
- Agent opens mydoclist.com, performs search
- User sees results **in the familiar UI**
- User can: click providers, view details, export, refine search visually

**2. Visual confirmation:**
- User: *"Add milk to my grocery list"*
- Agent performs action
- User sees item appear in their actual grocery app
- Visual feedback = confidence that it worked

**3. Complex interactions:**
- Some workflows are easier with UI than pure chat
- Example: Comparing 10 providers side-by-side
- Chart/map view > text list

### When API-Only Is Better

**1. Simple data retrieval:**
- *"What's the weather?"*
- No need for UI, just need the answer

**2. Background automation:**
- *"Check my email every morning and summarize urgent messages"*
- No human watching, UI is unnecessary

**3. Batch operations:**
- *"Export all providers to CSV"*
- Data-only operation, UI adds no value

---

## The Business Model Shift

### Old Model: Lock Users Into Your Ecosystem

- Build walled garden
- Force users to use your app exclusively
- Maximize time-on-platform

**Problem:** Agents break down walls. They connect across platforms.

### New Model: Be The Best Data Source

- Provide valuable data/services
- Make it **easy** for agents to access
- Become the **go-to** source for your domain

**Example:**
- Weather apps that fight agent access → users switch to agent-friendly weather sources
- Weather apps that embrace agents → become the default weather provider for millions of agents

---

## Key Takeaways

1. **WebMCP = responsive design for AI** — small changes, big impact
2. **Lower barrier than building MCP servers** — annotate existing HTML
3. **Works with authentication** — agents use your logged-in session
4. **UI still matters** — not everything should be API-only
5. **Early days** — spec evolving, but directionally correct
6. **Agent-friendly wins** — companies that adapt fastest win market share

---

## What To Do Right Now

### If You're Building A Web App

**Step 1:** Read the [WebMCP spec](https://webmcp.org) (early access)

**Step 2:** Identify high-value workflows:
- What do users do most often?
- What's tedious to do manually?
- What would be useful to automate?

**Step 3:** Start small:
- Annotate one form
- Test with Chrome DevTools
- See if agents can discover it

**Step 4:** Expand gradually:
- Add more tools
- Document clearly
- Get user feedback

### If You're A User

**Step 1:** Look for WebMCP-enabled sites (early access required)

**Step 2:** Try agent interactions:
- *"Add X to my Y"*
- *"Search for Z on [website]"*
- *"Show me..."*

**Step 3:** Give feedback to developers:
- What worked?
- What broke?
- What would be useful?

---

## The Future: Agent-Native Web

### What "Agent-Native" Means

Sites designed **for both humans and agents**:
- Beautiful UI for humans
- Structured annotations for agents
- Works seamlessly for both

**Not:** "AI replaces humans"  
**Is:** "Humans + AI work better together"

### The Prediction

Within 2-3 years:
- **50%+ of new web apps** will have WebMCP annotations
- **Major platforms** (Shopify, WordPress, etc.) will add WebMCP support by default
- **Agent-unfriendly sites** will lose traffic to agent-friendly competitors

The web will bifurcate:
- **Walled gardens** (try to block agents, slowly die)
- **Open gardens** (embrace agents, thrive)

Choose wisely.

---

## Resources

- **WebMCP Early Access:** [webmcp.org](https://webmcp.org)
- **Syntax Podcast #979:** [syntax.fm/show/979](https://syntax.fm/show/979)
- **Wes Bos:** [wesbos.com](https://wesbos.com)
- **Scott Tolinski:** [scotttolinski.com](https://scotttolinski.com)

---

## About the Author

Blake Thomson works in healthcare data strategy at Cedars-Sinai and is building [mydoclist.com](https://mydoclist.com), a provider intelligence platform. He's deeply interested in agent-native design and exploring how WebMCP can make healthcare data tools more accessible.

This post is his interpretation of the Syntax podcast on WebMCP. Highly recommend listening to the full episode for the interactive demo and deeper technical discussion.

---

## Appendix: WebMCP Example (Full)

### Complete Grocery App Form

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Grocery List</title>
  <script src="https://cdn.webmcp.org/v1/webmcp.js"></script>
</head>
<body>
  <h1>Grocery List</h1>
  
  <!-- Add Item Form -->
  <form 
    action="/api/add-item" 
    method="POST"
    webmcp-tool="add_item"
    webmcp-description="Add an item to a grocery store list">
    
    <label for="store">Store:</label>
    <select 
      id="store" 
      name="store"
      webmcp-param="store"
      webmcp-param-description="Store name (Costco, Trader Joe's, Whole Foods)">
      <option value="costco">Costco</option>
      <option value="traderjoes">Trader Joe's</option>
      <option value="wholefoods">Whole Foods</option>
    </select>
    
    <label for="item">Item:</label>
    <input 
      id="item"
      name="item" 
      type="text"
      placeholder="e.g., Milk, Eggs, Bread"
      webmcp-param="item"
      webmcp-param-description="Item to add to the list" />
    
    <button type="submit">Add Item</button>
  </form>
  
  <!-- Item List -->
  <div id="items">
    <div class="store-section">
      <h2>Costco</h2>
      <ul>
        <li data-item-id="123">
          Milk
          <button 
            webmcp-tool="delete_item"
            webmcp-param-item_id="123">Delete</button>
        </li>
      </ul>
    </div>
  </div>
  
  <script>
    // Register tools
    WebMCP.registerTools([
      {
        name: "add_item",
        description: "Add an item to a grocery store list",
        parameters: {
          store: { 
            type: "string", 
            enum: ["costco", "traderjoes", "wholefoods"],
            description: "Store name" 
          },
          item: { 
            type: "string", 
            description: "Item to add" 
          }
        }
      },
      {
        name: "delete_item",
        description: "Delete an item from a list",
        parameters: {
          item_id: { 
            type: "string", 
            description: "Item ID to delete" 
          }
        }
      }
    ]);
  </script>
</body>
</html>
```

This is all it takes to make your app agent-friendly with WebMCP.
