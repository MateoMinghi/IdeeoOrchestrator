import { lstat, realpath } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { HOST_FILE_TOOLS, hostFileRelay } from '../host-file-tools.ts';
import type { CapabilityHandler } from './capability-executor.ts';
import type { CapabilityConfiguration } from './capability-config.ts';

export async function workspaceFileTools(directory:string) {
  const root=await realpath(directory),relay=hostFileRelay(root);
  const tools:CapabilityConfiguration['tools']=HOST_FILE_TOOLS.map(tool=>({...tool,description:tool.description.replaceAll('this computer','this isolated workspace').replace("the person's home folder",'the workspace root'),
    inputSchema:structuredClone(tool.inputSchema) as Record<string,unknown>,family:'files',permission:tool.name==='read_file'||tool.name==='list_files'?'tool:files:read':'tool:files:write'}));
  const handlers=new Map<string,CapabilityHandler>(tools.map(tool=>[tool.name,async(args,context)=>{
    const path=args.path===undefined&&tool.name==='list_files'?'':args.path;
    if(typeof path!=='string'||isAbsolute(path)||path.includes(':')||path.includes('\0')||path.split(/[\\/]/).some(part=>part==='..')) throw new Error('Workspace-relative path required');
    const target=resolve(root,path),inside=relative(root,target);
    if(inside==='..'||inside.startsWith('..'+sep)||isAbsolute(inside))throw new Error('Workspace path denied');
    let parent=root;
    for(const part of inside.split(sep).filter(Boolean)){
      parent=join(parent,part);
      try{if((await lstat(parent)).isSymbolicLink())throw new Error('Workspace links are not admitted');}
      catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    }
    context.signal.throwIfAborted();
    const result=await relay({name:tool.name,arguments:{...args,path:target}});
    context.signal.throwIfAborted();
    if(!result||result.isError)throw new Error('Workspace file operation failed');
    return result.content.map(part=>part.text).join('\n').replaceAll(root,'workspace:');
  }]));
  return {tools,handlers};
}
