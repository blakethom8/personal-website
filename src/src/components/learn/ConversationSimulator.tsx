"use client";

import { useEffect, useRef, useState } from "react";
import {
  scenarios,
  isScenarioGroup,
  type Scenario,
  type ConversationStep,
  type ScenarioTabItem,
  type ScenarioIntro,
} from "@/lib/conversation-scenarios";
import { openclawScenarios } from "@/lib/openclaw-terminal-scenarios";
import { contextScenarios } from "@/lib/context-scenarios";
import { useSimulator } from "@/hooks/useSimulator";
import { SimulatorFlow } from "./SimulatorFlow";
import { ContextPane } from "./ContextPane";
import { ContextModal } from "./ContextModal";
import { WorkspacePane } from "./WorkspacePane";
import type { PlaybackState } from "@/hooks/useSimulator";

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

interface SimulatorControlsProps {
  steps: ConversationStep[];
  totalSteps: number;
  visibleSteps: number;
  playback: PlaybackState;
  isLoading: boolean;
  paneToggleLabel: string | null;
  paneOpen: boolean;
  onStepBack: () => void;
  onStepForward: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onGoToStep: (stepNum: number) => void;
  onTogglePane: () => void;
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function compactPhaseLabel(label: string): string {
  return label
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/^Assistant\s+/i, "")
    .replace(/\s+Message$/i, " Message")
    .trim();
}

function getPhaseLabel(step: ConversationStep): string {
  const newestSection = step.context?.sections.find((section) => section.isNew);
  if (newestSection?.label) {
    return compactPhaseLabel(newestSection.label);
  }

  if (step.chat.role === "tool-call") {
    return step.chat.toolName ? `${step.chat.toolName} Call` : "Tool Call";
  }

  if (step.chat.role === "tool-result") {
    return step.chat.toolName ? `${step.chat.toolName} Result` : "Tool Result";
  }

  const apiLabel = step.api[0]?.label?.toLowerCase().trim();
  if (apiLabel) {
    if (apiLabel.includes("request")) return "Request";
    if (apiLabel.includes("response")) return "Response";
    if (apiLabel.includes("tool_use")) return "Tool Call";
    return toTitleCase(apiLabel.replace(/[^a-z0-9]+/g, " "));
  }

  switch (step.chat.role) {
    case "user":
      return "User Message";
    case "assistant":
      return "Assistant Reply";
    case "thinking":
      return "Reasoning";
    case "narrator":
      return "Concept";
    default:
      return "Phase";
  }
}

function SimulatorControls({
  steps,
  totalSteps,
  visibleSteps,
  playback,
  isLoading,
  paneToggleLabel,
  paneOpen,
  onStepBack,
  onStepForward,
  onPlay,
  onPause,
  onReset,
  onGoToStep,
  onTogglePane,
}: SimulatorControlsProps) {
  const hasStarted = visibleSteps > 0;
  const atEnd = totalSteps > 0 && visibleSteps >= totalSteps;
  const phaseRailRef = useRef<HTMLDivElement | null>(null);
  const phaseChipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const currentPhaseLabel =
    visibleSteps > 0 && steps[visibleSteps - 1]
      ? getPhaseLabel(steps[visibleSteps - 1]!)
      : null;

  useEffect(() => {
    if (totalSteps === 0) return;

    const targetIndex = visibleSteps > 0 ? visibleSteps - 1 : 0;
    const targetChip = phaseChipRefs.current[targetIndex];

    if (targetChip) {
      targetChip.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
      return;
    }

    phaseRailRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [totalSteps, visibleSteps]);

  return (
    <div className="border-b border-border-light bg-bg-panel/85">
      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onStepBack}
              disabled={visibleSteps <= 1}
              className="sim-action-btn"
              aria-label="Go back one phase"
            >
              <span>◁</span>
              <span>back</span>
            </button>

            <button
              onClick={onStepForward}
              disabled={atEnd}
              className="sim-action-btn sim-action-primary"
              aria-label="Advance to the next phase"
            >
              <span>next phase</span>
              <span>▷</span>
            </button>

            {playback === "playing" ? (
              <button
                onClick={onPause}
                className="sim-action-btn"
                aria-label="Pause autoplay"
              >
                <span>▮▮</span>
                <span>pause</span>
              </button>
            ) : (
              <button
                onClick={onPlay}
                className="sim-action-btn"
                aria-label="Autoplay the simulation"
              >
                <span>▶</span>
                <span>autoplay</span>
              </button>
            )}

            <button
              onClick={onReset}
              disabled={!hasStarted && playback === "idle"}
              className="sim-action-btn"
              aria-label="Reset simulation"
            >
              <span>↺</span>
              <span>reset</span>
            </button>

            {paneToggleLabel && (
              <button
                onClick={onTogglePane}
                className="sim-action-btn"
                aria-pressed={paneOpen}
                aria-label={paneOpen ? `Hide ${paneToggleLabel}` : `Show ${paneToggleLabel}`}
              >
                <span>{paneOpen ? "◫" : "◧"}</span>
                <span>{paneOpen ? `hide ${paneToggleLabel}` : `show ${paneToggleLabel}`}</span>
              </button>
            )}
          </div>

          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-fg-light">
            {hasStarted ? `phase ${visibleSteps}/${totalSteps}` : `${totalSteps} phases`}
            {isLoading ? " · loading" : ""}
          </span>
        </div>

        {totalSteps > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-fg-light">
                timeline
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-fg-light">
                {currentPhaseLabel ?? "ready to begin"}
              </span>
            </div>
            <div ref={phaseRailRef} className="sim-phase-scroller sim-tabs">
              <div className="sim-phase-rail">
                {steps.map((step, i) => {
                  const phaseNum = i + 1;
                  const isCurrent = visibleSteps === phaseNum;
                  const isVisited = visibleSteps > phaseNum;
                  const isFuture = visibleSteps < phaseNum;

                  return (
                    <button
                      key={phaseNum}
                      ref={(node) => {
                        phaseChipRefs.current[i] = node;
                      }}
                      onClick={() => onGoToStep(phaseNum)}
                      className={`sim-phase-chip${isCurrent ? " sim-phase-chip-current" : ""}${isVisited ? " sim-phase-chip-visited" : ""}${isFuture ? " sim-phase-chip-future" : ""}`}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`Go to phase ${phaseNum}: ${getPhaseLabel(step)}`}
                      title={`Phase ${phaseNum}: ${getPhaseLabel(step)}`}
                    >
                      <span className="sim-phase-chip-index">{phaseNum}</span>
                      <span className="sim-phase-chip-label">{getPhaseLabel(step)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ConversationSimulator({ embedded = false }: ConversationSimulatorProps) {
  const [scenarioSet, setScenarioSet] = useState<ScenarioSet>("api");
  const [activeScenario, setActiveScenario] = useState(0);
  const [activeSubScenario, setActiveSubScenario] = useState<number | null>(null);
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [sidePaneOverride, setSidePaneOverride] = useState<boolean | null>(null);

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
    setSidePaneOverride(null);
  };

  const switchScenarioSet = (set: ScenarioSet) => {
    setScenarioSet(set);
    setActiveScenario(0);
    setActiveSubScenario(null);
    setSidePaneOverride(null);
  };

  const switchSubScenario = (idx: number | null) => {
    setActiveSubScenario(idx);
    setSidePaneOverride(null);
  };

  const showUmbrellaIntro = isScenarioGroup(activeItem) && activeSubScenario === null;

  // Get context snapshot for current visible step
  const currentContext =
    sim.visibleSteps > 0 && scenario
      ? scenario.steps[sim.visibleSteps - 1]?.context
      : undefined;
  const initialWorkspace =
    scenario?.steps.find((step) => step.workspace)?.workspace;
  const currentWorkspace =
    scenario && sim.visibleSteps > 0
      ? scenario.steps[sim.visibleSteps - 1]?.workspace ?? initialWorkspace
      : initialWorkspace;

  // Show context pane if any step in the scenario has context data
  const hasContextData = scenario?.steps.some((step) => step.context) ?? false;
  const hasWorkspaceData = scenario?.steps.some((step) => step.workspace) ?? false;
  const paneKind =
    scenarioSet === "openclaw" && hasWorkspaceData
      ? "workspace"
      : hasContextData
        ? "context"
        : hasWorkspaceData
          ? "workspace"
          : null;
  const paneToggleLabel =
    paneKind === "workspace" ? "workspace" : paneKind === "context" ? "context" : null;
  const paneHeaderLabel =
    paneKind === "workspace" ? "workspace map" : paneKind === "context" ? "context window" : null;
  const defaultPaneOpen =
    paneKind === "context"
      ? scenarioSet === "context"
      : paneKind === "workspace"
        ? scenarioSet === "openclaw"
        : false;
  const sidePaneOpen = paneKind !== null && (sidePaneOverride ?? defaultPaneOpen);

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
              onClick={() => switchSubScenario(null)}
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
                onClick={() => switchSubScenario(i)}
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

      {!showUmbrellaIntro && (
        <SimulatorControls
          steps={scenario?.steps ?? []}
          totalSteps={sim.totalSteps}
          visibleSteps={sim.visibleSteps}
          playback={sim.playback}
          isLoading={sim.isLoading}
          paneToggleLabel={paneToggleLabel}
          paneOpen={sidePaneOpen}
          onStepBack={sim.stepBack}
          onStepForward={sim.stepForward}
          onPlay={sim.play}
          onPause={sim.pause}
          onReset={sim.reset}
          onGoToStep={sim.goToStep}
          onTogglePane={() =>
            setSidePaneOverride((previous) => !(previous ?? defaultPaneOpen))
          }
        />
      )}

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
          <div className="sim-main" data-shifted={sidePaneOpen && paneKind !== null && scenario !== null}>
            <SimulatorFlow
              steps={scenario?.steps ?? []}
              visibleSteps={sim.visibleSteps}
              isLoading={sim.isLoading}
              intro={activeIntro}
            />
          </div>

          <div className="sim-pane" data-open={sidePaneOpen && paneKind !== null && scenario !== null}>
            <div className="sim-pane-header flex items-center justify-between gap-3">
              <span className="label-mono">{paneHeaderLabel}</span>
              <button
                onClick={() => setSidePaneOverride(false)}
                className="font-mono text-[10px] uppercase tracking-[0.08em] text-fg-light transition-colors hover:text-accent"
              >
                hide
              </button>
            </div>
            <div className="sim-context-pane-scroll">
              {paneKind === "workspace" ? (
                <WorkspacePane snapshot={currentWorkspace} />
              ) : (
                <ContextPane
                  snapshot={currentContext}
                  onOpenModal={() => setContextModalOpen(true)}
                />
              )}
            </div>
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
