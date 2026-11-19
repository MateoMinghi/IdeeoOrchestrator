import { openStorageDatabase } from '../server/ideeo/storage/database.ts';

try {
  if (process.argv.length !== 2) throw new Error('Invalid arguments');
  const sql = openStorageDatabase(process.env.IDEEO_MAINTENANCE_DATABASE_URL, 'ideeo_maintenance');
  try {
    const [result] = await sql`select * from ideeo.purge_expired()`;
    process.stdout.write(JSON.stringify({ cleared: Number(result.cleared), removed: Number(result.removed) }) + '\n');
  } finally { await sql.end({ timeout: 2 }); }
} catch { process.stderr.write('Conversation storage cleanup failed.\n'); process.exitCode = 1; }
