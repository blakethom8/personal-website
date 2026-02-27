"use client";

import Link from "next/link";
import { Panel } from "@/components/Panel";
import { CATEGORIES, CONSUMING_CATEGORY } from "@/lib/categories";

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

function shortPodcastName(podcast: string): string {
  const beforeDash = podcast.split(" - ")[0];
  return beforeDash.replace(" Podcast", "");
}

export function IdeasView({ posts }: { posts: PostMeta[] }) {
  const articles = posts.filter((p) => p.category !== "podcast-notes");
  const consuming = posts.filter((p) => p.category === "podcast-notes");

  const articlesByCategory = CATEGORIES.reduce<Record<string, PostMeta[]>>(
    (acc, cat) => {
      acc[cat.id] = articles.filter((p) => p.category === cat.id);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-4 pb-5 pt-5">
      {/* ─── Header ─── */}
      <Panel>
        <p className="label-mono mb-2">ideas</p>
        <h1 className="font-serif text-2xl md:text-3xl">Ideas & Writing</h1>
        <p className="mt-3 max-w-2xl text-fg-muted">
          A collective exploration of agents, applications, healthcare data, and
          whatever else is on my mind. Pick a topic below or browse everything.
        </p>
      </Panel>

      {/* ─── Category cards ─── */}
      <div className="mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => {
            const count = articlesByCategory[cat.id]?.length ?? 0;
            return (
              <Link
                key={cat.id}
                href={`/ideas/${cat.id}`}
                className="panel px-5 py-5 no-underline transition-colors hover:border-accent-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {count > 0 ? (
                    <span className="font-mono text-[10px] text-fg-light">
                      {count} post{count !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="rounded border border-border-light px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
                      coming soon
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-serif text-[15px] leading-snug text-fg md:text-[16px]">
                  {cat.label}
                </h2>
                <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-fg-muted">
                  {cat.quickDownload}
                </p>
                <p className="mt-3 font-mono text-[11px] text-accent">
                  explore →
                </p>
              </Link>
            );
          })}

          {/* 6th card — In My Feed */}
          <Link
            href={`/ideas/${CONSUMING_CATEGORY.id}`}
            className="panel px-5 py-5 no-underline transition-colors hover:border-accent-muted"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-accent">06</span>
              <span className="font-mono text-[10px] text-fg-light">
                {consuming.length} item{consuming.length !== 1 ? "s" : ""}
              </span>
            </div>
            <h2 className="mt-2 font-serif text-[15px] leading-snug text-fg md:text-[16px]">
              {CONSUMING_CATEGORY.label}
            </h2>
            <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-fg-muted">
              {CONSUMING_CATEGORY.quickDownload}
            </p>
            <p className="mt-3 font-mono text-[11px] text-accent">browse →</p>
          </Link>
        </div>
      </div>

      {/* ─── Full catalogue ─── */}
      <div className="mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
        <div className="flex items-baseline justify-between mb-3 px-1">
          <p className="label-mono">full catalogue</p>
          <span className="font-mono text-[11px] text-fg-light">
            {articles.length} posts
          </span>
        </div>
        <div className="panel divide-y divide-border-light px-5 py-1 md:px-6">
          {articles.map((post) => {
            const cat = CATEGORIES.find((c) => c.id === post.category);
            return (
              <Link
                key={post.slug}
                href={`/ideas/${post.slug}`}
                className="flex flex-col gap-0.5 py-3 no-underline sm:flex-row sm:items-start sm:justify-between sm:gap-6"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-sans text-[14px] font-medium text-fg hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-fg-muted">
                    {post.excerpt}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-fg-light">
                  {cat && <span>{cat.shortLabel}</span>}
                  {cat && <span>&middot;</span>}
                  <span>{post.readTime}</span>
                  <span>&middot;</span>
                  <span>{post.date}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
