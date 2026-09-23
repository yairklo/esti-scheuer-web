"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "saving" | "saved" | "error";
type Pos = { x: number; y: number };

const POS_KEY = "adminToolbarPos";
const MARGIN = 8;

function readSavedPos(): Pos | null {
  try {
    const raw = window.localStorage.getItem(POS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return typeof p?.x === "number" && typeof p?.y === "number" ? p : null;
  } catch {
    return null;
  }
}

function writeSavedPos(pos: Pos | null) {
  try {
    if (pos) window.localStorage.setItem(POS_KEY, JSON.stringify(pos));
    else window.localStorage.removeItem(POS_KEY);
  } catch {
    // Storage blocked — the position just won't be remembered.
  }
}

// The floating admin bar. Dragged by its grip handle (mouse or touch) so it
// can be moved off whatever it's covering; the spot is remembered per browser.
// Double-clicking the grip puts it back at the default bottom-center spot.
export default function AdminToolbar({
  editMode,
  status,
  onToggleEdit,
  onSave,
  onLogout,
}: {
  editMode: boolean;
  status: Status;
  onToggleEdit: () => void;
  onSave: () => void;
  onLogout: () => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<Pos | null>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);

  // Keeps the bar fully on-screen (window resized, or the bar grew wider when
  // edit mode added buttons).
  const clamp = useCallback((p: Pos): Pos => {
    const el = barRef.current;
    const w = el?.offsetWidth ?? 0;
    const h = el?.offsetHeight ?? 0;
    return {
      x: Math.min(Math.max(p.x, MARGIN), Math.max(MARGIN, window.innerWidth - w - MARGIN)),
      y: Math.min(Math.max(p.y, MARGIN), Math.max(MARGIN, window.innerHeight - h - MARGIN)),
    };
  }, []);

  useEffect(() => {
    // localStorage is browser-only, so the saved spot can only be read after mount.
    const saved = readSavedPos();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setPos(clamp(saved));
  }, [clamp]);

  useEffect(() => {
    const reclamp = () =>
      setPos((p) => {
        if (!p) return p;
        const c = clamp(p);
        return c.x === p.x && c.y === p.y ? p : c;
      });
    window.addEventListener("resize", reclamp);
    const observer = new ResizeObserver(reclamp);
    if (barRef.current) observer.observe(barRef.current);
    return () => {
      window.removeEventListener("resize", reclamp);
      observer.disconnect();
    };
  }, [clamp]);

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setPos({ x: rect.left, y: rect.top });
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const off = dragOffset.current;
    if (!off) return;
    setPos(clamp({ x: e.clientX - off.x, y: e.clientY - off.y }));
  }

  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragOffset.current) return;
    dragOffset.current = null;
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    setPos((p) => {
      writeSavedPos(p);
      return p;
    });
  }

  function resetPos() {
    setPos(null);
    writeSavedPos(null);
  }

  return (
    <div
      ref={barRef}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      className={`fixed z-50 flex max-w-[calc(100vw-1rem)] flex-wrap items-center justify-center gap-3 rounded-full border border-sand bg-white/95 py-2 pe-4 ps-2 shadow-lg backdrop-blur ${
        // inset-x-0 + mx-auto (not left-1/2 + translate) so the bar may use the
        // full width and doesn't wrap onto two rows on phones.
        pos ? "" : "inset-x-0 bottom-5 mx-auto w-fit"
      } ${dragging ? "cursor-grabbing shadow-2xl ring-2 ring-sage/50" : ""}`}
    >
      <button
        type="button"
        aria-label="גרירת סרגל העריכה"
        title="גררי כדי להזיז · לחיצה כפולה מחזירה למקום"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={resetPos}
        className={`flex h-9 w-9 touch-none select-none items-center justify-center rounded-full text-ink-soft hover:bg-sand/60 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          {[6, 12, 18].map((y) =>
            [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />)
          )}
        </svg>
      </button>

      <button
        type="button"
        onClick={onToggleEdit}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          editMode ? "bg-ink text-white" : "bg-sage text-white hover:bg-sage-dark"
        }`}
      >
        {editMode ? "סיום עריכה" : "✏️ עריכת האתר"}
      </button>

      {editMode && (
        <>
          {status === "saved" && (
            <span className="text-sm font-medium text-sage-dark">נשמר ✓</span>
          )}
          {status === "error" && (
            <span className="text-sm font-medium text-terracotta-dark">שגיאה בשמירה</span>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={status === "saving"}
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
          >
            {status === "saving" ? "שומר..." : "שמירה"}
          </button>
          <a href="/admin/settings" className="text-sm text-ink-soft underline">
            הגדרות
          </a>
        </>
      )}

      <button type="button" onClick={onLogout} className="text-sm text-ink-soft underline">
        יציאה
      </button>
    </div>
  );
}
