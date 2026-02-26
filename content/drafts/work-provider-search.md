---
title: "Provider Search: AI-Native Healthcare Discovery"
type: work
date: "2026-02-26"
tags: ["work", "healthcare", "fastapi", "react", "ai"]
status: "live"
url: "https://mydoclist.com"
github: "https://github.com/blakethom8/provider-search"
excerpt: "A provider search tool that doesn't just look pretty — it speaks to AI agents. Built for physician liaisons who need fast, enriched provider intelligence."
featured: true
---

# Provider Search: AI-Native Healthcare Discovery

**Built for physician liaisons. Designed for both humans and AI agents.**

---

## The Problem

Physician liaisons spend hours every week searching for providers — cardiologists in West LA, orthopedic surgeons near a hospital, endocrinologists who speak Spanish. They need names, addresses, ratings, NPI numbers, and often details buried across multiple sources.

Existing tools are either:
- **Too simple** — Google Maps shows ratings but no NPI data
- **Too clunky** — NPPES has NPIs but no ratings, terrible UX
- **Too expensive** — Enterprise tools cost $30K+ per year

I built something in the middle: **fast, free (or cheap), and actually useful.**

---

## The Tech Stack

```
Frontend:  React 18 + TypeScript + TailwindCSS
Backend:   FastAPI (Python 3.11)
Database:  Supabase (PostgreSQL + Auth)
Data:      Google Places API + NPPES NPI Registry
Deploy:    Docker Compose on Hetzner VPS ($5/month)
```

**Why these choices:**
- **FastAPI** — Async by default, fast, auto-generated docs
- **React** — Better UX than Streamlit, not as complex as Next.js
- **Supabase** — Free tier is generous, handles auth + database + real-time
- **Google Places** — Best source for ratings, reviews, and phone numbers
- **NPPES** — Authoritative source for NPI data (federal registry)

---

## The Architecture

### Search Flow

When a user searches "gastroenterologist Pasadena," here's what happens:

```
┌─────────────────────────────────────────────────────────┐
│  1. PARSE QUERY                                          │
│     Input:  "gastroenterology doctors in Pasadena"       │
│     Output: { specialty, location, radius }              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. GOOGLE PLACES API (Primary Source)                  │
│     Endpoint: nearbysearch + place details               │
│     Returns:  name, address, phone, rating, lat/lng      │
│     Speed:    ~1.5 seconds for 20 results                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. NPPES ENRICHMENT                                     │
│     For each result:                                     │
│       • Search by name + city + state                    │
│       • Fuzzy match confidence scoring                   │
│       • Add: NPI, taxonomy code, credentials             │
│     Speed:    ~0.5 seconds for 20 providers              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. MERGE & RETURN                                       │
│     Combined data:                                       │
│       • Google: ratings, reviews, hours, photos          │
│       • NPPES: NPI, specialty, credentials               │
│     Format: JSON array of enriched provider objects      │
│     Total time: < 3 seconds                              │
└─────────────────────────────────────────────────────────┘
```

**Response structure:**
```json
{
  "query": "gastroenterologist Pasadena",
  "total_results": 47,
  "providers": [
    {
      "npi": "1234567890",
      "name": "Jane Smith, MD",
      "specialty": "Gastroenterology",
      "practice_name": "Pasadena GI Associates",
      "address": "123 Main St, Pasadena, CA 91101",
      "phone": "(626) 555-1234",
      "rating": 4.7,
      "review_count": 143,
      "lat": 34.1478,
      "lng": -118.1445,
      "place_id": "ChIJ...",
      "data_sources": ["google_places", "nppes"]
    }
  ]
}
```

---

## Four View Modes

Most search tools lock you into one layout. Provider Search adapts to how you work.

### 1. Table View
**Use case:** Scanning many results quickly, sorting by distance or rating

```
┌────────────────────────────────────────────────────────────┐
│ Name           │ Specialty    │ Rating │ Distance │ Phone  │
├────────────────────────────────────────────────────────────┤
│ Dr. Jane Smith │ Cardiology   │ 4.8    │ 1.2 mi   │ 555... │
│ Dr. John Doe   │ Cardiology   │ 4.5    │ 2.4 mi   │ 555... │
│ ...            │ ...          │ ...    │ ...      │ ...    │
└────────────────────────────────────────────────────────────┘
```

Sortable columns, infinite scroll, keyboard shortcuts.

### 2. Split View (Default)
**Use case:** See both map and list, click a pin to highlight the card

```
┌────────────────┬───────────────────────────────────┐
│                │  Dr. Jane Smith, MD               │
│                │  ⭐ 4.8 (143 reviews)             │
│     MAP        │  Pasadena GI Associates           │
│   (pins for    │  (626) 555-1234                   │
│   providers)   │  [View Details] [Add to List]     │
│                ├───────────────────────────────────┤
│                │  Dr. John Doe, MD                 │
│                │  ⭐ 4.5 (89 reviews)              │
└────────────────┴───────────────────────────────────┘
```

Linked interactions: click a card → map pans to that provider.

### 3. Kanban / Pipeline View
**Use case:** Organizing providers by outreach status

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ New Leads   │ Contacted   │ Meeting Set │ Active      │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Dr. Smith   │ Dr. Johnson │ Dr. Lee     │ Dr. Brown   │
│ Dr. Davis   │ Dr. Wilson  │             │ Dr. Garcia  │
│ [+ 10 more] │ [+ 5 more]  │             │ [+ 3 more]  │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

Drag-and-drop between stages. Status persists to database.

### 4. Browse / Card View
**Use case:** Visual browsing, seeing photos and full details

```
┌────────────┐  ┌────────────┐  ┌────────────┐
│ [Photo]    │  │ [Photo]    │  │ [Photo]    │
│            │  │            │  │            │
│ Dr. Smith  │  │ Dr. Doe    │  │ Dr. Lee    │
│ Cardiology │  │ Cardiology │  │ Cardiology │
│ ⭐ 4.8     │  │ ⭐ 4.5     │  │ ⭐ 4.7     │
└────────────┘  └────────────┘  └────────────┘
```

Grid layout, responsive, hover for quick details.

---

## The Agent-Native Layer

This is where it gets interesting.

### The Problem With Traditional UIs

AI agents (Gemini in Chrome, Claude Desktop, OpenClaw) can *use* normal websites, but it's clunky:
- They scrape the DOM
- Parse card layouts visually
- Try to guess which button does what
- It's slow (~3-5 seconds per interaction)

### The Solution: Structured Access

I added three layers of agent-friendly features:

#### Layer 1: `data-ai-*` Attributes + JSON-LD

Every interactive element gets metadata:

```html
<!-- The AI knows this is a provider card -->
<div data-ai-target="provider-card" 
     data-provider-id="npi-1234567890"
     data-provider-name="Dr. Jane Smith"
     data-specialty="Cardiology">
  
  <!-- The AI knows this sets status -->
  <button data-ai-action="set-status" 
          data-ai-target="hard_lead">
    Mark as Hard Lead
  </button>
</div>
```

And the full results are injected as JSON-LD:

```html
<script type="application/ld+json" id="ai-provider-jsonld">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "numberOfItems": 47,
  "itemListElement": [
    {
      "@type": "MedicalBusiness",
      "@id": "npi-1234567890",
      "name": "Dr. Jane Smith",
      "medicalSpecialty": "Cardiology",
      "aggregateRating": { "ratingValue": 4.8, "reviewCount": 143 }
    }
  ]
}
</script>
```

**Result:** The AI can read all 47 providers in under 100ms instead of 3-5 seconds.

#### Layer 2: `window.AITools` JavaScript API

The agent can call JavaScript functions directly:

```javascript
// Search without touching the UI
window.AITools.search("orthopedic surgeons", "Austin, TX")

// Get all current results as structured data
window.AITools.getProviders()

// Classify providers programmatically
window.AITools.updateProviderStatus("npi-1234567890", "hard_lead")

// Bulk operations
window.AITools.bulkClassify([
  { placeId: "ChIJ111", status: "hard_lead" },
  { placeId: "ChIJ222", status: "soft_lead" }
])

// Export to CSV
window.AITools.exportCurrentViewToCSV()
```

#### Layer 3: Agent Projection Space

A bottom drawer where the agent can render native UI components:

```javascript
// AI renders a chart inside the app
window.AITools.renderDashboard({
  title: "Market Overview",
  charts: [
    { 
      type: "bar", 
      title: "Providers by Rating",
      data: [
        { name: "Dr. Smith", value: 4.8 },
        { name: "Dr. Doe", value: 4.5 }
      ]
    },
    {
      type: "pie",
      title: "By Specialty",
      data: [
        { name: "Cardiology", value: 12 },
        { name: "Orthopedics", value: 8 }
      ]
    }
  ]
})
```

The AI doesn't just read data — it **creates interactive visualizations in the app.**

**Full manifest:** `web/src/ai/MANIFEST.md` in the GitHub repo

---

## The Data Flow Diagram

```
         USER
           │
           ▼
    ┌──────────────┐
    │  Search UI   │
    │  (React)     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  FastAPI     │────┐
    │  Backend     │    │
    └──────┬───────┘    │
           │            │
     ┌─────┴─────┐      │
     ▼           ▼      ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Google  │ │ NPPES   │ │Supabase │
│ Places  │ │ API     │ │ (DB)    │
│ API     │ │ (CMS)   │ │         │
└─────────┘ └─────────┘ └─────────┘
     │           │            │
     └───────────┴────────────┘
                 │
                 ▼
          ┌──────────────┐
          │ Merged Data  │
          │ + Status     │
          │ + Notes      │
          └──────────────┘
                 │
                 ▼
          ┌──────────────┐
          │ AI Agent     │ (Optional)
          │ Layer        │
          └──────────────┘
```

---

## Performance Numbers

| Metric | Value | Notes |
|--------|-------|-------|
| **Initial search** | < 3 seconds | Google + NPPES enrichment |
| **Cached search** | < 500ms | Results stored in Supabase |
| **JSON-LD parse** | < 100ms | AI reads all results at once |
| **AI tool call** | < 200ms | Direct function execution |
| **Page load** | < 1.5s | Docker on Hetzner (Frankfurt) |
| **Concurrent users** | ~50 | Single VPS, no CDN yet |

---

## Challenges & Solutions

### Challenge 1: Google Places Rate Limits
**Problem:** $17 per 1,000 requests adds up fast  
**Solution:** Cache results in Supabase for 7 days, only refresh when explicitly requested

### Challenge 2: NPPES Fuzzy Matching
**Problem:** "Dr. Jane A. Smith" vs "Jane Smith, MD" — same person?  
**Solution:** Multi-factor scoring:
- Name similarity (Levenshtein distance)
- Address proximity (< 50 meters)
- Phone match (if available)
- Confidence threshold: 85%+ to auto-match

### Challenge 3: Agent Discovery
**Problem:** AI agents don't automatically know about the JavaScript API  
**Solution:** Added `<meta name="ai-tools">` tag + static `/ai-manifest.json`

```html
<meta name="ai-tools" 
      content="window.AITools" 
      data-discovery="window.AITools.getCapabilities()" />
```

---

## What's Next

### Planned Features
- **CMS Medicare data overlay** — Show utilization volume, claims data
- **NPI deep search** — Cross-reference against Open Payments, hospital affiliations
- **Team collaboration** — Shared lists, assignment tracking
- **Mobile app** — React Native wrapper

### Technical Debt
- Add Redis for session caching
- Implement rate limiting per user
- Build CI/CD pipeline (currently manual deploy)
- Add analytics (track search patterns, popular specialties)

---

## Lessons Learned

**1. Start with one data source, add more later**

I almost tried to integrate CMS data from day one. Would've been 2+ months. Instead: Google Places + NPPES got me to 80% value in 2 weeks. CMS enrichment comes next.

**2. The agent layer is a force multiplier**

Adding `window.AITools` took 3 hours. The value it unlocked: enormous. Users with AI assistants can now operate the entire app via voice commands.

**3. Free tier + cheap VPS beats AWS for MVP**

Supabase free tier + $5 Hetzner VPS = $5/month total. AWS equivalent would've been $50-100/month. Premature scaling is real.

**4. Four view modes > one perfect view**

Different users work differently. Liaisons love kanban. Managers love table view. Giving them choice beats forcing a workflow.

---

## Try It

**Live site:** https://mydoclist.com  
**GitHub:** https://github.com/blakethom8/provider-search  
**API Docs:** https://mydoclist.com/api/docs

Open Gemini side panel (or Claude Desktop) and ask it to search. Watch it use the AI tools layer.

---

*Built over 4 weeks (Jan-Feb 2026). Currently used by physician liaisons at Cedars-Sinai and 3 other healthcare organizations. Open to feedback and collaboration.*
