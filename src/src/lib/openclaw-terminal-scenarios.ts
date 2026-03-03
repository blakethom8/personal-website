// OpenClaw Terminal Simulator Scenarios
// These scenarios show real OpenClaw workflows in action

import {
  Scenario,
  type WorkspaceItem,
  type WorkspaceItemStatus,
  type WorkspaceSnapshot,
} from "./conversation-scenarios";

function wsItem(path: string, kind: WorkspaceItem["kind"], meta?: string): WorkspaceItem {
  return { path, kind, meta };
}

function wsSnapshot(
  rootLabel: string,
  activity: string,
  note: string | undefined,
  baseItems: WorkspaceItem[],
  overrides: Record<string, { status?: WorkspaceItemStatus; meta?: string }> = {},
  additions: WorkspaceItem[] = []
): WorkspaceSnapshot {
  const items = [...baseItems, ...additions].map((item) => {
    const override = overrides[item.path];
    return override ? { ...item, ...override } : { ...item };
  });

  return {
    rootLabel,
    activity,
    note,
    items,
  };
}

const navigatorWorkspaceBase: WorkspaceItem[] = [
  wsItem("memory", "directory"),
  wsItem("memory/2026-02-25.md", "file", "Yesterday's daily note with project decisions."),
  wsItem("MEMORY.md", "file", "Long-term memory the agent updates over time."),
  wsItem("data", "directory"),
  wsItem("data/cms-providers.duckdb", "database", "Local healthcare dataset behind the CMS pipeline."),
];

const emailWorkspaceBase: WorkspaceItem[] = [
  wsItem("HEARTBEAT.md", "file", "Autonomous rules for what the heartbeat should do."),
  wsItem("mail", "directory"),
  wsItem("mail/inbox-cache.sqlite", "database", "Local mail index the Gmail workflow refreshes."),
  wsItem("mail/unread", "directory"),
  wsItem("mail/outbox", "directory"),
  wsItem("logs", "directory"),
];

const emailUnreadFiles: WorkspaceItem[] = [
  wsItem("mail/unread/dave-devries.json", "file", "Prospect reply asking to schedule a call."),
  wsItem("mail/unread/morning-brew.json", "file", "Routine newsletter."),
  wsItem("mail/unread/github-issue.json", "file", "Low-priority repository alert."),
];

const emailOutboxFiles: WorkspaceItem[] = [
  wsItem("mail/outbox/dave-devries-reply.eml", "file", "Reply drafted for Thursday afternoon."),
  wsItem("logs/heartbeat-0900.log", "file", "Audit trail for this 9:00 AM heartbeat run."),
];

const codeWorkspaceBase: WorkspaceItem[] = [
  wsItem("src", "directory"),
  wsItem("src/components", "directory"),
  wsItem("src/components/ExcelTableView.tsx", "file", "Results table that needs the export button."),
  wsItem("src/utils", "directory"),
  wsItem("package.json", "file", "Build and type-check scripts for the repo."),
  wsItem("docker-compose.yml", "file", "Production services used during deploy."),
  wsItem("data", "directory"),
  wsItem("data/provider-cache.duckdb", "database", "Provider search data already backing the visible table."),
];

const codeCreatedFiles: WorkspaceItem[] = [
  wsItem("src/utils/csvExport.ts", "file", "New helper that turns visible rows into a downloadable CSV."),
];

function navigatorWorkspace(
  activity: string,
  note?: string,
  overrides: Record<string, { status?: WorkspaceItemStatus; meta?: string }> = {}
) {
  return wsSnapshot("~/chief", activity, note, navigatorWorkspaceBase, overrides);
}

function emailWorkspace(
  activity: string,
  note?: string,
  overrides: Record<string, { status?: WorkspaceItemStatus; meta?: string }> = {},
  additions: WorkspaceItem[] = []
) {
  return wsSnapshot("~/chief-mail", activity, note, emailWorkspaceBase, overrides, additions);
}

function codeWorkspace(
  activity: string,
  note?: string,
  overrides: Record<string, { status?: WorkspaceItemStatus; meta?: string }> = {},
  additions: WorkspaceItem[] = []
) {
  return wsSnapshot("~/Repo/provider-search", activity, note, codeWorkspaceBase, overrides, additions);
}

// ─── Scenario 1: File Navigator ───

const fileNavigator: Scenario = {
  id: "openclaw-file-navigator",
  title: "openclaw: file navigator",
  intro: {
    label: "memory & files",
    heading: "An Agent That Remembers Yesterday",
    description: "This agent reads and writes files on a computer — including its own notes. Watch it retrieve yesterday's work from a markdown file, then update its long-term memory with new decisions. This is how AI assistants maintain context across sessions.",
  },
  steps: [
    {
      chat: {
        role: "user",
        content: "What did we work on yesterday?",
      },
      api: [
        {
          label: "request",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "system": "You are Chief, Blake's personal AI assistant. You have access to his workspace files.",
  "tools": [
    {
      "name": "read",
      "description": "Read file contents",
      "input_schema": {
        "type": "object",
        "properties": {
          "path": { "type": "string" }
        }
      }
    }
  ],
  "messages": [
    { "role": "user", "content": "What did we work on yesterday?" }
  ]
}`,
          annotation: "Agent receives question, knows it needs to check memory files.",
        },
      ],
      workspace: navigatorWorkspace(
        "Orient around the memory files for yesterday's work",
        "The agent begins by locating the parts of the workspace that store durable memory.",
        {
          memory: { status: "active" },
        }
      ),
      delay: 2500,
    },
    {
      chat: {
        role: "thinking",
        content: "I should check yesterday's daily note to see what we worked on. That'll be in memory/2026-02-25.md.",
      },
      api: [
        {
          label: "response (thinking)",
          json: `{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "I should check yesterday's daily note."
    }
  ]
}`,
          annotation: "Agent reasons about where to find the information.",
        },
      ],
      workspace: navigatorWorkspace(
        "Target memory/2026-02-25.md as the best source of truth",
        "The thought process resolves to a specific file path before any tool call is made.",
        {
          "memory/2026-02-25.md": { status: "active" },
        }
      ),
      delay: 2000,
    },
    {
      chat: {
        role: "tool-call",
        content: 'read({ path: "memory/2026-02-25.md" })',
        toolName: "read",
      },
      api: [
        {
          label: "tool_use",
          json: `{
  "content": [
    {
      "type": "tool_use",
      "name": "read",
      "input": {
        "path": "memory/2026-02-25.md"
      }
    }
  ],
  "stop_reason": "tool_use"
}`,
          annotation: "Agent calls the read tool to fetch yesterday's notes.",
        },
      ],
      workspace: navigatorWorkspace(
        "Read yesterday's note from memory/2026-02-25.md",
        "The active file lights up exactly where the tool call is pointed.",
        {
          "memory/2026-02-25.md": { status: "active" },
        }
      ),
      delay: 2000,
    },
    {
      chat: {
        role: "tool-result",
        content: "# 2026-02-25\n\n## Work\n- Finished CMS data pipeline matching engine\n- Match rate improved from 38% to 62%\n- Added LLM-assisted entity resolution\n\n## Decisions\n- Using GPT-4o-mini for extraction (cost: ~$0.001/provider)\n- Pre-seeding top 1K specialty+geo combos\n- Hybrid enrichment: 80% cache, 20% on-demand",
        toolName: "read",
      },
      api: [
        {
          label: "tool_result",
          json: `{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "content": "# 2026-02-25\\n\\n## Work\\n- Finished CMS data pipeline matching engine\\n- Match rate improved from 38% to 62%\\n- Added LLM-assisted entity resolution\\n\\n## Decisions\\n- Using GPT-4o-mini for extraction (cost: ~$0.001/provider)\\n- Pre-seeding top 1K specialty+geo combos\\n- Hybrid enrichment: 80% cache, 20% on-demand"
    }
  ]
}`,
          annotation: "File contents returned to the model.",
        },
      ],
      workspace: navigatorWorkspace(
        "Pull yesterday's note contents back into the agent loop",
        "The note has been opened and read; the rest of the workspace stays untouched.",
        {
          "memory/2026-02-25.md": { status: "active" },
        }
      ),
      delay: 2500,
    },
    {
      chat: {
        role: "assistant",
        content: "Yesterday we focused on the CMS data pipeline. Major accomplishments:\n\n• Finished the provider matching engine — match rate jumped from 38% to 62%\n• Added LLM-assisted entity resolution for ambiguous cases\n• Made three key architectural decisions:\n  - GPT-4o-mini for data extraction (~$0.001/provider)\n  - Pre-seeding top 1,000 specialty+geography combinations\n  - Hybrid enrichment model (80% cached, 20% on-demand)\n\nSolid progress on the data layer.",
      },
      api: [
        {
          label: "final response",
          json: `{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Yesterday we focused on the CMS data pipeline. Major accomplishments:\\n\\n• Finished the provider matching engine — match rate jumped from 38% to 62%..."
    }
  ],
  "stop_reason": "end_turn"
}`,
          annotation: "Agent synthesizes the notes into a natural summary.",
        },
      ],
      workspace: navigatorWorkspace(
        "Summarize what was learned from the daily note",
        "No new file operations yet; the agent is using the note it just read.",
        {
          "memory/2026-02-25.md": { status: "active" },
        }
      ),
      delay: 3000,
    },
    {
      chat: {
        role: "user",
        content: "Update MEMORY.md with the key decisions",
      },
      api: [
        {
          label: "request (update)",
          json: `{
  "messages": [
    { ... previous messages ... },
    {
      "role": "user",
      "content": "Update MEMORY.md with the key decisions"
    }
  ]
}`,
          annotation: "User asks to persist important info to long-term memory.",
        },
      ],
      workspace: navigatorWorkspace(
        "Shift focus from the daily log into long-term memory",
        "The next step is no longer recall. It is persistence.",
        {
          "MEMORY.md": { status: "active" },
        }
      ),
      delay: 2000,
    },
    {
      chat: {
        role: "tool-call",
        content: 'read({ path: "MEMORY.md" })',
        toolName: "read",
      },
      api: [
        {
          label: "tool_use (read current)",
          json: `{
  "content": [
    {
      "type": "tool_use",
      "name": "read",
      "input": { "path": "MEMORY.md" }
    }
  ]
}`,
          annotation: "Agent reads current MEMORY.md to find where to insert updates.",
        },
      ],
      workspace: navigatorWorkspace(
        "Open MEMORY.md to find the exact insertion point",
        "The agent reads before writing so it can make a precise edit instead of rewriting the whole file.",
        {
          "MEMORY.md": { status: "active" },
        }
      ),
      delay: 2000,
    },
    {
      chat: {
        role: "tool-result",
        content: "## CMS Healthcare Data Pipeline\n- Status: Active (Feb 2026)\n- Location: Hetzner 5.78.148.70\n- DuckDB: 90M+ rows, 30 tables...",
        toolName: "read",
      },
      api: [
        {
          label: "tool_result",
          json: `{
  "content": [
    {
      "type": "tool_result",
      "content": "## CMS Healthcare Data Pipeline\\n- Status: Active (Feb 2026)\\n- Location: Hetzner 5.78.148.70\\n- DuckDB: 90M+ rows, 30 tables..."
    }
  ]
}`,
          annotation: "Current content retrieved.",
        },
      ],
      workspace: navigatorWorkspace(
        "Inspect the current MEMORY.md contents",
        "The file is loaded into working memory so the edit can be targeted to the right section.",
        {
          "MEMORY.md": { status: "active" },
        }
      ),
      delay: 2000,
    },
    {
      chat: {
        role: "tool-call",
        content: 'edit({ path: "MEMORY.md", old_string: "...30 tables", new_string: "...30 tables\\n- Match engine: 38% → 62% (LLM-assisted)\\n- Cost model: GPT-4o-mini ~$0.001/provider\\n- Architecture: Hybrid (80% pre-seed, 20% on-demand)" })',
        toolName: "edit",
      },
      api: [
        {
          label: "tool_use (edit)",
          json: `{
  "content": [
    {
      "type": "tool_use",
      "name": "edit",
      "input": {
        "path": "MEMORY.md",
        "old_string": "...30 tables",
        "new_string": "...30 tables\\n- Match engine: 38% → 62% (LLM-assisted)\\n- Cost model: GPT-4o-mini ~$0.001/provider\\n- Architecture: Hybrid (80% pre-seed, 20% on-demand)"
      }
    }
  ]
}`,
          highlightLines: [6, 7, 8, 9, 10],
          annotation: "Agent makes precise edit — finds exact location and inserts new lines.",
        },
      ],
      workspace: navigatorWorkspace(
        "Append the new architectural decisions into MEMORY.md",
        "This is the durable write. The memory file becomes richer than it was one phase ago.",
        {
          "MEMORY.md": {
            status: "updated",
            meta: "Three new lines are being inserted for the match engine, cost model, and hybrid architecture.",
          },
        }
      ),
      delay: 2500,
    },
    {
      chat: {
        role: "tool-result",
        content: "File successfully edited.",
        toolName: "edit",
      },
      api: [
        {
          label: "tool_result",
          json: `{
  "content": [
    {
      "type": "tool_result",
      "content": "File successfully edited."
    }
  ]
}`,
          annotation: "Confirmation from the tool.",
        },
      ],
      workspace: navigatorWorkspace(
        "Persist the edit and confirm the write succeeded",
        "The workspace now contains the updated long-term memory entry.",
        {
          "MEMORY.md": {
            status: "updated",
            meta: "Long-term memory now includes the match rate gain, GPT-4o-mini cost, and hybrid enrichment plan.",
          },
        }
      ),
      delay: 1500,
    },
    {
      chat: {
        role: "assistant",
        content: "Updated MEMORY.md with the three key decisions from yesterday:\n• Match engine improvement (38% → 62%)\n• Cost model (GPT-4o-mini)\n• Hybrid architecture design\n\nThese are now part of your long-term memory.",
      },
      api: [
        {
          label: "final response",
          json: `{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Updated MEMORY.md with the three key decisions..."
    }
  ],
  "stop_reason": "end_turn"
}`,
          annotation: "Task complete. Knowledge persisted.",
        },
      ],
      workspace: navigatorWorkspace(
        "Return control with MEMORY.md updated",
        "The important part of the workflow is that the state on disk changed, not just the reply in chat.",
        {
          "MEMORY.md": {
            status: "updated",
            meta: "Persisted knowledge is ready for future sessions and future tool calls.",
          },
        }
      ),
      delay: 2500,
    },
  ],
};

// ─── Scenario 2: Email Check (Heartbeat) ───

const emailCheck: Scenario = {
  id: "openclaw-email-check",
  title: "openclaw: email check",
  intro: {
    label: "autonomous actions",
    heading: "An Agent That Checks Email on Its Own",
    description: "This agent runs on a schedule — every 30 minutes, it checks for important updates and decides whether to notify you. No prompt needed. Watch it triage an inbox and draft a reply, all triggered by a background timer.",
  },
  steps: [
    {
      chat: {
        role: "user",
        content: "[System: Heartbeat poll - 9:00 AM]",
      },
      api: [
        {
          label: "heartbeat trigger",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "system": "You are Chief. Every 30 minutes, check for important updates.",
  "messages": [
    {
      "role": "user",
      "content": "Read HEARTBEAT.md if it exists. Follow it strictly. If nothing needs attention, reply HEARTBEAT_OK."
    }
  ]
}`,
          annotation: "Periodic heartbeat fires automatically.",
        },
      ],
      workspace: emailWorkspace(
        "Start the scheduled heartbeat run",
        "Autonomous workflows often begin by reading a standing instruction file before they touch anything else.",
        {
          "HEARTBEAT.md": { status: "active" },
        }
      ),
      delay: 2000,
    },
    {
      chat: {
        role: "thinking",
        content: "Let me check for unread emails. Blake usually has important messages in the morning.",
      },
      api: [
        {
          label: "response (thinking)",
          json: `{
  "content": [
    {
      "type": "text",
      "text": "Let me check for unread emails."
    }
  ]
}`,
          annotation: "Agent decides to check inbox proactively.",
        },
      ],
      workspace: emailWorkspace(
        "Move into the mail workspace and decide what to inspect",
        "The agent is now focused on the mailbox area but has not touched the unread cache yet.",
        {
          mail: { status: "active" },
        }
      ),
      delay: 2000,
    },
    {
      chat: {
        role: "tool-call",
        content: 'exec({ command: "gog gmail list --unread --limit 5 --format json" })',
        toolName: "exec",
      },
      api: [
        {
          label: "tool_use (exec)",
          json: `{
  "content": [
    {
      "type": "tool_use",
      "name": "exec",
      "input": {
        "command": "gog gmail list --unread --limit 5 --format json"
      }
    }
  ]
}`,
          annotation: "Calls Gmail CLI (gog) to fetch unread emails.",
        },
      ],
      workspace: emailWorkspace(
        "Query the unread mail index through the Gmail CLI",
        "This is the data touch: the workflow refreshes the local mail index before it reasons about what matters.",
        {
          "mail/inbox-cache.sqlite": {
            status: "queried",
            meta: "Unread mail is being refreshed and indexed for triage.",
          },
        }
      ),
      delay: 3000,
    },
    {
      chat: {
        role: "tool-result",
        content: '[\n  { "from": "Dave Devries", "subject": "Re: Data Pipeline Proposal", "snippet": "Love the approach. Can we schedule a call this week?" },\n  { "from": "Morning Brew", "subject": "Your daily newsletter", "snippet": "..." },\n  { "from": "GitHub", "subject": "[provider-search] New issue opened", "snippet": "..." }\n]',
        toolName: "exec",
      },
      api: [
        {
          label: "tool_result (emails)",
          json: `{
  "content": [
    {
      "type": "tool_result",
      "content": "[\\n  { \\"from\\": \\"Dave Devries\\", \\"subject\\": \\"Re: Data Pipeline Proposal\\", \\"snippet\\": \\"Love the approach. Can we schedule a call this week?\\" },\\n  { \\"from\\": \\"Morning Brew\\", \\"subject\\": \\"Your daily newsletter\\", \\"snippet\\": \\"...\\" },\\n  { \\"from\\": \\"GitHub\\", \\"subject\\": \\"[provider-search] New issue opened\\", \\"snippet\\": \\"...\\" }\\n]"
    }
  ]
}`,
          highlightLines: [4, 5],
          annotation: "3 unread emails returned. First one looks important.",
        },
      ],
      workspace: emailWorkspace(
        "Materialize the unread messages into the working inbox",
        "Three concrete message artifacts appear. One of them is clearly worth attention.",
        {
          "mail/unread/dave-devries.json": { status: "created" },
          "mail/unread/morning-brew.json": { status: "created" },
          "mail/unread/github-issue.json": { status: "created" },
        },
        emailUnreadFiles
      ),
      delay: 2500,
    },
    {
      chat: {
        role: "thinking",
        content: "Dave's email is important — he's a potential client interested in the data pipeline. The other two are routine. I should notify Blake about Dave's message.",
      },
      api: [
        {
          label: "response (reasoning)",
          json: `{
  "content": [
    {
      "type": "text",
      "text": "Dave's email is important — he's a potential client. I should notify Blake."
    }
  ]
}`,
          annotation: "Agent prioritizes based on context (knows Dave is a prospect).",
        },
      ],
      workspace: emailWorkspace(
        "Focus on Dave's message and ignore the routine noise",
        "The file map helps show that the agent is choosing between concrete items, not just generating vibes.",
        {
          "mail/unread/dave-devries.json": { status: "active" },
        },
        emailUnreadFiles
      ),
      delay: 2000,
    },
    {
      chat: {
        role: "assistant",
        content: "📧 You have 3 unread emails.\n\n**Important:** Dave Devries replied to your data pipeline proposal — he loves the approach and wants to schedule a call this week.\n\nThe other two are a Morning Brew newsletter and a GitHub issue notification.\n\nWant me to draft a reply to Dave?",
      },
      api: [
        {
          label: "final response",
          json: `{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "📧 You have 3 unread emails.\\n\\n**Important:** Dave Devries replied to your data pipeline proposal..."
    }
  ],
  "stop_reason": "end_turn"
}`,
          annotation: "Proactive alert with context. Agent knows what matters.",
        },
      ],
      workspace: emailWorkspace(
        "Present the triage result to the user",
        "The important unread message stays highlighted because it is the one driving the next action.",
        {
          "mail/unread/dave-devries.json": { status: "active" },
        },
        emailUnreadFiles
      ),
      delay: 2500,
    },
    {
      chat: {
        role: "user",
        content: "Yes, draft a reply suggesting Thursday afternoon.",
      },
      api: [
        {
          label: "request",
          json: `{
  "messages": [
    { ... previous messages ... },
    {
      "role": "user",
      "content": "Yes, draft a reply suggesting Thursday afternoon."
    }
  ]
}`,
          annotation: "User approves next action.",
        },
      ],
      workspace: emailWorkspace(
        "Prepare the outbox for a new reply",
        "The workflow pivots from inbox triage into message creation.",
        {
          "mail/outbox": { status: "active" },
        },
        emailUnreadFiles
      ),
      delay: 2000,
    },
    {
      chat: {
        role: "tool-call",
        content: 'exec({ command: "gog gmail send --to davidde@ashn.com --subject \\"Re: Data Pipeline Proposal\\" --body \\"Hi Dave,\\n\\nThanks for the positive feedback! I\'d love to schedule a call.\\n\\nHow does Thursday afternoon work for you? I\'m free after 2 PM PST.\\n\\nBest,\\nBlake\\"" })',
        toolName: "exec",
      },
      api: [
        {
          label: "tool_use (send)",
          json: `{
  "content": [
    {
      "type": "tool_use",
      "name": "exec",
      "input": {
        "command": "gog gmail send --to davidde@ashn.com --subject \\"Re: Data Pipeline Proposal\\" --body \\"Hi Dave,\\\\n\\\\nThanks for the positive feedback! I'd love to schedule a call.\\\\n\\\\nHow does Thursday afternoon work for you? I'm free after 2 PM PST.\\\\n\\\\nBest,\\\\nBlake\\""
      }
    }
  ]
}`,
          highlightLines: [6, 7],
          annotation: "Sends email via Gmail CLI. Natural, professional tone.",
        },
      ],
      workspace: emailWorkspace(
        "Create the outbound reply and send it",
        "A new email artifact appears in the outbox while the workflow records its own run log.",
        {
          "mail/outbox/dave-devries-reply.eml": { status: "created" },
          "logs/heartbeat-0900.log": { status: "updated" },
        },
        [...emailUnreadFiles, ...emailOutboxFiles]
      ),
      delay: 3000,
    },
    {
      chat: {
        role: "tool-result",
        content: "Message sent successfully. Message ID: 18d4f2a1b3c9e7f0",
        toolName: "exec",
      },
      api: [
        {
          label: "tool_result",
          json: `{
  "content": [
    {
      "type": "tool_result",
      "content": "Message sent successfully. Message ID: 18d4f2a1b3c9e7f0"
    }
  ]
}`,
          annotation: "Confirmation from Gmail API.",
        },
      ],
      workspace: emailWorkspace(
        "Record that the reply left the system successfully",
        "The outbox file is now a completed artifact rather than a draft-in-progress.",
        {
          "mail/outbox/dave-devries-reply.eml": { status: "updated" },
          "logs/heartbeat-0900.log": {
            status: "updated",
            meta: "Heartbeat log updated with send confirmation and message id.",
          },
        },
        [...emailUnreadFiles, ...emailOutboxFiles]
      ),
      delay: 1500,
    },
    {
      chat: {
        role: "assistant",
        content: "✅ Sent reply to Dave suggesting Thursday afternoon (after 2 PM PST).\n\nThe email is warm, professional, and moves the conversation forward. You're all set.",
      },
      api: [
        {
          label: "final response",
          json: `{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "✅ Sent reply to Dave suggesting Thursday afternoon..."
    }
  ],
  "stop_reason": "end_turn"
}`,
          annotation: "Task complete. Proactive work done during heartbeat.",
        },
      ],
      workspace: emailWorkspace(
        "Finish the heartbeat with inbox, outbox, and audit trail all updated",
        "This is the direct perspective you were asking for: the agent moved across the instruction file, database index, unread files, and outbox in a single run.",
        {
          "mail/outbox/dave-devries-reply.eml": { status: "updated" },
          "logs/heartbeat-0900.log": { status: "updated" },
        },
        [...emailUnreadFiles, ...emailOutboxFiles]
      ),
      delay: 2000,
    },
  ],
};

// ─── Scenario 3: Code + Deploy ───

const codeDeploy: Scenario = {
  id: "openclaw-code-deploy",
  title: "openclaw: code + deploy",
  intro: {
    label: "agent orchestration",
    heading: "From Feature Request to Production Deploy",
    description: "The most advanced agent pattern: receive a feature request, delegate coding to a specialized AI, review the result, then deploy to a live server. From idea to production in minutes — with a human approving the final step.",
  },
  steps: [
    {
      chat: {
        role: "user",
        content: "Add a CSV export button to the provider search results",
      },
      api: [
        {
          label: "request",
          json: `{
  "model": "claude-sonnet-4-20250514",
  "system": "You are Chief. You have access to coding agents (Claude Code) for development work.",
  "tools": [
    {
      "name": "exec",
      "description": "Execute shell commands",
      "input_schema": {
        "properties": {
          "command": { "type": "string" },
          "pty": { "type": "boolean" },
          "timeout": { "type": "number" }
        }
      }
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "Add a CSV export button to the provider search results"
    }
  ]
}`,
          annotation: "User requests a code change to the production app.",
        },
      ],
      workspace: codeWorkspace(
        "Scope the provider-search repo for the new CSV export feature",
        "The workflow begins with the part of the app that already renders provider results.",
        {
          "src/components": { status: "active" },
          "src/components/ExcelTableView.tsx": { status: "active" },
        }
      ),
      delay: 2500,
    },
    {
      chat: {
        role: "thinking",
        content: "This is a code change to the provider-search repo. I should use Claude Code (our coding agent) to implement this. The CSV export should go in the frontend results view.",
      },
      api: [
        {
          label: "response (planning)",
          json: `{
  "content": [
    {
      "type": "text",
      "text": "This is a code change. I'll use Claude Code to implement this."
    }
  ]
}`,
          annotation: "Agent decides to delegate to specialized coding agent.",
        },
      ],
      workspace: codeWorkspace(
        "Plan work around the table component and a new export helper",
        "The agent has enough context to know which file changes and which directory likely gets a new utility.",
        {
          "src/components/ExcelTableView.tsx": { status: "active" },
          "src/utils": { status: "active" },
        }
      ),
      delay: 2000,
    },
    {
      chat: {
        role: "tool-call",
        content: 'exec({ command: "cd ~/Repo/provider-search && claude -p \'Add a CSV export button to the search results table. The button should export all visible provider data (name, specialty, address, phone, rating) to a downloadable CSV file. Update the ExcelTableView component.\'", pty: true, timeout: 300 })',
        toolName: "exec",
      },
      api: [
        {
          label: "tool_use (spawn coding agent)",
          json: `{
  "content": [
    {
      "type": "tool_use",
      "name": "exec",
      "input": {
        "command": "cd ~/Repo/provider-search && claude -p 'Add a CSV export button to the search results table. The button should export all visible provider data (name, specialty, address, phone, rating) to a downloadable CSV file. Update the ExcelTableView component.'",
        "pty": true,
        "timeout": 300
      }
    }
  ]
}`,
          highlightLines: [7, 8, 9],
          annotation: "Spawns Claude Code with clear task. PTY required for interactive CLI.",
        },
      ],
      workspace: codeWorkspace(
        "Hand off the implementation to Claude Code inside the repo",
        "The coding agent opens the existing table view and starts shaping a dedicated export helper.",
        {
          "src/components/ExcelTableView.tsx": { status: "active" },
          "src/utils": { status: "active" },
        }
      ),
      delay: 3000,
    },
    {
      chat: {
        role: "tool-result",
        content: "[Claude Code]\nReading ExcelTableView.tsx...\nAdding CSV export logic...\nUpdating imports and state...\nCreated exportToCSV utility function...\nAdded export button to toolbar...\n\nFiles modified:\n- src/components/ExcelTableView.tsx\n- src/utils/csvExport.ts (new)\n\n✓ Build successful\n✓ Type check passed",
        toolName: "exec",
      },
      api: [
        {
          label: "tool_result (claude code output)",
          json: `{
  "content": [
    {
      "type": "tool_result",
      "content": "[Claude Code]\\nReading ExcelTableView.tsx...\\nAdding CSV export logic...\\nUpdating imports and state...\\nCreated exportToCSV utility function...\\nAdded export button to toolbar...\\n\\nFiles modified:\\n- src/components/ExcelTableView.tsx\\n- src/utils/csvExport.ts (new)\\n\\n✓ Build successful\\n✓ Type check passed"
    }
  ]
}`,
          annotation: "Claude Code completed the task. Two files changed, build passed.",
        },
      ],
      workspace: codeWorkspace(
        "Surface the changed tree after the coding agent finishes",
        "One file was updated and a brand-new utility file appeared as part of the implementation.",
        {
          "src/components/ExcelTableView.tsx": {
            status: "updated",
            meta: "Toolbar updated with a visible CSV export action.",
          },
          "src/utils/csvExport.ts": { status: "created" },
          "package.json": {
            status: "active",
            meta: "Build and type-check scripts were run successfully.",
          },
        },
        codeCreatedFiles
      ),
      delay: 3500,
    },
    {
      chat: {
        role: "assistant",
        content: "✅ CSV export button added!\n\nClaude Code updated two files:\n• `ExcelTableView.tsx` — added export button to the toolbar\n• `csvExport.ts` — new utility for converting table data to CSV\n\nThe button exports all visible provider data (name, specialty, address, phone, rating). Build passed with no errors.\n\nReady to deploy to production?",
      },
      api: [
        {
          label: "final response",
          json: `{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "✅ CSV export button added!\\n\\nClaude Code updated two files..."
    }
  ],
  "stop_reason": "end_turn"
}`,
          annotation: "Agent summarizes work and asks for deployment approval.",
        },
      ],
      workspace: codeWorkspace(
        "Hold the modified files for review before deployment",
        "The changed file tree is now stable enough for a human approval checkpoint.",
        {
          "src/components/ExcelTableView.tsx": { status: "updated" },
          "src/utils/csvExport.ts": { status: "created" },
        },
        codeCreatedFiles
      ),
      delay: 2500,
    },
    {
      chat: {
        role: "user",
        content: "Yes, deploy it",
      },
      api: [
        {
          label: "request",
          json: `{
  "messages": [
    { ... },
    { "role": "user", "content": "Yes, deploy it" }
  ]
}`,
          annotation: "User approves deployment.",
        },
      ],
      workspace: codeWorkspace(
        "Shift from coding mode into deployment mode",
        "At this point the repo contents are ready; the operational file becomes docker-compose.yml.",
        {
          "docker-compose.yml": { status: "active" },
          "src/components/ExcelTableView.tsx": { status: "updated" },
          "src/utils/csvExport.ts": { status: "created" },
        },
        codeCreatedFiles
      ),
      delay: 1500,
    },
    {
      chat: {
        role: "tool-call",
        content: 'exec({ command: "cd ~/Repo/provider-search && git add -A && git commit -m \\"feat: add CSV export button to search results\\" && git push" })',
        toolName: "exec",
      },
      api: [
        {
          label: "tool_use (git push)",
          json: `{
  "content": [
    {
      "type": "tool_use",
      "name": "exec",
      "input": {
        "command": "cd ~/Repo/provider-search && git add -A && git commit -m \\"feat: add CSV export button to search results\\" && git push"
      }
    }
  ]
}`,
          annotation: "Commits and pushes changes to GitHub.",
        },
      ],
      workspace: codeWorkspace(
        "Package the repo changes for git and push them upstream",
        "The same two code artifacts remain the meaningful changes in the tree while the workflow moves through source control.",
        {
          "src/components/ExcelTableView.tsx": { status: "updated" },
          "src/utils/csvExport.ts": { status: "created" },
        },
        codeCreatedFiles
      ),
      delay: 3000,
    },
    {
      chat: {
        role: "tool-result",
        content: "[main 7a3b9f2] feat: add CSV export button to search results\n 2 files changed, 47 insertions(+), 2 deletions(-)\n create mode 100644 src/utils/csvExport.ts\nTo github.com:blakethom8/provider-search.git\n   f1d8c4a..7a3b9f2  main -> main",
        toolName: "exec",
      },
      api: [
        {
          label: "tool_result (git output)",
          json: `{
  "content": [
    {
      "type": "tool_result",
      "content": "[main 7a3b9f2] feat: add CSV export button to search results\\n 2 files changed, 47 insertions(+), 2 deletions(-)\\n create mode 100644 src/utils/csvExport.ts\\nTo github.com:blakethom8/provider-search.git\\n   f1d8c4a..7a3b9f2  main -> main"
    }
  ]
}`,
          annotation: "Commit successful, pushed to remote.",
        },
      ],
      workspace: codeWorkspace(
        "Keep the modified tree intact after the push succeeds",
        "Nothing new changed in the workspace, but the repo state is now durable beyond the local machine.",
        {
          "src/components/ExcelTableView.tsx": { status: "updated" },
          "src/utils/csvExport.ts": { status: "created" },
        },
        codeCreatedFiles
      ),
      delay: 2500,
    },
    {
      chat: {
        role: "tool-call",
        content: 'exec({ command: "ssh root@5.78.142.73 \\"cd /root/provider-search && git pull && docker compose up -d --build\\"" })',
        toolName: "exec",
      },
      api: [
        {
          label: "tool_use (deploy to production)",
          json: `{
  "content": [
    {
      "type": "tool_use",
      "name": "exec",
      "input": {
        "command": "ssh root@5.78.142.73 \\"cd /root/provider-search && git pull && docker compose up -d --build\\""
      }
    }
  ]
}`,
          annotation: "SSH to production server, pull latest code, rebuild containers.",
        },
      ],
      workspace: codeWorkspace(
        "Use docker-compose.yml to roll the new code into production",
        "The focus leaves the source files and moves to the operational artifact that controls the live containers.",
        {
          "docker-compose.yml": {
            status: "active",
            meta: "Production stack is being pulled and rebuilt on the server.",
          },
          "src/components/ExcelTableView.tsx": { status: "updated" },
          "src/utils/csvExport.ts": { status: "created" },
        },
        codeCreatedFiles
      ),
      delay: 4000,
    },
    {
      chat: {
        role: "tool-result",
        content: "Already up to date.\nUpdating 7a3b9f2..HEAD\nFast-forward\n src/components/ExcelTableView.tsx | 25 +++++++++++++++++++------\n src/utils/csvExport.ts | 22 ++++++++++++++++++++++\n 2 files changed, 47 insertions(+)\n\n[+] Building 12.3s (14/14) FINISHED\n[+] Running 2/2\n ✔ Container provider-search-web  Started\n ✔ Container provider-search-api  Started",
        toolName: "exec",
      },
      api: [
        {
          label: "tool_result (deploy output)",
          json: `{
  "content": [
    {
      "type": "tool_result",
      "content": "Already up to date.\\nUpdating 7a3b9f2..HEAD\\nFast-forward\\n...\\n[+] Building 12.3s (14/14) FINISHED\\n[+] Running 2/2\\n ✔ Container provider-search-web  Started\\n ✔ Container provider-search-api  Started"
    }
  ]
}`,
          annotation: "Production deployment complete. Both containers restarted successfully.",
        },
      ],
      workspace: codeWorkspace(
        "Confirm the deploy completed with the new tree in place",
        "The repo state is unchanged now, but the live environment has caught up to it.",
        {
          "docker-compose.yml": { status: "active" },
          "src/components/ExcelTableView.tsx": { status: "updated" },
          "src/utils/csvExport.ts": { status: "created" },
        },
        codeCreatedFiles
      ),
      delay: 3000,
    },
    {
      chat: {
        role: "assistant",
        content: "🚀 **Deployed to production!**\n\n• Code committed and pushed to GitHub\n• Production server pulled latest changes\n• Docker containers rebuilt (12.3s build time)\n• Both containers running\n\n**The CSV export button is now live at mydoclist.com**\n\nUsers can click the button to download search results as a CSV file with all provider data.",
      },
      api: [
        {
          label: "final response",
          json: `{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "🚀 **Deployed to production!**\\n\\n• Code committed and pushed to GitHub..."
    }
  ],
  "stop_reason": "end_turn"
}`,
          annotation: "Full workflow complete: idea → code → test → deploy → production. ~2 minutes total.",
        },
      ],
      workspace: codeWorkspace(
        "Land the final state: repo updated, helper created, deployment complete",
        "The side pane now tells the whole story from request to changed files to production rollout.",
        {
          "src/components/ExcelTableView.tsx": { status: "updated" },
          "src/utils/csvExport.ts": { status: "created" },
          "docker-compose.yml": { status: "active" },
        },
        codeCreatedFiles
      ),
      delay: 2500,
    },
  ],
};

// ─── Export ───

export const openclawScenarios: Scenario[] = [
  fileNavigator,
  emailCheck,
  codeDeploy,
];
