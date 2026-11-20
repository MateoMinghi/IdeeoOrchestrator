import { createServer, type Server } from 'node:http';
import { createHmac, randomBytes } from 'node:crypto';
import { mkdir, open } from 'node:fs/promises';
import { join } from 'node:path';
import { disposableCalendar, type WorkshopReservation } from './workshop-calendar.ts';
import { fixtureFetch } from './fixture-http.ts';
import { launchIdeeoBrowserFixture } from './ideeo-browser-fixture.ts';
import { createCapabilityExecutor, type CapabilityHandler } from '../../server/ideeo/capability-executor.ts';
import type { CapabilityConfiguration } from '../../server/ideeo/capability-config.ts';

async function listen(server:Server) {
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address();
  if(!address||typeof address==='string')throw new Error('Missing fixture listener');
  return `http://127.0.0.1:${address.port}`;
}
async function close(server:Server) {
  await new Promise<void>(resolve=>{server.close(()=>resolve());server.closeAllConnections();});
}
export async function launchIdeeoBookingFixture(root:string, options:{calendar?:boolean}={}) {
  const cleanup:Array<()=>Promise<void>>=[];
  const stop=async()=>{
    const errors:unknown[]=[];
    for(const action of cleanup.splice(0).reverse())try{await action();}catch(error){errors.push(error);}
    if(errors.length)throw new AggregateError(errors,'Booking fixture cleanup failed');
  };
  const events:Array<{name:string;arguments:Record<string,unknown>;status:string;text?:string}>=[];
  const slot={title:'Willow Studio workshop',date:'2026-11-22',timeZone:'America/Mexico_City',
    start:'2026-11-22T21:00:00Z',end:'2026-11-22T22:00:00Z'};
  const slotLabel=new Intl.DateTimeFormat('en-US',{timeZone:slot.timeZone,weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date(slot.start));
  const reservations=new Map<string,WorkshopReservation>();
  const issued=new Map<string,string>();
  const calendar=disposableCalendar(conversation=>{
    const matches=[...reservations].filter(([handle])=>issued.get(handle)===conversation);
    return matches.length===1?matches[0][1]:undefined;
  });
  const lookupCredential=randomBytes(32).toString('hex');
  const reference=(conversation:string,attempt:string)=>createHmac('sha256',lookupCredential).update(conversation+'/'+attempt).digest('hex');
  let verificationReads=0;
  const newConfirmation=()=>'WILLOW-'+[...randomBytes(8)].map(value=>String.fromCharCode(65+value%26)).join('');
  try {
    const receipts=join(root,'receipts');await mkdir(receipts,{recursive:true});
    const page=(confirmation?:string)=>`<!doctype html><title>Willow Studio</title><h1>Willow Studio workshop reservation</h1>${options.calendar?`<p>${slotLabel}, Mexico City time.</p>`:''}${confirmation
      ?`<p>Confirmed reservation ${confirmation}. Sunday from 3 to 4 pm. Ten adults. Room hire thirty dollars. Invitations have not been sent.</p>`
      :'<p>Available: Sunday from 3 to 4 pm for ten adults. Room hire thirty dollars.</p><form method="post" action="/book"><input type="hidden" name="reference"><button type="submit">Reserve Sunday workshop</button></form>'}`;
    const site=createServer(async(req,res)=>{
      if(options.calendar && req.url?.startsWith('/calendar/')) {calendar.serve(req,res);return;}
      if(req.method==='GET' && req.url==='/reservation'){
        if(req.headers.authorization!=='Bearer '+lookupCredential){res.writeHead(403);res.end();return;}
        verificationReads++;
        const handle=String(req.headers['x-reservation-reference']);
        res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});
        res.end(JSON.stringify({reference:handle,confirmation:reservations.get(handle)?.confirmation??null}));return;
      }
      let handle=req.headers.cookie?.match(/(?:^|; )reservation=([a-f0-9]{64})(?:;|$)/)?.[1];
      if(req.method==='POST' && req.url==='/book'){
        let body='';
        try {for await(const chunk of req){body+=chunk;if(body.length>256){res.writeHead(413);res.end();return;}}}
        catch {res.destroy();return;}
        handle=new URLSearchParams(body).get('reference')??'';
        if(!issued.has(handle)){res.writeHead(403);res.end();return;}
        if(!reservations.has(handle)) reservations.set(handle,{...slot,confirmation:newConfirmation()});
        res.setHeader('set-cookie','reservation='+handle+'; Path=/; HttpOnly; SameSite=Strict');
      }else if(req.method!=='GET' || !['/','/favicon.ico'].includes(req.url??'')){res.writeHead(404);res.end();return;}
      res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});res.end(page(reservations.get(handle??'')?.confirmation));
    });
    const siteUrl=await listen(site);cleanup.push(()=>close(site));
    const browser=await launchIdeeoBrowserFixture(join(root,'browser'),siteUrl,(conversation,attempt)=>{
      const handle=reference(conversation,attempt);issued.set(handle,conversation);return handle;
    });cleanup.push(()=>browser.close());
    const handlers=new Map<string,CapabilityHandler>();
    for(const [name,handler] of browser.handlers)handlers.set(name,async(args,context)=>{
      const event={name,arguments:structuredClone(args),status:'started',text:undefined as string|undefined};events.push(event);
      try{const result=await handler(args,context);event.status='succeeded';event.text=typeof result==='string'?result:result.text;return result;}
      catch(error){event.status='failed';throw error;}
    });
    const lookup={name:'lookup_workshop_booking',family:'browser' as const,permission:'tool:booking:verify',
      description:'Read one workshop reservation by its original browser attempt.',
      inputSchema:{type:'object',properties:{original_attempt_id:{type:'string',pattern:'^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$'}},required:['original_attempt_id'],additionalProperties:false}};
    handlers.set(lookup.name,async(args,context)=>{
      const original=String(args.original_attempt_id);
      const handle=reference(context.conversationId,original);
      const response=await fixtureFetch(siteUrl+'/reservation',{signal:context.signal,
        headers:{authorization:'Bearer '+lookupCredential,'x-reservation-reference':handle}});
      if(!response.ok) throw new Error('Booking lookup unavailable');
      const result=await response.json() as {reference:string;confirmation:string|null};
      if(result.reference!==handle) throw new Error('Booking lookup mismatch');
      return JSON.stringify({reference:original,confirmation:result.confirmation});
    });
    if(options.calendar) calendar.register(siteUrl,handlers);
    const credential=randomBytes(32).toString('hex');
    const scope={tenant_id:'alpha',membership_id:'member-1',client_id:'app',agent_account_id:'assistant-1',grant_id:'grant-1',channel:'sdk' as const,channel_binding_id:''};
    const executor=createCapabilityExecutor({scope,credential,tools:[...browser.tools,lookup,...(options.calendar?calendar.tools:[])],handlers,claim:async id=>{
      try{const receipt=await open(join(receipts,id),'wx');await receipt.close();return true;}catch{return false;}
    }});
    const endpoint=await listen(executor);cleanup.push(()=>close(executor));
    const route:CapabilityConfiguration={...(options.calendar?{calendarBooking:true as const}:{}),bookingVerification:true,scope,url:endpoint+'/v1/ideeo/tools/call',credentialEnv:'WORKSPACE',tools:browser.tools};
    return {route,credential,events,calendar,get confirmation(){return [...reservations.values()].at(-1)?.confirmation??'';},bookings:()=>reservations.size,verificationReads:()=>verificationReads,closeConversation:browser.closeConversation,stop};
  }catch(error){
    try { await stop(); } catch(cleanupError) { throw new AggregateError([error,cleanupError],'Booking fixture setup and cleanup failed'); }
    throw error;
  }
}
