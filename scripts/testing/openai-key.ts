import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

export async function readEvaluationKey(path: string) {
  const key = parseEnv(await readFile(path, 'utf8')).OPENAI_API_KEY;
  if (!key || key.length < 20 || key.length > 1024 || /[^\x21-\x7e]/.test(key)) throw new Error('OpenAI evaluation key unavailable');
  return key;
}
