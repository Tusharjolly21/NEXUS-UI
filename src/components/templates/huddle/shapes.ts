/** A point in the 100 by 100 box every shape is drawn in. */
export type Point = [number, number];
/** One mark of a face: a filled path, or a stroked one with its width. */
export type Feature = { d: string; fill?: string; stroke?: string; w?: number };

export const SHAPES = [
  {
    key: "blob",
    label: "Blob",
    eyeY: 47,
    gap: 13,
    face: 1,
  },
  {
    key: "star",
    label: "Star",
    eyeY: 54,
    gap: 9.5,
    face: 0.8,
  },
  {
    key: "flower",
    label: "Flower",
    eyeY: 50,
    gap: 11.5,
    face: 0.92,
  },
  {
    key: "shield",
    label: "Shield",
    eyeY: 42,
    gap: 12.5,
    face: 0.98,
  },
  {
    key: "cloud",
    label: "Cloud",
    eyeY: 55,
    gap: 13,
    face: 0.96,
  },
  {
    key: "heart",
    label: "Heart",
    eyeY: 42,
    gap: 13.5,
    face: 0.94,
  },
  {
    key: "diamond",
    label: "Gem",
    eyeY: 49,
    gap: 10.5,
    face: 0.86,
  },
  {
    key: "squircle",
    label: "Pebble",
    eyeY: 46,
    gap: 13.5,
    face: 1.02,
  },
  {
    key: "drop",
    label: "Drop",
    eyeY: 64,
    gap: 11,
    face: 0.88,
  },
];

export const SHAPE_BY_KEY: Record<string, (typeof SHAPES)[number]> = Object.fromEntries(
  SHAPES.map((shape) => [shape.key, shape]),
);

const SHAPE_TESTS: Record<string, (x: number, y: number) => boolean> = {
  blob: (x, y) => Math.pow(Math.abs(x / (0.94 + 0.14 * y)), 2.2) + Math.pow(Math.abs(y / 0.84), y > 0 ? 3.2 : 2.1) < 1,
  star: (x, y) => {
    const radius = Math.hypot(x, y);
    const angle = Math.atan2(y, x);
    return radius < 0.5 + 0.5 * Math.pow((Math.cos(5 * (angle + Math.PI / 2)) + 1) / 2, 1.5);
  },
  flower: (x, y) => {
    const radius = Math.hypot(x, y);
    const angle = Math.atan2(y, x);
    return radius < 0.7 + 0.3 * Math.pow((Math.cos(6 * angle + Math.PI / 2) + 1) / 2, 0.55);
  },
  shield: (x, y) => {
    if (y < -0.84 - 0.1 * (1 - x * x)) {
      return false;
    }
    if (y < 0.12) {
      return Math.abs(x) < 0.9;
    }
    const depth = (y - 0.12) / 0.98;
    return depth < 1 && Math.abs(x) < 0.9 * Math.pow(1 - Math.pow(depth, 1.7), 0.62);
  },
  cloud: (x, y) => {
    const puffs = [
      [-0.5, 0.18, 0.42],
      [-0.05, -0.18, 0.56],
      [0.48, 0.08, 0.44],
      [0.78, 0.36, 0.26],
      [-0.8, 0.4, 0.24],
    ];
    return x > -0.86 && x < 0.86 && y > 0.1 && y < 0.6
      ? true
      : puffs.some(([cx, cy, size]) => (x - cx) ** 2 + (y - cy) ** 2 < size * size);
  },
  heart: (x, y) => {
    const hx = x * 1.18;
    const hy = -y * 1.18 + 0.12;
    const curve = hx * hx + hy * hy - 1;
    return curve * curve * curve - hx * hx * hy * hy * hy < 0;
  },
  diamond: (x, y) => Math.pow(Math.abs(x / 0.86), 1.35) + Math.pow(Math.abs(y), 1.35) < 1,
  squircle: (x, y) => Math.pow(Math.abs(x), 4) + Math.pow(Math.abs(y / 0.92), 4) < 1,
  drop: (x, y) => {
    const up = -y;
    if (Math.abs(up) > 1) {
      return false;
    }
    const theta = Math.acos(up);
    return Math.abs(x) < Math.sin(theta) * Math.pow(Math.sin(theta / 2), 1.25) * 1.05;
  },
};

const SHAPE_GRID = 144;

const outlineCache = new Map<string, Point[]>();

export function shapeOutline(key: string): Point[] {
  const cached = outlineCache.get(key);
  if (cached) {
    return cached;
  }
  const inside = SHAPE_TESTS[key];
  let points: Point[] = [];
  for (let step = 0; step < 240; step++) {
    const angle = (step / 240) * Math.PI * 2 - Math.PI / 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let reach = 1.6;
    while (reach > 0.02 && !inside(dx * reach, dy * reach)) {
      reach -= 0.004;
    }
    points.push([dx * reach, dy * reach]);
  }
  for (let pass = 0; pass < 9; pass++) {
    points = points.map((point, index) => {
      const prev = points[(index + points.length - 1) % points.length];
      const next = points[(index + 1) % points.length];
      return [
        point[0] + 0.5 * ((prev[0] + next[0]) / 2 - point[0]),
        point[1] + 0.5 * ((prev[1] + next[1]) / 2 - point[1]),
      ] as Point;
    });
  }
  const lengths = [0];
  for (let index = 1; index <= points.length; index++) {
    const from = points[index - 1];
    const to = points[index % points.length];
    lengths.push(lengths[index - 1] + Math.hypot(to[0] - from[0], to[1] - from[1]));
  }
  const total = lengths[lengths.length - 1];
  const samples: Point[] = [];
  let segment = 0;
  for (let index = 0; index < SHAPE_GRID; index++) {
    const along = (index / SHAPE_GRID) * total;
    while (lengths[segment + 1] < along) {
      segment++;
    }
    const from = points[segment];
    const to = points[(segment + 1) % points.length];
    const t = (along - lengths[segment]) / (lengths[segment + 1] - lengths[segment] || 1);
    samples.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
  }
  const xs = samples.map((point) => point[0]);
  const ys = samples.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scale = Math.min(84 / (maxX - minX), 84 / (maxY - minY));
  const fitted = samples.map(([x, y]): Point => [
    50 + (x - (minX + maxX) / 2) * scale,
    50 + (y - (minY + maxY) / 2) * scale,
  ]);
  outlineCache.set(key, fitted);
  return fitted;
}

const round1 = (value: number) => (Math.round(value * 10) / 10).toString();

const pointsToPath = (points: Point[], close = true) =>
  points.map((point, index) => `${index ? "L" : "M"}${round1(point[0])} ${round1(point[1])}`).join("") +
  (close ? "Z" : "");

const pathCache = new Map<string, string>();

export function shapePath(key: string) {
  const cached = pathCache.get(key);
  if (cached) {
    return cached;
  }
  const points = shapeOutline(key).filter((point, index) => index % 3 === 0);
  const count = points.length;
  let d = `M${round1(points[0][0])} ${round1(points[0][1])}`;
  for (let index = 0; index < count; index++) {
    const p0 = points[(index - 1 + count) % count];
    const p1 = points[index];
    const p2 = points[(index + 1) % count];
    const p3 = points[(index + 2) % count];
    d += `C${round1(p1[0] + (p2[0] - p0[0]) / 6)} ${round1(p1[1] + (p2[1] - p0[1]) / 6)} ${round1(p2[0] - (p3[0] - p1[0]) / 6)} ${round1(p2[1] - (p3[1] - p1[1]) / 6)} ${round1(p2[0])} ${round1(p2[1])}`;
  }
  pathCache.set(key, d + "Z");
  return d + "Z";
}

const FEATURE_INK = "#16161B";

const arcPoints = (cx: number, cy: number, rx: number, ry = rx, steps = 30): Point[] =>
  Array.from(
    {
      length: steps,
    },
    (_, index) => {
      const angle = (index / steps) * Math.PI * 2;
      return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
    },
  );

const ellipsePoints = (cx: number, cy: number, rx: number, from: number, to: number, steps = 16): Point[] =>
  Array.from(
    {
      length: steps + 1,
    },
    (_, index) => {
      const angle = from + ((to - from) * index) / steps;
      return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * rx];
    },
  );

function strokeOutline(points: Point[], nx: number, ny: number, offset: number): Point[] {
  const out: Point[] = [];
  for (let index = 0; index < points.length; index++) {
    const from = points[index];
    const to = points[(index + 1) % points.length];
    const sideFrom = nx * from[0] + ny * from[1] + offset;
    const sideTo = nx * to[0] + ny * to[1] + offset;
    if (sideFrom <= 0) {
      out.push(from);
    }
    if (sideFrom <= 0 != sideTo <= 0) {
      const t = sideFrom / (sideFrom - sideTo);
      out.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
    }
  }
  return out;
}

const smilePoints = (cx: number, cy: number, size: number): Point[] =>
  Array.from(
    {
      length: 36,
    },
    (_, index) => {
      const angle = (index / 36) * Math.PI * 2;
      return [
        cx + (size * 16 * Math.pow(Math.sin(angle), 3)) / 16,
        cy -
          (size * (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle))) /
            16,
      ];
    },
  );

const frownPoints = (cx: number, cy: number, size: number): Point[] =>
  Array.from(
    {
      length: 32,
    },
    (_, index) => {
      const angle = (index / 32) * Math.PI * 2;
      const wobble = Math.pow(Math.abs(Math.cos(2 * angle)), 3) * 0.66 + 0.34;
      return [cx + Math.cos(angle) * size * wobble, cy + Math.sin(angle) * size * wobble];
    },
  );

export const EXPRESSIONS = [
  {
    key: "dot",
    label: "Calm",
  },
  {
    key: "bean",
    label: "Curious",
  },
  {
    key: "wide",
    label: "Alert",
  },
  {
    key: "happy",
    label: "Happy",
  },
  {
    key: "sleepy",
    label: "Sleepy",
  },
  {
    key: "wink",
    label: "Wink",
  },
  {
    key: "sparkle",
    label: "Bright",
  },
  {
    key: "focused",
    label: "Focused",
  },
  {
    key: "angry",
    label: "Stern",
  },
  {
    key: "sad",
    label: "Soft",
  },
  {
    key: "surprised",
    label: "Surprised",
  },
  {
    key: "dizzy",
    label: "Dizzy",
  },
  {
    key: "hearts",
    label: "Smitten",
  },
  {
    key: "stars",
    label: "Starry",
  },
  {
    key: "flat",
    label: "Unbothered",
  },
  {
    key: "glasses",
    label: "Studious",
  },
];

export function drawFeatures(eyes: string, shapeKey: string, look: number[] = [0, 0], blink = 0): Feature[] {
  const shape = SHAPE_BY_KEY[shapeKey];
  const scale = shape.face * 1.3;
  const eyeY = shape.eyeY;
  const out: Feature[] = [];
  const lookX = look[0] * 2.4 * scale;
  const lookY = look[1] * 2 * scale;
  const squint = (points: Point[], cx: number, cy: number): Point[] =>
    blink ? points.map(([px, py]) => [px, cy + (py - cy) * (1 - blink * 0.94)]) : points;
  const fill = (points: Point[], color = FEATURE_INK) =>
    out.push({
      d: pointsToPath(points),
      fill: color,
    });
  const stroke = (points: Point[], width = 3) =>
    out.push({
      d: pointsToPath(points, false),
      stroke: FEATURE_INK,
      w: width * scale,
    });
  const dot = (cx: number, cy: number, radius: number) => {
    if (blink < 0.5) {
      fill(arcPoints(cx, cy, radius * scale, radius * scale, 14), "#FFFFFF");
    }
  };
  const ring = (cx: number, cy: number) =>
    out.push({
      d: pointsToPath(arcPoints(cx, cy, 4.6 * scale, 2.4 * scale, 20)),
      fill: "rgba(255,110,140,.42)",
    });
  [-1, 1].forEach((side) => {
    const eyeX = 50 + side * shape.gap * 1.14;
    const cx = eyeX + lookX;
    const cy = eyeY + lookY;
    switch (eyes) {
      case "dot":
        fill(squint(arcPoints(cx, cy, 4.9 * scale, 5.6 * scale), eyeX, eyeY));
        dot(cx + 1.6 * scale, cy - 2 * scale, 1.5);
        break;
      case "bean":
        fill(squint(arcPoints(cx, cy, 4 * scale, 7 * scale), eyeX, eyeY));
        dot(cx + 1.3 * scale, cy - 3 * scale, 1.4);
        break;
      case "wide": {
        out.push({
          d: pointsToPath(squint(arcPoints(eyeX, eyeY, 8 * scale, 8.4 * scale), eyeX, eyeY)),
          fill: "#FFFFFF",
          stroke: FEATURE_INK,
          w: 1.6 * scale,
        });
        if (blink < 0.6) {
          fill(arcPoints(eyeX + lookX * 1.15, eyeY + lookY * 1.15, 4.3 * scale));
          dot(eyeX + lookX * 1.15 + 1.5 * scale, eyeY + lookY * 1.15 - 1.6 * scale, 1.3);
        }
        break;
      }
      case "happy":
        stroke(ellipsePoints(eyeX, eyeY + 3 * scale, 5.6 * scale, Math.PI * 1.12, Math.PI * 1.88), 3.2);
        break;
      case "sleepy":
        fill(squint(strokeOutline(arcPoints(cx, cy, 5.4 * scale, 5.4 * scale), 0, -1, cy + 0.2), eyeX, eyeY));
        stroke(
          [
            [cx - 6.2 * scale, cy + 0.2],
            [cx + 6.2 * scale, cy + 0.2],
          ],
          2.2,
        );
        break;
      case "wink":
        if (side < 0) {
          fill(squint(arcPoints(cx, cy, 4.9 * scale, 5.6 * scale), eyeX, eyeY));
          dot(cx + 1.6 * scale, cy - 2 * scale, 1.5);
        } else {
          stroke(ellipsePoints(eyeX, eyeY + 3 * scale, 5.4 * scale, Math.PI * 1.12, Math.PI * 1.88), 3.2);
        }
        if (side > 0) {
          ring(eyeX + 4 * scale, eyeY + 9 * scale);
        }
        break;
      case "sparkle":
        fill(squint(arcPoints(cx, cy, 6.2 * scale, 6.6 * scale), eyeX, eyeY));
        dot(cx + 2 * scale, cy - 2.3 * scale, 2.1);
        dot(cx - 2.2 * scale, cy + 2.4 * scale, 1);
        break;
      case "focused":
        fill(squint(strokeOutline(arcPoints(cx, cy, 5.4 * scale, 5.6 * scale), 0, -1, cy - 1.6 * scale), eyeX, eyeY));
        dot(cx + 1.8 * scale, cy, 1.3);
        break;
      case "angry": {
        const lid = strokeOutline(
          arcPoints(cx, cy, 5.6 * scale, 5.8 * scale),
          side * 0.42,
          -1,
          cy - 2.6 * scale - side * 0.42 * cx,
        );
        fill(squint(lid, eyeX, eyeY));
        dot(cx + 1.4 * scale, cy + 0.6 * scale, 1.2);
        break;
      }
      case "sad": {
        const lid = strokeOutline(
          arcPoints(cx, cy, 5.4 * scale, 5.8 * scale),
          -side * 0.45,
          -1,
          cy - 2.2 * scale + side * 0.45 * cx,
        );
        fill(squint(lid, eyeX, eyeY));
        dot(cx + 1.4 * scale, cy + 0.8 * scale, 1.3);
        break;
      }
      case "surprised":
        out.push({
          d: pointsToPath(squint(arcPoints(eyeX, eyeY, 7.4 * scale, 8.4 * scale), eyeX, eyeY)),
          fill: "#FFFFFF",
          stroke: FEATURE_INK,
          w: 1.8 * scale,
        });
        if (blink < 0.6) {
          fill(arcPoints(eyeX + lookX * 0.9, eyeY + lookY * 0.9, 2.5 * scale));
        }
        break;
      case "dizzy": {
        const swirl = Array.from(
          {
            length: 40,
          },
          (_, step): Point => {
            const t = step / 39;
            const angle = t * Math.PI * 4.2 * side;
            const radius = (0.6 + t * 5.6) * scale;
            return [eyeX + Math.cos(angle) * radius, eyeY + Math.sin(angle) * radius];
          },
        );
        stroke(swirl, 2);
        break;
      }
      case "hearts":
        fill(squint(smilePoints(cx, cy, 6.4 * scale), eyeX, eyeY));
        dot(cx + 2 * scale, cy - 2.2 * scale, 1.2);
        ring(eyeX + side * 5 * scale, eyeY + 9.5 * scale);
        break;
      case "stars":
        fill(squint(frownPoints(cx, cy, 7.4 * scale), eyeX, eyeY));
        break;
      case "flat":
        stroke(
          [
            [eyeX - 5.4 * scale + lookX * 0.6, eyeY + 1],
            [eyeX + 5.4 * scale + lookX * 0.6, eyeY + 1],
          ],
          3.4,
        );
        break;
      case "glasses":
        fill(squint(arcPoints(cx, cy, 3.6 * scale, 4.2 * scale), eyeX, eyeY));
        dot(cx + 1.2 * scale, cy - 1.5 * scale, 1.1);
        out.push({
          d: pointsToPath(arcPoints(eyeX, eyeY, 8.4 * scale, 7.8 * scale, 36)),
          stroke: FEATURE_INK,
          w: 1.9 * scale,
        });
        if (side > 0) {
          stroke(
            [
              [50 - shape.gap * 1.14 + 8.4 * scale, eyeY - 1],
              [50 + shape.gap * 1.14 - 8.4 * scale, eyeY - 1],
            ],
            1.9,
          );
        }
        break;
    }
  });
  if (eyes === "happy") {
    ring(50 - shape.gap * 1.14 - 3 * scale, eyeY + 9 * scale);
    ring(50 + shape.gap * 1.14 + 3 * scale, eyeY + 9 * scale);
  }
  return out;
}

export const AGENT_COLORS = [
  {
    hex: "#FF8A65",
    name: "Coral",
  },
  {
    hex: "#FFC94D",
    name: "Sun",
  },
  {
    hex: "#6EDC8C",
    name: "Mint",
  },
  {
    hex: "#45D3C7",
    name: "Lagoon",
  },
  {
    hex: "#5AA9FF",
    name: "Sky",
  },
  {
    hex: "#8C7CFF",
    name: "Iris",
  },
  {
    hex: "#D77BF5",
    name: "Orchid",
  },
  {
    hex: "#FF6B8B",
    name: "Rose",
  },
  {
    hex: "#D9B98C",
    name: "Sand",
  },
  {
    hex: "#A3ADBF",
    name: "Slate",
  },
];
