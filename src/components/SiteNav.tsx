import Link from "next/link";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-line/80 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="ScamShield home">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-amber/50 font-mono text-xs font-semibold text-amber"
            aria-hidden="true"
          >
            SS
          </span>
          <span className="font-display text-[17px] font-semibold tracking-tight text-text-primary">
            ScamShield
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/analyze#demo"
            className="hidden font-mono text-[13px] text-text-muted transition hover:text-text-primary sm:block"
          >
            Demo Library
          </Link>
          <Link
            href="/analyze"
            className="rounded-sm border border-amber bg-amber px-4 py-2 font-mono text-[13px] font-medium text-[#14120a] transition hover:bg-amber/90"
          >
            Analyze Something
          </Link>
        </nav>
      </div>
    </header>
  );
}
