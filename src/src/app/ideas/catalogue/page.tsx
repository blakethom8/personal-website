import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { getAllPosts } from "@/lib/posts";
import { CatalogueView } from "@/components/ideas/CatalogueView";

export const metadata: Metadata = {
  title: "Full Catalogue",
  description: "Browse all posts, podcasts, and articles — search, filter, and explore.",
};

export default function CataloguePage() {
  const posts = getAllPosts();

  return (
    <>
      <PageBackground src={backgrounds.ideas} alt="Coastal fog over the ocean" />
      <CatalogueView posts={posts} />
    </>
  );
}
