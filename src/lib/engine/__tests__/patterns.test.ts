import { describe, it, expect } from "vitest";
import { detectSignals } from "../patterns";

describe("detectSignals", () => {
  it("detects upfront payment and urgency in a job scam message", () => {
    const text =
      "Congratulations! You have been selected for a ₹75,000 work-from-home position. Pay ₹1,499 registration charges within 10 minutes to secure your position.";
    const { hits, evidence } = detectSignals(text);
    const ids = hits.map((h) => h.id);
    expect(ids).toContain("upfront_payment");
    expect(ids).toContain("urgency");
    expect(ids).toContain("unrealistic_reward");
    expect(evidence.length).toBeGreaterThan(0);
  });

  it("produces evidence quotes that exist verbatim in the source text", () => {
    const text = "Please share your OTP and password to verify your account immediately.";
    const { evidence } = detectSignals(text);
    for (const item of evidence) {
      expect(text.slice(item.startIndex, item.endIndex)).toBe(item.quote);
    }
  });

  it("returns no hits for an ordinary benign message", () => {
    const text = "Hey, are we still on for lunch tomorrow at 1pm?";
    const { hits } = detectSignals(text);
    expect(hits.length).toBe(0);
  });

  it("detects OTP and password requests distinctly", () => {
    const text = "Please provide your password and OTP now.";
    const { hits } = detectSignals(text);
    const ids = hits.map((h) => h.id);
    expect(ids).toContain("otp_request");
    expect(ids).toContain("password_request");
  });
});
