"use client";

import { useState } from "react";

export type NavItem = { id: string; label: string };

export default function Header({
  phone,
  navItems,
}: {
  phone: string;
  navItems: NavItem[];
}) {
  const [open, setOpen] = useState(false);

  const scrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sand/80 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" onClick={scrollTop} className="text-lg font-bold tracking-tight text-ink">
          אסתי שויער
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-sage-dark"
            >
              {item.label}
            </a>
          ))}
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage-dark"
            >
              {phone}
            </a>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-sand text-ink md:hidden"
          aria-label="תפריט"
          aria-expanded={open}
        >
          <span className="text-xl leading-none">{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-sand/80 bg-cream px-6 pb-5 pt-2 md:hidden">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-sand/60"
            >
              {item.label}
            </a>
          ))}
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-sage px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              {phone}
            </a>
          )}
        </nav>
      )}
    </header>
  );
}
