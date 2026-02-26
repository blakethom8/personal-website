# Prompt 01: Project Scaffold

## Context

Read `CLAUDE.md` first. Then `docs/DESIGN-SYSTEM.md`. Then `docs/ARCHITECTURE.md`.

You're building Blake Thomson's personal website. **The design must not look AI-generated.** Study the design system carefully — it explicitly lists anti-patterns to avoid.

## Task

Scaffold the Next.js 15 project in `src/` with the following:

### 1. Initialize Project

```bash
cd src/
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint
```

Then install only what's needed:
```bash
npm install @next/mdx @mdx-js/react framer-motion lucide-react
npm install -D @tailwindcss/typography
```

### 2. Configure Tailwind

Set up the design tokens from `docs/DESIGN-SYSTEM.md`:

- Custom colors (warm palette, not default Tailwind gray)
- Typography: Instrument Serif (headings), Inter (body), JetBrains Mono (code)
- Font imports via `next/font/google`
- Custom spacing tokens (`section-gap`, `block-gap`, etc.)
- Dark mode via `class` strategy
- Extend with animation easings from the design system

### 3. Create the Layout Shell

`src/app/layout.tsx`:
- HTML with dark mode class toggle
- Font loading (Instrument Serif, Inter, JetBrains Mono)
- Global nav component
- Footer component
- Dark mode provider (localStorage + system preference)

**Navigation design (from DESIGN-SYSTEM.md):**
```
Blake Thomson                     About  Work  Ideas  Learn  Contact  [◐]
───────────────────────────────────────────────────────────────────────────
```
- Name is serif font, links are sans-serif
- Thin rule (1px border) below nav
- Current page: subtle underline or font weight change
- Mobile: full-screen overlay, not a cramped dropdown
- Dark mode toggle: sun/moon icon, smooth transition

**Footer:**
```
───────────────────────────────────────────────────────────────────────────
Blake Thomson · Santa Monica, CA                    GitHub  LinkedIn  Email
                                                    © 2026
```
Simple. Thin rule above. No multi-column mega-footer.

### 4. Set Up Page Routes (Empty)

Create placeholder pages that just render the page title in display-size serif:

- `src/app/page.tsx` → Home
- `src/app/about/page.tsx` → About
- `src/app/work/page.tsx` → Work
- `src/app/ideas/page.tsx` → Ideas
- `src/app/ideas/[slug]/page.tsx` → Post (dynamic)
- `src/app/learn/page.tsx` → Learn
- `src/app/learn/[slug]/page.tsx` → Module (dynamic)
- `src/app/contact/page.tsx` → Contact

### 5. Global Styles

`src/app/globals.css`:
- CSS custom properties for the full color palette (light + dark)
- Selection color (teal highlight)
- Smooth dark mode transition (200ms on bg/color)
- Scrollbar styling (thin, warm colors)
- Focus styles (teal outline, not browser default)
- `prefers-reduced-motion` respect

### 6. Component Stubs

Create these component files with basic implementations:

```
src/components/
├── layout/
│   ├── Nav.tsx           (full nav with mobile menu)
│   ├── Footer.tsx        (simple footer)
│   └── ThemeProvider.tsx  (dark mode context)
├── ui/
│   ├── Container.tsx     (max-width wrapper with proper padding)
│   └── Section.tsx       (page section with consistent spacing)
└── mdx/
    ├── Callout.tsx       (left-border callout box)
    └── CodeBlock.tsx     (dark code block with copy + filename)
```

### 7. MDX Configuration

Set up MDX support:
- `next.config.mjs` with MDX plugin
- `mdx-components.tsx` mapping HTML elements to styled components
- Custom components available in MDX (`Callout`, `CodeBlock`, `Interactive`)

### 8. Verify

After scaffolding:
- `npm run dev` should work
- Navigate between all pages
- Dark mode toggle works
- Nav highlights current page
- Mobile menu opens/closes
- Fonts load correctly (serif headings, sans body, mono code)

## Quality Check

Before finishing, verify against `CLAUDE.md` quality bar:
- Does the nav look architectural, not generic?
- Is the dark mode warm (not just inverted)?
- Does the mobile nav feel intentional?
- Would you mistake this for a template? If yes, iterate.

## Do NOT

- Don't add placeholder "Lorem ipsum" content
- Don't create a hero section yet (that's Prompt 02)
- Don't install unnecessary packages
- Don't use default Tailwind gray (use the warm palette from the design system)
- Don't make the mobile menu a hamburger that drops down 5 tiny links
