import { readFile } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { createIdeeoHost } from './host/ideeo.ts';

async function main() {
  const [flag, path, ...extra] = process.argv.slice(2);
  if (flag !== '--config' || !path || !isAbsolute(path) || extra.length) {
    throw new Error('An absolute --config path is required');
  }
  const bytes = await readFile(path);
  if (bytes.length > 1048576) throw new Error('Configuration is too large');
  const { server, listen } = await createIdeeoHost(JSON.parse(bytes.toString('utf8')), process.env);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(listen.port, listen.host, resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Listener unavailable');
  process.stdout.write(JSON.stringify({ event: 'listening', url: `http://127.0.0.1:${address.port}`, pid: process.pid }) + '\n');
  const stop = () => { server.close(); server.closeAllConnections(); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}

void main().catch(() => {
  process.stderr.write('Ideeo startup failed: invalid configuration or unavailable listener.\n');
  process.exitCode = 1;
});
