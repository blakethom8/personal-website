"use client";

import { MatrixTerminal } from "./MatrixTerminal";

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

const sections = [
  {
    tab: "guides",
    title: "Guides",
    detail: "4 scenarios",
    description: "Watch LLM conversations unfold in real-time",
  },
  {
    tab: "modules",
    title: "Modules",
    detail: "6 modules",
    description: "Structured lessons with real JSON examples",
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

      {/* Welcome text */}
      <div className="px-5 py-5">
        <p className="font-mono text-[13px] leading-relaxed text-fg-muted">
          <span className="text-fg">welcome to the learning lab.</span>
          <br /><br />
          I build interactive learning materials for people who want to
          understand AI — not just use it. Whether you&apos;re technical or not,
          everything here is hands-on and explorable.
          <br /><br />
          Feedback is always welcome — this is a work in progress.
        </p>
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
