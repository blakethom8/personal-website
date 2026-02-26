# WebMCP Implementation Guide

*Reference for implementing WebMCP on the personal website.*
*Full technical overview available at: `assets/webmcp-reference.html`*

---

## What Is WebMCP

A browser API (`navigator.modelContext`) that lets web pages register MCP tools for AI agents running in the browser (Gemini in Chrome, Copilot in Edge, extensions, etc.).

**Not to be confused with:**
- Standard MCP servers (backend, standalone process)
- MCP over HTTP/Streamable transport (remote server)

WebMCP is **frontend-only, page-contextual, and progressive enhancement.**

---

## Two Modes

### Declarative (HTML Attributes)
For simple forms. Zero JavaScript.

```html
<form tool-name="send_message" tool-description="Send a message to Blake Thomson">
  <input name="name" tool-param-description="Your full name" />
  <input name="email" type="email" tool-param-description="Your email address" />
  <textarea name="message" tool-param-description="Your message"></textarea>
  <button type="submit">Send</button>
</form>
```

### Imperative (JavaScript API)
For dynamic interactions. Full control.

```typescript
navigator.modelContext.registerTool({
  name: "search_posts",
  description: "Search blog posts by topic",
  inputSchema: {
    query: { type: "string", description: "Search keyword or topic" }
  },
  execute: async (params) => {
    const results = searchPosts(params.query);
    return { count: results.length, posts: results };
  }
});
```

---

## React Hook Pattern

```typescript
// hooks/useWebMCPTool.ts
import { useEffect } from 'react';

interface WebMCPToolDef {
  name: string;
  description: string;
  inputSchema?: Record<string, any>;
  execute: (params: any) => any;
}

export function useWebMCPTool(tool: WebMCPToolDef, deps: any[] = []) {
  useEffect(() => {
    if (!('modelContext' in navigator)) return;
    const registered = (navigator as any).modelContext.registerTool(tool);
    return () => registered.unregister();
  }, deps);
}

export function useWebMCPTools(tools: WebMCPToolDef[], deps: any[] = []) {
  useEffect(() => {
    if (!('modelContext' in navigator)) return;
    const registered = tools.map(t =>
      (navigator as any).modelContext.registerTool(t)
    );
    return () => registered.forEach(r => r.unregister());
  }, deps);
}
```

---

## Tool Registry for This Site

### Global (every page)

| Tool | Description |
|------|-------------|
| `get_site_map` | Returns site structure with all pages and descriptions |
| `navigate_to` | Navigate to any page or section |
| `get_blake_info` | Quick bio, contact info, current role |

### Home

| Tool | Description |
|------|-------------|
| `get_site_overview` | Summary of all sections + recent content |
| `get_latest_content` | Recent blog posts and updates |

### About

| Tool | Description |
|------|-------------|
| `get_about_info` | Full bio, career history, personal info |

### Work

| Tool | Description |
|------|-------------|
| `get_projects` | List all projects with descriptions |
| `get_project_details` | Deep dive on a specific project |
| `get_services_overview` | Business services and approach |

### Ideas (Blog)

| Tool | Description |
|------|-------------|
| `search_posts` | Search posts by keyword or topic |
| `get_posts_by_tag` | Filter posts by category tag |
| `get_latest_posts` | Recent posts with summaries |

### Learn

| Tool | Description |
|------|-------------|
| `list_modules` | Available learning modules |
| `get_module_content` | Content for a specific module |
| `suggest_module` | Recommend a module based on interest |

### Contact

| Tool | Description |
|------|-------------|
| `send_message` | (Declarative) Contact form submission |

---

## Implementation Rules

1. **Feature detect always:** `if (!('modelContext' in navigator)) return;`
2. **Register on mount, unregister on unmount.** Use the React hook.
3. **Tools are page-contextual.** Only register tools relevant to the current page.
4. **Return structured data.** The AI needs clean JSON, not DOM references.
5. **Descriptions matter.** The AI uses them to decide when to call a tool. Be specific.
6. **No destructive actions.** Tools should read data and navigate. Contact form is the only write action.
7. **Test with Chrome Canary** (flag: `chrome://flags/#web-mcp`) or MCPB extension.
