import { request } from 'node:http';

/** Node fetch applies browser blocked-port rules even to OS-assigned loopback fixture ports. */
export function fixtureFetch(address: string, options: { method?: string; headers?: Record<string, string>; body?: string; timeoutMs?: number; signal?:AbortSignal } = {}): Promise<Response> {
  const url = new URL(address);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.username || url.password) throw new Error('Expected isolated loopback fixture');
  return new Promise((resolve, reject) => {
    const req = request(url, { method: options.method ?? 'GET', headers: options.headers, agent: false, signal: options.signal ?? AbortSignal.timeout(options.timeoutMs ?? 10000) }, res => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('error', reject);
      res.on('end', () => {
        const headers = new Headers();
        for (const [key, value] of Object.entries(res.headers)) if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        const status = res.statusCode ?? 500;
        resolve(new Response(status === 204 || status === 304 ? null : Buffer.concat(chunks), { status, headers }));
      });
    });
    req.on('error', reject);
    req.end(options.body);
  });
}
