"use client";

import { useRef, useEffect } from "react";
import type { ConversationStep } from "@/lib/conversation-scenarios";
import { ChatMessage } from "./ChatMessage";

interface ChatPaneProps {
  steps: ConversationStep[];
  visibleSteps: number;
  isLoading: boolean;
}

export function ChatPane({ steps, visibleSteps, isLoading }: ChatPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages appear or loading starts
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [visibleSteps, isLoading]);

  const visibleMessages = steps.slice(0, visibleSteps);

  // Determine loading label based on what the next step will be
  const getLoadingLabel = () => {
    if (!isLoading || visibleSteps >= steps.length) return null;
    const nextStep = steps[visibleSteps];
    if (!nextStep) return null;

    switch (nextStep.chat.role) {
      case "assistant":
        return "generating response";
      case "tool-call":
        return "processing";
      case "tool-result":
        return nextStep.chat.toolName
          ? `calling ${nextStep.chat.toolName}`
          : "calling api";
      case "thinking":
        return "thinking";
      default:
        return "waiting";
    }
  };

  const loadingLabel = getLoadingLabel();

  return (
    <div className="flex flex-col h-full">
      <div className="sim-pane-header">
        <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light">
          what you see
        </span>
      </div>
      <div ref={scrollRef} className="sim-pane-content flex-1 overflow-y-auto">
        {visibleSteps === 0 ? (
          <div className="flex h-full items-center justify-center py-12">
            <span className="font-mono text-[11px] text-fg-light">
              press play to start
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-3">
            {visibleMessages.map((step, i) => (
              <ChatMessage
                key={`${step.chat.role}-${i}`}
                message={step.chat}
                isLatest={i === visibleSteps - 1}
              />
            ))}

            {/* Loading indicator — simulates server round-trip */}
            {isLoading && loadingLabel && (
              <div className="sim-message-enter flex items-center gap-2.5 rounded-sm border border-border-light border-l-[3px] border-l-accent-muted bg-bg-panel px-3 py-2.5">
                <div className="flex items-center gap-1">
                  <span className="sim-dot h-[5px] w-[5px] rounded-full bg-accent-muted" />
                  <span className="sim-dot h-[5px] w-[5px] rounded-full bg-accent-muted [animation-delay:0.2s]" />
                  <span className="sim-dot h-[5px] w-[5px] rounded-full bg-accent-muted [animation-delay:0.4s]" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light">
                  {loadingLabel}
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
