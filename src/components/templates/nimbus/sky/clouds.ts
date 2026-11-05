import { clamp01, fbm, smoothstep, valueNoise } from "./noise";
import type { SkyState } from "./presets";

/**
 * The cloud layer. Clouds are computed per cell of a small grid (about 5 screen pixels per cell) from fractal
 * noise, written into two small ImageData buffers, and scaled up by the browser with smoothing. That keeps a
 * full-screen, constantly drifting sky cheap.
 */

export type CloudBuffers = {
  /** Grid size in cells. */
  cols: number;
  rows: number;
  /** Cloud colour with alpha: what is drawn over the sky. */
  color: ImageData;
  /** The same shape in a cool white: what a lightning flash lights up. */
  flash: ImageData;
};

export function createCloudBuffers(width: number, height: number, colorCtx: CanvasRenderingContext2D, flashCtx: CanvasRenderingContext2D): CloudBuffers {
  const cols = Math.max(48, Math.min(260, Math.round(width / 5.5)));
  const rows = Math.max(24, Math.round((height * cols) / width));
  const color = colorCtx.createImageData(cols, rows);
  const flash = flashCtx.createImageData(cols, rows);
  for (let i = 0; i < flash.data.length; i += 4) {
    flash.data[i] = 205;
    flash.data[i + 1] = 215;
    flash.data[i + 2] = 255;
  }
  return { cols, rows, color, flash };
}

/** Cloud density (0..1, the alpha) and brightness (0..1, 1 is the lit top of a cloud) at a pixel position. */
export function sampleClouds(state: SkyState, width: number, height: number, px: number, py: number, seconds: number): [alpha: number, light: number] {
  const scale = Math.max(220, Math.min(width, 1500) * 0.3) * (1 + (1 - state.band) * 0.5);
  const threshold = 0.66 - state.coverage * 0.42;
  const softness = 0.03 + state.softness * 0.22;
  const drift = seconds * state.speed * 0.012;
  const evolve = seconds * 0.006;

  const x = px / scale + drift;
  const y = py / (scale * 0.5);
  // Warp the lookup so clouds billow instead of sliding as a rigid pattern.
  const warp = valueNoise(x * 0.55 + 40, y * 0.55 - evolve) - 0.5;
  const wx = x + warp * 1.1;
  const wy = y + warp * 0.6;
  const density = fbm(wx, wy, 5);
  const densityAbove = fbm(wx, wy - 0.16, 5);

  const fromTop = py / height;
  // The band keeps clouds in the middle of the sky; without it they thin out slightly toward the bottom.
  const mask = state.band * (smoothstep(0.2, 0.42, fromTop) * (1 - smoothstep(0.7, 0.98, fromTop))) + (1 - state.band) * (1 - fromTop * 0.25);
  const cut = threshold + (1 - mask) * 0.32;
  const alpha = smoothstep(0, 1, (density - cut) / softness);
  // Light falls on the upper edge: compare the density with the density just above it.
  const light = clamp01(0.55 + (density - densityAbove) * 6 + (1 - alpha) * 0.3 - (density - cut) * 0.9);
  return [alpha, light];
}

/** Fills both buffers for time `seconds` and uploads them to their canvases. */
export function renderCloudField(
  state: SkyState,
  width: number,
  height: number,
  buffers: CloudBuffers,
  colorCtx: CanvasRenderingContext2D,
  flashCtx: CanvasRenderingContext2D,
  seconds: number,
) {
  const { cols, rows, color, flash } = buffers;
  const cell = width / cols;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const [alpha, light] = sampleClouds(state, width, height, (col + 0.5) * cell, (row + 0.5) * cell, seconds);
      const i = (row * cols + col) * 4;
      color.data[i] = state.shade[0] + (state.lit[0] - state.shade[0]) * light;
      color.data[i + 1] = state.shade[1] + (state.lit[1] - state.shade[1]) * light;
      color.data[i + 2] = state.shade[2] + (state.lit[2] - state.shade[2]) * light;
      color.data[i + 3] = alpha * state.maxAlpha * 255;
      flash.data[i + 3] = alpha * 255;
    }
  }
  colorCtx.putImageData(color, 0, 0);
  flashCtx.putImageData(flash, 0, 0);
}
