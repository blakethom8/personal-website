import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { LearnTabs } from "@/components/learn/LearnTabs";

export const metadata: Metadata = {
  title: "Learn",
  description: "Interactive modules that demystify AI for non-technical people.",
};

interface LearnPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const { tab } = await searchParams;

  return (
    <>
      <PageBackground src={backgrounds.learn} alt="Flowing water over rocks" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        <div className="panel mx-auto w-[calc(100%-2*16px)] max-w-[1200px] px-5 py-4 md:w-[calc(100%-2*40px)] md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="label-mono mb-1">learn navigation</p>
              <h2 className="font-serif text-xl md:text-2xl">Choose Your Path</h2>
              <p className="mt-1 max-w-[70ch] text-[13px] leading-relaxed text-fg-muted">
                Start with the guided simulator, browse module source files, or jump straight into
                the WebMCP Lab demo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/learn?tab=guides"
                className="rounded bg-accent px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
              >
                Start Guided Simulator
              </Link>
              <Link
                href="/learn?tab=modules"
                className="rounded border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-fg-muted transition-colors hover:border-accent hover:text-accent"
              >
                Browse Module Files
              </Link>
              <Link
                href="/learn/webmcp-lab"
                className="rounded border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-fg-muted transition-colors hover:border-accent hover:text-accent"
              >
                Open WebMCP Lab
              </Link>
            </div>
          </div>
        </div>

        <LearnTabs initialTab={tab} />
      </div>
    </>
  );
}
