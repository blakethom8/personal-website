"use client";

/**
 * Visual comparison of Model (just the engine) vs Agent (full system)
 */
export function ModelVsAgent() {
  return (
    <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Just the Model */}
      <div className="overflow-hidden rounded-lg border border-border-light">
        <div className="border-b border-border-light bg-bg-panel px-4 py-2">
          <p className="font-mono text-[11px] text-fg-light">
            Just the LLM Model
          </p>
        </div>
        <div className="bg-white p-6">
          <div className="mb-4 flex items-center justify-center rounded-lg bg-blue-500/10 p-8">
            <div className="text-center">
              <div className="mb-2 text-4xl">⚙️</div>
              <p className="font-mono text-[12px] font-semibold text-blue-600">
                Engine
              </p>
            </div>
          </div>
          <p className="text-center text-[13px] text-fg-muted">
            Text in → Text out
            <br />
            <span className="text-[11px]">No memory, no tools, no actions</span>
          </p>
        </div>
      </div>

      {/* Full Agent System */}
      <div className="overflow-hidden rounded-lg border-2 border-accent">
        <div className="border-b border-accent bg-accent-light/20 px-4 py-2">
          <p className="font-mono text-[11px] font-semibold text-accent">
            Complete Agent System
          </p>
        </div>
        <div className="bg-white p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded border border-border-light bg-bg-panel px-3 py-2">
              <span className="text-lg">🧠</span>
              <span className="text-[12px]">System Prompt</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-border-light bg-bg-panel px-3 py-2">
              <span className="text-lg">📝</span>
              <span className="text-[12px]">Context & Memory</span>
            </div>
            <div className="flex items-center gap-2 rounded border-2 border-blue-500/30 bg-blue-500/10 px-3 py-2">
              <span className="text-lg">⚙️</span>
              <span className="text-[12px] font-semibold">LLM Model (Engine)</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-border-light bg-bg-panel px-3 py-2">
              <span className="text-lg">🛠️</span>
              <span className="text-[12px]">Tools</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-border-light bg-bg-panel px-3 py-2">
              <span className="text-lg">🔄</span>
              <span className="text-[12px]">Harness (Orchestration)</span>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-fg-muted">
            The model + everything needed to make it useful
          </p>
        </div>
      </div>
    </div>
  );
}
