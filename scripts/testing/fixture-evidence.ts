import { appendFile } from 'node:fs/promises';

export function errorEvidence(error:unknown):object {
  if (!(error instanceof Error)) return {name:'UnknownError'};
  const {code,signal}=error as NodeJS.ErrnoException & {signal?:string};
  return {name:error.name,code,signal,
    ...(error.cause ? {cause:errorEvidence(error.cause)} : {}),
    ...(error instanceof AggregateError ? {errors:error.errors.map(errorEvidence)} : {})};
}

export async function stopWithEvidence(path:string, fixtures:readonly {
  name:string; stop:(()=>Promise<void>)|undefined;
}[]) {
  const errors:unknown[]=[];
  for (const {name,stop} of fixtures) {
    const started=Date.now();
    let failure:object|undefined;
    try { await stop?.(); }
    catch (error) { failure=errorEvidence(error); errors.push(error); }
    const entry={phase:'shutdown',fixture:name,elapsed_ms:Date.now()-started,
      outcome:failure?'failed':stop?'stopped':'not_started',error:failure};
    try { await appendFile(path,JSON.stringify(entry)+'\n'); }
    catch (error) { errors.push(error); }
  }
  if (errors.length) throw new AggregateError(errors,'Fixture shutdown or reporting failed');
}
