#!/usr/bin/env node
/**
 * Generates public/linkedin-icon.png at 800×800px.
 * Design: teal gradient background + geometric white "P" lettermark.
 * Run: node scripts/generate-linkedin-icon.js
 */

const sharp = require("sharp");
const path  = require("path");

// ── Design tokens ───────────────────────────────────────────────────────────
// Matches site palette: teal-600 (#0d9488) and a darker teal for gradient depth.

const SIZE = 800;

// The "P" is defined as a compound path (fill-rule: evenodd).
// Outer shape + inner counter (bowl hole) together create the letter.
//
// Layout on an 800×800 canvas:
//   Stem  : x=265–375 (110px wide), y=165–625 (460px tall)
//   Bowl  : outer arc from (375,165) → rightmost ~(536,315) → (375,465)
//   Counter: inner arc from (375,245) → rightmost ~(443,315) → (375,385)
//   Bowl stroke at widest: ~93px (close to stem width — bold/black weight)
//   Margins top/bottom of counter: 80px each
//
// Bezier control-point rationale:
//   Symmetric cubic Bézier with both CPs pulled to the same x gives a
//   near-circular arc, which is correct for a geometric sans-serif "P".

const P_PATH = [
  // Outer P silhouette (clockwise)
  "M 265 625",
  "L 265 165",
  "L 375 165",
  "C 590 165 590 465 375 465",   // outer bowl arc — CPs at x=590
  "L 375 625",
  "Z",
  // Counter / bowl hole (clockwise — evenodd punches it out)
  "M 375 245",
  "C 465 245 465 385 375 385",   // inner counter arc — CPs at x=465
  "Z",
].join(" ");

const svg = `<svg
  width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#13a99c"/>
      <stop offset="100%" stop-color="#0a7872"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>

  <!-- Geometric white P -->
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="${P_PATH}"
    fill="white"
  />
</svg>`;

const outPath = path.join(__dirname, "..", "public", "linkedin-icon.png");

sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(outPath)
  .then((info) => {
    console.log(`✓ Generated ${outPath}`);
    console.log(`  ${info.width}×${info.height}px · ${(info.size / 1024).toFixed(1)} kB`);
  })
  .catch((err) => {
    console.error("Error generating icon:", err.message);
    process.exit(1);
  });
