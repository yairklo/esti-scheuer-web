"use client";

import type { HeroData, SectionSize } from "@/lib/content";
import { EditableText } from "./EditableText";

const SIZE = {
  sm: {
    pad: "pb-14 pt-10 sm:pb-20 sm:pt-14",
    h: "text-3xl sm:text-4xl",
    sub: "text-base",
  },
  md: {
    pad: "pb-20 pt-16 sm:pb-28 sm:pt-24",
    h: "text-4xl sm:text-5xl",
    sub: "text-lg",
  },
  lg: {
    pad: "pb-28 pt-20 sm:pb-36 sm:pt-32",
    h: "text-5xl sm:text-6xl",
    sub: "text-xl",
  },
};

export default function Hero({
  data,
  size,
  editable,
  onChange,
}: {
  data: HeroData;
  size: SectionSize;
  editable: boolean;
  onChange: (d: HeroData) => void;
}) {
  const s = SIZE[size];

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-sage-light blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-terracotta/20 blur-2xl"
      />

      <div className={`relative mx-auto flex max-w-4xl flex-col items-center px-6 text-center ${s.pad}`}>
        <span className="mb-6 rounded-full bg-sage-light px-4 py-1.5 text-sm font-medium text-sage-dark">
          מטפלת בנוירופידבק
        </span>
        <EditableText
          as="h1"
          editable={editable}
          value={data.title}
          onChange={(v) => onChange({ ...data, title: v })}
          className={`font-extrabold leading-tight text-ink ${s.h}`}
        />
        <EditableText
          as="p"
          editable={editable}
          value={data.subtitle}
          onChange={(v) => onChange({ ...data, subtitle: v })}
          className={`mt-6 max-w-2xl leading-relaxed text-ink-soft ${s.sub}`}
        />

        {editable ? (
          <EditableText
            as="span"
            editable
            value={data.ctaText}
            onChange={(v) => onChange({ ...data, ctaText: v })}
            className="mt-9 inline-block rounded-full bg-terracotta px-8 py-3.5 text-base font-semibold text-white shadow-md"
          />
        ) : (
          <a
            href="#contact"
            className="mt-9 rounded-full bg-terracotta px-8 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-terracotta-dark"
          >
            {data.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
