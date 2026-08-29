import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../aiAnalysis", () => ({
  runAiSemanticAnalysis: vi.fn(),
}));

import { runAiSemanticAnalysis } from "../aiAnalysis";
import { runAnalysis } from "../analyze";
import { detectSignals } from "../patterns";

const mockedRunAi = vi.mocked(runAiSemanticAnalysis);

describe("runAnalysis with AI-driven context validation", () => {
  beforeEach(() => {
    mockedRunAi.mockReset();
  });

  it("downgrades risk when the AI marks the only detected signal as contextually invalid and benign", async () => {
    const text = "Someone just used your password to try to sign in. If this wasn't you, change your password immediately.";
    const { evidence } = detectSignals(text);

    mockedRunAi.mockResolvedValue({
      output: {
        likelyCategory: null,
        additionalRedFlags: [],
        intentAssessment: "This reads as a standard account security notification, not a request for credentials.",
        aiConfidenceAdjustment: 0,
        isLikelyBenign: true,
        benignExplanation: "The message reports a past sign-in attempt and advises a defensive password change; it never asks the reader to disclose anything.",
        invalidEvidenceIds: evidence.map((e) => e.id),
        invalidEvidenceReason: "These phrases describe security-alert language, not a credential request.",
      },
      attempted: true,
      unavailableReason: null,
    });

    const analysis = await runAnalysis({ type: "text", rawText: text });

    expect(analysis.aiEnhanced).toBe(true);
    expect(analysis.riskLevel).toBe("LOW");
    expect(analysis.evidence.length).toBe(0);
    expect(analysis.simpleExplanation).toContain("defensive password change");
  });

  it("keeps genuine evidence and category when the AI confirms the threat", async () => {
    const text = "Please share your password and OTP within 15 minutes to avoid suspension.";

    mockedRunAi.mockResolvedValue({
      output: {
        likelyCategory: "credential_theft",
        additionalRedFlags: ["Directly requests both a password and a one-time code together"],
        intentAssessment: "This is a direct credential-harvesting attempt using urgency to prevent verification.",
        attackerObjective: "Obtain the victim's password and OTP to take over their account.",
        trapAssessment: "Once both are provided, the attacker can log in and bypass two-factor protection.",
        aiConfidenceAdjustment: 5,
        isLikelyBenign: false,
        invalidEvidenceIds: [],
      },
      attempted: true,
      unavailableReason: null,
    });

    const analysis = await runAnalysis({ type: "text", rawText: text });

    expect(analysis.aiEnhanced).toBe(true);
    expect(analysis.primaryCategory).toBe("credential_theft");
    expect(["HIGH", "CRITICAL"]).toContain(analysis.riskLevel);
    expect(analysis.evidence.length).toBeGreaterThan(0);
    expect(analysis.aiAssessment?.attackerObjective).toContain("account");
  });

  it("partially invalidates evidence without discarding a still-valid signal in the same message", async () => {
    const text = "Someone used your password to sign in. Also, please share your OTP within 5 minutes to confirm it was you.";
    const { hits } = detectSignals(text);
    const passwordHit = hits.find((h) => h.id === "password_request");
    const invalidIds = passwordHit ? passwordHit.evidenceIds : [];

    mockedRunAi.mockResolvedValue({
      output: {
        likelyCategory: "credential_theft",
        additionalRedFlags: [],
        intentAssessment: "The password mention is informational, but the OTP request is a genuine credential-harvesting attempt.",
        aiConfidenceAdjustment: 0,
        isLikelyBenign: false,
        invalidEvidenceIds: invalidIds,
        invalidEvidenceReason: "The password phrase reports a past event rather than requesting disclosure.",
      },
      attempted: true,
      unavailableReason: null,
    });

    const analysis = await runAnalysis({ type: "text", rawText: text });

    expect(analysis.scoreBreakdown.hits.some((h) => h.id === "password_request")).toBe(false);
    expect(analysis.scoreBreakdown.hits.some((h) => h.id === "otp_request")).toBe(true);
    expect(analysis.evidence.some((e) => invalidIds.includes(e.id))).toBe(false);
  });
});
