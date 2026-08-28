import { prisma } from "@/lib/prisma";

const AUTH_ID = 1;

export async function getAdminAuth(): Promise<{
  username: string;
  passwordHash: string;
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
  return { username, passwordHash };
}

export async function updateAdminPasswordHash(passwordHash: string): Promise<void> {
  await prisma.adminAuth.update({ where: { id: AUTH_ID }, data: { passwordHash } });
}
