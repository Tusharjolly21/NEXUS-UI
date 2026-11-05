import { MOON_COLOR, MOON_RELIEF } from "../assets";
import { clamp01, smoothstep } from "./noise";

type Maps = { color: ImageData; relief: ImageData };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function readPixels(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

let mapsPromise: Promise<Maps | null> | null = null;

/** Decodes the two moon maps once and shares the pixels between every sky on the page. Resolves to null if they fail. */
function loadMoonMaps() {
  mapsPromise ??= (async () => {
    try {
      const [color, relief] = await Promise.all([loadImage(MOON_COLOR), loadImage(MOON_RELIEF)]);
      return { color: readPixels(color), relief: readPixels(relief) };
    } catch {
      return null;
    }
  })();
  return mapsPromise;
}

/** Light comes from the upper left, slightly toward the viewer. */
const LIGHT = (() => {
  const v = [0.56, -0.08, 0.82];
  const length = Math.hypot(v[0], v[1], v[2]);
  return v.map((n) => n / length);
})();

/** The moon is tilted a little, as it looks from the northern hemisphere. */
const TILT = -0.12;

/** Reads the red channel of a map at normalised coordinates, as 0..1. */
function sample(map: ImageData, u: number, v: number) {
  const x = Math.min(map.width - 1, Math.max(0, Math.floor(u * map.width)));
  const y = Math.min(map.height - 1, Math.max(0, Math.floor(v * map.height)));
  return map.data[(y * map.width + x) * 4] / 255;
}

/**
 * Renders a lit sphere from the colour map, using the relief map to tilt the surface normal so craters
 * catch the light. Returns null if the maps could not be loaded.
 */
export async function renderTexturedMoon(diameter: number): Promise<HTMLCanvasElement | null> {
  const maps = await loadMoonMaps();
  if (!maps) return null;
  const { color, relief } = maps;

  const size = Math.max(16, Math.ceil(diameter));
  const radius = size / 2;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  const cosTilt = Math.cos(TILT);
  const sinTilt = Math.sin(TILT);
  const texel = 1 / relief.width;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const x = (col + 0.5 - radius) / radius;
      const y = (row + 0.5 - radius) / radius;
      const d = x * x + y * y;
      if (d > 1.03) continue;
      const z = Math.sqrt(Math.max(0, 1 - d));
      const edge = clamp01((1 - Math.sqrt(d)) * radius + 0.5);

      // Where this pixel sits on the moon's surface, as texture coordinates.
      const tx = x * cosTilt - y * sinTilt;
      const ty = x * sinTilt + y * cosTilt;
      const u = 0.5 + Math.atan2(tx, z) / (2 * Math.PI);
      const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, -ty))) / Math.PI;

      // Slope of the surface from the relief map, used to bend the normal.
      const slopeX = sample(relief, u + texel, v) - sample(relief, u - texel, v);
      const slopeY = sample(relief, u, v - texel) - sample(relief, u, v + texel);
      const nx = x - slopeX * 2.2;
      const ny = y + slopeY * 2.2;
      const length = Math.hypot(nx, ny, z) || 1;
      const lambert = Math.max(0, (nx * LIGHT[0] + ny * LIGHT[1] + z * LIGHT[2]) / length);
      const view = Math.max(0.02, z);
      // Lommel-Seeliger scattering: the real moon is flat-lit, not like a billiard ball.
      const scatter = (2 * lambert) / (lambert + view);
      const terminator = smoothstep(-0.05, 0.1, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);

      const albedo = sample(color, u, v);
      const lit = albedo * scatter * 1.08 * terminator;
      const earthshine = albedo * 0.035;

      const i = (row * size + col) * 4;
      const r = Math.max(lit * 255, earthshine * 204);
      const g = Math.max(lit * 252, earthshine * 224);
      const b = Math.max(lit * 244, earthshine * 255);
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 255 * edge * clamp01((Math.max(r, g, b) / 255) * 2.6 + 0.05);
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}
