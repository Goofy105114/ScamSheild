import type { UrlAnalysisResult, UrlSignal } from "@/types/analysis";

const KNOWN_BRANDS = [
  "google", "amazon", "flipkart", "paypal", "microsoft", "apple", "netflix",
  "facebook", "instagram", "whatsapp", "icici", "hdfc", "sbi", "axisbank",
  "irctc", "indiapost", "fedex", "dhl", "chase", "wellsfargo", "bankofamerica",
];

const SUSPICIOUS_TLDS = new Set([
  "zip", "top", "xyz", "click", "gq", "tk", "ml", "cf", "ga", "work", "support",
  "loan", "win", "review", "country", "kim", "science", "party",
]);

const URL_SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "grco.de",
]);

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function findLookalike(hostname: string): string | null {
  const withoutWww = hostname.replace(/^www\./, "");
  const labels = withoutWww.split(".");
  const registrableCore = labels.length >= 2 ? labels[labels.length - 2] : labels[0];
  const fullHostCore = withoutWww.replace(/\./g, "-");

  for (const brand of KNOWN_BRANDS) {
    if (registrableCore === brand) return null;
    const distance = levenshtein(registrableCore, brand);
    if (distance > 0 && distance <= 2 && Math.abs(registrableCore.length - brand.length) <= 3) {
      return brand;
    }
    if (fullHostCore.includes(brand) && registrableCore !== brand) {
      return brand;
    }
  }
  return null;
}

function isIpAddress(hostname: string): boolean {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4.test(hostname);
}

export function analyzeUrl(rawUrl: string): UrlAnalysisResult {
  const signals: UrlSignal[] = [];
  const trimmed = rawUrl.trim();
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `http://${candidate}`;
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(candidate);
  } catch {
    parsed = null;
  }

  if (!parsed) {
    return {
      submittedUrl: rawUrl,
      normalizedUrl: null,
      isValidUrl: false,
      hostname: null,
      isHttps: null,
      isIpAddress: false,
      subdomainCount: 0,
      tld: null,
      lookalikeOf: null,
      signals: [
        {
          id: "invalid_url",
          label: "Not a well-formed URL",
          detail: "The submitted text could not be parsed as a valid web address.",
          severity: "medium",
        },
      ],
      verificationStatement: "Unable to verify destination: this does not appear to be a valid, well-formed URL.",
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isHttps = /^https:\/\//i.test(trimmed) || parsed.protocol === "https:";
  const ip = isIpAddress(hostname);
  const labels = hostname.split(".");
  const tld = labels.length > 1 ? labels[labels.length - 1] : null;
  const subdomainCount = Math.max(0, labels.length - 2);
  const lookalike = ip ? null : findLookalike(hostname);
  const isShortener = URL_SHORTENERS.has(hostname);

  if (!isHttps) {
    signals.push({
      id: "no_https",
      label: "No secure connection (HTTP)",
      detail: "The link does not use HTTPS, so data sent to it is not encrypted in transit.",
      severity: "medium",
    });
  }

  if (ip) {
    signals.push({
      id: "ip_based_url",
      label: "IP address used instead of a domain name",
      detail: "Legitimate organizations almost never link directly to a raw IP address.",
      severity: "high",
    });
  }

  if (subdomainCount >= 3) {
    signals.push({
      id: "excessive_subdomains",
      label: "Excessive subdomains",
      detail: `This address has ${subdomainCount} subdomain levels, often used to disguise the real destination.`,
      severity: "medium",
    });
  }

  if (tld && SUSPICIOUS_TLDS.has(tld)) {
    signals.push({
      id: "suspicious_tld",
      label: `Frequently abused top-level domain (.${tld})`,
      detail: `The .${tld} extension is inexpensive and disproportionately used in scam campaigns.`,
      severity: "low",
    });
  }

  if (lookalike) {
    signals.push({
      id: "lookalike_domain",
      label: `Possible lookalike of "${lookalike}"`,
      detail: `The domain closely resembles "${lookalike}" but is not the official domain, a common brand-impersonation tactic.`,
      severity: "high",
    });
  }

  if (isShortener) {
    signals.push({
      id: "url_shortener",
      label: "URL shortening service",
      detail: "Shortened links hide the true destination until you click.",
      severity: "low",
    });
  }

  const params = parsed.searchParams;
  const suspiciousParamKeys = ["token", "session", "verify", "auth", "login", "password", "redirect"];
  const foundParams = suspiciousParamKeys.filter((k) => params.has(k));
  if (foundParams.length > 0) {
    signals.push({
      id: "suspicious_parameters",
      label: "Sensitive-looking URL parameters",
      detail: `The link includes parameters (${foundParams.join(", ")}) sometimes used to pre-fill phishing forms or track credential submissions.`,
      severity: "low",
    });
  }

  if (/@/.test(trimmed.split("://")[1] ?? "")) {
    signals.push({
      id: "embedded_credentials_or_at",
      label: "\"@\" symbol in the URL",
      detail: "Text before an \"@\" symbol is ignored by browsers, a technique used to disguise the real domain.",
      severity: "high",
    });
  }

  const hasHighOrMedium = signals.some((s) => s.severity === "high" || s.severity === "medium");
  const verificationStatement = hasHighOrMedium
    ? "Unable to verify destination. Structural warning signs were found, and structural analysis alone cannot establish that a destination is safe. Do not click the link or enter credentials or payment details."
    : "Unable to verify destination. Structural analysis alone cannot establish that a destination is safe because site content and reputation were not verified.";

  return {
    submittedUrl: rawUrl,
    normalizedUrl: parsed.toString(),
    isValidUrl: true,
    hostname,
    isHttps,
    isIpAddress: ip,
    subdomainCount,
    tld,
    lookalikeOf: lookalike,
    signals,
    verificationStatement,
  };
}

export function extractUrlsFromText(text: string): string[] {
  const domainPattern = /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?)\b/gi;
  const ipPattern = /\bhttps?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?:\/[^\s]*)?/gi;

  const domainMatches = text.match(domainPattern) ?? [];
  const ipMatches = text.match(ipPattern) ?? [];

  const filteredDomains = domainMatches.filter((m) => /\.[a-z]{2,}/i.test(m) && !/^\d+\.\d+$/.test(m));
  return Array.from(new Set([...ipMatches, ...filteredDomains]));
}
