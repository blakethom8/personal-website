import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AdminContentError,
  assertValidSlug,
  listPostSlugs,
  loadPostContent,
  savePostContent,
} from "./admin-content";

const originalRoot = process.env.ADMIN_CONTENT_ROOT;
let tempRoot = "";

function getErrorStatus(error: unknown): number | null {
  if (error instanceof AdminContentError) return error.status;
  return null;
}

describe("admin-content", () => {
  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "admin-content-"));
    process.env.ADMIN_CONTENT_ROOT = tempRoot;

    fs.writeFileSync(path.join(tempRoot, "beta-post.md"), "# beta");
    fs.writeFileSync(path.join(tempRoot, "alpha-post.md"), "# alpha");
    fs.writeFileSync(path.join(tempRoot, "ignore.txt"), "skip");
  });

  afterEach(() => {
    if (tempRoot) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
      tempRoot = "";
    }
  });

  afterAll(() => {
    if (originalRoot === undefined) {
      delete process.env.ADMIN_CONTENT_ROOT;
    } else {
      process.env.ADMIN_CONTENT_ROOT = originalRoot;
    }
  });

  it("lists only markdown slugs in sorted order", () => {
    expect(listPostSlugs()).toEqual(["alpha-post", "beta-post"]);
  });

  it("loads and saves markdown content", () => {
    expect(loadPostContent("alpha-post")).toBe("# alpha");

    savePostContent("alpha-post", "# alpha updated");
    expect(loadPostContent("alpha-post")).toBe("# alpha updated");
  });

  it("validates slug format", () => {
    expect(assertValidSlug("valid-slug-2")).toBe("valid-slug-2");

    let status: number | null = null;
    try {
      assertValidSlug("../invalid");
    } catch (error) {
      status = getErrorStatus(error);
    }
    expect(status).toBe(400);
  });

  it("returns not-found for missing posts", () => {
    let status: number | null = null;
    try {
      loadPostContent("does-not-exist");
    } catch (error) {
      status = getErrorStatus(error);
    }
    expect(status).toBe(404);
  });
});

