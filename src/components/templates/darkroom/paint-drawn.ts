import { hexToRgb, mixHex, rgbToHex, rgba } from "./color";
import {
  addGrain,
  birdPath,
  boatPath,
  cloudPath,
  hazeColor,
  layerPath,
  makeCanvas,
  peaksPath,
  scratches,
  snowPath,
  tracePath,
} from "./paint-kit";
import type { Palette } from "./prompt";
import { between, lerp, pick, type Noise, type Rand } from "./random";
import { heightAt, type Point, type Scene } from "./scene";

/**
 * The "drawn" styles: cyanotype, topographic contour, gradient mesh, pixel art and ink wash.
 * Every painter is fully deterministic for a seed.
 */
/**
 * Cyanotype: pressed plants laid on a brushed sheet of Prussian blue. The plants are drawn white on their own
 * layer, softened, and printed back through the sheet mask, so the blue only shows where the sheet was coated.
 */
export function paintCyanotype(
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
  const subjects = scene.subjects;
  const sepia = paletteKey === "warm" || paletteKey === "autumn" || paletteKey === "mono";
  const deep = sepia ? (paletteKey === "mono" ? "#22252B" : "#3B2A35") : "#123063";
  const mid = sepia ? (paletteKey === "mono" ? "#3A3F47" : "#5A4050") : "#1F4E8C";
  const paper = "#F2EEE4";
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.scale(width, width);
  scratches(ctx, width, rand, aspect, "#8A7A60", 220);
  ctx.restore();
  const [maskCanvas, mask] = makeCanvas(width, height);
  mask.scale(width, width);
  const inset = 0.075;
  const edge: Point[] = [];
  /** One side of the coated sheet, with a ragged brushed edge pushed out along its normal. */
  const brushEdge = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) => {
    for (let step = 0; step < 90; step++) {
      const t = step / 90;
      const wobble = noise.fbm(t * 7 + x0 * 3 + y0 * 5, 7.7, 4) * 0.022 + (rand() - 0.5) * 0.004;
      edge.push([lerp(x0, x1, t) + nx * wobble, lerp(y0, y1, t) + ny * wobble]);
    }
  };
  brushEdge(inset, inset, 1 - inset, inset, 0, -1);
  brushEdge(1 - inset, inset, 1 - inset, aspect - inset, 1, 0);
  brushEdge(1 - inset, aspect - inset, inset, aspect - inset, 0, 1);
  brushEdge(inset, aspect - inset, inset, inset, -1, 0);
  const sheet = new Path2D();
  tracePath(sheet, edge);
  mask.fillStyle = "#fff";
  mask.fill(sheet);
  mask.lineCap = "round";
  for (let stroke = 0; stroke < 26; stroke++) {
    const atTop = rand() < 0.5;
    const y = atTop ? inset + between(rand, -0.01, 0.01) : aspect - inset + between(rand, -0.01, 0.01);
    const x = between(rand, inset, 1 - inset);
    mask.strokeStyle = `rgba(255,255,255,${between(rand, 0.3, 0.8)})`;
    mask.lineWidth = between(rand, 0.002, 0.008);
    mask.beginPath();
    mask.moveTo(x, y);
    mask.lineTo(x + between(rand, 0.03, 0.12), y + between(rand, -0.006, 0.006));
    mask.stroke();
  }
  const [blueCanvas, blue] = makeCanvas(width, height);
  const gradient = blue.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, mid);
  gradient.addColorStop(1, deep);
  blue.fillStyle = gradient;
  blue.fillRect(0, 0, width, height);
  const [mottleCanvas, mottle] = makeCanvas(40, Math.ceil(40 * aspect));
  const image = mottle.createImageData(mottleCanvas.width, mottleCanvas.height);
  for (let row = 0; row < mottleCanvas.height; row++) {
    for (let col = 0; col < mottleCanvas.width; col++) {
      const n = noise.fbm(col / 7, row / 7 + 20, 4);
      const index = (row * mottleCanvas.width + col) * 4;
      const rgb = n > 0 ? hexToRgb(mid) : hexToRgb(deep);
      image.data[index] = rgb[0];
      image.data[index + 1] = rgb[1];
      image.data[index + 2] = rgb[2];
      image.data[index + 3] = Math.min(255, Math.abs(n) * 420);
    }
  }
  mottle.putImageData(image, 0, 0);
  blue.imageSmoothingQuality = "high";
  blue.drawImage(mottleCanvas, 0, 0, width, height);
  blue.globalCompositeOperation = "destination-in";
  blue.drawImage(maskCanvas, 0, 0);
  ctx.drawImage(blueCanvas, 0, 0);
  const [plantCanvas, plant] = makeCanvas(width, height);
  plant.scale(width, width);
  plant.lineCap = "round";
  plant.lineJoin = "round";
  /** A leaf blade from (x, y) along angle; lobes scallops its edge, and a darker midrib is cut out of it. */
  const blade = (x: number, y: number, angle: number, length: number, thickness: number, lobes = 0, alpha = 0.9) => {
    plant.save();
    plant.translate(x, y);
    plant.rotate(angle);
    plant.fillStyle = `rgba(255,255,255,${alpha})`;
    plant.beginPath();
    plant.moveTo(0, 0);
    const steps = 24;
    const upper: Point[] = [];
    const lower: Point[] = [];
    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      let half = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.9) * thickness;
      if (lobes) {
        half *= 0.72 + 0.28 * Math.abs(Math.sin(t * Math.PI * lobes));
      }
      upper.push([t * length, -half + Math.sin(t * Math.PI) * thickness * 0.25]);
      lower.push([t * length, half + Math.sin(t * Math.PI) * thickness * 0.25]);
    }
    for (const point of upper) {
      plant.lineTo(point[0], point[1]);
    }
    for (let index = lower.length - 1; index >= 0; index--) {
      plant.lineTo(lower[index][0], lower[index][1]);
    }
    plant.closePath();
    plant.fill();
    plant.globalCompositeOperation = "destination-out";
    plant.strokeStyle = "rgba(0,0,0,.18)";
    plant.lineWidth = thickness * 0.07;
    plant.beginPath();
    plant.moveTo(length * 0.05, 0);
    plant.quadraticCurveTo(length * 0.5, thickness * 0.22, length * 0.92, thickness * 0.05);
    plant.stroke();
    plant.restore();
  };
  /** A stroked stem that tapers from one width to another. */
  const stem = (points: Point[], from: number, to: number, alpha = 0.95) => {
    plant.strokeStyle = `rgba(255,255,255,${alpha})`;
    for (let index = 1; index < points.length; index++) {
      plant.lineWidth = lerp(from, to, index / points.length);
      plant.beginPath();
      plant.moveTo(points[index - 1][0], points[index - 1][1]);
      plant.lineTo(points[index][0], points[index][1]);
      plant.stroke();
    }
  };
  /** Points along a gently bending line: the spine every plant is built on. */
  const curve = (x: number, y: number, angle: number, length: number, bend: number, steps = 40) => {
    const points: Point[] = [];
    let heading = angle;
    let px = x;
    let py = y;
    for (let step = 0; step <= steps; step++) {
      points.push([px, py]);
      heading += bend / steps;
      px += Math.cos(heading) * (length / steps);
      py += Math.sin(heading) * (length / steps);
    }
    return points;
  };
  const fern = (x: number, y: number, angle: number, length: number) => {
    const spine = curve(x, y, angle, length, between(rand, -0.6, 0.6));
    stem(spine, 0.007, 0.0015);
    for (let index = 4; index < spine.length - 1; index += 2) {
      const t = index / spine.length;
      const [ax, ay] = spine[index];
      const [bx, by] = spine[index + 1];
      const heading = Math.atan2(by - ay, bx - ax);
      const frond = length * 0.22 * Math.sin(Math.PI * Math.pow(1 - t, 0.7)) * (1 - t * 0.35) + 0.008;
      for (const side of [-1, 1]) {
        blade(
          ax,
          ay,
          heading + side * (1 - t * 0.35),
          frond,
          frond * 0.13,
          4 + Math.floor(frond * 50),
          between(rand, 0.8, 0.95),
        );
      }
    }
  };
  const umbel = (x: number, y: number, angle: number, length: number) => {
    const stemLength = length * 0.74;
    const spine = curve(x, y, angle, stemLength, between(rand, -0.3, 0.3));
    stem(spine, 0.006, 0.004);
    const [hubX, hubY] = spine[spine.length - 1];
    const spokes = 14;
    const spokeLength = stemLength * 0.28;
    for (let spoke = 0; spoke < spokes; spoke++) {
      const spokeAngle = angle + (spoke / (spokes - 1) - 0.5) * 2.2;
      const tipX = hubX + Math.cos(spokeAngle) * spokeLength;
      const tipY = hubY + Math.sin(spokeAngle) * spokeLength * 0.8;
      stem(
        [
          [hubX, hubY],
          [tipX, tipY],
        ],

        0.0024,
        0.0016,
        0.85,
      );
      for (let floret = 0; floret < 16; floret++) {
        const floretAngle = spokeAngle + (floret / 15 - 0.5) * 2.2;
        const floretLength = spokeLength * 0.22 * between(rand, 0.8, 1.1);
        stem(
          [
            [tipX, tipY],
            [tipX + Math.cos(floretAngle) * floretLength, tipY + Math.sin(floretAngle) * floretLength * 0.8],
          ],

          0.0011,
          8e-4,
          0.7,
        );
        plant.fillStyle = "rgba(255,255,255,.95)";
        plant.beginPath();
        plant.arc(
          tipX + Math.cos(floretAngle) * floretLength,
          tipY + Math.sin(floretAngle) * floretLength * 0.8,
          between(rand, 0.0035, 0.006),
          0,
          7,
        );
        plant.fill();
      }
    }
    for (let leaf = 0; leaf < 3; leaf++) {
      const at = spine[Math.floor(spine.length * (0.3 + leaf * 0.15))];
      blade(at[0], at[1], angle + (leaf % 2 ? 1 : -1) * 0.9, stemLength * 0.22, stemLength * 0.03, 9, 0.85);
    }
  };
  /** A branch of leaves, or ginkgo fans when fan is set. */
  const branch = (x: number, y: number, angle: number, length: number, fan: boolean) => {
    const spine = curve(x, y, angle, length, between(rand, -0.8, 0.8));
    stem(spine, 0.005, 0.002);
    for (let index = 4; index < spine.length; index += 3) {
      const [bx, by] = spine[index];
      const side = index % 2 ? 1 : -1;
      const leafAngle = angle + side * between(rand, 0.6, 1.1);
      const leafSize = length * (fan ? 0.13 : 0.17) * (1 - (index / spine.length) * 0.4);
      const stalkX = bx + Math.cos(leafAngle) * leafSize * 0.25;
      const stalkY = by + Math.sin(leafAngle) * leafSize * 0.25;
      stem(
        [
          [bx, by],
          [stalkX, stalkY],
        ],

        0.002,
        0.0015,
      );
      if (fan) {
        plant.fillStyle = `rgba(255,255,255,${between(rand, 0.75, 0.92)})`;
        plant.beginPath();
        plant.moveTo(stalkX, stalkY);
        plant.arc(stalkX, stalkY, leafSize, leafAngle - 0.75, leafAngle + 0.75);
        plant.closePath();
        plant.fill();
        plant.globalCompositeOperation = "destination-out";
        plant.strokeStyle = "rgba(0,0,0,.25)";
        plant.lineWidth = 8e-4;
        for (let vein = -6; vein <= 6; vein++) {
          plant.beginPath();
          plant.moveTo(stalkX, stalkY);
          plant.lineTo(
            stalkX + Math.cos(leafAngle + vein * 0.11) * leafSize,
            stalkY + Math.sin(leafAngle + vein * 0.11) * leafSize,
          );
          plant.stroke();
        }
        plant.globalCompositeOperation = "source-over";
        plant.beginPath();
        plant.moveTo(stalkX + Math.cos(leafAngle) * leafSize * 1.01, stalkY + Math.sin(leafAngle) * leafSize * 1.01);
        plant.globalCompositeOperation = "destination-out";
        plant.fillStyle = "rgba(0,0,0,1)";
        plant.arc(
          stalkX + Math.cos(leafAngle) * leafSize,
          stalkY + Math.sin(leafAngle) * leafSize,
          leafSize * 0.12,
          0,
          7,
        );
        plant.fill();
        plant.globalCompositeOperation = "source-over";
      } else {
        blade(stalkX, stalkY, leafAngle, leafSize, leafSize * 0.3, 0, between(rand, 0.78, 0.93));
      }
    }
  };
  /** Seaweed: a short curve that forks again until depth runs out. */
  const algae = (x: number, y: number, angle: number, length: number, thickness: number, depth: number) => {
    const spine = curve(x, y, angle, length, between(rand, -1.2, 1.2), 18);
    stem(spine, thickness, thickness * 0.6, 0.9);
    if (depth > 0) {
      for (let index = 4; index < spine.length; index += 3 + Math.floor(rand() * 3)) {
        algae(
          spine[index][0],
          spine[index][1],
          angle + between(rand, -0.9, 0.9),
          length * between(rand, 0.4, 0.65),
          thickness * 0.65,
          depth - 1,
        );
      }
    }
  };
  const grass = (x: number, y: number, angle: number, length: number) => {
    const spine = curve(x, y, angle, length, between(rand, -0.5, 0.5), 30);
    stem(spine, 0.003, 0.0015);
    for (let index = 12; index < spine.length; index += 2) {
      const [px, py] = spine[index];
      const side = index % 4 ? 1 : -1;
      blade(px, py, angle + side * 0.45, length * 0.07, length * 0.012, 0, 0.92);
    }
  };
  const feather = (x: number, y: number, angle: number, length: number) => {
    const shaft = curve(x, y, angle, length, between(rand, -0.3, 0.3), 50);
    stem(shaft, 0.004, 0.001);
    for (let index = 8; index < shaft.length; index++) {
      const [px, py] = shaft[index];
      const t = index / shaft.length;
      const heading = angle;
      for (const side of [-1, 1]) {
        const barb = length * 0.16 * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (side > 0 ? 1 : 0.8);
        plant.strokeStyle = `rgba(255,255,255,${0.55 + 0.3 * rand()})`;
        plant.lineWidth = 0.0012;
        plant.beginPath();
        plant.moveTo(px, py);
        plant.quadraticCurveTo(
          px + Math.cos(heading + side * 1.2) * barb * 0.6,
          py + Math.sin(heading + side * 1.2) * barb * 0.6,
          px + Math.cos(heading + side * 0.6) * barb,
          py + Math.sin(heading + side * 0.6) * barb,
        );
        plant.stroke();
      }
    }
  };
  const centerX = 0.5;
  const baseY = aspect - inset - 0.02;
  const maxLength = aspect - 2 * inset;
  type Draw = (x: number, y: number, angle: number, length: number) => void;
  const drawers: Record<string, Draw> = {
    fern,
    umbel,
    grass,
    feather,
    ginkgo: (x, y, angle, length) => branch(x, y, angle, length, true),
    leaf: (x, y, angle, length) => branch(x, y, angle, length, false),
    algae: (x, y, angle, length) => algae(x, y, angle, length * 0.42, 0.006, 3),
  };
  /** Which plant a word in the prompt asks for. */
  const keywords: [string, string[]][] = [
    ["fern", ["fern", "ferns", "frond", "fronds", "bracken"]],
    ["ginkgo", ["ginkgo", "ginkgos", "fan"]],
    ["umbel", ["flower", "flowers", "wildflower", "wildflowers", "umbel", "bloom", "blooms", "yarrow", "lace"]],
    ["grass", ["grass", "grasses", "wheat", "reed", "reeds", "seedhead"]],
    ["leaf", ["leaf", "leaves", "branch", "branches", "olive", "laurel", "sprig", "eucalyptus"]],
    ["feather", ["feather", "feathers", "plume"]],
    ["algae", ["seaweed", "kelp", "algae", "coral"]],
  ];

  const kinds: string[] = [];
  for (const word of scene.words) {
    for (const [kind, words] of keywords) {
      if (words.includes(word) && !kinds.includes(kind)) {
        kinds.push(kind);
      }
    }
  }
  if (!kinds.length && subjects.has("sea")) {
    kinds.push("algae");
  }
  if (!kinds.length && subjects.has("bird")) {
    kinds.push("feather");
  }
  const fallback = ["fern", "umbel", "ginkgo", "grass", "leaf"];
  const count = Math.max(Math.min(3, kinds.length), 1 + Math.floor(rand() * 3));
  const picks = kinds.slice(0, 3);
  for (; picks.length < count;) {
    const kind = pick(rand, fallback);
    if (!picks.includes(kind) || rand() < 0.2) {
      picks.push(kind);
    }
  }
  for (let index = picks.length - 1; index > 0; index--) {
    const swap = Math.floor(rand() * (index + 1));
    [picks[index], picks[swap]] = [picks[swap], picks[index]];
  }
  picks.forEach((kind, i) => {
    const spread = count === 1 ? 0 : 0.58 / count;
    const x =
      centerX +
      (i - (count - 1) / 2) * spread +
      between(rand, -0.05, 0.05) +
      (count === 1 ? between(rand, -0.06, 0.06) : 0);
    const angle = -Math.PI / 2 + between(rand, -0.3, 0.3) + (i - (count - 1) / 2) * between(rand, 0.08, 0.24);
    drawers[kind](x, baseY, angle, maxLength * (count === 1 ? between(rand, 0.78, 0.9) : between(rand, 0.6, 0.86)));
  });
  if (scene.orb && (subjects.has("moon") || subjects.has("sun"))) {
    plant.fillStyle = "rgba(255,255,255,.88)";
    plant.beginPath();
    plant.arc(0.72, inset + 0.14, 0.07, 0, 7);
    plant.fill();
    if (subjects.has("moon")) {
      plant.globalCompositeOperation = "destination-out";
      plant.beginPath();
      plant.arc(0.75, inset + 0.13, 0.062, 0, 7);
      plant.fill();
      plant.globalCompositeOperation = "source-over";
    }
  }
  const [exposedCanvas, exposed] = makeCanvas(width, height);
  exposed.filter = `blur(${Math.max(0.5, width * 9e-4)}px)`;
  exposed.drawImage(plantCanvas, 0, 0);
  exposed.filter = "none";
  exposed.globalCompositeOperation = "source-in";
  exposed.fillStyle = sepia ? "#EFE6D6" : "#E4ECF1";
  exposed.fillRect(0, 0, width, height);
  exposed.globalCompositeOperation = "destination-in";
  exposed.drawImage(maskCanvas, 0, 0);
  ctx.drawImage(exposedCanvas, 0, 0);
  addGrain(ctx, width, height, 0.05, seed, 0.04, noise);
}
/**
 * Topographic map: a noise height field shaded by elevation, with marching-squares contour lines,
 * a coastline, a river traced downhill, spot heights, a scale bar and a north arrow.
 */
export function paintContour(
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
  const subjects = scene.subjects;
  const cols = 240;
  const rows = Math.round(240 * aspect);
  const dark = paletteKey === "night" || paletteKey === "neon";
  const alpine = subjects.has("mountain") || subjects.has("snow");
  const coastal = subjects.has("sea") || subjects.has("island");
  const desert = subjects.has("desert");
  const heights = new Float32Array((cols + 1) * (rows + 1));
  const offsetX = rand() * 50;
  const offsetY = rand() * 50;
  const islandCenter = [between(rand, 0.3, 0.7), between(rand, 0.3, 0.7) * aspect];
  let lowest = Infinity;
  let highest = -1 / 0;
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const u = col / cols;
      const v = (row / rows) * aspect;
      let h = noise.fbm(u * 2.2 + offsetX, v * 2.2 + offsetY, 4);
      if (alpine) {
        const ridge = 1 - Math.abs(noise.fbm(u * 1.7 + offsetX + 9, v * 1.7 + offsetY, 4));
        h = h * 0.5 + Math.pow(ridge, 2.2) * 1;
      }
      if (desert) {
        h = h * 0.4 + Math.pow(1 - Math.abs(Math.sin((u * 0.8 + v * 0.6) * 14 + noise.n2(u * 3, v * 3) * 2)), 2) * 0.25;
      }
      if (subjects.has("island")) {
        const dist = Math.hypot(u - islandCenter[0], v - islandCenter[1]);
        h = h * 0.6 + (0.5 - dist * 1.4);
      } else {
        if (coastal) {
          h += (u * 0.3 + v * 0.7 - 0.55 * aspect) * -0.9;
        }
      }
      heights[row * (cols + 1) + col] = h;
      if (h < lowest) {
        lowest = h;
      }
      if (h > highest) {
        highest = h;
      }
    }
  }
  const seaLevel = coastal ? lowest + (highest - lowest) * 0.36 : -1 / 0;
  const levels = 26;
  const step = (highest - lowest) / levels;
  const tints = dark
    ? ["#0C1220", "#0F1626", "#121A2C", "#151E33", "#18233A"]
    : paletteKey === "mono"
      ? ["#F3F1EC", "#ECE9E2", "#E5E1D9", "#DDD8CE", "#D5CFC4"]
      : desert || paletteKey === "warm" || paletteKey === "autumn"
        ? ["#F4E9D4", "#EFDDC0", "#E8CDA6", "#DDB98C", "#D1A57A"]
        : ["#E9EFDF", "#E2EAD2", "#EDE6C9", "#E8D8B4", "#E2CAA6"];
  const seaColor = dark ? "#0A1A2A" : paletteKey === "mono" ? "#DCDCDA" : "#CFE2E6";
  const image = ctx.createImageData(width, height);
  const data = image.data;
  const sampleHeight = (gx: number, gy: number) =>
    heights[Math.min(rows, Math.max(0, gy)) * (cols + 1) + Math.min(cols, Math.max(0, gx))];
  const tintRgb = tints.map(hexToRgb);
  const seaRgb = hexToRgb(seaColor);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const gx = (px / width) * cols;
      const gy = (py / height) * rows;
      const ix = Math.floor(gx);
      const iy = Math.floor(gy);
      const fx = gx - ix;
      const fy = gy - iy;
      const h = lerp(
        lerp(sampleHeight(ix, iy), sampleHeight(ix + 1, iy), fx),
        lerp(sampleHeight(ix, iy + 1), sampleHeight(ix + 1, iy + 1), fx),
        fy,
      );
      const dx = sampleHeight(ix + 1, iy) - sampleHeight(ix - 1, iy);
      const dy = sampleHeight(ix, iy + 1) - sampleHeight(ix, iy - 1);
      const shade = Math.max(-1, Math.min(1, (-dx * 0.7 - dy * 0.7) * 22));
      let rgb: number[];
      if (h < seaLevel) {
        const depth = (seaLevel - h) / (seaLevel - lowest);
        rgb = seaRgb.map((channel) => channel - depth * (dark ? 10 : 40));
      } else {
        const t = Math.max(
          0,
          Math.min(0.999, (h - Math.max(lowest, seaLevel)) / (highest - Math.max(lowest, seaLevel))),
        );
        const band = Math.floor(t * tints.length);
        rgb = tintRgb[band].map((channel) => channel + shade * (dark ? 10 : 13));
      }
      const index = (py * width + px) * 4;
      data[index] = rgb[0];
      data[index + 1] = rgb[1];
      data[index + 2] = rgb[2];
      data[index + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const ink = dark ? (paletteKey === "neon" ? "#FF5FA8" : "#E8B85A") : paletteKey === "mono" ? "#2A2A2A" : "#8C5A3A";
  const waterInk = dark ? "#3BC9DB" : "#4A8FB0";
  const cellW = width / cols;
  const cellH = height / rows;
  for (let level = 1; level < levels; level++) {
    const threshold = lowest + level * step;
    const underwater = threshold < seaLevel;
    ctx.beginPath();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tl = heights[row * (cols + 1) + col];
        const tr = heights[row * (cols + 1) + col + 1];
        const br = heights[(row + 1) * (cols + 1) + col + 1];
        const bl = heights[(row + 1) * (cols + 1) + col];
        const cell =
          (tl > threshold ? 8 : 0) | (tr > threshold ? 4 : 0) | (br > threshold ? 2 : 0) | (bl > threshold ? 1 : 0);
        if (cell === 0 || cell === 15) {
          continue;
        }
        const top = [(col + (threshold - tl) / (tr - tl)) * cellW, row * cellH];
        const right = [(col + 1) * cellW, (row + (threshold - tr) / (br - tr)) * cellH];
        const bottom = [(col + (threshold - bl) / (br - bl)) * cellW, (row + 1) * cellH];
        const left = [col * cellW, (row + (threshold - tl) / (bl - tl)) * cellH];
        const segment = (a: number[], b: number[]) => {
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
        };
        switch (cell) {
          case 1:
          case 14:
            segment(left, bottom);
            break;
          case 2:
          case 13:
            segment(bottom, right);
            break;
          case 3:
          case 12:
            segment(left, right);
            break;
          case 4:
          case 11:
            segment(top, right);
            break;
          case 6:
          case 9:
            segment(top, bottom);
            break;
          case 7:
          case 8:
            segment(left, top);
            break;
          case 5:
            segment(left, top);
            segment(bottom, right);
            break;
          case 10:
            segment(top, right);
            segment(left, bottom);
            break;
        }
      }
    }
    const major = level % 5 === 0;
    ctx.strokeStyle = rgba(underwater ? waterInk : ink, underwater ? 0.5 : major ? 0.95 : 0.62);
    ctx.lineWidth = Math.max(0.6, width * (major ? 0.0021 : 9e-4));
    ctx.stroke();
  }
  if (coastal) {
    ctx.save();
    ctx.lineWidth = width * 0.0025;
    ctx.strokeStyle = rgba(waterInk, 0.9);
    ctx.beginPath();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const here = heights[row * (cols + 1) + col] > seaLevel;
        const right = heights[row * (cols + 1) + col + 1] > seaLevel;
        const below = heights[(row + 1) * (cols + 1) + col] > seaLevel;
        if (here !== right) {
          ctx.moveTo((col + 0.5) * cellW, row * cellH);
          ctx.lineTo((col + 0.5) * cellW, (row + 1) * cellH);
        }
        if (here !== below) {
          ctx.moveTo(col * cellW, (row + 0.5) * cellH);
          ctx.lineTo((col + 1) * cellW, (row + 0.5) * cellH);
        }
      }
    }
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.restore();
  }
  if (subjects.has("river") || rand() < 0.6) {
    let source = 0;
    for (let index = 0; index < heights.length; index++) {
      if (heights[index] > heights[source] - (rand() < 0.002 ? 1 : 0) && heights[index] < highest - step * 2) {
        source = index;
      }
    }
    let gx = source % (cols + 1);
    let gy = Math.floor(source / (cols + 1));
    const path: Point[] = [[gx, gy]];
    for (let walk = 0; walk < 900; walk++) {
      let nx = gx;
      let ny = gy;
      let best = sampleHeight(gx, gy);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ]) {
        const h = sampleHeight(gx + dx, gy + dy) + (rand() - 0.5) * step * 0.05;
        if (h < best) {
          best = h;
          nx = gx + dx;
          ny = gy + dy;
        }
      }
      if (nx === gx && ny === gy) {
        nx = gx + (rand() < 0.5 ? 1 : 0);
        ny = gy + 1;
      }
      gx = Math.max(0, Math.min(cols, nx));
      gy = Math.max(0, Math.min(rows, ny));
      path.push([gx, gy]);
      if (sampleHeight(gx, gy) < seaLevel || gy >= rows || gx <= 0 || gx >= cols) {
        break;
      }
    }
    ctx.strokeStyle = rgba(waterInk, 0.85);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let index = 1; index < path.length; index++) {
      ctx.lineWidth = width * (0.0012 + 0.0035 * (index / path.length));
      ctx.beginPath();
      ctx.moveTo(path[index - 1][0] * cellW, path[index - 1][1] * cellH);
      ctx.lineTo(path[index][0] * cellW, path[index][1] * cellH);
      ctx.stroke();
    }
  }
  ctx.fillStyle = ink;
  const summits: Point[] = [];
  for (let gy = 4; gy < rows - 4; gy += 3) {
    for (let gx = 4; gx < cols - 4; gx += 3) {
      const h = sampleHeight(gx, gy);
      if (
        h > lowest + (highest - lowest) * 0.72 &&
        h >= sampleHeight(gx + 3, gy) &&
        h >= sampleHeight(gx - 3, gy) &&
        h >= sampleHeight(gx, gy + 3) &&
        h >= sampleHeight(gx, gy - 3) &&
        !summits.some((other) => Math.hypot(other[0] - gx, other[1] - gy) < 18)
      ) {
        summits.push([gx, gy]);
      }
    }
  }
  for (const [gx, gy] of summits.slice(0, 6)) {
    const x = gx * cellW;
    const y = gy * cellH;
    const size = width * 0.007;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.9, y + size * 0.6);
    ctx.lineTo(x - size * 0.9, y + size * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.font = `500 ${Math.round(width * 0.016)}px 'Geist Mono Variable', ui-monospace, monospace`;
    ctx.fillText(
      String(Math.round(1200 + ((sampleHeight(gx, gy) - lowest) / (highest - lowest)) * 1800)),
      x + size * 1.4,
      y + size * 0.5,
    );
  }
  const frame = width * 0.04;
  ctx.strokeStyle = rgba(ink, 0.85);
  ctx.lineWidth = Math.max(1, width * 0.0016);
  ctx.strokeRect(frame, frame, width - 2 * frame, height - 2 * frame);
  ctx.fillStyle = dark ? "#0C1220" : "#F5F1E8";
  ctx.fillRect(0, 0, width, frame - 1);
  ctx.fillRect(0, height - frame + 1, width, frame);
  ctx.fillRect(0, 0, frame - 1, height);
  ctx.fillRect(width - frame + 1, 0, frame, height);
  const scaleX = frame + width * 0.035;
  const scaleY = height - frame - width * 0.04;
  const scaleW = width * 0.2;
  ctx.fillStyle = dark ? "rgba(12,18,32,.75)" : "rgba(245,241,232,.82)";
  ctx.fillRect(scaleX - width * 0.012, scaleY - width * 0.02, scaleW + width * 0.024, width * 0.04);
  for (let segment = 0; segment < 4; segment++) {
    ctx.fillStyle = segment % 2 ? (dark ? "#0C1220" : "#F5F1E8") : ink;
    ctx.fillRect(scaleX + (scaleW * segment) / 4, scaleY - width * 0.004, scaleW / 4, width * 0.008);
  }
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.strokeRect(scaleX, scaleY - width * 0.004, scaleW, width * 0.008);
  const northX = width - frame - width * 0.06;
  const northY = frame + width * 0.07;
  const arrow = width * 0.024;
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(northX, northY - arrow * 1.6);
  ctx.lineTo(northX + arrow * 0.6, northY + arrow * 0.6);
  ctx.lineTo(northX, northY + arrow * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.beginPath();
  ctx.moveTo(northX, northY - arrow * 1.6);
  ctx.lineTo(northX - arrow * 0.6, northY + arrow * 0.6);
  ctx.lineTo(northX, northY + arrow * 0.1);
  ctx.closePath();
  ctx.stroke();
  addGrain(ctx, width, height, 0.025, seed, 0.02, noise);
}
/** Gradient mesh: saturated colour blobs on a tiny canvas, swirled by noise, blurred up to size, with fluted glass or a glossy orb on top. */
export function paintMesh(
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
  const subjects = scene.subjects;
  const dark = scene.night || paletteKey === "neon" || paletteKey === "night";
  const cols = 64;
  const rows = Math.round(64 * aspect);
  const [smallCanvas, small] = makeCanvas(cols, rows);
  small.scale(cols, cols);
  const saturate = (hex: string, amount: number) => {
    const rgb = hexToRgb(hex);
    const grey = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return rgbToHex(rgb.map((channel) => grey + (channel - grey) * amount));
  };
  small.fillStyle = dark
    ? mixHex(colors.sky[0], "#000000", 0.2)
    : saturate(mixHex(colors.sky[1], colors.sky[2], 0.5), 1.25);
  small.fillRect(0, 0, 1, aspect);
  const blobColors = (
    dark
      ? [colors.sky[1], colors.sky[2], colors.far, colors.accent, colors.glow]
      : [colors.sky[0], colors.accent, colors.glow, colors.far, colors.sky[1], mixHex(colors.accent, colors.near, 0.45)]
  ).map((color) => saturate(color, 1.3));
  const blobs = 5 + Math.floor(rand() * 2);
  for (let index = 0; index < blobs; index++) {
    const bx = between(rand, -0.1, 1.1);
    const by = between(rand, -0.1, aspect + 0.1);
    const radius = between(rand, 0.38, 0.72);
    const color = blobColors[index % blobColors.length];
    small.save();
    small.translate(bx, by);
    small.rotate(rand() * 6);
    small.scale(1, between(rand, 0.45, 1));
    const gradient = small.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, rgba(color, 1));
    gradient.addColorStop(0.5, rgba(color, 0.7));
    gradient.addColorStop(1, rgba(color, 0));
    small.fillStyle = gradient;
    small.beginPath();
    small.arc(0, 0, radius, 0, 7);
    small.fill();
    small.restore();
  }
  if (subjects.has("sea")) {
    const sea = small.createLinearGradient(0, aspect * 0.55, 0, aspect);
    sea.addColorStop(0, rgba(colors.water, 0));
    sea.addColorStop(1, rgba(colors.water, 0.9));
    small.fillStyle = sea;
    small.fillRect(0, 0, 1, aspect);
  }
  const source = small.getImageData(0, 0, cols, rows);
  const warped = small.createImageData(cols, rows);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const angle = noise.fbm(col / 30, row / 30, 2) * 6;
      const sx = Math.min(cols - 1, Math.max(0, Math.round(col + Math.cos(angle) * 4)));
      const sy = Math.min(rows - 1, Math.max(0, Math.round(row + Math.sin(angle) * 4)));
      const to = (row * cols + col) * 4;
      const from = (sy * cols + sx) * 4;
      warped.data[to] = source.data[from];
      warped.data[to + 1] = source.data[from + 1];
      warped.data[to + 2] = source.data[from + 2];
      warped.data[to + 3] = 255;
    }
  }
  small.setTransform(1, 0, 0, 1, 0, 0);
  small.putImageData(warped, 0, 0);
  const [blurCanvas, blurred] = makeCanvas(width, height);
  blurred.imageSmoothingQuality = "high";
  blurred.filter = `blur(${width * 0.03}px)`;
  blurred.drawImage(smallCanvas, -width * 0.05, -height * 0.05, width * 1.1, height * 1.1);
  blurred.filter = "none";
  ctx.drawImage(blurCanvas, 0, 0);
  const showOrb = !!scene.orb && (subjects.has("sun") || subjects.has("moon") || rand() < 0.35);
  if (!showOrb && (rand() < 0.6 || subjects.has("cloud"))) {
    const [copyCanvas, copy] = makeCanvas(width, height);
    copy.drawImage(ctx.canvas, 0, 0);
    const slats = Math.round(between(rand, 9, 15));
    const slatW = width / slats;
    for (let slat = 0; slat < slats; slat++) {
      const slatX = slat * slatW;
      ctx.drawImage(copyCanvas, slatX - slatW * 0.6, 0, slatW * 2.2, height, slatX, 0, slatW, height);
      const shading = ctx.createLinearGradient(slatX, 0, slatX + slatW, 0);
      shading.addColorStop(0, "rgba(0,0,0,.12)");
      shading.addColorStop(0.35, "rgba(255,255,255,0)");
      shading.addColorStop(0.75, "rgba(255,255,255,.12)");
      shading.addColorStop(1, "rgba(0,0,0,.06)");
      ctx.fillStyle = shading;
      ctx.fillRect(slatX, 0, slatW, height);
    }
  }
  if (showOrb && scene.orb) {
    const orb = scene.orb;
    const radius = orb.r * width * 1.7;
    const cx = orb.x * width;
    const cy = Math.min(orb.y * width, height * 0.55);
    ctx.save();
    ctx.shadowColor = rgba(dark ? "#000000" : colors.near, 0.32);
    ctx.shadowBlur = radius * 0.7;
    ctx.shadowOffsetY = radius * 0.3;
    const body = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.42, radius * 0.04, cx, cy, radius * 1.02);
    body.addColorStop(0, mixHex(colors.orb, "#FFFFFF", 0.7));
    body.addColorStop(0.3, saturate(colors.glow, 1.2));
    body.addColorStop(0.8, saturate(mixHex(colors.accent, colors.glow, 0.3), 1.2));
    body.addColorStop(1, mixHex(colors.accent, colors.near, 0.35));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 7);
    ctx.fill();
    ctx.restore();
    const rim = ctx.createRadialGradient(cx, cy + radius * 0.2, radius * 0.7, cx, cy, radius);
    rim.addColorStop(0, "rgba(255,255,255,0)");
    rim.addColorStop(1, "rgba(255,255,255,.28)");
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 7);
    ctx.fill();
  }
  addGrain(ctx, width, height, 0.075, seed, 0, noise);
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((value) => (value + 0.5) / 16);
/** Pixel art: the scene drawn on a 104 pixel wide grid with ordered (Bayer) dithering, then scaled up without smoothing. */
export function paintPixel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: Scene,
  colors: Palette,
  rand: Rand,
  noise: Noise,
) {
  const aspect = scene.A;
  const cols = 104;
  const rows = Math.round(cols * aspect);
  const [gridCanvas, grid] = makeCanvas(cols, rows);
  const image = grid.createImageData(cols, rows);
  const data = image.data;
  const plot = (x: number, y: number, rgb: number[]) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) {
      return;
    }
    const index = (y * cols + x) * 4;
    data[index] = rgb[0];
    data[index + 1] = rgb[1];
    data[index + 2] = rgb[2];
    data[index + 3] = 255;
  };
  /** Pick a colour from a ramp at position t, dithered with the 4x4 Bayer matrix. */
  const dither = (x: number, y: number, t: number, ramp: number[][]) => {
    const pos = t * (ramp.length - 1);
    const base = Math.floor(pos);
    const frac = pos - base;
    return ramp[Math.min(ramp.length - 1, base + (frac > BAYER[(y & 3) * 4 + (x & 3)] ? 1 : 0))];
  };
  const skyRamp = [
    colors.sky[0],
    mixHex(colors.sky[0], colors.sky[1], 0.5),
    colors.sky[1],
    mixHex(colors.sky[1], colors.sky[2], 0.5),
    colors.sky[2],
  ].map(hexToRgb);
  const horizon = (scene.hz / aspect) * rows;
  for (let py = 0; py < rows; py++) {
    for (let px = 0; px < cols; px++) {
      plot(px, py, dither(px, py, Math.min(1, py / horizon), skyRamp));
    }
  }
  const orb = scene.orb;
  if (orb) {
    const ox = orb.x * cols;
    const oy = (orb.y / aspect) * rows;
    const radius = orb.r * cols;
    const glowRgb = hexToRgb(colors.glow);
    const orbRgb = hexToRgb(colors.orb);
    for (let py = 0; py < rows; py++) {
      for (let px = 0; px < cols; px++) {
        const dist = Math.hypot(px + 0.5 - ox, py + 0.5 - oy);
        if (dist < radius) {
          if (orb.crescent && Math.hypot(px + 0.5 - ox - radius * 0.45, py + 0.5 - oy + radius * 0.2) < radius * 0.9) {
            continue;
          }
          plot(px, py, orbRgb);
        } else if (
          !orb.moon &&
          dist < radius * 2.2 &&
          py < horizon &&
          1 - (dist - radius) / (radius * 1.2) > BAYER[(py & 3) * 4 + (px & 3)] * 1.6
        ) {
          const index = (py * cols + px) * 4;
          plot(px, py, [
            lerp(data[index], glowRgb[0], 0.5),
            lerp(data[index + 1], glowRgb[1], 0.5),
            lerp(data[index + 2], glowRgb[2], 0.5),
          ]);
        }
      }
    }
  }
  for (const star of scene.stars) {
    plot(
      Math.floor(star.x * cols),
      Math.floor((star.y / aspect) * rows),
      star.r > 0.002 ? hexToRgb(colors.light) : hexToRgb(mixHex(colors.light, colors.sky[0], 0.45)),
    );
  }
  /** Rasterise a path at grid size and return its pixels, to test coverage per cell. */
  const mask = (path: Path2D) => {
    const [, maskCtx] = makeCanvas(cols, rows);
    maskCtx.scale(cols, cols);
    maskCtx.fillStyle = "#fff";
    maskCtx.fill(path);
    return maskCtx.getImageData(0, 0, cols, rows).data;
  };
  for (const cloud of scene.clouds) {
    const alpha = mask(cloudPath(cloud));
    const lit = hexToRgb(mixHex(colors.sky[2], "#FFFFFF", 0.6));
    const shade = hexToRgb(mixHex(colors.sky[1], "#FFFFFF", 0.3));
    for (let py = 0; py < rows; py++) {
      for (let px = 0; px < cols; px++) {
        if (alpha[(py * cols + px) * 4 + 3] > 120) {
          plot(px, py, alpha[((py + 1) * cols + px) * 4 + 3] > 120 ? lit : shade);
        }
      }
    }
  }
  for (const bird of scene.birds) {
    const bx = Math.floor(bird.x * cols);
    const by = Math.floor((bird.y / aspect) * rows);
    const rgb = hexToRgb(colors.near);
    plot(bx, by, rgb);
    plot(bx - 1, by - 1, rgb);
    plot(bx + 1, by - 1, rgb);
    plot(bx - 2, by - 1, rgb);
    plot(bx + 2, by - 1, rgb);
  }
  for (const layer of scene.layers) {
    if (layer.kind === "water") {
      const near = hexToRgb(mixHex(colors.water, colors.sky[2], 0.35));
      const mid = hexToRgb(colors.water);
      const deep = hexToRgb(mixHex(colors.water, colors.near, 0.45));
      const glint = hexToRgb(colors.orb);
      for (let py = Math.ceil(horizon); py < rows; py++) {
        const t = (py - horizon) / (rows - horizon);
        for (let px = 0; px < cols; px++) {
          plot(px, py, dither(px, py, t, [near, mid, deep]));
        }
      }
      if (orb) {
        for (let py = Math.ceil(horizon) + 1; py < rows; py += 2) {
          const t = (py - horizon) / (rows - horizon);
          const streak = orb.r * cols * (1.2 - t * 0.5) * (0.5 + 0.6 * Math.abs(Math.sin(py * 1.7)));
          const cx = orb.x * cols + Math.sin(py * 0.9) * 2;
          for (let px = Math.round(cx - streak / 2); px < cx + streak / 2; px++) {
            plot(px, py, glint);
          }
        }
      }
      for (let ripple = 0; ripple < 30; ripple++) {
        const py = Math.round(lerp(horizon + 2, rows, rand()));
        const px = Math.floor(rand() * cols);
        const length = 2 + Math.floor(rand() * 5);
        for (let dx = 0; dx < length; dx++) {
          plot(px + dx, py, near);
        }
      }
      continue;
    }
    const body = hexToRgb(hazeColor(colors, layer));
    const lit = hexToRgb(mixHex(hazeColor(colors, layer), colors.glow, 0.35));
    const shadow = hexToRgb(mixHex(hazeColor(colors, layer), colors.near, 0.45));
    const shape = mask(layerPath(layer, aspect));
    const faces = layer.peaks.length ? mask(peaksPath(layer, aspect, rand, noise, orb ? orb.x > 0.5 : true)) : null;
    const snow = layer.snow ? mask(snowPath(layer, aspect, noise)) : null;
    const river = layer.river
      ? (() => {
          const path = new Path2D();
          tracePath(path, layer.river);
          return mask(path);
        })()
      : null;
    for (let py = 0; py < rows; py++) {
      for (let px = 0; px < cols; px++) {
        const index = (py * cols + px) * 4;
        if (shape[index + 3] < 128) {
          continue;
        }
        const edge = py > 0 && shape[index - cols * 4 + 3] < 128;
        let rgb = edge ? lit : body;
        if (faces && faces[index + 3] > 128) {
          rgb = edge ? body : shadow;
        }
        if (snow && snow[index + 3] > 128) {
          rgb = hexToRgb(mixHex(colors.light, colors.sky[2], faces && faces[index + 3] > 128 ? 0.4 : 0.1));
        }
        if (river && river[index + 3] > 128) {
          rgb = hexToRgb(mixHex(colors.water, colors.sky[2], 0.4));
        }
        plot(px, py, rgb);
      }
    }
    for (const win of layer.win) {
      plot(
        Math.floor(win[0] * cols),
        Math.floor((win[1] / aspect) * rows),
        hexToRgb(scene.night ? colors.accent : mixHex(colors.light, body.length ? rgbToHex(body) : "#ffffff", 0.5)),
      );
    }
  }
  if (scene.boat) {
    const boat = mask(boatPath(scene.boat));
    const rgb = hexToRgb(colors.near);
    for (let py = 0; py < rows; py++) {
      for (let px = 0; px < cols; px++) {
        if (boat[(py * cols + px) * 4 + 3] > 110) {
          plot(px, py, rgb);
        }
      }
    }
  }
  if (scene.lamp) {
    const lx = Math.floor(scene.lamp.x * cols);
    const ly = Math.floor((scene.lamp.y / aspect) * rows);
    const bulb = hexToRgb(colors.orb);
    const glow = hexToRgb(colors.glow);
    for (const [dx, dy] of [
      [-2, 0],
      [2, 0],
      [0, -2],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
      [0, 2],
    ]) {
      plot(lx + dx, ly + dy, glow);
    }
    plot(lx, ly, bulb);
    plot(lx - 1, ly, bulb);
    plot(lx + 1, ly, bulb);
    plot(lx, ly - 1, bulb);
    plot(lx, ly + 1, bulb);
  }
  grid.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(gridCanvas, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = "rgba(0,0,0,.05)";
  const cellW = width / cols;
  for (let col = 1; col < cols; col++) {
    ctx.fillRect(Math.round(col * cellW), 0, 1, height);
  }
  for (let row = 1; row < rows; row++) {
    ctx.fillRect(0, Math.round(row * (height / rows)), width, 1);
  }
}
/** Ink wash: ridges as fading washes of ink with a dry-brush crest line, mist between them and a red seal. */
export function paintInkwash(
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
  const paper = "#F0E9DA";
  const ink = "#1D1C1A";
  const seal = paletteKey === "mono" ? "#B23A2A" : mixHex(colors.accent, "#B8322A", 0.5);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.scale(width, width);
  scratches(ctx, width, rand, aspect, "#9C8A6A", 260);
  ctx.restore();
  const wash = ctx.createLinearGradient(0, 0, 0, scene.hz * width);
  wash.addColorStop(0, rgba(mixHex(colors.sky[1], "#9A9286", 0.6), 0.16));
  wash.addColorStop(1, rgba(colors.sky[2], 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);
  if (scene.orb) {
    const orb = scene.orb;
    ctx.fillStyle = orb.moon ? rgba("#FFFFFF", 0.55) : rgba(seal, 0.88);
    ctx.beginPath();
    ctx.arc(orb.x * width, orb.y * width, orb.r * width * 0.62, 0, 7);
    ctx.fill();
    if (orb.moon) {
      ctx.strokeStyle = rgba(ink, 0.25);
      ctx.lineWidth = width * 0.0015;
      ctx.stroke();
    }
  }
  const ridges = scene.layers.filter((layer) => layer.kind !== "water");
  for (const layer of ridges) {
    const depth = layer.t;
    const [strokeCanvas, brush] = makeCanvas(width, height);
    brush.scale(width, width);
    const alpha = 0.22 + 0.7 * depth;
    const crest = Math.min(...layer.top.map((point) => point[1]));
    const fade = brush.createLinearGradient(0, crest, 0, layer.base + (aspect - layer.base) * 0.4 + 0.05);
    fade.addColorStop(0, rgba(ink, alpha));
    fade.addColorStop(0.45, rgba(ink, alpha * 0.5));
    fade.addColorStop(1, rgba(ink, 0));
    brush.fillStyle = fade;
    brush.fill(layerPath(layer, aspect));
    if (layer.peaks.length) {
      brush.save();
      brush.clip(layerPath(layer, aspect, false));
      brush.fillStyle = rgba(ink, alpha * 0.45);
      brush.fill(peaksPath(layer, aspect, rand, noise, true));
      brush.restore();
    }
    brush.strokeStyle = rgba(ink, Math.min(1, alpha * 1.2));
    brush.lineCap = "round";
    for (let index = 1; index < layer.top.length; index++) {
      const [x0, y0] = layer.top[index - 1];
      const [x1, y1] = layer.top[index];
      const lineWidth = (0.0012 + 0.0035 * depth) * (0.5 + Math.abs(noise.n2(x0 * 14, depth * 10)));
      if (!(noise.n2(x0 * 30, depth * 7 + 3) < -0.35)) {
        brush.lineWidth = lineWidth;
        brush.beginPath();
        brush.moveTo(x0, y0);
        brush.lineTo(x1, y1);
        brush.stroke();
      }
    }
    if (depth > 0.3) {
      for (let index = 0; index < 40 * depth; index++) {
        const x = rand();
        const ridgeY = heightAt(layer.top, x);
        const y = ridgeY + between(rand, 0.005, 0.08) * depth;
        brush.strokeStyle = rgba(ink, between(rand, 0.1, 0.3) * depth);
        brush.lineWidth = between(rand, 8e-4, 0.0022);
        brush.beginPath();
        brush.moveTo(x, y);
        brush.quadraticCurveTo(
          x + between(rand, -0.01, 0.01),
          y + 0.01,
          x + between(rand, -0.02, 0.02),
          y + between(rand, 0.01, 0.03),
        );
        brush.stroke();
      }
    }
    for (const shape of layer.extra) {
      brush.fillStyle = rgba(ink, Math.min(1, alpha + 0.15));
      if (shape.k === "p") {
        const path = new Path2D();
        tracePath(path, shape.pts);
        brush.fill(path);
      } else {
        brush.beginPath();
        brush.arc(shape.x, shape.y, shape.r, 0, 7);
        brush.fill();
      }
    }
    for (const win of layer.win) {
      brush.fillStyle = rgba(ink, 0.12);
      brush.fillRect(win[0], win[1], win[2], win[3] * 0.4);
    }
    ctx.save();
    ctx.filter = `blur(${width * 0.002}px)`;
    ctx.globalAlpha = 0.65;
    ctx.drawImage(strokeCanvas, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 0.55;
    ctx.drawImage(strokeCanvas, 0, 0);
    ctx.globalAlpha = 1;
    const mist = ctx.createLinearGradient(0, (layer.base - 0.02) * width, 0, (layer.base + 0.06) * width);
    mist.addColorStop(0, rgba(paper, 0));
    mist.addColorStop(0.5, rgba(paper, 0.55));
    mist.addColorStop(1, rgba(paper, 0));
    ctx.fillStyle = mist;
    ctx.fillRect(0, (layer.base - 0.02) * width, width, 0.08 * width);
  }
  if (scene.layers.some((layer) => layer.kind === "water")) {
    ctx.strokeStyle = rgba(ink, 0.18);
    ctx.lineCap = "round";
    for (let index = 0; index < 18; index++) {
      const y = between(rand, scene.hz + 0.01, aspect - 0.02);
      const x = rand();
      const length = between(rand, 0.04, 0.16);
      ctx.lineWidth = width * between(rand, 8e-4, 0.002);
      ctx.beginPath();
      ctx.moveTo(x * width, y * width);
      ctx.lineTo((x + length) * width, (y + between(rand, -0.002, 0.002)) * width);
      ctx.stroke();
    }
  }
  if (scene.boat) {
    ctx.save();
    ctx.scale(width, width);
    ctx.fillStyle = rgba(ink, 0.85);
    ctx.fill(
      boatPath({
        ...scene.boat,
        s: scene.boat.s * 0.6,
      }),
    );
    ctx.restore();
  }
  for (const bird of scene.birds) {
    ctx.save();
    ctx.scale(width, width);
    ctx.fillStyle = rgba(ink, 0.8);
    ctx.fill(
      birdPath({
        ...bird,
        s: bird.s * 0.7,
      }),
    );
    ctx.restore();
  }
  const sealSize = width * 0.05;
  const sealX = width * (scene.orb && scene.orb.x > 0.5 ? 0.08 : 0.86);
  const sealY = height * 0.08;
  ctx.fillStyle = rgba(seal, 0.9);
  ctx.fillRect(sealX, sealY, sealSize, sealSize);
  ctx.fillStyle = paper;
  const unit = sealSize / 7;
  [
    [1, 1, 2, 5],
    [4, 1, 2, 2],
    [4, 4, 2, 2],
    [3, 3, 1, 1],
  ].forEach(([gx, gy, gw, gh]) =>
    ctx.fillRect(sealX + gx * unit, sealY + gy * unit, gw * unit * 0.85, gh * unit * 0.85),
  );
  addGrain(ctx, width, height, 0.03, seed, 0.04, noise);
}
