"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Scenario } from "@/lib/conversation-scenarios";

export type PlaybackState = "idle" | "playing" | "paused" | "done";

interface SimulatorState {
  currentStep: number;
  playback: PlaybackState;
  visibleSteps: number; // how many steps are visible (1-indexed)
  isLoading: boolean; // true when waiting for next step (simulates server latency)
}

export function useSimulator(scenario: Scenario) {
  const [state, setState] = useState<SimulatorState>({
    currentStep: 0,
    playback: "idle",
    visibleSteps: 0,
    isLoading: false,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scenarioRef = useRef(scenario);

  // Keep scenario ref in sync
  useEffect(() => {
    scenarioRef.current = scenario;
  }, [scenario]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }, []);

  // Schedule the next step with a loading indicator in between
  const scheduleNext = useCallback(
    (fromStep: number) => {
      clearTimers();
      const steps = scenarioRef.current.steps;
      const nextStep = fromStep + 1;

      if (nextStep >= steps.length) {
        setState((s) => ({ ...s, playback: "done", isLoading: false }));
        return;
      }

      const delay = steps[fromStep].delay ?? 2800;

      // Show loading indicator after a brief pause (let the current message settle)
      const loadingDelay = Math.min(600, delay * 0.25);
      loadingTimerRef.current = setTimeout(() => {
        setState((s) => ({ ...s, isLoading: true }));
      }, loadingDelay);

      // Then advance to next step
      timerRef.current = setTimeout(() => {
        setState((s) => {
          const newStep = s.currentStep + 1;
          if (newStep >= steps.length) {
            return { ...s, playback: "done", isLoading: false };
          }
          return {
            ...s,
            currentStep: newStep,
            visibleSteps: newStep + 1,
            isLoading: false,
          };
        });
      }, delay);
    },
    [clearTimers]
  );

  // When step or playback changes and we're playing, schedule next.
  // isLoading is intentionally NOT a dependency — it's a visual-only state
  // managed by the timers inside scheduleNext. Including it would cause
  // the cleanup to cancel the advancement timer when loading kicks in.
  useEffect(() => {
    if (state.playback === "playing") {
      // This effect intentionally schedules timer-driven state transitions
      // for simulator playback progression.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      scheduleNext(state.currentStep);
    }
    return clearTimers;
  }, [state.currentStep, state.playback, scheduleNext, clearTimers]);

  const play = useCallback(() => {
    setState((s) => {
      if (s.playback === "done") {
        return { currentStep: 0, visibleSteps: 1, playback: "playing", isLoading: false };
      }
      if (s.visibleSteps === 0) {
        return { currentStep: 0, visibleSteps: 1, playback: "playing", isLoading: false };
      }
      return { ...s, playback: "playing", isLoading: false };
    });
  }, []);

  const pause = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, playback: "paused", isLoading: false }));
  }, [clearTimers]);

  const stepForward = useCallback(() => {
    clearTimers();
    setState((s) => {
      const steps = scenarioRef.current.steps;
      if (s.visibleSteps === 0) {
        return { currentStep: 0, visibleSteps: 1, playback: "paused", isLoading: false };
      }
      const nextStep = s.currentStep + 1;
      if (nextStep >= steps.length) {
        return { ...s, playback: "done", isLoading: false };
      }
      return {
        currentStep: nextStep,
        visibleSteps: nextStep + 1,
        playback: "paused",
        isLoading: false,
      };
    });
  }, [clearTimers]);

  const stepBack = useCallback(() => {
    clearTimers();
    setState((s) => {
      if (s.currentStep <= 0) return { ...s, isLoading: false };
      const prevStep = s.currentStep - 1;
      return {
        currentStep: prevStep,
        visibleSteps: prevStep + 1,
        playback: "paused",
        isLoading: false,
      };
    });
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setState({ currentStep: 0, playback: "idle", visibleSteps: 0, isLoading: false });
  }, [clearTimers]);

  // Reset when scenario changes
  useEffect(() => {
    clearTimers();
    // Resetting simulator state on scenario swap is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ currentStep: 0, playback: "idle", visibleSteps: 0, isLoading: false });
  }, [scenario.id, clearTimers]);

  return {
    ...state,
    totalSteps: scenario.steps.length,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
  };
}
