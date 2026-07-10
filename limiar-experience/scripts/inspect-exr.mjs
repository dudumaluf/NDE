/**
 * Estatísticas por clipe da VAT de posições: min/max/centro por canal (bake space).
 * Uso: node scripts/inspect-exr.mjs [caminho.exr]
 */
import { readFileSync } from "node:fs";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { FloatType } from "three";

const path = process.argv[2] ?? "public/vat/anim_positions_360f.exr";
const buf = readFileSync(path);
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const loader = new EXRLoader();
loader.setDataType(FloatType);
const tex = loader.parse(arrayBuffer);
const { width, height, data } = tex;
const channels = data.length / (width * height);
console.log(`file: ${path}`);
console.log(`size: ${width}x${height}, channels: ${channels}, dtype: ${data.constructor.name}`);

const FRAMES_PER_CLIP = 60;
const clips = Math.floor(height / FRAMES_PER_CLIP);

function statsForRows(rowStart, rowEnd) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let y = rowStart; y < rowEnd; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      for (let ch = 0; ch < 3; ch++) {
        const v = data[i + ch];
        if (v < min[ch]) min[ch] = v;
        if (v > max[ch]) max[ch] = v;
      }
    }
  }
  return { min, max };
}

const fmt = (v) => v.map((n) => n.toFixed(4)).join(", ");
for (let cIdx = 0; cIdx < clips; cIdx++) {
  const { min, max } = statsForRows(cIdx * FRAMES_PER_CLIP, (cIdx + 1) * FRAMES_PER_CLIP);
  const center = min.map((m, i) => (m + max[i]) / 2);
  console.log(
    `clip ${cIdx}: min(${fmt(min)}) max(${fmt(max)}) center(${fmt(center)})`,
  );
}
const all = statsForRows(0, height);
console.log(`ALL   : min(${fmt(all.min)}) max(${fmt(all.max)})`);
