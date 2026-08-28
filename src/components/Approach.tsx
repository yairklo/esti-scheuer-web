"use client";

import type { ApproachData, SectionSize } from "@/lib/content";
import { EditableText } from "./EditableText";

const SIZE = {
  sm: { pad: "py-12", h: "text-2xl", body: "text-base" },
  md: { pad: "py-20", h: "text-3xl", body: "text-lg" },
  lg: { pad: "py-28", h: "text-4xl", body: "text-xl" },
};

export default function Approach({
  data,
  size,
  editable,
  onChange,
}: {
  data: ApproachData;
  size: SectionSize;
  editable: boolean;
  onChange: (d: ApproachData) => void;
}) {
  const s = SIZE[size];

  return (
    <section className="bg-sand/50">
      <div className={`mx-auto max-w-3xl px-6 text-center ${s.pad}`}>
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
          value={data.text}
          onChange={(v) => onChange({ ...data, text: v })}
          className={`mt-6 space-y-4 leading-relaxed text-ink-soft ${s.body}`}
        />
      </div>
    </section>
  );
}
