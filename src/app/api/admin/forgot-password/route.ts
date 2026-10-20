import { NextResponse, after } from "next/server";
import { getAdminAuth } from "@/lib/auth-store";
import { createResetToken, rateLimitKey, sendResetEmail } from "@/lib/password-reset";

// Bounds the background send in after() (SMTP has its own shorter timeouts).
export const maxDuration = 30;

// Public endpoint. The link always goes to ADMIN_RECOVERY_EMAIL; the username
// is required only so drive-by requests can't trigger emails. All the work
// runs after the response, so every caller gets the same instant reply:
// neither its body nor its timing reveals whether the username was right,
// the request was throttled, or the send failed (failures are logged).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  // On Vercel these headers are set by the platform and can't be spoofed;
  // elsewhere they can, and missing ones all share the "unknown" bucket.
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";

  after(async () => {
    try {
      const auth = await getAdminAuth();
      if (!username || username !== auth.username) return;
      const token = await createResetToken(rateLimitKey(ip));
      if (token) await sendResetEmail(token);
    } catch (err) {
      console.error("Password reset email failed:", err);
    }
  });
  return NextResponse.json({ ok: true });
}
