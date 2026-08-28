import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import { getAdminAuth } from "@/lib/auth-store";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const auth = await getAdminAuth();
  const validUsername = username === auth.username;
  const validPassword = validUsername
    ? await verifyPassword(password, auth.passwordHash)
    : false;

  if (!validUsername || !validPassword) {
    return NextResponse.json({ error: "שם משתמש או סיסמה שגויים" }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
