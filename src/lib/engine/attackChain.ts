import type { AttackStage, AttackStageName, EvidenceItem, ManipulationTactic, RiskSignalHit } from "@/types/analysis";
import { getSignalDefinition } from "./patterns";

const STAGE_ORDER: AttackStageName[] = ["TRUST", "DESIRE", "URGENCY", "FEAR", "MONEY_CREDENTIALS", "LOSS"];

const STAGE_OBJECTIVES: Record<AttackStageName, string> = {
  TRUST: "Establish legitimacy so you lower your guard.",
  DESIRE: "Create excitement about a reward, opportunity, or benefit.",
  URGENCY: "Pressure you to act immediately, before you can verify or think it through.",
  FEAR: "Use anxiety or the threat of a bad outcome to override careful judgment.",
  MONEY_CREDENTIALS: "Extract money, passwords, OTPs, or financial details.",
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
    const primaryHit = stageHits.sort((a, b) => b.weight - a.weight)[0];
    const firstEvidence = evidenceIds.map((id) => evidenceById.get(id)).find(Boolean);

    stages.push({
      stage: stageName,
      order: STAGE_ORDER.indexOf(stageName),
      tactic: STAGE_LABELS[stageName],
      evidenceIds,
      explanation: firstEvidence
        ? `Detected through: "${firstEvidence.quote}" — ${primaryHit.label.toLowerCase()}.`
        : primaryHit.label,
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
      explanation: "If the requested money, password, or code is handed over, the attacker can now complete the theft.",
      attackerObjective: STAGE_OBJECTIVES.LOSS,
    });
  }

  return stages.sort((a, b) => a.order - b.order);
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
