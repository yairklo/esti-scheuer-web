"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ContactData,
  FontKey,
  Section,
  SectionType,
  SiteContent,
  SectionSize,
} from "@/lib/content";
import Header, { type NavItem } from "./Header";
import Footer from "./Footer";
import Hero from "./Hero";
import About from "./About";
import Approach from "./Approach";
import Services from "./Services";
import Contact from "./Contact";
import { SectionChrome } from "./SectionChrome";

const SECTION_LABELS: Record<SectionType, string> = {
  hero: "פתיח",
  about: "עליי",
  approach: "גישה טיפולית",
  services: "תחומי טיפול",
  contact: "יצירת קשר",
};

const NAV_LABELS: Partial<Record<SectionType, string>> = {
  about: "עליי",
  approach: "הגישה הטיפולית",
  services: "תחומי טיפול",
  contact: "יצירת קשר",
};

type Status = "idle" | "saving" | "saved" | "error";

export default function SiteShell({
  initialContent,
  isAdmin,
}: {
  initialContent: SiteContent;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    // Reads a browser-only external source (localStorage) after mount, so
    // this can't be derived during render or SSR.
    if (isAdmin && window.localStorage.getItem("editMode") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditMode(true);
    }
  }, [isAdmin]);

  function toggleEdit() {
    setEditMode((v) => {
      const next = !v;
      window.localStorage.setItem("editMode", next ? "1" : "0");
      return next;
    });
  }

  function updateSectionData(id: string, data: Section["data"]) {
    setContent((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === id ? ({ ...s, data } as Section) : s
      ),
    }));
  }

  function moveSection(id: string, dir: -1 | 1) {
    setContent((c) => {
      const idx = c.sections.findIndex((s) => s.id === id);
      const swapWith = idx + dir;
      if (idx === -1 || swapWith < 0 || swapWith >= c.sections.length) return c;
      const next = [...c.sections];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return { ...c, sections: next };
    });
  }

  function setVisible(id: string, visible: boolean) {
    setContent((c) => ({
      ...c,
      sections: c.sections.map((s) => (s.id === id ? { ...s, visible } : s)),
    }));
  }

  function setFont(id: string, font: FontKey) {
    setContent((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === id ? { ...s, style: { ...s.style, font } } : s
      ),
    }));
  }

  function setSize(id: string, size: SectionSize) {
    setContent((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === id ? { ...s, style: { ...s.style, size } } : s
      ),
    }));
  }

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const visibleSections = content.sections.filter((s) => s.visible);
  const hiddenSections = content.sections.filter((s) => !s.visible);
  const contactData = content.sections.find(
    (s): s is Extract<Section, { type: "contact" }> => s.type === "contact"
  )?.data as ContactData | undefined;

  const navItems: NavItem[] = visibleSections
    .filter((s) => NAV_LABELS[s.type])
    .map((s) => ({ id: s.id, label: NAV_LABELS[s.type]! }));

  return (
    <div className="flex flex-1 flex-col">
      <Header phone={contactData?.phone ?? ""} navItems={navItems} />

      <main className="flex-1">
        {visibleSections.map((section, i) => (
          <SectionChrome
            key={section.id}
            id={section.id}
            label={SECTION_LABELS[section.type]}
            editable={editMode}
            index={i}
            total={visibleSections.length}
            style={section.style}
            onMoveUp={() => moveSection(section.id, -1)}
            onMoveDown={() => moveSection(section.id, 1)}
            onHide={() => setVisible(section.id, false)}
            onFontChange={(f) => setFont(section.id, f)}
            onSizeChange={(sz) => setSize(section.id, sz)}
          >
            {section.type === "hero" && (
              <Hero
                data={section.data}
                size={section.style.size}
                editable={editMode}
                onChange={(d) => updateSectionData(section.id, d)}
              />
            )}
            {section.type === "about" && (
              <About
                data={section.data}
                size={section.style.size}
                editable={editMode}
                onChange={(d) => updateSectionData(section.id, d)}
              />
            )}
            {section.type === "approach" && (
              <Approach
                data={section.data}
                size={section.style.size}
                editable={editMode}
                onChange={(d) => updateSectionData(section.id, d)}
              />
            )}
            {section.type === "services" && (
              <Services
                data={section.data}
                size={section.style.size}
                editable={editMode}
                onChange={(d) => updateSectionData(section.id, d)}
              />
            )}
            {section.type === "contact" && (
              <Contact
                data={section.data}
                size={section.style.size}
                editable={editMode}
                onChange={(d) => updateSectionData(section.id, d)}
              />
            )}
          </SectionChrome>
        ))}

        {editMode && hiddenSections.length > 0 && (
          <div className="mx-auto mb-16 mt-4 max-w-2xl rounded-2xl border border-dashed border-sand bg-card p-5 text-center">
            <p className="text-sm font-medium text-ink-soft">סקשנים מוסתרים:</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {hiddenSections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setVisible(s.id, true)}
                  className="rounded-full border border-sage px-4 py-1.5 text-sm text-sage-dark hover:bg-sage-light"
                >
                  החזרת &quot;{SECTION_LABELS[s.type]}&quot;
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer
        footer={content.footer}
        editable={editMode}
        onChange={(f) => setContent((c) => ({ ...c, footer: f }))}
      />

      {isAdmin && (
        <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-sand bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
            <button
              type="button"
              onClick={toggleEdit}
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
                  onClick={save}
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

            <button type="button" onClick={logout} className="text-sm text-ink-soft underline">
              יציאה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
