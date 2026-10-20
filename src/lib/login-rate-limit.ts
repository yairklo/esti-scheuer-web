import { prisma } from "@/lib/prisma";

const MINUTE_MS = 60 * 1000;
// Failed logins allowed per IP within WINDOW_MS; reaching it locks that IP
// out for LOCKOUT_MS from the last failure. The global cap is a backstop
// against guessing spread across many IPs.
const WINDOW_MS = 15 * MINUTE_MS;
const LOCKOUT_MS = 15 * MINUTE_MS;
const IP_MAX_FAILURES = 10;
const GLOBAL_MAX_FAILURES = 100;
// Arbitrary constant key for pg_advisory_xact_lock (distinct from the
// password-reset one): serialises the check-then-insert below across
// concurrent serverless instances.
const LOGIN_LOCK_KEY = 735103;

export type LoginAttempt =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Call before checking the password. When allowed, a failure is recorded up
 * front, so concurrent guesses can't all slip past the check before any of
 * them counts; call `clearFailedLogins` if the login then succeeds.
 */
export async function beginLoginAttempt(ip: string): Promise<LoginAttempt> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${LOGIN_LOCK_KEY}::bigint)`;
    const now = Date.now();
    const recent = await tx.failedLogin.findMany({
      where: { createdAt: { gt: new Date(now - WINDOW_MS - LOCKOUT_MS) } },
      select: { createdAt: true, ip: true },
      orderBy: { createdAt: "asc" },
    });

    // Blocked attempts aren't recorded, so a lockout starts at the failure
    // that completed IP_MAX_FAILURES within one window and lasts LOCKOUT_MS.
    const fromIp = recent.filter((f) => f.ip === ip).map((f) => f.createdAt.getTime());
    let lockedUntil = 0;
    for (let i = IP_MAX_FAILURES - 1; i < fromIp.length; i++) {
      if (fromIp[i] - fromIp[i - IP_MAX_FAILURES + 1] <= WINDOW_MS) {
        lockedUntil = Math.max(lockedUntil, fromIp[i] + LOCKOUT_MS);
      }
    }
    const globalCount = recent.filter((f) => f.createdAt.getTime() > now - WINDOW_MS).length;
    if (globalCount >= GLOBAL_MAX_FAILURES) {
      lockedUntil = Math.max(lockedUntil, now + LOCKOUT_MS);
    }
    if (lockedUntil > now) {
      return { allowed: false, retryAfterSeconds: Math.ceil((lockedUntil - now) / 1000) };
    }

    await tx.failedLogin.create({ data: { ip } });
    return { allowed: true };
  });
}

/** After a successful login: forget this IP's failures (typos included). */
export async function clearFailedLogins(ip: string): Promise<void> {
  await prisma.failedLogin.deleteMany({ where: { ip } });
}

/** Housekeeping: drop rows that no longer affect any limit. */
export async function pruneFailedLogins(): Promise<void> {
  await prisma.failedLogin.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - WINDOW_MS - LOCKOUT_MS) } },
  });
}
