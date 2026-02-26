# Prompt 06: Learn Section (Interactive Education Hub)

## Context

Read `CLAUDE.md` → `docs/DESIGN-SYSTEM.md` → `docs/WEBSITE-SPEC.md` (Learn section).

## Design Direction

This is the most unique part of the site. Most personal websites don't have an interactive education section. This is Blake's differentiator — teaching AI concepts to non-technical people through interactive experiences.

Design it like a **mini-app within the site**. It should feel like opening a well-designed educational tool (think: Brilliant.org's polish meets the simplicity of a personal project).

## Module Hub (`/learn`)

### Layout

- Page title in display serif: "Learn"
- Subtitle: *"Interactive guides to AI and LLMs. No jargon required. 5-10 minutes each."*
- Module cards in a **2-column grid** (desktop), single column (mobile)

### Module Card Design

Each card should feel like a chapter cover:

```
┌────────────────────────────────┐
│                                │
│  ▸ What Is an LLM?            │  ← Title in h3 sans-serif
│                                │
│  How language models predict   │  ← Brief description
│  the next word — and why       │
│  that's more powerful than     │
│  it sounds.                    │
│                                │
│  ○○○○○○○  Not started          │  ← Progress (localStorage)
│  ~7 min                        │  ← Estimated time
│                                │
└────────────────────────────────┘
```

- Hover: border color shifts to teal, subtle lift
- Progress tracked in localStorage (circles fill in)
- Cards are NOT identical heights — let content dictate size

## Individual Module (`/learn/[slug]`)

### Structure: Step-by-Step

Each module is a series of **steps**. Only one step visible at a time. Progress bar at top.

```
What Is an LLM?
■■■□□□□  Step 3 of 7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Explanation text — 2-3 short paragraphs]

┌─────────────────────────────────────┐
│  [Interactive element]               │
│                                      │
│  Type a sentence and watch the       │
│  model predict the next word:        │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ The weather today is        │    │
│  └─────────────────────────────┘    │
│                                      │
│  Predictions:                        │
│  ███████████ sunny  (34%)            │
│  ██████      cold   (18%)            │
│  █████       nice   (15%)            │
│  ████        warm   (12%)            │
│                                      │
└─────────────────────────────────────┘

                           [Next Step →]
```

### Interactive Components to Build

For the first module ("What Is an LLM?"), create:

1. **TokenPredictor** — User types text, shows probability bars for next token predictions (mock data — we're not calling an actual API for this)
2. **Tokenizer** — Paste text, see it split into colored token chunks with count
3. **TemperatureSlider** — Slide between 0 and 2, see how output diversity changes (pre-generated examples)
4. **ContextWindow** — Visual showing a "window" sliding over text, demonstrating finite context

### Design Rules for Interactive Elements

- **Clear boundaries** — Interactive elements live in bordered containers
- **Obvious affordances** — Inputs look like inputs, buttons look clickable
- **Immediate feedback** — Results appear inline, no loading spinners for client-side demos
- **Accessible** — Keyboard navigable, screen reader friendly, color not the only signal
- **Celebratory** — When completing a step, a subtle check animation. When finishing a module, something more (confetti is cliché — maybe a satisfying "complete" state with the progress bar filling)

## Implementation

- `src/app/learn/page.tsx` — Module hub
- `src/app/learn/[slug]/page.tsx` — Module viewer
- `src/components/learn/ModuleCard.tsx` — Hub card
- `src/components/learn/ModuleViewer.tsx` — Step-by-step container
- `src/components/learn/ProgressBar.tsx` — Module progress
- `src/components/learn/StepNav.tsx` — Previous/Next step
- `src/components/learn/interactive/TokenPredictor.tsx`
- `src/components/learn/interactive/Tokenizer.tsx`
- `src/components/learn/interactive/TemperatureSlider.tsx`
- `src/components/learn/interactive/ContextWindow.tsx`
- `src/hooks/useModuleProgress.ts` — localStorage-backed progress tracking
- `content/modules/what-is-an-llm.json` — Step content + config for first module

### Module Content Format

```json
{
  "slug": "what-is-an-llm",
  "title": "What Is an LLM?",
  "description": "How language models predict the next word — and why that's more powerful than it sounds.",
  "estimatedMinutes": 7,
  "steps": [
    {
      "title": "The World's Best Autocomplete",
      "content": "You use autocomplete every day...",
      "interactive": null
    },
    {
      "title": "Predicting the Next Token",
      "content": "At its core, an LLM does one thing...",
      "interactive": { "component": "TokenPredictor", "props": {} }
    }
  ]
}
```

## WebMCP Tools

```typescript
useWebMCPTool({
  name: "list_modules",
  description: "List available learning modules about AI and LLMs",
  execute: () => ({ /* modules with progress */ })
});

useWebMCPTool({
  name: "suggest_module",
  description: "Suggest a learning module based on what the user wants to understand",
  inputSchema: { type: "object", properties: { interest: { type: "string" } } },
  execute: ({ interest }) => ({ /* matched module */ })
});
```
