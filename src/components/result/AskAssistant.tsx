"use client";

import { useState } from "react";
import type { ScamAnalysis } from "@/types/analysis";
import { SectionHeading } from "./RedFlags";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Which part is the biggest red flag?",
  "What happens if I click this?",
  "I already gave them my phone number, what now?",
  "How do I verify this independently?",
];

export function AskAssistant({ analysis }: { analysis: ScamAnalysis }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          analysisSummary: {
            riskLevel: analysis.riskLevel,
            riskScore: analysis.riskScore,
            primaryCategory: analysis.primaryCategory,
            redFlags: analysis.redFlags,
            sourceText: (analysis.source.extractedText ?? analysis.source.rawText).slice(0, 4000),
          },
        }),
      });

      if (!response.ok) {
        setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't process that question. Please try again." }]);
        return;
      }

      const data = (await response.json()) as { answer: string };
      setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <SectionHeading eyebrow="ASK SCAMSHIELD" title="Have a question about this result?" />
      <div className="mt-6 rounded-lg border border-ink-line bg-ink-raised">
        {messages.length === 0 && (
          <div className="p-6">
            <p className="text-[13px] text-text-muted">Try asking:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="rounded-full border border-ink-line px-3.5 py-2 font-mono text-[12px] text-text-primary/90 transition hover:border-amber/60"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="max-h-96 space-y-4 overflow-y-auto p-6">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className="max-w-[85%] rounded-lg px-4 py-2.5 text-[14px] leading-relaxed"
                  style={
                    m.role === "user"
                      ? { backgroundColor: "var(--amber)", color: "#14120a" }
                      : { backgroundColor: "var(--ink)", color: "var(--text-primary)", border: "1px solid var(--ink-line)" }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-ink-line bg-ink px-4 py-2.5 font-mono text-[12px] text-text-muted">
                  Thinking…
                </div>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2 border-t border-ink-line p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this result..."
            className="flex-1 rounded-md border border-ink-line bg-ink px-3.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-muted focus:border-amber"
            aria-label="Ask ScamShield a question"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-md border border-amber bg-amber px-4 py-2.5 font-mono text-[12px] font-semibold text-[#14120a] transition hover:bg-amber/90 disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </div>
    </section>
  );
}
