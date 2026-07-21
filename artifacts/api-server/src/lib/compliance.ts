// compliance.ts — Deterministic compliance checking logic.
// The LLM only transcribes; ALL verdict decisions are made here so every
// rejection can be explained in plain terms.

export const OFFICIAL_WARNING =
  "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

export type FieldStatus = "PASS" | "NEEDS_REVIEW" | "FAIL";
export type OverallVerdict = "PASS" | "NEEDS_REVIEW" | "REJECT";

export interface FieldResult {
  field: string;
  status: FieldStatus;
  label_value: string | null;
  application_value: string | null;
  explanation: string;
  diff: string | null;
}

export interface ExtractionMeta {
  confidence: number;
  legibility_issues: string | null;
}

export interface LLMExtraction {
  brand_name: string | null;
  class_type: string | null;
  alcohol_content_raw: string | null;
  net_contents_raw: string | null;
  government_warning_text: string | null;
  warning_lead_in_all_caps: boolean;
  warning_appears_bold: boolean | null;
  legibility_issues: string | null;
  extraction_confidence: number;
}

export interface ApplicationData {
  brand_name: string;
  class_type: string;
  abv: string;
  net_contents: string;
}

export interface VerificationResult {
  overall: OverallVerdict;
  fields: FieldResult[];
  latency_ms: number;
  extraction: ExtractionMeta;
}

// ---------------------------------------------------------------------------
// Text normalization
// ---------------------------------------------------------------------------

/** Normalize for comparison: remove diacritics, apostrophe variants, punctuation,
 *  lowercase, collapse whitespace. Apostrophes in names like "Stone's" are preserved. */
function normalizeText(text: string): string {
  return (
    text
      // Decompose diacritics then strip combining marks
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Normalize apostrophe/quote variants → straight apostrophe
      .replace(/[\u2018\u2019\u201B\u02BC\u02BB\u0060\u00B4]/g, "'")
      // Normalize dash variants → hyphen
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .toLowerCase()
      // Remove anything that's not alphanumeric, space, apostrophe, or hyphen
      .replace(/[^a-z0-9\s'-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

// ---------------------------------------------------------------------------
// String similarity (normalized Levenshtein)
// ---------------------------------------------------------------------------

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // Use two rows to save memory
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function stringSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// ---------------------------------------------------------------------------
// Word-level diff for warning text
// ---------------------------------------------------------------------------

function wordDiff(official: string, extracted: string): string {
  const ow = official.split(/\s+/);
  const ew = extracted.split(/\s+/);
  const maxLen = Math.max(ow.length, ew.length);
  const parts: string[] = [];
  let changed = 0;
  let missing = 0;
  let extra = 0;

  for (let i = 0; i < maxLen; i++) {
    const o = ow[i];
    const e = ew[i];
    if (o === undefined) {
      extra++;
      parts.push(`+[${e}]`);
    } else if (e === undefined) {
      missing++;
      parts.push(`-[${o}]`);
    } else if (o.toLowerCase() !== e.toLowerCase()) {
      changed++;
      parts.push(`"${o}"→"${e}"`);
    }
  }

  const summary: string[] = [];
  if (changed > 0) summary.push(`${changed} word(s) changed`);
  if (missing > 0) summary.push(`${missing} word(s) missing`);
  if (extra > 0) summary.push(`${extra} extra word(s)`);

  const detail = parts.slice(0, 12).join(", ");
  return summary.join("; ") + (detail ? `: ${detail}` : "");
}

// ---------------------------------------------------------------------------
// Rule 1 — Government Warning (27 CFR Part 16)
// ---------------------------------------------------------------------------

export function checkGovernmentWarning(extraction: LLMExtraction): FieldResult {
  const field = "Government Warning";
  const labelValue = extraction.government_warning_text?.trim() ?? null;

  if (!labelValue) {
    return {
      field,
      status: "FAIL",
      label_value: null,
      application_value: OFFICIAL_WARNING,
      explanation:
        "The government health warning is missing from the label. It is required by 27 CFR Part 16.",
      diff: null,
    };
  }

  // Check ALL-CAPS lead-in via the LLM's explicit boolean.
  //
  // Note: vision models (including Gemini) often omit the "GOVERNMENT WARNING:"
  // lead-in from government_warning_text even when it appears on the label,
  // returning only the body starting at "(1)...". We therefore cannot
  // independently cross-check the lead-in by regex-matching the extracted text —
  // doing so would give a false impression of verification (an empty match
  // trivially passes any case-check). The dedicated warning_lead_in_all_caps
  // field is the only reliable signal, and we rely on it explicitly.
  if (extraction.warning_lead_in_all_caps !== true) {
    return {
      field,
      status: "FAIL",
      label_value: labelValue,
      application_value: OFFICIAL_WARNING,
      explanation:
        'The warning lead-in is not printed in ALL CAPITAL LETTERS. Per 27 CFR Part 16, the warning must begin with "GOVERNMENT WARNING:" in capital letters.',
      diff: null,
    };
  }

  // Word-for-word comparison (collapse whitespace for robustness).
  // Some vision models omit the lead-in ("GOVERNMENT WARNING:") from
  // government_warning_text even though it appears on the label. If the
  // extracted text doesn't start with the lead-in but we already confirmed
  // it is present and all-caps (above), prepend it before comparing so the
  // body-only transcription still produces a correct match.
  const normalizedOfficial = OFFICIAL_WARNING.replace(/\s+/g, " ").trim();
  let normalizedExtracted = labelValue.replace(/\s+/g, " ").trim();
  if (!normalizedExtracted.toUpperCase().startsWith("GOVERNMENT WARNING:")) {
    normalizedExtracted = `GOVERNMENT WARNING: ${normalizedExtracted}`;
  }

  if (normalizedOfficial !== normalizedExtracted) {
    const diff = wordDiff(normalizedOfficial, normalizedExtracted);
    return {
      field,
      status: "FAIL",
      label_value: labelValue,
      application_value: OFFICIAL_WARNING,
      explanation: `The warning text does not match 27 CFR Part 16 word for word. ${diff}`,
      diff,
    };
  }

  // Bold check — cannot be reliably machine-verified
  if (extraction.warning_appears_bold === false) {
    return {
      field,
      status: "NEEDS_REVIEW",
      label_value: labelValue,
      application_value: OFFICIAL_WARNING,
      explanation:
        "Warning text matches exactly, but bold type could not be automatically confirmed. Please visually verify that the warning text is printed in bold type as required.",
      diff: null,
    };
  }

  return {
    field,
    status: "PASS",
    label_value: labelValue,
    application_value: OFFICIAL_WARNING,
    explanation:
      "Government warning text matches 27 CFR Part 16 exactly and appears in the required format.",
    diff: null,
  };
}

// ---------------------------------------------------------------------------
// Rule 2 — Brand Name and Class/Type (normalized comparison)
// ---------------------------------------------------------------------------

export function checkTextField(
  fieldName: string,
  labelValue: string | null,
  appValue: string,
): FieldResult {
  if (!labelValue || labelValue.trim() === "") {
    return {
      field: fieldName,
      status: "FAIL",
      label_value: null,
      application_value: appValue,
      explanation: `${fieldName} was not found on the label.`,
      diff: null,
    };
  }

  const normLabel = normalizeText(labelValue);
  const normApp = normalizeText(appValue);

  if (normLabel === normApp) {
    const rawLabel = labelValue.trim();
    const rawApp = appValue.trim();
    const formattingNote =
      rawLabel !== rawApp
        ? ` (Formatting note: label shows "${rawLabel}", application shows "${rawApp}" — they match after normalization.)`
        : "";
    return {
      field: fieldName,
      status: "PASS",
      label_value: labelValue,
      application_value: appValue,
      explanation: `${fieldName} matches the application data.${formattingNote}`,
      diff: null,
    };
  }

  const sim = stringSimilarity(normLabel, normApp);

  if (sim >= 0.85) {
    return {
      field: fieldName,
      status: "NEEDS_REVIEW",
      label_value: labelValue,
      application_value: appValue,
      explanation: `${fieldName} is similar but not identical after normalization (${Math.round(sim * 100)}% match). A human agent should compare these values and apply judgment.`,
      diff: null,
    };
  }

  return {
    field: fieldName,
    status: "FAIL",
    label_value: labelValue,
    application_value: appValue,
    explanation: `${fieldName} on the label ("${labelValue.trim()}") does not match the application data ("${appValue.trim()}").`,
    diff: null,
  };
}

// ---------------------------------------------------------------------------
// Rule 3 — Alcohol Content (ABV)
// ---------------------------------------------------------------------------

/** Parse an ABV percentage from a raw string. Handles: "45%", "45% ABV",
 *  "45 percent", "90 proof" (→ 45). Returns null if unparseable. */
function parseAbv(raw: string): number | null {
  // Proof → ABV
  const proofMatch = raw.match(/(\d+(?:\.\d+)?)\s*proof/i);
  if (proofMatch) return parseFloat(proofMatch[1]) / 2;

  // Explicit percent
  const pctMatch = raw.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pctMatch) return parseFloat(pctMatch[1]);

  // Bare number — only accept if it looks like an ABV (0.5–100)
  const numMatch = raw.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    const v = parseFloat(numMatch[1]);
    if (v >= 0.5 && v <= 100) return v;
  }

  return null;
}

/** Look for a proof value alongside an ABV on the label (e.g., "45% | 90 Proof") */
function parseProofFromRaw(raw: string): number | null {
  const proofMatch = raw.match(/(\d+(?:\.\d+)?)\s*proof/i);
  return proofMatch ? parseFloat(proofMatch[1]) : null;
}

export function checkAlcoholContent(
  extraction: LLMExtraction,
  appAbv: string,
): FieldResult {
  const field = "Alcohol Content (ABV)";
  const labelRaw = extraction.alcohol_content_raw?.trim() ?? null;

  if (!labelRaw) {
    return {
      field,
      status: "FAIL",
      label_value: null,
      application_value: appAbv,
      explanation: "Alcohol content (ABV) was not found on the label.",
      diff: null,
    };
  }

  const labelAbv = parseAbv(labelRaw);
  const appAbvNum = parseAbv(appAbv);

  if (labelAbv === null) {
    return {
      field,
      status: "NEEDS_REVIEW",
      label_value: labelRaw,
      application_value: appAbv,
      explanation: `Could not parse a numeric ABV from the label text "${labelRaw}". Please verify manually.`,
      diff: null,
    };
  }

  if (appAbvNum === null) {
    return {
      field,
      status: "NEEDS_REVIEW",
      label_value: labelRaw,
      application_value: appAbv,
      explanation: `Could not parse a numeric ABV from the application data "${appAbv}". Please verify manually.`,
      diff: null,
    };
  }

  // Cross-check proof vs ABV for internal label consistency
  const labelProof = parseProofFromRaw(labelRaw);
  if (labelProof !== null) {
    const expectedProof = labelAbv * 2;
    if (Math.abs(labelProof - expectedProof) > 0.5) {
      return {
        field,
        status: "NEEDS_REVIEW",
        label_value: labelRaw,
        application_value: appAbv,
        explanation: `Label shows ${labelAbv}% ABV but ${labelProof} proof. Expected proof should be ${expectedProof} (ABV × 2). This inconsistency needs human review.`,
        diff: null,
      };
    }
  }

  if (Math.abs(labelAbv - appAbvNum) > 0.01) {
    return {
      field,
      status: "FAIL",
      label_value: labelRaw,
      application_value: appAbv,
      explanation: `ABV on the label (${labelAbv}%) does not match the application data (${appAbvNum}%). An exact match is required.`,
      diff: null,
    };
  }

  return {
    field,
    status: "PASS",
    label_value: labelRaw,
    application_value: appAbv,
    explanation: `Alcohol content matches: ${labelAbv}% ABV.`,
    diff: null,
  };
}

// ---------------------------------------------------------------------------
// Rule 4 — Net Contents (unit-aware numeric comparison)
// ---------------------------------------------------------------------------

interface ParsedVolume {
  rawValue: number;
  rawUnit: string;
  ml: number;
}

const ML_PER_FL_OZ = 29.5735295625;

function parseNetContents(raw: string): ParsedVolume | null {
  const text = raw.trim();

  // Match patterns like "750 mL", "0.75 L", "25.4 fl oz", "750ml"
  const match = text.match(
    /(\d+(?:\.\d+)?)\s*(ml|milliliters?|millilitres?|fl\.?\s*oz\.?|fluid\s+ounces?|l|liters?|litres?|oz\.?|ounces?)/i,
  );
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase().replace(/\s+/g, "").replace(/\.+$/, "");

  let ml: number;
  if (/^ml|milliliter|millilitre/.test(unit)) {
    ml = value;
  } else if (/^l$|liter|litre/.test(unit)) {
    ml = value * 1000;
  } else if (/fl/.test(unit) || /^oz/.test(unit) || /ounce/.test(unit)) {
    ml = value * ML_PER_FL_OZ;
  } else {
    return null;
  }

  return { rawValue: value, rawUnit: match[2], ml };
}

export function checkNetContents(
  extraction: LLMExtraction,
  appNetContents: string,
): FieldResult {
  const field = "Net Contents";
  const labelRaw = extraction.net_contents_raw?.trim() ?? null;

  if (!labelRaw) {
    return {
      field,
      status: "FAIL",
      label_value: null,
      application_value: appNetContents,
      explanation: "Net contents were not found on the label.",
      diff: null,
    };
  }

  const labelParsed = parseNetContents(labelRaw);
  const appParsed = parseNetContents(appNetContents);

  if (!labelParsed) {
    return {
      field,
      status: "NEEDS_REVIEW",
      label_value: labelRaw,
      application_value: appNetContents,
      explanation: `Could not parse net contents from label text "${labelRaw}". Please verify manually.`,
      diff: null,
    };
  }

  if (!appParsed) {
    return {
      field,
      status: "NEEDS_REVIEW",
      label_value: labelRaw,
      application_value: appNetContents,
      explanation: `Could not parse net contents from application data "${appNetContents}". Please verify manually.`,
      diff: null,
    };
  }

  // Allow 1.5 mL tolerance to absorb floating-point unit conversion rounding
  if (Math.abs(labelParsed.ml - appParsed.ml) > 1.5) {
    return {
      field,
      status: "FAIL",
      label_value: labelRaw,
      application_value: appNetContents,
      explanation: `Net contents on the label (${labelParsed.ml.toFixed(1)} mL) do not match the application data (${appParsed.ml.toFixed(1)} mL).`,
      diff: null,
    };
  }

  const rawLabel = labelRaw.trim();
  const rawApp = appNetContents.trim();
  const formattingNote =
    rawLabel !== rawApp
      ? ` (Label shows "${rawLabel}", application shows "${rawApp}" — they are equivalent volumes.)`
      : "";

  return {
    field,
    status: "PASS",
    label_value: labelRaw,
    application_value: appNetContents,
    explanation: `Net contents match: ${labelParsed.ml.toFixed(1)} mL.${formattingNote}`,
    diff: null,
  };
}

// ---------------------------------------------------------------------------
// Overall verdict
// ---------------------------------------------------------------------------

export function computeOverall(
  fields: FieldResult[],
  extraction: ExtractionMeta,
): OverallVerdict {
  if (fields.some((f) => f.status === "FAIL")) return "REJECT";

  if (
    fields.some((f) => f.status === "NEEDS_REVIEW") ||
    extraction.confidence < 0.6 ||
    extraction.legibility_issues != null
  ) {
    return "NEEDS_REVIEW";
  }

  return "PASS";
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function runComplianceChecks(
  extraction: LLMExtraction,
  appData: ApplicationData,
  latencyMs: number,
): VerificationResult {
  const extractionMeta: ExtractionMeta = {
    confidence: extraction.extraction_confidence,
    legibility_issues: extraction.legibility_issues ?? null,
  };

  const fields: FieldResult[] = [
    checkGovernmentWarning(extraction),
    checkTextField("Brand Name", extraction.brand_name, appData.brand_name),
    checkTextField("Class/Type", extraction.class_type, appData.class_type),
    checkAlcoholContent(extraction, appData.abv),
    checkNetContents(extraction, appData.net_contents),
  ];

  const overall = computeOverall(fields, extractionMeta);

  return { overall, fields, latency_ms: latencyMs, extraction: extractionMeta };
}
