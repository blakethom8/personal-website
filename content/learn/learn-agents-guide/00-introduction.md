# How AI Agents Actually Work

**A practical guide to the systems, tools, and architecture that turn a language model into an autonomous agent.**

---

## Who This Is For

Colleagues, clients, family — anyone who wants to understand what an "AI agent" actually is and how it works. No programming experience required.

## What This Guide Is NOT About

You might expect a guide about AI to start with how models are trained — neural networks, transformer architecture, billions of parameters, deep learning math. We're skipping all of that.

Here's why: **the model is the engine, but an agent is the entire car.**

When you drive a car, you don't need to understand combustion engineering. You need to understand steering, brakes, GPS, and how they work together to get you somewhere. The engine matters — but it's one component in a much larger system.

The same is true for AI agents. The language model (the "engine") is impressive, but it's just a prediction machine. By itself, it can't read your files, search the web, query a database, or send an email. It takes text in and produces text out. That's it.

What makes an agent powerful is everything *around* the model — the system that gives it memory, tools, and the ability to take action in the real world. That system is what we're here to learn.

### A Quick Word on the Engine

We won't deep-dive into model training, but here's the one-sentence version: **a large language model (LLM) is the world's best autocomplete.** It was trained on enormous amounts of text and learned to predict what word comes next, given all the words before it. When you ask it a question, it's not "thinking" or "understanding" — it's generating the most likely sequence of words that should follow your input.

That's genuinely all it does. And somehow, that's enough to power the systems we're about to explore.

### What We Will Cover

This guide walks through the five core layers that turn a prediction engine into an autonomous agent:

| Module | What You'll Learn |
|--------|-------------------|
| **1. The Big Picture** | What an AI agent actually is — the engine vs. the car. How all the pieces fit together. |
| **2. How AI Communicates** | The structured messages that flow between you and the model. What actually gets sent over the internet. |
| **3. Context & Memory** | Why AI "forgets" everything between messages — and how we solve that. The most surprising part for most people. |
| **4. Tools & Actions** | How agents interact with the real world. This is what gives AI its "claws." |
| **5. Agentic Patterns** | How all the pieces compose into strategies. The difference between a chatbot and a true agent. |
| **Epilogue: Same Engine, Different Cars** | Why Claude Code, Claude Desktop, and ChatGPT behave so differently — even when they use the same model. |

By the end, you'll understand exactly what's happening when an AI assistant writes code, searches the web, or manages your calendar. No magic. No mystery. Just systems.

Let's start with the big picture.
