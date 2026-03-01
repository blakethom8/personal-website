# Memory + Context Management: How OpenClaw Remembers

## The Core Problem

Every AI agent faces the same fundamental constraint: **context windows are finite, but work is infinite**. A single conversation with Claude has a context limit. When that conversation ends, the model forgets everything. When the context fills up mid-conversation, something has to be dropped.

OpenClaw's memory architecture is its answer to this problem, and it's built on a surprisingly simple principle: **files are the source of truth, not the model's context window**.

---

## The Three-Layer Memory Model

### Layer 1: Workspace Files (Long-Term Memory)

OpenClaw's most important memory mechanism is the most mundane: Markdown files on disk.

```
workspace/
├── SOUL.md          # Agent personality and values
├── USER.md          # User profile, preferences, communication style
├── WORK.md          # Professional workflows and project context
├── PERSONAL.md      # Personal life management context
├── AGENTS.md        # How agents work, memory protocols, task tracking
├── TOOLS.md         # Installed tools, skills, API keys
├── HEARTBEAT.md     # Periodic check-in tasks
├── MEMORY.md        # Curated long-term memories (main session only)
├── TODO.md          # Central task list
└── memory/
    ├── 2026-02-28.md  # Daily log
    ├── 2026-02-27.md  # Daily log
    └── ...
```

**Every new session starts by reading these files.** The agent doesn't remember your name because it was in a previous conversation — it remembers because `USER.md` says who you are, what you care about, and how you communicate.

This is the critical insight: **memory is explicit, not implicit**. Nothing is remembered unless it's written to a file. Nothing is forgotten unless a file is deleted or modified.

### Layer 2: Daily Logs (Ephemeral Memory)

The `memory/YYYY-MM-DD.md` files function as a running journal:

- Append-only during the day
- Capture decisions, activities, context, and observations
- Provide a timeline of what happened and why
- Can be reviewed later for patterns or reference

These are the agent's "working notes" — raw, chronological, low-curation. They bridge the gap between the curated workspace files and the volatile context window.

### Layer 3: Semantic Search (Recall)

OpenClaw builds a small **vector index** over memory files. This enables:

- **`memory_search`**: Semantic recall — "find notes about the provider search project" finds relevant snippets even if the exact words differ
- **`memory_get`**: Targeted read — retrieve a specific file or line range

The vector index uses remote embeddings (configurable) to convert text chunks into numerical vectors. When you query, your question is also embedded, and the closest matches are returned.

This means the agent can find relevant context it wrote weeks ago without scanning every file linearly.

---

## Context Management: Fitting Infinity into a Finite Window

### The Context Assembly Pipeline

Before every LLM call, OpenClaw assembles the context from four sources:

```
┌──────────────────────────────────────────────────────┐
│                    CONTEXT WINDOW                     │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 1. Base Prompt                                   │ │
│  │    Core identity, safety rules, behavior specs   │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 2. Skills Prompt                                 │ │
│  │    Compact list of available skills/capabilities │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 3. Bootstrap Context Files                       │ │
│  │    SOUL.md, USER.md, WORK.md, AGENTS.md, etc.   │ │
│  │    (Read fresh every session)                    │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 4. Per-Run Overrides                             │ │
│  │    Task-specific instructions, channel context   │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 5. Conversation History                          │ │
│  │    Messages + tool calls + tool results          │ │
│  │    (This grows throughout the session)           │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Context Pruning: Cache-TTL Mode

OpenClaw uses a **cache-TTL** context pruning strategy with a 1-hour TTL. Here's how it works:

1. Each message/tool-result in the conversation history has a timestamp
2. Content older than the TTL (1 hour) is eligible for pruning
3. When context approaches the window limit, old content is dropped
4. The system prompt (layers 1-4) is always retained — only conversation history is pruned

This means the agent always knows who it is (SOUL.md), who you are (USER.md), and what it can do (TOOLS.md). What it loses is the details of earlier tool calls and intermediate reasoning from earlier in the conversation.

### The Memory Flush: Saving Before Forgetting

This is one of OpenClaw's cleverest mechanisms. When a session approaches the context limit and compaction is about to happen, the system triggers a **silent agentic turn**:

```
Context approaching limit
    → System triggers memory flush
    → Agent writes important context to memory files
    → Context is then safely compacted
    → Agent continues with compressed context + file-based memory
```

The `/compact` command can also trigger this manually. The effect is that the agent gets a chance to "save its thoughts" before the context window is compressed — preventing the loss of important information.

### How This Feels in Practice

From a user's perspective:

1. **Start of session**: Agent reads workspace files, immediately knows your name, projects, preferences, communication style
2. **During session**: Agent accumulates context from your conversation and tool calls
3. **Long session**: Context fills up, agent saves key points to memory files, context compresses
4. **New session (days later)**: Agent reads updated memory files, picks up where you left off

The experience is one of **continuity without perfect recall**. The agent remembers the important things (because they're in files) while gracefully handling the fact that it can't remember every detail of every conversation.

---

## Memory Hierarchy: What Goes Where

| Memory Type | Where It Lives | TTL | Purpose |
|-------------|---------------|-----|---------|
| Identity | SOUL.md, USER.md | Permanent | Who the agent is, who you are |
| Work context | WORK.md, project files | Permanent | Professional workflows, project details |
| Skills/tools | TOOLS.md, skill files | Permanent | What the agent can do |
| Tasks | TODO.md, project TODOs | Until completed | What needs to be done |
| Daily context | memory/YYYY-MM-DD.md | Archival | What happened today |
| Curated memories | MEMORY.md | Permanent | Important learnings and patterns |
| Session context | Context window | 1-hour TTL | Current conversation details |
| Semantic index | Vector store | Rebuilt | Searchable recall across all files |

---

## Comparison: How Others Handle Memory

### Claude Code
- **Session memory**: Context window only (resets between sessions)
- **Project memory**: `CLAUDE.md` files (read on startup, similar concept)
- **Auto-memory**: Small `MEMORY.md` in `.claude/projects/` directory
- **No semantic search**: Must know which file to read
- **Context compression**: Automatic when approaching limits (similar to OpenClaw)

### NanoClaw
- **Three-tier memory**: Global CLAUDE.md → Group CLAUDE.md → File artifacts
- **Session continuity**: Session IDs in SQLite, transcripts in JSONL
- **Per-group isolation**: Each chat group has its own memory space
- **No semantic search**: File-based only
- **Container-scoped**: Memory is bounded by container mounts

### Traditional Chatbots
- **Context window only**: No persistent memory
- **RAG systems**: External vector databases for retrieval
- **No file-based memory**: Everything in database or vector store

### What Makes OpenClaw Different

1. **Files as first-class memory** — Not a database, not a vector store as primary. Plain Markdown files that humans can read and edit.
2. **Semantic search as an overlay** — Vector search enhances file-based memory, doesn't replace it
3. **Automatic memory flush** — The agent proactively saves important context before compaction
4. **Curated workspace structure** — Different files for different concerns (identity, work, personal, tools)
5. **Daily journaling** — Append-only daily logs create a timeline without curation overhead

---

## Key Takeaway

OpenClaw's memory system is built on the principle that **durable state belongs in files, not in model context**. The context window is treated as working memory (RAM) while the filesystem is treated as long-term storage (disk). The agent writes things down before it forgets them, reads them back when it needs them, and uses semantic search to find relevant context it might not remember exists.

This is fundamentally different from approaches that try to make the context window larger (longer contexts, RAG pipelines injecting relevant chunks). OpenClaw acknowledges the context window is finite and designs around that constraint instead of fighting it.
