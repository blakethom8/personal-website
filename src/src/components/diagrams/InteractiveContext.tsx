"use client";

import { useState } from "react";

/**
 * Interactive context component diagram
 * Click each component to see an example
 */
export function InteractiveContext() {
  const [activeComponent, setActiveComponent] = useState<number | null>(null);

  const examples = {
    1: {
      title: "System Prompt Example",
      content: `You are Claude, an AI assistant created by Anthropic.

Be helpful, harmless, and honest.
Current date: March 2, 2026
User's name: Blake`,
    },
    2: {
      title: "Messages Example",
      content: `[You]:  "What's the weather like?"
[AI]:   "I don't have real-time data..."
[You]:  "Can you search for it?"
[AI]:   "I can use the search tool..."`,
    },
    3: {
      title: "Tools Example",
      content: `{
  "name": "web_search",
  "description": "Search the internet",
  "parameters": {
    "query": "string"
  }
}`,
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-[280px,1fr]">
      {/* Component selector */}
      <div className="space-y-3">
        <button
          onClick={() => setActiveComponent(1)}
          className={`w-full rounded-lg border p-4 text-left transition-all ${
            activeComponent === 1
              ? "border-accent bg-accent-light/20"
              : "border-border-light bg-bg-panel hover:border-accent/50"
          }`}
        >
          <div className="mb-1 font-mono text-[14px] font-bold text-accent">
            System Prompt
          </div>
          <div className="text-[11px] text-fg-muted">
            Invisible instructions
          </div>
        </button>

        <button
          onClick={() => setActiveComponent(2)}
          className={`w-full rounded-lg border p-4 text-left transition-all ${
            activeComponent === 2
              ? "border-accent bg-accent-light/20"
              : "border-border-light bg-bg-panel hover:border-accent/50"
          }`}
        >
          <div className="mb-1 font-mono text-[14px] font-bold text-accent">
            Messages
          </div>
          <div className="text-[11px] text-fg-muted">
            Conversation history
          </div>
        </button>

        <button
          onClick={() => setActiveComponent(3)}
          className={`w-full rounded-lg border p-4 text-left transition-all ${
            activeComponent === 3
              ? "border-accent bg-accent-light/20"
              : "border-border-light bg-bg-panel hover:border-accent/50"
          }`}
        >
          <div className="mb-1 font-mono text-[14px] font-bold text-accent">
            Tools
          </div>
          <div className="text-[11px] text-fg-muted">
            Action definitions (Module 4)
          </div>
        </button>
      </div>

      {/* Example display */}
      <div className="overflow-hidden rounded-lg border border-border-light bg-white">
        {activeComponent ? (
          <>
            <div className="border-b border-border-light bg-bg-panel px-4 py-2">
              <span className="font-mono text-[11px] text-fg-light">
                {examples[activeComponent as keyof typeof examples].title}
              </span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-fg">
              {examples[activeComponent as keyof typeof examples].content}
            </pre>
          </>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center p-8 text-center">
            <div>
              <p className="mb-2 font-mono text-[11px] text-fg-light">
                ← Click a component to see an example
              </p>
              <p className="text-[11px] text-fg-muted">
                Each part contributes to the full context sent with every API call
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
