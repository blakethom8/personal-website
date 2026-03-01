import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { ConversationSimulator } from "@/components/learn/ConversationSimulator";
import { backgrounds } from "@/lib/backgrounds";

export const metadata: Metadata = {
  title: "AI Conversation Simulator",
  description:
    "Watch how AI conversations work under the hood — step through real API calls and agent workflows.",
};

export default function SimulatorPage() {
  return (
    <>
      <PageBackground
        src={backgrounds.learn}
        alt="Flowing water over rocks"
      />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        {/* Header */}
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <p className="label-mono">interactive lab</p>
            <Link
              href="/learn"
              className="font-mono text-[11px] text-fg-light no-underline hover:text-accent transition-colors"
            >
              ← all modules
            </Link>
          </div>
          <h1 className="mt-2 font-serif text-2xl md:text-3xl">
            AI Conversation Simulator
          </h1>
          <p className="mt-3 max-w-2xl text-fg-muted">
            Watch how AI conversations work under the hood — step through real
            API calls and agent workflows. See the JSON messages, tool calls,
            and the agent loop in action.
          </p>
        </Panel>

        {/* Simulator */}
        <div className="panel mx-auto w-[calc(100%-2*16px)] max-w-[1400px] overflow-hidden md:w-[calc(100%-2*40px)]">
          <ConversationSimulator />
        </div>
      </div>
    </>
  );
}
