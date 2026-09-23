"use client";

import type { FaqData, SectionSize } from "@/lib/content";
import { EditableText } from "./EditableText";

const SIZE = {
  sm: { pad: "py-12", h: "text-2xl", intro: "text-base", q: "text-base" },
  md: { pad: "py-20", h: "text-3xl", intro: "text-lg", q: "text-lg" },
  lg: { pad: "py-28", h: "text-4xl", intro: "text-xl", q: "text-xl" },
};

export default function Faq({
  data,
  size,
  editable,
  onChange,
}: {
  data: FaqData;
  size: SectionSize;
  editable: boolean;
  onChange: (d: FaqData) => void;
}) {
  const s = SIZE[size];

  const updateItem = (i: number, field: "question" | "answer", v: string) =>
    onChange({
      ...data,
      items: data.items.map((it, idx) => (idx === i ? { ...it, [field]: v } : it)),
    });
  const removeItem = (i: number) =>
    onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  const addItem = () =>
    onChange({
      ...data,
      items: [...data.items, { question: "שאלה חדשה", answer: "התשובה לשאלה" }],
    });

  return (
    <section className={`mx-auto max-w-3xl px-6 ${s.pad}`}>
      <div className="text-center">
        <EditableText
          as="h2"
          editable={editable}
          value={data.heading}
          onChange={(v) => onChange({ ...data, heading: v })}
          className={`font-bold text-ink ${s.h}`}
        />
        {(data.intro || editable) && (
          <EditableText
            as="p"
            editable={editable}
            value={data.intro}
            placeholder="פסקת פתיחה (לא חובה)"
            onChange={(v) => onChange({ ...data, intro: v })}
            className={`mt-4 leading-relaxed text-ink-soft ${s.intro}`}
          />
        )}
      </div>

      <div className="mt-10 space-y-3">
        {data.items.map((item, i) =>
          editable ? (
            // In edit mode everything is expanded — a collapsed <details> would
            // hide the answer and swallow clicks meant for editing the question.
            <div key={i} className="relative rounded-2xl border border-sand bg-card p-5">
              <button
                type="button"
                onClick={() => removeItem(i)}
                title="הסרת השאלה"
                className="edit-ui absolute left-4 top-4 text-terracotta-dark"
              >
                ×
              </button>
              <EditableText
                as="h3"
                editable
                value={item.question}
                placeholder="שאלה"
                onChange={(v) => updateItem(i, "question", v)}
                className={`font-semibold text-ink ${s.q}`}
              />
              <EditableText
                as="div"
                editable
                multiline
                value={item.answer}
                placeholder="תשובה"
                onChange={(v) => updateItem(i, "answer", v)}
                className="mt-3 leading-relaxed text-ink-soft"
              />
            </div>
          ) : (
            <details
              key={i}
              className="group rounded-2xl border border-sand bg-card shadow-sm open:shadow-md"
            >
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-ink [&::-webkit-details-marker]:hidden ${s.q}`}
              >
                {item.question}
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-light text-sage-dark transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <EditableText
                as="div"
                editable={false}
                multiline
                value={item.answer}
                onChange={() => {}}
                className="px-5 pb-5 leading-relaxed text-ink-soft"
              />
            </details>
          )
        )}

        {editable && (
          <button
            type="button"
            onClick={addItem}
            className="edit-ui w-full rounded-2xl border border-dashed border-sage p-5 text-sm font-medium text-sage-dark hover:bg-sage-light"
          >
            + הוספת שאלה
          </button>
        )}
      </div>
    </section>
  );
}
