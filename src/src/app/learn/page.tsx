import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { backgrounds } from "@/lib/backgrounds";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Interactive modules that demystify AI for non-technical people.",
};

const STEPS = [
  "The Big Picture",
  "How AI Communicates",
  "Context & Memory",
  "Tools & Actions",
  "Agentic Patterns",
  "Same Engine, Different Cars",
];

export default function LearnPage() {
  return (
    <>
      <PageBackground
        src={backgrounds.learn}
        alt="Flowing water over rocks"
      />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        {/* Header */}
        <Panel>
          <p className="label-mono mb-2">learn</p>
          <h1 className="font-serif text-2xl md:text-3xl">
            How AI Actually Works
          </h1>
          <p className="mt-3 max-w-2xl text-fg-muted">
            Interactive modules that demystify AI — from how language models
            predict text, to how agents use tools to act in the real world.
            Built for curious people, not computer scientists.
          </p>
        </Panel>

        {/* Featured: 5-Step Agent Guide */}
        <div className="mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
          <Link
            href="/learn/agents-explained"
            className="panel flex flex-col gap-4 px-6 py-6 no-underline transition-colors hover:border-accent-muted md:flex-row md:items-start md:gap-8 md:px-8 md:py-8"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="rounded border border-accent/30 bg-accent-light/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                  flagship guide
                </span>
                <span className="font-mono text-[11px] text-fg-light">
                  20 min · beginner
                </span>
              </div>
              <h2 className="mt-3 font-serif text-xl leading-snug md:text-2xl">
                How AI Agents Actually Work
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-fg-muted">
                When I tell people &ldquo;I build AI agents,&rdquo; they think
                ChatGPT. But ChatGPT is just the engine. An agent is the entire
                car — engine + steering + brakes + GPS. This guide breaks down
                the 5 layers that make it all work.
              </p>
              <p className="mt-4 font-mono text-[12px] text-accent">
                start the guide →
              </p>
            </div>
            <div className="shrink-0 md:w-[280px]">
              <div className="rounded border border-border-light bg-bg-panel-hover/50 p-4">
                <p className="label-mono mb-2">6 modules</p>
                <ol className="flex flex-col gap-1.5">
                  {STEPS.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-baseline gap-2 font-mono text-[12px]"
                    >
                      <span className="shrink-0 text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-fg-muted">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Link>
        </div>

        {/* Category cards */}
        <div className="mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Interactive Labs */}
            <Link
              href="/learn/simulator"
              className="panel px-5 py-5 no-underline transition-colors hover:border-accent-muted"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-accent">01</span>
                <span className="font-mono text-[10px] text-fg-light">
                  2 labs
                </span>
              </div>
              <h3 className="mt-2 font-serif text-[15px] leading-snug text-fg md:text-[16px]">
                Interactive Labs
              </h3>
              <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-fg-muted">
                Watch how AI conversations work under the hood — step through
                real API calls and agent workflows. See the JSON, the tool
                calls, and the loop in action.
              </p>
              <p className="mt-3 font-mono text-[11px] text-accent">
                open simulator →
              </p>
            </Link>

            {/* Concept Modules */}
            <div className="panel px-5 py-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-accent">02</span>
                <span className="rounded border border-border-light px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
                  coming soon
                </span>
              </div>
              <h3 className="mt-2 font-serif text-[15px] leading-snug text-fg md:text-[16px]">
                Concept Modules
              </h3>
              <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-fg-muted">
                Self-contained lessons on specific topics — What is an LLM,
                How ChatGPT Works, What Are Tokens, Prompt Engineering.
                Each one stands on its own.
              </p>
              <p className="mt-3 font-mono text-[11px] text-fg-light">
                modules in development
              </p>
            </div>

            {/* GitHub Repositories */}
            <div className="panel px-5 py-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-accent">03</span>
                <span className="rounded border border-border-light px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
                  coming soon
                </span>
              </div>
              <h3 className="mt-2 font-serif text-[15px] leading-snug text-fg md:text-[16px]">
                GitHub Repositories
              </h3>
              <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-fg-muted">
                Detailed step-by-step repositories you can clone and run.
                Real code, real data, real infrastructure — not just concepts
                but working implementations.
              </p>
              <p className="mt-3 font-mono text-[11px] text-fg-light">
                repos in development
              </p>
            </div>

            {/* WebMCP Lab */}
            <Link
              href="/learn/webmcp-lab"
              className="panel px-5 py-5 no-underline transition-colors hover:border-accent-muted"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-accent">04</span>
                <span className="font-mono text-[10px] text-fg-light">
                  interactive
                </span>
              </div>
              <h3 className="mt-2 font-serif text-[15px] leading-snug text-fg md:text-[16px]">
                WebMCP Lab
              </h3>
              <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-fg-muted">
                Explore WebMCP tool discovery and agent-native browser
                workflows. See how websites can expose tools for AI agents
                to discover and use.
              </p>
              <p className="mt-3 font-mono text-[11px] text-accent">
                open lab →
              </p>
            </Link>

            {/* Guides & Articles */}
            <div className="panel px-5 py-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-accent">05</span>
                <span className="rounded border border-border-light px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
                  coming soon
                </span>
              </div>
              <h3 className="mt-2 font-serif text-[15px] leading-snug text-fg md:text-[16px]">
                Guides & How-Tos
              </h3>
              <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-fg-muted">
                Practical guides on topics like Azure infrastructure, setting
                up local agents, deploying container apps, and navigating the
                ever-changing landscape of AI tooling.
              </p>
              <p className="mt-3 font-mono text-[11px] text-fg-light">
                guides in development
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
