import { CAPABILITY_FAMILIES, type CapabilityFamily } from '../../shared/ideeo/capabilities.ts';
import type { CallerScope } from './storage/crypto.ts';
import { compileToolSchema } from '../mcp-schema-validator.ts';

/** Trusted development configuration binds a pinned tool contract to one complete caller and isolated executor. */
export type CapabilityConfiguration = Readonly<{
  scope: CallerScope; url: string; credentialEnv: string;
  tools: readonly Readonly<{ name: string; family: CapabilityFamily; description: string; inputSchema: Record<string,unknown>; permission: string }>[];
}>;
const fields = (value: unknown, expected: string[]): Record<string,unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join(',') !== expected.sort().join(',')) throw new Error('Invalid capability configuration');
  return value as Record<string,unknown>;
};
export function capabilityScopeKey(scope: CallerScope): string {
  return JSON.stringify([scope.tenant_id,scope.membership_id,scope.client_id,scope.agent_account_id,scope.grant_id,scope.channel,scope.channel_binding_id]);
}
export function parseCapabilityConfiguration(raw: unknown, tenants: readonly string[]): readonly CapabilityConfiguration[] {
  if (!Array.isArray(raw) || raw.length>64) throw new Error('Invalid capability routes');
  const names=new Set<string>();
  return raw.map(value=>{
    const route=fields(value,['scope','url','credentialEnv','tools']);
    const scope=fields(route.scope,['tenant_id','membership_id','client_id','agent_account_id','grant_id','channel','channel_binding_id']);
    for(const [name,item] of Object.entries(scope)) if(typeof item!=='string' || item.length>200 || /[\p{Cc}\p{Cf}]/u.test(item) || name!=='channel_binding_id'&&!item) throw new Error('Invalid capability owner');
    if(!tenants.includes(String(scope.tenant_id)) || !['sdk','whatsapp'].includes(String(scope.channel)) || (scope.channel==='sdk') !== (scope.channel_binding_id==='')) throw new Error('Invalid capability owner');
    if(typeof route.url!=='string' || typeof route.credentialEnv!=='string' || !/^[A-Z][A-Z0-9_]{0,99}$/.test(route.credentialEnv)) throw new Error('Invalid capability endpoint');
    const url=new URL(route.url);
    if(url.protocol!=='http:' || url.hostname!=='127.0.0.1' || !url.port || url.pathname!=='/v1/ideeo/tools/call' || url.search || url.hash || url.username || url.password) throw new Error('Only isolated development capability executors are qualified');
    if(!Array.isArray(route.tools)||!route.tools.length||route.tools.length>256) throw new Error('Invalid capability tools');
    const tools=route.tools.map(value=>{
      const tool=fields(value,['name','family','description','inputSchema','permission']);
      if(typeof tool.name!=='string'||!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(tool.name)||['search_tools','describe_tool','call_tool','fixture_catalog'].includes(tool.name)
        || !CAPABILITY_FAMILIES.includes(tool.family as CapabilityFamily) || typeof tool.description!=='string'||!tool.description.trim()||tool.description.length>1000
        || typeof tool.permission!=='string'||!/^tool:[a-z][a-z0-9_-]{0,63}:[a-z][a-z0-9_-]{0,63}$/.test(tool.permission)) throw new Error('Invalid capability tool');
      if(!tool.inputSchema||typeof tool.inputSchema!=='object'||Array.isArray(tool.inputSchema)||JSON.stringify(tool.inputSchema).length>12000) throw new Error('Invalid capability schema');
      compileToolSchema(tool.inputSchema as Record<string,unknown>);
      const key=capabilityScopeKey(scope as CallerScope)+':'+tool.name;
      if(names.has(key)) throw new Error('Duplicate capability tool');
      names.add(key);
      return Object.freeze(tool as CapabilityConfiguration['tools'][number]);
    });
    return Object.freeze({scope:Object.freeze(scope as CallerScope),url:url.href,credentialEnv:route.credentialEnv,tools:Object.freeze(tools)});
  });
}
