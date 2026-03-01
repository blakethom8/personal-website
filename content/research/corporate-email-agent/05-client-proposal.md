# Client Proposal: AI Email Assistant

*Prepared by Bespoke AI Services*

---

## The Problem

Knowledge workers spend **2.5 hours per day** on email (McKinsey). Most of that time is low-value: scanning subjects, context-switching between threads, re-reading chains to find action items, drafting routine replies.

Existing solutions don't solve this:
- **Microsoft Copilot** ($30/user/month): Cloud-based, sends all email to Microsoft's AI. Many organizations don't trust it with sensitive communications.
- **Manual rules and filters**: Help organize, but don't understand content.
- **Hiring an assistant**: Expensive, not always available, introduces a third party to confidential communications.

---

## The Solution: A Local AI Email Assistant

We deploy a lightweight AI agent directly on your team members' laptops. It reads email locally, generates structured reports, and creates draft replies — all without sensitive data leaving the machine.

### What It Does

| Capability | How It Works |
|-----------|-------------|
| **Daily email briefing** | Every morning, a categorized summary is waiting — Action Required, FYI, Newsletters |
| **Action item extraction** | Deadlines, asks, and commitments pulled from email threads automatically |
| **Intelligent triage** | Identifies which emails actually need attention vs. noise |
| **Draft replies** | Professional draft responses created in Outlook's Drafts folder — you review and send |
| **Project tracking** (Tier 2) | Action items become tracked tasks with deadlines and status |
| **On-demand analysis** | "What did Sarah say about the Q1 budget?" — instant answer from your inbox |

### What It Does NOT Do

| Boundary | Why |
|----------|-----|
| Does not send email | You always review and click Send |
| Does not access files on your machine | Only its own reports folder |
| Does not have admin privileges | Runs as a normal user program |
| Does not connect to the internet | Only one connection: the AI API |
| Does not access other people's email | Your Outlook profile only |

---

## How It Works (Technical Summary)

```
Your Outlook ←→ Python Script (on your laptop) ←→ Anthropic Claude API
                      │
                      ▼
              ~/email-agent/reports/
              (HTML summaries, action items)
```

1. A small Python script reads your emails using the same local interface that Outlook's own macros use
2. It sends email content to Claude (Anthropic's AI) over encrypted HTTPS for analysis
3. Claude returns summaries, categorizations, and draft text
4. Reports are saved as HTML files on your machine
5. Drafts appear in your Outlook Drafts folder for review

**The entire script is ~200 lines of Python. Your IT team can review every line.**

---

## Security Posture

### Data Handling

| Question | Answer |
|----------|--------|
| Where does email data go? | To Anthropic's API (encrypted HTTPS). Anthropic is SOC 2 Type II certified. |
| Is data used to train AI models? | No. Anthropic's API data policy explicitly excludes API data from training. |
| How long is data retained? | 30 days for abuse monitoring, then deleted. Zero-retention available for enterprise. |
| Does data leave the US? | No (Anthropic processes in the US). |
| Who has the API key? | You do. Your organization has a direct billing and data relationship with Anthropic. |

### Access Controls

| Control | Status |
|---------|--------|
| Admin privileges required | No — runs as a normal user |
| Network connections | One: api.anthropic.com (HTTPS) |
| Open ports | None |
| Filesystem access | ~/email-agent/ only (sandboxed) |
| Email operations | Read + Draft only (no send, no delete) |
| Audit logging | Every action logged with timestamp |

### Compliance

- **SOC 2**: Aligned. Anthropic is SOC 2 Type II certified.
- **GDPR**: Compatible. Data minimization by design. 30-day retention.
- **HIPAA**: BAA available from Anthropic for healthcare organizations.
- **OWASP Agentic AI Top 10**: All 10 risks addressed (detailed mapping available).

---

## Deployment Tiers

### Tier 1: Email Reader — $5,000 setup + $500/month

**Includes**:
- Agent deployment on up to 5 user machines
- Email reading, summarization, and triage
- HTML report generation (daily briefings, weekly digests)
- Draft reply creation
- Audit logging
- 30 days of support and tuning

**Time to deploy**: Same day
**IT approval**: Single meeting (one-page security brief provided)

### Tier 2: Project Tracker — $10,000 setup + $750/month

**Everything in Tier 1, plus**:
- Project task database (action items tracked across emails)
- Project status reports
- File reading from designated project folders
- Cross-referencing email with project documents
- Custom report templates

**Time to deploy**: 1-2 days
**IT approval**: Standard review (full security documentation provided)

### Tier 3: Research Assistant — $20,000 setup + $1,000/month

**Everything in Tier 2, plus**:
- Controlled web search (via search API, all queries logged)
- Research report generation
- Meeting preparation briefs
- Multi-source analysis (email + documents + web)

**Time to deploy**: 1 week
**IT approval**: Detailed review (network access documentation provided)

---

## ROI Analysis

### Time Savings (Per User)

| Task | Current Time | With Agent | Saved |
|------|-------------|-----------|-------|
| Morning inbox scan | 30 min | 5 min (review report) | 25 min |
| Action item tracking | 20 min | 2 min (auto-extracted) | 18 min |
| Drafting routine replies | 30 min | 10 min (review drafts) | 20 min |
| Weekly status reports | 45 min | 5 min (auto-generated) | 40 min |
| **Daily total** | **~2 hours** | **~20 min** | **~1.5 hours** |

### Financial Impact

| Metric | Value |
|--------|-------|
| Time saved per user per day | ~1.5 hours |
| Working days per month | 22 |
| Hours saved per user per month | ~33 hours |
| At $75/hour (blended rate) | **$2,475/month in recovered productivity** |
| Agent cost per user per month | ~$100 (Tier 1: $500/5 users) + $3 API |
| **ROI per user** | **~24x return** |

For a team of 5:
- Monthly cost: $503 ($500 maintenance + $15 API)
- Monthly value: $12,375 (33 hours x 5 users x $75)
- **Annual net value: ~$142,000**

---

## What We Need From You

To get started, we need:

1. **An Anthropic API key** — We'll help you set this up. Your organization pays Anthropic directly (~$3/user/month).
2. **IT greenlight** — We provide a one-page security brief and full source code for review.
3. **Python on user machines** — Python 3.10+ (typically pre-installed or IT-approved).
4. **30 minutes per user** — For initial setup and training.

---

## About Bespoke AI Services

We build custom AI tools for organizations that need more than a chatbot but less than an enterprise platform. Our approach:

- **Build to own**: You own the code, the configuration, the data relationship. No vendor lock-in.
- **Local-first**: Data stays on your machines. Cloud APIs used only for AI inference.
- **Transparent**: Every line of code is reviewable. Every action is logged.
- **Iterative**: Start small (Tier 1), prove value, expand when ready.

**Contact**: blake@bespoke-ai.dev
**Website**: [your-website.com]

---

## Appendix: FAQ for IT Teams

**Q: Is this different from Microsoft Copilot?**
A: Yes. Copilot is cloud-first — all email data goes through Microsoft's AI infrastructure. Our agent reads email locally via COM (same as Outlook macros) and only sends content to one API (Anthropic's, SOC 2 certified). You control the API key and the data relationship directly.

**Q: Can the agent send emails without user approval?**
A: No. It creates drafts in Outlook's Drafts folder. The user must open, review, and click Send themselves.

**Q: What if we want to stop using it?**
A: Delete the script and the ~/email-agent/ folder. There's no service to uninstall, no daemon running, no registry entries. It's just a Python script.

**Q: Can the agent access other users' email?**
A: No. It uses Windows COM, which authenticates as the current Windows user. It can only access mailboxes that user's Outlook profile has access to.

**Q: What about email retention policies?**
A: The agent reads emails but doesn't modify or delete them. Your existing retention policies are unaffected. Generated reports follow your standard file retention policies.

**Q: Can we audit what the agent does?**
A: Yes. Every tool call (email read, search, draft creation, report write) is logged to ~/email-agent/logs/audit.jsonl with a timestamp and parameters. We can also configure alerts for unusual activity patterns.

**Q: What happens if the LLM hallucinates?**
A: The agent produces reports and drafts. Humans review all output before acting. This is a tool, not an autonomous decision-maker.

**Q: Can we review the source code?**
A: Yes. We provide the complete source code (~200 lines of Python). Your team can review every line, and we welcome the review. There's no obfuscation, no compiled binaries, no hidden components.
