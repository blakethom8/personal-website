import { describe, expect, it } from "vitest";
import {
  WEBMCP_LAB_TOOLS,
  buildWebMCPLabManifest,
  executeWebMCPLabTool,
} from "./webmcp-lab";

describe("webmcp-lab", () => {
  it("builds a manifest with page metadata and tool definitions", () => {
    const manifest = buildWebMCPLabManifest() as {
      page: string;
      tools: Array<{ name: string }>;
      generatedAt: string;
    };

    expect(manifest.page).toBe("/learn/webmcp-lab");
    expect(Array.isArray(manifest.tools)).toBe(true);
    expect(manifest.tools.length).toBe(WEBMCP_LAB_TOOLS.length);
    expect(typeof manifest.generatedAt).toBe("string");
  });

  it("lists modules and supports filtering to available only", async () => {
    const result = await executeWebMCPLabTool("list_modules", {
      includeComingSoon: false,
    });
    const modules = (result.data.modules as Array<{ available: boolean }>) ?? [];

    expect(result.ok).toBe(true);
    expect(modules.length).toBeGreaterThan(0);
    expect(modules.every((module) => module.available)).toBe(true);
  });

  it("suggests an agent module when asked about tools/agents", async () => {
    const result = await executeWebMCPLabTool("suggest_module", {
      interest: "How do agents call tools with MCP?",
    });
    const recommendation = result.data.recommendation as { slug: string };

    expect(result.ok).toBe(true);
    expect(recommendation.slug).toBe("agents-ai-takes-action");
  });

  it("returns all layer explanations when layer=all", async () => {
    const result = await executeWebMCPLabTool("explain_agent_layers", {
      layer: "all",
    });
    const sequence = result.data.sequence as unknown[];

    expect(result.ok).toBe(true);
    expect(Array.isArray(sequence)).toBe(true);
    expect(sequence.length).toBe(3);
  });

  it("runs provider-search simulation with structured trace", async () => {
    const result = await executeWebMCPLabTool("simulate_provider_search", {
      specialty: "cardiology",
      location: "Santa Monica, CA",
    });
    const trace = result.data.trace as Array<{ event: string }>;

    expect(result.ok).toBe(true);
    expect(trace.length).toBeGreaterThanOrEqual(4);
    expect(trace[1]?.event).toBe("tool_selected");
  });

  it("returns a clear error payload for unknown tools", async () => {
    const result = await executeWebMCPLabTool("not-a-real-tool", {});
    const availableTools = result.data.availableTools as string[];

    expect(result.ok).toBe(false);
    expect(availableTools).toContain("list_modules");
  });
});

