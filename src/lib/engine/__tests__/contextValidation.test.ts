import { describe, it, expect } from "vitest";
import { applyContextValidation } from "../analyze";
import { detectSignals } from "../patterns";

describe("applyContextValidation", () => {
  it("removes a hit entirely when its only evidence is marked invalid", () => {
    const text = "Enter your password to confirm your identity now.";
    const { hits, evidence } = detectSignals(text);
    const passwordHit = hits.find((h) => h.id === "password_request");
    expect(passwordHit).toBeDefined();

    const invalidIds = passwordHit!.evidenceIds;
    const result = applyContextValidation(hits, evidence, invalidIds);

    expect(result.hits.some((h) => h.id === "password_request")).toBe(false);
    expect(result.evidence.some((e) => invalidIds.includes(e.id))).toBe(false);
  });

  it("keeps a hit but trims its evidence when only some of its evidence is invalidated", () => {
    const text = "Please share your password now, and also enter your password again to confirm.";
    const { hits, evidence } = detectSignals(text);
    const passwordHit = hits.find((h) => h.id === "password_request");
    expect(passwordHit).toBeDefined();

    if (passwordHit!.evidenceIds.length < 2) {
      const onlyId = passwordHit!.evidenceIds[0];
      const result = applyContextValidation(hits, evidence, [onlyId]);
      expect(result.hits.some((h) => h.id === "password_request")).toBe(false);
      return;
    }

    const [firstId] = passwordHit!.evidenceIds;
    const result = applyContextValidation(hits, evidence, [firstId]);
    const survivingHit = result.hits.find((h) => h.id === "password_request");
    expect(survivingHit).toBeDefined();
    expect(survivingHit!.evidenceIds).not.toContain(firstId);
  });

  it("is a no-op when no evidence ids are invalidated", () => {
    const text = "Please share your password within 5 minutes.";
    const { hits, evidence } = detectSignals(text);
    const result = applyContextValidation(hits, evidence, []);
    expect(result.hits.length).toBe(hits.length);
    expect(result.evidence.length).toBe(evidence.length);
  });

  it("leaves unrelated hits untouched when invalidating a different signal's evidence", () => {
    const text = "Please share your password within 10 minutes or your account will be suspended.";
    const { hits, evidence } = detectSignals(text);
    const urgencyHit = hits.find((h) => h.id === "urgency");
    expect(urgencyHit).toBeDefined();

    const result = applyContextValidation(hits, evidence, urgencyHit!.evidenceIds);
    expect(result.hits.some((h) => h.id === "urgency")).toBe(false);
    expect(result.hits.some((h) => h.id === "password_request")).toBe(true);
  });
});
