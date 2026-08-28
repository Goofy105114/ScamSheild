import type { ScamAnalysis } from "@/types/analysis";

export function RedFlags({ analysis }: { analysis: ScamAnalysis }) {
  if (analysis.redFlags.length === 0) {
    return (
      <section>
        <SectionHeading eyebrow="WHY WE FLAGGED THIS" title="No strong red flags detected" />
        <p className="mt-4 text-[14px] text-text-muted">
          The engine did not find common scam indicators in this content. That does not guarantee it is completely
          safe, but no major structural or psychological warning signs were present.
        </p>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading eyebrow="WHY WE FLAGGED THIS" title="Red flags detected" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {analysis.redFlags.map((flag, i) => (
          <div key={i} className="flex gap-3 rounded-lg border border-ink-line bg-ink-raised p-4">
            <span className="mt-0.5 font-mono text-[11px] text-red" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-[14px] leading-relaxed text-text-primary/90">{flag}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[12px] text-amber">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-text-primary">{title}</h2>
    </div>
  );
}
