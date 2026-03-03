"use client";

import { useState } from "react";

/**
 * Interactive session switcher showing how different chat sessions
 * have different conversation histories
 */
export function SessionSwitcher() {
  const [activeSession, setActiveSession] = useState<number>(1);

  const sessions = {
    1: {
      name: "Japan Trip Planning",
      messages: [
        { role: "user", text: "Hi, I'm planning a trip to Japan" },
        { role: "ai", text: "That sounds exciting! When are..." },
        { role: "user", text: "Next April, for two weeks" },
        { role: "ai", text: "April is perfect for cherry..." },
      ],
    },
    2: {
      name: "Python Help",
      messages: [
        { role: "user", text: "How do I read a CSV in Python?" },
        { role: "ai", text: "You can use pandas..." },
        { role: "user", text: "What if the file is large?" },
        { role: "ai", text: "For large files, consider..." },
      ],
    },
    3: {
      name: "New Chat",
      messages: [],
    },
  };

  const currentSession = sessions[activeSession as keyof typeof sessions];

  return (
    <div className="overflow-hidden rounded-lg border border-border-light">
      {/* Session tabs */}
      <div className="flex gap-1 border-b border-border-light bg-bg-panel p-2">
        {Object.entries(sessions).map(([id, session]) => (
          <button
            key={id}
            onClick={() => setActiveSession(Number(id))}
            className={`rounded px-3 py-1.5 font-mono text-[11px] transition-colors ${
              activeSession === Number(id)
                ? "bg-accent text-white"
                : "text-fg-light hover:bg-bg-panel-hover hover:text-accent"
            }`}
          >
            {session.name}
          </button>
        ))}
      </div>

      {/* Session content - two column: system prompt + messages */}
      <div className="grid gap-4 bg-white p-4 md:grid-cols-[250px,1fr]">
        {/* System prompt (constant) */}
        <div className="rounded-lg border border-border-light bg-bg-panel p-3">
          <div className="mb-2 font-mono text-[10px] font-bold text-fg-light">
            SYSTEM PROMPT (always present)
          </div>
          <div className="text-[11px] text-fg-muted">
            You are a helpful travel assistant. Be concise and accurate.
          </div>
        </div>

        {/* Messages (session-specific) */}
        <div className="rounded-lg border border-border-light bg-white p-3">
          <div className="mb-2 font-mono text-[10px] font-bold text-fg-light">
            MESSAGES (this session only)
          </div>
          {currentSession.messages.length > 0 ? (
            <div className="space-y-2">
              {currentSession.messages.map((msg, i) => (
                <div key={i} className="text-[11px]">
                  <span
                    className={`font-mono text-[10px] ${
                      msg.role === "user" ? "text-accent" : "text-fg-light"
                    }`}
                  >
                    [{msg.role === "user" ? "You" : "AI"}]:
                  </span>{" "}
                  <span className="text-fg">{msg.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[100px] items-center justify-center text-center">
              <p className="text-[11px] text-fg-muted">
                No conversation history yet
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border-light bg-bg-panel px-4 py-2 text-[11px] text-fg-light">
        Each session maintains its own conversation history. Switch sessions →
        different context.
      </div>
    </div>
  );
}
