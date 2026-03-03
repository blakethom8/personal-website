"use client";
/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { FlowDiagram } from "@/components/diagrams/FlowDiagram";
import { RequestResponseFlow } from "@/components/diagrams/RequestResponseFlow";

export function Module4Content() {
  return (
    <div className="post-content">
      <p className="mb-4 font-semibold text-fg">
        How agents touch the real world — the moment text prediction becomes
        file access, database queries, browser control, and useful work.
      </p>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Why Tools Matter</h2>

      <p className="mb-4">
        By now the limitation should be clear: a model can only do one native
        thing. It reads tokens and predicts the next tokens. It cannot open your
        calendar. It cannot check a CRM. It cannot read a local file. It cannot
        query a database. It cannot click a browser button.
      </p>

      <p className="mb-6">
        <strong>Tools are the bridge.</strong> They are the way the harness
        gives the model controlled access to the outside world. The model
        decides what action it wants. The harness performs the action. Then the
        result comes back as more structured text for the model to reason about.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">The Tool Loop</h2>

      <p className="mb-4">
        A tool call is not magic. It is a repeatable loop between the model and
        the harness:
      </p>

      <FlowDiagram
        title="What Happens When an Agent Uses a Tool"
        steps={[
          {
            label: "Model recognizes a gap",
            description: "It sees that answering well requires outside information or an external action.",
          },
          {
            label: "Model requests a tool",
            description: "It emits a structured tool call instead of final prose.",
          },
          {
            label: "Harness executes it",
            description: "The actual system reads the file, runs the query, hits the API, or controls the browser.",
          },
          {
            label: "Result returns to the model",
            description: "The harness packages the output as a tool result message.",
          },
          {
            label: "Model decides what to do next",
            description: "It may answer, or it may call another tool and continue the loop.",
          },
        ]}
      />

      <p className="mb-6">
        This is why tools are part of the harness, not the model. The model is
        still just generating structured text. The harness is the part with
        actual claws.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">What a Tool Looks Like in Practice</h2>

      <p className="mb-4">
        The harness has to tell the model what tools exist. It does that the
        same way it tells it everything else: with structured data in the API
        request.
      </p>

      <RequestResponseFlow
        title="Tool Definition in the Request → Tool Use in the Response"
        request={`{
  "tools": [
    {
      "name": "search_contacts",
      "description": "Search the CRM for contacts by name, company, specialty, or location.",
      "input_schema": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "company": { "type": "string" },
          "specialty": { "type": "string" },
          "location": { "type": "string" }
        }
      }
    }
  ]
}`}
        response={`{
  "content": [
    {
      "type": "tool_use",
      "name": "search_contacts",
      "input": {
        "name": "Dr. Anita Patel",
        "specialty": "cardiology"
      }
    }
  ],
  "stop_reason": "tool_use"
}`}
      />

      <p className="mb-6">
        The important point is that the model is selecting from descriptions.
        Good tool descriptions act like good product copy: they tell the model
        what the tool is for, what inputs it expects, and when it should be
        used.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">A Real Workflow: Meeting Prep</h2>

      <p className="mb-4">
        Imagine a healthcare CRM agent getting this request:
        <em> &quot;I have a meeting with Dr. Patel tomorrow. Give me a prep brief.&quot;</em>
      </p>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="rounded border border-border-light bg-bg-panel p-4">
          <p className="label-mono mb-2">tool 1</p>
          <h3 className="font-sans text-base font-semibold">search_contacts</h3>
          <p className="mt-2 text-sm text-fg-muted">
            Find the right Dr. Patel in the CRM and resolve the identity before
            doing anything else.
          </p>
        </div>

        <div className="rounded border border-border-light bg-bg-panel p-4">
          <p className="label-mono mb-2">tool 2</p>
          <h3 className="font-sans text-base font-semibold">get_contact_details</h3>
          <p className="mt-2 text-sm text-fg-muted">
            Pull prior notes, role, organization, and the last important
            meeting context.
          </p>
        </div>

        <div className="rounded border border-border-light bg-bg-panel p-4">
          <p className="label-mono mb-2">tool 3</p>
          <h3 className="font-sans text-base font-semibold">get_recent_activity</h3>
          <p className="mt-2 text-sm text-fg-muted">
            Look for fresh buying signals: opened proposal, visited pricing,
            downloaded a case study.
          </p>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b-2 border-border-light bg-bg-panel">
              <th className="px-4 py-3 text-left font-semibold">What the agent needs</th>
              <th className="px-4 py-3 text-left font-semibold">Which tool gets it</th>
              <th className="px-4 py-3 text-left font-semibold">Why it matters</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3">Correct contact record</td>
              <td className="px-4 py-3 font-mono text-[12px] text-accent">search_contacts</td>
              <td className="px-4 py-3">Avoids briefing the rep on the wrong Patel.</td>
            </tr>
            <tr className="border-b border-border-light">
              <td className="px-4 py-3">Prior context and notes</td>
              <td className="px-4 py-3 font-mono text-[12px] text-accent">get_contact_details</td>
              <td className="px-4 py-3">Lets the agent reference the actual last conversation.</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Recent intent signals</td>
              <td className="px-4 py-3 font-mono text-[12px] text-accent">get_recent_activity</td>
              <td className="px-4 py-3">Turns a generic brief into a strategic one.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-6">
        The value is not that the model is eloquent. The value is that it can
        pull the right information from the right systems quickly enough to be
        useful before the meeting starts.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Basic Tools vs. Purpose-Built Tools</h2>

      <p className="mb-4">
        There are two common ways to equip an agent:
      </p>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded border border-border-light bg-bg-panel p-5">
          <p className="label-mono mb-2">general tools</p>
          <h3 className="font-sans text-lg font-semibold">Swiss Army Knife</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-fg-muted">
            <li><strong>read</strong>, <strong>write</strong>, <strong>edit</strong>, <strong>exec</strong>, <strong>browser</strong></li>
            <li>Very flexible and composable</li>
            <li>Great for coding agents and research agents</li>
            <li>Best when the environment itself is the tool surface</li>
          </ul>
        </div>

        <div className="rounded border border-border-light bg-bg-panel p-5">
          <p className="label-mono mb-2">specialized tools</p>
          <h3 className="font-sans text-lg font-semibold">Power Drill</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-fg-muted">
            <li><strong>search_contacts</strong>, <strong>check_formulary</strong>, <strong>submit_request</strong></li>
            <li>Narrower, safer, and easier to route correctly</li>
            <li>Great for business workflows and production apps</li>
            <li>Best when reliability matters more than raw flexibility</li>
          </ul>
        </div>
      </div>

      <p className="mb-6">
        Most real systems use both. A coding harness like OpenClaw leans hard on
        general tools. A business agent usually wraps the important workflows in
        purpose-built tools so the model can act with less ambiguity.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">Why MCP Matters</h2>

      <p className="mb-4">
        One of the biggest practical problems in agent development used to be
        tool portability. Every platform had its own plugin format, tool schema,
        and runtime assumptions.
      </p>

      <FlowDiagram
        title="The MCP Idea"
        orientation="horizontal"
        steps={[
          {
            label: "Define the capability once",
            description: "Expose a database, browser action, or service as a standard tool server.",
          },
          {
            label: "Let the harness discover it",
            description: "The agent learns what the tool does from the shared MCP interface.",
          },
          {
            label: "Reuse it across agents",
            description: "Different compatible agents can call the same capability without custom glue each time.",
          },
        ]}
      />

      <p className="mb-6">
        The simplest way to think about MCP is: <strong>USB for AI tools.</strong>
        It doesn't make the tool good by itself. It makes the tool portable.
      </p>

      <hr className="my-8 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">What Makes a Good Tool</h2>

      <ul className="mb-6 list-disc space-y-3 pl-6">
        <li>
          <strong>Clear name and description</strong> — the model should know
          when to reach for it.
        </li>
        <li>
          <strong>Structured inputs</strong> — make the schema obvious so the
          call is easy to form correctly.
        </li>
        <li>
          <strong>Structured outputs</strong> — return useful data, not a wall
          of prose the model has to guess at.
        </li>
        <li>
          <strong>Narrow permissions</strong> — especially for external actions
          like email, posting, or anything that can change live systems.
        </li>
        <li>
          <strong>Good failure modes</strong> — &quot;no contact found&quot; is far
          more useful than a vague crash message.
        </li>
      </ul>

      <p className="mb-6">
        If the tool surface is designed well, the model can look far more
        competent than it really is. If the tool surface is muddy, even a strong
        model feels clumsy.
      </p>

      <div className="rounded border border-accent/25 bg-accent-light/20 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
          try it live
        </p>
        <p className="mt-2 text-sm text-fg-muted">
          The simulator already shows this loop in action. The{" "}
          <Link href="/learn/simulator" className="text-accent underline-offset-2 hover:underline">
            interactive labs
          </Link>{" "}
          are the fastest way to see tool calls and tool results as structured
          phases instead of abstract theory.
        </p>
      </div>

      <hr className="my-8 border-border-light" />

      <p>
        <strong>Next up:</strong> tools tell you what an agent <em>can</em> do.
        Agentic patterns explain how it decides <em>what to do next</em>.
      </p>
    </div>
  );
}
