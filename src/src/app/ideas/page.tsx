import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { backgrounds } from "@/lib/backgrounds";
import { getAllPosts } from "@/lib/posts";
import { IdeasView } from "@/components/ideas/IdeasView";

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
        {/* Header */}
        <Panel>
          <p className="label-mono mb-2">ideas</p>
          <h1 className="font-serif text-2xl md:text-3xl">
            Thinking out loud.
          </h1>
          <p className="mt-3 max-w-xl text-fg-muted">
            Writing on technology, healthcare, AI, and building things that
            matter. Part technical deep-dive, part business strategy, part
            learning in public.
          </p>
        </Panel>

        {/* Interactive post list with side pane */}
        <IdeasView posts={posts} />
      </div>
    </>
  );
}
