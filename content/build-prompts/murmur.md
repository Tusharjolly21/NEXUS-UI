# Murmur

Add the "Murmur" component from Nexus UI to my project.

Murmur: a landing screen for a writing assistant where four swallows fly around the prompt, and the whole sky is drawn live as a field of type. Each bird is built from real wing shapes, then re-read as a grid of small coloured cells that each pick a character by how much of the bird covers them, with a soft blurred shadow and drifting specks of dust. The birds wander, steer away from the screen edges, from the prompt box and from each other, flap in bursts, glide, and now and then tuck into a fast dart. Tap the sky near a bird and it startles away; send the prompt and every bird takes off at full flap while a line says what is being drafted. The prompt box is real glass over the sky, with a real textarea: Enter sends, Shift+Enter makes a new line. The drawing pauses when it is off screen or the tab is hidden, and with reduced motion the sky is drawn once and stays still.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { Murmur } from "@/components/murmur";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/murmur/index.ts ---

```ts
export { default as Murmur } from "./murmur";
export type { MurmurProps } from "./murmur";
```

--- components/murmur/murmur.tsx ---

```tsx
"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

export type MurmurProps = {
  /** Height of the screen in px, or "fill" to fill a sized parent. */
  height?: number | "fill";
  /** Let the swallows fly. When false (or under reduced motion) the sky is drawn once and stays still. */
  autoplay?: boolean;
  className?: string;
};

// ───────────────────────── constants ─────────────────────────

const UI_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif";
const MONO_FONT = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";

/** Glyphs from faint to dense: a bird cell picks one by how much of it the bird covers. */
const RAMP = [".", ":", "-", "=", "+", "o", "s", "S", "%", "$", "&", "@"];
/** Faint marks for the sky around the birds. */
const SPECKS = ["·", "-", ".", "–", ":"];
/** Each grid cell looks at SAMPLES x SAMPLES pixels of the bird sprite sheet. */
const SAMPLES = 2;

const GLASS_STYLE: CSSProperties = {
  background: "rgba(255,255,255,.62)",
  backdropFilter: "blur(18px) saturate(170%)",
  WebkitBackdropFilter: "blur(18px) saturate(170%)",
  boxShadow: "0 0 0 .5px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.8) inset, 0 24px 50px -30px rgba(0,0,0,.35)",
};

const FOCUS_STYLES = ".murmur .murmur-ring:focus-visible{outline:2px solid #0071e3;outline-offset:3px} .murmur textarea::placeholder{color:#8e8e93}";

const TOOLBAR: { label: string; icon: ReactNode }[] = [
  { label: "Add a file", icon: <path key="a" d="M12 5v14M5 12h14" /> },
  {
    label: "Dictate",
    icon: (
      <>
        <rect key="r" x="9" y="3" width="6" height="11" rx="3" />
        <path key="p" d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </>
    ),
  },
];

// ───────────────────────── small maths ─────────────────────────

type Vec3 = [number, number, number];
type Rgb = readonly [number, number, number];

/** A cheap repeatable hash of a number into 0..1. */
const hash = (n: number) => {
  const t = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return t - Math.floor(t);
};

/** An organic wobble in about -1..1 made of three sines. */
const wander = (n: number) => Math.sin(n) * 0.55 + Math.sin(n * 1.618 + 1.3) * 0.3 + Math.sin(n * 2.718 + 4.1) * 0.15;

/** Shortest signed difference between two angles. */
const angleDelta = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const shade = (rgb: Rgb, k: number) => `rgb(${Math.round(rgb[0] * k)},${Math.round(rgb[1] * k)},${Math.round(rgb[2] * k)})`;

// ───────────────────────── the swallow ─────────────────────────

// Plumage.
const NAVY: Rgb = [44, 70, 128];
const DARK_NAVY: Rgb = [24, 36, 68];
const CREAM: Rgb = [226, 216, 198];
const PALE_CREAM: Rgb = [236, 226, 210];
const THROAT_RUST = "#b9583c";

/** The wing's leading edge, shoulder to tip, as [along the body, along the span]. */
const WING_LEADING: [number, number][] = [
  [0.15, 0.06],
  [0.16, 0.2],
  [0.12, 0.37],
  [0.02, 0.58],
  [-0.16, 0.8],
  [-0.44, 1.02],
];
/** The wing's trailing edge, tip back to shoulder. */
const WING_TRAILING: [number, number][] = [
  [-0.36, 0.88],
  [-0.24, 0.7],
  [-0.19, 0.5],
  [-0.19, 0.34],
  [-0.17, 0.18],
  [-0.17, 0.06],
];
/** Where along the span the wing bends at the wrist. */
const WRIST = 0.37;

/** The birds are seen from above and in front, tilted by this much. */
const VIEW_TILT = 0.34;
const VIEW_COS = Math.cos(VIEW_TILT);
const VIEW_SIN = Math.sin(VIEW_TILT);
const VIEW_VECTOR: Vec3 = [0, VIEW_SIN, VIEW_COS];
const LIGHT_VECTOR: Vec3 = (() => {
  const l: Vec3 = [-0.25, -0.35, 1];
  const len = Math.hypot(...l);
  return [l[0] / len, l[1] / len, l[2] / len];
})();

/** The shape of the wings: how far they lift (inner and hand), sweep back, and fold at the wrist. */
type WingPose = { e: number; eh: number; sw: number; fold: number };

const GLIDE_POSE: WingPose = { e: 0.12, eh: 0.03, sw: 0.22, fold: 0.3 };
const DART_POSE: WingPose = { e: 0.16, eh: 0.08, sw: 0.46, fold: 0.5 };

const mixPose = (a: WingPose, b: WingPose, k: number): WingPose => ({
  e: a.e + (b.e - a.e) * k,
  eh: a.eh + (b.eh - a.eh) * k,
  sw: a.sw + (b.sw - a.sw) * k,
  fold: a.fold + (b.fold - a.fold) * k,
});

/** The wing pose at a point (0..1) in the wingbeat: a slower downstroke, a quicker recovery, the hand lagging a little. */
function flapPose(phase: number): WingPose {
  const stroke = (p: number) => {
    const a = ((p % 1) + 1) % 1;
    const split = 0.4;
    return a < split ? (0.5 * a) / split : 0.5 + (0.5 * (a - split)) / (1 - split);
  };
  const inner = stroke(phase);
  const hand = stroke(phase - 0.07);
  const e = 0.2 + 0.9 * Math.cos(6.283 * inner);
  const eh = 0.2 + 1.08 * Math.cos(6.283 * hand);
  const folded = 0.5 + 0.5 * Math.sin(6.283 * (inner - 0.5));
  return { e, eh, sw: 0.08 + 0.26 * folded, fold: 0.04 + 0.68 * folded };
}

/** A point on one wing in the bird's own space. `side` is -1 or 1 for the two wings. */
function wingPoint(along: number, span: number, side: number, pose: WingPose): Vec3 {
  const rotate = (a: number, b: number, angle: number): [number, number] => [a * Math.cos(angle) - b * Math.sin(angle), a * Math.sin(angle) + b * Math.cos(angle)];
  const lift = (a: number, b: number, angle: number): Vec3 => {
    const [ra, rb] = rotate(a, b, pose.sw);
    return [ra, rb * Math.cos(angle) * side, rb * Math.sin(angle)];
  };
  if (span <= WRIST) return lift(along, span, pose.e);
  const pivotAlong = 0.12 - (0.12 - -0.15) * 0.5;
  const pivot = lift(pivotAlong, WRIST, pose.e);
  const [ra, rb] = rotate(along - pivotAlong, span - WRIST, pose.sw + pose.fold);
  return [pivot[0] + ra, pivot[1] + rb * Math.cos(pose.eh) * side, pivot[2] + rb * Math.sin(pose.eh)];
}

/**
 * Draws one swallow as flat vector shapes onto `ctx` (these are later read back as pixels and turned into grid cells).
 * `cx, cy` is the bird's centre in css px, `heading` its direction in radians, `size` its length in px, `bank` its
 * roll, `tail` how far the tail swings, and `lift` the wingbeat's small up and down motion of the body.
 */
function drawBird(ctx: CanvasRenderingContext2D, cx: number, cy: number, heading: number, size: number, pose: WingPose, bank: number, tail: number, lift: number) {
  const cosHeading = Math.cos(heading);
  const sinHeading = Math.sin(heading);
  const cosBank = Math.cos(bank);
  const sinBank = Math.sin(bank);

  /** Bird space to world space: roll by `bank`, then turn to `heading`. */
  const toWorld = (p: Vec3): Vec3 => {
    const rolledY = p[1] * cosBank - p[2] * sinBank;
    const z = p[1] * sinBank + p[2] * cosBank + lift * 0.025;
    return [p[0] * cosHeading - rolledY * sinHeading, p[0] * sinHeading + rolledY * cosHeading, z];
  };
  /** World space to the screen, with a hint of perspective. The third value is depth. */
  const project = (p: Vec3): Vec3 => {
    const depth = p[1] * VIEW_SIN + p[2] * VIEW_COS;
    const perspective = 1 + depth * 0.12;
    return [cx + p[0] * size * perspective, cy + (p[1] * VIEW_COS - p[2] * VIEW_SIN) * size * perspective, depth];
  };

  const fillShape = (pts: Vec3[], fill: string | CanvasGradient) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i];
      const next = pts[i + 1];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + next[0]) / 2, (p[1] + next[1]) / 2);
    }
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    ctx.closePath();
    ctx.fill();
  };

  const buildWing = (side: number) => {
    const world = [...WING_LEADING, ...WING_TRAILING].map(([along, span]) => wingPoint(along, span, side, pose)).map(toWorld);
    const screen = world.map(project);

    /** Colour of a wing panel: navy where its top faces the viewer, cream where its underside does, lit from the light. */
    const panelColor = (a: Vec3, b: Vec3, c: Vec3) => {
      let normal = cross([b[0] - a[0], b[1] - a[1], b[2] - a[2]], [c[0] - a[0], c[1] - a[1], c[2] - a[2]]);
      const len = Math.hypot(...normal) || 1;
      normal = [normal[0] / len, normal[1] / len, normal[2] / len];
      if (normal[2] < 0) normal = [-normal[0], -normal[1], -normal[2]];
      const facesViewer = dot(normal, VIEW_VECTOR) > 0;
      const light = 0.55 + 0.6 * Math.max(0, dot(normal, LIGHT_VECTOR));
      return facesViewer ? { base: NAVY, k: light } : { base: CREAM, k: 0.72 + 0.22 * light };
    };

    const shoulder = toWorld(wingPoint(0, 0.06, side, pose));
    const wrist = toWorld(wingPoint(0.12, WRIST, side, pose));
    const tip = world[WING_LEADING.length - 1];
    const wristTrailing = toWorld(wingPoint(-0.17, WRIST, side, pose));
    const inner = panelColor(shoulder, wrist, wristTrailing);
    const outer = panelColor(wrist, tip, wristTrailing);
    const shoulderScreen = project(shoulder);
    const tipScreen = screen[WING_LEADING.length - 1];
    const gradient = ctx.createLinearGradient(shoulderScreen[0], shoulderScreen[1], tipScreen[0], tipScreen[1]);
    gradient.addColorStop(0, shade(inner.base, Math.min(1.3, inner.k * 1.04)));
    gradient.addColorStop(0.4, shade(inner.base, Math.min(1.25, inner.k)));
    gradient.addColorStop(0.62, shade(outer.base === NAVY ? DARK_NAVY : outer.base, Math.min(1.5, outer.k * (outer.base === NAVY ? 1.45 : 1))));
    gradient.addColorStop(1, shade(outer.base === NAVY ? DARK_NAVY : outer.base, Math.min(1.4, outer.k * (outer.base === NAVY ? 1.2 : 0.95))));
    return { pts: screen, fill: gradient, depth: screen.reduce((sum, p) => sum + p[2], 0) / screen.length };
  };

  // The far wing first, then the tail, body and head, then the near wing on top.
  const left = buildWing(-1);
  const right = buildWing(1);
  const [farWing, nearWing] = left.depth < right.depth ? [left, right] : [right, left];
  fillShape(farWing.pts, farWing.fill);

  const forkSpread = 0.16 + Math.abs(tail) * 0.08;
  const tailAngle = -tail * 0.25;
  const swingTail = (p: [number, number]): Vec3 => [-0.27 + p[0] * Math.cos(tailAngle) - p[1] * Math.sin(tailAngle), p[0] * Math.sin(tailAngle) + p[1] * Math.cos(tailAngle), 0];
  const tailOutline: [number, number][] = [
    [0.04, -0.07],
    [-0.12, -0.1],
    [-0.52, -forkSpread - 0.03],
    [-0.2, -0.04],
    [-0.14, 0],
    [-0.2, 0.04],
    [-0.52, forkSpread + 0.03],
    [-0.12, 0.1],
    [0.04, 0.07],
  ];
  fillShape(
    tailOutline.map((p) => project(toWorld(swingTail(p)))),
    shade(DARK_NAVY, 1),
  );

  const bodyHalf: [number, number][] = [
    [0.43, 0],
    [0.39, 0.03],
    [0.34, 0.075],
    [0.26, 0.095],
    [0.19, 0.088],
    [0.1, 0.125],
    [-0.04, 0.122],
    [-0.18, 0.09],
    [-0.3, 0.055],
  ];
  const bodyOutline = [...bodyHalf.map(([along, half]) => [along, half]), ...bodyHalf.slice().reverse().map(([along, half]) => [along, -half])];
  fillShape(
    bodyOutline.map(([along, half]) => project(toWorld([along, 0, half * 0.85]))),
    shade(PALE_CREAM, 0.9),
  );
  fillShape(
    bodyOutline.map(([along, half]) => project(toWorld([along, half, 0]))),
    shade(NAVY, 1.02),
  );

  const head = project(toWorld([0.3, 0, 0.02]));
  const throat = project(toWorld([0.37, 0, -0.01]));
  ctx.fillStyle = shade(DARK_NAVY, 1.05);
  ctx.beginPath();
  ctx.ellipse(head[0], head[1], 0.075 * size, 0.068 * size, heading, 0, 6.283);
  ctx.fill();
  ctx.fillStyle = THROAT_RUST;
  ctx.beginPath();
  ctx.ellipse(throat[0], throat[1], 0.04 * size, 0.035 * size, heading, 0, 6.283);
  ctx.fill();

  fillShape(nearWing.pts, nearWing.fill);
}

// ───────────────────────── the flock ─────────────────────────

type Bird = {
  size: number;
  seed: number;
  /** Where in the wingbeat the bird is, 0..1. */
  phase: number;
  heading: number;
  /** Turn rate, radians per second. */
  turn: number;
  bank: number;
  tail: number;
  x: number;
  y: number;
  /** Speed multiplier. */
  speed: number;
  /** Panic: pushes the bird into flapping and flying faster; fades by itself. */
  boost: number;
  /** A sudden turn, fading by itself. */
  kick: number;
  /** How much the bird is flapping, 0 (gliding) .. 1 (full beat). */
  flap: number;
  /** Whether it is about to flap (1) or glide (0). */
  flapTarget: number;
  flapTimer: number;
  /** 1 while a glide has been tucked into a swept-back dart. */
  dart: number;
  dartTimer: number;
  dartBlend: number;
  /** A burst of speed on each downstroke. */
  surge: number;
  lastElevation: number;
};

const createBird = (x: number, y: number, heading: number, size: number, seed: number): Bird => ({
  size,
  seed,
  phase: seed,
  heading,
  turn: 0,
  bank: 0,
  tail: 0,
  x,
  y,
  speed: 1,
  boost: 0,
  kick: 0,
  flap: 0,
  flapTarget: 0,
  flapTimer: seed * 0.4,
  dart: 0,
  dartTimer: 5 + seed * 2,
  dartBlend: 0,
  surge: 0,
  lastElevation: 0,
});

/** What the page can do to the flock. */
type Scene = {
  /** Frighten the birds near a point (css px, relative to the screen). */
  startle: (x: number, y: number) => void;
  /** Send every bird off at full flap. */
  release: () => void;
  destroy: () => void;
};

/**
 * The sky: four swallows drawn as vector shapes, read back as pixels and re-drawn as a grid of coloured cells and
 * glyphs. `grid` holds the faint cell lines, `ink` the birds. Starts the animation loop when `animate` is true and
 * the screen is visible; either way it draws one frame so the sky is never empty.
 */
function createScene(root: HTMLDivElement, ink: HTMLCanvasElement, grid: HTMLCanvasElement, animate: boolean): Scene | null {
  const inkCtx = ink.getContext("2d");
  const gridCtx = grid.getContext("2d");
  // The birds are first drawn here, as small as the grid needs, then read back cell by cell.
  const sprite = document.createElement("canvas");
  const spriteCtx = sprite.getContext("2d", { willReadFrequently: true });
  // A half-size copy of the sprite, blurred, for the soft shadow under the birds.
  const glow = document.createElement("canvas");
  const glowCtx = glow.getContext("2d");
  if (!inkCtx || !gridCtx || !spriteCtx || !glowCtx) return null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let cell = 12;
  let cols = 0;
  let rows = 0;
  let rafId = 0;
  let alive = true;
  let onScreen = true;
  let lastFrameTime = 0;
  /** Seconds of simulated time. */
  let clock = 0;
  // Per cell: how long a trace of the bird lingers, how much of it the bird covers (smoothed), its colour (smoothed), and a fixed jitter.
  let trail = new Float32Array(0);
  let density = new Float32Array(0);
  let red = new Float32Array(0);
  let green = new Float32Array(0);
  let blue = new Float32Array(0);
  let jitter = new Float32Array(0);
  let atlas: HTMLCanvasElement | null = null;

  // Positions start as fractions of the screen and are scaled to px on the first step.
  const birds: Bird[] = [createBird(0.18, 0.25, 0.3, 1, 0.7), createBird(0.8, 0.22, 2.6, 0.9, 2.1), createBird(0.25, 0.78, -0.6, 0.82, 3.4), createBird(0.78, 0.76, 3.6, 0.75, 4.9)];
  let placed = false;

  /** Every glyph drawn twice (dark on the top row, light on the bottom) so each cell can pick its ink. */
  const buildAtlas = () => {
    const canvas = document.createElement("canvas");
    const count = RAMP.length + SPECKS.length;
    const size = Math.ceil(cell * dpr);
    canvas.width = size * count;
    canvas.height = size * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = `500 ${Math.round(cell * 0.8 * dpr)}px ${MONO_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    [...RAMP, ...SPECKS].forEach((glyph, i) => {
      ctx.fillStyle = "rgba(20,22,28,.8)";
      ctx.fillText(glyph, i * size + size / 2, size / 2 + dpr * 0.5);
      ctx.fillStyle = "rgba(255,255,255,.88)";
      ctx.fillText(glyph, i * size + size / 2, size + size / 2 + dpr * 0.5);
    });
    atlas = canvas;
  };

  const drawGridLines = () => {
    grid.width = Math.round(width * dpr);
    grid.height = Math.round(height * dpr);
    gridCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gridCtx.clearRect(0, 0, width, height);
    gridCtx.strokeStyle = "rgba(0,0,0,.045)";
    gridCtx.lineWidth = 1 / dpr;
    gridCtx.beginPath();
    for (let x = 0; x <= width; x += cell) {
      gridCtx.moveTo(Math.round(x * dpr) / dpr + 0.5 / dpr, 0);
      gridCtx.lineTo(Math.round(x * dpr) / dpr + 0.5 / dpr, height);
    }
    for (let y = 0; y <= height; y += cell) {
      gridCtx.moveTo(0, Math.round(y * dpr) / dpr + 0.5 / dpr);
      gridCtx.lineTo(width, Math.round(y * dpr) / dpr + 0.5 / dpr);
    }
    gridCtx.stroke();
  };

  const measure = () => {
    const rect = root.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cell = width < 640 ? 7 : width < 1100 ? 8 : 9;
    cols = Math.ceil(width / cell);
    rows = Math.ceil(height / cell);
    ink.width = Math.round(width * dpr);
    ink.height = Math.round(height * dpr);
    sprite.width = cols * SAMPLES;
    sprite.height = rows * SAMPLES;
    const count = cols * rows;
    trail = new Float32Array(count);
    density = new Float32Array(count);
    red = new Float32Array(count);
    green = new Float32Array(count);
    blue = new Float32Array(count);
    jitter = new Float32Array(count);
    for (let i = 0; i < count; i++) jitter[i] = hash(i * 0.731) - 0.5;
    buildAtlas();
    drawGridLines();
    glow.width = Math.ceil(sprite.width / 2);
    glow.height = Math.ceil(sprite.height / 2);
  };

  /** The ellipse in the middle of the screen where the prompt sits and the birds keep out. */
  const promptZone = () => ({ x: width / 2, y: height * 0.47, rx: Math.min(width * 0.36, 380), ry: Math.min(height * 0.2, 150) });

  /** Moves the flock on by `frames` (1 frame = 1/60 s). */
  const step = (frames: number) => {
    const seconds = frames / 60;
    clock += seconds;
    const scale = Math.min(width, height) / 900;
    const zone = promptZone();
    if (!placed && width > 1) {
      for (const bird of birds) {
        bird.x *= width;
        bird.y *= height;
      }
      placed = true;
    }
    for (const bird of birds) {
      bird.flapTimer -= seconds;
      if (bird.flapTimer <= 0) {
        const startFlapping = bird.flapTarget < 0.5;
        bird.flapTarget = startFlapping ? 1 : 0;
        bird.flapTimer = startFlapping ? 0.8 + Math.random() * 1.2 : 1.2 + Math.random() * 2.4;
      }
      bird.dartTimer -= seconds;
      if (bird.dartTimer <= 0) {
        bird.dart = bird.dart > 0.5 ? 0 : 1;
        bird.dartTimer = bird.dart ? 0.6 + Math.random() * 0.5 : 7 + Math.random() * 9;
      }
      const flapGoal = Math.max(bird.boost, bird.flapTarget);
      bird.flap += (flapGoal - bird.flap) * (1 - Math.pow(flapGoal > bird.flap ? 0.9 : 0.95, frames));
      bird.phase += seconds * 2.5 * bird.size ** -0.35 * (0.12 + 0.88 * bird.flap);
      const elevation = flapPose(bird.phase).e;
      const drop = Math.max(0, bird.lastElevation - elevation) * bird.flap;
      bird.lastElevation = elevation;
      bird.surge += (drop * 7 - bird.surge) * (1 - Math.pow(0.9, frames));
      bird.dartBlend += (bird.dart * (1 - bird.flap) - bird.dartBlend) * (1 - Math.pow(0.94, frames));
      const speedGoal = (0.9 + 0.25 * bird.flap + 0.3 * bird.dartBlend + bird.surge * 0.7) * (1 + bird.boost * 0.4);
      bird.speed += (speedGoal - bird.speed) * (1 - Math.pow(0.97, frames));

      let steer = wander(clock * 0.22 + bird.seed * 7) * 0.8 + bird.kick;
      /** Turn towards (or, aimed at a point behind, away from) a target, with the given strength. */
      const steerToward = (tx: number, ty: number, strength: number) => {
        steer += angleDelta(Math.atan2(ty - bird.y, tx - bird.x), bird.heading) * strength;
      };

      // Stay on the screen: head back towards the middle when near an edge.
      const margin = Math.min(width, height) * 0.24;
      const edge = Math.max(0, margin - bird.x, bird.x - (width - margin), margin - bird.y, bird.y - (height - margin)) / margin;
      if (edge > 0) {
        const tx = width / 2 + wander(bird.seed) * width * 0.18;
        const ty = height / 2 + wander(bird.seed + 2) * height * 0.18;
        const behind = Math.max(0, -(Math.cos(bird.heading) * (tx - bird.x) + Math.sin(bird.heading) * (ty - bird.y)) / (Math.hypot(tx - bird.x, ty - bird.y) + 1));
        steerToward(tx, ty, (1.2 + 2.2 * behind) * Math.min(2, edge * 1.4));
      }
      // Keep out of the prompt.
      const ox = (bird.x - zone.x) / (zone.rx * 1.1);
      const oy = (bird.y - zone.y) / (zone.ry * 1.25);
      const promptDistance = Math.hypot(ox, oy);
      if (promptDistance < 1.25) steerToward(bird.x + ox * 100, bird.y + oy * 100, 2.6 * (1.25 - promptDistance));
      // Keep clear of each other.
      for (const other of birds) {
        if (other === bird) continue;
        const dx = bird.x - other.x;
        const dy = bird.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 320 * scale + 90) steerToward(bird.x + dx, bird.y + dy, 2.8 * (1 - distance / (320 * scale + 90)));
      }

      const maxTurn = 1 + bird.dartBlend * 0.5 + Math.min(1, edge);
      steer = Math.max(-maxTurn, Math.min(maxTurn, steer));
      bird.turn += (steer - bird.turn) * (1 - Math.pow(0.93, frames));
      bird.kick *= Math.pow(0.95, frames);
      bird.boost *= Math.pow(0.985, frames);
      bird.heading += bird.turn * seconds;
      const pace = (42 + 62 * scale) * bird.size ** 0.4 * bird.speed;
      bird.x += Math.cos(bird.heading) * pace * seconds;
      bird.y += Math.sin(bird.heading) * pace * seconds;
      bird.bank += (Math.max(-0.85, Math.min(0.85, bird.turn * 0.6)) - bird.bank) * (1 - Math.pow(0.92, frames));
      bird.tail += (bird.turn * 0.4 - bird.tail) * (1 - Math.pow(0.9, frames));
    }
  };

  /** Draws one frame. `snap` jumps straight to the target look instead of easing, for still frames and resizes. */
  const render = (frames: number, snap = false) => {
    spriteCtx.setTransform(1, 0, 0, 1, 0, 0);
    spriteCtx.clearRect(0, 0, sprite.width, sprite.height);
    const toSprite = SAMPLES / cell;
    spriteCtx.setTransform(toSprite, 0, 0, toSprite, 0, 0);
    const scale = Math.min(width, height) / 900;
    for (const bird of birds) {
      const pose = mixPose(mixPose(GLIDE_POSE, DART_POSE, bird.dartBlend), flapPose(bird.phase), bird.flap);
      drawBird(spriteCtx, bird.x, bird.y, bird.heading, Math.max(84, 225 * scale) * bird.size, pose, bird.bank, bird.tail, Math.sin(bird.phase * 6.283) * bird.flap);
    }
    const pixels = spriteCtx.getImageData(0, 0, sprite.width, sprite.height).data;
    const spriteWidth = sprite.width;

    // The soft shadow: the sprite blurred, drawn a little down and to the right.
    inkCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    inkCtx.clearRect(0, 0, width, height);
    glowCtx.clearRect(0, 0, glow.width, glow.height);
    glowCtx.filter = "blur(2px)";
    glowCtx.drawImage(sprite, 0, 0, glow.width, glow.height);
    glowCtx.filter = "none";
    inkCtx.save();
    inkCtx.globalAlpha = 0.13;
    inkCtx.imageSmoothingEnabled = true;
    inkCtx.drawImage(glow, cell * 0.8, cell * 2.2, cols * cell, rows * cell);
    inkCtx.restore();

    const zone = promptZone();
    const glyphSize = Math.ceil(cell * dpr);
    const inset = width < 640 ? 0.5 : 0.75;
    const densityEase = snap ? 1 : 1 - Math.pow(0.55, frames);
    const colorEase = snap ? 1 : 1 - Math.pow(0.7, frames);
    const fullCoverage = SAMPLES * SAMPLES * 255;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Average the cell's sprite pixels, weighting colour by opacity.
        let alphaSum = 0;
        let redSum = 0;
        let greenSum = 0;
        let blueSum = 0;
        for (let sy = 0; sy < SAMPLES; sy++) {
          let p = ((row * SAMPLES + sy) * spriteWidth + col * SAMPLES) * 4;
          for (let sx = 0; sx < SAMPLES; sx++, p += 4) {
            const alpha = pixels[p + 3];
            if (alpha) {
              alphaSum += alpha;
              redSum += pixels[p] * alpha;
              greenSum += pixels[p + 1] * alpha;
              blueSum += pixels[p + 2] * alpha;
            }
          }
        }
        const i = row * cols + col;
        if (alphaSum > 0) {
          const ease = density[i] < 0.02 ? 1 : colorEase;
          red[i] += (redSum / alphaSum - red[i]) * ease;
          green[i] += (greenSum / alphaSum - green[i]) * ease;
          blue[i] += (blueSum / alphaSum - blue[i]) * ease;
        }
        const coverage = alphaSum / fullCoverage;
        density[i] += (coverage - density[i]) * densityEase;
        const d = density[i];
        if (coverage > 0.3) trail[i] = Math.max(trail[i], 0.85);
        if (d < 0.03 && trail[i] < 0.08) continue;

        const px = col * cell;
        const py = row * cell;
        // 0 far from the prompt .. 1 right over it: the sky fades out behind the prompt.
        const nx = (px + cell / 2 - zone.x) / zone.rx;
        const ny = (py + cell / 2 - zone.y) / zone.ry;
        const shield = Math.max(0, Math.min(1, 1.35 - Math.sqrt(nx * nx + ny * ny)));

        if (d >= 0.03) {
          const r = red[i];
          const g = green[i];
          const b = blue[i];
          const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const fillAlpha = Math.min(1, d * 1.15) * (1 - shield * 0.72);
          inkCtx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${(fillAlpha * 0.8).toFixed(3)})`;
          inkCtx.fillRect(px + inset, py + inset, cell - inset * 2, cell - inset * 2);
          if (shield < 0.75 && atlas && d > 0.08) {
            const glyph = Math.max(0, Math.min(RAMP.length - 1, Math.floor(Math.pow(d, 1.2) * (1.15 - luma * 0.7) * RAMP.length * 0.92 + jitter[i] * 2.2)));
            const lightInk = luma < 0.42 && d > 0.45 ? 1 : 0;
            inkCtx.globalAlpha = Math.min(1, (d - 0.08) * 1.6) * (1 - shield);
            inkCtx.drawImage(atlas, glyph * glyphSize, lightInk * glyphSize, glyphSize, glyphSize, px, py, cell, cell);
            inkCtx.globalAlpha = 1;
          }
        } else if (atlas && shield < 0.6 && jitter[i] < -0.08) {
          // Where a bird has just been, a faint speck lingers.
          const speck = RAMP.length + (Math.floor((jitter[i] + 0.5) * 2 * SPECKS.length) % SPECKS.length);
          inkCtx.globalAlpha = trail[i] * 0.5 * (1 - shield);
          inkCtx.drawImage(atlas, speck * glyphSize, 0, glyphSize, glyphSize, px, py, cell, cell);
          inkCtx.globalAlpha = 1;
        }
        trail[i] *= Math.pow(jitter[i] > 0 ? 0.975 : 0.96, frames);
      }
    }

    // A few motes drifting across the whole sky.
    if (atlas) {
      for (let n = 0; n < 26; n++) {
        const mx = (hash(n) * width + clock * (8 + hash(n + 9) * 14)) % width;
        const my = (hash(n + 3) * height + Math.sin(clock * 0.3 + n) * 20 + height) % height;
        inkCtx.globalAlpha = 0.22;
        inkCtx.drawImage(atlas, RAMP.length * glyphSize, 0, glyphSize, glyphSize, Math.floor(mx / cell) * cell, Math.floor(my / cell) * cell, cell, cell);
      }
    }
    inkCtx.globalAlpha = 1;
  };

  const frame = (time: number) => {
    rafId = 0;
    if (!alive) return;
    const frames = lastFrameTime ? Math.min(3, (time - lastFrameTime) / 16.667) : 1;
    lastFrameTime = time;
    step(frames);
    render(frames);
    if (onScreen) rafId = requestAnimationFrame(frame);
  };

  /** Starts the loop if it should be running and is not. */
  const wake = () => {
    if (!rafId && alive && onScreen && !reducedMotion && animate) {
      lastFrameTime = 0;
      rafId = requestAnimationFrame(frame);
    }
  };

  const resizeObserver = new ResizeObserver(() => {
    measure();
    if (!rafId) render(1, true);
  });
  resizeObserver.observe(root);
  measure();
  // Settle the flock before the first frame so it does not start in a cluster.
  for (let n = 0; n < 120; n++) step(1);
  render(1, true);
  wake();
  // The glyphs are drawn in Geist Mono when it is available: redraw them once it has loaded.
  document.fonts
    ?.load('500 20px "Geist Mono Variable"')
    .then(() => {
      if (alive) {
        buildAtlas();
        if (!rafId) render(1, true);
      }
    })
    .catch(() => {});

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) wake();
  });
  intersectionObserver.observe(root);
  const onVisibility = () => {
    onScreen = !document.hidden;
    if (onScreen) wake();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    startle: (x, y) => {
      for (const bird of birds) {
        const dx = bird.x - x;
        const dy = bird.y - y;
        const distance = Math.hypot(dx, dy) + 1;
        if (distance < 380) {
          const away = Math.atan2(dy, dx);
          const off = angleDelta(away, bird.heading);
          bird.kick = Math.sign(off || 1) * 2.6 * (1 - distance / 380) + off * 0.6;
          bird.boost = 1;
        }
      }
    },
    release: () => {
      for (const bird of birds) bird.boost = 1;
    },
    destroy: () => {
      alive = false;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}

/**
 * Murmur: a writing assistant's landing screen. Four swallows fly around a floating prompt box, and they are drawn
 * twice over: first as vector shapes, then re-rendered as a live grid of coloured cells and ASCII glyphs on a 2D
 * canvas, so the sky looks like a field of type. Tap the sky near a bird and it startles away; send the prompt and
 * every bird takes off at full flap while a line below the box says what is being drafted.
 *
 * The birds fly on their own, wandering, keeping clear of the edges, the prompt and each other, flapping in bursts
 * and gliding in between. The loop stops while the screen is off screen or the tab is hidden, and under reduced
 * motion (or with `autoplay` off) the sky is drawn once and stays still.
 */
export default function Murmur({ height = "fill", autoplay = true, className = "" }: MurmurProps) {
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const timers = useRef<number[]>([]);
  const [prompt, setPrompt] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ink = inkRef.current;
    const grid = gridRef.current;
    if (!root || !ink || !grid) return;
    const scene = createScene(root, ink, grid, autoplay);
    sceneRef.current = scene;
    return () => {
      scene?.destroy();
      sceneRef.current = null;
    };
  }, [autoplay]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    },
    [],
  );

  const submit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const text = prompt.trim();
    if (!text) return;
    if (sendRef.current && rootRef.current) sceneRef.current?.release();
    setSent(text);
    setPrompt("");
    timers.current.push(window.setTimeout(() => setSent(null), 2600));
  };

  const onPointerDown = (event: RPointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("[data-ui]")) return;
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    sceneRef.current?.startle(event.clientX - rect.left, event.clientY - rect.top);
  };

  const onKeyDown = (event: RKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) submit(event);
  };

  const canSend = prompt.trim().length > 0;

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        onPointerDown={onPointerDown}
        className={`murmur relative w-full overflow-hidden ${height === "fill" ? "h-full" : ""} ${className}`}
        style={{
          ...(height === "fill" ? null : { height }),
          background: "#f5f5f7",
          color: "#1d1d1f",
          fontFamily: UI_FONT,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <style>{FOCUS_STYLES}</style>
        <canvas ref={gridRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={inkRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse min(560px,60vw) min(260px,30vh) at 50% 47%, rgba(245,245,247,.92) 0%, rgba(245,245,247,.6) 45%, rgba(245,245,247,0) 100%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            WebkitMaskImage: "radial-gradient(ellipse min(520px,58vw) min(230px,27vh) at 50% 47%, #000 30%, transparent 100%)",
            maskImage: "radial-gradient(ellipse min(520px,58vw) min(230px,27vh) at 50% 47%, #000 30%, transparent 100%)",
          }}
        />

        <header data-ui className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 sm:px-8">
          <div className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path d="M2 11.5c3.2-.6 5.6.2 7.3 2.1C10.4 9.3 14 6.6 21.5 6c-3.3 1.9-5.4 4.4-6.2 7.6 1.8-.5 3.5-.4 5.2.3-3.9.6-7.2 2.6-9.8 5.9-1.3-3.5-4.2-6.3-8.7-8.3Z" fill="#1f3366" />
            </svg>
            Murmur
          </div>
          <button type="button" className="murmur-ring flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium outline-none transition-transform active:scale-95" style={GLASS_STYLE}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5M12 7v5l3 2" />
            </svg>
            Drafts
          </button>
        </header>

        <main data-ui className="absolute inset-x-0 flex flex-col items-center px-5" style={{ top: "47%", transform: "translateY(-50%)" }}>
          <motion.h1
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="m-0 text-center font-light tracking-[-0.045em] text-balance"
            style={{ fontSize: "clamp(34px, 6vw, 64px)", lineHeight: 1.04 }}
          >
            What do you want to say?
          </motion.h1>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 w-full max-w-[620px] rounded-[22px] p-3 pl-4"
            style={GLASS_STYLE}
          >
            <label htmlFor={inputId} className="sr-only">
              Ask Murmur to write something
            </label>
            <textarea
              id={inputId}
              rows={2}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="A thank-you note to the team, a hard email, a toast for Saturday..."
              className="block w-full resize-none bg-transparent text-[16px] leading-[1.45] outline-none"
            />
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center gap-1" style={{ color: "#6e6e73" }}>
                {TOOLBAR.map(({ label, icon }) => (
                  <button key={label} type="button" aria-label={label} className="murmur-ring grid h-8 w-8 place-items-center rounded-full outline-none transition-colors hover:bg-black/5">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                      {icon}
                    </svg>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-[12px] sm:inline" style={{ color: "#8e8e93" }}>
                  Return to send, Shift Return for a new line
                </span>
                <motion.button
                  ref={sendRef}
                  type="submit"
                  aria-label="Send"
                  whileTap={{ scale: 0.9 }}
                  disabled={!canSend}
                  className="murmur-ring grid h-9 w-9 place-items-center rounded-full text-white outline-none transition-colors"
                  style={{ background: canSend ? "#1d1d1f" : "#d1d1d6" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 19V5M6 11l6-6 6 6" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.form>

          <div className="mt-4 h-6 text-[13px]" aria-live="polite" style={{ color: "#6e6e73" }}>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.span key="sent" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  Drafting “{sent.length > 40 ? sent.slice(0, 40) + "..." : sent}”. The swallows are on it.
                </motion.span>
              ) : (
                <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Tap the sky near a swallow.
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
```
