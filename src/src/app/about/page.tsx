import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { backgrounds } from "@/lib/backgrounds";

export const metadata: Metadata = {
  title: "About",
  description: "Blake Thomson — healthcare strategist, data architect, and builder.",
};

export default function AboutPage() {
  return (
    <>
      <PageBackground src={backgrounds.about} alt="Golden California hills" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        {/* Header */}
        <Panel>
          <p className="label-mono mb-2">about</p>
          <h1 className="font-serif text-2xl md:text-3xl">
            The short version.
          </h1>
          <div className="mt-4 grid gap-8 md:grid-cols-[2fr_1fr]">
            <div className="content-body text-fg-muted">
              <p>
                Blake Thomson. 32. Santa Monica, CA. Master&apos;s in Biomedical
                Engineering. Currently on the Business Development team at
                Cedars-Sinai Health System. Building bespoke AI solutions for
                healthcare organizations on the side. Getting married June 2026
                in Napa Valley.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <DetailRow label="Location" value="Santa Monica, CA" />
              <DetailRow label="Role" value="BD, Cedars-Sinai" />
              <DetailRow label="Education" value="MS Biomedical Eng." />
              <DetailRow label="Venture" value="OpenClaw AI" />
            </div>
          </div>
        </Panel>

        {/* The Longer Version */}
        <Panel as="section">
          <h2 className="font-serif text-xl md:text-2xl">
            The longer version.
          </h2>
          <div className="mt-4 max-w-[68ch] content-body text-fg-muted">
            <h3>the career arc</h3>
            <p>
              Started in biotech in the Bay Area. Moved into consulting — med
              tech and pharma, sales consulting, the work of translating complex
              information into decisions people can act on. Then Cedars-Sinai,
              where for 2+ years I&apos;ve been the person who helps our team
              understand the LA County health ecosystem — where patients go, how
              providers connect, where the opportunities are.
            </p>
            <p>
              I&apos;m the person who can zoom out to strategy and zoom in to the SQL
              query. The &quot;data guru&quot; on a team that needs both the narrative and
              the numbers.
            </p>

            <h3>the venture</h3>
            <p>
              I started building AI tools because I kept seeing the same problem
              — smart people in healthcare drowning in data they can&apos;t access.
              Electronic health records, claims data, provider directories,
              quality scores — it&apos;s all there, but nobody can get to it without
              a data team and six months of implementation.
            </p>
            <p>
              So I&apos;m building the bridge. Bespoke AI applications deployed
              inside the client&apos;s own environment. Their data never leaves their
              walls. We bring the expertise, the architecture, and the speed.
              They get tools that actually work for their specific needs.
            </p>

            <h3>the education mission</h3>
            <p>
              I believe the biggest barrier to AI adoption isn&apos;t technology —
              it&apos;s understanding. Most people don&apos;t need to know how transformers
              work. They need to understand what these tools can and can&apos;t do,
              and how to use them effectively.
            </p>
            <p>
              That&apos;s why I build interactive learning modules — hands-on
              experiences that demystify LLMs for non-technical people. The kind
              of thing I wish existed when I was explaining this stuff to my
              colleagues.
            </p>
          </div>
        </Panel>

        {/* Personal */}
        <Panel as="section">
          <h2 className="font-serif text-xl md:text-2xl">Beyond work.</h2>
          <div className="mt-4 max-w-[68ch] content-body text-fg-muted">
            <p>
              Engaged to Devon — getting married June 2026 in Napa Valley.
              Building a custom home in Orinda (the long game). When I&apos;m not
              working, you&apos;ll find me surfing in Santa Monica, thinking about
              architecture, or in a deep conversation about systems — the kind
              where you realize two hours have passed and you haven&apos;t checked
              your phone.
            </p>
            <p>
              I care about building things that last. Whether it&apos;s a house, a
              company, or a tool — I want it to be something I&apos;m proud of in
              ten years.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border-light pb-2.5">
      <span className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
        {label}
      </span>
      <span className="text-[13px] text-fg">{value}</span>
    </div>
  );
}
