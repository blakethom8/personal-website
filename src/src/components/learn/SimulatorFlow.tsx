"use client";

import { useRef, useEffect } from "react";
import type { ConversationStep, ScenarioIntro } from "@/lib/conversation-scenarios";
import { ChatMessage } from "./ChatMessage";
import { JsonBlock } from "./JsonBlock";

interface SimulatorFlowProps {
  steps: ConversationStep[];
  visibleSteps: number;
  isLoading: boolean;
  intro?: ScenarioIntro;
}

export function SimulatorFlow({
  steps,
  visibleSteps,
  isLoading,
  intro,
}: SimulatorFlowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

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
    <div className="sim-pane-content overflow-y-auto">
      {visibleSteps === 0 ? (
        intro ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span className="label-mono">{intro.label}</span>
            <h3 className="font-serif text-xl text-fg sm:text-2xl">{intro.heading}</h3>
            <p className="max-w-md text-sm leading-relaxed text-fg-muted">{intro.description}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-fg-light">
              use the controls above to step phase-by-phase or autoplay
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <span className="font-mono text-[11px] text-fg-light">
              press play to start
            </span>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-1 p-3">
          {visibleMessages.map((step, i) => (
            <div key={`step-${i}`} className="flex flex-col gap-1.5">
              {/* Chat message — full width */}
              <ChatMessage
                message={step.chat}
                isLatest={i === visibleSteps - 1}
              />

              {/* API blocks — indented to distinguish from conversation */}
              {step.api.length > 0 && (
                <div className="ml-[10%] sm:ml-[12%] flex flex-col gap-1.5">
                  {step.api.map((block, blockIdx) => (
                    <div
                      key={`api-${i}-${blockIdx}`}
                      className="sim-api-block sim-message-enter"
                    >
                      {/* Block label */}
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border-light bg-bg-panel">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light">
                          {block.label}
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
                            <span className="mr-1 font-bold">&rarr;</span>
                            {block.annotation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
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
  );
}
