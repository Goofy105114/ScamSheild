import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/analyze/url/route";

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/analyze/url", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "route-test-url", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analyze/url", () => {
  it("flags a lookalike phishing domain", async () => {
    const response = await POST(
      makeRequest({ url: "http://secure-login.icicibank.verify-account.top/session?token=abc123" })
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.analysis.urlAnalysis.isValidUrl).toBe(true);
    expect(body.analysis.urlAnalysis.lookalikeOf).toBe("icici");
    expect(body.analysis.riskScore).toBeGreaterThan(20);
  });

  it("flags an IP-based URL", async () => {
    const response = await POST(makeRequest({ url: "http://192.168.4.55/login" }, { "x-forwarded-for": "route-test-url-ip" }));
    const body = await response.json();
    expect(body.analysis.urlAnalysis.isIpAddress).toBe(true);
  });

  it("rejects an empty url with 400", async () => {
    const response = await POST(makeRequest({ url: "" }, { "x-forwarded-for": "route-test-url-empty" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_INPUT");
  });

  it("gracefully handles a non-URL string with unable-to-verify language", async () => {
    const response = await POST(makeRequest({ url: "$$$ not a url" }, { "x-forwarded-for": "route-test-url-invalid" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.analysis.urlAnalysis.isValidUrl).toBe(false);
    expect(body.analysis.urlAnalysis.verificationStatement).toContain("Unable to verify");
  });
});
