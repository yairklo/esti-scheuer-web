import { createHash, randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
// Throttles the public "forgot password" endpoint so it can't be used to
// flood the inbox: at most one email per cooldown, and a few per hour.
const COOLDOWN_MS = 60 * 1000;
const MAX_PER_HOUR = 5;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Returns a fresh plaintext token, or null when the request is throttled. */
export async function createResetToken(): Promise<string | null> {
  const now = Date.now();
  const recent = await prisma.passwordResetToken.findMany({
    where: { createdAt: { gt: new Date(now - 60 * 60 * 1000) } },
    select: { createdAt: true },
  });
  if (
    recent.length >= MAX_PER_HOUR ||
    recent.some((t) => t.createdAt.getTime() > now - COOLDOWN_MS)
  ) {
    return null;
  }

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { tokenHash: hashToken(token), expiresAt: new Date(now + TOKEN_TTL_MS) },
  });
  // Housekeeping: expired tokens are useless, drop them.
  await prisma.passwordResetToken.deleteMany({
    where: { expiresAt: { lt: new Date(now - 24 * 60 * 60 * 1000) } },
  });
  return token;
}

/**
 * Marks the token used if it's valid. The conditional update makes this
 * single-use even when two requests race with the same link.
 */
export async function consumeResetToken(token: string): Promise<boolean> {
  if (!token) return false;
  const { count } = await prisma.passwordResetToken.updateMany({
    where: { tokenHash: hashToken(token), usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  return count === 1;
}

/** Called after a successful reset: any other outstanding link stops working. */
export async function invalidateOutstandingTokens(): Promise<void> {
  await prisma.passwordResetToken.updateMany({
    where: { usedAt: null },
    data: { usedAt: new Date() },
  });
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
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
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
