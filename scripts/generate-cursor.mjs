import sharp from "sharp";
import path from "node:path";

const source = path.resolve("public/cursors/gold-source.png");
const out32 = path.resolve("public/cursors/gold-cursor-32.png");
const out64 = path.resolve("public/cursors/gold-cursor-64.png");

const threshold = 16;
const pad = 3;

async function loadPixels() {
  const img = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return img;
}

function findBounds({ data, info }) {
  const { width, height } = info;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const isBlack = r < threshold && g < threshold && b < threshold;
      const alpha = isBlack ? 0 : a;
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

async function buildCursor(size, targetHeight, tipX, tipY, output) {
  const img = await loadPixels();
  const { width, height } = img.info;
  const bounds = findBounds(img);
  if (bounds.maxX < bounds.minX) throw new Error("No non-transparent pixels found");

  const left = Math.max(0, bounds.minX - pad);
  const top = Math.max(0, bounds.minY - pad);
  const right = Math.min(width - 1, bounds.maxX + pad);
  const bottom = Math.min(height - 1, bounds.maxY + pad);

  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;

  const maxW = size - tipX - 2;
  const maxH = size - tipY - 2;
  const scale = Math.min(targetHeight / cropHeight, maxW / cropWidth, maxH / cropHeight);
  const resizedW = Math.max(1, Math.round(cropWidth * scale));
  const resizedH = Math.max(1, Math.round(cropHeight * scale));

  const arrow = sharp(source)
    .ensureAlpha()
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize(resizedW, resizedH, { kernel: sharp.kernel.nearest });

  const canvas = sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  });

  await canvas
    .composite([{ input: await arrow.png().toBuffer(), left: tipX, top: tipY }])
    .png()
    .toFile(output);
}

await buildCursor(32, 24, 6, 4, out32);
await buildCursor(64, 48, 12, 8, out64);

console.log("Generated:", out32, out64);

// After generating:
// - Hard refresh the browser (Cmd+Shift+R).
// - Open /cursors/gold-cursor-32.png?v=999 to confirm it loads.
