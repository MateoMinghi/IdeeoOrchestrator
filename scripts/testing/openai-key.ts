import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

export async function readEvaluationKey(path: string) {
  return readKey(path,'OPENAI_API_KEY');
}
export async function readGeminiEvaluationKey(path: string) {
  return readKey(path,'GEMINI_API_KEY');
}
async function readKey(path: string, name: 'OPENAI_API_KEY'|'GEMINI_API_KEY') {
  const key = parseEnv(await readFile(path, 'utf8'))[name];
  if (!key || key.length < 20 || key.length > 1024 || /[^\x21-\x7e]/.test(key)) throw new Error('Evaluation key unavailable');
  return key;
}
