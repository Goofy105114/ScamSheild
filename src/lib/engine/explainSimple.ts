import type { RiskLevel, RiskSignalHit, ScamCategory } from "@/types/analysis";
import { CATEGORY_LABELS } from "./classify";

const SIMPLE_SIGNAL_PHRASES: Record<string, string> = {
  upfront_payment: "asking you to pay money before you get anything back",
  otp_request: "asking you to share a one-time code from your phone",
  password_request: "asking for your password or PIN",
  banking_info_request: "asking for your bank account details",
  card_info_request: "asking for your card number or CVV",
  urgency: "rushing you to act fast so you don't have time to think",
  threats_fear: "trying to scare you with a bad consequence",
  unrealistic_reward: "offering something that sounds too good to be true",
  prize_lottery: "claiming you won a prize you never entered for",
  guaranteed_returns: "promising guaranteed profits, which real investments can't do",
  impersonation: "pretending to be a company or organization you trust",
  government_impersonation: "pretending to be a government or police authority",
  secrecy_request: "asking you to keep this a secret from others",
  move_communication: "trying to move the chat somewhere harder to trace",
  account_verification: "asking you to 'verify' your account, which is a common trick",
  suspicious_attachment: "pointing you to open a file that could be harmful",
  unusual_payment_method: "asking for payment in a way that's hard to trace or reverse",
  delivery_pretext: "using a fake delivery problem to get your details or money",
  romance_pretext: "trying to build a fake emotional connection with you",
  tech_support_pretext: "claiming your device has a problem it probably doesn't have",
  generic_greeting: "using a generic greeting instead of your real name",
};

export function generateSimpleExplanation(
  riskLevel: RiskLevel,
  primaryCategory: ScamCategory,
  hits: RiskSignalHit[]
): string {
  const phrases = hits
    .map((h) => SIMPLE_SIGNAL_PHRASES[h.id])
    .filter(Boolean)
    .slice(0, 3);

  const categoryLabel = CATEGORY_LABELS[primaryCategory].toLowerCase();

  if (riskLevel === "LOW") {
    return "This message doesn't show the usual warning signs we look for, like urgent payment requests or requests for your passwords. Still, if anything feels off, it's always fine to double-check before you act.";
  }

  let openLine = "";
  if (riskLevel === "CRITICAL") openLine = `This looks very likely to be a scam, probably a ${categoryLabel}.`;
  else if (riskLevel === "HIGH") openLine = `This has strong signs of being a scam, likely a ${categoryLabel}.`;
  else openLine = `This has some warning signs worth being careful about, possibly related to a ${categoryLabel}.`;

  if (phrases.length === 0) {
    return `${openLine} Take a moment to verify it independently before doing anything it asks.`;
  }

  const phraseList = phrases.length === 1 ? phrases[0] : `${phrases.slice(0, -1).join(", ")} and ${phrases[phrases.length - 1]}`;

  return `${openLine} It's ${phraseList}. That combination is a common pattern used to trick people, so don't act on it until you've checked it independently.`;
}

export function generateSummary(riskLevel: RiskLevel, primaryCategory: ScamCategory, hitCount: number): string {
  const categoryLabel = CATEGORY_LABELS[primaryCategory];
  if (riskLevel === "LOW") {
    return "No strong scam indicators were detected in this content. Continue to use standard caution.";
  }
  const strength = riskLevel === "CRITICAL" ? "very strong" : riskLevel === "HIGH" ? "strong" : "some";
  return `This content shows ${strength} indicators consistent with a ${categoryLabel}, based on ${hitCount} distinct signal${hitCount === 1 ? "" : "s"} detected in the submitted content.`;
}
