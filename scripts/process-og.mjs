import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const inputPath = process.argv[2];
if (!inputPath) throw new Error("Provide the generated social-card image path.");

await sharp(inputPath)
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(process.cwd(), "src", "app", "opengraph-image.png"));

console.log("Saved the optimized social preview image.");
