# Production Nuances — MN Business Development Platform

Operational notes for things that are easy to miss or get wrong when deploying changes.

---

## PostgreSQL View Changes Require a Migration

The `providers.effective_roster_live` view is defined in `data-management/scripts/setup_postgres.py`
under `PROVIDERS_VIEWS`. It is **not auto-applied** — any time the view definition changes, you must
push the SQL to both local and Azure PostgreSQL manually.

### Applying a view change locally
```bash
cd data-management
uv run python scripts/setup_postgres.py
```
This is idempotent (`CREATE OR REPLACE VIEW`) and safe to re-run.

### Applying a view change to Azure
Connect to the Azure PostgreSQL instance and run the updated `CREATE OR REPLACE VIEW` statement
directly, or re-run `setup_postgres.py` pointed at the Azure server:
```bash
set ANALYTICS_PG_SERVER=cedars-analytics-pg.postgres.database.azure.com
set ANALYTICS_PG_PASSWORD=<prod password>
uv run python scripts/setup_postgres.py
```

---

## Override Pattern: Base Rules → Web Overrides

Several fields in `effective_roster_live` follow a two-layer pattern:

```
ETL-derived or source value  →  Web override (providers.edits table)  →  Effective value
```

Fields using this pattern: `specialty_group`, `service_line`, `business_entity`,
`geographic_region`, `provider_type`, `provider_name`, `department`, `term_yn`, `date_of_hire`, `entity_group`.

**`entity_group` specifically** is first derived from `business_entity` via the standard CASE mapping
(CSMG/SMOG/etc. → CSMN-Focused, Outreach/CSMC → CSMC, etc.), and then a direct `entity_group`
override can be stored in `providers.edits` to reclassify a provider for BD purposes without
changing their underlying `business_entity`. The override wins.

This is useful when a provider is organizationally in the CSMC bucket but should appear in
CSMN-Focused for physician liaison workflows.

---

## Publish vs. Live View

Changes saved in the app write to `providers.edits` and are immediately visible via
`effective_roster_live` (the live view). The "Publish" action in the app re-runs
`build_roster_db.py`, which materializes all active overrides into the `roster_effective` parquet
and DuckDB files used by downstream analytics (billing, referrals, ambulatory queries). If you
save edits but don't publish, the app reflects them but parquet-based analytics do not.

---

## `salesforce.provider_tags` — Auto-Created at App Startup

The `salesforce.provider_tags` table is created at startup by the FastAPI lifespan function:

```python
CREATE TABLE IF NOT EXISTS salesforce.provider_tags (
    id SERIAL PRIMARY KEY,
    npi VARCHAR NOT NULL,
    tag_name VARCHAR NOT NULL,
    created_by VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(npi, tag_name)
)
```

This means:
- **Local dev**: The table is created automatically on first run. No manual migration needed.
- **Azure**: Same — first container start creates it. Safe to re-run (`IF NOT EXISTS`).
- **If the `salesforce` schema doesn't exist**, the `CREATE TABLE` silently fails (caught by a
  bare `except`). The app still starts, but tags features return empty results. Fix by running
  `setup_postgres.py` to ensure the schema exists first.

---

## Map View — Trilliant SOS Data Dependency

The My Reps **Map** tab (`/api/mn-referrals/reps/{name}/map-data`) reads
`trilliant_provider_sos.parquet` for practice location lat/lon. This file must be present at:

```
data-management/data-outputs/transformed/trilliant_provider_sos.parquet
```

Or in Azure Blob Storage at `az://{container}/trilliant_provider_sos.parquet` when
`AZURE_STORAGE_ACCOUNT` / `AZURE_STORAGE_KEY` are configured.

**Coverage note**: Not all providers in a rep's Salesforce portfolio will have Trilliant SOS
records. The endpoint returns `total_providers` and `mapped_providers` counts so the UI can
show coverage. Providers with no Trilliant record (very new, or not in the LA County all-payer
claims) simply don't appear as map dots — this is expected behavior, not an error.

**Error handling**: If the SOS parquet is missing or the query fails, the endpoint returns
`{"sites": [], "error": "<message>", ...}` and the map stat bar displays the error. The rest
of the app (Lookup, My Reps table) is unaffected.

---

## Map View — Leaflet CDN Dependency

The map view uses **Leaflet 1.9.4** loaded from the unpkg CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

This is loaded in the `<head>` of `static/index.html`. If the environment has no outbound
internet access (e.g., locked-down Azure Container), Leaflet must be served locally. To do so:

1. Download `leaflet.css` and `leaflet.js` from https://leafletjs.com/download.html
2. Place both files in `applications/mn-bd-platform/static/`
3. Update the `<link>` and `<script>` tags to point to `/static/leaflet.css` and `/static/leaflet.js`

Tile imagery uses CartoDB's public tile server (`basemaps.cartocdn.com/light_all`), which also
requires internet access. No API key is required for moderate usage.

---

## Salesforce Activity Indicator — Data Freshness

The blue SF dot in the Lookup table indicates `salesforce.contacts.last_activity_date IS NOT NULL`
for that provider's NPI. This date is populated during the Salesforce data sync. It reflects the
most recent logged visit or activity at the contact record level.

If a rep has visited a provider recently but the SF sync hasn't run, the dot won't appear yet.
Freshness depends on the Salesforce → PostgreSQL ETL cadence (currently manual/scheduled sync).

---

## Entity Group Reclassification — BD Use Case

`entity_group` is editable via the CRUD panel specifically because the BD team's view of provider
alignment doesn't always match the finance/operational org chart. For example:

- A hospitalist technically in the `CSMC` bucket may be a strong referral partner and should
  appear in **CSMN-Focused** for liaison workflow prioritization.
- The override lives in `providers.edits` and doesn't change `business_entity` — the underlying
  organizational classification is preserved.

The map view also uses `entity_group` for dot colors, so reclassifications are reflected there too.
Publish the change for it to propagate to parquet-based downstream analytics.
