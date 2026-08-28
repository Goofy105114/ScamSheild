import { describe, it, expect } from "vitest";
import { analyzeUrl, extractUrlsFromText } from "../urlAnalysis";

describe("analyzeUrl", () => {
  it("flags an IP-based URL as high risk", () => {
    const result = analyzeUrl("http://192.168.4.55/login");
    expect(result.isIpAddress).toBe(true);
    expect(result.signals.some((s) => s.id === "ip_based_url")).toBe(true);
  });

  it("flags a lookalike domain", () => {
    const result = analyzeUrl("http://secure-login.icicibank.verify-account.top/session");
    expect(result.lookalikeOf).not.toBeNull();
  });

  it("flags http (non-https) URLs", () => {
    const result = analyzeUrl("http://example.com/page");
    expect(result.isHttps).toBe(false);
    expect(result.signals.some((s) => s.id === "no_https")).toBe(true);
  });

  it("does not falsely accuse a normal https domain of being IP-based", () => {
    const result = analyzeUrl("https://www.wikipedia.org/wiki/Security");
    expect(result.isIpAddress).toBe(false);
    expect(result.isHttps).toBe(true);
  });

  it("gracefully handles invalid input", () => {
    const result = analyzeUrl("not a url at all $$$");
    expect(result.isValidUrl).toBe(false);
    expect(result.verificationStatement).toContain("Unable to verify");
  });

  it("extracts urls embedded in a larger message", () => {
    const urls = extractUrlsFromText("Click here: bit.ly/abc123 to claim your prize now.");
    expect(urls.length).toBeGreaterThan(0);
  });
});
