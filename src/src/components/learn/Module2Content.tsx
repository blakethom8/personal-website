"use client";
/* eslint-disable react/no-unescaped-entities */

import { CodeComparison } from "@/components/diagrams/CodeComparison";
import { ChatInputToRequest } from "@/components/diagrams/ChatInputToRequest";

export function Module2Content() {
  return (
    <div className="post-content">
      <p className="mb-4 font-semibold text-fg">
        The structured messages that flow between you and the model — what
        actually gets sent over the internet.
      </p>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">The Package Analogy</h2>

      <p className="mb-4">
        To think like an agent, we need to see everything the agent-system sees.
        For this, we should first understand how data transfers across the
        internet: JSON-structure.
      </p>

      <p className="mb-6">
        Maybe the easiest way to think about a JSON object is a list of
        information, where parts of the information are categorized or defined.
        For example, when the browser displays a list of information for a
        recipe, here is what the JSON package looks like for the browser:
      </p>

      <CodeComparison
        jsonCode={`{
  "recipe": "Chocolate Chip Cookies",
  "prep_time": "15 minutes",
  "cook_time": "12 minutes",
  "ingredients": [
    "2 cups flour",
    "1 cup butter",
    "1 cup chocolate chips"
  ],
  "instructions": [
    "Preheat oven to 375°F",
    "Mix dry ingredients",
    "Fold in chocolate chips",
    "Bake for 12 minutes"
  ]
}`}
        browserContent={
          <div>
            <h3 className="mb-3 font-serif text-xl font-semibold">
              Chocolate Chip Cookies
            </h3>
            <div className="mb-4 flex gap-6 text-[13px] text-fg-muted">
              <div>
                <strong className="text-fg">Prep:</strong> 15 minutes
              </div>
              <div>
                <strong className="text-fg">Cook:</strong> 12 minutes
              </div>
            </div>
            <div className="mb-4">
              <h4 className="mb-2 text-[14px] font-semibold">Ingredients</h4>
              <ul className="list-disc space-y-1 pl-5 text-[13px]">
                <li>2 cups flour</li>
                <li>1 cup butter</li>
                <li>1 cup chocolate chips</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-[14px] font-semibold">Instructions</h4>
              <ol className="list-decimal space-y-1 pl-5 text-[13px]">
                <li>Preheat oven to 375°F</li>
                <li>Mix dry ingredients</li>
                <li>Fold in chocolate chips</li>
                <li>Bake for 12 minutes</li>
              </ol>
            </div>
          </div>
        }
      />

      <p className="mb-6">
        When your LLM receives your message, it doesn't see just "What is the
        weather today?" — it sees a complete JSON package containing your
        message plus all the supporting metadata from your system. By analyzing
        this JSON structure, we can see exactly how the agent categorizes
        information and understand what's happening under the hood.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">The LLM Request Package</h2>

      <p className="mb-4">
        Here are the key components that get packaged into every request:
      </p>

      {/* Table of 5 components */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b-2 border-border-light bg-bg-panel">
              <th className="px-4 py-3 text-left font-mono text-[12px] font-semibold">
                Component
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                What It Is
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3 font-mono text-[12px] font-semibold text-accent">
                model
              </td>
              <td className="px-4 py-3">
                Which AI engine to use
              </td>
            </tr>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3 font-mono text-[12px] font-semibold text-accent">
                system
              </td>
              <td className="px-4 py-3">
                Hidden instructions that shape behavior
              </td>
            </tr>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3 font-mono text-[12px] font-semibold text-accent">
                tools
              </td>
              <td className="px-4 py-3">
                Actions the model can take
              </td>
            </tr>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3 font-mono text-[12px] font-semibold text-accent">
                messages
              </td>
              <td className="px-4 py-3">
                Full conversation transcript, re-sent each time
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-[12px] font-semibold text-accent">
                settings
              </td>
              <td className="px-4 py-3">
                Parameters controlling the response
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-6">
        Not every request uses all five. A simple chatbot might only need model +
        system + messages. An agent needs all five. Let's see what this looks
        like in practice:
      </p>

      <ChatInputToRequest
        userInput="What's the tallest building in LA?"
        requestJson={`{
  "model": "claude-sonnet-4-20250514",

  "system": "You are a helpful assistant. Be concise and accurate.",

  "tools": [
    { "name": "search_web", "description": "Search the internet for current information" },
    { "name": "get_weather", "description": "Get current weather for a location" }
  ],

  "messages": [
    {
      "role": "user",
      "content": "What's the tallest building in LA?"
    }
  ],

  "max_tokens": 500,
  "temperature": 0.7
}`}
      />

      <p className="mb-6">
        See how each of the five components maps to the JSON? Your simple question
        becomes a complete package with model selection, system instructions, tool
        definitions, conversation history, and generation settings.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Breaking Down Each Part</h2>

      {/* Model */}
      <div className="mb-8">
        <h3 className="mb-3 rounded-lg bg-accent-light/30 px-4 py-2 font-mono text-[14px] font-bold text-accent">
          1. model
        </h3>
        <p className="mb-4">
          Which AI engine to use. Different models have different capabilities,
          speeds, and costs:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border-light">
                <th className="pb-2 pr-4 text-left font-semibold">Model</th>
                <th className="pb-2 pr-4 text-left font-semibold">Good At</th>
                <th className="pb-2 text-left font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-light">
                <td className="py-2 pr-4 font-mono text-[12px]">
                  claude-haiku
                </td>
                <td className="py-2 pr-4">Fast, simple tasks</td>
                <td className="py-2">Cheapest</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="py-2 pr-4 font-mono text-[12px]">
                  claude-sonnet
                </td>
                <td className="py-2 pr-4">Balance of speed and reasoning</td>
                <td className="py-2">Mid</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="py-2 pr-4 font-mono text-[12px]">
                  claude-opus
                </td>
                <td className="py-2 pr-4">Complex reasoning</td>
                <td className="py-2">Expensive</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="py-2 pr-4 font-mono text-[12px]">gpt-4o</td>
                <td className="py-2 pr-4">General purpose</td>
                <td className="py-2">Mid</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-[12px]">
                  gpt-4o-mini
                </td>
                <td className="py-2 pr-4">Fast, cheap</td>
                <td className="py-2">Cheapest</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4">Same request, different model = different results.</p>
      </div>

      {/* System Prompt */}
      <div className="mb-8">
        <h3 className="mb-3 rounded-lg bg-accent-light/30 px-4 py-2 font-mono text-[14px] font-bold text-accent">
          2. system prompt
        </h3>
        <p>
          The hidden instructions that shape behavior. You don't see these as a
          user, but they're included in every request. This is where the model
          gets its "personality" and rules. We'll go much deeper on system
          context in Module 3.
        </p>
      </div>

      {/* Tools */}
      <div className="mb-8">
        <h3 className="mb-3 rounded-lg bg-accent-light/30 px-4 py-2 font-mono text-[14px] font-bold text-accent">
          3. tools
        </h3>
        <p className="mb-4">
          If the model can take actions — reading files, searching emails,
          checking the weather — those tools are defined in the package. Each
          tool includes a name, a description, and a schema describing what inputs
          it accepts. The model reads these definitions to know what it{" "}
          <em>can</em> do.
        </p>
        <p>
          A simple chatbot might have zero tools. A coding agent might have 20-30.
          Notice in our example above, we included <code>search_web</code> and{" "}
          <code>get_weather</code> — even though the model didn't need either for
          that question. The tools are always available, and the model decides
          whether to use them.
        </p>
      </div>

      {/* Messages */}
      <div className="mb-8">
        <h3 className="mb-3 rounded-lg bg-accent-light/30 px-4 py-2 font-mono text-[14px] font-bold text-accent">
          4. messages
        </h3>
        <p className="mb-4">
          The conversation transcript — every message exchanged between you and
          the model:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6">
          <li>
            <strong>User messages</strong> — what you typed
          </li>
          <li>
            <strong>Assistant messages</strong> — what the model responded
          </li>
          <li>
            <strong>Tool calls</strong> — when the model requested an action
          </li>
          <li>
            <strong>Tool results</strong> — what came back from that action
          </li>
        </ul>
        <p>
          The key insight: <strong>every message ever exchanged gets re-sent
          every time.</strong> The model doesn't remember anything — the harness
          re-sends the full history so the model can "see" the conversation.
          We'll explore this deeply in Module 3.
        </p>
      </div>

      {/* Settings */}
      <div className="mb-8">
        <h3 className="mb-3 rounded-lg bg-accent-light/30 px-4 py-2 font-mono text-[14px] font-bold text-accent">
          5. settings
        </h3>
        <p className="mb-4">Parameters that control the response:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Temperature</strong> — How creative vs. predictable (0 =
            robotic consistency, 1 = creative variation)
          </li>
          <li>
            <strong>Max tokens</strong> — Maximum response length (a token is
            roughly 3/4 of a word)
          </li>
        </ul>
      </div>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Key Takeaways</h2>
      <ol className="mb-6 list-decimal space-y-3 pl-6">
        <li>
          <strong>Every request is a JSON package</strong> with five parts —
          model, system prompt, tools, messages, and settings
        </li>
        <li>
          <strong>Every request re-sends everything</strong> — system prompt,
          tool definitions, full conversation history, and your new message
        </li>
        <li>
          <strong>The harness handles the complexity</strong> — you type
          naturally, and the harness translates that into structured JSON
          packages behind the scenes
        </li>
      </ol>

      <p className="mb-6">
        Understanding this format is foundational. Everything we cover from here
        — context management, tools, agentic patterns — is built on top of these
        structured packages going back and forth.
      </p>

      <hr className="my-8 border-border-light" />

      <p className="text-center font-semibold text-fg-muted">
        <strong>Next up:</strong> Module 3 — Context & Memory →
      </p>
      <p className="mt-2 text-center text-[14px] text-fg-muted">
        The model has no memory. Every single request starts from scratch. So how
        does it seem to remember your conversation? The answer is more surprising
        than you'd think.
      </p>
    </div>
  );
}
