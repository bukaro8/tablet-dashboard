import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const root = process.cwd();
const backgroundsDir = path.join(root, "public", "backgrounds");
const iconsDir = path.join(root, "public", "icons");
const backgroundNames = ["morning", "day", "evening", "night"];
const inputPaths = process.argv.slice(2, 6);

if (inputPaths.length !== backgroundNames.length) {
  throw new Error("Provide morning, day, evening, and night source image paths.");
}

await mkdir(backgroundsDir, { recursive: true });
await mkdir(iconsDir, { recursive: true });

await Promise.all(
  inputPaths.map((inputPath, index) =>
    sharp(inputPath)
      .resize(2048, 1152, { fit: "cover", position: "centre" })
      .webp({ quality: 84, effort: 6, smartSubsample: true })
      .toFile(path.join(backgroundsDir, `${backgroundNames[index]}.webp`)),
  ),
);

const iconSvg = Buffer.from(`
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="35%" cy="20%" r="90%">
        <stop offset="0%" stop-color="#263446"/>
        <stop offset="55%" stop-color="#0d141d"/>
        <stop offset="100%" stop-color="#05070a"/>
      </radialGradient>
      <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fde68a"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="116" fill="url(#bg)"/>
    <circle cx="256" cy="256" r="91" fill="none" stroke="#ffffff" stroke-opacity="0.17" stroke-width="5"/>
    <circle cx="256" cy="256" r="73" fill="url(#sun)"/>
    <g stroke="#fbbf24" stroke-width="15" stroke-linecap="round">
      <path d="M256 102v-34"/><path d="M256 444v-34"/>
      <path d="M102 256H68"/><path d="M444 256h-34"/>
      <path d="M147 147l-24-24"/><path d="M389 389l-24-24"/>
      <path d="M365 147l24-24"/><path d="M123 389l24-24"/>
    </g>
    <g fill="none" stroke="#111827" stroke-linecap="round">
      <path d="M256 256v-43" stroke-width="13"/>
      <path d="M256 256l40 24" stroke-width="13"/>
    </g>
    <circle cx="256" cy="256" r="10" fill="#111827"/>
  </svg>
`);

const icon512 = await sharp(iconSvg).png().toBuffer();
await Promise.all([
  sharp(icon512).resize(192, 192).png().toFile(path.join(iconsDir, "icon-192.png")),
  sharp(icon512).png().toFile(path.join(iconsDir, "icon-512.png")),
  sharp(icon512).png().toFile(path.join(iconsDir, "icon-maskable-512.png")),
  sharp(icon512).resize(512, 512).png().toFile(path.join(root, "src", "app", "icon.png")),
]);

console.log("Optimized four backgrounds and generated the PWA icon set.");
