"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  WEBMCP_LAB_DEFAULT_INPUTS,
  WEBMCP_LAB_TOOLS,
  buildWebMCPLabManifest,
  executeWebMCPLabTool,
  type WebMCPLabExecutionResult,
} from "@/lib/webmcp-lab";
import { hasWebMCPSupport, useWebMCPTools } from "@/hooks/useWebMCPTools";

type TraceSource = "manual" | "agent";

interface TraceEntry {
  id: string;
  source: TraceSource;
  toolName: string;
  ok: boolean;
  timestamp: string;
  durationMs: number;
  input: Record<string, unknown>;
  message: string;
}

declare global {
  interface Window {
    WebMCPLab?: {
      tools: typeof WEBMCP_LAB_TOOLS;
      execute: (
        toolName: string,
        params: Record<string, unknown>,
      ) => Promise<WebMCPLabExecutionResult>;
    };
  }
}

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function parseObjectInput(raw: string): Record<string, unknown> {
  if (!raw.trim()) {
    return {};
  }

  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Tool input must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

function statusClass(ok: boolean): string {
  return ok ? "text-emerald-700" : "text-red-700";
}

export function WebMCPLab() {
  const [selectedToolName, setSelectedToolName] = useState(WEBMCP_LAB_TOOLS[0].name);
  const [inputJson, setInputJson] = useState(
    prettyJson(WEBMCP_LAB_DEFAULT_INPUTS[selectedToolName]),
  );
  const [execution, setExecution] = useState<WebMCPLabExecutionResult | null>(null);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const hasNativeWebMCP = useSyncExternalStore(
    () => () => {},
    () => hasWebMCPSupport(),
    () => false,
  );

  const selectedTool = useMemo(
    () => WEBMCP_LAB_TOOLS.find((tool) => tool.name === selectedToolName) ?? WEBMCP_LAB_TOOLS[0],
    [selectedToolName],
  );

  const runTool = useCallback(
    async (
      source: TraceSource,
      toolName: string,
      params: Record<string, unknown>,
    ): Promise<WebMCPLabExecutionResult> => {
      setRunning(true);
      const result = await executeWebMCPLabTool(toolName, params);
      setExecution(result);

      const entry: TraceEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        source,
        toolName,
        ok: result.ok,
        timestamp: result.timestamp,
        durationMs: result.durationMs,
        input: params,
        message: result.message,
      };

      setTrace((previous) => [entry, ...previous].slice(0, 16));
      setRunning(false);
      return result;
    },
    [],
  );

  const browserTools = useMemo(
    () =>
      WEBMCP_LAB_TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        execute: async (params: Record<string, unknown>) => {
          const result = await runTool("agent", tool.name, params ?? {});
          return result.data;
        },
      })),
    [runTool],
  );

  useWebMCPTools(browserTools);

  useEffect(() => {
    const manifest = buildWebMCPLabManifest();
    const scriptId = "webmcp-lab-registry";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/webmcp+json";
    script.textContent = JSON.stringify(manifest);
    document.head.appendChild(script);

    window.WebMCPLab = {
      tools: WEBMCP_LAB_TOOLS,
      execute: (toolName, params) => runTool("agent", toolName, params),
    };

    return () => {
      script.remove();
      if (window.WebMCPLab) {
        delete window.WebMCPLab;
      }
    };
  }, [runTool]);

  async function handleManualRun() {
    try {
      setInputError(null);
      const parsedInput = parseObjectInput(inputJson);
      await runTool("manual", selectedTool.name, parsedInput);
    } catch (error) {
      setInputError(error instanceof Error ? error.message : "Invalid JSON input.");
    }
  }

  function handleSelectTool(toolName: string) {
    setSelectedToolName(toolName);
    setInputJson(prettyJson(WEBMCP_LAB_DEFAULT_INPUTS[toolName] ?? {}));
    setInputError(null);
  }

  return (
    <div className="panel mx-auto w-[calc(100%-2*16px)] max-w-[1200px] overflow-hidden md:w-[calc(100%-2*40px)]">
      <div className="border-b border-border-light px-5 py-4 md:px-6">
        <p className="label-mono mb-1">webmcp lab</p>
        <h1 className="font-serif text-2xl md:text-3xl">Agent-Native Browser Interface</h1>
        <p className="mt-2 max-w-[85ch] text-[14px] leading-relaxed text-fg-muted">
          This module shows how Gemini-side-panel style agents can discover and call tools from a
          web page. The same tool contract powers both human demos and browser-agent execution.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
              hasNativeWebMCP
                ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                : "border-amber-300 bg-amber-100 text-amber-800"
            }`}
          >
            {hasNativeWebMCP ? "native modelContext detected" : "fallback registry mode"}
          </span>
          <span className="rounded border border-border-light bg-bg-panel-hover px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-fg-light">
            {WEBMCP_LAB_TOOLS.length} tools exposed
          </span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-border-light bg-bg-panel-hover p-4 lg:border-b-0 lg:border-r">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
            Tool Registry
          </h2>
          <div className="mt-3 space-y-2">
            {WEBMCP_LAB_TOOLS.map((tool) => (
              <button
                key={tool.name}
                onClick={() => handleSelectTool(tool.name)}
                className={`w-full rounded border p-3 text-left transition-colors ${
                  selectedToolName === tool.name
                    ? "border-accent bg-accent-light/50"
                    : "border-border-light bg-bg-panel hover:border-accent-muted"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-fg">
                    {tool.name}
                  </p>
                  <span className="rounded border border-border-light px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-fg-light">
                    {tool.safety}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">{tool.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded border border-border-light bg-bg-panel p-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-fg-light">Gemini Demo Script</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-[12px] leading-relaxed text-fg-muted">
              <li>Open this page and Gemini side panel in Chrome.</li>
              <li>Ask Gemini: &quot;What tools are available on this page?&quot;</li>
              <li>Ask it to call `suggest_module` for agent architecture.</li>
              <li>Run `simulate_provider_search` and inspect the returned trace.</li>
            </ol>
          </div>
        </aside>

        <section className="p-4 md:p-5">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded border border-border-light bg-bg-panel">
              <div className="border-b border-border-light px-4 py-2">
                <h3 className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
                  Tool Runner
                </h3>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
                    {selectedTool.name}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                    {selectedTool.description}
                  </p>
                </div>
                <textarea
                  value={inputJson}
                  onChange={(event) => setInputJson(event.target.value)}
                  spellCheck={false}
                  className="h-[230px] w-full resize-y rounded border border-border-light bg-code-bg p-3 font-mono text-[12px] text-code-fg outline-none focus:border-accent"
                />
                {inputError ? <p className="text-[12px] text-red-700">{inputError}</p> : null}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleManualRun()}
                    disabled={running}
                    className="rounded bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
                  >
                    {running ? "Running..." : "Run Tool"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrace([])}
                    className="rounded border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-fg-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    Clear Trace
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded border border-border-light bg-bg-panel">
              <div className="border-b border-border-light px-4 py-2">
                <h3 className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
                  Latest Result
                </h3>
              </div>
              <div className="space-y-2 p-4">
                {execution ? (
                  <>
                    <p className={`text-[12px] font-medium ${statusClass(execution.ok)}`}>
                      {execution.message}
                    </p>
                    <p className="font-mono text-[10px] text-fg-light">
                      {execution.toolName} · {execution.durationMs}ms ·{" "}
                      {new Date(execution.timestamp).toLocaleTimeString()}
                    </p>
                    <pre className="max-h-[320px] overflow-auto rounded border border-border-light bg-code-bg p-3 font-mono text-[11px] leading-relaxed text-code-fg">
                      {prettyJson(execution.data)}
                    </pre>
                  </>
                ) : (
                  <p className="text-[13px] text-fg-muted">
                    Run a tool to inspect structured output that an agent would receive.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded border border-border-light bg-bg-panel">
            <div className="border-b border-border-light px-4 py-2">
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
                Agent Trace
              </h3>
            </div>
            <div className="max-h-[280px] overflow-auto p-4">
              {trace.length === 0 ? (
                <p className="text-[13px] text-fg-muted">
                  No events yet. Run tools manually or through browser agent integrations.
                </p>
              ) : (
                <div className="space-y-2">
                  {trace.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded border border-border-light bg-bg-panel-hover p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-fg">
                          {entry.toolName}
                        </p>
                        <p className="font-mono text-[10px] text-fg-light">
                          {entry.source} · {new Date(entry.timestamp).toLocaleTimeString()} ·{" "}
                          {entry.durationMs}ms
                        </p>
                      </div>
                      <p className={`mt-1 text-[12px] ${statusClass(entry.ok)}`}>{entry.message}</p>
                      <pre className="mt-2 max-h-[140px] overflow-auto rounded border border-border-light bg-code-bg p-2 font-mono text-[10px] text-code-fg">
                        {prettyJson(entry.input)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
