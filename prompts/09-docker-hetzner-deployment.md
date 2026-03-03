# Prompt 09: Docker & Hetzner Deployment Infrastructure

## Context

Read `CLAUDE.md` first. Then `docs/ARCHITECTURE.md` — it contains the intended Docker setup in full detail. This prompt implements exactly what's described there. Do not invent a different approach.

This is an infrastructure task, not a design task. No UI changes. No new components. The goal is a complete, working deployment pipeline so `git push` to `main` results in a live site at the configured domain.

Important repo-layout note: the Next.js app lives in `src/`, but site content lives in the repo-root `content/` directory. Any Docker or GitHub Actions build that uses `src/` as the only build context will be broken because the app reads markdown from `../content`.

---

## Current State

- The Next.js app lives in `src/` and runs locally via `npm run dev`
- The site content lives in repo-root `content/`, so Docker builds must include both `src/` and `content/`
- `src/next.config.ts` must use `output: 'standalone'`
- The deployment stack consists of `src/Dockerfile`, `docker-compose.yml`, nginx config, and `.github/workflows/deploy.yml`
- The architecture is fully specified in `docs/ARCHITECTURE.md` — implement it exactly

---

## Task

### 1. Update `src/next.config.ts`

Add `output: 'standalone'` to the Next.js config. This is required for the multi-stage Docker build described in `docs/ARCHITECTURE.md`.

```ts
const nextConfig: NextConfig = {
  output: 'standalone',
  // any other existing config
};
```

Verify this doesn't break `npm run dev` or `npm run build`.

### 2. Create `src/Dockerfile`

Implement the multi-stage build from `docs/ARCHITECTURE.md`:

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

Add a `src/.dockerignore` to exclude:
- `node_modules`
- `.next`
- `*.local`
- `.env*` (but NOT `.env.example`)

### 3. Create `docker-compose.yml` (at repo root)

Implement the compose setup from `docs/ARCHITECTURE.md`:

```yaml
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

### 4. Create nginx config

Create `nginx/conf.d/blakethomson.conf`:

```nginx
server {
    listen 80;
    server_name blakethomson.com www.blakethomson.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name blakethomson.com www.blakethomson.com;

    ssl_certificate /etc/letsencrypt/live/blakethomson.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blakethomson.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy strict-origin-when-cross-origin;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:;";

    location / {
        proxy_pass http://website:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Create `nginx/conf.d/.gitkeep` and `nginx/certs/.gitkeep` so the directory structure is committed.

**Note:** SSL certs will be provisioned by certbot on the Hetzner server at first deploy. The nginx config above is the post-cert state. Also provide a `nginx/conf.d/blakethomson-pre-ssl.conf.example` that serves HTTP only, for use during initial certbot provisioning.

### 5. Create GitHub Actions CI/CD workflow

Create `.github/workflows/deploy.yml` implementing the pipeline from `docs/ARCHITECTURE.md`:

```
git push main
  → build Docker image
  → push to ghcr.io
  → SSH into Hetzner
  → pull new image
  → docker compose up -d
```

The workflow should:
- Trigger on push to `main`
- Use `GITHUB_TOKEN` for authenticating to ghcr.io (no separate secret needed)
- Require these repository secrets for Hetzner SSH:
  - `HETZNER_HOST` — server IP or hostname
  - `HETZNER_USER` — SSH user (e.g. `deploy`)
  - `HETZNER_SSH_KEY` — private key for passwordless SSH
- Pull the new image and restart containers on the Hetzner server
- Image should be tagged as `ghcr.io/<repo-owner>/personal-website:latest`
- If `/opt/personal-website/.env.production` exists on the server, load it before `docker compose up -d`

Use `appleboy/ssh-action` for the SSH step — it's the standard for this pattern.

### 6. Create a server setup script

Create `scripts/hetzner-setup.sh` — a one-time script Blake runs on a fresh Hetzner server to get it ready for deployments:

```bash
#!/bin/bash
# Run once on a fresh Hetzner VPS to prepare for Docker deployments
# Usage: bash hetzner-setup.sh

set -e

# Install Docker
apt-get update
apt-get install -y docker.io docker-compose-plugin

# Install certbot for SSL
apt-get install -y certbot

# Create deploy user with docker access
useradd -m -s /bin/bash deploy
usermod -aG docker deploy

# Create app directory
mkdir -p /opt/personal-website
chown deploy:deploy /opt/personal-website

echo "Done. Next steps:"
echo "1. Add your SSH public key to /home/deploy/.ssh/authorized_keys"
echo "2. Clone the repo to /opt/personal-website"
echo "3. Run certbot to provision SSL"
echo "4. Set up the pre-SSL nginx config, then swap to full SSL config after cert is issued"
echo "5. Push to GitHub main to trigger the first CI deploy"
```

Make it executable and include a comment header explaining what it does and when to run it.

### 7. Update `.gitignore`

Ensure `src/.gitignore` (or the root `.gitignore`) excludes:
- `nginx/certs/` contents (but not the directory itself — keep `.gitkeep`)
- `.env.local`
- `.env.production`

Certs are provisioned on the server, never committed.

---

## Verification

After completing all steps, verify:

1. **Local Docker build works:**
   ```bash
   docker build -f src/Dockerfile -t personal-website-test .
   docker run -p 3000:3000 personal-website-test
   # Site should load at http://localhost:3000
   ```

2. **Compose build works from repo root:**
   ```bash
   docker compose build
   # Should complete without errors
   ```
   (Don't run `up` — nginx will fail without real SSL certs, which is expected locally)

3. **Next.js standalone output exists after build:**
   After `npm run build` in `src/`, verify `.next/standalone/` directory is created.

4. **GitHub Actions workflow syntax is valid:**
   The YAML should be valid — no tabs, correct indentation, all required keys present.

---

## Do NOT

- Don't change any page components, styles, or content — this is pure infrastructure
- Don't use `docker compose up` with nginx locally — it needs real SSL certs to work
- Don't hardcode the domain name in the Dockerfile or compose file — keep it in nginx config only
- Don't commit `.env` files or SSL certificates
- Don't install unnecessary packages or add complexity beyond what `docs/ARCHITECTURE.md` specifies
- Don't use `npm run build` without first confirming `output: 'standalone'` is set — the image will be broken without it

---

## Files Created by This Prompt

```
personal-website/
├── .gitignore                       ← updated for certs and production env
├── .dockerignore                    ← new (root build context)
├── docker-compose.yml               ← new
├── scripts/
│   └── hetzner-setup.sh             ← new
├── nginx/
│   ├── conf.d/
│   │   ├── blakethomson.conf        ← new
│   │   ├── blakethomson-pre-ssl.conf.example  ← new
│   │   └── .gitkeep                 ← new
│   └── certs/
│       └── .gitkeep                 ← new
├── .github/
│   └── workflows/
│       └── deploy.yml               ← new
└── src/
    ├── Dockerfile                   ← new
    ├── .dockerignore                ← new
    └── next.config.ts               ← modified (add output: 'standalone')
```
