import { chatImage, type ChatImagePart } from '../drivers/chat-images.ts';

export type CapabilityOutput = Readonly<{text:string;images?:readonly ChatImagePart[]}>;
export function capabilityImages(value: unknown): ChatImagePart[] {
  if(value===undefined)return [];
  if(!Array.isArray(value)||value.length>2)throw new Error('Invalid workspace images');
  return value.map(image=>{
    if(!image||Object.keys(image).sort().join(',')!=='image_url,type'||image.type!=='image_url'||!image.image_url||Object.keys(image.image_url).join(',')!=='url'||typeof image.image_url.url!=='string')throw new Error('Invalid workspace image');
    const match=/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(image.image_url.url);
    if(!match||match[2].length>700000)throw new Error('Invalid workspace image');
    return chatImage({mimeType:match[1],data:match[2]});
  });
}
