import type { AttackStageName, EvidenceItem, RiskSignalHit } from "@/types/analysis";

export type SignalCategory = "financial" | "credential" | "psychological" | "structural" | "url" | "impersonation";

export interface SignalDefinition {
  id: string;
  label: string;
  category: SignalCategory;
  weight: number;
  severity: "low" | "medium" | "high";
  stage: AttackStageName | null;
  patterns: RegExp[];
  reason: string;
}

const money = "(?:₹|rs\\.?|inr|\\$|usd|eur|€|£|gbp)\\s?[\\d,]+(?:\\.\\d+)?|[\\d,]{3,}(?:\\.\\d+)?\\s?(?:rupees|rs|inr|dollars|usd)";

export const SIGNAL_DEFINITIONS: SignalDefinition[] = [
  {
    id: "upfront_payment",
    label: "Upfront payment request",
    category: "financial",
    weight: 26,
    severity: "high",
    stage: "MONEY_CREDENTIALS",
    patterns: [
      new RegExp(`(pay|deposit|transfer|send)\\s+(?:an?\\s+)?(?:${money}|[\\w\\s]{0,15}(fee|charge|deposit|amount))`, "i"),
      new RegExp(`(registration|processing|verification|activation|security|refundable|clearance)\\s+(fee|charge|deposit)`, "i"),
    ],
    reason: "Asks you to pay money before you receive anything in return, a hallmark of advance-fee fraud.",
  },
  {
    id: "otp_request",
    label: "OTP / verification code request",
    category: "credential",
    weight: 26,
    severity: "high",
    stage: "MONEY_CREDENTIALS",
    patterns: [/\botp\b/i, /one[-\s]?time\s?(password|code|pin)/i, /verification\s?code/i, /share.{0,20}\bcode\b/i],
    reason: "Legitimate organizations never ask you to share a one-time password or verification code.",
  },
  {
    id: "password_request",
    label: "Password or PIN request",
    category: "credential",
    weight: 28,
    severity: "high",
    stage: "MONEY_CREDENTIALS",
    patterns: [/\bpassword\b/i, /\bpin\s?(number|code)?\b/i, /login\s?credentials/i],
    reason: "Requests your password or PIN, which no legitimate service needs to know.",
  },
  {
    id: "banking_info_request",
    label: "Banking information request",
    category: "financial",
    weight: 24,
    severity: "high",
    stage: "MONEY_CREDENTIALS",
    patterns: [/account\s?number/i, /ifsc/i, /bank\s?details/i, /net\s?banking/i, /upi\s?pin/i],
    reason: "Requests sensitive banking details that enable direct account access or theft.",
  },
  {
    id: "card_info_request",
    label: "Card information request",
    category: "financial",
    weight: 24,
    severity: "high",
    stage: "MONEY_CREDENTIALS",
    patterns: [/card\s?number/i, /cvv/i, /expiry\s?date/i, /debit\s?card/i, /credit\s?card/i],
    reason: "Requests card details that can be used for unauthorized transactions.",
  },
  {
    id: "urgency",
    label: "Artificial urgency",
    category: "psychological",
    weight: 17,
    severity: "medium",
    stage: "URGENCY",
    patterns: [
      /within\s+\d+\s?(minutes?|hours?|mins?)/i,
      /expires?\s+(today|soon|in\s+\d+)/i,
      /act\s+now/i,
      /immediately/i,
      /last\s+chance/i,
      /limited\s+(time|slots?|seats?)/i,
      /before\s+it'?s?\s+too\s+late/i,
      /hurry/i,
    ],
    reason: "Pressures you to act quickly, leaving no time to verify the claim.",
  },
  {
    id: "threats_fear",
    label: "Threats or fear-based pressure",
    category: "psychological",
    weight: 18,
    severity: "high",
    stage: "FEAR",
    patterns: [
      /account\s+(will be|has been)\s+(suspended|blocked|frozen|terminated|deactivated)/i,
      /legal\s+action/i,
      /you\s+will\s+be\s+(fined|arrested|charged)/i,
      /failure\s+to\s+(comply|respond|pay)/i,
      /warrant\s+(has been|will be)\s+issued/i,
      /suspicious\s+activity\s+(detected|on your account)/i,
    ],
    reason: "Uses fear of a negative consequence to pressure you into acting without thinking.",
  },
  {
    id: "unrealistic_reward",
    label: "Unrealistic reward or compensation",
    category: "psychological",
    weight: 19,
    severity: "medium",
    stage: "DESIRE",
    patterns: [
      /congratulations/i,
      /you\s+(have\s+)?(been\s+)?(selected|won|chosen)/i,
      /work[-\s]from[-\s]home/i,
      /guaranteed\s+(income|returns?|profit|salary)/i,
      /easy\s+money/i,
      /earn\s+.{0,15}(daily|per day|weekly)/i,
      /no\s+experience\s+(needed|required)/i,
    ],
    reason: "Dangles an unusually attractive reward to lower your skepticism.",
  },
  {
    id: "prize_lottery",
    label: "Prize or lottery claim",
    category: "psychological",
    weight: 20,
    severity: "high",
    stage: "DESIRE",
    patterns: [/lottery/i, /you\s+(have\s+)?won/i, /lucky\s+(draw|winner)/i, /claim\s+your\s+(prize|reward)/i],
    reason: "Claims you have won something you never entered, a classic lottery scam pattern.",
  },
  {
    id: "guaranteed_returns",
    label: "Guaranteed investment returns",
    category: "financial",
    weight: 22,
    severity: "high",
    stage: "DESIRE",
    patterns: [/guaranteed\s+returns?/i, /double\s+your\s+(money|investment)/i, /risk[-\s]?free\s+investment/i, /\d{2,4}%\s+returns?/i],
    reason: "No legitimate investment can guarantee high returns; this is a defining trait of investment fraud.",
  },
  {
    id: "impersonation",
    label: "Impersonation of a trusted organization",
    category: "impersonation",
    weight: 16,
    severity: "medium",
    stage: "TRUST",
    patterns: [
      /\b(bank|amazon|flipkart|paypal|microsoft|apple|google|income\s?tax|customs|courier|fedex|dhl|police|cbi|rbi)\b.{0,25}\b(team|department|support|security|official)\b/i,
      /this\s+is\s+(an?\s+)?official\s+(notice|message|communication)/i,
    ],
    reason: "Claims to represent a trusted organization to borrow its credibility.",
  },
  {
    id: "government_impersonation",
    label: "Government or law enforcement impersonation",
    category: "impersonation",
    weight: 24,
    severity: "high",
    stage: "FEAR",
    patterns: [/income\s?tax\s+department/i, /\bcbi\b/i, /\brbi\b/i, /\bfir\b/i, /customs\s+department/i, /cyber\s?crime\s+(cell|department)/i],
    reason: "Impersonates a government or law-enforcement authority to intimidate you into compliance.",
  },
  {
    id: "secrecy_request",
    label: "Request for secrecy",
    category: "psychological",
    weight: 20,
    severity: "high",
    stage: "FEAR",
    patterns: [/do\s+not\s+(tell|inform|share\s+with)\s+(anyone|your\s+bank|family)/i, /keep\s+this\s+(confidential|between us|secret)/i, /this\s+is\s+confidential/i],
    reason: "Asks you to keep the interaction secret, preventing others from warning you.",
  },
  {
    id: "move_communication",
    label: "Pressure to move to another channel",
    category: "psychological",
    weight: 12,
    severity: "low",
    stage: "TRUST",
    patterns: [/contact\s+us\s+on\s+whatsapp/i, /message\s+us\s+(directly|privately)/i, /switch\s+to\s+(telegram|whatsapp)/i],
    reason: "Tries to move the conversation to a less monitored, harder-to-trace channel.",
  },
  {
    id: "account_verification",
    label: "Account verification request",
    category: "credential",
    weight: 18,
    severity: "medium",
    stage: "MONEY_CREDENTIALS",
    patterns: [/verify\s+your\s+account/i, /confirm\s+your\s+(identity|details|account)/i, /update\s+your\s+(kyc|account\s+information)/i, /re[-\s]?activate\s+your\s+account/i],
    reason: "Directs you to 'verify' your account, a common pretext used to harvest credentials.",
  },
  {
    id: "suspicious_attachment",
    label: "Suspicious attachment reference",
    category: "structural",
    weight: 10,
    severity: "low",
    stage: null,
    patterns: [/open\s+the\s+attached/i, /download\s+the\s+attachment/i, /\.(exe|apk|scr|bat)\b/i],
    reason: "References an attachment or executable file, a common malware delivery method.",
  },
  {
    id: "unusual_payment_method",
    label: "Unusual payment method requested",
    category: "financial",
    weight: 20,
    severity: "high",
    stage: "MONEY_CREDENTIALS",
    patterns: [/gift\s?card/i, /google\s?pay\s+to\s+this\s+number/i, /crypto(currency)?\s+wallet/i, /bitcoin/i, /wire\s+transfer\s+only/i, /western\s+union/i],
    reason: "Requests payment through gift cards, crypto, or wire transfer, which are difficult to trace or reverse.",
  },
  {
    id: "delivery_pretext",
    label: "Delivery or shipment pretext",
    category: "structural",
    weight: 10,
    severity: "low",
    stage: "TRUST",
    patterns: [/package\s+(is\s+)?(held|delayed|pending)/i, /customs\s+(duty|fee)/i, /reschedule\s+your\s+delivery/i, /shipment\s+(could not|failed)/i],
    reason: "Uses a fake delivery problem as a pretext to request payment or personal details.",
  },
  {
    id: "romance_pretext",
    label: "Romantic relationship pretext",
    category: "psychological",
    weight: 14,
    severity: "medium",
    stage: "TRUST",
    patterns: [/i\s+(truly|really)\s+love\s+you/i, /my\s+(darling|dearest|love)/i, /we\s+have\s+never\s+met\s+but/i],
    reason: "Builds a fabricated emotional bond, often before requesting money.",
  },
  {
    id: "tech_support_pretext",
    label: "Tech support pretext",
    category: "structural",
    weight: 14,
    severity: "medium",
    stage: "TRUST",
    patterns: [/your\s+computer\s+(has\s+been\s+)?infected/i, /call\s+microsoft\s+support/i, /virus\s+detected\s+on\s+your\s+device/i, /remote\s+access\s+to\s+your\s+(computer|device)/i],
    reason: "Falsely claims your device has a problem to justify remote access or payment.",
  },
  {
    id: "generic_greeting",
    label: "Generic, non-personalized greeting",
    category: "structural",
    weight: 6,
    severity: "low",
    stage: null,
    patterns: [/^dear\s+(customer|user|sir\/madam|valued\s+customer)/im, /^hello\s+dear/im],
    reason: "Uses a generic greeting instead of your actual name, suggesting a mass-sent message.",
  },
];

export function detectSignals(text: string): { hits: RiskSignalHit[]; evidence: EvidenceItem[] } {
  const hits: RiskSignalHit[] = [];
  const evidence: EvidenceItem[] = [];
  let evidenceCounter = 0;

  for (const def of SIGNAL_DEFINITIONS) {
    const evidenceIds: string[] = [];
    for (const pattern of def.patterns) {
      const globalPattern = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
      const matches = text.matchAll(globalPattern);
      for (const match of matches) {
        if (match.index === undefined) continue;
        const quote = match[0];
        if (!quote || quote.trim().length === 0) continue;
        evidenceCounter += 1;
        const id = `${def.id}-${evidenceCounter}`;
        evidence.push({
          id,
          quote,
          startIndex: match.index,
          endIndex: match.index + quote.length,
          reason: def.reason,
          signalId: def.id,
          severity: def.severity,
        });
        evidenceIds.push(id);
        break;
      }
    }
    if (evidenceIds.length > 0) {
      hits.push({
        id: def.id,
        label: def.label,
        category: def.category,
        weight: def.weight,
        evidenceIds,
      });
    }
  }

  evidence.sort((a, b) => a.startIndex - b.startIndex);
  return { hits, evidence };
}

export function getSignalDefinition(id: string): SignalDefinition | undefined {
  return SIGNAL_DEFINITIONS.find((d) => d.id === id);
}
