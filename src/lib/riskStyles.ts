import type { RiskLevel } from "@/types/analysis";

export const RISK_STYLES: Record<
  RiskLevel,
  { color: string; bg: string; border: string; label: string; description: string }
> = {
  LOW: {
    color: "#34c6a4",
    bg: "rgba(52,198,164,0.1)",
    border: "rgba(52,198,164,0.4)",
    label: "LOW RISK",
    description: "No major scam indicators detected.",
  },
  MEDIUM: {
    color: "#f0a83b",
    bg: "rgba(240,168,59,0.1)",
    border: "rgba(240,168,59,0.4)",
    label: "MEDIUM RISK",
    description: "Some suspicious indicators detected. Verify before acting.",
  },
  HIGH: {
    color: "#ef7a3c",
    bg: "rgba(239,122,60,0.1)",
    border: "rgba(239,122,60,0.4)",
    label: "HIGH RISK",
    description: "Multiple scam indicators detected.",
  },
  CRITICAL: {
    color: "#ff5c5c",
    bg: "rgba(255,92,92,0.12)",
    border: "rgba(255,92,92,0.5)",
    label: "CRITICAL RISK",
    description: "Strong scam indicators detected. Do not proceed without independent verification.",
  },
};

export const CATEGORY_ICON_LABEL: Record<string, string> = {
  phishing: "PHISHING",
  job_scam: "JOB SCAM",
  banking_scam: "BANKING SCAM",
  payment_scam: "PAYMENT SCAM",
  investment_scam: "INVESTMENT SCAM",
  shopping_scam: "SHOPPING SCAM",
  delivery_scam: "DELIVERY SCAM",
  romance_scam: "ROMANCE SCAM",
  impersonation: "IMPERSONATION",
  account_takeover: "ACCOUNT TAKEOVER",
  tech_support_scam: "TECH SUPPORT SCAM",
  lottery_prize_scam: "LOTTERY / PRIZE SCAM",
  government_impersonation: "GOVERNMENT IMPERSONATION",
  cryptocurrency_scam: "CRYPTOCURRENCY SCAM",
  subscription_scam: "SUBSCRIPTION SCAM",
  credential_theft: "CREDENTIAL THEFT",
  other_suspicious: "SUSPICIOUS ACTIVITY",
};
