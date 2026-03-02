"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { Panel } from "@/components/Panel";
import { CATEGORIES, CONSUMING_CATEGORY } from "@/lib/categories";
import { getRenderedPost, getRenderedCategoryDoc } from "@/lib/actions";
import type { Heading } from "@/lib/headings";

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

interface ArticlePreview {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  headings: Heading[];
}

export function IdeasView({ posts }: { posts: PostMeta[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Article preview state
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [preview, setPreview] = useState<ArticlePreview | null>(null);
  const [isLoadingPreview, startPreviewTransition] = useTransition();
  const previewCache = useRef<Map<string, ArticlePreview>>(new Map());

  // Readme preview state
  const [readmeCategoryId, setReadmeCategoryId] = useState<string | null>(null);
  const [readmeHtml, setReadmeHtml] = useState<string | null>(null);
  const [isLoadingReadme, startReadmeTransition] = useTransition();
  const readmeCache = useRef<Map<string, string>>(new Map());

  const articles = posts.filter((p) => p.category !== "podcast-notes");
  const consuming = posts.filter((p) => p.category === "podcast-notes");

  const countByCategory = Object.fromEntries(
    CATEGORIES.map((cat) => [
      cat.id,
      articles.filter((p) => p.category === cat.id).length,
    ])
  );

  const featured = articles.slice(0, 2);

  const activeCat = activeCategory
    ? [...CATEGORIES, CONSUMING_CATEGORY].find((c) => c.id === activeCategory)
    : null;

  const activePosts = activeCategory
    ? activeCategory === CONSUMING_CATEGORY.id
      ? consuming
      : articles.filter((p) => p.category === activeCategory)
    : [];

  const clearRightPanel = () => {
    setPreviewSlug(null);
    setPreview(null);
    setReadmeCategoryId(null);
    setReadmeHtml(null);
  };

  const toggleCategory = (id: string) => {
    setActiveCategory((prev) => (prev === id ? null : id));
    clearRightPanel();
  };

  const handleArticleClick = (post: PostMeta) => {
    if (previewSlug === post.slug) {
      clearRightPanel();
      return;
    }

    setReadmeCategoryId(null);
    setReadmeHtml(null);
    setPreviewSlug(post.slug);

    const cached = previewCache.current.get(post.slug);
    if (cached) {
      setPreview(cached);
      return;
    }

    setPreview(null);
    startPreviewTransition(async () => {
      const result = await getRenderedPost(post.slug);
      if (result) {
        const data: ArticlePreview = {
          slug: result.slug,
          title: result.title,
          excerpt: result.excerpt,
          readTime: result.readTime,
          date: result.date,
          headings: result.headings,
        };
        previewCache.current.set(post.slug, data);
        setPreview(data);
      }
    });
  };

  const handleReadmeClick = () => {
    if (readmeCategoryId === activeCategory) {
      clearRightPanel();
      return;
    }

    setPreviewSlug(null);
    setPreview(null);
    setReadmeCategoryId(activeCategory);

    const cached = readmeCache.current.get(activeCategory!);
    if (cached) {
      setReadmeHtml(cached);
      return;
    }

    setReadmeHtml(null);
    startReadmeTransition(async () => {
      const result = await getRenderedCategoryDoc(activeCategory!);
      if (result) {
        readmeCache.current.set(activeCategory!, result.contentHtml);
        setReadmeHtml(result.contentHtml);
      }
    });
  };

  // What's shown in the right column
  const showReadme = readmeCategoryId !== null;
  const showArticlePreview = !showReadme && previewSlug !== null;
  const showFeatured = !showReadme && !showArticlePreview;

  return (
    <div className="flex flex-col gap-4 pb-5 pt-5">
      {/* ─── Header ─── */}
      <Panel>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="label-mono mb-2">ideas</p>
            <h1 className="font-serif text-2xl md:text-3xl">Ideas & Writing</h1>
            <p className="mt-3 max-w-2xl text-fg-muted">
              A collective exploration of agents, applications, healthcare data,
              and whatever else is on my mind.
            </p>
          </div>
          <Link
            href="/ideas/catalogue"
            className="shrink-0 pt-1 font-mono text-[12px] text-accent no-underline transition-opacity hover:opacity-70"
          >
            browse all →
          </Link>
        </div>
      </Panel>

      {/* ─── Body ─── */}
      <div className="mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">

          {/* ── Col 1: Topic list ── */}
          <div className="panel shrink-0 overflow-hidden p-0 md:w-[240px]">
            <div className="border-b border-border-light px-5 py-3">
              <p className="label-mono">topics</p>
            </div>

            {CATEGORIES.map((cat, i) => {
              const isActive = activeCategory === cat.id;
              const count = countByCategory[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`group w-full border-b border-border-light px-5 py-3.5 text-left transition-colors ${
                    isActive
                      ? "border-l-2 border-l-accent bg-accent/[0.06]"
                      : "border-l-2 border-l-transparent hover:bg-accent/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`shrink-0 font-mono text-[10px] ${isActive ? "text-accent" : "text-accent/60"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`truncate font-sans text-[13px] font-medium transition-colors ${
                        isActive ? "text-accent" : "text-fg group-hover:text-accent"
                      }`}>
                        {cat.shortLabel}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-fg-light">
                      {count > 0 ? count : "—"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 pl-[1.375rem] text-[11px] leading-relaxed text-fg-light">
                    {cat.quickDownload}
                  </p>
                </button>
              );
            })}

            <button
              onClick={() => toggleCategory(CONSUMING_CATEGORY.id)}
              className={`group w-full px-5 py-3.5 text-left transition-colors ${
                activeCategory === CONSUMING_CATEGORY.id
                  ? "border-l-2 border-l-accent bg-accent/[0.06]"
                  : "border-l-2 border-l-transparent hover:bg-accent/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`shrink-0 font-mono text-[10px] ${
                    activeCategory === CONSUMING_CATEGORY.id ? "text-accent" : "text-accent/60"
                  }`}>
                    {String(CATEGORIES.length + 1).padStart(2, "0")}
                  </span>
                  <span className={`truncate font-sans text-[13px] font-medium transition-colors ${
                    activeCategory === CONSUMING_CATEGORY.id ? "text-accent" : "text-fg group-hover:text-accent"
                  }`}>
                    {CONSUMING_CATEGORY.shortLabel}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-fg-light">
                  {consuming.length > 0 ? consuming.length : "—"}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 pl-[1.375rem] text-[11px] leading-relaxed text-fg-light">
                {CONSUMING_CATEGORY.quickDownload}
              </p>
            </button>
          </div>

          {/* ── Col 2 (mobile): topic posts below list ── */}
          {activeCategory && activePosts.length > 0 && (
            <div className="panel overflow-hidden p-0 md:hidden">
              <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
                <p className="label-mono text-accent">{activeCat?.shortLabel}</p>
                <button onClick={() => toggleCategory(activeCategory)} className="font-mono text-[11px] text-fg-light hover:text-accent">
                  close ×
                </button>
              </div>
              {/* Readme entry (mobile) */}
              <button
                onClick={handleReadmeClick}
                className={`group w-full border-b border-border-light px-5 py-3 text-left transition-colors hover:bg-accent/[0.04] ${
                  readmeCategoryId === activeCategory ? "border-l-2 border-l-accent bg-accent/[0.06]" : ""
                }`}
              >
                <span className={`block font-sans text-[13px] leading-snug transition-colors group-hover:text-accent ${
                  readmeCategoryId === activeCategory ? "text-accent" : "text-fg-muted"
                }`}>
                  about this topic
                </span>
                <span className="font-mono text-[10px] text-fg-light">overview →</span>
              </button>
              {activePosts.map((post, i) => (
                <button
                  key={post.slug}
                  onClick={() => handleArticleClick(post)}
                  className={`group w-full border-b border-border-light px-5 py-3 text-left last:border-b-0 transition-colors hover:bg-accent/[0.04] ${
                    previewSlug === post.slug ? "bg-accent/[0.06] border-l-2 border-l-accent" : ""
                  } ${i % 2 === 1 ? "bg-bg-panel-hover/40" : ""}`}
                >
                  <span className="block font-sans text-[13px] text-fg transition-colors group-hover:text-accent leading-snug">
                    {post.title}
                  </span>
                  <span className="font-mono text-[10px] text-fg-light">{post.date}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Col 2 (desktop): sliding middle panel ── */}
          <div
            className="hidden shrink-0 overflow-hidden transition-[width,opacity] duration-500 ease-out md:block"
            style={{
              width: activeCategory ? "300px" : "0px",
              opacity: activeCategory ? 1 : 0,
            }}
          >
            <div
              className="w-[300px] transition-transform duration-500 ease-out"
              style={{ transform: activeCategory ? "translateX(0)" : "translateX(-16px)" }}
            >
              <div className="panel overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
                  <p className="label-mono text-accent">{activeCat?.shortLabel}</p>
                  <button
                    onClick={() => toggleCategory(activeCategory!)}
                    className="font-mono text-[11px] text-fg-light transition-colors hover:text-accent"
                  >
                    close ×
                  </button>
                </div>

                {/* Readme entry */}
                <button
                  onClick={handleReadmeClick}
                  className={`group w-full border-b border-border-light px-5 py-3 text-left transition-colors hover:bg-accent/[0.04] ${
                    readmeCategoryId === activeCategory
                      ? "border-l-2 border-l-accent bg-accent/[0.06]"
                      : "border-l-2 border-l-transparent"
                  }`}
                >
                  <span className={`block font-sans text-[13px] leading-snug transition-colors group-hover:text-accent ${
                    readmeCategoryId === activeCategory ? "text-accent" : "text-fg-muted"
                  }`}>
                    about this topic
                  </span>
                  <span className="font-mono text-[10px] text-fg-light">overview →</span>
                </button>

                {activePosts.length > 0 ? (
                  activePosts.map((post, i) => (
                    <button
                      key={post.slug}
                      onClick={() => handleArticleClick(post)}
                      className={`group w-full border-b border-border-light px-5 py-3 text-left last:border-b-0 transition-colors hover:bg-accent/[0.04] ${
                        previewSlug === post.slug
                          ? "border-l-2 border-l-accent bg-accent/[0.06]"
                          : "border-l-2 border-l-transparent"
                      } ${i % 2 === 1 ? "bg-bg-panel-hover/40" : ""}`}
                    >
                      <span className={`block font-sans text-[13px] leading-snug transition-colors group-hover:text-accent ${
                        previewSlug === post.slug ? "text-accent" : "text-fg"
                      }`}>
                        {post.title}
                      </span>
                      <span className="font-mono text-[10px] text-fg-light">{post.date}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="font-mono text-[11px] text-fg-light">coming soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Col 3: readme / article preview / featured ── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">

            {/* ── Readme preview ── */}
            {showReadme && (
              <div className="panel overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
                  <button
                    onClick={clearRightPanel}
                    className="font-mono text-[11px] text-fg-light transition-colors hover:text-accent"
                  >
                    ← back
                  </button>
                  <p className="label-mono text-accent">{activeCat?.shortLabel}</p>
                </div>

                {isLoadingReadme || !readmeHtml ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="ideas-pane-loader" />
                  </div>
                ) : (
                  <div className="px-6 py-5">
                    <h2 className="font-serif text-xl leading-snug text-fg">
                      {activeCat?.label}
                    </h2>
                    <hr className="my-4 border-border-light" />
                    <div
                      className="post-content"
                      dangerouslySetInnerHTML={{ __html: readmeHtml }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Article preview ── */}
            {showArticlePreview && (
              <div className="panel overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
                  <button
                    onClick={clearRightPanel}
                    className="font-mono text-[11px] text-fg-light transition-colors hover:text-accent"
                  >
                    ← back
                  </button>
                  <Link
                    href={`/ideas/${previewSlug}`}
                    className="font-mono text-[11px] text-accent no-underline transition-opacity hover:opacity-70"
                  >
                    open article →
                  </Link>
                </div>

                {isLoadingPreview || !preview ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="ideas-pane-loader" />
                  </div>
                ) : (
                  <div className="px-6 py-5">
                    <p className="label-mono mb-2">
                      {activeCat?.shortLabel ?? "featured"}
                    </p>
                    <h2 className="font-serif text-xl leading-snug text-fg">
                      {preview.title}
                    </h2>
                    <p className="mt-1 font-mono text-[11px] text-fg-light">
                      {preview.readTime} · {preview.date}
                    </p>

                    {preview.excerpt && (
                      <p className="mt-4 text-[13px] leading-relaxed text-fg-muted">
                        {preview.excerpt}
                      </p>
                    )}

                    {preview.headings.length > 0 && (
                      <>
                        <hr className="my-4 border-border-light" />
                        <p className="label-mono mb-2">contents</p>
                        <nav>
                          <ul className="flex flex-col gap-0.5">
                            {preview.headings.map((h) => (
                              <li key={h.id}>
                                <Link
                                  href={`/ideas/${previewSlug}#${h.id}`}
                                  className={`block rounded px-2 py-1 font-sans no-underline transition-colors hover:bg-bg-panel-hover hover:text-accent ${
                                    h.level === 3
                                      ? "pl-5 text-[11px] text-fg-light"
                                      : "text-[12px] text-fg-muted"
                                  }`}
                                >
                                  {h.text}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </nav>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Featured posts (default) ── */}
            {showFeatured && (
              <div className={`flex flex-col gap-4 transition-opacity duration-500 ${
                activeCategory ? "opacity-50" : "opacity-100"
              }`}>
                {featured.map((post) => {
                  const cat = CATEGORIES.find((c) => c.id === post.category);
                  return (
                    <Link
                      key={post.slug}
                      href={`/ideas/${post.slug}`}
                      className="panel group px-6 py-5 no-underline transition-colors hover:border-accent-muted"
                    >
                      <div className="mb-2.5 flex items-center justify-between gap-4">
                        <p className="label-mono">{cat?.shortLabel ?? "featured"}</p>
                        <span className="shrink-0 font-mono text-[11px] text-fg-light">
                          {post.readTime} · {post.date}
                        </span>
                      </div>
                      <h2 className="font-serif text-[17px] leading-snug text-fg transition-colors group-hover:text-accent">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-fg-muted">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="mt-3 font-mono text-[11px] text-accent">read →</p>
                    </Link>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
