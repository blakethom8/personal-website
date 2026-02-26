# Agent-to-Agent Interactions & File Access in Microsoft Teams

## The Problem

You have a **Data Catalog Analyst bot** in Teams that answers questions, generates reports, and understands your business rules. But business rules change. Data sources get added. KPI definitions evolve.

**Who updates the bot's brain?** Not developers pushing code. Business users. Other agents. Through Teams.

This is really two problems:
1. **How does a Teams bot read/write local or cloud files?** (config, docs, business rules)
2. **How do multiple agents coordinate?** (one configures, one serves)

## Problem Space: Why This Matters

In Blake's bespoke AI model, the **Agent Data Catalog** is the foundational product — a structured knowledge repo of business rules, data sources, KPIs, and domain context. It's the "brain" that powers everything else (bots, dashboards, apps).

But a brain that can't learn is just a snapshot. The catalog needs to be **living** — updated by domain experts, not developers. And if you have multiple bots (reporting bot, roster bot, market intel bot), they all read from this shared catalog. So the question becomes: **how do you build a shared, editable knowledge layer that Teams bots can both read from and write to?**

## Pattern 1: Shared Storage Layer (The Simple Answer)

The most straightforward pattern. All agents read/write to a common storage backend.

```
┌─────────────────┐     ┌─────────────────┐
│  Catalog Admin   │     │  Analyst Bot     │
│  Bot (Teams)     │     │  (Teams)         │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
    ┌─────────────────────────────────┐
    │   Azure Blob Storage / CosmosDB │
    │   (config.json, rules.yaml,     │
    │    kpi_definitions.md, etc.)    │
    └─────────────────────────────────┘
```

**How it works:**
- **Admin Bot** accepts commands like "Add KPI: readmission rate = readmissions / discharges within 30 days"
- Admin Bot writes updated config to Azure Blob Storage or CosmosDB
- **Analyst Bot** reads config on each query (or watches for changes via Event Grid)
- Both bots are separate Azure Container Apps, same storage account

**Pros:** Simple, proven, no inter-bot communication needed
**Cons:** No coordination — analyst bot might read mid-write; no validation layer

**Implementation:**
```python
# Admin bot handler
@bot.command("add_kpi")
async def add_kpi(context, name: str, formula: str, description: str):
    catalog = await blob_client.download("catalog/kpis.json")
    kpis = json.loads(catalog)
    kpis[name] = {"formula": formula, "description": description, "updated_by": context.user, "updated_at": datetime.now().isoformat()}
    await blob_client.upload("catalog/kpis.json", json.dumps(kpis))
    # Notify analyst bot via Event Grid or Service Bus
    await event_grid.publish({"type": "catalog.updated", "subject": f"kpi/{name}"})
    return f"✅ KPI '{name}' added to catalog"

# Analyst bot — watches for updates
@event_handler("catalog.updated")
async def on_catalog_update(event):
    await reload_catalog()  # Re-read from blob storage
```

## Pattern 2: MCP as the Coordination Layer

This is where it gets interesting. Instead of bots talking to each other, they both connect to an **MCP server** that manages the catalog.

```
┌─────────────────┐     ┌─────────────────┐
│  Admin Bot       │     │  Analyst Bot     │
│  (Teams)         │     │  (Teams)         │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
    ┌─────────────────────────────────┐
    │   MCP Server (Catalog Service)  │
    │                                 │
    │   Tools:                        │
    │   - catalog/add_kpi             │
    │   - catalog/update_source       │
    │   - catalog/query_rules         │
    │   - catalog/list_sources        │
    │   - catalog/validate_formula    │
    └────────────────┬────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Azure Storage   │
            │  (the actual     │
            │   catalog data)  │
            └─────────────────┘
```

**Why MCP here?**
- The catalog becomes a **tool provider**, not just a file dump
- Admin bot gets write tools (`catalog/add_kpi`, `catalog/update_source`)
- Analyst bot gets read tools (`catalog/query_rules`, `catalog/get_kpi_definition`)
- MCP server handles validation, versioning, conflict resolution
- **Different bots get different tool sets** — this is the key insight

**The "selective MCP" idea Blake mentioned:**
- Analyst bot: MCP connected (reads catalog, queries data, generates reports)
- Admin bot: MCP connected (writes catalog, updates configs)
- Simple notification bot: No MCP needed (just forwards alerts)

This maps perfectly to the bespoke model — not every bot needs every capability.

## Pattern 3: Agent-to-Agent via Service Bus (True Multi-Agent)

For more complex coordination where agents need to negotiate or chain work.

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Admin Bot│    │ Analyst  │    │ Roster   │
│          │    │ Bot      │    │ Bot      │
└────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │
     ▼               ▼               ▼
┌─────────────────────────────────────────┐
│        Azure Service Bus / Event Grid    │
│                                          │
│  Topics:                                 │
│  - catalog.updated (admin → all)         │
│  - query.complex (analyst → admin)       │
│  - config.validated (admin → analyst)    │
└──────────────────────────────────────────┘
```

**Use case:** Admin bot updates a KPI definition → publishes event → Analyst bot invalidates its cache and re-runs any saved reports that used that KPI → notifies the user who requested the report.

**When you need this:** Multiple bots reacting to changes, audit trails, complex workflows (approval chains for config changes).

**When you don't:** If it's just "update config, bot reads config" — Pattern 1 is fine.

## Pattern 4: Git-as-Config (The Developer-Friendly Approach)

The catalog lives in a Git repo. Bots interact with it via Git operations.

```
Admin Bot → commits changes to config repo
                    ↓
            GitHub Actions / Azure DevOps
                    ↓
            Validates + deploys updated config
                    ↓
            Analyst Bot picks up new config (container restart or hot-reload)
```

**Why this is interesting:**
- **Version history for free** — who changed what KPI when
- **PR-based approval** — admin bot creates PR, human approves, config deploys
- **Rollback** — bad config? Revert the commit
- **Familiar workflow** for developers

**The Teams UX:**
```
User: @admin-bot update KPI "readmission rate" formula to include 60-day window
Admin Bot: I'll create a change request for that. Here's what will change:
           - readmission_rate.window: 30 days → 60 days
           [Approve] [Modify] [Cancel]
User: [Approve]
Admin Bot: ✅ Change submitted. PR #47 created. Analyst bot will update once approved.
```

## Pattern 5: Shared Context Store with MCP (The Hybrid)

This is probably the most practical for Blake's use case. Combines Patterns 1 and 2.

```
┌─────────────────────────────────────────────┐
│              Azure Container App             │
│                                              │
│  ┌─────────────┐    ┌─────────────────────┐ │
│  │ Teams Bot    │    │ MCP Server          │ │
│  │ (Bot Frmwk)  │───▶│                     │ │
│  │              │    │ Tools:              │ │
│  │ Handles chat │    │ - read_catalog()    │ │
│  │ + adaptive   │    │ - write_catalog()   │ │
│  │   cards      │    │ - query_data()      │ │
│  └──────────────┘    │ - run_report()      │ │
│                      │ - update_config()   │ │
│                      └─────────┬───────────┘ │
│                                │              │
│                      ┌─────────▼───────────┐ │
│                      │ Local File System    │ │
│                      │ /app/catalog/        │ │
│                      │ /app/config/         │ │
│                      │ /app/reports/        │ │
│                      └─────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Key insight:** In Azure Container Apps, your bot IS a container. It HAS a filesystem. The MCP server runs as a sidecar or in-process, and it reads/writes files in the container's mounted volume.

**For persistent storage across restarts:**
- Mount an Azure Files share to the container (`/app/catalog/`)
- Multiple containers can mount the same share
- Files are just... files. YAML, JSON, Markdown, whatever.

**This is the bespoke model in action:**
- Each client gets their own container with their own mounted catalog
- The MCP server exposes catalog operations as tools
- The LLM (Claude/GPT) uses those tools to answer questions
- Admin users update the catalog through the same bot (role-based tool access)

## The "One Bot, Two Roles" Simplification

Blake's instinct was right — this might not need to be agent-to-agent at all. Consider:

**One bot with role-based capabilities:**
```
@data-catalog-bot help

📊 Analyst Commands (all users):
- Ask any question about our data
- "Show me readmission rates by department"
- "What data sources do we have for cardiac?"

⚙️ Admin Commands (admins only):
- "Add KPI: [name] = [formula]"
- "Update data source: [name] with [connection]"
- "Add business rule: [description]"
- "Show catalog changelog"
```

The LLM handles both roles. It just gets different MCP tools based on the user's role:
- **Regular user → read-only tools** (query_catalog, run_report, search_data)
- **Admin user → read+write tools** (above + update_catalog, add_kpi, modify_source)

This is simpler, cheaper, and easier to deploy. One container, one bot registration, role-based tool selection.

## When You Actually Need Agent-to-Agent

True multi-agent is warranted when:
1. **Different LLM needs** — analyst bot needs GPT-4o for complex reasoning, notification bot needs GPT-4o-mini for cost
2. **Different data access** — one bot sees PHI, another doesn't (compliance boundary)
3. **Different availability** — analytics bot might be processing a long report; admin bot should still respond
4. **Scale independently** — analytics bot gets 100x more traffic than admin bot
5. **Different update cycles** — update analytics logic without touching admin functionality

For most healthcare clients starting out? Single bot, role-based tools, shared storage. Graduate to multi-agent when complexity demands it.

## File Access Patterns for Teams Bots

### Reading Local Files
Teams bots in Azure Container Apps can read files from:
1. **Container filesystem** — ephemeral, lost on restart
2. **Azure Files mount** — persistent, shared across instances
3. **Azure Blob Storage** — via SDK, best for large/binary files
4. **CosmosDB** — for structured config that needs querying

### Writing Local Files (The Catalog Update Flow)
```python
# In your bot's MCP server
@mcp.tool("catalog/update_kpi")
async def update_kpi(name: str, formula: str, description: str, user: str):
    catalog_path = Path("/app/catalog/kpis.yaml")
    catalog = yaml.safe_load(catalog_path.read_text())
    
    # Update
    catalog["kpis"][name] = {
        "formula": formula,
        "description": description,
        "updated_by": user,
        "updated_at": datetime.now().isoformat()
    }
    
    # Write back
    catalog_path.write_text(yaml.dump(catalog))
    
    # Log the change
    changelog = Path("/app/catalog/changelog.md")
    changelog.write_text(
        changelog.read_text() + 
        f"\n- {datetime.now()}: {user} updated KPI '{name}'"
    )
    
    return f"Updated KPI '{name}'"
```

### The Azure Files Mount (Practical Setup)
```yaml
# Container App definition
properties:
  template:
    containers:
      - name: data-catalog-bot
        image: myregistry.azurecr.io/catalog-bot:latest
        volumeMounts:
          - volumeName: catalog-storage
            mountPath: /app/catalog
    volumes:
      - name: catalog-storage
        storageType: AzureFile
        storageName: catalogshare
```

Now your bot reads/writes `/app/catalog/` and it persists across container restarts, scales across replicas, and can be mounted by other containers (multi-agent scenario).

## Blog Post Angle

**Title ideas:**
- "Your AI Bot Needs a Filing Cabinet: Local File Access in Teams Agents"
- "Agent-to-Agent in Teams: When You Need It and When You Don't"
- "The Living Catalog: How Teams Bots Update Their Own Brain"

**Key narrative:**
1. Start with the problem — static bots with hardcoded knowledge are useless in healthcare (rules change constantly)
2. Show the naive solution (redeploy on every change) and why it fails
3. Introduce the catalog-as-files pattern with Azure Files
4. Show MCP as the clean abstraction layer
5. Discuss when to go multi-agent vs. single-bot-multi-role
6. Connect to the bespoke deployment model (each client's catalog is THEIR data, in THEIR tenant)

**The punchline:** The most powerful pattern isn't agent-to-agent communication — it's giving agents a shared, structured filesystem that business users can update through natural language. The "agent-to-agent" problem dissolves when you realize it's really a "shared state" problem.
