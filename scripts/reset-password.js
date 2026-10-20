// Resets the admin password directly in the database (for when it's forgotten).
// The login reads the password from the AdminAuth row, not from
// ADMIN_PASSWORD_HASH (that env var only seeds the row on first run), so
// changing the env var alone has no effect once the site has been used.
//
// Usage (production): DATABASE_URL="<connection string>" node scripts/reset-password.js "the-new-password"
// Usage (local):      node --env-file=.env scripts/reset-password.js "the-new-password"
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/reset-password.js "the-new-password"');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  const passwordHash = bcrypt.hashSync(password, 10);
  const { count } = await prisma.adminAuth.updateMany({ where: { id: 1 }, data: { passwordHash } });
  if (count === 0) {
    console.error("No AdminAuth row yet — log in once (it bootstraps from env vars), or set ADMIN_PASSWORD_HASH.");
    process.exit(1);
  }
  console.log("Admin password updated.");
})()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
