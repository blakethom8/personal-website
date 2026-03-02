import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { backgrounds } from "@/lib/backgrounds";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've been building — production apps, data platforms, AI systems, and enterprise tooling.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageBackground src={backgrounds.work} alt="Mountain landscape" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        {/* Header */}
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <p className="label-mono">project spotlight</p>
            <Link
              href="/work"
              className="font-mono text-[11px] text-fg-light no-underline transition-colors hover:text-accent"
            >
              ← back to work
            </Link>
          </div>
          <h1 className="mt-2 font-serif text-2xl md:text-3xl">
            Things I&apos;ve Been Building
          </h1>
          <p className="mt-3 max-w-2xl text-fg-muted">
            Over the past couple of months I&apos;ve been heads-down building. Some
            of it is production software, some is personal infrastructure, some
            is enterprise tooling I can&apos;t fully talk about. Here&apos;s what I can
            share.
          </p>
        </Panel>

        {/* Featured: MyDocList */}
        <Panel as="section">
          <p className="label-mono mb-4">featured project</p>
          <a
            href="https://mydoclist.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded border border-accent/30 bg-accent-light/20 p-6 no-underline transition-colors hover:border-accent-muted"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded border border-accent/30 bg-accent-light/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                live in production
              </span>
              <span className="font-mono text-[11px] text-fg-light">
                mydoclist.com
              </span>
            </div>
            <h2 className="mt-3 font-serif text-xl leading-snug text-fg">
              MyDocList — Provider Intelligence Platform
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
              A search and analytics tool built for physician liaisons and
              medical sales teams. Combines 90M+ rows of Medicare claims data
              with Google Places to give field teams instant access to provider
              information — who they are, where they practice, what they bill,
              and how they connect to the broader network. Compact card UI,
              Leaflet maps, and a cascading NPI match engine under the hood.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["FastAPI", "React", "DuckDB", "Docker", "CMS Data", "Google Places", "MCP"].map(
                (tag) => (
                  <span key={tag} className="tag">{tag}</span>
                )
              )}
            </div>
            <p className="mt-4 font-mono text-[12px] text-accent">
              visit mydoclist.com →
            </p>
          </a>
        </Panel>

        {/* Other Projects */}
        <Panel as="section">
          <p className="label-mono mb-4">more projects</p>
          <div className="grid gap-4 md:grid-cols-3">

            {/* CMS Data */}
            <div className="flex flex-col rounded border border-border-light p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-accent">01</span>
                <span className="rounded border border-border-light px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
                  ui coming soon
                </span>
              </div>
              <h3 className="mt-2 font-serif text-[16px] leading-snug text-fg">
                CMS Data Platform
              </h3>
              <p className="mt-2 flex-1 text-[12px] leading-relaxed text-fg-muted">
                A complete Medicare data backend — NPPES provider registries,
                claims history, Open Payments, and MIPS quality scores unified
                into a single queryable dataset. 90M+ rows hosted on the server.
                A public interface for exploring the data is in the works.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["DuckDB", "Python", "CMS Data", "Entity Resolution", "NPPES"].map(
                  (tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  )
                )}
              </div>
            </div>

            {/* OpenClaw */}
            <a
              href="https://github.com/blakethom8/openclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded border border-border-light p-5 no-underline transition-colors hover:border-accent-muted"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-accent">02</span>
                <span className="rounded border border-accent/30 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                  personal · active
                </span>
              </div>
              <h3 className="mt-2 font-serif text-[16px] leading-snug text-fg">
                OpenClaw
              </h3>
              <p className="mt-2 flex-1 text-[12px] leading-relaxed text-fg-muted">
                My personal AI operating system. Runs on a Mac Mini, manages
                email, tracks projects, and operates as a local agent with full
                context of my work and life. I treat it like a product — it runs
                all day, I interact with it constantly, and I keep improving it.
                The same infrastructure behind the education content on this
                site.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Local Agent", "MCP", "Email Automation", "Mac Mini", "Python"].map(
                  (tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  )
                )}
              </div>
              <p className="mt-3 font-mono text-[11px] text-accent">
                view on github →
              </p>
            </a>

            {/* Building AI in Azure */}
            <div className="flex flex-col rounded border border-border-light p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-accent">03</span>
                <span className="rounded border border-accent/30 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                  enterprise · active
                </span>
              </div>
              <h3 className="mt-2 font-serif text-[16px] leading-snug text-fg">
                Building AI in Azure
              </h3>
              <p className="mt-2 flex-1 text-[12px] leading-relaxed text-fg-muted">
                AI-powered workflows built inside the Azure ecosystem — data
                reporting bots, a Microsoft Teams integration for conversational
                data access, and architecture that plays nicely with enterprise
                security requirements. Built for a large health system where
                compliance and auditability are non-negotiable. Azure OpenAI,
                Container Apps, and MCP under the hood.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Azure OpenAI", "Teams Bot", "Container Apps", "MCP", "Python"].map(
                  (tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  )
                )}
              </div>
            </div>

          </div>
        </Panel>
      </div>
    </>
  );
}
