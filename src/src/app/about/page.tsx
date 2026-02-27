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
          <div className="mt-4 content-body text-fg-muted">
            <p>
              Blake Thomson. 32. Santa Monica, CA. Master&apos;s in Biomedical
              Engineering.
            </p>
            <p>
              Professionally, I have aspired to be at the intersection of
              business and science &amp; technology, leading to roles in
              healthcare, biotechnology, and life sciences. My curiosity in
              these spaces was heavily influenced by college lectures on
              genomics, healthcare economics, and medical device product design. This led
              me to experiencing the rise and fall of a Bay-Area Biotech
              Company, cranking through PowerPoint slides as a ZS Consultant,
              and more recently using data analytics to understand
              Cedars-Sinai Health System.
            </p>
            <p>
              When I&apos;m not trying to manage 4 Claude Code terminals +
              OpenClaw + Codex, you can find me chasing the waves and wind,
              walking our dog with my fianc&eacute;e, or researching the latest
              piece of gear for purchase.
            </p>
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
          <div className="mt-4 content-body text-fg-muted">
            <p>
              Water is the throughline. I grew up around the Bay Area and
              spend as much time as possible between there and Santa Monica —
              two coastlines with very different personalities. Surfing is the
              anchor, but I&apos;ve fallen deep into the world of foiling:
              hydrofoils, wing foiling, downwind runs. The physics of lift
              through water is genuinely fascinating, and the equipment design
              rabbit hole is endless.
            </p>
            <p>
              I spend an embarrassing amount of time thinking about board
              shapes, foil mast lengths, and wing aspect ratios. It sits in a
              strange overlap with engineering — the same instinct to
              understand why something works, then figure out how to make it
              work better. When I&apos;m not in the water I&apos;m usually reading about
              it, watching it, or convincing myself I need a new piece of kit.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
