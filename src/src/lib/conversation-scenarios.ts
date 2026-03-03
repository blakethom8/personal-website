// ─── Types ───

export interface ChatMessage {
  role: "user" | "assistant" | "tool-call" | "tool-result" | "thinking" | "narrator";
  content: string;
  toolName?: string;
}

export interface ApiBlock {
  label: string;
  json: string;
  highlightLines?: number[];
  annotation?: string;
}

// ─── Context Window Types ───

export type ContextSectionType =
  | "system-prompt"
  | "instructions"
  | "tool-definitions"
  | "message-user"
  | "message-assistant"
  | "message-tool-call"
  | "message-tool-result"
  | "summary";

export interface ContextSection {
  id: string;
  label: string;
  type: ContextSectionType;
  content: string;
  tokenCount: number;
  isNew?: boolean;
  isRemoved?: boolean;
  isSummary?: boolean;
}

export interface ContextSnapshot {
  tokenCount: number;
  maxTokens: number;
  payload: string;
  sections: ContextSection[];
  annotation?: string;
}

export type WorkspaceItemKind = "directory" | "file" | "database";

export type WorkspaceItemStatus = "active" | "created" | "updated" | "queried";

export interface WorkspaceItem {
  path: string;
  kind: WorkspaceItemKind;
  status?: WorkspaceItemStatus;
  meta?: string;
}

export interface WorkspaceSnapshot {
  rootLabel: string;
  activity: string;
  note?: string;
  items: WorkspaceItem[];
}

export interface ConversationStep {
  chat: ChatMessage;
  api: ApiBlock[];
  delay?: number; // ms before auto-advance, default 1800
  context?: ContextSnapshot;
  workspace?: WorkspaceSnapshot;
}

export interface ScenarioIntro {
  label: string;
  heading: string;
  description: string;
}

export interface Scenario {
  id: string;
  title: string;
  steps: ConversationStep[];
  intro?: ScenarioIntro;
}

export interface ScenarioGroup {
  id: string;
  title: string;
  intro: ScenarioIntro;
  subScenarios: Scenario[];
}

export type ScenarioTabItem = Scenario | ScenarioGroup;

export function isScenarioGroup(item: ScenarioTabItem): item is ScenarioGroup {
  return "subScenarios" in item;
}

// ─── Context helpers (shared across scenario files) ───

function cs(
  id: string,
  label: string,
  type: ContextSectionType,
  content: string,
  tokenCount: number,
  flags?: { isNew?: boolean; isRemoved?: boolean; isSummary?: boolean }
): ContextSection {
  return { id, label, type, content, tokenCount, ...flags };
}

function ctx(
  tokenCount: number,
  maxTokens: number,
  sectionList: ContextSection[],
  annotation?: string
): ContextSnapshot {
  return { tokenCount, maxTokens, payload: "", sections: sectionList, annotation };
}

// ─── Scenario 1: Simple Chat ───

const simpleChat: Scenario = {
  id: "simple-chat",
  title: "a single question",
  intro: {
    label: "the basics",
    heading: "What Happens When You Send a Message",
    description: "When you type into ChatGPT, a structured request is sent to the model behind the scenes. It includes a system prompt — hidden instructions that tell the model how to behave — along with your message. This simulation shows you exactly what that request looks like.",
  },
  steps: [
    {
      chat: {
        role: "user",
        content: "What is the capital of France?",
      },
      api: [
        {
          label: "request",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "system": "You are a helpful, harmless, and honest assistant. Answer questions clearly and concisely. If you're not sure about something, say so.",
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ]
}`,
          highlightLines: [4],
          annotation: "Before your message, there's a system prompt — hidden instructions that shape how the model behaves. Every conversation has one, even if you never see it.",
        },
      ],
      context: ctx(55, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a helpful, harmless, and honest assistant. Answer questions clearly and concisely.", 45),
        cs("msg-u1", "User Message", "message-user", "What is the capital of France?", 10, { isNew: true }),
      ], "Two pieces in the context: the system prompt and your message. ~55 tokens total."),
      delay: 2800,
    },
    {
      chat: {
        role: "assistant",
        content: "The capital of France is Paris. It has been the capital since the late 10th century and serves as the country's political, economic, and cultural center.",
      },
      api: [
        {
          label: "response",
          json: `{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "The capital of France is Paris. It has been the capital since the late 10th century and serves as the country's political, economic, and cultural center."
    }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 15,
    "output_tokens": 38
  }
}`,
          annotation: "The response comes back as structured data — not just plain text. The app that shows you the chat formats it into what you see on screen.",
        },
      ],
      context: ctx(93, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a helpful, harmless, and honest assistant.", 45),
        cs("msg-u1", "User Message", "message-user", "What is the capital of France?", 10),
        cs("msg-a1", "Assistant Response", "message-assistant", "The capital of France is Paris...", 38, { isNew: true }),
      ], "After one exchange: ~93 tokens. The next request will include all of this plus your new message."),
      delay: 3000,
    },
  ],
};

// ─── Scenario 2: Tool Use ───

const toolUse: Scenario = {
  id: "tool-use",
  title: "tool use",
  intro: {
    label: "tools & actions",
    heading: "How Models Use External Tools",
    description: "Models can't browse the web or check the weather on their own. Instead, they request a function call, wait for the result, then respond. This back-and-forth is how ChatGPT's web search, code execution, and file uploads actually work.",
  },
  steps: [
    {
      chat: {
        role: "user",
        content: "What's the weather like in Santa Monica right now?",
      },
      api: [
        {
          label: "request",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "tools": [
    {
      "name": "get_weather",
      "description": "Get current weather for a location",
      "input_schema": {
        "type": "object",
        "properties": {
          "location": { "type": "string" }
        },
        "required": ["location"]
      }
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "What's the weather like in Santa Monica right now?"
    }
  ]
}`,
          highlightLines: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
          annotation: "The request includes a menu of tools the model is allowed to use. Each tool has a name, a description of what it does, and a definition of what inputs it needs.",
        },
      ],
      context: ctx(260, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a helpful assistant.", 30),
        cs("tools", "Tool Definitions (1 tool)", "tool-definitions", "get_weather — Get current weather for a location", 210),
        cs("msg-u1", "User Message", "message-user", "What's the weather like in Santa Monica right now?", 20, { isNew: true }),
      ], "System prompt + 1 tool definition + your message. Even a single tool adds ~210 tokens of schema."),
      delay: 3000,
    },
    {
      chat: {
        role: "tool-call",
        content: 'get_weather({ "location": "Santa Monica, CA" })',
        toolName: "get_weather",
      },
      api: [
        {
          label: "response (tool_use)",
          json: `{
  "role": "assistant",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_01A09q90qw90lq917835lq9",
      "name": "get_weather",
      "input": {
        "location": "Santa Monica, CA"
      }
    }
  ],
  "stop_reason": "tool_use"
}`,
          highlightLines: [4, 5, 6, 7, 8, 9, 10],
          annotation: "Instead of text, the model returns a tool_use block. stop_reason is \"tool_use\" — it's waiting for the result.",
        },
      ],
      context: ctx(310, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a helpful assistant.", 30),
        cs("tools", "Tool Definitions (1 tool)", "tool-definitions", "get_weather — Get current weather for a location", 210),
        cs("msg-u1", "User Message", "message-user", "What's the weather like in Santa Monica right now?", 20),
        cs("msg-tc1", "Tool Call: get_weather", "message-tool-call", 'get_weather({ location: "Santa Monica, CA" })', 50, { isNew: true }),
      ], "The model's tool call is now part of the conversation. It stays in context for the next request."),
      delay: 2500,
    },
    {
      chat: {
        role: "tool-result",
        content: '{ "temp_f": 72, "condition": "Sunny", "humidity": 65, "wind_mph": 8 }',
        toolName: "get_weather",
      },
      api: [
        {
          label: "tool_result (sent back)",
          json: `{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
      "content": "{ \\"temp_f\\": 72, \\"condition\\": \\"Sunny\\", \\"humidity\\": 65, \\"wind_mph\\": 8 }"
    }
  ]
}`,
          annotation: "The model can't run tools itself — the host app executes the function, then passes the real data back for the model to use.",
        },
      ],
      context: ctx(370, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a helpful assistant.", 30),
        cs("tools", "Tool Definitions (1 tool)", "tool-definitions", "get_weather — Get current weather for a location", 210),
        cs("msg-u1", "User Message", "message-user", "What's the weather like in Santa Monica right now?", 20),
        cs("msg-tc1", "Tool Call: get_weather", "message-tool-call", 'get_weather({ location: "Santa Monica, CA" })', 50),
        cs("msg-tr1", "Tool Result: get_weather", "message-tool-result", '{ temp_f: 72, condition: "Sunny", humidity: 65, wind_mph: 8 }', 60, { isNew: true }),
      ], "The tool result joins the context. One tool round-trip added ~110 tokens (the call + the result)."),
      delay: 2800,
    },
    {
      chat: {
        role: "assistant",
        content: "It's a beautiful day in Santa Monica! Currently 72°F and sunny with light winds at 8 mph. Humidity is at 65%, which is pretty typical for the coast. Perfect beach weather.",
      },
      api: [
        {
          label: "final response",
          json: `{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "It's a beautiful day in Santa Monica! Currently 72°F and sunny with light winds at 8 mph. Humidity is at 65%, which is pretty typical for the coast. Perfect beach weather."
    }
  ],
  "stop_reason": "end_turn"
}`,
          annotation: "Now the model has real data. It synthesizes a natural response from the structured tool result.",
        },
      ],
      context: ctx(420, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a helpful assistant.", 30),
        cs("tools", "Tool Definitions (1 tool)", "tool-definitions", "get_weather — Get current weather for a location", 210),
        cs("msg-u1", "User Message", "message-user", "What's the weather like in Santa Monica right now?", 20),
        cs("msg-tc1", "Tool Call: get_weather", "message-tool-call", 'get_weather({ location: "Santa Monica, CA" })', 50),
        cs("msg-tr1", "Tool Result: get_weather", "message-tool-result", '{ temp_f: 72, condition: "Sunny" }', 60),
        cs("msg-a1", "Assistant Response", "message-assistant", "It's a beautiful day in Santa Monica! 72°F and sunny...", 50, { isNew: true }),
      ], "One question, one tool call: ~420 tokens total. The entire exchange stays in context for the next turn."),
      delay: 3000,
    },
  ],
};

// ─── Scenario 3: Structured Output ───

const structuredOutput: Scenario = {
  id: "structured-output",
  title: "structured output",
  intro: {
    label: "structured data",
    heading: "Getting Organized Data Back",
    description: "Normally a model replies with freeform text. But you can define a schema — a template — that tells the model exactly what fields to fill in. Instead of prose, you get structured data an app can use directly.",
  },
  steps: [
    {
      chat: {
        role: "user",
        content: "Analyze the startup idea: an AI-powered meal planning app for people with dietary restrictions.",
      },
      api: [
        {
          label: "request (with tool schema)",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "tools": [
    {
      "name": "analyze_startup",
      "description": "Return structured analysis of a startup idea",
      "input_schema": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "viability": {
            "type": "string",
            "enum": ["high", "medium", "low"]
          },
          "market_size": { "type": "string" },
          "strengths": {
            "type": "array",
            "items": { "type": "string" }
          },
          "risks": {
            "type": "array",
            "items": { "type": "string" }
          },
          "verdict": { "type": "string" }
        },
        "required": ["name", "viability", "market_size", "strengths", "risks", "verdict"]
      }
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "Analyze the startup idea: an AI-powered meal planning app for people with dietary restrictions."
    }
  ]
}`,
          highlightLines: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
          annotation: "The request includes a template defining exactly what fields the model must fill in — name, viability, strengths, risks. Instead of freeform text, you get organized data.",
        },
      ],
      delay: 3500,
    },
    {
      chat: {
        role: "tool-call",
        content: 'analyze_startup({ name: "DietAI", viability: "high", market_size: "$4.5B", strengths: [...], risks: [...] })',
        toolName: "analyze_startup",
      },
      api: [
        {
          label: "response (structured)",
          json: `{
  "content": [
    {
      "type": "tool_use",
      "name": "analyze_startup",
      "input": {
        "name": "DietAI",
        "viability": "high",
        "market_size": "$4.5B by 2028",
        "strengths": [
          "Large addressable market — 32M Americans have food allergies",
          "AI can personalize at scale (impossible manually)",
          "Recurring revenue model (subscriptions)",
          "Defensible data moat over time"
        ],
        "risks": [
          "Liability if meal plans cause allergic reactions",
          "High customer acquisition cost in health/wellness",
          "Competing with free content (blogs, social media)",
          "Regulatory complexity around dietary health claims"
        ],
        "verdict": "Strong idea with real demand. Key challenge is trust and liability — users need to feel safe following AI-generated meal plans for serious dietary restrictions."
      }
    }
  ],
  "stop_reason": "tool_use"
}`,
          highlightLines: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
          annotation: "Every field comes back filled in and organized. The app can display this as a card, chart, or table — the model provided the data, the app controls the layout.",
        },
      ],
      delay: 3500,
    },
    {
      chat: {
        role: "assistant",
        content: "✦ DietAI — Viability: HIGH\n\nMarket: $4.5B by 2028 · 32M Americans with food allergies\n\nStrengths: AI personalization at scale, recurring revenue, defensible data moat\n\nKey risk: Liability around allergic reactions. Users need to trust AI-generated plans for serious restrictions.\n\nVerdict: Strong idea. Solve the trust problem first.",
      },
      api: [
        {
          label: "rendered by your app",
          json: `// This isn't another API call —
// your app reads the structured fields
// and renders them however you want:

const analysis = response.content[0].input;

<Card>
  <h3>{analysis.name}</h3>
  <Badge>{analysis.viability}</Badge>
  <p>Market: {analysis.market_size}</p>
  <List items={analysis.strengths} />
  <List items={analysis.risks} />
  <p>{analysis.verdict}</p>
</Card>`,
          annotation: "This is the key idea: the model provides structured information, and the application decides how to display it. That's how products like Notion AI and Perplexity show formatted results.",
        },
      ],
      delay: 3000,
    },
  ],
};

// ─── Scenario 4: Agent Loop ───

const agentLoop: Scenario = {
  id: "agent-loop",
  title: "agent loop",
  intro: {
    label: "agents",
    heading: "A Model That Takes Multiple Steps",
    description: "An agent is a model that can use tools in a loop — reading files, making changes, and checking its own work. Instead of answering in one shot, it plans, acts, observes, and repeats until the task is done.",
  },
  steps: [
    {
      chat: {
        role: "user",
        content: "Add a dark mode toggle button to the navigation bar.",
      },
      api: [
        {
          label: "request",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "system": "You are a coding assistant. You have access to tools for reading, writing, and running files.",
  "tools": [
    { "name": "read_file", "description": "Read a file from the project" },
    { "name": "edit_file", "description": "Edit a file with a diff" },
    { "name": "run_command", "description": "Run a shell command" }
  ],
  "messages": [
    {
      "role": "user",
      "content": "Add a dark mode toggle button to the navigation bar."
    }
  ]
}`,
          annotation: "The agent has 3 tools: read, edit, and run. It decides which to use and in what order.",
        },
      ],
      context: ctx(830, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a coding assistant with access to tools for reading, writing, and running files.", 50),
        cs("tools", "Tool Definitions (3 tools)", "tool-definitions", "read_file, edit_file, run_command", 750),
        cs("msg-u1", "User Message", "message-user", "Add a dark mode toggle button to the navigation bar.", 30, { isNew: true }),
      ], "System prompt + 3 tool definitions + your message. ~830 tokens to start."),
      delay: 3000,
    },
    {
      chat: {
        role: "thinking",
        content: "I need to understand the current nav structure first. Let me read the Nav component to see what we're working with.",
      },
      api: [
        {
          label: "response (tool_use)",
          json: `{
  "content": [
    {
      "type": "text",
      "text": "I need to understand the current nav structure first."
    },
    {
      "type": "tool_use",
      "name": "read_file",
      "input": { "path": "src/components/Nav.tsx" }
    }
  ],
  "stop_reason": "tool_use"
}`,
          annotation: "The model thinks out loud, then decides to read a file. It can reason and act in a single response — thinking and doing at the same time.",
        },
      ],
      context: ctx(920, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a coding assistant...", 50),
        cs("tools", "Tool Definitions (3 tools)", "tool-definitions", "read_file, edit_file, run_command", 750),
        cs("msg-u1", "User Message", "message-user", "Add a dark mode toggle button to the navigation bar.", 30),
        cs("msg-tc1", "Tool Call: read_file", "message-tool-call", 'read_file({ path: "src/components/Nav.tsx" })', 40, { isNew: true }),
        cs("msg-think1", "Thinking", "message-assistant", "I need to understand the current nav structure first.", 50, { isNew: true }),
      ], "The model's reasoning and tool call are added to context. Each step accumulates."),
      delay: 2500,
    },
    {
      chat: {
        role: "tool-result",
        content: "Nav.tsx → export function Nav() { ... links, mobile menu, sticky panel ... }",
        toolName: "read_file",
      },
      api: [
        {
          label: "tool_result",
          json: `{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_nav_read",
      "content": "export function Nav() {\\n  const pathname = usePathname();\\n  return (\\n    <nav className=\\"panel sticky top-4\\">\\n      <Link href=\\"/\\">Blake Thomson</Link>\\n      <div className=\\"flex gap-6\\">\\n        {links.map(l => <Link .../>)}\\n      </div>\\n    </nav>\\n  );\\n}"
    }
  ]
}`,
          annotation: "The file contents come back. Now the agent knows the nav structure.",
        },
      ],
      context: ctx(1120, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a coding assistant...", 50),
        cs("tools", "Tool Definitions (3 tools)", "tool-definitions", "read_file, edit_file, run_command", 750),
        cs("msg-u1", "User Message", "message-user", "Add a dark mode toggle button...", 30),
        cs("msg-think1", "Thinking", "message-assistant", "I need to understand the nav structure first.", 50),
        cs("msg-tc1", "Tool Call: read_file", "message-tool-call", 'read_file({ path: "Nav.tsx" })', 40),
        cs("msg-tr1", "Tool Result: Nav.tsx", "message-tool-result", "export function Nav() { ... links, mobile menu, sticky panel ... }", 200, { isNew: true }),
      ], "The file contents are now in context (~200 tokens). The agent can see the nav structure."),
      delay: 2500,
    },
    {
      chat: {
        role: "tool-call",
        content: 'edit_file({ path: "src/components/Nav.tsx", diff: "+import { useTheme } ...\\n+<button onClick={toggle}>☾/☀</button>" })',
        toolName: "edit_file",
      },
      api: [
        {
          label: "response (edit tool_use)",
          json: `{
  "content": [
    {
      "type": "text",
      "text": "I'll add a theme toggle button after the nav links."
    },
    {
      "type": "tool_use",
      "name": "edit_file",
      "input": {
        "path": "src/components/Nav.tsx",
        "old_string": "{links.map(l => <Link .../>)}\\n      </div>",
        "new_string": "{links.map(l => <Link .../>)}\\n        <button onClick={toggle} aria-label=\\"Toggle dark mode\\">\\n          {theme === 'dark' ? '☀' : '☾'}\\n        </button>\\n      </div>"
      }
    }
  ],
  "stop_reason": "tool_use"
}`,
          highlightLines: [10, 11, 12, 13, 14],
          annotation: "The agent writes a precise edit — old string to find, new string to replace it with.",
        },
      ],
      context: ctx(1350, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a coding assistant...", 50),
        cs("tools", "Tool Definitions (3 tools)", "tool-definitions", "read_file, edit_file, run_command", 750),
        cs("msg-u1", "User Message", "message-user", "Add a dark mode toggle button...", 30),
        cs("msg-think1", "Thinking", "message-assistant", "I need to understand the nav structure first.", 50),
        cs("msg-tc1", "Tool Call: read_file", "message-tool-call", "read_file(Nav.tsx)", 40),
        cs("msg-tr1", "Tool Result: Nav.tsx", "message-tool-result", "export function Nav() { ... }", 200),
        cs("msg-tc2", "Tool Call: edit_file", "message-tool-call", 'edit_file({ path: "Nav.tsx", old_string: "...", new_string: "..." })', 180, { isNew: true }),
        cs("msg-think2", "Thinking", "message-assistant", "I'll add a theme toggle button after the nav links.", 50, { isNew: true }),
      ], "The edit command is large — it contains both the old and new code. Context growing steadily."),
      delay: 3000,
    },
    {
      chat: {
        role: "tool-call",
        content: 'run_command({ command: "npm run build" })\n→ ✓ Compiled successfully. No errors.',
        toolName: "run_command",
      },
      api: [
        {
          label: "verify (tool_use → result)",
          json: `{
  "content": [
    {
      "type": "tool_use",
      "name": "run_command",
      "input": { "command": "npm run build" }
    }
  ]
}

// tool_result:
{
  "content": "✓ Compiled successfully in 2.3s\\nNo TypeScript errors\\nNo lint warnings"
}`,
          annotation: "The agent verifies its work by running a build. Clean output — no errors.",
        },
      ],
      context: ctx(1480, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a coding assistant...", 50),
        cs("tools", "Tool Definitions (3 tools)", "tool-definitions", "read_file, edit_file, run_command", 750),
        cs("msg-u1", "User Message", "message-user", "Add a dark mode toggle button...", 30),
        cs("msg-think1", "Thinking", "message-assistant", "Understand nav structure first.", 50),
        cs("msg-tc1", "Tool Call: read_file", "message-tool-call", "read_file(Nav.tsx)", 40),
        cs("msg-tr1", "Tool Result: Nav.tsx", "message-tool-result", "export function Nav() { ... }", 200),
        cs("msg-think2", "Thinking", "message-assistant", "Add toggle after nav links.", 50),
        cs("msg-tc2", "Tool Call: edit_file", "message-tool-call", "edit_file(Nav.tsx, ...)", 180),
        cs("msg-tc3", "Tool Call: run_command", "message-tool-call", 'run_command({ command: "npm run build" })', 30, { isNew: true }),
        cs("msg-tr3", "Tool Result: build", "message-tool-result", "Compiled successfully. No errors.", 50, { isNew: true }),
      ], "Build check added. 4 tool round-trips: read → edit → build → verify. Context at ~1,480 tokens."),
      delay: 2500,
    },
    {
      chat: {
        role: "assistant",
        content: "Done! I added a dark mode toggle to the nav bar. Here's what I did:\n\n• Imported the useTheme hook from ThemeProvider\n• Added a toggle button after the nav links (☾/☀ icons)\n• The button calls toggle() which switches between light and dark\n• Build passes with zero errors\n\nThe toggle appears on both desktop and mobile views.",
      },
      api: [
        {
          label: "final response",
          json: `{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Done! I added a dark mode toggle..."
    }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 1847,
    "output_tokens": 156
  }
}`,
          annotation: "The agent loop is complete. 4 tool calls, 1 final response. Total: ~1,600 tokens.",
        },
      ],
      context: ctx(1630, 200000, [
        cs("sys", "System Prompt", "system-prompt", "You are a coding assistant...", 50),
        cs("tools", "Tool Definitions (3 tools)", "tool-definitions", "read_file, edit_file, run_command", 750),
        cs("msg-u1", "User Message", "message-user", "Add a dark mode toggle button...", 30),
        cs("msg-think1", "Thinking", "message-assistant", "Understand nav structure first.", 50),
        cs("msg-tc1", "Tool Call: read_file", "message-tool-call", "read_file(Nav.tsx)", 40),
        cs("msg-tr1", "Tool Result: Nav.tsx", "message-tool-result", "export function Nav() { ... }", 200),
        cs("msg-think2", "Thinking", "message-assistant", "Add toggle after nav links.", 50),
        cs("msg-tc2", "Tool Call: edit_file", "message-tool-call", "edit_file(Nav.tsx, ...)", 180),
        cs("msg-tc3", "Tool Call: run_command", "message-tool-call", "npm run build", 30),
        cs("msg-tr3", "Tool Result: build", "message-tool-result", "Compiled successfully.", 50),
        cs("msg-a1", "Final Response", "message-assistant", "Done! Added dark mode toggle to nav bar...", 150, { isNew: true }),
      ], "Complete agent loop: ~1,630 tokens. One task generated 11 context sections. Imagine a 50-task session."),
      delay: 3000,
    },
  ],
};

// ─── Export all scenarios ───

export const scenarios: Scenario[] = [
  simpleChat,
  toolUse,
  structuredOutput,
  agentLoop,
];
