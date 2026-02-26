"use server";

import { getPostBySlug } from "./posts";
import { remark } from "remark";
import html from "remark-html";

export async function getRenderedPost(slug: string) {
  const post = getPostBySlug(slug);
  if (!post) return null;

  const processed = await remark().use(html).process(post.content);

  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    readTime: post.readTime,
    category: post.category,
    tags: post.tags || [],
    contentHtml: processed.toString(),
  };
}
