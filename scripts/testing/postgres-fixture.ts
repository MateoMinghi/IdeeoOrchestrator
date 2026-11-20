import { spawn, execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { promisify } from 'node:util';
import postgres from 'postgres';
import { migrateConversationStorage } from '../../server/ideeo/storage/migrate.ts';

const run = promisify(execFile);
export async function launchPostgresFixture(options: { beforeUpgrade?: (sql: postgres.TransactionSql) => Promise<void> } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'ideeo-postgres-'));
  const data = join(root, 'data');
  const bin = process.env.IDEEO_TEST_PG_BIN ?? (process.platform === 'win32' ? 'C:/Program Files/PostgreSQL/18/bin' : '/usr/lib/postgresql/18/bin');
  const binary = (name: string) => join(bin, name + (process.platform === 'win32' ? '.exe' : ''));
  const password = randomBytes(32).toString('hex');
  const runtimePassword = randomBytes(32).toString('hex'), maintenancePassword = randomBytes(32).toString('hex');
  const env: NodeJS.ProcessEnv = { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR,
    PATH: process.env.PATH, TEMP: root, TMP: root, HOME: root, USERPROFILE: root, LC_ALL: 'C', TZ: 'UTC' };
  let child: ReturnType<typeof spawn> | undefined;
  let admin: postgres.Sql | undefined;
  let logs = '';
  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    await admin?.end({ timeout: 2 });
    if (child && child.exitCode === null && child.signalCode === null) {
      const owned = child;
      const exited = new Promise<void>(resolve => owned.once('exit', () => resolve()));
      const pid = (await readFile(join(data, 'postmaster.pid'), 'utf8')).split(/\r?\n/)[0];
      if (pid !== String(child.pid)) throw new Error('PostgreSQL fixture ownership mismatch');
      await run(binary('pg_ctl'), ['-D', data, '-m', 'fast', '-w', '-t', '15', 'stop'], { env, windowsHide: true, timeout: 20000 });
      await exited;
    }
    const resolved = await realpath(root);
    if (dirname(resolved) !== await realpath(tmpdir()) || !basename(resolved).startsWith('ideeo-postgres-')) throw new Error('Unexpected PostgreSQL cleanup target');
    await rm(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
    stopped = true;
  };
  try {
    const pwFile = join(root, 'bootstrap-password');
    await writeFile(pwFile, password + '\n', { mode: 0o600 });
    await run(binary('initdb'), ['-D', data, '-U', 'fixture_admin', `--pwfile=${pwFile}`, '--auth=scram-sha-256', '--encoding=UTF8', '--locale=C'], { env, windowsHide: true, timeout: 90000 });
    await rm(pwFile);
    const listener = createServer();
    await new Promise<void>(resolve => listener.listen(0, '127.0.0.1', resolve));
    const address = listener.address();
    if (!address || typeof address === 'string') throw new Error('Fixture port unavailable');
    const port = address.port;
    await new Promise<void>(resolve => listener.close(() => resolve()));
    child = spawn(binary('postgres'), ['-D', data, '-h', '127.0.0.1', '-p', String(port),
      '-c', 'log_statement=none', '-c', 'log_min_error_statement=panic', '-c', 'log_parameter_max_length=0',
      '-c', 'log_parameter_max_length_on_error=0', '-c', 'jit=off', '-c', 'max_connections=30'], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout!.on('data', chunk => { logs += chunk.toString(); });
    child.stderr!.on('data', chunk => { logs += chunk.toString(); });
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => { clearInterval(poll); reject(new Error('PostgreSQL fixture startup timed out')); }, 15000);
      const poll = setInterval(() => {
        if (logs.includes('ready to accept connections')) { clearInterval(poll); clearTimeout(timeout); resolve(); }
      }, 25);
      child!.once('error', () => { clearTimeout(timeout); clearInterval(poll); reject(new Error('PostgreSQL fixture startup failed')); });
      child!.once('exit', () => { clearTimeout(timeout); clearInterval(poll); reject(new Error('PostgreSQL fixture exited')); });
    });
    const pid = (await readFile(join(data, 'postmaster.pid'), 'utf8')).split(/\r?\n/)[0];
    if (pid !== String(child.pid)) throw new Error('PostgreSQL fixture ownership mismatch');
    const database = `ideeo_fixture_${randomBytes(12).toString('hex')}`;
    const url = (user: string, pass: string, name = database) => `postgres://${user}:${pass}@127.0.0.1:${port}/${name}`;
    const bootstrap = postgres(url('fixture_admin', password, 'postgres'), { max: 1, onnotice: () => {} });
    try { await bootstrap.unsafe(`CREATE DATABASE ${database}`); } finally { await bootstrap.end(); }
    const adminUrl = url('fixture_admin', password);
    if (options.beforeUpgrade) {
      const initial = postgres(adminUrl, { max: 1, onnotice: () => {} });
      try {
        await initial.begin(async tx => {
          await tx.unsafe(await readFile(new URL('../../migrations/ideeo/001_conversations.sql', import.meta.url), 'utf8'));
          await options.beforeUpgrade!(tx);
        });
      } finally { await initial.end(); }
    }
    await migrateConversationStorage(adminUrl);
    await migrateConversationStorage(adminUrl);
    admin = postgres(adminUrl, { max: 2, onnotice: () => {} });
    await admin.unsafe(`ALTER ROLE ideeo_runtime LOGIN PASSWORD '${runtimePassword}'`);
    await admin.unsafe(`ALTER ROLE ideeo_maintenance LOGIN PASSWORD '${maintenancePassword}'`);
    await admin.unsafe(`REVOKE ALL ON DATABASE ${database} FROM PUBLIC`);
    await admin.unsafe(`GRANT CONNECT ON DATABASE ${database} TO ideeo_runtime, ideeo_maintenance`);
    return { root, data, admin, adminUrl, runtimeUrl: url('ideeo_runtime', runtimePassword), maintenanceUrl: url('ideeo_maintenance', maintenancePassword),
      stop, diagnostics: () => logs, version: (await run(binary('postgres'), ['--version'], { env, windowsHide: true })).stdout.trim() };
  } catch (error) {
    try { await stop(); } catch (cleanupError) { throw new AggregateError([error,cleanupError],'PostgreSQL fixture setup and cleanup failed'); }
    throw error;
  }
}
