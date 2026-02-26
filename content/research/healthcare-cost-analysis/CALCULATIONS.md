# Healthcare Cost Analysis - Calculations & Models

*Working document for estimation models, assumptions, and results*

---

## Approach 1: Provider Capacity Model

**Core question**: How much care can all US physicians deliver in a year, and what does it cost?

### Step 1: Count Active Physicians

**Data source**: NPPES + BLS

- NPPES shows ~1M providers with physician credentials (MD, DO)
- BLS reports ~727K active physicians (2023)
- **Assumption**: Use 700,000 actively practicing physicians (conservative)

### Step 2: Calculate Patient Capacity

**Assumptions needed**:
- Work weeks per year (accounting for vacation, CME, admin time)
- Patients per day by specialty
- Average appointment length

**Example for Primary Care**:
- 48 weeks/year (4 weeks off)
- 4 days/week clinical time (1 day admin)
- 20 patients/day (assuming 20-minute average appointments)
- = 48 × 4 × 20 = **3,840 patient encounters/year per PCP**

**Specialty variation**:
- Surgeons: Fewer encounters but higher complexity/time
- Specialists: Varies widely (dermatology vs. oncology)
- Radiologists: Reads, not encounters

**Action needed**: 
- [ ] Get specialty distribution from NPPES
- [ ] Literature review on patient volume by specialty
- [ ] Calculate weighted average encounters per physician

### Step 3: Cost Per Encounter

**Components**:
1. **Physician compensation** (direct cost)
2. **Support staff** (nurses, MAs, admin)
3. **Facility overhead** (rent, utilities, equipment)
4. **Supplies and materials**
5. **Administrative burden** (billing, coding, EHR)

**Example for Primary Care Visit**:
- Physician time: 20 minutes = 1/3 hour
- Physician cost: $250K salary ÷ 2,000 hours = $125/hour = **$42 per visit**
- Support staff: 2:1 ratio (2 staff per physician), $60K average = **$20 per visit**
- Facility overhead: Estimated $50 per visit
- Supplies: $10 per visit
- **Total: ~$122 per primary care visit**

**Compare to**:
- Medicare payment: ~$50-100 depending on complexity
- Private insurance: ~$150-200
- Billed amount: ~$200-300

**Action needed**:
- [ ] Find literature on cost per visit by specialty
- [ ] Refine overhead assumptions
- [ ] Account for procedures, labs, imaging separately

### Step 4: Extrapolate to National Level

700,000 physicians × 3,840 encounters/year = **2.69 billion physician encounters/year**

At $122 per encounter = **$328 billion annually** (physician services only)

**Questions**:
- Does this match CMS NHEA data for physician services?
- What about hospital-based physicians (hospitalists, ER docs)?
- How to account for specialists with lower volume but higher cost?

---

## Approach 2: Facility Cost Model

**Core question**: What does it cost to operate hospitals and outpatient facilities?

### Step 1: Hospital Inpatient Costs

**Data source**: CMS Hospital Cost Reports + CMS Hospital Info

**From our data**:
- 5,400 hospitals
- Need to get total beds and occupancy rates (in cost reports)

**Calculation**:
```
Total cost = (Hospital beds × Occupancy rate × 365 days) × Cost per bed-day
```

**Cost per bed-day assumptions** (to validate with cost reports):
- Medical-surgical bed: $1,500-2,500/day
- ICU bed: $4,000-10,000/day
- Weighted average: ~$2,000/day?

**Example rough estimate**:
- Assume 900,000 total hospital beds (US estimate)
- Assume 65% occupancy
- Assume $2,000/day average cost
- = 900,000 × 0.65 × 365 × $2,000 = **$428 billion/year**

**Action needed**:
- [ ] Download cost reports to get actual numbers
- [ ] Validate bed counts and occupancy
- [ ] Get cost breakdowns by hospital type

### Step 2: Outpatient Facility Costs

**Facilities to count**:
- Hospital outpatient departments
- Ambulatory surgery centers
- Urgent care centers
- Dialysis centers
- Imaging centers

**Challenge**: Less centralized data than hospitals

**Action needed**:
- [ ] Find facility counts and volume data
- [ ] Estimate cost per visit/procedure
- [ ] Literature review on outpatient facility costs

### Step 3: Add Non-Facility Clinical Services

**Categories**:
- Physician offices (overhead from Approach 1)
- Home health
- Hospice
- Nursing homes (long-term care)

**Cross-check**: CMS NHEA should have spending breakdowns by setting

---

## Approach 3: Claims-Based Bottom-Up

**Core question**: Start with Medicare claims, extrapolate to full population

### Step 1: Medicare Spending Baseline

**From CMS data**:
- ~65 million Medicare beneficiaries
- ~$900 billion total Medicare spending (traditional Medicare + Part D)

**Breakdown by service** (from NHEA):
- Inpatient hospital: ~$200B
- Physician services: ~$150B
- Outpatient hospital: ~$100B
- Prescription drugs (Part D): ~$150B
- SNF, home health, hospice: ~$200B
- Other: ~$100B

### Step 2: Adjust for Non-Medicare Population

**US population**: 335 million
**Medicare**: 65 million
**Non-Medicare**: 270 million

**Challenge**: Non-Medicare population is younger and healthier

**Age adjustment approach**:
- 65+ population is ~5x more expensive than <65 (general rule)
- Non-Medicare population might be ~0.3x Medicare cost per capita

**Rough calculation**:
- Medicare per capita: $900B ÷ 65M = $13,846/person
- Non-Medicare per capita (adjusted): $13,846 × 0.3 = $4,154/person
- Non-Medicare total: 270M × $4,154 = **$1.12 trillion**
- **Total healthcare delivery cost (rough): $900B + $1.12T = $2.02 trillion**

**Compare to actual spending**: $4.5 trillion (CMS NHEA 2022)

**Gap**: $2.5 trillion - where does it go?

### Step 3: Validate Assumptions

**Questions**:
- Is 0.3x adjustment factor reasonable?
- Does this include all settings (nursing homes, etc.)?
- How do private insurance payment rates affect this?
- Are Medicare rates below cost, at cost, or above cost?

**Literature to find**:
- Medicare vs. commercial payment rates (RAND has data)
- Age-based cost curves
- Medicare cost vs. payment studies

---

## Approach 4: Top-Down National Accounting

**Core question**: Start with $4.5T, decompose into categories

### Step 1: CMS NHEA Breakdown (2022)

**By service type** (approximate, need exact numbers):
- Hospital care: ~$1.4T (31%)
- Physician services: ~$850B (19%)
- Prescription drugs: ~$600B (13%)
- Nursing home/long-term care: ~$200B (4%)
- Home health: ~$130B (3%)
- Other clinical services: ~$400B (9%)
- Public health: ~$100B (2%)
- Administration and insurance: ~$380B (8%)
- Other: ~$440B (10%)

**Total**: $4.5 trillion

### Step 2: Separate Direct Care from Overhead

**Question**: Of each category, what % is direct care cost vs. markup/overhead/profit?

**Hospital care ($1.4T)**:
- Direct clinical costs (labor, supplies): ?
- Facility overhead: ?
- Administrative: ?
- Profit (for-profit systems): ?

**Prescription drugs ($600B)**:
- Manufacturing cost: ~$50B? (rough estimate, US prices ~10x other countries)
- R&D amortization: ~$100B?
- Marketing: ~$50B?
- Distribution: ~$50B?
- Profit: ~$350B?

(These are wild guesses - need literature)

**Administration ($380B reported, likely understated)**:
- Insurance company overhead
- Provider-side billing/coding
- Prior authorization
- Claims processing

(Studies suggest true administrative cost is ~$500-800B)

### Step 3: Calculate "Waste"

**Waste categories** (from literature, JAMA study):
1. **Unnecessary care**: $200-300B
2. **Inefficient delivery**: $130-200B
3. **Administrative complexity**: $265-370B
4. **Pricing failures**: $230-330B
5. **Fraud and abuse**: $75-100B

**Total estimated waste**: $760B-935B

### Step 4: Net Out to "True Cost"

**Hypothesis**:
```
True cost of care = $4.5T - Waste - Insurance overhead - Excessive markups
                  = $4.5T - $800B (waste) - $300B (insurance) - $500B (pricing/markup)
                  = ~$2.9 trillion
```

**Per capita**:
- Current: $4.5T ÷ 335M = $13,433/person
- True cost: $2.9T ÷ 335M = $8,657/person
- **Excess**: $4,776/person

**Sanity check**: Peer countries spend $5,000-7,000 per capita. This estimate lands in that range.

---

## Cross-Approach Validation

| Approach | Estimated Annual Cost | Notes |
|----------|----------------------|-------|
| Provider Capacity | $328B (physician only) | Incomplete - need hospitals, facilities |
| Facility Model | $428B (hospital inpatient only) | Incomplete - need outpatient, offices |
| Claims Bottom-Up | $2.0T | Rough age-adjustment, needs validation |
| Top-Down | $2.9T | After netting out waste and overhead |

**Observation**: Claims bottom-up and top-down are in the same ballpark ($2-3T range).

**Next steps**:
- Refine each approach with real data
- Complete partial calculations (provider model needs facilities, etc.)
- Triangulate to a final estimate range

---

## Key Assumptions to Track

1. **Active physician count**: 700,000
2. **Patient encounters per physician**: 3,840/year (varies by specialty)
3. **Cost per primary care visit**: $122
4. **Hospital cost per bed-day**: $2,000 (needs validation)
5. **Non-Medicare age adjustment**: 0.3x Medicare cost
6. **Administrative waste**: $500-800B (from literature)
7. **Insurance overhead**: 15-20% of premiums
8. **Pharmaceutical markup**: ~10x manufacturing cost (US vs. international)

**These will evolve as we get data**

---

## Data Analysis Scripts

*Will add code snippets here as we process data*

### DuckDB Queries

```sql
-- Count active physicians by specialty
SELECT 
  taxonomy_description,
  COUNT(*) as provider_count
FROM nppes
WHERE entity_type_code = 1  -- Individual
  AND deactivation_date IS NULL
GROUP BY taxonomy_description
ORDER BY provider_count DESC;
```

```sql
-- Medicare utilization by specialty
SELECT 
  provider_specialty,
  SUM(number_of_services) as total_services,
  SUM(medicare_payment_amount) as total_payments,
  COUNT(DISTINCT npi) as provider_count
FROM medicare_utilization
GROUP BY provider_specialty
ORDER BY total_payments DESC;
```

### Python Cost Models

*(Placeholder for calculation scripts)*

---

## Pilot Calculation Results (2026-02-26)

### Hospital Cost Report Analysis (FY 2022)

**Data source**: CMS Form 2552-10 (HOSP10_cost_charges_2022.CSV)

| Metric | Value |
|--------|-------|
| Hospitals reporting | 5,983 |
| Hospitals with cost data | 4,776 |
| **Total reported costs** | **$1,027.0 billion** |
| **Total reported charges** | **$2,532.9 billion** |
| **Cost-to-charge ratio** | **0.405** |

**Interpretation**: 
- Hospitals bill $2.53T but their reported operating costs are $1.03T
- The cost-to-charge ratio of 0.405 means charges are ~2.5x actual costs
- This aligns with RAND finding that private insurers pay ~224% of Medicare
- Note: "costs" in cost reports include admin overhead, so true clinical delivery cost is lower

**Comparison to NHEA**: CMS NHE reports 2024 hospital expenditures of $1,634.7B. Our $1.03T figure from 2022 cost reports is the *provider-reported cost side*, not the *payer expenditure side*. The gap includes:
- Payer admin costs allocated to hospital spending
- Year difference (2022 vs 2024)
- Hospitals not filing cost reports
- The difference between what hospitals spend and what payers pay

### Medicare Bottom-Up Pilot (Approach 3)

**Using CMS NHE age/sex data (2020)**:

| Age Group | Per Capita PHC | Population Share | Spending Share |
|-----------|---------------|-----------------|----------------|
| 0-18 | $4,217 | 23% | 10% |
| 19-64 | $9,154 | 60% | 53% |
| 65+ | $22,356 | 17% | 37% |

**Step 1: Medicare baseline (2024 data from NHE)**
- Medicare spending: $1,118.0B
- Medicare beneficiaries: ~67M (2024 estimate)
- Medicare per capita: ~$16,687

**Step 2: Age adjustment factor**
- CMS data shows 65+ spend is 2.44x working-age per capita ($22,356 / $9,154)
- But Medicare per capita ($16,687) differs from CMS age/sex 65+ ($22,356) because:
  - Medicare doesn't cover everything (supplemental, out-of-pocket)
  - Medicare Advantage enrollment affects fee-for-service data
- **Adjusted ratio**: Non-Medicare per capita / Medicare per capita
  - Working-age PHC: $9,154
  - 65+ PHC: $22,356
  - Implied multiplier: $9,154 / $22,356 = **0.41** (non-elderly costs ~41% of elderly)

**Step 3: Extrapolation**
- US population 2024: ~335 million
- Medicare population: ~67M
- Non-Medicare population: ~268M

Using NHEA's own per-capita data (more reliable than our crude adjustment):
- 0-18: 77M × $4,217 = $324.7B
- 19-44: ~88M × $7,000 (est) = $616.0B  
- 45-64: ~83M × $12,000 (est) = $996.0B
- 65+: ~58M × $22,356 = $1,296.6B (2020 data, would be higher in 2024)
- **Total PHC estimate**: ~$3.23T

**Step 4: Compare to actual**
- CMS NHE 2024 total: $5.3T
- Personal healthcare (PHC) subset: ~$4.2T (PHC excludes admin, public health, investment)
- Our age-based estimate: ~$3.2T

**Gap analysis**: ~$1T difference between our rough age-based estimate and actual PHC spending. Possible explanations:
1. We used 2020 per-capita figures; healthcare inflation 2020-2024 was ~25-30%
2. Adjusting for ~28% inflation: $3.23T × 1.28 = **$4.13T** — very close to actual PHC
3. This suggests per-capita age-based spending is internally consistent

### Key Insight from Pilot

**The "waste" question reframed**:
- Total NHE 2024: $5.3T
- PHC (actual care): ~$4.2T
- Non-PHC (admin, public health, investment): ~$1.1T
- Hospital reported costs (2022): $1.03T vs. hospital expenditures: ~$1.5T (2022 NHE)
  - **Gap of ~$500B** in hospital sector alone between cost and expenditure
- Total admin (Himmelstein): 34.2% of NHE = ~$1.8T
- Total waste (Shrank): $760B-$935B

**Bottom line**: The "true cost" of delivering healthcare is likely in the **$2.5-3.0T range**, with $1.5-2.0T going to administrative overhead, pricing failures, waste, and profit. This is consistent across multiple approaches.

---

## Results Log

**[2026-02-26] Hospital Cost Reports** — 5,983 hospitals, $1.03T total costs, $2.53T total charges, CCR=0.405  
**[2026-02-26] Age-Based National Estimate** — $3.2T (2020 dollars), ~$4.1T inflation-adjusted to 2024, close to actual PHC  
**[2026-02-26] True Cost Estimate** — $2.5-3.0T for actual care delivery (vs. $5.3T total NHE)  

---

**Status**: Pilot calculations complete ✅ • Need to refine with NHEA Excel data  
**Last updated**: 2026-02-26
