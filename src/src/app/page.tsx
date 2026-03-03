import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { backgrounds } from "@/lib/backgrounds";

export default function Home() {
  return (
    <>
      <PageBackground
        src={backgrounds.home}
        alt="Pacific ocean coastline"
        priority
      />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        {/* Row 1: Hero + Site Directory side by side */}
        <div className="mx-auto flex w-[calc(100%-2*16px)] max-w-[1200px] flex-col gap-4 md:w-[calc(100%-2*40px)] md:flex-row md:items-start">
          {/* Hero */}
          <div className="panel flex-1 px-5 py-8 md:px-7 md:py-10">
            <p className="label-mono mb-3">
              healthcare &middot; data &middot; ai
            </p>
            <h1 className="font-serif text-2xl leading-tight md:text-3xl lg:text-4xl">
              Chatting about AI
              <br />
              <span className="text-accent">And keeping it real.</span>
            </h1>
            <div className="mt-3 max-w-[750px] space-y-3 text-fg-muted">
              <p>
                This website is a collection of my experience and thoughts while
                building with AI. My primary focus is educational, where I attempt
                to simplify the key concepts of &ldquo;Applied Agents&rdquo; and share ideas
                around the LLM application space. I feel somewhat confident
                speaking on the topic because I am currently spending way too much
                time behind the computer, creating agentic applications through
                the help of agents.
              </p>
              <p>
                In addition, I&rsquo;m building a career in this space. This isn&rsquo;t my
                formal business page, but let&rsquo;s connect. I love talking about
                LLMs, and most importantly how we can maximize their use to spend
                less time behind a screen and more time in the real world.
              </p>
              <p className="mt-6">A couple of notes:</p>
              <ul className="list-disc space-y-1.5 pl-5 text-[13px]">
                <li>
                  AI slop is ruining the internet (blog post coming later). That
                  said, yes, I will be working with agents to help build out my
                  content. My promise is to prefer quality over quantity, and
                  ensure the content is at least well curated.
                </li>
                <li>
                  On the design — I spend a lot of my time in Claude Code
                  terminals to manage all aspects of my work. Terminals are funny.
                  Folder structure matters a lot. I&rsquo;m trying to incorporate some
                  of that &ldquo;feel&rdquo; throughout this website.
                </li>
              </ul>
            </div>
          </div>

          {/* Site Directory */}
          <div className="panel shrink-0 px-5 py-5 md:w-[240px]">
            <p className="label-mono mb-3">site map</p>
            <div className="font-mono text-[13px] leading-relaxed text-fg-muted">
              <DirectoryItem href="/" label="index" active />
              <DirectoryItem href="/learn" label="learn" indent={1} desc="guides, labs & modules" />
              <DirectoryItem href="/ideas" label="ideas" indent={1} desc="essays & writing" />
              <DirectoryItem href="/work" label="work" indent={1} desc="projects & offerings" />
              <DirectoryItem href="/about" label="about" indent={1} desc="background & story" />
              <DirectoryItem href="/contact" label="contact" indent={1} desc="let's connect" />
            </div>
          </div>
        </div>

        {/* Row 2: Featured Content — full width */}
        <Panel as="section">
          <p className="label-mono mb-4">featured</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <FeaturedCard
              href="/learn/agents-explained"
              type="guide"
              title="How AI Agents Actually Work"
              description="Break down the 5 layers of an AI agent — from the model to tools to memory. Built for curious people, not engineers."
              cta="start the guide"
            />
            <FeaturedCard
              href="/learn/simulator"
              type="interactive lab"
              title="AI Conversation Simulator"
              description="Watch a real AI API call happen step by step. See the system prompt, the messages array, and how the model responds."
              cta="open simulator"
            />
            <FeaturedCard
              href="/ideas/death-of-multi-tenant"
              type="essay"
              title="The Death of Multi-Tenant"
              description="Why bespoke, single-tenant AI deployments are replacing shared infrastructure — and what that means for how software gets built."
              cta="read essay"
            />
          </div>
        </Panel>
      </div>
    </>
  );
}

function DirectoryItem({
  href,
  label,
  indent = 0,
  active = false,
  muted = false,
  desc,
}: {
  href: string;
  label: string;
  indent?: number;
  active?: boolean;
  muted?: boolean;
  desc?: string;
}) {
  const ml = indent === 1 ? "ml-4" : "";
  return (
    <div className={`${ml} py-0.5`}>
      <Link
        href={href}
        className={`no-underline hover:text-accent hover:no-underline ${
          active
            ? "text-accent"
            : muted
              ? "text-fg-light hover:text-accent"
              : "text-fg-muted hover:text-accent"
        }`}
      >
        {muted ? label : <>{active ? "~/" : "├─ "}{label}</>}
      </Link>
      {desc && (
        <p className="ml-5 text-[11px] leading-snug text-fg-light">{desc}</p>
      )}
    </div>
  );
}

function FeaturedCard({
  href,
  type,
  title,
  description,
  cta,
}: {
  href: string;
  type: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="panel group flex flex-col px-5 py-5 no-underline transition-colors hover:border-accent-muted hover:bg-bg-panel-hover/40"
    >
      <span className="inline-flex self-start rounded border border-accent/20 bg-accent-light/30 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
        {type}
      </span>
      <h3 className="mt-3 font-sans text-[17px] font-semibold leading-tight tracking-[-0.01em] text-fg transition-colors group-hover:text-accent">
        {title}
      </h3>
      <p className="mt-2.5 flex-1 text-[13px] leading-[1.65] text-fg-muted">
        {description}
      </p>
      <p className="mt-5 font-mono text-[11px] font-medium text-accent">{cta} &rarr;</p>
    </Link>
  );
}
