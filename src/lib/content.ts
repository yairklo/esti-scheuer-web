import { prisma } from "@/lib/prisma";

export type FontKey = "assistant" | "heebo" | "rubik" | "secularOne" | "frankRuhl";
export type SectionSize = "sm" | "md" | "lg";

export type SectionStyle = {
  font: FontKey;
  size: SectionSize;
  // Optional design overrides set from edit mode; unset = the section's
  // built-in look. Colours are "#rrggbb".
  bg?: string;
  headingColor?: string;
  textColor?: string;
  textScale?: number; // multiplies every text size in the section; 1 = default
};

export type ServiceItem = {
  title: string;
  description: string;
};

export type HeroData = {
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
};

export type AboutData = {
  heading: string;
  bio: string;
  credentials: string[];
  photo: string;
};

export type ApproachData = {
  heading: string;
  text: string;
};

export type ServicesData = {
  heading: string;
  intro: string;
  items: ServiceItem[];
};

export type ContactData = {
  heading: string;
  intro: string;
  phone: string;
  email: string;
  area: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqData = {
  heading: string;
  intro: string;
  items: FaqItem[];
};

// A free-form section she can add as many times as she likes, anywhere on the
// page. Videos are YouTube/Vimeo links (embedded), never uploaded files —
// uploads are stored as data URLs inside the content JSON, which only suits
// a handful of resized images.
export type MediaSize = "sm" | "md" | "lg" | "full";

export type MediaItem = {
  kind: "image" | "video";
  src: string;
  size?: MediaSize; // width in the grid layout; default "md"
};

// Layout options were added after the first custom sections were saved, so
// they're optional and the defaults live in MediaGallery.
export type MediaLayout = {
  mode?: "grid" | "carousel"; // default "grid"
  position?: "below" | "above" | "side"; // relative to the text; default "below"
  align?: "start" | "center" | "end"; // grid only; default "center"
  perView?: 1 | 2 | 3; // carousel only: items visible at once; default 2
};

export type CustomData = {
  navLabel: string; // shown in the top menu; empty = not in the menu
  heading: string;
  text: string;
  media: MediaItem[];
  mediaLayout?: MediaLayout;
  // Legacy: the old per-section "light / greenish" toggle, superseded by the
  // design panel's background colour. normalize() converts it on read.
  background?: "plain" | "tint";
};

export type Section =
  | { id: string; type: "hero"; visible: boolean; style: SectionStyle; data: HeroData }
  | { id: string; type: "about"; visible: boolean; style: SectionStyle; data: AboutData }
  | { id: string; type: "approach"; visible: boolean; style: SectionStyle; data: ApproachData }
  | { id: string; type: "services"; visible: boolean; style: SectionStyle; data: ServicesData }
  | { id: string; type: "custom"; visible: boolean; style: SectionStyle; data: CustomData }
  | { id: string; type: "faq"; visible: boolean; style: SectionStyle; data: FaqData }
  | { id: string; type: "contact"; visible: boolean; style: SectionStyle; data: ContactData };

export type SectionType = Section["type"];

export type SocialLinks = {
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
};

export type SiteContent = {
  meta: {
    title: string;
    description: string;
    favicon: string;
  };
  footer: {
    text: string;
  };
  social: SocialLinks;
  sections: Section[];
};

const DEFAULT_STYLE: SectionStyle = { font: "assistant", size: "md" };

export const defaultContent: SiteContent = {
  meta: {
    title: "אסתי שויער | מטפלת בנוירופידבק",
    description:
      "אסתי שויער, מטפלת בנוירופידבק. ליווי טיפולי לילדים, נוער ומבוגרים, לחיזוק הריכוז, הוויסות הרגשי והרוגע.",
    favicon: "",
  },
  footer: {
    text: "אסתי שויער — מטפלת בנוירופידבק",
  },
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
    whatsapp: "",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      visible: true,
      style: DEFAULT_STYLE,
      data: {
        badge: "מטפלת בנוירופידבק",
        title: "טיפול בנוירופידבק לחיים רגועים ומאוזנים יותר",
        subtitle:
          "ליווי טיפולי המסייע למוח ללמוד לווסת את עצמו — לריכוז טוב יותר, שינה איכותית ורוגע נפשי",
        ctaText: "לקביעת פגישת היכרות",
      },
    },
    {
      id: "about",
      type: "about",
      visible: true,
      style: DEFAULT_STYLE,
      data: {
        heading: "קצת עליי",
        bio: "אני אסתי שויער, מטפלת בנוירופידבק. אני מלווה ילדים, בני נוער ומבוגרים המתמודדים עם קשיי ריכוז, חרדה, מתח וקשיי ויסות רגשי, מתוך אמונה שהמוח מסוגל ללמוד וליצור שינוי אמיתי כשנותנים לו את הכלים הנכונים.\n\nאני מאמינה בטיפול עדין ומותאם אישית, המלווה את המטופל ואת בני משפחתו לאורך כל התהליך.",
        credentials: [
          "מטפלת בנוירופידבק מוסמכת",
          "ליווי ילדים, נוער ומבוגרים",
          "טיפול מותאם אישית לצרכי המטופל",
        ],
        photo: "",
      },
    },
    {
      id: "approach",
      type: "approach",
      visible: true,
      style: DEFAULT_STYLE,
      data: {
        heading: "הגישה הטיפולית שלי",
        text: "נוירופידבק היא שיטת טיפול לא פולשנית, המבוססת על מדידת פעילות המוח בזמן אמת ומתן משוב שמאפשר למוח ללמוד לווסת את עצמו בעצמו.\n\nאני מלווה כל מטופל בתהליך מותאם אישית, המבוסס על היכרות מעמיקה עם הצרכים שלו, תוך יצירת מרחב בטוח ונעים לאורך כל הטיפול. אני שמה דגש רב על שיתוף פעולה עם המשפחה, כדי שהשינוי יתחזק ויישאר גם מחוץ לחדר הטיפול.",
      },
    },
    {
      id: "services",
      type: "services",
      visible: true,
      style: DEFAULT_STYLE,
      data: {
        heading: "תחומי טיפול",
        intro: "טיפול בנוירופידבק המותאם אישית למטופל, בהתאם לצורך ולגיל.",
        items: [
          {
            title: "קשיי ריכוז וקשב",
            description:
              "טיפול בנוירופידבק לילדים, נוער ומבוגרים המתמודדים עם קשיי ריכוז, קשב וריכוז לימודי.",
          },
          {
            title: "חרדה ומתח",
            description:
              "ליווי טיפולי להפחתת חרדה, מתח וסטרס, וחיזוק תחושת הרוגע והשליטה העצמית.",
          },
          {
            title: "ויסות רגשי והתנהגותי",
            description:
              "חיזוק היכולת לווסת רגשות והתנהגות, ומתן כלים להתמודדות עם קשיים יומיומיים.",
          },
          {
            title: "שיפור איכות השינה",
            description:
              "טיפול המסייע בהתמודדות עם קשיי הירדמות והפרעות שינה, לשיפור התפקוד היומיומי.",
          },
        ],
      },
    },
    {
      id: "contact",
      type: "contact",
      visible: true,
      style: DEFAULT_STYLE,
      data: {
        heading: "יצירת קשר",
        intro:
          "אשמח לשמוע מכם ולענות על כל שאלה. אפשר ליצור קשר בטלפון או במייל, ואחזור אליכם בהקדם.",
        phone: "",
        email: "",
        area: "",
      },
    },
  ],
};

function findDefaultSection<T extends SectionType>(type: T) {
  return defaultContent.sections.find((s) => s.type === type) as Extract<
    Section,
    { type: T }
  >;
}

// Converts the pre-sections content shape (flat hero/about/approach/services/contact
// keys) into the current sections-array shape, so old rows in the DB keep working.
function migrateLegacy(old: Record<string, unknown>): SiteContent {
  const legacySections: Section[] = [
    {
      id: "hero",
      type: "hero",
      visible: true,
      style: DEFAULT_STYLE,
      data: { ...findDefaultSection("hero").data, ...(old.hero as object) },
    },
    {
      id: "about",
      type: "about",
      visible: true,
      style: DEFAULT_STYLE,
      data: { ...findDefaultSection("about").data, ...(old.about as object) },
    },
    {
      id: "approach",
      type: "approach",
      visible: true,
      style: DEFAULT_STYLE,
      data: { ...findDefaultSection("approach").data, ...(old.approach as object) },
    },
    {
      id: "services",
      type: "services",
      visible: true,
      style: DEFAULT_STYLE,
      data: { ...findDefaultSection("services").data, ...(old.services as object) },
    },
    {
      id: "contact",
      type: "contact",
      visible: true,
      style: DEFAULT_STYLE,
      data: { ...findDefaultSection("contact").data, ...(old.contact as object) },
    },
  ];

  return {
    meta: { ...defaultContent.meta, ...(old.meta as object) },
    footer: { ...defaultContent.footer, ...(old.footer as object) },
    social: { ...defaultContent.social, ...(old.social as object) },
    sections: legacySections,
  };
}

function normalize(raw: Record<string, unknown>): SiteContent {
  if (Array.isArray(raw.sections)) {
    return {
      meta: { ...defaultContent.meta, ...(raw.meta as object) },
      footer: { ...defaultContent.footer, ...(raw.footer as object) },
      social: { ...defaultContent.social, ...(raw.social as object) },
      sections: (raw.sections as Section[]).map(migrateTintBackground),
    };
  }
  return migrateLegacy(raw);
}

// The greenish look from the old toggle, as a solid colour (sage-light at 60%
// over the cream page background), so converted sections look the same.
const LEGACY_TINT = "#edefe2";

// Custom sections saved with the old "greenish" toggle get that colour as a
// design-panel background instead, where it can be changed or reset.
function migrateTintBackground(section: Section): Section {
  if (section.type !== "custom" || section.data.background === undefined) return section;
  const { background, ...data } = section.data;
  return {
    ...section,
    data,
    style:
      background === "tint" && !section.style.bg
        ? { ...section.style, bg: LEGACY_TINT }
        : section.style,
  };
}

const CONTENT_ID = 1;

export async function getContent(): Promise<SiteContent> {
  let row;
  try {
    row = await prisma.siteContent.findUnique({ where: { id: CONTENT_ID } });
  } catch {
    // DB unreachable (e.g. during a build, or a brief outage in production) —
    // fall back to the built-in defaults instead of failing the whole page.
    return defaultContent;
  }

  if (!row) return defaultContent;

  const raw = row.data as Record<string, unknown>;
  const content = normalize(raw);

  if (!Array.isArray(raw.sections)) {
    // Persist the migrated shape so future reads skip this conversion.
    await saveContent(content);
  }

  return content;
}

export async function saveContent(content: SiteContent): Promise<void> {
  await prisma.siteContent.upsert({
    where: { id: CONTENT_ID },
    create: { id: CONTENT_ID, data: content },
    update: { data: content },
  });
}
