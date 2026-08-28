import type { ScamAnalysis } from "@/types/analysis";
import { SectionHeading } from "./RedFlags";

const PRIORITY_STYLE: Record<string, { color: string; label: string }> = {
  critical: { color: "#ff5c5c", label: "DO THIS FIRST" },
  important: { color: "#f0a83b", label: "IMPORTANT" },
  helpful: { color: "#34c6a4", label: "HELPFUL" },
};

export function ActionsList({ analysis }: { analysis: ScamAnalysis }) {
  return (
    <section>
      <SectionHeading eyebrow="WHAT YOU SHOULD DO" title="Recommended next steps" />
      <div className="mt-6 space-y-3">
        {analysis.recommendedActions.map((action) => {
          const style = PRIORITY_STYLE[action.priority];
          return (
            <div key={action.id} className="flex gap-4 rounded-lg border border-ink-line bg-ink-raised p-5">
              <span
                className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: style.color }}
                aria-hidden="true"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="font-display text-[15px] font-semibold text-text-primary">{action.label}</p>
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[9px] tracking-wide"
                    style={{ backgroundColor: `${style.color}22`, color: style.color }}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-text-muted">{action.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
