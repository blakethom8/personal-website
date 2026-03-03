# Personal Website App

This is the Next.js application for Blake Thomson's personal site. The app lives in `src/`, but published content lives one directory up in the repo-root `content/` folder. That repo layout matters for production builds and Docker.

## Getting Started

Run the development server from this directory:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Common Commands

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Production Build

The app uses Next standalone output:

```bash
npm run build
```

This creates `.next/standalone/`, which is what the production Docker image runs.

## Docker and Deployment

Production does not build from `src/` alone because the app reads markdown from `../content`.

- Dockerfile: `src/Dockerfile`
- Compose stack: `../docker-compose.yml`
- GitHub Actions deploy pipeline: `../.github/workflows/deploy.yml`
- Main deployment notes: `../docs/ARCHITECTURE.md`

Local image build from the repo root:

```bash
docker build -f src/Dockerfile -t personal-website-test ..
```

Local compose build from the repo root:

```bash
cd ..
docker compose build
```

Pushes to `main` build the image, publish it to GHCR, and deploy it to the Hetzner server over SSH.

## Runtime Config

Development uses `src/.env.local`.

Production expects server-side env in:

```bash
/opt/personal-website/.env.production
```

At minimum:

```bash
ADMIN_PASSWORD=change-me
ADMIN_TOKEN=change-me
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - framework reference
- [Architecture doc](../docs/ARCHITECTURE.md) - deployment and infra choices
