"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Heading } from "@/lib/headings";
import type { Category } from "@/lib/categories";

interface ArticlePost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  category: string;
  tags: string[];
}

interface ArticleViewProps {
  post: ArticlePost;
  contentHtml: string;
  headings: Heading[];
  parentCategory?: Category;
}

export function ArticleView({ post, contentHtml, headings, parentCategory }: ArticleViewProps) {
  const [paneOpen, setPaneOpen] = useState(false);

  const togglePane = useCallback(() => {
    setPaneOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-5 pt-5">
      {/* Top bar: breadcrumb + pane toggle */}
      <div
        className="article-topbar"
        data-shifted={paneOpen}
      >
        <div className="flex items-center gap-1 font-mono text-[11px] text-fg-light">
          <Link href="/" className="hover:text-accent transition-colors">
            ~/blake.thomson
          </Link>
          <span className="text-border">/</span>
          <Link href="/ideas" className="hover:text-accent transition-colors">
            ideas
          </Link>
          {parentCategory && (
            <>
              <span className="text-border">/</span>
              <Link
                href={`/ideas/${parentCategory.id}`}
                className="hover:text-accent transition-colors"
              >
                {parentCategory.shortLabel.toLowerCase().replace(/\s+/g, "-")}
              </Link>
            </>
          )}
          <span className="text-border">/</span>
          <span className="text-fg-muted truncate max-w-[200px]">
            {post.slug}
          </span>
        </div>

        {headings.length > 0 && (
          <button
            onClick={togglePane}
            className="inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px] text-fg-light transition-colors hover:bg-bg-panel-hover hover:text-fg"
            aria-label={paneOpen ? "Close contents" : "Open contents"}
          >
            <span className="text-[10px]">{paneOpen ? "▶" : "◀"}</span>
            {paneOpen ? "close" : "contents"}
          </button>
        )}
      </div>

      {/* Article layout: main + side pane */}
      <div className="article-layout">
        {/* Article panel */}
        <article
          className="article-main panel px-6 py-6 md:px-8 md:py-8"
          data-shifted={paneOpen}
        >
          {/* Meta */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-fg-light">
            <span className="capitalize">{post.category}</span>
            <span>&middot;</span>
            <span>{post.readTime}</span>
            <span>&middot;</span>
            <span>{post.date}</span>
          </div>

          {/* Title */}
          <h1 className="mt-3 font-serif text-2xl md:text-3xl">{post.title}</h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-bg-panel-hover px-2 py-1 font-mono text-[10px] text-fg-light"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <hr className="my-6 border-border-light" />

          {/* Content */}
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>

        {/* Side pane — slides in from the right */}
        <aside
          className="article-pane"
          data-open={paneOpen}
        >
          <div className="panel sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto px-5 py-5">
            {/* Pane header */}
            <div className="flex items-center justify-between">
              <p className="label-mono">contents</p>
              <button
                onClick={togglePane}
                className="flex h-6 w-6 items-center justify-center rounded font-mono text-[13px] text-fg-light transition-colors hover:bg-bg-panel-hover hover:text-fg"
                aria-label="Close pane"
              >
                ✕
              </button>
            </div>

            {/* Table of contents */}
            <nav className="mt-4" aria-label="Table of contents">
              <ul className="flex flex-col gap-0.5">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className={`block rounded px-2 py-1.5 font-sans text-[13px] leading-snug text-fg-muted no-underline transition-colors hover:bg-bg-panel-hover hover:text-accent ${
                        h.level === 3 ? "pl-5 text-[12px] text-fg-light" : ""
                      }`}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Divider + meta */}
            <hr className="my-5 border-border-light" />

            <div className="flex flex-col gap-3">
              <div>
                <p className="label-mono mb-1.5">category</p>
                {parentCategory ? (
                  <Link
                    href={`/ideas/${parentCategory.id}`}
                    className="rounded bg-bg-panel-hover px-2 py-1 font-mono text-[11px] text-fg-muted no-underline hover:text-accent transition-colors"
                  >
                    {parentCategory.shortLabel}
                  </Link>
                ) : (
                  <span className="rounded bg-bg-panel-hover px-2 py-1 font-mono text-[11px] capitalize text-fg-muted">
                    {post.category}
                  </span>
                )}
              </div>

              {post.tags.length > 0 && (
                <div>
                  <p className="label-mono mb-1.5">tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-bg-panel-hover px-2 py-0.5 font-mono text-[10px] text-fg-light"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="label-mono mb-1.5">reading time</p>
                <span className="font-mono text-[12px] text-fg-muted">
                  {post.readTime}
                </span>
              </div>
            </div>

            {/* Future: agent chat placeholder */}
            <hr className="my-5 border-border-light" />
            <div className="rounded border border-dashed border-border px-3 py-4 text-center">
              <p className="font-mono text-[11px] text-fg-light">
                agent chat — coming soon
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
