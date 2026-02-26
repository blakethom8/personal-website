"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Module-level flag — survives unmount/remount (tab switches)
let hasCompletedOnce = false;

const matrixMessages = [
  "Wake up, Neo...",
  "",
  "The Matrix has you...",
  "",
  "Follow the white rabbit.",
  "",
  "Knock, knock, Neo.",
];

// ASCII art of a neural network / AI system
const asciiArt = [
  "        ╔═══════════════════════════════════════╗",
  "        ║   NEURAL NETWORK INITIALIZED          ║",
  "        ╚═══════════════════════════════════════╝",
  "",
  "           ○────────────────────────○",
  "          ╱│╲                      ╱│╲",
  "         ○ ○ ○                    ○ ○ ○",
  "        ╱│╲│╱│╲                  ╱│╲│╱│╲",
  "       ○ ○ ○ ○ ○                ○ ○ ○ ○ ○",
  "        ╲│╱│╲│╱                  ╲│╱│╲│╱",
  "         ○ ○ ○                    ○ ○ ○",
  "          ╲│╱                      ╲│╱",
  "           ○                        ○",
  "",
  "        INPUT LAYER    →    OUTPUT LAYER",
  "",
  "     [ TRAINING: COMPLETE ]  [ MODEL: CLAUDE ]",
  "     [ PARAMETERS: 175B+ ]   [ STATUS: READY ]",
];

// Matrix characters for the rain effect
const matrixChars =
  "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface Column {
  x: number;
  y: number;
  speed: number;
  length: number;
}

type Phase = "messages" | "ascii" | "rain";

export function MatrixTerminal() {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("messages");
  const [showCursor, setShowCursor] = useState(true);
  const [asciiRevealed, setAsciiRevealed] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rainAnimationRef = useRef<number | null>(null);
  const columnsRef = useRef<Column[]>([]);

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

  // Phase 1: Typewriter effect for Matrix messages
  useEffect(() => {
    if (phase !== "messages") return;

    if (hasCompletedOnce) {
      setCompletedLines(matrixMessages);
      setCurrentText("");
      setCurrentIdx(matrixMessages.length);
      setShowCursor(false);
      // Skip straight to rain if already seen
      setTimeout(() => setPhase("rain"), 500);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setCompletedLines(matrixMessages);
      setShowCursor(false);
      hasCompletedOnce = true;
      setTimeout(() => setPhase("rain"), 500);
      return;
    }

    setCompletedLines([]);
    setCurrentText("");
    setCurrentIdx(0);
    setShowCursor(true);

    let lineIdx = 0;
    let charIdx = 0;
    const speed = 35;
    const lineDelay = 800;

    const typeLine = () => {
      if (lineIdx >= matrixMessages.length) {
        setShowCursor(false);
        // Move to ASCII art phase
        setTimeout(() => setPhase("ascii"), 1500);
        return;
      }

      const line = matrixMessages[lineIdx];
      setCurrentIdx(lineIdx);

      intervalRef.current = setInterval(() => {
        charIdx++;
        if (charIdx >= line.length) {
          clearTimers();
          setCurrentText("");
          setCompletedLines((prev) => [...prev, line]);

          lineIdx++;
          charIdx = 0;

          if (lineIdx >= matrixMessages.length) {
            setShowCursor(false);
            setTimeout(() => setPhase("ascii"), 1500);
          } else {
            timeoutRef.current = setTimeout(typeLine, lineDelay);
          }
        } else {
          setCurrentText(line.substring(0, charIdx));
        }
      }, speed);
    };

    timeoutRef.current = setTimeout(typeLine, 1000);

    return clearTimers;
  }, [clearTimers, phase]);

  // Phase 2: ASCII art Matrix-style reveal
  useEffect(() => {
    if (phase !== "ascii") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setAsciiRevealed(asciiArt);
      hasCompletedOnce = true;
      setTimeout(() => setPhase("rain"), 1000);
      return;
    }

    // Build character map for random reveal
    const charMap: Array<{ lineIdx: number; charIdx: number; char: string }> =
      [];
    asciiArt.forEach((line, lineIdx) => {
      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx];
        if (char !== " ") {
          charMap.push({ lineIdx, charIdx, char });
        }
      }
    });

    // Shuffle for random reveal
    const shuffled = charMap.sort(() => Math.random() - 0.5);

    // Initialize with spaces
    const revealed: string[] = asciiArt.map((line) => " ".repeat(line.length));
    setAsciiRevealed([...revealed]);

    let revealIdx = 0;
    const revealSpeed = 15; // ms per character

    intervalRef.current = setInterval(() => {
      if (revealIdx >= shuffled.length) {
        clearTimers();
        hasCompletedOnce = true;
        // Hold for a moment, then transition to rain
        setTimeout(() => setPhase("rain"), 2000);
        return;
      }

      // Reveal next batch of characters (reveal multiple at once for speed)
      const batchSize = 5;
      for (let i = 0; i < batchSize && revealIdx < shuffled.length; i++) {
        const { lineIdx, charIdx, char } = shuffled[revealIdx];
        revealed[lineIdx] =
          revealed[lineIdx].substring(0, charIdx) +
          char +
          revealed[lineIdx].substring(charIdx + 1);
        revealIdx++;
      }

      setAsciiRevealed([...revealed]);
    }, revealSpeed);

    return clearTimers;
  }, [clearTimers, phase]);

  // Phase 3: Matrix rain effect
  useEffect(() => {
    if (phase !== "rain" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initColumns();
    };

    const initColumns = () => {
      const columnWidth = 20;
      const numColumns = Math.floor(canvas.width / columnWidth);
      columnsRef.current = Array.from({ length: numColumns }, (_, i) => ({
        x: i * columnWidth,
        y: Math.random() * -canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        length: 10 + Math.floor(Math.random() * 20),
      }));
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "15px monospace";

      columnsRef.current.forEach((column) => {
        for (let i = 0; i < column.length; i++) {
          const y = column.y + i * 20;
          if (y < 0 || y > canvas.height) continue;

          const opacity = i === 0 ? 1 : 1 - i / column.length;
          const char =
            matrixChars[Math.floor(Math.random() * matrixChars.length)];

          if (i === 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          } else {
            ctx.fillStyle = `rgba(0, 255, 65, ${opacity})`;
          }

          ctx.fillText(char, column.x, y);
        }

        column.y += column.speed * (deltaTime / 16);

        if (column.y - column.length * 20 > canvas.height) {
          column.y = Math.random() * -200;
          column.speed = 0.5 + Math.random() * 1.5;
          column.length = 10 + Math.floor(Math.random() * 20);
        }
      });

      rainAnimationRef.current = requestAnimationFrame(animate);
    };

    rainAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (rainAnimationRef.current) {
        cancelAnimationFrame(rainAnimationRef.current);
      }
    };
  }, [phase]);

  return (
    <div className="relative overflow-hidden border-b border-[#003300] bg-black text-[#00FF41]">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 border-b border-[#003300] bg-black px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#00FF41] opacity-70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#00FF41] opacity-50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#00FF41] opacity-30" />
        </div>
        <span className="ml-2 font-mono text-[11px] text-[#00CC33]">
          <span className="text-[#00FF41]">$</span> matrix://localhost
        </span>
      </div>

      {/* Matrix rain canvas (background for rain phase) */}
      {phase === "rain" && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ opacity: 0.9 }}
        />
      )}

      {/* Content area */}
      <div
        className={`relative z-10 px-4 py-3 font-mono text-[13px] leading-[1.7] transition-opacity duration-1000 ${
          phase === "rain" ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Phase 1: Matrix messages */}
        {phase === "messages" && (
          <>
            {completedLines.map((text, i) => (
              <div key={i} className="min-h-[1.7em]">
                {text || "\u00A0"}
              </div>
            ))}
            {currentIdx < matrixMessages.length && (
              <div className="min-h-[1.7em]">
                {currentText}
                {showCursor && (
                  <span className="animate-pulse text-[#00FF41]">▎</span>
                )}
              </div>
            )}
          </>
        )}

        {/* Phase 2: ASCII art reveal */}
        {phase === "ascii" && (
          <div className="text-center">
            {asciiRevealed.map((line, i) => (
              <div key={i} className="min-h-[1.7em]">
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Minimum height when showing rain */}
      {phase === "rain" && <div className="h-[300px]" />}
    </div>
  );
}
