"use client";

import type { CustomData, SectionSize } from "@/lib/content";
import { EditableText } from "./EditableText";
import MediaGallery, { resolveLayout } from "./MediaGallery";

const SIZE = {
  sm: { pad: "py-12", h: "text-2xl", body: "text-base" },
  md: { pad: "py-20", h: "text-3xl", body: "text-lg" },
  lg: { pad: "py-28", h: "text-4xl", body: "text-xl" },
};

export default function CustomSection({
  data,
  size,
  editable,
  onChange,
}: {
  data: CustomData;
  size: SectionSize;
  editable: boolean;
  onChange: (d: CustomData) => void;
}) {
  const s = SIZE[size];
  const { position } = resolveLayout(data.mediaLayout);
  const side = position === "side";

  const text = (
    <div className={side ? "text-center md:text-start" : "mx-auto max-w-3xl text-center"}>
      <EditableText
        as="h2"
        editable={editable}
        value={data.heading}
        placeholder="כותרת"
        onChange={(v) => onChange({ ...data, heading: v })}
        className={`font-bold text-ink ${s.h}`}
      />
      {(data.text || editable) && (
        <EditableText
          as="div"
          editable={editable}
          multiline
          value={data.text}
          placeholder="טקסט (לא חובה)"
          onChange={(v) => onChange({ ...data, text: v })}
          className={`mt-5 space-y-4 leading-relaxed text-ink-soft ${s.body}`}
        />
      )}
    </div>
  );

  const gallery = (editable || data.media.length > 0) && (
    <MediaGallery
      media={data.media}
      layout={data.mediaLayout}
      alt={data.heading}
      editable={editable}
      onMediaChange={(media) => onChange({ ...data, media })}
      onLayoutChange={(mediaLayout) => onChange({ ...data, mediaLayout })}
    />
  );

  return (
    <section className={data.background === "tint" ? "bg-sage-light/60" : undefined}>
      <div className={`mx-auto max-w-6xl px-6 ${s.pad}`}>
        {editable && (
          <div className="edit-ui mx-auto mb-8 flex max-w-3xl flex-wrap items-end gap-4 rounded-2xl border border-dashed border-sage bg-card/80 p-4 text-sm">
            <label className="min-w-[14rem] flex-1">
              <span className="block font-medium text-ink-soft">
                שם בתפריט העליון (אפשר להשאיר ריק)
              </span>
              <input
                value={data.navLabel}
                onChange={(e) => onChange({ ...data, navLabel: e.target.value })}
                placeholder="למשל: מה זה נוירופידבק"
                className="mt-1.5 w-full rounded-lg border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-sage"
              />
            </label>
            <div>
              <span className="block font-medium text-ink-soft">רקע</span>
              <div className="mt-1.5 flex gap-1 rounded-lg border border-sand bg-white p-1">
                {(["plain", "tint"] as const).map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => onChange({ ...data, background: bg })}
                    className={`rounded-md px-3 py-1 ${
                      data.background === bg ? "bg-sage text-white" : "text-ink-soft"
                    }`}
                  >
                    {bg === "plain" ? "בהיר" : "ירקרק"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {side && gallery ? (
          <div className="grid items-center gap-10 md:grid-cols-2">
            {text}
            {gallery}
          </div>
        ) : !gallery ? (
          text
        ) : position === "above" ? (
          <>
            {gallery}
            <div className="mt-10">{text}</div>
          </>
        ) : (
          <>
            {text}
            <div className="mt-10">{gallery}</div>
          </>
        )}
      </div>
    </section>
  );
}
