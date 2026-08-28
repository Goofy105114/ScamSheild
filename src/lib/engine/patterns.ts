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

function dedupeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function shouldTreatAsDuplicate(a: EvidenceItem, b: EvidenceItem): boolean {
  const familyA = getSignalFamily(a.signalId);
  const familyB = getSignalFamily(b.signalId);
  if (familyA !== familyB) return false;

  const aText = dedupeText(a.quote).toLowerCase();
  const bText = dedupeText(b.quote).toLowerCase();
  if (!aText || !bText) return false;

  if (aText === bText) return true;
  return aText.includes(bText) || bText.includes(aText);
}

function getSignalFamily(signalId: string): string {
  const paymentSignals = new Set(["upfront_payment", "registration_fee", "unusual_payment_method"]);
  const compensationSignals = new Set(["attractive_offer", "unrealistic_reward"]);

  if (paymentSignals.has(signalId)) return "payment";
  if (compensationSignals.has(signalId)) return "compensation";
  return signalId;
}

function choosePreferredEvidence(a: EvidenceItem, b: EvidenceItem): EvidenceItem {
  if (a.signalId === "registration_fee" && b.signalId === "upfront_payment") return a;
  if (b.signalId === "registration_fee" && a.signalId === "upfront_payment") return b;
  if (a.signalId === "attractive_offer" && b.signalId === "attractive_offer") {
    const aHasPeriod = /\b(?:per\s+month|monthly|per\s+day|daily|weekly)\b/i.test(a.quote);
    const bHasPeriod = /\b(?:per\s+month|monthly|per\s+day|daily|weekly)\b/i.test(b.quote);
    if (aHasPeriod !== bHasPeriod) return aHasPeriod ? a : b;
    const aHasCompensationLabel = /\b(?:salary|income|pay|remuneration)\b/i.test(a.quote);
    const bHasCompensationLabel = /\b(?:salary|income|pay|remuneration)\b/i.test(b.quote);
    if (aHasCompensationLabel !== bHasCompensationLabel) return aHasCompensationLabel ? a : b;
  }
  const aScore = (a.quote.length <= 120 ? 8 : 0) + (12 - Math.min(12, dedupeText(a.quote).split(/\s+/).length)) + (/\b(?:pay|fee|charge|within|immediately|today|deadline|final|limit|soon|minutes?)\b/i.test(a.quote) ? 12 : 0);
  const bScore = (b.quote.length <= 120 ? 8 : 0) + (12 - Math.min(12, dedupeText(b.quote).split(/\s+/).length)) + (/\b(?:pay|fee|charge|within|immediately|today|deadline|final|limit|soon|minutes?)\b/i.test(b.quote) ? 12 : 0);

  return aScore >= bScore ? a : b;
}

export const SIGNAL_DEFINITIONS: SignalDefinition[] = [
  {
    id: "upfront_payment",
    label: "Upfront payment request",
    category: "financial",
    weight: 26,
    severity: "high",
    stage: "MONEY_CREDENTIALS",
    patterns: [
      new RegExp(`(?:need\\s+to\\s+pay|pay|deposit|transfer|send)\\s+(?:a\\s+)?(?:refundable\\s+)?(?:registration|processing|verification|activation|security)\\s+(?:fee|charge|deposit|payment)(?:\\s+(?:of|for))?(?:\\s+(?:${money}))?`, "i"),
      new RegExp(`(?:need\\s+to\\s+pay|pay|deposit|transfer|send)\\s+(?:an?\\s+)?(?:${money}|[\\w\\s-]{0,20}(fee|charge|deposit|amount))`, "i"),
    ],
    reason: "Asks you to pay money before you receive anything in return, a hallmark of advance-fee fraud.",
  },
  {
    id: "registration_fee",
    label: "Registration fee payment request",
    category: "financial",
    weight: 38,
    severity: "high",
    stage: "MONEY_CREDENTIALS",
    patterns: [
      new RegExp(`(?:registration|processing|verification|activation|onboarding)\\s+(?:fee|charge|payment|deposit)(?:\\s+(?:of|for))?(?:\\s+(?:${money}))?`, "i"),
      new RegExp(`(?:need\\s+to\\s+pay|pay|send)\\s+(?:a\\s+)?(?:refundable\\s+)?(?:registration|processing|verification|activation)\\s+(?:fee|charge|payment)(?:\\s+(?:of|for))?(?:\\s+(?:${money}))?`, "i"),
    ],
    reason: "Requests a registration or processing fee before the opportunity is confirmed, a classic advance-fee scam pattern.",
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
    weight: 32,
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
    weight: 24,
    severity: "high",
    stage: "URGENCY",
    patterns: [
      /within\s+(?:the\s+next\s+)?\d+\s?(minutes?|hours?|mins?)/i,
      /within\s+(?:the\s+next\s+)?\d+\s+(?:minutes?|hours?|mins?)/i,
      /(?:today\s+only|expires?\s+(?:today|tonight)|final\s+warning|respond\s+now|act\s+now|immediately|last\s+chance|limited\s+time|deadline|only\s+(?:a\s+)?few\s+minutes\s+left|before\s+your\s+account\s+is\s+closed)/i,
      /expires?\s+(today|soon|in\s+\d+)/i,
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
    weight: 16,
    severity: "medium",
    stage: "DESIRE",
    patterns: [
      /(?:easy|high|strong)\s+(?:income|returns?|profit|salary|pay)/i,
      /earn\s+.{0,20}(?:daily|per\s+day|weekly|per\s+month|monthly)/i,
      /no\s+experience\s+(?:needed|required)/i,
      /(?:selected|won|chosen)\s+(?:for|to\s+receive)\s+(?:a\s+)?(?:bonus|reward|cash|salary)/i,
      /(?:congratulations|selected)\b.{0,50}\b(?:work[-\s]from[-\s]home|home[-\s]based|remote)\b.{0,50}\b(?:job|position|opportunity)\b/i,
    ],
    reason: "Dangles an unusually attractive reward to lower your skepticism.",
  },
  {
    id: "attractive_offer",
    label: "Unusually attractive compensation offer",
    category: "psychological",
    weight: 12,
    severity: "medium",
    stage: "DESIRE",
    patterns: [
      new RegExp(`(?:salary|income|pay|remuneration)\\s+(?:of\\s+)?(?:${money})\\s+(?:per\\s+month|monthly|per\\s+day|daily|weekly)`, "i"),
      /(?:₹|rs\.?|inr)[\d,]+(?:\.\d+)?\s+(?:per\s+month|monthly)/i,
      new RegExp(`(?:salary|income)\\s+(?:of\\s+)?(?:${money})`, "i"),
    ],
    reason: "Offers compensation that is unusually high for a minimal effort or no clear qualification process.",
  },
  {
    id: "employment_context",
    label: "Employment opportunity context",
    category: "structural",
    weight: 8,
    severity: "low",
    stage: "DESIRE",
    patterns: [/\b(?:job|position|role|employment|employer|internship|recruitment|salary|work[-\s]?from[-\s]?home)\b/i],
    reason: "References an employment opportunity, which provides context for evaluating related requests or promises.",
  },
  {
    id: "exclusivity_claim",
    label: "Exclusivity claim",
    category: "psychological",
    weight: 10,
    severity: "medium",
    stage: "SCARCITY",
    patterns: [/limited\s+number\s+of\s+(?:participants|members|people|spots|slots)/i, /exclusive\s+(?:access|opportunity|group|offer)/i],
    reason: "Uses limited access or exclusivity to make the opportunity feel scarce and discourage careful consideration.",
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
    patterns: [/guaranteed\s+returns?/i, /guaranteed\s+profit/i, /risk[-\s]?free\s+profit/i, /risk[-\s]?free\s+investment/i, /assured\s+returns?/i, /cannot\s+lose/i, /your\s+money\s+will\s+definitely\s+double/i, /\d{2,4}%\s+guaranteed\s+returns?/i],
    reason: "Guarantee or certainty claims about investment returns are warning signs because legitimate investments cannot promise profit without risk.",
  },
  {
    id: "impersonation",
    label: "Impersonation of a trusted organization",
    category: "impersonation",
    weight: 16,
    severity: "medium",
    stage: "TRUST",
    patterns: [
      /\b(bank|amazon|flipkart|paypal|microsoft|apple|google|income\s?tax|india\s+post|customs|courier|fedex|dhl|police|cbi|rbi)\b.{0,25}\b(team|department|support|security|official)\b/i,
      /\bindia\s+post\b/i,
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
    stage: "PRIVATE_CHANNEL",
    patterns: [/contact\s+us\s+on\s+whatsapp/i, /message\s+us\s+(directly|privately)/i, /private\s+channel/i, /switch\s+to\s+(telegram|whatsapp)/i],
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
    patterns: [/package\s+(is\s+)?(held|delayed|pending|has\s+arrived)/i, /attempted\s+delivery/i, /incomplete\s+address\s+information/i, /update\s+(?:your\s+)?address\s+details/i, /customs\s+(duty|fee)/i, /reschedule\s+your\s+delivery/i, /shipment\s+(could not|failed)/i],
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
        const rawQuote = match[0];
        const quote = rawQuote.trim();
        if (!quote || quote.trim().length === 0) continue;
        evidenceCounter += 1;
        const id = `${def.id}-${evidenceCounter}`;
        evidence.push({
          id,
          quote: rawQuote,
          startIndex: match.index,
          endIndex: match.index + rawQuote.length,
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

  const dedupedEvidence: EvidenceItem[] = [];
  evidence.sort((a, b) => a.startIndex - b.startIndex);

  for (const item of evidence) {
    const duplicateIndex = dedupedEvidence.findIndex((existing) => shouldTreatAsDuplicate(existing, item));
    if (duplicateIndex >= 0) {
      const preferred = choosePreferredEvidence(dedupedEvidence[duplicateIndex], item);
      dedupedEvidence[duplicateIndex] = preferred;
      continue;
    }
    dedupedEvidence.push(item);
  }

  dedupedEvidence.sort((a, b) => a.startIndex - b.startIndex);

  for (const hit of hits) {
    const ids = hit.evidenceIds.filter((id) => dedupedEvidence.some((e) => e.id === id));
    if (ids.length > 0) {
      hit.evidenceIds = ids;
    }
  }

  return { hits, evidence: dedupedEvidence };
}

export function getSignalDefinition(id: string): SignalDefinition | undefined {
  return SIGNAL_DEFINITIONS.find((d) => d.id === id);
}
