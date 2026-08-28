import type { ScamAnalysis } from "@/types/analysis";
import { SectionHeading } from "./RedFlags";
import { buildTrapExplanation } from "@/lib/engine/attackChain";

const STAGE_STYLE: Record<string, { color: string; label: string }> = {
  TRUST: { color: "#f0a83b", label: "BUILD TRUST" },
  DESIRE: { color: "#34c6a4", label: "CREATE DESIRE" },
  URGENCY: { color: "#ef7a3c", label: "CREATE URGENCY" },
  FEAR: { color: "#ff5c5c", label: "CREATE FEAR" },
  MONEY_CREDENTIALS: { color: "#ff5c5c", label: "REQUEST MONEY / CREDENTIALS" },
  LOSS: { color: "#ff5c5c", label: "THE LOSS" },
};

export function AttackChainView({ analysis }: { analysis: ScamAnalysis }) {
  if (analysis.attackChain.length === 0) {
    return (
      <section>
        <SectionHeading eyebrow="SHOW ME THE ATTACK" title="No clear manipulation sequence detected" />
        <p className="mt-4 text-[14px] text-text-muted">
          ScamShield could not reconstruct a distinct social-engineering sequence from this content. This is
          consistent with lower-risk or ordinary communication.
        </p>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading eyebrow="SHOW ME THE ATTACK" title="The reconstructed attack sequence" />
      <div className="mt-8">
        {analysis.attackChain.map((stage, i) => {
          const style = STAGE_STYLE[stage.stage] ?? { color: "#8b93a3", label: stage.tactic };
          const label = stage.stage === "MONEY_CREDENTIALS" ? stage.tactic.toUpperCase() : style.label;
          const isLast = i === analysis.attackChain.length - 1;
          return (
            <div key={stage.stage} className="relative flex gap-5 pb-9 last:pb-0">
              {!isLast && (
                <span
                  className="absolute left-[17px] top-9 h-full w-px"
                  style={{ background: "linear-gradient(to bottom, var(--ink-line), transparent)" }}
                  aria-hidden="true"
                />
              )}
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold"
                style={{ borderColor: `${style.color}66`, color: style.color, backgroundColor: `${style.color}14` }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 rounded-lg border border-ink-line bg-ink-raised p-5">
                <p className="font-mono text-[11px] font-semibold tracking-wide" style={{ color: style.color }}>
                  {label}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-text-primary/90">{stage.explanation}</p>
                <p className="mt-3 border-t border-ink-line pt-3 font-mono text-[12px] text-text-muted">
                  <span className="text-text-primary/70">What the attacker wants: </span>
                  {stage.attackerObjective}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {analysis.manipulationTactics.length > 0 && (
        <div className="mt-4 rounded-lg border border-red/30 bg-red/5 p-5">
          <p className="font-mono text-[12px] font-semibold text-red">THE TRAP</p>
          <p className="mt-2 text-[14px] leading-relaxed text-text-primary/90">
            {buildTrapExplanation(analysis.scoreBreakdown.hits, analysis.primaryCategory)}
          </p>
        </div>
      )}
    </section>
  );
}
