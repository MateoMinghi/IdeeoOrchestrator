import { randomUUID } from 'node:crypto';
import { createOpenAIChatRuntime } from '../drivers/openai-chat-runtime.ts';
import { ChatToolSessionError, type ChatToolSession } from '../drivers/chat-tool-session.ts';
import { fixtureAnswers, fixturePrompts, inferenceAnswerKind, type InferenceConfiguration } from './inference-policy.ts';
import { controlledModelTransport, evaluationSystem, fixtureSystem, fixtureTool } from './model-transport.ts';
import type { ConversationGenerator } from './inference.ts';
import { ConversationError } from './storage/conversations.ts';
import { freeFormSystem, isFreeFormMessage, permittedText, permittedProjection, secretValues } from './text-policy.ts';
import type { createCapabilities } from './capabilities.ts';

export function createConversationGenerator(config: InferenceConfiguration, secrets: Readonly<Record<string,string|undefined>>, capabilities?: ReturnType<typeof createCapabilities>): ConversationGenerator {
  const evaluation=config.mode!=='synthetic';
  if (config.mode==='openai-evaluation' && secrets.IDEEO_OPENAI_EVALUATION !== 'synthetic-content-only') throw new Error('OpenAI evaluation requires explicit activation');
  if (config.mode==='gemini-evaluation' && secrets.IDEEO_GEMINI_EVALUATION !== 'synthetic-content-only') throw new Error('Gemini evaluation requires explicit activation');
  const freeForm = config.textMode === 'free-form';
  if (freeForm && secrets.IDEEO_FREE_FORM_EVALUATION !== 'synthetic-content-only') throw new Error('Free-form evaluation requires explicit activation');
  const answerKind=inferenceAnswerKind(config);
  const credential=secrets[config.credentialEnv];
  if (!credential || credential.length<16 || credential.length>1024 || /[\r\n]/.test(credential)) throw new Error('Missing model credential');
  return async context => {
    if (freeForm !== isFreeFormMessage(context.message)) throw new ConversationError(422,'input_profile_mismatch');
    const forbidden = [...secretValues(secrets),...context.forbidden ?? []];
    if (isFreeFormMessage(context.message) && !permittedText(context.message.text,1500,forbidden)) throw new ConversationError(422,'content_not_permitted');
    context = {...context,forbidden};
    const thread=randomUUID();
    let boundaryFailure:unknown, answer='', running=true;
    const guarded=async <T>(work:()=>Promise<T>) => {
      try { if(!running) throw new ConversationError(503,'model_unavailable'); return await work(); }
      catch(error){boundaryFailure=error;throw error;}
    };
    const mounted=capabilities?.session(context);
    const send=controlledModelTransport(config,credential,context,mounted?.policy);
    const fixtureTools:ChatToolSession={
      definitions:[structuredClone(fixtureTool)],skipped:[],trimmed:[],merged:[],budget:{limit:1,listed:1,servers:[]},
      refit:async()=>{},join:async()=>undefined,close:async()=>{},
      validate(name,args){
        if(name!=='fixture_catalog' || !args || typeof args!=='object' || Array.isArray(args)
          || Object.keys(args).join(',')!=='item' || !('item' in args) || args.item!=='color') throw new ChatToolSessionError('Unadmitted fixture tool');
      },
      view:(_name,args)=>({title:'Synthetic color',input:args,ask:false}),
      execute:async(name,args,signal)=> {
        try {
          return await guarded(async()=>{
            fixtureTools.validate(name,args); signal.throwIfAborted(); await context.checkpoint(); await context.authorize('tool');
            const attempt=await context.reserve('tool');
            if(attempt.deadline.getTime()<=Date.now()) throw new ConversationError(409,'inference_expired');
            signal.throwIfAborted(); await context.authorize('tool'); await context.finish(attempt.id);
            return {ok:true,text:JSON.stringify({color:'blue'})};
          });
        } catch {throw new ChatToolSessionError('Fixture tool unavailable');}
      },
    };
    const tools=mounted?.session??fixtureTools;
    const runtime=createOpenAIChatRuntime({
      input:{instanceId:'ideeo-fixture',displayName:'Ideeo fixture',enabled:true,environment:{},config:{}},driverKind:'openai-compat',
      apiKey:credential,apiUrl:config.url,models:()=>({default:config.model,options:[{id:config.model,label:'Synthetic fixture'}]}),
      requestBody:(model,messages,stream)=>({model,messages,stream,max_tokens:256}),httpErrorLabel:'fixture',missingKeyError:'Model unavailable',unavailableReason:'Model unavailable',
      timeoutMs:evaluation ? 9000 : 1200,retryScale:evaluation ? undefined : 0,reasoning:false,computerUse:Boolean(capabilities),nativeLog:{source:'fixture',outgoing:()=>({}),incoming:()=>({})},
      ports:{send:(url,init,onProgress)=>guarded(()=>send(url,init,onProgress)),mount:async()=>tools,join:async()=>undefined,refit:async()=>undefined,notices:()=>[],
        native:()=>{},handoff:()=>null,warning:()=>{},floor:()=>null,allowAskUser:false},
    });
    const abort=()=>{void runtime.adapter.interruptTurn(thread);};
    context.signal.addEventListener('abort',abort,{once:true});
    let complete!:(ok:boolean)=>void;
    const done=new Promise<boolean>(resolve=>{complete=resolve;});
    runtime.adapter.onEvent(event=>{
      if(event.type==='item.completed' && event.itemType==='assistant_text' && typeof event.text==='string') answer=event.text;
      if(event.type==='turn.completed') complete(event.ok);
    });
    try {
      context.signal.throwIfAborted();
      let contextBytes = 0;
      const pairs=context.history.filter(turn=>turn.answer.kind===answerKind).reverse().map(turn=>{
        if (freeForm) {
          if (!permittedProjection(turn.projection)) throw new ConversationError(503,'model_unavailable');
          return [{role:'user' as const,text:turn.projection.user},{role:'assistant' as const,text:turn.projection.assistant}];
        }
        if(typeof turn.message !== 'string' || !fixtureAnswers.has(turn.answer.text)) throw new ConversationError(503,'model_unavailable');
        return [{role:'user' as const,text:fixturePrompts[turn.message]},{role:'assistant' as const,text:turn.answer.text}];
      });
      const selected: typeof pairs = [];
      for (const pair of pairs) { contextBytes += Buffer.byteLength(JSON.stringify(pair)); if (contextBytes > 7000) break; selected.push(pair); }
      const transcript=selected.reverse().flat();
      const prompt=isFreeFormMessage(context.message) ? context.message.text : fixturePrompts[context.message];
      await runtime.adapter.sendTurn({threadId:thread,text:prompt,system:mounted?.policy.system??(freeForm ? freeFormSystem : evaluation ? evaluationSystem : fixtureSystem),transcript,guestConfined:true});
      if(!await done) throw boundaryFailure ?? new ConversationError(503,'model_unavailable');
      context.signal.throwIfAborted();
      if(freeForm ? !permittedText(answer,2000,forbidden) : !fixtureAnswers.has(answer)) throw new ConversationError(503,'model_unavailable');
      return {kind:answerKind,text:answer};
    } finally {
      running=false; context.signal.removeEventListener('abort',abort); try{await runtime.dispose();}finally{await tools.close();}
    }
  };
}
