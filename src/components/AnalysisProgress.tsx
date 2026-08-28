"use client";

const STAGES = [
  "Reading content",
  "Finding suspicious patterns",
  "Checking risk signals",
  "Understanding the attack",
  "Building your safety report",
];

export function AnalysisProgress({ activeStage }: { activeStage: number }) {

  return (
    <div className="mx-auto max-w-md rounded-lg border border-ink-line bg-ink-raised p-8 text-center">
      <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-ink-line border-t-amber" aria-hidden="true" />
      <p className="font-mono text-[13px] text-amber">CASE IN PROGRESS</p>
      <ul className="mt-4 space-y-2 text-left" aria-live="polite">
        {STAGES.map((stage, i) => (
          <li
            key={stage}
            className="flex items-center gap-2.5 font-mono text-[13px] transition-colors"
            style={{ color: i <= activeStage ? "var(--text-primary)" : "var(--text-muted)" }}
          >
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px]"
              style={{
                borderColor: i <= activeStage ? "var(--amber)" : "var(--ink-line)",
                color: i <= activeStage ? "var(--amber)" : "var(--text-muted)",
              }}
            >
              {i < activeStage ? "✓" : i === activeStage ? "◌" : ""}
            </span>
            {stage}
          </li>
        ))}
      </ul>
    </div>
  );
}
