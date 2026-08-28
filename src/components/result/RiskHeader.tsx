import type { ScamAnalysis } from "@/types/analysis";
import { RISK_STYLES } from "@/lib/riskStyles";
import { CATEGORY_LABELS } from "@/lib/engine/classify";

export function RiskHeader({ analysis }: { analysis: ScamAnalysis }) {
  const style = RISK_STYLES[analysis.riskLevel];
  const categoryLabel = CATEGORY_LABELS[analysis.primaryCategory] ?? "Suspicious Activity";

  return (
    <div
      className="reveal overflow-hidden rounded-xl border"
      style={{ borderColor: style.border, backgroundColor: style.bg }}
    >
      <div className="flex flex-col gap-8 p-6 sm:p-9 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-display text-6xl font-bold sm:text-7xl" style={{ color: style.color }}>
              {analysis.riskScore}
            </p>
            <p className="mt-1 font-mono text-[11px] text-text-muted">/ 100</p>
          </div>
          <div className="h-16 w-px bg-current opacity-15" style={{ color: style.color }} aria-hidden="true" />
          <div>
            <p
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[12px] font-semibold tracking-wide"
              style={{ borderColor: style.border, color: style.color }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color }} aria-hidden="true" />
              {style.label}
            </p>
            <h1 className="mt-2 font-display text-xl font-semibold text-text-primary sm:text-2xl">
              Likely {categoryLabel}
            </h1>
          </div>
        </div>
        <div className="max-w-sm font-mono text-[12px] leading-relaxed text-text-muted md:text-right">
          CASE #{analysis.id.slice(-10).toUpperCase()}
          <br />
          {new Date(analysis.createdAt).toLocaleString()}
        </div>
      </div>
      <div className="border-t px-6 py-5 sm:px-9" style={{ borderColor: style.border }}>
        <p className="text-[15px] leading-relaxed text-text-primary/90">{analysis.summary}</p>
      </div>
    </div>
  );
}
