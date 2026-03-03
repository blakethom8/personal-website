"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Panel } from "@/components/Panel";
import { Module0Content } from "./Module0Content";
import { Module1Content } from "./Module1Content";
import { Module2Content } from "./Module2Content";
import { Module3Content } from "./Module3Content";
import { Module4Content } from "./Module4Content";
import { Module5Content } from "./Module5Content";

// ─── Modal content for inline guide links ───
// Links in markdown like [text →](#modal-system-context-compare) are intercepted
// and open these modals instead of navigating.

const GUIDE_MODALS: Record<string, { title: string; content: string }> = {
  "system-context-compare": {
    title: "What You See vs. What the Model Sees",
    content: `What you see:
┌──────────────────────────────────────────────┐
│  You: "What's a good hike near LA?"          │
└──────────────────────────────────────────────┘

What the model actually receives:
┌──────────────────────────────────────────────┐
│  System: "You are Claude, made by Anthropic. │
│  You are helpful, harmless, and honest.       │
│  Respond concisely. Today's date is           │
│  March 2, 2026. The user's name is Blake."    │
│                                               │
│  User: "What's a good hike near LA?"          │
└──────────────────────────────────────────────┘

The system prompt arrived BEFORE your message.
It shapes the model's entire personality,
knowledge, and behavior — but you never see it.`,
  },
  "system-context-scale": {
    title: "System Context: Simple Chat vs. Agent",
    content: `Simple chat app:
┌──────────────────────────────────────────────┐
│  "You are a helpful assistant. Be concise."  │
│                                    ~20 tokens │
└──────────────────────────────────────────────┘

Coding agent (like Claude Code or OpenClaw):
┌──────────────────────────────────────────────┐
│  System prompt                  ~2,000 tokens │
│  who you are, safety rules, how to use tools, │
│  communication style                          │
│                                               │
│  Project instructions (sol.md)  ~3,000 tokens │
│  tech stack, conventions, file structure,      │
│  deployment config, quality standards          │
│                                               │
│  Memory file (MEMORY.md)        ~1,000 tokens │
│  user preferences, past decisions,             │
│  project-specific knowledge                    │
│                                               │
│  Tool definitions               ~5,000 tokens │
│  Read, Edit, Bash, Grep, Glob, Write, etc.    │
│                                               │
│  TOTAL: ~11,000 tokens before you say a word  │
└──────────────────────────────────────────────┘

All of this is loaded on every single API call.
The user hasn't even typed "hello" yet.`,
  },
  "sol-md": {
    title: "Project Instructions: sol.md",
    content: `# sol.md — Agent Instructions for My Project

## Stack
- Next.js 15 with App Router
- TypeScript in strict mode
- Tailwind CSS for styling
- PostgreSQL database

## Rules
- Never modify the auth module directly
- Always run tests before committing
- Use server components by default
- Follow the existing naming conventions

## File Structure
src/app/        — pages and routes
src/components/ — React components
src/lib/        — utilities and helpers

────────────────────────────────────────────
This entire file gets loaded into the system
context every time you talk to the agent.
The agent "knows" your project because it
reads these instructions fresh each time.

Change this file → agent behavior changes
immediately on the very next message.`,
  },
};

interface GuideStep {
  number: number;
  title: string;
  contentHtml: string;
}

interface AgentsGuideViewProps {
  intro: string;
  steps: GuideStep[];
  closing: string;
}

const STEP_LABELS = [
  "The Big Picture",
  "How AI Communicates",
  "Context & Memory",
  "Tools & Actions",
  "Agentic Patterns",
];

export function AgentsGuideView({ steps, closing }: AgentsGuideViewProps) {
  // null = intro, 0-4 = steps, "closing" = final section
  // Support ?step=0-4 or ?step=closing via URL for direct linking
  const [activeView, setActiveView] = useState<number | null | "closing">(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const step = params.get("step");
    if (step === "closing") return "closing";
    if (step !== null) {
      const n = parseInt(step, 10);
      if (!isNaN(n) && n >= 0 && n <= 4) return n;
    }
    return null;
  });
  const [modalId, setModalId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeView]);

  // Intercept clicks on #modal-* links within rendered content
  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href?.startsWith("#modal-")) return;

    e.preventDefault();
    const id = href.replace("#modal-", "");
    if (GUIDE_MODALS[id]) {
      setModalId(id);
    }
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (!modalId) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalId(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalId]);

  const currentStep =
    typeof activeView === "number" ? steps[activeView] : null;
  const isIntro = activeView === null;
  const isClosing = activeView === "closing";

  const goNext = () => {
    if (isIntro) {
      setActiveView(0);
    } else if (typeof activeView === "number" && activeView < steps.length - 1) {
      setActiveView(activeView + 1);
    } else if (typeof activeView === "number" && activeView === steps.length - 1) {
      setActiveView("closing");
    }
  };

  const goPrev = () => {
    if (isClosing) {
      setActiveView(steps.length - 1);
    } else if (typeof activeView === "number" && activeView > 0) {
      setActiveView(activeView - 1);
    } else if (typeof activeView === "number" && activeView === 0) {
      setActiveView(null);
    }
  };

  const totalSections = steps.length + 2; // intro + steps + closing
  const currentIndex = isIntro
    ? 0
    : isClosing
      ? totalSections - 1
      : (activeView as number) + 1;

  const activeModal = modalId ? GUIDE_MODALS[modalId] : null;

  return (
    <div className="flex flex-col gap-4 pb-5 pt-5">
      {/* Header */}
      <Panel>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded border border-accent/30 bg-accent-light/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              flagship guide
            </span>
            <span className="font-mono text-[11px] text-fg-light">
              20 min · beginner
            </span>
          </div>
          <Link
            href="/learn"
            className="font-mono text-[11px] text-fg-light no-underline hover:text-accent transition-colors"
          >
            ← all modules
          </Link>
        </div>
        <h1 className="mt-3 font-serif text-2xl md:text-3xl">
          How AI Agents Actually Work
        </h1>

        {/* Step navigator */}
        <div className="learn-tabs mt-5 flex items-center gap-1 overflow-x-auto pb-1">
          {/* Intro dot */}
          <button
            onClick={() => setActiveView(null)}
            className={`flex h-8 shrink-0 items-center rounded px-3 font-mono text-[11px] transition-colors ${
              isIntro
                ? "bg-accent-light text-accent"
                : "text-fg-light hover:text-accent hover:bg-bg-panel-hover"
            }`}
          >
            intro
          </button>

          {steps.map((step, i) => (
            <button
              key={step.number}
              onClick={() => setActiveView(i)}
              className={`flex h-8 shrink-0 items-center gap-1.5 rounded px-3 font-mono text-[11px] transition-colors ${
                activeView === i
                  ? "bg-accent-light text-accent"
                  : "text-fg-light hover:text-accent hover:bg-bg-panel-hover"
              }`}
            >
              <span className="hidden sm:inline">{step.number}.</span>
              <span className="hidden md:inline">{STEP_LABELS[i] ?? step.title}</span>
              <span className="md:hidden">{step.number}</span>
            </button>
          ))}

          <button
            onClick={() => setActiveView("closing")}
            className={`flex h-8 shrink-0 items-center rounded px-3 font-mono text-[11px] transition-colors ${
              isClosing
                ? "bg-accent-light text-accent"
                : "text-fg-light hover:text-accent hover:bg-bg-panel-hover"
            }`}
          >
            <span className="hidden sm:inline">epilogue</span>
            <span className="sm:hidden">end</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border-light">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{
              width: `${((currentIndex + 1) / totalSections) * 100}%`,
            }}
          />
        </div>
      </Panel>

      {/* Content */}
      <Panel as="section">
        <div ref={contentRef} onClick={handleContentClick}>
          {isIntro && (
            <>
              <p className="label-mono mb-3">why this guide exists</p>
              <Module0Content />
            </>
          )}

          {currentStep && (
            <>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-mono text-[28px] font-bold leading-none text-accent">
                  {currentStep.number}
                </span>
                <div>
                  <p className="label-mono">
                    step {currentStep.number} of {steps.length}
                  </p>
                  <h2 className="font-serif text-xl md:text-2xl leading-snug">
                    {currentStep.title}
                  </h2>
                </div>
              </div>
              {currentStep.number === 1 ? (
                <Module1Content />
              ) : currentStep.number === 2 ? (
                <Module2Content />
              ) : currentStep.number === 3 ? (
                <Module3Content />
              ) : currentStep.number === 4 ? (
                <Module4Content />
              ) : currentStep.number === 5 ? (
                <Module5Content />
              ) : (
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: currentStep.contentHtml }}
                />
              )}
            </>
          )}

          {isClosing && (
            <>
              <p className="label-mono mb-3">putting it all together</p>
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: closing }}
              />
            </>
          )}
        </div>
      </Panel>

      {/* Bottom navigation */}
      <div className="mx-auto flex w-[calc(100%-2*16px)] max-w-[1200px] items-center justify-between md:w-[calc(100%-2*40px)]">
        {!isIntro ? (
          <button
            onClick={goPrev}
            className="rounded border border-border-light px-4 py-2 font-mono text-[11px] text-fg-muted no-underline transition-colors hover:border-accent hover:text-accent"
          >
            ← previous
          </button>
        ) : (
          <span />
        )}

        <span className="font-mono text-[11px] text-fg-light">
          {currentIndex + 1} / {totalSections}
        </span>

        {!isClosing ? (
          <button
            onClick={goNext}
            className="rounded border border-accent bg-accent-light/20 px-4 py-2 font-mono text-[11px] text-accent no-underline transition-colors hover:bg-accent hover:text-white"
          >
            next →
          </button>
        ) : (
          <Link
            href="/learn"
            className="rounded border border-border-light px-4 py-2 font-mono text-[11px] text-fg-muted no-underline transition-colors hover:border-accent hover:text-accent"
          >
            back to learn →
          </Link>
        )}
      </div>

      {/* Guide content modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setModalId(null)}
          onKeyDown={(e) => { if (e.key === "Escape") setModalId(null); }}
          role="dialog"
          aria-modal="true"
          aria-label={activeModal.title}
        >
          <div
            className="guide-modal-panel relative max-h-[80vh] w-full max-w-[600px] overflow-y-auto rounded-lg border border-border-light bg-bg-panel shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-border-light bg-bg-panel px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
                {activeModal.title}
              </span>
              <button
                onClick={() => setModalId(null)}
                className="flex h-6 w-6 items-center justify-center rounded text-fg-light transition-colors hover:bg-bg-panel-hover hover:text-fg"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-fg-muted">
                {activeModal.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
