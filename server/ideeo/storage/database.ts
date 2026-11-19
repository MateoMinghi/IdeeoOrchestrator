import postgres from 'postgres';
import { storageDatabaseUrl } from './config.ts';

export function openStorageDatabase(raw: string | undefined, role: 'ideeo_runtime' | 'ideeo_maintenance' | 'fixture_admin') {
  return postgres(storageDatabaseUrl(raw, role), { max: 4, connect_timeout: 2, idle_timeout: 5,
    max_lifetime: 300, onnotice: () => {}, connection: { application_name: 'ideeo-storage', statement_timeout: 3000,
      idle_in_transaction_session_timeout: 10000, lock_timeout: 200, timezone: 'UTC', search_path: 'pg_catalog' } });
}

export async function verifyRuntimeRole(sql: postgres.Sql) {
  const [role] = await sql`select current_user as name, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls,
    exists(select 1 from pg_auth_members where member = r.oid) as memberships
    from pg_roles r where rolname = current_user`;
  if (!role || role.name !== 'ideeo_runtime' || role.rolsuper || role.rolcreaterole || role.rolcreatedb
    || role.rolreplication || role.rolbypassrls || role.memberships) throw new Error('Unsafe storage runtime role');
  const versions = await sql`select version from ideeo.schema_version`;
  if (versions.length !== 1 || versions[0].version !== 2) throw new Error('Unsupported storage schema');
  const tables = await sql`select c.relname, c.relrowsecurity, c.relforcerowsecurity, r.rolname as owner,
      has_table_privilege(current_user, c.oid, 'TRUNCATE') as can_truncate,
      has_table_privilege(current_user, c.oid, 'DELETE,UPDATE,TRIGGER,REFERENCES') as can_mutate,
      (c.relname LIKE 'inference_%' AND has_table_privilege(current_user,c.oid,'INSERT')) as can_insert_ledger,
      has_schema_privilege(current_user, 'ideeo', 'CREATE') as can_create
    from pg_class c join pg_namespace n on c.relnamespace=n.oid join pg_roles r on c.relowner=r.oid
    where n.nspname='ideeo' and c.relname in ('conversations','turns','outbox','inference_operations','inference_attempts','inference_budget')`;
  if (tables.length !== 6 || tables.some(t => !t.relrowsecurity || !t.relforcerowsecurity
    || t.owner !== 'ideeo_owner' || t.can_truncate || t.can_mutate || t.can_insert_ledger || t.can_create)) throw new Error('Unsafe storage isolation');
  const columns = await sql`select c.relname, a.attname from pg_attribute a join pg_class c on a.attrelid=c.oid
    join pg_namespace n on c.relnamespace=n.oid where n.nspname='ideeo' and c.relname in ('conversations','turns','outbox','inference_operations','inference_attempts','inference_budget')
    and a.attnum>0 and not a.attisdropped and has_column_privilege(current_user,c.oid,a.attname,'UPDATE')`;
  if (columns.length !== 1 || columns[0].relname !== 'conversations' || columns[0].attname !== 'next_sequence') throw new Error('Unsafe storage update grants');
  const [maintenance] = await sql`select has_function_privilege(current_user,'ideeo.purge_expired()','EXECUTE') as allowed`;
  if (maintenance.allowed) throw new Error('Unsafe storage maintenance grant');
}
