import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { backgrounds } from "@/lib/backgrounds";

export const metadata: Metadata = {
  title: "Bespoke AI Solutions: Consulting as a Product",
  description:
    "How we think about building AI-powered applications inside your environment — the paradigm shift, what we sell, and how we price it.",
};

export default function FrameworkPage() {
  return (
    <>
      <PageBackground src={backgrounds.work} alt="Mountain landscape" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        {/* Header */}
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <p className="label-mono">consulting as a product</p>
            <Link
              href="/work"
              className="font-mono text-[11px] text-fg-light no-underline hover:text-accent transition-colors"
            >
              ← back to work
            </Link>
          </div>
          <h1 className="mt-2 font-serif text-2xl md:text-3xl">
            Bespoke AI Solutions: Consulting as a Product
          </h1>
          <p className="mt-2 font-mono text-[12px] text-fg-light">
            Draft — February 25, 2026
          </p>
        </Panel>

        {/* Section 1: Paradigm Shift */}
        <Panel as="section">
          <p className="label-mono mb-3">the paradigm shift</p>
          <h2 className="font-serif text-xl md:text-2xl mb-4">
            Old Model vs. New Model
          </h2>
          <div className="content-body text-fg-muted">
            <p>
              <strong className="text-fg">The old world</strong> of software
              consulting looked like this: a vendor builds a product over months
              or years, hosts it on their own servers, manages integrations,
              handles security, and sells subscriptions. The product itself is
              the moat — it took so long to build that customers can&apos;t
              replicate it. Scaling means onboarding more tenants onto the same
              platform, negotiating BAAs, passing security reviews, and managing
              multi-tenant data isolation. Sales cycles stretch to 6–12 months.
              The vendor owns the infrastructure, the data flows through their
              systems, and the client is locked in.
            </p>
            <p>
              <strong className="text-fg">The new world</strong> is
              fundamentally different. AI-accelerated development means a
              skilled team can build a production-quality, bespoke application
              in days rather than months. But here&apos;s the critical insight:{" "}
              <strong className="text-fg">
                the bottleneck was never the code. It was always knowing what to
                build, having the data expertise to power it, and understanding
                the domain deeply enough to make it actually useful.
              </strong>
            </p>
            <p>What changes:</p>
            <ul>
              <li>
                <strong className="text-fg">Deployment flips inside-out.</strong>{" "}
                Instead of &ldquo;send us your data and we&apos;ll host it,&rdquo; the model
                becomes &ldquo;we build it inside your walls.&rdquo; The application lives in
                the client&apos;s own Azure tenant, runs on their Azure OpenAI
                instance, and their data never leaves their environment. This
                eliminates the entire security/compliance gatekeeping process
                that kills most health tech startups.
              </li>
              <li>
                <strong className="text-fg">Speed becomes a feature, not a shortcut.</strong>{" "}
                A rapid build isn&apos;t a hack — it&apos;s a demonstration of deep
                expertise. We&apos;ve already solved the architecture, data pipeline,
                and UX patterns. Each new deployment is a configured instance of
                proven infrastructure, not a from-scratch experiment.
              </li>
              <li>
                <strong className="text-fg">The value shifts from software to intelligence.</strong>{" "}
                The application is the delivery vehicle. The real product is the
                domain expertise, data architecture, and ongoing intelligence
                layer that makes the tool actually work.
              </li>
            </ul>
          </div>
        </Panel>

        {/* Section 2: What We're Selling */}
        <Panel as="section">
          <p className="label-mono mb-3">what we sell</p>
          <h2 className="font-serif text-xl md:text-2xl mb-1">
            What We&apos;re Actually Selling
          </h2>
          <p className="text-[14px] text-fg-muted mb-5">
            It&apos;s tempting to think this is just &ldquo;we can code faster than your
            team.&rdquo; That&apos;s wrong. Here&apos;s what clients are actually paying for:
          </p>
          <div className="flex flex-col gap-4">
            <SellingPoint
              number="1"
              title="Domain Expertise + Data Architecture"
              body="We understand healthcare data — claims, provider ecosystems, CMS datasets, entity resolution across data sources. A cascading NPI match engine with specialty stemming and multi-source entity resolution isn't something a hospital IT team prompts into existence. They don't even know what to ask for. We do, because we've lived in this data."
            />
            <SellingPoint
              number="2"
              title="The Blueprint, Not the Bricks"
              body={<>Anyone can lay bricks fast now. We&apos;re the architects who know <em>what to build</em>. Which data sources matter, how they connect, what questions the business development team actually needs answered, how physician liaisons work day-to-day. That knowledge comes from years in the field, not from a prompt.</>}
            />
            <SellingPoint
              number="3"
              title="Configuration as Product"
              body="The component libraries, data schemas, tool definitions, pipeline configs — that's reusable IP. Each client deployment is a configured instance of our architecture, not a ground-up build. This is why we can move in days: we're not starting from zero."
            />
            <SellingPoint
              number="4"
              title="External Data & Intelligence Layer (Add-On)"
              body={
                <>
                  <p className="mb-2">
                    For clients who want us to bring external datasets and manage
                    ongoing data enrichment, this becomes a managed intelligence
                    subscription. This can take multiple forms:
                  </p>
                  <ul className="flex flex-col gap-1 text-[13px] text-fg-muted pl-4 list-disc">
                    <li><strong className="text-fg">Public data pipelines</strong> — CMS Medicare data, NPPES provider registries, quality scores, Open Payments</li>
                    <li><strong className="text-fg">Web intelligence</strong> — Google search crawls, web-scraped provider information, review aggregation</li>
                    <li><strong className="text-fg">Third-party data</strong> — Trilliant Health, claims aggregators, or other commercial datasets we integrate on their behalf</li>
                    <li><strong className="text-fg">Ongoing maintenance</strong> — Data refreshes (CMS releases quarterly), match algorithm improvements, new source integrations</li>
                  </ul>
                  <p className="mt-2">This layer is the subscription engine. The data keeps flowing, the intelligence keeps improving, and the client doesn&apos;t need to manage any of it.</p>
                </>
              }
            />
            <SellingPoint
              number="5"
              title="White-Glove Upsell: Bespoke Solutions"
              body={
                <>
                  <p className="mb-2">Beyond the core products, we offer custom-built solutions for specific needs:</p>
                  <ul className="flex flex-col gap-1 text-[13px] text-fg-muted pl-4 list-disc">
                    <li><strong className="text-fg">Bespoke dashboards</strong> — Executive views, board-ready visualizations, operational dashboards tailored to their KPIs</li>
                    <li><strong className="text-fg">LLM processing pipelines</strong> — Automated report generation, document analysis, unstructured-to-structured data workflows</li>
                    <li><strong className="text-fg">Custom integrations</strong> — Connecting to their EHR, internal databases, or proprietary systems</li>
                    <li><strong className="text-fg">Advanced analytics</strong> — Market analysis, referral pattern modeling, competitive intelligence</li>
                  </ul>
                </>
              }
            />
          </div>
        </Panel>

        {/* Section 3: Three Products */}
        <Panel as="section">
          <p className="label-mono mb-3">the products</p>
          <h2 className="font-serif text-xl md:text-2xl mb-4">
            What Our Clients Get: Three Tangible Products
          </h2>
          <div className="flex flex-col gap-4">
            <ProductCard
              number="01"
              title="Agent Data Catalog"
              meta={[
                { label: "Delivery", value: "Workshops + repository + docs" },
                { label: "Timeline", value: "2–4 weeks" },
              ]}
            >
              <p>
                <strong className="text-fg">The foundation layer.</strong>{" "}
                Before any tool works well, the AI needs to understand the
                client&apos;s world — their business rules, data sources,
                terminology, organizational structure, and domain knowledge.
              </p>
              <p>We deliver this through a structured consulting engagement:</p>
              <ul>
                <li><strong className="text-fg">Discovery workshops</strong> with stakeholders across the organization</li>
                <li><strong className="text-fg">Documentation</strong> of business rules, data dictionaries, KPI definitions, and institutional knowledge</li>
                <li><strong className="text-fg">Structured knowledge repository</strong> built as an agentic-ready data catalog — not a static wiki, but a machine-readable foundation that any AI tool can query</li>
                <li><strong className="text-fg">Data source mapping</strong> — what lives where, how it connects, what&apos;s trustworthy, what&apos;s stale</li>
              </ul>
              <p>
                This becomes the &ldquo;brain&rdquo; that powers everything else. Every
                bot, every dashboard, every pipeline reads from this catalog.
                It&apos;s also the consulting engagement that builds the relationship
                and surfaces the real needs.
              </p>
            </ProductCard>

            <ProductCard
              number="02"
              title="Conversational AI Bots (Teams / Web)"
              meta={[
                { label: "Delivery", value: "Client's Azure tenant" },
                { label: "Timeline", value: "1–2 weeks per bot" },
              ]}
            >
              <p>
                <strong className="text-fg">Standalone AI assistants</strong>{" "}
                deployed into the client&apos;s Microsoft Teams environment (or as
                web applications), each purpose-built for a specific function:
              </p>
              <ul>
                <li><strong className="text-fg">Data Reporting Bot</strong> — &ldquo;Show me referral volumes for cardiology in Q4&rdquo; → instant chart with drill-down. Natural language access to their data without needing SQL or BI tools.</li>
                <li><strong className="text-fg">Roster Management Bot</strong> — &ldquo;Which providers in the West Valley accept Medicare?&rdquo; → provider cards with contact info, network status, and recent activity.</li>
                <li><strong className="text-fg">Market Intelligence Bot</strong> — &ldquo;What&apos;s our share of orthopedic referrals vs. UCLA?&rdquo; → competitive analysis from claims data and public sources.</li>
                <li><strong className="text-fg">Operations Bot</strong> — Meeting prep, report generation, data quality alerts, automated briefings.</li>
              </ul>
              <p>
                Each bot is a standalone product with its own capabilities and
                tool set. They share the Agent Data Catalog as their knowledge
                base but serve different users and use cases. New bots can be
                spun up as needs emerge.
              </p>
            </ProductCard>

            <ProductCard
              number="03"
              title="Dashboards & Bespoke Applications"
              meta={[
                { label: "Delivery", value: "Azure Container Apps" },
                { label: "Timeline", value: "1–3 weeks" },
              ]}
            >
              <p>
                <strong className="text-fg">
                  Web applications hosted in the client&apos;s Azure environment
                </strong>{" "}
                — container apps that provide rich, interactive interfaces
                beyond what a chat bot can offer:
              </p>
              <ul>
                <li><strong className="text-fg">Analytics dashboards</strong> — Real-time operational views, executive summaries, trend analysis</li>
                <li><strong className="text-fg">Provider search &amp; intelligence tools</strong> — Interactive maps, provider profiles, network visualization</li>
                <li><strong className="text-fg">Workflow applications</strong> — Custom tools for specific business processes (territory management, referral tracking, campaign planning)</li>
                <li><strong className="text-fg">Reporting portals</strong> — Automated report generation with scheduled delivery</li>
              </ul>
              <p>
                These use modern generative UI frameworks where the AI
                dynamically selects and renders the right visualization based on
                the user&apos;s question. &ldquo;Show me the data&rdquo; becomes a chart.
                &ldquo;Compare these providers&rdquo; becomes a side-by-side card view. The
                interface adapts to the question.
              </p>
            </ProductCard>
          </div>
        </Panel>

        {/* Section 4: Architecture */}
        <Panel as="section">
          <p className="label-mono mb-3">deployment architecture</p>
          <h2 className="font-serif text-xl md:text-2xl mb-4">
            Deployment Architecture
          </h2>
          <pre className="overflow-x-auto rounded border border-border bg-bg-dark px-5 py-5 font-mono text-[12px] leading-relaxed text-fg-code whitespace-pre">
{`Client's Azure Tenant
├── Azure Container Apps
│   ├── Conversational Bots (Teams integration)
│   ├── Web Dashboards & Applications
│   ├── MCP Server (data tools & integrations)
│   └── Agent Data Catalog service
├── Azure OpenAI Service (their key, their usage, their data)
├── Azure SQL / Cosmos DB (their data stays here)
└── Azure AD (their auth, their access controls)

Our Infrastructure (optional managed service)
├── External data pipelines (CMS, NPPES, web crawl)
├── Data enrichment & matching engine
└── Scheduled updates pushed to client tenants`}
          </pre>
          <Callout>
            <strong className="text-fg">The security pitch to IT:</strong>{" "}
            &ldquo;Nothing leaves your environment. The AI runs on your Azure OpenAI
            instance. Your data stays in your tenant. We deploy, configure, and
            maintain the intelligence layer.&rdquo;
          </Callout>
        </Panel>

        {/* Section 5: Why Better Than SaaS */}
        <Panel as="section">
          <p className="label-mono mb-3">competitive advantage</p>
          <h2 className="font-serif text-xl md:text-2xl mb-4">
            Why This Is Better Than SaaS (For Healthcare)
          </h2>
          <div className="content-body text-fg-muted">
            <p>
              Healthcare is allergic to sending data outside their environment.
              Every SaaS deal requires a BAA, security review, data governance
              approval, vendor risk assessment — the sales cycle alone can kill
              a startup.
            </p>
            <p>
              Our model flips it:{" "}
              <strong className="text-fg">
                &ldquo;We build it inside your walls.&rdquo;
              </strong>
            </p>
            <ul>
              <li>No BAA negotiation for data transit — the data never leaves</li>
              <li>No vendor risk assessment for data hosting — we don&apos;t host their data</li>
              <li>IT can inspect every container, every API call, every model interaction</li>
              <li>They control the Azure OpenAI instance — they set the guardrails</li>
              <li>Decommissioning is simple — it&apos;s their infrastructure</li>
            </ul>
            <p>
              This isn&apos;t a limitation we&apos;re working around. It&apos;s a genuine
              competitive advantage. We skip the 6-month procurement gauntlet
              that every SaaS competitor has to endure.
            </p>
          </div>
        </Panel>

        {/* Section 6: The Moat */}
        <Panel as="section">
          <p className="label-mono mb-3">defensibility</p>
          <h2 className="font-serif text-xl md:text-2xl mb-2">
            The Real Moat
          </h2>
          <p className="text-[14px] text-fg-muted mb-5">
            If AI makes building fast and cheap, what prevents competition?
            It&apos;s the stack of five things together:
          </p>
          <div className="flex flex-col gap-3">
            {[
              {
                n: "1",
                title: "Domain knowledge",
                body: "Healthcare BD, claims data, provider networks, how the business actually works on the ground.",
              },
              {
                n: "2",
                title: "Data architecture",
                body: "CMS pipelines, entity resolution, match engines, multi-source intelligence. Built and proven, not theoretical.",
              },
              {
                n: "3",
                title: "Reusable component library",
                body: "Tested schemas, UI patterns, bot configurations, pipeline templates. Each deployment makes the library stronger.",
              },
              {
                n: "4",
                title: "Speed",
                body: "We've done this before. What takes a competitor 3 months to figure out, we deploy in days. That compounds.",
              },
              {
                n: "5",
                title: "Ongoing intelligence",
                body: "The subscription layer. Data keeps flowing, algorithms improve, new sources get integrated. The tool gets smarter over time.",
              },
            ].map((item) => (
              <div
                key={item.n}
                className="flex items-start gap-4 rounded border border-border-light p-4"
              >
                <span className="shrink-0 font-mono text-[28px] font-bold leading-none text-accent">
                  {item.n}
                </span>
                <div>
                  <p className="font-sans text-[14px] font-semibold text-fg">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-fg-muted">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-fg-muted">
            A competitor would need to replicate all five simultaneously.
            AI-assisted coding only gives them the code part — the easiest
            piece of the puzzle.
          </p>
        </Panel>

        {/* Section 7: Pricing */}
        <Panel as="section">
          <p className="label-mono mb-3">pricing framework</p>
          <h2 className="font-serif text-xl md:text-2xl mb-2">
            Pricing Framework
          </h2>
          <p className="mb-4 text-[14px] text-fg-muted">
            <strong className="text-fg">
              Don&apos;t price the time to build. Price the value of the capability
              and the cost of the alternative.
            </strong>
          </p>
          <p className="mb-5 text-[13px] text-fg-muted">
            The client&apos;s alternative: hire a data analyst ($120K/yr), plus a
            developer ($150K/yr), plus 6 months to build something half as
            good, plus they still don&apos;t have the external data pipeline or the
            domain expertise. That&apos;s $135K+ in salary alone before they have
            anything working.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="border-b border-border bg-bg-panel-hover px-4 py-2.5 text-left font-mono text-[11px] uppercase tracking-wider text-fg-light">
                    Component
                  </th>
                  <th className="border-b border-border bg-bg-panel-hover px-4 py-2.5 text-left font-mono text-[11px] uppercase tracking-wider text-fg-light">
                    Pricing
                  </th>
                  <th className="border-b border-border bg-bg-panel-hover px-4 py-2.5 text-left font-mono text-[11px] uppercase tracking-wider text-fg-light">
                    Recurrence
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    component: "Agent Data Catalog",
                    sub: "Discovery + workshops + repository",
                    price: "$15,000 – $40,000",
                    rec: "One-time setup",
                  },
                  {
                    component: "Conversational Bot",
                    sub: "Per bot deployment",
                    price: "$10,000 – $25,000",
                    rec: "One-time + maintenance",
                  },
                  {
                    component: "Dashboard / Bespoke App",
                    sub: "",
                    price: "$15,000 – $50,000",
                    rec: "One-time + maintenance",
                  },
                  {
                    component: "External Data & Intelligence",
                    sub: "",
                    price: "$2,000 – $5,000/mo",
                    rec: "Subscription",
                  },
                  {
                    component: "Maintenance & Support",
                    sub: "",
                    price: "$1,500 – $3,000/mo",
                    rec: "Subscription",
                  },
                  {
                    component: "White-Glove Custom Solutions",
                    sub: "",
                    price: "Scoped per engagement",
                    rec: "Project-based",
                  },
                ].map((row, i) => (
                  <tr
                    key={row.component}
                    className={i % 2 === 1 ? "bg-bg-panel-hover/50" : ""}
                  >
                    <td className="border-b border-border-light px-4 py-3">
                      <p className="font-medium text-fg">{row.component}</p>
                      {row.sub && (
                        <p className="text-[12px] text-fg-light">{row.sub}</p>
                      )}
                    </td>
                    <td className="border-b border-border-light px-4 py-3 font-mono text-[12px] text-fg">
                      {row.price}
                    </td>
                    <td className="border-b border-border-light px-4 py-3 text-[12px] text-fg-muted">
                      {row.rec}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout className="mt-4">
            <strong className="text-fg">Typical first engagement:</strong>{" "}
            Data Catalog ($25K) + 2 Bots ($30K) + Intelligence Subscription
            ($3K/mo) ={" "}
            <strong className="text-fg">
              ~$55K setup + $3K/mo recurring
            </strong>
          </Callout>
          <p className="mt-3 text-[13px] text-fg-muted">
            The subscription is the long-term play. Setup fees cover costs and
            build the relationship. Recurring revenue scales with the client
            base.
          </p>
        </Panel>

        {/* Closing */}
        <Panel>
          <p className="font-sans text-[14px] italic text-fg-muted">
            This framework positions us as domain experts who happen to build
            fast — not developers who happen to know healthcare. The AI is our
            accelerant, not our product.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/work"
              className="font-mono text-[12px] text-accent no-underline hover:opacity-70 transition-opacity"
            >
              ← back to work
            </Link>
            <span className="font-mono text-[12px] text-border">·</span>
            <Link
              href="/contact"
              className="font-mono text-[12px] text-accent no-underline hover:opacity-70 transition-opacity"
            >
              get in touch →
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
}

function SellingPoint({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded border border-border-light p-4">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-mono text-[11px] text-accent shrink-0">{number}.</span>
        <h3 className="font-sans text-[14px] font-semibold text-fg">{title}</h3>
      </div>
      <div className="text-[13px] leading-relaxed text-fg-muted pl-5">
        {body}
      </div>
    </div>
  );
}

function ProductCard({
  number,
  title,
  meta,
  children,
}: {
  number: string;
  title: string;
  meta: { label: string; value: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-border-light p-5">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-mono text-[11px] text-accent shrink-0">{number}</span>
        <h3 className="font-serif text-[17px] text-fg">{title}</h3>
      </div>
      <div className="content-body text-fg-muted text-[13px]">{children}</div>
      <div className="mt-4 flex flex-wrap gap-3">
        {meta.map((m) => (
          <span
            key={m.label}
            className="rounded bg-bg-panel-hover px-3 py-1 font-mono text-[11px] text-fg-light"
          >
            <span className="text-fg-light">{m.label}: </span>
            <span className="text-fg-muted">{m.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Callout({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-r border-l-4 border-accent bg-accent-light/20 px-4 py-3 text-[13px] leading-relaxed text-fg-muted ${className}`}
    >
      {children}
    </div>
  );
}
