# Figma Workflow: Website-to-Figma Design Pipeline

This document covers the full ecosystem for working between the personal site codebase and Figma — how pages get captured, how the two environments relate, and how to use Figma for design iteration.

---

## Table of Contents

1. [Overview](#overview)
2. [Where Things Live](#where-things-live)
3. [Capturing the Site to Figma](#capturing-the-site-to-figma)
4. [Working in Figma](#working-in-figma)
5. [Bringing Figma Changes Back to Code](#bringing-figma-changes-back-to-code)
6. [Code Connect: Linking Components](#code-connect-linking-components)
7. [Design System Rules](#design-system-rules)
8. [Rate Limits and Account Info](#rate-limits-and-account-info)
9. [Tips and Troubleshooting](#tips-and-troubleshooting)

---

## Overview

The Figma MCP (Model Context Protocol) server creates a two-way bridge between the codebase and Figma:

- **Code to Figma**: Capture live pages from the dev server into editable Figma frames using `generate_figma_design`
- **Figma to Code**: Read design context from Figma frames and translate them back into code using `get_design_context`

This lets you use Figma as a visual design tool for the site while Claude Code handles the translation in both directions.

### The Flow

```
Codebase (Next.js)
    |
    | npm run dev (localhost:3000)
    |
    v
Live Browser Pages
    |
    | Figma capture script injected into layout
    | Pages opened with #figmacapture=... hash
    |
    v
Figma File (editable design frames)
    |
    | Modify designs visually in Figma
    |
    v
get_design_context (reads Figma frame)
    |
    | Claude Code translates back to project conventions
    |
    v
Updated Codebase
```

---

## Where Things Live

### Source Code

```
/Users/blake/openclaw/workspace/personal-website/
├── src/                          # Next.js project root
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── layout.tsx       # Root layout (capture script goes here temporarily)
│   │   │   ├── page.tsx         # Home
│   │   │   ├── about/page.tsx
│   │   │   ├── work/page.tsx
│   │   │   ├── ideas/page.tsx
│   │   │   ├── learn/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── components/          # React components
│   │   └── app/globals.css      # Design tokens (CSS custom properties)
│   └── package.json
├── content/                     # Blog posts, learning modules
└── docs/                        # Documentation (this file)
```

### Figma File

The captured site lives at:

```
https://www.figma.com/design/CFL1VJ3I5b7TefRO6XIj1H
```

This file contains one frame per captured page:
- Home (`/`)
- About (`/about`)
- Work (`/work`)
- Ideas (`/ideas`)
- Learn (`/learn`)
- Contact (`/contact`)

### Is There Live Linking Between Them?

**No, there is no automatic live sync.** The Figma file and the codebase are independent snapshots. Changes in one do not automatically reflect in the other. The connection is manual and intentional:

- **Code changed?** Re-capture the affected page(s) to update the Figma file
- **Figma design changed?** Use `get_design_context` to read the design and translate it back to code

This is actually a feature, not a limitation — it means you can freely experiment in Figma without risk of breaking the live site, and you explicitly choose when to sync changes in either direction.

However, you *can* set up **Code Connect** to create persistent mappings between Figma components and codebase components (see [Code Connect](#code-connect-linking-components) below).

---

## Capturing the Site to Figma

### Prerequisites

- Dev server running (`npm run dev` from `/Users/blake/openclaw/workspace/personal-website/src/`)
- Figma MCP server connected in Claude Code
- Figma desktop app or browser access

### Step-by-Step Process

#### 1. Start the Dev Server

```bash
cd /Users/blake/openclaw/workspace/personal-website/src
npm run dev
```

If you get a lock file error:
```bash
rm -f .next/dev/lock
npm run dev
```

Verify it's running:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Should return 200
```

#### 2. Inject the Figma Capture Script

Add the Figma capture script to `src/app/layout.tsx` temporarily. This script is what enables the page-to-Figma serialization.

Add the import:
```tsx
import Script from "next/script";
```

Add the Script component inside `<body>`, before other content:
```tsx
<Script
  src="https://mcp.figma.com/mcp/html-to-design/capture.js"
  strategy="afterInteractive"
/>
```

**Important:** This is a temporary injection. Remove it after captures are complete.

#### 3. Generate Capture IDs

Ask Claude Code to call `generate_figma_design`. Each page needs its own single-use capture ID.

**For a new file:**
```
generate_figma_design(outputMode: "newFile", fileName: "My Site Design")
```

**For adding to an existing file:**
```
generate_figma_design(outputMode: "existingFile", fileKey: "CFL1VJ3I5b7TefRO6XIj1H")
```

Each call returns a capture ID like `5d248096-9829-49d2-aaf3-be7b42ebe70f`.

#### 4. Open Pages with Capture Hash

Each page must be opened with a special URL hash that tells the capture script where to send the data:

```bash
open "http://localhost:3000/about#figmacapture=<CAPTURE_ID>&figmaendpoint=https%3A%2F%2Fmcp.figma.com%2Fmcp%2Fcapture%2F<CAPTURE_ID>%2Fsubmit&figmadelay=3000"
```

The `figmadelay=3000` parameter gives the page 3 seconds to fully render before capture. This is important for pages with animations, lazy-loaded images, or client-side hydration.

#### 5. Poll for Completion

After opening a page, poll the capture status:
```
generate_figma_design(captureId: "<CAPTURE_ID>")
```

Status will be `pending` → `processing` → `completed`. Poll every 5 seconds until complete.

#### 6. Sequencing Matters

- **First capture (new file):** Must complete before any other captures begin, because it creates the Figma file
- **Subsequent captures:** Can technically run in parallel, but **browser tab throttling** means sequential captures are more reliable — the active/focused tab captures; background tabs often stall
- **Recommendation:** Open and capture one page at a time, waiting for each to complete

#### 7. Clean Up

After all captures are done, remove the Script import and component from `layout.tsx` to restore the codebase to its original state.

### Quick Reference: Capturing a Single Page

```
1. Ensure dev server is running on localhost:3000
2. Inject capture script in layout.tsx (if not already there)
3. Ask Claude: "Capture localhost:3000/about to the existing Figma file"
4. Claude generates capture ID, opens the page, polls until complete
5. Remove capture script from layout.tsx
```

---

## Working in Figma

### What You Get After Capture

Each captured page becomes a **frame** in the Figma file. The capture process converts the live DOM into Figma layers:

- HTML elements become Figma rectangles/frames
- Text becomes Figma text layers
- Images become image fills
- CSS styles (colors, borders, shadows, border-radius) are preserved as Figma properties
- Layout structure (flexbox, padding, gaps) is translated to Figma Auto Layout where possible

### What Captures Well

- Colors, gradients, and backgrounds
- Typography (size, weight, line-height, letter-spacing)
- Borders, shadows, and border-radius
- Padding, margins, and spacing
- Basic flexbox layouts
- Images and SVGs
- Visibility and opacity

### What May Need Manual Adjustment

- Complex CSS animations (Ken Burns effect, transitions) — captured as a single static frame
- Hover/active states — only the default state is captured
- Scroll-dependent layouts — captured at the scroll position when the capture ran
- Background images with CSS filters/overlays — may lose some compositing
- Very deeply nested flex layouts — sometimes simplify differently than the CSS

### How to Modify Things in Figma

#### Tweaking Colors

1. Select a layer (frame, text, shape)
2. In the right panel under **Fill**, click the color swatch
3. Change the hex value, or use the picker
4. To match the site's design tokens, reference `globals.css`:

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#F5F2ED` | `#1A1816` |
| `--bg-panel` | `#FFFFFF` | `#242220` |
| `--fg` | `#2C2825` | `#E8E4DE` |
| `--accent` | `#2B7A6F` | `#3D9B8F` |
| `--border` | `#DDD8D0` | `#3A3633` |

#### Changing Typography

1. Select a text layer
2. In the right panel, change font family, size, weight, line-height
3. The site uses:
   - **Inter** — body text
   - **Instrument Serif** — headings, display text
   - **JetBrains Mono** — code, monospace labels

#### Rearranging Layout

1. Select a frame with Auto Layout (indicated by the blue directional arrows icon)
2. Drag child elements to reorder
3. Adjust padding, gap, and alignment in the Auto Layout section of the right panel
4. Add/remove items by pasting or deleting layers

#### Trying New Design Ideas

This is where Figma really shines for iteration:

- **Duplicate a frame** (Cmd+D) to try a variation without losing the original
- **Create a component** from repeated patterns (like Nav or Footer) so changes propagate
- **Use Figma's prototyping** to link frames together and simulate page navigation
- **Add annotations** with Figma's comment tool or sticky notes to document design intent
- **Try different color palettes** by creating color styles and swapping them across frames

#### Using Figma Variables (Recommended)

For consistent design iteration, set up Figma Variables that mirror your CSS tokens:

1. Open the Figma file
2. Go to **Local Variables** (right panel or Assets panel)
3. Create variables for your core tokens (bg, fg, accent, border, etc.)
4. Apply these variables to your layers instead of raw hex values
5. Now you can switch between light/dark modes or try entirely new palettes by changing variable values

---

## Bringing Figma Changes Back to Code

### The Design-to-Code Workflow

After you've modified or created new designs in Figma, use the `get_design_context` tool to read them back:

1. **Get the Figma URL** of the frame or component you want to implement
   - Right-click a frame → **Copy link** (or copy it from the browser URL bar)
   - URL format: `https://figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>`

2. **Ask Claude Code to implement it:**
   ```
   "Implement this Figma frame in my site: <paste Figma URL>"
   ```

3. **Claude will:**
   - Call `get_design_context` with the fileKey and nodeId extracted from the URL
   - Receive reference code (React + Tailwind by default) plus a screenshot
   - Adapt the output to match the project's conventions (Next.js App Router, the existing component patterns, CSS custom properties from `globals.css`, etc.)

### What `get_design_context` Returns

- **Reference code:** React + Tailwind markup representing the design structure
- **Screenshot:** Visual reference of the selected frame
- **Code Connect snippets** (if set up): Actual component imports from your codebase
- **Asset download URLs:** For any images or SVGs in the design

### Tips for Better Translation

- **Select smaller sections**, not entire pages — a single component or section translates more accurately than a full-page frame
- **Use semantic layer names** in Figma (`NavBar`, `HeroSection`, `PostCard`) — Claude uses these to understand intent
- **Reference existing components:** Tell Claude "use the existing Panel component for this" or "this should follow the same pattern as IdeasView"
- **Specify your stack:** Claude knows this is Next.js + Tailwind + CSS custom properties, but being explicit helps: "Implement this using our existing design tokens from globals.css"

### The Full Round-Trip

```
1. Capture site to Figma          (code → Figma)
2. Redesign in Figma               (visual iteration)
3. Copy frame link
4. Ask Claude to implement it      (Figma → code)
5. Review and refine
6. Re-capture to update Figma      (keep in sync)
```

---

## Code Connect: Linking Components

Code Connect creates persistent mappings between Figma components and your actual codebase components. This is optional but significantly improves the Figma-to-code translation quality.

### What It Does

When Code Connect is set up, calling `get_design_context` on a Figma frame that uses connected components will return your actual component imports and usage patterns instead of generic React + Tailwind output.

For example, without Code Connect:
```tsx
<div className="bg-white rounded border p-8 shadow-sm">...</div>
```

With Code Connect mapping `Panel`:
```tsx
import { Panel } from "@/components/Panel";
<Panel>...</Panel>
```

### How to Set It Up

There are two approaches:

#### Code Connect UI (Simpler)

1. In Figma, go to a component in your file
2. In Dev Mode, use the Code Connect UI to map it to a component path in your codebase
3. Specify the component name and file path (e.g., `Panel` → `src/components/Panel.tsx`)
4. Optionally add instructions for AI code generation (e.g., "Always use the `elevated` variant for content panels")

#### Code Connect CLI (More Powerful)

1. Install: `npm install -g @figma/code-connect`
2. Create mapping files in your repo that define how Figma component properties map to code props
3. Publish the mappings

### Recommended Components to Connect

Start with the most-used components in the site:

| Figma Component | Code Component | Path |
|----------------|----------------|------|
| Panel | `<Panel>` | `src/components/Panel.tsx` |
| Nav | `<Nav>` | `src/components/Nav.tsx` |
| Footer | `<Footer>` | `src/components/Footer.tsx` |
| PageBackground | `<PageBackground>` | `src/components/PageBackground.tsx` |
| PostRow | `<PostRow>` | `src/components/ideas/PostRow.tsx` |

### Using the MCP Tools for Code Connect

Claude Code can also manage Code Connect mappings through the MCP:

- `get_code_connect_map` — see existing mappings
- `add_code_connect_map` — add a new mapping between a Figma node and a code component
- `get_code_connect_suggestions` — let Figma suggest mappings automatically

---

## Design System Rules

For the best Figma-to-code output, you can create a rules file that Claude Code follows when translating designs. The `create_design_system_rules` tool generates a starting point.

### Key Rules for This Project

These conventions should guide any Figma → code translation:

- Use CSS custom properties from `globals.css` (e.g., `var(--bg)`, `var(--accent)`) instead of hardcoded hex values
- Use the existing component library (`Panel`, `Nav`, `Footer`, `PageBackground`) instead of recreating markup
- Follow the existing font stack: Inter for body, Instrument Serif for headings, JetBrains Mono for code
- Place new components in `src/components/`
- Place new pages in `src/app/<route>/page.tsx`
- Use Tailwind utility classes alongside CSS custom properties
- Respect the warm, editorial design aesthetic — generous spacing, subtle shadows, 4px border-radius

---

## Rate Limits and Account Info

### Current Plan

- **Account:** blakethomson8@gmail.com
- **Team:** Blake Thomson's team
- **Plan:** Starter, Full seat
- **Read tool limits:** 6 calls/month (Starter plan)
- **Write tools (`generate_figma_design`):** Exempt from rate limits

### What This Means

- **Capturing pages to Figma** (`generate_figma_design`): Unlimited — no rate limit
- **Reading designs from Figma** (`get_design_context`, `get_screenshot`, etc.): Limited to 6/month on the Starter plan
- **Upgrading to Pro** would give 200 calls/day with a Full seat

### Working Within Limits

Since read calls are limited on Starter:
- Copy the Figma frame link and describe the changes to Claude rather than having it read the design repeatedly
- Use screenshots (manually taken) and paste them into the conversation as visual reference
- Batch your Figma-to-code work: plan what you want to implement, then use your read calls strategically
- Consider upgrading if you find yourself doing frequent Figma-to-code work

---

## Tips and Troubleshooting

### Capture Tips

- **Use `figmadelay=3000`** (or higher) for pages with animations or lazy-loaded images — gives the page time to fully render before capture
- **One tab at a time:** Browser throttling means background tabs often don't capture. Open and capture pages sequentially
- **Check the dev server** is actually responding before capturing: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
- **Lock file errors:** If `npm run dev` fails with a lock error, run `rm -f .next/dev/lock` first

### Figma Organization Tips

- **Name your frames** clearly (e.g., "Home - Desktop", "About - Desktop") so you can find them easily
- **Group by page** using Figma pages (the left sidebar tabs) — one Figma page per site route
- **Keep an "Original" page** with the unmodified captures, and duplicate frames to a "Working" page for experiments
- **Use Figma's version history** (right-click file name → Show version history) to track changes over time

### Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Capture stays "pending" forever | Browser tab was backgrounded | Re-open the URL in a focused tab |
| 500 error from dev server | Stale process or build error | Kill node processes, remove lock file, restart |
| Figma file access error | File needs to be claimed first | Open the claim URL in browser and click to accept |
| Missing fonts in Figma | Fonts not installed on your machine | Install Inter, Instrument Serif, JetBrains Mono, or use Figma's font substitution |
| Colors look different | Dark mode vs light mode | Capture was taken in whichever mode the browser was in; capture both if needed |

### Re-Capturing After Code Changes

When you've made code changes and want to update the Figma file:

1. Start the dev server
2. Ask Claude: "Inject the Figma capture script, then capture /about to the existing Figma file at CFL1VJ3I5b7TefRO6XIj1H"
3. The new capture creates a new frame — it does not overwrite the previous one
4. Compare old and new frames side by side in Figma
5. Delete the old frame when you're satisfied

### Capture Toolbar

After a page capture completes, the browser shows a **capture toolbar** at the top of the page. You can use this to:

- **"Entire screen"** — re-capture the full page
- **"Select element"** — capture a specific DOM element (useful for individual components)

This is handy for quick manual re-captures without going through Claude.
