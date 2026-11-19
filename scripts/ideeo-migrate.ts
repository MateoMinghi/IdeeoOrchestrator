import { migrateConversationStorage } from '../server/ideeo/storage/migrate.ts';

if (process.argv.length !== 2 || !process.env.IDEEO_MIGRATION_DATABASE_URL) {
  process.stderr.write('Set the explicit disposable IDEEO_MIGRATION_DATABASE_URL.\n');
  process.exitCode = 1;
} else {
  await migrateConversationStorage(process.env.IDEEO_MIGRATION_DATABASE_URL).then(() => {
    process.stdout.write('Conversation storage schema is current.\n');
  }).catch(() => { process.stderr.write('Conversation storage migration failed.\n'); process.exitCode = 1; });
}
