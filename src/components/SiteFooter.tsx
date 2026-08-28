import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-line/80 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-sm border border-amber/40 font-mono text-[10px] font-semibold text-amber"
              aria-hidden="true"
            >
              SS
            </span>
            <span className="font-display text-sm font-semibold text-text-primary">ScamShield</span>
          </div>
          <p className="mt-3 max-w-xs font-mono text-[12px] leading-relaxed text-text-muted">
            Think before you click. Built for a hackathon, designed like a real safety product.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 font-mono text-[12px] text-text-muted sm:flex sm:gap-14">
          <div className="flex flex-col gap-2.5">
            <span className="text-text-primary/70">Product</span>
            <Link href="/analyze" className="transition hover:text-text-primary">Analyze</Link>
            <Link href="/#how-it-works" className="transition hover:text-text-primary">How it works</Link>
            <Link href="/#privacy" className="transition hover:text-text-primary">Privacy</Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-text-primary/70">Detects</span>
            <Link href="/analyze#demo" className="transition hover:text-text-primary">Demo library</Link>
            <Link href="/#what-we-detect" className="transition hover:text-text-primary">Scam categories</Link>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-5 font-mono text-[11px] text-text-muted sm:px-8">
        ScamShield provides risk analysis to help you make an informed decision. It is not a guarantee that content is
        safe or unsafe. Always use independent judgment.
      </p>
    </footer>
  );
}
