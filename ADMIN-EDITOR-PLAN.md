# Admin Editor with WebMCP Integration - Plan

**Created:** 2026-02-26  
**Goal:** Build an in-browser content editor that integrates with WebMCP, allowing AI agents to assist with editing while Blake works

---

## The Vision

Blake opens his website, navigates to `/admin/edit/post-healthcare-data`, and sees a split-pane editor:
- **Left:** Markdown editor with syntax highlighting
- **Right:** Live preview with rendered markdown + interactive charts
- **Bottom toolbar:** Insert chart, save, preview, commit

Meanwhile, Blake opens Gemini (or Claude, or any WebMCP-capable agent) in another window/tab. The agent can **see** what tools are available on Blake's editing page through WebMCP and can **call** them:
- `edit_section` - rewrite a paragraph
- `insert_chart` - add a conversation simulator or architecture diagram
- `save_draft` - persist changes to filesystem
- `generate_summary` - create a post summary

The agent doesn't need special integration - it just reads the WebMCP annotations and uses the tools like any other web API.

---

## Why This Matters

### The Problem with Current Editing:
- **VS Code editing:** Great for code, not great for preview
- **GitHub web editor:** No preview, no LLM integration
- **Notion/Docs:** Not markdown, not git-integrated, proprietary
- **Claude/Gemini chat:** Copy-paste hell between chat and editor

### What We're Building:
- **Browser-based:** Works anywhere, beautiful preview
- **Agent-native:** Any WebMCP agent can assist
- **File-backed:** Direct git integration, version control
- **Chart-aware:** Insert interactive React components inline
- **Offline-capable:** Works on flights with local LLM fallback

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BLAKE'S BROWSER                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /admin/edit/post-healthcare-data                      │ │
│  │                                                         │ │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐ │ │
│  │  │  Markdown Editor │  │  Live Preview                │ │ │
│  │  │                 │  │                              │ │ │
│  │  │  # Healthcare   │  │  <h1>Healthcare Data</h1>    │ │ │
│  │  │  Data           │  │  <p>Analysis of...</p>       │ │ │
│  │  │                 │  │                              │ │ │
│  │  │  Analysis of... │  │  [Interactive Chart]         │ │ │
│  │  │                 │  │                              │ │ │
│  │  └─────────────────┘  └──────────────────────────────┘ │ │
│  │                                                         │ │
│  │  [Insert Chart ▼] [Save] [Preview] [Commit]            │ │
│  │                                                         │ │
│  │  ┌───────────────────────────────────────────────────┐ │ │
│  │  │  WebMCP Tool Registry (in page <head>)            │ │ │
│  │  │  window.WebMCP.tools = [                          │ │ │
│  │  │    { name: "edit_section", ... },                 │ │ │
│  │  │    { name: "insert_chart", ... },                 │ │ │
│  │  │    { name: "save_draft", ... }                    │ │ │
│  │  │  ]                                                 │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        ▲                                    │
        │  reads tools                       │  calls tools
        │                                    ▼
┌─────────────────────────────────────────────────────────────┐
│              GEMINI / CLAUDE (separate tab/window)          │
│                                                              │
│  Agent discovers:                                            │
│  "This page has 3 tools: edit_section, insert_chart, save"  │
│                                                              │
│  Blake: "Rewrite the intro to be more engaging"             │
│  Agent: *calls edit_section({ section: 0, text: "..." })*   │
│  → Content updates in Blake's editor                         │
│                                                              │
│  Blake: "Add a chart showing the data pipeline"             │
│  Agent: *calls insert_chart({ type: "architecture" })*      │
│  → Chart component inserted into preview                     │
└─────────────────────────────────────────────────────────────┘
```

---

## WebMCP Integration Strategy

### What is WebMCP?
- Protocol for making websites "talk" to AI agents
- Similar to OpenAPI/Swagger, but for UI interactions
- Agent reads tool definitions, calls them like API endpoints

### How We'll Use It:

**1. Tool Definitions in Page**
```html
<script type="application/webmcp+json">
{
  "tools": [
    {
      "name": "edit_section",
      "description": "Replace content in a specific section",
      "parameters": {
        "section": { "type": "number", "description": "Section index (0-based)" },
        "text": { "type": "string", "description": "New markdown content" }
      }
    },
    {
      "name": "insert_chart",
      "description": "Insert an interactive chart component",
      "parameters": {
        "type": { "enum": ["conversation", "architecture", "data-flow"] },
        "config": { "type": "object", "description": "Chart configuration" }
      }
    },
    {
      "name": "save_draft",
      "description": "Save current content to filesystem",
      "parameters": {}
    }
  ]
}
</script>
```

**2. JavaScript API**
```javascript
window.WebMCP = {
  tools: [...],
  
  execute(toolName, params) {
    switch(toolName) {
      case 'edit_section':
        return editSection(params.section, params.text);
      case 'insert_chart':
        return insertChart(params.type, params.config);
      case 'save_draft':
        return saveDraft();
    }
  }
};
```

**3. Agent Discovery**
Agent opens Blake's page, runs:
```javascript
const tools = await fetch('/api/webmcp/tools');
// Returns list of available tools
```

Or reads directly from page:
```javascript
const tools = JSON.parse(
  document.querySelector('script[type="application/webmcp+json"]').textContent
);
```

---

## Key Features

### 1. **Markdown Editor**
- Monaco editor (VS Code's editor component)
- Syntax highlighting
- Vim keybindings optional
- Auto-save every 30 seconds

### 2. **Live Preview**
- Render markdown → HTML with remark
- Support MDX for React components
- Show interactive charts inline
- Mobile responsive preview

### 3. **Chart Insertion**
- Dropdown: conversation simulator, architecture diagram, data table
- Chart picker with previews
- Config panel (e.g., conversation scenario selection)
- Insert as MDX component: `<ConversationSimulator scenario="..." />`

### 4. **File Operations**
- Save → write to `content/posts/[slug].md`
- Auto-save drafts to `content/drafts/`
- Commit → `git commit -am "edit: [message]"`
- Show git diff before commit

### 5. **WebMCP Tools**
- `edit_section` - replace a paragraph/section
- `insert_chart` - add interactive component
- `save_draft` - persist to filesystem
- `commit` - git commit with message
- `preview` - toggle preview pane
- `generate_summary` - LLM creates post summary

---

## Implementation Phases

### Phase 1: Basic Editor (Week 1)
- [ ] `/admin/edit/[slug]` route
- [ ] Monaco editor integration
- [ ] Live markdown preview
- [ ] Save to filesystem (`/api/content/save`)
- [ ] Basic auth (password protect `/admin/*`)

### Phase 2: Chart Insertion (Week 2)
- [ ] Chart picker UI (dropdown with previews)
- [ ] MDX support in preview
- [ ] Insert `<ConversationSimulator />` and other components
- [ ] Chart config panel

### Phase 3: WebMCP Integration (Week 3)
- [ ] Define tools in page `<head>`
- [ ] JavaScript API (`window.WebMCP.execute`)
- [ ] Test with Gemini/Claude via Chrome extension
- [ ] Agent discovery endpoint (`/api/webmcp/tools`)

### Phase 4: Advanced Features (Week 4)
- [ ] Git integration (diff view, commit UI)
- [ ] Auto-save drafts
- [ ] Revision history
- [ ] Offline mode with local LLM

---

## Learning Module Structure

We'll document this AS we build it. The module lives at `/learn/agent-native-cms`:

### Part 1: The Vision
- What we're building and why
- Problems with current editing workflows
- The agent-native approach

### Part 2: WebMCP Deep Dive
- What is WebMCP?
- How tools are defined
- How agents discover and use them
- Live demo with example page

### Part 3: Architecture
- Component breakdown
- API design
- File structure
- WebMCP integration points

### Part 4: Building the Editor
- Monaco editor setup
- Live preview with MDX
- Chart insertion system
- WebMCP tool implementation

### Part 5: Using It
- Blake's workflow
- Agent-assisted editing examples
- Git integration
- Offline mode

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Editor | Monaco (VS Code editor) |
| Preview | remark + remark-html + MDX |
| Charts | React components (existing) |
| WebMCP | JSON-LD + JavaScript API |
| Backend | Next.js API routes |
| File I/O | Node fs module (read/write markdown) |
| Git | simple-git (Node.js git wrapper) |
| Auth | NextAuth or simple password |

---

## WebMCP Tool Specifications

### `edit_section`
```json
{
  "name": "edit_section",
  "description": "Replace content in a specific section of the post",
  "parameters": {
    "section": {
      "type": "number",
      "description": "Section index (0 = first heading, 1 = second, etc.)"
    },
    "content": {
      "type": "string",
      "description": "New markdown content for this section"
    }
  },
  "returns": {
    "success": "boolean",
    "preview": "string (HTML of updated section)"
  }
}
```

### `insert_chart`
```json
{
  "name": "insert_chart",
  "description": "Insert an interactive chart or diagram",
  "parameters": {
    "type": {
      "enum": ["conversation", "architecture", "data-flow", "terminal"],
      "description": "Type of chart to insert"
    },
    "position": {
      "type": "string",
      "enum": ["cursor", "end"],
      "description": "Where to insert (at cursor or end of document)"
    },
    "config": {
      "type": "object",
      "description": "Chart-specific configuration (scenario name, diagram nodes, etc.)"
    }
  }
}
```

### `save_draft`
```json
{
  "name": "save_draft",
  "description": "Save current content to filesystem",
  "parameters": {},
  "returns": {
    "success": "boolean",
    "path": "string (file path)",
    "timestamp": "string (ISO 8601)"
  }
}
```

### `commit`
```json
{
  "name": "commit",
  "description": "Commit changes to git",
  "parameters": {
    "message": {
      "type": "string",
      "description": "Commit message"
    },
    "push": {
      "type": "boolean",
      "default": false,
      "description": "Whether to push to remote"
    }
  }
}
```

---

## Security Considerations

### Authentication
- `/admin/*` routes require password
- Simple auth initially (environment variable password)
- Can upgrade to NextAuth later

### WebMCP Security
- Only works on `localhost` or authenticated sessions
- CORS restricted to same-origin
- Tools validate input (no arbitrary code execution)
- File writes restricted to `content/` directory

### Git Safety
- Show diff before commit
- Prevent force push
- Backup before destructive operations

---

## Offline Mode

For flights, Blake needs offline editing. Two approaches:

### Option A: Service Worker + Local LLM
- Cache editor interface in service worker
- Use Ollama or llama.cpp for local LLM
- WebMCP tools still work (JavaScript API doesn't need network)
- Sync when back online

### Option B: Electron App
- Package as desktop app
- Full offline access to filesystem
- Built-in local LLM (Ollama)
- Sync via git push/pull

---

## UX Flow

### Blake's Workflow:

1. **Open editor:** Visit `/admin/edit/post-healthcare-data`
2. **Start typing:** Monaco editor, auto-save drafts
3. **Call agent:** Open Gemini in another tab
4. **Agent helps:**
   - "Rewrite this intro" → agent calls `edit_section`
   - "Add a data flow diagram" → agent calls `insert_chart`
5. **Preview:** See changes live in right pane
6. **Iterate:** Keep editing with agent help
7. **Save:** Click save or auto-save kicks in
8. **Commit:** Review diff, write commit message, push

### Agent's Perspective:

1. **Discover page:** Blake sends URL or agent crawls to `/admin/edit/*`
2. **Read tools:** Parse WebMCP JSON-LD from page
3. **Understand context:** See what's being edited, what tools are available
4. **Execute:** Blake asks for help, agent calls appropriate tool
5. **Observe:** Tool returns result, agent sees updated preview

---

## Comparison to Alternatives

| Feature | VS Code | GitHub | Notion | Our Editor |
|---------|---------|--------|--------|------------|
| Live preview | ❌ | ❌ | ✅ | ✅ |
| Interactive charts | ❌ | ❌ | ❌ | ✅ |
| Git integration | ✅ | ✅ | ❌ | ✅ |
| Agent-native (WebMCP) | ❌ | ❌ | ❌ | ✅ |
| Markdown + MDX | ✅ | ✅ | ❌ | ✅ |
| Offline | ✅ | ❌ | ❌ | ✅ |
| Beautiful preview | ❌ | ❌ | ✅ | ✅ |

---

## Next Steps

### Immediate (This Week):
1. Create learning module structure at `/learn/agent-native-cms`
2. Write Part 1 (The Vision) as markdown
3. Sketch Part 2 (WebMCP deep dive)
4. Start prototyping the editor UI

### Short-term (Next 2 Weeks):
1. Build basic editor (Phase 1)
2. Integrate Monaco and live preview
3. Add chart insertion
4. Test WebMCP with simple tools

### Medium-term (Next Month):
1. Full WebMCP integration
2. Git diff/commit UI
3. Offline mode setup
4. Complete learning module

---

## Open Questions

1. **Auth approach:** Simple password or NextAuth?
2. **Chart config:** JSON editor or visual builder?
3. **Git UI:** In-editor or separate panel?
4. **WebMCP agent:** Which agent should we test with first? (Gemini, Claude, custom)
5. **Offline LLM:** Ollama or llama.cpp?
6. **Deployment:** Keep as localhost-only or deploy admin interface to VPS?

---

*This document will evolve as we build. Treat it as a living spec.*
