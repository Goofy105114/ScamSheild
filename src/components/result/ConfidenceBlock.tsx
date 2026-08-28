import type { ScamAnalysis } from "@/types/analysis";
import { SectionHeading } from "./RedFlags";

export function ConfidenceBlock({ analysis }: { analysis: ScamAnalysis }) {
  const pct = Math.round(analysis.confidence * 100);

  return (
    <section>
      <SectionHeading eyebrow="CONFIDENCE" title="How sure is this analysis?" />
      <div className="mt-6 rounded-lg border border-ink-line bg-ink-raised p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[12px] text-text-muted">Confidence in this classification</p>
          <p className="font-mono text-[13px] text-text-primary">{pct}%</p>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-ink">
          <div className="h-full rounded-full bg-amber" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-text-muted">
          {analysis.aiEnhanced
            ? "This analysis combines rule-based pattern detection with AI semantic reasoning."
            : "This analysis is based on rule-based pattern and structural detection."}{" "}
          {!analysis.aiEnhanced && analysis.aiUnavailableReason ? analysis.aiUnavailableReason : ""} ScamShield never
          guarantees that content is or is not a scam — always apply your own judgment alongside this report.
        </p>

        {analysis.urlAnalysis && (
          <div className="mt-5 border-t border-ink-line pt-5">
            <p className="font-mono text-[12px] text-text-muted">URL VERIFICATION STATUS</p>
            <p className="mt-2 text-[14px] leading-relaxed text-text-primary/90">
              {analysis.urlAnalysis.verificationStatement}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
