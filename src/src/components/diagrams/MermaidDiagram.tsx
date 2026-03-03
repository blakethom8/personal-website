"use client";

import { useEffect, useRef } from "react";

interface MermaidDiagramProps {
  chart: string;
  caption?: string;
}

/**
 * Renders Mermaid diagrams
 * Loads Mermaid.js dynamically and renders the chart
 */
export function MermaidDiagram({ chart, caption }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!ref.current) return;

      // Dynamically import mermaid
      const mermaid = (await import("mermaid")).default;

      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        themeVariables: {
          primaryColor: "#3b82f6",
          primaryTextColor: "#fff",
          primaryBorderColor: "#2563eb",
          lineColor: "#6b7280",
          secondaryColor: "#f3f4f6",
          tertiaryColor: "#fef3c7",
        },
      });

      const { svg } = await mermaid.render("mermaid-diagram", chart);
      ref.current.innerHTML = svg;
    };

    renderDiagram();
  }, [chart]);

  return (
    <div className="my-6">
      <div className="overflow-hidden rounded-lg border border-border-light bg-white p-6">
        <div ref={ref} className="flex justify-center" />
      </div>
      {caption && (
        <p className="mt-3 text-center font-mono text-[12px] text-fg-muted">
          {caption}
        </p>
      )}
    </div>
  );
}
