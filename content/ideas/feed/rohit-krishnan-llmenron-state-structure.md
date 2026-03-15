---
title: "Rohit Krishnan / LLMEnron: Better State Beats Bigger Prompts"
date: 2026-03-14
category: article-notes
tags: [agents, email, enron, state-management, coordination, social-media, research]
summary: "Notes on Rohit Krishnan's LLMEnron study: the main lesson is that agent systems fail less from raw model capability than from poor state structure. Explicit thread state, shared boards, and actor identity matter more than giant scratchpads or simply adding more agents."
source:
  type: post
  platform: X
  author: "Rohit Krishnan"
  url: "https://x.com/krishnanrohit/status/2032181522296684679?s=46"
  repo: "https://github.com/strangeloopcanon/llmenron"
status: draft
---

# Rohit Krishnan / LLMEnron: Better State Beats Bigger Prompts

*Notes from Rohit Krishnan's post + the `llmenron` repo*

---

## The TL;DR

This is one of the more interesting agent evaluation structures I've seen recently because it avoids the usual vague "the agent felt better" hand-waving.

The core setup:
- Use **Enron email metadata** to estimate what a realistic human inbox load looks like
- Build **synthetic inbox / org-simulation experiments** at those realistic load levels
- Change the **system structure** around the model, not just the prompt
- Measure where performance breaks

### The headline takeaway

**The first unlock for agent systems is better state, not bigger prompts.**

More specifically:
1. **Explicit thread state beats giant scratchpads**
2. **Shared coordination state beats just adding more agents**
3. **Actor identity needs to be explicit too**
4. **Architecture improvements help strong models a lot, but they do not magically rescue weak or unstable ones**

That feels directionally very right.

---

## What They Actually Tested

The repo asks a practical question:

> What breaks first when an AI agent has to manage a human-sized inbox?

Instead of stress-testing models with arbitrary numbers, they first anchored the problem in a real-world corpus:
- **Enron email metadata** used to estimate how many active threads a real worker handles
- Result: median worker around **50 active threads** in a 14-day window
- Common stress case around **105 active threads**

That matters because it makes the evaluation feel more grounded than a toy benchmark.

### Why the Enron angle is useful

The Enron corpus gives them:
- Real organizational communication patterns
- Thread volume and load distributions
- A way to estimate inbox complexity that comes from actual work, not synthetic assumptions

They then use those load levels to construct evaluation scenarios for agents.

This is a smart move. It gives the whole benchmark a more believable operating range.

---

## The Actual Test Structure

This is the part I should have emphasized more clearly.

What makes the study interesting is not just the conclusion — it's the way the experiments are structured.

He is not simply asking "which model is best?"
He is testing a sequence of **system-design hypotheses** by holding some variables constant and changing others.

The core dimensions being manipulated are:
- **memory substrate** — scratchpad blob vs explicit thread state
- **model strength** — stronger model vs smaller / weaker model
- **worker topology** — single agent vs multiple agents
- **coordination substrate** — no shared board vs shared board
- **identity structure** — task state only vs task state + explicit actor identity

So the benchmark is really a set of **A/B or controlled structural comparisons** around the same general inbox-management task.

### What that means methodologically

Instead of only producing a leaderboard, the study asks:
- if performance improves, **what changed?**
- was it the model?
- the memory format?
- the coordination layer?
- the presence of role fields?

That is much more useful than a generic eval because it points to product decisions.

### The comparison logic across experiments

| Experiment | Main comparison | What is being held roughly constant | What is being changed | What the result is supposed to isolate |
|-----------|-----------------|--------------------------------------|-----------------------|----------------------------------------|
| 1 | Scratchpad vs thread state | Same scenario, same model family, same judge | Memory/state representation | Whether the model mainly fails from weak memory organization |
| 2 | Stronger model vs smaller model with better state | Similar task structure + evaluation setup | Model capability / control reliability | Whether architecture can compensate for weaker model quality |
| 3 | Single vs multi-agent, with and without shared board | Same org-simulation setting | Agent count + coordination substrate | Whether scaling comes from more workers or from shared coordination state |
| 4 | Board without actor identity vs board with actor identity | Same coordination setup | Role / actor fields | Whether tasks alone are enough, or identity must also be explicit |

That structure is the real contribution.
It turns the repo into a set of architectural ablations, not just a model bakeoff.

---

## The Four Study Structures / Experiments

## 1) Explicit Thread State vs Giant Scratchpad

This seems like the strongest result in the repo.

They ran the same stress scenario using the same model/judge, but changed the memory substrate:
- **Condition A:** giant scratchpad / running notes blob
- **Condition B:** explicit per-thread state

### Result

With explicit thread state:
- the model stopped losing track of what a follow-up referred to
- wrong-target actions disappeared
- judged quality improved
- token use dropped sharply

### Why this matters

This suggests the model is often **not primarily failing at message understanding**.
It's failing because the system makes it repeatedly reconstruct:
- what the task is
- which thread the task belongs to
- whether something is already in progress
- what the current state of the work is

That is a systems problem more than a raw intelligence problem.

### My read

This is a very relevant lesson for almost any agentic product:
- inbox agent
- CRM copilot
- task manager
- internal ops bot
- even social-feed analysis tools

If the model has to infer task identity from a giant blob of memory every turn, you are wasting capability and inviting confusion.

---

## 2) Better State vs Smaller Model

This is the cleanest direct **model-configuration comparison** in the study.

The question here is not just "did thread state help?" That was already shown in Experiment 1.
The next question is:

> if architecture improves, can you swap in a smaller / cheaper model and get similar performance?

That is exactly the kind of practical question product teams care about.

### Configuration being compared

At a high level, the comparison is:
- **stronger model + better structure**
vs
- **smaller / weaker model + better structure**

So this is not scratchpad-vs-state anymore.
This is more like a **structure-vs-scale** test.

### Result

No, not really.

A smaller model with thread state still failed structured output / control requirements too often to be a credible replacement.

### Why this matters

This is a useful corrective to the too-common claim that "architecture solves everything."

What this study suggests instead:
- **State structure is a multiplier**
- but it multiplies the capability of a model that is already reasonably reliable
- it does not fully compensate for a model that cannot stay valid, controlled, or consistent

### My read

This feels right for production systems:
- better state can unlock a good model
- better state cannot fully rescue a flaky one

So there are really two separate problems:
1. **model baseline reliability**
2. **system architecture around the model**

Both matter.

---

## 3) Shared Board vs More Agents

This is the systems-comparison part of the study.

The setup is no longer just about one model handling memory well or poorly.
Now the question becomes:

> when you move from one worker to many, what actually improves performance?

They test whether scaling agent systems is mostly about:
- adding more worker agents in parallel
- or creating better shared coordination state

### Configuration logic

The interesting part here is that the study appears to compare combinations like:
- single agent, no board
- multi-agent, no board
- single agent, shared board
- multi-agent, shared board

That makes it a much better test than simply saying "we tried a swarm and it felt better/worse."
It lets you isolate whether the gain comes from **parallelism** or from **shared state**.

### Result

The shared board helped both single-agent and multi-agent setups.

Multiple agents **without** a shared board were slightly worse than a single agent without one.

### Why this matters

This is the anti-swarm lesson.

People often jump from:
> one agent struggles

to:
> let's add three more agents

But if those agents do not share structured state, they are just multiplying ambiguity.

### My read

This matches a general principle from distributed systems:
- concurrency without coordination primitives is usually pain
- more workers only help after you solve shared state / ownership / synchronization

For agent systems, the board appears to be the real scaling primitive.
Not agent count by itself.

---

## 4) Actor Identity on the Board

After showing that shared coordination state matters, they asked: what should that board actually contain?

Their answer: not just task identity, but **actor identity**.

That means the system should know things like:
- who owns the task internally
- who should respond externally
- whose voice or role the reply should represent

### Result

Task targeting was already decent, but role consistency drifted unless actor identity was explicit.
When actor identity was added, those errors disappeared.

### Why this matters

This is subtle and important.
A model can know:
- what needs to happen

but still fail on:
- who should say it
- who should sign it
- which internal/external persona is appropriate

In real workflows, those mistakes are not cosmetic. They are operational failures.

---

## The Best Idea in the Study

If I had to compress the whole thing to one line:

> **Most agent failures at realistic workload look less like "the model is dumb" and more like "the system made the model recover missing state over and over again."**

That is a powerful framing.

It shifts the design question from:
- "Which prompt is best?"

to:
- "What state should be explicit, canonical, and shared?"

That's a much more productizable way to think.

---

## Why the Evaluation Structure Is Good

A lot of model evals are weak because they are either:
- too toy-like
- too benchmark-y
- too disconnected from actual workflow structure
- too entangled (many variables change at once)
- or too dependent on the researcher's qualitative impression

This study structure is stronger because it has a few good properties:

### 1. Realistic workload anchor
Using Enron to estimate thread load gives the experiments a believable baseline.

### 2. Controlled structural comparisons
They are not changing everything at once.
They compare one system structure against another:
- scratchpad vs thread state
- stronger model vs smaller model under improved state structure
- single vs multi-agent with and without shared board
- task state vs task + actor identity

This is the part that matters most to me: the experiments are designed less like a generic benchmark and more like **architectural ablations**.
That means the result is interpretable.
When one condition wins, you can say more confidently *why* it won.

### 3. Architecture-first framing
The tests are about how the **system** around the model changes outcomes, which is actually where most product leverage is.

### 4. Practical lessons
The output is not just a leaderboard. It produces design rules:
- build task objects
- build shared state
- make role identity explicit
- don't assume swarms solve coordination

That makes it useful beyond just email.

---

## What Feels Most Relevant For Us

A few takeaways feel especially relevant for Blake-style products and experiments.

## 1) State architecture is a product advantage

This is the biggest one.

A lot of people treat AI products as:
- model + prompt + tool calls

But the real moat may often be:
- state model
- object structure
- coordination primitives
- memory design

This matters for:
- inbox agents
- provider workflows
- healthcare investigation systems
- internal task orchestration
- social feed comparison / interpretation products

If you structure the world well for the model, the same model performs much better.

## 2) Social-feed products may need explicit objects too

Even though this repo is about email, the lesson translates well to the Twitter/social-feed project.

A shared-feed or cross-perspective product should probably not just dump a giant timeline into a prompt.
It likely needs explicit objects such as:
- account
- source
- post
- topic cluster
- trust bucket
- viewpoint bucket
- reaction / significance state
- friend-specific feed slice

In other words: the same "better state beats bigger prompt" principle probably applies to social information systems too.

## 3) More agents is probably the wrong early instinct

For any future multi-agent setup we build, this is a useful warning.

Don't start with:
- router agent
- worker agents
- reviewer agents
- planner agents
- synthesizer agents

Start with:
- clear task objects
- canonical shared state
- explicit ownership
- actor/role identity

Then add multiple workers if there is a clear reason.

---

## Enron Dataset: Could We Use It?

Short answer: **yes, probably — but carefully and with a clear use case.**

The CMU-hosted Enron corpus is still one of the only substantial public collections of real organizational email.
Key facts:
- collected/cleaned via the CALO project
- ~150 users
- about **0.5 million messages**
- mostly senior management
- no attachments in the standard CMU version
- some deletions/redactions exist

### Possible ways we could use it

#### 1) Sample data for inbox-agent demos
This is probably the most immediate use.

We could use Enron-derived structures to create:
- realistic inbox thread sets
- realistic multi-person communication flows
- realistic escalation / delegation patterns

This would be much better than fake toy inbox examples.

#### 2) Build a canonical email-state schema
We could parse/store Enron into a structured format like:
- `people`
- `threads`
- `messages`
- `participants`
- `organizations`
- `topics`
- `tasks inferred`
- `ownership`
- `response needed`

That would let us experiment on:
- thread state representations
- summarization approaches
- retrieval strategies
- ownership / coordination layers

#### 3) Create benchmark scenarios
We could carve out reproducible stress scenarios such as:
- inbox with 50 active threads
- inbox with 100+ active threads
- role handoff scenario
- ambiguous ownership scenario
- multi-party coordination scenario

This is probably the highest-value use if we want to evaluate agents seriously.

#### 4) Use it as "organizational communication substrate" for other systems
Even outside literal email products, Enron could be useful as a stand-in corpus for:
- workflow orchestration
- corporate memory systems
- coordination analysis
- task extraction / routing

### Limitations / cautions

There are some obvious caveats:
- it is old
- it reflects one company in one scandalous moment
- missing attachments reduce realism
- some data is redacted / cleaned
- organizational culture may bias the structure
- public availability does **not** mean we should be sloppy about privacy/sensitivity

So I would not treat it as a universal truth corpus.
I would treat it as a very useful **real-ish public organizational benchmark**.

---

## What I Think the Secret Sauce Is Here

The secret sauce is not really "Enron" by itself.
And it is not just "better prompts."

It's the combination of:
1. **Real-world workload grounding** (Enron thread counts)
2. **Controlled architectural comparisons**
3. **A focus on state representation rather than just model intelligence**
4. **Testing agent systems as systems, not just models**

That combination is what makes it interesting.

---

## Best Quotes / Concepts To Keep

A few phrases from this study are worth hanging onto:

- **Better state, not bigger prompts**
- **Build around task objects and shared state**
- **Do not build a swarm before you build a board**
- **Actor identity should be explicit state too**

Those are genuinely strong design heuristics.

---

## My Bottom Line

This is a strong piece of work because it tests something that matters in production:

**When agents fail under realistic load, what exactly is failing?**

Their answer is compelling:
- not mostly raw comprehension
- not mostly lack of more agents
- often not even raw model size first
- but rather the absence of explicit, canonical, shared state

That feels broadly true.

For us, the most interesting implication is probably not "build an email agent."
It's:

> **Any serious agent product may need a first-class state model before it needs a fancier prompt stack.**

And yes — Enron looks like a useful source of realistic sample data / benchmark structure if we want to build or test anything around inboxes, organizational communication, routing, or coordination.

---

## Actionable Ideas For Us

### Near-term
- Save this as a reference pattern for agent-system evaluation
- Consider Enron as a benchmark corpus for any inbox / task-routing / coordination experiments
- Apply the "task objects + shared state" lens to the social-feed project architecture

### If we want to go deeper
- Download and normalize the Enron corpus into DuckDB or Postgres
- Build a minimal schema for threads / messages / participants / inferred tasks
- Create a few reproducible benchmark scenarios
- Test different state-management architectures ourselves

### Specific thought for the Twitter / feed-sharing project
If we ever add an AI layer that interprets or compares feeds, we should probably avoid a giant timeline scratchpad and instead model explicit entities and shared structures from the start.

---

## Links

- X post: https://x.com/krishnanrohit/status/2032181522296684679?s=46
- Repo: https://github.com/strangeloopcanon/llmenron
- Enron dataset (CMU): https://www.cs.cmu.edu/~enron/
