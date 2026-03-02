import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// In Next.js build, process.cwd() is the project root (where package.json is)
// So we need to go up one level to get to personal-website root, then into content/ideas
const ideasDirectory = path.join(process.cwd(), "../content/ideas");
const postsDirectory = path.join(ideasDirectory, "posts");
const feedDirectory = path.join(ideasDirectory, "feed");

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  category: string;
  featured: boolean;
  content: string;
  tags?: string[];
}

export interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  category: string;
  featured: boolean;
  tags?: string[];
  podcast?: string;
}

function formatDate(date: unknown): string {
  if (!date) return "";
  if (typeof date === "string") return date;
  if (typeof date === "number") {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (date instanceof Date) {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return String(date);
}

function readDir(dir: string): { dir: string; file: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => ({ dir, file }));
}

export function getAllPosts(): PostMetadata[] {
  const allFiles = [...readDir(postsDirectory), ...readDir(feedDirectory)];

  const allPostsData = allFiles.map(({ dir, file }) => {
    const slug = file.replace(/\.md$/, "");
    const fullPath = path.join(dir, file);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title || "Untitled",
      date: formatDate(data.date),
      excerpt: data.excerpt || data.summary || "",
      readTime: data.readTime || "5 min",
      category: data.category || "technology",
      featured: data.featured || false,
      tags: data.tags || [],
      podcast: data.podcast || undefined,
    };
  });

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

export function getPostBySlug(slug: string): Post | null {
  // Search posts/ first, then feed/
  for (const dir of [postsDirectory, feedDirectory]) {
    const fullPath = path.join(dir, `${slug}.md`);
    if (!fs.existsSync(fullPath)) continue;
    try {
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || "Untitled",
        date: formatDate(data.date),
        excerpt: data.excerpt || data.summary || "",
        readTime: data.readTime || "5 min",
        category: data.category || "technology",
        featured: data.featured || false,
        tags: data.tags || [],
        content,
      };
    } catch (error) {
      console.error(`Error loading post ${slug}:`, error);
      return null;
    }
  }
  return null;
}

export function getAllPostSlugs(): string[] {
  const allFiles = [...readDir(postsDirectory), ...readDir(feedDirectory)];
  return allFiles.map(({ file }) => file.replace(/\.md$/, ""));
}
