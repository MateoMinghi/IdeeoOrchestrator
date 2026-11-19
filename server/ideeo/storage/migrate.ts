import { readFile } from 'node:fs/promises';
import { openStorageDatabase } from './database.ts';

export async function migrateConversationStorage(databaseUrl: string) {
  const sql = openStorageDatabase(databaseUrl, 'fixture_admin');
  try {
    await sql.begin(async tx => {
      await tx`select pg_advisory_xact_lock(7291364)`;
      const [schema] = await tx`select to_regclass('ideeo.schema_version') as name`;
      if (schema.name) {
        const versions = await tx`select version from ideeo.schema_version`;
        if (versions.length !== 1 || versions[0].version !== 1) throw new Error('Unsupported storage schema');
        return;
      }
      await tx.unsafe(await readFile(new URL('../../../migrations/ideeo/001_conversations.sql', import.meta.url), 'utf8'));
    });
  } finally { await sql.end({ timeout: 2 }); }
}
