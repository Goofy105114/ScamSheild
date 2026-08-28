import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { AnalyzeForm } from "@/components/AnalyzeForm";

export const metadata = {
  title: "Analyze Something Suspicious — ScamShield",
};

export default function AnalyzePage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <SiteNav />
      <main className="flex-1 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[12px] text-amber">SUBMIT</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary sm:text-4xl">
            What do you want to check?
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-text-muted">
            Paste a message, upload a screenshot, or drop in a link. ScamShield investigates it and shows you exactly
            why it flagged what it flagged.
          </p>
          <div className="mt-10">
            <AnalyzeForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
