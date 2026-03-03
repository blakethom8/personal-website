"use client";

interface CodeComparisonProps {
  jsonCode: string;
  browserContent: React.ReactNode;
  caption?: string;
}

/**
 * Side-by-side code vs rendered view
 * Left: JSON in code editor style
 * Right: Browser mockup with rendered content
 */
export function CodeComparison({
  jsonCode,
  browserContent,
  caption = "Same data, different format → The browser transforms JSON into visual UI",
}: CodeComparisonProps) {
  return (
    <div className="my-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left: JSON Code */}
        <div className="overflow-hidden rounded-lg border border-border-light">
          <div className="flex items-center justify-between border-b border-border-light bg-bg-panel px-4 py-2">
            <span className="font-mono text-[11px] text-fg-light">
              JSON Package
            </span>
          </div>
          <pre className="overflow-x-auto bg-white p-4 text-[13px] leading-relaxed">
            <code className="text-fg">{jsonCode}</code>
          </pre>
        </div>

        {/* Right: Browser View */}
        <div className="overflow-hidden rounded-lg border border-border-light">
          <div className="flex items-center gap-2 border-b border-border-light bg-bg-panel px-4 py-2">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
            <span className="font-mono text-[11px] text-fg-light">
              Browser View
            </span>
          </div>
          <div className="bg-white p-6">{browserContent}</div>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-center font-mono text-[12px] text-fg-muted">
          {caption}
        </p>
      )}
    </div>
  );
}
