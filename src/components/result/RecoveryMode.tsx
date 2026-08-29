"use client";

import { useState } from "react";
import type { ScamAnalysis } from "@/types/analysis";
import { SectionHeading } from "./RedFlags";

interface RecoveryStep {
  id: string;
  title: string;
  description: string;
  urgent?: boolean;
}

function getRecoverySteps(analysis: ScamAnalysis): RecoveryStep[] {
  const signalIds = new Set(analysis.scoreBreakdown.hits.map((hit) => hit.id));
  const needsCredentialResponse = [
    "otp_request",
    "password_request",
    "banking_info_request",
    "card_info_request",
    "account_verification",
  ].some((id) => signalIds.has(id));
  const needsPaymentResponse = ["upfront_payment", "registration_fee", "unusual_payment_method"].some((id) => signalIds.has(id));
  const steps: RecoveryStep[] = [];

  if (needsPaymentResponse) {
    steps.push({
      id: "no-payment",
      title: "Do not send money",
      description: "Do not pay the requested fee or deposit. A legitimate opportunity should not require upfront payment before it is delivered.",
      urgent: true,
    });
  }

  steps.push(
    {
      id: "stop-contact",
      title: "Stop the conversation",
      description: "Do not reply, click links, open attachments, or send more information. Block the sender after saving evidence.",
      urgent: true,
    },
    {
      id: "save-evidence",
      title: "Save the evidence",
      description: "Keep the original message, sender details, timestamps, payment references, and screenshots. Do not edit the originals.",
    }
  );

  if (needsCredentialResponse) {
    steps.push({
      id: "secure-accounts",
      title: "Secure affected accounts",
      description: "Use the official app or website to change exposed passwords, freeze cards, revoke active sessions, and contact the bank or service using a trusted number.",
      urgent: true,
    });
  }

  if (needsPaymentResponse) {
    steps.push({
      id: "contact-payment",
      title: "Contact the payment provider",
      description: "Report the transaction immediately through your bank, card issuer, wallet, or payment app. Ask whether a hold, recall, or dispute is possible.",
      urgent: true,
    });
  }

  if (
    analysis.primaryCategory === "credential_theft" ||
    analysis.primaryCategory === "account_takeover" ||
    analysis.primaryCategory === "government_impersonation"
  ) {
    steps.push({
      id: "identity-support",
      title: "Protect your identity",
      description: "Contact the relevant official authority through its verified website and monitor accounts for unfamiliar activity.",
      urgent: true,
    });
  }

  steps.push({
    id: "report",
    title: "Report the sender or listing",
    description: "Use the platform's report flow and include the saved evidence. Report financial loss to your bank and local cybercrime authority where applicable.",
  });

  return steps;
}

function buildReportTemplate(analysis: ScamAnalysis): string {
  const sourceType = analysis.source.type === "image" ? "Screenshot" : analysis.source.type === "url" ? "URL" : "Message";
  const flags = analysis.redFlags.length > 0 ? analysis.redFlags.map((flag) => `- ${flag}`).join("\n") : "- No strong red flags detected";

  return `SCAMSHIELD INCIDENT REPORT

Content type: ${sourceType}
Risk level: ${analysis.riskLevel} (${analysis.riskScore}/100)
Likely category: ${analysis.primaryCategory.replaceAll("_", " ")}
Case reference: ${analysis.id}

WHY IT WAS FLAGGED
${flags}

WHAT TO ATTACH
- Original message or screenshot
- Sender profile, phone number, email, or URL
- Date and time received
- Transaction or reference number, if any

Please investigate this suspected scam and advise on available protective or recovery steps.`;
}

export function RecoveryMode({ analysis }: { analysis: ScamAnalysis }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const steps = getRecoverySteps(analysis);
  const reportTemplate = buildReportTemplate(analysis);

  function toggleStep(id: string) {
    setCompleted((current) => (current.includes(id) ? current.filter((stepId) => stepId !== id) : [...current, id]));
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportTemplate);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section>
      <SectionHeading eyebrow="RECOVERY MODE" title="Turn this finding into a response plan" />
      <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-text-muted">
        This checklist stays in your browser. Complete only the steps that apply, and use official channels you already trust.
      </p>

      <div className="mt-6 space-y-3">
        {steps.map((step, index) => {
          const isComplete = completed.includes(step.id);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => toggleStep(step.id)}
              className="flex w-full gap-4 rounded-lg border border-ink-line bg-ink-raised p-5 text-left transition hover:border-amber/60"
              aria-pressed={isComplete}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border font-mono text-[11px] ${
                  isComplete ? "border-teal bg-teal text-ink" : "border-text-muted text-transparent"
                }`}
                aria-hidden="true"
              >
                ✓
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className={`font-display text-[15px] font-semibold ${isComplete ? "text-text-muted line-through" : "text-text-primary"}`}>
                    {index + 1}. {step.title}
                  </span>
                  {step.urgent && <span className="font-mono text-[9px] tracking-wide text-red">PRIORITY</span>}
                </span>
                <span className="mt-1.5 block text-[14px] leading-relaxed text-text-muted">{step.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-ink-line bg-ink-raised p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] text-amber">REPORT TEMPLATE</p>
            <p className="mt-1 text-[14px] text-text-primary">Share a structured report without exposing the original content.</p>
          </div>
          <button
            type="button"
            onClick={copyReport}
            className="rounded-sm border border-amber bg-amber px-4 py-2 font-mono text-[12px] font-semibold text-[#14120a] transition hover:bg-amber/90"
          >
            {copied ? "Copied" : "Copy report"}
          </button>
        </div>
        <pre
          tabIndex={0}
          className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap border-t border-ink-line pt-4 font-mono text-[11px] leading-relaxed text-text-muted"
        >
          {reportTemplate}
        </pre>
      </div>
    </section>
  );
}