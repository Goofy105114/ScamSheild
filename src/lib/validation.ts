import { z } from "zod";

export const AnalyzeTextSchema = z.object({
  text: z.string().min(3, "Please provide at least a few words to analyze.").max(8000, "Content is too long. Please limit to 8000 characters."),
});

export const AnalyzeUrlSchema = z.object({
  url: z.string().min(3, "Please provide a URL to analyze.").max(2000, "URL is too long."),
});

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}
