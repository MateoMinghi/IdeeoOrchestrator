import { createServer } from 'node:http';
import { createAdmission } from '../ideeo/admission.ts';
import { parseIdeeoConfiguration } from '../ideeo/config.ts';
import { createIdeeoSessionRoutes } from '../routes/ideeo-session.ts';
import { createConversationService } from '../ideeo/conversations.ts';
import { createIdeeoConversationRoutes } from '../routes/ideeo-conversations.ts';
import { createConversationGenerator } from '../ideeo/conversation-loop.ts';
import { createCapabilities } from '../ideeo/capabilities.ts';

export async function createIdeeoHost(rawConfiguration: unknown, secrets: Readonly<Record<string, string | undefined>>) {
  const config = parseIdeeoConfiguration(rawConfiguration);
  const admission = await createAdmission(config, secrets);
  const route = createIdeeoSessionRoutes(admission);
  const capabilities=config.capabilities?createCapabilities(config.capabilities,secrets):undefined;
  const generator = config.inference ? createConversationGenerator(config.inference,secrets,capabilities) : undefined;
  const store = config.storage ? await (await import('../ideeo/storage/conversations.ts')).createConversationStore(config.storage, config.tenants.map(t => t.tenantId), secrets) : undefined;
  const conversations = store ? createIdeeoConversationRoutes(createConversationService(admission, store,generator,capabilities), Boolean(capabilities)) : undefined;
  const dispatch = async (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => {
    if (conversations && await conversations(req, res)) return;
    await route(req, res);
  };
  const server = createServer({ maxHeaderSize: 16384, headersTimeout: 5000, requestTimeout: 10000 }, (req, res) => {
    void dispatch(req, res).catch(() => res.destroy());
  });
  server.maxRequestsPerSocket = 100;
  server.on('checkContinue', (_req, res) => { res.writeHead(417); res.end(); });
  server.on('upgrade', (_req, socket) => socket.destroy());
  const closeStore = () => { void store?.close().catch(() => {}); };
  server.once('close', closeStore);
  server.once('error', closeStore);
  return { server, listen: config.listen };
}
