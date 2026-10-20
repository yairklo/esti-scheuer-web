import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import { getAdminAuth } from "@/lib/auth-store";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { requestIpKey } from "@/lib/password-reset";
import {
  beginLoginAttempt,
  clearFailedLogins,
  pruneFailedLogins,
} from "@/lib/login-rate-limit";

// bcrypt hash (cost 10, like real ones) of a random string nobody knows.
// Compared against when the username is wrong, so that path costs the same
// time as a wrong password and response timing doesn't reveal the username.
const DUMMY_HASH = "$2b$10$6V3Udyb9na.L7yCZAk.N1ukn4xau6pj1uLeVtybCdiQObZQxF4Kae";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const ipKey = requestIpKey(request);

  const attempt = await beginLoginAttempt(ipKey);
  if (!attempt.allowed) {
    const minutes = Math.ceil(attempt.retryAfterSeconds / 60);
    const wait = minutes === 1 ? "דקה" : `${minutes} דקות`;
    return NextResponse.json(
      { error: `יותר מדי ניסיונות התחברות שגויים. נסי שוב בעוד ${wait}` },
      { status: 429, headers: { "Retry-After": String(attempt.retryAfterSeconds) } }
    );
  }

  const auth = await getAdminAuth();
  const validUsername = username === auth.username;
  const validPassword = await verifyPassword(
    password,
    validUsername ? auth.passwordHash : DUMMY_HASH
  );

  if (!validUsername || !validPassword) {
    await pruneFailedLogins();
    return NextResponse.json({ error: "שם משתמש או סיסמה שגויים" }, { status: 401 });
  }

  await clearFailedLogins(ipKey);
  const token = await createSessionToken(username, auth.sessionVersion);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
