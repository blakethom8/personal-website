"use client";

import { useEffect, useRef, useState } from "react";
import type { ContextSnapshot, ContextSectionType } from "@/lib/conversation-scenarios";

interface ContextPaneProps {
  snapshot: ContextSnapshot | undefined;
  onOpenModal: () => void;
}

const SECTION_COLORS: Record<ContextSectionType, string> = {
  "system-prompt": "var(--accent)",
  instructions: "#D4A574",
  "tool-definitions": "#9B8EC4",
  "message-user": "var(--fg-muted)",
  "message-assistant": "var(--accent)",
  "message-tool-call": "var(--accent-muted)",
  "message-tool-result": "var(--accent-muted)",
  summary: "var(--accent)",
};

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = to;
    if (from === to) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setDisplay(to);
      return;
    }

    const duration = 400;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

export function ContextPane({ snapshot, onOpenModal }: ContextPaneProps) {
  if (!snapshot) {
    return (
      <div className="sim-context-pane-empty">
        <span className="font-mono text-[11px] text-fg-light">
          press play to see the context window
        </span>
      </div>
    );
  }

  const pct = ((snapshot.tokenCount / snapshot.maxTokens) * 100).toFixed(1);
  const activeSections = snapshot.sections.filter((s) => !s.isRemoved);
  const removedSections = snapshot.sections.filter((s) => s.isRemoved);
  const maxSectionTokens = Math.max(...snapshot.sections.map((s) => s.tokenCount));

  return (
    <div className="sim-context-pane-inner">
      {/* Token count — hero number */}
      <div className="sim-context-hero">
        <div className="sim-context-count">
          ~<AnimatedCount value={snapshot.tokenCount} />
        </div>
        <div className="sim-context-meta">
          tokens · {pct}% of {(snapshot.maxTokens / 1000).toFixed(0)}K
        </div>

        {/* Progress bar */}
        <div className="sim-context-bar">
          <div
            className="sim-context-bar-fill"
            style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
          />
        </div>
      </div>

      {/* Annotation */}
      {snapshot.annotation && (
        <div className="sim-context-annotation">
          <span className="mr-1 font-bold text-accent">&rarr;</span>
          {snapshot.annotation}
        </div>
      )}

      {/* Section mini-list */}
      <div className="sim-context-sections">
        <div className="sim-context-sections-label">composition</div>

        {/* Stacked bar */}
        <div className="context-token-bar" style={{ marginBottom: 10, height: 6 }}>
          {activeSections.map((section) => {
            const activeTotal = activeSections.reduce((sum, s) => sum + s.tokenCount, 0);
            const widthPct = activeTotal > 0 ? (section.tokenCount / activeTotal) * 100 : 0;
            if (widthPct < 0.5) return null;
            return (
              <div
                key={section.id}
                className={`context-token-segment${section.isSummary ? " context-token-segment-summary" : ""}`}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: section.isSummary ? "transparent" : SECTION_COLORS[section.type],
                }}
                title={`${section.label}: ${section.tokenCount.toLocaleString()} tokens`}
              />
            );
          })}
        </div>

        {/* Section rows */}
        {snapshot.sections.map((section) => {
          const barPct = maxSectionTokens > 0
            ? Math.max((section.tokenCount / maxSectionTokens) * 100, 2)
            : 0;
          const color = SECTION_COLORS[section.type];

          let rowClass = "sim-context-section-row";
          if (section.isNew) rowClass += " sim-context-section-new";
          if (section.isRemoved) rowClass += " sim-context-section-removed";
          if (section.isSummary) rowClass += " sim-context-section-summary";

          return (
            <div key={section.id} className={rowClass}>
              <div className="sim-context-section-head">
                <span
                  className="sim-context-section-dot"
                  style={{ backgroundColor: color }}
                />
                <span className="sim-context-section-name">{section.label}</span>
                <span className="sim-context-section-count">
                  {section.tokenCount.toLocaleString()}
                </span>
              </div>
              <div className="sim-context-section-bar-track">
                <div
                  className="sim-context-section-bar-fill"
                  style={{ width: `${barPct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Removed count */}
      {removedSections.length > 0 && (
        <div className="sim-context-removed-note">
          {removedSections.length} section{removedSections.length > 1 ? "s" : ""} removed
        </div>
      )}

      {/* View full context button */}
      <button
        onClick={onOpenModal}
        className="sim-context-view-btn"
      >
        view full context
      </button>
    </div>
  );
}
