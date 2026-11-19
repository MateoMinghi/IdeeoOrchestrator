import { readFile, writeFile, mkdtemp, rm, realpath } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import assert from 'node:assert/strict';
const run = promisify(execFile);
const root = await mkdtemp(join(tmpdir(), 'ideeo-cipher-mutation-'));
try {
  const crypto = await readFile('server/ideeo/storage/crypto.ts', 'utf8');
  const tests = await readFile('server/ideeo/storage/conversations.node-test.ts', 'utf8');
  const declarations = tests.slice(tests.indexOf('const key ='), tests.indexOf('type Body ='));
  const selected = tests.slice(tests.indexOf("test('ciphertext"), tests.indexOf("test('actual product"));
  await writeFile(join(root, 'crypto.ts'), crypto);
  await writeFile(join(root, 'crypto.node-test.ts'), `import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import test from 'node:test';
import {createContentProtection} from './crypto.ts';
${declarations}
${selected}`);
  const args = ['--experimental-strip-types', '--test', join(root, 'crypto.node-test.ts')];
  await run(process.execPath, args);
  const altered = crypto.replace('binding.turnId, binding.sequence', "'unbound-turn', binding.sequence");
  assert.notEqual(altered, crypto);
  await writeFile(join(root, 'crypto.ts'), altered);
  let detected = false;
  try { await run(process.execPath, args); } catch (error) {
    assert.equal(error.code, 1);
    assert.match(error.stdout, /Missing expected exception/);
    detected = true;
  }
  assert.equal(detected, true);
  await writeFile(join(root, 'crypto.ts'), crypto);
  await run(process.execPath, args);
  assert.equal(await readFile('server/ideeo/storage/crypto.ts', 'utf8'), crypto);
  console.log('Unmodified ciphertext-binding check passed; omitted turn binding detected; restored copy passed. Original source unchanged.');
} finally {
  const target = await realpath(root);
  assert.equal(dirname(target), await realpath(tmpdir()));
  assert.ok(basename(target).startsWith('ideeo-cipher-mutation-'));
  await rm(target, { recursive: true, force: true });
}
