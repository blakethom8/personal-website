import type { Source } from "@/lib/posts";

interface SourceCardProps {
  source: Source;
}

export function SourceCard({ source }: SourceCardProps) {
  const attribution = [
    source.show,
    source.episode ? `#${source.episode}` : null,
    source.guest ? `with ${source.guest}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-border-light bg-bg-panel-hover/50">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border-light px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-fg-light">
          source
        </span>
        <span className="font-mono text-[10px] text-fg-light/50">·</span>
        <span className="font-mono text-[10px] text-fg-light">
          {source.platform}
        </span>
      </div>

      {/* YouTube embed */}
      {source.type === "youtube" && source.videoId && (
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${source.videoId}`}
            title={attribution || "Video source"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="h-full w-full border-0"
          />
        </div>
      )}

      {/* Podcast link card */}
      {source.type === "podcast" && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 px-4 py-4 no-underline transition-colors hover:bg-bg-panel-hover"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-[14px] font-medium text-fg transition-colors group-hover:text-accent">
              {attribution || "Listen to episode"}
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-fg-light">
              {source.platform} — open in new tab ↗
            </p>
          </div>
        </a>
      )}

      {/* Attribution line */}
      {attribution && (
        <div className="border-t border-border-light px-4 py-2.5">
          <p className="font-mono text-[11px] text-fg-light">
            Summarized from{" "}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent no-underline hover:opacity-70 transition-opacity"
            >
              {attribution}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
