"use client";

import { tools } from "@/lib/learn-data";

export function ToolboxTab() {
  return (
    <div className="p-5">
      <p className="label-mono mb-1">what i&apos;m using today</p>
      <p className="mb-4 text-[13px] text-fg-muted">
        The tools and frameworks I reach for when building with AI. Updated as
        things change.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="rounded border border-border-light p-3 transition-colors hover:border-accent-muted"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-sans text-[14px] font-semibold text-fg">
                {tool.url ? (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline hover:text-accent hover:no-underline"
                  >
                    {tool.name}
                  </a>
                ) : (
                  tool.name
                )}
              </h3>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-fg-light">
                {tool.category}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
              {tool.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tool.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
