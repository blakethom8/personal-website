"use client";

import { useRef, useEffect } from "react";
import type { ConversationStep } from "@/lib/conversation-scenarios";
import { JsonBlock } from "./JsonBlock";

interface ApiPaneProps {
  steps: ConversationStep[];
  visibleSteps: number;
}

export function ApiPane({ steps, visibleSteps }: ApiPaneProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [visibleSteps]);

  const visibleMessages = steps.slice(0, visibleSteps);

  return (
    <div className="flex flex-col h-full">
      <div className="sim-pane-header">
        <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light">
          what&apos;s happening
        </span>
      </div>
      <div className="sim-pane-content flex-1 overflow-y-auto">
        {visibleSteps === 0 ? (
          <div className="flex h-full items-center justify-center py-12">
            <span className="font-mono text-[11px] text-fg-light">
              api calls appear here
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-3">
            {visibleMessages.map((step, stepIdx) =>
              step.api.map((block, blockIdx) => (
                <div
                  key={`${stepIdx}-${blockIdx}`}
                  className="sim-api-block sim-message-enter"
                >
                  {/* Block label */}
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border-light bg-bg-panel">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light">
                      {block.label}
                    </span>
                    <span className="font-mono text-[10px] text-fg-light opacity-40">
                      step {stepIdx + 1}
                    </span>
                  </div>

                  {/* JSON content */}
                  <div className="rounded-b">
                    <JsonBlock
                      code={block.json}
                      highlightLines={block.highlightLines}
                    />
                  </div>

                  {/* Annotation */}
                  {block.annotation && (
                    <div className="border-t border-border-light bg-accent-light/30 px-3 py-2">
                      <p className="font-mono text-[10px] leading-relaxed text-accent">
                        <span className="mr-1 font-bold">→</span>
                        {block.annotation}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
