import { learnModules } from "@/lib/learn-modules";

export type WebMCPLabSafety = "read-only" | "simulation";

export interface WebMCPLabTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  safety: WebMCPLabSafety;
}

export interface WebMCPLabExecutionResult {
  ok: boolean;
  toolName: string;
  message: string;
  data: Record<string, unknown>;
  durationMs: number;
  timestamp: string;
}

export const WEBMCP_LAB_TOOLS: WebMCPLabTool[] = [
  {
    name: "list_modules",
    description:
      "List learning modules with title, difficulty, duration, and availability.",
    inputSchema: {
      type: "object",
      properties: {
        includeComingSoon: {
          type: "boolean",
          description: "Include modules that are not yet available.",
          default: true,
        },
      },
    },
    safety: "read-only",
  },
  {
    name: "suggest_module",
    description:
      "Recommend a learning module based on what someone wants to understand.",
    inputSchema: {
      type: "object",
      required: ["interest"],
      properties: {
        interest: {
          type: "string",
          description: "User goal or topic, e.g. 'agents', 'tokens', 'healthcare AI'.",
        },
      },
    },
    safety: "read-only",
  },
  {
    name: "explain_agent_layers",
    description:
      "Explain the 3-layer agent-native architecture: observability, tools, projection space.",
    inputSchema: {
      type: "object",
      properties: {
        layer: {
          type: "string",
          enum: ["observability", "tools", "projection", "all"],
          default: "all",
        },
      },
    },
    safety: "read-only",
  },
  {
    name: "simulate_provider_search",
    description:
      "Run a safe simulation of an agent-driven provider search and return structured trace steps.",
    inputSchema: {
      type: "object",
      properties: {
        specialty: { type: "string", default: "cardiology" },
        location: { type: "string", default: "Santa Monica, CA" },
      },
    },
    safety: "simulation",
  },
];

export const WEBMCP_LAB_DEFAULT_INPUTS: Record<string, Record<string, unknown>> = {
  list_modules: { includeComingSoon: true },
  suggest_module: { interest: "I want to understand how AI agents use tools." },
  explain_agent_layers: { layer: "all" },
  simulate_provider_search: {
    specialty: "cardiology",
    location: "Santa Monica, CA",
  },
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getString(input: Record<string, unknown>, key: string, fallback: string): string {
  const value = input[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function getBoolean(
  input: Record<string, unknown>,
  key: string,
  fallback: boolean,
): boolean {
  const value = input[key];
  return typeof value === "boolean" ? value : fallback;
}

function toModuleSummary() {
  return learnModules.map((module) => ({
    slug: module.slug,
    title: module.title,
    difficulty: module.difficulty,
    duration: module.duration,
    available: module.available,
    description: module.description,
  }));
}

function buildLayerExplanation(layer: string): Record<string, unknown> {
  const layers = {
    observability: {
      name: "Layer 1: AI Observability",
      intent: "Make visual UI state machine-readable with semantic anchors.",
      examples: ["data-ai-target attributes", "JSON-LD structured snapshots"],
    },
    tools: {
      name: "Layer 2: WebMCP Tools",
      intent: "Expose safe actions the agent can call directly.",
      examples: ["list_modules", "search_providers", "get_current_results"],
    },
    projection: {
      name: "Layer 3: Projection Space",
      intent: "Render AI-requested components in a trusted in-app surface.",
      examples: ["summary cards", "charts", "map overlays"],
    },
  };

  if (layer === "all") {
    return {
      sequence: [layers.observability, layers.tools, layers.projection],
      keyInsight:
        "One codebase serves both interfaces: humans click UI, agents call tools.",
    };
  }

  const selected = layers[layer as keyof typeof layers];
  if (!selected) {
    return {
      error: "Unknown layer. Use observability, tools, projection, or all.",
    };
  }

  return selected;
}

function suggestModule(interest: string) {
  const normalized = interest.toLowerCase();
  const priorities = [
    {
      matcher: ["agent", "tool", "mcp", "webmcp"],
      slug: "agents-ai-takes-action",
      reason:
        "Best match for agent loop concepts, tool calling, and the MCP/WebMCP bridge.",
    },
    {
      matcher: ["token", "context", "cost"],
      slug: "what-are-tokens",
      reason: "Best match for understanding tokenization, context windows, and pricing.",
    },
    {
      matcher: ["healthcare", "clinical", "claims"],
      slug: "ai-in-healthcare",
      reason: "Best match for practical healthcare AI use cases and limits.",
    },
  ];

  const forcedMatch = priorities.find((item) =>
    item.matcher.some((keyword) => normalized.includes(keyword)),
  );

  const chosenSlug = forcedMatch?.slug ?? "what-is-an-llm";
  const selectedModule =
    learnModules.find((item) => item.slug === chosenSlug) ?? learnModules[0];

  return {
    recommendation: {
      slug: selectedModule.slug,
      title: selectedModule.title,
      available: selectedModule.available,
      duration: selectedModule.duration,
      difficulty: selectedModule.difficulty,
    },
    reason:
      forcedMatch?.reason ??
      "Start with fundamentals first, then move into agents and architecture.",
  };
}

function buildProviderSearchSimulation(
  specialty: string,
  location: string,
): Record<string, unknown> {
  const stepTrace = [
    {
      step: 1,
      event: "intent_received",
      detail: `Agent asked for ${specialty} providers near ${location}.`,
    },
    {
      step: 2,
      event: "tool_selected",
      detail: "Agent selected search_providers based on page tool descriptions.",
    },
    {
      step: 3,
      event: "query_executed",
      detail: "UI and tool layer use the same search function (single code path).",
    },
    {
      step: 4,
      event: "results_returned",
      detail: "Structured JSON returned to the agent and visual cards rendered for the user.",
    },
  ];

  return {
    query: { specialty, location, radiusMiles: 10 },
    estimatedResultCount: 42,
    topResults: [
      { name: "Dr. Jane Smith", rating: 4.8, distanceMiles: 1.2 },
      { name: "Dr. Omar Ali", rating: 4.7, distanceMiles: 2.1 },
      { name: "Dr. Priya Patel", rating: 4.6, distanceMiles: 2.9 },
    ],
    trace: stepTrace,
  };
}

export function buildWebMCPLabManifest(): Record<string, unknown> {
  return {
    page: "/learn/webmcp-lab",
    generatedAt: new Date().toISOString(),
    tools: WEBMCP_LAB_TOOLS,
  };
}

export async function executeWebMCPLabTool(
  toolName: string,
  input: Record<string, unknown>,
): Promise<WebMCPLabExecutionResult> {
  const start = Date.now();
  await wait(180);

  let message = "Tool completed.";
  let data: Record<string, unknown> = {};
  let ok = true;

  switch (toolName) {
    case "list_modules": {
      const includeComingSoon = getBoolean(input, "includeComingSoon", true);
      const modules = toModuleSummary().filter((module) =>
        includeComingSoon ? true : module.available,
      );
      data = { count: modules.length, modules };
      message = "Returned learning module catalog.";
      break;
    }
    case "suggest_module": {
      const interest = getString(input, "interest", "I want to learn AI basics.");
      data = suggestModule(interest);
      message = "Recommended a module based on requested interest.";
      break;
    }
    case "explain_agent_layers": {
      const layer = getString(input, "layer", "all").toLowerCase();
      data = buildLayerExplanation(layer);
      message = "Returned architecture layer explanation.";
      break;
    }
    case "simulate_provider_search": {
      const specialty = getString(input, "specialty", "cardiology");
      const location = getString(input, "location", "Santa Monica, CA");
      data = buildProviderSearchSimulation(specialty, location);
      message = "Completed safe provider-search simulation trace.";
      break;
    }
    default: {
      ok = false;
      message = `Unknown tool: ${toolName}`;
      data = { availableTools: WEBMCP_LAB_TOOLS.map((tool) => tool.name) };
    }
  }

  return {
    ok,
    toolName,
    message,
    data,
    durationMs: Date.now() - start,
    timestamp: new Date().toISOString(),
  };
}
