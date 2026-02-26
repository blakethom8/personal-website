"use client";

import { TypewriterBlock } from "./TypewriterBlock";
import { ApiCallBanner } from "./ApiCallBanner";

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

const typewriterLines = [
  { text: "> welcome to the learning lab.", className: "" },
  { text: "" },
  { text: "this is where I break down how AI actually works --" },
  { text: "not the hype, the real mechanics." },
  { text: "" },
  { text: "browse the tabs above:" },
  { text: "  simulator   → watch LLM conversations unfold in real-time" },
  { text: "  modules     → structured lessons with real API examples" },
  { text: "  toolbox     → what I use to build with AI today" },
  { text: "  repos       → open source projects and experiments" },
  { text: "" },
  { text: "everything here is interactive. no slides, no lectures." },
  { text: "just you and the machine." },
];

const sectionPreviews = [
  {
    tab: "simulator",
    title: "Conversation Simulator",
    description:
      "Watch what happens behind the scenes when you talk to an LLM. See the API calls, the tool use, the agent loop.",
    detail: "4 scenarios",
  },
  {
    tab: "modules",
    title: "Learning Modules",
    description:
      "File-tree style lessons that walk through LLM concepts with real JSON examples.",
    detail: "6 modules",
  },
  {
    tab: "toolbox",
    title: "My Toolbox",
    description:
      "What I actually use for AI-assisted development. The tools, the workflows, the setup.",
    detail: "updated regularly",
  },
  {
    tab: "repos",
    title: "GitHub Repos",
    description:
      "Open source projects and experiments. Code you can read, fork, and learn from.",
    detail: "public repos",
  },
];

export function OverviewTab({ onNavigateTab }: OverviewTabProps) {
  return (
    <div>
      {/* Typewriter terminal block */}
      <TypewriterBlock lines={typewriterLines} speed={22} lineDelay={300} />

      {/* Section preview cards */}
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {sectionPreviews.map((section) => (
          <button
            key={section.tab}
            onClick={() => onNavigateTab(section.tab)}
            className="group rounded border border-border-light p-4 text-left transition-colors hover:border-accent-muted"
          >
            <span className="label-mono text-[10px]">{section.tab}</span>
            <h3 className="mt-1 font-sans text-[14px] font-semibold text-fg">
              {section.title}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
              {section.description}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-fg-light transition-colors group-hover:text-accent">
              {section.detail}
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* API Call Banner */}
      <div className="border-t border-border-light p-5">
        <p className="label-mono mb-3">what does an llm api call look like?</p>
        <ApiCallBanner />
      </div>
    </div>
  );
}
