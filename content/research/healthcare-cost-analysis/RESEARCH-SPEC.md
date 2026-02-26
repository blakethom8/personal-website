# Healthcare Cost Analysis - Research Spec

**Research Question**: What is the actual cost of delivering healthcare in the United States, and how does it compare to total healthcare spending?

**Sub-questions**:
- What is the direct cost of rendering clinical care (physician time, facility costs, supplies)?
- What proportion of healthcare spending goes to administrative overhead, insurance margins, and intermediaries?
- Can we quantify "waste" in the healthcare system?
- What does healthcare *should* cost if we eliminated misaligned incentives?

---

## Research Approach

This is a **rigorous, data-driven analysis** - not a blog post. We will:

1. **Define terms precisely** (what counts as "cost of care" vs. overhead vs. profit)
2. **Use multiple estimation methods** to triangulate the true cost
3. **Cite scholarly literature** and healthcare economics research
4. **Ground in real data**: CMS datasets, Medicare claims, hospital cost reports
5. **Show our work**: transparent methodology, reproducible calculations

---

## Calculation Approaches

### Approach 1: Provider Capacity Model
**Logic**: Calculate total physician capacity × utilization rate × cost per encounter

**Data sources**:
- NPPES: ~1M actively practicing physicians
- CMS Medicare Utilization: claims per provider, services rendered
- Assumptions about work hours, patient volume, compensation

**Key questions**:
- How many patient encounters can a physician handle per year?
- What's the average cost per encounter (physician time + overhead)?
- How do we extrapolate from Medicare to all patients?

### Approach 2: Facility Cost Model
**Logic**: Hospital beds × occupancy rate × cost per bed-day + outpatient facility costs

**Data sources**:
- CMS Hospital Info: 5,400 hospitals, bed counts, occupancy rates
- CMS Hospital Cost Reports (Form 2552-10): actual facility operating costs
- Ambulatory surgery centers, clinics, outpatient facilities

**Key questions**:
- What's the true cost per hospital bed per day?
- How much care happens in outpatient settings vs. inpatient?
- How do we separate facility costs from clinical costs?

### Approach 3: Claims-Based Bottom-Up
**Logic**: Start with Medicare claims (known costs), extrapolate to entire population

**Data sources**:
- CMS Medicare utilization data: actual payments for 65M+ beneficiaries
- Age/risk adjustment to extrapolate to non-Medicare population
- Private insurance payment rates (typically 1.5-2.5x Medicare rates)

**Key questions**:
- How representative is Medicare pricing of "actual cost"?
- How do we adjust for healthier/younger populations?
- What's the relationship between Medicare rates and true delivery costs?

### Approach 4: Top-Down National Accounting
**Logic**: Start with total national health expenditure, decompose into categories

**Data sources**:
- CMS National Health Expenditure Accounts: $4.5 trillion (2022)
- Medical Loss Ratio data: insurers must spend 80-85% on care (ACA requirement)
- Administrative cost studies (scholarly literature)

**Key questions**:
- What % of total spend is clinical care vs. administrative?
- How much goes to insurance company profits and overhead?
- How much is pharmaceutical/device markup vs. manufacturing cost?

---

## Key Definitions (To Be Refined)

### Direct Care Costs
- Physician/clinician time and compensation
- Nursing and clinical staff
- Medical supplies and pharmaceuticals (at acquisition cost, not retail)
- Diagnostic tests and procedures (cost to perform, not billed amount)
- Facility costs directly tied to patient care (OR time, exam rooms)

### Administrative Overhead
- Insurance company operations (claims processing, underwriting, marketing)
- Provider administrative burden (billing, coding, prior authorization)
- Hospital administrative staff not directly involved in care

### "Waste" Categories (from literature)
- Unnecessary care (defensive medicine, low-value services)
- Inefficient care delivery (duplicated tests, poor coordination)
- Administrative complexity (billing, prior auth, multiple payers)
- Fraud and abuse
- Pricing failures (lack of transparency, market power)

### Excluded from "Cost of Care"
- Insurance company profit margins
- Pharmaceutical company R&D and marketing (beyond manufacturing cost)
- Medical device markups
- Private equity returns in healthcare

---

## Data Sources

### CMS Public Datasets (We Have These)
- **NPPES NPI Registry**: 8M providers, 1M actively practicing physicians
- **Medicare Physician Utilization**: Claims, services, payments per provider
- **Hospital Info**: 5,400 hospitals, bed counts, ownership
- **Open Payments**: Industry transfers to providers
- **Prescriber Data**: Drug utilization and costs

### CMS Additional Sources (To Acquire)
- **Hospital Cost Reports (Form 2552-10)**: Actual facility operating costs, broken down by department
- **Medicare Enrollment**: Beneficiary counts by state/county
- **Geographic Practice Cost Indices (GPCI)**: Cost adjustments by location

### Non-CMS Public Data
- **Medical Loss Ratio reports**: How much insurers spend on care vs. overhead (CMS/states)
- **National Health Expenditure Accounts**: Total US healthcare spending breakdown
- **Bureau of Labor Statistics**: Healthcare worker wages, employment counts
- **Hospital association data**: Bed counts, staffing ratios

### Scholarly Literature
- Healthcare cost accounting studies (journals: JAMA, Health Affairs, NEJM)
- Administrative cost analyses (Woolhandler et al., Himmelstein et al.)
- Waste in healthcare (JAMA study estimating $760B-$935B annually)
- Healthcare pricing and market power studies

### Books & Reports
- **America's Bitter Pill** (Steven Brill) - healthcare cost inflation, lobbying, misaligned incentives
- RAND Health - hospital price variation studies
- Commonwealth Fund - international healthcare cost comparisons

---

## Research Questions to Answer

1. **What is the actual cost to deliver a primary care visit?**
   - Physician time cost
   - Facility overhead
   - Administrative burden
   - Compare to billed amount

2. **How much does it cost to run a hospital bed for one day?**
   - Nursing staff, supplies, facility costs
   - Compare to hospital charges and insurance payments

3. **What % of healthcare spending is clinical care vs. everything else?**
   - Direct care costs
   - Administrative (provider-side and payer-side)
   - Insurance profits
   - Pharmaceutical/device markups

4. **How much "waste" can we quantify?**
   - Unnecessary procedures
   - Administrative complexity costs
   - Pricing failures and market inefficiencies

5. **What would healthcare cost in a more efficient system?**
   - Medicare-for-all cost estimates
   - International comparisons (cost per capita, outcomes)
   - Single-payer administrative efficiency

6. **Where does the money go?**
   - Flow of $4.5 trillion from premiums/taxes → actual care delivery
   - Who captures value along the way?

---

## Methodology Considerations

### Challenges
- **Data availability**: Not all cost data is public
- **Attribution**: Hard to separate direct care from overhead
- **Accounting complexity**: Hospital cost accounting is opaque
- **Geographic variation**: Costs vary wildly by region
- **Payment vs. cost**: Insurance payments ≠ actual cost to deliver

### Triangulation Strategy
Use multiple independent methods and see if they converge:
- Bottom-up from claims data
- Top-down from national accounts
- Provider capacity models
- Facility cost analysis

If all four approaches land in a similar range → higher confidence.

### Transparency
- Show all assumptions
- Cite all sources
- Provide ranges, not false precision
- Acknowledge limitations
- Open to peer review

---

## Output Format

This will be a **multi-part research article** published on blakethomson.com/research:

### Part 1: The Question
- Why this matters
- Current state of knowledge
- Our approach

### Part 2: Methodology
- Data sources
- Calculation methods
- Assumptions and limitations

### Part 3: Findings
- Cost of care estimates (multiple methods)
- Breakdown of where money goes
- Waste quantification

### Part 4: Implications
- What this means for policy
- How to drive down costs
- International comparisons

### Part 5: Interactive Calculator
- Let users explore assumptions
- Adjust parameters, see impact
- Data visualization of cost flows

---

## Next Steps

1. **Literature review**: Find key papers on healthcare cost accounting, administrative costs, waste
2. **Data acquisition**: Download CMS hospital cost reports, MLR data, NHEA breakdowns
3. **Pilot calculation**: Start with one method (e.g., Medicare bottom-up) to test feasibility
4. **Refine definitions**: Get precise about what counts as "cost of care"
5. **Build calculation models**: Spreadsheets/code to run different scenarios
6. **Draft Part 1**: Lay out the research question and why it matters

---

## Working Notes

*This section will evolve as we research and calculate*

**Key insight to explore**: Steven Brill's argument in America's Bitter Pill is that healthcare costs exploded due to:
- Hospital "chargemaster" pricing with no market discipline
- Pharma/device lobbying preventing price negotiation
- Insurance complexity adding layers of overhead
- Fee-for-service incentivizing volume over value

Can we quantify each of these effects?

**Hypothesis**: If we strip out administrative waste, insurance overhead, and pricing failures, actual cost of delivering care might be 40-60% of current spending. That would suggest $1.8-2.7 trillion in "waste" in a $4.5 trillion system.

**Sanity check needed**: What do other countries spend per capita for similar outcomes? US spends ~$13,000/person; peer countries spend $5,000-7,000. That's a $6,000-8,000 gap per person × 330M people = $2-2.6 trillion "excess" spending.

---

**Status**: Research spec defined • Ready for literature review and pilot calculations  
**Created**: 2026-02-26  
**Author**: Blake Thomson
