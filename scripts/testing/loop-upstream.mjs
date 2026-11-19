import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await mkdtemp(join(tmpdir(), 'ideeo-loop-regression-'));
const repository = fileURLToPath(new URL('../../', import.meta.url));
async function cleanup() {
  const target = await realpath(root);
  if (dirname(target) !== await realpath(tmpdir()) || !basename(target).startsWith('ideeo-loop-regression-')) throw Error('Invalid cleanup target');
  await rm(target, { recursive: true, force: true });
}
try {
  const home = join(root, 'home');
  await mkdir(home);
  const child = spawn(process.execPath, [resolve(repository, 'node_modules/vitest/vitest.mjs'), 'run', ...process.argv.slice(2),
    '--config', fileURLToPath(new URL('./loop-vitest.config.mjs', import.meta.url)), '--reporter=dot'], {
    cwd: repository, windowsHide: true, stdio: 'inherit',
    env: { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR, PATH: process.env.PATH,
      TEMP: root, TMP: root, HOME: home, USERPROFILE: home, APPDATA: home, LOCALAPPDATA: home,
      OMB_DISABLE_MODEL_MANIFEST_FETCH: '1', OMB_DISABLE_ANNOUNCEMENTS: '1' },
  });
  process.exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', code => resolve(code ?? 1));
  });
} finally {
  await cleanup();
}
