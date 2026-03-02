---
title: "Why Your Doctor Doesn't Know Your Name"
date: "2026-02-26"
excerpt: "Your doctor's office can't reliably tell which John Smith you are across two different systems. That's not a tech problem — it's a 50-year-old design choice we never fixed."
readTime: "5 min"
category: "healthcare-data"
tags: ["healthcare", "data", "entity-resolution", "opinion"]
featured: false
---

# Why Your Doctor Doesn't Know Your Name

Your doctor's office has your chart. They have your name, date of birth, address, insurance card. They *know* you.

Except they don't.

Not reliably, anyway.

If you show up at the same practice but your insurance changed, there's a decent chance the front desk will create a *second* patient record for you. Now you have two charts. One has your mammogram from last year. The other has your blood work from this month. The doctor looking at your record on Tuesday is seeing incomplete data.

This isn't incompetence. It's not a training problem. It's a **design problem** built into how healthcare IT works.

And it's been this way for 50 years.

---

## The Problem: No Universal Patient ID

Healthcare data systems can't tell if two records refer to the same person without human judgment.

**Why?**

Because in 1999, Congress banned the creation of a national patient identifier. The concern was privacy — a single ID that could link your records across every hospital, pharmacy, and insurer felt Orwellian.

So instead, every system uses its own identifiers:

- Your doctor's EHR assigns you a **Medical Record Number (MRN)**
- The lab uses a different **Accession Number**
- The hospital assigns you a different **MRN** (even if it's the same health system)
- Your insurance company has a **Member ID**
- The pharmacy has a **Prescription Number**
- Medicare has your **Medicare Beneficiary Identifier (MBI)**

None of these IDs talk to each other. When two systems try to share your data, they have to **guess** if the records match based on:
- Name (but maybe you got married)
- Date of birth (but maybe it was entered wrong)
- Address (but maybe you moved)
- Social Security Number (but half the systems don't ask for it)

If any of those fields don't match *exactly*, you might get a duplicate record. And if they match *too loosely*, you might get merged with the wrong person.

---

## The Real-World Consequence

I work with claims data. I see this constantly.

Here's a real example (anonymized):

**Patient: John Smith**
- DOB: 1985-03-15
- Address: 123 Main St, Apt 4B, Santa Monica, CA

**Claim 1 (January):**
- Name: John Smith
- DOB: 03/15/1985
- Address: 123 Main St Apt 4B Santa Monica CA 90401

**Claim 2 (March):**
- Name: John A Smith
- DOB: 03/15/1985
- Address: 123 Main Street #4B Santa Monica CA 90401

**Claim 3 (June):**
- Name: John Smith
- DOB: 03/15/1985
- Address: 456 Ocean Ave Santa Monica CA 90401 *(he moved)*

Are these the same person?

**Probably.** But the matching algorithm has to decide:
- Is "Apt 4B" the same as "#4B"? (Yes)
- Is "Main St" the same as "Main Street"? (Yes)
- Is "John Smith" the same as "John A Smith"? (Probably — middle initial added)
- Did John Smith move, or is this a different John Smith? (Unclear)

A conservative algorithm creates three separate records. Now John's care history is fragmented.

A loose algorithm merges them. Great — unless there *are* two John Smiths born on the same day in Santa Monica. Now you've mixed up their records.

---

## Entity Resolution Is the Invisible Labor

Every healthcare data system has to solve this problem. It's called **entity resolution** — figuring out which records refer to the same real-world entity (person, doctor, hospital, whatever).

Most systems solve it badly.

**The naive approach:**
Match on name + DOB. If both match, assume it's the same person.

**The problem:**
- Common names (John Smith, Maria Garcia) cause tons of false positives
- Typos and variations ("Jon Smith", "John Smyth") cause false negatives
- Name changes (marriage, divorce) break the match entirely

**The better approach:**
Use a **cascading match strategy** with confidence scoring:

1. **Exact match:** Name + DOB + SSN → 99% confidence
2. **High match:** Name + DOB + Address (fuzzy) → 95% confidence
3. **Medium match:** Name + DOB (fuzzy) → 70% confidence
4. **Low match:** Name only (within 10-mile radius) → 50% confidence

Flag uncertain matches for human review. Never auto-merge below 90% confidence.

This is how I built the entity resolution engine for the CMS data pipeline. And it's *still* only 92% accurate — meaning 8% of matches are wrong or uncertain.

That's on clean, structured, public data with NPIs as a join key. Imagine how bad it is in EHRs where half the data is free text.

---

## Why This Matters

Healthcare is obsessed with "data interoperability." We want your records to follow you from doctor to hospital to specialist to pharmacy seamlessly.

But we can't even agree on who "you" are.

Every data exchange requires entity resolution:
- When your doctor sends a referral to a specialist
- When the lab sends results back to your doctor
- When your insurance approves a prior authorization
- When a hospital looks up your medication list

If the matching algorithm gets it wrong, one of two things happens:
1. **False negative:** Your records don't link. The doctor doesn't see your allergy. You get prescribed the wrong drug.
2. **False positive:** Your records merge with someone else's. Now your chart has their diabetes diagnosis. Your insurance denies a claim because of something you never had.

Both are dangerous. Both happen every day.

---

## The "Solution" That Doesn't Work

The healthcare industry's answer to this problem: **Master Patient Index (MPI)**.

An MPI is a central database that assigns a unique ID to each patient and maintains the mappings across all the hospital's systems.

**In theory:**
- Patient shows up
- Front desk scans driver's license
- MPI matches them to existing record (or creates new one)
- All systems use the MPI ID
- Everything links correctly

**In practice:**
- MPI software costs $500K - $2M
- It still has to do entity resolution (same fuzzy matching problem)
- Each hospital has its own MPI (no coordination across hospitals)
- MPI doesn't help with external labs, pharmacies, or insurance companies
- The matching algorithm is still guessing based on name + DOB + address

MPIs help, but they don't solve the fundamental problem: **There's no universal join key.**

---

## What Would Actually Fix This

**Option 1: National Patient ID**

Congress could reverse the 1999 ban and create a national patient identifier. Every person gets a unique ID at birth (or SSN equivalent). All systems use it.

**Why it won't happen:**
Privacy concerns, cost, political will.

**Option 2: Federated Identity (Blockchain Hype Version)**

Patients control their own identity. When you visit a doctor, you present a cryptographic credential that proves "I am patient X" without revealing all your data to a central authority.

**Why it won't happen:**
Too complex, nobody agrees on standards, patients don't want that much responsibility.

**Option 3: Just Get Better at Fuzzy Matching**

Accept that we'll never have a universal ID. Invest in really good entity resolution algorithms using:
- Machine learning to recognize name variations
- Address standardization (USPS validation)
- Phone number matching
- LLMs to reason about ambiguous cases

**Why this might work:**
We're already doing it. The matching algorithms are getting better. LLMs can resolve ambiguous cases ("Is 'Jane Smith MD' at 123 Main St the same as 'Dr. J. Smith' at 123 Main Street?" — probably yes).

The cost is low (~$0.001 per match with GPT-4o-mini). Accuracy is improving (92% → 95%+ with LLM assistance).

It's not perfect. But it's pragmatic.

---

## What I Learned Building This

I've built entity resolution engines for:
- CMS provider data (1.2M providers → Google Places)
- Claims data (90M rows of Medicare claims)
- NPPES data (8M healthcare professionals)

Every single one has the same problem: **no universal join key.**

The best you can do:
1. Use as many signals as possible (name, address, phone, specialty, NPI)
2. Build a cascading match strategy (try exact match, fall back to fuzzy, use LLM for edge cases)
3. Confidence-score every match (never treat 50% confidence the same as 99%)
4. Flag uncertain matches for human review
5. Maintain a feedback loop (humans correct mistakes → algorithm learns)

This gets you to 90-95% accuracy. The last 5-10% requires human judgment.

And that's on structured, public data. EHRs are messier.

---

## The Punchline

Your doctor's office doesn't know your name because **healthcare never agreed on how to identify people.**

Every system invents its own ID. Every data exchange requires fuzzy matching. Every match is a guess with a confidence score.

We've been doing this for 50 years. We've gotten better at it. But we've never fixed the root cause.

And until we do, your doctor will keep asking: "Is this the right John Smith?"

---

*This is part of the work I do at Cedars-Sinai and in building mydoclist.com — entity resolution for healthcare data. If you work in health tech and deal with patient/provider matching, I'd love to hear how you solve it. DM me.*
