import { createHash } from 'node:crypto';

/** Hash sensitive payloads for audit logs (POPIA data minimization). */
export function hashPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Exponential backoff with jitter. */
export async function withBackoff<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; baseMs?: number; maxMs?: number } = {},
): Promise<T> {
  const retries = opts.retries ?? 3;
  const baseMs = opts.baseMs ?? 200;
  const maxMs = opts.maxMs ?? 5_000;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      const delay = Math.min(maxMs, baseMs * 2 ** attempt) + Math.floor(Math.random() * 100);
      await sleep(delay);
    }
  }
  throw lastError;
}
