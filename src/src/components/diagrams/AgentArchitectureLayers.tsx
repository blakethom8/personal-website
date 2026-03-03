"use client";

/**
 * Visual diagram showing the layers of an AI agent
 * Used in the intro to illustrate the key concepts we'll cover
 */
export function AgentArchitectureLayers() {
  return (
    <div className="my-8 overflow-hidden rounded-lg border border-border-light bg-gradient-to-br from-bg-panel to-bg-panel-hover">
      <div className="border-b border-border-light bg-bg-panel px-4 py-2">
        <span className="font-mono text-[11px] text-fg-light">
          The Five Layers of an AI Agent
        </span>
      </div>
      
      <div className="space-y-0 p-6">
        {/* Layer 5 - Agentic Patterns */}
        <div className="group relative overflow-hidden rounded-t-lg border border-b-0 border-purple-500/30 bg-purple-500/10 p-4 transition-all hover:bg-purple-500/20">
          <div className="absolute right-3 top-3 font-mono text-[10px] text-purple-600">
            Module 5
          </div>
          <div className="font-mono text-[13px] font-bold text-purple-600">
            Agentic Patterns
          </div>
          <div className="mt-1 text-[12px] text-fg-muted">
            Multi-turn reasoning, decision loops
          </div>
        </div>

        {/* Layer 4 - Tools */}
        <div className="group relative overflow-hidden border border-b-0 border-blue-500/30 bg-blue-500/10 p-4 transition-all hover:bg-blue-500/20">
          <div className="absolute right-3 top-3 font-mono text-[10px] text-blue-600">
            Module 4
          </div>
          <div className="font-mono text-[13px] font-bold text-blue-600">
            Tools & Actions
          </div>
          <div className="mt-1 text-[12px] text-fg-muted">
            read, write, search, execute
          </div>
        </div>

        {/* Layer 3 - Context & Memory */}
        <div className="group relative overflow-hidden border border-b-0 border-green-500/30 bg-green-500/10 p-4 transition-all hover:bg-green-500/20">
          <div className="absolute right-3 top-3 font-mono text-[10px] text-green-600">
            Module 3
          </div>
          <div className="font-mono text-[13px] font-bold text-green-600">
            Context & Memory
          </div>
          <div className="mt-1 text-[12px] text-fg-muted">
            Conversation history, system prompt, knowledge
          </div>
        </div>

        {/* Layer 2 - Communication Protocol */}
        <div className="group relative overflow-hidden border border-b-0 border-orange-500/30 bg-orange-500/10 p-4 transition-all hover:bg-orange-500/20">
          <div className="absolute right-3 top-3 font-mono text-[10px] text-orange-600">
            Module 2
          </div>
          <div className="font-mono text-[13px] font-bold text-orange-600">
            Communication Protocol
          </div>
          <div className="mt-1 text-[12px] text-fg-muted">
            JSON packages: model, system, tools, messages, settings
          </div>
        </div>

        {/* Layer 1 - The LLM Engine */}
        <div className="group relative overflow-hidden rounded-b-lg border border-red-500/30 bg-red-500/10 p-4 transition-all hover:bg-red-500/20">
          <div className="absolute right-3 top-3 font-mono text-[10px] text-red-600">
            Module 1
          </div>
          <div className="font-mono text-[13px] font-bold text-red-600">
            The LLM Engine
          </div>
          <div className="mt-1 text-[12px] text-fg-muted">
            claude-opus, gpt-4o — the brain powering it all
          </div>
        </div>
      </div>

      <div className="border-t border-border-light bg-bg-panel px-4 py-3 text-center">
        <p className="font-mono text-[11px] text-fg-muted">
          Each layer builds on the one below it
        </p>
      </div>
    </div>
  );
}
