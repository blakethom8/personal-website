import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import { CATEGORIES, CONSUMING_CATEGORY, ALL_CATEGORY_IDS } from "@/lib/categories";
import { processHeadings } from "@/lib/headings";
import { ArticleView } from "@/components/ideas/ArticleView";
import { CategoryView } from "@/components/ideas/CategoryView";
import { getCategoryDoc } from "@/lib/category-docs";
import { remark } from "remark";
import html from "remark-html";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const postSlugs = getAllPostSlugs().map((slug) => ({ slug }));
  const categorySlugs = ALL_CATEGORY_IDS.map((id) => ({ slug: id }));
  return [...categorySlugs, ...postSlugs];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Category page metadata
  const category = CATEGORIES.find((c) => c.id === slug);
  if (category) {
    return {
      title: category.label,
      description: category.quickDownload,
    };
  }
  if (slug === CONSUMING_CATEGORY.id) {
    return {
      title: CONSUMING_CATEGORY.label,
      description: CONSUMING_CATEGORY.quickDownload,
    };
  }

  // Post page metadata
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function IdeasSlugPage({ params }: Props) {
  const { slug } = await params;

  // ── Category page ──
  const category = CATEGORIES.find((c) => c.id === slug);
  if (category) {
    const doc = await getCategoryDoc(category.id);
    return (
      <>
        <PageBackground src={backgrounds.ideas} alt="Coastal fog over the ocean" />
        <CategoryView category={category} contentHtml={doc?.contentHtml ?? ""} />
      </>
    );
  }

  // ── "In My Feed" page ──
  if (slug === CONSUMING_CATEGORY.id) {
    const doc = await getCategoryDoc(CONSUMING_CATEGORY.id);
    return (
      <>
        <PageBackground src={backgrounds.ideas} alt="Coastal fog over the ocean" />
        <CategoryView
          category={CONSUMING_CATEGORY}
          contentHtml={doc?.contentHtml ?? ""}
          consuming
        />
      </>
    );
  }

  // ── Post page ──
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const processedContent = await remark().use(html).process(post.content);
  const rawHtml = processedContent.toString();
  const { html: contentHtml, headings } = processHeadings(rawHtml);

  // Find the category this post belongs to for breadcrumb
  const postCategory = CATEGORIES.find((c) => c.id === post.category);

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
          source: post.source,
          coverImage: post.coverImage,
        }}
        contentHtml={contentHtml}
        headings={headings}
        parentCategory={postCategory}
      />
    </>
  );
}
