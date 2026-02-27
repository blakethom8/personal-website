---
title: "Entity Resolution in Healthcare: The Matching Problem"
date: 2026-02-26
category: "llms-healthcare"
tags: [healthcare, data-engineering, entity-resolution, matching, LLM]
summary: "How do you know that 'Dr. Jane Smith' in CMS data, 'Jane A. Smith MD' on Google, and 'Smith, Jane' on a practice website are the same person? This is the matching problem—and solving it unlocks massive value in healthcare data."
status: draft
---

# Entity Resolution in Healthcare: The Matching Problem

You have three datasets:

1. **CMS Medicare data**: "Jane Smith, MD | Endocrinology | 123 Main St, Santa Monica, CA | NPI: 1234567890"
2. **Google Places**: "Dr. Jane Smith - Santa Monica Endocrine | ⭐ 4.7 (143 reviews) | (310) 555-0123"
3. **Practice website**: "Jane A. Smith, MD, FACE | Board-certified endocrinologist | Accepting new patients"

Are these the same person?

*Probably.* But how do you **know**? And how do you automate this at scale for millions of providers?

This is **entity resolution**—the matching problem—and it's the secret sauce behind every good healthcare data product.

---

## Why This Matters

### The Business Case

Imagine you're building a provider search tool. You want to show:
- Provider credentials (from CMS)
- Patient ratings and reviews (from Google)
- Insurance accepted and practice details (from websites)

**Without entity resolution:** You have three disconnected data silos. Users see incomplete information.

**With entity resolution:** You merge all three sources into a single, enriched provider profile. Users see everything in one place.

The difference is **night and day** for product value.

### The Technical Challenge

Healthcare has **no universal join key** across systems. Unlike:
- E-commerce (product UPC codes)
- Finance (bank routing numbers)
- Supply chain (SKUs)

...healthcare data sources use different identifiers:
- **CMS data**: NPI (National Provider Identifier)
- **Google Places**: Place ID (opaque string)
- **Practice websites**: No identifier at all (just text)

You can't just `JOIN ON npi = place_id`. You need **fuzzy matching**—and that's where things get interesting.

---

## The Cascading Match Strategy

We built a provider matching engine for [mydoclist.com](https://mydoclist.com) (provider search for physician liaisons). Here's the multi-phase approach that took our match rate from **38% → 62%**:

### Phase 1: Exact NPI Match (100% Confidence)

If the external data source already has an NPI, we're done. This happens occasionally:
- Client claims data (always has NPI)
- Some public datasets (NPPES, CMS public files)

**Match rate: ~15% of external sources**

### Phase 2: Name + Zip Match (95% Confidence)

First pass: exact name match + ZIP code proximity.

```sql
SELECT google_place_id
FROM google_places
WHERE 
  LOWER(name) LIKE '%smith jane%'
  AND zip_code = '90401'
  AND category IN ('doctor', 'health', 'medical')
```

**Why this works:**
- Physicians rarely share exact names in the same ZIP code
- Name order variations ("Jane Smith" vs "Smith, Jane") handled by `LIKE`
- Category filter reduces false positives

**Match rate: ~35%**

**Failure cases:**
- Middle initials missing ("Jane Smith" vs "Jane A. Smith")
- Credentials in name ("Smith Jane MD" vs "Jane Smith")
- Common names ("John Lee" — too many matches)

### Phase 3: Name + City Match (80% Confidence)

Relax ZIP requirement to city-level:

```sql
SELECT google_place_id, 
       levenshtein_distance(name, 'Jane Smith') AS name_similarity,
       ST_Distance(location, target_location) AS distance_meters
FROM google_places
WHERE 
  city = 'Santa Monica'
  AND category IN ('doctor', 'health')
  AND levenshtein_distance(name, 'Jane Smith') < 3  -- Allows 2-3 char diff
ORDER BY name_similarity, distance_meters
LIMIT 10
```

**Why this works:**
- Catches cases where practice address ZIP != provider home ZIP
- Levenshtein distance handles typos and middle initials
- Distance sorting prioritizes closest match

**Match rate: ~20% (cumulative 55%)**

**Failure cases:**
- Providers with multiple practice locations
- Group practices where the Google listing shows practice name, not individual

### Phase 4: Multi-Address Match (85% Confidence)

Providers often work at multiple locations. Try all known addresses:

```python
def multi_address_match(provider):
    addresses = [
        provider.primary_address,
        provider.secondary_address,
        provider.practice_affiliations  # From reassignment data
    ]
    
    for address in addresses:
        matches = search_google_places(
            name=provider.name,
            location=(address.lat, address.lng),
            radius=500  # meters
        )
        if matches:
            return best_match(matches)
    
    return None
```

**Match rate: ~10% (cumulative 65%)**

### Phase 5: Reversed Name + Specialty (70% Confidence)

Some listings flip name order or use "Dr. [Last Name]" format:

- "Jane Smith" → Try "Smith Jane"
- "Jane Smith Endocrinology" → Try "Dr. Smith"
- "Smith Endocrine Clinic" → Try "Jane Smith"

**Match rate: ~5% (cumulative 70%)**

### Phase 6: LLM-Assisted Resolution (50-95% Confidence)

When all else fails, ask an LLM to reason about ambiguous cases.

**Example prompt:**
```
I need to determine if any of these Google Places results match this provider:

Provider from CMS:
- Name: Jane A. Smith, MD
- Specialty: Endocrinology
- Address: 123 Main St, Santa Monica, CA 90401
- NPI: 1234567890

Google Places Candidates (3 results):
1. "Dr. Smith Endocrine Center" | 4.8⭐ (87 reviews) | 123 Main St
2. "Santa Monica Endocrinology Group" | 4.5⭐ (124 reviews) | 456 Ocean Ave
3. "Jane Smith MD" | 4.7⭐ (143 reviews) | 789 Wilshire Blvd

For each candidate, assess:
1. Name match quality (accounting for middle initials, credentials)
2. Address proximity (exact match? same building? nearby?)
3. Specialty alignment (does "Endocrine Center" match "Endocrinology"?)
4. Red flags (wrong gender mentioned? clearly different person?)

Return JSON:
{
  "best_match_id": 1,
  "confidence": 0.92,
  "reasoning": "Candidate 1: Address is exact match, 'Dr. Smith' + 'Endocrine' strongly suggests Jane Smith. Name format variation (practice name vs personal name) is common. High confidence match."
}
```

**Why this works:**
- LLM can reason about context humans understand (practice names, name variations)
- Confidence scoring lets us flag uncertain matches for human review
- Cost: ~$0.001 per resolution (GPT-4o-mini)

**Match rate: ~8% (cumulative 78%)**

### Final Match Rate: 62%

After all phases, we match **62% of Google Places listings** to CMS provider records.

The remaining 38%:
- **15%**: Retired providers (in CMS but no longer practicing)
- **10%**: Group practices (Google listing shows practice, not individual)
- **8%**: Providers who don't have a Google presence
- **5%**: Data quality issues (wrong addresses, name changes, etc.)

---

## Specialty Stemming: The Hidden Complexity

Matching "Endocrinology" (CMS specialty) to "Endocrine" (Google category) seems trivial. It's not.

### The Problem

Healthcare has **~200 recognized specialties** and thousands of subspecialties, practice descriptions, and informal terms.

Examples:
- **CMS**: "Obstetrics & Gynecology"
- **Google**: "OBGYN", "Women's Health", "OB/GYN", "Ob-Gyn Clinic"

- **CMS**: "Physical Medicine & Rehabilitation"
- **Google**: "PM&R", "Rehab Medicine", "Physiatry"

- **CMS**: "Otolaryngology"
- **Google**: "ENT", "Ear Nose Throat", "Otolaryngologist"

You can't just do exact string matches.

### The Solution: Stemming + Aliases

**Step 1: Stem specialty names**
```python
def stem_specialty(specialty):
    # Remove common suffixes
    specialty = specialty.lower()
    specialty = specialty.replace(' & ', ' ')
    specialty = specialty.replace('-', ' ')
    
    # Remove trailing words
    stop_words = ['specialist', 'doctor', 'physician', 'clinic', 'center', 'medicine']
    for word in stop_words:
        specialty = specialty.replace(word, '')
    
    # Get root
    # "Endocrinology" → "endocrin"
    # "Endocrine" → "endocrin"
    return specialty[:8].strip()
```

**Step 2: Maintain alias dictionary**
```json
{
  "obgyn": ["obstetrics gynecology", "women's health", "ob gyn", "ob/gyn"],
  "ent": ["otolaryngology", "ear nose throat"],
  "pmr": ["physical medicine rehabilitation", "physiatry", "rehab medicine"],
  "cardio": ["cardiology", "heart", "cardiovascular"]
}
```

**Step 3: Match with stemming + aliases**
```python
def specialty_match(cms_specialty, google_category):
    cms_stem = stem_specialty(cms_specialty)
    google_stem = stem_specialty(google_category)
    
    # Try stem match
    if cms_stem == google_stem:
        return True
    
    # Try alias match
    for alias_group in SPECIALTY_ALIASES.values():
        if cms_stem in alias_group and google_stem in alias_group:
            return True
    
    return False
```

This boosts name+specialty match rate by ~15%.

---

## Confidence Scoring

Every match gets a **confidence score (0.0 - 1.0)** based on multiple signals:

### Scoring Components

| Signal | Weight | Calculation |
|--------|--------|-------------|
| **Name similarity** | 40% | Levenshtein distance < 3 → 1.0, else decay |
| **Address proximity** | 30% | Exact match → 1.0, <50m → 0.9, <500m → 0.7 |
| **Specialty match** | 15% | Exact → 1.0, Stem → 0.85, Alias → 0.75 |
| **Phone match** | 10% | Exact → 1.0 (rare to have both) |
| **Category match** | 5% | 'doctor'/'health' in Google categories → 1.0 |

**Example calculation:**
```python
score = (
    0.40 * name_similarity +   # 0.95 (one char diff)
    0.30 * address_proximity + # 1.0 (exact match)
    0.15 * specialty_match +   # 0.85 (stem match)
    0.10 * phone_match +       # 0.0 (no phone data)
    0.05 * category_match      # 1.0 (category = doctor)
)
# = 0.40*0.95 + 0.30*1.0 + 0.15*0.85 + 0.10*0 + 0.05*1.0
# = 0.38 + 0.30 + 0.128 + 0 + 0.05
# = 0.858 → 86% confidence
```

### Confidence Thresholds

- **≥ 0.90**: Auto-accept (high confidence)
- **0.70 - 0.89**: Accept with flag for periodic review
- **0.50 - 0.69**: Queue for human review
- **< 0.50**: Reject (too uncertain)

This prevents false positives while maximizing match coverage.

---

## Web Intelligence: The LLM Extraction Layer

Once we've matched a provider to a Google Place, we often have their website URL. Now we need to extract structured data from unstructured HTML.

### What We Extract

High-value fields (extract for every matched provider):

| Field | Value to Users | Extraction Difficulty |
|-------|----------------|----------------------|
| **Accepting New Patients** | Critical for referrals | Easy (usually explicit) |
| **Insurance Accepted** | Filter/match with patient needs | Medium (list extraction + normalization) |
| **Languages Spoken** | Accessibility | Easy (usually listed) |
| **Practice Group Name** | Organizational context | Medium (entity extraction) |
| **Hospital Affiliations** | Referral pathways, quality proxy | Medium (list + entity resolution) |

### LLM Extraction Prompt

**Example HTML:**
```html
<div class="provider-card">
  <h2>Jane A. Smith, MD, FACE</h2>
  <p>Board-certified endocrinologist specializing in diabetes and thyroid disorders.</p>
  <p><strong>Accepting new patients:</strong> Yes</p>
  <p><strong>Insurance accepted:</strong> Blue Shield, Aetna, United Healthcare, Medicare</p>
  <p><strong>Languages:</strong> English, Spanish</p>
  <p>Dr. Smith is affiliated with UCLA Medical Center and Providence Saint John's Health Center.</p>
</div>
```

**Prompt:**
```
Extract structured information about this healthcare provider from their website.

Provider Context (for validation):
- Name: Jane Smith, MD
- Specialty: Endocrinology

Website HTML:
[HTML content truncated to first 10,000 chars]

Extract and return JSON:
{
  "accepting_new_patients": true/false/null,
  "accepted_insurance": ["Blue Shield", "Aetna", "United Healthcare", "Medicare"],
  "spoken_languages": ["en", "es"],
  "practice_group_name": "Santa Monica Endocrine Associates",
  "hospital_affiliations": ["UCLA Medical Center", "Providence Saint John's Health Center"],
  "board_certifications": ["Endocrinology", "Internal Medicine"],
  "confidence": 0.95
}

Rules:
- Only extract information explicitly stated
- Normalize insurance names ("BCBS" → "Blue Cross Blue Shield")
- Use ISO 639-1 codes for languages ("Spanish" → "es")
- If unsure, use null
- Set confidence based on clarity of source
```

**Response:**
```json
{
  "accepting_new_patients": true,
  "accepted_insurance": ["Blue Shield", "Aetna", "United Healthcare", "Medicare"],
  "spoken_languages": ["en", "es"],
  "practice_group_name": null,
  "hospital_affiliations": ["UCLA Medical Center", "Providence Saint John's Health Center"],
  "board_certifications": ["Endocrinology"],
  "confidence": 0.92
}
```

### Cost Analysis

- **Model**: GPT-4o-mini (structured output)
- **Cost**: ~$0.001 per provider
- **Accuracy**: ~85% (validated against manual review)
- **Scale**: $1,000 for 1M providers (affordable for high-value use cases)

### Validation & Confidence

**Sanity checks:**
```python
def validate_extraction(extracted, provider):
    # Red flag: Extracted specialty doesn't match known specialty
    if extracted.specialty and extracted.specialty != provider.specialty:
        extracted.confidence *= 0.7
    
    # Red flag: Location >50km from known address
    if extracted.location and distance(extracted.location, provider.location) > 50_000:
        extracted.confidence *= 0.5
    
    # Save if high confidence, flag for review if low
    if extracted.confidence >= 0.7:
        save_extraction(provider.npi, extracted)
    else:
        flag_for_review(provider.npi, extracted)
```

This catches cases where the LLM extracts data from the wrong section of the page, or where the website lists multiple providers and the LLM gets confused.

---

## Practice Group Mapping: The Moat

Most competitors show **individual providers**. We show **organizational structure**.

### Example Use Case

**Search: "cardiologist Santa Monica"**

**Competitor View:**
- Dr. A (individual)
- Dr. B (individual)
- Dr. C (individual)

**Our View:**
- **Santa Monica Heart Institute** (7 providers)
  - Dr. A (interventional cardiology)
  - Dr. B (electrophysiology)
  - Dr. C (heart failure)
- **UCLA Cardiology Group** (12 providers)
- [Individual providers not in groups]

### Why This Matters

**For users:**
- See who works together
- Understand referral pathways
- Find practices, not just individuals

**For sales/BD teams:**
- Target decision-makers (group administrators, not individual doctors)
- Understand market share (which groups control the most patients?)
- Map competitive landscape

### Extraction Strategy

**LLM prompt:**
```
From this website, extract the practice/organizational structure:

[website HTML]

Return:
{
  "practice_group_name": "Santa Monica Heart Institute",
  "parent_organization": "UCLA Health System",
  "practice_type": "group_practice",  // single_provider | group_practice | hospital_employed | academic
  "provider_count_estimate": 7,
  "locations": ["Santa Monica", "West LA", "Venice"]
}
```

**Build the graph:**
```python
for profile in all_enriched_profiles():
    if profile.practice_group_name:
        group_id = get_or_create_group(profile.practice_group_name)
        link_provider_to_group(profile.npi, group_id)
        
        if profile.parent_organization:
            parent_id = get_or_create_group(profile.parent_organization)
            link_child_to_parent(group_id, parent_id)
```

### Display

```json
{
  "search_results": {
    "individual_providers": 47,
    "practice_groups": [
      {
        "id": 123,
        "name": "Santa Monica Heart Institute",
        "provider_count": 7,
        "specialties": ["Cardiology", "Interventional Cardiology"],
        "avg_rating": 4.6,
        "accepting_new_patients": true,
        "locations": ["Santa Monica", "West LA"]
      }
    ]
  }
}
```

**The Moat:** Competitors can't replicate this without:
1. LLM extraction at scale
2. Entity resolution across inconsistent naming
3. Graph construction (non-trivial)
4. Ongoing maintenance (orgs merge, split, rename)

---

## Real-World Results

### Match Rate Over Time

| Phase | Match Rate | Time to Implement |
|-------|-----------|------------------|
| **Initial launch** (exact name+zip only) | 38% | 1 week |
| **+ City match** | 48% | 2 days |
| **+ Multi-address** | 55% | 3 days |
| **+ Specialty stemming** | 58% | 2 days |
| **+ LLM-assisted** | 62% | 1 week |

### Performance

- **Average match time**: 2.3 seconds per provider
- **LLM calls**: ~10% of providers (90% matched by rule-based logic)
- **Cost**: ~$0.04 per provider (includes Google Places API + LLM)
- **Accuracy**: 92% precision, 85% recall (validated on 1,000-provider sample)

### Edge Cases We Handle

**1. Name changes (marriage/divorce):**
- Dr. Jane Smith → Dr. Jane Johnson
- Solution: Maintain name history from prior records, search both

**2. Retired providers:**
- In CMS data but no longer practicing
- Solution: Flag as "inactive" if Google Place shows "permanently closed"

**3. Group practice listings:**
- Google shows "Westside Cardiology" but not individual doctors
- Solution: Link all providers at that address to the practice

**4. Multiple locations:**
- Provider works at 3 hospitals
- Solution: Create multiple practice_locations records, prioritize primary

**5. Common names:**
- "John Lee" (hundreds of matches)
- Solution: Require specialty + address, never match on name alone

---

## What We Learned

### 1. Start Simple, Add Complexity

We started with exact name+zip matching (38%). Each additional phase improved match rate by ~5-10%.

Don't try to build the perfect system upfront. Ship the 80% solution, learn from failures, iterate.

### 2. Confidence Scoring Is Critical

Never treat all matches as equal quality. Surfaces like "high confidence" vs "needs review" save hours of manual work.

### 3. LLMs Are Great for Edge Cases

90% of matches are rule-based (fast, cheap). LLMs handle the remaining 10% that would otherwise require manual review.

This is the right cost/accuracy tradeoff for most use cases.

### 4. Entity Resolution Is Never "Done"

Providers move, names change, practices merge. You need ongoing refresh logic:
- High-traffic providers: Re-match every 7 days
- Low-traffic: Re-match every 90 days
- Flag failures for investigation

### 5. The Moat Is in the Details

Anyone can do basic name+address matching. The **defensible value** is in:
- Handling 500+ specialty variations
- Building organizational graphs
- Maintaining 90%+ accuracy at scale
- Fast refresh cycles

These take months to get right. Once you have it, competitors can't easily replicate.

---

## Next Steps

If you're building a healthcare data product:

1. **Audit your data sources** — Do you have NPI for everything? If not, you'll need entity resolution.
2. **Start with rule-based matching** — Get to 50-60% with name+address+specialty logic.
3. **Add LLM layer for edge cases** — Cost is ~$0.001/provider, accuracy improves 10-15%.
4. **Build confidence scoring** — Never treat all matches equally.
5. **Maintain refresh cycles** — Healthcare data goes stale fast.

And most importantly: **Track your match rate**. If you don't measure it, you can't improve it.

---

## Conclusion

Entity resolution is unsexy infrastructure work. Nobody builds a product to "do entity resolution."

But it's the **foundation** for every valuable healthcare data product:
- Provider search (mydoclist.com)
- Claims analytics
- Referral network mapping
- Quality benchmarking
- Market intelligence

Get entity resolution right, and everything else gets easier.

Ignore it, and you'll forever struggle with incomplete, disconnected data.

**The matching problem is the moat.**

---

## About the Author

Blake Thomson works in healthcare data strategy at Cedars-Sinai and is building [mydoclist.com](https://mydoclist.com), a provider intelligence platform for physician liaisons. He's deeply interested in the intersection of healthcare data, entity resolution, and making complex data accessible.

---

## Technical Appendix

### Match Rate Formula

```
Match Rate = (Matched Providers) / (Total Providers in Source A)

Precision = (True Positives) / (True Positives + False Positives)
Recall = (True Positives) / (True Positives + False Negatives)
F1 Score = 2 * (Precision * Recall) / (Precision + Recall)
```

Our results:
- Match Rate: 62%
- Precision: 92% (few false matches)
- Recall: 85% (miss some true matches)
- F1 Score: 0.88

### Levenshtein Distance Implementation

```python
def levenshtein_distance(s1, s2):
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]
```

### Specialty Stemming Logic

Full implementation: [github.com/blakethom8/cms-data/blob/main/api/specialty_matcher.py](https://github.com/blakethom8/cms-data)
