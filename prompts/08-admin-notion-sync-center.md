# Prompt 08: Admin Notion Sync Center (Manual Bi-Directional)

## Context

Read in this order:
1. `CLAUDE.md`
2. `docs/DESIGN-SYSTEM.md`
3. `ADMIN-EDITOR-PLAN.md`
4. `CODEX-PROMPT-admin-editor.md`

This prompt is for a later phase. The admin editor already exists at `/admin` and `/admin/edit/[slug]`.

## Goal

Add a **manual Sync Center** to the admin experience so content can sync with Notion in both directions, safely:
- `Push to Notion` (local markdown -> Notion)
- `Pull from Notion` (Notion -> local markdown)

No real-time sync. No webhooks. Human-triggered only.

## Product Rules (Non-Negotiable)

1. **Single source of truth remains local markdown in git** (`content/posts/*.md`).
2. Never overwrite silently.
3. Every sync action must be explicit and directional.
4. If both sides changed since last sync, mark **Conflict** and block one-click overwrite.
5. Show a clear status model per post.

## UX Requirements

On `/admin`, add a "Sync Center" section/table with:
- Post slug
- Local updated time
- Notion updated time
- Last sync time
- Sync status: `In Sync`, `Local Ahead`, `Notion Ahead`, `Conflict`, `Unlinked`
- Actions: `Compare`, `Push`, `Pull`, `Link/Relink`

### Interaction Model

- `Compare`: show summary/diff before write.
- `Push`: confirm modal with impact summary.
- `Pull`: confirm modal + local backup before write.
- `Refresh Sync Status`: manual re-check button.

## Technical Requirements

### Sync Metadata

Create a lightweight metadata store for post mapping and sync state (example JSON file or small local DB table):
- `slug`
- `notionPageId`
- `lastSyncedAt`
- `lastSyncedLocalHash`
- `lastSyncedNotionVersion`
- `lastActionBy`

### New API Contract (Single Gateway)

All admin and future external integrations must use one sync gateway:
- `GET /api/admin/sync/status`
- `POST /api/admin/sync/compare`
- `POST /api/admin/sync/push`
- `POST /api/admin/sync/pull`
- `POST /api/admin/sync/link`

Each write request must include an expected version/hash to prevent stale overwrites.

### Safety

- Validate slug/path exactly like admin content APIs.
- Backup local file before pull overwrite.
- Return conflict errors with enough detail for UI.
- Log sync events for audit.

## Out of Scope (for this phase)

- Webhooks
- Real-time two-way sync
- Background daemons
- Auto-merge

## Definition of Done

1. Sync Center is visible and usable from `/admin`.
2. Push and pull both work manually.
3. Conflict detection prevents unsafe overwrite.
4. Compare flow exists before destructive writes.
5. Status badges update correctly after operations.
6. Existing admin editor save/load flow remains intact.

