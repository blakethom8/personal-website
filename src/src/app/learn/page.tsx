import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { LearnTabs } from "@/components/learn/LearnTabs";

export const metadata: Metadata = {
  title: "Learn",
  description: "Interactive modules that demystify AI for non-technical people.",
};

export default function LearnPage() {
  return (
    <>
      <PageBackground src={backgrounds.learn} alt="Flowing water over rocks" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        <div className="panel mx-auto w-[calc(100%-2*16px)] max-w-[1200px] px-5 py-4 md:w-[calc(100%-2*40px)] md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="label-mono mb-1">new module</p>
              <h2 className="font-serif text-xl md:text-2xl">WebMCP Lab</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Public demo + education interface for browser agents and tool discovery.
              </p>
            </div>
            <Link
              href="/learn/webmcp-lab"
              className="rounded bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
            >
              Open Lab
            </Link>
          </div>
        </div>

        <LearnTabs />
      </div>
    </>
  );
}
