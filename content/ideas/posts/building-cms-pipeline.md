---
title: "90 Million Rows of Medicare Data: What I Learned Building a Healthcare Data Pipeline"
date: "2026-02-26"
excerpt: "CMS publishes incredible healthcare data — if you can wrangle it. Here's what I learned building a pipeline to ingest NPPES, Open Payments, and Medicare utilization data into DuckDB."
readTime: "12 min"
category: "technical-deep-dives"
tags: ["healthcare", "data-engineering", "duckdb", "cms", "pipeline"]
featured: false
---

# 90 Million Rows of Medicare Data: What I Learned Building a Healthcare Data Pipeline

The Centers for Medicare & Medicaid Services (CMS) publishes over 100 public datasets. Most are state-level aggregates or cost reports. But buried in there are 10 NPI-level datasets that show exactly:

- Who bills Medicare (1.2M providers)
- What procedures they perform (10M rows by HCPCS code)
- What they prescribe (25M rows by drug name)
- How much they charge and get paid
- Their quality scores (MIPS)
- Their hospital affiliations
- Their prescribing patterns

This data is **free, public, and updated quarterly.** But almost nobody uses it because it's a mess. Ten separate datasets across different URLs. Cryptic schemas (`rndrng_npi`, `tot_srvcs` — what?). No join key documentation. You need PostGIS + DuckDB + spatial queries to make it useful.

I spent 6 weeks building a pipeline that handles all of this — download, transform, enrich, and serve — automatically. Here's what I learned.

---

## The Architecture

```
CMS DATA SOURCES (10 datasets, ~6-8GB CSVs)
        │
        ▼
INGESTION (Python + DuckDB)
• Download CSVs
• Load into DuckDB (raw_* tables)
• No pandas (memory stays under 2GB)
• Duration: ~25 minutes
        │
        ▼
TRANSFORMATION (SQL + Python)
• Provider Backbone (unified profile)
• Entity Resolution (NPI → group → hospital)
• Quality + Ordering Eligibility
        │
        ▼
ENRICHMENT (External APIs + LLM)
• Google Places (ratings, reviews, hours)
• Web Intelligence (insurance, languages, affiliations)
• Composite Targeting Score
        │
        ▼
API LAYER (FastAPI + DuckDB)
• Search endpoints
• Match endpoints
• Dashboard at http://5.78.148.70:8080/
```

---

## The 10 Datasets

All from the [CMS Public Data Catalog](https://data.cms.gov/provider-data):

| Dataset | Rows | What It Contains |
|---------|------|------------------|
| **Medicare Physician & Other Practitioners** | 1.2M | Identity, location, volume, patient demographics, chronic conditions |
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

Every table connects via **NPI** (National Provider Identifier). This is the only stable, universal identifier across the entire healthcare data ecosystem.

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

Everything pivots on NPI. Once I understood this, the data model became obvious.

---

## Lesson 1: DuckDB Is Shockingly Fast

I tried pandas first. Bad idea. Memory spiked to 14GB loading a 4GB CSV. Crashed my dev machine twice.

Switched to DuckDB. Same CSV loads in 12 seconds using 800MB of RAM.

```python
# The entire ingestion script
import duckdb

conn = duckdb.connect('provider_searcher.duckdb')

# Load CSV directly — no pandas needed
conn.execute("""
    CREATE TABLE raw_utilization AS 
    SELECT * FROM read_csv_auto('physician_utilization_2023.csv')
""")
```

DuckDB's `read_csv_auto()` infers types, handles multi-GB files, and streams data. No memory explosion. No type casting headaches. It just works.

**Performance:**
- 90M rows, 5.5GB database
- Search queries return in < 100ms
- Analytical queries (aggregates, group-by) finish in < 200ms
- Memory usage stays under 2GB even during transforms

The "columnar storage" thing everyone talks about? It's real. DuckDB reads only the columns you query. A 369MB parquet file with 13M rows returns single-provider results in under a second because it skips 99%+ of the data using row group statistics.

---

## Lesson 2: Entity Resolution Is the Moat

How do you know:
- NPI 1234567890 (CMS: "Jane Smith, Endocrinology, 123 Main St")
- Google Place ID `ChIJxxxxx` ("Dr. Jane Smith - Santa Monica Endocrine")
- Website mention ("Jane A. Smith, MD, FACE")

...all refer to the same provider?

You can't. Not with certainty. But you can get close with a cascading match strategy.

### The Matching Engine

```
INPUT: NPI + Name + Specialty + Address
        │
        ▼
STEP 1: Name + Zip (Exact)
Match rate: 95% | Confidence: High
        │ (if no match)
        ▼
STEP 2: Name + City (Fuzzy)
Match rate: 80% | Confidence: High
        │ (if no match)
        ▼
STEP 3: Multi-Address Search
Try all known addresses from NPPES
Match rate: 85% | Confidence: Medium
        │ (if no match)
        ▼
STEP 4: Reversed Names
"Jane Smith" → "Smith Jane"
Match rate: 65% | Confidence: Medium
        │ (if no match)
        ▼
STEP 5: Loose Match (Last Resort)
Name only, within 10-mile radius
Match rate: 50-65% | Confidence: Low
        │
        ▼
OUTPUT: Google Place ID + Confidence Score
```

**Overall match rate:** 38% with naive matching → 62% with this cascading strategy + LLM assistance.

**Specialty Stemming:** One gotcha I hit early — "endocrinologist" doesn't match "Endocrinology." I built a stemmer that reduces both to "endocrin" and also maintains an alias dictionary:

```python
SPECIALTY_ALIASES = {
  "obgyn": ["obstetrics gynecology", "women's health", "ob gyn", "ob/gyn"],
  "ent": ["otolaryngology", "ear nose throat"],
  "pmr": ["physical medicine rehabilitation", "physiatry", "rehab medicine"],
  "cardio": ["cardiology", "heart", "cardiovascular"]
}
```

This boosted match rate by ~15%.

### The LLM Layer

For ambiguous matches (multiple candidates, low confidence), I ask an LLM:

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

**Cost:** ~$0.001 per resolution, only for ambiguous cases (~10% of matches). Total LLM cost for 100K providers: ~$100.

---

## Lesson 3: The Targeting Score Formula

Raw CMS data tells you *what* providers do. But it doesn't tell you *who to target.*

I built a composite targeting score that ranks providers within their specialty:

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
  percentiles are within-specialty
```

**Why this matters:**

A cardiologist with 5,000 Medicare services, $2M in payments, and a MIPS score of 60 gets a **targeting_score of 87** (top 13% of cardiologists).

A pharma rep can query: "Find endocrinologists in Orange County with targeting_score > 75" and get a prioritized list immediately.

**Why within-specialty?** Comparing a cardiologist's volume to a family medicine doctor's is meaningless. Volume norms differ wildly by specialty. Percentiles must be calculated within the specialty cohort to be useful.

---

## Lesson 4: CMS Bulk Downloads > API Pagination

Some datasets (like hospital enrollments) offer API access. I thought: "Great, I'll just paginate through the API."

Bad idea. Paginated requests took 10x longer than bulk CSV downloads.

**API approach:** 8,000 hospital records × 20ms per request = 160 seconds  
**Bulk CSV:** Download 8,000 records in 12 seconds

APIs are great for real-time lookups. For initial data loads, always prefer bulk when available.

---

## Lesson 5: Type Inference Can Bite You

Early on, I hit a weird bug. DuckDB kept failing to query the Quality Payment Program dataset.

```sql
SELECT final_score FROM raw_qpp
-- Error: Cannot compare BOOLEAN to DOUBLE
```

Turns out, CMS sometimes uses `0` and `1` for numeric fields. DuckDB's auto-type inference saw a column full of 0s and 1s and said "that's a boolean!"

**Fix:**

```sql
-- Explicit type casting in the transform
SELECT CAST(final_score AS DOUBLE) AS final_score
FROM raw_qpp
```

Lesson: Never trust auto-inferred types for external CSVs. Always validate schema on first load.

---

## Lesson 6: Hospital Affiliation Matching Is Fuzzy

There's no direct NPI → Hospital NPI join key in CMS data. The reassignment dataset tells you a provider works for "St. Joseph Medical Center," but it doesn't give you the hospital's NPI.

I had to match on **organization name + state** using fuzzy logic:

```sql
SELECT h.hospital_npi, h.hospital_name,
       levenshtein(h.hospital_name, p.organization_name) AS name_distance
FROM practice_locations p
LEFT JOIN hospital_enrollments h
  ON h.state = p.state
  AND levenshtein(h.hospital_name, p.organization_name) < 5
WHERE name_distance IS NOT NULL
ORDER BY name_distance
```

**Confidence:** Medium. I flag all inferred matches with `confidence_level = 'inferred'`.

This catches ~60% of hospital affiliations. The remaining 40% are either:
- Group practices (not hospitals)
- Name variations too different to fuzzy match
- Retired/closed practices

Good enough for V1. Better NPI-to-org mapping data (like NPPES PAC ID) would improve this.

---

## The API Layer

I built a FastAPI server that sits on top of the DuckDB file. The database is read-only and memory-mapped — queries are fast, no writes, no locking issues.

**Server:** Hetzner (32GB RAM, 8 vCPU, $80/mo)  
**URL:** http://5.78.148.70:8080

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
```

The dashboard at the root URL gives you an overview, data source list, SQL console, and a match engine tester.

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
| **SQL query (10K rows)** | < 200ms | Columnar scan |

---

## The Cost Model

### Initial Build

- **Server (Hetzner):** $80/month
- **Data downloads:** Free (CMS public data)
- **Development time:** 6 weeks

### Ongoing (Per Client)

| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| **Base infrastructure** | $80 | Shared across clients |
| **Google Places enrichment** | $200-500 | 100K providers @ $0.03/match |
| **LLM matching** | $100-200 | 10K ambiguous cases @ $0.01/resolution |
| **Web intelligence (LLM)** | $500-1000 | 50K providers @ $0.01-0.02/extraction |
| **Refresh jobs** | $50 | Quarterly re-enrichment |
| **Total per client** | $930-1830 | One-time setup, then quarterly refresh |

**Revenue model:**
- Setup fee: $4K (initial pipeline + enrichment for client's region)
- Monthly subscription: $2.8K (ongoing enrichment + API access)
- **Gross margin:** ~70% after LLM + infrastructure costs

---

## What I'd Do Differently

### Use PostgreSQL for Production

DuckDB is perfect for analytics and local development. But for a production API with multiple concurrent users, PostgreSQL + PostGIS is the better choice.

**Why:**
- Better concurrency control
- More mature tooling
- Native geospatial queries (PostGIS)
- Easier to scale with read replicas

I'll migrate once I have paying clients. For now, DuckDB works great.

### Build Batch Enrichment Queue Earlier

I started by enriching providers on-demand (when someone searches for them). This works for demos, but doesn't scale.

**Better approach:**
- Nightly batch job processes 50K providers
- Prioritize high-volume providers first
- Cache enriched data in the database
- Only do on-demand enrichment for outliers

This spreads the LLM cost over time and ensures the most-searched providers are always fresh.

### Add Redis Caching Layer

Right now, every API call hits DuckDB. For high-traffic queries (popular specialties, major cities), a Redis cache would cut response time from 100ms → 10ms and reduce database load.

**What to cache:**
- Search results (keyed by specialty + location + radius)
- Provider profiles (keyed by NPI)
- Targeting scores (precomputed, refreshed quarterly)

TTL: 24 hours for search results, 7 days for profiles.

---

## What's Next

### Phase 2 Features

- **Open Payments integration** — Sunshine Act industry payment data (who's getting money from pharma/device companies)
- **Prescribing pattern analysis** — Brand affinity, polypharmacy flags, formulary alignment
- **Territory optimization** — "Show me the top 50 providers by volume in this geography"
- **LLM web intelligence** — Auto-extract insurance accepted, languages spoken, hospital affiliations from provider websites

### Productization

This pipeline currently powers:
- **mydoclist.com** (Provider Search for physician liaisons)
- **Client-specific dashboards** (deployed in their Azure tenants)

Next step: Package this as a self-service product. Upload a provider list → get back enriched profiles with CMS data, Google ratings, and targeting scores.

---

## The Real Lesson

**Raw data is commodity. The join is the value.**

Anyone can download CMS data. It's free and public. But making it *usable* — matching entities, scoring providers, enriching with external sources, serving it via a clean API — that's the moat.

The matching engine, the targeting score formula, the cascading entity resolution strategy — those took weeks to build and tune. The data download took 25 minutes.

If you're building a healthcare data product, don't compete on data access. Compete on **how you make it useful.**

---

*This pipeline was built over 6 weeks (Jan-Feb 2026) and currently runs on a Hetzner server at 5.78.148.70. API access available on request. Open to collaboration with healthcare tech companies, medical device/pharma companies, and health systems.*
