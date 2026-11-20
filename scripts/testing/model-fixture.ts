import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { fixtureAnswers, fixturePrompts } from '../../server/ideeo/inference-policy.ts';

export async function launchModelFixture() {
  const credential=randomBytes(32).toString('base64url');
  const observed: {messages:unknown[];tools:unknown;authorization:string|undefined;body:Record<string,unknown>}[]=[];
  let fault='none', calls=0, redirects=0;
  let beforeReply:((call:number)=>Promise<void>)|undefined;
  let answerText: ((messages: readonly {role:string;content:string}[]) => string) | undefined;
  let scriptedTool: ((messages: readonly {role:string;content:string}[]) =>
    {name:string;args:Record<string,unknown>}|undefined) | undefined;
  const server=createServer(async(req,res)=>{
    if(req.url==='/redirect-target'){redirects++;res.writeHead(500);res.end();return;}
    calls++;const call=calls;
    const reply=(status:number,body:unknown)=>{if(!res.destroyed){res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(body));}};
    try {
      if(req.url!=='/v1/chat/completions' || req.method!=='POST' || req.headers.authorization!==`Bearer ${credential}`){reply(401,{});return;}
      const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(chunk);
      const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      observed.push({messages:body.messages,tools:body.tools,authorization:req.headers.authorization,body});
      await beforeReply?.(call);
      if(fault==='timeout')return;
      if(fault==='connection-reset'){req.socket.destroy();return;}
      if(fault==='redirect'){res.writeHead(307,{location:'/redirect-target'});res.end();return;}
      if(fault==='outage' || fault==='transient' && call===1){reply(503,{secret:'synthetic-private-provider-error'});return;}
      if(fault==='oversized'){reply(200,{content:'x'.repeat(20000)});return;}
      if(fault==='malformed-json'){res.writeHead(200,{'content-type':'application/json'});res.end('{');return;}
      if(fault==='wrong-content-type'){res.writeHead(200,{'content-type':'text/plain'});res.end('{}');return;}
      const messages=body.messages as {role:string;content:string}[];
      const prompt=messages.findLast(message=>message.role==='user')?.content;
      const text = prompt===fixturePrompts['synthetic.draft'] ? 'You are invited to our synthetic picnic on Saturday.'
        : prompt===fixturePrompts['synthetic.revise'] ? 'Join our synthetic picnic on Saturday.'
        : prompt===fixturePrompts['synthetic.recall'] ? (messages.some(m=>m.role==='assistant' && m.content==='Join our synthetic picnic on Saturday.') ? 'The last invitation was: Join our synthetic picnic on Saturday.' : 'missing synthetic context')
        : prompt===fixturePrompts['synthetic.follow-up'] ? 'The synthetic color is blue.' : [...fixtureAnswers][0];
      const toolRound=prompt===fixturePrompts['synthetic.follow-up'] && messages.at(-1)?.role!=='tool';
      const scripted=scriptedTool?.(messages);
      const tool=!!scripted || toolRound || fault==='unknown-tool' || fault==='repeat-tool';
      const callId=scripted?'fixture-call-'+(1+messages.filter(m=>m.role==='tool').length):'fixture-call-1';
      const content=fault==='credential' ? credential : fault==='banking' ? 'Your balance is $123.45.' : fault==='secret' ? 'synthetic-private-output-canary' : fault==='empty' ? '' : tool ? null : answerText?.(messages) ?? text;
      reply(200,{choices:[{message:{role:fault==='wrong-role'?'user':'assistant',...(fault==='missing-content'||fault==='omitted-tool-content'&&tool?{}:{content}),reasoning_content:'synthetic-private-reasoning',reasoning_details:[{text:'synthetic-private-reasoning'}],
        ...(tool ? {tool_calls:[{id:callId,type:'function',function:{name:scripted?.name??(fault==='unknown-tool'?'host_shell':'fixture_catalog'),arguments:JSON.stringify(scripted?.args??{item:'color'})}}]} : {})},
        finish_reason:fault==='length'?'length':fault==='finish-mismatch'?'tool_calls':tool?'tool_calls':'stop'}],...(fault==='unknown-usage'?{}:{usage:{prompt_tokens:15,completion_tokens:10}})});
    } catch{reply(500,{});}
  });
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address();if(!address || typeof address==='string')throw new Error('Model fixture listener unavailable');
  return {url:`http://127.0.0.1:${address.port}/v1`,credential,observed,
    setFault(value:string){fault=value;calls=0;},onCheck(hook?:typeof beforeReply){beforeReply=hook;},
    setAnswer(answer?: typeof answerText){answerText=answer;},
    setTool(script?:typeof scriptedTool){scriptedTool=script;},
    observations:()=>({calls,redirects}),
    stop:()=>new Promise<void>(resolve=>{server.close(()=>resolve());server.closeAllConnections();}),
  };
}
