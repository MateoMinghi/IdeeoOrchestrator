import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';

const run=promisify(execFile), root=await mkdtemp(join(tmpdir(),'ideeo-disclosure-mutation-'));
async function cleanup() {
  const target=await realpath(root);
  assert.equal(dirname(target),await realpath(tmpdir()));assert.ok(basename(target).startsWith('ideeo-disclosure-mutation-'));
  await rm(target,{recursive:true,force:true});
}
try {
  for(const path of ['server','shared','packages/phone-protocol/src','scripts/testing','migrations','package.json'])await cp(path,join(root,path),{recursive:true});
  await symlink(resolve('node_modules'),join(root,'node_modules'),process.platform==='win32'?'junction':'dir');
  const path=join(root,'server/ideeo/model-transport.ts'), original=await readFile(path,'utf8');
  const args=['--experimental-strip-types','--test','server/ideeo/free-form.node-test.ts'];
  await run(process.execPath,args,{cwd:root,windowsHide:true,timeout:180000});
  const altered=original.replaceAll("if (freeForm) await context.authorize('disclosure');",'');
  assert.notEqual(altered,original);await writeFile(path,altered);
  let detected=false;
  try{await run(process.execPath,args,{cwd:root,windowsHide:true,timeout:180000});}
  catch(error){assert.equal(error.code,1);assert.match(error.stdout,/disclosure is distinct current authority/);assert.match(error.stdout,/200 !== 403/);detected=true;}
  assert.equal(detected,true);await writeFile(path,original);
  await run(process.execPath,args,{cwd:root,windowsHide:true,timeout:180000});
  assert.equal(await readFile('server/ideeo/model-transport.ts','utf8'),original);
  console.log('Baseline passed; removed disclosure checks detected; restored copy passed. Original unchanged.');
} finally {await cleanup();}
