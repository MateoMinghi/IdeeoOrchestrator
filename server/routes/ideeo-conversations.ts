import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { CONVERSATION_VERSION } from '../../shared/ideeo/conversations.ts';
import type { createConversationService } from '../ideeo/conversations.ts';
import { ConversationError } from '../ideeo/storage/conversations.ts';
import { AdmissionError } from '../ideeo/authority-client.ts';
import { InvalidTenantSession } from '../ideeo/identity.ts';

const invalid = () => new ConversationError(422, 'invalid_request');
async function json(req: IncomingMessage): Promise<Record<string, unknown>> {
  if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json' || Number(req.headers['content-length'] ?? 0) > 4096) throw invalid();
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 4096) throw invalid();
    chunks.push(chunk);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid();
    return value as Record<string, unknown>;
  } catch { throw invalid(); }
}
export function createIdeeoConversationRoutes(service: ReturnType<typeof createConversationService>) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
    if (!req.url?.startsWith('/v2/conversations')) return false;
    const requestId = randomUUID();
    const send = (status: number, body: unknown) => {
      if (res.destroyed) return;
      res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff',
        'x-request-id': requestId, ...(status === 401 ? { 'www-authenticate': 'Bearer realm="ideeo"' } : {}),
        ...(status === 409 ? { 'retry-after': '1' } : {}) });
      res.end(JSON.stringify(body));
    };
    const controller = new AbortController();
    const abort = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', abort);
    const timer = setTimeout(() => { controller.abort(); send(503, { error: { code: 'storage_unavailable' }, request_id: requestId }); }, 20000);
    try {
      if (req.headersDistinct.authorization?.length !== 1 || !req.headers.authorization) throw new InvalidTenantSession();
      const url = new URL(req.url, 'http://127.0.0.1');
      const create = url.pathname === '/v2/conversations';
      const match = /^\/v2\/conversations\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\/turns$/.exec(url.pathname);
      if (!create && !match) throw new ConversationError(404, 'not_found');
      if (req.method !== 'POST' && !(req.method === 'GET' && match)) throw new ConversationError(405, 'method_not_allowed');
      let result: unknown;
      if (req.method === 'POST') {
        if (url.search || req.headersDistinct['idempotency-key']?.length !== 1) throw invalid();
        const key = req.headers['idempotency-key'];
        if (typeof key !== 'string' || !/^[A-Za-z0-9._:-]{1,100}$/.test(key)) throw invalid();
        const body = await json(req);
        if (create) {
          if (Object.keys(body).length) throw invalid();
          result = await service.create(req.headers.authorization, key, controller.signal);
        } else {
          if (Object.keys(body).join(',') !== 'message') throw invalid();
          if (body.message !== 'synthetic.hello' && body.message !== 'synthetic.follow-up') throw new ConversationError(422, 'synthetic_input_required');
          result = await service.append(req.headers.authorization, match![1], key, body.message, controller.signal);
        }
      } else {
        if (req.headers['transfer-encoding'] || Number(req.headers['content-length'] ?? 0) !== 0) throw invalid();
        if ([...url.searchParams.keys()].some(k => !['after', 'limit'].includes(k)) || url.searchParams.getAll('after').length > 1 || url.searchParams.getAll('limit').length > 1) throw invalid();
        const after = url.searchParams.get('after') ?? '0', limit = url.searchParams.get('limit') ?? '25';
        if (!/^(0|[1-9][0-9]{0,3})$/.test(after) || !/^[1-9][0-9]?$/.test(limit) || Number(limit) > 50) throw invalid();
        result = await service.history(req.headers.authorization, match![1], Number(after), Number(limit), controller.signal);
      }
      controller.signal.throwIfAborted();
      send(200, { api_version: CONVERSATION_VERSION, request_id: requestId, ...result as object });
    } catch (error) {
      if (!res.writableEnded) {
        const known = error instanceof ConversationError || error instanceof InvalidTenantSession || error instanceof AdmissionError;
        send(known ? error.status : 503, { error: { code: known ? error.code : 'storage_unavailable' }, request_id: requestId });
      }
    } finally { clearTimeout(timer); res.off('close', abort); }
    return true;
  };
}
