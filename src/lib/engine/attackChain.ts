import type { AttackStage, AttackStageName, EvidenceItem, ManipulationTactic, RiskSignalHit } from "@/types/analysis";
import { getSignalDefinition } from "./patterns";

const STAGE_ORDER: AttackStageName[] = ["TRUST", "DESIRE", "URGENCY", "FEAR", "MONEY_CREDENTIALS", "LOSS"];

const STAGE_OBJECTIVES: Record<AttackStageName, string> = {
  TRUST: "Establish legitimacy so you lower your guard.",
  DESIRE: "Create excitement about a reward, opportunity, or benefit.",
  URGENCY: "Pressure you to act immediately, before you can verify or think it through.",
  FEAR: "Use anxiety or the threat of a bad outcome to override careful judgment.",
  MONEY_CREDENTIALS: "Obtain the money or information requested in the message.",
  LOSS: "Complete the theft of money, identity, or access.",
};

const STAGE_LABELS: Record<AttackStageName, string> = {
  TRUST: "Build Trust",
  DESIRE: "Create Desire",
  URGENCY: "Create Urgency",
  FEAR: "Create Fear",
  MONEY_CREDENTIALS: "Request Money or Credentials",
  LOSS: "The Loss",
};

export function buildAttackChain(hits: RiskSignalHit[], evidence: EvidenceItem[]): AttackStage[] {
  const stages: AttackStage[] = [];
  const evidenceById = new Map(evidence.map((e) => [e.id, e]));

  for (const stageName of STAGE_ORDER) {
    if (stageName === "LOSS") continue;
    const stageHits = hits.filter((h) => getSignalDefinition(h.id)?.stage === stageName);
    if (stageHits.length === 0) continue;

    const evidenceIds = stageHits.flatMap((h) => h.evidenceIds);
    const primaryHit = [...stageHits].sort((a, b) => b.weight - a.weight)[0];
    const firstEvidence = chooseStageEvidence(stageName, stageHits, evidenceById);
    const tactic = stageName === "MONEY_CREDENTIALS" ? getRequestTactic(stageHits) : STAGE_LABELS[stageName];

    const explanation = firstEvidence
      ? stageName === "DESIRE"
        ? `The message leans on "${firstEvidence.quote}" to create a compelling reward narrative and lower skepticism.`
        : stageName === "URGENCY"
          ? `The message uses "${firstEvidence.quote}" to pressure an immediate decision before the victim can verify the claim.`
          : stageName === "MONEY_CREDENTIALS"
            ? getRequestExplanation(stageHits, firstEvidence.quote)
            : `Evidence from "${firstEvidence.quote}" supports this manipulation step.`
      : primaryHit.label;

    stages.push({
      stage: stageName,
      order: STAGE_ORDER.indexOf(stageName),
      tactic,
      evidenceIds,
      explanation,
      attackerObjective: STAGE_OBJECTIVES[stageName],
    });
  }

  const moneyStage = stages.find((s) => s.stage === "MONEY_CREDENTIALS");
  if (moneyStage) {
    stages.push({
      stage: "LOSS",
      order: STAGE_ORDER.indexOf("LOSS"),
      tactic: STAGE_LABELS.LOSS,
      evidenceIds: [],
      explanation: getLossExplanation(getRequestType(hits)),
      attackerObjective: getLossObjective(getRequestType(hits)),
    });
  }

  return stages.sort((a, b) => a.order - b.order);
}

function chooseStageEvidence(stageName: AttackStageName, stageHits: RiskSignalHit[], evidenceById: Map<string, EvidenceItem>): EvidenceItem | undefined {
  const candidates = stageHits
    .flatMap((hit) => hit.evidenceIds.map((id) => ({ hit, item: evidenceById.get(id) })))
    .filter((candidate): candidate is { hit: RiskSignalHit; item: EvidenceItem } => Boolean(candidate.item));
  return candidates.sort((a, b) => {
    const priority = (candidate: { hit: RiskSignalHit; item: EvidenceItem }) =>
      (stageName === "MONEY_CREDENTIALS" && ["registration_fee", "upfront_payment"].includes(candidate.hit.id) ? 3 : 0) +
      (candidate.item.quote.length <= 80 ? 1 : 0);
    return priority(b) - priority(a) || b.hit.weight - a.hit.weight;
  })[0]?.item;
}

function getRequestType(hits: RiskSignalHit[]): "money" | "otp" | "credentials" | "personal_information" {
  const ids = new Set(hits.map((hit) => hit.id));
  if (ids.has("otp_request")) return "otp";
  if (ids.has("password_request") || ids.has("banking_info_request") || ids.has("card_info_request")) return "credentials";
  if (ids.has("account_verification")) return "personal_information";
  return "money";
}

function getRequestTactic(hits: RiskSignalHit[]): string {
  const requestType = getRequestType(hits);
  if (requestType === "otp") return "Request OTP";
  if (requestType === "credentials") return "Request Credentials";
  if (requestType === "personal_information") return "Request Personal Information";
  return "Request Money";
}

function getRequestExplanation(hits: RiskSignalHit[], quote: string): string {
  const requestType = getRequestType(hits);
  if (requestType === "otp") return `The message uses "${quote}" to obtain a one-time code that could authorize access or a transaction.`;
  if (requestType === "credentials") return `The message uses "${quote}" to obtain credentials that could be used to access an account.`;
  if (requestType === "personal_information") return `The message uses "${quote}" to collect personal information that could be misused for identity theft or further social engineering.`;
  return `The message requests an upfront payment in "${quote}" before delivering the promised benefit.`;
}

function getLossExplanation(requestType: ReturnType<typeof getRequestType>): string {
  if (requestType === "otp") return "If you share the OTP, the attacker may be able to authorize an account action or transaction.";
  if (requestType === "credentials") return "If you provide the credentials, the attacker may use them to access your account.";
  if (requestType === "personal_information") return "If you provide the information, the attacker may misuse it for identity theft or further social engineering.";
  return "If you pay the requested fee, the attacker can take the money while the promised opportunity may never exist.";
}

function getLossObjective(requestType: ReturnType<typeof getRequestType>): string {
  if (requestType === "otp") return "Use the one-time code to authorize access or a transaction.";
  if (requestType === "credentials") return "Use the credentials to access or take over an account.";
  if (requestType === "personal_information") return "Reuse personal information for identity theft or further manipulation.";
  return "Take the payment without providing the promised benefit.";
}

export function buildTrapExplanation(hits: RiskSignalHit[], category: string): string {
  const ids = new Set(hits.map((hit) => hit.id));
  const hasUrgency = ids.has("urgency");
  const hasMoney = ids.has("upfront_payment") || ids.has("registration_fee") || ids.has("unusual_payment_method");
  const hasCredentials = ids.has("otp_request") || ids.has("password_request") || ids.has("banking_info_request") || ids.has("card_info_request");
  const hasReturns = ids.has("guaranteed_returns") || ids.has("unrealistic_reward") || ids.has("attractive_offer");
  const hasExclusivity = ids.has("exclusivity_claim");
  const hasPrivateChannel = ids.has("move_communication");
  const hasDelivery = ids.has("delivery_pretext");

  if (hasDelivery && hasUrgency) return "This message creates an unresolved delivery problem and uses urgency to push you toward a payment or information request.";
  if (category === "investment_scam" && hasReturns && hasPrivateChannel) return "This message combines strong return claims, exclusivity, and private-channel communication to build trust before asking for financial involvement.";
  if (category === "investment_scam" && (hasReturns || hasExclusivity) && hasPrivateChannel) return "This message combines attractive investment language, exclusivity, and private-channel communication to build trust before asking for financial involvement.";
  if (hasMoney && hasUrgency && hasReturns) return "This message combines an unusually attractive offer, artificial urgency, and an upfront payment request to push you into paying before you have time to verify the claim.";
  if (hasMoney) return "This message builds a case for payment and then asks for money before the promised benefit is delivered.";
  if (hasCredentials && hasUrgency) return "This message combines a request for sensitive access information with urgency to pressure you before you can verify the sender.";
  if (hasCredentials) return "This message builds trust or concern around a request for sensitive access information.";
  return "This message combines several pressure tactics to discourage careful verification before you act.";
}

export function buildManipulationTactics(hits: RiskSignalHit[]): ManipulationTactic[] {
  return hits
    .filter((h) => h.category === "psychological" || h.category === "impersonation")
    .map((h) => {
      const def = getSignalDefinition(h.id);
      return {
        id: h.id,
        name: h.label,
        description: def?.reason ?? h.label,
        evidenceIds: h.evidenceIds,
      };
    });
}
