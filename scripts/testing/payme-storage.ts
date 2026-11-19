import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args=process.argv.slice(2), loop=args.includes('--loop');
if(loop) args.splice(args.indexOf('--loop'),1);
const freeForm=args.includes('--free-form'), ui=args.includes('--ui');
if(freeForm) args.splice(args.indexOf('--free-form'),1);
if(ui) args.splice(args.indexOf('--ui'),1);
if(ui && !freeForm) throw new Error('UI verification requires --free-form');
const live=args.includes('--openai-evaluation');
if(live) args.splice(args.indexOf('--openai-evaluation'),1);
if(live && ui) throw new Error('Live evaluation uses the bounded semantic campaign, not the scripted UI harness');
const keyIndex=args.indexOf('--key-file');
const keyFile=keyIndex>=0 ? args.splice(keyIndex,2)[1] : undefined;
if(live !== !!keyFile) throw new Error('OpenAI evaluation requires explicit --key-file');
const [flag, path, ...extra] = args;
if (flag !== '--api-root' || !path || extra.length) throw new Error('Provide --api-root <isolated-payme-api-checkout>');
const apiRoot = resolve(path);
const child = spawn(process.execPath, ['--import', pathToFileURL(resolve(apiRoot, 'node_modules/tsx/dist/loader.mjs')).href,
  fileURLToPath(new URL('./payme-storage-worker.ts', import.meta.url)), apiRoot,...(loop?['--loop']:[]),...(freeForm?['--free-form']:[]),...(ui?['--ui']:[]),...(live?['--openai-evaluation',resolve(keyFile!)]:[])], {
  cwd: apiRoot, windowsHide: true, stdio: 'inherit', env: { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR,
    PATH: process.env.PATH, TEMP: process.env.TEMP, TMP: process.env.TMP, IDEEO_TEST_PG_BIN: process.env.IDEEO_TEST_PG_BIN },
});
child.once('error', () => { process.exitCode = 1; });
child.once('exit', code => { process.exitCode = code ?? 1; });
process.once('SIGINT', () => child.kill('SIGINT'));
process.once('SIGTERM', () => child.kill('SIGTERM'));
