"use client";

import type { ServicesData, SectionSize } from "@/lib/content";
import { EditableText } from "./EditableText";

const SIZE = {
  sm: { pad: "py-12", h: "text-2xl", intro: "text-base" },
  md: { pad: "py-20", h: "text-3xl", intro: "text-lg" },
  lg: { pad: "py-28", h: "text-4xl", intro: "text-xl" },
};

export default function Services({
  data,
  size,
  editable,
  onChange,
}: {
  data: ServicesData;
  size: SectionSize;
  editable: boolean;
  onChange: (d: ServicesData) => void;
}) {
  const s = SIZE[size];

  const updateItem = (i: number, field: "title" | "description", v: string) =>
    onChange({
      ...data,
      items: data.items.map((it, idx) => (idx === i ? { ...it, [field]: v } : it)),
    });
  const removeItem = (i: number) =>
    onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  const addItem = () =>
    onChange({
      ...data,
      items: [...data.items, { title: "תחום חדש", description: "תיאור התחום" }],
    });

  return (
    <section className={`mx-auto max-w-6xl px-6 ${s.pad}`}>
      <div className="mx-auto max-w-2xl text-center">
        <EditableText
          as="h2"
          editable={editable}
          value={data.heading}
          onChange={(v) => onChange({ ...data, heading: v })}
          className={`font-bold text-ink ${s.h}`}
        />
        <EditableText
          as="p"
          editable={editable}
          value={data.intro}
          onChange={(v) => onChange({ ...data, intro: v })}
          className={`mt-4 leading-relaxed text-ink-soft ${s.intro}`}
        />
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {data.items.map((item, i) => (
          <div
            key={i}
            className="relative rounded-2xl border border-sand bg-card p-7 shadow-sm transition-shadow hover:shadow-md"
          >
            {editable && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                title="הסרת התחום"
                className="edit-ui absolute left-4 top-4 text-terracotta-dark"
              >
                ×
              </button>
            )}
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-sage-light text-lg font-bold text-sage-dark">
              {i + 1}
            </div>
            <EditableText
              as="h3"
              editable={editable}
              value={item.title}
              onChange={(v) => updateItem(i, "title", v)}
              className="text-xl font-semibold text-ink"
            />
            <EditableText
              as="p"
              editable={editable}
              value={item.description}
              onChange={(v) => updateItem(i, "description", v)}
              className="mt-2 leading-relaxed text-ink-soft"
            />
          </div>
        ))}

        {editable && (
          <button
            type="button"
            onClick={addItem}
            className="edit-ui rounded-2xl border border-dashed border-sage p-7 text-sm font-medium text-sage-dark hover:bg-sage-light"
          >
            + הוספת תחום טיפול
          </button>
        )}
      </div>
    </section>
  );
}
