import type { CapabilityConfiguration } from './capability-config.ts';
import { executeCapability } from './capability-transport.ts';
import { ConversationError } from './storage/conversations.ts';

export const calendarPermissions = ['tool:calendar:write','tool:calendar:read','tool:browser:interact'] as const;
export const createCalendarEvent = 'create_workshop_calendar_event';
export const readCalendarEvent = 'read_workshop_calendar_event';
const monthNames = 'january february march april may june july august september october november december'.split(' ');
const prefix = /^(?:please\s+)?(?:put|add) (?:the |my )?(?:confirmed )?(?:willow studio )?(?:workshop|booking|reservation)(?: booking)? (?:on|to|in) my calendar\b/i;
const details = /^ (?:for|on) (?:Sunday,? )?([a-z]+) (\d{1,2}),? (\d{4})(?:,? from 3(?::00)?(?: pm)? to 4(?::00)? pm)?,? (?:in )?Mexico City time[.!]?(?: (?:Leave the invitations to me|Do not send invitations)[.!]?)?$/i;
export const calendarClarification = 'Which Sunday should I use? Please give the full date and time zone, for example: Add the Willow Studio workshop to my calendar for Sunday, November 22, 2026, from 3 to 4 pm, Mexico City time.';

export function workshopCalendarRequest(text:string): {date?:string} | undefined {
  const match=prefix.exec(text.trim());
  if(!match) return;
  const date=details.exec(text.trim().slice(match[0].length));
  if(!date) return {};
  const month=monthNames.findIndex(name=>name===date[1].toLowerCase());
  const day=Number(date[2]),year=Number(date[3]);
  const instant=new Date(Date.UTC(year,month,day));
  if(month<0 || instant.getUTCMonth()!==month || instant.getUTCDay()!==0 || instant.getUTCFullYear()!==year) return {};
  return {date:instant.toISOString().slice(0,10)};
}

type Reservation = {id:string;deadline:Date};
export function workshopCalendar(route:CapabilityConfiguration,credential:string) {
  return async (conversationId:string,date:string,original:string,attempt:Reservation,recover:boolean,signal:AbortSignal)=>{
    const args=recover?{original_attempt_id:original}:{date};
    const result=await executeCapability(route,credential,{execution:{scope:route.scope,conversationId},signal},
      recover?readCalendarEvent:createCalendarEvent,args,attempt).catch((error:unknown)=>{
        if(error instanceof ConversationError && error.code==='capability_outcome_unknown') throw new ConversationError(503,'calendar_outcome_unknown');
        throw error;
      });
    const receipt=JSON.parse(result.text);
    if(!recover && receipt?.status==='no_matching_booking' && receipt.original_attempt_id===original) return 'I could not find a confirmed workshop matching that date in this conversation. No calendar event was added.';
    const clock=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
    const localTime=(value:unknown)=>{
      if(typeof value!=='string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:00Z$/.test(value) || !Number.isFinite(Date.parse(value))) return '';
      const parts=Object.fromEntries(clock.formatToParts(new Date(value)).map(p=>[p.type,p.value]));
      return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
    };
    if(receipt?.original_attempt_id!==original || receipt.date!==date || receipt.title!=='Willow Studio workshop'
      || receipt.timeZone!=='America/Mexico_City' || localTime(receipt.start)!==date+' 15:00' || localTime(receipt.end)!==date+' 16:00'
      || !Array.isArray(receipt.attendees) || receipt.attendees.length!==0 || typeof receipt.event_id!=='string' || !/^CAL-[A-Z]{12}$/.test(receipt.event_id)
      || typeof receipt.confirmation!=='string' || !/^WILLOW-[A-Z]{8}$/.test(receipt.confirmation)) throw new ConversationError(409,'calendar_event_unverified');
    const label=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
    return `Willow Studio is on your calendar for ${label}, from 3 to 4 pm Mexico City time. Booking ${receipt.confirmation}. Calendar event ${receipt.event_id}. No invitations were sent.`;
  };
}
export type CalendarTurn = {date?:string;dispatch:ReturnType<typeof workshopCalendar>};
