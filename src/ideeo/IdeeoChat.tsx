import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';
import { ComposerSendButton } from '../components/ComposerSendButton';
import { plainBotBubble, SIMPLE_USER_BUBBLE } from '../components/chat-bubble-style';
import type { BookingCheck, TurnView } from '../../shared/ideeo/conversations';
import { createProductClient, ProductApiError, type TenantTokenSource } from './client';

function errorText(error: unknown) {
  if(error instanceof ProductApiError) {
    if([401,403].includes(error.status) || error.code==='authentication_required') return t('ideeo.signIn');
    if(error.status===404 || error.status===410) return t('ideeo.missing');
    if(error.code==='content_not_permitted') return t('ideeo.private');
    if(error.code==='calendar_outcome_unknown') return t('ideeo.calendarRetry');
    if(error.code==='capability_outcome_unknown') return t('ideeo.bookingUnknown');
    if(error.code==='inference_budget_exhausted') return t('ideeo.budget');
    if(error.code==='capability_reconciliation_required') return t('ideeo.checkAction');
    if(error.status===409) return t('ideeo.conflict');
  }
  return t('ideeo.unavailable');
}

export function IdeeoChat({getToken}: {getToken: TenantTokenSource}) {
  const client=useRef(createProductClient(getToken));
  const conversation=useRef(/^#[a-f0-9-]{36}$/.test(location.hash)?location.hash.slice(1):'');
  const [turns,setTurns]=useState<readonly TurnView[]>([]), [draft,setDraft]=useState(''), [error,setError]=useState('');
  const [checks,setChecks]=useState<readonly BookingCheck[]>([]);
  const [busy,setBusy]=useState(true), [ready,setReady]=useState(false);
  const active=useRef<AbortController | null>(null), epoch=useRef(0);
  const pending=useRef<{text:string;key:string;createKey:string;checked:boolean} | null>(null);
  const transcript=useRef<HTMLDivElement>(null);
  const run=useCallback(async(work:(signal:AbortSignal)=>Promise<readonly TurnView[]>)=>{
    active.current?.abort();const controller=new AbortController();active.current=controller;
    const generation=++epoch.current;setTurns([]);setChecks([]);setBusy(true);setError('');setReady(false);
    try {const result=await work(controller.signal);if(epoch.current===generation){setTurns(result);setReady(true);}}
    catch(cause){if(epoch.current===generation && !controller.signal.aborted) {
      setError(errorText(cause));
      if(cause instanceof ProductApiError && ([401,403].includes(cause.status) || cause.code==='authentication_required')){setDraft('');pending.current=null;}
    }}
    finally{if(epoch.current===generation)setBusy(false);}
  },[]);
  const load=useCallback(()=>run(async signal=>{
    const id=conversation.current;
    if(!id){await client.current.check(signal);return [];}
    const attempt=pending.current;
    const status=attempt && await client.current.turnStatus(id,attempt.key,signal);
    const history=await client.current.history(id,signal,setChecks);
    signal.throwIfAborted();
    if(status?.status==='committed'){
      if(!history.some(turn=>turn.turn_id===status.turn_id))throw new ProductApiError('unavailable');
      pending.current=null;
      setDraft(text=>text===attempt?.text?'':text);
    }else if(status && attempt){
      attempt.checked=true;
      setError(t(status.status==='reconciliation_required'?'ideeo.checkAction':'ideeo.restatedContext'));
    }
    return history;
  }),[run]);
  useEffect(()=>{client.current=createProductClient(getToken);pending.current=null;setDraft('');void load();
    return()=>{++epoch.current;active.current?.abort();};},[getToken,load]);
  useEffect(()=>{
    const refresh=()=>{if(document.visibilityState==='visible')void load();else{++epoch.current;active.current?.abort();setTurns([]);setChecks([]);setDraft('');pending.current=null;setReady(false);}};
    const focus=()=>{void load();};
    document.addEventListener('visibilitychange',refresh);window.addEventListener('focus',focus);
    const timer=window.setInterval(()=>{if(document.visibilityState==='visible' && !active.current?.signal.aborted && !busy) void load();},30000);
    return()=>{document.removeEventListener('visibilitychange',refresh);window.removeEventListener('focus',focus);clearInterval(timer);};
  },[busy,load]);
  useEffect(()=>{transcript.current?.scrollTo({top:transcript.current.scrollHeight});},[turns]);
  const checkBeforeSend=Boolean(conversation.current && pending.current && pending.current.text!==draft && !pending.current.checked);
  const sendLabel=t(checkBeforeSend?'ideeo.checkPrevious':'ideeo.send');
  const send=()=>{
    if(busy || !draft.trim())return;
    const text=draft;
    if(checkBeforeSend){
      void load();return;
    }
    if(!pending.current || pending.current.text!==text)pending.current={text,key:crypto.randomUUID(),createKey:crypto.randomUUID(),checked:false};
    const attempt=pending.current;
    attempt.checked=false;
    void run(async signal=>{
      let current=conversation.current;
      if(!current){
        current=(await client.current.create(attempt.createKey,signal)).conversation_id;
        signal.throwIfAborted();conversation.current=current;history.replaceState(null,'',`#${current}`);
      }
      await client.current.append(current,text,attempt.key,signal);
      const result=await client.current.history(current,signal,setChecks);signal.throwIfAborted();
      pending.current=null;setDraft('');return result;
    });
  };
  const checkBooking=(attemptId:string)=>void run(async signal=>{
    const id=conversation.current;
    await client.current.checkBooking(id,attemptId,signal);
    return client.current.history(id,signal,setChecks);
  });
  const fresh=()=>{active.current?.abort();++epoch.current;pending.current=null;conversation.current='';setDraft('');setTurns([]);history.replaceState(null,'',location.pathname);void load();};
  return <main className="flex h-dvh min-h-0 bg-app text-ink">
    <aside className="hidden w-56 shrink-0 bg-panel p-4 sm:block">
      <h1 className="text-[20px] font-semibold">Ideeo</h1>
      <button className="ui-button ui-button-md mt-6" onClick={fresh}>{t('ideeo.new')}</button>
    </aside>
    <section className="mx-auto flex min-w-0 max-w-3xl flex-1 flex-col p-4">
      <h2 className="text-[17px] font-semibold">{t('ideeo.title')}</h2>
      <div ref={transcript} role="log" aria-label={t('ideeo.history')} aria-live="polite" className="min-h-0 flex-1 overflow-y-auto py-6">
        {!turns.length && !checks.length && !busy && !error && <p className="text-[13px] text-ink-secondary">{t('ideeo.empty')}</p>}
        {turns.map(turn=><div key={turn.turn_id} className="mb-4 flex flex-col gap-4">
          <div dir="auto" className={`${SIMPLE_USER_BUBBLE} ms-auto max-w-full whitespace-pre-wrap break-words`}>{typeof turn.message==='string'?turn.message:turn.message.text}</div>
          <div dir="auto" className={`${plainBotBubble(true)} break-words`}>{turn.answer.text}</div>
        </div>)}
        {checks.map(check=><div key={check.attempt_id} className="mb-4 text-[14px]">
          {check.status==='pending' ? <button className="ui-button ui-button-md" onClick={()=>checkBooking(check.attempt_id)}>{t('ideeo.checkBooking')}</button>
            : check.status==='verified' ? <p>{t('ideeo.bookingVerified')} {check.confirmation}</p> : <p>{t('ideeo.bookingUnknown')}</p>}
        </div>)}
      </div>
      <div role="status" className="min-h-8 text-[13px] text-ink-secondary">{busy?t('ideeo.loading'):error}</div>
      {error && <div className="mb-4 flex gap-2"><button className="ui-button ui-button-md" onClick={()=>void load()}>{t('ideeo.reload')}</button><button className="ui-button ui-button-md" onClick={fresh}>{t('ideeo.new')}</button></div>}
      <p id="ideeo-disclosure" className="mb-2 text-[12px] text-ink-secondary">{t('ideeo.disclosure')}</p>
      <div className="flex items-end gap-2 rounded-4xl bg-composer p-3">
        <textarea dir="auto" aria-label={t('ideeo.message')} aria-describedby="ideeo-disclosure" rows={2} value={draft} maxLength={1500}
          disabled={busy || (!ready && !error)} onChange={event=>setDraft(event.target.value)}
          onKeyDown={event=>{if(event.key==='Enter' && !event.shiftKey && !event.nativeEvent.isComposing){event.preventDefault();send();}}}
          className="min-w-0 flex-1 resize-none bg-transparent text-[15px] leading-[22px]" />
        <ComposerSendButton compact={false} waits={false} label={sendLabel} title={sendLabel}
          look={{className:'bg-ink text-app'}} disabled={busy || !draft.trim()} onSend={send} onChoose={()=>{}} />
      </div>
      <button className="ui-button ui-button-sm mt-2 self-start sm:hidden" onClick={fresh}>{t('ideeo.new')}</button>
    </section>
  </main>;
}
