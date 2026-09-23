"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADDABLE_SECTIONS, createSection, type AddableSectionType } from "@/lib/new-sections";
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
import CustomSection from "./CustomSection";
import Faq from "./Faq";
import AdminToolbar from "./AdminToolbar";
import { SectionChrome } from "./SectionChrome";

const SECTION_LABELS: Record<SectionType, string> = {
  hero: "פתיח",
  about: "עליי",
  approach: "גישה טיפולית",
  services: "תחומי טיפול",
  custom: "סקשן חדש",
  faq: "שאלות נפוצות",
  contact: "יצירת קשר",
};

const NAV_LABELS: Partial<Record<SectionType, string>> = {
  about: "עליי",
  approach: "הגישה הטיפולית",
  services: "תחומי טיפול",
  faq: "שאלות נפוצות",
  contact: "יצירת קשר",
};

// Custom sections are named by her; fall back to the heading so each one is
// still recognisable in the edit toolbar and the hidden-sections list.
function sectionLabel(section: Section): string {
  if (section.type === "custom") {
    return section.data.navLabel.trim() || section.data.heading.trim() || SECTION_LABELS.custom;
  }
  return SECTION_LABELS[section.type];
}

function navLabel(section: Section): string | undefined {
  if (section.type === "custom") return section.data.navLabel.trim() || undefined;
  return NAV_LABELS[section.type];
}

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
  // Which "+ add section" spot has its type picker open: a section id, "top"
  // for above the first section, or null when none is open.
  const [pickerAt, setPickerAt] = useState<string | null>(null);

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

  // Inserts a new section right after `afterId` (or at the very top when
  // null). Positions are in the full list, hidden sections included.
  function addSectionAfter(afterId: string | null, type: AddableSectionType) {
    setContent((c) => {
      const at = afterId === null ? 0 : c.sections.findIndex((s) => s.id === afterId) + 1;
      const next = [...c.sections];
      next.splice(at, 0, createSection(type));
      return { ...c, sections: next };
    });
    setPickerAt(null);
  }

  function deleteSection(id: string) {
    if (!window.confirm("למחוק את הסקשן לצמיתות? (אפשר גם רק להסתיר אותו)")) return;
    setContent((c) => ({ ...c, sections: c.sections.filter((s) => s.id !== id) }));
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
  // Edit mode shows every section (hidden ones dimmed, in place); visitors
  // only see the visible ones.
  const shownSections = editMode ? content.sections : visibleSections;
  const contactData = content.sections.find(
    (s): s is Extract<Section, { type: "contact" }> => s.type === "contact"
  )?.data as ContactData | undefined;

  const navItems: NavItem[] = visibleSections.flatMap((s) => {
    const label = navLabel(s);
    return label ? [{ id: s.id, label }] : [];
  });

  const addHere = (afterId: string | null) => {
    if (!editMode) return null;
    const key = afterId ?? "top";
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 py-3 text-xs font-medium">
        {pickerAt === key ? (
          <>
            <span className="text-ink-soft">איזה סקשן להוסיף?</span>
            {ADDABLE_SECTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => addSectionAfter(afterId, opt.type)}
                className="rounded-full bg-sage px-4 py-1.5 text-white hover:bg-sage-dark"
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPickerAt(null)}
              className="px-2 py-1.5 text-ink-soft underline"
            >
              ביטול
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setPickerAt(key)}
            className="rounded-full border border-dashed border-sage bg-cream px-4 py-1.5 text-sage-dark hover:bg-sage-light"
          >
            + הוספת סקשן כאן
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <Header phone={contactData?.phone ?? ""} navItems={navItems} />

      <main className="flex-1">
        {shownSections.map((section, i) => (
          <div key={section.id}>
            {i === 0 && addHere(null)}
            <SectionChrome
              id={section.id}
              label={sectionLabel(section)}
              editable={editMode}
              index={i}
              total={shownSections.length}
              style={section.style}
              onMoveUp={() => moveSection(section.id, -1)}
              onMoveDown={() => moveSection(section.id, 1)}
              hidden={!section.visible}
              onToggleHidden={() => setVisible(section.id, !section.visible)}
              onFontChange={(f) => setFont(section.id, f)}
              onSizeChange={(sz) => setSize(section.id, sz)}
              onDelete={
                ADDABLE_SECTIONS.some((a) => a.type === section.type)
                  ? () => deleteSection(section.id)
                  : undefined
              }
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
              {section.type === "custom" && (
                <CustomSection
                  data={section.data}
                  size={section.style.size}
                  editable={editMode}
                  onChange={(d) => updateSectionData(section.id, d)}
                />
              )}
              {section.type === "faq" && (
                <Faq
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
                  social={content.social}
                  editable={editMode}
                  onChange={(d) => updateSectionData(section.id, d)}
                />
              )}
            </SectionChrome>
            {addHere(section.id)}
          </div>
        ))}

      </main>

      <Footer
        footer={content.footer}
        social={content.social}
        editable={editMode}
        onChange={(f) => setContent((c) => ({ ...c, footer: f }))}
      />

      {/* Extra footer-coloured room so the footer can scroll clear of the toolbar. */}
      {isAdmin && <div aria-hidden className="h-24 bg-ink" />}

      {isAdmin && (
        <AdminToolbar
          editMode={editMode}
          status={status}
          onToggleEdit={toggleEdit}
          onSave={save}
          onLogout={logout}
        />
      )}
    </div>
  );
}
