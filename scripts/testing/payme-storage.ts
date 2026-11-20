import { spawn } from 'node:child_process';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args=process.argv.slice(2), loop=args.includes('--loop');
if(loop) args.splice(args.indexOf('--loop'),1);
const freeForm=args.includes('--free-form'), ui=args.includes('--ui');
if(freeForm) args.splice(args.indexOf('--free-form'),1);
if(ui) args.splice(args.indexOf('--ui'),1);
if(ui && !freeForm) throw new Error('UI verification requires --free-form');
const live=args.includes('--openai-evaluation');
if(live) args.splice(args.indexOf('--openai-evaluation'),1);
const keyIndex=args.indexOf('--key-file');
const keyFile=keyIndex>=0 ? args.splice(keyIndex,2)[1] : undefined;
if(live !== !!keyFile) throw new Error('OpenAI evaluation requires explicit --key-file');
const [flag, path, ...extra] = args;
if (flag !== '--api-root' || !path || extra.length) throw new Error('Provide --api-root <isolated-payme-api-checkout>');
const apiRoot = resolve(path);
const repository=fileURLToPath(new URL('../../',import.meta.url));
const env={SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR,PATH:process.env.PATH,
  TEMP:process.env.TEMP,TMP:process.env.TMP,IDEEO_TEST_PG_BIN:process.env.IDEEO_TEST_PG_BIN};
async function run(args:string[],cwd:string):Promise<number>{
  const child=spawn(process.execPath,args,{cwd,env,windowsHide:true,stdio:'inherit'});
  const interrupt=()=>child.kill('SIGINT');
  process.once('SIGINT',interrupt);
  try {
    return await new Promise<number>((done,fail)=>{
      child.once('error',fail);
      child.once('exit',(code,signal)=>{
        if(code!==0) console.error(JSON.stringify({fixture:'payme-storage',exitCode:code,signal}));
        done(code??1);
      });
    });
  } finally {process.off('SIGINT',interrupt);}
}

const bundle=ui ? await mkdtemp(join(tmpdir(),'ideeo-ui-bundle-')) : undefined;
async function removeBundle(path:string){
  const target=await realpath(path);
  if(dirname(target)!==await realpath(tmpdir()) || !basename(target).startsWith('ideeo-ui-bundle-')) throw new Error('Unexpected fixture bundle');
  await rm(target,{recursive:true,force:true});
}
try {
  if(bundle){
    const vite=fileURLToPath(new URL('bin/vite.js',import.meta.resolve('vite/package.json')));
    const result=await run([vite,'build','--config','vite.ideeo.config.ts','--outDir',bundle],repository);
    if(result!==0)throw new Error('Could not build the fixture UI');
  }
  process.exitCode=await run(['--import',pathToFileURL(resolve(apiRoot,'node_modules/tsx/dist/loader.mjs')).href,
    fileURLToPath(new URL('./payme-storage-worker.ts',import.meta.url)),apiRoot,...(loop?['--loop']:[]),
    ...(freeForm?['--free-form']:[]),...(bundle?['--ui',bundle]:[]),...(live?['--openai-evaluation',resolve(keyFile!)]:[])],apiRoot);
} finally {
  if(bundle)await removeBundle(bundle);
}
