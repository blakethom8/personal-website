"use client";

import { repos } from "@/lib/learn-data";

export function ReposTab() {
  return (
    <div className="p-5">
      <p className="label-mono mb-1">open source</p>
      <p className="mb-4 text-[13px] text-fg-muted">
        Projects and experiments on GitHub. Code you can read, fork, and learn
        from.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {repos.map((repo) => (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded border border-border-light p-3 no-underline transition-colors hover:border-accent-muted hover:no-underline"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-mono text-[13px] font-semibold text-fg group-hover:text-accent">
                {repo.name}
              </h3>
              <span className="shrink-0 font-mono text-[10px] text-fg-light">
                {repo.language}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
              {repo.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {repo.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-fg-light transition-colors group-hover:text-accent">
              view on github
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
