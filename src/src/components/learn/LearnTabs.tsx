"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { learnModules } from "@/lib/learn-modules";
import { OverviewTab } from "./OverviewTab";
import { ConversationSimulator } from "./ConversationSimulator";
import { LearnExplorer } from "./LearnExplorer";
import { DeepDivesTab } from "./DeepDivesTab";

const tabs = [
  { id: "overview", label: "start here", summary: "orientation + path" },
  { id: "guides", label: "guided sim", summary: "watch conversations" },
  { id: "modules", label: "file explorer", summary: "browse module files" },
  { id: "deep dives", label: "deep dives", summary: "domain studies" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabFlow: Record<TabId, { focus: string; next: TabId | null }> = {
  overview: {
    focus: "Understand the map, then choose a learning path.",
    next: "guides",
  },
  guides: {
    focus: "Watch realistic LLM/API traces step-by-step.",
    next: "modules",
  },
  modules: {
    focus: "Inspect the source files behind each module.",
    next: "deep dives",
  },
  "deep dives": {
    focus: "Explore longer, domain-specific investigations.",
    next: null,
  },
};

function isTabId(value: string | null): value is TabId {
  return tabs.some((tab) => tab.id === value);
}

export function LearnTabs() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const activeMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const nextTab = tabFlow[activeTab].next;

  useEffect(() => {
    if (isTabId(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  return (
    <div className="panel mx-auto w-[calc(100%-2*16px)] max-w-[1200px] overflow-hidden md:w-[calc(100%-2*40px)]">
      {/* Header bar */}
      <div className="border-b border-border-light">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="label-mono">~/learn</span>
          <span className="font-mono text-[10px] text-fg-light">
            interactive learning space
          </span>
        </div>

        {/* Tab bar */}
        <div className="learn-tabs flex overflow-x-auto border-t border-border-light">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2 font-mono text-[11px] transition-colors ${
                tab.id === activeTab
                  ? "border-b-2 border-accent text-accent"
                  : "text-fg-light hover:text-fg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Focus guide */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-light bg-bg-panel-hover px-4 py-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-fg-light">
              Focus: {activeMeta.summary}
            </p>
            <p className="text-[12px] text-fg-muted">{tabFlow[activeTab].focus}</p>
          </div>
          {nextTab ? (
            <button
              type="button"
              onClick={() => setActiveTab(nextTab)}
              className="rounded border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-muted transition-colors hover:border-accent hover:text-accent"
            >
              Next: {tabs.find((tab) => tab.id === nextTab)?.label}
            </button>
          ) : null}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab onNavigateTab={(tab) => setActiveTab(tab as TabId)} />
        )}

        {activeTab === "guides" && (
          <ConversationSimulator embedded />
        )}

        {activeTab === "modules" && (
          <div>
            <div className="border-b border-border-light px-5 py-2.5">
              <span className="font-mono text-[11px] text-fg-light">
                ~/learn
              </span>
            </div>
            <LearnExplorer modules={learnModules} />
          </div>
        )}

        {activeTab === "deep dives" && <DeepDivesTab />}
      </div>
    </div>
  );
}
