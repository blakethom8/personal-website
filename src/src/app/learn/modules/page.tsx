import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { backgrounds } from "@/lib/backgrounds";

export const metadata: Metadata = {
  title: "Education Modules",
  description:
    "Multi-step guided lessons on AI concepts — structured, beginner-friendly, and built to actually stick.",
};

const AGENT_STEPS = [
  "The Big Picture",
  "How AI Communicates",
  "Context & Memory",
  "Tools & Actions",
  "Agentic Patterns",
  "Same Engine, Different Cars",
];

const OPENCLAW_STEPS = [
  "Overview",
  "Memory",
  "Tools & Actions",
  "The Gateway",
];

const REPOS = [
  {
    name: "learning-modules",
    displayName: "Frontend for Dummies",
    description:
      "Three web development courses for Python developers: web security & authentication, modern frontend (JavaScript, React, TypeScript), and building frontends with LLMs. ~25+ hours of material.",
    url: "https://github.com/blakethom8/learning-modules",
    tags: ["security", "react", "llm-frontends"],
  },
  {
    name: "bash-pi-openclaw-education",
    displayName: "Bash, Pi & OpenClaw",
    description:
      "A hands-on guide to 'bash is all you need' for agentic systems. Five modules walking through bash fundamentals, Pi architecture, OpenClaw patterns, and building your own agents from scratch.",
    url: "https://github.com/blakethom8/bash-pi-openclaw-education",
    tags: ["bash", "agents", "openclaw"],
  },
];

export default function ModulesPage() {
  return (
    <>
      <PageBackground src={backgrounds.learn} alt="Flowing water over rocks" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        {/* Header */}
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <p className="label-mono">education modules</p>
            <Link
              href="/learn"
              className="font-mono text-[11px] text-fg-light no-underline transition-colors hover:text-accent"
            >
              ← back to learn
            </Link>
          </div>
          <h1 className="mt-2 font-serif text-2xl md:text-3xl">
            Education Modules
          </h1>
          <p className="mt-3 max-w-2xl text-fg-muted">
            Multi-step guided lessons on AI concepts — structured,
            beginner-friendly, and built to actually stick. Each module walks
            through a real topic from the ground up.
          </p>
        </Panel>

        {/* Modules */}
        <Panel as="section">
          <p className="label-mono mb-4">modules</p>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Module 1: Agents Guide */}
            <Link
              href="/learn/agents-explained"
              className="flex flex-col rounded border border-border-light p-5 no-underline transition-colors hover:border-accent-muted"
            >
              <div className="flex items-center gap-3">
                <span className="rounded border border-accent/30 bg-accent-light/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                  available now
                </span>
                <span className="font-mono text-[11px] text-fg-light">
                  20 min · beginner
                </span>
              </div>
              <h2 className="mt-3 font-serif text-xl leading-snug text-fg">
                How AI Agents Actually Work
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                When I tell people &ldquo;I build AI agents,&rdquo; they think ChatGPT.
                But ChatGPT is just the engine. An agent is the entire car —
                engine + steering + brakes + GPS. This guide breaks down the 5
                layers.
              </p>
              <div className="mt-4 rounded border border-border-light bg-bg-panel-hover/50 p-3">
                <p className="label-mono mb-2">6 modules</p>
                <ol className="flex flex-col gap-1">
                  {AGENT_STEPS.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-baseline gap-2 font-mono text-[11px]"
                    >
                      <span className="shrink-0 text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-fg-muted">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="mt-auto pt-4 font-mono text-[12px] text-accent">
                start the guide →
              </p>
            </Link>

            {/* Module 2: OpenClaw */}
            <div className="flex flex-col rounded border border-border-light p-5 opacity-80">
              <div className="flex items-center gap-3">
                <span className="rounded border border-border-light px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-fg-light">
                  in development
                </span>
                <span className="font-mono text-[11px] text-fg-light">
                  beginner
                </span>
              </div>
              <h2 className="mt-3 font-serif text-xl leading-snug text-fg">
                OpenClaw: An AI System Deep Dive
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                A look inside a real agentic application — how memory, tools,
                and a gateway work together to build something that actually
                runs in production.
              </p>
              <div className="mt-4 rounded border border-border-light bg-bg-panel-hover/50 p-3">
                <p className="label-mono mb-2">4 modules</p>
                <ol className="flex flex-col gap-1">
                  {OPENCLAW_STEPS.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-baseline gap-2 font-mono text-[11px]"
                    >
                      <span className="shrink-0 text-fg-light">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-fg-muted">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="mt-auto pt-4 font-mono text-[12px] text-fg-light">
                coming soon
              </p>
            </div>
          </div>
        </Panel>

        {/* GitHub Repositories */}
        <Panel as="section">
          <div className="flex items-baseline justify-between">
            <p className="label-mono">github repositories</p>
            <a
              href="https://github.com/blakethom8"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-fg-light no-underline transition-colors hover:text-accent"
            >
              github.com/blakethom8 →
            </a>
          </div>
          <p className="mt-2 max-w-2xl text-[13px] text-fg-muted">
            Real code you can clone, run, and learn from. Not just concepts —
            working implementations with documentation.
          </p>

          {/* Flagship repo */}
          <a
            href="https://github.com/blakethom8/project_base"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block rounded border border-border-light p-6 no-underline transition-colors hover:border-accent-muted"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded border border-accent/30 bg-accent-light/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                flagship
              </span>
              <span className="rounded border border-border-light px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
                going public soon
              </span>
            </div>
            <h3 className="mt-3 font-serif text-lg leading-snug text-fg">
              Backend Development for AI
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
              A complete tutorial series for building production-ready GenAI
              applications — 20+ chapters covering FastAPI, Pydantic, databases,
              async patterns, LLM integration, tool calling, agentic frameworks,
              MCP, Docker, and production deployment. Built to take you from
              zero to a real running application.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                "FastAPI",
                "Pydantic",
                "SQLAlchemy",
                "LLMs",
                "Tool Calling",
                "Agentic Patterns",
                "MCP",
                "Docker",
              ].map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 font-mono text-[12px] text-accent">
              view repository →
            </p>
          </a>

          {/* Other public repos */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {REPOS.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col rounded border border-border-light p-5 no-underline transition-colors hover:border-accent-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-fg-light">
                    {repo.name}
                  </span>
                  <span className="rounded border border-accent/30 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                    public
                  </span>
                </div>
                <h3 className="mt-2 font-serif text-[16px] leading-snug text-fg">
                  {repo.displayName}
                </h3>
                <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-fg-muted">
                  {repo.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {repo.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[11px] text-accent">
                  view on github →
                </p>
              </a>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
