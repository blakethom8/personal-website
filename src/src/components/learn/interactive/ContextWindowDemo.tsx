"use client";

import { useState, useCallback } from "react";

interface Turn {
  id: number;
  userTokens: number;
  aiTokens: number;
  toolTokens: number;
}

const SAMPLE_MESSAGES = [
  { user: 12, ai: 45, tool: 0 },
  { user: 8, ai: 30, tool: 20 },
  { user: 15, ai: 60, tool: 35 },
  { user: 6, ai: 25, tool: 0 },
  { user: 20, ai: 80, tool: 50 },
  { user: 10, ai: 40, tool: 15 },
  { user: 18, ai: 55, tool: 25 },
  { user: 5, ai: 35, tool: 0 },
];

const MAX_TOKENS = 500;

const COLORS = {
  user: { bg: "bg-accent", label: "text-accent", dot: "bg-accent" },
  ai: { bg: "bg-amber-500", label: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  tool: { bg: "bg-rose-400", label: "text-rose-500 dark:text-rose-400", dot: "bg-rose-400" },
} as const;

export function ContextWindowDemo() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [nextId, setNextId] = useState(0);

  const totalTokens = turns.reduce(
    (sum, t) => sum + t.userTokens + t.aiTokens + t.toolTokens,
    0
  );

  const addMessage = useCallback(() => {
    const sample = SAMPLE_MESSAGES[nextId % SAMPLE_MESSAGES.length];
    setTurns((prev) => [
      ...prev,
      {
        id: nextId,
        userTokens: sample.user,
        aiTokens: sample.ai,
        toolTokens: sample.tool,
      },
    ]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const reset = useCallback(() => {
    setTurns([]);
    setNextId(0);
  }, []);

  const isFull = totalTokens >= MAX_TOKENS;

  return (
    <div className="rounded-lg border border-border-light bg-bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
            context window
          </p>
          <p className="mt-0.5 font-mono text-[13px] text-fg-muted">
            {totalTokens} / {MAX_TOKENS} tokens
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addMessage}
            disabled={isFull}
            className="rounded border border-accent bg-accent-light/20 px-3 py-1.5 font-mono text-[11px] text-accent transition-colors hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent-light/20 disabled:hover:text-accent"
          >
            + add turn
          </button>
          <button
            onClick={reset}
            className="rounded border border-border-light px-3 py-1.5 font-mono text-[11px] text-fg-muted transition-colors hover:border-accent hover:text-accent"
          >
            reset
          </button>
        </div>
      </div>

      {/* Token bar track */}
      <div className="h-8 w-full overflow-hidden rounded bg-border-light/50">
        <div className="flex h-full">
          {turns.map((turn) => {
            const segments = [
              { key: "user", tokens: turn.userTokens, color: COLORS.user.bg },
              { key: "ai", tokens: turn.aiTokens, color: COLORS.ai.bg },
              { key: "tool", tokens: turn.toolTokens, color: COLORS.tool.bg },
            ];
            return segments
              .filter((s) => s.tokens > 0)
              .map((s) => (
                <div
                  key={`${turn.id}-${s.key}`}
                  className={`${s.color} h-full transition-all duration-500`}
                  style={{ width: `${(s.tokens / MAX_TOKENS) * 100}%` }}
                />
              ));
          })}
        </div>
      </div>

      {/* Capacity warning */}
      {isFull && (
        <p className="mt-2 font-mono text-[11px] text-rose-500">
          context window full — oldest messages would be dropped
        </p>
      )}

      {/* Legend */}
      <div className="mt-3 flex gap-4">
        {(["user", "ai", "tool"] as const).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${COLORS[type].dot}`} />
            <span className={`font-mono text-[11px] ${COLORS[type].label}`}>
              {type === "ai" ? "assistant" : type}
            </span>
          </div>
        ))}
      </div>

      {/* Turn breakdown */}
      {turns.length > 0 && (
        <div className="mt-4 flex flex-col gap-1">
          {turns.map((turn) => (
            <div
              key={turn.id}
              className="flex items-center gap-3 font-mono text-[11px] text-fg-muted"
            >
              <span className="w-16 shrink-0 text-fg-light">
                turn {turn.id + 1}
              </span>
              <span className={COLORS.user.label}>{turn.userTokens}u</span>
              <span className={COLORS.ai.label}>{turn.aiTokens}a</span>
              {turn.toolTokens > 0 && (
                <span className={COLORS.tool.label}>{turn.toolTokens}t</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
