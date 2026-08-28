import type { RecommendedAction, RiskSignalHit, ScamCategory } from "@/types/analysis";

function action(id: string, label: string, description: string, priority: RecommendedAction["priority"]): RecommendedAction {
  return { id, label, description, priority };
}

export function buildRecommendedActions(
  primaryCategory: ScamCategory,
  hits: RiskSignalHit[],
  hasUrl: boolean
): RecommendedAction[] {
  const hitIds = new Set(hits.map((h) => h.id));
  const actions: RecommendedAction[] = [];

  if (hitIds.has("upfront_payment") || hitIds.has("unusual_payment_method")) {
    actions.push(
      action(
        "no_payment",
        "Do not send any money",
        "Legitimate opportunities do not require you to pay upfront to receive a job, prize, or refund.",
        "critical"
      )
    );
  }

  if (hitIds.has("otp_request") || hitIds.has("password_request") || hitIds.has("banking_info_request") || hitIds.has("card_info_request")) {
    actions.push(
      action(
        "no_credentials",
        "Never share OTPs, passwords, or card details",
        "No legitimate bank, company, or government agency will ever ask for your OTP, password, PIN, or full card number over message or call.",
        "critical"
      )
    );
  }

  if (hasUrl || primaryCategory === "phishing") {
    actions.push(
      action(
        "no_click",
        "Do not click the link",
        "Open the organization's official app or website by typing the address yourself instead of using the provided link.",
        "critical"
      )
    );
  }

  actions.push(
    action(
      "verify_independently",
      "Verify independently through an official channel",
      "Contact the organization directly using a phone number or website you already trust, not one provided in this message.",
      "important"
    )
  );

  if (primaryCategory === "job_scam") {
    actions.push(
      action(
        "verify_employer",
        "Verify the employer's official careers page",
        "Search for the company's real careers page and confirm the role is genuinely listed there before proceeding.",
        "important"
      )
    );
  }

  if (primaryCategory === "banking_scam" || primaryCategory === "account_takeover" || hitIds.has("account_verification")) {
    actions.push(
      action(
        "change_password",
        "Change your password if you already entered it",
        "If you already submitted credentials on a linked page, change that password immediately and enable two-factor authentication.",
        "critical"
      )
    );
  }

  if (primaryCategory === "government_impersonation") {
    actions.push(
      action(
        "contact_authority_directly",
        "Contact the agency directly",
        "Government agencies do not typically demand immediate payment or threaten arrest by message. Verify through the agency's official website.",
        "important"
      )
    );
  }

  actions.push(
    action(
      "report_block",
      "Report and block the sender",
      "Reporting helps the platform flag the sender for others, and blocking prevents further contact.",
      "helpful"
    )
  );

  actions.push(
    action(
      "pause_and_verify",
      "Take time before acting",
      "Urgency is a manipulation tactic. A genuine opportunity or requirement will still be valid after you take time to check.",
      "helpful"
    )
  );

  const seen = new Set<string>();
  return actions.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
}
