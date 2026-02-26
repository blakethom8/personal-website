// OpenClaw Terminal Simulator Scenarios
// These scenarios show real OpenClaw workflows in action

import { Scenario, ConversationStep, ChatMessage, ApiBlock } from './conversation-scenarios';

// ─── Scenario 1: File Navigator ───

const fileNavigator: Scenario = {
  id: "openclaw-file-navigator",
  title: "openclaw: file navigator",
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
      delay: 2500,
    },
  ],
};

// ─── Scenario 2: Email Check (Heartbeat) ───

const emailCheck: Scenario = {
  id: "openclaw-email-check",
  title: "openclaw: email check",
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
      delay: 2000,
    },
  ],
};

// ─── Scenario 3: Code + Deploy ───

const codeDeploy: Scenario = {
  id: "openclaw-code-deploy",
  title: "openclaw: code + deploy",
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
