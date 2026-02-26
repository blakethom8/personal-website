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

// Matrix characters for the rain effect
const matrixChars =
  "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface Column {
  x: number;
  y: number;
  speed: number;
  length: number;
}

export function MatrixTerminal() {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [showRain, setShowRain] = useState(false);

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

  // Typewriter effect for Matrix messages
  useEffect(() => {
    if (hasCompletedOnce) {
      setCompletedLines(matrixMessages);
      setCurrentText("");
      setCurrentIdx(matrixMessages.length);
      setIsDone(true);
      setShowCursor(false);
      // Start rain immediately if already seen
      setTimeout(() => setShowRain(true), 500);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setCompletedLines(matrixMessages);
      setIsDone(true);
      setShowCursor(false);
      hasCompletedOnce = true;
      setTimeout(() => setShowRain(true), 500);
      return;
    }

    setCompletedLines([]);
    setCurrentText("");
    setCurrentIdx(0);
    setIsDone(false);
    setShowCursor(true);

    let lineIdx = 0;
    let charIdx = 0;
    const speed = 35; // Slightly slower for dramatic effect
    const lineDelay = 800; // Longer pauses between lines

    const typeLine = () => {
      if (lineIdx >= matrixMessages.length) {
        setIsDone(true);
        setShowCursor(false);
        hasCompletedOnce = true;
        // Wait 2 seconds before starting the rain
        setTimeout(() => setShowRain(true), 2000);
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
            setIsDone(true);
            setShowCursor(false);
            hasCompletedOnce = true;
            // Wait 2 seconds before starting the rain
            setTimeout(() => setShowRain(true), 2000);
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
  }, [clearTimers]);

  // Matrix rain effect
  useEffect(() => {
    if (!showRain || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
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

      // Semi-transparent black to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "15px monospace";

      columnsRef.current.forEach((column) => {
        // Draw characters in the column
        for (let i = 0; i < column.length; i++) {
          const y = column.y + i * 20;
          if (y < 0 || y > canvas.height) continue;

          // Brighter at the head, dimmer at the tail
          const opacity = i === 0 ? 1 : 1 - i / column.length;
          const char =
            matrixChars[Math.floor(Math.random() * matrixChars.length)];

          // Bright green (#00FF41) for the head, dimmer green for the tail
          if (i === 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          } else {
            ctx.fillStyle = `rgba(0, 255, 65, ${opacity})`;
          }

          ctx.fillText(char, column.x, y);
        }

        // Move column down
        column.y += column.speed * (deltaTime / 16);

        // Reset column when it goes off screen
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
  }, [showRain]);

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

      {/* Matrix rain canvas (background) */}
      {showRain && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ opacity: showRain ? 0.9 : 0 }}
        />
      )}

      {/* Typewriter content (foreground when not raining) */}
      <div
        className={`relative z-10 px-4 py-3 font-mono text-[13px] leading-[1.7] transition-opacity duration-1000 ${
          showRain ? "opacity-0" : "opacity-100"
        }`}
      >
        {completedLines.map((text, i) => (
          <div key={i} className="min-h-[1.7em]">
            {text || "\u00A0"}
          </div>
        ))}
        {!isDone && currentIdx < matrixMessages.length && (
          <div className="min-h-[1.7em]">
            {currentText}
            {showCursor && (
              <span className="animate-pulse text-[#00FF41]">▎</span>
            )}
          </div>
        )}
      </div>

      {/* Minimum height when showing rain */}
      {showRain && <div className="h-[240px]" />}
    </div>
  );
}
