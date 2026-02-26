"use client";

import Link from "next/link";
import { MatrixTerminal } from "./MatrixTerminal";

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

const sections = [
  {
    tab: "guides",
    title: "Guided Simulator",
    detail: "4 scenarios",
    description: "Watch LLM conversations and API traces unfold step-by-step.",
  },
  {
    tab: "modules",
    title: "Module Files",
    detail: "6 modules",
    description: "Browse the source files that power each learning module.",
  },
  {
    tab: "deep dives",
    title: "Deep Dives",
    detail: "coming soon",
    description: "Domain-specific explorations",
  },
];

export function OverviewTab({ onNavigateTab }: OverviewTabProps) {
  return (
    <div>
      {/* Terminal block */}
      <MatrixTerminal />

      {/* Quick orientation */}
      <div className="border-b border-border-light bg-bg-panel-hover px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
          Start Here
        </p>
        <ol className="mt-2 space-y-1 text-[13px] leading-relaxed text-fg-muted">
          <li>1. Open <span className="font-medium text-fg">Guided Simulator</span> for a quick, hands-on walkthrough.</li>
          <li>2. Use <span className="font-medium text-fg">Module Files</span> to inspect structured JSON and markdown examples.</li>
          <li>3. Jump to <span className="font-medium text-fg">WebMCP Lab</span> for browser-agent tooling demos.</li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab("guides")}
            className="rounded bg-accent px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Start Guided Simulator
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab("modules")}
            className="rounded border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-muted transition-colors hover:border-accent hover:text-accent"
          >
            Browse Module Files
          </button>
          <Link
            href="/learn/webmcp-lab"
            className="rounded border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-muted transition-colors hover:border-accent hover:text-accent"
          >
            Open WebMCP Lab
          </Link>
        </div>
      </div>

      {/* Section links */}
      <div className="flex flex-col gap-3 px-5 pb-5">
        {sections.map((section) => (
          <button
            key={section.tab}
            onClick={() => onNavigateTab(section.tab)}
            className="group rounded border border-border-light p-4 text-left transition-colors hover:border-accent-muted"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-mono text-[13px] font-medium text-fg">
                {section.title}
              </h3>
              <span className="font-mono text-[10px] text-fg-light">
                {section.detail}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
              {section.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
