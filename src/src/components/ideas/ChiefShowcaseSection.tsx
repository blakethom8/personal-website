"use client";

import { useMemo, useState } from "react";

const reports = [
  {
    date: "2026-03-18",
    title: "Airline Wi‑Fi: Why Telegram Works When Safari Doesn't",
    description:
      "A visual explainer on airline Wi‑Fi policy enforcement, DNS, routing, and why messaging can work while general browsing fails.",
    href: "https://blakethom8.github.io/mobile-reports/2026-03-18_airline-wifi-messaging-vs-web-report.html",
    tags: ["networking", "systems", "explainer"],
  },
  {
    date: "2026-03-18",
    title: "Cisco Secure Client, VPNs, and Secure Gateways",
    description:
      "A beginner-friendly report on Cisco Secure Client, background services, VPN gateways, and enterprise network policy flow.",
    href: "https://blakethom8.github.io/mobile-reports/2026-03-18_cisco-secure-client-vpn-gateway-report.html",
    tags: ["vpn", "networking", "architecture"],
  },
  {
    date: "2026-03-14",
    title: "Enterprise Agent Landscape Strategy",
    description:
      "Landscape view of enterprise agent products, positioning, likely customer value, and strategic implications.",
    href: "https://blakethom8.github.io/mobile-reports/2026-03-14_enterprise-agent-landscape-strategy.html",
    tags: ["ai agents", "strategy"],
  },
  {
    date: "2026-03-13",
    title: "OpenClaw Observability and Agent Logging",
    description:
      "A report on completion signaling, spawned agents, logging, and operational confidence in long-running agent workflows.",
    href: "https://blakethom8.github.io/mobile-reports/2026-03-13_openclaw-observability-and-agent-logging.html",
    tags: ["openclaw", "ops", "agents"],
  },
  {
    date: "2026-03-13",
    title: "Fraud Detection Technical Brief",
    description:
      "Technical brief on the CMS fraud detection project, signal design, findings, and future validation work.",
    href: "https://blakethom8.github.io/mobile-reports/2026-03-13_fraud-detection-technical-brief.html",
    tags: ["healthcare", "ml", "research"],
  },
  {
    date: "2026-03-12",
    title: "Claude Code CLI Deep Dive",
    description:
      "Deep dive on Claude Code CLI usage patterns, strengths, limitations, and agent-driven coding workflows.",
    href: "https://blakethom8.github.io/mobile-reports/2026-03-12_claude-code-cli-deep-dive.html",
    tags: ["developer tools", "ai agents"],
  },
];

const useCases = [
  {
    label: "01",
    title: "Thought Partner",
    description:
      "This is the most common use. I use Chief to think through messy ideas, pressure-test instincts, sharpen strategy, and turn vague thoughts into something structured enough to act on.",
    bullets: [
      "Clarifying business ideas and customer value",
      "Stress-testing strategy before building",
      "Turning rough instincts into clearer plans",
    ],
  },
  {
    label: "02",
    title: "Reports & Analytics",
    description:
      "One of the best parts of the workflow is turning exploration into durable artifacts. Instead of losing ideas in chat, Chief helps generate readable reports, explainers, technical notes, and analysis I can actually review later or share.",
    bullets: [
      "Technical explainers and strategy briefs",
      "Mobile-friendly HTML reports",
      "Structured outputs that are easier to revisit than chat logs",
    ],
  },
  {
    label: "03",
    title: "Project Builder",
    description:
      "When I'm starting something new, Chief helps translate ideas into working projects — from repo setup and implementation framing to iterative build support across codebase-heavy work.",
    bullets: [
      "Project scaffolding and MVP shaping",
      "Codebase planning and implementation support",
      "Turning concepts into testable systems",
    ],
  },
  {
    label: "04",
    title: "Systems Architecture",
    description:
      "I use Chief to think in systems: websites, datasets, APIs, deployments, infrastructure, and the connective tissue between them. It's especially useful for moving from goals to actual architecture.",
    bullets: [
      "Deploying websites and datasets",
      "Designing data and app architecture",
      "Translating abstract goals into technical systems",
    ],
  },
  {
    label: "05",
    title: "Memory Capture",
    description:
      "Memory capture is one of the coolest parts of the setup. Chief doesn't just answer in the moment — it helps preserve decisions, project progress, useful preferences, and context that compounds over time into something more productive and income-earning.",
    bullets: [
      "Capturing decisions and project progress",
      "Preserving useful context between sessions",
      "Building a productivity layer of durable memory",
    ],
  },
];

export function ChiefShowcaseSection() {
  const [paneOpen, setPaneOpen] = useState(true);
  const visibleReports = useMemo(() => (paneOpen ? reports : reports.slice(0, 3)), [paneOpen]);

  return (
    <section className="panel mx-auto w-[calc(100%-2*16px)] max-w-[1200px] overflow-hidden p-0 md:w-[calc(100%-2*40px)]">
      <div className="border-b border-border-light px-5 py-5 md:px-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[760px]">
            <p className="label-mono mb-2">openclaw / chief</p>
            <h2 className="font-serif text-2xl md:text-3xl">
              How I work with Chief.
              <br />
              <span className="text-accent">A local OpenClaw assistant for thinking, building, reporting, and remembering.</span>
            </h2>
            <div className="mt-3 max-w-[78ch] space-y-3 text-fg-muted">
              <p>
                Chief is my local OpenClaw assistant running on my machine. I use it first as a
                thought partner, then as a system for turning that thinking into reports, analytics,
                projects, architecture, and useful memory that compounds over time.
              </p>
              <p>
                The goal isn't just to chat with an AI. It's to create a workflow where ideas become
                durable artifacts and context becomes leverage.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start">
            <a
              href="https://blakethom8.github.io/mobile-reports/"
              target="_blank"
              rel="noreferrer"
              className="rounded border border-border-light px-3 py-2 font-mono text-[11px] text-fg-muted no-underline transition-colors hover:border-accent-muted hover:text-accent"
            >
              full reports →
            </a>
            <button
              onClick={() => setPaneOpen((v) => !v)}
              className="rounded border border-border-light px-3 py-2 font-mono text-[11px] text-fg-muted transition-colors hover:border-accent-muted hover:text-accent"
            >
              {paneOpen ? "hide preview" : "show preview"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className={`min-w-0 flex-1 px-5 py-5 md:px-7 md:py-6 ${paneOpen ? "md:border-r md:border-border-light" : ""}`}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {useCases.map((item) => (
              <article
                key={item.title}
                className={`rounded border p-4 ${item.title === "Thought Partner" ? "border-accent/30 bg-accent-light/20" : "border-border-light"}`}
              >
                <span className="inline-flex rounded border border-accent/20 bg-accent-light/30 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                  {item.label}
                </span>
                <h3 className="mt-3 font-sans text-[16px] font-semibold tracking-[-0.01em] text-fg">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.7] text-fg-muted">{item.description}</p>
                <ul className="mt-3 space-y-1.5 pl-4 text-[12px] leading-[1.6] text-fg-light">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        {paneOpen && (
          <aside className="shrink-0 border-t border-border-light bg-bg-panel-hover/35 md:w-[380px] md:border-l-0 md:border-t-0">
            <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
              <div>
                <p className="label-mono">report preview</p>
                <p className="mt-1 text-[12px] text-fg-light">Recent OpenClaw reports and explainers</p>
              </div>
              <a
                href="https://blakethom8.github.io/mobile-reports/"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-accent no-underline transition-opacity hover:opacity-70"
              >
                browse all →
              </a>
            </div>

            <div className="max-h-[780px] overflow-y-auto">
              {visibleReports.map((report, i) => (
                <a
                  key={report.href}
                  href={report.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`block border-b border-border-light px-5 py-4 no-underline transition-colors hover:bg-accent/[0.04] ${
                    i % 2 === 1 ? "bg-bg-panel/45" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-sans text-[13px] font-medium leading-snug text-fg">{report.title}</p>
                    <span className="shrink-0 font-mono text-[10px] text-fg-light">{report.date}</span>
                  </div>
                  <p className="mt-2 text-[12px] leading-[1.65] text-fg-muted">{report.description}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {report.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
