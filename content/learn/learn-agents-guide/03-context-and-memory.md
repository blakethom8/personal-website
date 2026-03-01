# Module 3: Context & Memory

**Why AI "forgets" everything between messages — and the clever tricks we use to solve it.**

---

## The Goldfish Problem

Here's the most surprising thing about AI for most people: **the model has zero memory.**

Every single time you send a message, the model starts completely fresh. It doesn't remember your name. It doesn't know what you asked five seconds ago. It doesn't retain anything between calls. It's like talking to someone with total amnesia — every interaction begins from scratch.

So how does ChatGPT seem to remember your conversation? How does it know you were just talking about Japan when you ask "What about the food?"

The answer is simple and a little mind-bending: **your app re-sends the entire conversation every time.**

---

## The Illusion of Memory

When you're five messages deep in a conversation, here's what actually gets sent on your sixth message:

```
┌──────────────────────────────────────────────────────┐
│          WHAT GETS SENT ON MESSAGE #6                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  System: "You are a helpful travel assistant."       │
│                                                      │
│  Messages:                                           │
│                                                      │
│  1. [You]:  "Hi, I'm planning a trip to Japan"      │
│  2. [AI]:   "That sounds exciting! When are..."      │
│  3. [You]:  "Next April, for two weeks"              │
│  4. [AI]:   "April is perfect for cherry..."         │
│  5. [You]:  "I love hiking. Recommendations?"        │
│  6. [AI]:   "For hiking in Japan during..."          │
│  7. [You]:  "What about the food?"      ← NEW       │
│                                                      │
│  ─────────────────────────────────────────────────   │
│  ALL seven messages sent together, every time.       │
│                                                      │
│  The model reads the ENTIRE conversation from        │
│  scratch and generates a response that *sounds*      │
│  like it remembers — because it can see the          │
│  whole history right there in the input.             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

The model isn't remembering. It's *reading*. The harness keeps a transcript of the conversation and re-sends the whole thing with every new message. The model looks at all of it and generates a response that fits naturally — creating the illusion of continuous memory.

This is a fundamental pattern: **stateless engine + conversation transcript = apparent memory.**

---

## The Context Window: A Hard Limit

That conversation transcript has a size limit. It's called the **context window** — the maximum amount of text the model can "see" in a single request.

```
┌──────────────────────────────────────────────────────┐
│              CONTEXT WINDOW SIZES                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Model                │ Context Window │ Roughly...  │
│  ─────────────────────┼────────────────┼──────────── │
│  GPT-3 (2020)         │   4K tokens    │ 3 pages     │
│  GPT-4 (2023)         │  128K tokens   │ a novel     │
│  Claude Sonnet (2025) │  200K tokens   │ 1.5 novels  │
│                                                      │
│  For reference:                                      │
│  • A typical email           ≈ 200 words             │
│  • A 30-minute meeting chat  ≈ 3,000 words           │
│  • A short novel             ≈ 50,000 words          │
│  • Harry Potter (all 7)      ≈ 1,100,000 words       │
│                              (wouldn't fit!)          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

200K tokens sounds like a lot — and it is, for a single conversation. But when you're building an agent that needs to work with large documents, long codebases, or weeks of conversation history, you hit the limit faster than you'd expect.

### What Happens When You Hit the Limit?

When the conversation transcript exceeds the context window, the harness has to make choices:

```
┌──────────────────────────────────────────────────────┐
│          WHEN CONTEXT OVERFLOWS                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Option 1: Drop old messages                         │
│  ┌─────────────────────────────────────────────┐     │
│  │  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │     │
│  │  ▲ dropped (forgotten)  ▲ kept (visible)    │     │
│  └─────────────────────────────────────────────┘     │
│  Simple but lossy. The agent literally forgets       │
│  early parts of the conversation.                    │
│                                                      │
│  Option 2: Summarize old messages                    │
│  ┌─────────────────────────────────────────────┐     │
│  │  [summary]░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │     │
│  │  ▲ compressed   ▲ recent (full detail)      │     │
│  └─────────────────────────────────────────────┘     │
│  Keeps the gist but loses nuance. Like reading       │
│  chapter summaries instead of the full book.         │
│                                                      │
│  Option 3: Smart retrieval                           │
│  ┌─────────────────────────────────────────────┐     │
│  │  [relevant bits]░░░░░░░░░░░░░░░░░░░░░░░░░  │     │
│  │  ▲ cherry-picked    ▲ recent (full detail)  │     │
│  └─────────────────────────────────────────────┘     │
│  Search for relevant past messages and include       │
│  only those. Smart but complex to build.             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Every harness handles this differently. Most chat interfaces use Option 1 (silently drop old messages). More sophisticated agents use a combination of all three.

---

## What Happens When You Start a New Chat?

This is where the goldfish problem becomes viscerally clear.

When you click "New Chat" in ChatGPT or Claude, you're not resetting the AI's memory. The AI *never had memory.* You're starting a new transcript — an empty conversation history.

```
┌──────────────────────────────────────────────────────┐
│         NEW CHAT = NEW TRANSCRIPT                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Chat 1 (Monday):                                    │
│    You: "I'm planning a trip to Japan in April"      │
│    AI:  "Great choice! Cherry blossom season..."     │
│    You: "Budget is $5,000 for two people"            │
│    AI:  "That's doable! Here's a breakdown..."       │
│                                                      │
│  ─── You click "New Chat" ───                        │
│                                                      │
│  Chat 2 (Monday, 5 minutes later):                   │
│    You: "What hotels did you recommend?"             │
│    AI:  "I don't have context about previous         │
│          hotel recommendations. Could you tell        │
│          me what you're looking for?"                 │
│                                                      │
│  The model didn't forget. It never knew.             │
│  Chat 2 has a blank transcript.                      │
│  The Japan conversation only exists in Chat 1.       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

This is why you sometimes get frustrated when an AI "forgets" something — you may have switched sessions, or the conversation got too long and early messages were dropped.

---

## Multi-Turn Conversations: How Context Builds

Understanding context management helps you use AI more effectively. Here's how a multi-turn conversation actually works from the system's perspective:

```
┌──────────────────────────────────────────────────────┐
│         CONTEXT GROWTH OVER A CONVERSATION           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Turn 1 — You ask a question                         │
│  ┌─────────────────────────────────────────────┐     │
│  │ [system prompt] [your message]              │     │
│  │ Tokens: ~200                                │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  Turn 3 — A few exchanges in                         │
│  ┌─────────────────────────────────────────────┐     │
│  │ [system] [msg1] [resp1] [msg2] [resp2]      │     │
│  │ [your new message]                          │     │
│  │ Tokens: ~1,500                              │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  Turn 10 — Deep in conversation                      │
│  ┌─────────────────────────────────────────────┐     │
│  │ [system] [msg1] [resp1] ... [msg9] [resp9]  │     │
│  │ [tool calls & results along the way]        │     │
│  │ [your new message]                          │     │
│  │ Tokens: ~8,000                              │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  Turn 50 — Long working session                      │
│  ┌─────────────────────────────────────────────┐     │
│  │ [system] [messages 1-49 + all tool results] │     │
│  │ [your new message]                          │     │
│  │ Tokens: ~45,000                             │     │
│  │ ⚠️ Approaching limits. Getting expensive.   │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  Notice: EVERY turn re-sends EVERYTHING.             │
│  Turn 50 includes all 49 previous exchanges.         │
│  You're paying for all those tokens again.           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

This has real implications:
- **Cost grows with conversation length** — Message #50 costs more than message #1 because you're re-sending 49 messages of history
- **Speed slows down** — More input tokens = more processing time
- **Quality can degrade** — With a lot of context, the model sometimes loses track of what's important (like trying to follow a conversation where everyone's talking at once)

---

## Long-Term Memory: Beyond the Conversation

The context window handles memory *within* a conversation. But what about *across* sessions? What about remembering your preferences next week, or recalling a decision from last month?

This requires **external memory** — information stored outside the conversation that the agent can read.

```
┌──────────────────────────────────────────────────────┐
│            HOW EXTERNAL MEMORY WORKS                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Session 1 (Monday):                                 │
│    You: "I prefer morning meetings, never Fridays"   │
│    Agent learns this. Writes to memory file. ✍️      │
│                                                      │
│  ─── Model forgets everything ───                    │
│                                                      │
│  Session 2 (Wednesday):                              │
│    Agent starts fresh. Complete blank slate.          │
│    Harness loads memory file into context. 📖        │
│    Agent now "knows": morning meetings, no Fridays   │
│                                                      │
│  ─── Model forgets everything ───                    │
│                                                      │
│  Session 3 (Friday):                                 │
│    You: "Schedule a meeting with the team"           │
│    Agent reads memory, avoids Friday, picks morning  │
│    Agent: "How about Monday at 9 AM?"                │
│                                                      │
│  It's not memory. It's note-taking.                  │
│  But the effect is identical.                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Different systems implement this differently:

- **ChatGPT** stores a "memory" section that gets included in your system prompt
- **Claude Projects** let you attach documents that persist across conversations
- **OpenClaw** maintains `MEMORY.md` (curated long-term notes) plus daily log files that the agent reads at the start of each session
- **Custom agents** might use databases, vector search, or knowledge graphs

The pattern is always the same: **store information externally, load relevant pieces into context when needed.**

---

## Why Context Is the Hardest Problem

Context management sounds simple — just re-send the conversation, right? In practice, it's one of the hardest engineering challenges in AI:

**The too-little problem:** If you don't include enough context, the agent makes mistakes. It forgets your requirements, misunderstands the situation, or repeats work it already did.

**The too-much problem:** If you include too much context, you waste tokens (money), slow things down, and the model can get confused by irrelevant information. It's like giving someone a 500-page briefing before asking them to book a restaurant.

**The relevance problem:** Which past messages matter right now? If you're debugging code, you need the recent error messages — not the conversation about lunch plans from earlier. Deciding what's relevant is itself a hard problem.

**The cost problem:** Every token costs money. A long-running agent session that re-sends 50K tokens of history with each turn racks up costs fast. Good context management is also good cost management.

The best agent harnesses solve this with a combination of strategies — keeping recent messages in full, summarizing older ones, and using search to pull in only the relevant long-term memories. It's more art than science, and it's where a lot of the engineering effort goes.

> **🔬 Deeper dive:** Our interactive Context Window simulator lets you visualize how context grows, what gets dropped, and how different strategies affect what the model can "see." [Try the Context Simulator →]

---

## Key Takeaways

1. **The model has no memory** — every request starts from a completely blank slate
2. **Memory is an illusion** created by re-sending the full conversation transcript each time
3. **The context window is a hard limit** — conversations that exceed it lose their earliest messages
4. **New chat = blank transcript** — the model didn't forget; it never knew
5. **Long-term memory requires external storage** — files, databases, or memory systems that the harness loads into context
6. **Context management is the hard problem** — balancing completeness, relevance, speed, and cost

Understanding context transforms how you use AI. When a model seems to "forget" something, it's almost always a context issue — not a model failure. The information either wasn't in the transcript, got dropped due to window limits, or was in a different session entirely.

---

**Next up:** [Module 4 — Tools & Actions →](./04-tools-and-actions.md)

The model can think. The harness gives it memory. But how does it actually *do* things in the real world? That's where tools come in — and they're more intuitive than you'd expect.
