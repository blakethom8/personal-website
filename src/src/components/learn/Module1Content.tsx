"use client";
/* eslint-disable react/no-unescaped-entities */

import { AgentComparison } from "@/components/diagrams/AgentComparison";

export function Module1Content() {
  return (
    <div className="post-content">
      <p className="mb-4 font-semibold text-fg">
        What an AI agent actually is — why the model is not as interesting as the
        architecture supporting it.
      </p>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">The Confusing Landscape</h2>

      <p className="mb-4">
        AI companies have used various branding language: <strong>ChatGPT</strong>,{" "}
        <strong>AgentForce</strong>, <strong>Gemini</strong>,{" "}
        <strong>Claude</strong>, <strong>Copilot</strong>,{" "}
        <strong>OpenClaw</strong>. It's not a surprise that it's hard to separate
        the concept of the <strong>LLM model</strong> vs. the{" "}
        <strong>agent</strong>.
      </p>

      <p className="mb-6">
        Here's the critical thing to understand: <strong>the LLM model is just one
        piece</strong> of the product you're engaging with. When you ask ChatGPT a
        question in your browser, you're not just talking to GPT-4o. You're using a
        complete system — and that model could be used in many different ways with
        completely different results.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">The Model vs. The Agent</h2>

      <p className="mb-4">
        In reality, there is a full architecture system supporting the model, and
        you could use that same model in the browser's ChatGPT architecture, or in
        a terminal coding agent, or in a Salesforce workflow assistant. Same model,
        completely different experience.
      </p>

      <p className="mb-6">
        In simple terms, you could almost think of the model as the{" "}
        <strong>engine</strong> of the product, but there are all these other
        features you need to get from point A to point B. In LLM land, point A is
        input text you send to chat: <em>"What is the weather in Paris?"</em> Point
        B is the response you see:{" "}
        <em>"It is 23 degrees Celsius. Would you like a croissant there?"</em>{" "}
        Between the input and the response, there's a lot more happening under the
        hood that's not the LLM itself.
      </p>

      <p className="mb-4">
        Within our Learning Module, I'll call this the <strong>Agent
        Architecture</strong>, where it includes these key components:
      </p>

      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b-2 border-border-light bg-bg-panel">
              <th className="px-4 py-3 text-left font-semibold">Component</th>
              <th className="px-4 py-3 text-left font-semibold">What It Does</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3 font-semibold">LLM Model</td>
              <td className="px-4 py-3">
                The prediction engine. Takes text in, generates text out. That's
                it.
              </td>
            </tr>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3 font-semibold">System Prompt</td>
              <td className="px-4 py-3">
                Instructions that shape how the model behaves — its personality,
                rules, and role.
              </td>
            </tr>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3 font-semibold">Context Window</td>
              <td className="px-4 py-3">
                The conversation history and information the model can "see" at any
                given moment.
              </td>
            </tr>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3 font-semibold">Tools</td>
              <td className="px-4 py-3">
                How the agent interacts with the real world — files, web, email,
                databases.
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Harness</td>
              <td className="px-4 py-3">
                The code that orchestrates everything — runs the loop, manages
                memory, executes tools.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">
        Agent Architecture Defines the Product
      </h2>

      <p className="mb-4">
        This <strong>agent architecture</strong> is what actually defines the agent
        you're interacting with. Give it different tools, different access to your
        data, a different interface (web vs terminal), different instructions —
        you get a completely different product.
      </p>

      <p className="mb-6">
        Let's look at how the same underlying technology (LLMs) creates completely
        different experiences based on architecture:
      </p>

      <AgentComparison />

      <p className="mb-4">
        See the pattern? The <strong>model</strong> might be similar (GPT-4, Claude
        Sonnet, etc.), but everything else is different:
      </p>

      <ul className="mb-6 list-disc space-y-2 pl-6">
        <li>
          <strong>Where you access it</strong> — Browser, terminal, Salesforce UI,
          chat app
        </li>
        <li>
          <strong>What tools it has</strong> — Web search vs file editing vs CRM
          queries
        </li>
        <li>
          <strong>What it knows</strong> — Chat history vs your codebase vs
          customer records
        </li>
        <li>
          <strong>What it's designed to do</strong> — General questions vs write
          code vs handle support tickets
        </li>
      </ul>

      <p className="mb-6">
        This is why "building with AI" doesn't just mean "use ChatGPT." It means
        designing the <em>architecture</em> around the model to create the
        experience you want.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">What We'll Explore in This Guide</h2>

      <p className="mb-4">
        Every agent architecture manages these fundamental pieces. We'll dedicate a
        module to each:
      </p>

      <ul className="mb-6 list-disc space-y-3 pl-6">
        <li>
          <strong>How AI Communicates</strong> — The structured JSON messages that
          flow between you and the model. What actually gets sent over the
          internet. <em>(Module 2)</em>
        </li>
        <li>
          <strong>Context & Memory</strong> — The model has no memory. Every
          request starts fresh. How do agents decide what information to include
          right now? <em>(Module 3)</em>
        </li>
        <li>
          <strong>Tools & Actions</strong> — A raw model can only generate text.
          How do tools let it interact with the real world? <em>(Module 4)</em>
        </li>
        <li>
          <strong>The Harness</strong> — The orchestration layer that makes it all
          work. The loop that receives messages, calls the model, executes tools,
          and delivers results. <em>(Module 5)</em>
        </li>
      </ul>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Why This Matters</h2>

      <p className="mb-4">
        When you evaluate an AI product — or when someone tells you they're
        "building with AI" — the model is the <em>least</em> differentiating part.
        Most products use the same handful of models.
      </p>

      <p className="mb-4">The real questions to ask:</p>

      <ul className="mb-6 list-disc space-y-2 pl-6">
        <li>
          <strong>What tools does the agent have?</strong> (What can it actually{" "}
          <em>do</em>?)
        </li>
        <li>
          <strong>How does it manage context?</strong> (What does it know about you
          and your situation?)
        </li>
        <li>
          <strong>What's the system prompt?</strong> (What are its instructions and
          constraints?)
        </li>
        <li>
          <strong>How is the harness built?</strong> (How reliable, fast, and safe
          is the orchestration?)
        </li>
      </ul>

      <p className="mb-6 font-semibold">
        The model is commodity. The architecture around it is the product.
      </p>

      <hr className="my-8 border-border-light" />

      <p className="text-center font-semibold text-fg-muted">
        <strong>Next up:</strong> Module 2 — How AI Communicates →
      </p>
      <p className="mt-2 text-center text-[14px] text-fg-muted">
        We'll look at the actual structured messages that flow between you and the
        model — what gets sent over the internet and what comes back.
      </p>
    </div>
  );
}
