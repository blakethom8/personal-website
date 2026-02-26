"use client";

import { useState } from "react";
import type { LearnModule } from "@/lib/learn-modules";
import { FileTree } from "./FileTree";
import { FileViewer } from "./FileViewer";

interface LearnExplorerProps {
  modules: LearnModule[];
}

export function LearnExplorer({ modules }: LearnExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<string>("README.md");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["what-is-an-llm"])
  );
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);

  const toggleFolder = (slug: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const selectFile = (path: string) => {
    setSelectedFile(path);
    setMobileTreeOpen(false);
  };

  return (
    <>
      {/* Mobile: toggle button for file tree */}
      <div className="flex items-center justify-between border-b border-border-light px-4 py-2 md:hidden">
        <button
          onClick={() => setMobileTreeOpen(!mobileTreeOpen)}
          className="font-mono text-[11px] text-fg-muted"
        >
          {mobileTreeOpen ? "▼ hide files" : "▶ browse files"}
        </button>
        <span className="font-mono text-[11px] text-fg-light">
          {selectedFile}
        </span>
      </div>

      {/* Mobile: collapsible tree */}
      {mobileTreeOpen && (
        <div className="border-b border-border-light md:hidden">
          <FileTree
            modules={modules}
            selectedFile={selectedFile}
            expandedFolders={expandedFolders}
            onSelectFile={selectFile}
            onToggleFolder={toggleFolder}
          />
        </div>
      )}

      {/* Desktop: side-by-side */}
      <div className="md:grid md:grid-cols-[220px_1fr] md:divide-x md:divide-border-light">
        <div className="hidden md:block">
          <FileTree
            modules={modules}
            selectedFile={selectedFile}
            expandedFolders={expandedFolders}
            onSelectFile={selectFile}
            onToggleFolder={toggleFolder}
          />
        </div>
        <FileViewer selectedFile={selectedFile} modules={modules} />
      </div>
    </>
  );
}
