"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import { Card, Field, TextInput, TextArea } from "./fields";
import { fileToResizedDataUrl } from "@/lib/image";
import ChangePasswordCard from "./ChangePasswordCard";
import { SOCIAL_KEYS, SOCIAL_LABELS, type SocialKey } from "@/lib/social";

const SOCIAL_PLACEHOLDERS: Record<SocialKey, string> = {
  whatsapp: "050-1234567",
  instagram: "https://instagram.com/...",
  facebook: "https://facebook.com/...",
  tiktok: "https://tiktok.com/@...",
  youtube: "https://youtube.com/@...",
};

type Status = "idle" | "saving" | "saved" | "error";

export default function SettingsForm({
  initialContent,
}: {
  initialContent: SiteContent;
}) {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [status, setStatus] = useState<Status>("idle");
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  async function handleFaviconSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file, 128, "image/png", 0.9);
      setContent((c) => ({ ...c, meta: { ...c.meta, favicon: dataUrl } }));
    } finally {
      setUploadingFavicon(false);
    }
  }

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      <header className="sticky top-0 z-10 border-b border-sand bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-ink">הגדרות</h1>
            <Link href="/" className="text-sm text-sage-dark hover:underline">
              חזרה לאתר ועריכה
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {status === "saved" && (
              <span className="text-sm font-medium text-sage-dark">נשמר בהצלחה ✓</span>
            )}
            {status === "error" && (
              <span className="text-sm font-medium text-terracotta-dark">שגיאה בשמירה</span>
            )}
            <button
              onClick={handleSave}
              disabled={status === "saving"}
              className="rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
            >
              {status === "saving" ? "שומר..." : "שמירה"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-2xl space-y-6 px-6">
        <ChangePasswordCard />

        <Card
          title="הגדרות SEO"
          description="איך האתר מופיע בכרטיסיית הדפדפן ובתוצאות חיפוש בגוגל"
        >
          <Field label="כותרת האתר">
            <TextInput
              value={content.meta.title}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  meta: { ...c.meta, title: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="תיאור קצר">
            <TextArea
              rows={2}
              value={content.meta.description}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  meta: { ...c.meta, description: e.target.value },
                }))
              }
            />
          </Field>
        </Card>

        <Card
          title="יצירת קשר - הוספת קישור לרשתות חברתיות"
          description="מדביקים כאן את הקישור לעמוד שלך בכל רשת. האייקונים יופיעו באתר בסקשן 'יצירת קשר' ובתחתית העמוד — רק לרשתות שמולא בהן קישור."
        >
          {SOCIAL_KEYS.map((key) => (
            <Field
              key={key}
              label={key === "whatsapp" ? "WhatsApp — מספר טלפון" : SOCIAL_LABELS[key]}
            >
              <TextInput
                dir="ltr"
                inputMode={key === "whatsapp" ? "tel" : "url"}
                placeholder={SOCIAL_PLACEHOLDERS[key]}
                value={content.social[key]}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    social: { ...c.social, [key]: e.target.value },
                  }))
                }
              />
            </Field>
          ))}
        </Card>

        <Card
          title="לוגו / אייקון (Favicon)"
          description='התמונה הקטנה שמופיעה ליד כותרת האתר בטאב של הדפדפן'
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-sand bg-white">
              {content.meta.favicon ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL preview, not a static asset
                <img
                  src={content.meta.favicon}
                  alt="אייקון האתר"
                  className="h-full w-full object-contain"
                />
              ) : (
                <svg
                  aria-label="אין אייקון מותאם אישית"
                  className="h-6 w-6 text-ink-soft/50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="9" r="1.5" fill="currentColor" stroke="none" />
                  <path d="M21 15l-5-5-9 9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <button
              type="button"
              onClick={() => faviconInputRef.current?.click()}
              disabled={uploadingFavicon}
              className="rounded-full border border-sand px-4 py-2 text-sm font-medium text-ink-soft hover:bg-sand/60 disabled:opacity-60"
            >
              {uploadingFavicon ? "מעלה..." : "העלאת תמונה"}
            </button>
            {content.meta.favicon && (
              <button
                type="button"
                onClick={() =>
                  setContent((c) => ({ ...c, meta: { ...c.meta, favicon: "" } }))
                }
                className="text-sm text-terracotta-dark hover:underline"
              >
                הסרה
              </button>
            )}
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFaviconSelect}
            />
          </div>
        </Card>
      </main>
    </div>
  );
}
