/**
 * Cloudflare bindings (D1, R2, secrets) for server code.
 *
 * In production the Nitro `cloudflare-module` entry sets `globalThis.__env__` on every
 * request. Under `npm run dev` (plain Vite on Node) we create the same bindings locally with
 * wrangler's platform proxy, which reads wrangler.jsonc and .dev.vars and stores data in
 * .wrangler/state — the same place `wrangler d1 migrations apply --local` writes to.
 */

/* Minimal shapes of the Workers APIs we use, to avoid pulling in @cloudflare/workers-types
   (its globals clash with the DOM lib this app compiles against). */
export interface D1Result<T> {
  results: T[];
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}
export interface R2ObjectBody {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
}
export interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  delete(key: string | string[]): Promise<void>;
}

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APP_URL?: string;
}

type Global = typeof globalThis & {
  __env__?: Env;
  __motohubDevEnv__?: Promise<Env>;
};

export async function getEnv(): Promise<Env> {
  const g = globalThis as Global;
  if (g.__env__) return g.__env__;
  if (import.meta.env.DEV) {
    g.__motohubDevEnv__ ??= import("wrangler").then(async ({ getPlatformProxy }) => {
      const proxy = await getPlatformProxy({ persist: true });
      return proxy.env as unknown as Env;
    });
    return g.__motohubDevEnv__;
  }
  throw new Error("Cloudflare bindings are not available (DB, MEDIA). Is this running on Workers?");
}
