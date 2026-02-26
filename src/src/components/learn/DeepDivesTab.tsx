"use client";

const deepDives = [
  {
    name: "openclaw-architecture/",
    status: "coming soon",
    description: "The full agent architecture, traced end-to-end.",
  },
  {
    name: "healthcare-cost-analysis/",
    status: "coming soon",
    description: "90M+ Medicare claims rows and what the data says.",
  },
  {
    name: "agent-tool-patterns/",
    status: "coming soon",
    description: "MCP servers, function calling, and real-world patterns.",
  },
];

export function DeepDivesTab() {
  return (
    <div className="overflow-hidden bg-code-bg text-code-fg">
      {/* Path bar */}
      <div className="border-b border-[#2a2725] px-5 py-2.5">
        <span className="font-mono text-[11px] text-[#6E6860]">
          ~/learn/deep-dives
        </span>
      </div>

      {/* File tree */}
      <div className="px-5 py-4 font-mono text-[13px] leading-[1.8]">
        {deepDives.map((dive, i) => {
          const isLast = i === deepDives.length - 1;
          const connector = isLast ? "└─" : "├─";
          const continuation = isLast ? "   " : "│  ";

          return (
            <div key={dive.name}>
              <div>
                <span className="text-[#6E6860]">{connector} </span>
                <span className="text-accent">{dive.name}</span>
                <span className="ml-6 text-[11px] text-[#6E6860]">
                  [{dive.status}]
                </span>
              </div>
              <div className="text-[#8a8478]">
                <span className="text-[#6E6860]">{continuation} </span>
                {dive.description}
              </div>
              {!isLast && (
                <div className="text-[#6E6860]">│</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
