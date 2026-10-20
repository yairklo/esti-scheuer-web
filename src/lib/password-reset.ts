import { createHash, randomBytes } from "crypto";
import nodemailer from "nodemailer";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const HOUR_MS = 60 * 60 * 1000;
// Throttles the public "forgot password" endpoint so it can't be used to
// flood the inbox. Limits are per requesting IP, so a stranger hammering the
// endpoint can't use up the owner's quota; the global cap is a backstop.
const IP_COOLDOWN_MS = 60 * 1000;
const IP_MAX_PER_HOUR = 5;
const GLOBAL_MAX_PER_HOUR = 20;
// Arbitrary constant key for pg_advisory_xact_lock: serialises the
// check-then-insert below across concurrent serverless instances.
const RATE_LIMIT_LOCK_KEY = 735102;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Returns a fresh plaintext token, or null when the request is throttled. */
export async function createResetToken(ip: string): Promise<string | null> {
  const token = randomBytes(32).toString("hex");
  const created = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${RATE_LIMIT_LOCK_KEY})`;
    const now = Date.now();
    const recent = await tx.passwordResetToken.findMany({
      where: { createdAt: { gt: new Date(now - HOUR_MS) } },
      select: { createdAt: true, ip: true },
    });
    const fromIp = recent.filter((t) => t.ip === ip);
    if (
      recent.length >= GLOBAL_MAX_PER_HOUR ||
      fromIp.length >= IP_MAX_PER_HOUR ||
      fromIp.some((t) => t.createdAt.getTime() > now - IP_COOLDOWN_MS)
    ) {
      return false;
    }
    await tx.passwordResetToken.create({
      data: { tokenHash: hashToken(token), ip, expiresAt: new Date(now + TOKEN_TTL_MS) },
    });
    return true;
  });
  if (!created) return null;

  // Housekeeping: drop rows long past both their expiry and the rate-limit window.
  await prisma.passwordResetToken.deleteMany({
    where: { expiresAt: { lt: new Date(Date.now() - 24 * HOUR_MS) } },
  });
  return token;
}

/**
 * Marks the token used if it's valid. The conditional update makes this
 * single-use even when two requests race with the same link. Pass `tx` so a
 * failure later in the caller's transaction un-consumes it.
 */
export async function consumeResetToken(
  token: string,
  tx: Prisma.TransactionClient
): Promise<boolean> {
  if (!token) return false;
  const { count } = await tx.passwordResetToken.updateMany({
    where: { tokenHash: hashToken(token), usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  return count === 1;
}

export async function isResetTokenValid(token: string): Promise<boolean> {
  if (!token) return false;
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  return !!row && !row.usedAt && row.expiresAt > new Date();
}

export async function sendResetEmail(token: string): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.ADMIN_RECOVERY_EMAIL;
  if (!user || !pass || !to) {
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD / ADMIN_RECOVERY_EMAIL are not set");
  }
  const link = `${SITE_URL}/admin/reset-password?token=${token}`;

  // Gmail SMTP with an App Password (requires 2-Step Verification on the account).
  // Short timeouts: nodemailer's defaults (up to 10 min) would keep a
  // serverless function hanging if Gmail stalls.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  await transporter.sendMail({
    from: `"אתר אסתי שויער" <${user}>`,
    to,
    subject: "איפוס סיסמה לניהול האתר",
    html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.6">
  <p>שלום אסתי,</p>
  <p>התקבלה בקשה לאיפוס הסיסמה לניהול האתר. לבחירת סיסמה חדשה לחצי על הקישור:</p>
  <p><a href="${link}">בחירת סיסמה חדשה</a></p>
  <p>הקישור תקף ל-30 דקות ולשימוש אחד בלבד.<br>אם לא ביקשת לאפס את הסיסמה, אפשר פשוט להתעלם מהמייל הזה.</p>
</div>`,
    text: `לבחירת סיסמה חדשה לניהול האתר: ${link}\nהקישור תקף ל-30 דקות. אם לא ביקשת לאפס את הסיסמה, אפשר להתעלם מהמייל.`,
  });
}
