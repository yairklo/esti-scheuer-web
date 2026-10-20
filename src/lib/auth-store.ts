import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const AUTH_ID = 1;

export async function getAdminAuth(): Promise<{
  username: string;
  passwordHash: string;
  sessionVersion: number;
}> {
  const row = await prisma.adminAuth.findUnique({ where: { id: AUTH_ID } });
  if (row) return row;

  // First run: bootstrap the DB row from the env vars set at deploy time.
  const username = process.env.ADMIN_USERNAME ?? "";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  try {
    await prisma.adminAuth.create({ data: { id: AUTH_ID, username, passwordHash } });
  } catch {
    // Lost a race with a concurrent bootstrap; read back what won.
    const existing = await prisma.adminAuth.findUnique({ where: { id: AUTH_ID } });
    if (existing) return existing;
    throw new Error("Failed to bootstrap admin auth");
  }
  return { username, passwordHash, sessionVersion: 0 };
}

/**
 * Sets a new password. Every session issued before the change stops working
 * (sessionVersion bump) and any outstanding reset link is revoked. Pass `tx`
 * to run it inside a caller's transaction. Returns the new session version.
 */
export async function updateAdminPasswordHash(
  passwordHash: string,
  tx?: Prisma.TransactionClient
): Promise<number> {
  if (!tx) return prisma.$transaction((t) => updateAdminPasswordHash(passwordHash, t));
  const row = await tx.adminAuth.update({
    where: { id: AUTH_ID },
    data: { passwordHash, sessionVersion: { increment: 1 } },
  });
  await tx.passwordResetToken.updateMany({
    where: { usedAt: null },
    data: { usedAt: new Date() },
  });
  return row.sessionVersion;
}
