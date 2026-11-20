import { CONVERSATION_VERSION, type ConversationHistory, type ConversationView, type TurnStatus, type TurnView } from '../../shared/ideeo/conversations.ts';

export class ProductApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, status = 0) { super(code); this.code=code; this.status=status; }
}
/** The tenant supplies fresh proof; tokens are held only for one operation and never stored by the client. */
export type TenantTokenSource = (signal: AbortSignal) => Promise<string>;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

async function readJson(response: Response): Promise<Record<string, unknown>> {
  if (!response.headers.get('content-type')?.startsWith('application/json') || !response.body) throw new ProductApiError('unavailable');
  const reader=response.body.getReader(), chunks: Uint8Array[]=[];let size=0;
  try {
    for (;;) { const next=await reader.read();if(next.done) break;size+=next.value.length;if(size>262144) throw new ProductApiError('unavailable');chunks.push(next.value); }
  } finally { await reader.cancel(); }
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const parsed: unknown=JSON.parse(new TextDecoder().decode(bytes));
  if (!parsed || typeof parsed!=='object' || Array.isArray(parsed)) throw new ProductApiError('unavailable');
  return parsed as Record<string,unknown>;
}

/** Same-origin PayMe cookie exchange. The hosting tenant must route this endpoint to its own API. */
export const payMeToken: TenantTokenSource = async signal => {
  const response=await fetch('/api/nico/token',{method:'POST',credentials:'same-origin',redirect:'error',cache:'no-store',signal,
    headers:{'content-type':'application/json'},body:'{}'});
  if (!response.ok) throw new ProductApiError('authentication_required',response.status);
  const body=await readJson(response);
  if(typeof body.token!=='string' || body.token.length>12000) throw new ProductApiError('authentication_required');
  return body.token;
};

export function createProductClient(getToken: TenantTokenSource) {
  async function session<T>(signal: AbortSignal, work: (request: (path:string,body?:object,key?:string)=>Promise<Record<string,unknown>>) => Promise<T>, timeoutMs=30000) {
    signal=AbortSignal.any([signal,AbortSignal.timeout(timeoutMs)]);
    const token=await getToken(signal);signal.throwIfAborted();
    if (!token || token.length>12000 || /[\r\n]/.test(token)) throw new ProductApiError('authentication_required');
    const request=async(path:string,body?:object,key?:string)=>{
      const response=await fetch(path,{method:body?'POST':'GET',credentials:'omit',redirect:'error',cache:'no-store',signal,
        headers:{authorization:`Bearer ${token}`,...(body?{'content-type':'application/json'}:{}),...(key?{'idempotency-key':key}:{})},...(body?{body:JSON.stringify(body)}:{})});
      const value=await readJson(response);signal.throwIfAborted();
      if(!response.ok) {
        const code=value.error && typeof value.error==='object' && 'code' in value.error ? String(value.error.code) : 'unavailable';
        throw new ProductApiError(code,response.status);
      }
      if(path!=='/v2/session' && value.api_version!==CONVERSATION_VERSION) throw new ProductApiError('unavailable');
      return value;
    };
    const admitted=await request('/v2/session');
    if(admitted.status!=='admitted' || admitted.api_version!=='2') throw new ProductApiError('authentication_required');
    return work(request);
  }
  function conversationId(id:string) {if(!uuid.test(id)) throw new ProductApiError('not_found');return id;}
  return {
    check: (signal:AbortSignal)=>session(signal,async()=>undefined),
    create: (key:string,signal:AbortSignal)=>session(signal,async request=>{
      const result=await request('/v2/conversations',{},key);
      conversationId(String(result.conversation_id));return result as unknown as ConversationView;
    }),
    append: (id:string,text:string,key:string,signal:AbortSignal)=>session(signal,async request=>{
      const result=await request(`/v2/conversations/${conversationId(id)}/turns`,{message:{text,disclosure:'model'}},key);
      if(result.conversation_id!==id || result.status!=='completed' || !uuid.test(String(result.turn_id))) throw new ProductApiError('unavailable');
      return result as unknown as TurnView;
    },70000),
    turnStatus: (id:string,key:string,signal:AbortSignal)=>session(signal,async request=>{
      const result=await request(`/v2/conversations/${conversationId(id)}/turns/status`,undefined,key);
      if(result.conversation_id!==id || !(result.status==='committed' && uuid.test(String(result.turn_id))
        || result.status==='uncommitted' || result.status==='reconciliation_required')) throw new ProductApiError('unavailable');
      return result as unknown as TurnStatus;
    }),
    history: (id:string,signal:AbortSignal)=>session(signal,async request=>{
      const turns: TurnView[]=[];let after=0;
      for(let page=0;page<20;page++) {
        const result=await request(`/v2/conversations/${conversationId(id)}/turns?after=${after}&limit=50`) as unknown as ConversationHistory;
        if(result.conversation_id!==id || !Array.isArray(result.turns) || result.turns.length>50) throw new ProductApiError('unavailable');
        for(const turn of result.turns) {
          if(turn.conversation_id!==id || turn.status!=='completed' || turn.sequence!==after+1 || typeof turn.answer?.text!=='string'
            || turn.answer.text.length>2000 || !(typeof turn.message==='string' || typeof turn.message?.text==='string')) throw new ProductApiError('unavailable');
          after=turn.sequence;turns.push(turn);
        }
        if(result.next_after===null) return turns;
        if(result.next_after!==after || !result.turns.length) throw new ProductApiError('unavailable');
      }
      throw new ProductApiError('unavailable');
    }),
  };
}
