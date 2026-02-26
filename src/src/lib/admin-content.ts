import fs from "node:fs";
import path from "node:path";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class AdminContentError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AdminContentError";
    this.status = status;
  }
}

function getPostsDirectory(): string {
  const overrideRoot = process.env.ADMIN_CONTENT_ROOT;
  if (overrideRoot && overrideRoot.trim().length > 0) {
    return path.resolve(overrideRoot);
  }
  return path.resolve(process.cwd(), "../content/posts");
}

export function assertValidSlug(raw: unknown): string {
  if (typeof raw !== "string" || !SLUG_PATTERN.test(raw)) {
    throw new AdminContentError("Invalid slug format", 400);
  }
  return raw;
}

function getPostFilePath(slug: string): string {
  const postsDirectory = getPostsDirectory();
  const filePath = path.resolve(postsDirectory, `${slug}.md`);

  if (!filePath.startsWith(`${postsDirectory}${path.sep}`)) {
    throw new AdminContentError("Invalid file path", 400);
  }

  return filePath;
}

export function listPostSlugs(): string[] {
  const postsDirectory = getPostsDirectory();

  try {
    return fs
      .readdirSync(postsDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name.replace(/\.md$/, ""))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    throw new AdminContentError("Unable to list posts", 500);
  }
}

export function loadPostContent(slug: string): string {
  const filePath = getPostFilePath(slug);

  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new AdminContentError("Post not found", 404);
    }
    throw new AdminContentError("Unable to load post", 500);
  }
}

export function savePostContent(slug: string, content: string): void {
  const filePath = getPostFilePath(slug);

  try {
    fs.writeFileSync(filePath, content, "utf8");
  } catch {
    throw new AdminContentError("Unable to save post", 500);
  }
}
