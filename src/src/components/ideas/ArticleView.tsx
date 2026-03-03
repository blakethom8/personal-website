"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { Heading } from "@/lib/headings";
import type { Category } from "@/lib/categories";
import type { Source } from "@/lib/posts";
import { SourceCard } from "./SourceCard";

interface ArticlePost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  category: string;
  tags: string[];
  source?: Source;
  coverImage?: string;
}

interface ArticleViewProps {
  post: ArticlePost;
  contentHtml: string;
  headings: Heading[];
  parentCategory?: Category;
}

export function ArticleView({ post, contentHtml, headings, parentCategory }: ArticleViewProps) {
  const [paneOpen, setPaneOpen] = useState(false);

  // Open by default on desktop
  useEffect(() => {
    if (window.innerWidth < 960) return;
    const frame = window.requestAnimationFrame(() => {
      setPaneOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const togglePane = useCallback(() => {
    setPaneOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-5 pt-5">
      {/* Top bar: pane toggle */}
      {headings.length > 0 && (
        <div
          className="article-topbar"
          data-shifted={paneOpen}
        >
          <div className="flex items-center gap-3">
            <Link
              href="/ideas"
              className="font-mono text-[11px] text-fg-light no-underline transition-colors hover:text-accent"
            >
              ← ideas
            </Link>
            <span className="font-mono text-[10px] text-fg-light">·</span>
            <Link
              href="/ideas/catalogue"
              className="font-mono text-[11px] text-fg-light no-underline transition-colors hover:text-accent"
            >
              catalogue →
            </Link>
          </div>
          <button
            onClick={togglePane}
            className="inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px] text-fg-light transition-colors hover:bg-bg-panel-hover hover:text-fg"
            aria-label={paneOpen ? "Close contents" : "Open contents"}
          >
            <span className="text-[10px]">{paneOpen ? "▶" : "◀"}</span>
            {paneOpen ? "close" : "contents"}
          </button>
        </div>
      )}

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

          {/* Cover image */}
          {post.coverImage && (
            <div className="mb-6 overflow-hidden rounded-lg">
              <img
                src={post.coverImage}
                alt=""
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Source card */}
          {post.source && <SourceCard source={post.source} />}

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
                <span className="rounded bg-bg-panel-hover px-2 py-1 font-mono text-[11px] text-fg-muted">
                  {parentCategory?.shortLabel ?? post.category}
                </span>
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
