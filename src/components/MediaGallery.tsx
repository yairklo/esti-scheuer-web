"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem, MediaLayout, MediaSize } from "@/lib/content";
import { fileToResizedDataUrl } from "@/lib/image";
import FacebookPost from "./FacebookPost";
import { embedHint, toEmbed, PROVIDER_LABELS, type Embed } from "@/lib/embed";

// Grid widths. Gaps are gap-6 (1.5rem), so each width subtracts its share of
// the gaps in its row to make e.g. three "sm" items fit exactly on one line.
// On phones small items go two-up and everything else is full width.
const GRID_WIDTH: Record<MediaSize, string> = {
  sm: "w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)]",
  md: "w-full sm:w-[calc(50%-0.75rem)]",
  lg: "w-full sm:w-[calc(66.666%-0.5rem)]",
  full: "w-full",
};

const SIZE_LABELS: Record<MediaSize, string> = { sm: "S", md: "M", lg: "L", full: "מלא" };
const SIZE_TITLES: Record<MediaSize, string> = {
  sm: "קטן (שליש רוחב)",
  md: "בינוני (חצי רוחב)",
  lg: "גדול (שני שליש)",
  full: "רוחב מלא",
};

// Carousel slide widths; on phones multi-up carousels show one slide plus a
// peek of the next, so it's obvious the row scrolls.
const CAROUSEL_WIDTH: Record<1 | 2 | 3, string> = {
  1: "w-full",
  2: "w-[85%] sm:w-[calc(50%-0.75rem)]",
  3: "w-[85%] sm:w-[calc(33.333%-1rem)]",
};

const JUSTIFY = { start: "justify-start", center: "justify-center", end: "justify-end" };

export function resolveLayout(layout: MediaLayout | undefined): Required<MediaLayout> {
  return {
    mode: layout?.mode ?? "grid",
    position: layout?.position ?? "below",
    align: layout?.align ?? "center",
    perView: layout?.perView ?? 2,
  };
}

function isShowable(item: MediaItem) {
  return item.kind === "video" ? Boolean(toEmbed(item.src)) : Boolean(item.src);
}

// Carousel slides share a 4:3 frame so the row looks even — but only images
// and landscape videos can be cropped/letterboxed into it. Portrait videos and
// social post cards keep their natural shape.
function fitsFrame(item: MediaItem) {
  return item.kind === "image" || toEmbed(item.src)?.shape === "wide";
}

// Instagram's /embed/ page reports its content height to the parent via
// postMessage ({type: "MEASURE", details: {height}}) — the same signal its
// embed.js script uses — so the card can be sized without running that script.
function InstagramFrame({ src, title, editable }: { src: string; title: string; editable: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(640);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== "https://www.instagram.com" || e.source !== ref.current?.contentWindow) return;
      try {
        const msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        const h = Number(msg?.details?.height);
        if (msg?.type === "MEASURE" && h > 0) setHeight(Math.ceil(h));
      } catch {
        // Not a message we understand.
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      style={{ height }}
      className={`w-full rounded-2xl border border-sand bg-white ${editable ? "pointer-events-none" : ""}`}
      scrolling="no"
      loading="lazy"
    />
  );
}

// Social post cards can be very tall (long captions, portrait photos), so
// they're capped with a fade and a "show more" toggle. The toggle only appears
// when the card really is taller than the cap; heights are re-measured as the
// embed resizes itself after loading.
const POST_MAX_HEIGHT = 480;

function CollapsiblePost({ maxWidth, children }: { maxWidth: string; children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    // Small slack so a card only a few pixels over the cap isn't clipped.
    const measure = () => setOverflows(el.offsetHeight > POST_MAX_HEIGHT + 40);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const collapsed = overflows && !expanded;

  function toggle() {
    if (expanded) {
      // Collapsing a long card can leave its top above the viewport — bring
      // it back so the reader isn't stranded further down the page.
      const top = outerRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) outerRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    setExpanded((v) => !v);
  }

  return (
    <div ref={outerRef} className={`mx-auto w-full ${maxWidth}`}>
      <div
        className="relative overflow-hidden rounded-2xl"
        style={collapsed ? { maxHeight: POST_MAX_HEIGHT } : undefined}
      >
        <div ref={innerRef}>{children}</div>
        {collapsed && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent"
          />
        )}
      </div>
      {overflows && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={expanded}
            className="rounded-full border border-sage bg-white px-4 py-1.5 text-sm font-medium text-sage-dark shadow-sm hover:bg-sage-light"
          >
            {expanded ? "הצג פחות ▴" : "הצג עוד ▾"}
          </button>
        </div>
      )}
    </div>
  );
}

function EmbedView({
  embed,
  alt,
  fill,
  editable,
}: {
  embed: Embed;
  alt: string;
  fill: boolean;
  editable: boolean;
}) {
  // In edit mode an iframe would swallow drag events and clicks meant for the
  // controls on top of it.
  const noPointer = editable ? "pointer-events-none" : "";

  if (embed.provider === "instagram") {
    return (
      <CollapsiblePost maxWidth="max-w-[540px]">
        <InstagramFrame src={embed.src} title={alt} editable={editable} />
      </CollapsiblePost>
    );
  }

  if (embed.provider === "facebook" && embed.shape === "post" && embed.href) {
    return (
      <CollapsiblePost maxWidth="max-w-[500px]">
        <FacebookPost href={embed.href} editable={editable} />
      </CollapsiblePost>
    );
  }

  const frame =
    embed.shape === "tall"
      ? "mx-auto aspect-[9/16] w-full max-w-[340px]"
      : fill
        ? "h-full"
        : "aspect-video";
  return (
    <div className={`overflow-hidden rounded-2xl bg-ink/5 shadow-md ${frame}`}>
      <iframe
        src={embed.src}
        title={alt}
        className={`h-full w-full ${noPointer}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function MediaView({
  item,
  alt,
  fill,
  editable,
}: {
  item: MediaItem;
  alt: string;
  fill: boolean; // carousel: fill a fixed-ratio frame instead of natural height
  editable: boolean;
}) {
  if (item.kind === "video") {
    const embed = toEmbed(item.src);
    if (!embed) {
      return (
        <div className="flex aspect-video items-center justify-center rounded-2xl bg-sand/60 p-4 text-center text-sm text-ink-soft">
          {editable ? "הדביקי למטה קישור לסרטון או לפוסט" : null}
        </div>
      );
    }
    return <EmbedView embed={embed} alt={alt} fill={fill} editable={editable} />;
  }
  if (!item.src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- data URL, not a static asset Next's Image optimizer can process
    <img
      src={item.src}
      alt={alt}
      draggable={false}
      className={`w-full rounded-2xl object-cover shadow-md ${fill ? "h-full" : ""}`}
    />
  );
}

function Carousel({
  perView,
  children,
  count,
}: {
  perView: 1 | 2 | 3;
  children: React.ReactNode;
  count: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  // scrollLeft is 0 at the start edge and goes negative in RTL, so compare
  // magnitudes to stay direction-agnostic.
  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const pos = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    setCanBack(pos > 2);
    setCanForward(pos < max - 2);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update, count, perView]);

  // Scrolls to the neighbouring slide's exact start edge. (A relative scrollBy
  // can overshoot a slide once scroll-snap kicks in.)
  function scrollStep(towardEnd: boolean) {
    const el = trackRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const track = el.getBoundingClientRect();
    const pos = Math.abs(el.scrollLeft);
    const offsets = Array.from(el.children).map((c) => {
      const r = c.getBoundingClientRect();
      return pos + (rtl ? track.right - r.right : r.left - track.left);
    });
    let current = 0;
    offsets.forEach((o, i) => {
      if (Math.abs(o - pos) < Math.abs(offsets[current] - pos)) current = i;
    });
    const target = Math.min(Math.max(current + (towardEnd ? 1 : -1), 0), offsets.length - 1);
    const max = el.scrollWidth - el.clientWidth;
    const left = Math.min(offsets[target], max);
    el.scrollTo({ left: rtl ? -left : left, behavior: "smooth" });
  }

  const arrow = "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-ink shadow-md transition-opacity hover:bg-white disabled:pointer-events-none disabled:opacity-0";

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={update}
        className="flex snap-x snap-mandatory items-start gap-6 overflow-x-auto pb-3 [scrollbar-width:thin]"
      >
        {children}
      </div>
      {/* RTL page: "back" (toward the first slide) is on the right. */}
      <button
        type="button"
        aria-label="הקודם"
        onClick={() => scrollStep(false)}
        disabled={!canBack}
        className={`${arrow} -right-3 sm:-right-5`}
      >
        ›
      </button>
      <button
        type="button"
        aria-label="הבא"
        onClick={() => scrollStep(true)}
        disabled={!canForward}
        className={`${arrow} -left-3 sm:-left-5`}
      >
        ‹
      </button>
    </div>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-ink-soft">{label}</span>
      <div className="flex gap-0.5 rounded-lg border border-sand bg-white p-0.5">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-md px-2.5 py-1 ${
              value === o.value ? "bg-sage text-white" : "text-ink-soft hover:bg-sand/60"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MediaGallery({
  media,
  layout: rawLayout,
  alt,
  editable,
  onMediaChange,
  onLayoutChange,
}: {
  media: MediaItem[];
  layout: MediaLayout | undefined;
  alt: string;
  editable: boolean;
  onMediaChange: (media: MediaItem[]) => void;
  onLayoutChange: (layout: MediaLayout) => void;
}) {
  const layout = resolveLayout(rawLayout);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const setLayout = (patch: MediaLayout) => onLayoutChange({ ...layout, ...patch });
  const updateItem = (i: number, patch: Partial<MediaItem>) =>
    onMediaChange(media.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const removeItem = (i: number) => onMediaChange(media.filter((_, idx) => idx !== i));
  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= media.length || from === to) return;
    const next = [...media];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onMediaChange(next);
  };

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      const added = await Promise.all(
        files.map(async (f) => ({
          kind: "image" as const,
          src: await fileToResizedDataUrl(f, 1200, "image/jpeg", 0.8),
        }))
      );
      onMediaChange([...media, ...added]);
    } finally {
      setUploading(false);
    }
  }

  const items = editable
    ? media.map((item, i) => ({ item, i }))
    : media.map((item, i) => ({ item, i })).filter(({ item }) => isShowable(item));

  if (!editable && items.length === 0) return null;

  const isCarousel = layout.mode === "carousel";

  const renderItem = ({ item, i }: { item: MediaItem; i: number }) => {
    const size = item.size ?? "md";
    const width = isCarousel ? CAROUSEL_WIDTH[layout.perView] : GRID_WIDTH[size];
    const framed = isCarousel && fitsFrame(item);
    const frame = isCarousel ? `shrink-0 snap-start ${framed ? "aspect-[4/3]" : ""}` : "";

    if (!editable) {
      return (
        <div key={i} className={`${width} ${frame}`}>
          <MediaView item={item} alt={alt} fill={framed} editable={false} />
        </div>
      );
    }

    return (
      <div
        key={i}
        draggable
        onDragStart={(e) => {
          setDragFrom(i);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(e) => {
          if (dragFrom === null) return;
          e.preventDefault();
          setDragOver(i);
        }}
        onDragLeave={() => setDragOver((v) => (v === i ? null : v))}
        onDrop={(e) => {
          e.preventDefault();
          if (dragFrom !== null) moveItem(dragFrom, i);
          setDragFrom(null);
          setDragOver(null);
        }}
        onDragEnd={() => {
          setDragFrom(null);
          setDragOver(null);
        }}
        className={`group relative ${isCarousel ? `${width} shrink-0 snap-start` : width} cursor-grab rounded-2xl transition-opacity ${
          dragFrom === i ? "opacity-40" : ""
        } ${dragOver === i && dragFrom !== i ? "ring-4 ring-sage ring-offset-2" : ""}`}
      >
        <div className={framed ? "aspect-[4/3]" : ""}>
          <MediaView item={item} alt={alt} fill={framed} editable />
        </div>

        <div className="absolute inset-x-2 top-2 flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white/95 p-1 text-xs shadow">
          <div className="flex items-center gap-0.5">
            <span className="px-1 text-ink-soft" title="אפשר לגרור כדי להזיז">
              ⠿
            </span>
            <button
              type="button"
              title="הזזה ימינה (מוקדם יותר)"
              onClick={() => moveItem(i, i - 1)}
              disabled={i === 0}
              className="rounded px-1.5 py-0.5 hover:bg-sand/60 disabled:opacity-30"
            >
              →
            </button>
            <button
              type="button"
              title="הזזה שמאלה (מאוחר יותר)"
              onClick={() => moveItem(i, i + 1)}
              disabled={i === media.length - 1}
              className="rounded px-1.5 py-0.5 hover:bg-sand/60 disabled:opacity-30"
            >
              ←
            </button>
          </div>
          {!isCarousel && (
            <div className="flex gap-0.5">
              {(Object.keys(SIZE_LABELS) as MediaSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  title={SIZE_TITLES[s]}
                  onClick={() => updateItem(i, { size: s })}
                  className={`rounded px-1.5 py-0.5 ${
                    size === s ? "bg-sage text-white" : "text-ink-soft hover:bg-sand/60"
                  }`}
                >
                  {SIZE_LABELS[s]}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            title="הסרה"
            onClick={() => removeItem(i)}
            className="rounded px-1.5 py-0.5 text-terracotta-dark hover:bg-terracotta/10"
          >
            ✕
          </button>
        </div>

        {item.kind === "video" && (
          <div className="mt-2">
            <input
              type="url"
              dir="ltr"
              value={item.src}
              onChange={(e) => updateItem(i, { src: e.target.value })}
              placeholder="קישור מיוטיוב, אינסטגרם, טיקטוק או פייסבוק"
              className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sage"
            />
            {item.src &&
              (() => {
                const embed = toEmbed(item.src);
                return embed ? (
                  <p className="mt-1 text-xs text-sage-dark">
                    זוהה: {PROVIDER_LABELS[embed.provider]} ✓
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-terracotta-dark">{embedHint(item.src)}</p>
                );
              })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {editable && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-dashed border-sage bg-card/80 p-3 text-xs">
          <Segmented
            label="תצוגה:"
            value={layout.mode}
            options={[
              { value: "grid", label: "רשת" },
              { value: "carousel", label: "גלריה נגללת" },
            ]}
            onChange={(mode) => setLayout({ mode })}
          />
          <Segmented
            label="מיקום:"
            value={layout.position}
            options={[
              { value: "above", label: "מעל הטקסט" },
              { value: "below", label: "מתחת" },
              { value: "side", label: "לצד הטקסט" },
            ]}
            onChange={(position) => setLayout({ position })}
          />
          {isCarousel ? (
            <Segmented
              label="מוצגות בכל פעם:"
              value={layout.perView}
              options={[
                { value: 1, label: "1" },
                { value: 2, label: "2" },
                { value: 3, label: "3" },
              ]}
              onChange={(perView) => setLayout({ perView })}
            />
          ) : (
            <Segmented
              label="יישור:"
              value={layout.align}
              options={[
                { value: "start", label: "ימין" },
                { value: "center", label: "מרכז" },
                { value: "end", label: "שמאל" },
              ]}
              onChange={(align) => setLayout({ align })}
            />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-full bg-sage px-3 py-1.5 font-medium text-white hover:bg-sage-dark disabled:opacity-60"
            >
              {uploading ? "מעלה..." : "+ תמונות"}
            </button>
            <button
              type="button"
              onClick={() => onMediaChange([...media, { kind: "video", src: "" }])}
              className="rounded-full bg-sage px-3 py-1.5 font-medium text-white hover:bg-sage-dark"
            >
              + סרטון / פוסט מהרשתות
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sand py-10 text-center text-sm text-ink-soft">
          עדיין אין תמונות או סרטונים
        </p>
      ) : isCarousel ? (
        <Carousel perView={layout.perView} count={items.length}>
          {items.map(renderItem)}
        </Carousel>
      ) : (
        <div className={`flex flex-wrap items-center gap-6 ${JUSTIFY[layout.align]}`}>
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}
