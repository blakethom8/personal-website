# Corporate Email Agent: A Lightweight, IT-Approved AI Assistant

Research and materials for building and selling a simple, secure email assistant that runs on corporate laptops — the entry-point product for Bespoke AI Services.

## The Thesis

OpenClaw is extraordinary for personal use — full shell access, 5,400+ skills, cross-system navigation. But corporate IT will never approve it. The codebase is 434,000 lines, it needs Bash access, and it connects to messaging platforms.

The corporate email agent is the opposite: **50-200 lines of Python, 3-4 tools, sandboxed file access, local-only email reading, and a clear audit trail**. It does one thing well — helps knowledge workers manage their email — and does it in a way that even a cautious IT team can approve.

This is the wedge product. Once a client sees what a simple agent can do with their email, the conversation about broader AI infrastructure begins naturally.

## Contents

### Core Analysis
- [01-capability-security-tradeoff.md](./01-capability-security-tradeoff.md) — The central tension: capability vs. security vs. file access, and where to draw the line
- [02-technical-architecture.md](./02-technical-architecture.md) — How the agent works: COM for email, Claude API for intelligence, sandboxed output
- [03-capability-tiers.md](./03-capability-tiers.md) — Four tiers of agent capability, from "read-only email" to "full workspace assistant"

### Client-Facing Materials
- [04-security-compliance.md](./04-security-compliance.md) — Security posture, OWASP alignment, IT approval strategy, audit logging
- [05-client-proposal.md](./05-client-proposal.md) — The pitch deck in document form: what it does, how it works, what it costs, why IT should approve it

### Content
- [06-blog-outlines.md](./06-blog-outlines.md) — Blog post outlines for the corporate email agent series

## Context

This builds on:
- [OpenClaw architecture research](../openclaw/) — Understanding how the full agent works
- [Infrastructure research](../infrastructure/) — Mac Mini + Tailscale for personal use
- Bespoke AI Business Framework (sent to Dave Devries at ASH, 2026-02-25)
- Working prototype: Outlook COM email access tested on Blake's work machine

## Key Insight

The gap in the market isn't "more powerful AI agents." It's **AI agents that corporate IT will say yes to**. Every enterprise has Microsoft Copilot available at $30/user/month, but many teams don't use it because it's cloud-based and they don't trust where their email data goes. A local agent that never sends raw email content to the cloud fills that gap.
