// ─── Types ───

export interface Tool {
  name: string;
  category: string;
  description: string;
  url?: string;
  tags: string[];
}

export interface Repo {
  name: string;
  description: string;
  url: string;
  language: string;
  tags: string[];
}

// ─── Tools I Use ───

export const tools: Tool[] = [
  {
    name: "Claude Code",
    category: "ai coding",
    description:
      "Anthropic's agentic coding tool. Terminal-based, writes code directly. My primary development environment.",
    url: "https://claude.ai/code",
    tags: ["CLI", "agent", "daily driver"],
  },
  {
    name: "Cursor",
    category: "ai coding",
    description:
      "VS Code fork with deep AI integration. Great for navigating large codebases and inline edits.",
    url: "https://cursor.sh",
    tags: ["IDE", "inline", "navigation"],
  },
  {
    name: "Claude (web)",
    category: "ai thinking",
    description:
      "For research, writing, and thinking through architecture before coding. Extended thinking for hard problems.",
    url: "https://claude.ai",
    tags: ["research", "writing", "planning"],
  },
  {
    name: "Next.js",
    category: "framework",
    description:
      "React framework for production. App Router, Server Components, the whole modern stack.",
    url: "https://nextjs.org",
    tags: ["react", "SSR", "app router"],
  },
  {
    name: "Tailwind CSS",
    category: "styling",
    description:
      "Utility-first CSS. Pairs perfectly with AI-assisted coding since the styles are inline and contextual.",
    url: "https://tailwindcss.com",
    tags: ["CSS", "utility-first"],
  },
  {
    name: "DuckDB",
    category: "data",
    description:
      "In-process analytical database. Handles 90M+ row Medicare claims datasets with zero infrastructure.",
    url: "https://duckdb.org",
    tags: ["analytics", "SQL", "fast"],
  },
];

// ─── GitHub Repos ───

export const repos: Repo[] = [
  {
    name: "personal-website",
    description:
      "This website. Next.js, Tailwind, nature backgrounds, and interactive AI learning modules.",
    url: "https://github.com/blakethom8/personal-website",
    language: "TypeScript",
    tags: ["Next.js", "Tailwind", "WebMCP"],
  },
  {
    name: "provider-intelligence",
    description:
      "Healthcare provider intelligence platform. Claims analytics, NPI matching, Google Places integration.",
    url: "https://github.com/blakethom8/provider-intelligence",
    language: "Python",
    tags: ["FastAPI", "DuckDB", "React"],
  },
  {
    name: "mcp-servers",
    description:
      "Collection of MCP server implementations for connecting AI agents to real-world data sources.",
    url: "https://github.com/blakethom8/mcp-servers",
    language: "Python",
    tags: ["MCP", "agents", "tools"],
  },
];
