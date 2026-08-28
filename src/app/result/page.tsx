"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ScamAnalysis } from "@/types/analysis";
import { loadAnalysis } from "@/lib/analysisStore";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { RiskHeader } from "@/components/result/RiskHeader";
import { RedFlags } from "@/components/result/RedFlags";
import { EvidenceViewer } from "@/components/result/EvidenceViewer";
import { AttackChainView } from "@/components/result/AttackChainView";
import { ActionsList } from "@/components/result/ActionsList";
import { RecoveryMode } from "@/components/result/RecoveryMode";
import { ExplainSimply } from "@/components/result/ExplainSimply";
import { AskAssistant } from "@/components/result/AskAssistant";
import { ConfidenceBlock } from "@/components/result/ConfidenceBlock";

export default function ResultPage() {
  const [analysis, setAnalysis] = useState<ScamAnalysis | null | undefined>(undefined);

  useEffect(() => {
    const loaded = loadAnalysis();
    queueMicrotask(() => setAnalysis(loaded));
  }, []);

  if (analysis === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-ink">
        <SiteNav />
        <main className="flex-1" />
        <SiteFooter />
      </div>
    );
  }

  if (analysis === null) {
    return (
      <div className="flex min-h-screen flex-col bg-ink">
        <SiteNav />
        <main className="flex flex-1 items-center justify-center px-5 py-24 text-center">
          <div>
            <p className="font-mono text-[12px] text-amber">NO ACTIVE CASE</p>
            <h1 className="mt-3 font-display text-2xl font-semibold text-text-primary">
              We couldn&apos;t find a result to show
            </h1>
            <p className="mt-3 max-w-md text-[14px] text-text-muted">
              Your analysis may have expired, or you navigated here directly. Submit something to analyze first.
            </p>
            <Link
              href="/analyze"
              className="mt-7 inline-block rounded-sm border border-amber bg-amber px-6 py-3 font-mono text-[13px] font-semibold text-[#14120a]"
            >
              Analyze Something
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <SiteNav />
      <main className="flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-4xl space-y-16">
          <RiskHeader analysis={analysis} />
          <RedFlags analysis={analysis} />
          <EvidenceViewer analysis={analysis} />
          <AttackChainView analysis={analysis} />
          <ActionsList analysis={analysis} />
          <RecoveryMode analysis={analysis} />
          <ExplainSimply analysis={analysis} />
          <AskAssistant analysis={analysis} />
          <ConfidenceBlock analysis={analysis} />

          <div className="border-t border-ink-line pt-10 text-center">
            <Link
              href="/analyze"
              className="inline-block rounded-sm border border-ink-line px-6 py-3 font-mono text-[13px] font-medium text-text-primary transition hover:border-amber/60"
            >
              Analyze another message
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
