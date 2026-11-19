import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { randomBytes } from 'node:crypto';
import https from 'node:https';
import { createServer, request } from 'node:http';

test('fixture wire details require explicit activation and exclude secrets and reasoning',async()=>{
  const secret=randomBytes(32).toString('hex'),priorKey=process.env.IDEEO_DIAGNOSTIC_CANARY,priorDetail=process.env.IDEEO_TRACE_MODEL_DETAILS;
  process.env.IDEEO_DIAGNOSTIC_CANARY=secret;
  let content='An invented workshop.',args='{}';
  const server=createServer((_req,res)=>{res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({choices:[{message:{role:'assistant',content,
    reasoning_content:'private-reasoning-canary',tool_calls:[{function:{name:'write_note',arguments:args}}]},finish_reason:'tool_calls'}]}));});
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address();assert.ok(address&&typeof address!=='string');
  const intercepted=mock.method(https,'request',((...parameters:Parameters<typeof request>)=>Reflect.apply(request,undefined,parameters)) as typeof https.request);
  let output='';
  const stderr=mock.method(process.stderr,'write',((chunk:unknown)=>{output+=String(chunk);return true;}) as typeof process.stderr.write);
  try {
    await import(new URL('../../scripts/testing/model-wire-shape.mjs',import.meta.url).href);
    const read=async()=>{
      output='';await new Promise<void>((resolve,reject)=>{const req=https.request(`http://127.0.0.1:${address.port}`,res=>{res.resume();res.on('end',resolve);});req.on('error',reject);req.end();});
      assert.ok(!output.includes(secret)&&!output.includes('private-reasoning-canary'));
      return JSON.parse(output).evaluation_wire_shape;
    };
    delete process.env.IDEEO_TRACE_MODEL_DETAILS;
    const ordinary=await read();assert.equal(ordinary.text,undefined);assert.equal(ordinary.tool_arguments,undefined);
    process.env.IDEEO_TRACE_MODEL_DETAILS='synthetic-content-only';
    const detail=await read();assert.equal(detail.text,content);assert.deepEqual(detail.tool_arguments,['{}']);
    content=secret;args=JSON.stringify({text:secret});
    const protectedResult=await read();assert.equal(protectedResult.text,undefined);assert.deepEqual(protectedResult.tool_arguments,['withheld']);
  }finally{
    stderr.mock.restore();intercepted.mock.restore();
    if(priorKey===undefined)delete process.env.IDEEO_DIAGNOSTIC_CANARY;else process.env.IDEEO_DIAGNOSTIC_CANARY=priorKey;
    if(priorDetail===undefined)delete process.env.IDEEO_TRACE_MODEL_DETAILS;else process.env.IDEEO_TRACE_MODEL_DETAILS=priorDetail;
    await new Promise<void>(resolve=>{server.close(()=>resolve());server.closeAllConnections();});
  }
});
