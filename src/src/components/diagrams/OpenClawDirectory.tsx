"use client";

import { useState } from "react";

/**
 * Shows OpenClaw's directory structure with clickable markdown files
 */
export function OpenClawDirectory() {
  const [isOpen, setIsOpen] = useState(false);

  const directoryContent = `~/.openclaw/
├── workspace/
│   ├── SOUL.md
│   ├── USER.md
│   ├── MEMORY.md
│   ├── WORK.md
│   ├── PERSONAL.md
│   ├── HEARTBEAT.md
│   ├── TOOLS.md
│   └── memory/
│       ├── 2026-03-02.md
│       ├── 2026-03-01.md
│       └── 2026-02-29.md
├── openclaw.json
└── logs/`;

  return (
    <div className="my-4">
      <div className="overflow-hidden rounded-lg border border-accent/30 bg-white">
        <div className="border-b border-accent/30 bg-bg-panel px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-[11px] text-fg-light">
            OpenClaw Directory Structure
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="font-mono text-[11px] text-accent hover:text-accent-dark"
          >
            {isOpen ? "collapse −" : "expand +"}
          </button>
        </div>
        {isOpen && (
          <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-fg">
            {directoryContent}
          </pre>
        )}
      </div>
    </div>
  );
}
