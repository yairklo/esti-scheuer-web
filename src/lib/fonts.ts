import type { FontKey } from "@/lib/content";

export const FONT_LABELS: Record<FontKey, string> = {
  assistant: "Assistant",
  heebo: "Heebo",
  rubik: "Rubik",
  secularOne: "Secular One",
  frankRuhl: "Frank Ruhl Libre",
};

export const FONT_VARS: Record<FontKey, string> = {
  assistant: "var(--font-assistant)",
  heebo: "var(--font-heebo)",
  rubik: "var(--font-rubik)",
  secularOne: "var(--font-secular-one)",
  frankRuhl: "var(--font-frank-ruhl)",
};

export const FONT_KEYS: FontKey[] = [
  "assistant",
  "heebo",
  "rubik",
  "secularOne",
  "frankRuhl",
];
