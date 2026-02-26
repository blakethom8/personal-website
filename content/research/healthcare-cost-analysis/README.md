# Healthcare Cost Analysis Research Project

**Research Question**: What is the actual cost of delivering healthcare in the United States, and how does it compare to what we spend?

**Output**: Multi-part research article for blakethomson.com/research

---

## Project Structure

```
healthcare-cost-analysis/
├── README.md              ← You are here
├── RESEARCH-SPEC.md       ← Overall methodology, research questions, approach
├── LITERATURE.md          ← Scholarly sources and key studies
├── DATA-INVENTORY.md      ← Available and needed datasets
├── CALCULATIONS.md        ← Working calculations and models
├── drafts/               ← Article drafts (to be created)
├── data/                 ← Downloaded datasets (to be created)
└── scripts/              ← Analysis code (to be created)
```

---

## Current Status

**Phase**: Research design and data acquisition  
**Next milestone**: Complete literature review and download priority datasets

### ✅ Complete
- Research specification defined
- Four calculation approaches outlined
- Data sources identified
- Literature framework created

### 🔄 In Progress
- Literature review (scholarly articles on cost accounting, waste, admin overhead)
- Data acquisition (hospital cost reports, NHEA tables, MLR data)

### 📋 To Do
- Pilot calculation (start with Medicare bottom-up)
- Refine cost per visit assumptions
- Build calculation scripts
- Draft article Part 1 (The Question)

---

## Four Calculation Approaches

We'll use multiple independent methods to triangulate the true cost:

1. **Provider Capacity Model**: Physician count × patient volume × cost per encounter
2. **Facility Cost Model**: Hospital beds × occupancy × cost per bed-day + outpatient
3. **Claims Bottom-Up**: Medicare claims → age-adjust → extrapolate to full population
4. **Top-Down National Accounting**: $4.5T total spend → decompose → net out waste/overhead

**Goal**: If all approaches converge to a similar range, we have high confidence.

---

## Key Hypotheses

1. **Direct care cost**: $2-3 trillion (~40-60% of current spending)
2. **Waste and overhead**: $1.5-2.5 trillion (40-55% of spending)
3. **Per capita excess**: ~$5,000/person vs. peer countries
4. **Insurance overhead**: 15-20% of premiums (despite MLR requirements)
5. **Pharmaceutical markup**: ~10x manufacturing cost for US prices

---

## Immediate Next Steps

### 1. Literature Review (Priority: HIGH)
**Goal**: Find authoritative sources on cost accounting, waste, admin overhead

**Search for**:
- Administrative cost studies (Woolhandler, Himmelstein)
- Healthcare waste taxonomy (JAMA $760B-935B study)
- Cost per visit/encounter studies
- Medicare cost vs. payment analyses
- International cost comparisons (OECD, Commonwealth Fund)

**Action**: Spend 2-3 hours on PubMed, Google Scholar, Health Affairs

### 2. Download Priority Datasets (Priority: HIGH)
**High-value targets**:
- [ ] CMS Hospital Cost Reports (Form 2552-10) - FY 2022/2023
- [ ] CMS NHEA historical tables - 2022 data
- [ ] Medical Loss Ratio reports - aggregated 2022-2023
- [ ] BLS healthcare employment and wage data

**Action**: Work through DATA-INVENTORY.md checklist

### 3. Pilot Calculation (Priority: MEDIUM)
**Start with**: Medicare claims bottom-up (Approach 3)
- We have Medicare utilization data
- Literature should provide age-adjustment factors
- Can quickly get a rough estimate to test methodology

**Action**: Work through CALCULATIONS.md Approach 3 with real numbers

### 4. Read America's Bitter Pill (Priority: MEDIUM)
**Focus on**:
- Chapter on hospital pricing (chargemaster)
- Pharmaceutical/device lobbying sections
- Insurance complexity and ACA implementation
- Specific case studies and data sources used

**Action**: Skim for relevant content, take notes in LITERATURE.md

---

## Research Rigor Standards

This is not a blog post. We're aiming for:

- **Peer-reviewable methodology**: Clear assumptions, cited sources, reproducible calculations
- **Multiple validation approaches**: Cross-check estimates against known benchmarks
- **Transparent limitations**: Acknowledge data gaps and uncertainty ranges
- **Scholarly citations**: Proper attribution of ideas and data sources
- **Show the work**: Readers should be able to follow our logic and challenge assumptions

---

## Questions to Keep in Mind

1. **Attribution problem**: How do we separate direct care costs from overhead in aggregated spending data?
2. **Geographic variation**: Costs vary wildly by region - do we report national average, ranges, or both?
3. **Quality adjustment**: Does "waste" include necessary defensive medicine? How do we define "unnecessary"?
4. **Payment vs. cost**: Medicare pays $X, but does that reflect true cost to deliver?
5. **Counterfactual**: What's the comparison? Single-payer? Private market? International peers?

---

## Style & Tone

- **Analytical, not polemical**: Let the data tell the story
- **Accessible to educated non-experts**: Explain concepts clearly, avoid jargon
- **Rigorous but readable**: Academic-quality analysis, magazine-quality writing
- **Blake's voice**: Direct, skeptical, systems-thinker perspective

---

## Output Plan

### Part 1: The Question (~2,000 words)
- Why this matters
- What we actually know vs. assume
- Our approach and methodology
- Preview of findings

### Part 2: Methodology (~3,000 words)
- Data sources in detail
- Four calculation approaches
- Assumptions and limitations
- Validation strategy

### Part 3: Findings (~4,000 words)
- Cost estimates from each approach
- Breakdown of where money goes
- Waste quantification
- Comparison to peer countries

### Part 4: Implications (~2,500 words)
- What this means for policy
- How to drive costs down
- Trade-offs and challenges
- Path forward

### Part 5: Interactive Tools
- Cost calculator (adjust assumptions, see impact)
- Data visualization of spending flows
- Comparison explorer (US vs. peer countries)

**Total**: ~12,000 words + interactive elements

---

## Timeline (Rough)

- **Week 1-2**: Literature review + data acquisition
- **Week 3-4**: Calculations and validation
- **Week 5**: Draft Part 1 + Part 2
- **Week 6**: Draft Part 3 + Part 4
- **Week 7**: Build interactive tools
- **Week 8**: Review, revisions, publish

---

## Collaboration Notes

This is a collaborative research project between Blake and Chief (AI assistant). Division of labor:

**Blake**:
- Strategic direction and framing
- Domain expertise (healthcare BD, claims data)
- Contextual insights (industry dynamics, incentives)
- Final review and editorial control

**Chief**:
- Literature search and synthesis
- Data acquisition and processing
- Calculation execution
- Draft writing (Blake's voice)

---

## Resources

**Key books**:
- America's Bitter Pill (Steven Brill)
- [Add others as identified]

**Key datasets**:
- CMS public use files (see DATA-INVENTORY.md)
- OECD health data
- Academic studies

**Contact for questions**:
- Blake Thomson - blake@blakethomson.com

---

**Project started**: 2026-02-26  
**Last updated**: 2026-02-26  
**Status**: Research design phase
