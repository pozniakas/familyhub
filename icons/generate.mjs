/**
 * One-time script to generate PNG icons from icons/icon.svg.
 * Run once after cloning: node icons/generate.mjs
 * Requires: npm install  (sharp is listed under devDependencies)
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const dir = dirname(fileURLToPath(import.meta.url));
const src = join(dir, "icon.svg");

const sizes = [
  { file: "icon-192.png", size: 192 }, // Android / Chrome PWA
  { file: "icon-512.png", size: 512 }, // Android / Chrome PWA (splash)
  { file: "icon-180.png", size: 180 }, // iOS apple-touch-icon
];

for (const { file, size } of sizes) {
  await sharp(src).resize(size, size).png().toFile(join(dir, file));
  console.log(`✓ icons/${file}`);
}

console.log("\nAll icons generated. You can now start the app.");
