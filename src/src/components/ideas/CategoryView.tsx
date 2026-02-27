"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Panel } from "@/components/Panel";
import { getRenderedPost } from "@/lib/actions";
import type { Category } from "@/lib/categories";
import type { PostMeta } from "./IdeasView";

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

function Breadcrumb({
  category,
  consuming = false,
}: {
  category: Category;
  consuming?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 font-mono text-[11px] text-fg-light">
      <Link href="/" className="hover:text-accent transition-colors">
        ~/blake.thomson
      </Link>
      <span className="text-border">/</span>
      <Link href="/ideas" className="hover:text-accent transition-colors">
        ideas
      </Link>
      <span className="text-border">/</span>
      <span className={consuming ? "text-fg-muted" : "text-accent"}>
        {category.shortLabel.toLowerCase().replace(/\s+/g, "-")}
      </span>
    </div>
  );
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

export function CategoryView({
  category,
  posts,
  consuming = false,
}: {
  category: Category;
  posts: PostMeta[];
  consuming?: boolean;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [renderedPost, setRenderedPost] = useState<RenderedPost | null>(null);
  const [isPending, startTransition] = useTransition();
  const paneRef = useRef<HTMLDivElement>(null);
  const cache = useRef<Map<string, RenderedPost>>(new Map());

  const paneOpen = selectedSlug !== null;

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
    [selectedSlug]
  );

  const handleClose = useCallback(() => {
    setSelectedSlug(null);
  }, []);

  const selectedMeta = selectedSlug
    ? posts.find((p) => p.slug === selectedSlug)
    : null;

  return (
    <div className="flex flex-col gap-4 pb-5 pt-5">
      {/* ─── Breadcrumb bar ─── */}
      <div className="mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
        <Breadcrumb category={category} consuming={consuming} />
      </div>

      {/* ─── Header ─── */}
      <Panel>
        <div className="flex items-start justify-between gap-4">
          <p className="label-mono">
            {consuming ? "in my feed" : "the quick download"}
          </p>
          <Link
            href="/ideas"
            className="font-mono text-[11px] text-fg-light no-underline hover:text-accent transition-colors"
          >
            ← all topics
          </Link>
        </div>
        <h1 className="mt-2 font-serif text-2xl md:text-3xl leading-snug">
          {category.label}
        </h1>
        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-fg-muted">
          {category.quickDownload}
        </p>
        <p className="mt-3 font-mono text-[11px] text-fg-light">
          {posts.length} {consuming ? "item" : "post"}
          {posts.length !== 1 ? "s" : ""}
        </p>
      </Panel>

      {/* ─── Main layout ─── */}
      <div className="ideas-layout mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
        <div className="ideas-main" data-shifted={paneOpen}>
          <div className="flex flex-1 flex-col gap-4 min-w-0">
            {posts.length === 0 ? (
              <div className="panel px-5 py-12 text-center">
                <p className="font-mono text-[12px] text-fg-light">
                  First post coming soon.
                </p>
              </div>
            ) : consuming ? (
              /* Consuming: card grid layout */
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {posts.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/ideas/${item.slug}`}
                    className="panel px-4 py-4 no-underline transition-colors hover:border-accent-muted"
                  >
                    <h3 className="font-sans text-[14px] font-medium text-fg leading-snug">
                      {item.title}
                    </h3>
                    {item.podcast && (
                      <p className="mt-2 font-mono text-[11px] text-fg-light">
                        {item.podcast.split(" - ")[0].replace(" Podcast", "")}
                      </p>
                    )}
                    {!item.podcast && item.excerpt && (
                      <p className="mt-1.5 line-clamp-2 text-[12px] text-fg-muted">
                        {item.excerpt}
                      </p>
                    )}
                    <p className="mt-3 font-mono text-[11px] text-fg-light">
                      {item.readTime} &middot; {item.date}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              /* Articles: list with preview pane */
              <div className="panel divide-y divide-border-light px-5 py-1 md:px-6">
                {posts.map((post) => (
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
                        <span>&middot;</span>
                        <span>{post.date}</span>
                      </span>
                    </div>
                    <PreviewButton
                      onClick={(e) => handlePreview(post.slug, e)}
                      active={selectedSlug === post.slug}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Detail pane ─── */}
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
                <span>{category.shortLabel}</span>
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
