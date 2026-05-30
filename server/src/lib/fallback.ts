import type { FallbackResult } from "../types.js";

/**
 * Fallback Controller (design.md Property 5).
 * Wraps every fallible real-service call with a timeout + error guard.
 *   - disabled        -> immediately return fallback, labeled "Simulated"
 *   - resolves in time -> real value, labeled "Live"
 *   - timeout / throws -> fallback value, labeled "Simulated"
 * The fallback function is assumed total (never throws).
 */
export async function runWithFallback<T>(opts: {
  enabled: boolean;
  timeoutMs: number;
  attempt: () => Promise<T>;
  fallback: () => T | Promise<T>;
}): Promise<FallbackResult<T>> {
  const { enabled, timeoutMs, attempt, fallback } = opts;

  if (!enabled) {
    return { value: await fallback(), label: "Simulated", fellBack: true, reason: "disabled" };
  }

  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("__timeout__")), timeoutMs);
  });

  try {
    const value = await Promise.race([attempt(), timeout]);
    return { value, label: "Live", fellBack: false };
  } catch (err) {
    const reason = err instanceof Error && err.message === "__timeout__" ? "timeout" : "error";
    return { value: await fallback(), label: "Simulated", fellBack: true, reason };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** fetch() with an AbortController timeout. */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs: number }
): Promise<Response> {
  const { timeoutMs, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
