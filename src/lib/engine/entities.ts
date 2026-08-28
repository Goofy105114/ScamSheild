import type { DetectedEntity } from "@/types/analysis";

const ENTITY_PATTERNS: { type: DetectedEntity["type"]; pattern: RegExp }[] = [
  { type: "money_amount", pattern: /(?:₹|rs\.?|inr|\$|usd|eur|€|£|gbp)\s?[\d,]+(?:\.\d+)?/gi },
  { type: "phone_number", pattern: /(?:\+?\d{1,3}[-\s]?)?\(?\d{3,5}\)?[-\s]?\d{3,4}[-\s]?\d{3,4}\b/g },
  { type: "email", pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: "url", pattern: /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?\b/gi },
  { type: "time_window", pattern: /within\s+\d+\s?(?:minutes?|hours?|mins?|days?)/gi },
  { type: "otp_reference", pattern: /\botp\b|one[-\s]?time\s?(?:password|code|pin)/gi },
];

export function extractEntities(text: string): DetectedEntity[] {
  const entities: DetectedEntity[] = [];
  for (const { type, pattern } of ENTITY_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match.index === undefined) continue;
      entities.push({
        type,
        value: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }
  return entities.sort((a, b) => a.startIndex - b.startIndex);
}
