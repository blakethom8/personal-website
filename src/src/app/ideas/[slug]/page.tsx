import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import { processHeadings } from "@/lib/headings";
import { ArticleView } from "@/components/ideas/ArticleView";
import { remark } from "remark";
import html from "remark-html";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(post.content);
  const rawHtml = processedContent.toString();

  // Add IDs to headings and extract TOC
  const { html: contentHtml, headings } = processHeadings(rawHtml);

  return (
    <>
      <PageBackground src={backgrounds.ideas} alt="Coastal fog over the ocean" />

      <ArticleView
        post={{
          slug: post.slug,
          title: post.title,
          date: post.date,
          excerpt: post.excerpt,
          readTime: post.readTime,
          category: post.category,
          tags: post.tags || [],
        }}
        contentHtml={contentHtml}
        headings={headings}
      />
    </>
  );
}
