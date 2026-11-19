import { request } from 'node:http';
import type { CapabilityConfiguration } from './capability-config.ts';
import type { InferenceContext } from './inference.ts';
import { ConversationError } from './storage/conversations.ts';
import { capabilityImages, type CapabilityOutput } from './capability-output.ts';

export async function executeCapability(route: CapabilityConfiguration, credential: string, context: InferenceContext,
  name: string, args: Record<string,unknown>, attempt: {id:string;deadline:Date}): Promise<CapabilityOutput> {
  if(!context.execution) throw new ConversationError(503,'capability_unavailable');
  const payload=JSON.stringify({version:'ideeo-tools-1',scope:context.execution.scope,conversation_id:context.execution.conversationId,
    attempt_id:attempt.id,deadline:new Date(Math.min(attempt.deadline.getTime(),Date.now()+8000)).toISOString(),name,arguments:args});
  if(Buffer.byteLength(payload)>16384) throw new ConversationError(422,'capability_input_invalid');
  const remaining=attempt.deadline.getTime()-Date.now();
  if(remaining<=0) throw new ConversationError(409,'inference_expired');
  const signal=AbortSignal.any([context.signal,AbortSignal.timeout(Math.min(8000,remaining))]);
  return await new Promise<CapabilityOutput>((resolve,reject)=>{
    const fail=()=>reject(new ConversationError(503,'capability_outcome_unknown'));
    const req=request(route.url,{method:'POST',agent:false,signal,headers:{authorization:`Bearer ${credential}`,'content-type':'application/json'}},res=>{
      const chunks:Buffer[]=[];let bytes=0;
      res.on('data',(chunk:Buffer)=>{bytes+=chunk.length;if(bytes>1500000){res.destroy();fail();}else chunks.push(chunk);});
      res.on('error',fail);
      res.on('end',()=>{
        try {
          if(res.statusCode!==200||res.headers['content-type']?.split(';')[0]!=='application/json') throw Error();
          const result=JSON.parse(Buffer.concat(chunks).toString('utf8'));
          if(!result||!['attempt_id,text,version','attempt_id,images,text,version'].includes(Object.keys(result).sort().join(','))||result.version!=='ideeo-tools-1'||result.attempt_id!==attempt.id||typeof result.text!=='string') throw Error();
          const images=capabilityImages(result.images);
          signal.throwIfAborted();resolve({text:result.text,...(images.length?{images}:{})});
        } catch {fail();}
      });
    });
    req.on('error',fail);req.end(payload);
  });
}
