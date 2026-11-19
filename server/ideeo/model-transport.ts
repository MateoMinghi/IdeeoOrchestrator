import { Agent, request } from 'node:http';
import { Agent as HttpsAgent, request as httpsRequest } from 'node:https';
import type { InferenceConfiguration } from './inference-policy.ts';
import { fixtureAnswers, fixturePrompts, inferenceAnswerKind } from './inference-policy.ts';
import type { InferenceContext } from './inference.ts';
import { ConversationError } from './storage/conversations.ts';
import { freeFormSystem, isFreeFormMessage, permittedText, permittedCapabilityText, permittedProjection } from './text-policy.ts';
import type { ModelToolPolicy } from './capabilities.ts';

export const fixtureSystem = 'You are a synthetic Ideeo conversation fixture. Use only the supplied synthetic context and fixture_catalog tool. Do not request private data.';
export const evaluationSystem = fixtureSystem + ' This is a constrained live API evaluation. Final answers must be exactly one of these strings, without quotes or formatting: '
  + JSON.stringify([...fixtureAnswers]) + '. Match the current request: hello, invitation draft, shorter revision, recall of the last approved invitation, or color lookup. For color lookup call fixture_catalog with item color before answering. For recall use the conversation history. Never call a tool for other requests.';
export const fixtureTool = { type: 'function' as const, function: { name: 'fixture_catalog', description: 'Read a synthetic fixture color.',
  parameters: { type: 'object', properties: { item: { type: 'string', enum: ['color'] } }, required: ['item'], additionalProperties: false } } };
const invalid = () => new ConversationError(503,'model_unavailable');
function object(value: unknown): Record<string,unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid();
  return value as Record<string,unknown>;
}
function safeCompletion(raw: string, mode: InferenceConfiguration['mode'], freeForm: boolean, forbidden: readonly string[], policy?: ModelToolPolicy): { body: string; usage?: {input:number;output:number} } {
  const reply = object(JSON.parse(raw));
  if (!Array.isArray(reply.choices) || reply.choices.length !== 1) throw invalid();
  const choice = object(reply.choices[0]), message = object(choice.message);
  if (message.role !== 'assistant') throw invalid();
  const content=mode==='gemini-evaluation' && message.content===undefined && Array.isArray(message.tool_calls) && message.tool_calls.length>0 ? null : message.content;
  const screenedText=policy&&Array.isArray(message.tool_calls)&&message.tool_calls.length?permittedCapabilityText:permittedText;
  if (content !== null && content !== '' && (freeForm ? !screenedText(content,2000,forbidden) : typeof content !== 'string' || !fixtureAnswers.has(content))) throw invalid();
  if (freeForm && !['stop','tool_calls'].includes(String(choice.finish_reason))) throw invalid();
  if (message.tool_calls !== undefined && (!Array.isArray(message.tool_calls) || message.tool_calls.length > (policy?4:2))) throw invalid();
  const calls = message.tool_calls === undefined ? undefined : (message.tool_calls as unknown[]).map(value => {
    const call=object(value), f=object(call.function);
    const idPattern=mode==='gemini-evaluation'?/^[A-Za-z0-9_-]{1,128}$/:mode==='openai-evaluation'?/^call_[A-Za-z0-9_-]{1,128}$/:/^fixture-call-[0-9]{1,4}$/;
    if (typeof call.id !== 'string' || !idPattern.test(call.id) || forbidden.some(secret=>secret.length>=6 && String(call.id).includes(secret)) || call.type !== 'function'
      || typeof f.name !== 'string' || !/^[a-z_][a-z0-9_]{0,63}$/.test(f.name) || typeof f.arguments !== 'string' || f.arguments.length > (policy?8192:512)) throw invalid();
    if(policy)try{policy.validate(f.name,object(JSON.parse(f.arguments)));}catch{throw invalid();}
    return {id:call.id,type:'function',function:{name:f.name,arguments:f.arguments}};
  });
  if (freeForm && calls?.length && (!policy&&content || !policy&&calls.length !== 1 || !policy&&calls.some(call => call.function.name !== 'fixture_catalog'
    || JSON.stringify(object(JSON.parse(call.function.arguments))) !== JSON.stringify({item:'color'})))) throw invalid();
  const usage = reply.usage ? object(reply.usage) : undefined;
  const measured = usage && Number.isSafeInteger(usage.prompt_tokens) && Number(usage.prompt_tokens)>=0 && Number(usage.prompt_tokens)<=1000000
    && Number.isSafeInteger(usage.completion_tokens) && Number(usage.completion_tokens)>=0 && Number(usage.completion_tokens)<=1000000
    ? {input:Number(usage.prompt_tokens),output:Number(usage.completion_tokens)} : undefined;
  if(policy&&calls?.length) policy.calls.add(JSON.stringify({role:'assistant',content,...(calls?{tool_calls:calls}:{})}));
  return {body:JSON.stringify({choices:[{message:{role:'assistant',content,...(calls ? {tool_calls:calls} : {})},finish_reason:choice.finish_reason}],
    ...(measured ? {usage:{prompt_tokens:measured.input,completion_tokens:measured.output}} : {})}),usage:measured};
}
export function controlledModelTransport(config: InferenceConfiguration, credential: string, context: InferenceContext, policy?: ModelToolPolicy) {
  const evaluation=config.mode!=='synthetic';
  const freeForm=config.textMode==='free-form';
  const users = new Set<string>(), assistants = new Set<string>();
  if (freeForm) {
    if (!isFreeFormMessage(context.message)) throw invalid();
    users.add(context.message.text);
    for (const turn of context.history) if (turn.answer.kind === inferenceAnswerKind(config)) {
      if (!permittedProjection(turn.projection)) throw invalid();
      users.add(turn.projection.user); assistants.add(turn.projection.assistant);
    }
  }
  const allowed = new Set([evaluation ? evaluationSystem : fixtureSystem,...Object.values(fixturePrompts),...fixtureAnswers,JSON.stringify({ok:true,result:JSON.stringify({color:'blue'})})]);
  const imageMessage=(value:unknown)=>{
    if(!policy||!Array.isArray(value)||value.length<2||value.length>3) return false;
    const [caption,...images]=value;
    const captions=new Set([...policy.calls].flatMap(call=>(JSON.parse(call).tool_calls as {id:string}[]).map(call=>JSON.stringify({type:'text',text:`Screenshot result from tool call ${call.id}:`}))));
    return captions.has(JSON.stringify(caption))&&images.every(image=>policy.images.has(JSON.stringify(image)));
  };
  return async (url: string, init: RequestInit): Promise<Response> => {
    const requestLimit=policy?4000000:16384;
    if (url !== config.url+'/chat/completions' || init.method !== 'POST' || typeof init.body !== 'string' || Buffer.byteLength(init.body)>requestLimit) throw invalid();
    const body=object(JSON.parse(init.body));
    if (body.model !== config.model || body.stream !== true || body.max_tokens !== 256 || !Array.isArray(body.messages)
      || body.messages.length>45 || JSON.stringify(body.tools??[])!==JSON.stringify(policy?.definitions??[fixtureTool])) throw invalid();
    for (const [index,value] of body.messages.entries()) {
      const message=object(value);
      const content = message.content;
      const admitted = freeForm ? message.role === 'system' ? index === 0 && content === (policy?.system??freeFormSystem)
        : message.role === 'user' ? imageMessage(content)||users.has(String(content)) && permittedText(content,1500,context.forbidden)
        : message.role === 'assistant' ? Array.isArray(message.tool_calls) && (policy?policy.calls.has(JSON.stringify(message)):content===null) || assistants.has(String(content)) && permittedText(content,2000,context.forbidden)
        : message.role === 'tool' && (policy?policy.results.has(String(content)):content === JSON.stringify({ok:true,result:JSON.stringify({color:'blue'})}))
        : content === null || allowed.has(String(content));
      if (!['system','user','assistant','tool'].includes(String(message.role)) || !admitted
        || Object.keys(message).some(key => !['role','content','tool_calls','tool_call_id'].includes(key))
        || ['reasoning','reasoning_content','reasoning_details'].some(field => Object.hasOwn(message,field))) throw invalid();
    }
    const payload=evaluation ? JSON.stringify({model:config.model,messages:body.messages,tools:body.tools,
      stream:false,...(config.mode==='openai-evaluation'?{store:false,max_completion_tokens:256,parallel_tool_calls:false}:{max_tokens:256,tool_choice:'auto'}),reasoning_effort:'none'}) : init.body;
    if (Buffer.byteLength(payload)>requestLimit) throw invalid();
    const images=body.messages.some(value=>Array.isArray(object(value).content));
    await context.checkpoint();
    if (freeForm) await context.authorize('disclosure');
    if(images) await context.authorize('images');
    await context.authorize('model');
    const attempt=await context.reserve('model');
    const remaining=attempt.deadline.getTime()-Date.now();
    if (remaining<=0) throw invalid();
    const timeout=AbortSignal.timeout(Math.min(evaluation ? 8000 : 1000,remaining));
    const signal=AbortSignal.any([context.signal,...(init.signal ? [init.signal] : []),timeout]);
    const assertActive=()=>{
      if(signal.aborted) throw new ConversationError(503,timeout.aborted&&!context.signal.aborted&&!init.signal?.aborted?'model_timeout':'model_unavailable');
    };
    assertActive();
    const agent=evaluation ? new HttpsAgent({keepAlive:false,maxSockets:1}) : new Agent({keepAlive:false,maxSockets:1});
    try {
      const response=await new Promise<{status:number;body:string;type:string}>((resolve,reject) => {
        const req=(evaluation ? httpsRequest : request)(url,{method:'POST',agent,signal,headers:{authorization:`Bearer ${credential}`,'content-type':'application/json'}},res => {
          const chunks:Buffer[]=[]; let size=0;
          res.on('data',(chunk:Buffer) => {size+=chunk.length; if(size>16384){res.destroy();reject(invalid());} else chunks.push(chunk);});
          res.on('error',reject);
          res.on('end',()=>resolve({status:res.statusCode??503,body:Buffer.concat(chunks).toString('utf8'),type:String(res.headers['content-type']??'')}));
        });
        req.on('error',reject); req.end(payload);
      }).catch(error=>{
        assertActive();
        if(error instanceof ConversationError) throw error;
        throw invalid();
      });
      assertActive();
      await context.authorize('model');
      if (freeForm) await context.authorize('disclosure');
      if(images) await context.authorize('images');
      if (response.status>=300 && response.status<400) throw invalid();
      if (response.status!==200) {
        await context.finish(attempt.id);
        if (evaluation) throw new ConversationError(503,response.status===429 ? 'model_rate_limited' : response.status===400 ? 'model_request_rejected' : 'model_unavailable');
        return new Response(JSON.stringify({error:{message:'synthetic model unavailable'}}),{status:response.status>=400 && response.status<=599 ? response.status : 503,headers:{'content-type':'application/json'}});
      }
      if (!response.type.startsWith('application/json')) throw invalid();
      let safe:ReturnType<typeof safeCompletion>;
      try {safe=safeCompletion(response.body,config.mode,freeForm,context.forbidden ?? [],policy);} catch {throw invalid();}
      await context.finish(attempt.id,safe.usage);
      assertActive();
      return new Response(safe.body,{headers:{'content-type':'application/json'}});
    } finally { agent.destroy(); }
  };
}
