import { Router, type IRouter } from "express";
import multer from "multer";
import { extractLabelData } from "../lib/extractor";
import { runComplianceChecks } from "../lib/compliance";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Sample CSV (bundled here so no file I/O needed)
// ---------------------------------------------------------------------------

const SAMPLE_CSV = `filename,brand_name,class_type,abv,net_contents
old_tom_bourbon_pass.png,OLD TOM DISTILLERY,Bourbon Whiskey,45%,750 mL
old_tom_bourbon_fail_abv.png,OLD TOM DISTILLERY,Bourbon Whiskey,45%,750 mL
stones_throw_rye.png,Stone's Throw,Straight Rye Whiskey,43%,750 mL
riverbend_vodka_casing_fail.png,RIVERBEND VODKA,Vodka,40%,750 mL
harbor_light_gin_no_warning.png,HARBOR LIGHT GIN,Gin,40%,750 mL
`;

// ---------------------------------------------------------------------------
// Multer — accept manifest CSV + up to 500 images
// ---------------------------------------------------------------------------

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB total
  fileFilter: (_req, file, cb) => {
    // Allow CSV for manifest; images for label files
    if (
      file.fieldname === "manifest" ||
      ALLOWED_IMAGE_TYPES.has(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type for "${file.originalname}". Use JPEG, PNG, or WebP for label images.`));
    }
  },
});

// ---------------------------------------------------------------------------
// CSV parser
// ---------------------------------------------------------------------------

interface ManifestRow {
  filename: string;
  brand_name: string;
  class_type: string;
  abv: string;
  net_contents: string;
}

function parseManifestCsv(text: string): ManifestRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error("CSV must contain a header row and at least one data row.");
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const required = ["filename", "brand_name", "class_type", "abv", "net_contents"];
  for (const col of required) {
    if (!headers.includes(col)) {
      throw new Error(
        `CSV is missing required column: "${col}". Required columns are: ${required.join(", ")}.`,
      );
    }
  }

  const rows: ManifestRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted fields (basic CSV parsing)
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row as unknown as ManifestRow);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Concurrency limiter — process at most `limit` items simultaneously
// ---------------------------------------------------------------------------

async function pLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIdx = 0;

  async function worker(): Promise<void> {
    while (nextIdx < tasks.length) {
      const i = nextIdx++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Per-row processing
// ---------------------------------------------------------------------------

interface BatchRowResult {
  filename: string;
  row_index: number;
  brand_name: string | null;
  overall: "PASS" | "NEEDS_REVIEW" | "REJECT" | "ERROR";
  error_message: string | null;
  result: object | null;
}

async function processRow(
  row: ManifestRow,
  rowIndex: number,
  imageMap: Map<string, Express.Multer.File>,
): Promise<BatchRowResult> {
  const imageFile = imageMap.get(row.filename);

  if (!imageFile) {
    return {
      filename: row.filename,
      row_index: rowIndex,
      brand_name: row.brand_name || null,
      overall: "ERROR",
      error_message: `Image file "${row.filename}" was not found in the uploaded files. Please include it in the batch.`,
      result: null,
    };
  }

  const start = Date.now();
  try {
    const extraction = await extractLabelData(imageFile.buffer, imageFile.mimetype);
    const latencyMs = Date.now() - start;

    const result = runComplianceChecks(
      extraction,
      {
        brand_name: row.brand_name,
        class_type: row.class_type,
        abv: row.abv,
        net_contents: row.net_contents,
      },
      latencyMs,
    );

    return {
      filename: row.filename,
      row_index: rowIndex,
      brand_name: row.brand_name || null,
      overall: result.overall,
      error_message: null,
      result,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      filename: row.filename,
      row_index: rowIndex,
      brand_name: row.brand_name || null,
      overall: "ERROR",
      error_message: `Processing failed: ${message}`,
      result: null,
    };
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.get("/sample-csv", (_req, res): void => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="label-check-sample.csv"',
  );
  res.send(SAMPLE_CSV);
});

router.post(
  "/batch",
  upload.fields([
    { name: "manifest", maxCount: 1 },
    { name: "images", maxCount: 500 },
  ]),
  async (req, res): Promise<void> => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    const manifestFiles = files?.["manifest"];
    if (!manifestFiles || manifestFiles.length === 0) {
      res.status(400).json({ error: "Please upload a CSV manifest file." });
      return;
    }

    const csvText = manifestFiles[0].buffer.toString("utf-8");
    let rows: ManifestRow[];
    try {
      rows = parseManifestCsv(csvText);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid CSV";
      res.status(400).json({ error: `CSV error: ${message}` });
      return;
    }

    if (rows.length === 0) {
      res.status(400).json({ error: "CSV manifest has no data rows." });
      return;
    }

    // Build a map from filename → uploaded file
    const imageFiles = files?.["images"] ?? [];
    const imageMap = new Map<string, Express.Multer.File>();
    for (const file of imageFiles) {
      imageMap.set(file.originalname, file);
    }

    req.log.info(
      { rows: rows.length, images: imageFiles.length },
      "Starting batch verification",
    );

    // Process up to 5 rows concurrently to respect OpenRouter rate limits
    const tasks = rows.map(
      (row, idx) => () => processRow(row, idx, imageMap),
    );
    const batchRows = await pLimit(tasks, 5);

    const summary = {
      total: batchRows.length,
      passed: batchRows.filter((r) => r.overall === "PASS").length,
      review: batchRows.filter((r) => r.overall === "NEEDS_REVIEW").length,
      rejected: batchRows.filter((r) => r.overall === "REJECT").length,
      errors: batchRows.filter((r) => r.overall === "ERROR").length,
    };

    req.log.info(summary, "Batch verification complete");
    res.json({ summary, rows: batchRows });
  },
);

export default router;
