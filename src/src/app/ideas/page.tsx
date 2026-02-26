import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
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
      <IdeasView posts={posts} />
    </>
  );
}
