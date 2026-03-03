# Content System — How Everything Stays in Sync

This document describes how content flows through the personal website, where it lives, and how to edit it from different surfaces without losing work.

---

## The Three Editing Surfaces

### 1. Notion (visual editing)

**URL:** [Personal Website project](https://www.notion.so/313d297b3589813fa1f2c2d670be3f7c)

Best for: rewriting prose, editing headlines, reorganizing ideas, managing blog post metadata.

Notion holds:
- **Page copy** — one page per route (Home, About, Work, Contact, Learn) with all the editable text extracted from the components
- **Ideas database** — every blog post with full markdown content + properties (title, date, tags, category, status, excerpt, featured, read time, slug)

Notion is a **staging area**, not the source of truth. Edits in Notion don't go live until you tell Claude to sync them.

### 2. Admin Editor (`/admin`)

**URL:** `https://blakethomson.dev/admin`

Best for: quick markdown fixes, previewing how a post renders, editing frontmatter in-place.

The admin editor reads and writes directly to `content/posts/*.md` files on disk via API routes:
- `GET /api/admin/content/load?slug=...` → reads the file
- `POST /api/admin/content/save` → writes to the file

Changes are **immediate on disk** but require a rebuild/redeploy to go live on the production site.

### 3. Claude (code-level editing)

Best for: structural changes, new components, syncing from Notion, batch updates, anything that touches both content and code.

Claude can:
- Read Notion pages and pull content into code
- Edit markdown files directly
- Update TSX components (page copy, layout, styles)
- Create new posts or pages

---

## What Lives Where

| Content type | Source of truth | Notion | Admin editor | Code files |
|---|---|---|---|---|
| **Blog posts** (full articles) | `content/posts/*.md` | Full copy in Ideas database | Read/write via `/admin` | Rendered by `[slug]/page.tsx` |
| **Blog metadata** (title, tags, date...) | Frontmatter in `*.md` files | Database properties in Ideas | Editable in raw markdown | Parsed at build time |
| **Page copy** (headlines, descriptions) | TSX component files | Extracted to Notion pages | Not editable here | Hardcoded in components |
| **Learn section copy** (terminal text, nav) | Component files in `learn/` | Extracted to Learn page | Not editable here | In `OverviewTab.tsx`, etc. |
| **Agents guide content** (modules 1-5) | `content/learn/learn-agents-guide/*.md` | Not in Notion | Not editable here | Server-rendered via remark+remark-html |
| **Simulator scenarios** | TS files in `src/src/lib/` | Not in Notion | Not editable here | `conversation-scenarios.ts`, `context-scenarios.ts`, `openclaw-terminal-scenarios.ts` |
| **Component structure** (layout, styles) | TSX files | Not in Notion | Not editable here | Full source in `src/` |

**Key principle:** The files in the repo are always the source of truth. Notion is a comfortable editing layer on top. The admin editor is a quick-access tool for posts. Neither replaces the repo.

---

## Editing Workflows

### Workflow A: Edit a blog post

**Quick fix (typo, small rewrite):**
1. Go to `/admin`, select the post, edit in the markdown editor
2. Save → writes to disk immediately
3. Redeploy to go live

**Major rewrite:**
1. Edit the full post in Notion (Ideas database → open the post)
2. Tell Claude: "sync [post name] from Notion"
3. Claude reads the Notion page, updates `content/posts/[slug].md`
4. Verify in admin editor or local dev
5. Redeploy to go live

### Workflow B: Edit page copy (headlines, descriptions, bios)

1. Edit in the corresponding Notion page (Home, About, Work, Contact, or Learn)
2. Tell Claude: "sync the About page from Notion" (or whichever page)
3. Claude reads Notion, updates the TSX component
4. Review in local dev
5. Redeploy to go live

### Workflow C: Create a new blog post

**Option 1 — Start in Notion:**
1. Add a new entry to the Ideas database
2. Fill in properties (Title, Slug, Status=draft, Category, Tags, Date)
3. Write the full post content in the page body
4. Tell Claude: "create a new post from Notion for [title]"
5. Claude creates `content/posts/[slug].md` with frontmatter from properties + body from content

**Option 2 — Start in code:**
1. Tell Claude to create a new post, or create `content/posts/[slug].md` directly
2. Write content in the admin editor
3. Tell Claude: "push [slug] to Notion" to keep the database in sync

### Workflow D: Claude makes structural changes

When Claude modifies components, page layouts, or the Learn section:
1. Claude edits the code directly
2. If the change affects copy that's mirrored in Notion, Claude updates Notion too
3. You can review the Notion page to see what changed

---

## Keeping Things in Sync

### The conflict problem

Since content can be edited in multiple places, conflicts can happen. Example: you edit a post title in Notion but also change it in the admin editor before syncing.

### Resolution rules

1. **Always ask before overwriting.** When Claude syncs from Notion, it should diff against the current file and flag conflicts rather than blindly replacing.
2. **Repo wins ties.** If there's ambiguity about which version is newer, the file on disk is the safer bet — it's what's deployed.
3. **Notion is the drafting table.** Use it for writing and rewriting. When you're happy, sync to code. Don't assume Notion and code are automatically in sync.
4. **Admin editor changes are immediate on disk.** If you save in the admin editor, that file is now the latest version. Syncing from Notion afterward would overwrite those changes — so sync Notion first, then do fine-tuning in admin.

### Recommended flow for major edits

```
Notion (write/rewrite)
  → tell Claude to sync
    → Claude updates files on disk
      → verify in admin editor or local dev
        → commit + deploy
```

### Keeping Notion current

Notion can drift from the code if you make changes outside of it. To refresh:
- Tell Claude: "push all posts to Notion" or "push [slug] to Notion"
- Claude reads the markdown files and updates the Notion database

This is a manual step by design — automatic sync would be fragile and surprising.

---

## File Reference

| File | Purpose |
|---|---|
| `content/posts/*.md` | Blog post content (frontmatter + markdown body) |
| `content/learn/learn-agents-guide/00-introduction.md` | Agents guide intro |
| `content/learn/learn-agents-guide/01-05.md` | Agents guide modules 1-5 (numbered markdown) |
| `content/learn/learn-agents-guide/06-same-engine-different-cars.md` | Agents guide epilogue |
| `src/src/app/page.tsx` | Home page copy |
| `src/src/app/about/page.tsx` | About page copy |
| `src/src/app/work/page.tsx` | Work page copy |
| `src/src/app/contact/page.tsx` | Contact page copy |
| `src/src/app/learn/agents-explained/page.tsx` | Agents guide page (server-side markdown rendering) |
| `src/src/components/learn/AgentsGuideView.tsx` | Agents guide UI (step navigator, modal system) |
| `src/src/components/learn/ConversationSimulator.tsx` | Conversation simulator (main orchestrator) |
| `src/src/components/learn/SimulatorFlow.tsx` | Simulator message rendering |
| `src/src/components/learn/ContextPane.tsx` | Simulator context window side panel |
| `src/src/components/learn/OverviewTab.tsx` | Learn overview copy |
| `src/src/components/learn/TerminalSplitBlock.tsx` | Terminal narrative text |
| `src/src/components/learn/DeepDivesTab.tsx` | Deep dives listing copy |
| `src/src/lib/conversation-scenarios.ts` | "How it works" simulator scenarios + context snapshots |
| `src/src/lib/openclaw-terminal-scenarios.ts` | "Agent workflows" simulator scenarios |
| `src/src/lib/context-scenarios.ts` | "Context window" simulator scenarios |
| `src/src/hooks/useSimulator.ts` | Simulator playback state machine (play/pause/step/goToStep) |
| `src/src/lib/admin-content.ts` | Admin editor file operations |
| `src/src/app/api/admin/content/save/route.ts` | Save API (POST, writes to disk) |
| `src/src/app/api/admin/content/load/route.ts` | Load API (GET, reads from disk) |

## Notion Reference

| Notion page | Content | Page ID |
|---|---|---|
| Personal Website (root) | Project overview + route mapping | `313d297b-3589-813f-a1f2-c2d670be3f7c` |
| Home | `/` page copy | `313d297b-3589-8117-816a-d42e70ecc0c5` |
| About | `/about` page copy | `313d297b-3589-81f0-b01f-f7f2ad2ca70c` |
| Work | `/work` page copy | `313d297b-3589-8152-971d-c9bebc4265eb` |
| Contact | `/contact` page copy | `313d297b-3589-8129-a0fe-d478cc760db4` |
| Learn | `/learn` section copy | `313d297b-3589-81b9-a778-daddac355ea6` |
| Ideas (database) | Blog posts | Data source: `214b86e9-cd09-4f5a-aceb-f61c9d2199b0` |

---

## Commands for Claude

These are the phrases Claude understands for content operations:

| Command | What happens |
|---|---|
| "sync [page] from Notion" | Claude reads the Notion page and updates the corresponding code/content file |
| "sync all posts from Notion" | Claude reads all Ideas database entries and updates `content/posts/*.md` |
| "push [slug] to Notion" | Claude reads the markdown file and updates the Notion database entry |
| "push all posts to Notion" | Claude reads all `content/posts/*.md` and updates the Ideas database |
| "create post from Notion for [title]" | Claude creates a new markdown file from a Notion database entry |
| "what's different between Notion and code?" | Claude diffs the two and reports discrepancies |
