export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ScamCategory =
  | "phishing"
  | "job_scam"
  | "banking_scam"
  | "payment_scam"
  | "investment_scam"
  | "shopping_scam"
  | "delivery_scam"
  | "romance_scam"
  | "impersonation"
  | "account_takeover"
  | "tech_support_scam"
  | "lottery_prize_scam"
  | "government_impersonation"
  | "cryptocurrency_scam"
  | "subscription_scam"
  | "credential_theft"
  | "other_suspicious";

export type AttackStageName =
  | "TRUST"
  | "DESIRE"
  | "SCARCITY"
  | "URGENCY"
  | "FEAR"
  | "PRIVATE_CHANNEL"
  | "MONEY_CREDENTIALS"
  | "LOSS";

export interface EvidenceItem {
  id: string;
  quote: string;
  startIndex: number;
  endIndex: number;
  reason: string;
  signalId: string;
  severity: "low" | "medium" | "high";
}

export interface ManipulationTactic {
  id: string;
  name: string;
  description: string;
  evidenceIds: string[];
}

export interface AttackStage {
  stage: AttackStageName;
  order: number;
  tactic: string;
  evidenceIds: string[];
  explanation: string;
  attackerObjective: string;
}

export interface RecommendedAction {
  id: string;
  label: string;
  description: string;
  priority: "critical" | "important" | "helpful";
}

export interface DetectedEntity {
  type: "money_amount" | "phone_number" | "email" | "url" | "time_window" | "organization" | "otp_reference";
  value: string;
  startIndex: number;
  endIndex: number;
}

export interface UrlSignal {
  id: string;
  label: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface UrlAnalysisResult {
  submittedUrl: string;
  normalizedUrl: string | null;
  isValidUrl: boolean;
  hostname: string | null;
  isHttps: boolean | null;
  isIpAddress: boolean;
  subdomainCount: number;
  tld: string | null;
  lookalikeOf: string | null;
  signals: UrlSignal[];
  verificationStatement: string;
}

export interface RiskSignalHit {
  id: string;
  label: string;
  category: "financial" | "credential" | "psychological" | "structural" | "url" | "impersonation";
  weight: number;
  evidenceIds: string[];
}

export interface ScoreBreakdown {
  total: number;
  cappedTotal: number;
  hits: RiskSignalHit[];
  baseline: number;
}

export interface AnalysisSource {
  type: "text" | "image" | "url";
  rawText: string;
  extractedText?: string;
  submittedUrl?: string;
}

export interface ScamAnalysis {
  id: string;
  createdAt: string;
  source: AnalysisSource;
  riskScore: number;
  riskLevel: RiskLevel;
  primaryCategory: ScamCategory;
  secondaryCategories: ScamCategory[];
  confidence: number;
  summary: string;
  redFlags: string[];
  evidence: EvidenceItem[];
  manipulationTactics: ManipulationTactic[];
  attackChain: AttackStage[];
  recommendedActions: RecommendedAction[];
  urlAnalysis: UrlAnalysisResult | null;
  detectedEntities: DetectedEntity[];
  simpleExplanation: string;
  nextSteps: string[];
  scoreBreakdown: ScoreBreakdown;
  aiEnhanced: boolean;
  aiUnavailableReason: string | null;
}

export interface AnalyzeTextRequest {
  text: string;
}

export interface AnalyzeUrlRequest {
  url: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
