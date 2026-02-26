# Azure Infrastructure — Medical Network Business Development Analytics

## Overview

This document describes the Azure infrastructure supporting the Business Development analytics platform. The system provides a web-based **MN Business Development Platform** application (CRM + analytics) backed by a hybrid data architecture: PostgreSQL for transactional/reference data, Azure Blob Storage for large analytical datasets, and Azure Container Apps for hosting.

**Subscription:** Cedars-Sinai : Medical Network Business Development
**Resource Group:** `csmn-bd`
**Region:** Central US
**Owner:** Blake Thomson (Blake.Thomson@csmns.org)
**Date:** February 2026

---

## Architecture Diagram

```
                          ┌─────────────────────────┐
                          │     End Users            │
                          │  (@csmns.org accounts)   │
                          └───────────┬──────────────┘
                                      │ HTTPS
                                      ▼
                          ┌───────────────────────────────────────┐
                          │  Azure Container App                  │
                          │  "mn-bd-platform"                     │
                          │                                       │
                          │  FastAPI web application               │
                          │  Image: csmnbdregistry/mn-bd-platform  │
                          │  Port: 8000                           │
                          │  Auth: Microsoft Entra (pending)      │
                          │                                       │
                          │  No data stored — compute only        │
                          └──────────┬──────────┬─────────────────┘
                                     │          │
                          SQL (5432) │          │ HTTPS (443)
                          SSL req'd  │          │ Account Key
                                     ▼          ▼
              ┌──────────────────────────┐  ┌──────────────────────────┐
              │  Azure PostgreSQL        │  │  Azure Blob Storage      │
              │  "cedars-analytics-pg"   │  │  "csmnbdanalytics"       │
              │                          │  │                          │
              │  Flexible Server v16.11  │  │  Container: analytics/   │
              │  1 vCore, 2 GB RAM       │  │                          │
              │  32 GB storage           │  │  profbilling_datamart    │
              │                          │  │    .parquet (1.3 GB)     │
              │  Schemas:                │  │  referrals_curated       │
              │    providers (10 tables) │  │    .parquet (369 MB)     │
              │    reference (28 tables) │  │  ambulatoryvisits_       │
              │    salesforce (5 tables) │  │    datamart.parquet      │
              │    analytics (2 tables)  │  │    (132 MB)              │
              │                          │  │                          │
              │  Total: 45 tables        │  │  Total: ~1.8 GB          │
              │  ~453K rows              │  │  ~35M rows               │
              └──────────────────────────┘  └──────────────────────────┘
```

---

## Azure Resources

### Core Application Resources

| Resource | Type | Name | Purpose |
|---|---|---|---|
| **Container App** | Microsoft.App/containerApps | `mn-bd-platform` | Runs the web application |
| **Container Environment** | Microsoft.App/managedEnvironments | `managedEnvironment-csmnbdnew-9e04` | Hosting environment for container apps |
| **Container Registry** | Microsoft.ContainerRegistry/registries | `csmnbdregistry` | Stores Docker images (Basic SKU) |
| **PostgreSQL** | Microsoft.DBforPostgreSQL/flexibleServers | `cedars-analytics-pg` | Primary database — roster, edits, Salesforce, reference data, benchmarks |
| **Blob Storage** | Microsoft.Storage/storageAccounts | `csmnbdanalytics` | Large analytical parquet files (billing, referrals, ambulatory visits) |

### Supporting Resources

| Resource | Type | Name | Purpose |
|---|---|---|---|
| **Log Analytics** | Microsoft.OperationalInsights/workspaces | `workspacecsmnbd921f`, `workspacecsmnbdb83f` | Container and application logging |
| **Metric Alert** | Microsoft.Insights/metricalerts | `csmnbdanalytics-AvailabilityAlert` | Storage availability monitoring |
| **OpenAI** | Microsoft.CognitiveServices/accounts | `CSMN-BD-OpenAI` | GPT-4o for future LLM features (pre-existing) |

### Pre-existing Resources (not part of this deployment)

| Resource | Type | Name | Notes |
|---|---|---|---|
| **PostgreSQL** | Microsoft.DBforPostgreSQL/flexibleServers | `salesforce-sanic-postgres-db` | Legacy Salesforce sync app database |
| **App Service Plan** | Microsoft.Web/serverFarms | `ASP-csmnbd-a5c7` | Legacy web app hosting |
| **Web App** | Microsoft.Web/sites | `bd-analytics` | Legacy analytics web app |

---

## Data Architecture

### Why Hybrid? (PostgreSQL + Blob Storage)

The platform uses two data backends optimized for different workloads:

| Backend | PostgreSQL | Azure Blob + DuckDB |
|---|---|---|
| **Data size** | ~453K rows (small) | ~35M rows (large) |
| **Access pattern** | Search, filter, paginate, write edits | Aggregate, trend, group-by analytics |
| **Latency** | <50ms per query | 3-10s per query (network I/O) |
| **Write access** | Yes (edits, overrides) | Read-only |
| **Examples** | Provider search, edit history, Salesforce contacts | Monthly visit trends, surgical case volumes, referral patterns |

### PostgreSQL Schema

**`providers` schema** — Provider roster and overrides
- `roster_effective` — 120,817 unified providers (primary reference)
- `roster_benchmark`, `roster_hospital`, `roster_contracting`, `roster_epic` — source roster tables
- `override_specialty`, `override_geography` — ETL-managed overrides
- `edits` — web app user overrides (audit trail)
- `publish_log` — publish event history
- `effective_roster_live` — **VIEW** that applies active edits on top of roster_effective in real-time

**`reference` schema** — 28 mapping/reference tables
- CPT code taxonomies (Trilliant, Advisory Board, specialty-specific)
- Department, geography, place-of-service mappings
- DRG classifications, specialty rollups

**`salesforce` schema** — CRM data
- `contacts` — 1,360 provider contacts with NPI linkage
- `activities` — 2,467 outreach activities
- `task_who_relations` — activity-to-contact linkage
- `users` — 30 Salesforce reps
- `accounts` — 463 accounts

**`analytics` schema** — Benchmark and production data
- `benchmark_report` — 1,281 providers with MGMA P50/P75 targets
- `wrvu_monthly` — 54,396 monthly wRVU production records

### Azure Blob Storage Contents

Container: `analytics/`

| File | Rows | Size | Sort Key | Description |
|---|---|---|---|---|
| `profbilling_datamart.parquet` | 16.6M | 1.3 GB | BILLPROV_ID | FY24-FY26 professional billing (CPT-level) |
| `referrals_curated.parquet` | 13.2M | 369 MB | REF_PROV_ID | FY25-FY26 referrals with dept/roster enrichment |
| `ambulatoryvisits_datamart.parquet` | 5.2M | 132 MB | VISIT_PROV_ID | FY24-FY27 ambulatory visits |

Files are sorted by provider ID for optimal query performance — DuckDB uses row group statistics to skip 99%+ of data when filtering by provider.

---

## Security Configuration

### Network Security

| Resource | Access Control | Details |
|---|---|---|
| **PostgreSQL** | Firewall rules | Developer IP + "Allow Azure services" enabled. SSL required (sslmode=require). |
| **Blob Storage** | Firewall rules | Developer IP + "Allow trusted Microsoft services" enabled. TLS 1.2 minimum. Shared key access enabled (required by DuckDB). |
| **Container Registry** | Admin user | Basic SKU. Admin credentials used for image pull (managed identity not available due to RBAC constraints). |
| **Container App** | Ingress setting | Currently set to "Limited to Container Apps Environment" (no public access). |

### Authentication (Pending Admin Approval)

Microsoft Entra ID (Azure AD) authentication has been configured on the Container App but requires **admin consent** to activate. Once approved:

- Users authenticate with `@csmns.org` Microsoft accounts
- Unauthenticated requests are redirected to Microsoft login
- Access can be restricted to specific users via Enterprise Application user assignment

**Action required:** Azure AD administrator must approve the app registration created for `mn-bd-platform`.

### Data Sensitivity

| Data Element | Classification | Location |
|---|---|---|
| Provider names, NPIs | PII | PostgreSQL (`providers` schema) |
| Medical Record Numbers (MRN) | PHI | Blob Storage (billing, referrals, ambulatory parquets) |
| Contact Sequence Numbers (CSN) | PHI | Blob Storage (ambulatory parquet) |
| Dates of service | PHI | Blob Storage (all parquets) |
| Diagnosis codes | PHI | Blob Storage (referrals parquet) |
| Salesforce contacts (email, phone) | PII | PostgreSQL (`salesforce` schema) |
| Provider edits, notes | Internal | PostgreSQL (`providers.edits`) |

### Credential Management

Application credentials are passed to the Container App as **environment variables** (not stored on disk or in code):

| Variable | Purpose | Stored In |
|---|---|---|
| `ANALYTICS_PG_SERVER` | PostgreSQL hostname | Container App env vars |
| `ANALYTICS_PG_PASSWORD` | PostgreSQL password | Container App env vars |
| `AZURE_STORAGE_ACCOUNT` | Blob storage account name | Container App env vars |
| `AZURE_STORAGE_KEY` | Blob storage access key | Container App env vars |

**Recommendation:** Migrate secrets to **Azure Key Vault** for production use. Container Apps support Key Vault references in environment variables.

---

## Deployment Process

### Image Build & Push

```bash
# From applications/ directory
docker build -t csmnbdregistry-h8efe9dnd0a8bfb8.azurecr.io/mn-bd-platform:latest \
  -f mn-bd-platform/Dockerfile .

# Login and push
docker login csmnbdregistry-h8efe9dnd0a8bfb8.azurecr.io -u csmnbdregistry
docker push csmnbdregistry-h8efe9dnd0a8bfb8.azurecr.io/mn-bd-platform:latest
```

### Data Pipeline

```bash
cd data-management/

# Refresh PostgreSQL data (idempotent, safe to re-run)
uv run python scripts/setup_postgres.py    # schema + migrations
uv run python scripts/load_postgres.py     # truncate + reload all tables

# Refresh Blob parquets (manual upload via Azure Portal)
# 1. Rebuild datamarts locally (build_profbilling_datamart.py, etc.)
# 2. Sort by provider ID (scripts/sort_parquets.py)
# 3. Upload to Blob analytics/ container
```

### Container App Update

After pushing a new image, update the Container App to pull it:
- **Azure Portal:** Container App > Revisions > Create new revision
- **CLI:** `az containerapp update -n mn-bd-platform -g csmn-bd --image csmnbdregistry-h8efe9dnd0a8bfb8.azurecr.io/mn-bd-platform:latest`

---

## Cost Estimates

| Resource | SKU | Estimated Monthly Cost |
|---|---|---|
| PostgreSQL Flexible Server | Burstable B1ms (1 vCore, 2GB) | ~$13 |
| Blob Storage (Standard LRS) | ~1.8 GB stored | ~$0.05 |
| Container Registry | Basic | ~$5 |
| Container App | Consumption (1 vCPU, 2GB) | ~$15-30 (pay-per-use) |
| Log Analytics | Default retention | ~$2-5 |
| **Total** | | **~$35-55/month** |

---

## Recommended Next Steps

### Immediate (Admin Support Required)

1. **Approve Microsoft Entra authentication** — Admin consent for the mn-bd-platform app registration
2. **Restrict user access** — After auth is approved, assign specific users in Enterprise Application settings

### Short-Term Improvements

3. **Migrate secrets to Azure Key Vault** — Move PG password and storage key out of plain env vars
4. **Enable diagnostic logging** — Container App and PostgreSQL diagnostic settings to Log Analytics
5. **Set up backup** — PostgreSQL automated backups (may already be enabled by default)
6. **VNet integration** — Place Container App and PostgreSQL in a shared VNet with private endpoints (eliminates public endpoints)

### Future Applications

The shared infrastructure (`shared/config.py`, `shared/db.py`, PostgreSQL, Blob Storage) is designed to support additional containerized applications:

- **Market Overview** — Specialty-specific Trilliant analysis dashboards
- **CPT Categorizer** — Procedure code classification tool
- **CT Surgery Reports** — Surgical case reporting

Each app would follow the same pattern: own Dockerfile, own Container App, same PostgreSQL + Blob backend.

---

## Support & Contact

- **Application Owner:** Blake Thomson (Blake.Thomson@csmns.org)
- **Source Code:** `\\<repo-path>\claude\applications\`
- **Documentation:** `\\<repo-path>\claude\applications\AZURE-INFRASTRUCTURE.md`
