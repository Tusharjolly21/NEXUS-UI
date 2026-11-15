import { hexToRgb, mixHex, rgba } from "./color";
import {
  addGrain,
  birdPath,
  boatPath,
  cloudPath,
  hazeColor,
  layerPath,
  makeCanvas,
  peaksPath,
  skyGradient,
  snowPath,
  tracePath,
  vignette,
} from "./paint-kit";
import { PALETTES, type Palette } from "./prompt";
import { between, pick, seededRandom, type Noise, type Rand } from "./random";
import type { Scene } from "./scene";

/**
 * The "printed" styles: risograph, paper cut, halftone and Bauhaus.
 * Every painter draws in a unit space (x from 0 to 1, y from 0 to scene.A) and is fully deterministic for a seed.
 */
/** Real Riso drum colours. */
const RISO_INKS: Record<string, string> = {
  pink: "#FF48B0",
  blue: "#0078BF",
  yellow: "#FFE800",
  fed: "#3D5588",
  teal: "#00838A",
  orange: "#FF6C2F",
  red: "#F15060",
  green: "#00A95C",
  aqua: "#5EC8E5",
  purple: "#765BA7",
  sun: "#FFB511",
  burg: "#914E72",
  black: "#1A1A1A",
  mint: "#82D8D5",
  gold: "#BB8B41",
  lpink: "#F6A0C0",
};
/** Three drums per palette, printed in order. */
const RISO_SETS: Record<string, string[]> = {
  dusk: ["pink", "fed", "sun"],
  dawn: ["lpink", "aqua", "yellow"],
  neon: ["pink", "blue", "yellow"],
  pastel: ["lpink", "mint", "yellow"],
  mono: ["black", "black", "black"],
  warm: ["orange", "burg", "sun"],
  cold: ["aqua", "fed", "lpink"],
  night: ["purple", "fed", "yellow"],
  autumn: ["orange", "burg", "gold"],
  verdant: ["green", "teal", "yellow"],
  ocean: ["orange", "teal", "sun"],
};
/**
 * Risograph: each ink gets its own greyscale plate, then the plates are inked, grained and
 * overprinted in multiply with a slight mis-register, like a real two or three drum print.
 */
export function paintRiso(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: Scene,
  colors: Palette,
  paletteKey: string,
  rand: Rand,
  noise: Noise,
  seed: number,
) {
  const aspect = scene.A;
  const inks = RISO_SETS[paletteKey].map((inkName) => RISO_INKS[inkName]);
  const mono = paletteKey === "mono";
  const plates = inks.map(() => makeCanvas(width, height));
  const tone = (density: number) => {
    const grey = Math.round(255 * (1 - Math.max(0, Math.min(1, density))));
    return `rgb(${grey},${grey},${grey})`;
  };
  for (const [, plateCtx] of plates) {
    plateCtx.fillStyle = "#fff";
    plateCtx.fillRect(0, 0, width, height);
    plateCtx.scale(width, width);
  }
  /** Put a shape on every plate at its own density (one value in mono), or with a per-plate fill. */
  const inkAll = (
    shape: Path2D | null,
    densities: number[],
    makeFill?: ((plateCtx: CanvasRenderingContext2D, plate: number) => CanvasGradient) | null,
    clip?: Path2D,
  ) =>
    plates.forEach(([, plateCtx], i) => {
      plateCtx.save();
      if (clip) {
        plateCtx.clip(clip);
      }
      plateCtx.fillStyle = makeFill ? makeFill(plateCtx, i) : tone(mono ? densities[0] : densities[i]);
      if (shape) {
        plateCtx.fill(shape);
      } else {
        plateCtx.fillRect(-1, -1, 3, aspect + 2);
      }
      plateCtx.restore();
    });
  const night = scene.night;
  inkAll(null, [0, 0, 0], (plateCtx, plate) => {
    const gradient = plateCtx.createLinearGradient(0, 0, 0, scene.hz);
    const top = mono ? [0.14, 0, 0] : night ? [0.55, 1, 0] : [0.02, 0.3, 0];
    const bottom = mono ? [0.03, 0, 0] : night ? [0.62, 0.45, 0.08] : [0.5, 0.02, 0.32];
    gradient.addColorStop(0, tone(top[plate]));
    gradient.addColorStop(1, tone(bottom[plate]));
    return gradient;
  });
  for (const star of scene.stars) {
    const dot = new Path2D();
    dot.arc(star.x, star.y, star.r * 1.4, 0, 7);
    inkAll(dot, [0, 0, 0]);
  }
  if (scene.orb) {
    const orb = scene.orb;
    const disc = new Path2D();
    disc.arc(orb.x, orb.y, orb.r, 0, 7);
    if (orb.moon) {
      inkAll(disc, mono ? [0.05] : [0, 0, 0.9]);
      if (orb.crescent) {
        const shadow = new Path2D();
        shadow.arc(orb.x + orb.r * 0.42, orb.y - orb.r * 0.18, orb.r * 0.92, 0, 7);
        inkAll(shadow, mono ? [0.2] : [0.25, 0.85, 0]);
      }
    } else {
      const halo = new Path2D();
      halo.arc(orb.x, orb.y, orb.r * 1.9, 0, 7);
      inkAll(halo, mono ? [0.1] : [0.5, 0, 0.55]);
      inkAll(disc, mono ? [0] : [0.5, 0, 1]);
    }
  }
  for (const cloud of scene.clouds) {
    inkAll(cloudPath(cloud), mono ? [0.05] : night ? [0.1, 0.5, 0] : [0.15, 0, 0.12]);
  }
  for (const bird of scene.birds) {
    inkAll(birdPath(bird), [1, 1, 0]);
  }
  const flip = scene.orb ? scene.orb.x > 0.5 : true;
  for (const layer of scene.layers) {
    const silhouette = layerPath(layer, aspect);
    if (layer.kind === "water") {
      inkAll(silhouette, mono ? [0.35] : [0.2, 0.55, 0.12], (plateCtx, plate) => {
        const gradient = plateCtx.createLinearGradient(0, scene.hz, 0, aspect);
        const top = mono ? [0.2, 0, 0] : [0.3, 0.45, 0.25];
        const bottom = mono ? [0.55, 0, 0] : [0.12, 0.8, 0];
        gradient.addColorStop(0, tone(top[plate]));
        gradient.addColorStop(1, tone(bottom[plate]));
        return gradient;
      });
      if (scene.orb) {
        for (let band = 0; band < 26; band++) {
          const t = band / 25;
          const y = scene.hz + 0.004 + (aspect - scene.hz) * Math.pow(t, 1.3);
          const bandWidth = scene.orb.r * (1.1 - t * 0.5) * between(rand, 0.4, 1.2);
          const streak = new Path2D();
          streak.rect(scene.orb.x - bandWidth / 2 + between(rand, -0.02, 0.02), y, bandWidth, 0.004 + t * 0.006);
          inkAll(streak, mono ? [0] : scene.orb.moon ? [0, 0, 0.7] : [0.4, 0, 0.9]);
        }
      }
      for (let ripple = 0; ripple < 40; ripple++) {
        const y = between(rand, scene.hz + 0.01, aspect);
        const x = rand();
        const length = between(rand, 0.03, 0.12);
        const line = new Path2D();
        line.rect(x, y, length, 0.0025);
        inkAll(line, mono ? [0.6] : [0.1, 1, 0]);
      }
      continue;
    }
    const depth = layer.t;
    const body = layerPath(layer, aspect, false);
    inkAll(
      silhouette,
      mono
        ? [0.3 + 0.7 * depth]
        : night
          ? [0.75 + 0.25 * depth, 0.85 + 0.15 * depth, 0]
          : [depth > 0.99 ? 0.85 : 0.2 + 0.5 * (1 - depth), depth > 0.99 ? 1 : 0.3 + 0.55 * depth, 0.25 * (1 - depth)],
    );
    if (layer.peaks.length) {
      inkAll(
        peaksPath(layer, aspect, rand, noise, flip),
        mono ? [0.55 + 0.45 * depth] : [0.35 + 0.4 * (1 - depth), 0.55 + 0.45 * depth, 0],
        null,
        body,
      );
    }
    if (layer.snow) {
      inkAll(snowPath(layer, aspect, noise), mono ? [0.02] : [0.02, 0.06, 0], null, body);
    }
    if (layer.river) {
      const river = new Path2D();
      tracePath(river, layer.river);
      inkAll(river, mono ? [0.2] : [0.25, 0.3, 0.6]);
    }
    for (const win of layer.win) {
      const pane = new Path2D();
      pane.rect(win[0], win[1], win[2], win[3]);
      inkAll(pane, mono ? [0] : [0.2, 0, 1]);
    }
  }
  if (scene.boat) {
    inkAll(boatPath(scene.boat), [0.9, 1, 0]);
  }
  if (scene.lamp) {
    const lamp = scene.lamp;
    const glow = new Path2D();
    glow.arc(lamp.x, lamp.y, lamp.r * 4, 0, 7);
    inkAll(glow, mono ? [0.05] : [0.25, 0, 0.45]);
    const bulb = new Path2D();
    bulb.arc(lamp.x, lamp.y, lamp.r * 1.3, 0, 7);
    inkAll(bulb, mono ? [0] : [0.2, 0, 1]);
  }
  ctx.fillStyle =
    colors.paper === PALETTES.neon.paper || paletteKey === "night" ? "#F3EEE4" : mixHex(colors.paper, "#FFFFFF", 0.3);
  ctx.fillRect(0, 0, width, height);
  const margin = Math.round(width * 0.05);
  const paperRand = seededRandom(seed + 11);
  const coarseWidth = (width >> 1) + 2;
  const coarse = new Float32Array(coarseWidth * ((height >> 1) + 2));
  for (let index = 0; index < coarse.length; index++) {
    coarse[index] = paperRand();
  }
  const tooth = new Float32Array(width * height);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      tooth[py * width + px] = coarse[(py >> 1) * coarseWidth + (px >> 1)] * 0.5 + paperRand() * 0.5;
    }
  }
  plates.forEach(([canvas, plateCtx], i) => {
    if (mono && i > 0) {
      return;
    }
    plateCtx.setTransform(1, 0, 0, 1, 0, 0);
    const image = plateCtx.getImageData(0, 0, width, height);
    const data = image.data;
    const ink = hexToRgb(inks[i]);
    const offset = (i * 7919 + 13) % tooth.length;
    for (let py = 0; py < height; py++) {
      const v = py / height;
      for (let px = 0; px < width; px++) {
        const pixel = py * width + px;
        const index = pixel * 4;
        let coverage = 1 - data[index] / 255;
        if (px < margin || px >= width - margin || py < margin || py >= height - margin) {
          coverage = 0;
        }
        const pressure = 0.9 + 0.13 * noise.n2((px / width) * 3 + i * 7, v * 4);
        const grain = tooth[(pixel + offset) % tooth.length];
        const alpha =
          coverage <= 0.003
            ? 0
            : Math.max(
                0,
                Math.min(
                  1,
                  coverage * pressure * (0.74 + 0.5 * grain) - (grain > 0.975 ? 0.45 : 0) + (coverage > 0.5 ? 0.06 : 0),
                ),
              );
        data[index] = ink[0];
        data[index + 1] = ink[1];
        data[index + 2] = ink[2];
        data[index + 3] = Math.round(alpha * 238);
      }
    }
    plateCtx.putImageData(image, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    const dx = i === 0 ? 0 : between(rand, -1, 1) * width * 0.0035;
    const dy = i === 0 ? 0 : between(rand, -1, 1) * width * 0.0035;
    ctx.translate(width / 2 + dx, height / 2 + dy);
    ctx.rotate(i === 0 ? 0 : between(rand, -1, 1) * 0.0025);
    ctx.drawImage(canvas, -width / 2, -height / 2);
    ctx.restore();
  });
  addGrain(ctx, width, height, 0.035, seed + 3, 0.03, noise);
}
/** Paper cut: every element is its own sheet of card, stacked with a soft cast shadow that deepens toward the front. */
export function paintPapercut(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: Scene,
  colors: Palette,
  rand: Rand,
  noise: Noise,
  seed: number,
) {
  const aspect = scene.A;
  ctx.save();
  ctx.scale(width, width);
  ctx.fillStyle = skyGradient(ctx, scene, colors.sky);
  ctx.fillRect(0, 0, 1, aspect);
  ctx.fillStyle = colors.sky[2];
  ctx.fillRect(0, scene.hz - 0.001, 1, aspect);
  ctx.restore();
  const cutLayer = (
    draw: (cut: CanvasRenderingContext2D) => void,
    fill: string | CanvasGradient | ((cut: CanvasRenderingContext2D) => string | CanvasGradient),
    lift: number,
    shade = true,
  ) => {
    const [canvas, layerCtx] = makeCanvas(width, height);
    layerCtx.scale(width, width);
    layerCtx.fillStyle = typeof fill == "function" ? fill(layerCtx) : fill;
    draw(layerCtx);
    if (shade) {
      layerCtx.globalCompositeOperation = "source-atop";
      const sheen = layerCtx.createLinearGradient(0, 0, 0, aspect);
      sheen.addColorStop(0, "rgba(255,255,255,.07)");
      sheen.addColorStop(1, "rgba(0,0,0,.06)");
      layerCtx.fillStyle = sheen;
      layerCtx.fillRect(0, 0, 1, aspect);
    }
    ctx.save();
    ctx.shadowColor = `rgba(20,8,24,${0.22 + lift * 0.2})`;
    ctx.shadowBlur = width * (0.012 + lift * 0.014);
    ctx.shadowOffsetY = -width * 0.002;
    ctx.shadowOffsetX = width * 0.002;
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  };
  if (scene.orb) {
    const orb = scene.orb;
    if (!orb.moon) {
      for (let ring = 3; ring >= 1; ring--) {
        cutLayer(
          (cut) => {
            cut.beginPath();
            cut.arc(orb.x, orb.y, orb.r * (1 + ring * 0.45), 0, 7);
            cut.fill();
          },
          rgba(mixHex(colors.sky[2], colors.glow, 0.25 + 0.15 * (3 - ring)), 0.55),
          0.05,
        );
      }
    }
    cutLayer(
      (cut) => {
        cut.beginPath();
        cut.arc(orb.x, orb.y, orb.r, 0, 7);
        cut.fill();
        if (orb.crescent) {
          cut.globalCompositeOperation = "destination-out";
          cut.beginPath();
          cut.arc(orb.x + orb.r * 0.45, orb.y - orb.r * 0.2, orb.r * 0.9, 0, 7);
          cut.fill();
        }
      },
      colors.orb,
      0.2,
    );
  }
  for (const star of scene.stars) {
    ctx.fillStyle = rgba(colors.light, 0.4 + star.r * 200);
    ctx.beginPath();
    ctx.arc(star.x * width, star.y * width, star.r * width, 0, 7);
    ctx.fill();
  }
  for (const cloud of scene.clouds) {
    cutLayer((cut) => cut.fill(cloudPath(cloud)), mixHex(colors.sky[1], "#FFFFFF", 0.55), 0.15);
  }
  for (const layer of scene.layers) {
    if (layer.kind === "water") {
      for (let band = 0; band < 6; band++) {
        const t = band / 5;
        const top = scene.hz + (aspect - scene.hz) * (Math.pow(t, 1.5) * 0.9);
        const amp = 0.004 + 0.01 * t;
        const freq = 18 - t * 8;
        const phase = rand() * 6;
        cutLayer(
          (cut) => {
            cut.beginPath();
            cut.moveTo(-0.05, aspect + 0.05);
            cut.lineTo(-0.05, top);
            for (let step = 0; step <= 120; step++) {
              const x = -0.05 + (1.1 * step) / 120;
              cut.lineTo(x, top - Math.max(0, Math.sin(x * freq + phase)) * amp);
            }
            cut.lineTo(1.05, aspect + 0.05);
            cut.closePath();
            cut.fill();
          },
          mixHex(mixHex(colors.water, colors.sky[2], 0.35 * (1 - t)), colors.near, t * 0.55),
          0.1 + t * 0.3,
        );
        if (scene.orb && band < 4) {
          const orb = scene.orb;
          ctx.fillStyle = rgba(colors.glow, 0.45 - band * 0.08);
          ctx.beginPath();
          ctx.ellipse(
            orb.x * width,
            (top + 0.012 + t * 0.02) * width,
            orb.r * width * (1.1 - t * 0.5),
            width * 0.004,
            0,
            0,
            7,
          );
          ctx.fill();
        }
      }
      continue;
    }
    const color = hazeColor(colors, layer);
    cutLayer(
      (cut) => {
        cut.fill(layerPath(layer, aspect));
        if (layer.snow) {
          cut.save();
          cut.clip(layerPath(layer, aspect, false));
          cut.fillStyle = mixHex(colors.light, colors.sky[2], 0.2);
          cut.fill(snowPath(layer, aspect, noise));
          cut.restore();
        }
        if (layer.peaks.length) {
          cut.save();
          cut.clip(layerPath(layer, aspect, false));
          cut.fillStyle = "rgba(0,0,0,.1)";
          cut.fill(peaksPath(layer, aspect, rand, noise, scene.orb ? scene.orb.x > 0.5 : true));
          cut.restore();
        }
        if (layer.river) {
          cut.save();
          const river = new Path2D();
          tracePath(river, layer.river);
          cut.fillStyle = mixHex(colors.water, colors.sky[2], 0.3);
          cut.fill(river);
          cut.restore();
        }
        for (const win of layer.win) {
          cut.fillStyle = scene.night ? colors.accent : rgba(colors.light, 0.35);
          cut.fillRect(win[0], win[1], win[2], win[3]);
        }
      },
      color,
      layer.t,
    );
  }
  const boat = scene.boat;
  if (boat) {
    cutLayer((cut) => cut.fill(boatPath(boat)), colors.near, 0.6);
  }
  if (scene.lamp) {
    const lamp = scene.lamp;
    const glow = ctx.createRadialGradient(
      lamp.x * width,
      lamp.y * width,
      0,
      lamp.x * width,
      lamp.y * width,
      lamp.r * width * 7,
    );
    glow.addColorStop(0, rgba(colors.orb, 1));
    glow.addColorStop(0.18, rgba(colors.glow, 0.85));
    glow.addColorStop(1, rgba(colors.glow, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }
  for (const bird of scene.birds) {
    cutLayer((cut) => cut.fill(birdPath(bird)), colors.near, 0.5, false);
  }
  addGrain(ctx, width, height, 0.03, seed, 0.025, noise);
  vignette(ctx, width, height, 0.22);
}
/** A flat colour version of the scene, used as the source image the halftone screens sample from. */
function paintFlat(
  ctx: CanvasRenderingContext2D,
  width: number,
  scene: Scene,
  colors: Palette,
  rand: Rand,
  noise: Noise,
) {
  const aspect = scene.A;
  ctx.save();
  ctx.scale(width, width);
  ctx.fillStyle = skyGradient(ctx, scene, colors.sky);
  ctx.fillRect(0, 0, 1, aspect);
  for (const star of scene.stars) {
    ctx.fillStyle = colors.light;
    ctx.fillRect(star.x, star.y, star.r * 1.5, star.r * 1.5);
  }
  if (scene.orb) {
    const orb = scene.orb;
    if (!orb.moon) {
      const glow = ctx.createRadialGradient(orb.x, orb.y, orb.r, orb.x, orb.y, orb.r * 3.2);
      glow.addColorStop(0, rgba(colors.glow, 0.65));
      glow.addColorStop(1, rgba(colors.glow, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1, aspect);
    }
    ctx.fillStyle = colors.orb;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.r, 0, 7);
    ctx.fill();
    if (orb.crescent) {
      ctx.fillStyle = colors.sky[1];
      ctx.beginPath();
      ctx.arc(orb.x + orb.r * 0.45, orb.y - orb.r * 0.2, orb.r * 0.9, 0, 7);
      ctx.fill();
    }
  }
  for (const cloud of scene.clouds) {
    ctx.fillStyle = mixHex(colors.sky[1], "#FFFFFF", 0.5);
    ctx.fill(cloudPath(cloud));
  }
  for (const bird of scene.birds) {
    ctx.fillStyle = colors.near;
    ctx.fill(birdPath(bird));
  }
  const flip = scene.orb ? scene.orb.x > 0.5 : true;
  for (const layer of scene.layers) {
    if (layer.kind === "water") {
      const gradient = ctx.createLinearGradient(0, scene.hz, 0, aspect);
      gradient.addColorStop(0, mixHex(colors.water, colors.sky[2], 0.45));
      gradient.addColorStop(1, mixHex(colors.water, colors.near, 0.4));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scene.hz, 1, aspect - scene.hz);
      if (scene.orb) {
        for (let band = 0; band < 22; band++) {
          const t = band / 21;
          const y = scene.hz + 0.004 + (aspect - scene.hz) * Math.pow(t, 1.25);
          const bandWidth = scene.orb.r * (1.2 - t * 0.6) * between(rand, 0.4, 1.2);
          ctx.fillStyle = rgba(colors.orb, 0.85 - t * 0.4);
          ctx.fillRect(scene.orb.x - bandWidth / 2 + between(rand, -0.02, 0.02), y, bandWidth, 0.003 + t * 0.006);
        }
      }
      continue;
    }
    const silhouette = layerPath(layer, aspect);
    ctx.fillStyle = hazeColor(colors, layer);
    ctx.fill(silhouette);
    if (layer.peaks.length) {
      ctx.save();
      ctx.clip(layerPath(layer, aspect, false));
      ctx.fillStyle = rgba(colors.near, 0.28);
      ctx.fill(peaksPath(layer, aspect, rand, noise, flip));
      if (layer.snow) {
        ctx.fillStyle = mixHex(colors.light, colors.sky[2], 0.15);
        ctx.fill(snowPath(layer, aspect, noise));
      }
      ctx.restore();
    }
    if (layer.river) {
      const river = new Path2D();
      tracePath(river, layer.river);
      ctx.fillStyle = mixHex(colors.water, colors.sky[2], 0.4);
      ctx.fill(river);
    }
    for (const win of layer.win) {
      ctx.fillStyle = scene.night ? colors.accent : rgba(colors.light, 0.5);
      ctx.fillRect(win[0], win[1], win[2], win[3]);
    }
  }
  if (scene.boat) {
    ctx.fillStyle = colors.near;
    ctx.fill(boatPath(scene.boat));
  }
  if (scene.lamp) {
    const lamp = scene.lamp;
    const glow = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, lamp.r * 6);
    glow.addColorStop(0, colors.orb);
    glow.addColorStop(0.25, rgba(colors.glow, 0.8));
    glow.addColorStop(1, rgba(colors.glow, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(lamp.x - 0.1, lamp.y - 0.1, 0.2, 0.2);
  }
  ctx.restore();
}
/** Halftone poster: a small flat render is sampled through two rotated dot screens, a spot colour and a key ink. */
export function paintHalftone(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: Scene,
  colors: Palette,
  paletteKey: string,
  rand: Rand,
  noise: Noise,
  seed: number,
) {
  const aspect = scene.A;
  const sampleW = 240;
  const sampleH = Math.round(240 * aspect);
  const [, sampleCtx] = makeCanvas(sampleW, sampleH);
  paintFlat(sampleCtx, sampleW, scene, colors, seededRandom(seed + 5), noise);
  const pixels = sampleCtx.getImageData(0, 0, sampleW, sampleH).data;
  const sampleIndex = (x: number, y: number) =>
    (Math.max(0, Math.min(sampleH - 1, Math.floor((y / aspect) * sampleH))) * sampleW +
      Math.max(0, Math.min(sampleW - 1, Math.floor(x * sampleW)))) *
    4;
  const lightness = (x: number, y: number) => {
    const index = sampleIndex(x, y);
    return (0.3 * pixels[index] + 0.59 * pixels[index + 1] + 0.11 * pixels[index + 2]) / 255;
  };
  const paper = paletteKey === "mono" ? "#EFEBE3" : "#F4ECDD";
  const ink =
    paletteKey === "mono"
      ? "#141414"
      : paletteKey === "night" || paletteKey === "neon"
        ? "#1B1640"
        : mixHex(colors.near, "#101828", 0.35);
  const spot = paletteKey === "mono" ? "#8F8B84" : colors.accent;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  const margin = width * 0.055;
  const innerW = width - 2 * margin;
  const innerH = height - 2 * margin;
  ctx.save();
  ctx.beginPath();
  ctx.rect(margin, margin, innerW, innerH);
  ctx.clip();
  const dotScreen = (
    angle: number,
    pitch: number,
    color: string,
    coverageAt: (x: number, y: number) => number,
    blend: GlobalCompositeOperation,
  ) => {
    ctx.globalCompositeOperation = blend;
    ctx.fillStyle = color;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const reach = Math.hypot(innerW, innerH) / 2 + pitch;
    const cx = margin + innerW / 2;
    const cy = margin + innerH / 2;
    ctx.beginPath();
    for (let row = -reach; row <= reach; row += pitch) {
      for (let col = -reach; col <= reach; col += pitch) {
        const dotX = cx + col * cos - row * sin;
        const dotY = cy + col * sin + row * cos;
        if (
          dotX < margin - pitch ||
          dotX > margin + innerW + pitch ||
          dotY < margin - pitch ||
          dotY > margin + innerH + pitch
        ) {
          continue;
        }
        const coverage = Math.max(
          0,
          Math.min(1, coverageAt((dotX - margin) / innerW, ((dotY - margin) / innerH) * aspect)),
        );
        if (coverage < 0.04) {
          continue;
        }
        const radius = pitch * 0.5 * Math.sqrt(coverage) * 1.38;
        ctx.moveTo(dotX + radius, dotY);
        ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  };
  const orb = scene.orb;
  const warmth = (x: number, y: number) => {
    const index = sampleIndex(x, y);
    let value =
      Math.max(0, (pixels[index] - pixels[index + 2]) / 255) * 1.25 +
      Math.max(0, (pixels[index + 1] - pixels[index + 2]) / 255) * 0.35;
    if (orb && !orb.moon) {
      const dist = Math.hypot(x - orb.x, y - orb.y) / orb.r;
      value = Math.max(value, dist < 1 ? 1 : Math.max(0, 1 - (dist - 1) / 3.2) * 0.9);
    }
    if (y > scene.hz && scene.layers.some((layer) => layer.kind === "water") && orb) {
      const dist = Math.abs(x - orb.x) / (orb.r * 1.4);
      value = Math.max(value, Math.max(0, 1 - dist) * 0.8 * (1 - (y - scene.hz) / (aspect - scene.hz)));
    }
    return value;
  };
  dotScreen(0.26, width / 64, spot, warmth, "multiply");
  if (orb) {
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = spot;
    ctx.beginPath();
    ctx.arc(margin + orb.x * innerW, margin + (orb.y / aspect) * innerH, orb.r * innerW * 0.98, 0, 7);
    ctx.fill();
  }
  dotScreen(
    Math.PI / 4,
    width / 64,
    ink,
    (x: number, y: number) => {
      const light = lightness(x, y);
      return Math.pow(Math.max(0, 0.92 - light) / 0.92, 1.6) * 1.12;
    },
    "multiply",
  );
  ctx.restore();
  ctx.strokeStyle = rgba(ink, 0.55);
  ctx.lineWidth = Math.max(1, width * 0.0012);
  const tick = margin * 0.55;
  for (const [cx, cy, sx, sy] of [
    [margin, margin, -1, -1],
    [width - margin, margin, 1, -1],
    [margin, height - margin, -1, 1],
    [width - margin, height - margin, 1, 1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx + sx * margin * 0.15, cy);
    ctx.lineTo(cx + sx * tick, cy);
    ctx.moveTo(cx, cy + sy * margin * 0.15);
    ctx.lineTo(cx, cy + sy * tick);
    ctx.stroke();
  }
  const swatch = margin * 0.32;
  [spot, ink, mixHex(spot, ink, 0.5)].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(width - margin - (i + 1) * swatch * 1.3, height - margin + margin * 0.34, swatch, swatch);
  });
  addGrain(ctx, width, height, 0.04, seed, 0.03, noise);
}
/** Background and four shape colours per palette. */
const BAUHAUS_PALETTES: Record<string, { bg: string; c: string[] }> = {
  dusk: {
    bg: "#F1E7DA",
    c: ["#E0614B", "#3B2E5A", "#F2B66B", "#C68DA6"],
  },
  dawn: {
    bg: "#F5EFE6",
    c: ["#EF8865", "#6C7FB5", "#F2CB78", "#2F2B45"],
  },
  neon: {
    bg: "#0E0A1E",
    c: ["#FF3D8B", "#2CF6E1", "#FFD23F", "#7B2DBA"],
  },
  pastel: {
    bg: "#FAF5EE",
    c: ["#F2A29C", "#9EC1E0", "#F6D98B", "#56648A"],
  },
  mono: {
    bg: "#ECE8E0",
    c: ["#161616", "#8C8984", "#161616", "#C9C4BA"],
  },
  warm: {
    bg: "#F4EADB",
    c: ["#D9481F", "#F2A03D", "#6E2617", "#1E1410"],
  },
  cold: {
    bg: "#EAF0F2",
    c: ["#1F4E9C", "#69A7D8", "#0E2236", "#E3B04B"],
  },
  night: {
    bg: "#0D1222",
    c: ["#F2C14E", "#3D5A9E", "#E9E4D4", "#7C2E3E"],
  },
  autumn: {
    bg: "#F2E5D0",
    c: ["#C6412A", "#E59A3C", "#38190F", "#7C8B5A"],
  },
  verdant: {
    bg: "#F0EDE1",
    c: ["#2F6B4F", "#E0773F", "#F2C14E", "#14271F"],
  },
  ocean: {
    bg: "#EEF1EC",
    c: ["#11507A", "#E8833A", "#69B3C9", "#0A2233"],
  },
};
/** Bauhaus grid: a modular grid of rotated primary motifs around one larger hero tile that hints at the subject. */
export function paintBauhaus(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: Scene,
  paletteKey: string,
  rand: Rand,
  noise: Noise,
  seed: number,
) {
  const aspect = scene.A;
  const palette = BAUHAUS_PALETTES[paletteKey];
  const cols = aspect >= 0.9 ? 4 : 6;
  const margin = 0.07;
  const cell = (1 - 2 * margin) / cols;
  const rows = Math.floor((aspect - 2 * margin) / cell);
  const top = (aspect - rows * cell) / 2;
  ctx.save();
  ctx.scale(width, width);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, 1, aspect);
  const grid = Array.from(
    {
      length: rows,
    },
    () => Array(cols).fill(null),
  );
  const subjects = scene.subjects;
  const heroSpan = rows >= 6 && cols >= 4 ? 3 : 2;
  const heroCol = Math.floor(rand() * (cols - heroSpan + 1));
  const heroRow = Math.floor(rand() * Math.max(1, rows - heroSpan - 0));
  const colX = (col: number) => margin + col * cell;
  const rowY = (row: number) => top + row * cell;
  const otherColor = (...avoid: (string | null)[]) => {
    const choices = palette.c.filter((color) => !avoid.includes(color));
    return pick(rand, choices.length ? choices : palette.c);
  };
  /** One grid cell: a background square plus one of ten motifs, turned by quarter turns. */
  const tile = (x: number, y: number, size: number, bg: string, motif: number, turns: number, fg: string) => {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate((turns * Math.PI) / 2);
    ctx.translate(-size / 2, -size / 2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = fg;
    ctx.strokeStyle = fg;
    switch (motif) {
      case 0:
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.4, 0, 7);
        ctx.fill();
        break;
      case 1:
        ctx.beginPath();
        ctx.arc(size / 2, size, size / 2, Math.PI, 0);
        ctx.fill();
        break;
      case 2:
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.arc(0, size, size, -Math.PI / 2, 0);
        ctx.closePath();
        ctx.fill();
        break;
      case 3:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.closePath();
        ctx.fill();
        break;
      case 4:
        for (let stripe = 0; stripe < 4; stripe++) {
          ctx.fillRect(0, (stripe * size) / 4, size, size / 8);
        }
        break;
      case 5:
        ctx.lineWidth = size * 0.07;
        for (let ring = 1; ring <= 3; ring++) {
          ctx.beginPath();
          ctx.arc(0, size, (size * ring) / 3.2, -Math.PI / 2, 0);
          ctx.stroke();
        }
        break;
      case 6:
        ctx.fillRect(0, size * 0.45, size, size * 0.55);
        ctx.beginPath();
        ctx.arc(size / 2, size * 0.45, size / 2, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = bg;
        ctx.fillRect(size * 0.3, size * 0.55, size * 0.4, size * 0.45);
        ctx.beginPath();
        ctx.arc(size / 2, size * 0.55, size * 0.2, Math.PI, 0);
        ctx.fill();
        break;
      case 7:
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.14, 0, 7);
        ctx.fill();
        break;
      case 8:
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.arc(0, size, size, -Math.PI / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.arc(size, 0, size * 0.5, Math.PI / 2, Math.PI);
        ctx.closePath();
        ctx.fill();
        break;
      case 9:
        ctx.fillRect(size * 0.42, 0, size * 0.16, size);
        break;
    }
    ctx.restore();
  };
  const fills = [palette.bg, palette.bg, palette.bg, ...palette.c];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (col >= heroCol && col < heroCol + heroSpan && row >= heroRow && row < heroRow + heroSpan) {
        continue;
      }
      const left = col > 0 ? grid[row][col - 1] : null;
      const above = row > 0 ? grid[row - 1][col] : null;
      let fill = pick(rand, fills);
      let tries = 0;
      for (; (fill === left || fill === above) && fill !== palette.bg && tries++ < 8;) {
        fill = pick(rand, fills);
      }
      grid[row][col] = fill;
      const motif = Math.floor(rand() * 11);
      const fg = otherColor(fill, fill === palette.bg ? null : palette.bg);
      tile(colX(col), rowY(row), cell, fill, motif, Math.floor(rand() * 4), motif === 10 ? fill : fg);
    }
  }
  const heroSize = cell * heroSpan;
  const heroX = colX(heroCol);
  const heroY = rowY(heroRow);
  const heroBg = pick(rand, palette.c);
  const heroFg = otherColor(heroBg);
  const heroAccent = otherColor(heroBg, heroFg);
  ctx.save();
  ctx.beginPath();
  ctx.rect(heroX, heroY, heroSize, heroSize);
  ctx.clip();
  ctx.fillStyle = heroBg;
  ctx.fillRect(heroX, heroY, heroSize, heroSize);
  if (subjects.has("sea") || subjects.has("river")) {
    ctx.fillStyle = heroFg;
    ctx.beginPath();
    ctx.arc(heroX + heroSize * 0.5, heroY + heroSize * 0.42, heroSize * 0.24, 0, 7);
    ctx.fill();
    ctx.fillStyle = heroAccent;
    for (let wave = 0; wave < 4; wave++) {
      const waveY = heroY + heroSize * (0.58 + wave * 0.11);
      ctx.beginPath();
      ctx.moveTo(heroX, waveY + heroSize);
      for (let step = 0; step <= 40; step++) {
        const x = heroX + (heroSize * step) / 40;
        ctx.lineTo(x, waveY + Math.sin((step / 40) * Math.PI * 4 + wave) * heroSize * 0.025);
      }
      ctx.lineTo(heroX + heroSize, waveY + heroSize);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = wave % 2 ? heroAccent : heroBg;
    }
  } else if (subjects.has("mountain") || subjects.has("snow") || subjects.has("desert")) {
    ctx.fillStyle = heroAccent;
    ctx.beginPath();
    ctx.arc(heroX + heroSize * 0.72, heroY + heroSize * 0.3, heroSize * 0.14, 0, 7);
    ctx.fill();
    ctx.fillStyle = heroFg;
    ctx.beginPath();
    ctx.moveTo(heroX - heroSize * 0.1, heroY + heroSize);
    ctx.lineTo(heroX + heroSize * 0.38, heroY + heroSize * 0.28);
    ctx.lineTo(heroX + heroSize * 0.86, heroY + heroSize);
    ctx.fill();
    ctx.fillStyle = palette.bg;
    ctx.beginPath();
    ctx.moveTo(heroX + heroSize * 0.4, heroY + heroSize);
    ctx.lineTo(heroX + heroSize * 0.75, heroY + heroSize * 0.5);
    ctx.lineTo(heroX + heroSize * 1.1, heroY + heroSize);
    ctx.fill();
  } else if (subjects.has("city")) {
    for (let bar = 0; bar < 5; bar++) {
      ctx.fillStyle = bar % 2 ? heroFg : heroAccent;
      const barH = heroSize * between(rand, 0.35, 0.9);
      ctx.fillRect(
        heroX + (heroSize * bar) / 5 + heroSize * 0.02,
        heroY + heroSize - barH,
        heroSize / 5 - heroSize * 0.04,
        barH,
      );
    }
    ctx.fillStyle = palette.bg;
    ctx.beginPath();
    ctx.arc(heroX + heroSize * 0.78, heroY + heroSize * 0.2, heroSize * 0.08, 0, 7);
    ctx.fill();
  } else if (subjects.has("plant") || subjects.has("forest")) {
    ctx.fillStyle = heroFg;
    ctx.beginPath();
    ctx.moveTo(heroX + heroSize * 0.5, heroY + heroSize * 0.08);
    ctx.quadraticCurveTo(
      heroX + heroSize * 0.95,
      heroY + heroSize * 0.5,
      heroX + heroSize * 0.5,
      heroY + heroSize * 0.92,
    );
    ctx.quadraticCurveTo(
      heroX + heroSize * 0.05,
      heroY + heroSize * 0.5,
      heroX + heroSize * 0.5,
      heroY + heroSize * 0.08,
    );
    ctx.fill();
    ctx.strokeStyle = heroBg;
    ctx.lineWidth = heroSize * 0.025;
    ctx.beginPath();
    ctx.moveTo(heroX + heroSize * 0.5, heroY + heroSize * 0.15);
    ctx.lineTo(heroX + heroSize * 0.5, heroY + heroSize);
    ctx.stroke();
  } else if (subjects.has("bird")) {
    ctx.fillStyle = heroFg;
    ctx.beginPath();
    ctx.moveTo(heroX + heroSize * 0.5, heroY + heroSize * 0.6);
    ctx.arc(heroX + heroSize * 0.5, heroY + heroSize * 0.6, heroSize * 0.42, Math.PI, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = heroAccent;
    ctx.beginPath();
    ctx.moveTo(heroX + heroSize * 0.5, heroY + heroSize * 0.6);
    ctx.arc(heroX + heroSize * 0.5, heroY + heroSize * 0.6, heroSize * 0.42, -Math.PI / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = heroFg;
    ctx.beginPath();
    ctx.arc(heroX + heroSize * 0.5, heroY + heroSize * 0.6, heroSize * 0.07, 0, 7);
    ctx.fill();
  } else {
    const night = scene.night || subjects.has("moon");
    ctx.fillStyle = heroFg;
    ctx.beginPath();
    ctx.arc(heroX + heroSize / 2, heroY + heroSize / 2, heroSize * 0.4, 0, 7);
    ctx.fill();
    if (night) {
      ctx.fillStyle = heroBg;
      ctx.beginPath();
      ctx.arc(heroX + heroSize * 0.64, heroY + heroSize * 0.42, heroSize * 0.34, 0, 7);
      ctx.fill();
    } else {
      ctx.fillStyle = heroAccent;
      ctx.fillRect(heroX, heroY + heroSize * 0.5, heroSize, heroSize * 0.5);
      for (let stripe = 0; stripe < 3; stripe++) {
        ctx.fillStyle = stripe % 2 ? heroAccent : heroBg;
        ctx.fillRect(
          heroX + heroSize * 0.1,
          heroY + heroSize * (0.56 + stripe * 0.1),
          heroSize * 0.8,
          heroSize * 0.045,
        );
      }
    }
  }
  ctx.restore();
  ctx.strokeStyle = rgba(paletteKey === "neon" || paletteKey === "night" ? "#FFFFFF" : "#000000", 0.12);
  ctx.lineWidth = 1 / width;
  for (let col = 0; col <= cols; col++) {
    ctx.beginPath();
    ctx.moveTo(colX(col), top - 0.02);
    ctx.lineTo(colX(col), top + rows * cell + 0.02);
    ctx.stroke();
  }
  for (let row = 0; row <= rows; row++) {
    ctx.beginPath();
    ctx.moveTo(margin - 0.02, rowY(row));
    ctx.lineTo(1 - margin + 0.02, rowY(row));
    ctx.stroke();
  }
  ctx.restore();
  addGrain(ctx, width, height, 0.045, seed, 0.035, noise);
}
