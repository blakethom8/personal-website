---
type: tech
source: "Internal — Blake + Chief discussion"
date: 2026-02-25
status: summarized
tags: ["webmcp", "mcp", "architecture", "comparison"]
blog_potential: high
---

# WebMCP vs Standard MCP — When to Use Which

## Summary

Blake's question: "Why can't I just use regular MCP? Why is WebMCP different?" This doc captures the distinction and when each applies.

## The Key Distinction

**Standard MCP:** AI accesses your DATA from anywhere. Backend server, API endpoints, databases. The AI is in its own interface (Claude Desktop, ChatGPT). It calls your tools to get/write data. It never sees or touches your website.

**WebMCP:** AI operates your WEBSITE intelligently. Tools are declared in the page. The AI navigates, fills forms, reads page state. The user stays on the website. The AI helps them use it.

**They solve different problems:**
- "I want Claude Desktop to query my CMS data" → Standard MCP
- "I want the browser AI to help my user navigate the dashboard" → WebMCP
- "I want both" → Both. Same backend, two access patterns.

## The Missing Piece in Blake's Initial Thinking

Blake originally asked: "Can Gemini pull up my dashboard pre-filtered for a user?"

**Standard MCP can't do this** — it accesses data, not UI. It could return the data, but can't make the browser show anything.

**WebMCP can** — when the user has the dashboard open, the AI calls a `show_view(filters)` tool that updates React state → page re-renders with filtered results.

But WebMCP requires the page to be open. It can't launch your app from nothing.

**The combo:** Standard MCP returns a deep link URL → user clicks → dashboard opens → WebMCP takes over for interactive use.

## Decision Matrix

| Scenario | Use |
|----------|-----|
| AI needs data without the UI | Standard MCP |
| AI helps user navigate the existing UI | WebMCP |
| AI generates UI on the fly in a chat | Tambo |
| AI needs to update data AND reflect in UI | WebMCP (tool writes to DB + updates state) |
| AI works offline from the browser | Standard MCP |
| AI needs to read what the user currently sees | WebMCP |
| Multiple AI clients need access (Teams, Claude, Gemini) | Standard MCP (one server, many clients) |
| Site should work for AI in any browser | WebMCP (progressive, browser-native) |

## The "Don't Build a Bot" Insight

Blake's key realization: Why build a mediocre bot when Claude/Gemini/GPT are spending billions on the best bots? 

**The play:** Don't build the brain. Build the nervous system.
- Expose your app's capabilities as tools (both WebMCP and standard MCP)
- Let the user's preferred AI be the brain
- Your value = data + domain expertise + tool architecture
- The brain is commoditized. The tools are not.

## Potential Blog Angles
- "WebMCP vs MCP: A Practical Guide to AI-Enabling Your Web App"
- "Don't Build a Bot — Build the Nervous System"
