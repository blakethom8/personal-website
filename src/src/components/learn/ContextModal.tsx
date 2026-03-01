"use client";

import { useEffect, useCallback, useState } from "react";
import type { ContextSnapshot } from "@/lib/conversation-scenarios";
import { JsonBlock } from "./JsonBlock";
import { ContextAnnotatedView } from "./ContextAnnotatedView";

type ViewMode = "annotated" | "raw";

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: ContextSnapshot;
}

export function ContextModal({ isOpen, onClose, snapshot }: ContextModalProps) {
  const [view, setView] = useState<ViewMode>("annotated");

  // Close on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  const pct = ((snapshot.tokenCount / snapshot.maxTokens) * 100).toFixed(1);

  return (
    <>
      {/* Backdrop */}
      <div className="context-modal-backdrop" onClick={onClose} />

      {/* Modal panel */}
      <div
        className="context-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Context Window"
      >
        {/* Header */}
        <div className="context-modal-header">
          <div className="context-modal-title">
            <span className="label-mono">context window</span>
            <span className="context-modal-stats">
              {snapshot.tokenCount.toLocaleString()} / {snapshot.maxTokens.toLocaleString()} tokens ({pct}%)
            </span>
          </div>

          <div className="context-modal-actions">
            {/* View toggle */}
            <div className="context-view-toggle">
              <button
                onClick={() => setView("annotated")}
                className={`context-view-toggle-btn${view === "annotated" ? " active" : ""}`}
              >
                annotated
              </button>
              <button
                onClick={() => setView("raw")}
                className={`context-view-toggle-btn${view === "raw" ? " active" : ""}`}
              >
                raw json
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="sim-control-btn"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="context-modal-body">
          {view === "annotated" ? (
            <ContextAnnotatedView
              sections={snapshot.sections}
              totalTokens={snapshot.tokenCount}
            />
          ) : (
            <JsonBlock code={snapshot.payload} />
          )}
        </div>

        {/* Annotation footer */}
        {snapshot.annotation && (
          <div className="context-modal-footer">
            <p className="font-mono text-[10px] leading-relaxed text-accent">
              <span className="mr-1 font-bold">&rarr;</span>
              {snapshot.annotation}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
