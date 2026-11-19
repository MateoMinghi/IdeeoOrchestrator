import { createServer, type Server } from 'node:http';
import { randomBytes } from 'node:crypto';
import { mkdir, open } from 'node:fs/promises';
import { join } from 'node:path';
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
export async function launchIdeeoBookingFixture(root:string) {
  const cleanup:Array<()=>Promise<void>>=[];
  const stop=async()=>{
    const errors:unknown[]=[];
    for(const action of cleanup.splice(0).reverse())try{await action();}catch(error){errors.push(error);}
    if(errors.length)throw new AggregateError(errors,'Booking fixture cleanup failed');
  };
  const events:Array<{name:string;arguments:Record<string,unknown>;status:string;text?:string}>=[];
  let bookings=0;
  const confirmation='WILLOW-'+[...randomBytes(8)].map(value=>String.fromCharCode(65+value%26)).join('');
  try {
    const receipts=join(root,'receipts');await mkdir(receipts,{recursive:true});
    const page=()=>`<!doctype html><title>Willow Studio</title><h1>Willow Studio workshop reservation</h1>${bookings
      ?`<p>Confirmed reservation ${confirmation}. Sunday from 3 to 4 pm. Ten adults. Room hire thirty dollars. Invitations have not been sent.</p>`
      :'<p>Available: Sunday from 3 to 4 pm for ten adults. Room hire thirty dollars.</p><form method="post" action="/book"><button type="submit">Reserve Sunday workshop</button></form>'}`;
    const site=createServer((req,res)=>{
      if(req.method==='POST'&&req.url==='/book')bookings++;
      if(!['/','/book','/favicon.ico'].includes(req.url??'')){res.writeHead(404);res.end();return;}
      res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});res.end(page());
    });
    const siteUrl=await listen(site);cleanup.push(()=>close(site));
    const browser=await launchIdeeoBrowserFixture(join(root,'browser'),siteUrl);cleanup.push(()=>browser.close());
    const handlers=new Map<string,CapabilityHandler>();
    for(const [name,handler] of browser.handlers)handlers.set(name,async(args,context)=>{
      const event={name,arguments:structuredClone(args),status:'started',text:undefined as string|undefined};events.push(event);
      try{const result=await handler(args,context);event.status='succeeded';event.text=typeof result==='string'?result:result.text;return result;}
      catch(error){event.status='failed';throw error;}
    });
    const credential=randomBytes(32).toString('hex');
    const scope={tenant_id:'alpha',membership_id:'member-1',client_id:'app',agent_account_id:'assistant-1',grant_id:'grant-1',channel:'sdk' as const,channel_binding_id:''};
    const executor=createCapabilityExecutor({scope,credential,tools:browser.tools,handlers,claim:async id=>{
      try{const receipt=await open(join(receipts,id),'wx');await receipt.close();return true;}catch{return false;}
    }});
    const endpoint=await listen(executor);cleanup.push(()=>close(executor));
    const route:CapabilityConfiguration={scope,url:endpoint+'/v1/ideeo/tools/call',credentialEnv:'WORKSPACE',tools:browser.tools};
    return {route,credential,events,confirmation,bookings:()=>bookings,stop};
  }catch(error){await stop();throw error;}
}
