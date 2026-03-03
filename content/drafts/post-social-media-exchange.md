---
status: draft
target: posts
created: 2026-03-02
updated: 2026-03-02
tags: ["open-source", "social-media", "information-silos", "transparency", "civic-tech"]
notes: "Announcement post for Social Media Exchange Platform. Flagship open-source project. Needs Blake's review before publishing."
---

# Breaking the Information Bubble: A Social Experiment

*What if you could see what your friends actually see on Twitter?*

---

## The Problem Nobody Talks About

We're having the wrong conversation about social media.

Everyone's worried about misinformation, bot farms, algorithm manipulation — all real problems. But we're missing something more fundamental: **we can't even agree on what's true anymore because we're literally seeing different realities.**

Your Twitter feed is not my Twitter feed. Your friend's timeline shows completely different content than yours. The algorithm is showing each of us a personalized version of the world, optimized for engagement, and we have no idea what anyone else is seeing.

This isn't a bug. It's the core product. And it's tearing us apart.

---

## The Argument That Never Ends

You know the feeling. You're talking to someone — a friend, a family member, someone you generally respect — and they say something that makes zero sense to you. Not just "I disagree," but "how could any reasonable person believe that?"

Here's what you don't realize: **They're operating from completely different information.**

They're not stupid. They're not brainwashed. They're just seeing a fundamentally different feed. Different news sources. Different opinions. Different "trending" topics. Different algorithmic recommendations.

And when you try to explain your perspective, it sounds equally insane to them. Because your information environment is just as foreign to them as theirs is to you.

We're not disagreeing about facts anymore. We're disagreeing about which facts exist.

---

## The Solution Nobody Has Built

I keep coming back to a simple question: **What if you could just... see what they're seeing?**

Not screenshot someone's feed. Not manually follow the same accounts. Not argue about whose sources are more credible.

Just click a button and see their actual Twitter timeline. The posts they see. The order they appear. The topics Twitter thinks they care about.

Sounds simple, right?

**It doesn't exist.**

---

## TwtRoulette (2011-2011)

Actually, it existed once. In 2011, a site called TwtRoulette let you view other people's Twitter feeds. Business Insider covered it. A few hundred people signed up, including Ashton Kutcher.

Then it died.

Why? Because it was positioned as "social media espionage" — a novelty for stalking celebrities. It required manual opt-in to a directory. It had no clear purpose beyond curiosity.

But the core idea was sound: **transparency into what others see on social media could help us understand each other.**

Fifteen years later, the problem is worse and nobody's solved it.

---

## What I'm Building

I'm building what TwtRoulette should have been: a platform that makes feed sharing frictionless, transparent, and purpose-driven.

**The flow:**
1. I send you a link: "Share your Twitter feed with me?"
2. You click it, grant read-only access (Twitter OAuth), done
3. I can now view your timeline — what you see, when you see it

**Key principles:**
- **Privacy-first:** You grant access explicitly. You can revoke anytime. I never see DMs, drafts, or private content.
- **Transparent:** Both of us know exactly what's being shared.
- **Reciprocal:** This works best when we both share. Understanding is a two-way street.
- **Open source:** Code is public. No hidden data collection. Community-driven.

**Technical details:**
- Next.js + PostgreSQL + Twitter API
- Mobile-first web app (works on any phone)
- 15-minute feed caching (respects rate limits)
- OAuth tokens encrypted at rest
- Deployable in 4 weeks (by end of March 2026)

---

## Beyond One-to-One: The Research Vision

Sharing feeds between friends is phase one. But the real potential is understanding information ecosystems at scale.

**Imagine these use cases:**

### Media Literacy
> "Here's what Twitter shows me. Here's what it shows you. Let's look at the overlap. Only 15%? Why?"

### Political Understanding
> "I see you're left-leaning and I'm center-right. Let's compare our feeds. What are the sources we *both* trust? Can we start there?"

### Research Access
> "I'm studying filter bubbles. Can I analyze anonymized feed data from people who consent?"

### Network Analysis
> "My friend group all sees similar content. Is that because we follow the same people, or because we're in the same demographic?"

**Phase 2 features:**
- Combined feeds (merge multiple friends' timelines)
- Feed comparison tools (Venn diagrams, topic analysis)
- Historical snapshots (track changes over time)
- Demographics layer (opt-in: age, location, politics)
- Anonymous cohorts for research

---

## Why This Matters

The academic research is clear: **filter bubbles and echo chambers are real.**

Reuters Institute, Royal Society, dozens of peer-reviewed studies. The effect is "smaller than commonly assumed," but meaningful. People actively self-select into information silos (muting/unfollowing those who disagree), and algorithms amplify this.

But here's the paradox: exposure to opposing views can **backfire**. Show someone information that contradicts their beliefs, and they often double down. (This is called the "backfire effect.")

**So what's the answer?**

I don't think it's forcing people to see opposing content. I think it's helping them **understand why others see the world differently.**

If I can see your feed — not to argue, but to genuinely understand — maybe I can say, "Okay, I get why you think that. If I were seeing what you're seeing, I'd probably think the same thing."

That's not agreement. It's **empathy.**

---

## The Meta Irony

I'm building this on Twitter's API. Twitter/X — the platform most accused of algorithm manipulation and information silos — is enabling transparency into its own system.

Elon would probably say he supports this. "Transparency is good," etc. But the truth is simpler: Twitter has an OAuth API that supports home timeline access. Instagram and TikTok don't (or make it much harder).

So we start with Twitter. If this works, we expand to other platforms.

And if Twitter shuts down the API? Well, that tells you something too.

---

## Open Source, Open Mission

This project will be fully open source. GitHub. MIT license. Anyone can fork it, deploy it, modify it.

Why?

Because I don't want to build another VC-backed startup that optimizes for engagement metrics. I want to build infrastructure for rebuilding shared reality.

**Who this is for:**
- Curious people who want to understand their friends better
- Researchers studying information ecosystems
- Educators teaching media literacy
- Anyone tired of screaming into the void

**Who this is NOT for:**
- Stalkers (you need explicit consent)
- Advertisers (we're not selling data)
- Engagement optimizers (we're deliberately not addictive)

---

## Timeline

**March 2026:** MVP (basic feed sharing between friends)
**April 2026:** User testing with 10-15 people, iterate
**May 2026:** Public launch, open source release
**Summer 2026:** Advanced features (combined feeds, analysis tools)
**Fall 2026:** Research partnerships, grant applications

---

## What Happens If This Works

If this works — if even 1,000 people use this regularly — we'll have created:

1. **A transparency layer** for algorithmically-curated content
2. **An empathy tool** for cross-perspective understanding
3. **A research dataset** (with consent) for studying information ecosystems
4. **A proof of concept** that people want this kind of transparency

And maybe, just maybe, we'll have a small piece of infrastructure for rebuilding the shared reality that social media fractured.

---

## Join Me

I'm building this in public. The code will be on GitHub. The documentation is comprehensive (16 files, 4,000+ lines). The architecture is designed to scale.

If you're a developer and this resonates, contribute. If you're a researcher, reach out. If you're just someone who wants to understand their friends better, be an early tester.

**Repository:** [github.com/blakethom8/social-media-exchange](https://github.com/blakethom8/social-media-exchange) *(will be public in April)*

**Contact:** blakethomson8@gmail.com

Let's break some bubbles.

---

*Blake Thomson builds software in Santa Monica. He's currently working on bespoke AI solutions for healthcare organizations and believes technology should serve understanding, not just engagement.*
