import { answerKlrQuestion } from "@/lib/klr-assistant";
import { json, sameOrigin, withinRateLimit } from "@/lib/request-guard";

export const runtime = "nodejs";

export function GET() {
  return json({
    name: "Ask KLR",
    description: "A fan-made, retrieval-based AI statistics assistant. It is not KL Rahul.",
    method: "POST",
    source: "BCCI/IPL career snapshot, ICC-verified milestones and local Cricsheet innings data through 2026-08-26",
  });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Cross-origin requests are not accepted." }, { status: 403 });
  if (!withinRateLimit(request)) return json({ error: "Too many questions. Please wait a minute and try again." }, { status: 429 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Send the question as JSON." }, { status: 415 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 4096) return json({ error: "Request body is too large." }, { status: 413 });

  try {
    const body: unknown = await request.json();
    const question = typeof body === "object" && body !== null && "question" in body
      ? String((body as { question: unknown }).question).trim()
      : "";
    if (question.length < 3 || question.length > 300) {
      return json({ error: "Question must be between 3 and 300 characters." }, { status: 400 });
    }
    return json(answerKlrQuestion(question));
  } catch {
    return json({ error: "The question could not be processed." }, { status: 400 });
  }
}
