import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { backgrounds } from "@/lib/backgrounds";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Writing on technology, healthcare, AI, and building.",
};

const posts = [
  {
    slug: "bespoke-ai-model",
    title: "The Bespoke AI Model: Why We Build Inside Your Walls",
    excerpt:
      "The old world of software consulting looked like this: a vendor builds a product over months, hosts it on their servers, and sells subscriptions. The new world is fundamentally different.",
    category: "business",
    readTime: "10 min",
    date: "Feb 25, 2026",
    featured: true,
  },
  {
    slug: "webmcp-overview",
    title: "WebMCP: Making Websites AI-Native",
    excerpt:
      "A new browser API that lets websites expose their functionality directly to AI agents. Every page becomes a set of tools, not just content to scrape.",
    category: "technology",
    readTime: "8 min",
    date: "Feb 20, 2026",
    featured: false,
  },
  {
    slug: "entity-resolution-healthcare",
    title: "Entity Resolution in Healthcare: The Matching Problem",
    excerpt:
      "How do you know that Dr. Smith at 123 Main St in your claims data is the same Dr. Smith listed on Google? The answer is harder than you think.",
    category: "healthcare",
    readTime: "12 min",
    date: "Feb 15, 2026",
    featured: false,
  },
  {
    slug: "old-model-new-model",
    title: "Old Model vs. New Model: How AI Changed the Software Business",
    excerpt:
      "AI-accelerated development means a skilled team can build a production-quality application in days rather than months. But the bottleneck was never the code.",
    category: "business",
    readTime: "6 min",
    date: "Feb 10, 2026",
    featured: false,
  },
];

const categories = ["all", "technology", "business", "healthcare", "building", "personal"];

export default function IdeasPage() {
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <>
      <PageBackground src={backgrounds.ideas} alt="Coastal fog over the ocean" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        {/* Header */}
        <Panel>
          <p className="label-mono mb-2">ideas</p>
          <h1 className="font-serif text-2xl md:text-3xl">
            Thinking out loud.
          </h1>
          <p className="mt-3 max-w-xl text-fg-muted">
            Writing on technology, healthcare, AI, and building things that
            matter. Part technical deep-dive, part business strategy, part
            learning in public.
          </p>
        </Panel>

        {/* Main content: sidebar + posts */}
        <div className="mx-auto flex w-[calc(100%-2*16px)] max-w-[1200px] flex-col gap-4 md:w-[calc(100%-2*40px)] md:flex-row">
          {/* Sidebar */}
          <aside className="panel w-full shrink-0 self-start px-4 py-4 md:w-[180px]">
            <p className="label-mono mb-2">categories</p>
            <div className="flex flex-row flex-wrap gap-1 md:flex-col md:gap-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`rounded px-2 py-1 text-left font-mono text-[12px] capitalize transition-colors hover:text-accent md:rounded-none md:px-0 ${
                    cat === "all"
                      ? "text-accent"
                      : "text-fg-muted"
                  }`}
                >
                  {cat === "all" ? "> all" : `  ${cat}`}
                </button>
              ))}
            </div>
          </aside>

          {/* Post list */}
          <div className="flex flex-1 flex-col gap-4">
            {/* Featured post */}
            {featured && (
              <article className="panel px-5 py-5 transition-colors hover:border-accent-muted md:px-6">
                <div className="flex items-center gap-2 font-mono text-[11px] text-fg-light">
                  <span className="uppercase tracking-wider text-accent">
                    featured
                  </span>
                  <span>&middot;</span>
                  <span>{featured.category}</span>
                  <span>&middot;</span>
                  <span>{featured.readTime}</span>
                </div>
                <h2 className="mt-2 font-serif text-lg md:text-xl">
                  <Link
                    href={`/ideas/${featured.slug}`}
                    className="text-fg no-underline hover:text-accent"
                  >
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-2 max-w-[68ch] text-[13px] leading-relaxed text-fg-muted">
                  {featured.excerpt}
                </p>
                <p className="mt-2 font-mono text-[11px] text-fg-light">{featured.date}</p>
              </article>
            )}

            {/* Rest of posts */}
            <div className="panel divide-y divide-border-light px-5 py-1 md:px-6">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/ideas/${post.slug}`}
                  className="flex flex-col gap-0.5 py-3 no-underline hover:no-underline sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                >
                  <div className="flex-1">
                    <h3 className="font-sans text-[14px] font-medium text-fg hover:text-accent">
                      {post.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-fg-muted">
                      {post.excerpt}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-fg-light">
                    <span>{post.category}</span>
                    <span>&middot;</span>
                    <span>{post.readTime}</span>
                    <span>&middot;</span>
                    <span>{post.date}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
