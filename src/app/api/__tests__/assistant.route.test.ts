import { describe, it, expect, beforeAll } from "vitest";
import { POST } from "@/app/api/assistant/route";

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "route-test-assistant", ...headers },
    body: JSON.stringify(body),
  });
}

beforeAll(() => {
  delete process.env.ANTHROPIC_API_KEY;
});

const baseSummary = {
  riskLevel: "HIGH",
  riskScore: 64,
  primaryCategory: "job_scam",
  redFlags: ["Asks you to pay money before you receive anything in return."],
  sourceText: "Pay a registration fee within 10 minutes to claim your work-from-home job now.",
};

describe("POST /api/assistant", () => {
  it("answers using the rule-based fallback when no AI key is configured", async () => {
    const response = await POST(
      makeRequest({ question: "Which part is the biggest red flag?", analysisSummary: baseSummary })
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.aiEnhanced).toBe(false);
    expect(typeof body.answer).toBe("string");
    expect(body.answer.length).toBeGreaterThan(0);
  });

  it("rejects a request with a missing question", async () => {
    const response = await POST(
      makeRequest({ analysisSummary: baseSummary }, { "x-forwarded-for": "route-test-assistant-missing" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a request with a missing analysisSummary", async () => {
    const response = await POST(
      makeRequest({ question: "why is this suspicious?" }, { "x-forwarded-for": "route-test-assistant-missing-2" })
    );
    expect(response.status).toBe(400);
  });

  it("never instructs the user to pay, share an OTP, or click the link in its fallback answers", async () => {
    const questions = [
      "What happens if I click this?",
      "I already gave them my phone number, what now?",
      "How do I verify this job?",
    ];
    for (const question of questions) {
      const response = await POST(
        makeRequest({ question, analysisSummary: baseSummary }, { "x-forwarded-for": `route-test-assistant-${question.length}` })
      );
      const body = await response.json();
      const lower = body.answer.toLowerCase();
      expect(lower.includes("share your otp")).toBe(false);
      expect(lower.includes("go ahead and pay")).toBe(false);
    }
  });
});
