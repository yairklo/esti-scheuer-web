"use client";

import type { SectionStyle } from "@/lib/content";

const HEX = /^#[0-9a-f]{6}$/i;

// Only well-formed hex colours are ever written into a style attribute.
export const safeColor = (c: string | undefined) => (c && HEX.test(c) ? c : undefined);

// Site palette first, so choices stay on-brand; the custom picker covers the rest.
const BG_SWATCHES = [
  { c: "#ffffff", n: "לבן" },
  { c: "#fbf6ef", n: "שמנת" },
  { c: "#f1e7d8", n: "חול" },
  { c: "#e3ead9", n: "ירוק בהיר" },
  { c: "#90a888", n: "ירוק מרווה" },
  { c: "#6d8a66", n: "ירוק כהה" },
  { c: "#f6e1d8", n: "אפרסק בהיר" },
  { c: "#d99b83", n: "טרקוטה" },
  { c: "#3c352d", n: "חום כהה" },
];

const TEXT_SWATCHES = [
  { c: "#3c352d", n: "חום כהה" },
  { c: "#6b6156", n: "חום אפור" },
  { c: "#000000", n: "שחור" },
  { c: "#ffffff", n: "לבן" },
  { c: "#6d8a66", n: "ירוק כהה" },
  { c: "#c17e64", n: "טרקוטה כהה" },
];

const SCALE_MIN = 0.7;
const SCALE_MAX = 1.6;

function ColorField({
  label,
  value,
  swatches,
  onChange,
}: {
  label: string;
  value: string | undefined;
  swatches: { c: string; n: string }[];
  onChange: (c: string | undefined) => void;
}) {
  const current = safeColor(value);
  const isCustom = current !== undefined && !swatches.some((s) => s.c === current.toLowerCase());

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-medium text-ink">{label}</span>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          disabled={!current}
          className="text-ink-soft underline disabled:no-underline disabled:opacity-40"
        >
          {current ? "חזרה לברירת המחדל" : "ברירת מחדל"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {swatches.map((s) => (
          <button
            key={s.c}
            type="button"
            title={s.n}
            aria-label={s.n}
            onClick={() => onChange(s.c)}
            style={{ backgroundColor: s.c }}
            className={`h-7 w-7 rounded-full border border-ink/15 transition-transform hover:scale-110 ${
              current?.toLowerCase() === s.c ? "ring-2 ring-sage ring-offset-2" : ""
            }`}
          />
        ))}
        <label
          title="צבע אחר"
          className={`relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-ink/15 text-sm text-white ${
            isCustom ? "ring-2 ring-sage ring-offset-2" : ""
          }`}
          style={{
            background: isCustom
              ? current
              : "conic-gradient(#f87171, #fbbf24, #4ade80, #60a5fa, #c084fc, #f87171)",
          }}
        >
          <span aria-hidden className="drop-shadow">
            +
          </span>
          <input
            type="color"
            value={current ?? "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`${label} — צבע אחר`}
          />
        </label>
      </div>
    </div>
  );
}

export default function DesignPanel({
  style,
  onChange,
}: {
  style: SectionStyle;
  onChange: (patch: Partial<SectionStyle>) => void;
}) {
  const scale = style.textScale ?? 1;
  const setScale = (v: number) =>
    onChange({ textScale: Math.round(Math.min(SCALE_MAX, Math.max(SCALE_MIN, v)) * 100) / 100 });

  return (
    <div className="grid gap-5 rounded-2xl border border-sand bg-white p-4 text-xs shadow-lg sm:grid-cols-2">
      <ColorField
        label="צבע רקע"
        value={style.bg}
        swatches={BG_SWATCHES}
        onChange={(bg) => onChange({ bg })}
      />
      <ColorField
        label="צבע כותרות"
        value={style.headingColor}
        swatches={TEXT_SWATCHES}
        onChange={(headingColor) => onChange({ headingColor })}
      />
      <ColorField
        label="צבע טקסט"
        value={style.textColor}
        swatches={TEXT_SWATCHES}
        onChange={(textColor) => onChange({ textColor })}
      />
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-medium text-ink">גודל טקסט</span>
          <button
            type="button"
            onClick={() => onChange({ textScale: undefined })}
            disabled={scale === 1}
            className="text-ink-soft underline disabled:no-underline disabled:opacity-40"
          >
            {scale === 1 ? "ברירת מחדל" : "חזרה לברירת המחדל"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale(scale - 0.05)}
            aria-label="הקטנת טקסט"
            className="h-7 w-7 rounded-full border border-sand text-base leading-none hover:bg-sand/60"
          >
            −
          </button>
          <input
            type="range"
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            aria-label="גודל טקסט"
            className="flex-1 accent-sage"
          />
          <button
            type="button"
            onClick={() => setScale(scale + 0.05)}
            aria-label="הגדלת טקסט"
            className="h-7 w-7 rounded-full border border-sand text-base leading-none hover:bg-sand/60"
          >
            +
          </button>
          <span className="w-10 text-center font-medium tabular-nums text-ink">
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
