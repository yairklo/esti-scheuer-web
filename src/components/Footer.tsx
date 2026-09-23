"use client";

import type { SiteContent } from "@/lib/content";
import { EditableText } from "./EditableText";
import SocialIcons from "./SocialIcons";

export default function Footer({
  footer,
  social,
  editable,
  onChange,
}: {
  footer: SiteContent["footer"];
  social: SiteContent["social"];
  editable: boolean;
  onChange: (f: SiteContent["footer"]) => void;
}) {
  return (
    <footer className="bg-ink py-8 text-center text-sm text-white/60">
      <SocialIcons
        social={social}
        className="mb-5"
        iconClassName="bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
      />
      <EditableText
        as="p"
        editable={editable}
        value={footer.text}
        onChange={(v) => onChange({ text: v })}
      />
    </footer>
  );
}
