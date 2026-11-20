import { ChromeEngine } from '../../server/browser/engines.ts';
import { TOOL_LIST } from '../../server/browser/tools.ts';
import { openGate } from '../../server/browser/egress/gate.ts';
import type { CapabilityHandler } from '../../server/ideeo/capability-executor.ts';
import type { CapabilityConfiguration } from '../../server/ideeo/capability-config.ts';
import { chatImage } from '../../server/drivers/chat-images.ts';

export async function launchIdeeoBrowserFixture(root:string, site:string, bookingReference?:(conversation:string,attempt:string)=>string) {
  const address=new URL(site);
  if(address.hostname!=='127.0.0.1'||address.protocol!=='http:'||!address.port) throw new Error('Owned fixture site required');
  const gate=await openGate({refuseName:target=>target.host===address.hostname&&target.port===Number(address.port)?null:'fixture-only',
    decide:async(target,addresses)=>target.host===address.hostname&&target.port===Number(address.port)&&addresses.every(a=>a.address==='127.0.0.1')?null:'fixture-only'});
  const browser=new ChromeEngine({dataDir:root,host:'server',env:{SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR,
    HOME:root,USERPROFILE:root,APPDATA:root,LOCALAPPDATA:root,TEMP:root,TMP:root,OMB_CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe'},
    egressPort:async()=>gate.port,idleMs:()=>60000,egressNotice:()=>null,log:()=>{}});
  try {await browser.launcher.prepare();await browser.launcher.binary();} catch(error){await browser.close();await gate.close();throw error;}
  const admitted=new Set(['agent_browser_open','agent_browser_read','agent_browser_snapshot','agent_browser_fill','agent_browser_click','agent_browser_screenshot']);
  const tools:CapabilityConfiguration['tools']=TOOL_LIST.filter(tool=>admitted.has(tool.name)).map(tool=>({...tool,description:tool.description+' This isolated fixture can access only workshop.invalid.',family:'browser',permission:'tool:browser:interact'}));
  const handlers=new Map<string,CapabilityHandler>(tools.map(tool=>[tool.name,async(args,context)=>{
    const target={session:context.conversationId,key:`temp:${context.conversationId}`};
    const input={...args};
    if(input.url!==undefined){
      if(typeof input.url!=='string'||! /^(?:https?:\/\/)?workshop\.invalid(?:\/[a-z/-]*)?$/i.test(input.url)) throw new Error('Fixture URL denied');
      const url=new URL(input.url.includes('://')?input.url:'https://'+input.url);
      input.url=site+url.pathname;
    }
    const interrupt=()=>{void browser.service.close(target.session).catch(()=>{});};
    context.signal.addEventListener('abort',interrupt,{once:true});
    try{
      context.signal.throwIfAborted();
      if(bookingReference && tool.name==='agent_browser_click'){
        const reference=bookingReference(context.conversationId,context.attemptId);
        const expression=`location.origin===${JSON.stringify(site)} && (()=>{const field=document.querySelector('form[action="/book"] input[name="reference"]');if(field)field.value=${JSON.stringify(reference)};return Boolean(field)})()`;
        const prepared=await browser.service.agentRpc(target,'tools/call',{name:'agent_browser_eval',
          arguments:{expression,...(input.tab===undefined?{}:{tab:input.tab})}},()=>context.signal.throwIfAborted()) as {isError?:boolean};
        if(prepared.isError) throw new Error('Unable to bind booking attempt');
      }
      const result=await browser.service.agentRpc(target,'tools/call',{name:tool.name,arguments:input},()=>context.signal.throwIfAborted()) as {isError?:boolean;content?:{type:string;text?:string;mimeType?:string;data?:string}[]};
      context.signal.throwIfAborted();
      if(result.isError||!result.content||result.content.some(part=>!['text','image'].includes(part.type))) throw new Error('Browser operation failed');
      const text=result.content.filter(part=>part.type==='text').map(part=>part.text??'').join('\n').replaceAll(site,'https://workshop.invalid');
      const images=result.content.filter(part=>part.type==='image').map(part=>chatImage(part));
      return images.length?{text,images}:text;
    }finally{context.signal.removeEventListener('abort',interrupt);}
  }]));
  return {tools,handlers,closeConversation:(id:string)=>browser.service.close(id),close:async()=>{try{await browser.close();}finally{await gate.close();}}};
}
