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

const TYPE_ICONS: Record<string, string> = {
  article: "✎",
  podcast: "🎙",
};

function getType(post: PostMeta): "article" | "podcast" {
  return post.podcast ? "podcast" : "article";
}

function getAllTags(posts: PostMeta[]): string[] {
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags?.forEach((t) => tagSet.add(t)));
  const sorted = Array.from(tagSet).sort();
  return sorted;
}

export function CatalogueView({ posts }: { posts: PostMeta[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"all" | "article" | "podcast">(
    "all"
  );

  const allTags = useMemo(() => getAllTags(posts), [posts]);

  const filtered = useMemo(() => {
    let results = posts;

    if (activeCategory) {
      results = results.filter((p) => p.category === activeCategory);
    }

    if (activeType !== "all") {
      results = results.filter((p) => getType(p) === activeType);
    }

    if (activeTag) {
      results = results.filter((p) => p.tags?.includes(activeTag));
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
  }, [posts, search, activeCategory, activeTag, activeType]);

  const clearAll = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveTag(null);
    setActiveType("all");
  };

  const hasFilters =
    search || activeCategory || activeTag || activeType !== "all";

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
        <h1 className="mt-2 font-serif text-2xl md:text-3xl">
          Full Catalogue
        </h1>
        <p className="mt-2 font-mono text-[12px] text-fg-light">
          {posts.length} total · {posts.filter((p) => !p.podcast).length}{" "}
          articles · {posts.filter((p) => p.podcast).length} podcasts
        </p>

        {/* Search bar */}
        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search by title, keyword, or tag..."
            className="w-full rounded border border-border-light bg-bg-panel-hover px-4 py-2.5 font-mono text-[13px] text-fg placeholder:text-fg-light/50 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Type filter */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light mr-1">
            type:
          </span>
          {(["all", "article", "podcast"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] transition-colors ${
                activeType === t
                  ? "border-accent bg-accent-light text-accent"
                  : "border-border-light text-fg-light hover:border-accent-muted hover:text-accent"
              }`}
            >
              {t === "all" ? "all" : `${TYPE_ICONS[t]} ${t}`}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light mr-1">
            topic:
          </span>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setActiveCategory((prev) =>
                  prev === cat.id ? null : cat.id
                )
              }
              className={`rounded-full border px-3 py-1 font-mono text-[11px] transition-colors ${
                activeCategory === cat.id
                  ? "border-accent bg-accent-light text-accent"
                  : "border-border-light text-fg-light hover:border-accent-muted hover:text-accent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tag filter */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light mr-1">
            tags:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setActiveTag((prev) => (prev === tag ? null : tag))
              }
              className={`rounded px-2 py-0.5 font-mono text-[10px] transition-colors ${
                activeTag === tag
                  ? "bg-accent text-white"
                  : "bg-bg-panel-hover text-fg-light hover:text-accent"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Active filters + clear */}
        {hasFilters && (
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-[11px] text-fg-muted">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearAll}
              className="font-mono text-[11px] text-accent hover:opacity-70 transition-opacity"
            >
              clear all ×
            </button>
          </div>
        )}
      </Panel>

      {/* Results */}
      <div className="mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
        {filtered.length === 0 ? (
          <div className="panel px-5 py-12 text-center">
            <p className="font-mono text-[12px] text-fg-light">
              No posts match your filters.
            </p>
            <button
              onClick={clearAll}
              className="mt-2 font-mono text-[11px] text-accent hover:opacity-70"
            >
              clear filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((post) => {
              const cat = [...CATEGORIES, CONSUMING_CATEGORY].find(
                (c) => c.id === post.category
              );
              const type = getType(post);

              return (
                <Link
                  key={post.slug}
                  href={`/ideas/${post.slug}`}
                  className="panel group flex flex-col gap-2 px-5 py-4 no-underline transition-colors hover:border-accent-muted md:flex-row md:items-start md:gap-5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px]">
                        {type === "podcast" ? "🎙" : "✎"}
                      </span>
                      {cat && (
                        <span className="rounded bg-bg-panel-hover px-2 py-0.5 font-mono text-[10px] text-fg-light">
                          {cat.shortLabel}
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans text-[15px] font-medium text-fg group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-fg-muted">
                      {post.excerpt}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${
                              activeTag === tag
                                ? "bg-accent text-white"
                                : "bg-bg-panel-hover text-fg-light"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-fg-light md:flex-col md:items-end md:gap-1">
                    <span>{post.readTime}</span>
                    <span>{post.date}</span>
                    {post.podcast && (
                      <span className="text-[10px] text-fg-light/60">
                        {post.podcast.split(" - ")[0].replace(" Podcast", "")}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
