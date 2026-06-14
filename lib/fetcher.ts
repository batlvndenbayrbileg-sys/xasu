"use client";

/** Safely parse a Response body as JSON; returns null on empty/invalid bodies. */
export async function safeJson<T = any>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** GET JSON with graceful fallback. */
export async function getJson<T = any>(url: string): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const body = await safeJson<any>(res);
    return { ok: res.ok, status: res.status, data: body?.data ?? null, error: body?.error };
  } catch {
    return { ok: false, status: 0, data: null, error: "Network error" };
  }
}

/** POST/DELETE JSON with graceful fallback. */
export async function sendJson<T = any>(
  url: string,
  method: "POST" | "DELETE" | "PUT" = "POST",
  payload?: unknown
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, {
      method,
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const body = await safeJson<any>(res);
    return { ok: res.ok, status: res.status, data: body?.data ?? null, error: body?.error };
  } catch {
    return { ok: false, status: 0, data: null, error: "Network error" };
  }
}
