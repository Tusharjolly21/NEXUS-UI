import type { Point } from "./types";

/** Generators for the two one-off effects: shooting stars on the night sky and lightning in the storm. */

export type Meteor = {
  x: number;
  y: number;
  /** Unit direction of travel. */
  dx: number;
  dy: number;
  /** Streak length in pixels. */
  len: number;
  /** Duration in milliseconds, and the frame time it started. */
  dur: number;
  t0: number;
  /** 0.6 to 2.4. */
  size: number;
  /** Colour as "r,g,b". */
  col: string;
  /** Bright meteors leave a fading smoke trail. */
  train: boolean;
  /** Some meteors flare brighter partway along. */
  flare: number;
};

/**
 * A meteor. Seven in ten come from the month's radiant (if it is in view) and fan out from it, tinted green;
 * the rest streak across at a shallow downward angle.
 */
export function createMeteor(width: number, height: number, now: number, radiant: Point | null): Meteor {
  const rand = Math.random;
  const fromRadiant = !!radiant && rand() < 0.7;
  const x = width * (0.08 + rand() * 0.84);
  const y = height * (0.04 + rand() * 0.5);
  let dirX: number;
  let dirY: number;
  if (fromRadiant && radiant) {
    dirX = x - radiant[0];
    dirY = y - radiant[1];
  } else {
    const angle = (rand() < 0.5 ? 0.35 : Math.PI - 0.35) + (rand() - 0.5) * 0.9;
    dirX = Math.cos(angle);
    dirY = Math.abs(Math.sin(angle)) * (rand() < 0.85 ? 1 : -1);
  }
  const length = Math.hypot(dirX, dirY) || 1;
  const size = Math.pow(rand(), 2.2) * 1.8 + 0.6;
  return {
    x,
    y,
    dx: dirX / length,
    dy: dirY / length,
    len: Math.min(width, 1400) * (0.07 + rand() * 0.2) * (0.7 + size * 0.3),
    dur: fromRadiant ? 220 + rand() * 380 : 380 + rand() * 650,
    t0: now,
    size,
    col: fromRadiant ? "214,255,228" : rand() < 0.5 ? "255,244,214" : "236,242,255",
    train: size > 1.5,
    flare: rand() < 0.3 ? 0.35 + rand() * 0.5 : 0,
  };
}

/** One segment of a bolt: from (x1, y1) to (x2, y2) with a line width. */
export type BoltSegment = [x1: number, y1: number, x2: number, y2: number, width: number];

export type Bolt = {
  segments: BoltSegment[];
  t0: number;
  /** Where the flash is centred. */
  x: number;
  y: number;
  /** A "sheet" is just the clouds lighting up, with no visible fork. */
  sheet: boolean;
};

/** A forked bolt: a jittery walk downward that sometimes branches, thinning toward its end. */
export function createBolt(width: number, height: number, now: number, sheet: boolean): Bolt {
  const rand = Math.random;
  const segments: BoltSegment[] = [];
  const startX =
    width > 700 ? width * (rand() < 0.5 ? 0.04 + rand() * 0.2 : 0.76 + rand() * 0.2) : width * (0.12 + rand() * 0.76);
  const startY = height * (0.04 + rand() * 0.08);

  const walk = (x0: number, y0: number, length: number, heading: number, thickness: number, depth: number) => {
    let x = x0;
    let y = y0;
    const steps = Math.max(4, Math.round(length / 9));
    for (let step = 0; step < steps; step++) {
      // Wander, but lean back toward straight down.
      heading += (rand() - 0.5) * 0.9;
      heading = heading * 0.8 + (Math.PI / 2) * 0.2;
      const stride = (length / steps) * (0.6 + rand() * 0.8);
      const nextX = x + Math.cos(heading) * stride;
      const nextY = y + Math.sin(heading) * stride;
      segments.push([x, y, nextX, nextY, thickness * (1 - (step / steps) * 0.45)]);
      x = nextX;
      y = nextY;
      if (depth < 2 && rand() < 0.09) {
        walk(x, y, length * (0.18 + rand() * 0.25), heading + (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.6), thickness * 0.45, depth + 1);
      }
      if (y > height * 1.02) break;
    }
  };

  if (!sheet) walk(startX, startY, height * (0.6 + rand() * 0.45), Math.PI / 2 + (rand() - 0.5) * 0.5, Math.max(1.2, height / 520), 0);
  return { segments, t0: now, x: startX, y: startY + height * 0.06, sheet };
}

/** Flash brightness (0..1) over the first 480 ms of a strike: a hard flash, a flicker and a slow fade. */
const FLASH_CURVE: [ms: number, level: number][] = [
  [0, 0],
  [25, 1],
  [70, 0.12],
  [110, 0.85],
  [150, 0.08],
  [215, 0.6],
  [300, 0.18],
  [480, 0],
];

export function flashLevel(ms: number) {
  for (let i = 1; i < FLASH_CURVE.length; i++) {
    if (ms < FLASH_CURVE[i][0]) {
      const [t0, v0] = FLASH_CURVE[i - 1];
      const [t1, v1] = FLASH_CURVE[i];
      return v0 + (v1 - v0) * ((ms - t0) / (t1 - t0));
    }
  }
  return 0;
}
