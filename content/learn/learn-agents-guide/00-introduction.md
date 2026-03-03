# How AI Agents Actually Work

## Why This Guide Exists

*A practical guide for understanding agents and peeking under the hood.*

By the end of this guide, I hope you'll understand how to think about agents — whether you're interacting with them in your browser with ChatGPT or using a tool like Claude Code. The best outcome would be for you to understand how these systems function so you can ask the right questions to learn about any agent you're interacting with.

---

## Who This Is For and a Note on Learning

This guide is for anyone who wants to understand what an AI agent actually is and how it works. While there is technical content, my goal is for the concepts to be accessible by everybody.

If there's anything to take away from this article, it's that you can use these LLM agents to learn anything you want. I highly recommend that while you're going through these writings, if there are topics you're curious about — or topics I don't explain well enough — you copy and paste that text and share it with any of your browser agents. I've found, through developing agentic applications, that these tools are the best teachers. You can ask them any question, and they will help — as long as you know how to ask it the right way.

---

## What This Guide IS About

This guide is how I think about LLMs from an application perspective. The key concepts you should be able to more deeply understand are:

- **The difference between the LLM model and an agent**
- **The structure of an API call** and what's included in the request-response cycle
- **System context, user messages, and context management**
- **Tools** — what they do, how an agent decides to use them
- **Multi-turn interactions** — ReACT patterns
- **How the full agentic harness** gives an agent its capability and character

## What This Guide IS NOT About

We will not do a deep dive into LLM models themselves. The concepts around transformers, neural networks, etc. are out of scope. To be frank, I do not believe you need to understand those details to apply agents today.

From an application standpoint, you should be able to understand the differences between models like Claude Opus versus Haiku or Sonnet, understand the context window, and learn a little more about how they operate — but the internals of model training are not something we'll cover here.

---

## What We Will Cover

**1. The Big Picture** — What an AI agent actually is: the engine vs. the car

**2. How AI Communicates** — The structured messages that flow between you and the model

**3. Context & Memory** — Why AI "forgets" everything between messages, and how we solve that

**4. Tools & Actions** — How agents interact with the real world

**5. Agentic Patterns** — The difference between a chatbot and a true agent

**Epilogue** — Why Claude Code, Claude Desktop, and ChatGPT behave so differently

---

Let's start with the big picture.
