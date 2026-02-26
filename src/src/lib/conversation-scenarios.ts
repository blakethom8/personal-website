// ─── Types ───

export interface ChatMessage {
  role: "user" | "assistant" | "tool-call" | "tool-result" | "thinking";
  content: string;
  toolName?: string;
}

export interface ApiBlock {
  label: string;
  json: string;
  highlightLines?: number[];
  annotation?: string;
}

export interface ConversationStep {
  chat: ChatMessage;
  api: ApiBlock[];
  delay?: number; // ms before auto-advance, default 1800
}

export interface Scenario {
  id: string;
  title: string;
  steps: ConversationStep[];
}

// ─── Scenario 1: Simple Chat ───

const simpleChat: Scenario = {
  id: "simple-chat",
  title: "simple chat",
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
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ]
}`,
          annotation: "A simple request: model, max_tokens, and a single user message.",
        },
      ],
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
          annotation: "Text response. The model returns content as an array — each element has a type.",
        },
      ],
      delay: 3000,
    },
  ],
};

// ─── Scenario 2: Tool Use ───

const toolUse: Scenario = {
  id: "tool-use",
  title: "tool use",
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
          annotation: "The tools array tells the model what functions it can call. Each tool has a name, description, and JSON schema.",
        },
      ],
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
          annotation: "Your app calls the real API, then sends the result back to the model as a tool_result message.",
        },
      ],
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
      delay: 3000,
    },
  ],
};

// ─── Scenario 3: Structured Output ───

const structuredOutput: Scenario = {
  id: "structured-output",
  title: "structured output",
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
          annotation: "The tool schema defines exactly what fields the model must return. This is how you get typed, parseable data instead of prose.",
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
          annotation: "Every field comes back typed and structured. Your app can render this directly — no parsing, no guessing.",
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
          annotation: "This is the unlock. Structured output means your app controls the presentation — not the LLM.",
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
          annotation: "The model thinks out loud, then decides to read a file. Two content blocks in one response.",
        },
      ],
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
          annotation: "The agent loop is complete. 4 tool calls, 1 final response. Total: ~2K tokens.",
        },
      ],
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
