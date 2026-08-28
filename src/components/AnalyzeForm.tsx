"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import type { ApiErrorBody, ScamAnalysis } from "@/types/analysis";
import { saveAnalysis } from "@/lib/analysisStore";
import { AnalysisProgress } from "./AnalysisProgress";
import { DEMO_EXAMPLES } from "@/lib/examples";

type Tab = "text" | "image" | "url";

const TABS: { id: Tab; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "image", label: "Screenshot" },
  { id: "url", label: "URL" },
];

const IMAGE_REQUEST_TIMEOUT_MS = 55_000;

export function AnalyzeForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onFileChange(f: File | null) {
    if (f && !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(f.type)) {
      setFile(null);
      setError("Please choose a PNG, JPEG, or WEBP image.");
      return;
    }
    if (f && f.size > 8 * 1024 * 1024) {
      setFile(null);
      setError("Image must be smaller than 8MB.");
      return;
    }
    setFile(f);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  function onFileDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    onFileChange(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit() {
    setError(null);

    if (tab === "text" && text.trim().length < 3) {
      setError("Please paste at least a few words to analyze.");
      return;
    }
    if (tab === "url" && url.trim().length < 3) {
      setError("Please enter a URL to analyze.");
      return;
    }
    if (tab === "image" && !file) {
      setError("Please choose a screenshot to upload.");
      return;
    }

    setProgressStage(0);
    setLoading(true);
    try {
      let response: Response;
      const imageRequestController = tab === "image" ? new AbortController() : null;
      const imageTimeout = imageRequestController
        ? window.setTimeout(() => imageRequestController.abort(), IMAGE_REQUEST_TIMEOUT_MS)
        : null;

      try {
        setProgressStage(4);
        if (tab === "text") {
          response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
        } else if (tab === "url") {
          response = await fetch("/api/analyze/url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
        } else {
          const formData = new FormData();
          formData.append("image", file as File);
          response = await fetch("/api/analyze/image", { method: "POST", body: formData, signal: imageRequestController?.signal });
        }
      } finally {
        if (imageTimeout !== null) window.clearTimeout(imageTimeout);
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        setError(body?.error?.message ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const data = (await response.json()) as { analysis: ScamAnalysis; extractedText?: string };
      setProgressStage(5);
      saveAnalysis(data.analysis);
      router.push("/result");
    } catch (submissionError) {
      setError(submissionError instanceof DOMException && submissionError.name === "AbortError"
        ? "Screenshot processing took too long. Try a smaller or clearer screenshot, or paste the message text directly."
        : "Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  function loadExample(exampleId: string) {
    const example = DEMO_EXAMPLES.find((e) => e.id === exampleId);
    if (!example) return;
    if (example.type === "url") {
      setTab("url");
      setUrl(example.content);
    } else {
      setTab("text");
      setText(example.content);
    }
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="py-16">
        <AnalysisProgress activeStage={progressStage} />
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg border border-ink-line bg-ink-raised">
        <div className="flex border-b border-ink-line" role="tablist" aria-label="Submission type">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                setError(null);
              }}
              className="flex-1 px-4 py-3.5 font-mono text-[13px] font-medium transition"
              style={{
                color: tab === t.id ? "var(--amber)" : "var(--text-muted)",
                borderBottom: tab === t.id ? "2px solid var(--amber)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-7">
          {tab === "text" && (
            <div>
              <label htmlFor="scam-text" className="mb-2 block font-mono text-[12px] text-text-muted">
                Paste the WhatsApp message, SMS, email, or job offer
              </label>
              <textarea
                id="scam-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                maxLength={8000}
                placeholder="Paste the suspicious message here..."
                className="w-full resize-y rounded-md border border-ink-line bg-ink px-4 py-3 text-[15px] text-text-primary placeholder:text-text-muted focus:border-amber"
              />
              <p className="mt-1.5 text-right font-mono text-[11px] text-text-muted">{text.length} / 8000</p>
            </div>
          )}

          {tab === "url" && (
            <div>
              <label htmlFor="scam-url" className="mb-2 block font-mono text-[12px] text-text-muted">
                Paste the link you want to check
              </label>
              <input
                id="scam-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/verify-account"
                className="w-full rounded-md border border-ink-line bg-ink px-4 py-3.5 text-[15px] text-text-primary placeholder:text-text-muted focus:border-amber"
              />
            </div>
          )}

          {tab === "image" && (
            <div>
              <label className="mb-2 block font-mono text-[12px] text-text-muted">
                Upload a screenshot (PNG, JPEG, or WEBP, up to 8MB)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                className="hidden"
                id="scam-image"
              />
              {!preview ? (
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={onFileDrop}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-ink-line px-6 py-14 text-center transition hover:border-amber/60"
                >
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="font-display text-base font-medium text-text-primary">
                    Choose a screenshot
                  </button>
                  <span className="font-mono text-[12px] text-text-muted">or drag and drop it here</span>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-md border border-ink-line">
                  {}
                  <img src={preview} alt="Uploaded screenshot preview" className="max-h-96 w-full object-contain bg-black/30" />
                  <button
                    type="button"
                    onClick={() => {
                      onFileChange(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute right-3 top-3 rounded-sm border border-ink-line bg-ink/90 px-3 py-1.5 font-mono text-[11px] text-text-primary"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div role="alert" className="mt-4 rounded-md border border-red/40 bg-red/10 px-4 py-3 text-[14px] text-red">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="mt-6 w-full rounded-sm border border-amber bg-amber py-3.5 font-mono text-[14px] font-semibold text-[#14120a] transition hover:bg-amber/90"
          >
            Investigate This
          </button>
        </div>
      </div>

      <section id="demo" className="mt-14">
        <p className="font-mono text-[12px] text-amber">DEMO LIBRARY</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-text-primary">Try a realistic example</h2>
        <p className="mt-2 max-w-xl text-[14px] text-text-muted">
          These are labeled demonstration inputs. Loading one runs the full, real analysis engine, nothing is
          pre-computed.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_EXAMPLES.map((example) => (
            <button
              key={example.id}
              onClick={() => loadExample(example.id)}
              className="rounded-lg border border-ink-line bg-ink-raised p-5 text-left transition hover:border-amber/50"
            >
              <span className="inline-block rounded-full border border-ink-line px-2.5 py-1 font-mono text-[10px] text-text-muted">
                {example.category}
              </span>
              <p className="mt-3 font-display text-[15px] font-medium text-text-primary">{example.title}</p>
              <p className="mt-2 line-clamp-2 text-[13px] text-text-muted">{example.content}</p>
              <span className="mt-4 inline-block font-mono text-[12px] text-amber">Load example →</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
