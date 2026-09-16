const buckets = new Map<string, { count: number; resetAt: number }>();

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function withinRateLimit(request: Request, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const bucket = buckets.get(address);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(address, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("X-Content-Type-Options", "nosniff");
  return Response.json(data, { ...init, headers });
}
