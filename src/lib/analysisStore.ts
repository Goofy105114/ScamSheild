import type { ScamAnalysis } from "@/types/analysis";

const STORAGE_KEY = "scamshield:last-analysis";

export function saveAnalysis(analysis: ScamAnalysis) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(analysis));
  } catch {
    /* storage unavailable */
  }
}

export function loadAnalysis(): ScamAnalysis | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ScamAnalysis;
  } catch {
    return null;
  }
}

export function clearAnalysis() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}
