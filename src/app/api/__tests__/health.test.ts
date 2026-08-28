import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns a 200 with status ok", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("scamshield");
    expect(typeof body.aiConfigured).toBe("boolean");
    expect(typeof body.time).toBe("string");
  });
});
