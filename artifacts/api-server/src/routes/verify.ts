import { Router, type IRouter } from "express";
import multer from "multer";
import { extractLabelData } from "../lib/extractor";
import { runComplianceChecks } from "../lib/compliance";

const router: IRouter = Router();

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are accepted."));
    }
  },
});

router.post("/verify", upload.single("image"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({
      error: "Please upload a label image. Accepted formats: JPEG, PNG, WebP (max 8 MB).",
    });
    return;
  }

  const { brand_name, class_type, abv, net_contents } = req.body as Record<string, string>;

  const missing: string[] = [];
  if (!brand_name?.trim()) missing.push("brand_name");
  if (!class_type?.trim()) missing.push("class_type");
  if (!abv?.trim()) missing.push("abv");
  if (!net_contents?.trim()) missing.push("net_contents");

  if (missing.length > 0) {
    res.status(400).json({
      error: `Missing required fields: ${missing.join(", ")}.`,
    });
    return;
  }

  const start = Date.now();

  try {
    const extraction = await extractLabelData(req.file.buffer, req.file.mimetype);
    const latencyMs = Date.now() - start;

    const result = runComplianceChecks(
      extraction,
      { brand_name: brand_name.trim(), class_type: class_type.trim(), abv: abv.trim(), net_contents: net_contents.trim() },
      latencyMs,
    );

    req.log.info({ overall: result.overall, latency_ms: latencyMs }, "Label verified");
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Label verification failed");
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred during verification.";
    res.status(500).json({ error: `Verification failed: ${message}` });
  }
});

export default router;
