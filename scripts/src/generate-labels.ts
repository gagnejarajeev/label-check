#!/usr/bin/env tsx
/**
 * generate-labels.ts
 *
 * Generates five synthetic alcohol label PNG images for testing Label Check.
 * Run with:  pnpm --filter @workspace/scripts run generate-labels
 *
 * Dependencies: canvas (node-canvas)
 */

import { createCanvas } from "canvas";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "..", "sample-labels");

const OFFICIAL_WARNING =
  "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

type CanvasRenderingContext2D = ReturnType<ReturnType<typeof createCanvas>["getContext"]>;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function drawLabel(opts: {
  filename: string;
  title: string;
  subtitle: string;
  brandName: string;
  classType: string;
  abv: string;
  proof?: string;
  netContents: string;
  warningText: string | null;
  warningLeadInCaps: boolean;
  bgColor: string;
  accentColor: string;
}): void {
  const W = 600;
  const H = 900;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = opts.bgColor;
  ctx.fillRect(0, 0, W, H);

  // Decorative top band
  ctx.fillStyle = opts.accentColor;
  ctx.fillRect(0, 0, W, 12);
  ctx.fillRect(0, H - 12, W, 12);

  // Decorative border
  ctx.strokeStyle = opts.accentColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Brand name (large, centered)
  ctx.fillStyle = opts.accentColor;
  ctx.font = "bold 52px serif";
  ctx.textAlign = "center";
  ctx.fillText(opts.brandName, W / 2, 120);

  // Subtitle / tagline
  ctx.font = "italic 20px serif";
  ctx.fillStyle = "#555";
  ctx.fillText(opts.subtitle, W / 2, 155);

  // Decorative rule
  ctx.strokeStyle = opts.accentColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 175);
  ctx.lineTo(W - 60, 175);
  ctx.stroke();

  // Class/Type
  ctx.fillStyle = "#222";
  ctx.font = "bold 28px serif";
  ctx.fillText(opts.classType, W / 2, 215);

  // Illustration placeholder (circle)
  ctx.beginPath();
  ctx.arc(W / 2, 350, 110, 0, Math.PI * 2);
  ctx.fillStyle = opts.accentColor + "22";
  ctx.fill();
  ctx.strokeStyle = opts.accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Label title in circle
  ctx.fillStyle = opts.accentColor;
  ctx.font = "bold 18px serif";
  ctx.textAlign = "center";
  ctx.fillText(opts.title, W / 2, 340);
  ctx.font = "14px serif";
  ctx.fillStyle = "#555";
  ctx.fillText("ESTABLISHED 1887", W / 2, 365);

  // Decorative rule
  ctx.strokeStyle = opts.accentColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 490);
  ctx.lineTo(W - 60, 490);
  ctx.stroke();

  // ABV and net contents
  ctx.textAlign = "left";
  ctx.fillStyle = "#222";
  ctx.font = "bold 20px monospace";

  let abvText = opts.abv;
  if (opts.proof) abvText += `  |  ${opts.proof}`;
  ctx.fillText(abvText, 50, 525);

  ctx.textAlign = "right";
  ctx.fillText(opts.netContents, W - 50, 525);

  // Government warning section
  ctx.textAlign = "left";
  const warningY = 560;

  if (opts.warningText === null) {
    // No warning — leave this area blank (fail scenario)
  } else {
    // Small warning box
    ctx.fillStyle = "#f5f5f0";
    ctx.fillRect(30, warningY - 12, W - 60, 290);
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(30, warningY - 12, W - 60, 290);

    const leadIn = opts.warningLeadInCaps
      ? "GOVERNMENT WARNING:"
      : "Government Warning:";
    const body = opts.warningText.replace(/^GOVERNMENT WARNING:\s*/i, "").replace(/^Government Warning:\s*/i, "");

    // Lead-in
    ctx.fillStyle = "#111";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(leadIn, 40, warningY + 10);

    // Body text
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#333";
    wrapText(ctx, body, 40, warningY + 28, W - 80, 14);
  }

  // Bottom rule
  ctx.strokeStyle = opts.accentColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, H - 40);
  ctx.lineTo(W - 60, H - 40);
  ctx.stroke();

  // Save PNG
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, opts.filename);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outPath, buffer);
  console.log(`  ✓ ${opts.filename}`);
}

// ---------------------------------------------------------------------------
// Label definitions
// ---------------------------------------------------------------------------

function generateLabels(): void {
  console.log(`Generating sample labels in: ${OUT_DIR}\n`);

  // Label A — All checks pass
  drawLabel({
    filename: "old_tom_bourbon_pass.png",
    title: "OLD TOM",
    subtitle: "Small Batch — Kentucky",
    brandName: "OLD TOM DISTILLERY",
    classType: "Bourbon Whiskey",
    abv: "45% ALC/VOL",
    proof: "90 Proof",
    netContents: "750 mL",
    warningText: OFFICIAL_WARNING,
    warningLeadInCaps: true,
    bgColor: "#fdf8ef",
    accentColor: "#7a3a10",
  });

  // Label B — ABV mismatch (label shows 40%, app expects 45%)
  drawLabel({
    filename: "old_tom_bourbon_fail_abv.png",
    title: "OLD TOM",
    subtitle: "Small Batch — Kentucky",
    brandName: "OLD TOM DISTILLERY",
    classType: "Bourbon Whiskey",
    abv: "40% ALC/VOL",   // ← wrong ABV
    proof: "80 Proof",
    netContents: "750 mL",
    warningText: OFFICIAL_WARNING,
    warningLeadInCaps: true,
    bgColor: "#fdf8ef",
    accentColor: "#7a3a10",
  });

  // Label C — Brand name casing differs from application data (PASS with note)
  // Application data will be "STONE'S THROW"; label shows "Stone's Throw"
  drawLabel({
    filename: "stones_throw_rye.png",
    title: "STONE'S THROW",
    subtitle: "Handcrafted — Pacific Northwest",
    brandName: "Stone's Throw",   // ← lowercase, should normalize-match "STONE'S THROW"
    classType: "Straight Rye Whiskey",
    abv: "43% ALC/VOL",
    netContents: "750 mL",
    warningText: OFFICIAL_WARNING,
    warningLeadInCaps: true,
    bgColor: "#f0f4f0",
    accentColor: "#2d5a27",
  });

  // Label D — Warning lead-in NOT in ALL CAPS → FAIL
  drawLabel({
    filename: "riverbend_vodka_casing_fail.png",
    title: "RIVERBEND",
    subtitle: "Distilled from Grain — Colorado",
    brandName: "RIVERBEND VODKA",
    classType: "Vodka",
    abv: "40% ALC/VOL",
    netContents: "750 mL",
    warningText: OFFICIAL_WARNING,
    warningLeadInCaps: false,   // ← "Government Warning:" not "GOVERNMENT WARNING:"
    bgColor: "#f0f2f8",
    accentColor: "#1a3a6b",
  });

  // Label E — Government warning missing entirely → FAIL
  drawLabel({
    filename: "harbor_light_gin_no_warning.png",
    title: "HARBOR LIGHT",
    subtitle: "London Dry Style — Maine",
    brandName: "HARBOR LIGHT GIN",
    classType: "Gin",
    abv: "40% ALC/VOL",
    netContents: "750 mL",
    warningText: null,   // ← no warning text at all
    warningLeadInCaps: false,
    bgColor: "#f0f8f4",
    accentColor: "#1a6b4a",
  });

  // Write sample CSV manifest
  const csv = [
    "filename,brand_name,class_type,abv,net_contents",
    "old_tom_bourbon_pass.png,OLD TOM DISTILLERY,Bourbon Whiskey,45%,750 mL",
    "old_tom_bourbon_fail_abv.png,OLD TOM DISTILLERY,Bourbon Whiskey,45%,750 mL",
    "stones_throw_rye.png,STONE'S THROW,Straight Rye Whiskey,43%,750 mL",
    "riverbend_vodka_casing_fail.png,RIVERBEND VODKA,Vodka,40%,750 mL",
    "harbor_light_gin_no_warning.png,HARBOR LIGHT GIN,Gin,40%,750 mL",
  ].join("\n");

  const csvPath = path.join(OUT_DIR, "sample.csv");
  fs.writeFileSync(csvPath, csv + "\n");
  console.log(`  ✓ sample.csv`);
  console.log(`\nDone. Upload sample.csv + all PNG files in the Batch tab to test.`);
}

generateLabels();
