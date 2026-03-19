import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { getAllPosts } from "@/lib/posts";
import { IdeasView } from "@/components/ideas/IdeasView";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Writing on technology, healthcare, AI, and building.",
};

export default function IdeasPage() {
  const posts = getAllPosts();

  return (
    <>
      <PageBackground src={backgrounds.ideas} alt="Coastal fog over the ocean" />
      <div className="flex flex-col gap-4 pb-5 pt-5">
        <IdeasChiefTeaser />
        <IdeasView posts={posts} />
      </div>
    </>
  );
}

function IdeasChiefTeaser() {
  return (
    <div className="panel mx-auto w-[calc(100%-2*16px)] max-w-[1200px] px-5 py-5 md:w-[calc(100%-2*40px)] md:px-7 md:py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-[760px]">
          <p className="label-mono mb-2">featured workflow</p>
          <h2 className="font-serif text-2xl md:text-[2rem] leading-tight">
            How I work with Chief.
            <br />
            <span className="text-accent">A local OpenClaw assistant for thinking, building, reporting, and remembering.</span>
          </h2>
          <div className="mt-3 max-w-[74ch] space-y-3 text-fg-muted">
            <p>
              Chief is my local AI workflow for turning rough thoughts into reports,
              projects, architecture, and useful memory that compounds over time.
            </p>
            <p>
              I use it most as a thought partner first — then as a system for producing
              durable artifacts from that thinking.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href="/ideas/chief"
            className="inline-flex rounded border border-accent/20 bg-accent-light/30 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent no-underline transition-opacity hover:opacity-70"
          >
            open page →
          </Link>
        </div>
      </div>
    </div>
  );
}
