/*
  Runs a one-time resolution for a previously failed migration to avoid P3009,
  then applies all pending migrations. Safe to run on every start (idempotent enough).
*/
const { execSync } = require('child_process');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  // Mark the previously failed migration as rolled back so Prisma can proceed
  run('npx prisma migrate resolve --rolled-back 20251021_fix_documento_enum');
} catch (e) {
  console.log('No resolve needed or already resolved. Continuing...');
}

// Now apply pending migrations (including the enum recreation)
run('npx prisma migrate deploy');
