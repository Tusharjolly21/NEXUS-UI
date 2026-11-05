import { clamp01, fbm, smoothstep, TAU } from "./noise";

/** Small pre-rendered images the renderer stamps thousands of times per second: cheaper than drawing gradients live. */

function createCanvas(width: number, height = width) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** A soft round glow: a radial gradient from the centre to the edge, `stops` being [position, css colour]. */
export function radialSprite(size: number, stops: [number, string][]) {
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [position, color] of stops) gradient.addColorStop(position, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/** A shaded sphere drawn from noise, used for the moon if the texture images are not available. */
export function proceduralMoon(radius: number) {
  const size = Math.ceil(radius * 2 + 2);
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  const light = [0.42, -0.14, 0.9];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const x = (col + 0.5 - size / 2) / radius;
      const y = (row + 0.5 - size / 2) / radius;
      const d = x * x + y * y;
      if (d > 1.04) continue;
      const z = Math.sqrt(Math.max(0, 1 - d));
      const edge = clamp01((1.02 - Math.sqrt(d)) * radius);
      const lambert = Math.max(0, x * light[0] + y * light[1] + z * light[2]);
      const maria = fbm(x * 1.25 + 4, y * 1.25 + 2, 5);
      const grain = fbm(x * 9 + 9, y * 9 + 3, 3);
      const albedo = 0.97 - 0.19 * smoothstep(0.46, 0.64, maria) - 0.07 * grain;
      const shade = 0.06 + 0.94 * Math.pow(lambert, 0.75) * (0.82 + 0.18 * z);
      const i = (row * size + col) * 4;
      image.data[i] = 240 * albedo * shade + 6;
      image.data[i + 1] = 238 * albedo * shade + 8;
      image.data[i + 2] = 228 * albedo * shade + 14;
      image.data[i + 3] = 255 * edge * (0.07 + 0.93 * smoothstep(0, 0.18, lambert));
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/**
 * A tall tile of faint, vertically stretched noise. Scrolled and tiled behind the rain it reads as the far
 * curtain of drizzle that individual streaks are too small to show.
 */
export function rainHazeTile() {
  const width = 96;
  const height = 384;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(width, height);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const n = fbm(col / 3.2, row / 46, 3) * 0.7 + fbm(col / 9, row / 120 + 7, 2) * 0.3;
      const alpha = smoothstep(0.5, 0.78, n);
      const i = (row * width + col) * 4;
      image.data[i] = 225;
      image.data[i + 1] = 232;
      image.data[i + 2] = 242;
      image.data[i + 3] = alpha * 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** A bead of water on glass: a clear centre, a dark lower rim, a bright refraction at the bottom and a highlight. */
export function waterDropSprite() {
  const size = 64;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const r = size * 0.42;

  let gradient = ctx.createRadialGradient(c, c + r * 0.15, r * 0.2, c, c, r);
  gradient.addColorStop(0, "rgba(255,255,255,.05)");
  gradient.addColorStop(0.8, "rgba(255,255,255,.12)");
  gradient.addColorStop(1, "rgba(255,255,255,.28)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(c, c, r, 0, TAU);
  ctx.fill();

  ctx.lineWidth = size * 0.05;
  ctx.strokeStyle = "rgba(0,0,0,.32)";
  ctx.beginPath();
  ctx.arc(c, c, r * 0.95, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  gradient = ctx.createRadialGradient(c, c + r * 0.55, 0, c, c + r * 0.55, r * 0.6);
  gradient.addColorStop(0, "rgba(255,255,255,.65)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(c, c + r * 0.52, r * 0.62, r * 0.32, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.beginPath();
  ctx.arc(c - r * 0.35, c - r * 0.4, r * 0.12, 0, TAU);
  ctx.fill();
  return canvas;
}
