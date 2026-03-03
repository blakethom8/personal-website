"use client";
/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";
import { InteractiveContext } from "@/components/diagrams/InteractiveContext";
import { SessionSwitcher } from "@/components/diagrams/SessionSwitcher";
import { OpenClawDirectory } from "@/components/diagrams/OpenClawDirectory";

// System prompt examples for modal viewing
const SYSTEM_PROMPT_EXAMPLES = {
  chatgpt: {
    title: "ChatGPT System Prompt",
    content: `You are ChatGPT, a large language model trained by OpenAI.
Knowledge cutoff: 2023-10
Current date: March 2, 2026

# Capabilities
- Answer questions on a wide range of topics
- Help with writing, analysis, math, coding
- Provide explanations and summaries
- Be helpful, harmless, and honest

# Guidelines
- Be concise unless asked for detail
- If you don't know something, say so
- Decline requests that could cause harm
- Respect user privacy and safety`,
  },
  claude: {
    title: "Claude (Anthropic) System Prompt",
    content: `You are Claude, an AI assistant created by Anthropic.

# Core Values
- Be helpful, harmless, and honest
- Provide accurate information
- Be thoughtful and nuanced
- Respect user autonomy

# Communication Style
- Be conversational but professional
- Adapt to the user's level of expertise
- Ask clarifying questions when needed
- Admit uncertainty rather than guess

# Constraints
- Do not pretend to access the internet
- Do not claim to have real-time information
- Decline harmful or unethical requests politely`,
  },
  openclaw: {
    title: "OpenClaw Agent System Prompt (Simplified)",
    content: `You are a personal assistant running inside OpenClaw.

# Your Environment
- Working directory: /Users/blake/workspace
- You have access to: read, write, exec, web_search
- Current date: March 2, 2026
- User timezone: America/Los_Angeles

# How You Work
- Read SOUL.md and USER.md at session start
- Update memory/YYYY-MM-DD.md daily logs
- Use tools freely for internal work
- Ask before external actions (emails, posts)

# Memory
- MEMORY.md = long-term curated notes
- memory/YYYY-MM-DD.md = daily logs
- You wake up fresh each session; files are your continuity

# Style
- Be concise, not performative
- Have opinions, be resourceful
- Actions over filler words`,
  },
  website: {
    title: "This Website's System Prompt (WEBSITE-SPEC.md)",
    content: `# WEBSITE-SPEC.md — Personal Website System Prompt

You are helping build Blake's personal website.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- MDX for content

## Design Principles
- Mobile-first (375px base)
- Clean, technical aesthetic
- Minimal, not minimal-boring
- Dark mode optimized

## Content Strategy
- Home: Brief intro, recent work
- About: Background, interests, philosophy
- Work: Projects, case studies
- Ideas: Blog posts (technical + personal)
- Learn: Interactive educational modules

## Code Standards
- Server components by default
- Use "use client" only when needed
- Tailwind for all styling
- Semantic HTML
- Responsive breakpoints: sm (640), md (768), lg (1024)

Remember: This is a personal site, not corporate.
Write with personality, not marketing speak.`,
  },
};

export function Module3Content() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const currentModal = activeModal
    ? SYSTEM_PROMPT_EXAMPLES[activeModal as keyof typeof SYSTEM_PROMPT_EXAMPLES]
    : null;

  return (
    <div className="post-content">
      <p className="mb-4 font-semibold text-fg">
        Why AI "forgets" everything between messages — and the clever tricks we
        use to solve it.
      </p>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">What Is Context?</h2>

      <p className="mb-4">
        <strong>Context</strong> is all the information shared with the agent on
        every API call. It's everything the model can "see" when generating a
        response.
      </p>

      <p className="mb-6">
        Previously, we talked about how System Context and Messages are sent with
        every JSON package. What this really means is: <strong>each time you send a message to ChatGPT, the request includes a bunch of other information</strong> — either instructions you're telling it every time, or the old responses from your conversation.
      </p>

      <p className="mb-6">
        Here's the key insight: <strong>LLMs don't remember anything between calls.</strong> The model doesn't store your conversation or "learn" about you over time. Instead, all the information it needs is included in each request. That information either comes from files loaded into the context, or the model "discovers" it using a tool and adds it to the current context.
      </p>

      <h3 className="mb-4 font-serif text-xl">The Three Key Components of Context</h3>

      <p className="mb-4 text-[13px] text-fg-muted">
        Click each component to see an example:
      </p>

      <InteractiveContext />

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">
        Component 1: System Prompts (Invisible Instructions)
      </h2>

      <p className="mb-4">
        When you type "What's a good hike near LA?" — the model doesn't just see
        your question. It first sees a hidden system prompt like{" "}
        <em>
          "You are Claude, made by Anthropic. You are helpful, harmless, and
          honest."
        </em>{" "}
        — and then your message after it.
      </p>

      <p className="mb-4">
        The system prompt shapes the model's entire personality, knowledge, and
        behavior. You never see it as a user, but <strong>it's included in every single message</strong> — not just once at the beginning, but re-sent with every API call.
      </p>

      <p className="mb-6">
        This is what makes system prompts powerful and different from chat messages. While your conversation messages grow over time, the system prompt stays constant, always present, always shaping the model's behavior from the very first token it reads.
      </p>

      <div className="my-6 rounded-lg border border-accent/30 bg-accent-light/10 p-5">
        <p className="mb-3 font-serif text-[15px] font-bold text-fg">
          See examples of real system prompts:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveModal("chatgpt")}
            className="rounded border border-accent/30 bg-accent-light/20 px-3 py-2 font-mono text-[11px] text-accent transition-colors hover:bg-accent hover:text-white"
          >
            ChatGPT →
          </button>
          <button
            onClick={() => setActiveModal("claude")}
            className="rounded border border-accent/30 bg-accent-light/20 px-3 py-2 font-mono text-[11px] text-accent transition-colors hover:bg-accent hover:text-white"
          >
            Claude (Anthropic) →
          </button>
          <button
            onClick={() => setActiveModal("openclaw")}
            className="rounded border border-accent/30 bg-accent-light/20 px-3 py-2 font-mono text-[11px] text-accent transition-colors hover:bg-accent hover:text-white"
          >
            OpenClaw Agent →
          </button>
          <button
            onClick={() => setActiveModal("website")}
            className="rounded border border-accent/30 bg-accent-light/20 px-3 py-2 font-mono text-[11px] text-accent transition-colors hover:bg-accent hover:text-white"
          >
            This Website →
          </button>
        </div>
      </div>

      <h3 className="mb-4 font-serif text-xl">System Prompts Are Markdown Documents (a.k.a. Word Documents)</h3>

      <p className="mb-4">
        These system prompts are typically stored as{" "}
        <strong>Markdown documents</strong> (files ending in <code>.md</code>).
        Think of it as a plain-text file with some basic formatting: headings,
        bold, lists, links. It's human-readable and easy to edit — essentially a
        simplified Word document.
      </p>

      <p className="mb-6">
        Remember: <strong>this is what the agent is reading</strong>. It's written
        in human language, communicated like humans would communicate, but with
        more explicit directions and styling. You're literally writing instructions
        in plain English (or any language) that the model reads and follows.
      </p>

      <hr className="my-8 border-border-light" />

      {/* Advanced: OpenClaw multi-file system */}
      <div className="my-8 rounded-lg border-2 border-accent/30 bg-accent-light/10">
        <div className="border-b border-accent/30 bg-accent-light/20 px-4 py-2">
          <span className="font-mono text-[12px] font-bold text-accent">
            ADVANCED: Multi-File System Context (OpenClaw Example)
          </span>
        </div>
        <div className="p-5">
          <p className="mb-4 text-[14px]">
            Some agents (like OpenClaw) load{" "}
            <strong>multiple markdown files</strong> into the system context:
          </p>

          {/* Grid of files - 3 across on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded border border-accent/20 bg-white p-3">
              <div className="mb-1 font-mono text-[11px] font-bold text-accent">
                SOUL.md
              </div>
              <div className="text-[11px] text-fg-muted">
                Personality, tone, boundaries
              </div>
            </div>

            <div className="rounded border border-accent/20 bg-white p-3">
              <div className="mb-1 font-mono text-[11px] font-bold text-accent">
                USER.md
              </div>
              <div className="text-[11px] text-fg-muted">
                Name, preferences, background
              </div>
            </div>

            <div className="rounded border border-accent/20 bg-white p-3">
              <div className="mb-1 font-mono text-[11px] font-bold text-accent">
                MEMORY.md
              </div>
              <div className="text-[11px] text-fg-muted">
                Long-term curated notes
              </div>
            </div>

            <div className="rounded border border-accent/20 bg-white p-3">
              <div className="mb-1 font-mono text-[11px] font-bold text-accent">
                WORK.md
              </div>
              <div className="text-[11px] text-fg-muted">
                Professional workflows
              </div>
            </div>

            <div className="rounded border border-accent/20 bg-white p-3">
              <div className="mb-1 font-mono text-[11px] font-bold text-accent">
                PERSONAL.md
              </div>
              <div className="text-[11px] text-fg-muted">
                Personal life management
              </div>
            </div>

            <div className="rounded border border-accent/20 bg-white p-3">
              <div className="mb-1 font-mono text-[11px] font-bold text-accent">
                memory/DATE.md
              </div>
              <div className="text-[11px] text-fg-muted">Daily session logs</div>
            </div>
          </div>

          <p className="mt-4 text-[13px] text-fg-muted">
            All of these get concatenated and loaded into the system context on
            every API call. This is how the agent "knows" your preferences and
            past decisions — it's reading your notes fresh each time, not
            remembering them.
          </p>

          <OpenClawDirectory />
        </div>
      </div>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Component 2: Messages</h2>

      <p className="mb-4">
        The model has zero memory. Every single time you send a message, the model
        starts completely fresh. It doesn't remember your name. It doesn't know
        what you asked five seconds ago. It doesn't retain anything between calls.
      </p>

      <p className="mb-6">
        So how does ChatGPT seem to remember your conversation? The answer is
        simple:{" "}
        <strong>your app re-sends the entire conversation every time.</strong>
      </p>

      <h3 className="mb-4 font-serif text-xl">Multi-Turn Conversations</h3>

      <p className="mb-4">
        When you're five messages deep in a conversation, here's what actually
        gets sent on your sixth message:
      </p>

      <div className="my-6 overflow-hidden rounded-lg border border-border-light bg-bg-panel font-mono text-[12px]">
        <div className="border-b border-border-light px-4 py-2 text-[11px] text-fg-light">
          What Gets Sent on Message #6
        </div>
        <pre className="overflow-x-auto p-4 leading-relaxed text-fg">
          {`System: "You are a helpful travel assistant."

Messages:

1. [You]:  "Hi, I'm planning a trip to Japan"
2. [AI]:   "That sounds exciting! When are..."
3. [You]:  "Next April, for two weeks"
4. [AI]:   "April is perfect for cherry..."
5. [You]:  "I love hiking. Recommendations?"
6. [AI]:   "For hiking in Japan during..."
7. [You]:  "What about the food?"      ← NEW

───────────────────────────────────────────────
ALL seven messages sent together, every time.

The model reads the ENTIRE conversation from
scratch and generates a response that *sounds*
like it remembers — because it can see the
whole history right there in the input.`}
        </pre>
      </div>

      <p className="mb-6">
        The model isn't remembering. It's <em>reading</em>. The harness keeps a
        transcript of the conversation and re-sends the whole thing with every new
        message.
      </p>

      <p className="mb-4">
        This is a fundamental pattern:{" "}
        <strong>
          stateless engine + conversation transcript = apparent memory.
        </strong>
      </p>

      <p className="mb-6 text-[13px] text-fg-muted">
        Note: The <strong>agentic harness</strong> (which we'll cover in Module 5)
        is the code that pulls this together — grabbing the system files, managing
        the message transcript, and packaging everything into the API request.
      </p>

      {/* Deep Dive: Session Management */}
      <div className="my-8 rounded-lg border-2 border-accent/30 bg-accent-light/10">
        <div className="border-b border-accent/30 bg-accent-light/20 px-4 py-2">
          <span className="font-mono text-[12px] font-bold text-accent">
            DEEP DIVE: Session Management
          </span>
        </div>
        <div className="p-5">
          <p className="mb-4 text-[14px]">
            Multi-turn conversations are locked within a{" "}
            <strong>single-threaded session</strong>. Each chat session you create
            (like different tabs in ChatGPT) has its own isolated conversation
            history.
          </p>

          <p className="mb-4 text-[13px] text-fg-muted">
            Try switching between these sessions to see how each maintains separate
            context:
          </p>

          <SessionSwitcher />

          <p className="mt-4 text-[13px] text-fg-muted">
            This is why starting a "New Chat" gives the model a blank slate — it's
            not forgetting anything, it never had access to your previous chat's
            history. Each session is completely isolated.
          </p>
        </div>
      </div>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">
        The Context Window: A Hard Limit
      </h2>

      <p className="mb-4">
        All of this context has a size limit. It's called the{" "}
        <strong>context window</strong> — the maximum amount of text the model can
        "see" in a single request.
      </p>

      <h3 className="mb-4 font-serif text-xl">What Fills the Context Window?</h3>

      <p className="mb-4">Every API request stacks up like this:</p>

      <div className="mb-6 rounded-lg border border-border-light bg-bg-panel p-4 font-mono text-[11px]">
        <div className="mb-1 text-accent">
          ↓ Context Window Limit (e.g., 200K tokens)
        </div>
        <div className="mb-2 text-fg-muted">┌─────────────────────────────┐</div>
        <div className="mb-1 flex items-center gap-2">
          <div className="w-32 text-fg-light">System Prompt:</div>
          <div className="text-fg">~2,000–11,000 tokens</div>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <div className="w-32 text-fg-light">Messages:</div>
          <div className="text-fg">~200–500 per exchange</div>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <div className="w-32 text-fg-light">Tool Results:</div>
          <div className="text-fg">Variable (can be large)</div>
        </div>
        <div className="text-fg-muted">└─────────────────────────────┘</div>
      </div>

      {/* Two-column layout: model table + visual */}
      <div className="my-6 grid gap-6 md:grid-cols-2">
        {/* Model comparison table */}
        <div className="overflow-hidden rounded-lg border border-border-light">
          <div className="border-b border-border-light bg-bg-panel px-4 py-2">
            <span className="font-mono text-[11px] text-fg-light">
              Context Window Sizes
            </span>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border-light bg-bg-panel/50">
                <th className="px-3 py-2 text-left font-semibold">Model</th>
                <th className="px-3 py-2 text-left font-semibold">Size</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-light">
                <td className="px-3 py-2">GPT-3 (2020)</td>
                <td className="px-3 py-2 font-mono text-[11px]">4K</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="px-3 py-2">GPT-4 (2023)</td>
                <td className="px-3 py-2 font-mono text-[11px]">128K</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Claude Sonnet</td>
                <td className="px-3 py-2 font-mono text-[11px]">200K</td>
              </tr>
            </tbody>
          </table>
          <div className="border-t border-border-light bg-bg-panel px-3 py-2 text-[11px] text-fg-light">
            For reference: ~1.5 novels
          </div>
        </div>

        {/* Visual representation */}
        <div className="overflow-hidden rounded-lg border border-border-light">
          <div className="border-b border-border-light bg-bg-panel px-4 py-2">
            <span className="font-mono text-[11px] text-fg-light">
              How Context Grows
            </span>
          </div>
          <div className="space-y-3 p-4">
            <div>
              <div className="mb-1 font-mono text-[11px] text-fg-light">
                Turn 1
              </div>
              <div className="h-2 w-[10%] rounded bg-accent"></div>
              <div className="mt-1 font-mono text-[10px] text-fg-muted">
                ~200 tokens
              </div>
            </div>
            <div>
              <div className="mb-1 font-mono text-[11px] text-fg-light">
                Turn 5
              </div>
              <div className="h-2 w-[30%] rounded bg-accent"></div>
              <div className="mt-1 font-mono text-[10px] text-fg-muted">
                ~3,000 tokens
              </div>
            </div>
            <div>
              <div className="mb-1 font-mono text-[11px] text-fg-light">
                Turn 20
              </div>
              <div className="h-2 w-[60%] rounded bg-orange-500"></div>
              <div className="mt-1 font-mono text-[10px] text-fg-muted">
                ~15,000 tokens
              </div>
            </div>
            <div>
              <div className="mb-1 font-mono text-[11px] text-fg-light">
                Turn 50
              </div>
              <div className="h-2 w-[90%] rounded bg-red-500"></div>
              <div className="mt-1 font-mono text-[10px] text-fg-muted">
                ~45,000 tokens ⚠️
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token examples as cards */}
      <div className="my-6">
        <p className="mb-4">
          200K tokens sounds like a lot — and it is, for a single conversation.
          But when you're building an agent that needs to work with large
          documents, long codebases, or weeks of conversation history, you hit
          the limit faster than you'd expect.
        </p>

        <p className="mb-4 font-serif text-[15px] font-bold text-fg">
          Real-World Token Examples
        </p>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border-light bg-bg-panel p-4 text-center">
            <div className="mb-2 font-mono text-[20px] font-bold text-accent">
              ~100K
            </div>
            <div className="text-[12px] text-fg-light">
              Harry Potter (book 1)
            </div>
          </div>

          <div className="rounded-lg border border-border-light bg-bg-panel p-4 text-center">
            <div className="mb-2 font-mono text-[20px] font-bold text-accent">
              ~5-10K
            </div>
            <div className="text-[12px] text-fg-light">Instruction manual</div>
          </div>

          <div className="rounded-lg border border-border-light bg-bg-panel p-4 text-center">
            <div className="mb-2 font-mono text-[20px] font-bold text-accent">
              ~75K
            </div>
            <div className="text-[12px] text-fg-light">
              CRM data (5 reps, 200 logs)
            </div>
          </div>

          <div className="rounded-lg border border-border-light bg-bg-panel p-4 text-center">
            <div className="mb-2 font-mono text-[20px] font-bold text-accent">
              ~150K+
            </div>
            <div className="text-[12px] text-fg-light">
              Full codebase (medium app)
            </div>
          </div>
        </div>

        {/* Warning about model degradation */}
        <div className="rounded-lg border-2 border-orange-500/30 bg-orange-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-orange-600">
              ⚠️ WARNING: Model Degradation
            </span>
          </div>
          <p className="text-[13px] text-fg-muted">
            As the context window fills up, model performance tends to degrade.
            With very long contexts (100K+ tokens), models can lose track of
            details, make mistakes, or produce lower-quality outputs. Monitor
            your context usage and use strategies like summarization or smart
            retrieval when contexts grow large.
          </p>
        </div>
      </div>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">
        Advanced: How Do We Handle Context Overflow?
      </h2>

      <p className="mb-4">
        When the conversation transcript exceeds the context window, the harness
        has to make choices. This is one of the hardest engineering challenges in
        AI.
      </p>

      <h3 className="mb-4 font-serif text-xl">
        Three Strategies for Managing Context
      </h3>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border-light bg-bg-panel p-4">
          <h4 className="mb-2 font-mono text-[13px] font-bold text-accent">
            1. Drop old messages
          </h4>
          <p className="mb-2 text-[13px]">
            Simple but lossy. The agent literally forgets early parts of the
            conversation.
          </p>
          <div className="font-mono text-[11px] text-fg-muted">
            ████████░░░░░░░░░░░░░░░░
            <br />▲ dropped ▲ kept
          </div>
        </div>

        <div className="rounded-lg border border-border-light bg-bg-panel p-4">
          <h4 className="mb-2 font-mono text-[13px] font-bold text-accent">
            2. Summarize old
          </h4>
          <p className="mb-2 text-[13px]">
            Keeps the gist but loses nuance. Like reading chapter summaries
            instead of the full book.
          </p>
          <div className="font-mono text-[11px] text-fg-muted">
            [summary]░░░░░░░░░░░░░░
            <br />▲ compressed ▲ recent
          </div>
        </div>

        <div className="rounded-lg border border-border-light bg-bg-panel p-4">
          <h4 className="mb-2 font-mono text-[13px] font-bold text-accent">
            3. Smart retrieval
          </h4>
          <p className="mb-2 text-[13px]">
            Search for relevant past messages and include only those. Smart but
            complex to build.
          </p>
          <div className="font-mono text-[11px] text-fg-muted">
            [relevant]░░░░░░░░░░░░░░
            <br />▲ cherry-picked ▲ recent
          </div>
        </div>
      </div>

      <p className="mb-6">
        Every harness handles this differently. Most chat interfaces use Option 1
        (silently drop old messages). More sophisticated agents use a combination
        of all three.
      </p>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Key Takeaways</h2>

      <ol className="mb-6 list-decimal space-y-3 pl-6">
        <li>
          <strong>Context = all information the model can see</strong> — system
          prompts + messages + tool definitions
        </li>
        <li>
          <strong>System prompts are invisible instructions</strong> — often
          stored in markdown files (like CLAUDE.md)
        </li>
        <li>
          <strong>LLM calls are stateless</strong> — the model starts from a blank
          slate every time
        </li>
        <li>
          <strong>Memory is an illusion</strong> — created by re-sending the full
          conversation transcript
        </li>
        <li>
          <strong>Sessions are isolated</strong> — each chat session has its own
          separate conversation history
        </li>
        <li>
          <strong>The context window fills up over time</strong> — system context
          + growing message history + tool results
        </li>
        <li>
          <strong>Context overflow requires strategy</strong> — drop, summarize,
          or smart retrieval
        </li>
      </ol>

      <p className="mb-6">
        Understanding context transforms how you use AI. When a model seems to
        "forget" something, it's almost always a context issue — the information
        either wasn't in the transcript, got dropped due to window limits, or was
        in a different session entirely.
      </p>

      <hr className="my-8 border-border-light" />

      <p className="text-center font-semibold text-fg-muted">
        <strong>Next up:</strong> Module 4 — Tools & Actions →
      </p>
      <p className="mt-2 text-center text-[14px] text-fg-muted">
        The model can think. The harness gives it memory. But how does it
        actually <em>do</em> things in the real world? That's where tools come in
        — and they're more intuitive than you'd expect.
      </p>

      {/* System Prompt Modal */}
      {currentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative max-h-[80vh] w-full max-w-[700px] overflow-y-auto rounded-lg border border-border-light bg-bg-panel shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border-light bg-bg-panel px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
                {currentModal.title}
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="flex h-6 w-6 items-center justify-center rounded text-fg-light transition-colors hover:bg-bg-panel-hover hover:text-fg"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-fg">
                {currentModal.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
