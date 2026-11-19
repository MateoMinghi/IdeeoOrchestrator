import type { ChatToolSession } from '../drivers/chat-tool-session.ts';
import type { CapabilityConfiguration } from './capability-config.ts';
import type { CapabilityHandler } from './capability-executor.ts';
import { capabilityImages } from './capability-output.ts';

/** A workspace supplies its own OpenMaus session; no personal host configuration is discovered or imported here. */
export function openMausCapabilityHandlers(options: {
  session: ChatToolSession;
  bindings: readonly Readonly<{tool:CapabilityConfiguration['tools'][number];nativeName:string}>[];
  authorize(name:string,args:Record<string,unknown>,requiresApproval:boolean,signal:AbortSignal):Promise<void>;
}): ReadonlyMap<string,CapabilityHandler> {
  const definitions=new Map(options.session.definitions.map(tool=>[tool.function.name,tool.function]));
  const seen=new Set<string>();
  const handlers=new Map<string,CapabilityHandler>();
  for(const {tool,nativeName} of options.bindings){
    const native=definitions.get(nativeName);
    if(seen.has(tool.name)||!native||JSON.stringify(native.parameters)!==JSON.stringify(tool.inputSchema)) throw new Error('OpenMaus capability contract mismatch');
    seen.add(tool.name);
    handlers.set(tool.name,async(args,context)=>{
      const current=options.session.definitions.find(definition=>definition.function.name===nativeName)?.function;
      if(!current||JSON.stringify(current.parameters)!==JSON.stringify(tool.inputSchema)) throw new Error('OpenMaus capability contract changed');
      options.session.validate(nativeName,args);
      const view=options.session.view(nativeName,args);
      context.signal.throwIfAborted();await options.authorize(tool.name,args,view.ask,context.signal);context.signal.throwIfAborted();
      const result=await options.session.execute(nativeName,args,context.signal);
      context.signal.throwIfAborted();await options.authorize(tool.name,args,false,context.signal);context.signal.throwIfAborted();
      if(!result.ok) throw new Error('OpenMaus capability failed');
      const images=capabilityImages(result.images);
      return images.length?{text:result.text,images}:result.text;
    });
  }
  return handlers;
}
