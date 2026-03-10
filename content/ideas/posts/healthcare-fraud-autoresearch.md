---
title: "90 Million Records, One Eval Script: Building a Medicare Fraud Detector Overnight"
date: "2026-03-10"
tags: ["healthcare-data", "fraud-detection", "machine-learning", "CMS", "autoresearch"]
excerpt: "Karpathy's autoresearch pattern — an AI agent that iterates on a model while a fixed eval script keeps score — turns out to work surprisingly well for Medicare fraud detection. Here's what happened when we pointed it at 90M claims records."
readTime: "12 min"
featured: true
category: "healthcare-data"
---

# 90 Million Records, One Eval Script: Building a Medicare Fraud Detector Overnight

*What Karpathy's autoresearch pattern looks like when you point it at Medicare claims data.*

---

## The Pattern: Autoresearch

Andrej Karpathy described a deceptively simple idea: give an AI agent a fixed evaluation script it cannot touch, and let it iterate freely on the model until the score improves. The eval is the oracle. The agent is the researcher. You go to sleep.

The key constraint is what makes it work. **The eval must be objective and automated.** You can't autoresearch "is this essay well-written?" But you can autoresearch anything with a ground truth score: ML model val loss, a benchmark suite, test coverage — or, as it turns out, a government exclusion list.

We applied this pattern to healthcare fraud detection. The eval script checked our model's AUC against a fixed set of known bad actors. The agent — Claude Sonnet — iterated on the scoring logic. Eighteen iterations later, we went from AUC 0.556 to 0.810. Not bad for an overnight run.

---

## The Setup

**The data:** 90M+ records in DuckDB, loaded from CMS public datasets:
- Medicare Part B physician/supplier claims (utilization + payments)
- Part D prescription drug data
- Open Payments (pharmaceutical industry payments to providers)
- NPPES provider registry (8M+ providers)
- PECOS enrollment data
- CMS Doctors & Clinicians

**The ground truth:** The OIG LEIE — the federal exclusion list of providers kicked out of Medicare for fraud, abuse, or other violations. We matched against the most recent exclusions (2024–2026) and found 181 exact NPI matches in our CMS universe. That's 0.015% prevalence across 1.2M physicians.

**The eval script:** Fixed, untouchable. It loads the scoring output, merges with the ground truth labels, and returns AUC. That number is all the agent sees.

**The model script:** The agent's playground. Generates a fraud score for every provider based on billing patterns, prescribing behavior, payment relationships, and enrollment signals.

---

## The Iterations

The progression wasn't linear. It was messy — which is the point. A human researcher would give up after a drop; the agent kept going.

| Version | AUC | Key Change |
|---------|-----|-----------|
| V1 (baseline) | 0.556 | Raw billing z-scores |
| V2 | 0.769 | Z-scores within specialty |
| V3 | 0.741 | Added more features — AUC dropped |
| V5 | 0.784 | Simplified back, cleaned weights |
| V8 | 0.795 | Discovered max(subscores) pattern |
| V12 | 0.808 | Tuned subscore weights |
| V15 (final) | **0.810** | Consolidated, production-ready |

The biggest single jump — from 0.556 to 0.769 — came from a single insight: **normalize billing patterns within specialty, not across all physicians.** A psychiatrist billing 300 services per patient looks insane compared to all doctors. Compared to other psychiatrists, it might be normal.

The second major discovery came around V8: **max(subscores) beats any weighted average.** This took several iterations to find because it's counterintuitive. More features, combined via weighted average, made the model worse. Why?

Fraud doesn't look suspicious on every dimension simultaneously. It looks *extremely* suspicious on one. A doctor billing $23 million to 30 patients doesn't also have unusual opioid rates and unusual specialty patterns — they have one massive outlier and everything else looks fine. `max(subscores)` captures that. Weighted averaging dilutes it.

---

## The Features That Worked

After 18 iterations, the final scoring model uses six subscores, combined via `max()`:

**1. Services per beneficiary (within specialty)**
The single most predictive feature. How many services does this doctor bill per patient, compared to peers in the same specialty? The most extreme outliers here are almost always worth investigating.

**2. Total Medicare payment (within specialty)**
Raw dollar volume normalized by specialty. Oncologists bill more than family practitioners — this accounts for that.

**3. Long-acting opioid rate (within specialty)**
What fraction of prescriptions are long-acting opioids? A pain management physician with a high rate isn't suspicious. A dentist is.

**4. Open Payments received (within specialty)**
Pharmaceutical industry payments. A cardiologist receiving $500K in payments isn't unusual. A general practitioner is.

**5. Beneficiary risk score (within specialty)**
Average patient HCC risk score. Fraud schemes sometimes involve upcoding patient complexity to justify higher billing.

**6. Services-to-beneficiary ratio**
A simpler version of feature 1, captured differently. Serves as a secondary signal.

---

## What Didn't Work

**PECOS enrollment gaps:** Providers who aren't enrolled in PECOS for their specialty are technically anomalous. But we found this feature was mostly capturing providers who got excluded *and then* lost enrollment — post-exclusion leakage, not a predictive signal. Adding it inflated the suspect list with the wrong providers.

**HCPCS code concentration:** A single billing code dominating a provider's claims sounds suspicious. In practice, specialists legitimately bill one code 90% of the time. This added noise without signal.

**Taxonomy mismatches:** Provider specialty from NPPES vs. what they're billing for. Again, too many legitimate reasons for this to be a reliable signal.

The pattern: features that sound intuitively suspicious often fail because there are too many legitimate explanations. The features that work are extreme outliers on simple, hard-to-game metrics.

---

## The Suspects

> ⚠️ **Pseudonyms only.** The providers below are identified by fictional names. Real NPIs, billing data, and geographic data are real — but names have been replaced with placeholders. We do not publish provider names without independent verification. Billing anomalies are not evidence of fraud; they're signals worth investigating.

The top of our suspect list after V15 scoring:

**Dr. Alpha** — Internal Medicine, Northern California
11,000+ services billed to 246 patients. That's roughly 45 services per patient. For internal medicine, the specialty average is well under 10. Even accounting for complex patients, this is statistically implausible. No licensing actions found in public records at time of analysis.

**Dr. Beta** — Nurse Practitioner, Southwest US  
$23+ million in Medicare payments. To 30 patients. Over one year. That's $775,000 per patient. The next-highest NP in the same state billed $4M total.

**Dr. Gamma** — Family Practice, Southeast US  
$11+ million in Medicare payments to 104 patients. $106,000 per patient for family medicine. The specialty average is under $3,000.

We also ran validation on providers the model flagged for different reasons. What we found:

**False positives that taught us something:**

*A psychiatrist in Oklahoma billing $32M in drug costs* — initially our highest-dollar flag. Turned out: subspecialist treating tardive dyskinesia with Ingrezza, a drug that costs $7,700 per claim. Fully legitimate. The model had no way to know the drug price.

*A cluster of providers at a single Indianapolis address with 48,000 services per patient* — academic cancer center doing hemophilia factor infusions. Each infusion = one service, multiple infusions per visit. Completely legitimate; the metric just doesn't work for this care type.

*15,000 providers at one address in suburban Detroit* — headquarters of a large ABA therapy company. Address normalization issue.

These false positives aren't failures — they're the point. The model finds outliers. Humans determine if the outlier is bad.

---

## What the Pattern Taught Us

**1. Autoresearch works when the eval is honest.**
The fixed eval script is everything. The moment you let the agent see or touch the eval, you're optimizing for a proxy, not the real thing. We kept the eval identical across all 18 iterations.

**2. Specialty context is non-negotiable in healthcare.**
Raw billing volume means nothing. Volume within specialty means a lot. This is true for almost any healthcare metric — always normalize within peer group before doing anything else.

**3. Max beats average for anomaly detection.**
This is probably generalizable beyond fraud. If you're looking for bad actors, they tend to be extreme on one dimension, not moderately bad across all of them. `max(subscores)` is a simple, underused trick.

**4. Ground truth is the hard part.**
181 labels in 1.2M providers is brutal. AUC of 0.81 with that prevalence is actually meaningful — but you need to be careful about what the labels represent. Our LEIE matches skew recent (2024–2026) because older exclusions don't appear in current CMS data. That's a selection bias the model can't see.

**5. Human validation is step two, not optional.**
The model produces a ranked suspect list. That list is a research agenda, not a finding. Each provider needs: web search, state licensing board check, OIG press release search, and specialty context. The model handles the 90 million records. Humans handle the final 30.

---

## What's Next

The model is live on our infrastructure. Next steps:

- **Frontend explorer** — search by NPI, see score breakdown, flag for review
- **Automated validation pipeline** — web search + state board lookup for top suspects
- **Expand ground truth** — DOJ healthcare fraud press releases as additional labels
- **Network analysis** — referral rings and billing clusters
- **Geographic clustering** — fraud tends to concentrate; the model currently treats providers as independent

The code is open source: [github.com/blakethom8/cms-fraud-detection](https://github.com/blakethom8/cms-fraud-detection)

---

## The Bigger Point

Healthcare fraud costs Medicare $60B+ annually. The CMS data to detect it is public. The tools to analyze it are cheap. The pattern — a fixed oracle, an iterating agent, overnight compute — costs almost nothing to run.

The thing that's been missing isn't compute or data or models. It's the combination of domain knowledge and willingness to dig in. Knowing that you need to normalize within specialty. Knowing that max beats average for this problem. Knowing which features are noise. That's the judgement part. The AI handles the intelligence.

This is one small example of what happens when you point the autoresearch pattern at a domain someone actually understands.
