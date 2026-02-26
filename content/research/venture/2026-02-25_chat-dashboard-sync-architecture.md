---
type: tech
source: "Internal — Blake + Chief architecture session"
date: 2026-02-25
status: summarized
tags: ["architecture", "teams-bot", "dashboard", "websocket", "gateway", "tambo"]
blog_potential: medium
---

# Chat + Dashboard Sync Architecture

## Summary

Explored how to make a Teams bot and a web dashboard communicate in real-time — so actions in chat update the dashboard and vice versa.

## The Problem

Two surfaces (chat bot + web dashboard) that are disconnected. User updates CRM in Teams → dashboard doesn't reflect it until refresh. User looks at a provider on dashboard → bot has no idea what they're viewing.

## Three Patterns Explored

### Pattern 1: Shared State via WebSocket (Tambo Way)
- Chat and UI share state through real-time connection
- AI picks components, streams props → dashboard renders inline in chat
- **Pros:** Tight integration
- **Cons:** Everything lives in chat UI. Doesn't work well in Teams (Adaptive Cards only)

### Pattern 2: Gateway Broker (OpenClaw Way)
- Central gateway receives messages from Teams OR web chat
- Pushes UI events to dashboard via WebSocket
- Bot and dashboard are two windows into the same session
- **This is the recommended pattern for Blake's use case**

### Pattern 3: Hybrid — Chat Embedded in Dashboard
- Chat widget inside the dashboard, context-aware (reads current page state)
- **Where Tambo shines** — built for this exact pattern

### Recommended Architecture
Layer the patterns:
1. Primary: Dashboard + embedded chat (Pattern 3, Tambo-powered)
2. Secondary: Teams bot synced via gateway (Pattern 2)
3. Shared state layer via WebSocket

## Technical Skeleton
- Web Dashboard (React + Tambo) with WebSocket client
- Gateway Service (FastAPI/Node) — WebSocket server + Teams webhook + session manager + MCP tools
- MCP Server — data tools, CRM, provider search
- Data Layer — client database + enrichment

## Key Insight
The real product isn't any single bot or dashboard — it's the gateway layer that makes any surface intelligent.

## Potential Blog Angles
- "Building AI Interfaces That Talk to Each Other"
- "The Gateway Pattern: One Brain, Many Surfaces"
