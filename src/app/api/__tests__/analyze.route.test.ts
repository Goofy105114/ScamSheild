import { describe, it, expect, beforeAll } from "vitest";
import { POST } from "@/app/api/analyze/route";

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "route-test-analyze", ...headers },
    body: JSON.stringify(body),
  });
}

beforeAll(() => {
  delete process.env.ANTHROPIC_API_KEY;
});

describe("POST /api/analyze", () => {
  it("returns a full analysis for the canonical job scam scenario", async () => {
    const response = await POST(
      makeRequest({
        text: "Congratulations! You have been selected for a work-from-home position. Pay a registration charge within 10 minutes to secure your position.",
      })
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.analysis).toBeDefined();
    expect(["HIGH", "CRITICAL"]).toContain(body.analysis.riskLevel);
    expect(body.analysis.primaryCategory).toBe("job_scam");
    expect(Array.isArray(body.analysis.evidence)).toBe(true);
    expect(body.analysis.evidence.length).toBeGreaterThan(0);
  });

  it("rejects an empty text field with 400 and a structured error", async () => {
    const response = await POST(makeRequest({ text: "" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_INPUT");
    expect(typeof body.error.message).toBe("string");
  });

  it("rejects missing fields with 400", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it("rejects malformed JSON with 400", async () => {
    const request = new Request("http://localhost/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "route-test-analyze-badjson" },
      body: "{not valid json",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_JSON");
  });

  it("rejects text over the length limit with 400", async () => {
    const response = await POST(makeRequest({ text: "a".repeat(8500) }, { "x-forwarded-for": "route-test-analyze-long" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_INPUT");
  });

  it("does not flag an ordinary benign message as high risk", async () => {
    const response = await POST(
      makeRequest(
        { text: "Hey, are we still on for lunch tomorrow at 1pm?" },
        { "x-forwarded-for": "route-test-analyze-benign" }
      )
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.analysis.riskLevel).toBe("LOW");
  });
});
