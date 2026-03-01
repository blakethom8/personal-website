// Context Window Simulator Scenarios
// These scenarios teach how the LLM context window works:
// what's in it, how it grows, and strategies for managing it.

import type { Scenario, ContextSection, ScenarioTabItem, ScenarioGroup } from "./conversation-scenarios";

// ─── Helpers ───

function sections(...items: ContextSection[]): ContextSection[] {
  return items;
}

function s(
  id: string,
  label: string,
  type: ContextSection["type"],
  content: string,
  tokenCount: number,
  flags?: { isNew?: boolean; isRemoved?: boolean; isSummary?: boolean }
): ContextSection {
  return { id, label, type, content, tokenCount, ...flags };
}

// ─── Scenario 1: What's in the Window ───
// Builds up initial context from nothing. Each step reveals another layer.

const whatsInTheWindow: Scenario = {
  id: "context-whats-in-window",
  title: "what's in the window",
  intro: {
    label: "understanding context",
    heading: "What's Inside the Context Window",
    description: "Every API call carries a hidden payload — the context window. Before any conversation begins, the system prompt, project instructions, and tool definitions are already consuming tokens. This simulation reveals each layer, one at a time.",
  },
  steps: [
    // Step 1: System prompt
    {
      chat: {
        role: "narrator",
        content:
          "Every API call starts with a system prompt — instructions that tell the model who it is and how to behave. This is always the first thing in the context window.",
      },
      api: [
        {
          label: "what the model sees",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 8096,
  "system": "You are a helpful coding assistant. Follow the user's instructions carefully. Think step by step before responding.",
  "messages": []
}`,
          annotation:
            "Before any conversation, the system prompt is already loaded. ~500 tokens used.",
        },
      ],
      context: {
        tokenCount: 500,
        maxTokens: 200000,
        payload: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 8096,
  "system": "You are a helpful coding assistant. Follow the user's instructions carefully. Think step by step before responding.",
  "messages": []
}`,
        sections: sections(
          s(
            "sys",
            "System Prompt",
            "system-prompt",
            "You are a helpful coding assistant. Follow the user's instructions carefully. Think step by step before responding.",
            500,
            { isNew: true }
          )
        ),
        annotation: "The system prompt is always first. ~500 tokens before anyone says a word.",
      },
      delay: 3500,
    },
    // Step 2: CLAUDE.md / project instructions
    {
      chat: {
        role: "narrator",
        content:
          "Tools like Claude Code inject project instructions (CLAUDE.md files, memory, codebase context) into the system prompt. These can be thousands of tokens.",
      },
      api: [
        {
          label: "what the model sees",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 8096,
  "system": "You are a helpful coding assistant.\\n\\n# Project Instructions (CLAUDE.md)\\n\\n## Stack\\n- Next.js 15, App Router\\n- TypeScript strict mode\\n- Tailwind CSS with design tokens\\n- Docker deployment on Hetzner\\n\\n## Conventions\\n- Prefer server components by default\\n- Use 'use client' only when needed\\n- Follow existing patterns in the codebase\\n- Run npm run build before committing\\n\\n## File Structure\\nsrc/app/ — pages and routes\\nsrc/components/ — React components\\nsrc/lib/ — utilities and data\\nsrc/hooks/ — custom React hooks\\n\\n[... 2,200 more tokens of project context ...]",
  "messages": []
}`,
          highlightLines: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
          annotation:
            "Project instructions can easily be 2,000–5,000 tokens. They're included on every single API call.",
        },
      ],
      context: {
        tokenCount: 3200,
        maxTokens: 200000,
        payload: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 8096,
  "system": "You are a helpful coding assistant.\\n\\n# Project Instructions (CLAUDE.md)\\n\\n## Stack\\n- Next.js 15, App Router\\n- TypeScript strict mode\\n- Tailwind CSS with design tokens\\n- Docker deployment on Hetzner\\n\\n## Conventions\\n- Prefer server components\\n- Use 'use client' only when needed\\n- Follow existing patterns\\n- Run npm run build before committing\\n\\n## File Structure\\nsrc/app/ — pages\\nsrc/components/ — React components\\nsrc/lib/ — utilities\\nsrc/hooks/ — custom hooks\\n\\n[... 2,200 more tokens of project context ...]",
  "messages": []
}`,
        sections: sections(
          s(
            "sys",
            "System Prompt",
            "system-prompt",
            "You are a helpful coding assistant. Follow the user's instructions carefully.",
            500
          ),
          s(
            "inst",
            "Project Instructions (CLAUDE.md)",
            "instructions",
            "Stack: Next.js 15, TypeScript, Tailwind, Docker on Hetzner\nConventions: Server components by default, strict mode, existing patterns\nFile structure: src/app, src/components, src/lib, src/hooks\n[... 2,200 more tokens of project context ...]",
            2700,
            { isNew: true }
          )
        ),
        annotation:
          "Project instructions added ~2,700 tokens. We're at 3,200 tokens and nobody has said anything yet.",
      },
      delay: 3500,
    },
    // Step 3: Tool definitions
    {
      chat: {
        role: "narrator",
        content:
          "If the model has access to tools (reading files, running commands, searching), their definitions are included too. Each tool's name, description, and input schema takes space.",
      },
      api: [
        {
          label: "what the model sees",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 8096,
  "system": "[system prompt + CLAUDE.md — 3,200 tokens]",
  "tools": [
    {
      "name": "Read",
      "description": "Read a file from the filesystem",
      "input_schema": {
        "type": "object",
        "properties": {
          "file_path": { "type": "string", "description": "Absolute path to file" },
          "offset": { "type": "number", "description": "Line to start from" },
          "limit": { "type": "number", "description": "Number of lines" }
        },
        "required": ["file_path"]
      }
    },
    {
      "name": "Edit",
      "description": "Replace text in a file",
      "input_schema": {
        "type": "object",
        "properties": {
          "file_path": { "type": "string" },
          "old_string": { "type": "string" },
          "new_string": { "type": "string" }
        },
        "required": ["file_path", "old_string", "new_string"]
      }
    },
    {
      "name": "Bash",
      "description": "Execute a shell command",
      "input_schema": {
        "type": "object",
        "properties": {
          "command": { "type": "string", "description": "The command to run" },
          "timeout": { "type": "number" }
        },
        "required": ["command"]
      }
    }
  ],
  "messages": []
}`,
          highlightLines: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42],
          annotation:
            "3 tools added ~2,600 tokens. Real agents often have 10-30 tools — that's 8,000-25,000 tokens just for tool definitions.",
        },
      ],
      context: {
        tokenCount: 5800,
        maxTokens: 200000,
        payload: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 8096,
  "system": "[system prompt + CLAUDE.md — 3,200 tokens]",
  "tools": [
    {
      "name": "Read",
      "description": "Read a file from the filesystem",
      "input_schema": { "properties": { "file_path": {}, "offset": {}, "limit": {} } }
    },
    {
      "name": "Edit",
      "description": "Replace text in a file",
      "input_schema": { "properties": { "file_path": {}, "old_string": {}, "new_string": {} } }
    },
    {
      "name": "Bash",
      "description": "Execute a shell command",
      "input_schema": { "properties": { "command": {}, "timeout": {} } }
    }
  ],
  "messages": []
}`,
        sections: sections(
          s(
            "sys",
            "System Prompt",
            "system-prompt",
            "You are a helpful coding assistant. Follow the user's instructions carefully.",
            500
          ),
          s(
            "inst",
            "Project Instructions (CLAUDE.md)",
            "instructions",
            "Stack: Next.js 15, TypeScript, Tailwind, Docker on Hetzner\nConventions: Server components by default, strict mode, existing patterns\n[... 2,200 more tokens ...]",
            2700
          ),
          s(
            "tools",
            "Tool Definitions (3 tools)",
            "tool-definitions",
            "Read — Read a file from the filesystem (file_path, offset, limit)\nEdit — Replace text in a file (file_path, old_string, new_string)\nBash — Execute a shell command (command, timeout)",
            2600,
            { isNew: true }
          )
        ),
        annotation:
          "Before you say a single word, ~5,800 tokens of context are already used. That's about 3% of a 200K window — just for setup.",
      },
      delay: 3500,
    },
    // Step 4: First user message
    {
      chat: {
        role: "user",
        content: "What did we work on yesterday?",
      },
      api: [
        {
          label: "what the model sees",
          json: `{
  "system": "[system prompt + CLAUDE.md — 3,200 tokens]",
  "tools": "[3 tool definitions — 2,600 tokens]",
  "messages": [
    {
      "role": "user",
      "content": "What did we work on yesterday?"
    }
  ]
}`,
          highlightLines: [4, 5, 6, 7, 8],
          annotation:
            "The first user message is tiny — ~10 tokens. But it's appended to everything above.",
        },
      ],
      context: {
        tokenCount: 5850,
        maxTokens: 200000,
        payload: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 8096,
  "system": "[system prompt + CLAUDE.md — 3,200 tokens]",
  "tools": "[3 tool definitions — 2,600 tokens]",
  "messages": [
    {
      "role": "user",
      "content": "What did we work on yesterday?"
    }
  ]
}`,
        sections: sections(
          s(
            "sys",
            "System Prompt",
            "system-prompt",
            "You are a helpful coding assistant. Follow the user's instructions carefully.",
            500
          ),
          s(
            "inst",
            "Project Instructions (CLAUDE.md)",
            "instructions",
            "Stack: Next.js 15, TypeScript, Tailwind, Docker on Hetzner\nConventions: Server components by default, strict mode...\n[... 2,200 more tokens ...]",
            2700
          ),
          s(
            "tools",
            "Tool Definitions (3 tools)",
            "tool-definitions",
            "Read, Edit, Bash — schemas and descriptions",
            2600
          ),
          s(
            "msg-u1",
            "User Message #1",
            "message-user",
            "What did we work on yesterday?",
            50,
            { isNew: true }
          )
        ),
        annotation:
          "Your first message adds ~50 tokens. The model receives 5,850 tokens total to answer a 7-word question.",
      },
      delay: 3000,
    },
    // Step 5: Tool call + result
    {
      chat: {
        role: "tool-call",
        content: 'Read({ file_path: "memory/2026-02-28.md" })',
        toolName: "Read",
      },
      api: [
        {
          label: "what the model sees (after tool round-trip)",
          json: `{
  "system": "[3,200 tokens]",
  "tools": "[2,600 tokens]",
  "messages": [
    { "role": "user", "content": "What did we work on yesterday?" },
    {
      "role": "assistant",
      "content": [
        {
          "type": "tool_use",
          "name": "Read",
          "input": { "file_path": "memory/2026-02-28.md" }
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "tool_result",
          "tool_use_id": "toolu_01A09q...",
          "content": "# 2026-02-28\\n\\n## Work\\n- Context window visualization\\n- Added 5 scenarios with token tracking\\n- Built ContextModal + AnnotatedView..."
        }
      ]
    }
  ]
}`,
          highlightLines: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
          annotation:
            "One tool round-trip added 3 messages: the original, the tool call, and the result. ~350 new tokens.",
        },
      ],
      context: {
        tokenCount: 6200,
        maxTokens: 200000,
        payload: `{
  "system": "[3,200 tokens]",
  "tools": "[2,600 tokens]",
  "messages": [
    { "role": "user", "content": "What did we work on yesterday?" },
    { "role": "assistant", "content": [{ "type": "tool_use", "name": "Read", "input": { "file_path": "memory/2026-02-28.md" } }] },
    { "role": "user", "content": [{ "type": "tool_result", "content": "# 2026-02-28\\n## Work\\n- Context window visualization\\n- Added 5 scenarios..." }] }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 500),
          s(
            "inst",
            "Project Instructions",
            "instructions",
            "Stack, conventions, file structure...\n[... 2,200 more tokens ...]",
            2700
          ),
          s("tools", "Tool Definitions (3 tools)", "tool-definitions", "Read, Edit, Bash", 2600),
          s("msg-u1", "User Message #1", "message-user", "What did we work on yesterday?", 50),
          s(
            "msg-tc1",
            "Tool Call: Read",
            "message-tool-call",
            'Read({ file_path: "memory/2026-02-28.md" })',
            80,
            { isNew: true }
          ),
          s(
            "msg-tr1",
            "Tool Result: Read",
            "message-tool-result",
            "# 2026-02-28\n## Work\n- Context window visualization\n- Added 5 scenarios with token tracking\n- Built ContextModal + AnnotatedView...",
            270,
            { isNew: true }
          )
        ),
        annotation:
          "Tool calls are expensive — the model's call AND the result both stay in context. Each tool round-trip adds hundreds of tokens.",
      },
      delay: 3000,
    },
    // Step 6: Assistant response
    {
      chat: {
        role: "assistant",
        content:
          "Yesterday you worked on the context window visualization for the simulator. You added 5 scenarios with token tracking and built the ContextModal and AnnotatedView components. Solid progress on the educational side of the site.",
      },
      api: [
        {
          label: "what the model sees (complete)",
          json: `{
  "system": "[3,200 tokens]",
  "tools": "[2,600 tokens]",
  "messages": [
    { "role": "user", "content": "What did we work on yesterday?" },
    { "role": "assistant", "content": [{ "type": "tool_use", "name": "Read", "input": {...} }] },
    { "role": "user", "content": [{ "type": "tool_result", "content": "# 2026-02-28..." }] },
    {
      "role": "assistant",
      "content": [
        {
          "type": "text",
          "text": "Yesterday you worked on the context window visualization..."
        }
      ]
    }
  ]
}`,
          highlightLines: [8, 9, 10, 11, 12, 13, 14],
          annotation:
            "After one exchange: ~6,450 tokens. About 3% of a 200K window. The next API call will include ALL of this plus whatever new message comes next.",
        },
      ],
      context: {
        tokenCount: 6450,
        maxTokens: 200000,
        payload: `{
  "system": "[3,200 tokens]",
  "tools": "[2,600 tokens]",
  "messages": [
    { "role": "user", "content": "What did we work on yesterday?" },
    { "role": "assistant", "content": [{ "type": "tool_use", "name": "Read", "input": { "file_path": "memory/2026-02-28.md" } }] },
    { "role": "user", "content": [{ "type": "tool_result", "content": "# 2026-02-28\\n## Work\\n- Context window visualization..." }] },
    { "role": "assistant", "content": [{ "type": "text", "text": "Yesterday you worked on the context window visualization for the simulator. You added 5 scenarios with token tracking and built the ContextModal and AnnotatedView components." }] }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 500),
          s(
            "inst",
            "Project Instructions",
            "instructions",
            "Stack, conventions, file structure...\n[... 2,200 more tokens ...]",
            2700
          ),
          s("tools", "Tool Definitions (3 tools)", "tool-definitions", "Read, Edit, Bash", 2600),
          s("msg-u1", "User Message #1", "message-user", "What did we work on yesterday?", 50),
          s(
            "msg-tc1",
            "Tool Call: Read",
            "message-tool-call",
            'Read({ file_path: "memory/2026-02-28.md" })',
            80
          ),
          s(
            "msg-tr1",
            "Tool Result: Read",
            "message-tool-result",
            "# 2026-02-28\n## Work\n- Context window visualization...",
            270
          ),
          s(
            "msg-a1",
            "Assistant Response #1",
            "message-assistant",
            "Yesterday you worked on the context window visualization for the simulator. You added 5 scenarios with token tracking and built the ContextModal and AnnotatedView components.",
            250,
            { isNew: true }
          )
        ),
        annotation:
          "After one exchange: ~6,450 tokens total. About 3% of 200K. Every future API call includes all of this — context only grows.",
      },
      delay: 3000,
    },
  ],
};

// ─── Scenario 2: Multi-Turn Growth ───
// A road trip planning conversation showing linear context growth.

const multiTurnGrowth: Scenario = {
  id: "context-multi-turn",
  title: "multi-turn growth",
  intro: {
    label: "token accumulation",
    heading: "How Context Grows With Every Message",
    description: "Each message in a conversation adds to the context window — and it grows faster than you'd expect. Watch a road trip planning session accumulate tokens in real time, and see why long conversations eventually hit a wall.",
  },
  steps: [
    {
      chat: {
        role: "user",
        content: "I want to plan a 5-day road trip from LA to Portland along the coast.",
      },
      api: [
        {
          label: "request — turn 1",
          json: `{
  "system": "[system prompt — 400 tokens]",
  "messages": [
    { "role": "user", "content": "I want to plan a 5-day road trip from LA to Portland along the coast." }
  ]
}`,
          annotation: "First turn. Context is small: system prompt + one message.",
        },
      ],
      context: {
        tokenCount: 430,
        maxTokens: 200000,
        payload: `{
  "system": "You are a helpful travel planning assistant.",
  "messages": [
    { "role": "user", "content": "I want to plan a 5-day road trip from LA to Portland along the coast." }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful travel planning assistant.", 400),
          s(
            "msg-u1",
            "User Message #1",
            "message-user",
            "I want to plan a 5-day road trip from LA to Portland along the coast.",
            30,
            { isNew: true }
          )
        ),
        annotation: "Turn 1: ~430 tokens. Tiny.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "assistant",
        content:
          "Great choice! The Pacific Coast Highway is one of the most scenic drives in the US. Here's a rough itinerary:\n\nDay 1: LA → Santa Barbara (95 mi)\nDay 2: Santa Barbara → Big Sur (230 mi)\nDay 3: Big Sur → Monterey → Santa Cruz (75 mi)\nDay 4: Santa Cruz → SF → Mendocino (180 mi)\nDay 5: Mendocino → Redwoods → Portland (450 mi)\n\nWant me to flesh out any of these days with specific stops, restaurants, and lodging?",
      },
      api: [
        {
          label: "response — turn 1",
          json: `{
  "messages": [
    { "role": "user", "content": "I want to plan a 5-day road trip..." },
    {
      "role": "assistant",
      "content": "Great choice! The Pacific Coast Highway is one of the most scenic drives... [5-day itinerary]"
    }
  ]
}`,
          annotation:
            "The response is ~180 tokens. On the NEXT call, both the question and this full answer will be included.",
        },
      ],
      context: {
        tokenCount: 610,
        maxTokens: 200000,
        payload: `{
  "system": "[400 tokens]",
  "messages": [
    { "role": "user", "content": "I want to plan a 5-day road trip from LA to Portland along the coast." },
    { "role": "assistant", "content": "Great choice! The Pacific Coast Highway is one of the most scenic drives in the US. Here's a rough itinerary:\\n\\nDay 1: LA → Santa Barbara (95 mi)\\nDay 2: Santa Barbara → Big Sur (230 mi)\\n..." }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful travel planning assistant.", 400),
          s("msg-u1", "User Message #1", "message-user", "I want to plan a 5-day road trip...", 30),
          s(
            "msg-a1",
            "Assistant Response #1",
            "message-assistant",
            "Great choice! The PCH is one of the most scenic drives... Day 1: LA → Santa Barbara, Day 2: Santa Barbara → Big Sur, Day 3: Big Sur → Monterey → Santa Cruz...",
            180,
            { isNew: true }
          )
        ),
        annotation: "Turn 1 complete: ~610 tokens. The full itinerary stays in context forever.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "user",
        content: "Yes! Flesh out Day 2 — I love hiking and seafood. Also, I'm traveling with a dog.",
      },
      api: [
        {
          label: "request — turn 2",
          json: `{
  "messages": [
    { "role": "user", "content": "I want to plan a 5-day road trip..." },
    { "role": "assistant", "content": "[full itinerary — 180 tokens]" },
    {
      "role": "user",
      "content": "Yes! Flesh out Day 2 — I love hiking and seafood. Also, I'm traveling with a dog."
    }
  ]
}`,
          highlightLines: [4, 5, 6, 7],
          annotation: "Turn 2 includes the ENTIRE turn 1. Every message ever sent is re-sent.",
        },
      ],
      context: {
        tokenCount: 660,
        maxTokens: 200000,
        payload: `{
  "system": "[400 tokens]",
  "messages": [
    { "role": "user", "content": "I want to plan a 5-day road trip from LA to Portland along the coast." },
    { "role": "assistant", "content": "[full itinerary]" },
    { "role": "user", "content": "Yes! Flesh out Day 2 — I love hiking and seafood. Also, I'm traveling with a dog." }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful travel planning assistant.", 400),
          s("msg-u1", "User Message #1", "message-user", "I want to plan a 5-day road trip...", 30),
          s(
            "msg-a1",
            "Assistant Response #1",
            "message-assistant",
            "Great choice! The PCH is one of the most scenic drives... [full itinerary]",
            180
          ),
          s(
            "msg-u2",
            "User Message #2",
            "message-user",
            "Yes! Flesh out Day 2 — I love hiking and seafood. Also, I'm traveling with a dog.",
            50,
            { isNew: true }
          )
        ),
        annotation: "Every message ever sent is included in the next API call. The context only grows.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "assistant",
        content:
          "Day 2: Santa Barbara → Big Sur (dog-friendly edition)\n\n🌅 Morning: Gaviota State Park — dog-friendly trails with ocean views (2mi hike)\n🐕 Tip: Dogs must be leashed on all state park trails\n\n🍽️ Lunch: San Luis Obispo — Novo Restaurant (dog-friendly patio, great clam chowder)\n\n🥾 Afternoon: Andrew Molera State Park in Big Sur — the best dog-friendly hike in Big Sur. 2.5mi loop to the beach.\n\n🦞 Dinner: Big Sur Roadhouse — local seafood, outdoor seating where dogs are welcome\n\n🏨 Stay: Big Sur Lodge — pet-friendly rooms ($30/night pet fee)\n\nDriving: ~230 miles total, but take it slow. The views between Cambria and Big Sur are the best part.",
      },
      api: [
        {
          label: "response — turn 2",
          json: `{
  "messages": [
    "... [all previous messages — 660 tokens]",
    {
      "role": "assistant",
      "content": "Day 2: Santa Barbara → Big Sur (dog-friendly edition)\\n\\n🌅 Morning: Gaviota State Park — dog-friendly trails... [full detailed itinerary]"
    }
  ]
}`,
          annotation:
            "A detailed response: ~350 tokens. Context is now over 1,000 tokens and climbing.",
        },
      ],
      context: {
        tokenCount: 1010,
        maxTokens: 200000,
        payload: `{
  "system": "[400 tokens]",
  "messages": [
    { "role": "user", "content": "I want to plan a 5-day road trip..." },
    { "role": "assistant", "content": "[full 5-day itinerary]" },
    { "role": "user", "content": "Flesh out Day 2 — I love hiking and seafood. Also, I'm traveling with a dog." },
    { "role": "assistant", "content": "Day 2: Santa Barbara → Big Sur (dog-friendly edition)\\n🌅 Morning: Gaviota State Park... [full detailed day plan]" }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful travel planning assistant.", 400),
          s("msg-u1", "User Message #1", "message-user", "I want to plan a 5-day road trip...", 30),
          s(
            "msg-a1",
            "Assistant Response #1",
            "message-assistant",
            "Great choice! The PCH is one of the most scenic drives... [full itinerary]",
            180
          ),
          s(
            "msg-u2",
            "User Message #2",
            "message-user",
            "Flesh out Day 2 — hiking and seafood, traveling with dog",
            50
          ),
          s(
            "msg-a2",
            "Assistant Response #2",
            "message-assistant",
            "Day 2: Santa Barbara → Big Sur (dog-friendly edition)\nMorning: Gaviota State Park, Lunch: Novo Restaurant, Afternoon: Andrew Molera SP, Dinner: Big Sur Roadhouse, Stay: Big Sur Lodge",
            350,
            { isNew: true }
          )
        ),
        annotation: "Two exchanges: ~1,010 tokens. The detailed Day 2 plan added 350 tokens alone.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "user",
        content:
          "What about Day 3? Same vibe — dog-friendly hikes and good food. Also, any recommendations for Monterey aquarium?",
      },
      api: [],
      context: {
        tokenCount: 1080,
        maxTokens: 200000,
        payload: `{
  "system": "[400 tokens]",
  "messages": [
    "[user: road trip plan]",
    "[assistant: 5-day itinerary]",
    "[user: flesh out day 2]",
    "[assistant: full day 2 plan]",
    { "role": "user", "content": "What about Day 3? Same vibe — dog-friendly hikes and good food. Also, any recommendations for Monterey aquarium?" }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful travel planning assistant.", 400),
          s("msg-u1", "User Message #1", "message-user", "I want to plan a 5-day road trip...", 30),
          s("msg-a1", "Assistant Response #1", "message-assistant", "[full 5-day itinerary]", 180),
          s("msg-u2", "User Message #2", "message-user", "Flesh out Day 2 — hiking, seafood, dog", 50),
          s("msg-a2", "Assistant Response #2", "message-assistant", "[full Day 2 plan]", 350),
          s(
            "msg-u3",
            "User Message #3",
            "message-user",
            "What about Day 3? Same vibe — dog-friendly hikes and good food. Also, any recommendations for Monterey aquarium?",
            70,
            { isNew: true }
          )
        ),
        annotation: "Each new question adds ~50-70 tokens. But the answers keep getting longer.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "assistant",
        content:
          "Day 3: Big Sur → Monterey → Santa Cruz\n\n🥾 Morning: Point Lobos SNR (dogs allowed on some trails) — stunning coastal views\n\n🐙 Late morning: Monterey Bay Aquarium — unfortunately no dogs inside. Options:\n• Book a 2-hour visit (arrive early, less crowded)\n• Some nearby kennels offer half-day boarding\n• Or one person stays with the dog at Fisherman's Wharf (also great!)\n\n🍽️ Lunch: Old Fisherman's Grotto — right on the wharf, dog-friendly patio, famous clam chowder\n\n🐕 Afternoon: Carmel Beach — one of the best off-leash dog beaches in California!\n\n🌮 Dinner: Santa Cruz — Tacos Moreno (local favorite, outdoor seating)\n\n🏨 Stay: Dream Inn Santa Cruz — oceanfront, pet-friendly ($50/night fee)\n\nDriving: ~75 miles. Short drive day = more time exploring.",
      },
      api: [],
      context: {
        tokenCount: 1500,
        maxTokens: 200000,
        payload: `{
  "system": "[400 tokens]",
  "messages": [
    "[turn 1: road trip plan + itinerary — 210 tokens]",
    "[turn 2: day 2 details — 400 tokens]",
    "[turn 3: day 3 request + response — 490 tokens]"
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful travel planning assistant.", 400),
          s("msg-u1", "User Message #1", "message-user", "I want to plan a 5-day road trip...", 30),
          s("msg-a1", "Assistant Response #1", "message-assistant", "[full 5-day itinerary]", 180),
          s("msg-u2", "User Message #2", "message-user", "Flesh out Day 2 — hiking, seafood, dog", 50),
          s("msg-a2", "Assistant Response #2", "message-assistant", "[full Day 2 plan]", 350),
          s("msg-u3", "User Message #3", "message-user", "Day 3? Dog-friendly + Monterey aquarium", 70),
          s(
            "msg-a3",
            "Assistant Response #3",
            "message-assistant",
            "Day 3: Big Sur → Monterey → Santa Cruz\nPoint Lobos, Monterey Bay Aquarium (no dogs), Carmel Beach (off-leash!), Santa Cruz Dream Inn",
            420,
            { isNew: true }
          )
        ),
        annotation:
          "Three turns: ~1,500 tokens. Each detailed day plan adds ~400 tokens. By the time we plan all 5 days, the conversation alone will be ~3,000 tokens.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "user",
        content:
          "Now give me a packing list based on everything we've discussed — weather, hiking gear, dog supplies, the whole thing.",
      },
      api: [],
      context: {
        tokenCount: 1560,
        maxTokens: 200000,
        payload: `{
  "system": "[400 tokens]",
  "messages": [
    "[6 previous messages — 1,100 tokens]",
    { "role": "user", "content": "Now give me a packing list based on everything we've discussed — weather, hiking gear, dog supplies, the whole thing." }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful travel planning assistant.", 400),
          s("msg-u1", "User Message #1", "message-user", "I want to plan a 5-day road trip...", 30),
          s("msg-a1", "Assistant Response #1", "message-assistant", "[full 5-day itinerary]", 180),
          s("msg-u2", "User Message #2", "message-user", "Flesh out Day 2 — hiking, seafood, dog", 50),
          s("msg-a2", "Assistant Response #2", "message-assistant", "[full Day 2 plan]", 350),
          s("msg-u3", "User Message #3", "message-user", "Day 3? Dog-friendly + Monterey aquarium", 70),
          s("msg-a3", "Assistant Response #3", "message-assistant", "[full Day 3 plan]", 420),
          s(
            "msg-u4",
            "User Message #4",
            "message-user",
            "Packing list based on everything we've discussed — weather, hiking gear, dog supplies, the whole thing.",
            60,
            { isNew: true }
          )
        ),
        annotation:
          "This is why context matters — the model needs ALL the previous details (coastal weather, hiking trails, dog travel) to generate a useful packing list.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "assistant",
        content:
          "Here's your packing list based on everything we've planned:\n\n🧥 Clothing: Layers! Coastal fog makes mornings cold (50s°F) even when afternoons hit 70s. Pack a windbreaker, fleece, and shorts.\n\n🥾 Hiking: Trail shoes (Gaviota, Point Lobos, Andrew Molera), daypack, water bottles x2, sunscreen\n\n🐕 Dog: Leash (required at state parks), collapsible water bowl, poop bags, dog food + treats for 5 days, vaccination records (for boarding/hotels), car harness\n\n📱 Other: Monterey Aquarium tickets (pre-book!), hotel confirmations, car charger, cooler for road snacks\n\n🚗 Car: Full tank before Big Sur (no gas for 70 miles), spare tire check, roadside emergency kit",
      },
      api: [
        {
          label: "response — turn 4",
          json: `{
  "messages": [
    "[8 messages, ~1,560 tokens of conversation history]",
    {
      "role": "assistant",
      "content": "Here's your packing list based on everything we've planned... [detailed packing list referencing specific stops]"
    }
  ]
}`,
          annotation:
            "The model references specific details from turns 1-3 (Big Sur gas, Monterey aquarium, dog at state parks). This only works because the full conversation is in context.",
        },
      ],
      context: {
        tokenCount: 1960,
        maxTokens: 200000,
        payload: `{
  "system": "[400 tokens]",
  "messages": [
    "[8 previous messages — 1,560 tokens of history]",
    { "role": "assistant", "content": "Here's your packing list based on everything we've planned... [clothing, hiking, dog, other, car sections]" }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful travel planning assistant.", 400),
          s("msg-u1", "User Message #1", "message-user", "I want to plan a 5-day road trip...", 30),
          s("msg-a1", "Assistant Response #1", "message-assistant", "[full 5-day itinerary]", 180),
          s("msg-u2", "User Message #2", "message-user", "Flesh out Day 2", 50),
          s("msg-a2", "Assistant Response #2", "message-assistant", "[full Day 2 plan]", 350),
          s("msg-u3", "User Message #3", "message-user", "Day 3?", 70),
          s("msg-a3", "Assistant Response #3", "message-assistant", "[full Day 3 plan]", 420),
          s("msg-u4", "User Message #4", "message-user", "Packing list based on everything", 60),
          s(
            "msg-a4",
            "Assistant Response #4",
            "message-assistant",
            "Packing list: Clothing (layers for coastal fog), Hiking (trail shoes, daypack), Dog (leash, water bowl, records), Car (full tank before Big Sur)",
            400,
            { isNew: true }
          )
        ),
        annotation:
          "4 turns: ~1,960 tokens. This is a short conversation — imagine a 2-hour coding session with 50+ tool calls.",
      },
      delay: 3000,
    },
  ],
};

// ─── Scenario 3: Full History ───
// Starts mid-conversation at ~45K tokens. Agent session with tool calls.

const fullHistory: Scenario = {
  id: "context-full-history",
  title: "full history",
  intro: {
    label: "strategy: keep everything",
    heading: "Full History — Never Delete Anything",
    description: "The simplest approach: never delete anything from context. Every message, every tool call, every result stays. Watch what happens 45 minutes into a coding session.",
  },
  steps: [
    {
      chat: {
        role: "narrator",
        content:
          'Strategy 1: Keep Everything. The simplest approach — never delete anything from context. Let\'s see what this looks like 45 minutes into a coding session.',
      },
      api: [
        {
          label: "context size after 45 minutes",
          json: `// After 45 minutes of coding:
// - 12 user messages
// - 11 assistant responses
// - 18 tool calls (read, edit, bash)
// - 18 tool results (file contents, command output)
//
// Total messages in context: 59
// Total tokens: ~45,000`,
          annotation:
            "Most of those tokens are tool results — file contents and command outputs that were read once and never referenced again.",
        },
      ],
      context: {
        tokenCount: 45000,
        maxTokens: 200000,
        payload: `{
  "system": "[system prompt + CLAUDE.md — 4,200 tokens]",
  "tools": "[12 tool definitions — 8,800 tokens]",
  "messages": [
    "// 59 messages from 45 minutes of work",
    "// User messages: 12 (~600 tokens)",
    "// Assistant responses: 11 (~3,200 tokens)",
    "// Tool calls: 18 (~1,400 tokens)",
    "// Tool results: 18 (~26,800 tokens) ← most of the context",
    "",
    "// The tool results include:",
    "// - Full contents of 8 different files",
    "// - Output from 6 bash commands",
    "// - 4 search results with matching lines"
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, Glob, Grep, Write, WebFetch, WebSearch, Task, ...", 8800),
          s("msg-u1", "User Messages (12)", "message-user", "[12 user messages across 45 minutes of work]", 600),
          s("msg-a-all", "Assistant Responses (11)", "message-assistant", "[11 responses with reasoning and explanations]", 3200),
          s("msg-tc-all", "Tool Calls (18)", "message-tool-call", "[18 tool invocations: 8 file reads, 6 bash commands, 4 searches]", 1400),
          s("msg-tr-all", "Tool Results (18)", "message-tool-result", "[18 tool results: full file contents, command outputs, search results — this is where most tokens go]", 26800)
        ),
        annotation:
          "45 minutes in: 45,000 tokens (22% of window). Tool results account for 60% of the total context. Most of these file contents won't be referenced again.",
      },
      delay: 4000,
    },
    {
      chat: {
        role: "user",
        content: "Now refactor the Nav component to use a config array instead of hardcoded links.",
      },
      api: [],
      context: {
        tokenCount: 45050,
        maxTokens: 200000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    "[59 previous messages — 32,000 tokens]",
    { "role": "user", "content": "Now refactor the Nav component to use a config array instead of hardcoded links." }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, Glob, Grep, Write...", 8800),
          s("msg-prev", "Previous Messages (59)", "message-user", "[45 minutes of conversation history]", 32000),
          s(
            "msg-u-new",
            "User Message #13",
            "message-user",
            "Now refactor the Nav component to use a config array instead of hardcoded links.",
            50,
            { isNew: true }
          )
        ),
        annotation: "Your new request is 50 tokens. But the model processes all 45,050 tokens to answer it.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "tool-call",
        content: 'Read({ file_path: "src/components/Nav.tsx" })',
        toolName: "Read",
      },
      api: [],
      context: {
        tokenCount: 46800,
        maxTokens: 200000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    "[60 previous messages — 32,050 tokens]",
    { "role": "assistant", "content": [{ "type": "tool_use", "name": "Read", "input": { "file_path": "src/components/Nav.tsx" } }] },
    { "role": "user", "content": [{ "type": "tool_result", "content": "[Nav.tsx — 120 lines, 1,650 tokens of component code]" }] }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-prev", "Previous Messages (59)", "message-user", "[45 minutes of history]", 32000),
          s("msg-u13", "User Message #13", "message-user", "Refactor Nav component...", 50),
          s(
            "msg-tc19",
            "Tool Call: Read Nav.tsx",
            "message-tool-call",
            'Read({ file_path: "src/components/Nav.tsx" })',
            100,
            { isNew: true }
          ),
          s(
            "msg-tr19",
            "Tool Result: Nav.tsx",
            "message-tool-result",
            "export function Nav() {\n  const pathname = usePathname();\n  const links = [...]\n  return <nav>...</nav>\n}\n[120 lines]",
            1650,
            { isNew: true }
          )
        ),
        annotation: "Reading one file added 1,750 tokens. The file you read 30 minutes ago? Still in context too.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "tool-call",
        content: 'Edit({ file_path: "src/components/Nav.tsx", old_string: "const links = [...]", new_string: "const NAV_ITEMS = [...]\\n// ... refactored code" })',
        toolName: "Edit",
      },
      api: [],
      context: {
        tokenCount: 48200,
        maxTokens: 200000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    "[62 previous messages — 33,800 tokens]",
    { "role": "assistant", "content": [{ "type": "text", "text": "I'll refactor..." }, { "type": "tool_use", "name": "Edit", "input": { "..." } }] },
    { "role": "user", "content": [{ "type": "tool_result", "content": "File edited successfully." }] }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-prev", "Previous Messages (59)", "message-user", "[45 minutes of history]", 32000),
          s("msg-u13", "User Message #13", "message-user", "Refactor Nav component...", 50),
          s("msg-tc19", "Tool Call: Read Nav.tsx", "message-tool-call", "Read Nav.tsx", 100),
          s("msg-tr19", "Tool Result: Nav.tsx", "message-tool-result", "[full file contents — 120 lines]", 1650),
          s(
            "msg-tc20",
            "Tool Call: Edit Nav.tsx",
            "message-tool-call",
            'Edit({ old_string: "...", new_string: "const NAV_ITEMS = [...]" })',
            350,
            { isNew: true }
          ),
          s(
            "msg-tr20",
            "Tool Result: Edit",
            "message-tool-result",
            "File edited successfully.",
            50,
            { isNew: true }
          )
        ),
        annotation: "The edit command itself is verbose — it includes the old and new code. Even small edits add hundreds of tokens.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "tool-call",
        content: 'Bash({ command: "npm run build" })',
        toolName: "Bash",
      },
      api: [],
      context: {
        tokenCount: 53200,
        maxTokens: 200000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    "[64 previous messages — 35,200 tokens]",
    { "role": "assistant", "content": [{ "type": "tool_use", "name": "Bash", "input": { "command": "npm run build" } }] },
    { "role": "user", "content": [{ "type": "tool_result", "content": "[build output — 5,000 tokens of webpack/next.js logs]" }] }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-prev", "Previous Messages (59)", "message-user", "[45 minutes of history]", 32000),
          s("msg-recent", "Recent Messages (5)", "message-user", "[refactor task: question + read + edit]", 2200),
          s(
            "msg-tc21",
            "Tool Call: Bash (build)",
            "message-tool-call",
            'Bash({ command: "npm run build" })',
            50,
            { isNew: true }
          ),
          s(
            "msg-tr21",
            "Tool Result: Build Output",
            "message-tool-result",
            "✓ Compiled successfully\nRoute (app): 23 routes\nFirst Load JS: 87.3 kB\n[... 120 lines of build output ...]",
            5000,
            { isNew: true }
          )
        ),
        annotation:
          "Build output is huge — 5,000 tokens for one command. We're at 53K tokens (26% of window) after one task.",
      },
      delay: 3000,
    },
    {
      chat: {
        role: "assistant",
        content:
          "Nav refactored! The component now uses a NAV_ITEMS config array. Build passes cleanly.\n\nWith full history, everything from the last 45 minutes is still in context — every file we read, every command we ran. Simple, but expensive.",
      },
      api: [
        {
          label: "context summary",
          json: `// Full history approach:
//
// Tokens used:  53,200 / 200,000 (26%)
// Messages:     67
// Tool results: 21 (largest source of tokens)
//
// Pros: Simple, nothing lost
// Cons: Expensive, most of the context is
//        old tool results that won't be used again`,
          annotation:
            "Full history works for short sessions. But agent workflows with lots of tool calls fill up fast — 50% of the window can be one-time-use file contents.",
        },
      ],
      context: {
        tokenCount: 53400,
        maxTokens: 200000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": "[67 messages — 40,400 tokens]"
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-prev", "Previous Messages (59)", "message-user", "[45 minutes of history]", 32000),
          s("msg-recent", "Recent Messages (7)", "message-user", "[refactor task messages]", 2200),
          s("msg-tc21", "Tool Call: Bash (build)", "message-tool-call", "npm run build", 50),
          s("msg-tr21", "Tool Result: Build Output", "message-tool-result", "[120 lines of build output]", 5000),
          s(
            "msg-a-final",
            "Assistant Response",
            "message-assistant",
            "Nav refactored! The component now uses a NAV_ITEMS config array. Build passes cleanly.",
            200,
            { isNew: true }
          )
        ),
        annotation:
          "Full history: simple but expensive. 53K tokens used — 60% of that is tool results read once and never referenced again.",
      },
      delay: 3000,
    },
  ],
};

// ─── Scenario 4: Sliding Window ───
// Same conversation hitting a token limit. Oldest messages get dropped.

const slidingWindow: Scenario = {
  id: "context-sliding-window",
  title: "sliding window",
  intro: {
    label: "strategy: drop oldest",
    heading: "Sliding Window — Forget the Beginning",
    description: "When context gets too large, remove the oldest messages to make room. It's efficient — but watch what gets lost when the model forgets.",
  },
  steps: [
    {
      chat: {
        role: "narrator",
        content:
          "Strategy 2: Sliding Window. When context gets too large, drop the oldest messages to make room. Let's watch what happens.",
      },
      api: [
        {
          label: "the setup",
          json: `// Same coding session, 45 minutes in
// Context limit set to: 50,000 tokens
// Current usage: 45,000 tokens
//
// When the next messages push past 50K,
// the oldest messages get dropped.`,
          annotation: "A sliding window has a hard limit. When you hit it, old messages are removed from the beginning.",
        },
      ],
      context: {
        tokenCount: 45000,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens — never trimmed]",
  "tools": "[8,800 tokens — never trimmed]",
  "messages": [
    "// 59 messages from 45 minutes of work",
    "// Oldest messages will be dropped first",
    "// when we exceed 50,000 tokens"
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-u1", "User: \"Fix the login bug\"", "message-user", "Fix the login page — it crashes when the email field is empty.", 40),
          s("msg-a1", "Assistant: \"Let me look at...\"", "message-assistant", "Let me look at the login component.", 30),
          s("msg-tc1", "Tool Call: Read login.tsx", "message-tool-call", "Read({ file_path: 'src/pages/login.tsx' })", 60),
          s("msg-tr1", "Tool Result: login.tsx", "message-tool-result", "[full login component — 200 lines]", 3200),
          s("msg-tc2", "Tool Call: Edit login.tsx", "message-tool-call", "Edit({ ... add validation ... })", 300),
          s("msg-tr2", "Tool Result: Edit", "message-tool-result", "File edited successfully.", 30),
          s("msg-a2", "Assistant: \"Fixed the bug...\"", "message-assistant", "Fixed! Added null check for email field.", 60),
          s("msg-remaining", "... 49 more messages ...", "message-user", "[remaining conversation: API work, CSS fixes, testing, refactoring...]", 24280)
        ),
        annotation: "We're at 45,000 / 50,000 tokens. The window is almost full.",
      },
      delay: 3500,
    },
    {
      chat: {
        role: "user",
        content: "Read the auth middleware and add rate limiting.",
      },
      api: [],
      context: {
        tokenCount: 45050,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    "[59 previous messages — 32,000 tokens]",
    { "role": "user", "content": "Read the auth middleware and add rate limiting." }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-u1", "User: \"Fix the login bug\"", "message-user", "Fix the login page — it crashes when email is empty.", 40),
          s("msg-a1", "Assistant: \"Let me look...\"", "message-assistant", "Let me look at the login component.", 30),
          s("msg-tc1", "Tool Call: Read login.tsx", "message-tool-call", "Read login.tsx", 60),
          s("msg-tr1", "Tool Result: login.tsx", "message-tool-result", "[full login component — 200 lines]", 3200),
          s("msg-tc2", "Tool Call: Edit login.tsx", "message-tool-call", "Edit login.tsx — add validation", 300),
          s("msg-tr2", "Tool Result: Edit", "message-tool-result", "File edited.", 30),
          s("msg-a2", "Assistant: \"Fixed...\"", "message-assistant", "Fixed! Added null check.", 60),
          s("msg-remaining", "... 49 more messages ...", "message-user", "[remaining conversation]", 24280),
          s(
            "msg-u-new",
            "User: \"Read auth middleware...\"",
            "message-user",
            "Read the auth middleware and add rate limiting.",
            50,
            { isNew: true }
          )
        ),
        annotation: "45,050 tokens. Still under the 50K limit — nothing trimmed yet.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "tool-call",
        content: 'Read({ file_path: "src/middleware/auth.ts" })',
        toolName: "Read",
      },
      api: [],
      context: {
        tokenCount: 48500,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    "[61 previous messages]",
    { "role": "assistant", "content": [{ "type": "tool_use", "name": "Read" }] },
    { "role": "user", "content": [{ "type": "tool_result", "content": "[auth middleware — 3,400 tokens]" }] }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-u1", "User: \"Fix the login bug\"", "message-user", "Fix the login page...", 40),
          s("msg-a1", "Assistant: \"Let me look...\"", "message-assistant", "Let me look at the login component.", 30),
          s("msg-tc1", "Tool Call: Read login.tsx", "message-tool-call", "Read login.tsx", 60),
          s("msg-tr1", "Tool Result: login.tsx", "message-tool-result", "[200 lines of login code]", 3200),
          s("msg-tc2", "Tool Call: Edit login.tsx", "message-tool-call", "Edit — add validation", 300),
          s("msg-tr2", "Tool Result: Edit", "message-tool-result", "File edited.", 30),
          s("msg-a2", "Assistant: \"Fixed...\"", "message-assistant", "Fixed! Added null check.", 60),
          s("msg-remaining", "... 49 more messages ...", "message-user", "[remaining conversation]", 24280),
          s("msg-u-rate", "User: \"Read auth middleware...\"", "message-user", "Read auth middleware, add rate limiting.", 50),
          s(
            "msg-tc-read",
            "Tool Call: Read auth.ts",
            "message-tool-call",
            'Read({ file_path: "src/middleware/auth.ts" })',
            100,
            { isNew: true }
          ),
          s(
            "msg-tr-read",
            "Tool Result: auth.ts",
            "message-tool-result",
            "[auth middleware — 250 lines of JWT validation, session management, role checks]",
            3400,
            { isNew: true }
          )
        ),
        annotation: "48,500 tokens. Dangerously close to the 50K limit. The next tool call will push us over.",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "tool-call",
        content:
          'Edit({ file_path: "src/middleware/auth.ts", old_string: "export async function auth...", new_string: "// ... with rate limiting added" })',
        toolName: "Edit",
      },
      api: [
        {
          label: "trim triggered!",
          json: `// Edit would push context to ~52,000 tokens
// Sliding window kicks in:
//
// REMOVED (oldest messages):
//   - "Fix the login bug" (user message)
//   - "Let me look at the login component" (assistant)
//   - Read login.tsx (tool call)
//   - [login.tsx contents] (tool result — 3,200 tokens!)
//   - Edit login.tsx (tool call)
//   - "File edited." (tool result)
//   - "Fixed! Added null check." (assistant)
//
// Freed: ~3,720 tokens
// New total: ~48,400 tokens (under limit)`,
          highlightLines: [5, 6, 7, 8, 9, 10, 11],
          annotation:
            "The entire login bug fix conversation is gone. The model no longer knows it fixed that bug earlier.",
        },
      ],
      context: {
        tokenCount: 48400,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens — never trimmed]",
  "tools": "[8,800 tokens — never trimmed]",
  "messages": [
    "// First 7 messages REMOVED (login bug fix)",
    "// ↓ conversation continues from message #8",
    "[49 remaining messages from earlier work]",
    "[auth middleware task messages]",
    { "role": "assistant", "content": [{ "type": "tool_use", "name": "Edit", "input": { "..." } }] },
    { "role": "user", "content": [{ "type": "tool_result", "content": "File edited successfully." }] }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-u1", "User: \"Fix the login bug\"", "message-user", "Fix the login page...", 40, { isRemoved: true }),
          s("msg-a1", "Assistant: \"Let me look...\"", "message-assistant", "Let me look at the login component.", 30, { isRemoved: true }),
          s("msg-tc1", "Tool Call: Read login.tsx", "message-tool-call", "Read login.tsx", 60, { isRemoved: true }),
          s("msg-tr1", "Tool Result: login.tsx", "message-tool-result", "[200 lines — 3,200 tokens]", 3200, { isRemoved: true }),
          s("msg-tc2", "Tool Call: Edit login.tsx", "message-tool-call", "Edit login.tsx", 300, { isRemoved: true }),
          s("msg-tr2", "Tool Result: Edit", "message-tool-result", "File edited.", 30, { isRemoved: true }),
          s("msg-a2", "Assistant: \"Fixed...\"", "message-assistant", "Fixed! Added null check.", 60, { isRemoved: true }),
          s("msg-remaining", "... 49 remaining messages ...", "message-user", "[rest of conversation]", 24280),
          s("msg-u-rate", "User: \"Read auth middleware...\"", "message-user", "Read auth middleware, add rate limiting.", 50),
          s("msg-tc-read", "Tool Call: Read auth.ts", "message-tool-call", "Read auth.ts", 100),
          s("msg-tr-read", "Tool Result: auth.ts", "message-tool-result", "[250 lines of auth middleware]", 3400),
          s(
            "msg-tc-edit",
            "Tool Call: Edit auth.ts",
            "message-tool-call",
            "Edit auth.ts — add rate limiting",
            400,
            { isNew: true }
          ),
          s(
            "msg-tr-edit",
            "Tool Result: Edit",
            "message-tool-result",
            "File edited successfully.",
            50,
            { isNew: true }
          )
        ),
        annotation:
          "Sliding window removed the 7 oldest messages (~3,720 tokens). The login bug fix is completely forgotten.",
      },
      delay: 3500,
    },
    {
      chat: {
        role: "user",
        content: "Wait, what changes did we make to the login page earlier?",
      },
      api: [],
      context: {
        tokenCount: 48450,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    "// login bug fix messages: GONE",
    "[52 messages — no mention of login page anywhere]",
    { "role": "user", "content": "Wait, what changes did we make to the login page earlier?" }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-remaining", "Remaining Messages (52)", "message-user", "[no mention of login page anywhere in remaining context]", 24280),
          s("msg-auth-task", "Auth Middleware Task (6)", "message-user", "[read + edit auth.ts messages]", 4000),
          s(
            "msg-u-login",
            "User: \"What changes to login page?\"",
            "message-user",
            "Wait, what changes did we make to the login page earlier?",
            50,
            { isNew: true }
          )
        ),
        annotation: "The model has no memory of the login fix. Those messages were removed by the sliding window.",
      },
      delay: 3000,
    },
    {
      chat: {
        role: "assistant",
        content:
          "I don't have any record of changes to the login page in our conversation. We may have discussed it earlier, but I can't find it in our current context. Would you like me to read the login page to see its current state?",
      },
      api: [
        {
          label: "the tradeoff",
          json: `// Sliding window tradeoff:
//
// ✓ Simple to implement
// ✓ Guaranteed to stay under token limit
// ✓ Recent context always preserved
//
// ✗ The model literally forgets earlier work
// ✗ No way to know what was important
// ✗ Can lose critical context (bug fixes, decisions)
// ✗ User has to re-explain things`,
          annotation:
            "The model literally forgets earlier parts of the conversation. No partial memory — it's all or nothing.",
        },
      ],
      context: {
        tokenCount: 48550,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": "[53 messages — no login page history]"
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-remaining", "Remaining Messages (52)", "message-user", "[no login page history]", 24280),
          s("msg-auth-task", "Auth Middleware Task (6)", "message-user", "[auth.ts messages]", 4000),
          s("msg-u-login", "User: \"What changes to login page?\"", "message-user", "What changes did we make to the login page earlier?", 50),
          s(
            "msg-a-login",
            "Assistant: \"I don't have any record...\"",
            "message-assistant",
            "I don't have any record of changes to the login page in our conversation.",
            100,
            { isNew: true }
          )
        ),
        annotation:
          "Sliding window: simple and cheap, but the model completely forgets old work. There's a better way...",
      },
      delay: 3000,
    },
  ],
};

// ─── Scenario 5: Summary Compaction ───
// Old messages replaced with a condensed summary.

const summaryCompaction: Scenario = {
  id: "context-summary",
  title: "summary compaction",
  intro: {
    label: "strategy: compress",
    heading: "Summary Compaction — Remember the Gist",
    description: "Instead of dropping old messages entirely, summarize them first. The model keeps a condensed version of earlier work. Compare this to sliding window's total amnesia.",
  },
  steps: [
    {
      chat: {
        role: "narrator",
        content:
          "Strategy 3: Summary Compaction. Instead of just dropping old messages, summarize them first. The model keeps a condensed version of earlier work.",
      },
      api: [
        {
          label: "the setup",
          json: `// Same scenario: 45 minutes in, approaching limit
// But this time, when we need to trim:
//
// 1. Take the oldest N messages
// 2. Send them to a separate LLM call: "Summarize this"
// 3. Replace those messages with the summary
// 4. Continue with the rest of the conversation`,
          annotation:
            "Summary compaction uses a separate LLM call to condense old messages before removing them.",
        },
      ],
      context: {
        tokenCount: 45000,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens — never trimmed]",
  "tools": "[8,800 tokens — never trimmed]",
  "messages": [
    "// 59 messages from 45 minutes of work",
    "// When trimming triggers, old messages",
    "// will be SUMMARIZED, not just dropped"
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-u1", "User: \"Fix the login bug\"", "message-user", "Fix the login page — it crashes when email is empty.", 40),
          s("msg-a1", "Assistant: \"Let me look...\"", "message-assistant", "Let me look at the login component.", 30),
          s("msg-tc1", "Tool Call: Read login.tsx", "message-tool-call", "Read login.tsx", 60),
          s("msg-tr1", "Tool Result: login.tsx", "message-tool-result", "[200 lines of login code]", 3200),
          s("msg-tc2", "Tool Call: Edit login.tsx", "message-tool-call", "Edit — add email validation", 300),
          s("msg-tr2", "Tool Result: Edit", "message-tool-result", "File edited.", 30),
          s("msg-a2", "Assistant: \"Fixed...\"", "message-assistant", "Fixed! Added null check for email field.", 60),
          s("msg-remaining", "... 49 more messages ...", "message-user", "[CSS fixes, API work, testing, refactoring...]", 24280)
        ),
        annotation: "Same starting point as sliding window: 45,000 / 50,000 tokens.",
      },
      delay: 3500,
    },
    {
      chat: {
        role: "user",
        content: "Read the auth middleware and add rate limiting.",
      },
      api: [],
      context: {
        tokenCount: 45050,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    "[59 previous messages — 32,050 tokens]",
    { "role": "user", "content": "Read the auth middleware and add rate limiting." }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-u1", "User: \"Fix the login bug\"", "message-user", "Fix the login page...", 40),
          s("msg-a1", "Assistant: \"Let me look...\"", "message-assistant", "Let me look at the login component.", 30),
          s("msg-tc1", "Tool Call: Read login.tsx", "message-tool-call", "Read login.tsx", 60),
          s("msg-tr1", "Tool Result: login.tsx", "message-tool-result", "[200 lines of login code]", 3200),
          s("msg-tc2", "Tool Call: Edit login.tsx", "message-tool-call", "Edit — add email validation", 300),
          s("msg-tr2", "Tool Result: Edit", "message-tool-result", "File edited.", 30),
          s("msg-a2", "Assistant: \"Fixed...\"", "message-assistant", "Fixed! Added null check.", 60),
          s("msg-remaining", "... 49 more messages ...", "message-user", "[remaining conversation]", 24280),
          s(
            "msg-u-new",
            "User: \"Read auth middleware...\"",
            "message-user",
            "Read the auth middleware and add rate limiting.",
            50,
            { isNew: true }
          )
        ),
        annotation: "Approaching the limit again...",
      },
      delay: 2800,
    },
    {
      chat: {
        role: "tool-call",
        content: 'Read({ file_path: "src/middleware/auth.ts" })',
        toolName: "Read",
      },
      api: [],
      context: {
        tokenCount: 48500,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    "[61 messages — 35,500 tokens]"
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-u1", "User: \"Fix the login bug\"", "message-user", "Fix the login page...", 40),
          s("msg-a1", "Assistant: \"Let me look...\"", "message-assistant", "Let me look at the login component.", 30),
          s("msg-tc1", "Tool Call: Read login.tsx", "message-tool-call", "Read login.tsx", 60),
          s("msg-tr1", "Tool Result: login.tsx", "message-tool-result", "[200 lines of login code]", 3200),
          s("msg-tc2", "Tool Call: Edit login.tsx", "message-tool-call", "Edit — add email validation", 300),
          s("msg-tr2", "Tool Result: Edit", "message-tool-result", "File edited.", 30),
          s("msg-a2", "Assistant: \"Fixed...\"", "message-assistant", "Fixed! Added null check.", 60),
          s("msg-remaining", "... 49 more messages ...", "message-user", "[remaining conversation]", 24280),
          s("msg-u-rate", "User: \"Read auth middleware...\"", "message-user", "Read auth middleware.", 50),
          s(
            "msg-tc-read",
            "Tool Call: Read auth.ts",
            "message-tool-call",
            "Read auth.ts",
            100,
            { isNew: true }
          ),
          s(
            "msg-tr-read",
            "Tool Result: auth.ts",
            "message-tool-result",
            "[auth middleware — 250 lines]",
            3400,
            { isNew: true }
          )
        ),
        annotation: "48,500 tokens. About to hit the limit...",
      },
      delay: 2800,
    },
    // Step 4: Summary compaction triggers
    {
      chat: {
        role: "narrator",
        content:
          "Compaction triggered! Instead of just dropping the oldest messages, a separate LLM call summarizes them first. The 7 oldest messages (3,720 tokens) become a 400-token summary.",
      },
      api: [
        {
          label: "summary compaction",
          json: `// Compaction triggered at 48,500 tokens
//
// Step 1: Extract oldest 7 messages (3,720 tokens)
// Step 2: Send to a fast model with prompt:
//   "Summarize this conversation segment.
//    Preserve: key decisions, file changes,
//    bugs fixed, and any user preferences."
//
// Step 3: Replace the 7 messages with summary:
//
// "[Summary of earlier work]
//  - Fixed login page crash (empty email field)
//  - Read and edited src/pages/login.tsx
//  - Added null check for email validation
//  - Build verified, no errors"
//
// 3,720 tokens → 400 tokens (89% reduction)`,
          highlightLines: [11, 12, 13, 14, 15],
          annotation:
            "The summary preserves key facts (what was fixed, which files changed) while dropping the verbose file contents and tool output.",
        },
      ],
      context: {
        tokenCount: 45180,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    {
      "role": "user",
      "content": "[Conversation summary]\\nEarlier in this session:\\n- Fixed login page crash caused by empty email field\\n- Read and edited src/pages/login.tsx\\n- Added null check for email validation before form submission\\n- Build verified successfully, no errors\\n- User prefers detailed explanations of changes"
    },
    "[49 remaining messages from middle/end of session]",
    "[auth middleware task messages]"
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("msg-u1", "User: \"Fix the login bug\"", "message-user", "Fix the login page...", 40, { isRemoved: true }),
          s("msg-a1", "Assistant: \"Let me look...\"", "message-assistant", "Let me look at the login component.", 30, { isRemoved: true }),
          s("msg-tc1", "Tool Call: Read login.tsx", "message-tool-call", "Read login.tsx", 60, { isRemoved: true }),
          s("msg-tr1", "Tool Result: login.tsx", "message-tool-result", "[200 lines — 3,200 tokens]", 3200, { isRemoved: true }),
          s("msg-tc2", "Tool Call: Edit login.tsx", "message-tool-call", "Edit — add validation", 300, { isRemoved: true }),
          s("msg-tr2", "Tool Result: Edit", "message-tool-result", "File edited.", 30, { isRemoved: true }),
          s("msg-a2", "Assistant: \"Fixed...\"", "message-assistant", "Fixed! Added null check.", 60, { isRemoved: true }),
          s(
            "summary",
            "Conversation Summary",
            "summary",
            "Earlier in this session:\n- Fixed login page crash (empty email field)\n- Read and edited src/pages/login.tsx\n- Added null check for email validation\n- Build verified, no errors\n- User prefers detailed explanations",
            400,
            { isSummary: true }
          ),
          s("msg-remaining", "... 49 remaining messages ...", "message-user", "[rest of conversation]", 24280),
          s("msg-u-rate", "User: \"Read auth middleware...\"", "message-user", "Read auth middleware.", 50),
          s("msg-tc-read", "Tool Call: Read auth.ts", "message-tool-call", "Read auth.ts", 100),
          s("msg-tr-read", "Tool Result: auth.ts", "message-tool-result", "[auth middleware code]", 3400)
        ),
        annotation:
          "3,720 tokens compressed to 400. The key facts are preserved — which file, what bug, what was changed.",
      },
      delay: 4000,
    },
    // Step 5: Continue working normally
    {
      chat: {
        role: "tool-call",
        content: 'Edit({ file_path: "src/middleware/auth.ts", ... })',
        toolName: "Edit",
      },
      api: [],
      context: {
        tokenCount: 45630,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    "[Summary — 400 tokens]",
    "[49 remaining messages]",
    "[auth task + edit]"
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("summary", "Conversation Summary", "summary", "Earlier: Fixed login page crash, edited login.tsx, added null check.", 400),
          s("msg-remaining", "... 49 remaining messages ...", "message-user", "[rest of conversation]", 24280),
          s("msg-u-rate", "User: \"Read auth middleware...\"", "message-user", "Read auth middleware.", 50),
          s("msg-tc-read", "Tool Call: Read auth.ts", "message-tool-call", "Read auth.ts", 100),
          s("msg-tr-read", "Tool Result: auth.ts", "message-tool-result", "[auth middleware code]", 3400),
          s(
            "msg-tc-edit",
            "Tool Call: Edit auth.ts",
            "message-tool-call",
            "Edit auth.ts — add rate limiting",
            400,
            { isNew: true }
          )
        ),
        annotation: "Work continues normally. The summary sits at the top of the message history.",
      },
      delay: 2800,
    },
    // Step 6: Test that the summary works
    {
      chat: {
        role: "user",
        content: "What changes did we make to the login page earlier?",
      },
      api: [],
      context: {
        tokenCount: 45680,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": [
    {
      "role": "user",
      "content": "[Summary] Earlier: Fixed login page crash (empty email), edited login.tsx, added null check..."
    },
    "[remaining messages]",
    { "role": "user", "content": "What changes did we make to the login page earlier?" }
  ]
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("summary", "Conversation Summary", "summary", "Earlier: Fixed login page crash (empty email field), edited src/pages/login.tsx, added null check for email validation, build passed.", 400),
          s("msg-remaining", "Remaining Messages", "message-user", "[rest of conversation + auth task]", 28280),
          s(
            "msg-u-login",
            "User: \"What changes to login page?\"",
            "message-user",
            "What changes did we make to the login page earlier?",
            50,
            { isNew: true }
          )
        ),
        annotation: "Same question as the sliding window scenario. But this time the summary has the answer...",
      },
      delay: 3000,
    },
    {
      chat: {
        role: "assistant",
        content:
          "Earlier in our session, we fixed a crash on the login page. The issue was that the email field could be submitted empty, which caused a runtime error. I edited `src/pages/login.tsx` and added a null check for email validation before form submission. The build passed with no errors afterward.\n\nNote: I have a summary of that work but not the exact code changes. Want me to read the file to see the current state?",
      },
      api: [
        {
          label: "the tradeoff",
          json: `// Summary compaction tradeoff:
//
// ✓ Preserves key facts from old conversation
// ✓ Much better token efficiency than full history
// ✓ Model can still reference earlier work
// ✓ Graceful degradation (summary, not amnesia)
//
// ✗ Lossy — exact code changes are gone
// ✗ Extra LLM call for summarization (cost + latency)
// ✗ Summary quality depends on the summarizer
// ✗ Can miss nuances that seemed unimportant`,
          annotation:
            "The model remembers the login fix because the summary preserved key facts. It's lossy — exact code is gone — but the important context survived.",
        },
      ],
      context: {
        tokenCount: 45850,
        maxTokens: 50000,
        payload: `{
  "system": "[4,200 tokens]",
  "tools": "[8,800 tokens]",
  "messages": "[summary + 54 messages — 32,850 tokens]"
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 800),
          s("inst", "Project Instructions", "instructions", "CLAUDE.md + memory files", 3400),
          s("tools", "Tool Definitions (12 tools)", "tool-definitions", "Read, Edit, Bash, ...", 8800),
          s("summary", "Conversation Summary", "summary", "Earlier: Fixed login page crash, edited login.tsx, added null check.", 400),
          s("msg-remaining", "Remaining Messages", "message-user", "[rest of conversation + auth task]", 28280),
          s("msg-u-login", "User: \"What changes to login page?\"", "message-user", "What changes to the login page?", 50),
          s(
            "msg-a-login",
            "Assistant Response",
            "message-assistant",
            "We fixed a crash on the login page — empty email field caused a runtime error. I edited login.tsx and added null check. Build passed. (Note: summary only, exact code changes not available.)",
            170,
            { isNew: true }
          )
        ),
        annotation:
          "Summary compaction: lossy but graceful. The model remembers what it did, even if it can't recall the exact code. Compare this to sliding window's total amnesia.",
      },
      delay: 3000,
    },
  ],
};

// ─── Scenario 3: Fresh Start ───
// Teaches when to start a new conversation — the simplest fix for a confused model.

const freshStart: Scenario = {
  id: "context-fresh-start",
  title: "fresh start",
  intro: {
    label: "practical tip",
    heading: "When to Start a New Conversation",
    description: "After a long session, context fills up with old messages, tool results, and outdated information. Starting a new conversation gives the model a clean slate — it's the simplest fix when things start going sideways.",
  },
  steps: [
    // Step 1: Bloated context
    {
      chat: {
        role: "narrator",
        content:
          "You've been working for 3 hours. Context is packed with old tool results, outdated file contents, and messages from finished tasks.",
      },
      api: [
        {
          label: "current context",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 8096,
  "system": "[system prompt + instructions]",
  "messages": [
    "[68 previous messages — questions, answers, tool calls]",
    "[58,800 tokens of old tool results — file reads, command outputs, search results]",
    "[18,000 tokens of recent messages]",
    "[2,000 tokens of recent tool results]"
  ]
}`,
          annotation:
            "164K of 200K tokens used. Most of it is old messages and tool results from tasks you finished hours ago.",
        },
      ],
      context: {
        tokenCount: 164000,
        maxTokens: 200000,
        payload: `{
  "system": "[1,200 tokens]",
  "instructions": "[4,000 tokens]",
  "tools": "[12,000 tokens]",
  "messages": "[147,000 tokens — mostly old]"
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 1200),
          s("instr", "Project Instructions", "instructions", "CLAUDE.md, memory files, codebase context...", 4000),
          s("tools", "Tool Definitions", "tool-definitions", "read_file, edit_file, run_command, grep, glob... (12 tools)", 12000),
          s("old-msgs", "Old Messages (turns 1–42)", "message-user", "Questions, answers, and discussions from earlier tasks — most no longer relevant", 68000),
          s("old-tools", "Old Tool Results", "message-tool-result", "File contents, command outputs, search results — many from files that have since changed", 58800),
          s("recent-msgs", "Recent Messages (turns 43–51)", "message-user", "Current task discussion — the part that still matters", 18000),
          s("recent-tools", "Recent Tool Results", "message-tool-result", "Current file reads and command outputs", 2000)
        ),
        annotation: "82% full. The model is spending most of its capacity remembering things that no longer matter.",
      },
      delay: 4000,
    },
    // Step 2: Fresh conversation
    {
      chat: {
        role: "narrator",
        content:
          "You start a new conversation. System prompt and tools reload fresh, but message history is gone.",
      },
      api: [
        {
          label: "fresh context",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 8096,
  "system": "[system prompt + instructions]",
  "tools": "[tool definitions]",
  "messages": []
}`,
          annotation:
            "5.8K of 200K tokens — just the essentials. 97% of capacity is available for your new task.",
        },
      ],
      context: {
        tokenCount: 5800,
        maxTokens: 200000,
        payload: `{
  "system": "[1,200 tokens]",
  "instructions": "[4,000 tokens]",
  "tools": "[600 tokens]",
  "messages": []
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 1200),
          s("instr", "Project Instructions", "instructions", "CLAUDE.md, memory files, codebase context...", 4000),
          s("tools", "Tool Definitions", "tool-definitions", "read_file, edit_file, run_command, grep, glob... (12 tools)", 600)
        ),
        annotation: "3% full. A clean slate — the model can focus entirely on what you need right now.",
      },
      delay: 3500,
    },
    // Step 3: Takeaway
    {
      chat: {
        role: "narrator",
        content:
          "If the model seems confused, slow, or keeps referencing outdated information — start a new conversation.",
      },
      api: [
        {
          label: "the takeaway",
          json: `// Signs you need a fresh start:
//
// 1. The model references files or code that have changed
// 2. Responses are getting slower (more tokens to process)
// 3. The model seems "confused" or contradicts itself
// 4. You've switched tasks but old context lingers
//
// Starting over costs nothing — the model reloads
// your project context automatically.`,
          annotation:
            "A new conversation isn't starting from scratch — your system prompt, project instructions, and tools all reload automatically. You only lose the message history, which was the problem in the first place.",
        },
      ],
      context: {
        tokenCount: 5800,
        maxTokens: 200000,
        payload: `{
  "system": "[1,200 tokens]",
  "instructions": "[4,000 tokens]",
  "tools": "[600 tokens]",
  "messages": []
}`,
        sections: sections(
          s("sys", "System Prompt", "system-prompt", "You are a helpful coding assistant...", 1200),
          s("instr", "Project Instructions", "instructions", "CLAUDE.md, memory files, codebase context...", 4000),
          s("tools", "Tool Definitions", "tool-definitions", "read_file, edit_file, run_command, grep, glob... (12 tools)", 600)
        ),
        annotation: "Same 3% as before. Starting a new conversation gives you this clean state instantly.",
      },
      delay: 3000,
    },
  ],
};

// ─── Context Management Group ───

const contextManagement: ScenarioGroup = {
  id: "context-management",
  title: "context management",
  intro: {
    label: "managing context",
    heading: "When Context Outgrows the Window",
    description: "When a conversation outgrows its context window, something has to give. There are three main strategies: keep everything, drop the oldest messages, or summarize what came before. Each has trade-offs — explore all three.",
  },
  subScenarios: [fullHistory, slidingWindow, summaryCompaction],
};

// ─── Export ───

export const contextScenarios: ScenarioTabItem[] = [
  whatsInTheWindow,
  multiTurnGrowth,
  freshStart,
  contextManagement,
];
