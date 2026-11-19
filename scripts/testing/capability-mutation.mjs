import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';

const run = promisify(execFile);
const root = await mkdtemp(join(tmpdir(), 'ideeo-capability-mutation-'));
try {
  for (const path of ['server', 'shared', 'electron', 'packages/phone-protocol/src', 'scripts/testing', 'migrations', 'package.json']) {
    await cp(path, join(root, path), { recursive: true });
  }
  await symlink(resolve('node_modules'), join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  const path = join(root, 'server/ideeo/capabilities.ts');
  const original = await readFile(path, 'utf8');
  const args = ['--experimental-strip-types', '--test', 'server/ideeo/capabilities.node-test.ts'];
  const verify = () => run(process.execPath, args, { cwd: root, windowsHide: true, timeout: 180000 });
  await verify();
  console.log('Baseline passed.');
  for (const mutation of [
    { remove: 'capabilityScopeKey(entry.route.scope)===capabilityScopeKey(scope)&&', test: /availability follows full owner and current grant/ },
    { remove: 'await context.claimTools!();', test: /commit failure cannot repeat an external effect on retry/ },
  ]) {
    const altered = original.replace(mutation.remove, '');
    assert.notEqual(altered, original);
    await writeFile(path, altered);
    let detected = false;
    try { await verify(); }
    catch (error) {
      assert.equal(error.code, 1);
      assert.match(error.stdout, mutation.test);
      assert.match(error.stdout, /AssertionError/);
      detected = true;
    }
    assert.equal(detected, true);
    await writeFile(path, original);
    console.log('Control removal detected:', mutation.test.source);
  }
  await verify();
  assert.equal(await readFile('server/ideeo/capabilities.ts', 'utf8'), original);
  console.log('Restored copy passed; original source unchanged.');
  const budgetPath=join(root,'migrations/ideeo/004_workspace_budget.sql');
  const budgetOriginal=await readFile(budgetPath,'utf8');
  const verifyBudget=()=>run(process.execPath,['--experimental-strip-types','--test','server/ideeo/workspace-budget.node-test.ts'],{cwd:root,windowsHide:true,timeout:180000});
  await verifyBudget();
  const budgetAltered=budgetOriginal.replace('THEN 8 ELSE 7 END','THEN 9 ELSE 7 END');
  assert.notEqual(budgetAltered,budgetOriginal);await writeFile(budgetPath,budgetAltered);
  let budgetDetected=false;
  try{await verifyBudget();}
  catch(error){assert.equal(error.code,1);assert.match(error.stdout,/eight model attempts and seven tools survive connection restart/);assert.match(error.stdout,/AssertionError/);budgetDetected=true;}
  assert.equal(budgetDetected,true);await writeFile(budgetPath,budgetOriginal);await verifyBudget();
  assert.equal(await readFile('migrations/ideeo/004_workspace_budget.sql','utf8'),budgetOriginal);
  console.log('Workspace budget baseline passed; raised model ceiling detected; restored copy passed. Original unchanged.');
} finally {
  const target = await realpath(root);
  assert.equal(dirname(target), await realpath(tmpdir()));
  assert.ok(basename(target).startsWith('ideeo-capability-mutation-'));
  await rm(target, { recursive: true, force: true });
}
