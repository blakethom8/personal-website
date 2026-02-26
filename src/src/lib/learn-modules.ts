export interface ModuleFile {
  name: string;
  extension: string;
  content: string;
  type: "json" | "markdown";
  highlightLines?: number[];
  annotation?: string;
}

export interface LearnModule {
  slug: string;
  folderName: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate";
  available: boolean;
  files: ModuleFile[];
}

// ─── Banner JSON (shown at top of page) ───

export const bannerRequest = `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ]
}`;

export const bannerResponse = `{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "The capital of France is Paris."
    }
  ],
  "model": "claude-sonnet-4-20250514",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 15,
    "output_tokens": 12
  }
}`;

// ─── Root README ───

export const rootReadme = `# ~/learn

Interactive modules that demystify AI — built for
curious people, not computer scientists.

Browse the folders below. Each module contains:

  README.md        — what you'll learn
  request.json     — what you send to an LLM
  response.json    — what comes back (raw text)
  structured.json  — how structured output changes everything

Click any file to preview it.

---
6 modules · 54 min total · no prerequisites`;

// ─── Module Definitions ───

export const learnModules: LearnModule[] = [
  {
    slug: "what-is-an-llm",
    folderName: "what-is-an-llm",
    title: "What Is an LLM?",
    description:
      "The world's best autocomplete — how language models predict the next token, and why that's both powerful and limited.",
    duration: "8 min",
    difficulty: "Beginner",
    available: true,
    files: [
      {
        name: "README",
        extension: ".md",
        type: "markdown",
        content: `## What Is an LLM?

The world's best autocomplete — how language models
predict the next token, and why that's both powerful
and limited.

Duration: 8 min | Difficulty: Beginner

You'll learn:
• What "large language model" actually means
• How next-token prediction works
• Why LLMs are powerful AND limited
• The difference between training and inference`,
      },
      {
        name: "request",
        extension: ".json",
        type: "json",
        content: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 256,
  "messages": [
    {
      "role": "user",
      "content": "Explain what an LLM is in one paragraph."
    }
  ]
}`,
        annotation:
          "This is the complete API call. Three fields: model, max_tokens, and messages. That's all you need to talk to an LLM.",
      },
      {
        name: "response",
        extension: ".json",
        type: "json",
        content: `{
  "id": "msg_01ABC123",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "A large language model (LLM) is a neural network trained on massive amounts of text data that learns to predict the next word in a sequence. By learning statistical patterns across billions of documents, it develops an ability to generate coherent text, answer questions, and perform reasoning tasks — though it has no true understanding of the world, only patterns in language."
    }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 18,
    "output_tokens": 71
  }
}`,
        annotation:
          "Raw text back. Useful for chat — but how does your software parse this? What if you need specific fields?",
      },
      {
        name: "structured",
        extension: ".json",
        type: "json",
        content: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 256,
  "tools": [
    {
      "name": "explain_concept",
      "description": "Explain a technical concept in structured format",
      "input_schema": {
        "type": "object",
        "properties": {
          "concept": {
            "type": "string",
            "description": "Name of the concept"
          },
          "one_liner": {
            "type": "string",
            "description": "One sentence explanation"
          },
          "difficulty": {
            "type": "string",
            "enum": ["beginner", "intermediate", "advanced"]
          },
          "key_insight": {
            "type": "string",
            "description": "The most important thing to understand"
          }
        },
        "required": ["concept", "one_liner", "difficulty", "key_insight"]
      }
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "Explain what an LLM is."
    }
  ]
}

// ─── Response with structured output ───

{
  "role": "assistant",
  "content": [
    {
      "type": "tool_use",
      "name": "explain_concept",
      "input": {
        "concept": "Large Language Model",
        "one_liner": "A neural network that predicts the next word, trained on billions of documents.",
        "difficulty": "beginner",
        "key_insight": "It learns patterns in language, not facts about the world — which is why it can be fluent but wrong."
      }
    }
  ]
}`,
        highlightLines: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
        annotation:
          "The tools array tells the model to respond with typed, structured data instead of prose. Now your software can parse concept, one_liner, difficulty as real fields. This is how AI interacts with databases, APIs, and the real world.",
      },
    ],
  },
  {
    slug: "how-chatgpt-works",
    folderName: "how-chatgpt-works",
    title: "How ChatGPT Actually Works",
    description:
      "From pre-training to RLHF — the pipeline that turns raw text into a helpful assistant.",
    duration: "10 min",
    difficulty: "Beginner",
    available: false,
    files: [
      {
        name: "README",
        extension: ".md",
        type: "markdown",
        content: `## How ChatGPT Actually Works

From pre-training to RLHF — the pipeline that turns
raw text into a helpful assistant. Plus: why it
hallucinates.

Duration: 10 min | Difficulty: Beginner

Coming soon.`,
      },
    ],
  },
  {
    slug: "what-are-tokens",
    folderName: "tokens",
    title: "What Are Tokens?",
    description:
      "Paste text, see it tokenized. Understand context windows, costs, and why 'cheaper' models matter.",
    duration: "6 min",
    difficulty: "Beginner",
    available: false,
    files: [
      {
        name: "README",
        extension: ".md",
        type: "markdown",
        content: `## What Are Tokens?

Paste text, see it tokenized in real-time. Understand
context windows, costs, and why "cheaper" models matter.

Duration: 6 min | Difficulty: Beginner

Coming soon.`,
      },
    ],
  },
  {
    slug: "agents-ai-takes-action",
    folderName: "agents",
    title: "Agents: AI That Takes Action",
    description:
      "The agent loop — think, use a tool, observe, repeat. How MCP and function calling let AI interact with the world.",
    duration: "12 min",
    difficulty: "Intermediate",
    available: false,
    files: [
      {
        name: "README",
        extension: ".md",
        type: "markdown",
        content: `## Agents: AI That Takes Action

The agent loop — think, use a tool, observe, repeat.
How MCP and function calling let AI interact with
the world.

Duration: 12 min | Difficulty: Intermediate

Coming soon.`,
      },
    ],
  },
  {
    slug: "ai-in-healthcare",
    folderName: "healthcare-ai",
    title: "AI in Healthcare: What's Real",
    description:
      "Where AI actually helps in healthcare today versus where it's oversold.",
    duration: "10 min",
    difficulty: "Beginner",
    available: false,
    files: [
      {
        name: "README",
        extension: ".md",
        type: "markdown",
        content: `## AI in Healthcare: What's Real, What's Hype

Where AI actually helps in healthcare today versus
where it's oversold. A practical guide for
non-technical leaders.

Duration: 10 min | Difficulty: Beginner

Coming soon.`,
      },
    ],
  },
  {
    slug: "prompt-engineering",
    folderName: "prompting",
    title: "Prompt Engineering for Normal People",
    description:
      "Bad prompt vs. good prompt with live results. Practical templates you can use.",
    duration: "8 min",
    difficulty: "Beginner",
    available: false,
    files: [
      {
        name: "README",
        extension: ".md",
        type: "markdown",
        content: `## Prompt Engineering for Normal People

Side-by-side: bad prompt vs. good prompt with live
results. Practical templates you can actually use.

Duration: 8 min | Difficulty: Beginner

Coming soon.`,
      },
    ],
  },
];
