# Capability Tiers: From Email Reader to Workspace Assistant

## The Expansion Model

The corporate email agent is designed to grow. Each tier adds capability with a clear boundary, requiring a new conversation with IT. This creates a trust ladder — each successful tier makes the next approval easier.

```
                                                      ┌──────────────┐
                                                      │   Tier 4     │
                                               ┌──────┤  Workspace   │
                                               │      │  Assistant   │
                                        ┌──────┤      └──────────────┘
                                        │      │
                                 ┌──────┤ Tier 3│
                                 │      │Research│
                          ┌──────┤      │  Asst  │
                          │      │      └────────┘
                   ┌──────┤Tier 2│
                   │      │Project│
            ┌──────┤      │Tracker│
            │      │      └──────┘
     ┌──────┤Tier 1│
     │      │Email │
     │      │Reader│
     │      └──────┘
     │
  TRUST  ──────────────────────────────────────────────► CAPABILITY
  (IT approval, audit trail, track record)
```

---

## Tier 1: Email Reader (The Wedge)

### Time to Deploy: 15 minutes
### IT Approval Difficulty: Easy
### Monthly Cost: ~$2-3

### Tools

| Tool | Access | Risk Level |
|------|--------|-----------|
| `read_emails` | Read inbox via Outlook COM | Low |
| `search_emails` | Search/filter + full body read | Low |
| `create_draft` | Create drafts (user sends) | Low |
| `write_report` | Write HTML to ~/email-agent/reports/ | Very Low |

### What It Does

- **Morning briefing**: "Generate my daily email summary" → categorized HTML report
- **Action item extraction**: "What do I need to respond to?" → prioritized list
- **Email triage**: "Which emails from this week are actually important?" → filtered summary
- **Draft replies**: "Draft a reply to Dave's email about the Q1 review" → draft in Outlook
- **Weekly digest**: "Summarize my email threads from this week" → comprehensive report

### What It Cannot Do

- Access files on the machine
- Browse the web
- Send emails
- Delete or move emails
- Access calendar, contacts, or tasks
- Install software
- Run commands

### Sample Interaction

```
User: "Summarize my emails from today, highlight anything urgent"

Agent:
  → [read_emails] Reads 28 emails from today (previews)
  → [search_emails] Reads full body of 4 flagged as High importance
  → [search_emails] Reads full body of 2 from user's manager
  → [write_report] Generates daily-summary-2026-03-01.html

Response: "You have 28 emails today. 3 need action:
  1. Q1 Review from Sarah — needs your input by Friday
  2. Client proposal from Dave — wants a call this week
  3. IT Security audit — respond by end of day

  15 FYI emails (status updates, team announcements).
  10 newsletters/automated.

  Full report saved to ~/email-agent/reports/"
```

### Value Delivered

- **Time saved**: 20-30 min/day (inbox scanning + triage)
- **Quality**: Consistent categorization, nothing falls through cracks
- **Reports**: Professional HTML summaries sharable with team

---

## Tier 2: Project Tracker (The Sticky Product)

### Additional Time to Deploy: 30 minutes
### IT Approval Difficulty: Moderate (file access discussion)
### Monthly Cost: ~$3-5

### New Tools Added

| Tool | Access | Risk Level |
|------|--------|-----------|
| `read_file` | Read files from ~/email-agent/projects/ | Low-Medium |
| `write_file` | Write to ~/email-agent/projects/ | Low |
| `query_tasks` | Read/write SQLite task database | Low |
| `update_task` | Create/update/complete tasks | Low |

### What's New

Tier 2 adds a **project tracking database** (SQLite, stored in the agent's sandbox) and the ability to read/write project files in a designated folder.

The agent can now:
- **Track action items across emails**: "Add the Q1 review deadline to my tasks"
- **Maintain project status**: Tasks with owners, deadlines, status
- **Generate project reports**: "What's the status of Project X?" → HTML with task breakdown
- **Read project documents**: Place files in ~/email-agent/projects/ and the agent can reference them
- **Cross-reference email with tasks**: "Are there any emails related to my overdue tasks?"

### The Database

```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',       -- open, in_progress, done, blocked
    priority TEXT DEFAULT 'medium',    -- low, medium, high, urgent
    assignee TEXT,
    due_date TEXT,                     -- ISO date
    source_email_id TEXT,             -- Link back to originating email
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    project TEXT                       -- Project grouping
);

CREATE TABLE task_notes (
    id INTEGER PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### File Access Boundary

The agent can read and write files ONLY in `~/email-agent/`:
```
~/email-agent/
├── reports/        ← HTML reports (Tier 1)
├── drafts/         ← Email drafts (Tier 1)
├── logs/           ← Audit logs (Tier 1)
├── projects/       ← Project files (NEW in Tier 2)
│   ├── project-x/
│   │   ├── brief.md
│   │   ├── requirements.txt
│   │   └── notes.md
│   └── project-y/
│       └── ...
├── tasks.db        ← SQLite database (NEW in Tier 2)
└── config.json
```

**Key constraint**: The user manually places files into `~/email-agent/projects/`. The agent cannot reach outside this directory. This is a deliberate design choice: the user controls what the agent sees.

### Sample Interaction

```
User: "Check my emails for any new action items and add them to my task list"

Agent:
  → [read_emails] Reads today's 28 emails
  → [search_emails] Reads 6 emails with action-oriented language
  → [query_tasks] Checks existing tasks to avoid duplicates
  → [update_task] Creates 3 new tasks:
      - "Review Q1 roadmap" (due: Friday, from: Sarah)
      - "Schedule call with Dave" (due: this week, from: Dave)
      - "Complete IT security questionnaire" (due: today, from: IT)
  → [write_report] Generates task-update-2026-03-01.html

Response: "Added 3 new tasks from today's emails. You now have
  7 open tasks, 2 due today. Full report in ~/email-agent/reports/"
```

### Value Delivered

- **Time saved**: 30-45 min/day (task tracking + status updates)
- **Quality**: Nothing falls through the cracks across email and projects
- **Reports**: Project status reports generated on demand or by schedule

---

## Tier 3: Research Assistant (The Power Tool)

### Additional Time to Deploy: 1 hour
### IT Approval Difficulty: Harder (network access discussion)
### Monthly Cost: ~$5-15

### New Tools Added

| Tool | Access | Risk Level |
|------|--------|-----------|
| `web_search` | Search via Brave/Google Search API | Medium |
| `fetch_url` | Read a specific web page | Medium |

### What's New

Tier 3 adds **controlled web access**. Not raw browsing — structured API calls to a search service, with all queries logged.

The agent can now:
- **Research email topics**: "The email from Legal mentions GDPR Article 17 — what does that require?"
- **Enrich reports**: "Generate a market summary for the companies mentioned in today's emails"
- **Fact-check**: "Dave says competitor X launched a new product — verify this"
- **Prepare meeting context**: "I have a meeting with Acme Corp tomorrow — what should I know?"

### Network Access Controls

Web access is NOT unrestricted. The agent uses a search API (Brave Search or Google Custom Search) rather than raw HTTP requests:

```python
def web_search(query: str, max_results: int = 5) -> str:
    """Search the web via Brave Search API. All queries are logged."""
    audit_log("web_search", {"query": query})
    response = requests.get(
        "https://api.search.brave.com/res/v1/web/search",
        headers={"X-Subscription-Token": BRAVE_API_KEY},
        params={"q": query, "count": max_results}
    )
    return format_search_results(response.json())
```

**What's logged**: Every search query, every URL fetched. IT can audit exactly what the agent searched for.

**What's blocked**: The agent cannot make arbitrary HTTP requests. It can only call the search API and optionally fetch URLs returned by search results.

### The IT Conversation

This tier requires a real discussion:
- "The agent will make search queries. Here's what the queries look like." (show examples)
- "All queries are logged in audit.jsonl. Here's a sample." (show audit trail)
- "The only outbound connections are to api.anthropic.com and api.search.brave.com."
- "No email content is included in search queries — only topic keywords."

---

## Tier 4: Workspace Assistant (The Full Vision)

### Additional Time to Deploy: 2+ hours
### IT Approval Difficulty: Significant (broad file access)
### Monthly Cost: ~$10-30

### New Tools Added

| Tool | Access | Risk Level |
|------|--------|-----------|
| `read_workspace` | Read files from designated project folders | Medium-High |
| `write_workspace` | Write to project folders | Medium |
| `calendar_read` | Read Outlook calendar (COM) | Medium |
| `generate_app` | Generate lightweight HTML applications | Medium |

### What's New

Tier 4 approaches OpenClaw-level capability but within corporate guardrails:
- **Cross-reference email with documents**: "Compare the budget email from Finance with the actual numbers in the Q1 spreadsheet"
- **Calendar-aware**: "What meetings do I have today? Draft agendas based on recent email threads"
- **Lightweight applications**: "Create a dashboard that shows my project status across all active projects"
- **Multi-source reports**: "Generate a weekly report combining email activity, task progress, and calendar events"

### Where Tier 4 Still Differs from OpenClaw

| Capability | Tier 4 Agent | OpenClaw |
|-----------|-------------|----------|
| Shell access | No | Full Bash |
| Install software | No | Yes (pip, npm, brew) |
| Network access | Search API + LLM only | Unrestricted |
| File access | Designated folders | Full filesystem |
| Messaging | Email drafts only | Telegram, WhatsApp, etc. |
| Other apps | Outlook + Calendar only | Any app via Bash |
| Audit trail | Mandatory | Optional |

---

## Tier Comparison Summary

| | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|--------|--------|--------|--------|
| **Name** | Email Reader | Project Tracker | Research Asst | Workspace Asst |
| **Tools** | 4 | 6 | 8 | 10+ |
| **File access** | Sandbox only | + Project folder | Same | + Workspace folders |
| **Network** | LLM API only | Same | + Search API | Same |
| **Email** | Read + Draft | Same | Same | Same + Calendar |
| **Database** | None | SQLite tasks | Same | Same |
| **IT approval** | Easy | Moderate | Harder | Significant |
| **Cost/month** | $2-3 | $3-5 | $5-15 | $10-30 |
| **Time saved/day** | 20-30 min | 30-45 min | 45-60 min | 60-90 min |
| **Deploy time** | 15 min | + 30 min | + 1 hour | + 2 hours |

---

## The Revenue Model by Tier

Based on the Bespoke AI Business Framework ($15-50K per engagement):

| Tier | Setup Fee | Monthly Maintenance | Typical Client |
|------|-----------|-------------------|----------------|
| Tier 1 | $2,500-5,000 | $500/month | "Show me AI works" |
| Tier 2 | $5,000-10,000 | $750/month | "I need project tracking" |
| Tier 3 | $10,000-20,000 | $1,000/month | "I need a research partner" |
| Tier 4 | $20,000-40,000 | $1,500/month | "I need a full assistant" |

The tier model means:
- Low entry price (Tier 1 is approachable)
- Natural upsell path (each tier builds on the last)
- Recurring revenue from maintenance
- Clear value demonstration at each level

---

## Key Takeaway

The tier model turns the capability/security tradeoff from a single hard decision into a series of small, reversible ones. Start with Tier 1 (zero controversy). Prove value. Expand when ready. Each tier has a clear boundary, a clear value proposition, and a clear IT conversation.

Most corporate clients will land at Tier 2 or Tier 3. Tier 4 is for power users who've built deep trust. And anyone who wants Tier 4+ should probably look at the full OpenClaw personal infrastructure setup — which is a different product, for a different buyer.
