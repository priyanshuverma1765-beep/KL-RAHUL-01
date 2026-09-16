import { json, sameOrigin, withinRateLimit } from "@/lib/request-guard";

const formats = new Set(["Test", "ODI", "T20I", "IPL"]);

function validPayload(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const value = body as Record<string, unknown>;
  const format = String(value.format ?? "");
  const opponent = String(value.opponent ?? "").trim();
  const venue = String(value.venue ?? "").trim();
  const battingPosition = Number(value.batting_position);
  const inningsNumber = Number(value.innings_number ?? 1);
  if (!formats.has(format) || !opponent || opponent.length > 100 || !venue || venue.length > 160) return null;
  if (!Number.isInteger(battingPosition) || battingPosition < 1 || battingPosition > 11) return null;
  if (!Number.isInteger(inningsNumber) || inningsNumber < 1 || inningsNumber > 4) return null;
  return { format, opponent, venue, batting_position: battingPosition, innings_number: inningsNumber, chasing: Boolean(value.chasing) };
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Cross-origin requests are not accepted." }, { status: 403 });
  if (!withinRateLimit(request, 12)) return json({ error: "Too many estimates. Please wait a minute and try again." }, { status: 429 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ error: "Send match context as JSON." }, { status: 415 });

  try {
    const payload = validPayload(await request.json());
    if (!payload) return json({ error: "The match context is invalid." }, { status: 400 });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const apiUrl = (process.env.KLR_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) return json({ error: "The prediction service rejected this request." }, { status: 502 });
      return json(await response.json());
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return json({ error: "The prediction service is unavailable. Start the FastAPI service or configure KLR_API_URL." }, { status: 503 });
  }
}
