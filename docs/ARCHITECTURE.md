# Architecture — Blake Thomson Personal Website

*Last updated: 2026-03-03*

---

## Design Principles

1. **Easy to maintain.** Blake should be able to add a blog post by dropping an MDX file and pushing. No complex CMS, no database for content.
2. **Fast to load.** Static where possible, interactive where it matters (Learn modules, WebMCP).
3. **Docker-deployable.** One `docker compose up` on Hetzner and it's live.
4. **WebMCP-enabled.** Every page registers contextual AI tools. The site is a live demo of the technology.
5. **Content-first.** The framework serves the content, not the other way around.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js 16 (App Router) | SSG + React islands for interactivity. MDX native. Huge ecosystem. |
| **Styling** | Tailwind CSS 4 | Utility-first, fast iteration, good dark mode support |
| **Content** | MDX files in repo | No external CMS dependency. Version controlled. Easy to write. |
| **Interactivity** | React client components | For Learn modules, WebMCP hooks, dark mode toggle |
| **Typography** | Inter + JetBrains Mono | Clean, modern, excellent readability |
| **Icons** | Lucide React | Consistent, lightweight |
| **Animations** | Framer Motion (light use) | Subtle scroll reveals, page transitions |
| **Deployment** | Docker on Hetzner VPS | Full control, cheap, already have infrastructure |

---

## Infrastructure

### Hetzner VPS

```
Hetzner VPS (existing or new)
├── Docker
│   ├── personal-website (Next.js container)
│   │   ├── Node.js runtime (for SSR/ISR if needed)
│   │   └── Static assets served via Next.js
│   └── nginx-proxy (reverse proxy + SSL)
│       ├── SSL via Let's Encrypt (certbot)
│       └── Routes: blakethomson.com → personal-website:3000
└── GitHub Actions deploys on push to main
```

### Docker Setup

```yaml
# docker-compose.yml
services:
  website:
    image: ${WEBSITE_IMAGE:-personal-website:latest}
    build:
      context: .
      dockerfile: src/Dockerfile
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - NODE_ENV=production
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-}
      - ADMIN_TOKEN=${ADMIN_TOKEN:-}

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/certs:/etc/letsencrypt
    depends_on:
      - website
```

### Dockerfile (Next.js)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app/src
COPY src/package*.json ./
RUN npm ci

WORKDIR /app
COPY content ./content
COPY src ./src

WORKDIR /app/src
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/src
ENV NODE_ENV=production
COPY --from=builder /app/src/.next/standalone ./
COPY --from=builder /app/src/.next/static ./.next/static
COPY --from=builder /app/src/public ./public
COPY --from=builder /app/content ../content
EXPOSE 3000
CMD ["node", "server.js"]
```

Because the site content lives in the repo-root `content/` directory while the Next.js app lives in `src/`, the Docker build context must be the repo root. The Dockerfile still lives in `src/`.

### Deployment Flow

```
Local development (Blake's machine)
    │
    ├── Claude Code builds in ~/openclaw/workspace/personal-website/src/
    ├── Chief writes content in content/drafts/ → content/posts/
    ├── Blake reviews, iterates
    │
    ▼
git push to GitHub (main branch)
    │
    ▼
GitHub Actions
    ├── Build Docker image
    ├── Push to GitHub Container Registry (ghcr.io)
    │
    ▼
Hetzner VPS
    ├── Load `.env.production` (admin credentials, any runtime secrets)
    ├── Pull new image
    ├── docker compose up -d
    └── Live at blakethomson.com (or whatever domain)
```

### GitHub Actions Pipeline

The production deploy pipeline lives in `.github/workflows/deploy.yml`.

On every push to `main` it does this:

1. Check out the repo
2. Build the production image from the repo root using `src/Dockerfile`
3. Push `ghcr.io/<repo-owner>/personal-website:latest`
4. SSH into the Hetzner box
5. Load `/opt/personal-website/.env.production` if it exists
6. Pull the new `website` image and restart the stack with `docker compose up -d`

### Required GitHub Secrets

The workflow expects these repository secrets:

- `HETZNER_HOST`
- `HETZNER_USER`
- `HETZNER_SSH_KEY`

No separate container-registry secret is needed. The workflow uses the repository `GITHUB_TOKEN` for GHCR authentication.

### Server Runtime Config

The Hetzner server should keep runtime secrets in:

```bash
/opt/personal-website/.env.production
```

Current required values:

```bash
ADMIN_PASSWORD=change-me
ADMIN_TOKEN=change-me
```

The app now fails closed in production if those admin credentials are missing. It will not fall back to development defaults.

### First Deploy Checklist

1. Run `scripts/hetzner-setup.sh` on the fresh Hetzner server
2. Clone the repo into `/opt/personal-website`
3. Copy `nginx/conf.d/blakethomson-pre-ssl.conf.example` into place for the first HTTP-only boot
4. Run certbot and provision the real certificates
5. Swap to `nginx/conf.d/blakethomson.conf`
6. Create `/opt/personal-website/.env.production`
7. Push to `main` to trigger the GitHub Actions deploy

---

## Site Architecture

### Routing

```
/                          → Home (SSG)
/about                     → About (SSG)
/work                      → Work/Portfolio (SSG)
/ideas                     → Blog listing (SSG, regenerates on build)
/ideas/[slug]              → Individual post (SSG from MDX)
/learn                     → Learning hub (SSG + client interactivity)
/learn/agents-explained    → Flagship guide: "How AI Agents Actually Work" (SSG + client)
/learn/simulator           → Standalone conversation simulator page
/contact                   → Contact form (SSG + client-side form handling)
```

All pages are statically generated at build time. Interactive elements (Learn modules, WebMCP, contact form, dark mode) hydrate as React client components.

### Content System

```
content/posts/                          ← Blog posts (MDX)
├── bespoke-ai-model.mdx
├── webmcp-overview.mdx
└── entity-resolution-healthcare.mdx

content/learn/learn-agents-guide/       ← Flagship guide (Markdown → remark-html)
├── 00-introduction.md
├── 01-the-big-picture.md
├── 02-how-ai-communicates.md
├── 03-context-and-memory.md
├── 04-tools-and-actions.md
├── 05-agentic-patterns.md
└── 06-same-engine-different-cars.md
```

Each MDX file has frontmatter:

```yaml
---
title: "WebMCP: Making Websites AI-Native"
date: "2026-02-25"
tags: ["technology", "webmcp", "ai"]
excerpt: "A new browser API that lets websites expose their functionality directly to AI agents."
readTime: "8 min"
featured: false
---
```

MDX is processed at build time. Custom components available in MDX:
- `<Callout>` — Info/warning/tip boxes
- `<CodeBlock>` — Syntax-highlighted code with copy button
- `<Interactive>` — Wrapper for client-side React components
- `<Diagram>` — Architecture diagrams
- `<Demo>` — Live demo embeds

### WebMCP Layer

```
src/
├── hooks/
│   ├── useWebMCPTool.ts      ← Single tool registration
│   └── useWebMCPTools.ts     ← Multi-tool registration
├── components/webmcp/
│   ├── GlobalTools.tsx        ← Site-wide tools (mounted in layout)
│   ├── HomeTools.tsx          ← Home page contextual tools
│   ├── WorkTools.tsx          ← Work page contextual tools
│   ├── IdeasTools.tsx         ← Blog tools (search, list)
│   ├── LearnTools.tsx         ← Education tools (list, suggest)
│   └── ContactTools.tsx       ← Contact form declarative tools
```

WebMCP tools are registered via `useEffect` in page-level components. They unregister on unmount. Feature detection ensures the site works in browsers without WebMCP support.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 95 |
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 2.0s |
| Total Bundle Size (JS) | < 100KB gzipped (excluding Learn modules) |
| Time to Interactive | < 2.0s |

### Strategy
- Static generation for all content pages
- Code splitting per route (Learn modules are heavy, loaded on demand)
- Image optimization via Next.js `<Image>`
- Minimal client-side JS on content pages (blog posts don't need React hydration)
- WebMCP hooks are tiny — no perf impact

---

## Security

- HTTPS everywhere (Let's Encrypt via certbot)
- CSP headers configured in nginx
- Admin auth requires explicit production env vars (`ADMIN_PASSWORD`, `ADMIN_TOKEN`)
- Contact form: rate limiting + honeypot (no CAPTCHA)
- No database — no SQL injection surface
- WebMCP tools only read/navigate — no destructive actions exposed
- Environment variables for any API keys (contact form email service, etc.)

---

## Future Considerations

- **RSS feed** for Ideas section
- **Open Graph / social cards** for blog post sharing
- **Search** — client-side search with Fuse.js or similar (no server needed)
- **Analytics** — Plausible or Umami (privacy-friendly, self-hosted on Hetzner)
- **Comments** — GitHub Discussions integration or Giscus
- **Newsletter** — If Blake wants email distribution of blog posts
