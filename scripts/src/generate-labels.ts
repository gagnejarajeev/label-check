#!/usr/bin/env tsx
/**
 * generate-labels.ts
 *
 * Generates five synthetic alcohol label PNG images for testing Label Check.
 * Uses only pngjs (already in workspace) + Node built-ins — no native deps.
 *
 * Run: pnpm --filter @workspace/scripts run generate-labels
 */

import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "..", "sample-labels");

const OFFICIAL_WARNING =
  "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

// ---------------------------------------------------------------------------
// Minimal 8x8 bitmap font — ASCII 32–126
// Each entry is 8 bytes (one per row, MSB = leftmost pixel).
// Source: classic font8x8_basic (public domain).
// ---------------------------------------------------------------------------
const FONT: Uint8Array[] = (() => {
  const raw = [
    // 32  space
    [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
    // 33  !
    [0x18,0x3c,0x3c,0x18,0x18,0x00,0x18,0x00],
    // 34  "
    [0x36,0x36,0x00,0x00,0x00,0x00,0x00,0x00],
    // 35  #
    [0x36,0x36,0x7f,0x36,0x7f,0x36,0x36,0x00],
    // 36  $
    [0x0c,0x3e,0x03,0x1e,0x30,0x1f,0x0c,0x00],
    // 37  %
    [0x00,0x63,0x33,0x18,0x0c,0x66,0x63,0x00],
    // 38  &
    [0x1c,0x36,0x1c,0x6e,0x3b,0x33,0x6e,0x00],
    // 39  '
    [0x06,0x06,0x03,0x00,0x00,0x00,0x00,0x00],
    // 40  (
    [0x18,0x0c,0x06,0x06,0x06,0x0c,0x18,0x00],
    // 41  )
    [0x06,0x0c,0x18,0x18,0x18,0x0c,0x06,0x00],
    // 42  *
    [0x00,0x66,0x3c,0xff,0x3c,0x66,0x00,0x00],
    // 43  +
    [0x00,0x0c,0x0c,0x3f,0x0c,0x0c,0x00,0x00],
    // 44  ,
    [0x00,0x00,0x00,0x00,0x00,0x0c,0x0c,0x06],
    // 45  -
    [0x00,0x00,0x00,0x3f,0x00,0x00,0x00,0x00],
    // 46  .
    [0x00,0x00,0x00,0x00,0x00,0x0c,0x0c,0x00],
    // 47  /
    [0x60,0x30,0x18,0x0c,0x06,0x03,0x01,0x00],
    // 48  0
    [0x3e,0x63,0x73,0x7b,0x6f,0x67,0x3e,0x00],
    // 49  1
    [0x0c,0x0e,0x0c,0x0c,0x0c,0x0c,0x3f,0x00],
    // 50  2
    [0x1e,0x33,0x30,0x1c,0x06,0x33,0x3f,0x00],
    // 51  3
    [0x1e,0x33,0x30,0x1c,0x30,0x33,0x1e,0x00],
    // 52  4
    [0x38,0x3c,0x36,0x33,0x7f,0x30,0x78,0x00],
    // 53  5
    [0x3f,0x03,0x1f,0x30,0x30,0x33,0x1e,0x00],
    // 54  6
    [0x1c,0x06,0x03,0x1f,0x33,0x33,0x1e,0x00],
    // 55  7
    [0x3f,0x33,0x30,0x18,0x0c,0x0c,0x0c,0x00],
    // 56  8
    [0x1e,0x33,0x33,0x1e,0x33,0x33,0x1e,0x00],
    // 57  9
    [0x1e,0x33,0x33,0x3e,0x30,0x18,0x0e,0x00],
    // 58  :
    [0x00,0x0c,0x0c,0x00,0x00,0x0c,0x0c,0x00],
    // 59  ;
    [0x00,0x0c,0x0c,0x00,0x00,0x0c,0x0c,0x06],
    // 60  <
    [0x18,0x0c,0x06,0x03,0x06,0x0c,0x18,0x00],
    // 61  =
    [0x00,0x00,0x3f,0x00,0x00,0x3f,0x00,0x00],
    // 62  >
    [0x06,0x0c,0x18,0x30,0x18,0x0c,0x06,0x00],
    // 63  ?
    [0x1e,0x33,0x30,0x18,0x0c,0x00,0x0c,0x00],
    // 64  @
    [0x3e,0x63,0x7b,0x7b,0x7b,0x03,0x1e,0x00],
    // 65  A
    [0x0c,0x1e,0x33,0x33,0x3f,0x33,0x33,0x00],
    // 66  B
    [0x3f,0x66,0x66,0x3e,0x66,0x66,0x3f,0x00],
    // 67  C
    [0x3c,0x66,0x03,0x03,0x03,0x66,0x3c,0x00],
    // 68  D
    [0x1f,0x36,0x66,0x66,0x66,0x36,0x1f,0x00],
    // 69  E
    [0x7f,0x46,0x16,0x1e,0x16,0x46,0x7f,0x00],
    // 70  F
    [0x7f,0x46,0x16,0x1e,0x16,0x06,0x0f,0x00],
    // 71  G
    [0x3c,0x66,0x03,0x03,0x73,0x66,0x7c,0x00],
    // 72  H
    [0x33,0x33,0x33,0x3f,0x33,0x33,0x33,0x00],
    // 73  I
    [0x1e,0x0c,0x0c,0x0c,0x0c,0x0c,0x1e,0x00],
    // 74  J
    [0x78,0x30,0x30,0x30,0x33,0x33,0x1e,0x00],
    // 75  K
    [0x67,0x66,0x36,0x1e,0x36,0x66,0x67,0x00],
    // 76  L
    [0x0f,0x06,0x06,0x06,0x46,0x66,0x7f,0x00],
    // 77  M
    [0x63,0x77,0x7f,0x7f,0x6b,0x63,0x63,0x00],
    // 78  N
    [0x63,0x67,0x6f,0x7b,0x73,0x63,0x63,0x00],
    // 79  O
    [0x1c,0x36,0x63,0x63,0x63,0x36,0x1c,0x00],
    // 80  P
    [0x3f,0x66,0x66,0x3e,0x06,0x06,0x0f,0x00],
    // 81  Q
    [0x1e,0x33,0x33,0x33,0x3b,0x1e,0x38,0x00],
    // 82  R
    [0x3f,0x66,0x66,0x3e,0x36,0x66,0x67,0x00],
    // 83  S
    [0x1e,0x33,0x07,0x0e,0x38,0x33,0x1e,0x00],
    // 84  T
    [0x3f,0x2d,0x0c,0x0c,0x0c,0x0c,0x1e,0x00],
    // 85  U
    [0x33,0x33,0x33,0x33,0x33,0x33,0x3f,0x00],
    // 86  V
    [0x33,0x33,0x33,0x33,0x33,0x1e,0x0c,0x00],
    // 87  W
    [0x63,0x63,0x63,0x6b,0x7f,0x77,0x63,0x00],
    // 88  X
    [0x63,0x63,0x36,0x1c,0x1c,0x36,0x63,0x00],
    // 89  Y
    [0x33,0x33,0x33,0x1e,0x0c,0x0c,0x1e,0x00],
    // 90  Z
    [0x7f,0x63,0x31,0x18,0x4c,0x66,0x7f,0x00],
    // 91  [
    [0x1e,0x06,0x06,0x06,0x06,0x06,0x1e,0x00],
    // 92  \
    [0x03,0x06,0x0c,0x18,0x30,0x60,0x40,0x00],
    // 93  ]
    [0x1e,0x18,0x18,0x18,0x18,0x18,0x1e,0x00],
    // 94  ^
    [0x08,0x1c,0x36,0x63,0x00,0x00,0x00,0x00],
    // 95  _
    [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xff],
    // 96  `
    [0x0c,0x0c,0x18,0x00,0x00,0x00,0x00,0x00],
    // 97  a
    [0x00,0x00,0x1e,0x30,0x3e,0x33,0x6e,0x00],
    // 98  b
    [0x07,0x06,0x06,0x3e,0x66,0x66,0x3b,0x00],
    // 99  c
    [0x00,0x00,0x1e,0x33,0x03,0x33,0x1e,0x00],
    // 100 d
    [0x38,0x30,0x30,0x3e,0x33,0x33,0x6e,0x00],
    // 101 e
    [0x00,0x00,0x1e,0x33,0x3f,0x03,0x1e,0x00],
    // 102 f
    [0x1c,0x36,0x06,0x0f,0x06,0x06,0x0f,0x00],
    // 103 g
    [0x00,0x00,0x6e,0x33,0x33,0x3e,0x30,0x1f],
    // 104 h
    [0x07,0x06,0x36,0x6e,0x66,0x66,0x67,0x00],
    // 105 i
    [0x0c,0x00,0x0e,0x0c,0x0c,0x0c,0x1e,0x00],
    // 106 j
    [0x30,0x00,0x30,0x30,0x30,0x33,0x33,0x1e],
    // 107 k
    [0x07,0x06,0x66,0x36,0x1e,0x36,0x67,0x00],
    // 108 l
    [0x0e,0x0c,0x0c,0x0c,0x0c,0x0c,0x1e,0x00],
    // 109 m
    [0x00,0x00,0x33,0x7f,0x7f,0x6b,0x63,0x00],
    // 110 n
    [0x00,0x00,0x1f,0x33,0x33,0x33,0x33,0x00],
    // 111 o
    [0x00,0x00,0x1e,0x33,0x33,0x33,0x1e,0x00],
    // 112 p
    [0x00,0x00,0x3b,0x66,0x66,0x3e,0x06,0x0f],
    // 113 q
    [0x00,0x00,0x6e,0x33,0x33,0x3e,0x30,0x78],
    // 114 r
    [0x00,0x00,0x3b,0x6e,0x66,0x06,0x0f,0x00],
    // 115 s
    [0x00,0x00,0x3e,0x03,0x1e,0x30,0x1f,0x00],
    // 116 t
    [0x08,0x0c,0x3e,0x0c,0x0c,0x2c,0x18,0x00],
    // 117 u
    [0x00,0x00,0x33,0x33,0x33,0x33,0x6e,0x00],
    // 118 v
    [0x00,0x00,0x33,0x33,0x33,0x1e,0x0c,0x00],
    // 119 w
    [0x00,0x00,0x63,0x6b,0x7f,0x7f,0x36,0x00],
    // 120 x
    [0x00,0x00,0x63,0x36,0x1c,0x36,0x63,0x00],
    // 121 y
    [0x00,0x00,0x33,0x33,0x33,0x3e,0x30,0x1f],
    // 122 z
    [0x00,0x00,0x3f,0x19,0x0c,0x26,0x3f,0x00],
    // 123 {
    [0x38,0x0c,0x0c,0x07,0x0c,0x0c,0x38,0x00],
    // 124 |
    [0x18,0x18,0x18,0x00,0x18,0x18,0x18,0x00],
    // 125 }
    [0x07,0x0c,0x0c,0x38,0x0c,0x0c,0x07,0x00],
    // 126 ~
    [0x6e,0x3b,0x00,0x00,0x00,0x00,0x00,0x00],
  ];
  return raw.map(bytes => new Uint8Array(bytes));
})();

// ---------------------------------------------------------------------------
// Pure Node.js PNG encoder (no external deps)
// ---------------------------------------------------------------------------

// CRC32 lookup table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c;
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = (CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8));
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(w: number, h: number, rgba: Uint8Array): Buffer {
  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB (no alpha — keeps file smaller)
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw scanlines: filter byte (0 = None) + RGB pixels
  const raw = Buffer.allocUnsafe(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 0;
    for (let x = 0; x < w; x++) {
      const src = (y * w + x) * 4;
      const dst = y * (1 + w * 3) + 1 + x * 3;
      raw[dst]     = rgba[src]!;
      raw[dst + 1] = rgba[src + 1]!;
      raw[dst + 2] = rgba[src + 2]!;
    }
  }

  const idat = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Canvas — a simple pixel buffer with drawing primitives
// ---------------------------------------------------------------------------

type Color = [number, number, number]; // RGB

class Canvas {
  readonly w: number;
  readonly h: number;
  readonly buf: Uint8Array; // RGBA flat

  constructor(w: number, h: number, fill: Color = [255, 255, 255]) {
    this.w = w;
    this.h = h;
    this.buf = new Uint8Array(w * h * 4);
    this.fillRect(0, 0, w, h, fill);
  }

  private idx(x: number, y: number) { return (y * this.w + x) * 4; }

  setPixel(x: number, y: number, c: Color) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    const i = this.idx(x, y);
    this.buf[i] = c[0]; this.buf[i+1] = c[1]; this.buf[i+2] = c[2]; this.buf[i+3] = 255;
  }

  fillRect(x0: number, y0: number, w: number, h: number, c: Color) {
    for (let y = y0; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++)
        this.setPixel(x, y, c);
  }

  strokeRect(x0: number, y0: number, w: number, h: number, c: Color, thick = 1) {
    for (let t = 0; t < thick; t++) {
      const x1 = x0 + t, y1 = y0 + t, x2 = x0 + w - 1 - t, y2 = y0 + h - 1 - t;
      for (let x = x1; x <= x2; x++) { this.setPixel(x, y1, c); this.setPixel(x, y2, c); }
      for (let y = y1; y <= y2; y++) { this.setPixel(x1, y, c); this.setPixel(x2, y, c); }
    }
  }

  hLine(x0: number, x1: number, y: number, c: Color, thick = 1) {
    for (let t = 0; t < thick; t++)
      for (let x = x0; x <= x1; x++) this.setPixel(x, y + t, c);
  }

  // Draw a single character at pixel position (x, y), scale S means each font pixel → S×S screen pixels
  drawChar(ch: string, x: number, y: number, color: Color, scale = 1) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 126) return;
    const glyph = FONT[code - 32]!;
    for (let row = 0; row < 8; row++) {
      const bits = glyph[row]!;
      for (let col = 0; col < 8; col++) {
        if ((bits >> col) & 1) {
          for (let sy = 0; sy < scale; sy++)
            for (let sx = 0; sx < scale; sx++)
              this.setPixel(x + col * scale + sx, y + row * scale + sy, color);
        }
      }
    }
  }

  // Draw a string; returns the x position after the last character
  drawText(text: string, x: number, y: number, color: Color, scale = 1): number {
    let cx = x;
    for (const ch of text) {
      this.drawChar(ch, cx, y, color, scale);
      cx += 8 * scale;
    }
    return cx;
  }

  // Draw text centered horizontally between x0 and x1
  drawTextCentered(text: string, x0: number, x1: number, y: number, color: Color, scale = 1) {
    const w = text.length * 8 * scale;
    const startX = x0 + Math.floor((x1 - x0 - w) / 2);
    this.drawText(text, startX, y, color, scale);
  }

  // Word-wrap text into lines of at most maxChars, return array of lines
  static wrapText(text: string, maxChars: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      if (line.length + word.length + (line ? 1 : 0) > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line += (line ? " " : "") + word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  toPNG(): Buffer {
    return encodePNG(this.w, this.h, this.buf);
  }

  save(filepath: string) {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, this.toPNG());
    console.log(`  ✓  ${path.basename(filepath)}`);
  }
}

// ---------------------------------------------------------------------------
// Label drawing
// ---------------------------------------------------------------------------

interface LabelSpec {
  filename: string;
  brandName: string;          // as printed on label
  tagline: string;
  classType: string;
  abvLine: string;            // e.g. "45% ALC/VOL  |  90 Proof"
  netContents: string;
  warningText: string | null; // null = omit entirely
  warningLeadInCaps: boolean; // true → "GOVERNMENT WARNING:", false → "Government Warning:"
  bgColor: Color;
  accentColor: Color;
  textColor: Color;
}

const W = 500;
const H = 800;

function drawLabel(spec: LabelSpec): void {
  const c = new Canvas(W, H, spec.bgColor);
  const acc = spec.accentColor;
  const txt = spec.textColor;
  const dark: Color = [30, 30, 30];

  // Outer border
  c.strokeRect(8, 8, W - 16, H - 16, acc, 3);
  c.strokeRect(14, 14, W - 28, H - 28, acc, 1);

  // Top accent band
  c.fillRect(0, 0, W, 10, acc);
  c.fillRect(0, H - 10, W, 10, acc);

  // Brand name — large, scale 3
  const brandScale = spec.brandName.length <= 16 ? 3 : 2;
  c.drawTextCentered(spec.brandName, 20, W - 20, 28, acc, brandScale);

  // Tagline — scale 1
  c.drawTextCentered(spec.tagline, 20, W - 20, 28 + 8 * brandScale + 6, [100, 100, 100], 1);

  // Divider
  let y = 28 + 8 * brandScale + 22;
  c.hLine(40, W - 40, y, acc, 2);
  y += 10;

  // Class / Type — scale 2
  c.drawTextCentered(spec.classType, 20, W - 20, y, dark, 2);
  y += 8 * 2 + 10;

  // Decorative oval (hand-drawn look: just a rectangle with rounded-ish border)
  const ovalX = W / 2 - 80, ovalY = y, ovalW = 160, ovalH = 110;
  c.strokeRect(ovalX, ovalY, ovalW, ovalH, acc, 2);
  c.fillRect(ovalX + 3, ovalY + 3, ovalW - 6, ovalH - 6, spec.bgColor);
  c.drawTextCentered("EST.", ovalX, ovalX + ovalW, ovalY + 20, acc, 1);
  c.drawTextCentered("1887", ovalX, ovalX + ovalW, ovalY + 35, acc, 2);
  c.drawTextCentered("DISTILLERY", ovalX, ovalX + ovalW, ovalY + 70, acc, 1);
  y += ovalH + 14;

  // Divider
  c.hLine(40, W - 40, y, acc, 2);
  y += 10;

  // ABV and net contents on same line
  c.drawText(spec.abvLine, 26, y, dark, 1);
  const ncW = spec.netContents.length * 8;
  c.drawText(spec.netContents, W - 26 - ncW, y, dark, 1);
  y += 18;

  // Divider
  c.hLine(40, W - 40, y, acc, 1);
  y += 10;

  // Government warning section
  if (spec.warningText !== null) {
    const boxPad = 6;
    const boxX = 20, boxW = W - 40;
    const warningBg: Color = [245, 245, 238];
    const warningBorder: Color = [180, 180, 170];

    // Build the full warning text with the chosen lead-in casing
    const leadIn = spec.warningLeadInCaps ? "GOVERNMENT WARNING:" : "Government Warning:";
    const bodyText = spec.warningText.replace(/^(GOVERNMENT WARNING:|Government Warning:)\s*/i, "");
    const fullText = `${leadIn} ${bodyText}`;

    const maxCharsPerLine = Math.floor((boxW - boxPad * 2) / 8); // 1px per font px, scale 1
    const lines = Canvas.wrapText(fullText, maxCharsPerLine);
    const boxH = lines.length * 10 + boxPad * 2 + 4;

    c.fillRect(boxX, y, boxW, boxH, warningBg);
    c.strokeRect(boxX, y, boxW, boxH, warningBorder, 1);
    y += boxPad;

    for (const line of lines) {
      c.drawText(line, boxX + boxPad, y, dark, 1);
      y += 10;
    }
    y += boxPad + 4;
  }

  c.save(path.join(OUT_DIR, spec.filename));
}

// ---------------------------------------------------------------------------
// Label definitions — five test scenarios
// ---------------------------------------------------------------------------

function run() {
  console.log(`\nGenerating sample labels → ${OUT_DIR}\n`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // A — all checks should PASS
  drawLabel({
    filename: "old_tom_bourbon_pass.png",
    brandName: "OLD TOM DISTILLERY",
    tagline: "Small Batch  -  Kentucky",
    classType: "Bourbon Whiskey",
    abvLine: "45% ALC/VOL  |  90 Proof",
    netContents: "750 mL",
    warningText: OFFICIAL_WARNING,
    warningLeadInCaps: true,
    bgColor: [253, 248, 239],
    accentColor: [122, 58, 16],
    textColor: [30, 30, 30],
  });

  // B — ABV mismatch: label shows 40%, manifest says 45% → REJECT
  drawLabel({
    filename: "old_tom_bourbon_fail_abv.png",
    brandName: "OLD TOM DISTILLERY",
    tagline: "Small Batch  -  Kentucky",
    classType: "Bourbon Whiskey",
    abvLine: "40% ALC/VOL  |  80 Proof",   // wrong — manifest will say 45%
    netContents: "750 mL",
    warningText: OFFICIAL_WARNING,
    warningLeadInCaps: true,
    bgColor: [253, 248, 239],
    accentColor: [122, 58, 16],
    textColor: [30, 30, 30],
  });

  // C — brand casing differs: label "Stone's Throw" vs manifest "STONE'S THROW" → PASS with note
  drawLabel({
    filename: "stones_throw_rye.png",
    brandName: "Stone's Throw",
    tagline: "Handcrafted  -  Pacific Northwest",
    classType: "Straight Rye Whiskey",
    abvLine: "43% ALC/VOL",
    netContents: "750 mL",
    warningText: OFFICIAL_WARNING,
    warningLeadInCaps: true,
    bgColor: [240, 244, 240],
    accentColor: [45, 90, 39],
    textColor: [30, 30, 30],
  });

  // D — warning lead-in NOT in ALL CAPS → REJECT
  drawLabel({
    filename: "riverbend_vodka_casing_fail.png",
    brandName: "RIVERBEND VODKA",
    tagline: "Distilled from Grain  -  Colorado",
    classType: "Vodka",
    abvLine: "40% ALC/VOL",
    netContents: "750 mL",
    warningText: OFFICIAL_WARNING,
    warningLeadInCaps: false,               // "Government Warning:" — FAIL
    bgColor: [240, 242, 248],
    accentColor: [26, 58, 107],
    textColor: [30, 30, 30],
  });

  // E — government warning missing entirely → REJECT
  drawLabel({
    filename: "harbor_light_gin_no_warning.png",
    brandName: "HARBOR LIGHT GIN",
    tagline: "London Dry Style  -  Maine",
    classType: "Gin",
    abvLine: "40% ALC/VOL",
    netContents: "750 mL",
    warningText: null,                       // no warning printed → FAIL
    warningLeadInCaps: false,
    bgColor: [240, 248, 244],
    accentColor: [26, 107, 74],
    textColor: [30, 30, 30],
  });

  // Write sample CSV manifest
  const csv = [
    "filename,brand_name,class_type,abv,net_contents",
    "old_tom_bourbon_pass.png,OLD TOM DISTILLERY,Bourbon Whiskey,45%,750 mL",
    "old_tom_bourbon_fail_abv.png,OLD TOM DISTILLERY,Bourbon Whiskey,45%,750 mL",
    "stones_throw_rye.png,STONE'S THROW,Straight Rye Whiskey,43%,750 mL",
    "riverbend_vodka_casing_fail.png,RIVERBEND VODKA,Vodka,40%,750 mL",
    "harbor_light_gin_no_warning.png,HARBOR LIGHT GIN,Gin,40%,750 mL",
  ].join("\n") + "\n";

  const csvPath = path.join(OUT_DIR, "sample.csv");
  fs.writeFileSync(csvPath, csv);
  console.log(`  ✓  sample.csv`);

  console.log("\nDone. Upload sample.csv + all PNGs in the Batch tab to run the test suite.\n");
  console.log("Expected results:");
  console.log("  old_tom_bourbon_pass.png       → PASS");
  console.log("  old_tom_bourbon_fail_abv.png   → REJECT  (ABV 40% vs 45%)");
  console.log("  stones_throw_rye.png           → PASS    (brand name normalized match)");
  console.log("  riverbend_vodka_casing_fail.png→ REJECT  (warning lead-in not ALL CAPS)");
  console.log("  harbor_light_gin_no_warning.png→ REJECT  (warning missing)");
}

run();
