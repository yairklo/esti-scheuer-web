import { NextResponse } from "next/server";
import { saveContent, getContent, type SiteContent } from "@/lib/content";

function isValidContent(body: unknown): body is SiteContent {
  if (!body || typeof body !== "object") return false;
  const c = body as Record<string, unknown>;
  return (
    typeof c.meta === "object" &&
    typeof c.footer === "object" &&
    Array.isArray(c.sections)
  );
}

export async function GET() {
  const content = await getContent();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValidContent(body)) {
    return NextResponse.json({ error: "תוכן לא תקין" }, { status: 400 });
  }

  await saveContent(body);
  return NextResponse.json({ ok: true });
}
