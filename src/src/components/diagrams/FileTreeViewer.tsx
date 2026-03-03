"use client";

import { useState } from "react";

interface FileTreeViewerProps {
  fileContent: string;
  fileName: string;
}

/**
 * Shows a clickable directory tree that reveals a file's contents
 * Used to demonstrate system prompts stored as markdown files
 */
export function FileTreeViewer({ fileContent, fileName }: FileTreeViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-6">
      {/* Directory tree */}
      <div className="overflow-hidden rounded-lg border border-border-light bg-bg-panel">
        <div className="border-b border-border-light bg-bg-panel px-4 py-2">
          <span className="font-mono text-[11px] text-fg-light">
            Project Structure
          </span>
        </div>
        <div className="p-4 font-mono text-[13px]">
          <div className="text-fg-muted">📁 my-project/</div>
          <div className="ml-4 text-fg-muted">├── 📁 src/</div>
          <div className="ml-4 text-fg-muted">├── 📁 components/</div>
          <div className="ml-4 flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 text-accent transition-colors hover:text-accent-dark"
            >
              {isOpen ? "▼" : "▶"} 📄 {fileName}
            </button>
            {!isOpen && (
              <span className="text-[11px] text-fg-light italic">
                ← click to view
              </span>
            )}
          </div>
          <div className="ml-4 text-fg-muted">└── 📄 package.json</div>
        </div>
      </div>

      {/* File contents (when opened) */}
      {isOpen && (
        <div className="mt-4 overflow-hidden rounded-lg border border-accent/30 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-accent/30 bg-accent-light/20 px-4 py-2">
            <span className="font-mono text-[11px] text-accent">
              📄 {fileName}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-fg-light transition-colors hover:text-accent"
            >
              close ×
            </button>
          </div>
          <pre className="max-h-[400px] overflow-y-auto p-4 text-[12px] leading-relaxed text-fg">
            {fileContent}
          </pre>
        </div>
      )}
    </div>
  );
}
