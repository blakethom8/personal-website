---
title: "Every App Is a Slow API (Whether You Like It or Not)"
date: 2026-02-26
category: podcast-notes
tags: [agents, openclaw, AI, apps, APIs, peter-steinberger]
summary: "Peter Steinberger (creator of OpenClaw) explains why 80% of apps will disappear in the agent era, why fighting agent access makes you less useful than your competitors, and what agent-friendly companies should do right now."
source:
  type: youtube
  platform: YouTube
  show: "Lex Fridman Podcast"
  episode: "491"
  guest: "Peter Steinberger"
  url: "https://www.youtube.com/watch?v=YFjfBk8HI5o"
  videoId: "YFjfBk8HI5o"
status: draft
---

# Every App Is a Slow API (Whether You Like It or Not)

*Notes from Lex Fridman Podcast #491 with Peter Steinberger (OpenClaw creator)*

---

## The Core Thesis

> "Every app is just a very slow API now, if you want or not. Through personal agents, a lot of apps will disappear."  
> — Peter Steinberger

This isn't a prediction. It's already happening.

In the OpenClaw Discord, users casually mention apps they've stopped using:
- "Why do I need the Sonos app? My agent just plays music."
- "Why do I need Eight Sleep's app? My agent knows when I'm home and adjusts the bed."
- "Why do I need MyFitnessPal? My agent already knows where I am, what I ate, and how I slept."

The pattern is clear: **"Why do I need [app] when my agent already knows [context] and can [action]?"**

---

## The Twitter Problem: You Can't Block What Users Can See

Peter built a CLI tool called "Bird" that reverse-engineered Twitter's internal API, letting OpenClaw users automate Twitter workflows (bookmark research, tweet summaries, reply drafting).

Twitter asked him to take it down. He complied.

**But here's what actually happened:**

OpenClaw users still read tweets. They just do it via browser automation (Playwright) now:
1. Open headless browser
2. Navigate to Twitter
3. Extract tweet text from HTML
4. Close browser

It's **slower** (5 seconds vs 500ms), **more brittle** (breaks when Twitter redesigns), and **more annoying** for everyone.

But it works.

### The Key Insight

> "You're not making something that was possible, not possible. Now it's just a bit slower."

**Translation:** If a human can access it in a browser, an agent can access it in a browser. You can either:

**A.** Provide a clean API (fast, reliable, everyone's happy)  
**B.** Block access (agents use browser automation, slower and worse for everyone)

Fighting inevitability doesn't work. It just makes the experience worse.

---

## Why 80% of Apps Will Disappear

### The Context Advantage

Let's use a real example: **MyFitnessPal** (fitness tracking app).

**What MyFitnessPal knows:**
- What you manually log (food, calories, exercise)
- Your weight goals

**What MyFitnessPal doesn't know:**
- You're at Waffle House right now (location)
- You're stressed from work (calendar + messages)
- You slept terribly last night (sleep tracker)
- You have a gym session in 2 hours (calendar)
- Your energy levels are low (wearable data)

**What an agent knows:**
- **All of the above**

So instead of you opening an app and manually logging breakfast, your agent can proactively message you:

*"You're at Waffle House and you're stressed. Maybe skip the waffles today? You have a workout in 2 hours and you're already low-energy from bad sleep. How about the egg white omelet?"*

Or it doesn't message you at all—it just quietly adjusts your gym workout to be lighter today because it knows you're not in peak condition.

**The app can't do this. The agent can.**

### Real Examples From OpenClaw Users

From the Discord community:

**1. Smart home control:**
- *"Why do I need the Eight Sleep app? My agent already knows it's cold outside and I just got home. It adjusts bed temperature automatically."*

**2. Music control:**
- *"Why do I need the Sonos app? I just tell my agent 'play jazz in the living room' and it's done."*

**3. Calendar management:**
- *"I don't want to open a calendar app. I want to tell my agent 'remind me about dinner tomorrow night and invite two friends.' Everything is much more connected and fluid."*

**4. Security cameras:**
- *"The manufacturer's camera app is terrible. My agent can pull snapshots via API and show me exactly what I need."*

The pattern: **Apps are UI layers on top of data and actions agents can access directly.**

---

## The Spectrum: Agent-Friendly vs Agent-Hostile

Every company is somewhere on this spectrum right now.

### 🟢 Agent-Friendly: The Winners

#### Strategy 1: Read-Only Baseline Access

Peter's suggestion for Twitter:
- Allow users to export their own bookmarks
- Low daily limits (reasonable personal use, not scraping)
- Read-only for personal accounts

This enables legitimate use cases without opening floodgates to abuse:
- *"Research my Twitter bookmarks from the past month and email me summaries"*
- *"Notify me when [@someone] tweets about [topic]"*

That's useful. That's not scraping. That's a user accessing *their own data* with *their own tools.*

#### Strategy 2: Clear, Simple APIs

**Companies that get this:** Sonos, security camera manufacturers, smart home devices.

Result? **OpenClaw users replaced the "crappy" official apps with agent commands, and they're happier customers.**

The API doesn't need to be fancy. It just needs to:
- Exist
- Be documented
- Not require six months of approval hell

#### Strategy 3: Race to Integration

Here's a prediction: **Uber Eats, DoorDash, and every food delivery company should be sprinting to integrate with OpenClaw, Claude, and every major agent platform.**

Why?

Because when an agent searches for "order Thai food," it's going to call the API that responds *fastest and easiest.*

The company that makes integration frictionless **wins the customer by default.**

### 🔴 Agent-Hostile: The Losers

#### Mistake 1: Google Gmail's Certification Hell

Want to build an app that accesses Gmail? Prepare for *months* of approval.

It's so painful that some startups **acquire other startups just to inherit their Gmail API certification.**

**The result?**

Users give their credentials directly to third-party agent tools (bypassing Google entirely), because it's easier than dealing with Google's process.

Now Google has:
- *Less* control
- *Worse* security
- *Angrier* users

Excessive friction doesn't prevent access. It just makes access **less secure.**

#### Mistake 2: Medium Blocking Agent Access

Medium decided to block agents from reading articles.

**What users did:**

**They stopped clicking on Medium links.**

As one OpenClaw user put it:

> "I learned that maybe I don't click on Medium because it's annoying. I use other websites that actually are agent-friendly."

Medium didn't protect their content. They made their content **less valuable.**

#### Mistake 3: Twitter's Rate Limiting

Twitter's approach:
- Make API access slow and expensive
- Force multiple authentications
- Kill useful automations

Peter built "Bird" (the Twitter CLI). Twitter shut it down.

But OpenClaw users still read tweets—via browser automation now. Slower, more annoying, but it works.

> "You're just reducing access to your platform."

---

## CLI vs MCP: The Composability Advantage

Peter has a controversial take: **"Every MCP would be better as a CLI."**

### The Problem With MCP

MCP (Model Context Protocol) gives you *everything, all the time.*

If you ask for weather data, you get:
- Temperature
- Humidity
- Wind speed
- Barometric pressure
- UV index
- 50 other fields you don't need

Your context window gets polluted with junk.

### The Beauty of CLI

CLIs are **composable**. You can pipe commands together and filter:

```bash
# MCP: Get huge JSON blob, fill context with everything
weather_mcp --location "Austin"

# CLI: Get blob, filter to just what you need
weather --location "Austin" | jq '.temperature'
```

The model can naturally filter and compose CLI commands because they work like Unix commands—something models are already really good at.

Plus, CLI tools don't require special training or custom syntax. They're just commands. The agent can read the `--help` menu on-demand and figure it out.

**Is MCP dead?** Not quite. It pushed companies to build APIs, which is good. But for personal agent use, CLI is more elegant.

---

## The Blockbuster vs Netflix Moment

Companies are at a crossroads right now.

### Option 1: Fight Back (Blockbuster)

- Block agent access
- Require complex authentication
- Make life harder for power users

**Risk:** Lose everything to agent-friendly competitors

### Option 2: Adapt (Netflix)

- Race to be agent-friendly
- Make APIs easy to use
- Support agent accounts

**Reward:** Win the agent-using customer base

Peter's prediction:

> "The right companies will find ways to jump on the train and other companies will perish."

---

## The Philosophical Shift: Eyeballs Are Expensive Now

### The New Scarcity

**Old world:**
- Intelligence was scarce
- Programmers commanded high salaries
- Apps were hard to build

**New world:**
- Intelligence is abundant (AI agents)
- Content is cheap (AI generation)
- **Eyeballs are expensive**

### Social Implications

AI content must be clearly marked. Users value "broken English over AI slop."

From Peter:

> "I value typos again."

Raw humanity becomes premium when AI content floods the internet.

---

## What Builders Should Do Right Now

### 1. Audit Your APIs

**Do you even have one?** If not, you're in trouble.

**Is it documented?** If nobody knows how to use it, it doesn't really exist.

**What's the approval process?** If it takes longer than 48 hours, you're losing users.

**What are your rate limits?** Find the balance between legitimate use and abuse.

### 2. Test With Agents

Can OpenClaw or Claude access your service?

Try it yourself:
1. Install OpenClaw (or use Claude)
2. Try to access your service via the agent
3. How many steps does it take?
4. What breaks?
5. Would *you* want to use your own product via an agent?

If the answer is "no," fix that.

### 3. Define Agent Policies

Don't wait for chaos. Be proactive:
- Clear terms of service for agent access
- Agent account types (if applicable)
- Rate limits that enable legitimate use
- Appeals process for false blocks

### 4. Race to Integration

If you're in a competitive market (food delivery, productivity tools, etc.), your goal is simple:

**Be the easiest option for agents to use.**

When a user says *"order Thai food,"* their agent will search for the service with the simplest API.

If that's you, you get the customer.  
If it's your competitor, they do.

---

## The Human Impact

When Lex asked Peter about the disruption—about jobs, about pain, about fear—Peter said something profound:

> "I also have to put against some of the emails I got where people told me they have a small business and they've been struggling and OpenClaw helped them automate a few of the tedious tasks... or some emails where they told me that OpenClaw helped a disabled daughter that she's now empowered and feels she can do much more than before. Which is amazing, right?"

Yes, this will disrupt things. Yes, some business models will break. Yes, it's uncomfortable.

But **the people want this.**

When technology empowers regular people to solve their own problems—when a disabled person can suddenly do things they couldn't before, when a small business owner can automate the tedious stuff and focus on what matters—the world gets better.

---

## Conclusion: The Question Isn't "Should I?"

The question isn't whether agents will transform software. **They already are.**

The question is: **Will you adapt?**

You can either:
- **Provide clean APIs** (agents use them, users happy, you competitive)
- **Fight inevitability** (agents use browser automation, slower, worse for everyone, you lose market share)

Peter's story about Spotify vs YouTube (this morning, actually):
- Tried to download a podcast via Spotify API → Blocked
- Tried YouTube API → Worked perfectly
- **Spotify didn't stop me from getting the podcast. They just made themselves less useful than YouTube.**

Don't be Spotify.

Be the company agents *want* to integrate with.

---

## Further Reading

- **Full podcast:** [Lex Fridman #491 - Peter Steinberger](https://www.youtube.com/watch?v=YFjfBk8HI5o)
- **OpenClaw:** [openclaw.ai](https://openclaw.ai)
- **Pi (the harness powering OpenClaw):** [github.com/mitsuhiko/pi-mono](https://github.com/mitsuhiko/pi-mono)

---

## About the Author

Blake Thomson works in healthcare data strategy at Cedars-Sinai and is building agent-first applications for provider intelligence. He uses OpenClaw daily and has experienced firsthand how agents change the way you interact with software—for the better.

This post is his personal interpretation of the Lex Fridman interview with Peter Steinberger. Highly recommend listening to the full episode.
