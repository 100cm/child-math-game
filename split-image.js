const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function splitImage(inputPath, outputDir, cols = 3, rows = 2, startIndex = 1) {
  if (!outputDir) {
    outputDir = path.join(
      path.dirname(inputPath),
      path.basename(inputPath, path.extname(inputPath)) + '_split'
    );
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  const pieceWidth = Math.floor(width / cols);
  const pieceHeight = Math.floor(height / rows);

  console.log(`Image size: ${width}x${height}`);
  console.log(`Piece size: ${pieceWidth}x${pieceHeight}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Start index: ${startIndex}`);

  const tasks = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const left = col * pieceWidth;
      const top = row * pieceHeight;
      const index = row * cols + col + startIndex;
      const outputPath = path.join(outputDir, `${index}.png`);

      tasks.push(
        sharp(inputPath)
          .extract({
            left,
            top,
            width: pieceWidth,
            height: pieceHeight
          })
          .toFile(outputPath)
          .then(() => console.log(`Created: ${index}.png (row ${row + 1}, col ${col + 1})`))
      );
    }
  }

  await Promise.all(tasks);
  console.log(`\nDone! ${cols * rows} pieces saved to ${outputDir}`);
}

// CLI usage
const inputPath = process.argv[2];

if (!inputPath) {
  console.log('Usage: node split-image.js <image-path> [output-dir] [cols] [rows] [start-index]');
  console.log('Example: node split-image.js photo.jpg images/card 3 2 28');
  process.exit(1);
}

const cols = parseInt(process.argv[4]) || 3;
const rows = parseInt(process.argv[5]) || 2;
const startIndex = parseInt(process.argv[6]) || 1;
const outputDir = process.argv[3] || null;

splitImage(inputPath, outputDir, cols, rows, startIndex).catch(console.error);
