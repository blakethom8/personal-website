# Design System — Blake Thomson Personal Website

*This is the design bible. Every visual decision starts here.*
*Last updated: 2026-02-25*

---

## Design Philosophy

**The feeling:** Opening this site should feel like taking a deep breath. Calm, grounded, warm. Like sitting at a window overlooking the ocean with a good book and a cup of coffee.

**The metaphor:** Content floats on nature. The site has full-bleed nature photography as backgrounds — ocean scenes, mountains, coastal fog, bodies of water — at low contrast or with a soft color wash. Content lives in elevated panels that sit on top, clean and readable. The panels are the foreground; nature is the quiet backdrop.

**The reference:** Think of a high-end resort's website crossed with a Monocle editorial. Not a SaaS app. Not a developer portfolio. Something that makes you slow down and read.

Blake is a storyteller who bridges complex data and human decisions. The design reflects both sides: **the warmth of nature and human connection** + **the clarity and precision of well-organized information.**

### The Two Layers

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   [Nature background — ocean, mountains, fog]   │
│   Low contrast / soft hue / subtle              │
│                                                 │
│   ┌───────────────────────────────────────┐     │
│   │                                       │     │
│   │   Content Panel                       │     │
│   │   Clean, readable, elevated           │     │
│   │   White/warm-white with subtle         │     │
│   │   shadow or soft border               │     │
│   │                                       │     │
│   └───────────────────────────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

This creates natural depth without artificial shadows or gradients. The photography does the emotional work; the content panels do the functional work.

---

## Anti-Patterns (What We're Avoiding)

- ❌ Centered hero with gradient text and a "Get Started" button
- ❌ Three evenly-spaced feature cards with icons
- ❌ Full-width colored sections alternating white/gray/color
- ❌ Generic illustrations or abstract SVG blobs
- ❌ Uniform card grids where every card is identical
- ❌ Gratuitous parallax or scroll-jacking
- ❌ Corporate blue anything
- ❌ Stock photos of people in offices
- ❌ AI-generated nature images (use REAL photography)
- ❌ The "admin dashboard" feel — no heavy sidebars, no data-dense tables on the homepage
- ❌ Dark moody tech aesthetic (we're going warm and calming, not Linear/Vercel dark)

### What We DO Want

- ✅ **Nature photography as backgrounds** — ocean, mountains, coastal fog, water, landscapes
- ✅ **Elevated content panels** — clean boxes that float above the background
- ✅ **Readable density** — lots of content per page, well-organized, Arco-inspired spacing
- ✅ **Simple navigation** — sidebar or top nav with clean borders, nothing heavy
- ✅ **Earthy color palette** — greens, warm grays, sand tones, ocean blues
- ✅ **Calming rhythm** — generous spacing between sections, nothing rushed
- ✅ **Typography-forward** — type does the heavy lifting inside content panels
- ✅ **Subtle borders** — thin, warm-toned borders to define space (inspired by Arco)

---

## Color Palette

### Philosophy

The colors come from nature. Ocean blues, sage greens, warm sand, stone grays. The accent is a natural teal — the color where ocean meets shore.

### Palette

```css
/* Light Mode (Primary — this IS the default) */
--bg:              #F5F2ED;     /* Warm sand/paper — the background behind everything */
--bg-panel:        #FFFFFF;     /* Pure white panels that float on top */
--bg-panel-hover:  #FAFAF8;    /* Subtle hover state on cards */
--fg:              #2C2825;     /* Warm dark brown — primary text */
--fg-muted:        #7A756E;    /* Warm gray — secondary text, metadata */
--fg-light:        #A39E96;    /* Lighter gray — captions, dates */
--border:          #E5E0D8;    /* Warm border — sand-toned */
--border-light:    #EEEAE4;    /* Lighter border for subtle divisions */
--accent:          #2B7A6F;    /* Deep ocean teal — links, highlights */
--accent-hover:    #1F5E56;    /* Darker teal on hover */
--accent-light:    #E6F3F0;    /* Very light teal for tag backgrounds */
--accent-muted:    #8BBAB3;    /* Muted teal for decorative elements */
--overlay:         rgba(245, 242, 237, 0.85); /* Panel overlay on background images */

/* Dark Mode */
--bg:              #1A1816;     /* Dark warm brown (not black) */
--bg-panel:        #242120;     /* Dark panel — slightly lighter */
--bg-panel-hover:  #2E2A28;    /* Hover state */
--fg:              #EDE9E3;     /* Warm off-white text */
--fg-muted:        #9E9890;    /* Warm muted text */
--fg-light:        #6E6860;    /* Light gray */
--border:          #3A3533;     /* Dark warm border */
--border-light:    #2E2A28;    /* Subtle dark border */
--accent:          #4ECDC4;    /* Brighter teal for dark mode */
--accent-hover:    #6FD8D1;    /* Lighter teal on hover */
--accent-light:    #1A3330;    /* Dark teal for tag backgrounds */
--accent-muted:    #3A8A83;    /* Muted teal */
--overlay:         rgba(26, 24, 22, 0.88); /* Dark panel overlay */
```

### Color Rules

1. **Links are teal.** Underlined on hover, not by default.
2. **Tags/badges** use `accent-light` background with `accent` text.
3. **Panels are white** (light mode) or dark-panel (dark mode) — always elevated from the background.
4. **Background images** get a warm overlay (`overlay` color) to ensure text readability.
5. **Borders are warm** — never pure gray. Always sand/stone toned.
6. **Selection color** uses accent-light.
7. **No section background colors** — use panels and borders to create structure, not colored bands.

---

## Background Photography

### Requirements

- **Real photography only.** No AI-generated images. No stock illustrations.
- **Nature scenes:** Ocean, mountains, coastal fog, rivers, forests, hillsides, golden light
- **Low contrast in use:** When used as a page background, images are:
  - Slightly desaturated (80-90% saturation)
  - Brightness reduced or increased to not compete with content
  - Covered with a semi-transparent warm overlay (`--overlay`)
- **High quality:** Minimum 2400px wide for full-bleed use
- **Blake's world:** Santa Monica ocean, Napa hills, Orinda landscape, California light

### Usage Patterns

**Hero backgrounds:** Full-bleed image with overlay. Content panel floats on top.
```css
.hero-bg {
  background-image: url('/images/bg-ocean.jpg');
  background-size: cover;
  background-position: center;
}
.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--overlay);
}
```

**Section breaks:** A thin strip of nature between content sections (100-200px tall, blurred, as a breather).

**Page-specific backgrounds:** Each main page can have its own nature image:
- Home → Ocean/coast (Santa Monica vibe)
- About → Golden hills or vineyard (personal warmth)
- Work → Mountain or architectural landscape (ambition, building)
- Ideas → Fog or clouds (thinking, contemplation)
- Learn → Flowing water (clarity, understanding)
- Contact → Sunset or calm water (approachability)

### Placeholder Strategy

Until Blake provides his own photography:
- Use [Unsplash](https://unsplash.com) images with proper attribution
- Search terms: "california coast", "ocean calm", "mountain fog", "golden hills", "pacific coast"
- Replace with Blake's own photos as they become available
- Store in `assets/images/backgrounds/`

---

## Typography

### Type Scale

Typography is the hero inside content panels. The backgrounds set the mood; the type delivers the message.

```
Font Stack:
  Heading:  "Instrument Serif", Georgia, serif
  Body:     "Inter", system-ui, sans-serif
  Mono:     "JetBrains Mono", "Fira Code", monospace
```

**Why serif for headings?** Serif type feels editorial and warm — it connects to the earthy, literary quality of the site. It's also unexpected for a tech person, which makes it memorable.

### Scale (Desktop)

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `display` | 64-80px | 400 | Page hero text (one per page max) |
| `h1` | 40-48px | 400 | Section headers |
| `h2` | 28-32px | 400 | Subsection headers |
| `h3` | 22px | 600 (sans) | Card titles, list headers |
| `body` | 17px | 400 | Body text, long-form reading |
| `body-sm` | 15px | 400 | Secondary text, metadata |
| `caption` | 13px | 500 | Labels, dates, tags |
| `mono` | 15px | 400 | Code, technical details |

### Scale (Mobile)

Scale down ~20%, but keep `display` impactful (minimum 40px). Headlines should still command the panel.

### Typographic Details

- **Line height:** 1.65 for body (slightly generous for calm reading), 1.1 for display/h1
- **Letter spacing:** -0.02em on display, -0.01em on h1, normal elsewhere
- **Paragraph max-width:** 68ch for body text (optimal reading length)
- **Color:** Primary text is warm dark brown (`--fg`), not pure black

---

## Layout System

### The Panel Architecture

Everything lives in panels. Panels are the primary structural element.

```
┌─ Page ──────────────────────────────────────────┐
│  [Background: nature image + overlay]            │
│                                                  │
│  ┌─ Content Panel ────────────────────────────┐  │
│  │  Nav                                       │  │
│  ├────────────────────────────────────────────┤  │
│  │                                            │  │
│  │  Page content                              │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [Background peeks through between panels]       │
│                                                  │
│  ┌─ Another Panel ────────────────────────────┐  │
│  │  More content                              │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Panel Styles

```css
.panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-light);
  border-radius: 12px;          /* Slightly rounded, not pill-shaped */
  padding: 48px;                /* Generous internal spacing */
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 
              0 8px 24px rgba(0,0,0,0.06);  /* Subtle elevation */
}

/* Tighter panels for cards */
.panel-card {
  padding: 24px;
  border-radius: 8px;
}
```

### Grid

Content within panels uses a clean column system:

```
Desktop (max 1200px content area within panel):
├── Main content: ~65-70% width
├── Sidebar: ~30-35% width (when present)
└── Full-width sections available

Tablet: Single column with optional sidebar collapse
Mobile: Single column, full panel width
```

### Page Width

- **Background images:** Full viewport width (edge to edge)
- **Content panels:** Max-width 1200px, centered with auto margins
- **Within panels:** Content follows the grid above
- **Reading content (blog):** Max-width 68ch for body text

---

## Components

### Navigation

The nav lives inside the top content panel. Clean, simple, inspired by Arco's readable density.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Blake Thomson                About  Work  Ideas  Learn  │
│                                                Contact  │
│                                                    [◐]  │
└──────────────────────────────────────────────────────────┘
```

Wait — actually, let's keep it simpler. A single-line nav:

```
┌──────────────────────────────────────────────────────────┐
│  Blake Thomson          About  Work  Ideas  Learn  Contact  ◐  │
└──────────────────────────────────────────────────────────┘
```

- Name on left in serif font (links to home)
- Page links on right in sans-serif, `body-sm` size
- Thin bottom border (`--border-light`)
- Current page: teal text color or subtle underline
- Mobile: full-screen overlay menu with large tap targets over a blurred background image
- The nav panel can be slightly transparent on the home hero (glass effect) or solid white on interior pages

### Content Cards

Cards for blog posts, projects, etc. They live inside panels or ARE panels.

**Blog Post Card:**
```
┌────────────────────────────────────────┐
│                                        │
│  TECHNOLOGY · 8 MIN                    │  ← caption, muted
│                                        │
│  The Death of Multi-Tenant SaaS        │  ← h3, serif
│                                        │
│  What if the entire multi-tenant       │  ← body-sm, muted
│  model was just a cost optimization    │
│  we no longer need?                    │
│                                        │
│  February 25, 2026                     │  ← caption, light
│                                        │
└────────────────────────────────────────┘
```

- Warm border, subtle hover (border color shifts to `accent-muted`)
- No images in cards by default (typography-driven)
- Featured cards CAN have a background image with overlay

**Compact List Item (for blog archive):**
```
The Death of Multi-Tenant SaaS        technology · 8 min     Feb 25  →
────────────────────────────────────────────────────────────────────────
```

### Sidebar Navigation (for Blog/Learn)

Inspired by Arco's documentation sidebar — clean, readable, bordered:

```
┌─────────────────────┐
│  Categories          │
│  ─────               │
│  All                 │  ← active: teal text
│  Technology          │
│  Business            │
│  Healthcare          │
│  Building            │
│  Personal            │
│                      │
│  Archive             │
│  ─────               │
│  2026                │
│    February (4)      │
│    January (2)       │
└─────────────────────┘
```

### Callout Boxes (MDX)

```
┌─ Note ──────────────────────────────────┐
│  This is important context. The callout  │
│  has a thin teal left border and a very  │
│  light teal background.                  │
└──────────────────────────────────────────┘
```

- Left border: 3px solid `--accent`
- Background: `--accent-light`
- Border-radius: 8px

### Code Blocks

```
┌─ api/match.py ───────────────────────────┐
│                                          │
│  def match_provider(name, zip_code):     │
│      candidates = search_npi(name, zip)  │
│      return rank_matches(candidates)     │
│                                          │
│                                [Copy] ─┤ │
└──────────────────────────────────────────┘
```

- Dark warm background (`#1E1B19`) — not pure black
- Warm-toned syntax highlighting
- Filename tab with `mono` font
- Copy button appears on hover
- Rounded corners (8px)

### Footer

Simple, inside a panel at the bottom:

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Blake Thomson                                           │
│  Santa Monica, California                                │
│                                                          │
│  GitHub · LinkedIn · Email                   © 2026      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Between the last content panel and the footer panel, the background image peeks through — a nice visual breather.

---

## Animation & Motion

### Principles

Keep motion calming. Nothing should jolt or grab attention.

1. **Entrance animations** — Elements fade in gently (opacity 0→1 + translateY 12px→0). Slow and peaceful.
2. **Duration** — 500-700ms for entrances (slower than typical — deliberate calm). 200ms for interactions.
3. **Easing** — `cubic-bezier(0.25, 0.1, 0.25, 1)` — gentle and natural
4. **Stagger** — When multiple cards appear, stagger by 80-100ms
5. **Reduced motion** — Respect `prefers-reduced-motion`. Skip all animations.

### Specific Animations

- **Panel entrance:** Fade in + slight rise from below. Calm and natural.
- **Background images:** Very subtle Ken Burns effect (slow zoom over 30+ seconds) — barely perceptible, adds life without distraction.
- **Dark mode toggle:** Smooth 300ms crossfade on all colors.
- **Card hover:** Border color shifts to `accent-muted`, very slight elevation change.
- **Link hover:** Underline fades in.
- **Page transitions:** Gentle crossfade (300ms).

### What NOT to Animate

- Background image position (no parallax — it's nauseating)
- Text content appearing word-by-word
- Anything that makes the user wait to read

---

## Spacing System

Generous spacing reinforces the calm feeling. Nothing should feel cramped.

| Token | Value (Desktop) | Value (Mobile) | Use |
|-------|----------------|----------------|-----|
| `page-pad` | 48px | 20px | Padding around the viewport edge |
| `panel-pad` | 48px | 24px | Internal panel padding |
| `section-gap` | 32px | 20px | Gap between panels / major sections |
| `block-gap` | 40px | 28px | Between content blocks within a panel |
| `element-gap` | 20px | 16px | Between cards, list items |
| `text-gap` | 16px | 14px | Between paragraphs |
| `tight` | 8px | 8px | Icon + text, label + value |

**Content panel max-width:** 1200px
**Background image:** Full viewport width, always

---

## Dark Mode

### The Mood Shift

Light mode: Warm, sandy, like reading outdoors on a bright day.
Dark mode: Like sitting by a window at night, warm interior glow.

- **Panels darken** but stay warm (dark brown, not gray or black)
- **Background images** get a darker overlay but are still faintly visible
- **Borders become more important** — they define panel edges in dark mode
- **Accent teal brightens** to stay visible against dark backgrounds
- **Text warms up** — off-white, not pure white

### Implementation

- CSS custom properties for all colors
- `class="dark"` strategy with localStorage + system preference
- Background image overlays adjust opacity for dark mode (0.88 instead of 0.85)
- Smooth 300ms transition on color properties

---

## Background Image System

### Per-Page Backgrounds

Each page has a default background image. The system supports:

```typescript
// src/lib/backgrounds.ts
export const backgrounds = {
  home: '/images/bg/ocean-coast.jpg',        // Santa Monica vibes
  about: '/images/bg/golden-hills.jpg',       // Warm, personal
  work: '/images/bg/mountain-vista.jpg',      // Ambition, scope
  ideas: '/images/bg/coastal-fog.jpg',        // Contemplation
  learn: '/images/bg/flowing-water.jpg',      // Clarity
  contact: '/images/bg/calm-sunset.jpg',      // Approachable
} as const;
```

### Background Component

```typescript
// src/components/layout/PageBackground.tsx
// - Full viewport coverage
// - Image with object-fit: cover
// - Overlay div with var(--overlay)
// - Optional: very slow Ken Burns (transform: scale, 30s duration)
// - Handles loading state (solid --bg color until image loads)
// - Respects prefers-reduced-motion (no Ken Burns)
```

### Performance

- Use Next.js `<Image>` with priority loading for above-fold backgrounds
- Serve WebP format with JPEG fallback
- Multiple sizes: 1200w, 1800w, 2400w
- Blur-up placeholder (tiny base64 version)
- Background images are decorative — content is always readable without them

---

## Responsive Behavior

### Breakpoints

```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
```

### Mobile Design

- Background images still visible but more of the image may be cropped
- Panels go nearly full-width (with small `page-pad`)
- Navigation becomes a full-screen overlay (background image visible behind, heavily blurred)
- Cards stack single-column
- Reading text stays at 17px (don't shrink body copy on mobile)
- Touch targets: minimum 44x44px

### Tablet

- Panels get slightly less padding
- Two-column layouts can survive at tablet width
- Sidebar collapses to top of panel (horizontal filter bar)

---

## Learn Module Design

The Learn section uses the same panel-on-nature system but with more interactivity.

- Module viewer is a full-width panel with step navigation
- Interactive elements have clear warm borders and gentle shadows
- Progress bar uses `--accent` fill on `--border-light` track
- Inputs have warm borders that glow teal on focus
- Results animate in gently (fade + slight rise)

---

## Image Sourcing Checklist

For the initial build, source these from Unsplash (replace later with Blake's photos):

- [ ] Ocean/coast scene (Home background)
- [ ] Golden hills or vineyard (About background)
- [ ] Mountain landscape (Work background)
- [ ] Coastal fog or clouds (Ideas background)
- [ ] Flowing water or stream (Learn background)
- [ ] Calm sunset over water (Contact background)

**Search terms:** california coast, pacific ocean calm, napa valley hills, morning fog coast, mountain stream, golden hour ocean

**Quality:** High-res (2400px+ wide), landscape orientation, calming mood, no people in frame.

---

## Summary: The Vibe

If someone visits this site, they should feel:

> "This is calming. Beautiful. I want to stay here and read. The person behind this has taste — they care about the experience, not just the content. I trust them."

The nature photography grounds everything in the real world. The clean content panels say "I'm organized and serious." The warm typography says "I'm human and approachable." Together, it's a site that stands out by being **quiet** in a world of noisy, flashy tech portfolios.
