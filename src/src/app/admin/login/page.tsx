"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleLogin() {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error("Wrong password");
      }

      const nextPath = searchParams.get("next");
      const safeNextPath =
        nextPath && nextPath.startsWith("/admin") ? nextPath : "/admin";
      router.push(safeNextPath);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center px-4 py-8">
      <div className="panel w-full max-w-sm p-6 md:p-8">
        <p className="label-mono mb-2">admin</p>
        <h1 className="font-serif text-2xl">Admin Access</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Enter your password to open the editor.
        </p>

        <div className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !submitting) {
                void handleLogin();
              }
            }}
            className="w-full rounded border border-border px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-accent"
            placeholder="Password"
          />

          {error ? <p className="text-xs text-red-600">{error}</p> : null}

          <button
            type="button"
            onClick={() => void handleLogin()}
            disabled={submitting}
            className="w-full rounded bg-accent px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Checking..." : "Enter"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
