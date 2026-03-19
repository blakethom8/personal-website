import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { ChiefShowcaseSection } from "@/components/ideas/ChiefShowcaseSection";
import { Panel } from "@/components/Panel";

export const metadata: Metadata = {
  title: "Chief",
  description: "How Blake works with Chief, a local OpenClaw assistant for thinking, building, reporting, and remembering.",
};

export default function ChiefPage() {
  return (
    <>
      <PageBackground src={backgrounds.ideas} alt="Coastal fog over the ocean" />
      <div className="flex flex-col gap-4 pb-5 pt-5">
        <Panel>
          <p className="label-mono mb-2">ideas / chief</p>
          <h1 className="font-serif text-2xl md:text-3xl">
            Chief.
            <br />
            <span className="text-accent">A local OpenClaw workflow for thinking, building, reporting, and remembering.</span>
          </h1>
          <div className="mt-4 max-w-[82ch] content-body text-fg-muted">
            <p className="font-medium text-fg">
              This page is a closer look at how I actually use Chief in practice.
            </p>
            <p>
              More than a chatbot, Chief is my local OpenClaw assistant — a workflow for
              turning rough thoughts into architecture, reports, code, and useful memory.
              The most important pattern is simple: think first, then turn that thinking into
              durable artifacts.
            </p>
          </div>
        </Panel>

        <ChiefShowcaseSection />
      </div>
    </>
  );
}
