import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getContent } from "@/lib/content";
import type { Section } from "@/lib/content";

// Uses Prisma (getContent) to read live site content, which needs the
// Node.js runtime — the default edge runtime can't run Prisma's engine.
export const runtime = "nodejs";
export const alt = "אסתי שויער - מטפלת בנוירופידבק";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAME = "אסתי שויער";
const TAGLINE = "מטפלת בנוירופידבק";

// Satori lays text out left-to-right regardless of the `direction` CSS
// property, so plain Hebrew (no digits/Latin, no line wrapping) renders
// mirrored letter-by-letter. Hebrew doesn't join letters cursively, so a
// straight character reversal — read the string backwards — produces the
// correct visual result under Satori's naive LTR layout. This only holds
// for a single line of pure-Hebrew text, which is what this image uses.
function rtl(text: string): string {
  return [...text].reverse().join("");
}

// Satori (the renderer behind ImageResponse) ships no Hebrew glyphs, so
// Hebrew text renders blank without an explicit font. Fetching a Hebrew font
// from Google Fonts at request/build time is fragile (their CDN serves
// different, sometimes Satori-incompatible, formats depending on how the
// request looks), so a real ttf is bundled straight into the repo instead —
// this is Next's own documented pattern for local font assets in OG images.
// Must be a static (non-variable) font file — Satori fails to parse
// variable fonts like Assistant's; Alef ships proper static weight files.
// Read once at module scope since the font data never changes per request.
const fontDataPromise = readFile(
  join(process.cwd(), "assets/fonts/Alef-Bold.ttf")
).then((buf) => new Uint8Array(buf).buffer as ArrayBuffer);

export default async function Image() {
  const content = await getContent();
  const hero = content.sections.find(
    (s): s is Extract<Section, { type: "hero" }> => s.type === "hero"
  );
  const title = hero?.data.title ?? content.meta.title;
  // Text is forced to a single line (see rtl() above), so long titles need a
  // smaller size to avoid overflowing the 1200px canvas.
  const titleFontSize = title.length > 42 ? 34 : title.length > 28 ? 44 : 54;

  const fontData = await fontDataPromise;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #faf8f5 0%, #f3efea 55%, #e6eae2 100%)",
          padding: "90px",
          fontFamily: "Alef",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 700,
            color: "#5c6e5c",
            letterSpacing: 2,
          }}
        >
          {rtl(NAME)}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: titleFontSize,
            fontWeight: 700,
            color: "#2b2625",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {rtl(title)}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 28,
            fontWeight: 700,
            color: "#a25f49",
          }}
        >
          {rtl(TAGLINE)}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Alef", data: fontData, weight: 700, style: "normal" }],
    }
  );
}
