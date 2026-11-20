import { rankSkills, type FitSkill } from '../../shared/skill-fit.ts';
import { fullInputSchema } from '../drivers/agents-catalog.ts';
import type { CapabilityConfiguration } from './capability-config.ts';
import type { CapabilityHandler } from './capability-executor.ts';

export function workspaceSkillTools(readCatalog:(signal:AbortSignal)=>Promise<readonly (FitSkill & {enabled:boolean})[]>) {
  const name='skills_list';
  const tools:CapabilityConfiguration['tools']=[{name,family:'skills',permission:'tool:skills:read',
    description:'List enabled workspace skills or search their descriptions by task.',
    inputSchema:fullInputSchema(name) as Record<string,unknown>}];
  const list:CapabilityHandler=async(args,{signal})=>{
    signal.throwIfAborted();
    const catalog=await readCatalog(signal);
    signal.throwIfAborted();
    const enabled=catalog.filter(skill=>skill.enabled===true);
    const query=typeof args.query==='string'?args.query.trim():'';
    const matches=query?rankSkills(enabled,query).slice(0,8):enabled;
    return JSON.stringify(matches.map(({name,description})=>({name,description})));
  };
  return {tools,handlers:new Map([[name,list]])};
}
