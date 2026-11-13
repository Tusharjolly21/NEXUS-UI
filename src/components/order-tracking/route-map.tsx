import { memo } from "react";

/*
 * The neighbourhood under the tracker, drawn on a 640 × 600 grid like a city map: land, building footprints,
 * a park with footpaths, a canal with a green bank, roads with casings (main roads wider), and street names
 * that sit on their roads. Everything is computed from fixed numbers and a seeded random, so the server and
 * the browser draw exactly the same map.
 */

export const MAP_W = 640;
export const MAP_H = 600;

type Street = { at: number; major?: boolean; name?: string; labelAt?: number };
/** Streets running north–south (x) and east–west (y). */
const VERTICAL: Street[] = [
  { at: 40 },
  { at: 150, name: "MILL ST", labelAt: 190 },
  { at: 270, major: true, name: "KING ST", labelAt: 120 },
  { at: 400, name: "FERRY ST", labelAt: 360 },
  { at: 520 },
  { at: 610 },
];
const HORIZONTAL: Street[] = [
  { at: 70, name: "CALDER LANE", labelAt: 330 },
  { at: 170 },
  { at: 290, major: true, name: "LINDEN AVENUE", labelAt: 470 },
  { at: 400 },
  { at: 540, major: true, name: "HARBOUR ROAD", labelAt: 330 },
];
const MAJOR = 13;
const MINOR = 7;

/** The park fills the block between Ferry St, the street east of it, and the two streets above Linden Ave. */
const PARK = { x0: 400, x1: 520, y0: 170, y1: 290 };
/** The canal runs across the block between y = 400 and Harbour Road, so that row has no buildings. */
const CANAL = "M-20 470 C 120 442, 220 500, 340 474 S 560 448, 660 468";
const CANAL_ROW = { y0: 400, y1: 540 };

/** The courier's route from the hub to the door, as corner points. Corners are rounded when drawn. */
export const ROUTE_POINTS: [number, number][] = [
  [150, 540],
  [150, 290],
  [400, 290],
  [400, 170],
  [520, 170],
  [520, 70],
  [588, 70],
];
const CORNER = 14;

function roundedPath(pts: [number, number][], r: number) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    const inX = Math.sign(x - px);
    const inY = Math.sign(y - py);
    const outX = Math.sign(nx - x);
    const outY = Math.sign(ny - y);
    d += ` L${x - inX * r} ${y - inY * r} Q${x} ${y} ${x + outX * r} ${y + outY * r}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d} L${lx} ${ly}`;
}

export const ROUTE = roundedPath(ROUTE_POINTS, CORNER);
export const PICKUP = { x: ROUTE_POINTS[0][0], y: ROUTE_POINTS[0][1] };
export const DROPOFF = { x: ROUTE_POINTS[ROUTE_POINTS.length - 1][0], y: ROUTE_POINTS[ROUTE_POINTS.length - 1][1] };
export const STOPS = [
  { x: 270, y: 290, label: "Drop-off 1, 12 Linden Ave" },
  { x: 400, y: 230, label: "Drop-off 2, 31 Ferry St" },
];

/** Direction arrows along the straight parts of the route, every 30 units, pointing the way the courier goes. */
export const ROUTE_ARROWS: { x: number; y: number; angle: number }[] = (() => {
  const out: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i < ROUTE_POINTS.length - 1; i++) {
    const [ax, ay] = ROUTE_POINTS[i];
    const [bx, by] = ROUTE_POINTS[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    const start = i === 0 ? 26 : CORNER + 12;
    const end = len - (i === ROUTE_POINTS.length - 2 ? 30 : CORNER + 12);
    for (let t = start; t <= end; t += 30) out.push({ x: ax + ux * t, y: ay + uy * t, angle: (Math.atan2(uy, ux) * 180) / Math.PI });
  }
  return out;
})();

/** Small, fast, seeded random (mulberry32), so every render draws the same buildings. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Box = { x: number; y: number; w: number; h: number };

const BUILDINGS: Box[] = (() => {
  const xs = [-30, ...VERTICAL.map((s) => s.at), MAP_W + 30];
  const ys = [-30, ...HORIZONTAL.map((s) => s.at), MAP_H + 30];
  const half = (list: Street[], at: number) => {
    const s = list.find((q) => q.at === at);
    return s ? (s.major ? MAJOR : MINOR) / 2 + 5 : 0;
  };
  const out: Box[] = [];
  for (let r = 0; r < ys.length - 1; r++) {
    for (let c = 0; c < xs.length - 1; c++) {
      const x0 = xs[c] + half(VERTICAL, xs[c]);
      const x1 = xs[c + 1] - half(VERTICAL, xs[c + 1]);
      const y0 = ys[r] + half(HORIZONTAL, ys[r]);
      const y1 = ys[r + 1] - half(HORIZONTAL, ys[r + 1]);
      if (xs[c] === PARK.x0 && ys[r] === PARK.y0) continue;
      if (ys[r] === CANAL_ROW.y0 && ys[r + 1] === CANAL_ROW.y1) continue;
      const rand = seeded(r * 31 + c * 7 + 3);
      const w = x1 - x0;
      const h = y1 - y0;
      if (w < 12 || h < 12) continue;
      // Lots along the block: wider blocks get more of them, and deep blocks get a back row.
      const lots = Math.max(1, Math.round(w / (34 + rand() * 18)));
      const rows = h > 80 ? 2 : 1;
      const lotW = w / lots;
      const rowH = h / rows;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < lots; i++) {
          if (rand() < 0.12) continue; // the odd empty lot
          const inset = 2 + rand() * 3;
          const bw = lotW - inset * 2 - rand() * lotW * 0.25;
          const bh = rowH - inset * 2 - rand() * rowH * 0.3;
          // Buildings sit on the street side of their lot.
          const bx = x0 + i * lotW + inset;
          const by = j === 0 ? y0 + inset : y1 - inset - bh;
          out.push({ x: Math.round(bx), y: Math.round(by), w: Math.max(6, Math.round(bw)), h: Math.max(6, Math.round(bh)) });
        }
      }
    }
  }
  return out;
})();

const TREES: { x: number; y: number; r: number }[] = (() => {
  const rand = seeded(99);
  return Array.from({ length: 16 }, () => ({
    x: PARK.x0 + 16 + rand() * (PARK.x1 - PARK.x0 - 32),
    y: PARK.y0 + 16 + rand() * (PARK.y1 - PARK.y0 - 32),
    r: 4 + rand() * 4,
  }));
})();

function roads(width: (s: Street) => number, cls: string) {
  return (
    <g className={cls} fill="none" strokeLinecap="butt">
      {VERTICAL.map((s) => (
        <line key={`v${s.at}`} x1={s.at} y1={-20} x2={s.at} y2={MAP_H + 20} strokeWidth={width(s)} />
      ))}
      {HORIZONTAL.map((s) => (
        <line key={`h${s.at}`} x1={-20} y1={s.at} x2={MAP_W + 20} y2={s.at} strokeWidth={width(s)} />
      ))}
    </g>
  );
}

/** The static map layer. Drawn once; the route, markers and courier go on top of it. */
export const MapBase = memo(function MapBase({ canalId }: { canalId: string }) {
  const casing = (s: Street) => (s.major ? MAJOR : MINOR) + 3;
  const fill = (s: Street) => (s.major ? MAJOR : MINOR);
  return (
    <g>
      <rect x={0} y={0} width={MAP_W} height={MAP_H} className="fill-[#f1f2f4] dark:fill-[#121418]" />

      <g className="fill-[#e3e5ea] stroke-[#d6d9df] dark:fill-[#1d2027] dark:stroke-[#262a33]" strokeWidth={0.8}>
        {BUILDINGS.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={1.5} />
        ))}
      </g>

      {/* Park with winding footpaths */}
      <rect x={PARK.x0} y={PARK.y0} width={PARK.x1 - PARK.x0} height={PARK.y1 - PARK.y0} className="fill-[#d5ecd9] dark:fill-[#14281b]" />
      <path
        d={`M${PARK.x0} ${PARK.y0 + 80} C ${PARK.x0 + 40} ${PARK.y0 + 70}, ${PARK.x0 + 60} ${PARK.y0 + 30}, ${PARK.x1} ${PARK.y0 + 40} M${PARK.x0 + 60} ${PARK.y1} C ${PARK.x0 + 55} ${PARK.y0 + 80}, ${PARK.x0 + 80} ${PARK.y0 + 50}, ${PARK.x0 + 70} ${PARK.y0}`}
        fill="none"
        strokeWidth={2}
        strokeDasharray="3 3"
        className="stroke-white/90 dark:stroke-white/15"
      />
      <g className="fill-[#a9d6b2] dark:fill-[#1d3a26]">
        {TREES.map((t, i) => (
          <circle key={i} cx={t.x} cy={t.y} r={t.r} />
        ))}
      </g>

      {/* Canal with a green bank */}
      <path d={CANAL} fill="none" strokeWidth={84} className="stroke-[#dcefdf] dark:stroke-[#13231a]" />
      <path id={canalId} d={CANAL} fill="none" strokeWidth={36} className="stroke-[#c7def6] dark:stroke-[#0f2236]" />

      {/* Roads: every casing first, then every fill, so crossings merge cleanly and bridges sit over the water */}
      {roads(casing, "stroke-[#d3d7de] dark:stroke-[#090a0d]")}
      {roads(fill, "stroke-white dark:stroke-[#2a2e37]")}

      {/* Street names, on their roads */}
      <g className="fill-[#8a8f9a] font-mono dark:fill-[#6b7080]" fontSize={7.5} letterSpacing="0.08em" dominantBaseline="central" textAnchor="middle">
        {HORIZONTAL.filter((s) => s.name).map((s) => (
          <text key={s.name} x={s.labelAt} y={s.at} fontSize={s.major ? 8 : 7}>
            {s.name}
          </text>
        ))}
        {VERTICAL.filter((s) => s.name).map((s) => (
          <text key={s.name} x={s.at} y={s.labelAt} transform={`rotate(-90 ${s.at} ${s.labelAt})`} fontSize={s.major ? 8 : 7}>
            {s.name}
          </text>
        ))}
      </g>
      <text className="fill-[#6f93bf] dark:fill-[#4d74a3]" fontSize={8} fontStyle="italic" letterSpacing="0.2em" dominantBaseline="central">
        <textPath href={`#${canalId}`} startOffset="8%">
          EAST CANAL
        </textPath>
      </text>
    </g>
  );
});
