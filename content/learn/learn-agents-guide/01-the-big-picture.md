# Module 1: The Big Picture

**What an AI agent actually is — why the model is not as interesting as the architecture supporting it.**

---

## The Model vs. The Agent

AI companies have used various branding language, so it's not a surprise that it's hard for us to separate the concept of the LLM model vs. the agent. However, it's critical to know that the LLM model is just part of the product you are engaging with when you are asking questions to ChatGPT in your browser.

In reality, there is a full architecture system supporting it, and you could use that model in the browser's ChatGPT architecture, or a different architecture that someone else built.

In simple terms, you could almost think of the model as the engine of the product, but there are all these other features you need to get from point A to point B. In LLM land, point A is input text you send to chat: *"What is the weather in Paris?"* Point B is the response you see: *"It is 23 degrees Celsius. Would you like a croissant there?"* Between the input and the response, there's a lot more happening under the hood that's not the LLM itself.

Within our Learning Module, I'll call this the **Agent Architecture**, where it includes these key components:

| Component | What It Does |
|-----------|-------------|
| **LLM Model** | The prediction engine. Takes text in, generates text out. That's it. |
| **System Prompt** | Instructions that shape how the model behaves — its personality, rules, and role. |
| **Context Window** | The conversation history and information the model can "see" at any given moment. |
| **Tools** | How the agent interacts with the real world — files, web, email, databases. |
| **Harness** | The code that orchestrates everything — runs the loop, manages memory, executes tools. |

---

## What Is a Harness?

You've probably used several harnesses without knowing it:

- **ChatGPT's web interface** — OpenAI's harness manages your conversation, provides web browsing and code execution tools, stores your chat history
- **Claude Desktop** — Anthropic's harness with file access and MCP tool support
- **GitHub Copilot** — A harness that feeds your code as context and provides code-editing tools
- **OpenClaw** — An open-source harness that runs on your local machine with deep system access (this is what powers the assistant I use daily)

Every AI product you interact with is a harness + a model. The model is often the same (Claude, GPT-4). The harness is what makes the experience different.

A harness (sometimes called an "agentic harness" or "agent framework") is the software that wraps around the model and turns raw text prediction into useful action. It's the most important piece most people have never heard of. Specifically, the harness:

1. **Receives your message** — from a chat window, Slack, a terminal, wherever
2. **Constructs the request** — assembles the conversation history, system prompt, and available tools into a structured package
3. **Sends it to the model** — makes the API call to Claude, GPT, or whatever engine you're using
4. **Reads the response** — determines if the model wants to use a tool or give a final answer
5. **Executes tool calls** — if the model requested an action (search the web, read a file), the harness actually does it
6. **Loops** — sends the tool result back to the model, which decides what to do next
7. **Returns the result** — when the model is done, the harness delivers the response to you

Without the harness, the model just sits there. It can't read your files. It can't search the web. It can't remember what you said yesterday. The harness provides all of that.

---

## What We'll Explore in This Guide

Every harness manages three fundamental things. We'll dedicate a full module to each:

- **Context & Memory** — The model has no memory. Every request starts fresh. The harness decides what information the model needs to see right now — conversation history, files, tool results — and packs it into a finite context window. *(Module 3)*
- **Tools & Actions** — A raw model can only generate text. Tools let it interact with the real world. The harness defines what tools are available and handles executing them. *(Module 4)*
- **Agentic Patterns** — How the harness orchestrates multi-step reasoning. The difference between a chatbot that answers once and an agent that plans, acts, observes, and iterates. *(Module 5)*

---

## Putting It Together

Let's trace what actually happens end-to-end when you ask an agent: *"What's on my calendar today?"*

**Point A — Your Input** → **Point B — The Response**

> **You:** "What's on my calendar today?"
>
> → **Harness** receives your message, assembles the full request: system prompt + conversation history + available tools + your new message
>
> → **Model** receives everything, responds: *"I need to check the calendar. I'll use the read_calendar tool for today's date."*
>
> → **Harness** executes the tool call, gets back 3 events
>
> → **Model** sees the results, composes the answer: *"You have 3 things today: 9 AM Team standup, 1 PM Lunch with Sarah, 3:30 PM Project review"*
>
> → **Harness** delivers the response to you

Two model calls. One tool execution. The model predicted text. The harness did everything else.

---

## Deep Dive: The API and What Sits on Top of It

AI companies like Anthropic and OpenAI sell direct access to their models through an **API** (Application Programming Interface). The API is the raw engine — you send it a structured message and get a response back. No chat interface, no memory between messages, no tools. Just text in, text out.

The API is the foundation. Everything else is built on top of it:

When you use **ChatGPT** or **claude.ai**, you're not talking to the model directly. You're using a harness that OpenAI or Anthropic built on top of their API. The chat interface, conversation memory, web search, file upload — that's all harness code. You get whatever tools they decided to include.

When someone builds a **custom agent** for a business, they use that same API — the same model — but wrap it in a different harness with different tools, different context, and different instructions. Same Claude Sonnet that powers claude.ai, but now with tools that query a healthcare database and a system prompt that understands medical terminology.

What actually makes these products different?

| | ChatGPT / Claude.ai | Custom Agent |
|---|---|---|
| **Model** | Same (Claude, GPT, etc.) | Same |
| **Tools available** | Web search, file upload, code sandbox | CRM, databases, email, domain-specific |
| **System prompt** | General-purpose assistant | Tailored for a specific job |
| **Context** | Your chat history | Business data + knowledge base |
| **Who controls it** | The AI company | You or your developer |

The model is the starting point, not the product. The tools available to the agent and the harness orchestrating them — that's what determines what it can actually do.

---

## Why This Matters

When you evaluate an AI product — or when someone tells you they're "building with AI" — the model is the *least* differentiating part. Most products use the same handful of models.

The real questions to ask:
- **What tools does the agent have?** (What can it actually *do*?)
- **How does it manage context?** (What does it know about you and your situation?)
- **What's the system prompt?** (What are its instructions and constraints?)
- **How is the harness built?** (How reliable, fast, and safe is the orchestration?)

The model is commodity. The system around it is the product.

---

**Next up:** [Module 2 — How AI Communicates →](./02-how-ai-communicates.md)

We'll look at the actual structured messages that flow between you and the model — what gets sent over the internet and what comes back.
