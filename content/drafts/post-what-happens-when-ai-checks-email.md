---
title: "What Happens When You Tell an AI Agent to Check Your Email"
date: "2026-03-01"
tags: ["openclaw", "ai-agents", "agent-loop", "the-terminal-and-the-agent"]
excerpt: "You type 'check my email' into your phone. Twelve seconds later, you have a categorized summary with action items. Here's everything that happened in between."
readTime: "8 min"
featured: false
category: "agent-interoperability"
---

# What Happens When You Tell an AI Agent to Check Your Email

*You type eight words into Telegram. Twelve seconds later, your AI tells you that your boss needs slides reviewed by Friday, a client loved the demo, and you have 12 newsletters you can safely ignore. Here's what happened in those twelve seconds.*

---

## The Message

It's 7:15 AM. You're making coffee. You pick up your phone, open Telegram, and type:

> Check my email and tell me what needs attention today.

That message hits OpenClaw's gateway — a Node.js process running on a Mac Mini in your living room. The Mac Mini is connected to your phone over Tailscale, an encrypted mesh VPN, so this works whether you're in your kitchen or a hotel in New York.

The gateway receives the message, spins up an agent session, and the clock starts.

---

## Second 0-1: The Boot Sequence

Before the agent reads a single email, it reads about *you*.

OpenClaw loads a set of Markdown files that form the agent's working memory:

- **SOUL.md** — Who the agent is. Its personality, communication style, and core instructions.
- **USER.md** — Who you are. Your name, your projects, your preferences. "Blake prefers concise summaries. He works on healthcare data during the week and AI infrastructure on weekends."
- **WORK.md** — What's currently in progress. Active projects, recent context, pending tasks.
- **MEMORY.md** — Things the agent has learned over time. "Blake's boss is Sarah. Dave Devries is the ASH client contact. The Q1 review is a recurring agenda item."

This is the part most people miss about AI agents. The reason OpenClaw's response feels *aware* — like it knows your boss is Sarah and the Q1 review matters — is because it read those files before it read your email. Context isn't magic. It's a folder of text files loaded before the first API call.

---

## Second 1-2: The Agent Thinks

The LLM (Claude, in this case) receives your message along with all that context. Now it reasons:

*"The user wants an email check. I need to access their email. Let me check what tools are available."*

OpenClaw has skills — Markdown files that teach the agent about specific systems. There's a skill for Gmail that says, roughly: "To access the user's email, use the `gmail-cli` command. It's authenticated and available on this machine."

The agent decides on its first move:

```
[Bash] gmail-cli list --after "2026-03-01" --format json --max 50
```

This is a bash command. Not an email plugin. Not an API integration. Just a CLI tool that's installed on the machine, called through the shell.

---

## Second 2-4: The Inbox Arrives

The command returns a JSON array of 23 emails. Each one includes a sender, subject, timestamp, and a short snippet — the first hundred characters or so of the body.

The agent doesn't read every email in full. That would waste tokens and time. Instead, it does what you would do: it scans the subjects and senders.

From 23 emails, the agent identifies:

- **3 that look important** — from your boss, a client, and a teammate requesting a code review
- **8 that are informational** — status updates, meeting notes, HR announcements
- **12 that are noise** — newsletters, tech digests, a promotional email from an airline

Now it needs the full text of those 3 important ones.

---

## Second 4-7: The Deep Read

Three more bash commands fire in sequence:

```
[Bash] gmail-cli read msg001 --format text
[Bash] gmail-cli read msg002 --format text
[Bash] gmail-cli read msg007 --format text
```

Each returns the complete email body. The agent now has:

1. **Sarah's email** about Q1 planning — she needs feedback on slides 12-18 by Friday
2. **Dave's email** from ASH — the team loved the prototype demo and wants to schedule a follow-up call
3. **A teammate's email** — PR #247 needs review, estimated 30 minutes

This is the adaptive part. The agent didn't read all 23 emails. It read 3. It chose those 3 based on who sent them and what the subjects suggested. If all 23 had been from important senders, it would have read more. If none looked urgent, it might have read zero and just given you the overview.

This is the agent loop at work: each tool call's result informs the next decision.

---

## Second 7-9: The Synthesis

Now something interesting happens: no tool call at all.

The agent has the email content in its context window. It reasons over everything — the 3 full emails, the 20 previews, your USER.md context about active projects, yesterday's memory log — and composes a structured summary.

This is pure LLM reasoning. No tool needed. The model categorizes, prioritizes, and writes a report. The quality of this step depends entirely on the model's capability, which is why it matters that Claude (or whatever model you're using) is genuinely good at understanding professional email.

---

## Second 9-11: The Output

Two tool calls fire:

```
[Write] ~/workspace/reports/email-summary-2026-03-01.md
```

A structured report lands in the workspace:

```markdown
# Email Summary — March 1, 2026

## Action Required (3)
- **Q1 Planning** from Sarah — review slides 12-18 by Friday
- **Client Follow-up** from Dave at ASH — schedule a call this week
- **Code Review** from teammate — PR #247, ~30 min

## FYI (8)
- Project status updates (3)
- Meeting notes from yesterday's all-hands (2)
- HR announcements (3) — benefits enrollment reminder

## Newsletters (12)
- Tech digests, industry news, promotional
```

Then the agent updates your task list:

```
[Edit] ~/workspace/TODO.md
→ Appends:
- [ ] Review Q1 slides 12-18 and reply to Sarah (by Friday)
- [ ] Schedule follow-up call with Dave at ASH
- [ ] Review PR #247 (~30 min)
```

And logs the activity to today's memory file:

```
[Edit] ~/memory/2026-03-01.md
→ "7:15 AM — Reviewed 23 emails. 3 action items identified. Report saved."
```

---

## Second 11-12: The Reply

The agent sends its response back through Telegram:

> Morning briefing ready. You have 3 action items:
> 1. Sarah needs Q1 slide feedback by Friday (slides 12-18)
> 2. Dave at ASH wants a follow-up call this week
> 3. PR #247 needs your review (~30 min)
>
> 8 FYI emails, 12 newsletters. Full report in your workspace.

You glance at it while pouring coffee. You know exactly what your morning looks like. The 30-minute inbox scan you would have done at your desk just happened in 12 seconds on your phone.

---

## The Tool Call Count

Let's tally what happened:

| Step | Tool | What It Did |
|------|------|-------------|
| 1 | Bash | Listed 23 emails (metadata only) |
| 2 | Bash | Read full email from Sarah |
| 3 | Bash | Read full email from Dave |
| 4 | Bash | Read full email from teammate |
| 5 | *(none)* | LLM synthesized the report |
| 6 | Write | Saved the report to workspace |
| 7 | Edit | Updated TODO.md with action items |
| 8 | Edit | Logged activity to daily memory |

**8 tool calls. 4 distinct tools. Zero plugins installed.**

There's no email plugin. No Gmail integration. No OAuth configuration screen. The agent used a CLI tool (`gmail-cli`) through bash — the same way you'd check email from a terminal, if you were the kind of person who checks email from a terminal.

---

## What Didn't Happen

This is almost more interesting than what did happen:

- **No email plugin was registered.** The agent used a CLI tool through bash. If tomorrow you switched to Fastmail, you'd install a different CLI tool and the agent would use that instead.
- **No full inbox was sent to the cloud.** The agent read 23 previews and 3 full emails. The other 20 emails never left your machine as full text.
- **No email was sent.** If you'd asked the agent to reply, it would create a *draft*. You'd review and send it yourself.
- **No database was queried.** The TODO updates are text edits to a Markdown file.
- **No other application was accessed.** The agent touched email and its own workspace files. Nothing else.

---

## The Adaptive Part

Here's what makes this an agent and not a script: the flow changes based on what it finds.

If Sarah's email had mentioned an attachment, the agent might have noted "attachment not yet reviewed" in the summary. If all 23 emails were newsletters, the agent would have said "nothing urgent today" and skipped the deep reads entirely. If one email contained a meeting conflict with your calendar, the agent could have checked `gcalcli` to verify and flagged it.

Each decision point — which emails to read, how to categorize them, what to include in the TODO — is the LLM reasoning in real time, based on intermediate results. The same 8 words ("check my email and tell me what needs attention") produce a different workflow every day because your email is different every day.

That's the agent loop: call a tool, read the result, decide what to do next, repeat until the task is done. The four tools (Read, Write, Edit, Bash) are primitives. The intelligence is in how the model composes them.

---

## The Twelve-Second Stack

```
Telegram message
    → OpenClaw gateway (Mac Mini, via Tailscale)
        → Agent session boots (SOUL.md, USER.md, MEMORY.md)
            → LLM reasons about available tools
                → Bash: gmail-cli list (23 email previews)
                    → LLM selects 3 important emails
                        → Bash: gmail-cli read (3 full emails)
                            → LLM synthesizes report
                                → Write: report to workspace
                                → Edit: TODO.md updated
                                → Edit: daily memory logged
    → Telegram response
```

Every layer is something you could inspect, modify, or replace. The gateway is Node.js. The agent engine is the Pi library. The email tool is a CLI binary. The memory is Markdown files. The LLM is an API call. The network is Tailscale.

There's no black box in this stack. And that's the point. When your AI agent checks your email, you should be able to trace exactly what happened. Not because you need to — but because the moment you can't is the moment you've given up more control than you realize.
