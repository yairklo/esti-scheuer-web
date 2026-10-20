import { NextResponse } from "next/server";
import { createResetToken, sendResetEmail } from "@/lib/password-reset";

// Public endpoint. There's a single admin, so no username is needed — the link
// always goes to ADMIN_RECOVERY_EMAIL. The response is the same whether or not
// an email actually went out, so it reveals nothing to a stranger.
export async function POST() {
  try {
    const token = await createResetToken();
    if (token) await sendResetEmail(token);
  } catch (err) {
    console.error("Password reset email failed:", err);
  }
  return NextResponse.json({ ok: true });
}
