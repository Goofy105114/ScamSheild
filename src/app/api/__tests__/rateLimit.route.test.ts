import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/analyze/route";

function makeRequest(ip: string) {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ text: "checking rate limit behavior with a normal message" }),
  });
}

describe("rate limiting", () => {
  it("allows requests under the limit and blocks requests over it with 429", async () => {
    const ip = "route-test-ratelimit-unique-ip";
    const results: number[] = [];
    for (let i = 0; i < 22; i++) {
      const response = await POST(makeRequest(ip));
      results.push(response.status);
    }
    const successCount = results.filter((s) => s === 200).length;
    const limitedCount = results.filter((s) => s === 429).length;

    expect(successCount).toBe(20);
    expect(limitedCount).toBe(2);
  });

  it("tracks separate clients independently", async () => {
    const responseA = await POST(makeRequest("route-test-ratelimit-client-a"));
    const responseB = await POST(makeRequest("route-test-ratelimit-client-b"));
    expect(responseA.status).toBe(200);
    expect(responseB.status).toBe(200);
  });
});
