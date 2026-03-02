import Link from "next/link";
import { CATEGORIES, CONSUMING_CATEGORY } from "@/lib/categories";
import type { Category } from "@/lib/categories";

export function CategoryView({
  category,
  contentHtml,
  consuming = false,
}: {
  category: Category;
  contentHtml: string;
  consuming?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 pb-5 pt-5">
      <div className="mx-auto flex w-[calc(100%-2*16px)] max-w-[1200px] flex-col gap-4 md:w-[calc(100%-2*40px)] md:flex-row md:items-start">

        {/* ── Left: topics nav ── */}
        <div className="panel shrink-0 overflow-hidden p-0 md:w-[220px]">
          <div className="border-b border-border-light px-5 py-3">
            <Link
              href="/ideas"
              className="label-mono no-underline transition-colors hover:text-accent"
            >
              ← ideas
            </Link>
          </div>

          {CATEGORIES.map((cat, i) => {
            const isActive = cat.id === category.id && !consuming;
            return (
              <Link
                key={cat.id}
                href={`/ideas/${cat.id}`}
                className={`group flex items-center gap-2 border-b border-border-light px-5 py-3 no-underline transition-colors ${
                  isActive
                    ? "border-l-2 border-l-accent bg-accent/[0.06]"
                    : "border-l-2 border-l-transparent hover:bg-accent/[0.03]"
                }`}
              >
                <span className={`shrink-0 font-mono text-[10px] ${isActive ? "text-accent" : "text-accent/50"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`truncate font-sans text-[13px] transition-colors ${
                  isActive ? "font-medium text-accent" : "text-fg-muted group-hover:text-accent"
                }`}>
                  {cat.shortLabel}
                </span>
              </Link>
            );
          })}

          <Link
            href={`/ideas/${CONSUMING_CATEGORY.id}`}
            className={`group flex items-center gap-2 px-5 py-3 no-underline transition-colors ${
              consuming
                ? "border-l-2 border-l-accent bg-accent/[0.06]"
                : "border-l-2 border-l-transparent hover:bg-accent/[0.03]"
            }`}
          >
            <span className={`shrink-0 font-mono text-[10px] ${consuming ? "text-accent" : "text-accent/50"}`}>
              {String(CATEGORIES.length + 1).padStart(2, "0")}
            </span>
            <span className={`truncate font-sans text-[13px] transition-colors ${
              consuming ? "font-medium text-accent" : "text-fg-muted group-hover:text-accent"
            }`}>
              {CONSUMING_CATEGORY.shortLabel}
            </span>
          </Link>
        </div>

        {/* ── Right: category readme ── */}
        <div className="panel min-w-0 flex-1 px-6 py-6 md:px-8 md:py-8">
          <p className="label-mono mb-2">
            {consuming ? "in my feed" : "the quick download"}
          </p>
          <h1 className="font-serif text-2xl leading-snug md:text-3xl">
            {category.label}
          </h1>

          <hr className="my-6 border-border-light" />

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>

      </div>
    </div>
  );
}
