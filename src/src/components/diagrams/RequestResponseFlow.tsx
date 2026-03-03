"use client";

interface RequestResponseFlowProps {
  request: string;
  response: string;
  title?: string;
}

/**
 * Shows request → response flow for API calls
 * Left: Request JSON, Right: Response JSON
 */
export function RequestResponseFlow({
  request,
  response,
  title = "API Request & Response",
}: RequestResponseFlowProps) {
  return (
    <div className="my-6">
      {title && (
        <h4 className="mb-4 font-mono text-[12px] uppercase tracking-wide text-fg-light">
          {title}
        </h4>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Request */}
        <div className="overflow-hidden rounded-lg border border-border-light">
          <div className="flex items-center justify-between border-b border-border-light bg-bg-panel px-4 py-2">
            <span className="font-mono text-[11px] text-fg-light">
              Request →
            </span>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-[10px] text-blue-600">
              TO API
            </span>
          </div>
          <pre className="overflow-x-auto bg-white p-4 text-[12px] leading-relaxed">
            <code className="text-fg">{request}</code>
          </pre>
        </div>

        {/* Response */}
        <div className="overflow-hidden rounded-lg border border-border-light">
          <div className="flex items-center justify-between border-b border-border-light bg-bg-panel px-4 py-2">
            <span className="font-mono text-[11px] text-fg-light">
              ← Response
            </span>
            <span className="rounded bg-green-500/20 px-2 py-0.5 font-mono text-[10px] text-green-600">
              FROM API
            </span>
          </div>
          <pre className="overflow-x-auto bg-white p-4 text-[12px] leading-relaxed">
            <code className="text-fg">{response}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
