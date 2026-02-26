# Codex Prompt: Build Agent-Native CMS Editor with WebMCP

**Task:** Build an in-browser markdown editor with WebMCP integration for Blake's personal website  
**Reasoning Level:** xhigh  
**Estimated Time:** 2-4 hours  
**Model:** gpt-5.3-codex

---

## Context

Blake wants to edit his website content (blog posts, learning modules) directly in the browser with a beautiful live preview AND have AI agents (Gemini, Claude) assist via WebMCP. This editor will live at `/admin/edit/[slug]` on his Next.js website.

**Key files to read first:**
1. `~/openclaw/workspace/personal-website/ADMIN-EDITOR-PLAN.md` - Full architectural plan
2. `~/openclaw/workspace/personal-website/src/src/app/learn/page.tsx` - Example of existing page structure
3. `~/openclaw/workspace/personal-website/src/src/components/learn/ConversationSimulator.tsx` - Example interactive component

---

## What You're Building

### Phase 1 Scope (This Session):

A working prototype with:
1. **Editor route:** `/admin/edit/[slug]` that loads markdown files from `content/posts/`
2. **Split pane UI:** Monaco editor (left) + live preview (right)
3. **Save functionality:** Write changes back to filesystem via API route
4. **WebMCP scaffolding:** Tool definitions in page, JavaScript API stub
5. **Basic auth:** Simple password protection for `/admin/*` routes

### What Success Looks Like:

- Blake visits `localhost:3001/admin/edit/bespoke-ai-model`
- Sees the markdown content of that post in Monaco editor
- Edits text, sees live preview update
- Clicks "Save" → content writes to `content/posts/bespoke-ai-model.md`
- WebMCP tool definitions are present (even if not fully functional yet)

---

## Technical Requirements

### Stack:
- **Framework:** Next.js 14 (App Router) with TypeScript
- **Editor:** @monaco-editor/react
- **Markdown:** remark + remark-html (already installed)
- **WebMCP:** Custom implementation (JSON-LD + JavaScript API)
- **Styling:** TailwindCSS (already configured)

### Dependencies to Install:
```bash
npm install @monaco-editor/react
npm install simple-git  # for git integration (Phase 2)
```

### File Structure to Create:
```
src/
├── app/
│   └── admin/
│       ├── layout.tsx              # Auth wrapper
│       ├── page.tsx                # Admin dashboard
│       └── edit/
│           └── [slug]/
│               └── page.tsx        # Editor page
├── components/
│   └── admin/
│       ├── MarkdownEditor.tsx      # Monaco wrapper
│       ├── LivePreview.tsx         # Preview pane
│       └── WebMCPTools.tsx         # Tool definitions component
├── lib/
│   └── webmcp.ts                   # WebMCP utilities
└── app/api/
    ├── admin/
    │   ├── auth/route.ts           # Auth check
    │   └── content/
    │       ├── load/route.ts       # Load file content
    │       └── save/route.ts       # Save file content
    └── webmcp/
        └── tools/route.ts          # Tool registry
```

---

## Implementation Details

### 1. Admin Layout with Auth

**File:** `src/app/admin/layout.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if already authed
    const isAuthed = sessionStorage.getItem('admin_authed') === 'true';
    setAuthed(isAuthed);
  }, []);

  const handleAuth = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (res.ok) {
      sessionStorage.setItem('admin_authed', 'true');
      setAuthed(true);
    } else {
      alert('Wrong password');
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg">
          <h1 className="text-2xl mb-4 text-white">Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            className="border p-2 rounded mb-4 w-full bg-gray-700 text-white"
            placeholder="Password"
          />
          <button onClick={handleAuth} className="bg-blue-600 text-white px-4 py-2 rounded">
            Enter
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 2. Auth API Route

**File:** `src/app/api/admin/auth/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  
  // Simple password check (use env var in production)
  const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === correctPassword) {
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ success: false }, { status: 401 });
}
```

### 3. Editor Page

**File:** `src/app/admin/edit/[slug]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import LivePreview from '@/components/admin/LivePreview';
import WebMCPTools from '@/components/admin/WebMCPTools';

export default function EditPage({ params }: { params: { slug: string } }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, [params.slug]);

  const loadContent = async () => {
    const res = await fetch(`/api/admin/content/load?slug=${params.slug}`);
    const data = await res.json();
    setContent(data.content || '');
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/admin/content/save', {
      method: 'POST',
      body: JSON.stringify({ slug: params.slug, content }),
      headers: { 'Content-Type': 'application/json' }
    });
    setSaving(false);
    alert('Saved!');
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Editing: {params.slug}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Split Pane */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
        <MarkdownEditor value={content} onChange={setContent} />
        <LivePreview markdown={content} />
      </div>

      {/* WebMCP Tools (hidden, for agent discovery) */}
      <WebMCPTools slug={params.slug} />
    </div>
  );
}
```

### 4. Monaco Editor Component

**File:** `src/components/admin/MarkdownEditor.tsx`

```typescript
'use client';

import Editor from '@monaco-editor/react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="h-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16, bottom: 16 }
        }}
      />
    </div>
  );
}
```

### 5. Live Preview Component

**File:** `src/components/admin/LivePreview.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { remark } from 'remark';
import html from 'remark-html';

interface LivePreviewProps {
  markdown: string;
}

export default function LivePreview({ markdown }: LivePreviewProps) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    renderMarkdown();
  }, [markdown]);

  const renderMarkdown = async () => {
    const result = await remark().use(html).process(markdown);
    setHtmlContent(result.toString());
  };

  return (
    <div className="h-full bg-white rounded-lg overflow-auto p-8 border border-gray-300">
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
```

### 6. WebMCP Tools Component

**File:** `src/components/admin/WebMCPTools.tsx`

```typescript
'use client';

import { useEffect } from 'react';

interface WebMCPToolsProps {
  slug: string;
}

export default function WebMCPTools({ slug }: WebMCPToolsProps) {
  useEffect(() => {
    // Register WebMCP tools
    (window as any).WebMCP = {
      tools: [
        {
          name: 'edit_section',
          description: 'Replace content in a specific section',
          parameters: {
            section: { type: 'number', description: 'Section index' },
            content: { type: 'string', description: 'New content' }
          }
        },
        {
          name: 'save_draft',
          description: 'Save current content to filesystem',
          parameters: {}
        }
      ],
      
      execute: async (toolName: string, params: any) => {
        console.log(`WebMCP: ${toolName}`, params);
        // Implementation in Phase 2
        return { success: true, message: 'Tool not yet implemented' };
      }
    };

    // Also add JSON-LD for agent discovery
    const script = document.createElement('script');
    script.type = 'application/webmcp+json';
    script.textContent = JSON.stringify({
      tools: (window as any).WebMCP.tools
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [slug]);

  return null; // Hidden component
}
```

### 7. Load Content API

**File:** `src/app/api/admin/content/load/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), '..', 'content', 'posts', `${slug}.md`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
```

### 8. Save Content API

**File:** `src/app/api/admin/content/save/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const { slug, content } = await req.json();
  
  if (!slug || content === undefined) {
    return NextResponse.json({ error: 'Slug and content required' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), '..', 'content', 'posts', `${slug}.md`);
  
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
```

### 9. Admin Dashboard

**File:** `src/app/admin/page.tsx`

```typescript
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import fs from 'fs';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<string[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const res = await fetch('/api/admin/content/list');
    const data = await res.json();
    setPosts(data.posts || []);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Blog Posts</h2>
        <ul className="space-y-2">
          {posts.map(slug => (
            <li key={slug}>
              <Link 
                href={`/admin/edit/${slug}`}
                className="text-blue-400 hover:text-blue-300"
              >
                Edit: {slug}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### 10. List Posts API

**File:** `src/app/api/admin/content/list/route.ts`

```typescript
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const postsDir = path.join(process.cwd(), '..', 'content', 'posts');
  
  try {
    const files = fs.readdirSync(postsDir);
    const posts = files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
    
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ posts: [] });
  }
}
```

---

## Environment Setup

Add to `.env.local`:
```
ADMIN_PASSWORD=your_secure_password_here
```

---

## Testing Checklist

After implementation, verify:

- [ ] Navigate to `localhost:3001/admin` → see auth screen
- [ ] Enter password → access dashboard
- [ ] Dashboard lists all blog posts
- [ ] Click "Edit: bespoke-ai-model" → editor loads
- [ ] Monaco editor shows markdown content
- [ ] Live preview renders markdown correctly
- [ ] Edit text in Monaco → preview updates
- [ ] Click "Save" → file writes to disk (check with `cat content/posts/bespoke-ai-model.md`)
- [ ] Refresh page → changes persist
- [ ] Open browser console → `window.WebMCP` object exists
- [ ] `window.WebMCP.tools` shows array of tool definitions

---

## Performance Expectations

This is a relatively straightforward implementation. Key complexity areas:

1. **Monaco integration:** Should be smooth with @monaco-editor/react
2. **File I/O:** Straightforward with Node fs module
3. **WebMCP scaffolding:** JSON-LD + JavaScript API is simple
4. **Auth:** Basic sessionStorage approach works for prototype

Expected completion: 1.5-2 hours with xhigh reasoning.

---

## Known Limitations (Phase 1)

- No git integration yet (Phase 2)
- WebMCP tools defined but not fully functional (Phase 2)
- No chart insertion UI (Phase 2)
- No MDX support (Phase 2)
- Simple password auth (can upgrade to NextAuth later)

---

## Post-Implementation Notes

**Codex Performance:**
- Reasoning quality: [TBD]
- Code correctness: [TBD]
- Did it understand WebMCP?: [TBD]
- Bugs encountered: [TBD]
- Time taken: [TBD]
- Would use again?: [TBD]

**What worked well:**
[Blake will fill this in after testing]

**What needs improvement:**
[Blake will fill this in after testing]

**Next steps:**
[Phase 2 features to add]

---

## Additional Context for Codex

Blake's website uses:
- Next.js 14 App Router (not Pages Router)
- TypeScript throughout
- TailwindCSS for styling
- Content lives in `content/posts/` as markdown files
- Existing components in `src/components/`

The website is structured for Blake to:
1. Write technical blog posts about AI, healthcare data, and architecture
2. Build learning modules with interactive components
3. Showcase his work (provider search, CMS pipeline, OpenClaw)

This admin editor is critical infrastructure for his workflow. He wants to edit content with AI assistance (via WebMCP) and see beautiful live previews with interactive charts.

---

**Ready to build? Let's go! 🚀**
