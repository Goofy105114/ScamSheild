import { z } from "zod";

export const AiSemanticOutputSchema = z.object({
  likelyCategory: z
    .enum([
      "phishing", "job_scam", "banking_scam", "payment_scam", "investment_scam",
      "shopping_scam", "delivery_scam", "romance_scam", "impersonation",
      "account_takeover", "tech_support_scam", "lottery_prize_scam",
      "government_impersonation", "cryptocurrency_scam", "subscription_scam",
      "credential_theft", "other_suspicious",
    ])
    .nullable(),
  additionalRedFlags: z.array(z.string().max(200)).max(6),
  intentAssessment: z.string().max(600),
  attackerObjective: z.string().max(240).optional(),
  trapAssessment: z.string().max(600).optional(),
  aiConfidenceAdjustment: z.number().min(-15).max(15),
  isLikelyBenign: z.boolean(),
  benignExplanation: z.string().max(400).optional(),
  invalidEvidenceIds: z.array(z.string().max(80)).max(20).default([]),
  invalidEvidenceReason: z.string().max(400).optional(),
});

export type AiSemanticOutput = z.infer<typeof AiSemanticOutputSchema>;

export function safeParseAiOutput(raw: unknown): AiSemanticOutput | null {
  const result = AiSemanticOutputSchema.safeParse(raw);
  if (!result.success) return null;
  return result.data;
}
