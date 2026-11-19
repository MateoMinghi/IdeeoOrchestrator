import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
import { permittedCapabilityText, secretValues } from '../../server/ideeo/text-policy.ts';

const forbidden=secretValues(process.env);

const request=https.request;
https.request=function(...args) {
  const started=Date.now();
  const req=Reflect.apply(request,this,args);
  let failed=false;
  const failure=(error,stage)=>{
    if(failed)return;
    failed=true;
    const knownCodes=['ABORT_ERR','ECONNRESET','ECONNREFUSED','ENOTFOUND','EAI_AGAIN','ETIMEDOUT'];
    console.error(JSON.stringify({evaluation_wire_shape:{stage,elapsed_ms:Date.now()-started,
      error_code:knownCodes.includes(error?.code)?error.code:'other',
      timeout_cause:error?.cause?.name==='TimeoutError',aborted:req.destroyed}}));
  };
  req.on('error',error=>failure(error,'request'));
  req.on('response',res=>{
    res.on('error',error=>failure(error,'response'));
    const chunks=[];let bytes=0;
    res.on('data',chunk=>{bytes+=chunk.length;if(bytes<=16384)chunks.push(chunk);});
    res.on('end',()=>{
      try{
        if(bytes>16384)return;
        const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
        const choice=body.choices?.[0],message=choice?.message;
        console.error(JSON.stringify({evaluation_wire_shape:{status:res.statusCode,elapsed_ms:Date.now()-started,assistant_role:message?.role==='assistant',
          content_type:typeof message?.content,content_length:typeof message?.content==='string'?message.content.length:0,
          content_has_url:typeof message?.content==='string'&&/https?:\/\//.test(message.content),
          tool_calls:Array.isArray(message?.tool_calls)?message.tool_calls.length:0,
          tool_names:Array.isArray(message?.tool_calls)?message.tool_calls.map(call=>/^[a-z_][a-z0-9_]{0,63}$/.test(call.function?.name)?call.function.name:'invalid'):[],
          ...(process.env.IDEEO_TRACE_MODEL_DETAILS==='synthetic-content-only'?{
            tool_arguments:Array.isArray(message?.tool_calls)?message.tool_calls.map(call=>permittedCapabilityText(call.function?.arguments,8192,forbidden)?call.function.arguments:'withheld'):[],
            text:permittedCapabilityText(message?.content,2000,forbidden)?message.content:undefined}:{}),
          tool_finish:choice?.finish_reason==='tool_calls',stop_finish:choice?.finish_reason==='stop',
          argument_types:Array.isArray(message?.tool_calls)?message.tool_calls.map(call=>typeof call.function?.arguments):[]}}));
      }catch{console.error(JSON.stringify({evaluation_wire_shape:{status:res.statusCode,parse_error:true}}));}
    });
  });
  return req;
};
syncBuiltinESMExports();
