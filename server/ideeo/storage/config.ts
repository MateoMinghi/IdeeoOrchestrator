export type StorageConfiguration = Readonly<{
  mode: 'synthetic'; databaseEnv: string; keyringEnv: string; fingerprintKeyEnv: string;
  activeKeyId: string; contentTtlSeconds: number; replayTtlSeconds: number;
}>;

export function parseStorageConfiguration(value: unknown): StorageConfiguration {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid storage configuration');
  const v = value as Record<string, unknown>;
  const fields = ['mode', 'databaseEnv', 'keyringEnv', 'fingerprintKeyEnv', 'activeKeyId', 'contentTtlSeconds', 'replayTtlSeconds'];
  if (Object.keys(v).length !== fields.length || fields.some(k => !Object.hasOwn(v, k)) || v.mode !== 'synthetic') throw new Error('Only synthetic storage is qualified');
  for (const key of ['databaseEnv', 'keyringEnv', 'fingerprintKeyEnv']) {
    if (typeof v[key] !== 'string' || !/^[A-Z][A-Z0-9_]{0,99}$/.test(v[key])) throw new Error('Invalid storage secret reference');
  }
  if (typeof v.activeKeyId !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(v.activeKeyId)) throw new Error('Invalid encryption key ID');
  if (!Number.isSafeInteger(v.contentTtlSeconds) || Number(v.contentTtlSeconds) < 1 || Number(v.contentTtlSeconds) > 86400
    || !Number.isSafeInteger(v.replayTtlSeconds) || Number(v.replayTtlSeconds) <= Number(v.contentTtlSeconds) || Number(v.replayTtlSeconds) > 604800) throw new Error('Invalid storage retention');
  return Object.freeze(v as StorageConfiguration);
}

export function storageDatabaseUrl(raw: string | undefined, role: 'ideeo_runtime' | 'ideeo_maintenance' | 'fixture_admin'): string {
  if (!raw) throw new Error('Missing storage credential');
  const url = new URL(raw);
  if (url.protocol !== 'postgres:' || url.hostname !== '127.0.0.1' || !url.port || url.search || url.hash
    || url.username !== role || !url.password || !/^\/ideeo_fixture_[a-f0-9]{24}$/.test(url.pathname)) throw new Error('Only explicit disposable PostgreSQL profiles are qualified');
  return url.href;
}
