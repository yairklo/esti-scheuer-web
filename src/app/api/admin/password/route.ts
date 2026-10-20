import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyPassword } from "@/lib/password";
import { getAdminAuth, updateAdminPasswordHash } from "@/lib/auth-store";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const currentPassword =
    typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "הסיסמה החדשה חייבת להכיל לפחות 8 תווים" },
      { status: 400 }
    );
  }

  const auth = await getAdminAuth();
  const ok = await verifyPassword(currentPassword, auth.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "הסיסמה הנוכחית שגויה" }, { status: 401 });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  const version = await updateAdminPasswordHash(newHash);

  // The change signs out every other session; re-issue this one so the
  // person who just changed it stays logged in.
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    await createSessionToken(auth.username, version),
    sessionCookieOptions()
  );
  return response;
}
