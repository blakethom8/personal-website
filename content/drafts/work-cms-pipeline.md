---
title: "CMS Healthcare Data Pipeline: 90M Rows of Provider Intelligence"
type: work
date: "2026-02-26"
tags: ["work", "healthcare", "data-engineering", "duckdb"]
status: "active"
server: "5.78.148.70 (Hetzner)"
excerpt: "A data pipeline that ingests 10 CMS public datasets, enriches them with Google Places + LLM web intelligence, and makes 90 million rows of provider data queryable in milliseconds."
featured: true
---

# CMS Healthcare Data Pipeline: 90M Rows of Provider Intelligence

**Turn public Medicare data into competitive intelligence.**

---

## The Insight

The Centers for Medicare & Medicaid Services (CMS) publishes over 100 public datasets. Most are state-level aggregates or cost reports. But buried in there are 10 NPI-level datasets — individual provider records showing exactly:

- Who bills Medicare (1.2M providers)
- What procedures they perform (10M rows by HCPCS code)
- What they prescribe (25M rows by drug name)
- How much they charge and get paid
- Their quality scores (MIPS)
- Their hospital affiliations
- Their prescribing patterns

This data is **free, public, and updated quarterly.** But almost nobody uses it because:
1. It's 10 separate datasets across different URLs
2. The schemas are cryptic (`rndrng_npi`, `tot_srvcs`, what?)
3. There's no join key documentation
4. You need PostGIS + DuckDB + spatial queries to make it useful

I built a pipeline that handles all of this — download, transform, enrich, and serve — automatically.

---

## The Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     CMS DATA SOURCES                         │
│  (10 datasets, bulk CSV downloads from data.cms.gov)         │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│               INGESTION (Python + DuckDB)                    │
│                                                              │
│  • Download CSVs (6-8GB total)                               │
│  • Load into DuckDB (`raw_*` tables)                         │
│  • No pandas (memory stays under 2GB)                        │
│  • Duration: ~25 minutes                                     │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│            TRANSFORMATION (SQL + Python)                     │
│                                                              │
│  Layer 1: Provider Backbone                                  │
│    • Join utilization + Part D + DME on NPI                  │
│    • Filter to Type 1 (individuals)                          │
│    • Build unified provider profile                          │
│                                                              │
│  Layer 2: Entity Resolution                                  │
│    • Match NPI → group practice (reassignment data)          │
│    • Match group → hospital (fuzzy name + state)             │
│    • Confidence scoring (high/medium/low)                    │
│                                                              │
│  Layer 3: Quality + Ordering Eligibility                     │
│    • MIPS scores → quality_opportunity metric                │
│    • Enrollment status, multiple NPI flags                   │
│    • Ordering flags (Part B, DME, HHA, Hospice)              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│          ENRICHMENT (External APIs + LLM)                    │
│                                                              │
│  Layer 1: Google Places (consumer intelligence)              │
│    • Match NPI → Google Place ID                             │
│    • Add: rating, reviews, hours, photos, phone              │
│    • Match rate: 38% → 62% (with LLM)                        │
│                                                              │
│  Layer 2: Web Intelligence (LLM extraction)                  │
│    • Scrape provider websites                                │
│    • Extract: insurance, languages, affiliations             │
│    • Confidence scoring (0-1)                                │
│                                                              │
│  Layer 3: Composite Targeting Score                          │
│    • 40% claims volume percentile                            │
│    • 25% payment volume percentile                           │
│    • 15% beneficiary reach percentile                        │
│    • 10% prescribing volume percentile                       │
│    • 10% quality opportunity (1 - MIPS score)                │
│    • Within-specialty ranking (0-100)                        │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                API LAYER (FastAPI + DuckDB)                  │
│                                                              │
│  Endpoints:                                                  │
│    GET /providers/search                                     │
│    GET /providers/{npi}                                      │
│    GET /providers/{npi}/match                                │
│    POST /match/google-place                                  │
│    GET /stats                                                │
│                                                              │
│  Dashboard: http://5.78.148.70:8080/                         │
└──────────────────────────────────────────────────────────────┘
```

---

## The 10 Datasets

All from the [CMS Public Data Catalog](https://data.cms.gov/provider-data):

| Dataset | Rows | What It Contains |
|---------|------|------------------|
| **Medicare Physician & Other Practitioners** | 1.2M | Backbone: identity, location, volume, patient demographics, chronic conditions |
| **By Provider & Service** | 10.2M | HCPCS procedure-level breakdown (office vs facility) |
| **Part D Prescribers** | 1.6M | Total Rx claims, cost, brand vs generic ratio |
| **Part D By Provider & Drug** | 25M | Individual drug prescribing (e.g., who prescribes Eliquis) |
| **Revalidation Reassignment** | 350K | Individual NPI → group practice mapping |
| **Hospital Enrollments** | 8K | Hospital NPI, CCN, name, address, subgroups |
| **Quality Payment Program (MIPS)** | 541K | Quality scores, payment adjustments, practice metadata |
| **Provider Enrollment (PECOS)** | 8.3M | Enrollment status, multiple NPI flags |
| **DME By Referring Provider** | 800K | DME referral volume, suppliers, payments |
| **Order & Referring Eligibility** | 6M | Ordering flags (Part B, DME, HHA, Hospice) |

**Total:** ~46M rows before transformation, ~90M after joins  
**Storage:** 5.5GB in DuckDB (compressed)

---

## The Join Key: NPI as Universal ID

Every table connects via **NPI** (National Provider Identifier):

```
provider_backbone (1.2M NPIs)
    ├── utilization_metrics (1:1)
    │   ├── Part B volume
    │   ├── Part D prescribing
    │   └── DME referrals
    │
    ├── provider_service_detail (1:N)
    │   └── HCPCS procedures
    │
    ├── provider_drug_detail (1:N)
    │   └── Drug-level prescribing
    │
    ├── practice_locations (1:N)
    │   └── Group practice affiliations
    │
    ├── hospital_affiliations (1:N)
    │   └── Inferred hospital links
    │
    └── provider_quality_scores (1:1)
        └── MIPS score + flags
```

NPI is the only stable, universal identifier across the entire healthcare data ecosystem. Everything pivots on it.

---

## Entity Resolution: The Matching Engine

### The Problem

How do you know:
- NPI 1234567890 (CMS: "Jane Smith, Endocrinology, 123 Main St")
- Google Place ID `ChIJxxxxx` ("Dr. Jane Smith - Santa Monica Endocrine")
- Website mention ("Jane A. Smith, MD, FACE")

...all refer to the same provider?

### The Cascading Match Strategy

```
┌────────────────────────────────────────────────────────┐
│  INPUT: NPI + Name + Specialty + Address              │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│  STEP 1: Name + Zip (Exact)                            │
│    Match rate: 95%  |  Confidence: High                │
└─────────────────────┬──────────────────────────────────┘
                      │ (if no match)
                      ▼
┌────────────────────────────────────────────────────────┐
│  STEP 2: Name + City (Fuzzy)                           │
│    Match rate: 80%  |  Confidence: High                │
└─────────────────────┬──────────────────────────────────┘
                      │ (if no match)
                      ▼
┌────────────────────────────────────────────────────────┐
│  STEP 3: Multi-Address Search                          │
│    Try all known addresses from NPPES                   │
│    Match rate: 85%  |  Confidence: Medium              │
└─────────────────────┬──────────────────────────────────┘
                      │ (if no match)
                      ▼
┌────────────────────────────────────────────────────────┐
│  STEP 4: Reversed Names                                │
│    "Jane Smith" → "Smith Jane"                         │
│    Match rate: 65%  |  Confidence: Medium              │
└─────────────────────┬──────────────────────────────────┘
                      │ (if no match)
                      ▼
┌────────────────────────────────────────────────────────┐
│  STEP 5: Loose Match (Last Resort)                     │
│    Name only, within 10-mile radius                     │
│    Match rate: 50-65%  |  Confidence: Low              │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│  OUTPUT: Google Place ID + Confidence Score            │
│          (or null if no confident match)               │
└────────────────────────────────────────────────────────┘
```

**Specialty Stemming:** "endocrinologist" → "endocrin" matches "Endocrinology"

**Overall match rate:** 38% → 62% (with LLM assistance for ambiguous cases)

### The LLM Layer

For ambiguous matches (multiple candidates, low confidence):

```python
def llm_entity_resolution(npi, google_candidates):
    prompt = f"""
    Provider from CMS:
    - Name: {provider.full_name}
    - Specialty: {provider.specialty}
    - Address: {provider.address}
    
    Google Places Candidates:
    {json.dumps(google_candidates, indent=2)}
    
    Assess:
    1. Name match (account for initials, credentials)
    2. Location proximity
    3. Specialty alignment
    4. Red flags (wrong gender, different person)
    
    Return:
    {{
      "best_match_id": "ChIJ..." or null,
      "confidence": 0.0-1.0,
      "reasoning": "brief explanation"
    }}
    """
    
    return llm_call(prompt, model='gpt-4o-mini')
```

**Cost:** ~$0.001 per resolution, only for ambiguous cases (~10%)

---

## The Targeting Score Formula

```
targeting_score = (
    claims_volume_percentile    × 0.40 +
    payment_volume_percentile   × 0.25 +
    beneficiary_reach_percentile × 0.15 +
    prescribing_volume_percentile × 0.10 +
    quality_opportunity         × 0.10
)

where:
  quality_opportunity = 1.0 - (mips_score / 100)
  percentiles are within-specialty (cardiologists vs cardiologists)
```

**Why this matters:**
- A cardiologist with 5,000 Medicare services, $2M in payments, and a MIPS score of 60 gets a **targeting_score of 87** (top 13% of cardiologists).
- A pharma rep can query: "Find endocrinologists in Orange County with targeting_score > 75" and get a prioritized list.

---

## The Data Flow

### Initial Load (One-Time)

```bash
# Download all datasets (~6-8GB)
python scripts/download_cms_data.py

# Load into DuckDB raw_* tables
python scripts/ingest_raw_data.py

# Transform into analytics schema
python scripts/build_provider_backbone.py
python scripts/build_utilization_metrics.py
python scripts/build_practice_locations.py
python scripts/build_hospital_affiliations.py

# Total time: ~1 hour
# Result: provider_searcher.duckdb (5.5GB)
```

### Quarterly Refresh (Automated)

```bash
# CMS publishes new data quarterly
# Cron job runs on release day:

1. Download new CSVs
2. Diff against existing data
3. Incremental update (insert new, update changed)
4. Rebuild targeting scores
5. Invalidate stale Google Places matches
6. Notify dashboard

# Duration: ~30 minutes
```

---

## The API Layer

**Server:** 5.78.148.70:8080 (Hetzner, Ubuntu 24.04, 32GB RAM, 8 vCPU)  
**Framework:** FastAPI  
**Database:** DuckDB (read-only, memory-mapped)  
**Service:** systemd (`cms-api`)

### Key Endpoints

```python
# Search by specialty + geography
GET /providers/search?specialty=cardiology&location=90401&radius=10

# Get full provider profile
GET /providers/{npi}

# Match a Google Place result to NPI
POST /match/google-place
{
  "name": "Dr. Jane Smith",
  "address": "123 Main St, Santa Monica, CA",
  "specialty": "Cardiology"
}

# Database stats
GET /stats
{
  "total_providers": 1234567,
  "total_rows": 90123456,
  "tables": {...},
  "last_updated": "2026-02-16"
}
```

**API Key:** `1bb250cdd582258595a5d2bebd9493f2c74a7999` (read-only)

---

## The Dashboard

**URL:** http://5.78.148.70:8080/

Five tabs:

### 1. Overview
- Total providers, tables, row counts
- Data freshness (last updated)
- Enrichment status (% with Google Places match)

### 2. Data Sources
- List of all 10 CMS datasets
- UUID, URL, row count, last download
- Schema preview

### 3. Explore
- Interactive provider search
- Filter by specialty, state, score range
- Results table with targeting scores

### 4. SQL Console
- Execute custom queries directly
- Returns JSON
- Example queries included

### 5. Match Engine
- Test the matching algorithm
- Input: provider name + location
- Output: Google Place candidates + confidence scores

---

## Performance Numbers

| Operation | Time | Notes |
|-----------|------|-------|
| **Full dataset ingestion** | 60 min | All 10 datasets |
| **Provider search (no cache)** | < 100ms | PostGIS indexed |
| **Provider search (cached)** | < 10ms | In-memory lookup |
| **Google Places match** | 1-2s | External API call |
| **LLM match resolution** | 2-3s | GPT-4o-mini |
| **Targeting score calc** | < 1ms | Precomputed |
| **API response (single NPI)** | < 50ms | DuckDB read |
| **SQL query (10K rows)** | < 200ms | DuckDB columnar scan |

---

## The Cost Model

### Initial Build

| Component | Cost |
|-----------|------|
| **Server (Hetzner)** | $80/month (32GB RAM, 8 vCPU, 320GB SSD) |
| **Data downloads** | Free (CMS public data) |
| **Google Places API** | $0 (MVP: no enrichment yet) |
| **Development time** | 4 weeks |

### Ongoing (Per Client)

| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| **Base infrastructure** | $80 | Shared across clients |
| **Google Places enrichment** | $200-500 | 100K providers @ $0.03/match |
| **LLM matching** | $100-200 | 10K ambiguous cases @ $0.01/resolution |
| **Web intelligence (LLM)** | $500-1000 | 50K providers @ $0.01-0.02/extraction |
| **Refresh jobs** | $50 | Quarterly re-enrichment |
| **Total per client** | $930-1830 | One-time setup, then quarterly refresh |

### Revenue Model

- **Setup fee:** $4K (initial pipeline + enrichment for client's region)
- **Monthly subscription:** $2.8K (ongoing enrichment + API access)
- **Gross margin:** ~70% (after LLM + infrastructure costs)

---

## Challenges & Solutions

### Challenge 1: Boolean Type Mismatch (QPP Dataset)

**Problem:** DuckDB inferred `final_score` as BOOLEAN instead of DOUBLE  
**Cause:** CMS sometimes uses 0/1 for numeric fields  
**Solution:** Explicit type casting in SQL transform

```sql
-- Before (failed)
SELECT final_score FROM raw_qpp

-- After (works)
SELECT CAST(final_score AS DOUBLE) FROM raw_qpp
```

### Challenge 2: Hospital Affiliation Matching

**Problem:** No direct NPI → Hospital NPI join key  
**Workaround:** Match on organization name + state (fuzzy)  
**Confidence:** Medium (flag as `confidence_level = 'inferred'`)

### Challenge 3: Type 1 vs Type 2 NPI Deduplication

**Problem:** Same physician appears as individual AND under group NPI  
**Solution:** Filter to `entity_type_code = 'I'` only, use Type 2 for organizational context

---

## What's Next

### Phase 2 Features
- **Open Payments integration** — Sunshine Act industry payment data
- **Prescribing pattern analysis** — Brand affinity, polypharmacy flags
- **Territory optimization** — Suggest high-value providers by geography
- **LLM web intelligence** — Auto-extract insurance, languages, affiliations from websites

### Technical Improvements
- Migrate to PostgreSQL + PostGIS (DuckDB for analytics, Postgres for production API)
- Add Redis caching layer
- Build batch enrichment queue (50K providers per night)
- Create client-specific views (filter to relevant geography + specialty)

---

## Lessons Learned

**1. DuckDB is shockingly fast for analytics**

90M rows, 5.5GB database, queries return in milliseconds. `read_csv_auto()` means no pandas overhead. Memory usage stays under 2GB even during transforms.

**2. NPI is the only join key that matters**

Everything in healthcare data connects via NPI. Build your schema around it and everything else falls into place.

**3. CMS bulk downloads > API pagination**

Some datasets (like hospital enrollments) offer API access. But paginated requests take 10x longer than bulk CSV downloads. Always prefer bulk when available.

**4. Entity resolution is the moat**

The matching engine — cascading strategies, specialty stemming, LLM assistance — is what makes this data actionable. Raw CMS data + Google Places is commodity. The join is the value.

**5. Targeting scores need to be within-specialty**

Comparing a cardiologist's volume to a family medicine doctor's is meaningless. Percentiles must be within-specialty to be useful.

---

## Access & Collaboration

**API endpoint:** http://5.78.148.70:8080  
**Dashboard:** http://5.78.148.70:8080/ (Overview tab)  
**API key:** Available on request  
**Source code:** Private (healthcare data pipeline IP)

Open to collaboration with:
- Healthcare tech companies building provider intelligence tools
- Medical device/pharma companies needing targeting data
- Health systems exploring network adequacy + competitive analysis

---

*Built over 6 weeks (Jan-Feb 2026). Currently powers Provider Search (mydoclist.com) and client-specific analytics dashboards. Active development ongoing.*
