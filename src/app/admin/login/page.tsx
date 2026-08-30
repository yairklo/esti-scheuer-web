"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "שגיאה בהתחברות");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("שגיאת רשת, נסי שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm rounded-2xl border border-sand bg-card p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-ink">
          כניסה לניהול האתר
        </h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          אסתי שויער — עריכת תוכן האתר
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft">
              שם משתמש
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-2.5 text-ink outline-none focus:border-sage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft">
              סיסמה
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-2.5 text-ink outline-none focus:border-sage"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta-dark">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
          >
            {loading ? "מתחברת..." : "כניסה"}
          </button>
        </form>
      </div>
    </div>
  );
}
