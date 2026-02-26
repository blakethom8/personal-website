"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Module-level flag — survives unmount/remount (tab switches)
let hasCompletedOnce = false;

const narrativeLines = [
  "> the terminal is the secret sauce.",
  "",
  "it's not a chat interface.",
  "it reads your files. runs your code.",
  "navigates your whole machine.",
  "",
  "that changed how I think about",
  "LLMs entirely.",
  "",
  "this section is where I break",
  "that down — piece by piece.",
];

export function TerminalSplitBlock() {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (hasCompletedOnce) {
      setCompletedLines(narrativeLines);
      setCurrentText("");
      setCurrentIdx(narrativeLines.length);
      setIsDone(true);
      setShowCursor(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setCompletedLines(narrativeLines);
      setIsDone(true);
      setShowCursor(false);
      hasCompletedOnce = true;
      return;
    }

    setCompletedLines([]);
    setCurrentText("");
    setCurrentIdx(0);
    setIsDone(false);
    setShowCursor(true);

    let lineIdx = 0;
    let charIdx = 0;
    const speed = 20;
    const lineDelay = 250;

    const typeLine = () => {
      if (lineIdx >= narrativeLines.length) {
        setIsDone(true);
        setShowCursor(false);
        hasCompletedOnce = true;
        return;
      }

      const line = narrativeLines[lineIdx];
      setCurrentIdx(lineIdx);

      intervalRef.current = setInterval(() => {
        charIdx++;
        if (charIdx >= line.length) {
          clearTimers();
          setCurrentText("");
          setCompletedLines((prev) => [...prev, line]);

          lineIdx++;
          charIdx = 0;

          if (lineIdx >= narrativeLines.length) {
            setIsDone(true);
            setShowCursor(false);
            hasCompletedOnce = true;
          } else {
            timeoutRef.current = setTimeout(typeLine, lineDelay);
          }
        } else {
          setCurrentText(line.substring(0, charIdx));
        }
      }, speed);
    };

    timeoutRef.current = setTimeout(typeLine, 600);

    return clearTimers;
  }, [clearTimers]);

  return (
    <div className="overflow-hidden border-b border-[#2a2725] bg-code-bg text-code-fg">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 border-b border-[#2a2725] px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] opacity-70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] opacity-70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] opacity-70" />
        </div>
        <span className="ml-2 font-mono text-[11px] text-[#6E6860]">
          <span className="text-accent">$</span> openclaw
        </span>
      </div>

      {/* Typewriter content */}
      <div className="px-4 py-3 font-mono text-[13px] leading-[1.7]">
        {completedLines.map((text, i) => (
          <div key={i} className="min-h-[1.7em]">
            {renderLine(text)}
          </div>
        ))}
        {!isDone && currentIdx < narrativeLines.length && (
          <div className="min-h-[1.7em]">
            {renderLine(currentText)}
            {showCursor && <span className="sim-cursor">▎</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function renderLine(text: string): React.ReactNode {
  if (text.startsWith("> ")) {
    return <span className="text-accent">{text}</span>;
  }
  return text;
}
