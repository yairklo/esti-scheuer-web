import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { updateAdminPasswordHash, getAdminAuth } from "@/lib/auth-store";
import { consumeResetToken, invalidateOutstandingTokens } from "@/lib/password-reset";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "הסיסמה החדשה חייבת להכיל לפחות 8 תווים" },
      { status: 400 }
    );
  }

  if (!(await consumeResetToken(token))) {
    return NextResponse.json(
      { error: "הקישור אינו תקף או שפג תוקפו. אפשר לבקש קישור חדש ממסך הכניסה." },
      { status: 400 }
    );
  }

  // Ensures the AdminAuth row exists before updating it.
  await getAdminAuth();
  await updateAdminPasswordHash(await bcrypt.hash(newPassword, 10));
  await invalidateOutstandingTokens();
  return NextResponse.json({ ok: true });
}
