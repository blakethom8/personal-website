"use client";

import { useState } from "react";
import type { ContextSection, ContextSectionType } from "@/lib/conversation-scenarios";

interface ContextAnnotatedViewProps {
  sections: ContextSection[];
  totalTokens: number;
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

export function ContextAnnotatedView({
  sections,
  totalTokens,
}: ContextAnnotatedViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Only show active sections (not removed) in the token bar
  const activeSections = sections.filter((s) => !s.isRemoved);
  const activeTokens = activeSections.reduce((sum, s) => sum + s.tokenCount, 0);

  return (
    <div className="context-annotated">
      {/* Stacked token bar */}
      <div className="context-token-bar" aria-label="Token composition">
        {activeSections.map((section) => {
          const widthPct =
            activeTokens > 0
              ? (section.tokenCount / activeTokens) * 100
              : 0;
          if (widthPct < 0.5) return null;
          return (
            <div
              key={section.id}
              className={`context-token-segment${section.isSummary ? " context-token-segment-summary" : ""}`}
              style={{
                width: `${widthPct}%`,
                backgroundColor: section.isSummary
                  ? "transparent"
                  : SECTION_COLORS[section.type],
              }}
              title={`${section.label}: ${section.tokenCount.toLocaleString()} tokens`}
            />
          );
        })}
      </div>

      {/* Section rows */}
      <div className="context-section-list">
        {sections.map((section) => {
          const isExpanded = expandedIds.has(section.id);
          const color = SECTION_COLORS[section.type];

          let rowClass = "context-section";
          if (section.isNew) rowClass += " context-section-new";
          if (section.isRemoved) rowClass += " context-section-removed";
          if (section.isSummary) rowClass += " context-section-summary";

          // Token bar width relative to the largest section
          const maxTokens = Math.max(...sections.map((s) => s.tokenCount));
          const barPct =
            maxTokens > 0
              ? Math.max((section.tokenCount / maxTokens) * 100, 2)
              : 0;

          return (
            <button
              key={section.id}
              className={rowClass}
              onClick={() => toggleExpand(section.id)}
              aria-expanded={isExpanded}
            >
              {/* Header row */}
              <div className="context-section-header">
                <div className="context-section-label">
                  <span
                    className="context-section-dot"
                    style={{ backgroundColor: color }}
                  />
                  <span className="context-section-name">{section.label}</span>
                </div>
                <div className="context-section-tokens">
                  <div className="context-section-bar-track">
                    <div
                      className="context-section-bar-fill"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="context-section-count">
                    {section.tokenCount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Content preview */}
              <div
                className={`context-section-content${isExpanded ? " context-section-content-expanded" : ""}`}
              >
                {section.content}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
