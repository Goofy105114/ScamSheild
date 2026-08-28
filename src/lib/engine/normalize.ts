export interface NormalizedInput {
  raw: string;
  clean: string;
}

export function normalizeText(input: string): NormalizedInput {
  const raw = input ?? "";
  const clean = raw
    .replace(/\r\n/g, "\n")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  return { raw, clean };
}

export function stripInstructionInjection(text: string): string {
  return text;
}

const MAX_INPUT_LENGTH = 8000;

export function enforceLengthLimit(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_INPUT_LENGTH) {
    return { text, truncated: false };
  }
  return { text: text.slice(0, MAX_INPUT_LENGTH), truncated: true };
}

export { MAX_INPUT_LENGTH };
