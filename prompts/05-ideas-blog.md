# Prompt 05: Ideas (Blog) Section

## Context

Read `CLAUDE.md` → `docs/DESIGN-SYSTEM.md` → `docs/WEBSITE-SPEC.md` (Ideas section).

## Design Direction

The blog listing should feel like a **publication's homepage**, not a WordPress archive. Dense with information but easy to scan.

Study how The Verge, Monocle, or Stratechery handle content listings. Information density + clear hierarchy.

## Blog Listing Page (`/ideas`)

### Layout: The Magazine Grid

**Top section: Featured post** (if any post has `featured: true`)
- Takes 2/3 width on desktop
- Large title in display serif
- Full excerpt visible
- Category tag + read time + date

**Sidebar: 2-3 recent posts** stacked
- Compact: title + category + date only
- Thin borders between items

**Below: Full archive** as a tight list
- One line per post: title (left) ... category · read time · date (right)
- Hover: slight background change + arrow appears
- Filterable by category tags at the top

### Category Filter

Horizontal row of text buttons (not pills, not tabs):

```
All    technology    business    healthcare    building    personal
───────────────────────────────────────────────────────────────────
```

Active filter: bold + underlined in teal. Others: muted gray. Clicking filters the list below with a subtle crossfade.

### No Posts State

If a category has no posts yet, show a brief message in muted text: *"Nothing here yet. Check back soon."*

## Individual Post Page (`/ideas/[slug]`)

This is the **reading experience**. It needs to be excellent.

### Layout

- **Max-width 68ch** for body text (optimal reading length)
- Title in display serif, left-aligned, large
- Meta line below title: `category · read time · date`
- Body text at 18px, 1.6 line height
- Generous paragraph spacing

### MDX Component Styling

Ensure these render beautifully in posts:

- **Headings (h2, h3):** Clear hierarchy, extra top margin for breathing room
- **Code blocks:** Dark background, filename tab, copy button, syntax highlighting
- **Inline code:** Slight background tint, monospace
- **Block quotes:** Large serif italic, left-aligned (not centered, not in a box)
- **Callouts:** Left teal border, slight background tint
- **Images:** Full content width, optional caption below in small text
- **Lists:** Properly spaced, custom bullet style (teal dot or dash)
- **Links:** Teal, underlined on hover
- **Tables:** Clean, minimal borders, alternating row backgrounds

### Post Navigation

At the bottom of each post:
```
───────────────────────────────────────────────────────────────
← Previous Post Title                    Next Post Title →
```

## Implementation

- `src/app/ideas/page.tsx` — Blog listing
- `src/app/ideas/[slug]/page.tsx` — Individual post (MDX rendering)
- `src/components/blog/FeaturedPost.tsx` — Large featured card
- `src/components/blog/PostList.tsx` — Compact list view
- `src/components/blog/PostListItem.tsx` — Single list item
- `src/components/blog/CategoryFilter.tsx` — Filter bar
- `src/components/blog/PostLayout.tsx` — Reading layout wrapper
- `src/components/blog/PostNav.tsx` — Previous/next navigation
- `src/lib/posts.ts` — MDX file reading, frontmatter parsing, sorting

### MDX Pipeline

```typescript
// src/lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'content/posts');

export function getAllPosts() {
  // Read MDX files, parse frontmatter, sort by date desc
}

export function getPostBySlug(slug: string) {
  // Read specific MDX file, return content + frontmatter
}
```

### Mock Posts

Use the real drafts from `content/drafts/` as starting content. Create MDX versions in `content/posts/`:
- `death-of-multi-tenant.mdx`
- `azure-for-vibe-coders.mdx`

## WebMCP Tools

```typescript
useWebMCPTool({
  name: "search_posts",
  description: "Search blog posts by topic, keyword, or category",
  inputSchema: { type: "object", properties: { query: { type: "string" }, category: { type: "string" } } },
  execute: ({ query, category }) => ({ /* filtered posts */ })
});

useWebMCPTool({
  name: "get_latest_posts",
  description: "Get the most recent blog posts with summaries",
  inputSchema: { type: "object", properties: { count: { type: "number" } } },
  execute: ({ count = 5 }) => ({ /* recent posts */ })
});
```
