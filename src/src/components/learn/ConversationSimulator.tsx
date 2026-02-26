"use client";

import { useState } from "react";
import { scenarios } from "@/lib/conversation-scenarios";
import { openclawScenarios } from "@/lib/openclaw-terminal-scenarios";
import { useSimulator } from "@/hooks/useSimulator";
import { ChatPane } from "./ChatPane";
import { ApiPane } from "./ApiPane";

type MobilePane = "chat" | "api";
type ScenarioSet = "api" | "openclaw";

interface ConversationSimulatorProps {
  embedded?: boolean;
}

const scenarioSets = {
  api: { label: "api patterns", scenarios },
  openclaw: { label: "openclaw workflows", scenarios: openclawScenarios },
};

export function ConversationSimulator({ embedded = false }: ConversationSimulatorProps) {
  const [scenarioSet, setScenarioSet] = useState<ScenarioSet>("api");
  const [activeScenario, setActiveScenario] = useState(0);
  const [mobilePane, setMobilePane] = useState<MobilePane>("chat");

  const currentScenarios = scenarioSets[scenarioSet].scenarios;
  const scenario = currentScenarios[activeScenario];
  const sim = useSimulator(scenario);

  const switchScenario = (idx: number) => {
    setActiveScenario(idx);
    setMobilePane("chat");
  };

  const switchScenarioSet = (set: ScenarioSet) => {
    setScenarioSet(set);
    setActiveScenario(0);
    setMobilePane("chat");
  };

  const progressPct =
    sim.totalSteps > 0
      ? Math.round((sim.visibleSteps / sim.totalSteps) * 100)
      : 0;

  return (
    <div className={embedded ? "sim-container overflow-hidden" : "sim-container panel mx-auto w-[calc(100%-2*16px)] max-w-[1200px] overflow-hidden md:w-[calc(100%-2*40px)]"}>
      {/* Header: label + set selector + tabs */}
      <div className="border-b border-border-light">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="label-mono">conversation simulator</span>
          
          {/* Scenario set selector */}
          <div className="flex gap-2">
            <button
              onClick={() => switchScenarioSet("api")}
              className={`px-2 py-1 font-mono text-[10px] transition-colors rounded ${
                scenarioSet === "api"
                  ? "bg-accent/10 text-accent"
                  : "text-fg-light hover:text-fg-muted"
              }`}
            >
              api patterns
            </button>
            <button
              onClick={() => switchScenarioSet("openclaw")}
              className={`px-2 py-1 font-mono text-[10px] transition-colors rounded ${
                scenarioSet === "openclaw"
                  ? "bg-accent/10 text-accent"
                  : "text-fg-light hover:text-fg-muted"
              }`}
            >
              openclaw workflows
            </button>
          </div>
        </div>

        {/* Scenario tabs */}
        <div className="sim-tabs flex overflow-x-auto border-t border-border-light">
          {currentScenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => switchScenario(i)}
              className={`sim-tab whitespace-nowrap px-4 py-2 font-mono text-[11px] transition-colors ${
                i === activeScenario
                  ? "border-b-2 border-accent text-accent"
                  : "text-fg-light hover:text-fg-muted"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile pane toggle */}
      <div className="flex border-b border-border-light md:hidden">
        <button
          onClick={() => setMobilePane("chat")}
          className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-wider ${
            mobilePane === "chat"
              ? "bg-bg-panel text-accent"
              : "bg-bg-panel-hover text-fg-light"
          }`}
        >
          chat
        </button>
        <button
          onClick={() => setMobilePane("api")}
          className={`flex-1 border-l border-border-light py-2 font-mono text-[10px] uppercase tracking-wider ${
            mobilePane === "api"
              ? "bg-bg-panel text-accent"
              : "bg-bg-panel-hover text-fg-light"
          }`}
        >
          api
        </button>
      </div>

      {/* Panes — desktop: side-by-side, mobile: toggle */}
      <div className="sim-panes md:grid md:grid-cols-2 md:divide-x md:divide-border-light">
        {/* Chat pane */}
        <div className={`${mobilePane !== "chat" ? "hidden md:block" : ""}`}>
          <ChatPane steps={scenario.steps} visibleSteps={sim.visibleSteps} isLoading={sim.isLoading} />
        </div>

        {/* API pane */}
        <div className={`${mobilePane !== "api" ? "hidden md:block" : ""}`}>
          <ApiPane steps={scenario.steps} visibleSteps={sim.visibleSteps} />
        </div>
      </div>

      {/* Controls bar */}
      <div className="border-t border-border-light">
        {/* Progress bar */}
        <div className="h-[2px] bg-border-light">
          <div
            className="h-full bg-accent transition-all duration-400 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Playback controls */}
          <div className="flex items-center gap-1">
            {/* Step back */}
            <button
              onClick={sim.stepBack}
              disabled={sim.visibleSteps <= 1}
              className="sim-control-btn"
              aria-label="Step back"
            >
              ◁
            </button>

            {/* Play/Pause */}
            {sim.playback === "playing" ? (
              <button
                onClick={sim.pause}
                className="sim-control-btn sim-control-primary"
                aria-label="Pause"
              >
                ▮▮
              </button>
            ) : (
              <button
                onClick={sim.play}
                className="sim-control-btn sim-control-primary"
                aria-label="Play"
              >
                ▶
              </button>
            )}

            {/* Step forward */}
            <button
              onClick={sim.stepForward}
              disabled={sim.visibleSteps >= sim.totalSteps}
              className="sim-control-btn"
              aria-label="Step forward"
            >
              ▷
            </button>

            {/* Reset */}
            <button
              onClick={sim.reset}
              className="sim-control-btn ml-1"
              aria-label="Reset"
            >
              ↺
            </button>
          </div>

          {/* Step counter */}
          <span className="font-mono text-[10px] text-fg-light">
            {sim.visibleSteps > 0 ? (
              <>
                step {sim.visibleSteps}/{sim.totalSteps}
              </>
            ) : (
              <>
                {sim.totalSteps} steps
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
