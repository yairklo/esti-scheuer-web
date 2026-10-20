"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const inputClass =
  "mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-2.5 text-ink outline-none focus:border-sage";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("הסיסמה החדשה חייבת להכיל לפחות 8 תווים");
      return;
    }
    if (password !== confirm) {
      setError("הסיסמאות אינן תואמות");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "שגיאה באיפוס הסיסמה");
        return;
      }
      setDone(true);
    } catch {
      setError("שגיאת רשת, נסי שוב");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mt-6 space-y-4 text-center">
        <p className="text-sm font-medium text-sage-dark">הסיסמה עודכנה בהצלחה ✓</p>
        <Link
          href="/admin/login"
          className="inline-block rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
        >
          למסך הכניסה
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-soft">סיסמה חדשה</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-soft">אימות סיסמה חדשה</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className={inputClass}
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
        {loading ? "שומרת..." : "שמירת סיסמה חדשה"}
      </button>
    </form>
  );
}
