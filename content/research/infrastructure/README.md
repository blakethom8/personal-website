# Personal AI Infrastructure: Mac Mini + Tailscale + OpenClaw

Research and documentation for building a multi-machine personal AI infrastructure — a Mac Mini running OpenClaw agents, connected to a MacBook Pro via Tailscale, with clear file management boundaries and a security-first approach.

## Why This Matters

Most people interact with AI through a browser tab. Close the tab, the AI is gone. OpenClaw changes this — it's an always-on agent running on your machine, connected to your messaging apps, with persistent memory and full system access. But running it on your daily-driver laptop has real costs: battery drain, RAM contention, fan noise, and the uncomfortable feeling that your personal assistant is sharing resources with everything else you do.

The Mac Mini solves this. A dedicated, headless machine that runs your AI agents 24/7. Connected to your laptop over Tailscale's encrypted mesh VPN. Always available, never in the way.

This research documents the decision-making, setup process, security architecture, and file management strategy — with the goal of making this reproducible for others.

## Contents

### Decision & Architecture
- [01-decision-framework.md](./01-decision-framework.md) — Why Mac Mini, why Tailscale, what problem we're solving
- [02-tailscale-deep-dive.md](./02-tailscale-deep-dive.md) — What Tailscale actually is, how WireGuard works, the security model

### Setup & Configuration
- [03-mac-mini-setup.md](./03-mac-mini-setup.md) — Step-by-step from unboxing to running agents
- [04-file-management.md](./04-file-management.md) — What lives where, sync strategies, avoiding duplication

### Security
- [05-security-architecture.md](./05-security-architecture.md) — Threat model, hardening, monitoring, what we're protecting and from whom

### Blog Content
- [06-blog-outlines.md](./06-blog-outlines.md) — Blog post outlines for the "personal infrastructure" content series

## Context

This builds on existing research:
- [OpenClaw architecture deep-dive](../openclaw/) — How OpenClaw's tool calling, memory, and agent patterns work
- P2P compute research (Feb 2026) — Previously evaluated 5 approaches to multi-machine connectivity; Tailscale + Docker was the recommended MVP
- System optimization report (Feb 2026) — Profiled M3 Max at 43GB/48GB RAM usage, identified Docker Desktop as biggest memory hog

## Current Setup (Before Mac Mini)

| Component | Status |
|-----------|--------|
| Primary machine | MacBook Pro M3 Max, 48GB RAM, running at ~43GB |
| OpenClaw | npm global install, gateway on port 18789 (loopback only) |
| Tailscale in config | Present but mode: "off" |
| Gateway auth | Token-based |
| Messaging | Telegram enabled |
| Agent concurrency | Max 4 agents, max 8 subagents |
