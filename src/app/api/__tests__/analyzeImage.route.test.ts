import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/analyze/image/route";
import { MAX_IMAGE_BYTES } from "@/lib/validation";

function makeFormRequest(formData: FormData, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/analyze/image", {
    method: "POST",
    headers: { "x-forwarded-for": "route-test-image", ...headers },
    body: formData,
  });
}

describe("POST /api/analyze/image", () => {
  it("rejects a request with no image field", async () => {
    const formData = new FormData();
    formData.append("notimage", "hello");
    const response = await POST(makeFormRequest(formData, { "x-forwarded-for": "route-test-image-missing" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("MISSING_IMAGE");
  });

  it("rejects an unsupported MIME type", async () => {
    const formData = new FormData();
    const file = new File(["not an image"], "note.txt", { type: "text/plain" });
    formData.append("image", file);
    const response = await POST(makeFormRequest(formData, { "x-forwarded-for": "route-test-image-mime" }));
    expect(response.status).toBe(415);
    const body = await response.json();
    expect(body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("rejects an oversized image", async () => {
    const bigBuffer = new Uint8Array(MAX_IMAGE_BYTES + 1024);
    const file = new File([bigBuffer], "big.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("image", file);
    const response = await POST(makeFormRequest(formData, { "x-forwarded-for": "route-test-image-big" }));
    expect(response.status).toBe(413);
    const body = await response.json();
    expect(body.error.code).toBe("FILE_TOO_LARGE");
  });

  it("rejects malformed multipart data with 400", async () => {
    const request = new Request("http://localhost/api/analyze/image", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data", "x-forwarded-for": "route-test-image-badform" },
      body: "not actually multipart",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
