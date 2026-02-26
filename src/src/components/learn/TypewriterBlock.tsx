"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Module-level flag — survives unmount/remount (tab switches)
// but NOT a React ref, so StrictMode double-runs won't see it
// as true until the animation actually completes.
let hasCompletedOnce = false;

interface TypewriterLine {
  text: string;
  className?: string;
}

interface TypewriterBlockProps {
  lines: TypewriterLine[];
  speed?: number; // ms per character, default 25
  lineDelay?: number; // ms pause between lines, default 400
}

export function TypewriterBlock({
  lines,
  speed = 25,
  lineDelay = 400,
}: TypewriterBlockProps) {
  // Track completed lines + current partial line
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLineText, setCurrentLineText] = useState("");
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
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
    // If already completed once, show everything immediately
    if (hasCompletedOnce) {
      setCompletedLines(lines.map((l) => l.text));
      setCurrentLineText("");
      setCurrentLineIdx(lines.length);
      setIsDone(true);
      setShowCursor(false);
      return;
    }

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setCompletedLines(lines.map((l) => l.text));
      setCurrentLineText("");
      setCurrentLineIdx(lines.length);
      setIsDone(true);
      setShowCursor(false);
      hasCompletedOnce = true;
      return;
    }

    // Reset state for a clean start (handles StrictMode double-run)
    setCompletedLines([]);
    setCurrentLineText("");
    setCurrentLineIdx(0);
    setIsDone(false);
    setShowCursor(true);

    let lineIdx = 0;
    let charIdx = 0;

    const typeLine = () => {
      if (lineIdx >= lines.length) {
        setIsDone(true);
        setShowCursor(false);
        hasCompletedOnce = true; // Mark complete only when done
        return;
      }

      const line = lines[lineIdx].text;
      setCurrentLineIdx(lineIdx);

      intervalRef.current = setInterval(() => {
        charIdx++;
        if (charIdx >= line.length) {
          // Line complete
          clearTimers();
          setCurrentLineText("");
          setCompletedLines((prev) => [...prev, line]);

          lineIdx++;
          charIdx = 0;

          if (lineIdx >= lines.length) {
            setIsDone(true);
            setShowCursor(false);
            hasCompletedOnce = true; // Mark complete only when done
          } else {
            // Pause between lines
            timeoutRef.current = setTimeout(typeLine, lineDelay);
          }
        } else {
          setCurrentLineText(line.substring(0, charIdx));
        }
      }, speed);
    };

    // Start typing after a brief delay
    timeoutRef.current = setTimeout(typeLine, 600);

    return clearTimers;
  }, [lines, speed, lineDelay, clearTimers]);

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
          <span className="text-accent">$</span> cat ~/learn/README.md
        </span>
      </div>

      {/* Typewriter content */}
      <div className="px-5 py-4 font-mono text-[13px] leading-[1.8]">
        {/* Already-completed lines */}
        {completedLines.map((text, i) => (
          <div key={i} className={`min-h-[1.8em] ${lines[i]?.className ?? ""}`}>
            {renderLine(text)}
          </div>
        ))}

        {/* Currently typing line */}
        {!isDone && currentLineIdx < lines.length && (
          <div className={`min-h-[1.8em] ${lines[currentLineIdx]?.className ?? ""}`}>
            {renderLine(currentLineText)}
            {showCursor && <span className="sim-cursor">▎</span>}
          </div>
        )}

        {/* Cursor after all done */}
        {isDone && showCursor && <span className="sim-cursor">▎</span>}
      </div>
    </div>
  );
}

/** Render a single line, highlighting accent-colored segments */
function renderLine(text: string): React.ReactNode {
  // Highlight > prompts
  if (text.startsWith("> ")) {
    return (
      <>
        <span className="text-accent">&gt;</span>
        <span className="text-accent">{text.slice(1)}</span>
      </>
    );
  }

  // Highlight tab labels: "  simulator   → ..."
  const tabMatch = text.match(/^(\s+)(simulator|modules|toolbox|repos)(\s+→\s+)(.+)$/);
  if (tabMatch) {
    return (
      <>
        {tabMatch[1]}
        <span className="text-accent">{tabMatch[2]}</span>
        <span className="text-[#6E6860]">{tabMatch[3]}</span>
        {tabMatch[4]}
      </>
    );
  }

  return text;
}
