import { Agent, request } from 'node:http';
import { Agent as HttpsAgent, request as httpsRequest } from 'node:https';
import type { InferenceConfiguration } from './inference-policy.ts';
import { fixtureAnswers, fixturePrompts } from './inference-policy.ts';
import type { InferenceContext } from './inference.ts';
import { ConversationError } from './storage/conversations.ts';

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
function safeCompletion(raw: string, evaluation: boolean): { body: string; usage?: {input:number;output:number} } {
  const reply = object(JSON.parse(raw));
  if (!Array.isArray(reply.choices) || reply.choices.length !== 1) throw invalid();
  const choice = object(reply.choices[0]), message = object(choice.message);
  if (message.content !== null && message.content !== '' && (typeof message.content !== 'string' || !fixtureAnswers.has(message.content))) throw invalid();
  if (message.tool_calls !== undefined && (!Array.isArray(message.tool_calls) || message.tool_calls.length > 2)) throw invalid();
  const calls = message.tool_calls === undefined ? undefined : (message.tool_calls as unknown[]).map(value => {
    const call=object(value), f=object(call.function);
    if (typeof call.id !== 'string' || !(evaluation ? /^call_[A-Za-z0-9_-]{1,128}$/ : /^fixture-call-[0-9]{1,4}$/).test(call.id) || call.type !== 'function'
      || typeof f.name !== 'string' || !/^[a-z_]{1,64}$/.test(f.name) || typeof f.arguments !== 'string' || f.arguments.length > 512) throw invalid();
    return {id:call.id,type:'function',function:{name:f.name,arguments:f.arguments}};
  });
  const usage = reply.usage ? object(reply.usage) : undefined;
  const measured = usage && Number.isSafeInteger(usage.prompt_tokens) && Number(usage.prompt_tokens)>=0 && Number(usage.prompt_tokens)<=1000000
    && Number.isSafeInteger(usage.completion_tokens) && Number(usage.completion_tokens)>=0 && Number(usage.completion_tokens)<=1000000
    ? {input:Number(usage.prompt_tokens),output:Number(usage.completion_tokens)} : undefined;
  return {body:JSON.stringify({choices:[{message:{role:'assistant',content:message.content,...(calls ? {tool_calls:calls} : {})},finish_reason:choice.finish_reason}],
    ...(measured ? {usage:{prompt_tokens:measured.input,completion_tokens:measured.output}} : {})}),usage:measured};
}
export function controlledModelTransport(config: InferenceConfiguration, credential: string, context: InferenceContext) {
  const evaluation=config.mode==='openai-evaluation';
  const allowed = new Set([evaluation ? evaluationSystem : fixtureSystem,...Object.values(fixturePrompts),...fixtureAnswers,JSON.stringify({ok:true,result:JSON.stringify({color:'blue'})})]);
  return async (url: string, init: RequestInit): Promise<Response> => {
    if (url !== config.url+'/chat/completions' || init.method !== 'POST' || typeof init.body !== 'string' || Buffer.byteLength(init.body)>16384) throw invalid();
    const body=object(JSON.parse(init.body));
    if (body.model !== config.model || body.stream !== true || body.max_tokens !== 256 || !Array.isArray(body.messages)
      || body.messages.length>45 || JSON.stringify(body.tools)!==JSON.stringify([fixtureTool])) throw invalid();
    for (const value of body.messages) {
      const message=object(value);
      if (!['system','user','assistant','tool'].includes(String(message.role)) || message.content !== null && !allowed.has(String(message.content))
        || ['reasoning','reasoning_content','reasoning_details'].some(field => Object.hasOwn(message,field))) throw invalid();
    }
    const payload=evaluation ? JSON.stringify({model:config.model,messages:body.messages,tools:body.tools,
      stream:false,store:false,max_completion_tokens:256,reasoning_effort:'none',parallel_tool_calls:false}) : init.body;
    if (Buffer.byteLength(payload)>16384) throw invalid();
    await context.checkpoint();
    await context.authorize('model');
    const attempt=await context.reserve('model');
    const remaining=attempt.deadline.getTime()-Date.now();
    if (remaining<=0) throw invalid();
    const signal=AbortSignal.any([context.signal,...(init.signal ? [init.signal] : []),AbortSignal.timeout(Math.min(evaluation ? 8000 : 1000,remaining))]);
    signal.throwIfAborted();
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
      });
      signal.throwIfAborted();
      await context.authorize('model');
      if (response.status>=300 && response.status<400) throw invalid();
      if (response.status!==200) {
        await context.finish(attempt.id);
        if (evaluation) throw new ConversationError(503,response.status===429 ? 'model_rate_limited' : response.status===400 ? 'model_request_rejected' : 'model_unavailable');
        return new Response(JSON.stringify({error:{message:'synthetic model unavailable'}}),{status:response.status>=400 && response.status<=599 ? response.status : 503,headers:{'content-type':'application/json'}});
      }
      if (!response.type.startsWith('application/json')) throw invalid();
      const safe=safeCompletion(response.body,evaluation);
      await context.finish(attempt.id,safe.usage);
      signal.throwIfAborted();
      return new Response(safe.body,{headers:{'content-type':'application/json'}});
    } finally { agent.destroy(); }
  };
}
