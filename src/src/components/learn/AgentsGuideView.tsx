"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Panel } from "@/components/Panel";

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

export function AgentsGuideView({ intro, steps, closing }: AgentsGuideViewProps) {
  // null = intro, 0-4 = steps, "closing" = final section
  const [activeView, setActiveView] = useState<number | null | "closing">(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeView]);

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
        <div className="mt-5 flex items-center gap-1">
          {/* Intro dot */}
          <button
            onClick={() => setActiveView(null)}
            className={`flex h-8 items-center rounded px-3 font-mono text-[11px] transition-colors ${
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
              className={`flex h-8 items-center gap-1.5 rounded px-3 font-mono text-[11px] transition-colors ${
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
            className={`flex h-8 items-center rounded px-3 font-mono text-[11px] transition-colors ${
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
        <div ref={contentRef}>
          {isIntro && (
            <>
              <p className="label-mono mb-3">why this guide exists</p>
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: intro }}
              />
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
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: currentStep.contentHtml }}
              />
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
    </div>
  );
}
