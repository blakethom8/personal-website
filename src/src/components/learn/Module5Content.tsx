"use client";

import { FlowDiagram } from "@/components/diagrams/FlowDiagram";

export function Module5Content() {
  return (
    <div className="post-content">
      <p className="mb-4 font-semibold text-fg">
        How the pieces turn into working strategies — the difference between a
        chat interface that answers once and an agent that can pursue a goal.
      </p>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Patterns Are Operating Strategies</h2>

      <p className="mb-4">
        By this point, you know the parts: model, messages, context, tools. But
        parts alone do not produce behavior. A pattern is the operating strategy
        the harness nudges the model into using.
      </p>

      <p className="mb-6">
        That means agentic patterns are less like &quot;features&quot; and more like
        <strong>working styles</strong>. Do we want the model to take one step at
        a time? Make a plan first? Review its own work? Delegate to another
        specialist? Those are pattern choices.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Pattern 1: ReAct</h2>

      <p className="mb-4">
        ReAct stands for <strong>Reason + Act</strong>. It is the default loop
        most people picture when they imagine an agent:
      </p>

      <FlowDiagram
        title="The Default Agent Loop"
        steps={[
          {
            label: "Reason",
            description: "What do I know already? What information or action is missing?",
          },
          {
            label: "Act",
            description: "Call a tool, search, read a file, run a command, or perform the next visible step.",
          },
          {
            label: "Observe",
            description: "Interpret the tool result and update the current understanding of the task.",
          },
          {
            label: "Decide again",
            description: "Either loop for another step or stop and deliver the result.",
          },
        ]}
      />

      <p className="mb-6">
        ReAct works well when the problem is discoverable step-by-step. Search,
        inspect, act, inspect again. It is a strong default because it keeps the
        model grounded in fresh evidence rather than letting it hallucinate a
        full plan too early.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Pattern 2: Plan and Execute</h2>

      <p className="mb-4">
        Some work is too large to improvise one turn at a time. If the task has
        real structure, the agent often does better by committing to a plan
        first and executing against it.
      </p>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded border border-border-light bg-bg-panel p-5">
          <p className="label-mono mb-2">plan</p>
          <h3 className="font-sans text-lg font-semibold">Set the route</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-fg-muted">
            <li>Pull Q4 data</li>
            <li>Calculate year-over-year growth</li>
            <li>Identify anomalies</li>
            <li>Generate charts</li>
            <li>Write the summary</li>
          </ol>
        </div>

        <div className="rounded border border-border-light bg-bg-panel p-5">
          <p className="label-mono mb-2">execute</p>
          <h3 className="font-sans text-lg font-semibold">Work the plan</h3>
          <p className="mt-3 text-sm text-fg-muted">
            Each planned step is then carried out using smaller ReAct loops. If
            a step reveals a surprise, the plan can be adjusted rather than
            abandoned.
          </p>
        </div>
      </div>

      <p className="mb-6">
        Planning is not automatically smarter. It is just better for tasks where
        sequencing matters and where the agent needs to keep sight of the whole
        project rather than chase whatever looks interesting next.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Pattern 3: Routing</h2>

      <p className="mb-4">
        As soon as an agent has many tools, another problem appears: choosing
        the right tool set for the job. That is routing.
      </p>

      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b-2 border-border-light bg-bg-panel">
              <th className="px-4 py-3 text-left font-semibold">User request</th>
              <th className="px-4 py-3 text-left font-semibold">Likely route</th>
              <th className="px-4 py-3 text-left font-semibold">Why</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3">“What did we spend on marketing in Q3?”</td>
              <td className="px-4 py-3 font-mono text-[12px] text-accent">query_expenses → generate_chart</td>
              <td className="px-4 py-3">Internal finance question, so internal tools beat web search.</td>
            </tr>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3">“Summarize this repo and add CSV export.”</td>
              <td className="px-4 py-3 font-mono text-[12px] text-accent">read / edit / exec</td>
              <td className="px-4 py-3">The environment itself is the tool surface.</td>
            </tr>
            <tr>
              <td className="px-4 py-3">“What changed in cardiology hiring this quarter?”</td>
              <td className="px-4 py-3 font-mono text-[12px] text-accent">search_web → query_internal_data</td>
              <td className="px-4 py-3">Good answer requires both external market context and internal numbers.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-6">
        Good routing is one of the quiet superpowers of a harness. It keeps the
        model from seeing irrelevant tools, lowers cost, and makes tool choice
        more reliable.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Pattern 4: Reflection</h2>

      <p className="mb-4">
        Reflection is the pattern where the agent checks its own work before it
        hands the result back. This is especially useful in writing, coding, and
        analysis tasks.
      </p>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded border border-border-light bg-bg-panel p-4">
          <p className="label-mono mb-2">draft</p>
          <p className="text-sm text-fg-muted">
            Produce the first version quickly so there is something concrete to inspect.
          </p>
        </div>

        <div className="rounded border border-border-light bg-bg-panel p-4">
          <p className="label-mono mb-2">review</p>
          <p className="text-sm text-fg-muted">
            Check for missing data, logic errors, broken code paths, or unsupported claims.
          </p>
        </div>

        <div className="rounded border border-border-light bg-bg-panel p-4">
          <p className="label-mono mb-2">revise</p>
          <p className="text-sm text-fg-muted">
            Correct the work before the user sees it, or escalate if certainty is not high enough.
          </p>
        </div>
      </div>

      <p className="mb-6">
        Reflection does not make the model omniscient. It just gives the system
        a second pass. That second pass often catches the obvious mistakes that
        would otherwise make the whole interaction feel brittle.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Pattern 5: Multi-Agent Delegation</h2>

      <p className="mb-4">
        For heavier work, a coordinator can hand parts of the job to more
        specialized sub-agents. This is where the system starts to look less
        like one assistant and more like a small team.
      </p>

      <div className="mb-6 rounded border border-border-light bg-bg-panel p-5">
        <div className="rounded border border-accent/30 bg-accent-light/20 p-4 text-center">
          <p className="label-mono mb-1">coordinator</p>
          <h3 className="font-sans text-lg font-semibold">Main Agent</h3>
          <p className="mt-2 text-sm text-fg-muted">
            Breaks down the task, assigns work, and composes the final output.
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded border border-border-light bg-white p-4">
            <p className="label-mono mb-2">specialist 1</p>
            <h4 className="font-sans text-base font-semibold">Research Agent</h4>
            <p className="mt-2 text-sm text-fg-muted">
              Searches the web, gathers market context, and finds external signals.
            </p>
          </div>

          <div className="rounded border border-border-light bg-white p-4">
            <p className="label-mono mb-2">specialist 2</p>
            <h4 className="font-sans text-base font-semibold">Data Agent</h4>
            <p className="mt-2 text-sm text-fg-muted">
              Queries internal systems, databases, and metrics pipelines.
            </p>
          </div>

          <div className="rounded border border-border-light bg-white p-4">
            <p className="label-mono mb-2">specialist 3</p>
            <h4 className="font-sans text-base font-semibold">Writing Agent</h4>
            <p className="mt-2 text-sm text-fg-muted">
              Turns the gathered evidence into a polished brief or report.
            </p>
          </div>
        </div>
      </div>

      <p className="mb-6">
        Delegation is powerful, but it adds coordination cost. More agents means
        more context passing, more opportunities for inconsistency, and more
        system design decisions for the harness owner.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Patterns Compose</h2>

      <p className="mb-4">
        The important thing is that real agents rarely use just one pattern.
        They stack them.
      </p>

      <FlowDiagram
        title="A Coding Agent in the Wild"
        steps={[
          {
            label: "Plan the feature",
            description: "Break the request into file reads, code edits, tests, and deploy checks.",
          },
          {
            label: "Use ReAct inside each step",
            description: "Read a file, inspect it, edit it, run a command, observe the result.",
          },
          {
            label: "Route to the right tools",
            description: "Choose between file editing, terminal execution, browser checks, or search.",
          },
          {
            label: "Reflect on the output",
            description: "Catch failures, rerun tests, and tighten the answer before final delivery.",
          },
        ]}
      />

      <p className="mb-6">
        That is why modern agent behavior can feel surprisingly capable without
        requiring mystical intelligence. A lot of the &quot;smartness&quot; lives in
        the workflow pattern, not just in the raw model.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">The Autonomy Spectrum</h2>

      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b-2 border-border-light bg-bg-panel">
              <th className="px-4 py-3 text-left font-semibold">System type</th>
              <th className="px-4 py-3 text-left font-semibold">Typical behavior</th>
              <th className="px-4 py-3 text-left font-semibold">Pattern depth</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3 font-semibold">Chatbot</td>
              <td className="px-4 py-3">Answer one prompt, then stop.</td>
              <td className="px-4 py-3">Almost none.</td>
            </tr>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3 font-semibold">Agent</td>
              <td className="px-4 py-3">Uses tools, loops, and reasons through a task.</td>
              <td className="px-4 py-3">ReAct plus routing or planning.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Autonomous system</td>
              <td className="px-4 py-3">Runs on triggers, across sessions, often with delegation.</td>
              <td className="px-4 py-3">Layered patterns with persistent memory and orchestration.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        <strong>Where this leads next:</strong> patterns explain the behavior you
        experience. The harness is the engineering layer that makes those
        patterns reliable, safe, and repeatable.
      </p>
    </div>
  );
}
