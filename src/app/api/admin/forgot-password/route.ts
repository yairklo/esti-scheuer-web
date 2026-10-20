import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/auth-store";
import { createResetToken, sendResetEmail } from "@/lib/password-reset";

// Bounds the SMTP send (its own timeouts are shorter) so a stall can't run long.
export const maxDuration = 30;

// Public endpoint. The link always goes to ADMIN_RECOVERY_EMAIL; the username
// is required only so drive-by requests can't trigger emails. A wrong username
// gets the same "sent" answer as a right one.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";

  const auth = await getAdminAuth();
  if (!username || username !== auth.username) {
    return NextResponse.json({ ok: true });
  }

  // On Vercel these headers are set by the platform, not the client.
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";

  try {
    const token = await createResetToken(ip);
    if (!token) {
      return NextResponse.json({ ok: true, throttled: true });
    }
    await sendResetEmail(token);
  } catch (err) {
    console.error("Password reset email failed:", err);
    return NextResponse.json(
      { error: "לא הצלחנו לשלוח את המייל. נסי שוב מאוחר יותר." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
