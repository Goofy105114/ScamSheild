import type { ScamAnalysis } from "@/types/analysis";
import { SectionHeading } from "./RedFlags";

const SEVERITY_COLOR: Record<string, string> = {
  high: "#ff5c5c",
  medium: "#ef7a3c",
  low: "#f0a83b",
};

export function EvidenceViewer({ analysis }: { analysis: ScamAnalysis }) {
  const text = analysis.source.extractedText ?? analysis.source.rawText;
  const evidence = analysis.evidence;

  if (evidence.length === 0) {
    return null;
  }

  const segments: { text: string; evidenceId: string | null; severity?: string }[] = [];
  let cursor = 0;
  for (const item of evidence) {
    if (item.startIndex > cursor) {
      segments.push({ text: text.slice(cursor, item.startIndex), evidenceId: null });
    }
    segments.push({ text: text.slice(item.startIndex, item.endIndex), evidenceId: item.id, severity: item.severity });
    cursor = Math.max(cursor, item.endIndex);
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), evidenceId: null });
  }

  return (
    <section>
      <SectionHeading eyebrow="EVIDENCE" title="Highlighted from your submitted content" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-ink-line bg-ink-raised p-5 sm:p-6">
          <p className="font-mono text-[11px] text-text-muted">SOURCE {analysis.source.type === "image" ? "(OCR EXTRACTED TEXT)" : ""}</p>
          <p className="mt-3 whitespace-pre-wrap font-mono text-[14px] leading-loose text-text-primary/90">
            {segments.map((seg, i) =>
              seg.evidenceId ? (
                <mark
                  key={i}
                  className="rounded-[3px] px-0.5 py-0.5"
                  style={{
                    backgroundColor: `${SEVERITY_COLOR[seg.severity ?? "low"]}26`,
                    color: SEVERITY_COLOR[seg.severity ?? "low"],
                    boxDecorationBreak: "clone",
                  }}
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </p>
        </div>
        <div className="space-y-3">
          {evidence.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-lg border border-ink-line bg-ink-raised p-4">
              <div className="flex items-start justify-between gap-3">
                <p
                  className="font-mono text-[13px] font-medium"
                  style={{ color: SEVERITY_COLOR[item.severity] }}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide"
                  style={{ backgroundColor: `${SEVERITY_COLOR[item.severity]}22`, color: SEVERITY_COLOR[item.severity] }}
                >
                  {item.severity}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-text-muted">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
