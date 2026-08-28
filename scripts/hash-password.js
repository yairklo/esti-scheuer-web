// Generates a bcrypt hash for a new admin password.
// Usage: node scripts/hash-password.js "the-new-password"
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.js "the-new-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nHash:\n" + hash);
console.log(
  '\nFor .env files, escape every "$" as "\\$" so Next.js does not expand it:\n' +
    hash.replace(/\$/g, "\\$")
);
