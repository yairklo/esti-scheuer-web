"use client";

import type { SectionStyle, FontKey, SectionSize } from "@/lib/content";
import { FONT_VARS, FONT_LABELS, FONT_KEYS } from "@/lib/fonts";

const SIZE_KEYS: SectionSize[] = ["sm", "md", "lg"];
const SIZE_LABELS: Record<SectionSize, string> = {
  sm: "קטן",
  md: "רגיל",
  lg: "גדול",
};

export function SectionChrome({
  id,
  label,
  editable,
  index,
  total,
  style,
  onMoveUp,
  onMoveDown,
  onHide,
  onFontChange,
  onSizeChange,
  children,
}: {
  id: string;
  label: string;
  editable: boolean;
  index: number;
  total: number;
  style: SectionStyle;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onHide: () => void;
  onFontChange: (f: FontKey) => void;
  onSizeChange: (s: SectionSize) => void;
  children: React.ReactNode;
}) {
  return (
    <div id={id} style={{ fontFamily: FONT_VARS[style.font] }} className="relative">
      {editable && (
        <div className="flex justify-center bg-cream/80 py-2">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-sand bg-white px-3 py-1.5 text-xs shadow-sm">
            <span className="px-1 font-semibold text-ink-soft">{label}</span>
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              title="הזזה למעלה"
              className="rounded px-1.5 py-0.5 hover:bg-sand/60 disabled:opacity-30"
            >
              ⬆
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === total - 1}
              title="הזזה למטה"
              className="rounded px-1.5 py-0.5 hover:bg-sand/60 disabled:opacity-30"
            >
              ⬇
            </button>
            <select
              value={style.font}
              onChange={(e) => onFontChange(e.target.value as FontKey)}
              className="rounded border border-sand bg-cream px-1.5 py-0.5"
              title="גופן"
            >
              {FONT_KEYS.map((f) => (
                <option key={f} value={f}>
                  {FONT_LABELS[f]}
                </option>
              ))}
            </select>
            <div className="flex gap-0.5 rounded border border-sand bg-cream p-0.5">
              {SIZE_KEYS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSizeChange(s)}
                  className={`rounded px-1.5 py-0.5 ${
                    style.size === s ? "bg-sage text-white" : "text-ink-soft"
                  }`}
                >
                  {SIZE_LABELS[s]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onHide}
              title="הסתרת הסקשן"
              className="rounded px-1.5 py-0.5 text-terracotta-dark hover:bg-terracotta/10"
            >
              הסתרה 🗑
            </button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
