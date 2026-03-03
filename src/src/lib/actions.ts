"use server";

import { getPostBySlug } from "./posts";
import { getCategoryDoc } from "./category-docs";
import { processHeadings } from "./headings";
import { remark } from "remark";
import html from "remark-html";

export async function getRenderedPost(slug: string) {
  const post = getPostBySlug(slug);
  if (!post) return null;

  const processed = await remark().use(html).process(post.content);
  const { html: contentHtml, headings } = processHeadings(processed.toString());

  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    readTime: post.readTime,
    category: post.category,
    tags: post.tags || [],
    source: post.source,
    coverImage: post.coverImage,
    contentHtml,
    headings,
  };
}

export async function getRenderedCategoryDoc(categoryId: string) {
  return getCategoryDoc(categoryId);
}
