# OpenClaw Deep Dive Research

Research materials for understanding and communicating how OpenClaw works, what makes it different, and how its architecture enables cross-system AI agent capabilities.

## Contents

### Core Architecture Deep Dives
- [01-tool-calling.md](./01-tool-calling.md) — The Tool Call Structure: Pi library, the 4-tool philosophy, streaming agent loop
- [02-memory-context.md](./02-memory-context.md) — Memory + Context Management: file-based memory, semantic search, context compaction
- [03-agent-patterns.md](./03-agent-patterns.md) — Agent Patterns: session lifecycle, skills system, cross-system navigation

### Comparisons & Analysis
- [04-openclaw-vs-nanoclaw.md](./04-openclaw-vs-nanoclaw.md) — OpenClaw vs NanoClaw: philosophy, architecture, tradeoffs
- [05-pi-library.md](./05-pi-library.md) — The Pi Library: origin, influence, and the minimal agent thesis

### Practical Examples
- [06-cross-system-examples.md](./06-cross-system-examples.md) — How OpenClaw navigates across systems (email review, YouTube download, multi-tool workflows)

### Blog Post Drafts
- [07-blog-outlines.md](./07-blog-outlines.md) — Blog post outlines for communicating the "secret sauce"

## Key Sources

- OpenClaw Official: https://openclaw.ai/
- OpenClaw GitHub: https://github.com/openclaw/openclaw
- OpenClaw Docs: https://docs.openclaw.ai/
- NanoClaw: https://nanoclaw.dev/ | https://github.com/qwibitai/nanoclaw
- Pi Library analysis: https://lucumr.pocoo.org/2026/1/31/pi/

## Research Context

This research serves Blake's personal website content. The goal is to deeply understand and then communicate how OpenClaw works — focusing on single-session behavior, cross-system navigation, and what makes the architecture distinctive compared to Claude Code and other AI coding agents.
