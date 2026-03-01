# File Management Strategy: What Lives Where

## The Core Question

With two machines — a MacBook Pro and a Mac Mini — where does each file belong? This isn't a trivial question. Get it wrong and you end up with:
- Stale copies on one machine while the other has the latest
- Accidentally editing the wrong version
- Sync conflicts that corrupt data
- Wasted disk space duplicating everything

The answer isn't "sync everything." It's **assign clear ownership**.

---

## The Ownership Principle

Every file category has one **primary machine**. That machine is the source of truth. The other machine may have a read-only copy, a synced mirror, or no copy at all.

```
┌─────────────────────────────────────────────────────────┐
│                    FILE OWNERSHIP MAP                     │
│                                                          │
│  MacBook Pro (OWNS)          Mac Mini (OWNS)             │
│  ─────────────────           ──────────────              │
│  ✓ Code repositories         ✓ Agent workspace           │
│  ✓ Design files              ✓ Memory files              │
│  ✓ Documents (writing)       ✓ Daily logs                │
│  ✓ Photos/media              ✓ Agent reports             │
│  ✓ Local dev environments    ✓ Cron job outputs          │
│  ✓ Browser bookmarks/state   ✓ Whisper transcripts       │
│                              ✓ Docker volumes            │
│                              ✓ Gateway logs              │
│                              ✓ Session transcripts       │
│                                                          │
│  SHARED (synced)             NEITHER (cloud-only)        │
│  ────────────────            ────────────────────         │
│  ✓ Workspace context files   ✓ Passwords (1Password)     │
│    (SOUL.md, USER.md, etc.)  ✓ API keys (not in files)   │
│  ✓ Skills definitions        ✓ Production deployments    │
│  ✓ TODO.md (conflict-prone!) ✓ Source control (GitHub)   │
└─────────────────────────────────────────────────────────┘
```

---

## Category-by-Category Breakdown

### 1. Code Repositories → MacBook Pro Owns

**Why**: You edit code on the MacBook. You run Cursor/VS Code on the MacBook. Git operations happen on the MacBook.

**Strategy**: Code repos live on the MacBook. The Mac Mini does NOT need copies of your code repos unless an agent task specifically requires reading them.

If an agent needs to interact with a repo:
- **Option A**: The agent clones it fresh from GitHub (clean, always current)
- **Option B**: rsync a read-only mirror when needed (manual, controlled)
- **Never**: Real-time bidirectional sync of git repos (merge conflicts, git state corruption)

```
MacBook Pro                    Mac Mini
~/Repo/provider-search/   →   (No copy. Agent clones from GitHub if needed.)
~/Repo/cms-data/           →   (No copy. Agent SSHes to Hetzner for CMS work.)
```

### 2. Agent Workspace → Mac Mini Owns

**Why**: The Mac Mini runs the agents. Agents read/write workspace files constantly. Agent memory, daily logs, reports — all generated on the Mini.

**Strategy**: The workspace lives on the Mac Mini. The MacBook accesses it over SSH/SFTP when you want to review reports or check on things.

```
Mac Mini (source of truth)            MacBook Pro (access via SSH)
~/openclaw/workspace/                  ssh mini:~/openclaw/workspace/
├── memory/2026-03-01.md               # Read from laptop when curious
├── reports/email-summary.md           # Read from laptop when reviewing
├── TODO.md                            # Edit via agent commands, not locally
└── ...
```

### 3. Context Files (SOUL.md, USER.md, etc.) → Shared

**Why**: Both machines need these files. The MacBook uses them when running Claude Code or a local OpenClaw instance. The Mac Mini uses them for every agent session.

**Strategy**: One-way sync from MacBook → Mac Mini. The MacBook is the source of truth for identity and context files. When you update USER.md or WORK.md on the MacBook, sync it to the Mini.

```bash
# Manual sync command (run from MacBook when you update context files):
rsync -av ~/openclaw/workspace/{SOUL.md,USER.md,WORK.md,TOOLS.md,AGENTS.md} \
  yourusername@blakes-mac-mini:~/openclaw/workspace/
```

Or automate with a simple script:
```bash
#!/bin/bash
# ~/scripts/sync-context-to-mini.sh
MINI="yourusername@blakes-mac-mini"
WORKSPACE="~/openclaw/workspace"
FILES="SOUL.md USER.md WORK.md TOOLS.md AGENTS.md IDENTITY.md"

for f in $FILES; do
  rsync -av "$WORKSPACE/$f" "$MINI:$WORKSPACE/$f"
done
echo "Context files synced to Mac Mini"
```

### 4. Skills → Shared

**Why**: Both machines need the same skills. New skills are typically installed via the MacBook.

**Strategy**: rsync the skills directory after installing new skills.

```bash
rsync -av ~/clawd/skills/ yourusername@blakes-mac-mini:~/clawd/skills/
```

### 5. TODO.md → The Tricky One

**Why**: Both you and the agent modify TODO.md. You add tasks from the MacBook. The agent checks off tasks from the Mini.

**Strategy options**:

**Option A — Mac Mini Owns (Recommended)**:
Let the agent own TODO.md. Add tasks by telling the agent ("add X to my TODO"), not by editing the file directly. This avoids conflicts entirely.

**Option B — Git-Based Sync**:
Put TODO.md in a git repo. Both machines commit and pull. Works but adds friction and risk of merge conflicts.

**Option C — Symlink to Shared Storage**:
Store TODO.md in iCloud or Dropbox, symlink from both machines. Real-time sync but risk of simultaneous edit conflicts.

**Recommendation**: Option A. Talk to the agent, let it manage the file. This is the whole point of having an AI assistant.

### 6. Personal Website / Blog Content → MacBook Owns

**Why**: You write and edit content on the MacBook. The content is in a git repo.

**Strategy**: Content lives on the MacBook, pushed to GitHub, deployed from GitHub. The Mac Mini doesn't need this.

```
MacBook Pro (source of truth)
~/openclaw/workspace/personal-website/
  ├── content/posts/        ← You write here
  ├── content/research/     ← Research docs (including this file)
  └── src/                  ← Next.js source code
```

### 7. Secrets and API Keys → Neither Machine (Ideally)

**Why**: API keys should not exist in plain text files on disk. They should be in environment variables loaded from a secure source.

**Strategy**:
- Store secrets in 1Password (or similar)
- Load into environment variables at shell startup
- `openclaw.json` has API keys embedded (current approach) — this is a known compromise
- **Never** sync secrets between machines via rsync or cloud storage

```bash
# In ~/.zshrc on each machine independently:
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
```

Each machine has its own copy of keys in its own `.zshrc`. They're never transmitted between machines.

---

## Sync Strategy Summary

| File Category | Source of Truth | Sync Method | Frequency |
|--------------|----------------|-------------|-----------|
| Code repos | MacBook Pro | Git (via GitHub) | On push/pull |
| Agent workspace | Mac Mini | SSH access from laptop | On demand |
| Context files | MacBook Pro | rsync → Mini | When updated |
| Skills | MacBook Pro | rsync → Mini | When installed |
| TODO.md | Mac Mini | Agent-managed | Never synced |
| Daily memory logs | Mac Mini | SSH access from laptop | Read-only |
| Reports | Mac Mini | SSH access from laptop | Read-only |
| Blog content | MacBook Pro | Git (via GitHub) | On push/pull |
| API keys | Each machine independently | Manual per-machine | Never synced |
| Docker state | Mac Mini | Not synced | N/A |
| Whisper models | Mac Mini | Not synced | N/A |

---

## What NOT to Do

### Don't Use iCloud Drive for Agent Files
- iCloud has sync latency (minutes, not seconds)
- It creates `.icloud` placeholder files that confuse CLI tools
- File conflicts are silent and destructive
- The agent writes files rapidly — iCloud can't keep up

### Don't Use Dropbox for Workspace Sync
- Same problems as iCloud, plus Dropbox adds metadata files
- Enterprise Dropbox adds DRM that breaks things
- Version conflicts are hard to resolve

### Don't Use Real-Time Bidirectional Sync
- Tools like Syncthing or Unison work for some use cases
- But agent workloads create rapid, continuous file changes
- Conflict resolution is a nightmare when both machines write to the same file

### Don't Mirror Everything
- The MacBook doesn't need Whisper models, Docker volumes, or agent logs
- The Mac Mini doesn't need your code repos, design files, or browser state
- Partial, purposeful sync > full mirror

---

## Directory Structure Comparison

### MacBook Pro
```
~/openclaw/
├── openclaw.json              ← MacBook-specific config (loopback gateway)
├── workspace/
│   ├── SOUL.md                ← Source of truth (synced TO Mini)
│   ├── USER.md                ← Source of truth
│   ├── WORK.md                ← Source of truth
│   ├── TOOLS.md               ← Source of truth
│   ├── personal-website/      ← Active development project
│   ├── provider-search/ →     ← Symlink to ~/Repo/provider-search
│   └── scripts/
├── clawd/
│   └── skills/                ← Source of truth (synced TO Mini)
└── logs/                      ← MacBook-local logs
```

### Mac Mini
```
~/openclaw/
├── openclaw.json              ← Mini-specific config (Tailscale gateway)
├── workspace/
│   ├── SOUL.md                ← Synced FROM MacBook
│   ├── USER.md                ← Synced FROM MacBook
│   ├── WORK.md                ← Synced FROM MacBook
│   ├── TOOLS.md               ← Synced FROM MacBook
│   ├── TODO.md                ← Agent-managed (source of truth)
│   ├── MEMORY.md              ← Agent-managed
│   ├── memory/                ← Daily logs (agent-generated)
│   │   ├── 2026-03-01.md
│   │   └── ...
│   ├── reports/               ← Agent-generated reports
│   └── scripts/               ← Agent utility scripts
├── clawd/
│   └── skills/                ← Synced FROM MacBook
└── logs/                      ← Mini-local logs (gateway, agents)
```

---

## Key Takeaway

The file management strategy is simple once you accept one principle: **every file has one owner**. The MacBook owns code and content. The Mac Mini owns agent state and output. Shared files flow one direction (MacBook → Mini) via manual rsync. The agent manages its own files (TODO, memory, reports) without interference.

This isn't as seamless as "everything syncs magically." But it's reliable. No conflicts. No stale copies. No surprises. And when you want to see what the agent has been doing, `ssh mini:~/openclaw/workspace/reports/` is always one command away.
