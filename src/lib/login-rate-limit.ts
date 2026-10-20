import { prisma } from "@/lib/prisma";

const MINUTE_MS = 60 * 1000;
// Failed logins allowed per IP within WINDOW_MS; reaching it locks that IP
// out for LOCKOUT_MS from the last failure. There's deliberately no global
// cap: anyone able to trip it could lock the owner out with the right
// password. Per-IP limits, bcrypt and a strong password are enough here.
const WINDOW_MS = 15 * MINUTE_MS;
const LOCKOUT_MS = 15 * MINUTE_MS;
const IP_MAX_FAILURES = 10;
// Namespace for pg_advisory_xact_lock(namespace, hashtext(ip)): serialises
// the check-then-insert below per IP across concurrent serverless instances,
// so a flood from other IPs never queues the owner's request.
const LOGIN_LOCK_NAMESPACE = 735103;

export type LoginAttempt =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Call before checking the password. When allowed, a failure is recorded up
 * front, so concurrent guesses can't all slip past the check before any of
 * them counts; call `clearFailedLogins` if the login then succeeds. Throws if
 * the DB is unavailable or the lock can't be taken within 2s.
 */
export async function beginLoginAttempt(ip: string): Promise<LoginAttempt> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SET LOCAL lock_timeout = '2s'`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${LOGIN_LOCK_NAMESPACE}::int, hashtext(${ip}))`;
      const now = Date.now();
      const failures = (
        await tx.failedLogin.findMany({
          where: { ip, createdAt: { gt: new Date(now - WINDOW_MS - LOCKOUT_MS) } },
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
        })
      ).map((f) => f.createdAt.getTime());

      // Blocked attempts aren't recorded, so a lockout starts at the failure
      // that completed IP_MAX_FAILURES within one window and lasts LOCKOUT_MS.
      let lockedUntil = 0;
      for (let i = IP_MAX_FAILURES - 1; i < failures.length; i++) {
        if (failures[i] - failures[i - IP_MAX_FAILURES + 1] <= WINDOW_MS) {
          lockedUntil = Math.max(lockedUntil, failures[i] + LOCKOUT_MS);
        }
      }
      if (lockedUntil > now) {
        return { allowed: false, retryAfterSeconds: Math.ceil((lockedUntil - now) / 1000) };
      }

      await tx.failedLogin.create({ data: { ip } });
      return { allowed: true };
    },
    { maxWait: 2000, timeout: 5000 }
  );
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
