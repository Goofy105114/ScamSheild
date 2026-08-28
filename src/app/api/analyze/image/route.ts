import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, jsonError } from "@/lib/validation";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";
import { runAnalysis } from "@/lib/engine/analyze";
import { extractTextFromImage } from "@/lib/engine/ocr";

export async function POST(req: Request) {
  const clientKey = getClientKey(req);
  const rate = checkRateLimit(clientKey);
  if (!rate.allowed) {
    return jsonError(429, "RATE_LIMITED", `Too many requests. Try again in ${rate.retryAfterSeconds} seconds.`);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError(400, "INVALID_FORM_DATA", "Request must be multipart form data containing an image file.");
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return jsonError(400, "MISSING_IMAGE", "No image file was found in the request.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return jsonError(415, "UNSUPPORTED_MEDIA_TYPE", "Only PNG, JPEG, and WEBP images are supported.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return jsonError(413, "FILE_TOO_LARGE", "Image must be smaller than 8MB.");
  }

  let buffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch {
    return jsonError(400, "INVALID_FILE", "Could not read the uploaded file.");
  }

  let extractedText = "";
  try {
    const ocrResult = await extractTextFromImage(buffer);
    extractedText = ocrResult.text;
  } catch {
    return jsonError(502, "OCR_FAILED", "Text extraction from the image failed. Please try a clearer screenshot or paste the text directly.");
  }

  if (!extractedText || extractedText.trim().length < 3) {
    return jsonError(422, "OCR_NO_TEXT", "No readable text could be extracted from this image. Try a clearer screenshot or paste the text directly.");
  }

  try {
    const analysis = await runAnalysis({ type: "image", rawText: extractedText, extractedText });
    return Response.json({ analysis, extractedText });
  } catch {
    return jsonError(500, "ANALYSIS_FAILED", "Something went wrong while analyzing this image. Please try again.");
  }
}
