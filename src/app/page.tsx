import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroPreview } from "@/components/HeroPreview";
import { CATEGORY_LABELS } from "@/lib/engine/classify";

const STEPS = [
  { n: "01", title: "Submit", body: "Paste a message, upload a screenshot, or drop in a link." },
  { n: "02", title: "Investigate", body: "A hybrid engine runs pattern detection, URL analysis, and AI reasoning together." },
  { n: "03", title: "Understand", body: "See exactly which words triggered the alert, and the attack sequence behind them." },
  { n: "04", title: "Act", body: "Get specific next steps for what to do right now, not just a verdict." },
];

const DETECT_CARDS = [
  { title: "Upfront payment traps", body: "Registration fees, processing charges, and refundable deposits requested before you receive anything." },
  { title: "Credential harvesting", body: "Requests for OTPs, passwords, PINs, card numbers, or banking details." },
  { title: "Engineered urgency", body: "Countdowns and threats designed to stop you from verifying before you act." },
  { title: "Lookalike links", body: "Domains built to resemble a bank, delivery service, or brand you already trust." },
  { title: "Impersonation", body: "Messages posing as banks, government bodies, couriers, or well-known companies." },
  { title: "Emotional manipulation", body: "Fear, guilt, secrecy, and fabricated relationships used to override judgment." },
];

const ATTACK_STAGES = [
  { stage: "TRUST", body: '"You have been selected..."', purpose: "Creates legitimacy and excitement.", color: "#f0a83b" },
  { stage: "DESIRE", body: '"₹75,000 work-from-home position"', purpose: "Uses an attractive reward to lower skepticism.", color: "#34c6a4" },
  { stage: "URGENCY", body: '"within 10 minutes"', purpose: "Pressures you to act before verifying.", color: "#ef7a3c" },
  { stage: "MONEY", body: '"Pay ₹1,499 registration charges"', purpose: "Introduces the financial loss.", color: "#ff5c5c" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <SiteNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-ink-line px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <div className="case-grid-bg-layer" aria-hidden="true" />
          <div className="relative z-10 mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="reveal mb-6 inline-flex items-center gap-2 rounded-full border border-ink-line bg-ink-raised px-3 py-1.5 font-mono text-[11px] text-text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
                DIGITAL SAFETY LAYER
              </div>
              <h1
                className="reveal font-display text-4xl font-semibold leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-[3.4rem]"
                style={{ animationDelay: "60ms" }}
              >
                Scams don&apos;t look like
                <br />
                scams anymore.
              </h1>
              <p
                className="reveal mt-6 max-w-lg text-[17px] leading-relaxed text-text-muted"
                style={{ animationDelay: "120ms" }}
              >
                ScamShield uses AI to uncover the red flags hidden inside suspicious messages, emails, job offers,
                screenshots, and links — before you act.
              </p>
              <div className="reveal mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "200ms" }}>
                <Link
                  href="/analyze"
                  className="rounded-sm border border-amber bg-amber px-6 py-3.5 font-mono text-[14px] font-semibold text-[#14120a] transition hover:bg-amber/90"
                >
                  Analyze Something Suspicious
                </Link>
                <Link
                  href="#how-it-works"
                  className="rounded-sm border border-ink-line px-6 py-3.5 font-mono text-[14px] font-medium text-text-primary transition hover:border-text-muted"
                >
                  See How It Works
                </Link>
              </div>
              <p className="reveal mt-8 font-mono text-[12px] text-text-muted" style={{ animationDelay: "240ms" }}>
                No account required · Screenshots processed on demand, never stored
              </p>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section id="how-it-works" className="border-b border-ink-line px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[12px] text-amber">HOW IT WORKS</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold text-text-primary sm:text-4xl">
              Four steps between a suspicious message and a confident decision.
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <div key={step.n} className="bg-ink px-6 py-8">
                  <span className="font-mono text-sm text-text-muted">{step.n}</span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-text-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="what-we-detect" className="border-b border-ink-line px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[12px] text-amber">WHAT WE DETECT</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold text-text-primary sm:text-4xl">
              A hybrid engine, not a single black box.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-muted">
              Rule-based indicators, pattern detection, URL structure analysis, and AI semantic reasoning all
              contribute independently to an explainable risk score across {Object.keys(CATEGORY_LABELS).length} scam
              categories.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {DETECT_CARDS.map((c) => (
                <div key={c.title} className="rounded-lg border border-ink-line bg-ink-raised p-6">
                  <h3 className="font-display text-base font-semibold text-text-primary">{c.title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-text-muted">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-ink-line px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[12px] text-amber">THE SIGNATURE FEATURE</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold text-text-primary sm:text-4xl">
              Show me the attack.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-muted">
              ScamShield reconstructs the social-engineering sequence hidden inside the message, stage by stage,
              grounded entirely in your submitted content.
            </p>
            <div className="mt-12 space-y-0">
              {ATTACK_STAGES.map((s, i) => (
                <div key={s.stage} className="relative flex gap-6 pb-10 last:pb-0">
                  {i < ATTACK_STAGES.length - 1 && (
                    <span
                      className="absolute left-[19px] top-10 h-full w-px"
                      style={{ background: "linear-gradient(to bottom, var(--ink-line), transparent)" }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold"
                    style={{ borderColor: `${s.color}66`, color: s.color, backgroundColor: `${s.color}14` }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-1.5">
                    <p className="font-mono text-[11px] font-semibold tracking-wide" style={{ color: s.color }}>
                      {s.stage}
                    </p>
                    <p className="mt-1.5 font-mono text-[15px] text-text-primary">{s.body}</p>
                    <p className="mt-1 text-[14px] text-text-muted">{s.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-ink-line px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-mono text-[12px] text-amber">BUILT FOR REAL PEOPLE</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-primary sm:text-4xl">
                You don&apos;t need to understand cybersecurity to be protected.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-text-muted">
                ScamShield translates technical analysis into plain language. Instead of &ldquo;social engineering
                through credential harvesting,&rdquo; it tells you: &ldquo;someone may be trying to trick you into
                giving them your password.&rdquo; Every result ends with a clear answer to the only question that
                matters — what should you do right now?
              </p>
            </div>
            <div id="privacy" className="rounded-lg border border-ink-line bg-ink-raised p-7">
              <p className="font-mono text-[12px] text-amber">PRIVACY FIRST</p>
              <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-text-muted">
                <li>— Messages, screenshots, and URLs are analyzed on demand and not stored in a database.</li>
                <li>— Screenshots are processed for text extraction only, then discarded.</li>
                <li>— Nothing you submit is shared publicly or used to identify you.</li>
                <li>— No account or sign-in is required to use ScamShield.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">
              Before you click, check.
            </h2>
            <div className="mt-8">
              <Link
                href="/analyze"
                className="inline-block rounded-sm border border-amber bg-amber px-7 py-3.5 font-mono text-[14px] font-semibold text-[#14120a] transition hover:bg-amber/90"
              >
                Analyze Something Suspicious
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
