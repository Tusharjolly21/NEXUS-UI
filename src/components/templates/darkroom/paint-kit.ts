import { mixHex, rgba } from "./color";
import { between, lerp, seededRandom } from "./random";
import type { Palette } from "./prompt";
import type { Noise, Rand } from "./random";
import { heightAt } from "./scene";
import type { Bird, Boat, Cloud, Layer, Point, Scene } from "./scene";

/** Shared drawing helpers for every print style: canvases, silhouettes, grain, scratches and vignettes. */

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  return [canvas, canvas.getContext("2d", { willReadFrequently: false })!];
}
export function tracePath(ctx: CanvasRenderingContext2D | Path2D, points: Point[]) {
  ctx.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index++) {
    ctx.lineTo(points[index][0], points[index][1]);
  }
  ctx.closePath();
}
export function layerPath(layer: Layer, bottom: number, withExtras: boolean = true) {
  const path = new Path2D();
  if (layer.kind === "water") {
    path.rect(-0.05, layer.base, 1.1, bottom + 0.1 - layer.base);
    return path;
  }
  path.moveTo(-0.05, bottom + 0.05);
  path.lineTo(-0.05, layer.top[0][1]);
  for (const [x, y] of layer.top) {
    path.lineTo(x, y);
  }
  path.lineTo(1.05, layer.top[layer.top.length - 1][1]);
  path.lineTo(1.05, bottom + 0.05);
  path.closePath();
  if (withExtras) {
    for (const shape of layer.extra) {
      if (shape.k === "p") {
        tracePath(path, shape.pts);
      } else {
        path.moveTo(shape.x + shape.r, shape.y);
        path.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
      }
    }
  }
  return path;
}
/** Shadowed faces on each peak: a wedge from the summit down one flank, so ridges read as 3D. */
export function peaksPath(layer: Layer, bottom: number, rand: Rand, noise: Noise, flip: boolean) {
  const path = new Path2D();
  for (const peak of layer.peaks) {
    const side = flip ? -1 : 1;
    const footX = peak.x + side * peak.w * between(rand, 0.28, 0.5);
    const footY = Math.min(bottom + 0.02, layer.base + 0.03);
    const points: Point[] = [[peak.x, peak.y]];
    for (let step = 1; step <= 12; step++) {
      const t = step / 12;
      points.push([
        lerp(peak.x, footX, Math.pow(t, 0.9)) + noise.n2(t * 6, peak.x * 10) * 0.012 * t,
        lerp(peak.y, footY, t),
      ]);
    }
    const edgeX = peak.x + side * peak.w * 0.95;
    for (let step = 20; step >= 0; step--) {
      const x = lerp(peak.x, edgeX, step / 20);
      points.push([x, heightAt(layer.top, x)]);
    }
    tracePath(path, points);
  }
  return path;
}
/** Snow caps: the ridge line on top, a ragged noise line about a third of the way down below it. */
export function snowPath(layer: Layer, bottom: number, noise: Noise) {
  const path = new Path2D();
  for (const peak of layer.peaks) {
    const depth = (layer.base - peak.y) * 0.32;
    const snowLine = peak.y + depth;
    const points: Point[] = [];
    for (let step = 0; step <= 40; step++) {
      const x = peak.x - peak.w * 0.6 + (peak.w * 1.2 * step) / 40;
      points.push([x, Math.min(heightAt(layer.top, x) - 0.001, bottom)]);
    }
    for (let step = 40; step >= 0; step--) {
      const x = peak.x - peak.w * 0.6 + (peak.w * 1.2 * step) / 40;
      const ragged = Math.abs(noise.n2(x * 40, 9.3)) * depth * 0.9 + noise.n2(x * 9, 3) * depth * 0.35;
      points.push([x, snowLine + ragged]);
    }
    tracePath(path, points);
  }
  return path;
}
export function birdPath(bird: Bird) {
  const path = new Path2D();
  const size = bird.s;
  const r = size * (0.25 + bird.a * 0.3);
  path.moveTo(bird.x - size, bird.y - r);
  path.quadraticCurveTo(bird.x - size * 0.45, bird.y - r - size * 0.25, bird.x, bird.y);
  path.quadraticCurveTo(bird.x + size * 0.45, bird.y - r - size * 0.25, bird.x + size, bird.y - r);
  path.quadraticCurveTo(bird.x + size * 0.45, bird.y - r * 0.4 - size * 0.05, bird.x, bird.y + size * 0.16);
  path.quadraticCurveTo(bird.x - size * 0.45, bird.y - r * 0.4 - size * 0.05, bird.x - size, bird.y - r);
  path.closePath();
  return path;
}
export function boatPath(boat: Boat) {
  const path = new Path2D();
  const size = boat.s;
  path.moveTo(boat.x - size, boat.y - size * 0.12);
  path.quadraticCurveTo(boat.x, boat.y + size * 0.2, boat.x + size, boat.y - size * 0.16);
  path.lineTo(boat.x + size * 0.7, boat.y - size * 0.04);
  path.lineTo(boat.x - size * 0.75, boat.y - size * 0.02);
  path.closePath();
  path.moveTo(boat.x + size * 0.08, boat.y - size * 0.08);
  path.lineTo(boat.x + size * 0.08, boat.y - size * 0.95);
  path.lineTo(boat.x + size * 0.62, boat.y - size * 0.12);
  path.closePath();
  path.moveTo(boat.x - size * 0.02, boat.y - size * 0.14);
  path.lineTo(boat.x - size * 0.02, boat.y - size * 0.7);
  path.lineTo(boat.x - size * 0.5, boat.y - size * 0.14);
  path.closePath();
  return path;
}
export function cloudPath(cloud: Cloud) {
  const path = new Path2D();
  for (const puff of cloud.puffs) {
    path.moveTo(puff.x + puff.r, puff.y);
    path.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
  }
  path.rect(cloud.x - cloud.w * 0.5, cloud.y - cloud.w * 0.02, cloud.w, cloud.w * 0.08);
  return path;
}
/** Film grain: per-pixel noise, optionally modulated by a soft low-frequency mottle field. */
export function addGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number,
  seed: number,
  mottle: number = 0,
  noise?: Noise,
) {
  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  const rand = seededRandom(seed);
  let cols = 0;
  let rows = 0;
  let field: Float32Array | null = null;
  if (mottle && noise) {
    cols = 48;
    rows = Math.ceil((48 * h) / w);
    field = new Float32Array((cols + 1) * (rows + 1));
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        field[row * (cols + 1) + col] = noise.fbm(col / 9, row / 9 + 40, 3);
      }
    }
  }
  for (let py = 0; py < h; py++) {
    const fy = field ? (py / h) * rows : 0;
    const row = Math.floor(fy);
    const ty = fy - row;
    for (let px = 0; px < w; px++) {
      let shift = (rand() + rand() - 1) * amount * 255;
      if (field) {
        const fx = (px / w) * cols;
        const col = Math.floor(fx);
        const tx = fx - col;
        const topLeft = field[row * (cols + 1) + col];
        const topRight = field[row * (cols + 1) + col + 1];
        const bottomLeft = field[(row + 1) * (cols + 1) + col] ?? topLeft;
        const bottomRight = field[(row + 1) * (cols + 1) + col + 1] ?? topRight;
        shift += lerp(lerp(topLeft, topRight, tx), lerp(bottomLeft, bottomRight, tx), ty) * mottle * 255;
      }
      const index = (py * w + px) * 4;
      data[index] += shift;
      data[index + 1] += shift;
      data[index + 2] += shift;
    }
  }
  ctx.putImageData(image, 0, 0);
}
export function scratches(
  ctx: CanvasRenderingContext2D,
  scale: number,
  rand: Rand,
  aspect: number,
  color: string,
  count: number = 160,
) {
  ctx.save();
  ctx.lineCap = "round";
  for (let index = 0; index < count; index++) {
    const x = rand();
    const y = rand() * aspect;
    const length = between(rand, 0.006, 0.03);
    const angle = rand() * Math.PI;
    ctx.strokeStyle = rgba(color, between(rand, 0.04, 0.12));
    ctx.lineWidth = between(rand, 0.4, 1) / scale;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * length * 0.5 + between(rand, -0.004, 0.004),
      y + Math.sin(angle) * length * 0.5,
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length,
    );
    ctx.stroke();
  }
  ctx.restore();
}
export function vignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strength: number,
  color: string = "#000000",
) {
  const gradient = ctx.createRadialGradient(
    w / 2,
    h * 0.45,
    Math.min(w, h) * 0.35,
    w / 2,
    h / 2,
    Math.hypot(w, h) * 0.62,
  );
  gradient.addColorStop(0, rgba(color, 0));
  gradient.addColorStop(1, rgba(color, strength));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}
export function skyGradient(ctx: CanvasRenderingContext2D, scene: Scene, stops: string[]) {
  const gradient = ctx.createLinearGradient(0, 0, 0, scene.hz);
  gradient.addColorStop(0, stops[0]);
  gradient.addColorStop(0.62, stops[1]);
  gradient.addColorStop(1, stops[2]);
  return gradient;
}
export function hazeColor(colors: Palette, layer: Layer) {
  return mixHex(mixHex(colors.far, colors.sky[2], 0.12), colors.near, Math.pow(layer.t, 0.85));
}
