import { readFile } from 'node:fs/promises';
import { openStorageDatabase } from './database.ts';

export async function migrateConversationStorage(databaseUrl: string) {
  const sql = openStorageDatabase(databaseUrl, 'fixture_admin');
  try {
    await sql.begin(async tx => {
      await tx`select pg_advisory_xact_lock(7291364)`;
      const [schema] = await tx`select to_regclass('ideeo.schema_version') as name`;
      let version = 0;
      if (schema.name) {
        const versions = await tx`select version from ideeo.schema_version`;
        if (versions.length !== 1 || ![1,2,3,4].includes(versions[0].version)) throw new Error('Unsupported storage schema');
        version = versions[0].version;
      }
      if (version < 1) await tx.unsafe(await readFile(new URL('../../../migrations/ideeo/001_conversations.sql', import.meta.url), 'utf8'));
      if (version < 2) await tx.unsafe(await readFile(new URL('../../../migrations/ideeo/002_inference.sql', import.meta.url), 'utf8'));
      if (version < 3) await tx.unsafe(await readFile(new URL('../../../migrations/ideeo/003_capability_execution.sql', import.meta.url), 'utf8'));
      if (version < 4) await tx.unsafe(await readFile(new URL('../../../migrations/ideeo/004_workspace_budget.sql', import.meta.url), 'utf8'));
    });
  } finally { await sql.end({ timeout: 2 }); }
}
