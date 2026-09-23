import type { Section } from "@/lib/content";

// Ready-made sections she can insert anywhere from edit mode. Lives outside
// content.ts on purpose: that module imports Prisma, so a value import from it
// inside a client component would pull the DB driver into the browser bundle.

export type AddableSectionType = "custom" | "faq";

export const ADDABLE_SECTIONS: { type: AddableSectionType; label: string }[] = [
  { type: "custom", label: "טקסט, תמונות וסרטונים" },
  { type: "faq", label: "שאלות ותשובות" },
];

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const STYLE = { font: "assistant", size: "md" } as const;

export function createSection(type: AddableSectionType): Section {
  if (type === "faq") {
    return {
      id: newId("faq"),
      type: "faq",
      visible: true,
      style: { ...STYLE },
      data: {
        heading: "שאלות נפוצות",
        intro: "",
        items: [
          {
            question: "האם הטיפול כואב או פולשני?",
            answer:
              "לא. החיישנים רק מודדים את פעילות המוח ואינם מעבירים זרם או כל גירוי. המטופל יושב בנוחות וצופה במסך.",
          },
          {
            question: "כמה מפגשים צריך?",
            answer:
              "מספר המפגשים משתנה ממטופל למטופל, בהתאם למטרות הטיפול. בפגישת ההיכרות נבנה יחד תוכנית מותאמת.",
          },
          {
            question: "מאיזה גיל אפשר להתחיל?",
            answer: "הטיפול מתאים לילדים, לבני נוער ולמבוגרים.",
          },
        ],
      },
    };
  }

  return {
    id: newId("custom"),
    type: "custom",
    visible: true,
    style: { ...STYLE },
    data: {
      navLabel: "",
      heading: "כותרת הסקשן",
      text: "כאן כותבים את תוכן הסקשן.",
      media: [],
      background: "plain",
    },
  };
}
