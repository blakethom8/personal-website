# Healthcare Cost Analysis - Data Inventory

*Tracking available data sources, acquisition methods, and usage notes*

---

## CMS Datasets (Currently Available)

Located at: `~/Repo/cms-data/data/provider_searcher.duckdb`

### 1. NPPES NPI Registry
- **Records**: 8M total providers, ~1M actively practicing physicians
- **Fields**: Name, credentials, specialty, practice address, business address
- **Use cases**: Provider capacity modeling, specialty distribution
- **Limitations**: Doesn't indicate active practice status clearly

### 2. Medicare Physician & Other Practitioners Utilization
- **Records**: Claims-level data for providers billing Medicare Part B
- **Fields**: Provider, service codes, beneficiary counts, payment amounts, Medicare allowed amounts
- **Use cases**: Claims-based cost calculations, utilization patterns, payments per provider
- **Coverage**: Medicare beneficiaries only (65+, disabled, ESRD)
- **Limitations**: Doesn't include Medicare Advantage, private insurance, uninsured

### 3. Hospital Information
- **Records**: 5,400 hospitals
- **Fields**: Name, address, ownership, bed counts, hospital type
- **Use cases**: Facility capacity modeling
- **Limitations**: Basic metadata only, no cost or utilization data

### 4. Open Payments
- **Records**: 14.7M general payments + 1.1M research payments
- **Fields**: Manufacturer, physician, payment amount, payment type
- **Use cases**: Understanding industry influence, less directly relevant to cost analysis
- **Limitations**: Doesn't capture operating costs

### 5. Part D Prescriber Data
- **Records**: Provider-level drug prescribing
- **Fields**: Provider, drug name, claim count, cost
- **Use cases**: Pharmaceutical cost analysis
- **Limitations**: Medicare Part D only

---

## CMS Datasets (Needed - Publicly Available)

### 1. Hospital Cost Reports (Form 2552-10) ⭐ HIGH PRIORITY
- **What it is**: Annual financial reports every Medicare-certified hospital must file
- **Contains**:
  - Operating costs by department
  - Revenue by payer type
  - Bed counts and patient days
  - Staffing levels
  - Capital costs
- **Access**: CMS Cost Report database (public but complex format)
- **Use cases**: True facility operating costs, cost per bed-day, overhead breakdowns
- **URL**: https://www.cms.gov/Research-Statistics-Data-and-Systems/Downloadable-Public-Use-Files/Cost-Reports

**Action**: Download and parse recent year (FY 2022 or 2023)

### 2. Medicare Enrollment Data
- **What it is**: Counts of Medicare beneficiaries by geography, demographics
- **Use cases**: Calculate per-capita costs, extrapolate to general population
- **Access**: CMS public use files
- **URL**: https://data.cms.gov/summary-statistics-on-beneficiary-enrollment

### 3. Medicare Advantage Enrollment
- **What it is**: Enrollment in Medicare Advantage plans by county and plan
- **Use cases**: Understanding coverage distribution (important because MA claims aren't in utilization data)
- **Access**: CMS public data
- **URL**: https://data.cms.gov/medicare-advantage

### 4. National Health Expenditure Accounts (NHEA) ⭐ HIGH PRIORITY
- **What it is**: CMS Office of the Actuary's official accounting of all US healthcare spending
- **Contains**:
  - Total spending: $4.5 trillion (2022)
  - Breakdown by service type (hospital, physician, drugs, etc.)
  - Breakdown by payer (Medicare, Medicaid, private, out-of-pocket)
- **Use cases**: Top-down analysis, national benchmarks
- **Access**: CMS website, downloadable Excel files
- **URL**: https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data

**Action**: Download historical tables, focus on 2021-2022 data

### 5. Geographic Practice Cost Indices (GPCI)
- **What it is**: Regional cost adjustments for physician payments
- **Use cases**: Adjust cost estimates by geography
- **Access**: CMS Physician Fee Schedule files
- **URL**: https://www.cms.gov/medicare/payment/fee-schedules/physician

---

## Non-CMS Public Data Sources

### Medical Loss Ratio (MLR) Reports ⭐ HIGH PRIORITY
- **What it is**: ACA requires insurers to report % of premiums spent on medical care vs. administrative/profit
- **Requirement**: 80% (individual/small group) or 85% (large group) must go to medical care
- **Contains**: Premium revenue, claims paid, administrative costs, profit margins by insurer
- **Access**: 
  - CMS for Medicare Advantage plans
  - State insurance departments for commercial plans
  - NAIC (National Association of Insurance Commissioners) aggregated data
- **Use cases**: Calculate insurance overhead, compare premiums paid to care delivered

**Action**: Find MLR data for 2022-2023, aggregate by market segment

### Bureau of Labor Statistics (BLS) Healthcare Employment
- **What it is**: Employment counts and wage data for healthcare workers
- **Contains**:
  - Number of physicians by specialty
  - Nurses, technicians, administrative staff
  - Average wages by occupation
- **Use cases**: Labor cost modeling, staffing ratio assumptions
- **URL**: https://www.bls.gov/oes/current/naics4_622000.htm

### American Hospital Association (AHA) Data
- **What it is**: Hospital statistics, some publicly available
- **Contains**: Bed counts, admissions, ER visits, staffing
- **Access**: Some data free, detailed data requires membership
- **Note**: May overlap with CMS data but could have more granularity

### Kaiser Family Foundation (KFF)
- **What it is**: Health policy research and data aggregation
- **Contains**: Insurance coverage stats, cost trends, state-by-state comparisons
- **Access**: Public, well-organized
- **URL**: https://www.kff.org/health-costs/

---

## International Comparison Data

### OECD Health Statistics
- **What it is**: Standardized health data for developed countries
- **Contains**: Per-capita spending, utilization rates, outcomes by country
- **Use cases**: Benchmark US costs against peer nations
- **URL**: https://www.oecd.org/health/health-data.htm

### WHO Global Health Expenditure Database
- **What it is**: Worldwide health spending data
- **Use cases**: Broader international context
- **URL**: https://apps.who.int/nha/database

---

## Proprietary/Paywalled Data (Acknowledge Limitations)

### Trilliant Health
- Comprehensive provider and market data
- We don't have access (expensive)
- Acknowledge as limitation

### FAIR Health
- Commercial insurance claims database
- Private pricing data
- May have public reports we can cite

### Healthcare Cost Institute (HCCI)
- Commercial claims analysis
- Publishes public reports on cost trends
- Could cite their findings

---

## Data Gaps & Workarounds

| **What We Need** | **Ideal Source** | **Available?** | **Workaround** |
|------------------|------------------|----------------|----------------|
| Private insurance claims | FAIR Health, HCCI | No (paywalled) | Use RAND studies on commercial vs Medicare rates (typically 1.5-2.5x) |
| Hospital operating costs | CMS Cost Reports | Yes (complex) | Download and parse |
| Physician office costs | ? | Unclear | Literature review for cost per visit studies |
| True drug costs | ? | Limited | Use international pricing as proxy for true cost |
| Administrative burden time | ? | Scattered studies | Literature review, cite physician surveys |

---

## Data Processing Pipeline

1. **Acquire**: Download raw files (CSVs, Excel)
2. **Load**: Import into DuckDB or analysis environment
3. **Clean**: Standardize fields, handle missing data
4. **Calculate**: Run estimation models
5. **Validate**: Cross-check against known benchmarks
6. **Document**: Track assumptions and transformations

---

## Acquisition Checklist

- [x] **Hospital Cost Reports (Form 2552-10)** — Downloaded all years 2010-2025 ✅
  - Location: `data/HOSP10-REPORTS/`
  - Files: `HOSP10_cost_charges_YYYY.CSV` (cost & charges by provider per year)
  - Also: `HOSP10_PRVDR_ID_INFO.CSV` (provider name/address/type lookup)
  - Also: `IME_GMEYYYY.CSV` (indirect medical education & graduate medical education)
  - Columns: PROVIDER_NUMBER, FYB, FYE, STATUS, C000001_20000_00500 (total costs), C000001_20000_00600 (total charges), C000001_20000_00700 (total beds?)
  - Source: https://downloads.cms.gov/files/hcris/hosp10-reports.zip
- [x] **NHEA historical tables** — Downloaded all 25 tables ✅
  - Location: `data/nhea/`
  - 25 Excel files covering aggregate spending, per capita, by type, by source, by sponsor, by program
  - Includes: Hospital care, physician services, Rx drugs, nursing, home health, dental, DME
  - Also: Insurance enrollment, price indexes, employer-sponsored insurance
  - Source: https://www.cms.gov/files/zip/nhe-tables.zip
- [ ] Medicare enrollment data — Not yet downloaded
- [ ] **MLR reports** — Download blocked (CMS page requires JavaScript/redirects)
  - URL: https://www.cms.gov/marketplace/resources/data/medical-loss-ratio-data-systems-resources
  - Action: Manual download needed from CMS MLR search tool
- [ ] **BLS healthcare employment and wage data** — Download blocked (BLS redirect issues)
  - URL: https://www.bls.gov/oes/tables.htm
  - Action: Manual download of OES data by industry (NAICS 622000 Hospitals, 621 Ambulatory)
- [ ] OECD health statistics for peer countries
- [x] **RAND commercial vs Medicare payment rates** — Cited in literature review ✅
  - Key finding: Private pays 224% of Medicare (2020 data)
- [ ] KFF insurance premium data

---

**Status**: NHEA + Hospital Cost Reports acquired ✅ • MLR & BLS need manual download  
**Last updated**: 2026-02-26
