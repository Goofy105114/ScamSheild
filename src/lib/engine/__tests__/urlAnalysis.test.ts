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

  it("does not flag the real google.com merely for containing the brand name", () => {
    const result = analyzeUrl("https://www.google.com");
    expect(result.lookalikeOf).toBeNull();
    expect(result.signals.some((s) => s.severity === "high")).toBe(false);
  });

  it("flags a fake subdomain impersonating a brand with the real registrable domain elsewhere", () => {
    const result = analyzeUrl("https://accounts-google-security.example.com/login");
    expect(result.hostname).toBe("accounts-google-security.example.com");
    expect(result.lookalikeOf).toBe("google");
  });

  it("scores a lookalike-domain URL as HIGH or CRITICAL risk even with no surrounding message text", async () => {
    const { runAnalysis } = await import("../analyze");
    const analysis = await runAnalysis({
      type: "url",
      rawText: "https://accounts-google-security.example.com/login",
      submittedUrl: "https://accounts-google-security.example.com/login",
    });
    expect(["HIGH", "CRITICAL"]).toContain(analysis.riskLevel);
  });

  it("scores an @ deception URL as HIGH or CRITICAL risk even with no surrounding message text", async () => {
    const { runAnalysis } = await import("../analyze");
    const analysis = await runAnalysis({
      type: "url",
      rawText: "https://google.com@secure-login-account.com/verify",
      submittedUrl: "https://google.com@secure-login-account.com/verify",
    });
    expect(["HIGH", "CRITICAL"]).toContain(analysis.riskLevel);
  });

  it("flags userinfo-based @ deception where the real hostname comes after the @", () => {
    const result = analyzeUrl("https://google.com@secure-login-account.com/verify");
    expect(result.hostname).toBe("secure-login-account.com");
    expect(result.signals.some((s) => s.id === "embedded_credentials_or_at")).toBe(true);
    expect(result.signals.find((s) => s.id === "embedded_credentials_or_at")?.severity).toBe("high");
  });
});
