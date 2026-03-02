import type { Metadata } from "next";
import Link from "next/link";
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
          <h1 className="font-serif text-2xl md:text-3xl">
            Building Personalized Applications.
            <br />
            <span className="text-accent">Don&apos;t be limited by multi-tenant, legacy SaaS.</span>
          </h1>
          <div className="mt-4 content-body text-fg-muted">
            <p>
              We build AI-powered applications specifically for you — seriously,
              the application is entirely owned and isolated to your
              organization&apos;s network. Here&apos;s our thoughts:
            </p>
            <p>
              Your existing technology stack was made by decisions of compromise
              and trade-offs — &ldquo;We bought Salesforce, it satisfied 60% of our
              needs so we paid consultants to customize everything, and our reps
              are still not happy with it.&rdquo; And even worse, the vendor lock-in
              you are feeling is a feature, not a bug. Legacy systems want to
              upsell you for solutions you need today — imagine waiting 3 months
              to add a new feature when your team could build it overnight.
            </p>
            <p>
              Our belief is that legacy, multi-tenant software will not keep up
              with your organization&apos;s demands or adapt quickly enough to
              maximize LLM-Agents. By building applications directly in your
              environment, we empower native interoperability with the rest of
              your organization. Let us help you remove the friction that has
              profited SaaS for so many years. Our rapidly deployed applications
              enable your team to spend more time serving customers, driving
              corporate strategy, and doing the important work.
            </p>
          </div>
        </Panel>

        {/* Services */}
        <Panel as="section">
          <p className="label-mono mb-3">services</p>
          <div className="grid gap-4 md:grid-cols-3">
            <ServiceCard
              number="01"
              title="Bespoke AI Applications"
              status="coming soon"
              description="Deep-engagement builds for organizations that want real capability — not a demo. Data analytics pipelines, enhanced dashboards, data analyst bots, LLM workflows, and CRM/CRUD applications. We learn your world, build inside your environment, and leave you with something that compounds."
              tags={["Data Pipelines", "Dashboards", "AI Bots", "LLM Workflows", "CRM"]}
              cta={{ label: "one-pager →", href: "/work/framework" }}
            />
            <ServiceCard
              number="02"
              title="Personal AI Assistant Setup"
              description="1:1 buildouts of a local personal assistant — the same setup I use every day. Email management, project tracking, a local agent running on a Mac Mini that knows your context and works while you sleep. Taking my hands-on experience with OpenClaw and making it yours."
              tags={["OpenClaw", "Email Automation", "Local Agent", "Mac Mini"]}
            />
            <ServiceCard
              number="03"
              title="Open to Opportunities"
              description="Not everything fits a box. If you're wrestling with AI strategy, trying to articulate ROI to leadership, or just want a sharp thinking partner — let's talk. I'm open to advising, fractional work, or whatever form of collaboration creates real value."
              tags={["Strategy", "AI Advisory", "ROI", "Communication"]}
              cta={{ label: "get in touch →", href: "/contact" }}
              open
            />
          </div>
        </Panel>

        {/* Approach */}
        <Panel as="section">
          <p className="label-mono mb-3">approach</p>
          <div className="content-body text-fg-muted">
            <p>
              The world of software development changed dramatically in December
              2025. We have officially entered a new environment where writing
              code is a commodity. The capability of coding agents cannot be
              overstated — fortunately it enables us to level up our thinking and ask the
              more important questions. In a world of endless capability, we no
              longer ask <em>what can I build</em> and now get to more deeply
              explore <em>what produces the greatest value</em>. We believe
              your employees have the knowledge and ideas to improve your
              organization — we are here to unlock that potential.
            </p>
            <p>
              Every engagement starts with understanding the client&apos;s world
              — their data, their workflows, their language. We work with your
              team to build the knowledge base on how your organization
              functions and engages with customers. Then we build. We build
              fast. Our team deploys agents to their full potential, supercharged
              by frameworks and optimizations we are constantly developing as we
              ship production-grade products. Our philosophy is to work within
              your enterprise-secure environment, build trust through
              transparency in our codebase, and produce results that the big
              companies aren&apos;t delivering today.
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
          <div className="flex items-baseline justify-between">
            <p className="label-mono">projects</p>
            <Link
              href="/work/projects"
              className="font-mono text-[11px] text-fg-light no-underline hover:text-accent"
            >
              full spotlight →
            </Link>
          </div>
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

function ServiceCard({
  number,
  title,
  status,
  description,
  tags,
  cta,
  open = false,
}: {
  number: string;
  title: string;
  status?: string;
  description: string;
  tags: string[];
  cta?: { label: string; href: string };
  open?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded border p-4 transition-colors hover:border-accent-muted ${
        open ? "border-accent/30 bg-accent-light/20" : "border-border-light"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] text-accent">{number}</span>
        {status && (
          <span className="rounded border border-accent/30 px-1.5 py-0.5 font-mono text-[10px] text-accent">
            {status}
          </span>
        )}
      </div>
      <h3 className="mt-1.5 font-sans text-[14px] font-semibold text-fg">{title}</h3>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-fg-muted">{description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      {cta && (
        <a
          href={cta.href}
          className="mt-3 self-start font-mono text-[11px] text-accent no-underline hover:opacity-70"
        >
          {cta.label}
        </a>
      )}
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
