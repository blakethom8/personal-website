"use client";

import { useState } from "react";
import {
  scenarios,
  isScenarioGroup,
  type Scenario,
  type ScenarioTabItem,
  type ScenarioIntro,
} from "@/lib/conversation-scenarios";
import { openclawScenarios } from "@/lib/openclaw-terminal-scenarios";
import { contextScenarios } from "@/lib/context-scenarios";
import { useSimulator } from "@/hooks/useSimulator";
import { SimulatorFlow } from "./SimulatorFlow";
import { ContextPane } from "./ContextPane";
import { ContextModal } from "./ContextModal";

type ScenarioSet = "api" | "openclaw" | "context";

interface ConversationSimulatorProps {
  embedded?: boolean;
}

const scenarioSets: Record<ScenarioSet, { label: string; scenarios: ScenarioTabItem[] }> = {
  api: { label: "how it works", scenarios },
  openclaw: { label: "agent workflows", scenarios: openclawScenarios },
  context: { label: "context window", scenarios: contextScenarios },
};

const EMPTY_SCENARIO: Scenario = { id: "__empty__", title: "", steps: [] };

export function ConversationSimulator({ embedded = false }: ConversationSimulatorProps) {
  const [scenarioSet, setScenarioSet] = useState<ScenarioSet>("api");
  const [activeScenario, setActiveScenario] = useState(0);
  const [activeSubScenario, setActiveSubScenario] = useState<number | null>(null);
  const [contextModalOpen, setContextModalOpen] = useState(false);

  const currentItems = scenarioSets[scenarioSet].scenarios;
  const activeItem = currentItems[activeScenario];

  // Resolve the active scenario and intro from the current tab item
  let scenario: Scenario | null = null;
  let activeIntro: ScenarioIntro | undefined = undefined;

  if (isScenarioGroup(activeItem)) {
    if (activeSubScenario !== null) {
      scenario = activeItem.subScenarios[activeSubScenario];
      activeIntro = scenario.intro;
    } else {
      scenario = null;
      activeIntro = activeItem.intro;
    }
  } else {
    scenario = activeItem;
    activeIntro = activeItem.intro;
  }

  const sim = useSimulator(scenario ?? EMPTY_SCENARIO);

  const switchScenario = (idx: number) => {
    setActiveScenario(idx);
    setActiveSubScenario(null);
  };

  const switchScenarioSet = (set: ScenarioSet) => {
    setScenarioSet(set);
    setActiveScenario(0);
    setActiveSubScenario(null);
  };

  const progressPct =
    sim.totalSteps > 0
      ? Math.round((sim.visibleSteps / sim.totalSteps) * 100)
      : 0;

  const isContextSet = scenarioSet === "context";
  const showUmbrellaIntro = isScenarioGroup(activeItem) && activeSubScenario === null;

  // Get context snapshot for current visible step
  const currentContext =
    sim.visibleSteps > 0 && scenario
      ? scenario.steps[sim.visibleSteps - 1]?.context
      : undefined;

  return (
    <div className={embedded ? "sim-container overflow-hidden" : "sim-container panel mx-auto w-[calc(100%-2*16px)] max-w-[1200px] overflow-hidden md:w-[calc(100%-2*40px)]"}>
      {/* Header: label + set selector + tabs */}
      <div className="border-b border-border-light">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="label-mono">conversation simulator</span>

          {/* Scenario set selector */}
          <div className="flex gap-2">
            {(Object.keys(scenarioSets) as ScenarioSet[]).map((key) => (
              <button
                key={key}
                onClick={() => switchScenarioSet(key)}
                className={`px-2 py-1 font-mono text-[10px] transition-colors rounded ${
                  scenarioSet === key
                    ? "bg-accent/10 text-accent"
                    : "text-fg-light hover:text-fg-muted"
                }`}
              >
                {scenarioSets[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario tabs */}
        <div className="sim-tabs flex overflow-x-auto border-t border-border-light">
          {currentItems.map((s, i) => (
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

        {/* Sub-tabs for scenario groups */}
        {isScenarioGroup(activeItem) && (
          <div className="sim-subtabs sim-tabs flex overflow-x-auto">
            <button
              onClick={() => setActiveSubScenario(null)}
              className={`whitespace-nowrap px-3 py-1.5 font-mono text-[10px] transition-colors ${
                activeSubScenario === null
                  ? "text-accent"
                  : "text-fg-light hover:text-fg-muted"
              }`}
            >
              overview
            </button>
            {activeItem.subScenarios.map((sub, i) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubScenario(i)}
                className={`whitespace-nowrap px-3 py-1.5 font-mono text-[10px] transition-colors ${
                  activeSubScenario === i
                    ? "text-accent"
                    : "text-fg-light hover:text-fg-muted"
                }`}
              >
                {sub.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content area — flex layout with optional side pane */}
      {showUmbrellaIntro ? (
        /* Umbrella intro for scenario groups */
        <div className="sim-pane-content flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="label-mono">{activeItem.intro.label}</span>
            <h3 className="font-serif text-xl text-fg sm:text-2xl">{activeItem.intro.heading}</h3>
            <p className="max-w-md text-sm leading-relaxed text-fg-muted">{activeItem.intro.description}</p>
            <span className="mt-2 font-mono text-[10px] text-fg-light">
              choose a strategy above to begin
            </span>
          </div>
        </div>
      ) : (
        <div className="sim-layout">
          <div className="sim-main" data-shifted={isContextSet && scenario !== null}>
            <SimulatorFlow
              steps={scenario?.steps ?? []}
              visibleSteps={sim.visibleSteps}
              isLoading={sim.isLoading}
              intro={activeIntro}
              onPlay={sim.play}
            />
          </div>

          <div className="sim-pane" data-open={isContextSet && scenario !== null}>
            <div className="sim-pane-header">
              <span className="label-mono">context window</span>
            </div>
            <div className="sim-context-pane-scroll">
              <ContextPane
                snapshot={currentContext}
                onOpenModal={() => setContextModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Controls bar — hidden during umbrella intro */}
      {!showUmbrellaIntro && (
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
      )}

      {/* Context modal */}
      {currentContext && (
        <ContextModal
          isOpen={contextModalOpen}
          onClose={() => setContextModalOpen(false)}
          snapshot={currentContext}
        />
      )}
    </div>
  );
}
