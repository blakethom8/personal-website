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
        {/* Hero — compact, code-inflected */}
        <Panel className="py-8 md:py-10">
          <p className="label-mono mb-3">
            healthcare &middot; data &middot; ai
          </p>
          <h1 className="font-serif text-2xl leading-tight md:text-3xl lg:text-4xl">
            Building the tools
            <br />
            <span className="text-accent">I wish existed.</span>
          </h1>
          <p className="mt-3 max-w-[750px] text-fg-muted">
            This website is a collective domain of my experience building with
            AI. The world of agents is moving fast, honestly too fast. This is
            my attempt to keep-up, demystify LLMs, and capture topics that me
            and Local Chief are exploring. As overwhelming as it is, the world
            of computers is surprisingly simple. Humans are way more
            interesting and complex.
          </p>
        </Panel>

        {/* Two-column: Directory + Latest */}
        <div className="mx-auto flex w-[calc(100%-2*16px)] max-w-[1200px] flex-col gap-4 md:w-[calc(100%-2*40px)] md:flex-row">
          {/* Site Directory */}
          <div className="panel shrink-0 px-5 py-5 md:w-[240px]">
            <p className="label-mono mb-3">
              site map
            </p>
            <div className="font-mono text-[13px] leading-relaxed text-fg-muted">
              <DirectoryItem href="/" label="index" active />
              <DirectoryItem href="/about" label="about" indent={1}>
                <span className="text-fg-light"> — story</span>
              </DirectoryItem>
              <DirectoryItem href="/work" label="work" indent={1}>
                <span className="text-fg-light"> — projects</span>
              </DirectoryItem>
              <DirectoryItem href="/ideas" label="ideas" indent={1}>
                <span className="text-fg-light"> — writing</span>
              </DirectoryItem>
              <div className="ml-7 border-l border-border-light pl-3 text-fg-light">
                <DirectoryItem href="/ideas/bespoke-ai-model" label="bespoke-ai-model" indent={0} muted />
                <DirectoryItem href="/ideas/webmcp-overview" label="webmcp-overview" indent={0} muted />
                <DirectoryItem href="/ideas/entity-resolution-healthcare" label="entity-resolution" indent={0} muted />
                <DirectoryItem href="/ideas/ai-is-the-glue" label="old-model-new-model" indent={0} muted />
              </div>
              <DirectoryItem href="/learn" label="learn" indent={1}>
                <span className="text-fg-light"> — modules</span>
              </DirectoryItem>
              <DirectoryItem href="/contact" label="contact" indent={1}>
                <span className="text-fg-light"> — reach out</span>
              </DirectoryItem>
            </div>
          </div>

          {/* Latest + Featured stacked */}
          <div className="flex flex-1 flex-col gap-4">
            {/* Latest Ideas */}
            <section className="panel px-5 py-5 md:px-6">
              <div className="flex items-baseline justify-between">
                <p className="label-mono">latest posts</p>
                <Link
                  href="/ideas"
                  className="font-mono text-[11px] text-fg-light no-underline hover:text-accent"
                >
                  all &rarr;
                </Link>
              </div>
              <div className="mt-3 divide-y divide-border-light">
                <PostRow
                  title="The Bespoke AI Model: Why We Build Inside Your Walls"
                  category="business"
                  readTime="10 min"
                  date="Feb 25"
                  href="/ideas/bespoke-ai-model"
                />
                <PostRow
                  title="WebMCP: Making Websites AI-Native"
                  category="technology"
                  readTime="8 min"
                  date="Feb 20"
                  href="/ideas/webmcp-overview"
                />
                <PostRow
                  title="Entity Resolution in Healthcare"
                  category="healthcare"
                  readTime="12 min"
                  date="Feb 15"
                  href="/ideas/entity-resolution-healthcare"
                />
                <PostRow
                  title="Old Model vs. New Model"
                  category="business"
                  readTime="6 min"
                  date="Feb 10"
                  href="/ideas/ai-is-the-glue"
                />
              </div>
            </section>

            {/* Featured Project */}
            <section className="panel px-5 py-5 md:px-6">
              <div className="flex items-baseline justify-between">
                <p className="label-mono">currently building</p>
                <Link
                  href="/work"
                  className="font-mono text-[11px] text-fg-light no-underline hover:text-accent"
                >
                  all &rarr;
                </Link>
              </div>
              <div className="mt-3">
                <h3 className="font-sans text-[15px] font-semibold text-fg">
                  Provider Intelligence Platform
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                  Search and analytics for physician liaisons — 90M+ rows of
                  Medicare claims, Google Places integration, cascading NPI
                  match engine.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {["FastAPI", "React", "DuckDB", "Docker", "CMS Data", "MCP"].map(
                    (tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
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
  children,
}: {
  href: string;
  label: string;
  indent?: number;
  active?: boolean;
  muted?: boolean;
  children?: React.ReactNode;
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
      {children}
    </div>
  );
}

function PostRow({
  title,
  category,
  readTime,
  date,
  href = "/ideas",
}: {
  title: string;
  category: string;
  readTime: string;
  date: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-0.5 py-2.5 no-underline hover:no-underline sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="text-[13px] text-fg hover:text-accent">{title}</span>
      <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-fg-light">
        <span>{category}</span>
        <span>&middot;</span>
        <span>{readTime}</span>
        <span>&middot;</span>
        <span>{date}</span>
      </span>
    </Link>
  );
}
