# Personal Website Deep Dive Review
**Date:** 2026-02-26 13:30 PST  
**Reviewer:** Chief  
**Dev Server:** http://localhost:3002 (running)

---

## Executive Summary

Your personal website is **80% complete and well-structured**, with clean design, proper routing, and most content in place. The Matrix terminal in Learn is sick. However, there are some critical gaps between what exists and your vision in WEBSITE-SPEC.md:

### 🟢 What's Working Well
- Site structure matches spec (Home, About, Work, Ideas, Learn, Contact)
- Design system is clean, consistent, and on-brand
- Blog posts exist and have proper routing
- Matrix terminal is a killer feature
- Mobile-responsive throughout
- Dark mode support

### 🟡 Needs Attention
- Blog posts aren't linked from homepage (all go to /ideas, not /ideas/[slug])
- Learning modules in `content/drafts/` aren't wired into Learn page
- Only 1 of 6 planned learn modules shows as available
- No WebMCP integration (site isn't AI-native yet)
- Contact form is static (not declarative/AI-fillable)

### 🔴 Missing from Spec
- GitHub education repo link (doesn't exist yet?)
- Featured project rotation (currently hardcoded)
- "Latest" blog posts on homepage don't link to actual posts
- WebMCP tools (the site should demo its own technology)

---

## Detailed Findings

### 1. Homepage (`/`)

**Status:** ✅ Mostly complete

**What's working:**
- Hero section with positioning statement
- Site directory with clean navigation
- "Latest posts" section with proper styling
- "Currently building" featured project
- Clean, professional design

**Issues:**
- ❌ Blog post links all go to `/ideas` instead of `/ideas/[slug]`
  - "The Bespoke AI Model" should link to `/ideas/bespoke-ai-model`
  - "WebMCP: Making Websites AI-Native" should link to `/ideas/webmcp-overview`
  - etc.
- ❌ Featured project is hardcoded (not pulling from a data source)
- ⚠️ "Latest posts" metadata (dates, read times) are hardcoded — should pull from actual post frontmatter

**Recommendation:**
```tsx
// Fix blog post links
<Link href={`/ideas/${post.slug}`}>
  <PostRow title={post.title} category={post.category} ... />
</Link>

// Pull latest posts dynamically
const latestPosts = getAllPosts().slice(0, 4);
```

---

### 2. About Page (`/about`)

**Status:** ✅ Complete and matches spec

**What's working:**
- Short version + longer version structure
- Personal details (location, role, education, venture)
- Career arc, venture mission, education passion
- "Beyond work" section with Devon, Orinda, surfing
- Clean typography and spacing

**Issues:**
- None — this page is good to go!

---

### 3. Work Page (`/work`)

**Status:** ✅ Complete and well-executed

**What's working:**
- Services overview with bespoke AI positioning
- Featured projects (Provider Search, CMS Pipeline, Bots, Analytics)
- Approach section (Discovery → Build → Evolve)
- Tech stack breakdown (backend, frontend, AI & data, infra)
- Proper highlighting for main project

**Issues:**
- None — this is strong

**Enhancement ideas:**
- Could add links to live demos (mydoclist.com for Provider Search)
- Could add screenshots/visuals for projects

---

### 4. Ideas/Blog (`/ideas`)

**Status:** ✅ Routing works, content exists

**What's working:**
- 9 blog posts exist in `content/posts/`
- Posts have proper frontmatter (title, date, excerpt, category, tags)
- Individual post pages work (`/ideas/[slug]`)
- getAllPosts() correctly loads from filesystem
- Clean article layout with TOC

**Issues:**
- ⚠️ Homepage doesn't link to individual posts (see above)
- ⚠️ Posts aren't surfaced in Ideas overview (only shows list)

**Content inventory:**
- ✅ bespoke-ai-model.md
- ✅ death-of-multi-tenant.md
- ✅ entity-resolution-healthcare.md
- ✅ future-of-browser-apps.md
- ✅ openclaw-deep-dive.md
- ✅ ai-is-the-glue.md
- ✅ podcast-steinberger.md
- ✅ podcast-syntax-openclaw.md
- ✅ podcast-webmcp.md

All posts have proper metadata and are ready to publish.

---

### 5. Learn Page (`/learn`)

**Status:** ⚠️ Partially complete — big gap here

**What's working:**
- ✅ Matrix terminal (killer feature!)
- ✅ Tab structure (overview, guides, modules, deep dives)
- ✅ ConversationSimulator exists for guides
- ✅ Clean file-browser aesthetic

**Issues:**
- ❌ **3 learning modules exist in `content/drafts/` but aren't wired into the Learn page**
  - `learn-agents-in-4-steps.md` (~3,800 words)
  - `learn-system-architecture.md` (~2,800 words)
  - `learn-openclaw-deep-dive.md` (~4,800 words)
- ❌ `learn-modules.ts` has 6 modules hardcoded, but 5 are marked `available: false`
- ❌ Only "What Is an LLM?" shows as available
- ❌ The `.md` files in drafts aren't being loaded — content exists but isn't displayed

**Critical discrepancy:**
Your spec calls for 6 interactive modules:
1. What Is an LLM?
2. How ChatGPT Actually Works
3. What Are Tokens?
4. Agents: AI That Takes Action
5. AI in Healthcare: What's Real, What's Hype
6. Prompt Engineering for Normal People

**What actually exists:**
- Hardcoded modules in `learn-modules.ts` (file-browser style)
- 3 written modules in `content/drafts/` (markdown format)
- Mismatch between data structure and content format

**Recommendation:**
**Option A: Convert markdown modules to the hardcoded format** (faster)
- Take content from `learn-agents-in-4-steps.md` and structure it like the "What Is an LLM?" module
- Add to `learn-modules.ts` as `available: true`

**Option B: Create a markdown loader** (cleaner long-term)
- Build `getLearnModules()` function similar to `getAllPosts()`
- Load modules from `content/learn/` dynamically
- Keep spec in frontmatter, render content as MDX

I recommend **Option B** — it's more maintainable and matches how blog posts work.

---

### 6. Contact Page (`/contact`)

**Status:** ✅ Complete but not AI-native (yet)

**What's working:**
- Clean contact form with name, email, subject dropdown, message
- Sidebar with email, GitHub, LinkedIn links
- Location (Santa Monica, CA)
- Good UX and styling

**Issues:**
- ❌ Form doesn't actually submit anywhere (no action/handler)
- ❌ Not WebMCP-enabled (spec calls for declarative AI-fillable form)
- ❌ No backend to receive messages

**Spec requirement:**
> Contact form (declarative WebMCP — auto-fillable by AI agents)  
> Form with `tool-name="send_message"` attributes

**Recommendation:**
Either:
1. **Quick fix:** Add Formspree or similar service for form handling
2. **AI-native:** Add WebMCP tool attributes so AI can auto-fill the form
3. **Full solution:** Build API route to handle submissions + WebMCP layer

---

## 7. WebMCP Integration (Site-Wide)

**Status:** ❌ Not implemented

**Spec requirement:**
> Every page registers contextual tools. The site itself becomes an AI-native experience — a demo of the very technology Blake writes about.

**What should exist (from spec):**

**Global tools (every page):**
- `get_site_map` — Returns site structure and available pages
- `navigate_to` — Navigate to any page/section
- `get_blake_info` — Quick bio and contact info

**Page-specific tools:**
- Home: `get_site_overview`, `navigate_to_section`
- About: `get_about_info`
- Work: `get_projects`, `get_project_details`, `get_services_overview`
- Ideas: `search_posts`, `get_latest_posts`, `get_post_by_topic`
- Learn: `list_modules`, `get_module_content`, `suggest_module`
- Contact: Declarative form with `tool-name` attributes

**Current reality:**
- ❌ No WebMCP integration
- ❌ No tool registration on any pages
- ⚠️ WebMCP code exists in `/src/lib/webmcp.ts` but isn't used

**This is a big miss** — the site should be a live demo of WebMCP technology since Blake writes about it. The site itself should be AI-accessible.

**Recommendation:**
Priority task. Add WebMCP tool registration to each page progressively:
1. Start with global tools (site map, navigation)
2. Add page-specific tools
3. Make contact form declarative
4. Write a blog post showing how the site itself is AI-native

---

## 8. Content Pipeline

**Status:** ✅ Working well

**What exists:**
- Blog posts in `content/posts/` loaded via `getAllPosts()`
- MDX parsing with frontmatter
- Individual post routing works
- Clean markdown → HTML pipeline

**Gap:**
- Learning modules in `content/drafts/` aren't loaded
- No dynamic module loading (hardcoded in `learn-modules.ts`)

---

## Priority Action Items

### 🔴 Critical (Do First)

1. **Fix homepage blog links**  
   Links should go to `/ideas/[slug]`, not just `/ideas`  
   File: `src/app/page.tsx`

2. **Wire up learning modules**  
   The 3 modules in `content/drafts/` should display in Learn section  
   Options: Convert to hardcoded format OR build markdown loader

3. **Add form submission handler**  
   Contact form doesn't submit anywhere  
   Quick: Formspree. Better: API route.

### 🟡 Important (Do Soon)

4. **Add WebMCP integration**  
   Make the site AI-native (matches your vision + demos the tech)  
   Start with global tools, expand to page-specific

5. **Pull latest posts dynamically**  
   Homepage "latest posts" should use `getAllPosts()` not hardcoded data

6. **Add live demo links to Work page**  
   Link to mydoclist.com for Provider Search

### 🟢 Nice to Have (Later)

7. **Add GitHub education repo link**  
   Spec mentions linking to education repo (doesn't exist yet?)

8. **Add project screenshots**  
   Work page could use visuals

9. **Featured project rotation**  
   Currently hardcoded — could pull from data source

10. **Analytics integration**  
    Track what content resonates

---

## Code Quality & Architecture

**Overall:** ✅ Clean, maintainable, well-structured

**Positives:**
- Consistent component patterns
- Good separation of concerns (lib/ for data, components/ for UI)
- Proper TypeScript typing
- Clean CSS with Tailwind
- Mobile-responsive throughout
- Dark mode support

**Observations:**
- Some duplication in styling (could extract more shared components)
- No testing (not critical for personal site)
- No error boundaries (consider adding for Learn interactive modules)

---

## Design & UX

**Overall:** ✅ Excellent

**Strengths:**
- Clean, modern, minimal aesthetic ✅
- Consistent typography hierarchy ✅
- Good use of whitespace ✅
- Professional but approachable ✅
- Code-inflected design (monospace labels, terminal aesthetic) ✅
- Matrix terminal is a standout feature ✅

**Suggestions:**
- Consider adding subtle scroll animations (Framer Motion)
- Could add more photography/visuals to break up text
- Learn section could use more interactivity beyond the Matrix terminal

---

## Performance

**Status:** ✅ Should be fast (static generation)

**Notes:**
- Next.js App Router with SSG
- No heavy dependencies
- Images should be optimized with next/image
- Consider adding loading states for Learn interactive modules

---

## Deployment Readiness

**Current state:** Ready for deployment to Hetzner

**Checklist:**
- ✅ Dockerfile exists (need to verify it works)
- ✅ docker-compose.yml configured
- ⚠️ Need SSL/nginx config for production
- ⚠️ Need domain (blakethomson.com or similar)
- ⚠️ Need environment variables (.env.local for production)

---

## Recommendations Summary

### Immediate (This Week)

1. **Fix homepage blog links** (15 minutes)
2. **Wire up learning modules** (2-3 hours)
3. **Add contact form handler** (30 minutes with Formspree)

### Short-term (Next 2 Weeks)

4. **Add WebMCP layer** (4-6 hours)  
   This is the differentiator — makes the site a live demo of your technology
5. **Pull dynamic content** (1 hour)
6. **Add project links/screenshots** (1-2 hours)

### Long-term (As Needed)

7. Build remaining Learn modules (as time allows)
8. Add analytics and tracking
9. Expand blog content
10. Consider adding case studies to Work page

---

## Final Verdict

**The site is 80% complete and high quality.** The design is strong, the content exists, and the technical foundation is solid. The Matrix terminal is a killer feature that sets the tone.

**The main gaps:**
1. Homepage blog links (quick fix)
2. Learning modules aren't wired up (medium effort)
3. WebMCP integration (big miss — this should be the flagship feature)
4. Contact form doesn't work (quick fix)

**Bottom line:** Fix the links, wire up the modules, and add WebMCP. Those three changes turn this from "almost ready" to "ship it."

---

**Next steps:** Let me know which items you want me to tackle first. I can fix #1 and #3 in the next 20 minutes, then we can decide on the Learn modules approach together.
