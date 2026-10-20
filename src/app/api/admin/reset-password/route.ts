import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { updateAdminPasswordHash, getAdminAuth } from "@/lib/auth-store";
import { consumeResetToken } from "@/lib/password-reset";

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

  const newHash = await bcrypt.hash(newPassword, 10);
  // Ensures the AdminAuth row exists before updating it.
  await getAdminAuth();

  // One transaction: if the password update fails, the token isn't burned.
  const ok = await prisma.$transaction(async (tx) => {
    if (!(await consumeResetToken(token, tx))) return false;
    await updateAdminPasswordHash(newHash, tx);
    return true;
  });

  if (!ok) {
    return NextResponse.json(
      { error: "הקישור אינו תקף או שפג תוקפו. אפשר לבקש קישור חדש ממסך הכניסה." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
