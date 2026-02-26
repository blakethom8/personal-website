"use client";

import type { LearnModule } from "@/lib/learn-modules";
import { rootReadme } from "@/lib/learn-modules";
import { JsonBlock } from "./JsonBlock";

interface FileViewerProps {
  selectedFile: string;
  modules: LearnModule[];
}

export function FileViewer({ selectedFile, modules }: FileViewerProps) {
  // Root README
  if (selectedFile === "README.md") {
    return (
      <div className="min-h-[300px] p-5">
        <ViewerBreadcrumb path="~/learn/README.md" />
        <MarkdownContent content={rootReadme} />
      </div>
    );
  }

  // Parse path: "slug/filename.ext"
  const slashIdx = selectedFile.indexOf("/");
  if (slashIdx === -1) return <EmptyState />;

  const moduleSlug = selectedFile.substring(0, slashIdx);
  const fileName = selectedFile.substring(slashIdx + 1);

  const mod = modules.find((m) => m.slug === moduleSlug);
  if (!mod) return <EmptyState />;

  const file = mod.files.find(
    (f) => `${f.name}${f.extension}` === fileName
  );
  if (!file) return <EmptyState />;

  return (
    <div className="min-h-[300px]">
      <div className="border-b border-border-light px-5 py-2">
        <ViewerBreadcrumb path={`~/learn/${mod.folderName}/${file.name}${file.extension}`} />
      </div>

      {file.type === "json" ? (
        <div>
          <JsonBlock
            code={file.content}
            highlightLines={file.highlightLines}
          />
          {file.annotation && (
            <div className="border-t border-border-light bg-accent-light/30 px-5 py-3">
              <p className="font-mono text-[11px] leading-relaxed text-accent">
                <span className="mr-1.5 font-bold">→</span>
                {file.annotation}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5">
          <MarkdownContent content={file.content} />
          {mod.available && (
            <div className="mt-4 border-t border-border-light pt-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
                Module route coming soon — use this file explorer for now.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ViewerBreadcrumb({ path }: { path: string }) {
  return (
    <span className="font-mono text-[11px] text-fg-light">{path}</span>
  );
}

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown-ish renderer for our static content
  const lines = content.split("\n");

  return (
    <div className="font-mono text-[12px] leading-relaxed">
      {lines.map((line, i) => {
        // Headings
        if (line.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="mb-3 mt-1 font-sans text-[15px] font-semibold text-fg"
            >
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h1
              key={i}
              className="mb-3 mt-1 font-sans text-[16px] font-semibold text-fg"
            >
              {line.replace("# ", "")}
            </h1>
          );
        }
        // Horizontal rule
        if (line.trim() === "---") {
          return (
            <hr key={i} className="my-3 border-border-light" />
          );
        }
        // Bullet items
        if (line.startsWith("• ") || line.startsWith("- ")) {
          return (
            <div key={i} className="ml-2 text-fg-muted">
              <span className="text-fg-light">• </span>
              {line.replace(/^[•\-]\s*/, "")}
            </div>
          );
        }
        // Indented lines (file listing style)
        if (line.startsWith("  ") && line.trim().length > 0) {
          const parts = line.trim().split(" — ");
          if (parts.length === 2) {
            return (
              <div key={i} className="ml-2 text-fg-muted">
                <span className="text-accent">{parts[0]}</span>
                <span className="text-fg-light"> — {parts[1]}</span>
              </div>
            );
          }
          return (
            <div key={i} className="ml-2 text-fg-muted">
              {line.trim()}
            </div>
          );
        }
        // Empty lines
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        // Regular text
        return (
          <div key={i} className="text-fg-muted">
            {line}
          </div>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center p-5">
      <p className="font-mono text-[12px] text-fg-light">
        select a file to view its contents
      </p>
    </div>
  );
}
