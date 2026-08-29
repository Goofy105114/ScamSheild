import type { RiskSignalHit, ScamCategory, UrlAnalysisResult } from "@/types/analysis";

interface CategoryRule {
  category: ScamCategory;
  signals: string[];
  weight: number;
}

const CATEGORY_RULES: CategoryRule[] = [
  { category: "job_scam", signals: ["employment_context", "registration_fee", "unrealistic_reward", "upfront_payment", "attractive_offer", "urgency"], weight: 1.3 },
  { category: "banking_scam", signals: ["banking_info_request", "account_verification", "otp_request"], weight: 1 },
  { category: "payment_scam", signals: ["upfront_payment", "registration_fee", "unusual_payment_method"], weight: 0.8 },
  { category: "investment_scam", signals: ["guaranteed_returns", "unrealistic_reward"], weight: 1.4 },
  { category: "shopping_scam", signals: ["unusual_payment_method", "unrealistic_reward"], weight: 0.5 },
  { category: "delivery_scam", signals: ["delivery_pretext"], weight: 1.5 },
  { category: "romance_scam", signals: ["romance_pretext"], weight: 1.6 },
  { category: "impersonation", signals: ["impersonation"], weight: 1 },
  { category: "account_takeover", signals: ["password_request", "otp_request", "account_verification"], weight: 1 },
  { category: "tech_support_scam", signals: ["tech_support_pretext"], weight: 1.6 },
  { category: "lottery_prize_scam", signals: ["prize_lottery"], weight: 1.6 },
  { category: "government_impersonation", signals: ["government_impersonation"], weight: 1.6 },
  { category: "credential_theft", signals: ["password_request", "card_info_request", "banking_info_request"], weight: 0.9 },
];

export function classifyCategories(
  hits: RiskSignalHit[],
  urlAnalysis: UrlAnalysisResult | null
): { primary: ScamCategory; secondary: ScamCategory[] } {
  const hitIds = new Set(hits.map((h) => h.id));
  const scores = new Map<ScamCategory, number>();

  for (const rule of CATEGORY_RULES) {
    if (rule.category === "job_scam" && !hitIds.has("employment_context")) continue;
    const matched = rule.signals.filter((s) => hitIds.has(s));
    if (matched.length === 0) continue;
    const score = matched.length * rule.weight;
    scores.set(rule.category, (scores.get(rule.category) ?? 0) + score);
  }

  const hasCredentialLink =
    urlAnalysis &&
    urlAnalysis.isValidUrl &&
    (urlAnalysis.lookalikeOf || urlAnalysis.signals.some((s) => s.severity === "high"));

  if (hasCredentialLink) {
    scores.set("phishing", (scores.get("phishing") ?? 0) + 2);
  } else if (urlAnalysis && urlAnalysis.isValidUrl && hitIds.has("account_verification")) {
    scores.set("phishing", (scores.get("phishing") ?? 0) + 1);
  }

  if (scores.size === 0) {
    return { primary: "other_suspicious", secondary: [] };
  }

  const ranked = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
  const primary = ranked[0][0];
  const secondary = ranked.slice(1, 4).map(([category]) => category);

  return { primary, secondary };
}

export const CATEGORY_LABELS: Record<ScamCategory, string> = {
  phishing: "Phishing",
  job_scam: "Job Scam",
  banking_scam: "Banking Scam",
  payment_scam: "Payment Scam",
  investment_scam: "Investment Scam",
  shopping_scam: "Shopping Scam",
  delivery_scam: "Delivery Scam",
  romance_scam: "Romance Scam",
  impersonation: "Impersonation",
  account_takeover: "Account Takeover",
  tech_support_scam: "Tech Support Scam",
  lottery_prize_scam: "Lottery / Prize Scam",
  government_impersonation: "Government Impersonation",
  cryptocurrency_scam: "Cryptocurrency Scam",
  subscription_scam: "Subscription Scam",
  credential_theft: "Credential Theft",
  other_suspicious: "Other Suspicious Activity",
};
