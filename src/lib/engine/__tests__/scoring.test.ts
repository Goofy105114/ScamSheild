import { describe, it, expect } from "vitest";
import { computeScore, riskLevelFromScore } from "../scoring";
import { detectSignals } from "../patterns";

describe("computeScore", () => {
  it("produces a low score with no hits", () => {
    const { hits } = detectSignals("Hey, are we still on for lunch tomorrow?");
    const score = computeScore(hits, null);
    expect(score.cappedTotal).toBeLessThan(30);
  });

  it("produces a high score for a message with many strong signals", () => {
    const { hits } = detectSignals(
      "Congratulations! You have been selected for a ₹75,000 work-from-home position. Pay ₹1,499 registration charges within 10 minutes. Share your OTP and password to confirm."
    );
    const score = computeScore(hits, null);
    expect(score.cappedTotal).toBeGreaterThanOrEqual(60);
  });

  it("never exceeds 100", () => {
    const { hits } = detectSignals(
      "OTP password bank account number card number cvv urgent immediately act now guaranteed returns lottery won prize pay registration fee gift card bitcoin wire transfer western union"
    );
    const score = computeScore(hits, null);
    expect(score.cappedTotal).toBeLessThanOrEqual(100);
  });
});

describe("riskLevelFromScore", () => {
  it("maps score ranges to the correct risk level", () => {
    expect(riskLevelFromScore(10)).toBe("LOW");
    expect(riskLevelFromScore(45)).toBe("MEDIUM");
    expect(riskLevelFromScore(65)).toBe("HIGH");
    expect(riskLevelFromScore(90)).toBe("CRITICAL");
  });
});
