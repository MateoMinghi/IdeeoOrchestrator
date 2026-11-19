import { createServer } from 'node:http';
import { createAdmission } from '../ideeo/admission.ts';
import { parseIdeeoConfiguration } from '../ideeo/config.ts';
import { createIdeeoSessionRoutes } from '../routes/ideeo-session.ts';

export async function createIdeeoHost(rawConfiguration: unknown, secrets: Readonly<Record<string, string | undefined>>) {
  const config = parseIdeeoConfiguration(rawConfiguration);
  const admission = await createAdmission(config, secrets);
  const route = createIdeeoSessionRoutes(admission);
  const server = createServer({ maxHeaderSize: 16384, headersTimeout: 5000, requestTimeout: 10000 }, (req, res) => {
    void route(req, res).catch(() => res.destroy());
  });
  server.maxRequestsPerSocket = 100;
  server.on('checkContinue', (_req, res) => { res.writeHead(417); res.end(); });
  server.on('upgrade', (_req, socket) => socket.destroy());
  return { server, listen: config.listen };
}
