# Module 5: Agentic Patterns

**How all the pieces compose into strategies — the difference between a chatbot and a truly autonomous agent.**

---

## From Components to Strategies

You now understand the building blocks:
- The **model** predicts text
- **Structured messages** carry requests and responses
- **Context** gives the model memory within and across sessions
- **Tools** let the model interact with the real world
- The **harness** orchestrates everything

But knowing the components doesn't tell you how to *use* them effectively. That's what agentic patterns are — proven strategies for combining these components to solve real problems.

Think of it this way: knowing what an engine, steering wheel, and brakes are doesn't make you a racing driver. Patterns are the driving techniques.

---

## Pattern 1: ReAct (Reason + Act)

This is the most fundamental pattern — and you've already seen it. ReAct stands for **Reason + Act**, and it's the think → act → observe loop we introduced in Module 1.

```
┌──────────────────────────────────────────────────────┐
│              ReAct PATTERN                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐                                        │
│  │  REASON  │ "What do I know? What do I need?"      │
│  └────┬─────┘                                        │
│       │                                              │
│       ▼                                              │
│  ┌──────────┐                                        │
│  │   ACT    │ Use a tool to get info or take action  │
│  └────┬─────┘                                        │
│       │                                              │
│       ▼                                              │
│  ┌──────────┐                                        │
│  │ OBSERVE  │ Look at the result                     │
│  └────┬─────┘                                        │
│       │                                              │
│       ▼                                              │
│  ┌──────────┐     ┌──────┐                           │
│  │  REASON  │────▶│ DONE │ "I have enough to answer" │
│  │  again   │     └──────┘                           │
│  └────┬─────┘                                        │
│       │ "I need more info"                           │
│       ▼                                              │
│  ┌──────────┐                                        │
│  │   ACT    │ Use another tool                       │
│  └────┬─────┘                                        │
│       │                                              │
│       ▼                                              │
│      ...repeat until done...                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**When it works well:** Straightforward tasks where the agent can make progress one step at a time. "Find this," "check that," "compile results."

**When it struggles:** Complex tasks with many dependencies. The agent can get lost in loops, lose track of the overall goal, or go down rabbit holes.

### ReAct in Practice: The CRM Prep Brief

Our CRM example from Module 4 was a ReAct pattern:

1. **Reason:** "I need Dr. Patel's info from the CRM"
2. **Act:** `search_contacts(name: "Dr. Patel")`
3. **Observe:** Found her. ID: 4829
4. **Reason:** "Now I need her recent activity and details"
5. **Act:** `get_contact_details(id: 4829)` + `get_recent_activity(id: 4829)`
6. **Observe:** Got meeting notes and engagement signals
7. **Reason:** "I have everything I need to write the brief"
8. **Done:** Compose and deliver the prep brief

Simple, linear, effective. Most agent interactions use this pattern.

---

## Pattern 2: Plan and Execute

For more complex tasks, reasoning one step at a time isn't enough. The agent needs to think ahead — make a plan, then execute it.

```
┌──────────────────────────────────────────────────────┐
│           PLAN AND EXECUTE PATTERN                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Step 1: PLAN                                        │
│  ┌────────────────────────────────────────────┐      │
│  │  "Here's my plan to complete this task:    │      │
│  │   1. Pull Q4 sales data from the database  │      │
│  │   2. Calculate YoY growth by region         │      │
│  │   3. Identify top-performing products       │      │
│  │   4. Generate visualizations                │      │
│  │   5. Compile into executive summary"        │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  Step 2: EXECUTE (each step uses ReAct)              │
│  ┌────────────────────────────────────────────┐      │
│  │  Executing step 1 of 5...                  │      │
│  │  → query_database("SELECT * FROM sales...") │      │
│  │  ✅ Done. 3,847 rows retrieved.             │      │
│  │                                            │      │
│  │  Executing step 2 of 5...                  │      │
│  │  → run_analysis(data, type: "yoy_growth")  │      │
│  │  ✅ Done. Growth: +15% overall.             │      │
│  │                                            │      │
│  │  Executing step 3 of 5...                  │      │
│  │  ...                                       │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  Step 3: ADAPT (if needed)                           │
│  ┌────────────────────────────────────────────┐      │
│  │  "Step 3 revealed an anomaly in West Coast │      │
│  │   data. Adjusting plan: adding step 3b     │      │
│  │   to investigate before continuing."        │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**When it works well:** Multi-step projects, report generation, analysis workflows — anything where the agent benefits from thinking through the approach before diving in.

**When it struggles:** Tasks where the plan can't be known in advance (the right approach depends on what you discover along the way).

The key difference from ReAct: the agent **commits to a strategy** before acting. It can revise the plan if things change, but having a plan keeps it focused and prevents wandering.

---

## Pattern 3: Tool Selection and Routing

As agents get access to more tools, a new challenge emerges: **which tool should I use?** With 5 tools, it's obvious. With 50, the model needs a strategy for selecting the right one.

```
┌──────────────────────────────────────────────────────┐
│           TOOL SELECTION PATTERN                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  User: "How much did we spend on marketing           │
│         in Q3 compared to Q2?"                       │
│                                                      │
│  Available tools (50+):                              │
│    search_contacts, get_revenue, send_email,         │
│    check_calendar, query_expenses, get_budget,       │
│    generate_chart, export_csv, run_forecast,         │
│    search_web, read_file, ... (40 more)              │
│                                                      │
│  Model reasons about tool selection:                 │
│  ┌────────────────────────────────────────────┐      │
│  │  "This is a financial comparison question.  │      │
│  │   I need:                                   │      │
│  │   • query_expenses — to pull Q2 & Q3 data  │      │
│  │   • generate_chart — to visualize the       │      │
│  │     comparison                              │      │
│  │                                             │      │
│  │   I do NOT need:                            │      │
│  │   • search_contacts (not about people)      │      │
│  │   • send_email (no one asked to send)       │      │
│  │   • search_web (data is internal)"          │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

This seems simple, but it's where tool descriptions (Module 4) become critical. The model selects tools based on how well the description matches the user's request. Ambiguous descriptions lead to wrong tool choices.

Some advanced harnesses use a **two-stage approach**:
1. A fast, cheap model quickly classifies the request and narrows down relevant tools
2. The main model only sees the relevant subset — reducing confusion and cost

---

## Pattern 4: Reflection and Self-Correction

What happens when the agent makes a mistake? Smarter agents can **review their own work** and catch errors before delivering a result.

```
┌──────────────────────────────────────────────────────┐
│           REFLECTION PATTERN                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Step 1: Generate initial result                     │
│  ┌────────────────────────────────────────────┐      │
│  │  Agent produces a draft report on Q4 sales  │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  Step 2: Self-review                                 │
│  ┌────────────────────────────────────────────┐      │
│  │  "Let me review my work:                    │      │
│  │   ✅ Q4 totals look correct                 │      │
│  │   ✅ Regional breakdown adds up             │      │
│  │   ❌ I used Q3 data for the West Coast      │      │
│  │      comparison instead of Q4. Let me fix   │      │
│  │      that.                                  │      │
│  │   ⚠️  I should add a note about the         │      │
│  │      incomplete December data."              │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  Step 3: Revise and deliver                          │
│  ┌────────────────────────────────────────────┐      │
│  │  Agent fixes the error, adds the caveat,    │      │
│  │  and delivers the corrected report.          │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  The agent caught its own mistake because the        │
│  harness prompted it to review before finalizing.    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**When it works well:** Writing, analysis, code generation — anything where reviewing output catches errors that initial generation missed.

**When it struggles:** The model can't reliably catch logical errors in domains it doesn't deeply understand. Self-review works for surface-level mistakes but isn't a substitute for human review on critical work.

---

## Pattern 5: Multi-Agent Collaboration

For truly complex work, a single agent hitting one model isn't enough. **Multi-agent systems** split work across specialized agents that collaborate.

```
┌──────────────────────────────────────────────────────┐
│           MULTI-AGENT PATTERN                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  User: "Prepare a competitive analysis report        │
│         on cardiology services in LA County"          │
│                                                      │
│  ┌─────────────────────────────────────────────┐     │
│  │            COORDINATOR AGENT                 │     │
│  │  Breaks down the task, delegates, compiles   │     │
│  └─────┬──────────┬──────────┬────────────┘     │     │
│        │          │          │                        │
│        ▼          ▼          ▼                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ RESEARCH │ │  DATA    │ │ WRITING  │             │
│  │  AGENT   │ │  AGENT   │ │  AGENT   │             │
│  │          │ │          │ │          │             │
│  │ Searches │ │ Queries  │ │ Takes    │             │
│  │ web for  │ │ CMS data │ │ research │             │
│  │ news,    │ │ for      │ │ & data,  │             │
│  │ trends,  │ │ volumes, │ │ produces │             │
│  │ compet-  │ │ patterns,│ │ polished │             │
│  │ itors    │ │ market   │ │ report   │             │
│  │          │ │ share    │ │          │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│                                                      │
│  Each agent has different tools, prompts, and        │
│  maybe even different models (cheaper for simple     │
│  tasks, more capable for complex reasoning).         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**When it works well:** Large, decomposable tasks. Parallel work. Tasks requiring different expertise or tool access.

**When it struggles:** Coordination overhead. Agents may duplicate work or produce inconsistent outputs. More complex = more things that can go wrong.

This pattern is cutting-edge — most consumer AI products don't use it yet. But it's where the industry is heading, and it's how the most sophisticated business AI systems are being built today.

---

## How Patterns Compose

In practice, agents don't use just one pattern. They layer them:

```
┌──────────────────────────────────────────────────────┐
│           PATTERNS IN COMBINATION                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  A coding agent working on a feature might:          │
│                                                      │
│  1. PLAN: Break the feature into subtasks            │
│     (Plan and Execute)                               │
│                                                      │
│  2. EXECUTE each subtask: Read code, think about     │
│     changes, make edits, run tests                   │
│     (ReAct loop within each step)                    │
│                                                      │
│  3. SELECT TOOLS: Choose between file editing,       │
│     terminal commands, web search for docs           │
│     (Tool Selection for each action)                 │
│                                                      │
│  4. REVIEW: Run the tests, check the output,         │
│     fix any failures                                 │
│     (Reflection after each subtask)                  │
│                                                      │
│  5. DELEGATE: Spawn a sub-agent to write tests       │
│     while the main agent continues on the next       │
│     subtask                                          │
│     (Multi-Agent for parallel work)                  │
│                                                      │
│  All five patterns, working together, in a single    │
│  task that takes a few minutes.                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

This composition is what makes modern AI agents feel "intelligent." It's not one clever trick — it's multiple strategies working in concert, orchestrated by the harness, powered by the model's ability to reason about what to do next.

---

## The Pattern Spectrum: Chatbot → Agent → Autonomous

These patterns map onto a spectrum of autonomy:

```
┌──────────────────────────────────────────────────────┐
│           THE AUTONOMY SPECTRUM                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  CHATBOT ─────────── AGENT ─────────── AUTONOMOUS   │
│                                                      │
│  • Single turn       • Multi-turn        • Multi-    │
│  • No tools          • Tools available     session   │
│  • No memory         • Session memory    • Long-term │
│  • User drives       • Agent + user       memory     │
│                        collaborate       • Agent     │
│                      • Human in loop      drives     │
│                                          • Proactive │
│                                          • Self-     │
│                                           correcting │
│                                                      │
│  "What's 2+2?"      "Prep me for my     "Monitor    │
│                      meeting with        our sales   │
│  → "4"               Dr. Patel"          pipeline    │
│                                          and alert   │
│                      → [searches CRM,    me about    │
│                      compiles brief,     risks"      │
│                      delivers prep]                  │
│                                          → [runs     │
│                                          daily,      │
│                                          checks      │
│                                          data,       │
│                                          flags       │
│                                          issues]     │
│                                                      │
│  Patterns used:      Patterns used:     Patterns:    │
│  None                ReAct,             All of them  │
│                      Tool Selection                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Most AI products today sit in the middle — they're agents with tool access and session memory, where the human stays in the loop. The fully autonomous end is where things are heading, but it requires robust safety patterns (confirmation gates, audit logs, human override) that the industry is still developing.

---

## Key Takeaways

1. **ReAct (Reason + Act)** is the foundational loop — think, use a tool, observe, repeat
2. **Plan and Execute** adds strategic thinking — plan the approach before diving in
3. **Tool Selection** becomes critical as tool count grows — the model needs to pick the right tool from many options
4. **Reflection** catches mistakes — the agent reviews its own work before delivering
5. **Multi-Agent** scales to complex work — specialized agents collaborate on big tasks
6. **Patterns compose** — real agents layer multiple patterns in a single task
7. **Autonomy is a spectrum** — from simple chatbot to fully autonomous system, with most products in the middle

These patterns are the "driving techniques" that separate a novice from an expert. The same model, with better patterns, produces dramatically better results. This is why harness design matters more than model selection — and why "which model do you use?" is the wrong question to ask.

---

**Next up:** [Epilogue — Same Engine, Different Cars →](./06-same-engine-different-cars.md)

Let's see these patterns in action by comparing three AI products that use the same model but deliver completely different experiences.
