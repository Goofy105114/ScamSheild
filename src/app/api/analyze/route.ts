import { AnalyzeTextSchema, jsonError } from "@/lib/validation";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";
import { runAnalysis } from "@/lib/engine/analyze";

export async function POST(req: Request) {
  const clientKey = getClientKey(req);
  const rate = checkRateLimit(clientKey);
  if (!rate.allowed) {
    return jsonError(429, "RATE_LIMITED", `Too many requests. Try again in ${rate.retryAfterSeconds} seconds.`);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = AnalyzeTextSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "INVALID_INPUT", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const analysis = await runAnalysis({ type: "text", rawText: parsed.data.text });
    return Response.json({ analysis });
  } catch {
    return jsonError(500, "ANALYSIS_FAILED", "Something went wrong while analyzing this content. Please try again.");
  }
}
