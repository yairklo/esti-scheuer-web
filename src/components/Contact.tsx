"use client";

import type { ContactData, SectionSize, SocialLinks } from "@/lib/content";
import { EditableText } from "./EditableText";
import SocialIcons from "./SocialIcons";

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

const SIZE = {
  sm: { pad: "py-12", h: "text-2xl", intro: "text-base" },
  md: { pad: "py-20", h: "text-3xl", intro: "text-lg" },
  lg: { pad: "py-28", h: "text-4xl", intro: "text-xl" },
};

export default function Contact({
  data,
  size,
  social,
  editable,
  onChange,
}: {
  data: ContactData;
  size: SectionSize;
  social: SocialLinks;
  editable: boolean;
  onChange: (d: ContactData) => void;
}) {
  const s = SIZE[size];

  return (
    <section className="relative overflow-hidden bg-sage-dark">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5"
      />
      <div className={`relative mx-auto max-w-3xl px-6 text-center text-white ${s.pad}`}>
        <EditableText
          as="h2"
          editable={editable}
          value={data.heading}
          onChange={(v) => onChange({ ...data, heading: v })}
          className={`font-bold ${s.h}`}
        />
        <EditableText
          as="p"
          editable={editable}
          value={data.intro}
          onChange={(v) => onChange({ ...data, intro: v })}
          className={`mx-auto mt-4 max-w-xl leading-relaxed text-white/85 ${s.intro}`}
        />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {editable ? (
            <EditableText
              as="span"
              editable
              value={data.phone}
              placeholder="מספר טלפון"
              onChange={(v) => onChange({ ...data, phone: v })}
              className="rounded-full bg-white px-7 py-3 text-base font-semibold text-sage-dark shadow-md"
            />
          ) : (
            data.phone && (
              <a
                href={`tel:${data.phone.replace(/[^\d+]/g, "")}`}
                className="rounded-full bg-white px-7 py-3 text-base font-semibold text-sage-dark shadow-md transition-transform hover:scale-[1.03]"
              >
                {data.phone}
              </a>
            )
          )}

          {editable ? (
            <EditableText
              as="span"
              editable
              value={data.email}
              placeholder="כתובת מייל"
              onChange={(v) => onChange({ ...data, email: v })}
              className="rounded-full border border-white/70 px-7 py-3 text-base font-semibold text-white"
            />
          ) : (
            data.email && (
              <a
                href={`mailto:${data.email}`}
                className="rounded-full border border-white/70 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                {data.email}
              </a>
            )
          )}
        </div>

        {editable ? (
          <div className="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-white/70">
            <PinIcon />
            <EditableText
              as="span"
              editable
              value={data.area}
              placeholder="כתובת / אזור (לדוגמה: מודיעין)"
              onChange={(v) => onChange({ ...data, area: v })}
            />
          </div>
        ) : (
          data.area && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.area)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              <PinIcon />
              {data.area}
            </a>
          )
        )}

        <SocialIcons
          social={social}
          className="mt-8"
          iconClassName="border border-white/40 text-white hover:bg-white/10"
        />
      </div>
    </section>
  );
}
