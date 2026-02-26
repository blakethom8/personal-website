"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
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
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [renderedPost, setRenderedPost] = useState<RenderedPost | null>(null);
  const [isPending, startTransition] = useTransition();
  const paneRef = useRef<HTMLDivElement>(null);
  const cache = useRef<Map<string, RenderedPost>>(new Map());

  const paneOpen = selectedSlug !== null;
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  // Extract unique categories from actual posts
  const categorySet = new Set(posts.map((p) => p.category));
  const categories = ["all", ...Array.from(categorySet)];

  // Scroll pane to top when switching posts
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

      // Instant switch if already cached
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

  // Get meta for the currently selected post (used while content loads)
  const selectedMeta = selectedSlug
    ? posts.find((p) => p.slug === selectedSlug)
    : null;

  return (
    <div className="ideas-layout mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
      {/* ─── Main area: categories + post list ─── */}
      <div
        className="ideas-main"
        data-shifted={paneOpen}
      >
        {/* Categories sidebar */}
        <aside
          className="ideas-sidebar panel self-start px-4 py-4"
          data-hidden={paneOpen}
        >
          <p className="label-mono mb-2">categories</p>
          <div className="flex flex-row flex-wrap gap-1 md:flex-col md:gap-0">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`rounded px-2 py-1 text-left font-mono text-[12px] capitalize transition-colors hover:text-accent md:rounded-none md:px-0 ${
                  cat === "all" ? "text-accent" : "text-fg-muted"
                }`}
              >
                {cat === "all" ? "> all" : `  ${cat}`}
              </button>
            ))}
          </div>
        </aside>

        {/* Post list */}
        <div className="flex flex-1 flex-col gap-4 min-w-0">
          {/* Featured post */}
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
                  <span>{featured.category}</span>
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

          {/* Rest of posts */}
          <div className="panel divide-y divide-border-light px-5 py-1 md:px-6">
            {rest.map((post) => (
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
                    <span>{post.category}</span>
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
        </div>
      </div>

      {/* ─── Detail pane: slides in from the right ─── */}
      <div
        className="ideas-pane"
        data-open={paneOpen}
      >
        {selectedSlug && (
          <div
            ref={paneRef}
            className="panel sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto px-5 py-5 md:px-6"
          >
            {/* Pane header */}
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

            {/* Title */}
            <h2 className="mt-3 font-serif text-xl md:text-2xl">
              {selectedMeta?.title}
            </h2>

            {/* Meta */}
            <div className="mt-2 flex items-center gap-2 font-mono text-[11px] text-fg-light">
              <span className="capitalize">
                {selectedMeta?.category}
              </span>
              <span>&middot;</span>
              <span>{selectedMeta?.readTime}</span>
              <span>&middot;</span>
              <span>{selectedMeta?.date}</span>
            </div>

            {/* Tags */}
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

            {/* Content */}
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
  );
}
