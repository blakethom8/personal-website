export const metadata = {
  title: 'Site Structure',
  description: 'Understanding the architecture of blakethomson.com'
};

import Link from "next/link";

export default function StructurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Site Structure
          </h1>
          <p className="text-lg text-slate-600">
            A complete map of blakethomson.com — routes, content organization, and architecture
          </p>
        </div>

        {/* Route Tree */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Route Tree</h2>
          
          <div className="font-mono text-sm space-y-1">
            {/* Root */}
            <div className="flex items-start">
              <span className="text-slate-400 mr-3">/</span>
              <div className="flex-1">
                <span className="font-semibold text-slate-900">Home</span>
                <span className="text-slate-500 ml-3">Landing page, hero, overview</span>
              </div>
            </div>

            {/* About */}
            <div className="flex items-start ml-4">
              <span className="text-slate-400 mr-3">├─</span>
              <div className="flex-1">
                <span className="font-semibold text-slate-900">/about</span>
                <span className="text-slate-500 ml-3">About Blake, background, contact</span>
              </div>
            </div>

            {/* Work */}
            <div className="flex items-start ml-4">
              <span className="text-slate-400 mr-3">├─</span>
              <div className="flex-1">
                <span className="font-semibold text-slate-900">/work</span>
                <span className="text-slate-500 ml-3">Portfolio overview</span>
              </div>
            </div>
            <div className="flex items-start ml-8 text-slate-600">
              <span className="text-slate-300 mr-3">│</span>
              <span className="text-slate-500">Coming: /work/provider-search (mydoclist.com)</span>
            </div>
            <div className="flex items-start ml-8 text-slate-600">
              <span className="text-slate-300 mr-3">│</span>
              <span className="text-slate-500">Coming: /work/cms-pipeline (healthcare data)</span>
            </div>
            <div className="flex items-start ml-8 text-slate-600">
              <span className="text-slate-300 mr-3">│</span>
              <span className="text-slate-500">Coming: /work/openclaw (personal AI)</span>
            </div>

            {/* Ideas (Blog) */}
            <div className="flex items-start ml-4 mt-4">
              <span className="text-slate-400 mr-3">├─</span>
              <div className="flex-1">
                <span className="font-semibold text-slate-900">/ideas</span>
                <span className="text-slate-500 ml-3">Blog index — all posts</span>
              </div>
            </div>
            <div className="flex items-start ml-8">
              <span className="text-slate-300 mr-3">├─</span>
              <div className="flex-1">
                <span className="text-blue-600">/ideas/[slug]</span>
                <span className="text-slate-500 ml-3">Individual blog post</span>
              </div>
            </div>
            
            {/* Blog Categories */}
            <div className="flex items-start ml-8 mt-2 text-slate-600">
              <span className="text-slate-300 mr-3">│</span>
              <div className="flex-1">
                <span className="text-slate-700 font-medium">Categories:</span>
              </div>
            </div>
            <div className="flex items-start ml-12 text-slate-600">
              <span className="text-slate-200 mr-3">•</span>
              <span>The Shifting Model — business models, value creation</span>
            </div>
            <div className="flex items-start ml-12 text-slate-600">
              <span className="text-slate-200 mr-3">•</span>
              <span>The Terminal & The Agent — OpenClaw, bash, agents</span>
            </div>
            <div className="flex items-start ml-12 text-slate-600">
              <span className="text-slate-200 mr-3">•</span>
              <span>The Future of Applications — WebMCP, agent-native</span>
            </div>
            <div className="flex items-start ml-12 text-slate-600">
              <span className="text-slate-200 mr-3">•</span>
              <span>Healthcare & Data — CMS, entity resolution</span>
            </div>
            <div className="flex items-start ml-12 text-slate-600">
              <span className="text-slate-200 mr-3">•</span>
              <span>Podcast Notes — summaries, takeaways</span>
            </div>

            {/* Learn */}
            <div className="flex items-start ml-4 mt-4">
              <span className="text-slate-400 mr-3">├─</span>
              <div className="flex-1">
                <span className="font-semibold text-slate-900">/learn</span>
                <span className="text-slate-500 ml-3">Interactive learning modules</span>
              </div>
            </div>
            <div className="flex items-start ml-8">
              <span className="text-slate-300 mr-3">│</span>
              <div className="flex-1">
                <span className="text-slate-700">Tabs: Overview, Simulator</span>
              </div>
            </div>
            <div className="flex items-start ml-8">
              <span className="text-slate-300 mr-3">│</span>
              <div className="flex-1">
                <span className="text-slate-700">Simulators: API Patterns, OpenClaw Workflows</span>
              </div>
            </div>
            <div className="flex items-start ml-8 text-slate-600 mt-2">
              <span className="text-slate-300 mr-3">│</span>
              <span className="text-slate-500">Coming: /learn/agents-in-4-steps</span>
            </div>
            <div className="flex items-start ml-8 text-slate-600">
              <span className="text-slate-300 mr-3">│</span>
              <span className="text-slate-500">Coming: /learn/system-architecture</span>
            </div>
            <div className="flex items-start ml-8 text-slate-600">
              <span className="text-slate-300 mr-3">│</span>
              <span className="text-slate-500">Coming: /learn/agent-native-cms</span>
            </div>

            {/* Structure (this page) */}
            <div className="flex items-start ml-4 mt-4">
              <span className="text-slate-400 mr-3">├─</span>
              <div className="flex-1">
                <span className="font-semibold text-blue-600">/structure</span>
                <span className="text-slate-500 ml-3">This page — site documentation</span>
              </div>
            </div>

            {/* Admin (future) */}
            <div className="flex items-start ml-4 mt-4 text-slate-600">
              <span className="text-slate-400 mr-3">└─</span>
              <div className="flex-1">
                <span className="font-semibold text-slate-700">/admin</span>
                <span className="text-slate-500 ml-3">Content editor (in development)</span>
              </div>
            </div>
            <div className="flex items-start ml-8 text-slate-600">
              <span className="text-slate-200 mr-3"></span>
              <span className="text-slate-500">Coming: /admin/edit/[slug]</span>
            </div>
          </div>
        </div>

        {/* Content Organization */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Content Organization</h2>
          
          <div className="space-y-6">
            {/* Blog Posts */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Blog Posts</h3>
              <div className="bg-slate-50 rounded p-4 font-mono text-sm">
                <div className="text-slate-600 mb-2">content/posts/</div>
                <div className="ml-4 space-y-1 text-slate-700">
                  <div>├─ post-bespoke-ai-model.md</div>
                  <div>├─ post-death-of-multi-tenant.md</div>
                  <div>├─ post-entity-resolution-healthcare.md</div>
                  <div>├─ post-future-of-browser-apps.md</div>
                  <div>├─ post-openclaw-deep-dive.md</div>
                  <div>├─ post-ai-is-the-glue.md</div>
                  <div>├─ post-podcast-steinberger.md</div>
                  <div>├─ post-podcast-syntax-openclaw.md</div>
                  <div>└─ post-podcast-webmcp.md</div>
                </div>
                <div className="mt-3 text-slate-500 text-xs">
                  9 published posts • Markdown with frontmatter (title, date, category, tags)
                </div>
              </div>
            </div>

            {/* Work Detail Pages */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Work Detail Pages (Drafts)</h3>
              <div className="bg-slate-50 rounded p-4 font-mono text-sm">
                <div className="text-slate-600 mb-2">content/drafts/</div>
                <div className="ml-4 space-y-1 text-slate-700">
                  <div>├─ work-provider-search.md (~2,800 words)</div>
                  <div>├─ work-cms-pipeline.md (~3,200 words)</div>
                  <div>└─ work-personal-assistant.md (~3,400 words)</div>
                </div>
                <div className="mt-3 text-slate-500 text-xs">
                  Not yet wired to /work routes • Ready to publish
                </div>
              </div>
            </div>

            {/* Learning Modules */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Learning Modules (Drafts)</h3>
              <div className="bg-slate-50 rounded p-4 font-mono text-sm">
                <div className="text-slate-600 mb-2">content/drafts/</div>
                <div className="ml-4 space-y-1 text-slate-700">
                  <div>├─ learn-agents-in-4-steps.md (~3,800 words)</div>
                  <div>├─ learn-system-architecture.md (~2,800 words)</div>
                  <div>└─ spec-cms-chat-showcase.md (technical spec)</div>
                </div>
                <div className="mt-3 text-slate-500 text-xs">
                  Not yet wired to /learn routes • Ready to publish
                </div>
              </div>
            </div>

            {/* Interactive Components */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Interactive Components</h3>
              <div className="bg-slate-50 rounded p-4 font-mono text-sm">
                <div className="text-slate-600 mb-2">src/lib/</div>
                <div className="ml-4 space-y-1 text-slate-700">
                  <div>├─ conversation-scenarios.ts (API Patterns)</div>
                  <div>└─ openclaw-terminal-scenarios.ts (OpenClaw Workflows)</div>
                </div>
                <div className="mt-3 text-slate-500 text-xs">
                  Used in /learn simulator • 7 total scenarios
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Technical Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-40 font-semibold text-slate-700">Framework</div>
              <div className="flex-1 text-slate-600">Next.js 14 (App Router) with TypeScript</div>
            </div>
            
            <div className="flex items-start">
              <div className="w-40 font-semibold text-slate-700">Styling</div>
              <div className="flex-1 text-slate-600">TailwindCSS with custom theme</div>
            </div>
            
            <div className="flex items-start">
              <div className="w-40 font-semibold text-slate-700">Content</div>
              <div className="flex-1 text-slate-600">Markdown + MDX (React components in markdown)</div>
            </div>
            
            <div className="flex items-start">
              <div className="w-40 font-semibold text-slate-700">Markdown Parser</div>
              <div className="flex-1 text-slate-600">remark + remark-html + gray-matter (frontmatter)</div>
            </div>
            
            <div className="flex items-start">
              <div className="w-40 font-semibold text-slate-700">Deployment</div>
              <div className="flex-1 text-slate-600">Static export (next build) → any host</div>
            </div>
            
            <div className="flex items-start">
              <div className="w-40 font-semibold text-slate-700">Version Control</div>
              <div className="flex-1">
                <span className="text-slate-600">Git repository: </span>
                <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                  ~/openclaw/workspace/personal-website
                </code>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-40 font-semibold text-slate-700">GitHub</div>
              <div className="flex-1 text-slate-600">Not yet pushed to remote (local development)</div>
            </div>
          </div>
        </div>

        {/* Current State */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Current State</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="text-slate-700">
                <span className="font-semibold">9 blog posts</span> published at /ideas
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="text-slate-700">
                <span className="font-semibold">7 interactive scenarios</span> in /learn simulator
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="text-slate-700">
                <span className="font-semibold">3 work detail pages</span> written, not yet published
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="text-slate-700">
                <span className="font-semibold">3 learning modules</span> written, not yet wired
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="text-slate-700">
                <span className="font-semibold">Admin editor</span> in planning phase
              </div>
            </div>
          </div>
        </div>

        {/* Footer Nav */}
        <div className="mt-12 flex justify-between items-center text-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Home
          </Link>
          <Link href="/learn" className="text-blue-600 hover:text-blue-700">
            Explore Learn Section →
          </Link>
        </div>
      </div>
    </div>
  );
}
