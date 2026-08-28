import { prisma } from "@/lib/prisma";

export type FontKey = "assistant" | "heebo" | "rubik" | "secularOne" | "frankRuhl";
export type SectionSize = "sm" | "md" | "lg";

export type SectionStyle = {
  font: FontKey;
  size: SectionSize;
};

export type ServiceItem = {
  title: string;
  description: string;
};

export type HeroData = {
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

export type Section =
  | { id: string; type: "hero"; visible: boolean; style: SectionStyle; data: HeroData }
  | { id: string; type: "about"; visible: boolean; style: SectionStyle; data: AboutData }
  | { id: string; type: "approach"; visible: boolean; style: SectionStyle; data: ApproachData }
  | { id: string; type: "services"; visible: boolean; style: SectionStyle; data: ServicesData }
  | { id: string; type: "contact"; visible: boolean; style: SectionStyle; data: ContactData };

export type SectionType = Section["type"];

export type SiteContent = {
  meta: {
    title: string;
    description: string;
    favicon: string;
  };
  footer: {
    text: string;
  };
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
  sections: [
    {
      id: "hero",
      type: "hero",
      visible: true,
      style: DEFAULT_STYLE,
      data: {
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
    sections: legacySections,
  };
}

function normalize(raw: Record<string, unknown>): SiteContent {
  if (Array.isArray(raw.sections)) {
    return {
      meta: { ...defaultContent.meta, ...(raw.meta as object) },
      footer: { ...defaultContent.footer, ...(raw.footer as object) },
      sections: raw.sections as Section[],
    };
  }
  return migrateLegacy(raw);
}

const CONTENT_ID = 1;

export async function getContent(): Promise<SiteContent> {
  const row = await prisma.siteContent.findUnique({
    where: { id: CONTENT_ID },
  });

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
