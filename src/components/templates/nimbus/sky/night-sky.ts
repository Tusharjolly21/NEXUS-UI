import { STAR_CATALOG, STAR_STRIDE } from "../data/stars";
import { MILKY_WAY_LEVELS } from "../data/milky-way";
import { clamp01, createRng, DEG, fbm, smoothstep, TAU } from "./noise";
import type { Point } from "./types";

/**
 * Builds tonight's sky over Amsterdam: real star positions from the catalogue, the Milky Way, faint dust
 * stars and the radiant of the meteor shower for this month. The result is drawn once into a canvas
 * ("base"); the brightest stars are kept as a list so the renderer can twinkle them.
 */

/** The observer: Amsterdam. */
const OBSERVER = { lat: 52.37, lon: 4.9 };
/** The sky is shown as it looks at 21:00 UTC on the current date (about 22:00 in Amsterdam in winter). */
const SKY_HOUR_UTC = 21;

type Vec3 = [number, number, number];


export type SkyStar = {
  x: number;
  y: number;
  /** Apparent magnitude after atmospheric extinction (lower is brighter). */
  mag: number;
  /** Relative airmass: how much atmosphere the light crosses. Stars near the horizon twinkle more. */
  air: number;
  col: Vec3;
  /** Phase offset for the twinkle noise. */
  seed: number;
};

export type NightSky = {
  /** Stars brighter than magnitude 3.2 are drawn live (they twinkle); the rest are baked into `base`. */
  stars: SkyStar[];
  base: HTMLCanvasElement;
  /** Where the month's meteor shower appears to start, in screen pixels, or null if it is below the horizon. */
  radiant: Point | null;
};

function tonight() {
  const date = new Date();
  date.setUTCHours(SKY_HOUR_UTC, 0, 0, 0);
  return date;
}

/** Local sidereal time in degrees: which right ascension is on the meridian right now. */
function siderealTime(date: Date, longitude: number) {
  const julianDay = date.getTime() / 86400000 + 2440587.5;
  const degrees = 280.46061837 + 360.98564736629 * (julianDay - 2451545) + longitude;
  return ((degrees % 360) + 360) % 360;
}

/** Right ascension and declination (degrees) to a unit vector in the observer's frame: east, north, up. */
function toLocalVector(ra: number, dec: number, siderealDeg: number): Vec3 {
  const hourAngle = (siderealDeg - ra) * DEG;
  const d = dec * DEG;
  const lat = OBSERVER.lat * DEG;
  return [
    -Math.cos(d) * Math.sin(hourAngle),
    Math.sin(d) * Math.cos(lat) - Math.cos(d) * Math.cos(hourAngle) * Math.sin(lat),
    Math.sin(d) * Math.sin(lat) + Math.cos(d) * Math.cos(hourAngle) * Math.cos(lat),
  ];
}

/** Star colour from its B-V index: blue-white for hot stars, through white and yellow to orange for cool ones. */
const COLOR_RAMP: [number, Vec3][] = [
  [-0.33, [162, 184, 255]],
  [0, [214, 224, 255]],
  [0.3, [244, 244, 255]],
  [0.6, [255, 246, 232]],
  [1, [255, 222, 186]],
  [1.4, [255, 200, 150]],
  [2, [255, 180, 120]],
];

function colorFromIndex(bv: number): Vec3 {
  for (let i = 1; i < COLOR_RAMP.length; i++) {
    if (bv <= COLOR_RAMP[i][0]) {
      const [x0, c0] = COLOR_RAMP[i - 1];
      const [x1, c1] = COLOR_RAMP[i];
      const t = clamp01((bv - x0) / (x1 - x0));
      return [0, 1, 2].map((k) => c0[k] + (c1[k] - c0[k]) * t) as Vec3;
    }
  }
  return COLOR_RAMP[COLOR_RAMP.length - 1][1];
}

/** Radiants of the big showers by month (0 = January): Quadrantids, Perseids, Leonids, Geminids. [ra, dec] in degrees. */
const METEOR_RADIANTS: Record<number, Point> = { 0: [230, 49], 7: [48, 58], 10: [153, 22], 11: [112, 33] };

type Camera = { forward: Vec3; right: Vec3; up: Vec3 };

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * @param width   canvas width in CSS pixels
 * @param height  canvas height in CSS pixels
 * @param dpr     pixel ratio the base canvas is baked at
 * @param density 0..1+ how many stars to show (small widgets pass less)
 */
export function buildNightSky(width: number, height: number, dpr: number, density: number): NightSky {
  const random = createRng(7);
  const date = tonight();
  const sidereal = siderealTime(date, OBSERVER.lon);

  // Wide landscape screens look lower and wider than tall phone screens.
  const landscape = width > height * 1.1;
  const fov = (landscape ? 112 : 84) * DEG;
  const pitch = (landscape ? 36 : 42) * DEG;
  const focal = width / 2 / Math.tan(fov / 4);
  const centerY = height * 0.5;

  const starCount = STAR_CATALOG.length / STAR_STRIDE;
  const local: Vec3[] = [];
  for (let i = 0; i < starCount; i++) local.push(toLocalVector(STAR_CATALOG[i * STAR_STRIDE], STAR_CATALOG[i * STAR_STRIDE + 1], sidereal));
  const magnitudeOf = (i: number) => STAR_CATALOG[i * STAR_STRIDE + 2];
  const colorIndexOf = (i: number) => STAR_CATALOG[i * STAR_STRIDE + 3];

  /** A camera looking toward `azimuth` (radians) and tilted up by `pitch`. */
  const cameraAt = (azimuth: number): Camera => {
    const forward: Vec3 = [Math.sin(azimuth) * Math.cos(pitch), Math.cos(azimuth) * Math.cos(pitch), Math.sin(pitch)];
    const right: Vec3 = [Math.cos(azimuth), -Math.sin(azimuth), 0];
    const up: Vec3 = [
      right[1] * forward[2] - right[2] * forward[1],
      right[2] * forward[0] - right[0] * forward[2],
      right[0] * forward[1] - right[1] * forward[0],
    ];
    return { forward, right, up };
  };

  /** Stereographic projection to screen pixels. Points behind the camera give null unless `keepBehind` is set. */
  const project = (v: Vec3, camera: Camera, keepBehind = false): Point | null => {
    let z = 1 + v[0] * camera.forward[0] + v[1] * camera.forward[1] + v[2] * camera.forward[2];
    if (z < 0.25) {
      if (!keepBehind) return null;
      z = Math.max(z, 0.04);
    }
    return [
      width / 2 + (focal * (v[0] * camera.right[0] + v[1] * camera.right[1] + v[2] * camera.right[2])) / z,
      centerY - (focal * (v[0] * camera.up[0] + v[1] * camera.up[1] + v[2] * camera.up[2])) / z,
    ];
  };
  const onScreen = (p: Point | null, margin = 0): p is Point => !!p && p[0] > -margin && p[0] < width + margin && p[1] > -margin && p[1] < height + margin;

  // Pick the compass direction that frames the most light: bright stars and Milky Way.
  let bestScore = 0;
  let bestAzimuth = Math.PI;
  for (let deg = 0; deg < 360; deg += 15) {
    const camera = cameraAt(deg * DEG);
    let score = 0;
    for (let i = 0; i < starCount; i++) {
      if (local[i][2] < 0.05 || magnitudeOf(i) > 3.5) continue;
      if (onScreen(project(local[i], camera))) score += Math.pow(10, -0.4 * magnitudeOf(i));
    }
    for (let level = 2; level < 5; level++) {
      for (const line of MILKY_WAY_LEVELS[level]) {
        for (let k = 0; k < line.length; k += 8) {
          const v = toLocalVector(line[k], line[k + 1], sidereal);
          if (v[2] < 0.1) continue;
          if (onScreen(project(v, camera))) score += 0.05 * level;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestAzimuth = deg * DEG;
    }
  }
  const camera = cameraAt(bestAzimuth);

  // The stars that are above the horizon, on screen and bright enough once the atmosphere has dimmed them.
  const limitingMagnitude = 5.8 - (1 - density) * 1.6;
  const stars: SkyStar[] = [];
  for (let i = 0; i < starCount; i++) {
    const v = local[i];
    const altitude = Math.asin(v[2]);
    if (altitude < 1.5 * DEG) continue;
    const p = project(v, camera);
    if (!onScreen(p, 4)) continue;
    const airmass = Math.min(12, 1 / Math.max(Math.sin(altitude), 0.05));
    const mag = magnitudeOf(i) + 0.3 * (airmass - 1);
    if (mag > limitingMagnitude) continue;
    const raw = colorFromIndex(colorIndexOf(i) + (airmass - 1) * 0.06);
    const gray = (raw[0] + raw[1] + raw[2]) / 3;
    const saturation = 0.55;
    stars.push({
      x: p[0],
      y: p[1],
      mag,
      air: airmass,
      col: [gray + (raw[0] - gray) * saturation, gray + (raw[1] - gray) * saturation, gray + (raw[2] - gray) * saturation],
      seed: i * 7.31,
    });
  }

  // Layer 1: the faint stars, baked once.
  const starLayer = createCanvas(Math.round(width * dpr), Math.round(height * dpr));
  const starCtx = starLayer.getContext("2d")!;
  starCtx.scale(dpr, dpr);
  for (const star of stars) {
    if (star.mag <= 3.2) continue;
    starCtx.globalAlpha = clamp01(0.34 + (5.9 - star.mag) * 0.24);
    starCtx.fillStyle = `rgb(${star.col.map(Math.round).join(",")})`;
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, 0.6 + Math.max(0, 4.6 - star.mag) * 0.28, 0, TAU);
    starCtx.fill();
  }

  // Layer 2: the Milky Way. Draw the brightness contours, blur them, then eat holes with dust-lane noise.
  const scale = 0.5;
  const milkyWay = createCanvas(Math.max(2, Math.round(width * scale)), Math.max(2, Math.round(height * scale)));
  const contours = createCanvas(milkyWay.width, milkyWay.height);
  const contourCtx = contours.getContext("2d")!;
  contourCtx.scale(scale, scale);
  MILKY_WAY_LEVELS.forEach((level, index) => {
    const path = new Path2D();
    for (const line of level) {
      let first = true;
      for (let k = 0; k < line.length; k += 2) {
        const p = project(toLocalVector(line[k], line[k + 1], sidereal), camera, true);
        if (!p) continue;
        if (first) {
          path.moveTo(p[0], p[1]);
          first = false;
        } else {
          path.lineTo(p[0], p[1]);
        }
      }
      path.closePath();
    }
    contourCtx.fillStyle = `rgba(214,222,245,${0.05 + index * 0.018})`;
    contourCtx.fill(path, "evenodd");
  });
  const milkyCtx = milkyWay.getContext("2d")!;
  milkyCtx.filter = `blur(${Math.max(3, width * scale * 0.008)}px)`;
  milkyCtx.drawImage(contours, 0, 0);
  milkyCtx.filter = "none";

  const maskWidth = Math.max(8, Math.round(milkyWay.width / 3));
  const maskHeight = Math.max(8, Math.round(milkyWay.height / 3));
  const mask = createCanvas(maskWidth, maskHeight);
  const maskCtx = mask.getContext("2d")!;
  const maskImage = maskCtx.createImageData(maskWidth, maskHeight);
  for (let y = 0; y < maskHeight; y++) {
    for (let x = 0; x < maskWidth; x++) {
      const cloudiness = fbm((x / maskWidth) * 9, (y / maskHeight) * 9 * (height / width), 5);
      const dustLane = smoothstep(0.52, 0.66, fbm((x / maskWidth) * 16 + 5, (y / maskHeight) * 16 * (height / width), 4));
      maskImage.data[(y * maskWidth + x) * 4 + 3] = 255 * clamp01(0.35 + cloudiness * 0.9 - dustLane * 0.55);
    }
  }
  maskCtx.putImageData(maskImage, 0, 0);
  milkyCtx.globalCompositeOperation = "destination-in";
  milkyCtx.imageSmoothingQuality = "high";
  milkyCtx.drawImage(mask, 0, 0, milkyWay.width, milkyWay.height);
  milkyCtx.globalCompositeOperation = "source-over";

  // Dust: many tiny stars, thickest where the Milky Way is.
  {
    const alpha = milkyCtx.getImageData(0, 0, milkyWay.width, milkyWay.height).data;
    const count = Math.round(((width * height) / 520) * density);
    for (let n = 0; n < count; n++) {
      const x = random() * width;
      const y = random() * height;
      const index = (Math.min(milkyWay.height - 1, Math.floor(y * scale)) * milkyWay.width + Math.min(milkyWay.width - 1, Math.floor(x * scale))) * 4 + 3;
      const milky = alpha[index] / 255;
      if (random() > 0.22 + milky * 6) continue;
      const fromHorizon = 1 - y / height;
      starCtx.globalAlpha = (0.14 + random() * 0.36) * (0.45 + 0.55 * fromHorizon);
      const tint = random();
      starCtx.fillStyle = tint < 0.25 ? "rgb(205,215,255)" : tint > 0.85 ? "rgb(255,232,210)" : "#fff";
      starCtx.beginPath();
      starCtx.arc(x, y, 0.38 + random() * 0.4, 0, TAU);
      starCtx.fill();
    }
  }

  // The meteor shower of the month, if its radiant is up and roughly in view.
  const radiantCoords = METEOR_RADIANTS[date.getUTCMonth()];
  let radiant: Point | null = null;
  if (radiantCoords) {
    const v = toLocalVector(radiantCoords[0], radiantCoords[1], sidereal);
    if (v[2] > -0.15) radiant = project(v, camera, true);
  }

  // Compose: a warm glow at the horizon, the Milky Way, then the stars.
  const base = createCanvas(starLayer.width, starLayer.height);
  const baseCtx = base.getContext("2d")!;
  baseCtx.scale(dpr, dpr);
  const horizon = baseCtx.createLinearGradient(0, height, 0, height * 0.55);
  horizon.addColorStop(0, "rgba(255,170,120,.07)");
  horizon.addColorStop(1, "rgba(255,170,120,0)");
  baseCtx.fillStyle = horizon;
  baseCtx.fillRect(0, height * 0.55, width, height * 0.45);
  baseCtx.globalAlpha = 0.95;
  baseCtx.imageSmoothingQuality = "high";
  baseCtx.drawImage(milkyWay, 0, 0, width, height);
  baseCtx.globalAlpha = 1;
  baseCtx.drawImage(starLayer, 0, 0, width, height);

  return { stars, base, radiant };
}
