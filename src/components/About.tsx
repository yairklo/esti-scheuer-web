"use client";

import { useRef, useState } from "react";
import type { AboutData, SectionSize } from "@/lib/content";
import { EditableText } from "./EditableText";
import { fileToResizedDataUrl } from "@/lib/image";

const SIZE = {
  sm: { pad: "py-12", h: "text-2xl", body: "text-base" },
  md: { pad: "py-20", h: "text-3xl", body: "text-lg" },
  lg: { pad: "py-28", h: "text-4xl", body: "text-xl" },
};

export default function About({
  data,
  size,
  editable,
  onChange,
}: {
  data: AboutData;
  size: SectionSize;
  editable: boolean;
  onChange: (d: AboutData) => void;
}) {
  const s = SIZE[size];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file, 640, "image/jpeg", 0.85);
      onChange({ ...data, photo: dataUrl });
    } finally {
      setUploading(false);
    }
  }

  const updateCredential = (i: number, v: string) =>
    onChange({
      ...data,
      credentials: data.credentials.map((c, idx) => (idx === i ? v : c)),
    });
  const removeCredential = (i: number) =>
    onChange({
      ...data,
      credentials: data.credentials.filter((_, idx) => idx !== i),
    });
  const addCredential = () =>
    onChange({ ...data, credentials: [...data.credentials, "תגית חדשה"] });

  return (
    <section className={`mx-auto max-w-6xl px-6 ${s.pad}`}>
      <div className="grid items-center gap-12 md:grid-cols-[280px_1fr]">
        <div className="relative mx-auto h-56 w-56 md:mx-0">
          {data.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL, not a static asset Next's Image optimizer can process
            <img
              src={data.photo}
              alt="אסתי שויער - מטפלת בנוירופידבק"
              className="h-56 w-56 rounded-full object-cover shadow-inner"
            />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-sage-light to-terracotta/30 text-5xl font-extrabold text-sage-dark shadow-inner">
              אש
            </div>
          )}

          {editable && (
            <div className="edit-ui absolute inset-x-0 bottom-1 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-ink-soft shadow hover:bg-white disabled:opacity-60"
              >
                {uploading ? "מעלה..." : data.photo ? "החלפת תמונה" : "העלאת תמונה"}
              </button>
              {data.photo && (
                <button
                  type="button"
                  onClick={() => onChange({ ...data, photo: "" })}
                  className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-terracotta-dark shadow hover:bg-white"
                >
                  הסרה
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
          )}
        </div>

        <div>
          <EditableText
            as="h2"
            editable={editable}
            value={data.heading}
            onChange={(v) => onChange({ ...data, heading: v })}
            className={`font-bold text-ink ${s.h}`}
          />
          <EditableText
            as="div"
            editable={editable}
            multiline
            value={data.bio}
            onChange={(v) => onChange({ ...data, bio: v })}
            className={`mt-5 space-y-4 leading-relaxed text-ink-soft ${s.body}`}
          />

          {(data.credentials.length > 0 || editable) && (
            <ul className="mt-6 flex flex-wrap gap-3">
              {data.credentials.map((c, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 rounded-full border border-sand bg-card px-4 py-2 text-sm font-medium text-ink-soft"
                >
                  <EditableText
                    as="span"
                    editable={editable}
                    value={c}
                    onChange={(v) => updateCredential(i, v)}
                  />
                  {editable && (
                    <button
                      type="button"
                      onClick={() => removeCredential(i)}
                      className="edit-ui text-terracotta-dark"
                      title="הסרה"
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
              {editable && (
                <li className="edit-ui">
                  <button
                    type="button"
                    onClick={addCredential}
                    className="rounded-full border border-dashed border-sage px-4 py-2 text-sm font-medium text-sage-dark hover:bg-sage-light"
                  >
                    + תגית
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
