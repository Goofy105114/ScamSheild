"use client";

import { useState } from "react";
import type { ScamAnalysis } from "@/types/analysis";
import { SectionHeading } from "./RedFlags";

export function ExplainSimply({ analysis }: { analysis: ScamAnalysis }) {
  const [simple, setSimple] = useState(false);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading eyebrow="EXPLAIN SIMPLY" title={simple ? "In plain language" : "Technical summary"} />
        <button
          onClick={() => setSimple((s) => !s)}
          className="rounded-sm border border-ink-line px-4 py-2 font-mono text-[12px] font-medium text-text-primary transition hover:border-amber/60"
          aria-pressed={simple}
        >
          {simple ? "Show technical view" : "Explain Simply"}
        </button>
      </div>
      <div className="mt-6 rounded-lg border border-ink-line bg-ink-raised p-6">
        <p className="text-[15px] leading-relaxed text-text-primary/90">
          {simple ? analysis.simpleExplanation : analysis.summary}
        </p>
      </div>
    </section>
  );
}
