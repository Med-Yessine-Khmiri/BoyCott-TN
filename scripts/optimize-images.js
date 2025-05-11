const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = path.join(__dirname, "..", "assets", "images", "products");
const outputDir = path.join(__dirname, "..", "assets", "images", "optimized");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImages() {
  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);

      // Create WebP version
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath.replace(/\.[^.]+$/, ".webp"));

      // Create optimized original format
      await sharp(inputPath)
        .resize(200, 200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFile(outputPath);
    }
  }
}

optimizeImages().catch(console.error);
