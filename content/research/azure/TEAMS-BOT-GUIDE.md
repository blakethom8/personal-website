# Teams Bot Architecture Guide

General reference for building and deploying Microsoft Teams bots in the CSMN Azure infrastructure.
Captures preferred patterns, architecture decisions, and lessons learned.

---

## Preferred Architecture

```
Microsoft Teams (user sends message)
        │
        ▼
Azure Bot Service          — routing + auth layer (thin proxy, no compute)
        │  HTTPS POST /api/messages (Microsoft-signed JWT)
        ▼
Azure Container App        — your bot code (Docker container, public ingress)
        │
        ├──► Azure OpenAI          (LLM reasoning)
        ├──► Azure PostgreSQL       (structured/transactional data)
        ├──► Azure Blob Storage     (large parquet datasets via DuckDB)
        └──► Docs baked into image  (static reference content)
```

The Container App is just a Docker container running your Python app. Azure manages TLS, scaling, and health checks. Your code only needs to handle the `/api/messages` endpoint and make outbound connections to Azure services.

---

## Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Bot framework | `botbuilder-integration-aiohttp` | Lightweight, async, no heavy web framework needed |
| Web server | `aiohttp` | Pairs naturally with botbuilder; minimal overhead |
| LLM | Azure OpenAI (`openai` SDK) | Already provisioned in subscription; GPT-4o |
| Analytics | DuckDB on-demand | No memory spike; predicate pushdown on parquet |
| Container | Docker → ACR → Container Apps | Same pattern as all other CSMN apps |
| Auth | Single Tenant App Registration | Internal-only tool; restricts to @csmns.org |

### Minimal requirements.txt

```
botbuilder-integration-aiohttp>=4.16
openai>=1.30
pydantic>=2.7
python-dotenv>=1.1
```

Add `duckdb>=1.2` and `psycopg[binary]>=3.1` only when the bot needs live data access.

---

## App Registration — Preferred Approach

**Let Azure auto-create the App Registration** when you create the Azure Bot resource.
Do not pre-create one manually — it creates orphaned registrations and confusion.

Flow:
1. Create Azure Bot resource → Azure auto-creates an App Registration
2. Click **Manage** next to the greyed-out App ID to open that registration
3. Create a client secret there
4. Use those values as `MICROSOFT_APP_ID` and `MICROSOFT_APP_PASSWORD`

**Auth type:** Always use `Single Tenant` for internal CSMN tools. This restricts the bot to `@csmns.org` accounts only.

---

## Critical Code Pattern — Single Tenant Auth

For Single Tenant bots, `channel_auth_tenant` **must** be set in `BotFrameworkAdapterSettings`.
Without it, the SDK tries to authenticate against Bot Framework's generic multi-tenant directory
and throws `AADSTS700016`.

```python
from botbuilder.core import BotFrameworkAdapter, BotFrameworkAdapterSettings

_settings = BotFrameworkAdapterSettings(
    app_id=os.environ.get("MICROSOFT_APP_ID", ""),
    app_password=os.environ.get("MICROSOFT_APP_PASSWORD", ""),
    channel_auth_tenant=os.environ.get("MICROSOFT_APP_TENANT_ID", ""),  # required for Single Tenant
)
_adapter = BotFrameworkAdapter(_settings)
```

---

## Minimal app.py Pattern

```python
import os
from aiohttp import web
from botbuilder.core import BotFrameworkAdapter, BotFrameworkAdapterSettings, TurnContext
from botbuilder.schema import Activity, ActivityTypes

_settings = BotFrameworkAdapterSettings(
    app_id=os.environ.get("MICROSOFT_APP_ID", ""),
    app_password=os.environ.get("MICROSOFT_APP_PASSWORD", ""),
    channel_auth_tenant=os.environ.get("MICROSOFT_APP_TENANT_ID", ""),
)
_adapter = BotFrameworkAdapter(_settings)

# In-memory conversation state — keyed by conversation ID
_sessions: dict[str, YourSession] = {}


async def _on_turn(turn_context: TurnContext) -> None:
    if turn_context.activity.type != ActivityTypes.message:
        return

    await turn_context.send_activity(Activity(type=ActivityTypes.typing))

    conv_id = turn_context.activity.conversation.id
    if conv_id not in _sessions:
        _sessions[conv_id] = YourSession()

    response = await _sessions[conv_id].run(turn_context.activity.text)
    await turn_context.send_activity(Activity(type=ActivityTypes.message, text=response))


async def messages(req: web.Request) -> web.Response:
    body = await req.json()
    activity = Activity().deserialize(body)
    auth_header = req.headers.get("Authorization", "")
    response = await _adapter.process_activity(activity, auth_header, _on_turn)
    if response:
        return web.Response(status=response.status, body=response.body)
    return web.Response(status=200)


async def health(req: web.Request) -> web.Response:
    return web.json_response({"status": "ok"})


app = web.Application()
app.router.add_post("/api/messages", messages)
app.router.add_get("/api/health", health)

if __name__ == "__main__":
    web.run_app(app, host="0.0.0.0", port=int(os.environ.get("PORT", 3978)))
```

---

## Dockerfile Pattern

Build context must be the **repo root** (`claude/`) so docs and shared files can be copied in.

```dockerfile
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser && useradd -r -g appuser -d /app appuser
WORKDIR /app

COPY applications/my-bot/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY applications/my-bot/app.py .
COPY applications/my-bot/agent.py .
# Add other source files...

# Bake static docs into the image — no volume mount needed in production
COPY data-management/docs/ /docs/

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3978
ENV DOCS_BASE=/docs

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3978/api/health || exit 1

CMD ["python", "app.py"]
```

Build command (always run from repo root):
```bash
cd C:/Users/ThomsonB/claude

docker build \
  -t csmnbdregistry-h8efe9dnd0a8bfb8.azurecr.io/my-bot:latest \
  -f applications/my-bot/Dockerfile .
```

---

## Container App Settings

| Setting | Value | Why |
|---|---|---|
| **Ingress** | Accept traffic from anywhere | Teams must reach the bot from Microsoft's servers |
| **Target port** | `3978` | Bot Framework default webhook port |
| **Client certificate mode** | Ignore | Teams authenticates via JWT, not mTLS |
| **Min replicas** | 0 | Scale to zero when idle; Teams retries on cold start |
| **CPU / Memory** | 0.5 vCPU / 1Gi | Sufficient for docs-only or light query bots |

Increase memory to 2–4Gi if the bot loads large parquet files at startup.

---

## Data Access Patterns

### Docs only (lightest)
Bake `data-management/docs/` into the image at build time. No runtime connections needed.
Memory footprint: ~200MB. Docs are current as of last image build.

### PostgreSQL queries (add on demand)
Connect to `cedars-analytics-pg.postgres.database.azure.com` using `psycopg`.
Good for: roster lookups, Salesforce data, benchmarks, reference tables.
No memory concern — queries are network calls.

```python
import psycopg, os

def get_pg_conn():
    return psycopg.connect(
        host=os.environ["ANALYTICS_PG_SERVER"],
        dbname=os.environ["ANALYTICS_PG_DATABASE"],
        user=os.environ["ANALYTICS_PG_USERNAME"],
        password=os.environ["ANALYTICS_PG_PASSWORD"],
        sslmode=os.environ.get("ANALYTICS_PG_SSLMODE", "require"),
    )
```

### Parquet / DuckDB queries (on demand, not startup)
Never pre-load large parquets into DuckDB tables at startup.
Use `read_parquet()` inline with tight WHERE filters — DuckDB skips 99%+ of rows.

```python
import duckdb

async def query_parquet(sql: str) -> list:
    # New connection per query — no shared state, no memory accumulation
    db = duckdb.connect()
    return db.execute(sql).fetchall()

# Example — provider-specific query on 13M row file, reads ~2MB not 369MB
sql = """
    SELECT * FROM read_parquet('data-outputs/transformed/referrals_curated.parquet')
    WHERE REF_PROV_ID = '1234567890'
    LIMIT 100
"""
```

Parquets are sorted by provider ID — DuckDB row group statistics enable near-instant filtering.

---

## Conversation State

In-memory dict keyed by `activity.conversation.id` is the right starting point for internal tools.

```python
_sessions: dict[str, AgentSession] = {}

conv_id = turn_context.activity.conversation.id
if conv_id not in _sessions:
    _sessions[conv_id] = AgentSession(system_prompt, store)
session = _sessions[conv_id]
```

**Tradeoffs:**
- Survives within a container instance lifetime
- Cleared on container restart or scale-down (min replicas = 0)
- Fine for a small internal team; add Redis if persistence across restarts is needed

---

## Deployment Commands

```bash
# Login to ACR
az acr login --name csmnbdregistry

# Build (from repo root)
docker build \
  -t csmnbdregistry-h8efe9dnd0a8bfb8.azurecr.io/<bot-name>:latest \
  -f applications/<bot-name>/Dockerfile .

# Push
docker push csmnbdregistry-h8efe9dnd0a8bfb8.azurecr.io/<bot-name>:latest

# First deploy — create Container App
az containerapp create \
  --name <container-app-name> \
  --resource-group csmn-bd \
  --environment managedEnvironment-csmnbdnew-9e04 \
  --image csmnbdregistry-h8efe9dnd0a8bfb8.azurecr.io/<bot-name>:latest \
  --target-port 3978 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 2

# Update — always use --revision-suffix to force new image pull
az containerapp update \
  -n <container-app-name> \
  -g csmn-bd \
  --image csmnbdregistry-h8efe9dnd0a8bfb8.azurecr.io/<bot-name>:latest \
  --revision-suffix v2   # increment each deploy: v2, v3, v4...

# Add Teams channel
az bot msteams create --name <azure-bot-name> --resource-group csmn-bd

# Check logs
az containerapp logs show \
  --name <container-app-name> \
  --resource-group csmn-bd \
  --tail 50
```

---

## Teams Manifest

```
manifest/
  manifest.json    — bot definition
  color.png        — 192×192 full-color icon
  outline.png      — 32×32 outline icon
```

**`validDomains`** is the bare Container App domain — no `https://`, no path:
```json
"validDomains": ["your-app.salmonforest-15dc41cf.centralus.azurecontainerapps.io"]
```

**Packaging on Windows:**
```powershell
cd applications/my-bot/manifest
Compress-Archive -Path manifest.json, color.png, outline.png -DestinationPath ../my-bot.zip -Force
```

**Installing:**
- Personal: Teams → Apps → Manage your apps → Upload a custom app
- Group chat / channel: Chat `+` button → Manage apps → Upload a custom app → Add to chat
- Org-wide: Teams Admin Center → Manage apps → Upload (requires IT admin)

---

## Pitfalls & Lessons Learned

| Pitfall | What Happens | Fix |
|---|---|---|
| Pre-creating an App Registration | Azure creates a second one anyway; you end up with orphaned registrations | Let Azure auto-create; click Manage to reach it |
| Missing `channel_auth_tenant` | `AADSTS700016` — bot receives messages but can't send responses | Always set `channel_auth_tenant` in `BotFrameworkAdapterSettings` for Single Tenant |
| Updating with `:latest` tag only | Old code keeps running — no new revision created | Always add `--revision-suffix` on every update |
| Setting Teams channel via portal | Application Insights API key field blocks saving | Use `az bot msteams create` via CLI |
| Build context in `applications/` | Can't COPY `data-management/docs/` — outside build context | Build from repo root with `-f applications/my-bot/Dockerfile .` |
| `validDomains` with path | Manifest validation error or Teams install failure | Bare domain only — no `https://` prefix, no `/api/messages` path |
| Loading all parquets at startup | 3–4GB memory, slow cold start | Use `read_parquet()` inline at query time with WHERE filters |
| Files in subfolder inside manifest zip | "App not found" when sideloading | Zip must contain files at root, not in a subfolder |

---

## Security Checklist

- [ ] App Registration is Single Tenant — only `@csmns.org` users can interact
- [ ] Ingress is external but only `/api/messages` and `/api/health` are routed
- [ ] Bot Framework SDK validates Microsoft-signed JWT on every request automatically
- [ ] `MICROSOFT_APP_PASSWORD` rotated before 24-month expiry
- [ ] Consider Azure Key Vault references for secrets (no plain-text env vars)
- [ ] User identity logged from `activity.from.aadObjectId` for audit trail

---

## Future Enhancements

- **Managed Identity**: Eliminate all secrets by using a User-Assigned Managed Identity on the Container App. Assign RBAC roles on PostgreSQL, Blob Storage, and OpenAI. No client secret to rotate.
- **Redis session state**: Persist conversation history across container restarts/scale events.
- **OAuth for delegated actions**: If the bot needs to act as the user (e.g. create Salesforce records as the rep), add OAuth via Bot Framework Token Service and `https://token.botframework.com/.auth/web/redirect`.
- **Org-wide publish**: Submit manifest to Teams Admin Center for discovery in "Built for your org" app store.
