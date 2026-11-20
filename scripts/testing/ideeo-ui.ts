import assert from 'node:assert/strict';
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { fixtureFetch } from './fixture-http.ts';

export async function verifyIdeeoUi(options: {bundle:string;live?:boolean;apiUrl:string;productUrl:string;apiOrigin:string;cookie:string;otherToken:string; answer(text:string):void;
  revoke():Promise<void>;restore():Promise<void>;attempts():Promise<number>}) {
  const root=await mkdtemp(join(tmpdir(),'ideeo-ui-'));
  const cleanup=async()=>{
    const target=await realpath(root);
    if(dirname(target)!==await realpath(tmpdir()) || !basename(target).startsWith('ideeo-ui-'))throw new Error('Unexpected UI cleanup target');
    await rm(target,{recursive:true,force:true,maxRetries:20,retryDelay:100});
  };
  let foreign=false, drop=false, hold=false;
  let releaseHeld: (()=>void) | undefined, reachedHeld: (()=>void) | undefined;
  const repository=fileURLToPath(new URL('../../',import.meta.url));
  const server=await preview({configFile:false,root:repository,envFile:false,logLevel:'error',build:{outDir:options.bundle},
    plugins:[{name:'isolated-tenant-exchange',configurePreviewServer(vite){
      vite.middlewares.use(async(req,res,next)=>{
        if(req.url==='/api/nico/token') {
          if(foreign){res.setHeader('content-type','application/json');res.end(JSON.stringify({token:options.otherToken}));return;}
          try {
            const result=await fixtureFetch(options.apiUrl+'/api/nico/token',{method:'POST',headers:{origin:options.apiOrigin,'content-type':'application/json',cookie:req.headers.cookie??''},body:'{}'});
            res.writeHead(result.status,{'content-type':'application/json','cache-control':'no-store'});res.end(await result.text());
          }catch{res.writeHead(503);res.end();}return;
        }
        if(drop && req.method==='POST' && /^\/v2\/conversations\/[a-f0-9-]+\/turns$/.test(req.url??'')) {
          drop=false;
          try {
            const chunks:Buffer[]=[];for await(const chunk of req) chunks.push(chunk);
            const result=await fixtureFetch(options.productUrl+req.url,{method:'POST',headers:{authorization:req.headers.authorization??'',
              'content-type':'application/json','idempotency-key':String(req.headers['idempotency-key'])},body:Buffer.concat(chunks).toString('utf8')});
            assert.equal(result.status,200);await result.text();res.destroy();
          }catch{res.writeHead(503);res.end();}return;
        }
        if(hold && req.method==='GET' && req.url?.startsWith('/v2/conversations/')) {
          hold=false;
          try {
            const response=await fixtureFetch(options.productUrl+req.url,{headers:{authorization:req.headers.authorization??''}});
            const body=await response.text();
            const released=new Promise<void>(resolve=>{releaseHeld=resolve;});reachedHeld?.();await released;
            if(!res.destroyed){res.writeHead(response.status,{'content-type':'application/json'});res.end(body);}
          }catch{if(!res.destroyed){res.writeHead(503);res.end();}}return;
        }
        next();
      });
    }}],preview:{host:'127.0.0.1',port:0,strictPort:true,proxy:{'/v2':{target:options.productUrl}}}});
  let page: Awaited<ReturnType<typeof import('./headless-chrome.ts').openHeadlessChrome>> | undefined;
  try {
    const address=server.httpServer.address();assert.ok(address && typeof address!=='string');
    const url=`http://127.0.0.1:${address.port}`;
    process.env.OMB_CDP_CHROME ??= process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'/usr/bin/google-chrome';
    const {openHeadlessChrome}=await import('./headless-chrome.ts');
    const profile=join(root,'chrome');await mkdir(profile);page=await openHeadlessChrome(profile);
    await page.send('Network.enable');
    await page.send('Network.setCookie',{name:'payme_session',value:options.cookie,url,httpOnly:true,sameSite:'Strict'});
    await page.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await page.send('Page.navigate',{url:url+'/ideeo.html'});
    console.log('UI fixture: checking initial render');
    await page.until(`document.querySelector('textarea') && !document.querySelector('textarea').disabled`,60000);
    const send=async(text:string,label='Send message')=>{
      await page!.evaluate(`(()=>{const input=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,${JSON.stringify(text)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
      const button=JSON.stringify(`button[aria-label="${label}"]`);
      await page!.until(`document.querySelector(${button}) && !document.querySelector(${button}).disabled`);
      await page!.evaluate(`document.querySelector(${button}).click()`);
    };
    drop=!options.live;
    await send('Write a friendly invitation under thirty words to the invented moon garden. Mention moon garden. Do not use tools.');
    if(!options.live){
      await page.until(`document.querySelector('[role="status"]').textContent.includes('could not be confirmed')`);
      const beforeReload=await options.attempts();
      await page.evaluate(`Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Reload conversation').click()`);
      await page.until(`document.querySelector('[role="log"]').textContent.includes('moon garden') && document.querySelector('textarea').value===''`);
      assert.equal(await options.attempts(),beforeReload);
    }
    await page.until(`document.querySelector('[role="log"]').children.length===1 && !document.querySelector('textarea').disabled`);
    const firstAnswer=await page.evaluate(`document.querySelector('[role="log"]').firstElementChild.lastElementChild.textContent`);
    assert.match(firstAnswer,/moon garden/i);
    assert.ok(firstAnswer.trim().split(/\s+/).length<30);
    const firstTranscript=await page.evaluate(`document.querySelector('[role="log"]').textContent`);
    const conversation=await page.evaluate('location.hash');assert.match(conversation,/^#[a-f0-9-]{36}$/);
    const first=await options.attempts();
    console.log('UI fixture: committed first answer');
    await page.send('Page.reload');await page.until(`document.querySelector('[role="log"]')?.textContent===${JSON.stringify(firstTranscript)}`);
    assert.equal(await options.attempts(),first);
    drop=true;await send('Make the invented invitation shorter, under twelve words. Keep moon garden. Do not use tools.');
    await page.until(`document.querySelector('[role="status"]').textContent.includes('could not be confirmed')`);
    const afterDrop=await options.attempts();assert.equal(afterDrop,first+1);
    await page.evaluate(`document.querySelector('button[aria-label="Send message"]').click()`);
    await page.until(`document.querySelector('[role="log"]').children.length===2 && !document.querySelector('textarea').disabled`);
    const revisedAnswer=await page.evaluate(`document.querySelector('[role="log"]').lastElementChild.lastElementChild.textContent`);
    assert.match(revisedAnswer,/moon garden/i);assert.ok(revisedAnswer.trim().split(/\s+/).length<12);
    assert.equal(await options.attempts(),afterDrop);
    await send('Look up the synthetic color using fixture_catalog, then say the color.');
    await page.until(`document.querySelector('[role="log"]').children.length===3 && !document.querySelector('textarea').disabled`);
    if(options.live)assert.match(await page.evaluate(`document.querySelector('[role="log"]').lastElementChild.lastElementChild.textContent`),/blue/i);
    assert.equal(await options.attempts(),afterDrop+2);
    const local=await page.evaluate(`JSON.stringify({local:{...localStorage},session:{...sessionStorage}})`);
    for(const secret of [options.cookie,options.otherToken,'invented garden','moon garden'])assert.ok(!local.includes(secret));
    const evidence=join(repository,'output',options.live?'ideeo-live-ui':'ideeo-free-form-ui');await mkdir(evidence,{recursive:true});
    for(const skin of ['daylight','midnight'])for(const width of [1440,390]){
      await page.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      await page.evaluate(`document.documentElement.setAttribute('data-skin',${JSON.stringify(skin)});document.documentElement.setAttribute('omb-skin',${JSON.stringify(skin)})`);
      assert.equal(await page.evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
      await writeFile(join(evidence,`${skin}-${width}.png`),await page.capture());
    }
    await options.revoke();await page.send('Page.reload');
    await page.until(`document.querySelector('[role="status"]')?.textContent.includes('Sign in through your app')`);
    assert.equal(await page.evaluate(`document.querySelector('[role="log"]').textContent`),'');
    await options.restore();foreign=true;await page.send('Page.reload');
    await page.until(`document.querySelector('[role="status"]')?.textContent.includes('This conversation is unavailable')`);
    assert.equal(await page.evaluate(`document.querySelector('[role="log"]').textContent`),'');
    assert.equal(await options.attempts(),afterDrop+2);
    foreign=false;await page.send('Page.reload');
    await page.until(`document.querySelector('[role="log"]')?.textContent.includes('moon garden')`);
    if(!options.live) {
      options.answer('An invented <img src="/not-an-image" onerror="alert(1)"> example.');
      await send('Show an invented HTML example as text.');
      await page.until(`document.querySelector('[role="log"]').textContent.includes('<img src=')`);
      assert.equal(await page.evaluate(`document.querySelectorAll('[role="log"] img').length`),0);
      options.answer('');
      await send('Draft an invitation for the invented lake picnic.');
      await page.until(`document.querySelector('[role="status"]').textContent.includes('could not be confirmed')`);
      const afterFailure=await options.attempts();
      const restated='Draft a short invitation for a picnic by the invented lake on Sunday.';
      await send(restated,'Check previous message');
      await page.until(`document.querySelector('[role="status"]').textContent.includes('no saved answer')`);
      assert.equal(await options.attempts(),afterFailure);
      assert.equal(await page.evaluate(`document.querySelector('textarea').value`),restated);
      assert.equal(await page.evaluate(`document.querySelector('[role="log"]').textContent.includes('lake picnic')`),false);
      options.answer('Join us by the lake on Sunday.');
      await send(restated);
      await page.until(`document.querySelector('[role="log"]').textContent.includes('Join us by the lake on Sunday.')`);
      assert.equal(await options.attempts(),afterFailure+1);
    }
    hold=true;const reached=new Promise<void>(resolve=>{reachedHeld=resolve;});
    await page.evaluate(`window.dispatchEvent(new Event('focus'))`);
    await Promise.race([reached,new Promise((_,reject)=>setTimeout(()=>reject(new Error('History delay gate missed')),10000))]);
    await page.evaluate(`Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='New conversation').click()`);
    await page.until(`location.hash==='' && document.querySelector('[role="log"]').textContent==='Start a conversation below.'`);
    releaseHeld?.();
    await page.until(`!document.querySelector('textarea').disabled`);
    assert.equal(await page.evaluate(`document.querySelector('[role="log"]').textContent`),'Start a conversation below.');
    console.log(JSON.stringify({ui:'actual React / tenant API / product / PostgreSQL',provider:options.live?'OpenAI Luna':'scripted fixture',firstAnswer,revisedAnswer,
      checks:['cookie exchange','committed chat','reload without inference','lost response same-key replay','authorized tool','no token or transcript web storage','four layouts','revocation clears history','other tenant denied',...(!options.live?['first-send recovery by key','edited draft after failed turn','inert assistant HTML']:[]),'stale history suppressed']}));
  } finally {
    releaseHeld?.();page?.close();await server.close();await options.restore();
    await cleanup();
  }
}
