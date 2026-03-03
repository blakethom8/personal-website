"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Panel } from "@/components/Panel";
import { CATEGORIES, CONSUMING_CATEGORY } from "@/lib/categories";
import type { PostMeta } from "./IdeasView";

const ALL_CATEGORIES = [
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.shortLabel })),
  { id: "podcast-notes", label: CONSUMING_CATEGORY.shortLabel },
];

function getType(post: PostMeta): "article" | "podcast" {
  return post.source ? "podcast" : "article";
}

export function CatalogueView({ posts }: { posts: PostMeta[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"all" | "article" | "podcast">("all");

  const filtered = useMemo(() => {
    let results = posts;

    if (activeCategory) {
      results = results.filter((p) => p.category === activeCategory);
    }

    if (activeType !== "all") {
      results = results.filter((p) => getType(p) === activeType);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return results;
  }, [posts, search, activeCategory, activeType]);

  const clearAll = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveType("all");
  };

  const hasFilters = search || activeCategory || activeType !== "all";

  return (
    <div className="flex flex-col gap-4 pb-5 pt-5">
      {/* Header */}
      <Panel>
        <div className="flex items-start justify-between gap-4">
          <p className="label-mono">full catalogue</p>
          <Link
            href="/ideas"
            className="font-mono text-[11px] text-fg-light no-underline hover:text-accent transition-colors"
          >
            ← back to ideas
          </Link>
        </div>
        <h1 className="mt-2 font-serif text-2xl md:text-3xl">Full Catalogue</h1>
        <p className="mt-2 font-mono text-[12px] text-fg-light">
          {posts.length} total · {posts.filter((p) => !p.source).length} articles ·{" "}
          {posts.filter((p) => p.source).length} podcasts
        </p>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search by title, keyword, or tag..."
            className="w-full rounded border border-border-light bg-bg-panel-hover px-4 py-2.5 font-mono text-[13px] text-fg placeholder:text-fg-light/50 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light">
              type:
            </span>
            {(["all", "article", "podcast"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`rounded-full border px-3 py-0.5 font-mono text-[11px] transition-colors ${
                  activeType === t
                    ? "border-accent bg-accent-light text-accent"
                    : "border-border-light text-fg-light hover:border-accent-muted hover:text-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light">
              topic:
            </span>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setActiveCategory((prev) => (prev === cat.id ? null : cat.id))
                }
                className={`rounded-full border px-3 py-0.5 font-mono text-[11px] transition-colors ${
                  activeCategory === cat.id
                    ? "border-accent bg-accent-light text-accent"
                    : "border-border-light text-fg-light hover:border-accent-muted hover:text-accent"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {hasFilters && (
          <div className="mt-2.5 flex items-center gap-3">
            <span className="font-mono text-[11px] text-fg-muted">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearAll}
              className="font-mono text-[11px] text-accent hover:opacity-70 transition-opacity"
            >
              clear ×
            </button>
          </div>
        )}
      </Panel>

      {/* Table */}
      <div className="mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
        {filtered.length === 0 ? (
          <div className="panel px-5 py-12 text-center">
            <p className="font-mono text-[12px] text-fg-light">No posts match your filters.</p>
            <button
              onClick={clearAll}
              className="mt-2 font-mono text-[11px] text-accent hover:opacity-70"
            >
              clear filters
            </button>
          </div>
        ) : (
          <div className="panel overflow-hidden p-0">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border bg-bg-panel-hover px-5 py-2 md:grid-cols-[1fr_9rem_4.5rem]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light">
                title
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-wider text-fg-light md:block">
                topic
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light text-right">
                date
              </span>
            </div>

            {/* Rows */}
            {filtered.map((post, i) => {
              const cat = [...CATEGORIES, CONSUMING_CATEGORY].find(
                (c) => c.id === post.category
              );
              const type = getType(post);

              return (
                <Link
                  key={post.slug}
                  href={`/ideas/${post.slug}`}
                  className={`grid grid-cols-[1fr_auto] gap-x-4 border-b border-border-light px-5 py-3 no-underline transition-colors hover:bg-accent/[0.04] group md:grid-cols-[1fr_9rem_4.5rem] ${
                    i % 2 === 0 ? "" : "bg-bg-panel-hover/40"
                  }`}
                >
                  {/* Title + excerpt */}
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] text-fg-light/50 shrink-0">
                        {type === "podcast" ? "🎙" : "✎"}
                      </span>
                      <span className="truncate font-sans text-[13px] font-medium text-fg group-hover:text-accent transition-colors">
                        {post.title}
                      </span>
                    </div>
                    {post.excerpt && (
                      <p className="mt-0.5 line-clamp-1 pl-5 font-sans text-[11px] leading-relaxed text-fg-light/70">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Topic */}
                  <span className="hidden self-center font-mono text-[11px] text-fg-light md:block">
                    {cat?.shortLabel ?? "—"}
                  </span>

                  {/* Date */}
                  <span className="self-center text-right font-mono text-[11px] text-fg-light">
                    {post.date
                      ? new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
