"use client";

import type { SiteContent } from "@/lib/content";
import { EditableText } from "./EditableText";

export default function Footer({
  footer,
  editable,
  onChange,
}: {
  footer: SiteContent["footer"];
  editable: boolean;
  onChange: (f: SiteContent["footer"]) => void;
}) {
  return (
    <footer className="bg-ink py-8 text-center text-sm text-white/60">
      <EditableText
        as="p"
        editable={editable}
        value={footer.text}
        onChange={(v) => onChange({ text: v })}
      />
    </footer>
  );
}
