import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { getAllPosts } from "@/lib/posts";
import { IdeasView } from "@/components/ideas/IdeasView";
import { ChiefShowcaseSection } from "@/components/ideas/ChiefShowcaseSection";

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
        <ChiefShowcaseSection />
        <IdeasView posts={posts} />
      </div>
    </>
  );
}
