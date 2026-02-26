export interface WebMCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface WebMCPManifest {
  slug: string;
  generatedAt: string;
  tools: WebMCPTool[];
}

export interface WebMCPExecutionResult {
  success: boolean;
  message: string;
}

export interface WebMCPClient {
  tools: WebMCPTool[];
  execute: (
    toolName: string,
    params: Record<string, unknown>,
  ) => Promise<WebMCPExecutionResult>;
}

export const WEBMCP_TOOLS: WebMCPTool[] = [
  {
    name: "edit_section",
    description: "Replace content in a specific section of the current post",
    parameters: {
      section: { type: "number", description: "Section index (0-based)" },
      content: { type: "string", description: "New markdown content" },
    },
  },
  {
    name: "insert_chart",
    description: "Insert a chart or interactive block into the markdown",
    parameters: {
      type: {
        enum: ["conversation", "architecture", "data-flow", "terminal"],
        description: "Type of chart to insert",
      },
      position: {
        enum: ["cursor", "end"],
        description: "Where to insert the chart block",
      },
      config: {
        type: "object",
        description: "Chart-specific configuration",
      },
    },
  },
  {
    name: "save_draft",
    description: "Save the current content to disk",
    parameters: {},
  },
];

export function buildWebMCPManifest(slug: string): WebMCPManifest {
  return {
    slug,
    generatedAt: new Date().toISOString(),
    tools: WEBMCP_TOOLS,
  };
}
