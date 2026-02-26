import { afterEach, describe, expect, it, vi } from "vitest";
import { getAllPostSlugs, getAllPosts, getPostBySlug } from "./posts";

describe("posts loader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads slugs and metadata from content/posts", () => {
    const slugs = getAllPostSlugs();
    const posts = getAllPosts();

    expect(slugs.length).toBeGreaterThan(0);
    expect(posts.length).toBe(slugs.length);
    expect(posts[0]).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
      date: expect.any(String),
      excerpt: expect.any(String),
      readTime: expect.any(String),
      category: expect.any(String),
      featured: expect.any(Boolean),
    });
  });

  it("returns post content for a valid slug", () => {
    const [firstSlug] = getAllPostSlugs();
    const post = getPostBySlug(firstSlug);

    expect(post).not.toBeNull();
    expect(post?.slug).toBe(firstSlug);
    expect((post?.content ?? "").length).toBeGreaterThan(0);
  });

  it("returns null for unknown slug", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const post = getPostBySlug("this-slug-should-not-exist-12345");
    expect(post).toBeNull();
    expect(spy).toHaveBeenCalled();
  });
});

