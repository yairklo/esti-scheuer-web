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
  onUpdate,
}: {
  data: CustomData;
  size: SectionSize;
  editable: boolean;
  onChange: (d: CustomData) => void;
  // Applies a change to the latest saved data rather than this render's copy,
  // for updates that land after an await.
  onUpdate: (fn: (d: CustomData) => CustomData) => void;
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
      onMediaAdd={(added) => onUpdate((d) => ({ ...d, media: [...d.media, ...added] }))}
      onLayoutChange={(mediaLayout) => onChange({ ...data, mediaLayout })}
    />
  );

  return (
    <section>
      <div className={`mx-auto max-w-6xl px-6 ${s.pad}`}>
        {editable && (
          <div className="edit-ui mx-auto mb-8 max-w-md rounded-2xl border border-dashed border-sage bg-card/80 p-4 text-sm">
            <label className="block">
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
