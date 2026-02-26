"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ListResponse {
  posts?: string[];
  error?: string;
}

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch("/api/admin/content/list", { cache: "no-store" });
        const data = (await response.json()) as ListResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load posts");
        }

        setPosts(data.posts ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    }

    void loadPosts();
  }, []);

  return (
    <div className="mx-auto flex w-[calc(100%-2*16px)] max-w-[1100px] flex-col gap-4 py-5 md:w-[calc(100%-2*40px)]">
      <header className="panel px-5 py-5 md:px-6">
        <p className="label-mono mb-2">admin dashboard</p>
        <h1 className="font-serif text-2xl md:text-3xl">Content Editor</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Select a post to edit markdown with live preview and WebMCP tool scaffolding.
        </p>
      </header>

      <section className="panel px-5 py-5 md:px-6">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-fg-light">
          Posts
        </h2>

        {loading ? (
          <p className="mt-4 font-mono text-[12px] text-fg-light">loading posts...</p>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {!loading && !error ? (
          <ul className="mt-4 space-y-2">
            {posts.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/admin/edit/${slug}`}
                  className="inline-flex rounded border border-border-light bg-bg-panel-hover px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-fg-muted transition-colors hover:border-accent hover:text-accent"
                >
                  Edit: {slug}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

