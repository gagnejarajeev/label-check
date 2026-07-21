// api.ts — Typed fetch wrappers for the Label Check API.
// The API server is proxied at /api in dev (vite proxy) and served at /api in prod.

const API_BASE = "/api";

export interface FieldResult {
  field: string;
  status: "PASS" | "NEEDS_REVIEW" | "FAIL";
  label_value: string | null;
  application_value: string | null;
  explanation: string;
  diff?: string | null;
}

export interface ExtractionMeta {
  confidence: number;
  legibility_issues?: string | null;
}

export interface VerificationResult {
  overall: "PASS" | "NEEDS_REVIEW" | "REJECT";
  fields: FieldResult[];
  latency_ms: number;
  extraction: ExtractionMeta;
}

export interface LabelInput {
  image: File;
  brand_name: string;
  class_type: string;
  abv: string;
  net_contents: string;
}

export interface BatchRowResult {
  filename: string;
  row_index: number;
  brand_name?: string | null;
  overall: "PASS" | "NEEDS_REVIEW" | "REJECT" | "ERROR";
  error_message?: string | null;
  result?: VerificationResult;
}

export interface BatchSummary {
  total: number;
  passed: number;
  review: number;
  rejected: number;
  errors: number;
}

export interface BatchResult {
  summary: BatchSummary;
  rows: BatchRowResult[];
}

export async function verifyLabel(input: LabelInput): Promise<VerificationResult> {
  const form = new FormData();
  form.append("image", input.image);
  form.append("brand_name", input.brand_name);
  form.append("class_type", input.class_type);
  form.append("abv", input.abv);
  form.append("net_contents", input.net_contents);

  const res = await fetch(`${API_BASE}/verify`, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
  return data as VerificationResult;
}

export async function batchVerify(manifest: File, images: File[]): Promise<BatchResult> {
  const form = new FormData();
  form.append("manifest", manifest);
  for (const img of images) {
    form.append("images", img);
  }

  const res = await fetch(`${API_BASE}/batch`, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
  return data as BatchResult;
}

export function getSampleCsvUrl(): string {
  return `${API_BASE}/sample-csv`;
}
