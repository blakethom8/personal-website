"use client";

import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";

interface LivePreviewProps {
  markdown: string;
}

export default function LivePreview({ markdown }: LivePreviewProps) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderMarkdown() {
      const result = await remark().use(html, { sanitize: true }).process(markdown);
      if (!cancelled) {
        setHtmlContent(result.toString());
      }
    }

    void renderMarkdown();

    return () => {
      cancelled = true;
    };
  }, [markdown]);

  return (
    <div className="panel h-full min-h-[420px] overflow-auto p-6 md:p-8">
      <div
        className="prose prose-sm max-w-none
          prose-headings:font-serif prose-headings:font-normal
          prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-fg-muted
          prose-code:rounded prose-code:bg-bg-panel-hover prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[13px]
          prose-pre:border prose-pre:border-border-light prose-pre:bg-code-bg prose-pre:text-code-fg
          prose-a:text-accent"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}

