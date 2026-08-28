import type {
  AnalysisSource,
  DetectedEntity,
  EvidenceItem,
  RiskSignalHit,
  ScamAnalysis,
  ScamCategory,
} from "@/types/analysis";
import { normalizeText, enforceLengthLimit } from "./normalize";
import { detectSignals } from "./patterns";
import { analyzeUrl, extractUrlsFromText } from "./urlAnalysis";
import { computeScore, riskLevelFromScore, confidenceFromSignals } from "./scoring";
import { classifyCategories, CATEGORY_LABELS } from "./classify";
import { buildAttackChain, buildManipulationTactics } from "./attackChain";
import { buildRecommendedActions } from "./actions";
import { generateSimpleExplanation, generateSummary } from "./explainSimple";
import { extractEntities } from "./entities";
import { runAiSemanticAnalysis } from "./aiAnalysis";
import { getSignalDefinition } from "./patterns";

function generateId(): string {
  return `scamshield_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function buildRedFlags(hits: RiskSignalHit[], aiRedFlags: string[]): string[] {
  const fromRules = hits
    .sort((a, b) => b.weight - a.weight)
    .map((h) => getSignalDefinition(h.id)?.reason ?? h.label);
  const combined = [...fromRules, ...aiRedFlags];
  return Array.from(new Set(combined)).slice(0, 10);
}

function buildNextSteps(primaryCategory: ScamCategory, riskLevelIsLow: boolean): string[] {
  if (riskLevelIsLow) {
    return [
      "No urgent action is required based on this analysis.",
      "Still avoid sharing sensitive information unless you are confident of the source.",
      "If something later feels off, re-check with ScamShield or a trusted contact.",
    ];
  }
  return [
    "Pause before responding, clicking, or paying anything.",
    "Verify the sender or organization through a channel you already trust.",
    `If this turns out to be a ${CATEGORY_LABELS[primaryCategory].toLowerCase()}, report it to the platform and consider notifying your bank if any financial details were shared.`,
  ];
}

export interface AnalyzeOptions {
  useAi?: boolean;
}

export async function runAnalysis(source: AnalysisSource, options: AnalyzeOptions = {}): Promise<ScamAnalysis> {
  const textForAnalysis = source.extractedText ?? source.rawText;
  const { clean } = normalizeText(textForAnalysis);
  const { text: limitedText } = enforceLengthLimit(clean);

  const { hits, evidence } = detectSignals(limitedText);
  const entities = extractEntities(limitedText);

  let urlAnalysis = null;
  if (source.type === "url" && source.submittedUrl) {
    urlAnalysis = analyzeUrl(source.submittedUrl);
  } else {
    const foundUrls = extractUrlsFromText(limitedText);
    if (foundUrls.length > 0) {
      urlAnalysis = analyzeUrl(foundUrls[0]);
    }
  }

  const useAi = options.useAi ?? true;
  const aiResult = useAi
    ? await runAiSemanticAnalysis(limitedText)
    : { output: null, attempted: false, unavailableReason: "AI analysis was disabled for this request." };

  const { primary, secondary } = classifyCategories(hits, urlAnalysis);
  const primaryCategory: ScamCategory =
    aiResult.output?.likelyCategory && hits.length > 0 ? aiResult.output.likelyCategory : primary;

  const scoreBreakdown = computeScore(hits, urlAnalysis);
  let riskScore = scoreBreakdown.cappedTotal;

  if (aiResult.output) {
    riskScore = Math.max(0, Math.min(100, Math.round(riskScore + aiResult.output.aiConfidenceAdjustment)));
    if (aiResult.output.isLikelyBenign && hits.length <= 1) {
      riskScore = Math.min(riskScore, 25);
    }
  }

  const riskLevel = riskLevelFromScore(riskScore);
  const attackChain = buildAttackChain(hits, evidence);
  const manipulationTactics = buildManipulationTactics(hits);
  const recommendedActions = buildRecommendedActions(primaryCategory, hits, Boolean(urlAnalysis?.isValidUrl));
  const redFlags = buildRedFlags(hits, aiResult.output?.additionalRedFlags ?? []);
  const simpleExplanation = generateSimpleExplanation(riskLevel, primaryCategory, hits);
  const summaryBase = generateSummary(riskLevel, primaryCategory, hits.length);
  const summary = aiResult.output?.intentAssessment
    ? `${summaryBase} ${aiResult.output.intentAssessment}`
    : summaryBase;
  const nextSteps = buildNextSteps(primaryCategory, riskLevel === "LOW");
  const confidence = confidenceFromSignals(hits.length, Boolean(urlAnalysis?.isValidUrl), Boolean(aiResult.output));

  const analysis: ScamAnalysis = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    source,
    riskScore,
    riskLevel,
    primaryCategory,
    secondaryCategories: secondary.filter((c) => c !== primaryCategory),
    confidence,
    summary,
    redFlags,
    evidence,
    manipulationTactics,
    attackChain,
    recommendedActions,
    urlAnalysis,
    detectedEntities: entities as DetectedEntity[],
    simpleExplanation,
    nextSteps,
    scoreBreakdown,
    aiEnhanced: Boolean(aiResult.output),
    aiUnavailableReason: aiResult.output ? null : aiResult.unavailableReason,
  };

  return analysis;
}

export function evidenceWithinBounds(evidence: EvidenceItem[], text: string): boolean {
  return evidence.every((e) => text.slice(e.startIndex, e.endIndex) === e.quote);
}
