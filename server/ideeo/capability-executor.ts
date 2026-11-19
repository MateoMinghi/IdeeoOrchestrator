import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { compileToolSchema } from '../mcp-schema-validator.ts';
import { capabilityScopeKey, type CapabilityConfiguration } from './capability-config.ts';
import { capabilityImages, type CapabilityOutput } from './capability-output.ts';

export type CapabilityHandler = (args: Record<string,unknown>, context: Readonly<{conversationId:string;attemptId:string;signal:AbortSignal}>) => Promise<string|CapabilityOutput>;
/** The workspace owns handlers and a durable claim implementation; customer/model input never selects a module or endpoint. */
export function createCapabilityExecutor(options: {
  scope: CapabilityConfiguration['scope']; credential: string;
  tools: CapabilityConfiguration['tools']; handlers: ReadonlyMap<string,CapabilityHandler>;
  claim(attemptId:string): Promise<boolean>;
}) {
  if(options.credential.length<20) throw new Error('Missing workspace credential');
  const validators=new Map(options.tools.map(tool=>[tool.name,compileToolSchema(tool.inputSchema)]));
  if(validators.size!==options.tools.length||validators.size!==options.handlers.size||[...validators.keys()].some(name=>!options.handlers.has(name))) throw new Error('Incomplete workspace handlers');
  return createServer({maxHeaderSize:8192,requestTimeout:10000,headersTimeout:5000},(req,res)=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>{controller.abort();res.destroy();},9000);
    res.once('close',()=>{clearTimeout(timer);controller.abort();});
    const respond=(status:number,body:unknown)=>{if(!res.destroyed){res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(body));}};
    void (async()=>{
      const received=Buffer.from(req.headers.authorization??'');const expected=Buffer.from(`Bearer ${options.credential}`);
      if(req.headersDistinct.authorization?.length!==1||received.length!==expected.length||!timingSafeEqual(received,expected)){respond(401,{});return;}
      if(req.url!=='/v1/ideeo/tools/call'||req.method!=='POST'){respond(404,{});return;}
      if(req.headers['content-type']?.split(';')[0]!=='application/json'||Number(req.headers['content-length']??0)>16384){respond(422,{});return;}
      const chunks:Buffer[]=[];let bytes=0;
      for await(const chunk of req){bytes+=chunk.length;if(bytes>16384){respond(422,{});return;}chunks.push(chunk);}
      const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
      if(!body||Object.keys(body).sort().join(',')!=='arguments,attempt_id,conversation_id,deadline,name,scope,version'||body.version!=='ideeo-tools-1'
        || !body.scope||Object.keys(body.scope).sort().join(',')!==Object.keys(options.scope).sort().join(',')||capabilityScopeKey(body.scope)!==capabilityScopeKey(options.scope)
        ||!uuid.test(body.conversation_id)||!uuid.test(body.attempt_id)||typeof body.deadline!=='string'||!Number.isFinite(Date.parse(body.deadline))
        ||Date.parse(body.deadline)<=Date.now()||Date.parse(body.deadline)>Date.now()+15000||!validators.get(body.name)?.(body.arguments)){respond(403,{});return;}
      const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(Math.max(1,Date.parse(body.deadline)-Date.now()))]);
      if(!await options.claim(body.attempt_id)){respond(409,{});return;}
      signal.throwIfAborted();
      const output=await options.handlers.get(body.name)!(body.arguments,{conversationId:body.conversation_id,attemptId:body.attempt_id,signal});
      const {text}=typeof output==='string'?{text:output}:output;
      const images=capabilityImages(typeof output==='string'?undefined:output.images);
      signal.throwIfAborted();
      if(typeof text!=='string'||Buffer.byteLength(text)>12000) throw Error();
      respond(200,{version:'ideeo-tools-1',attempt_id:body.attempt_id,text,...(images.length?{images}:{})});
    })().catch(()=>respond(503,{}));
  });
}
