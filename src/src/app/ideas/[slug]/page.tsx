import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
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
  const contentHtml = processedContent.toString();

  return (
    <>
      <PageBackground src={backgrounds.ideas} alt="Coastal fog over the ocean" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        {/* Back link */}
        <div className="mx-auto w-[calc(100%-2*16px)] max-w-[800px] md:w-[calc(100%-2*40px)]">
          <Link
            href="/ideas"
            className="inline-flex items-center gap-1 font-mono text-[11px] text-fg-light hover:text-accent transition-colors"
          >
            ← back to ideas
          </Link>
        </div>

        {/* Post header */}
        <article className="panel mx-auto w-[calc(100%-2*16px)] max-w-[800px] px-6 py-6 md:w-[calc(100%-2*40px)] md:px-8 md:py-8">
          {/* Meta */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-fg-light">
            <span className="capitalize">{post.category}</span>
            <span>&middot;</span>
            <span>{post.readTime}</span>
            <span>&middot;</span>
            <span>{post.date}</span>
          </div>

          {/* Title */}
          <h1 className="mt-3 font-serif text-2xl md:text-3xl">{post.title}</h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-bg-panel-hover px-2 py-1 font-mono text-[10px] text-fg-light"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <hr className="my-6 border-border-light" />

          {/* Content */}
          <div
            className="prose prose-invert max-w-none
              prose-headings:font-serif prose-headings:font-normal
              prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-8
              prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
              prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-5
              prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-fg-muted prose-p:my-4
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-strong:text-fg prose-strong:font-semibold
              prose-code:text-accent prose-code:bg-bg-panel-hover prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-bg-panel-hover prose-pre:border prose-pre:border-border-light prose-pre:rounded prose-pre:p-4 prose-pre:overflow-x-auto
              prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-fg-light
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-[15px] prose-li:leading-relaxed prose-li:text-fg-muted prose-li:my-1
              prose-hr:border-border-light prose-hr:my-8
              prose-img:rounded prose-img:border prose-img:border-border-light
            "
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      </div>
    </>
  );
}
