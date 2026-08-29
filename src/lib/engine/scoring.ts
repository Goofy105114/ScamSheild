import type { RiskLevel, RiskSignalHit, ScoreBreakdown, UrlAnalysisResult } from "@/types/analysis";

const URL_SEVERITY_WEIGHT: Record<"low" | "medium" | "high", number> = {
  low: 4,
  medium: 10,
  high: 22,
};

const DECEPTIVE_URL_SIGNAL_WEIGHT: Record<string, number> = {
  lookalike_domain: 58,
  embedded_credentials_or_at: 58,
};

export function computeScore(hits: RiskSignalHit[], urlAnalysis: UrlAnalysisResult | null): ScoreBreakdown {
  const baseline = 4;
  let total = baseline;

  for (const hit of hits) {
    total += hit.weight;
  }

  const urlHits: RiskSignalHit[] = [];
  if (urlAnalysis) {
    for (const signal of urlAnalysis.signals) {
      if (signal.id === "invalid_url") continue;
      const weight = DECEPTIVE_URL_SIGNAL_WEIGHT[signal.id] ?? URL_SEVERITY_WEIGHT[signal.severity];
      total += weight;
      urlHits.push({
        id: `url_${signal.id}`,
        label: signal.label,
        category: "url",
        weight,
        evidenceIds: [],
      });
    }
  }

  const combinedHits = combineWithDiminishingReturns([...hits, ...urlHits], baseline);

  const cappedTotal = Math.max(0, Math.min(100, Math.round(combinedHits.total)));

  return {
    total: Math.round(total),
    cappedTotal,
    hits: combinedHits.hits,
    baseline,
  };
}

function combineWithDiminishingReturns(hits: RiskSignalHit[], baseline: number): { total: number; hits: RiskSignalHit[] } {
  const sorted = [...hits].sort((a, b) => b.weight - a.weight);
  let total = baseline;
  sorted.forEach((hit, index) => {
    const decay = Math.pow(0.96, index);
    total += hit.weight * decay;
  });
  return { total, hits: sorted };
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 20) return "MEDIUM";
  return "LOW";
}

export function confidenceFromSignals(hitCount: number, hasUrl: boolean, aiEnhanced: boolean): number {
  if (hitCount === 0) {
    const benignConfidence = hasUrl ? 0.68 : 0.78;
    return aiEnhanced ? Math.min(0.95, benignConfidence + 0.1) : benignConfidence;
  }
  let confidence = 0.42 + Math.min(hitCount, 8) * 0.06;
  if (hasUrl) confidence += 0.05;
  if (aiEnhanced) confidence += 0.1;
  return Math.max(0.2, Math.min(0.97, Number(confidence.toFixed(2))));
}
