import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [flag, path, ...extra] = process.argv.slice(2);
if (flag !== '--api-root' || !path || extra.length) throw new Error('Provide --api-root <isolated-payme-api-checkout>');
const apiRoot = resolve(path);
const child = spawn(process.execPath, ['--import', pathToFileURL(resolve(apiRoot, 'node_modules/tsx/dist/loader.mjs')).href,
  fileURLToPath(new URL('./payme-storage-worker.ts', import.meta.url)), apiRoot], {
  cwd: apiRoot, windowsHide: true, stdio: 'inherit', env: { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR,
    PATH: process.env.PATH, TEMP: process.env.TEMP, TMP: process.env.TMP, IDEEO_TEST_PG_BIN: process.env.IDEEO_TEST_PG_BIN },
});
child.once('error', () => { process.exitCode = 1; });
child.once('exit', code => { process.exitCode = code ?? 1; });
process.once('SIGINT', () => child.kill('SIGINT'));
process.once('SIGTERM', () => child.kill('SIGTERM'));
