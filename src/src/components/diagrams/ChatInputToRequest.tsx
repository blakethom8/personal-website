"use client";

interface ChatInputToRequestProps {
  userInput: string;
  requestJson: string;
}

/**
 * Shows user's chat input transforming into LLM API request
 * Top: Familiar chat interface
 * Bottom: The actual JSON package that gets sent
 */
export function ChatInputToRequest({
  userInput,
  requestJson,
}: ChatInputToRequestProps) {
  return (
    <div className="my-6 space-y-4">
      {/* User's familiar chat interface */}
      <div className="overflow-hidden rounded-lg border border-border-light">
        <div className="flex items-center gap-2 border-b border-border-light bg-bg-panel px-4 py-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
          <span className="font-mono text-[11px] text-fg-light">
            What You See (Chat Interface)
          </span>
        </div>
        <div className="bg-white p-6">
          <div className="flex items-center gap-3 rounded-lg border border-border-light bg-bg-panel/30 px-4 py-3">
            <input
              type="text"
              value={userInput}
              readOnly
              className="flex-1 bg-transparent font-sans text-[14px] text-fg outline-none"
            />
            <button className="rounded bg-accent px-4 py-1.5 font-mono text-[11px] text-white">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Arrow indicating transformation */}
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-accent-light px-4 py-2 font-mono text-[11px] text-accent">
          ↓ Your app transforms this into...
        </div>
      </div>

      {/* The actual LLM request package */}
      <div className="overflow-hidden rounded-lg border border-border-light">
        <div className="flex items-center justify-between border-b border-border-light bg-bg-panel px-4 py-2">
          <span className="font-mono text-[11px] text-fg-light">
            What Gets Sent to the LLM (JSON Request Package)
          </span>
          <span className="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-[10px] text-blue-600">
            TO API
          </span>
        </div>
        <pre className="overflow-x-auto bg-white p-4 text-[12px] leading-relaxed">
          <code className="text-fg">{requestJson}</code>
        </pre>
      </div>
    </div>
  );
}
