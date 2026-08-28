"use client";

import { useState, type FormEvent } from "react";
import { Card, Field, TextInput } from "./fields";

type Status = "idle" | "saving" | "saved" | "error";

export default function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (next.length < 8) {
      setError("הסיסמה החדשה חייבת להכיל לפחות 8 תווים");
      return;
    }
    if (next !== confirm) {
      setError("הסיסמאות החדשות אינן תואמות");
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "שגיאה בשינוי הסיסמה");
        setStatus("error");
        return;
      }
      setStatus("saved");
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setError("שגיאת רשת, נסי שוב");
      setStatus("error");
    }
  }

  return (
    <Card title="שינוי סיסמה" description="הסיסמה שאיתה נכנסים לעריכת האתר">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="סיסמה נוכחית">
          <TextInput
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Field>
        <Field label="סיסמה חדשה">
          <TextInput
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            autoComplete="new-password"
          />
        </Field>
        <Field label="אימות סיסמה חדשה">
          <TextInput
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta-dark">
            {error}
          </p>
        )}
        {status === "saved" && (
          <p className="text-sm font-medium text-sage-dark">הסיסמה עודכנה בהצלחה ✓</p>
        )}

        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
        >
          {status === "saving" ? "משנה..." : "עדכון סיסמה"}
        </button>
      </form>
    </Card>
  );
}
