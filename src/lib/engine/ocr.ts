import path from "path";
import { createWorker } from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number;
}

function localNodeModulesPath(...segments: string[]): string {
  return path.join(process.cwd(), "node_modules", ...segments);
}

export async function extractTextFromImage(buffer: Buffer): Promise<OcrResult> {
  const langPath = localNodeModulesPath("@tesseract.js-data", "eng", "4.0.0_best_int");
  const corePath = localNodeModulesPath("tesseract.js-core");

  const worker = await createWorker("eng", 1, {
    langPath,
    corePath,
    gzip: true,
    cacheMethod: "none",
  });

  try {
    const { data } = await worker.recognize(buffer);
    return { text: data.text.trim(), confidence: data.confidence };
  } finally {
    await worker.terminate();
  }
}
