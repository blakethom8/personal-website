"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Panel } from "@/components/Panel";
import { getRenderedPost } from "@/lib/actions";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  category: string;
  featured: boolean;
  tags?: string[];
  podcast?: string;
}

interface RenderedPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  category: string;
  tags: string[];
  contentHtml: string;
}

const CATEGORY_ORDER = [
  "the-shifting-model",
  "technology",
  "healthcare-and-data",
  "the-future-of-applications",
  "the-terminal-and-the-agent",
];

const CATEGORY_LABELS: Record<string, string> = {
  "the-shifting-model": "The Shifting Model",
  "technology": "Technology",
  "healthcare-and-data": "Healthcare & Data",
  "the-future-of-applications": "The Future of Applications",
  "the-terminal-and-the-agent": "The Terminal & The Agent",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "the-shifting-model":
    "How AI-accelerated development is collapsing the cost of bespoke software — and what that means for SaaS.",
  "technology":
    "Building for the AI-native web. Browser apps, WebMCP, and the infrastructure that's emerging.",
  "healthcare-and-data":
    "Entity resolution, claims data, provider matching — making sense of healthcare's messiest datasets.",
  "the-future-of-applications":
    "Why the future isn't more apps — it's AI as the glue between the ones we already have.",
  "the-terminal-and-the-agent":
    "What happens when your development tools get a brain. Agents, terminals, and the new workflow.",
};

function shortPodcastName(podcast: string): string {
  const beforeDash = podcast.split(" - ")[0];
  return beforeDash.replace(" Podcast", "");
}

function PreviewButton({
  onClick,
  active,
}: {
  onClick: (e: React.MouseEvent) => void;
  active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-[11px] transition-colors ${
        active
          ? "bg-accent-light text-accent"
          : "text-fg-light hover:bg-bg-panel-hover hover:text-accent"
      }`}
      aria-label="Preview in side pane"
      title="Preview"
    >
      ◧
    </button>
  );
}

export function IdeasView({ posts }: { posts: PostMeta[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [renderedPost, setRenderedPost] = useState<RenderedPost | null>(null);
  const [isPending, startTransition] = useTransition();
  const paneRef = useRef<HTMLDivElement>(null);
  const cache = useRef<Map<string, RenderedPost>>(new Map());

  const paneOpen = selectedSlug !== null;

  // Split posts into articles and podcasts
  const articles = posts.filter((p) => p.category !== "podcast-notes");
  const podcasts = posts.filter((p) => p.category === "podcast-notes");

  // Categories in defined order, filtered to only those with posts
  const postCategories = new Set(articles.map((p) => p.category));
  const categories = CATEGORY_ORDER.filter((cat) => postCategories.has(cat));

  // Filter articles by active category
  const filteredArticles = activeCategory
    ? articles.filter((p) => p.category === activeCategory)
    : articles;

  const featured = articles.find((p) => p.featured);
  const displayArticles = activeCategory
    ? filteredArticles
    : articles.filter((p) => !p.featured);

  useEffect(() => {
    if (paneRef.current && selectedSlug) {
      paneRef.current.scrollTop = 0;
    }
  }, [selectedSlug]);

  const handlePreview = useCallback(
    (slug: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (selectedSlug === slug) {
        setSelectedSlug(null);
        return;
      }

      setSelectedSlug(slug);

      const cached = cache.current.get(slug);
      if (cached) {
        setRenderedPost(cached);
        return;
      }

      setRenderedPost(null);
      startTransition(async () => {
        const result = await getRenderedPost(slug);
        if (result) {
          cache.current.set(slug, result);
          setRenderedPost(result);
        }
      });
    },
    [selectedSlug],
  );

  const handleClose = useCallback(() => {
    setSelectedSlug(null);
  }, []);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  };

  const selectedMeta = selectedSlug
    ? posts.find((p) => p.slug === selectedSlug)
    : null;

  return (
    <div className="flex flex-col gap-4 pb-5 pt-5">
      {/* ─── Header Panel ─── */}
      <Panel>
        <p className="label-mono mb-2">ideas</p>
        <h1 className="font-serif text-2xl md:text-3xl">Topics on my mind</h1>
        <p className="mt-3 max-w-xl text-fg-muted">
          Technology is moving fast. This is where I consolidate my thinking —
          how it impacts products, business, and the way we build.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[12px] transition-colors ${
                activeCategory === cat
                  ? "border-accent bg-accent-light text-accent"
                  : "border-border-light bg-bg-panel-hover text-fg-muted hover:border-accent-muted hover:text-accent"
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </Panel>

      {/* ─── Main layout with side pane ─── */}
      <div className="ideas-layout mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
        <div className="ideas-main" data-shifted={paneOpen}>
          <div className="flex flex-1 flex-col gap-4 min-w-0">
            {/* ── Articles section ── */}
            {activeCategory ? (
              /* Category selected: topic info card + filtered articles */
              <div className="flex flex-col gap-4 md:flex-row">
                {/* Topic info card */}
                <div className="panel px-5 py-5 md:w-[35%] shrink-0 self-start">
                  <p className="label-mono mb-2">active topic</p>
                  <h2 className="font-serif text-lg md:text-xl">
                    {CATEGORY_LABELS[activeCategory]}
                  </h2>
                  <p className="mt-1 font-mono text-[12px] text-fg-light">
                    {filteredArticles.length} article
                    {filteredArticles.length !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
                    {CATEGORY_DESCRIPTIONS[activeCategory]}
                  </p>
                </div>

                {/* Filtered articles */}
                <div className="panel flex-1 min-w-0 divide-y divide-border-light px-5 py-1 md:px-6">
                  {filteredArticles.map((post) => (
                    <div
                      key={post.slug}
                      className={`flex items-start gap-3 py-3 transition-colors ${
                        selectedSlug === post.slug
                          ? "border-l-2 border-accent -ml-5 pl-[18px] md:-ml-6 md:pl-[22px]"
                          : ""
                      }`}
                    >
                      <div className="flex flex-1 min-w-0 flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-sans text-[14px] font-medium">
                            <Link
                              href={`/ideas/${post.slug}`}
                              className={`no-underline transition-colors ${
                                selectedSlug === post.slug
                                  ? "text-accent"
                                  : "text-fg hover:text-accent"
                              }`}
                            >
                              {post.title}
                            </Link>
                          </h3>
                          {!paneOpen && (
                            <p className="mt-0.5 line-clamp-2 text-[13px] text-fg-muted">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                        <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-fg-light">
                          <span>{post.readTime}</span>
                        </span>
                      </div>
                      <PreviewButton
                        onClick={(e) => handlePreview(post.slug, e)}
                        active={selectedSlug === post.slug}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* No category selected: featured card + all articles */
              <>
                {featured && (
                  <article
                    className={`panel px-5 py-5 transition-colors md:px-6 ${
                      selectedSlug === featured.slug
                        ? "border-accent"
                        : "hover:border-accent-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-fg-light">
                        <span className="uppercase tracking-wider text-accent">
                          featured
                        </span>
                        <span>&middot;</span>
                        <span>
                          {CATEGORY_LABELS[featured.category] ||
                            featured.category}
                        </span>
                        <span>&middot;</span>
                        <span>{featured.readTime}</span>
                      </div>
                      <PreviewButton
                        onClick={(e) => handlePreview(featured.slug, e)}
                        active={selectedSlug === featured.slug}
                      />
                    </div>
                    <h2 className="mt-2 font-serif text-lg md:text-xl">
                      <Link
                        href={`/ideas/${featured.slug}`}
                        className="text-fg no-underline hover:text-accent"
                      >
                        {featured.title}
                      </Link>
                    </h2>
                    {!paneOpen && (
                      <p className="mt-2 max-w-[68ch] text-[13px] leading-relaxed text-fg-muted">
                        {featured.excerpt}
                      </p>
                    )}
                    <p className="mt-2 font-mono text-[11px] text-fg-light">
                      {featured.date}
                    </p>
                  </article>
                )}

                <div className="panel divide-y divide-border-light px-5 py-1 md:px-6">
                  {displayArticles.map((post) => (
                    <div
                      key={post.slug}
                      className={`flex items-start gap-3 py-3 transition-colors ${
                        selectedSlug === post.slug
                          ? "border-l-2 border-accent -ml-5 pl-[18px] md:-ml-6 md:pl-[22px]"
                          : ""
                      }`}
                    >
                      <div className="flex flex-1 min-w-0 flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-sans text-[14px] font-medium">
                            <Link
                              href={`/ideas/${post.slug}`}
                              className={`no-underline transition-colors ${
                                selectedSlug === post.slug
                                  ? "text-accent"
                                  : "text-fg hover:text-accent"
                              }`}
                            >
                              {post.title}
                            </Link>
                          </h3>
                          {!paneOpen && (
                            <p className="mt-0.5 line-clamp-2 text-[13px] text-fg-muted">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                        <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-fg-light">
                          <span>
                            {CATEGORY_LABELS[post.category] || post.category}
                          </span>
                          <span>&middot;</span>
                          <span>{post.readTime}</span>
                        </span>
                      </div>
                      <PreviewButton
                        onClick={(e) => handlePreview(post.slug, e)}
                        active={selectedSlug === post.slug}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Podcast section ── */}
            <div>
              <p className="label-mono mb-3 px-1">podcast notes</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {podcasts.map((pod) => (
                  <Link
                    key={pod.slug}
                    href={`/ideas/${pod.slug}`}
                    className="panel px-4 py-4 no-underline transition-colors hover:border-accent-muted"
                  >
                    <h3 className="font-sans text-[14px] font-medium text-fg leading-snug">
                      {pod.title}
                    </h3>
                    {pod.podcast && (
                      <p className="mt-2 font-mono text-[11px] text-fg-light">
                        {shortPodcastName(pod.podcast)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Detail pane: slides in from the right ─── */}
        <div className="ideas-pane" data-open={paneOpen}>
          {selectedSlug && (
            <div
              ref={paneRef}
              className="panel sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto px-5 py-5 md:px-6"
            >
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/ideas/${selectedSlug}`}
                  className="font-mono text-[11px] text-accent no-underline hover:underline"
                >
                  open full page →
                </Link>
                <button
                  onClick={handleClose}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-[13px] text-fg-light transition-colors hover:bg-bg-panel-hover hover:text-fg"
                  aria-label="Close detail pane"
                >
                  ✕
                </button>
              </div>

              <h2 className="mt-3 font-serif text-xl md:text-2xl">
                {selectedMeta?.title}
              </h2>

              <div className="mt-2 flex items-center gap-2 font-mono text-[11px] text-fg-light">
                <span>
                  {CATEGORY_LABELS[selectedMeta?.category ?? ""] ||
                    selectedMeta?.category}
                </span>
                <span>&middot;</span>
                <span>{selectedMeta?.readTime}</span>
                <span>&middot;</span>
                <span>{selectedMeta?.date}</span>
              </div>

              {selectedMeta?.tags && selectedMeta.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedMeta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-bg-panel-hover px-2 py-0.5 font-mono text-[10px] text-fg-light"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <hr className="my-4 border-border-light" />

              {isPending ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="ideas-pane-loader" />
                  <span className="font-mono text-[12px] text-fg-light">
                    loading...
                  </span>
                </div>
              ) : renderedPost ? (
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: renderedPost.contentHtml }}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
