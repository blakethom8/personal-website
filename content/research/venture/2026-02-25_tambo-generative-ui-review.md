---
type: tech
source: "https://github.com/tambo-ai/tambo"
date: 2026-02-25
status: summarized
tags: ["tambo", "generative-ui", "react", "mcp", "zod"]
blog_potential: medium
---

# Tambo — Generative UI SDK for React

## Summary

Open-source React toolkit for building agents that render UI. Register components with Zod schemas → AI picks the right one → streams props → users interact with live components in chat.

## How It Works

1. Define React components (charts, tables, task boards, etc.)
2. Register with Zod schemas describing their props
3. User types natural language → LLM picks component + generates props
4. Component renders with streamed props in the chat interface

## Two Component Types
- **Generative:** Render once (charts, summaries, data visualizations)
- **Interactable:** Persistent, update as users refine (shopping carts, spreadsheets, task boards)

## Key Features
- Agent included (bring your own API key — OpenAI, Anthropic, Gemini, etc.)
- Streaming infrastructure (props stream as LLM generates)
- MCP integration (built-in, connect to external tools)
- Local tools (browser-side functions the AI can call)
- Self-hostable (MIT license)

## Comparison
| Feature | Tambo | Vercel AI SDK | CopilotKit |
|---------|-------|---------------|------------|
| Component selection | AI decides | Manual mapping | Via agent frameworks |
| MCP | Built-in | Experimental | Recently added |
| Persistent state | Yes | No | Shared patterns |
| Best for | Full app UI control | Streaming abstractions | Multi-agent workflows |

## Relevance to Blake's Venture
- Perfect for the "Dashboard + embedded chat" pattern
- Could power the web app product tier (Product 3: Dashboards & Bespoke Apps)
- Components like `<ProviderCard>`, `<ReferralChart>`, `<MarketAnalysis>` registered as Tambo components
- Generative UI means the same app adapts to different questions

## Potential Blog Angles
- "Generative UI: When the AI Decides What You See"
- "Tambo vs Building Your Own Chat UI"
