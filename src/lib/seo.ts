import type { Section, SiteContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { activeSocialLinks } from "@/lib/social";

// A separate WebSite entity, purely so Google has an explicit "this site's
// name is אסתי שויער" signal — without it, sites on a shared *.vercel.app
// subdomain (no custom domain yet) can show "Vercel" as the site name in
// search results instead of the actual business name.
export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "אסתי שויער",
    url: SITE_URL,
    inLanguage: "he-IL",
  };
}

// ProfessionalService + a founder Person, matching how a solo therapist
// actually shows up in search results (Google prefers a real business/person
// entity over a generic WebSite schema for this kind of local practice page).
export function buildJsonLd(content: SiteContent) {
  const contact = content.sections.find(
    (s): s is Extract<Section, { type: "contact" }> => s.type === "contact"
  )?.data;
  const about = content.sections.find(
    (s): s is Extract<Section, { type: "about" }> => s.type === "about"
  )?.data;
  // WhatsApp is a chat link, not a profile page, so it doesn't belong in sameAs.
  const profiles = activeSocialLinks(content.social)
    .filter((l) => l.key !== "whatsapp")
    .map((l) => l.href);

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "אסתי שויער - מטפלת בנוירופידבק",
    description: content.meta.description,
    url: SITE_URL,
    inLanguage: "he-IL",
    ...(contact?.phone ? { telephone: contact.phone } : {}),
    ...(contact?.email ? { email: contact.email } : {}),
    ...(contact?.area ? { areaServed: contact.area } : {}),
    ...(profiles.length > 0 ? { sameAs: profiles } : {}),
    founder: {
      "@type": "Person",
      name: "אסתי שויער",
      jobTitle: "מטפלת בנוירופידבק",
      ...(about?.bio ? { description: about.bio.split("\n")[0] } : {}),
      knowsAbout: [
        "נוירופידבק",
        "קשיי ריכוז וקשב",
        "חרדה ומתח",
        "ויסות רגשי",
      ],
    },
  };
}

// Only emitted when an FAQ section is actually shown on the page — Google
// requires FAQ structured data to match visible content.
export function buildFaqJsonLd(content: SiteContent) {
  const items = content.sections
    .filter((s): s is Extract<Section, { type: "faq" }> => s.type === "faq" && s.visible)
    .flatMap((s) => s.data.items)
    .filter((it) => it.question.trim() && it.answer.trim());
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "he-IL",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}
