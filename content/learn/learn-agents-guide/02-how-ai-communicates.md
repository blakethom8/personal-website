# Module 2: How AI Communicates

**The structured messages that flow between you and the model — what actually gets sent over the internet.**

---

## The Envelope Analogy

When you type a message into ChatGPT or Claude, it feels like a conversation. Like texting a really smart friend. But under the hood, something very different is happening.

Your message doesn't go directly to the AI. It gets packaged into a structured envelope — with your message, instructions, conversation history, and available tools — and shipped to a server. The server processes it, and ships back another structured envelope with the response.

Think of it like mailing a letter, except:
- Every letter includes a copy of your *entire previous correspondence*
- Every letter includes the recipient's job description
- Every letter includes a list of actions they're allowed to take
- And you get a response back in seconds

This structured format is how every AI application works — from ChatGPT to custom business agents to coding assistants. Understanding it demystifies the entire stack.

---

## What a Request Actually Looks Like

When you type *"What's the tallest building in LA?"* into a chat interface, your app constructs something like this and sends it to the AI provider's server:

```
┌──────────────────────────────────────────────────────┐
│              THE REQUEST ENVELOPE                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  To: api.anthropic.com/v1/messages                   │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  Model: claude-sonnet                        │    │
│  │                                              │    │
│  │  System Prompt:                              │    │
│  │  "You are a helpful assistant. Be concise."  │    │
│  │                                              │    │
│  │  Messages:                                   │    │
│  │    [You]:  "What's the tallest building      │    │
│  │             in LA?"                          │    │
│  │                                              │    │
│  │  Settings:                                   │    │
│  │    Temperature: 0.7                          │    │
│  │    Max tokens: 500                           │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

And the response comes back:

```
┌──────────────────────────────────────────────────────┐
│              THE RESPONSE ENVELOPE                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  From: api.anthropic.com                             │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  Role: assistant                             │    │
│  │                                              │    │
│  │  Content:                                    │    │
│  │  "The Wilshire Grand Center at 1,100 feet    │    │
│  │   (335 m). Completed in 2017, it's the       │    │
│  │   tallest building west of the Mississippi."  │    │
│  │                                              │    │
│  │  Usage:                                      │    │
│  │    Input tokens:  34                         │    │
│  │    Output tokens: 41                         │    │
│  │    Cost: ~$0.0004                            │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

That's the whole interaction. A structured request goes out. A structured response comes back. Every AI interaction you've ever had follows this exact pattern.

---

## The Anatomy of a Request

Let's break down each piece of the request envelope:

### Model

Which AI engine to use. Different models have different capabilities, speeds, and costs:

```
┌──────────────────────────────────────────────────────┐
│                   MODEL SELECTION                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Model              │ Good At           │ Cost       │
│  ───────────────────┼───────────────────┼─────────── │
│  claude-haiku       │ Fast, simple tasks│ Cheapest   │
│  claude-sonnet      │ Balance of both   │ Mid        │
│  claude-opus        │ Complex reasoning │ Expensive  │
│  gpt-4o            │ General purpose   │ Mid        │
│  gpt-4o-mini       │ Fast, cheap       │ Cheapest   │
│                                                      │
│  Same request, different model = different results.  │
│  Like choosing between a Honda and a Ferrari for     │
│  the same road trip.                                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### System Prompt

The hidden instructions that shape behavior. You don't see these as a user, but they're included in every request. We covered these in Module 1 — this is where they live in the actual message structure.

### Messages

The conversation history. We'll dive deep into this in Module 3, but the key insight: **every message you've exchanged gets re-sent every time.** The model doesn't remember anything — the harness re-sends the full history so the model can "see" the conversation.

### Settings

Parameters that control the response:

- **Temperature** — How creative vs. predictable (0 = robotic consistency, 1 = creative variation)
- **Max tokens** — Maximum response length (a token is roughly ¾ of a word)

---

## What About Tokens?

You'll see "tokens" everywhere in AI. Here's the simple version:

A **token** is a chunk of text — roughly ¾ of a word. The model doesn't read words; it reads tokens. Some examples:

```
┌──────────────────────────────────────────────────────┐
│                    TOKENIZATION                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Text                    │ Tokens  │ Count            │
│  ────────────────────────┼─────────┼──────────────── │
│  "Hello"                 │ [Hello] │ 1                │
│  "Hello world"           │ [Hello][ world] │ 2       │
│  "Unbelievable"          │ [Un][believ][able] │ 3    │
│  "ChatGPT is amazing"    │ [Chat][G][PT][ is]        │
│                          │ [ amazing] │ 5            │
│                                                      │
│  Common words = fewer tokens                         │
│  Unusual words = more tokens                         │
│  Code and numbers = often more tokens per character  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Why do tokens matter?

1. **Cost** — You pay per token (both input and output). More conversation history = more input tokens = higher cost per message.
2. **Limits** — The context window (Module 3) is measured in tokens. There's a hard cap on how much text the model can see at once.
3. **Speed** — More output tokens = longer wait for the response.

---

## When the Model Wants to Use a Tool

Here's where it gets interesting. Sometimes the model responds not with text for you, but with a **tool request** — a structured message saying "I need to do something before I can answer."

Let's say you ask: *"What's the weather in Santa Monica right now?"*

The model can't check the weather — it's a text predictor, not a weather service. So it responds with:

```
┌──────────────────────────────────────────────────────┐
│           RESPONSE: TOOL REQUEST                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Role: assistant                                     │
│                                                      │
│  Content:                                            │
│  ┌────────────────────────────────────────────┐      │
│  │  Type: tool_use                            │      │
│  │  Tool: get_weather                         │      │
│  │                                            │      │
│  │  Parameters:                               │      │
│  │    location: "Santa Monica, CA"            │      │
│  │    units: "fahrenheit"                     │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  ⚠️ The model did NOT check the weather.             │
│     It produced structured text REQUESTING           │
│     the harness to check the weather.                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

The harness sees this tool request, executes it (calls a weather API), and sends the result back:

```
┌──────────────────────────────────────────────────────┐
│           TOOL RESULT (sent back to model)            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Role: tool_result                                   │
│                                                      │
│  Content:                                            │
│    Temperature: 68°F                                 │
│    Condition: Partly cloudy                          │
│    Wind: 8 mph                                       │
│    Humidity: 72%                                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Now the model sees the weather data in its context and can compose a natural response: *"It's 68°F and partly cloudy in Santa Monica right now, with a light breeze."*

This back-and-forth — request, tool call, result, response — is the heartbeat of every AI agent. We'll explore tools in depth in Module 4.

---

## The Full Round Trip

Let's see the complete flow for a multi-step interaction. You ask: *"Summarize the last email from Devon."*

```
┌──────────────────────────────────────────────────────┐
│              COMPLETE ROUND TRIP                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ── Request 1 ──────────────────────────────────     │
│                                                      │
│  HARNESS → MODEL:                                    │
│    System: "You are a personal assistant with        │
│    access to email, calendar, and files."            │
│    Messages: [user: "Summarize the last email        │
│    from Devon."]                                     │
│    Tools: [read_email, search_email, send_email,     │
│    read_calendar, ...]                               │
│                                                      │
│  MODEL → HARNESS:                                    │
│    Tool request: search_email(                       │
│      from: "Devon",                                  │
│      limit: 1,                                       │
│      sort: "newest"                                  │
│    )                                                 │
│                                                      │
│  ── Harness executes tool ──────────────────────     │
│                                                      │
│  Email API returns: {                                │
│    subject: "Venue walkthrough Saturday",            │
│    body: "Hey! The estate confirmed us for 2pm      │
│    Saturday for the walkthrough. Should we bring     │
│    your parents? Also need to finalize the           │
│    caterer by next Friday..."                        │
│  }                                                   │
│                                                      │
│  ── Request 2 ──────────────────────────────────     │
│                                                      │
│  HARNESS → MODEL:                                    │
│    [previous messages + tool result]                 │
│                                                      │
│  MODEL → YOU:                                        │
│    "Devon's latest email is about the venue          │
│    walkthrough — the estate confirmed you for        │
│    2pm Saturday. She's asking if your parents        │
│    should come, and reminds you the caterer          │
│    decision is due by next Friday."                  │
│                                                      │
│  ── Stats ──────────────────────────────────────     │
│  Model calls: 2                                      │
│  Tool executions: 1                                  │
│  Total tokens: ~400                                  │
│  Cost: ~$0.003                                       │
│  Time: ~2 seconds                                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Two requests to the model. One tool execution. The user sees a clean, natural summary. Under the hood: structured envelopes going back and forth.

---

## The Raw Format (For the Curious)

Everything we've described gets transmitted as **JSON** (JavaScript Object Notation) — a standard format for structured data on the internet. If you want to see what the actual data looks like, here's the real request format:

```json
{
  "model": "claude-sonnet-4-20250514",
  "system": "You are a helpful personal assistant.",
  "max_tokens": 500,
  "messages": [
    {
      "role": "user",
      "content": "What's the tallest building in LA?"
    }
  ]
}
```

And the response:

```json
{
  "id": "msg_abc123",
  "model": "claude-sonnet-4-20250514",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "The Wilshire Grand Center at 1,100 feet..."
    }
  ],
  "usage": {
    "input_tokens": 34,
    "output_tokens": 41
  }
}
```

If this looks intimidating, don't worry — you never have to write JSON yourself. The harness handles all of this. But seeing it helps you understand that AI communication is just structured data, not magic.

> **🔬 Deeper dive:** Our interactive simulator lets you construct these messages yourself and see exactly what gets sent and what comes back. [Try the API Simulator →]

---

## Key Takeaways

1. **AI communication is structured** — not free-form chat, but formatted envelopes with specific fields
2. **Every request includes everything** — system prompt, conversation history, available tools, and your new message
3. **Responses are either text or tool requests** — the model either answers you or asks the harness to do something first
4. **Tokens are the currency** — you pay for input and output tokens, and there's a hard limit on how many fit in one request
5. **The harness handles the complexity** — you type naturally, and the harness translates that into structured messages behind the scenes

Understanding this format is foundational. Everything we cover from here — context management, tools, agentic patterns — is built on top of these structured messages going back and forth.

---

**Next up:** [Module 3 — Context & Memory →](./03-context-and-memory.md)

The model has no memory. Every single request starts from scratch. So how does it seem to remember your conversation? The answer is more surprising than you'd think.
