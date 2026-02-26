"use client";

import { useState } from "react";
import { learnModules } from "@/lib/learn-modules";
import { OverviewTab } from "./OverviewTab";
import { ConversationSimulator } from "./ConversationSimulator";
import { LearnExplorer } from "./LearnExplorer";
import { DeepDivesTab } from "./DeepDivesTab";

const tabs = [
  { id: "overview", label: "overview" },
  { id: "guides", label: "guides" },
  { id: "modules", label: "modules" },
  { id: "deep dives", label: "deep dives" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function LearnTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

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
