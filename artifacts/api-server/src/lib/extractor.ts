// extractor.ts — Calls the OpenRouter vision LLM to transcribe label text.
// The LLM ONLY transcribes; it never makes compliance decisions.

import OpenAI from "openai";
import { logger } from "./logger";
import type { LLMExtraction } from "./compliance";

const EXTRACTION_PROMPT = `You are a label transcription assistant. Your ONLY job is to read an alcohol beverage label image and transcribe EXACTLY what is printed on it. Do not interpret, infer, correct spelling, or complete partial text — only transcribe what you can see.

Return a JSON object with these fields (and no other text, no markdown fences):

{
  "brand_name": <string — transcribe the brand name exactly as printed on the label>,
  "class_type": <string — transcribe the class and type exactly as printed, e.g. "Bourbon Whiskey" or "Straight Rye Whiskey">,
  "alcohol_content_raw": <string — transcribe the full alcohol content text exactly as printed, e.g. "45% ALC/VOL", "90 Proof", "45% Alc. by Vol. / 90 Proof">,
  "net_contents_raw": <string — transcribe the net contents text exactly as printed, e.g. "750 mL" or "1 L">,
  "government_warning_text": <string or null — if a government warning appears on the label, transcribe the FULL warning text verbatim, preserving the exact casing as printed; if no warning is present, use null>,
  "warning_lead_in_all_caps": <boolean — true if the warning lead-in text (e.g. "GOVERNMENT WARNING:") is printed in ALL CAPITAL LETTERS; false if it uses any lowercase letters (e.g. "Government Warning:")>,
  "warning_appears_bold": <boolean or null — true if the warning text visually appears bold/heavy-weight; false if it appears to be regular weight; null if you cannot determine from the image>,
  "legibility_issues": <string or null — describe any legibility problems such as glare, blur, camera angle, or partial obscuring that may affect accuracy; null if the image is clear and fully legible>,
  "extraction_confidence": <number 0.0–1.0 — your overall confidence in the accuracy of this transcription; use lower values when text is small, blurry, or partially obscured>
}

Critical rules:
- Transcribe ONLY what is visibly printed. Do not guess, infer, or add text that is not visible.
- Preserve the EXACT casing of all text as printed on the label.
- For government_warning_text, copy every word exactly — including punctuation and casing.
- Return ONLY the JSON object. No preamble, no explanation, no code fences.`;

export async function extractLabelData(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<LLMExtraction> {
  const apiKey = process.env["OPENROUTER_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Please set it in your environment secrets.",
    );
  }

  const model = process.env["VISION_MODEL"] ?? "google/gemini-2.5-flash";

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://replit.com",
      "X-Title": "Label Check — TTB Verification",
    },
  });

  const base64Image = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_PROMPT },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("The vision model returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(
      `Vision model returned invalid JSON. First 300 chars: ${content.slice(0, 300)}`,
    );
  }

  const extraction = parsed as Record<string, unknown>;

  // Validate required numeric field
  if (typeof extraction["extraction_confidence"] !== "number") {
    extraction["extraction_confidence"] = 0.5; // safe default
  }

  logger.info(
    { model, confidence: extraction["extraction_confidence"] },
    "Label extraction complete",
  );

  return extraction as unknown as LLMExtraction;
}
