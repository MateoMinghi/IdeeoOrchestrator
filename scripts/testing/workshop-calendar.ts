import { randomBytes } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { fixtureFetch } from './fixture-http.ts';
import type { CapabilityHandler } from '../../server/ideeo/capability-executor.ts';
import { createCalendarEvent,readCalendarEvent } from '../../server/ideeo/workshop-calendar.ts';

export type WorkshopReservation={title:string;date:string;timeZone:string;start:string;end:string;confirmation:string};

export function disposableCalendar(reservationFor:(conversation:string)=>WorkshopReservation|undefined) {
  type Event=WorkshopReservation & {event_id:string;attendees:string[]};
  const events=new Map<string,Event>();
  const requests=new Map<string,string>();
  const credential=randomBytes(32).toString('hex');
  let drop=false,writes=0,reads=0;
  const uuid='[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}';
  const path=new RegExp('^/calendar/('+uuid+')/('+uuid+')$');
  const reply=(res:ServerResponse,status:number,value:unknown)=>{
    res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(value));
  };
  const tools=[
    {name:createCalendarEvent,permission:'tool:calendar:write',description:'Add the confirmed workshop to the calendar.',
      inputSchema:{type:'object',properties:{date:{type:'string',pattern:'^[0-9]{4}-[0-9]{2}-[0-9]{2}$'}},required:['date'],additionalProperties:false}},
    {name:readCalendarEvent,permission:'tool:calendar:read',description:'Read the calendar event for an original write.',
      inputSchema:{type:'object',properties:{original_attempt_id:{type:'string',pattern:'^'+uuid+'$'}},required:['original_attempt_id'],additionalProperties:false}},
  ].map(tool=>({...tool,family:'apps' as const}));
  return {
    tools, counters:()=>({writes,reads,events:events.size}),dropNextResponse:()=>{drop=true;},
    inspect:(conversation:string)=>structuredClone(events.get(conversation)),
    serve(req:IncomingMessage,res:ServerResponse){
      const match=path.exec(req.url??'');
      if(!match || req.headers.authorization!=='Bearer '+credential){reply(res,403,{});return;}
      const [,conversation,original]=match;
      const key=conversation+'/'+original;
      if(req.method==='PUT'){
        const reservation=reservationFor(conversation);
        if(!reservation || req.headers['x-workshop-date']!==reservation.date){reply(res,200,{status:'no_matching_booking',original_attempt_id:original});return;}
        const event=events.get(conversation)??{...reservation,attendees:[],
          event_id:'CAL-'+[...randomBytes(12)].map(b=>String.fromCharCode(65+b%26)).join('')};
        if(event.confirmation!==reservation.confirmation){reply(res,409,{});return;}
        writes++;
        events.set(conversation,event);requests.set(key,event.event_id);
        if(drop){drop=false;res.destroy();return;}
      }else if(req.method==='GET') reads++;
      else {reply(res,405,{});return;}
      const event=events.get(conversation);
      if(!event || requests.get(key)!==event.event_id){reply(res,404,{});return;}
      reply(res,200,{original_attempt_id:original,...event});
    },
    register(url:string,handlers:Map<string,CapabilityHandler>){
      for(const tool of tools) handlers.set(tool.name,async(args,context)=>{
        const create=tool.name===createCalendarEvent;
        const original=create?context.attemptId:String(args.original_attempt_id);
        const result=await fixtureFetch(url+'/calendar/'+context.conversationId+'/'+original,{
          method:create?'PUT':'GET',signal:context.signal,headers:{authorization:'Bearer '+credential,...(create?{'x-workshop-date':String(args.date)}:{})}});
        if(!result.ok) throw new Error('Calendar event unavailable');
        return result.text();
      });
    },
  };
}
