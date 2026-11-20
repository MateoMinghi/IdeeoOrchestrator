import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { CONVERSATION_VERSION } from '../../shared/ideeo/conversations.ts';
import type { createConversationService } from '../ideeo/conversations.ts';
import { ConversationError } from '../ideeo/storage/conversations.ts';
import { AdmissionError } from '../ideeo/authority-client.ts';
import { InvalidTenantSession } from '../ideeo/identity.ts';
import { fixturePrompts } from '../ideeo/inference-policy.ts';
import type { ConversationMessage } from '../../shared/ideeo/conversations.ts';
import { isFreeFormMessage } from '../ideeo/text-policy.ts';

const invalid = () => new ConversationError(422, 'invalid_request');
function requestKey(req: IncomingMessage): string {
  const key = req.headers['idempotency-key'];
  if (req.headersDistinct['idempotency-key']?.length !== 1 || typeof key !== 'string' || !/^[A-Za-z0-9._:-]{1,100}$/.test(key)) throw invalid();
  return key;
}
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
export function createIdeeoConversationRoutes(service: ReturnType<typeof createConversationService>, workspace = false) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
    if (!req.url?.startsWith('/v2/conversations')) return false;
    const requestId = randomUUID();
    const send = (status: number, body: unknown, requiresReconciliation = false) => {
      if (res.destroyed) return;
      res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff',
        'x-request-id': requestId, ...(status === 401 ? { 'www-authenticate': 'Bearer realm="ideeo"' } : {}),
        ...(status === 409 && !requiresReconciliation ? { 'retry-after': '1' } : {}) });
      res.end(JSON.stringify(body));
    };
    const controller = new AbortController();
    const abort = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', abort);
    const timer = setTimeout(() => { controller.abort(); send(503, { error: { code: 'storage_unavailable' }, request_id: requestId }); }, workspace ? 65000 : 20000);
    try {
      if (req.headersDistinct.authorization?.length !== 1 || !req.headers.authorization) throw new InvalidTenantSession();
      const url = new URL(req.url, 'http://127.0.0.1');
      const create = url.pathname === '/v2/conversations';
      const capabilities=url.pathname==='/v2/conversations/capabilities';
      const match = /^\/v2\/conversations\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\/turns(\/status|\/booking-check)?$/.exec(url.pathname);
      if (!create && !match && !capabilities) throw new ConversationError(404, 'not_found');
      const bookingCheck=match?.[2]==='/booking-check';
      if (bookingCheck ? req.method!=='POST' : capabilities || match?.[2] ? req.method!=='GET' : req.method !== 'POST' && !(req.method === 'GET' && match)) throw new ConversationError(405, 'method_not_allowed');
      let result: unknown;
      if (bookingCheck && match) {
        if(url.search) throw invalid();
        const body=await json(req);
        if(Object.keys(body).join(',')!=='attempt_id' || typeof body.attempt_id!=='string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(body.attempt_id)) throw invalid();
        result=await service.checkBooking(req.headers.authorization,match[1],body.attempt_id,controller.signal);
      } else if (match?.[2]) {
        if (url.search || req.headers['transfer-encoding'] || Number(req.headers['content-length'] ?? 0) !== 0) throw invalid();
        result = await service.turnStatus(req.headers.authorization, match[1], requestKey(req), controller.signal);
      } else if(capabilities){
        if(url.search||req.headers['transfer-encoding']||Number(req.headers['content-length']??0)!==0) throw invalid();
        result=await service.capabilities(req.headers.authorization,controller.signal);
      } else if (req.method === 'POST') {
        if (url.search) throw invalid();
        const key = requestKey(req);
        const body = await json(req);
        if (create) {
          if (Object.keys(body).length) throw invalid();
          result = await service.create(req.headers.authorization, key, controller.signal);
        } else {
          if (Object.keys(body).join(',') !== 'message') throw invalid();
          if (!(typeof body.message === 'string' && Object.hasOwn(fixturePrompts,body.message)) && !isFreeFormMessage(body.message)) throw new ConversationError(422, 'synthetic_input_required');
          result = await service.append(req.headers.authorization, match![1], key, body.message as ConversationMessage, controller.signal);
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
        const code = known ? error.code : 'storage_unavailable';
        send(known ? error.status : 503, { error: { code }, request_id: requestId }, code === 'capability_reconciliation_required');
      }
    } finally { clearTimeout(timer); res.off('close', abort); }
    return true;
  };
}
