---
title: "Azure for Vibe Coders: A Practical Guide to Deploying AI Apps"
date: "2026-02-25"
excerpt: "You can build an AI app in a weekend. But Azure's portal makes your eyes glaze over. This guide maps Azure's concepts to what you actually need."
readTime: "15 min"
category: "technical-deep-dives"
tags: ["azure", "deployment", "docker", "cloud", "ai"]
featured: false
coverImage: "/images/posts/azure-for-vibe-coders.jpg"
---

# Azure for Vibe Coders: A Practical Guide to Deploying AI Apps

**Who this is for:** You can build an AI app in a weekend. You understand APIs, Docker, and Python. But Azure's portal makes your eyes glaze over — subscriptions, resource groups, app registrations, managed identities... what actually matters? This guide cuts through the abstraction layers and maps Azure's concepts to what you actually need: containers running your code, databases holding your data, and LLMs powering your AI.

---

## The Mental Model: Azure in 60 Seconds

Azure has hundreds of services. You need about six of them. Here's the hierarchy that actually matters:

```
Azure Account (you)
└── Subscription (billing boundary — "who pays")
    └── Resource Group (logical folder — "this project's stuff")
        ├── Container App         ← your code runs here
        ├── Container Registry    ← your Docker images live here
        ├── PostgreSQL            ← your structured data
        ├── Blob Storage          ← your big files (parquets, CSVs)
        ├── OpenAI Service        ← your LLM (GPT-4o, embeddings)
        └── Bot Service           ← Teams bot routing (if needed)
```

That's it. Everything else is supporting infrastructure (logging, monitoring, networking) that Azure either handles automatically or that you add later.

**The vibe coder translation:** A **Subscription** is your credit card. A **Resource Group** is a project folder. **Resources** are the actual things that do stuff. Delete the resource group and everything in it disappears. Simple.

---

## The Six Resources You Actually Need

### 1. Container App — Where Your Code Runs

An Azure Container App is just a Docker container running in the cloud. You push an image, tell Azure the port, and it handles TLS, scaling, health checks, and DNS. It's the simplest way to get a web app or API live.

| What | Details |
|------|---------|
| **What it runs** | Any Docker container — FastAPI, Next.js, Flask, whatever |
| **How you deploy** | Push image to Container Registry → update Container App |
| **Networking** | Public ingress (HTTPS) or private (internal only) |
| **Scaling** | 0 to N replicas. Set min to 0 and it scales to zero when idle. |
| **Cost** | ~$15-30/month for a light app (pay per vCPU-second) |

**Key concept:** Container Apps run inside a **Container Apps Environment**. Think of the environment as the shared networking/logging layer. Multiple apps can share one environment (e.g., your web app + your bot + your API all in one environment). Create the environment once, deploy multiple apps into it.

### 2. Container Registry (ACR) — Where Your Images Live

Azure Container Registry is just a private Docker Hub. You build your image locally, push it to ACR, and your Container App pulls from it.

```bash
# Build locally
docker build -t myregistry.azurecr.io/my-app:latest -f Dockerfile .

# Push to ACR
az acr login --name myregistry
docker push myregistry.azurecr.io/my-app:latest

# Container App pulls it automatically on next revision
```

**SKU:** Basic ($5/month) is fine for most projects. You only need Premium if you're doing geo-replication.

### 3. PostgreSQL Flexible Server — Your Structured Data

Managed PostgreSQL. Azure handles patching, backups, and availability. You get a connection string and write SQL.

| What | Details |
|------|---------|
| **Use for** | User data, CRM records, reference tables, provider rosters, edit history |
| **Access pattern** | Search, filter, paginate, write. Low-latency (<50ms). |
| **Security** | SSL required. Firewall rules control who can connect. |
| **Cost** | ~$13/month for Burstable B1ms (1 vCore, 2GB RAM, 32GB storage) |

**Gotcha:** By default, no one can connect to your PostgreSQL server. You need to add firewall rules — at minimum, your developer IP and "Allow Azure services" (so your Container App can reach it). SSL is required (use `sslmode=require` in your connection string).

### 4. Blob Storage — Your Big Files

For anything too large for PostgreSQL — parquet files, CSVs, PDFs, images. Blob Storage is essentially a file system in the cloud with an API.

| What | Details |
|------|---------|
| **Use for** | Large analytical datasets (parquets), file uploads, static assets |
| **Access pattern** | Read large files, often with DuckDB for analytics. 3-10s per query. |
| **Organization** | Storage Account → Container → Blobs (like: bucket → folder → files) |
| **Cost** | ~$0.02/GB/month. 2GB of parquets costs about $0.04/month. |

**Pro pattern for analytics:** Store parquets sorted by your primary query key (e.g., provider ID). DuckDB reads row group statistics and skips 99%+ of the data when filtering — a 13M row, 369MB file returns results in under a second when querying a single provider.

### 5. Azure OpenAI Service — Your LLM

This is where Azure gets interesting for AI applications. Azure OpenAI gives you the same models (GPT-4o, GPT-4, embeddings) as OpenAI's API, but running inside Azure's infrastructure under your organization's data governance.

#### Why Azure OpenAI Instead of api.openai.com?

- **Data stays in Azure.** Your prompts and completions are processed in Azure's data centers, covered by your enterprise agreements.
- **BAA coverage.** For healthcare: the Azure OpenAI endpoint is covered by Microsoft's Business Associate Agreement. The public OpenAI API is not.
- **Same models.** GPT-4o, GPT-4, text-embedding-ada-002 — identical to OpenAI's offerings.
- **Network control.** You can VNet-integrate the endpoint, restrict access by IP, use managed identities — things you can't do with the public API.

#### Getting Set Up with Azure OpenAI

This is the one resource that requires approval. Azure OpenAI is gated — you submit an application and Microsoft reviews it. For enterprise/healthcare accounts, this is usually approved within a few days.

**Step 1:** Apply for access at `aka.ms/oai/access`. You need your subscription ID and a business justification. Healthcare + internal tooling is almost always approved.

**Step 2:** Create the resource in Azure Portal → Cognitive Services → Azure OpenAI. Pick your region (same as your other resources).

**Step 3:** Deploy a model. Inside the OpenAI resource, go to Model Deployments → Create. Pick GPT-4o (or whatever you need). Give it a deployment name — this is what you reference in your code.

**Step 4:** Get your key and endpoint. Keys & Endpoint section → copy the endpoint URL and one of the two API keys. These go in your Container App's environment variables.

```python
# In your Python code — looks almost identical to the OpenAI SDK
from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],   # https://your-resource.openai.azure.com/
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2024-10-21"
)

response = client.chat.completions.create(
    model="gpt-4o",           # this is your deployment name
    messages=[{"role": "user", "content": "Hello"}]
)
```

**Never use the public `api.openai.com` endpoint in a healthcare or enterprise application.** Data sent to the public API leaves your Azure environment and is not covered by your BAA. Always use your Azure OpenAI endpoint.

### 6. Azure Bot Service — Teams Bot Routing (Optional)

If you're building a Microsoft Teams bot, you need one more piece: Azure Bot Service. This is a thin routing layer — it doesn't run your code. It handles authentication between Teams and your Container App.

```
User sends message in Teams
        │
        ▼
Azure Bot Service        ← routing + auth (thin proxy, no compute)
        │  HTTPS POST /api/messages (Microsoft-signed JWT)
        ▼
Your Container App       ← your actual bot code
        │
        ├──► Azure OpenAI     (LLM reasoning)
        ├──► PostgreSQL        (data queries)
        └──► Blob Storage      (analytics)
```

The Bot Service handles the Microsoft authentication handshake. Your Container App receives clean HTTP POST requests with the user's message and sends responses back. The Bot Framework SDK validates the JWT automatically — you don't need to implement auth yourself.

---

## App Registrations — The Confusing Part, Demystified

This is where most vibe coders get lost. Azure App Registrations are identity objects — they're how Azure knows "who" is talking to "what." They're confusing because they're invisible infrastructure that you rarely interact with directly.

### When Do You Need an App Registration?

| Use Case | Need App Registration? | Why |
|----------|----------------------|-----|
| Container App running a web dashboard | Only if you want login | Entra ID (Azure AD) auth requires an app registration to handle the OAuth flow |
| Teams bot | **Yes — always** | Bot Framework uses it to authenticate messages between Teams and your app |
| Container App calling PostgreSQL | No | Password auth or managed identity — no app registration needed |
| Container App calling Azure OpenAI | No | API key auth — just pass the key in your code |
| User login with Microsoft accounts | Yes | OAuth 2.0 flow needs a registered application to handle tokens |

### For Teams Bots: Let Azure Create It

The biggest pitfall with Teams bots is pre-creating an App Registration manually. Don't. When you create an Azure Bot resource, it auto-creates one for you. Use that one.

**Step 1:** Create Azure Bot resource in the portal

**Step 2:** Azure auto-creates an App Registration — click **"Manage"** next to the greyed-out App ID to find it

**Step 3:** In that App Registration, go to **Certificates & Secrets → New client secret**

**Step 4:** Copy the App ID + secret → these become `MICROSOFT_APP_ID` and `MICROSOFT_APP_PASSWORD` in your Container App

**Single Tenant vs. Multi Tenant:** For internal tools, always use **Single Tenant**. This restricts the bot to your organization's accounts only (e.g., `@yourcompany.org`). Multi-tenant lets anyone's Microsoft account talk to your bot — you almost never want this for business applications.

### For Web App Authentication (Microsoft Login)

If you want users to log into your dashboard with their Microsoft work accounts, you need a separate App Registration for the web app. This is Azure's OAuth implementation — Entra ID (formerly Azure AD).

The registration defines: which users can log in, what permissions the app has, and where users are redirected after login. Once configured, unauthenticated requests to your Container App are automatically redirected to Microsoft's login page.

**Admin consent may be required.** Your Azure AD administrator needs to approve the app registration before users can sign in. This is a one-time action but can be a bottleneck if you don't have admin access yourself.

---

## Security: Protecting Your Application

Security in Azure is layered. Here's what matters at each level:

### Network Layer

| Resource | Default State | What to Do |
|----------|--------------|-----------|
| **PostgreSQL** | Locked down — no one can connect | Add firewall rules: your dev IP + "Allow Azure services" |
| **Blob Storage** | Open to the internet (with account key) | Add firewall rules: your dev IP + "Allow trusted Microsoft services" |
| **Container App** | Public ingress (HTTPS) | Fine for web apps. For internal-only: set to "Limited to Container Apps Environment" |
| **Azure OpenAI** | Available by API key | Add network restrictions if needed. API key is sufficient for most internal tools. |

### Credential Management

**Today: Environment Variables**

Store secrets as environment variables on your Container App. They're encrypted at rest and not visible in logs. Quick to set up.

- `ANALYTICS_PG_PASSWORD`
- `AZURE_STORAGE_KEY`
- `AZURE_OPENAI_API_KEY`
- `MICROSOFT_APP_PASSWORD`

**Better: Azure Key Vault**

Centralized secret management. Container Apps can reference Key Vault secrets directly. Secrets rotate without redeploying. Audit trail for every access.

*Migrate to Key Vault when you move to production or have multiple apps sharing secrets.*

### The Best: Managed Identity (No Secrets At All)

The endgame is eliminating secrets entirely. A **Managed Identity** is an Azure-issued identity for your Container App. Instead of storing a database password, your app says "I am this identity" and Azure checks whether that identity has permission to access the database. No keys, no passwords, no rotation.

```python
# Instead of:
password = os.environ["DB_PASSWORD"]
conn = psycopg.connect(host=server, password=password)

# You use:
from azure.identity import DefaultAzureCredential
credential = DefaultAzureCredential()
token = credential.get_token("https://ossrdbms-aad.database.windows.net/.default")
conn = psycopg.connect(host=server, password=token.token)
```

This requires RBAC role assignments — you grant your Container App's identity specific roles on each resource (e.g., "Storage Blob Data Reader" on Blob Storage, "Azure AI Developer" on OpenAI). More setup upfront, but no secrets to leak or rotate.

### Data Classification

Know what you're storing and where:

| Data Type | Examples | Where It Should Live | Extra Protection |
|-----------|----------|---------------------|------------------|
| **PHI** (Protected Health Info) | MRNs, diagnosis codes, dates of service | PostgreSQL or Blob Storage with strict firewall | BAA required, VNet recommended |
| **PII** (Personally Identifiable) | Provider names, NPIs, emails, phones | PostgreSQL with SSL required | Firewall rules, access logging |
| **Internal** | User edits, app config, audit trails | PostgreSQL | Standard controls |
| **Public** | Reference tables, CPT codes, taxonomies | Anywhere | None required |

---

## The Full Picture: A Real Application

Here's what a complete AI-powered healthcare analytics platform looks like in Azure — this is an actual production architecture, not a theoretical diagram:

```
Resource Group: "my-project"
│
├── Container App Environment
│   ├── Container App: "web-platform"        ← FastAPI dashboard + analytics
│   │   Port 8000, public ingress, Entra auth pending
│   │   Connects to: PostgreSQL + Blob + OpenAI
│   │
│   ├── Container App: "teams-bot"           ← Teams data analyst bot
│   │   Port 3978, public ingress (Teams needs to reach it)
│   │   Connects to: PostgreSQL + Blob + OpenAI
│   │
│   └── Container App: "api-service"         ← REST/MCP API for external tools
│       Port 8080, internal or public
│       Connects to: PostgreSQL + Blob
│
├── Container Registry: "myregistry"         ← all Docker images stored here
│   (Basic SKU, ~$5/mo)
│
├── PostgreSQL Flexible Server               ← structured data
│   ├── providers schema (10 tables) — roster, edits, overrides
│   ├── reference schema (28 tables) — CPT codes, taxonomies, mappings
│   ├── salesforce schema (5 tables) — contacts, activities
│   └── analytics schema (2 tables) — benchmarks, wRVU production
│   (Burstable B1ms, ~$13/mo)
│
├── Blob Storage Account                     ← large analytical files
│   └── analytics/ container
│       ├── profbilling_datamart.parquet    (16.6M rows, 1.3 GB)
│       ├── referrals_curated.parquet      (13.2M rows, 369 MB)
│       └── ambulatoryvisits.parquet       (5.2M rows, 132 MB)
│   (~$0.04/mo for storage)
│
├── Azure OpenAI: "my-openai"               ← GPT-4o for AI features
│   └── Deployment: "gpt-4o"
│
├── Azure Bot Service: "teams-bot"           ← routing for Teams
│   └── App Registration (auto-created, Single Tenant)
│
└── Log Analytics Workspace                  ← container + app logs
```

**Total cost: ~$35-55/month.** A complete AI-powered platform with PostgreSQL, Blob Storage, Container Apps, and Azure OpenAI — for less than a single SaaS seat on most analytics tools.

---

## Deployment Workflow: From Code to Production

The deployment loop for a vibe coder looks like this:

**Step 1: Build locally.** Write your code, test it, iterate fast. Use Docker Compose to run everything on your machine. `docker compose up --build`

**Step 2: Build the image.** `docker build -t myregistry.azurecr.io/my-app:latest .` — always build from the repo root if you need to copy shared files.

**Step 3: Push to ACR.** `az acr login --name myregistry && docker push myregistry.azurecr.io/my-app:latest`

**Step 4: Update the Container App.** `az containerapp update -n my-app -g my-rg --image myregistry.azurecr.io/my-app:latest --revision-suffix v2` — always increment the revision suffix to force a new image pull.

**Pitfall:** If you push a new `:latest` image but don't create a new revision, the Container App keeps running the old code. Always use `--revision-suffix` to force the update.

### For Teams Bots Specifically

```bash
# Build (from repo root — so Dockerfile can COPY shared files)
docker build -t myregistry.azurecr.io/my-bot:latest -f applications/my-bot/Dockerfile .

# Push
docker push myregistry.azurecr.io/my-bot:latest

# Update Container App
az containerapp update -n my-bot -g my-rg \
  --image myregistry.azurecr.io/my-bot:latest \
  --revision-suffix v3

# Package Teams manifest (must be flat — files at root, not in subfolder)
cd applications/my-bot/manifest
zip ../my-bot.zip manifest.json color.png outline.png

# Sideload in Teams: Apps → Manage your apps → Upload a custom app
```

---

## Lessons Learned (The Hard Way)

Real pitfalls from real deployments — save yourself the debugging hours:

| Pitfall | What Happens | Fix |
|---------|--------------|-----|
| Pre-creating an App Registration for a bot | Azure creates a second one; you have orphaned registrations everywhere | Let Azure auto-create when you make the Bot resource. Click "Manage" to find it. |
| Missing `channel_auth_tenant` in bot code | `AADSTS700016` — bot receives messages but can't reply | Always set `channel_auth_tenant` in `BotFrameworkAdapterSettings` for Single Tenant bots |
| Updating with `:latest` tag only | Old code keeps running — no new revision created | Always use `--revision-suffix` on every update |
| Loading large parquets into DuckDB at startup | 3-4GB memory spike, 30+ second cold start | Use `read_parquet()` inline with WHERE filters. DuckDB skips 99% of rows. |
| Teams manifest files in a subfolder inside the zip | "App not found" when sideloading | Zip must contain files at root level, not in a subfolder |
| `validDomains` in manifest with `https://` | Manifest validation error | Bare domain only — no protocol, no path |
| Blob Storage firewall blocking your Container App | DuckDB queries fail with timeout | Enable "Allow trusted Microsoft services" in Blob Storage firewall |
| PostgreSQL SSL not specified in connection string | Connection refused | Always use `sslmode=require` |

---

## The Hybrid Data Pattern: PostgreSQL + Blob + DuckDB

One of the most powerful patterns for data-heavy applications is splitting your data between two backends optimized for different workloads:

**PostgreSQL — Fast, Small, Read/Write**

- Provider rosters, CRM data, user edits
- Search, filter, paginate — <50ms
- Write access (edits, overrides, audit trail)
- ~453K rows, 45 tables

**Blob + DuckDB — Big, Analytical, Read-Only**

- Billing datamarts, referral patterns, visit volumes
- Aggregate, trend, group-by — 3-10s per query
- Read-only (rebuilt by data pipeline)
- ~35M rows, 1.8 GB in parquets

**The trick:** DuckDB reads parquets directly from Blob Storage without loading them into memory. Sort your parquets by the primary query key (provider ID, date, etc.) and DuckDB's row group statistics let it skip almost all the data:

```python
# This reads ~2MB from a 369MB file — not the whole thing
SELECT *
FROM read_parquet('az://analytics/referrals_curated.parquet')
WHERE REF_PROV_ID = '1234567890'
LIMIT 100
```

You get the analytical power of a data warehouse without the cost. PostgreSQL handles the interactive, transactional workload. DuckDB + Blob handles the heavy analytics. Both are accessed from the same Container App.

---

## Local Development: Replicating Azure on Your Machine

You don't need an Azure account to develop. The architecture maps cleanly to local equivalents:

| Azure Resource | Local Equivalent | How |
|----------------|-----------------|-----|
| Container App | Docker Compose | `docker compose up --build` |
| Container Registry | Local image | No push needed — Compose builds locally |
| PostgreSQL Flexible Server | PostgreSQL in Docker | Add a `postgres` service to your Compose file |
| Blob Storage | Local files | Mount a `./data` directory. DuckDB reads local parquets identically. |
| Azure OpenAI | Azure OpenAI (same endpoint) | Use the same API key — it works from anywhere |
| Bot Service | Bot Framework Emulator | Microsoft's free desktop tool for testing bots locally |

```yaml
# docker-compose.yml for local dev
services:
  app:
    build: .
    ports: ["8000:8000"]
    environment:
      - ANALYTICS_PG_SERVER=postgres
      - ANALYTICS_PG_PASSWORD=localdev
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
    volumes:
      - ./data:/data  # local parquets instead of Blob Storage
    depends_on:
      - postgres

  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: localdev
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Develop locally, push to Azure when ready. The code is identical — only the connection strings change (handled by environment variables).

---

## Cost Reality Check

Azure's pricing page is designed to confuse you into thinking everything is expensive. Here's what things actually cost for a small-to-medium AI application:

| Resource | SKU | Monthly Cost |
|----------|-----|--------------|
| Container App (1 app, light usage) | Consumption (0.5 vCPU, 1GB) | ~$15-30 |
| Container App (scaled to zero when idle) | Min replicas = 0 | ~$5-15 |
| PostgreSQL | Burstable B1ms | ~$13 |
| Blob Storage (2GB) | Standard LRS | ~$0.04 |
| Container Registry | Basic | ~$5 |
| Log Analytics | Default retention | ~$2-5 |
| Azure OpenAI (moderate usage) | Pay-per-token | ~$10-50 |
| **Total** | | **~$50-120/month** |

For perspective: a single Tableau Cloud license costs $75/user/month. A Salesforce seat starts at $25/user/month. You can run an entire AI-powered analytics platform for less than what most organizations pay for one user's software subscriptions.

---

## What to Build Next

Once your infrastructure is running, the architecture supports rapid expansion:

| Application | Architecture | Add to Existing Infrastructure |
|-------------|--------------|-------------------------------|
| **Teams Data Analyst Bot** | Container App + Bot Service | Same PostgreSQL, Blob, OpenAI |
| **Web Dashboard** | Container App (React/Next.js) | Same PostgreSQL, Blob |
| **Email Agent** | Local app (DuckDB + Azure OpenAI) | Uses Azure OpenAI endpoint only |
| **MCP Server** | Container App (FastAPI) | Same PostgreSQL, Blob — exposes tools |
| **Specialty Reports** | Container App or scheduled job | Same Blob parquets + OpenAI |

Each new application is just another Container App in the same environment, connecting to the same data. The infrastructure cost barely changes — you're adding compute, not duplicating storage or databases.

---

Azure is simpler than it looks. Six resources, one resource group, and a Docker image. The rest is just configuration. The hard part was never the cloud infrastructure — it's knowing what to build and having the data to power it. Azure is just where it lives.
