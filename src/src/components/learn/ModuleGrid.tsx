"use client";

import type { LearnModule } from "@/lib/learn-modules";

interface ModuleGridProps {
  modules: LearnModule[];
}

export function ModuleGrid({ modules }: ModuleGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((mod) => (
        <div
          key={mod.slug}
          className={`flex flex-col justify-between rounded border border-border-light bg-bg-panel p-5 transition-colors ${
            mod.available
              ? "hover:border-accent-muted"
              : "opacity-50"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  mod.difficulty === "Beginner"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {mod.difficulty}
              </span>
              <span className="font-mono text-[10px] text-fg-light">
                {mod.duration}
              </span>
            </div>
            <h3 className="mt-2 font-serif text-[15px] font-medium text-fg">
              {mod.title}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
              {mod.description}
            </p>
          </div>
          <div className="mt-4">
            {mod.available ? (
              <span className="inline-block rounded bg-accent px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white">
                Start Module →
              </span>
            ) : (
              <span className="font-mono text-[11px] text-fg-light">
                Coming soon
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
