import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { createAdmission } from '../ideeo/admission.ts';
import { AdmissionError } from '../ideeo/authority-client.ts';
import { InvalidTenantSession } from '../ideeo/identity.ts';
import type { IdeeoSessionReply } from '../../shared/ideeo/admission.ts';

export function createIdeeoSessionRoutes(admission: Awaited<ReturnType<typeof createAdmission>>) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const requestId = randomUUID();
    const send = (status: number, value: unknown) => {
      if (res.destroyed) return;
      res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store',
        'x-content-type-options': 'nosniff', 'x-request-id': requestId,
        ...(status === 401 ? { 'www-authenticate': 'Bearer realm="ideeo"' } : {}) });
      res.end(JSON.stringify(value));
    };
    const error = (status: number, code: string) => send(status, { error: { code }, request_id: requestId });
    if (req.method === 'GET' && req.url === '/health/live') { send(200, { status: 'ok' }); return; }
    if (req.url !== '/v2/session') { error(404, 'not_found'); return; }
    if (req.method !== 'GET') { res.setHeader('allow', 'GET'); error(405, 'method_not_allowed'); return; }
    if (req.headers['transfer-encoding'] || Number(req.headers['content-length'] ?? 0) !== 0) { error(400, 'invalid_request'); return; }
    if (req.headersDistinct.authorization?.length !== 1) { error(401, 'invalid_session'); return; }
    const controller = new AbortController();
    const abort = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', abort);
    try {
      const { principal } = await admission.admit(req.headers.authorization, controller.signal);
      const reply: IdeeoSessionReply = { api_version: '2', request_id: requestId, status: 'admitted',
        tenant_id: principal.tenantId, client_id: principal.clientId, channel: principal.channel,
        banking_presentation: principal.channel === 'sdk' ? 'host' : 'protected_link' };
      send(200, reply);
    } catch (cause) {
      if (cause instanceof InvalidTenantSession || cause instanceof AdmissionError) error(cause.status, cause.code);
      else error(503, 'service_unavailable');
    } finally { res.off('close', abort); }
  };
}
