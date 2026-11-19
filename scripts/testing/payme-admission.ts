import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--api-root') throw new Error('Provide --api-root <isolated-payme-api-checkout>');
const apiRoot = resolve(args[1]!);
const productRoot = fileURLToPath(new URL('../../', import.meta.url));
const child = spawn(process.execPath, ['--import', pathToFileURL(resolve(apiRoot, 'node_modules/tsx/dist/loader.mjs')).href,
  resolve(apiRoot, 'scripts/ideeo-admission-integration.ts'), productRoot], {
  cwd: apiRoot, windowsHide: true, stdio: 'inherit',
  env: { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR, TEMP: process.env.TEMP, TMP: process.env.TMP },
});
child.once('error', () => { process.exitCode = 1; });
child.once('exit', code => { process.exitCode = code ?? 1; });
process.once('SIGINT', () => child.kill('SIGINT'));
process.once('SIGTERM', () => child.kill('SIGTERM'));
