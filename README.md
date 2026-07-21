# Label Check — TTB Alcohol Label Verification

**Live deployment:** https://label-transcriber.replit.app

A prototype web application that verifies alcohol beverage labels against TTB (Alcohol and Tobacco Tax and Trade Bureau) compliance requirements. Upload a label image and application data; the app transcribes the label using a vision LLM and runs deterministic compliance checks.

---

## Quick Start

### 1. Set the OpenRouter API key

In Replit, add the secret:

```
OPENROUTER_API_KEY=<your key from openrouter.ai>
```

The vision model defaults to `google/gemini-2.5-flash` and is configurable via the `VISION_MODEL` shared environment variable.

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start both servers

The Replit workspace starts these automatically via configured workflows:

| Workflow | Command | Purpose |
|---|---|---|
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | REST API (Express, port from `PORT`) |
| `artifacts/label-check: web` | `pnpm --filter @workspace/label-check run dev` | React frontend (Vite, port from `PORT`) |

### 4. Generate sample labels (optional)

```bash
pnpm --filter @workspace/scripts run generate-labels
```

This produces five PNG label images in `scripts/sample-labels/` and a matching `sample.csv` manifest that can be used for batch testing.

---

## Architecture

```
Browser
  │
  ├── Single Check tab
  │     ├─ Upload label image (JPEG/PNG/WebP, ≤ 8 MB)
  │     ├─ Enter: brand name, class/type, ABV, net contents
  │     └─ POST /verify → VerificationResult
  │
  └── Batch tab
        ├─ Upload CSV manifest + label images
        └─ POST /batch → BatchResult (5 concurrent)

API Server (Express + TypeScript)
  ├── POST /verify
  │     ├── multer: buffer image in memory
  │     ├── extractor.ts → OpenRouter vision LLM (temperature=0)
  │     │     Prompt: "transcribe ONLY what is printed; return JSON"
  │     └── compliance.ts → deterministic rule checks
  │           Returns VerificationResult
  │
  ├── POST /batch
  │     ├── multer: CSV manifest + up to 500 images
  │     ├── CSV parser → rows[]
  │     └── pLimit(5): processRow() per row → BatchResult
  │
  └── GET /sample-csv → bundled sample manifest CSV
```

### Key design decision: LLM transcribes, code decides

The vision LLM is instructed **only** to transcribe what is visibly printed on the label, preserving exact casing and punctuation. It never makes compliance judgments. All pass/fail/review verdicts are produced by deterministic TypeScript code in `compliance.ts`, so every rejection can be explained precisely and consistently.

This separation means:
- Results are reproducible for the same label
- Compliance logic is auditable and testable without an LLM
- The LLM can be swapped without changing compliance rules

---

## Compliance Checks

All checks are implemented in `artifacts/api-server/src/lib/compliance.ts`.

### 1. Government Warning (27 CFR Part 16)

The full warning text must appear **word-for-word** as specified in the regulation:

> GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.

Rules applied:
- **Missing warning** → FAIL
- **Lead-in not in ALL CAPS** (e.g., "Government Warning:" instead of "GOVERNMENT WARNING:") → FAIL
- **Text differs from official** → FAIL with word-level diff
- **Bold type unconfirmed** (LLM cannot reliably detect bold) → NEEDS_REVIEW
- **Matches exactly, bold confirmed** → PASS

### 2. Brand Name

The brand name from the label is compared to the application data after normalization (lowercase, diacritics stripped, apostrophe/dash variants unified, extra punctuation removed).

| Similarity | Result |
|---|---|
| Identical after normalization | PASS (with formatting note if raw strings differ) |
| ≥ 85% similar | NEEDS_REVIEW |
| < 85% similar | FAIL |

Example: `"Stone's Throw"` vs `"STONE'S THROW"` → **PASS** with a formatting note.

### 3. Class/Type

Same normalization and similarity logic as Brand Name.

### 4. Alcohol Content (ABV)

- Parses both the label value and application value as a percentage (handles `%`, `proof`, and bare numbers)
- Proof → ABV conversion: `proof ÷ 2`
- If the label shows both ABV and proof, checks they are internally consistent (proof = ABV × 2 ± 0.5); inconsistency → NEEDS_REVIEW
- Numeric mismatch (> 0.01%) → FAIL

### 5. Net Contents

- Unit-aware comparison: converts mL, L, and fl oz all to mL before comparing
- 1.5 mL tolerance for floating-point rounding (e.g., `25.4 fl oz = 750.97 mL ≈ 750 mL`)
- Mismatch beyond tolerance → FAIL

### Overall Verdict

| Condition | Verdict |
|---|---|
| Any field is FAIL | REJECT |
| Any field is NEEDS_REVIEW, OR confidence < 0.6, OR legibility issues detected | NEEDS_REVIEW |
| All fields PASS, confidence ≥ 0.6, image legible | PASS |

---

## API Reference

### `POST /verify`

Verify a single label.

**Request** — `multipart/form-data`:

| Field | Type | Description |
|---|---|---|
| `image` | File | Label image (JPEG/PNG/WebP, ≤ 8 MB) |
| `brand_name` | string | Brand name from application |
| `class_type` | string | Class and type from application |
| `abv` | string | ABV from application (e.g., `"45%"`) |
| `net_contents` | string | Net contents from application (e.g., `"750 mL"`) |

**Response** — `VerificationResult`:

```json
{
  "overall": "PASS | NEEDS_REVIEW | REJECT",
  "fields": [
    {
      "field": "Government Warning",
      "status": "PASS | NEEDS_REVIEW | FAIL",
      "label_value": "GOVERNMENT WARNING: ...",
      "application_value": "GOVERNMENT WARNING: ...",
      "explanation": "Plain-English reason",
      "diff": "word-level diff string or null"
    }
  ],
  "latency_ms": 1234,
  "extraction": {
    "confidence": 0.95,
    "legibility_issues": null
  }
}
```

### `POST /batch`

Verify multiple labels at once.

**Request** — `multipart/form-data`:

| Field | Type | Description |
|---|---|---|
| `manifest` | File | CSV with columns: `filename,brand_name,class_type,abv,net_contents` |
| `images` | File[] | Label image files; filenames must match CSV |

**Response** — `BatchResult` with summary counts and per-row results.

### `GET /sample-csv`

Returns a sample manifest CSV for testing the batch endpoint.

---

## Sample Label Generator

```bash
pnpm --filter @workspace/scripts run generate-labels
```

Generates five synthetic label images in `scripts/sample-labels/`:

| Filename | Scenario |
|---|---|
| `old_tom_bourbon_pass.png` | All checks pass |
| `old_tom_bourbon_fail_abv.png` | ABV mismatch (label shows 40%, app expects 45%) |
| `stones_throw_rye.png` | Brand name casing difference (`Stone's Throw` vs `STONE'S THROW`) — should PASS with note |
| `riverbend_vodka_casing_fail.png` | Warning lead-in not in ALL CAPS → FAIL |
| `harbor_light_gin_no_warning.png` | Government warning missing entirely → FAIL |

---

## Assumptions and Trade-offs

**LLM bold detection is unreliable.** Vision LLMs cannot reliably detect font weight from label images (especially low-res or compressed). When the LLM cannot confirm bold type, the warning check returns NEEDS_REVIEW rather than FAIL to avoid false rejections.

**1.5 mL net-contents tolerance.** Unit conversion of fl oz → mL produces irrational numbers (1 fl oz = 29.5735… mL). A 1.5 mL tolerance absorbs rounding while keeping the check meaningful.

**No persistent storage.** The app is stateless. Results are not saved server-side; the frontend can export results as needed.

**Rate limiting.** Batch processing is capped at 5 concurrent LLM calls to stay within OpenRouter rate limits. The manifest supports up to 500 rows.

**Model selection.** The default model `google/gemini-2.5-flash` offers strong vision accuracy at low cost. Any OpenRouter vision-capable model can be used by setting the `VISION_MODEL` environment variable.

**Similarity threshold (85%).** The 85% Levenshtein similarity threshold for NEEDS_REVIEW is a calibration choice. It was set conservatively to capture common variations (abbreviations, ampersands, punctuation differences) without generating too many false reviews.

**Agency-firewall / swappable extractor.** In a production TTB deployment, the LLM call would likely need to route through an agency-approved firewall or an on-premises model to satisfy data-handling requirements. The extractor is deliberately isolated in `extractor.ts` behind a single `extractLabelData()` interface — swapping the underlying model or provider (OpenRouter → Azure OpenAI → a self-hosted endpoint) requires changing only that file, with no impact on compliance logic or the API surface.

**AI assistance disclosure.** This prototype was developed with the assistance of an AI coding tool (Replit Agent). All compliance rules, tolerances, and verdict logic were authored and reviewed by the developer and map directly to the cited CFR sections.
