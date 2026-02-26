import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { backgrounds } from "@/lib/backgrounds";

export const metadata: Metadata = {
  title: "Work",
  description: "Bespoke AI solutions for healthcare organizations.",
};

const projects = [
  {
    title: "Provider Intelligence Platform",
    description:
      "Search and analytics tool for physician liaisons. 90M+ rows of Medicare claims data, Google Places integration, cascading NPI match engine with specialty stemming.",
    tags: ["FastAPI", "React", "DuckDB", "Docker", "CMS Data"],
    highlight: true,
  },
  {
    title: "CMS Healthcare Data Pipeline",
    description:
      "Automated ingestion of Medicare claims, NPPES provider registries, Open Payments, and MIPS quality scores. Entity resolution across data sources into a unified provider graph.",
    tags: ["Python", "DuckDB", "CMS Data", "Entity Resolution"],
    highlight: false,
  },
  {
    title: "Conversational AI Bots",
    description:
      'Natural language access to healthcare data via Microsoft Teams. "Show me referral volumes for cardiology in Q4" → instant chart with drill-down.',
    tags: ["Azure OpenAI", "Teams", "MCP", "Python"],
    highlight: false,
  },
  {
    title: "Analytics Dashboard",
    description:
      "Real-time usage tracking for Provider Search — top queries, provider views, daily engagement reports. Built with Claude Code in a single session.",
    tags: ["React", "Supabase", "Recharts"],
    highlight: false,
  },
];

export default function WorkPage() {
  return (
    <>
      <PageBackground src={backgrounds.work} alt="Mountain landscape" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        {/* Header */}
        <Panel>
          <p className="label-mono mb-2">work</p>
          <h1 className="max-w-2xl font-serif text-2xl md:text-3xl">
            Bespoke AI, built inside your walls.
          </h1>
          <p className="mt-3 max-w-xl text-fg-muted">
            I build AI-powered applications for healthcare organizations.
            Deployed in your environment. Your data never leaves. We bring the
            expertise, architecture, and speed.
          </p>
        </Panel>

        {/* Approach */}
        <Panel as="section">
          <p className="label-mono mb-3">approach</p>
          <div className="max-w-[68ch] content-body text-fg-muted">
            <p>
              The bottleneck was never code — it&apos;s knowing <em>what</em> to build.
              Which data sources matter, how they connect, what questions the
              business development team actually needs answered. That knowledge
              comes from years in the field, not from a prompt.
            </p>
            <p>
              Every engagement starts with understanding the client&apos;s world —
              their data, their workflows, their language. Then we build fast,
              deploy inside their own cloud, and iterate in real-time.
            </p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <ApproachCard
              number="01"
              title="Discovery"
              text="Map data sources, business rules, and stakeholder needs into an agent-ready knowledge base."
            />
            <ApproachCard
              number="02"
              title="Build"
              text="Deploy bespoke tools in days — bots, dashboards, pipelines — inside the client's own environment."
            />
            <ApproachCard
              number="03"
              title="Evolve"
              text="Ongoing data enrichment, new integrations, and expanding capabilities as needs emerge."
            />
          </div>
        </Panel>

        {/* Projects */}
        <Panel as="section">
          <p className="label-mono mb-3">projects</p>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.title}
                className={`rounded border p-4 transition-colors hover:border-accent-muted ${
                  project.highlight
                    ? "border-accent/30 bg-accent-light/20"
                    : "border-border-light"
                }`}
              >
                <h3 className="font-sans text-[14px] font-semibold text-fg">
                  {project.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                  {project.description}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Panel>

        {/* Tech Stack */}
        <Panel as="section">
          <p className="label-mono mb-3">stack</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <TechGroup
              label="backend"
              items={["Python", "FastAPI", "Django", "DuckDB", "Supabase"]}
            />
            <TechGroup
              label="frontend"
              items={["React", "Next.js", "Tailwind CSS", "Recharts"]}
            />
            <TechGroup
              label="ai & data"
              items={["Azure OpenAI", "MCP", "WebMCP", "CMS/Medicare Data"]}
            />
            <TechGroup
              label="infra"
              items={["Docker", "Azure Container Apps", "Hetzner", "GitHub Actions"]}
            />
            <TechGroup
              label="data sources"
              items={["NPPES", "Medicare Claims", "Open Payments", "Google Places"]}
            />
            <TechGroup
              label="patterns"
              items={["Entity Resolution", "NPI Matching", "Agent Orchestration"]}
            />
          </div>
        </Panel>
      </div>
    </>
  );
}

function ApproachCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded border border-border-light p-3">
      <span className="font-mono text-[11px] text-accent">{number}</span>
      <h3 className="mt-0.5 font-sans text-[14px] font-semibold text-fg">{title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{text}</p>
    </div>
  );
}

function TechGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded border border-border-light p-3">
      <p className="label-mono mb-1.5">
        {label}
      </p>
      <p className="text-[13px] text-fg-muted">{items.join(", ")}</p>
    </div>
  );
}
