import Link from "next/link";

const PREVIEW_TEXT = "Congratulations! You've been selected for a ₹75,000 work-from-home role. Pay ₹1,499 registration charges within 10 minutes to secure your position.";

const PREVIEW_ANNOTATIONS = [
  { text: "Congratulations! You've been selected", tag: "TRUST", color: "#f0a83b" },
  { text: " for a ", tag: null, color: "" },
  { text: "₹75,000 work-from-home role", tag: "DESIRE", color: "#34c6a4" },
  { text: ". Pay ", tag: null, color: "" },
  { text: "₹1,499 registration charges", tag: "MONEY", color: "#ff5c5c" },
  { text: " ", tag: null, color: "" },
  { text: "within 10 minutes", tag: "URGENCY", color: "#ef7a3c" },
  { text: " to secure your position.", tag: null, color: "" },
];

export function HeroPreview() {
  return (
    <div
      className="reveal overflow-hidden rounded-lg border border-ink-line bg-ink-raised shadow-2xl shadow-black/40"
      style={{ animationDelay: "180ms" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-ink-line bg-black/20 px-4 py-2.5">
        <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red/70" aria-hidden="true" />
          <span className="whitespace-nowrap">CASE #SS-2026-08-0142</span>
        </div>
        <span className="whitespace-nowrap font-mono text-[11px] text-amber">LIVE PREVIEW</span>
      </div>
      <div className="p-5 sm:p-6">
        <p className="font-mono text-[13px] leading-loose text-text-primary/90 sm:text-[14px]">
          {PREVIEW_ANNOTATIONS.map((part, i) =>
            part.tag ? (
              <mark
                key={i}
                className="rounded-[3px] px-1 py-0.5"
                style={{ backgroundColor: `${part.color}26`, color: part.color, boxDecorationBreak: "clone" }}
              >
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-line pt-4">
          {[
            { label: "TRUST", color: "#f0a83b" },
            { label: "DESIRE", color: "#34c6a4" },
            { label: "URGENCY", color: "#ef7a3c" },
            { label: "MONEY", color: "#ff5c5c" },
          ].map((t) => (
            <span
              key={t.label}
              className="rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium tracking-wide"
              style={{ borderColor: `${t.color}55`, color: t.color }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-ink-line bg-black/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center justify-between gap-4 sm:contents">
          <div>
            <p className="font-mono text-[11px] text-text-muted">RISK SCORE</p>
            <p className="font-display text-3xl font-bold text-red">94</p>
          </div>
          <div className="text-right sm:order-2">
            <p className="font-mono text-[11px] text-text-muted">CLASSIFICATION</p>
            <p className="font-display text-sm font-semibold text-text-primary">Likely Job Scam</p>
          </div>
        </div>
        <Link
          href="/analyze"
          className="shrink-0 rounded-sm border border-amber/60 bg-amber/10 px-3.5 py-2 text-center font-mono text-[12px] font-medium text-amber transition hover:bg-amber/20 sm:order-3"
        >
          See full case →
        </Link>
      </div>
    </div>
  );
}

export function PreviewSourceText() {
  return PREVIEW_TEXT;
}
