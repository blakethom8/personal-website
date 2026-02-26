"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import LivePreview from "@/components/admin/LivePreview";
import WebMCPTools from "@/components/admin/WebMCPTools";

interface LoadResponse {
  slug?: string;
  content?: string;
  error?: string;
}

interface SaveResponse {
  success?: boolean;
  updatedAt?: string;
  error?: string;
}

export default function AdminEditPage() {
  const params = useParams<{ slug: string | string[] }>();
  const rawSlug = params.slug;
  const slug = useMemo(
    () => (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug),
    [rawSlug],
  );

  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    if (!slug) {
      setError("Missing post slug");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/content/load?slug=${slug}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as LoadResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load content");
      }

      const nextContent = data.content ?? "";
      setContent(nextContent);
      setInitialContent(nextContent);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const hasUnsavedChanges = content !== initialContent;

  async function handleSave() {
    if (!slug) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content }),
      });

      const data = (await response.json()) as SaveResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to save content");
      }

      setInitialContent(content);
      const updatedAtLabel = data.updatedAt
        ? new Date(data.updatedAt).toLocaleTimeString()
        : "now";
      setNotice(`Saved at ${updatedAtLabel}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save content");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-[calc(100%-2*16px)] max-w-[1600px] flex-col gap-4 py-5 md:w-[calc(100%-2*40px)]">
      <header className="panel px-5 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label-mono mb-1">admin editor</p>
            <h1 className="font-serif text-xl md:text-2xl">
              {slug ? `Editing: ${slug}` : "Editing post"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-fg-muted transition-colors hover:border-accent hover:text-accent"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={() => void loadContent()}
              disabled={loading || saving}
              className="rounded border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-fg-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={loading || saving || !hasUnsavedChanges}
              className="rounded bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className={hasUnsavedChanges ? "text-amber-700" : "text-fg-light"}>
            {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
          </span>
          {notice ? <span className="text-emerald-700">{notice}</span> : null}
          {error ? <span className="text-red-700">{error}</span> : null}
        </div>
      </header>

      {loading ? (
        <div className="panel px-5 py-8 font-mono text-[12px] text-fg-light">loading post...</div>
      ) : (
        <div className="grid min-h-[70vh] gap-4 xl:grid-cols-2">
          <MarkdownEditor value={content} onChange={setContent} />
          <LivePreview markdown={content} />
        </div>
      )}

      {slug ? <WebMCPTools slug={slug} /> : null}
    </div>
  );
}

