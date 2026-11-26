"use client";

/* eslint-disable react-hooks/refs -- the animation state lives in refs on purpose: handlers, effects and animation frames read and write them, never the render itself */


import { AnimatePresence, motion } from "framer-motion";
import {
  type PointerEvent as RPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

export type ShapeshiftScene = {
  /** the name in the list */
  name: string;
  shape: "sphere" | "knot" | "word" | "lattice" | "galaxy";
  /** page colour */
  bg: string;
  /** colour of the words on it */
  ink: string;
  /** the particles' colours */
  dots: string[];
};
export type ShapeshiftHeroProps = {
  scenes?: ShapeshiftScene[];
  /** the brand: shown top left, and spelt out in particles by the "word" shape */
  brand?: [string, string];
  headline?: [string, string];
  place?: string;
  questions?: string[];
  cta?: string;
  onCta?: () => void;
  /** seconds on each scene before moving on; 0 to stay */
  dwell?: number;
  autoplay?: boolean;
  className?: string;
};

const SCENES: ShapeshiftScene[] = [
  {
    name: "Mono",
    shape: "sphere",
    bg: "#050505",
    ink: "#f2f2f2",
    dots: ["#ffffff", "#d9d9d9", "#9a9a9a", "#ff8a8a"],
  },
  {
    name: "Ember",
    shape: "knot",
    bg: "#1b0c07",
    ink: "#f6e6da",
    dots: ["#ff7a3d", "#ff9f5a", "#e2552f", "#ffd2a0"],
  },
  {
    name: "Nebula",
    shape: "galaxy",
    bg: "#0c0620",
    ink: "#f4ecff",
    dots: ["#ff6fd8", "#9a7bff", "#6fd6ff", "#ffe3b0"],
  },
  {
    name: "Ocean",
    shape: "lattice",
    bg: "#0a1541",
    ink: "#eef2ff",
    dots: ["#b9ccff", "#ffffff", "#7a98ff", "#8fe0ff"],
  },
  {
    name: "Aurora",
    shape: "word",
    bg: "#04150f",
    ink: "#e8fff3",
    dots: ["#6dffb4", "#b8ff6a", "#3fe0cf", "#ffffff"],
  },
];
const QUESTIONS = [
  "Do you build AI tools?",
  "Can you redo our brand?",
  "How long does a website take?",
  "Ask us anything",
];
const N = 8000;
const MONO =
  "ui-monospace, 'SF Mono', SFMono-Regular, 'JetBrains Mono', Menlo, monospace";
const SANS =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif";
const SERIF =
  "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Times New Roman', serif";
const I = {
  mic: "M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48M96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V240a8 8 0 0 1-16 0v-32.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6",
  arrow:
    "M200 64v104a8 8 0 0 1-16 0V83.31L69.66 197.66a8 8 0 0 1-11.32-11.32L172.69 72H88a8 8 0 0 1 0-16h104a8 8 0 0 1 8 8",
};

const hex = (h: string) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
/** every particle's place in one shape, roughly within a unit sphere */
function shapePoints(shape: ShapeshiftScene["shape"], brand: [string, string]) {
  const P = new Float32Array(N * 3);
  const r = rng(shape.length * 977 + 13);
  if (shape === "sphere") {
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2,
        rad = Math.sqrt(1 - y * y),
        th = ga * i;
      const k = 0.97 + r() * 0.06;
      P[i * 3] = Math.cos(th) * rad * k;
      P[i * 3 + 1] = y * k;
      P[i * 3 + 2] = Math.sin(th) * rad * k;
    }
  } else if (shape === "knot") {
    for (let i = 0; i < N; i++) {
      const t = r() * Math.PI * 2;
      const q = 3,
        p = 2,
        R = Math.cos(q * t) + 2.2;
      // a random point on the tube around the curve
      let ox = r() - 0.5,
        oy = r() - 0.5,
        oz = r() - 0.5;
      const l = Math.hypot(ox, oy, oz) || 1;
      const tube = 0.34 * Math.sqrt(0.6 + 0.4 * r());
      ox = (ox / l) * tube;
      oy = (oy / l) * tube;
      oz = (oz / l) * tube;
      P[i * 3] = (R * Math.cos(p * t) + ox) * 0.36;
      P[i * 3 + 1] = (R * Math.sin(p * t) + oy) * 0.36;
      P[i * 3 + 2] = (-Math.sin(q * t) * 1.1 + oz) * 0.36;
    }
  } else if (shape === "galaxy") {
    // a spiral galaxy: a bright bulge, three arms that wind outwards and thin to a faint dusty disc
    const bell = () => (r() + r() + r() - 1.5) / 1.5;
    for (let i = 0; i < N; i++) {
      if (r() < 0.14) {
        // the bulge: a squashed ball, densest in the middle
        const rad = Math.pow(r(), 1.6) * 0.3;
        const th = r() * Math.PI * 2;
        const ph = Math.acos(2 * r() - 1);
        P[i * 3] = Math.sin(ph) * Math.cos(th) * rad;
        P[i * 3 + 1] = Math.cos(ph) * rad * 0.55;
        P[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * rad;
      } else {
        const rho = 0.08 + Math.pow(r(), 0.8) * 1.0;
        const arm = Math.floor(r() * 3);
        // the arms wind as they go out, and the stars scatter more the further they are from the arm's spine
        const th =
          (arm * Math.PI * 2) / 3 + rho * 3.4 + bell() * (0.16 + rho * 0.34);
        P[i * 3] = Math.cos(th) * rho;
        P[i * 3 + 1] = bell() * 0.075 * (1.15 - rho * 0.7);
        P[i * 3 + 2] = Math.sin(th) * rho;
      }
    }
  } else if (shape === "lattice") {
    const n = Math.round(Math.cbrt(N));
    for (let i = 0; i < N; i++) {
      const a = i % n,
        b = Math.floor(i / n) % n,
        c = Math.floor(i / (n * n)) % n;
      P[i * 3] = (a / (n - 1) - 0.5) * 1.45;
      P[i * 3 + 1] = (b / (n - 1) - 0.5) * 1.45;
      P[i * 3 + 2] = (c / (n - 1) - 0.5) * 1.45;
    }
  } else {
    // the brand, written on a small canvas and read back
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 300;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.font = `800 128px ${SANS}`;
    g.textBaseline = "alphabetic";
    g.fillText(brand[0], 20, 128);
    g.fillText(brand[1], 20, 268);
    const d = g.getImageData(0, 0, 640, 300).data;
    const pts: [number, number][] = [];
    for (let y = 0; y < 300; y += 2)
      for (let x = 0; x < 640; x += 2)
        if (d[(y * 640 + x) * 4 + 3] > 128) pts.push([x, y]);
    let minX = 1e9,
      maxX = -1e9;
    for (const [x] of pts) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
    const cx = (minX + maxX) / 2,
      s = 2.1 / Math.max(1, maxX - minX);
    for (let i = 0; i < N; i++) {
      const [x, y] = pts[Math.floor(r() * pts.length)] ?? [320, 150];
      P[i * 3] = (x - cx + (r() - 0.5) * 2) * s;
      P[i * 3 + 1] = (y - 150 + (r() - 0.5) * 2) * s;
      P[i * 3 + 2] = (r() - 0.5) * 0.06;
    }
  }
  return P;
}
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * A studio landing hero where thousands of particles hold a shape, and shift.
 *
 * Eight thousand points of light form a slowly turning shape in the middle of the page: a sphere, a knotted ring, a
 * spiral galaxy with a glowing core, a lattice cube whose rows shimmer into moiré as it turns, the studio's own name. Every scene has its own page colour and
 * particle colours (mono on black, ember on burnt brown, a violet nebula, ice on deep blue, mint on night green). Moving on, the particles
 * scatter into a drifting cloud, their colours mixing and glinting, then pour into the next shape while the page
 * colour changes under them. Drag to spin the shape and it carries on with your throw; move over it and the points
 * part round your pointer. The scene list on the right fills a thin bar while it waits, and you can pick any scene;
 * the search pill at the top types out a new question every few seconds.
 */
export default function ShapeshiftHero({
  scenes = SCENES,
  brand = ["LUMEN", "•FIELD"],
  headline = ["Every idea has", "a shape of its own."],
  place = "Studio  Lisbon",
  questions = QUESTIONS,
  cta = "Start a project",
  onCta,
  dwell = 6,
  autoplay = false,
  className = "",
}: ShapeshiftHeroProps) {
  const [si, setSi] = useState(0);
  const siRef = useRef(0);
  siRef.current = si;
  const scene = scenes[si];
  const host = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ptr = useRef({
    x: -9999,
    y: -9999,
    down: false,
    lx: 0,
    ly: 0,
    vx: 0,
    vy: 0,
  });
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);
  const touched = useRef(false);
  void autoplay;

  // the question pill types one question after another
  useEffect(() => {
    let alive = true;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    (async () => {
      for (let n = 0; alive; n++) {
        const s = questions[n % questions.length];
        if (reduce) setQ(s);
        else
          for (let i = 1; i <= s.length && alive; i++) {
            setQ(s.slice(0, i));
            await new Promise((r) => setTimeout(r, 38 + Math.random() * 40));
          }
        await new Promise((r) => setTimeout(r, 2600));
      }
    })();
    return () => {
      alive = false;
    };
  }, [questions]);

  // moving on by itself
  useEffect(() => {
    if (!dwell) return;
    const id = setTimeout(
      () => setSi((i) => (i + 1) % scenes.length),
      dwell * 1000,
    );
    return () => clearTimeout(id);
  }, [si, tick, dwell, scenes.length]);

  // the particles
  useEffect(() => {
    const c = cv.current,
      el = host.current;
    if (!c || !el) return;
    const g = c.getContext("2d");
    if (!g) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const shapes = scenes.map((s) => shapePoints(s.shape, brand));
    const r = rng(7);
    const rand = new Float32Array(N),
      delay = new Float32Array(N),
      dir = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      rand[i] = r();
      delay[i] = r() * 0.28;
      const a = r() * Math.PI * 2,
        b = Math.acos(2 * r() - 1);
      dir[i * 3] = Math.sin(b) * Math.cos(a);
      dir[i * 3 + 1] = Math.sin(b) * Math.sin(a);
      dir[i * 3 + 2] = Math.cos(b);
    }
    const offX = new Float32Array(N),
      offY = new Float32Array(N);
    const sx = new Float32Array(N),
      sy = new Float32Array(N),
      sd = new Float32Array(N);
    const glints = ["#ff7ab0", "#7ee8ff", "#ffe27a", "#b88cff"].map(hex);
    let W = 0,
      H = 0,
      dpr = 1,
      raf = 0,
      last = performance.now(),
      t = 0,
      visible = true;
    let from = siRef.current,
      to = siRef.current,
      k = 1;
    let ay = 0.6,
      ax = -0.28,
      vy = 0.25,
      vx = 0;
    const resize = () => {
      W = el.offsetWidth;
      H = el.offsetHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = W * dpr;
      c.height = H * dpr;
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      if (siRef.current !== to) {
        from = k < 0.5 ? from : to;
        to = siRef.current;
        k = 0;
      }
      k = reduce ? 1 : Math.min(1, k + dt / 1.9);
      const A = shapes[from],
        B = shapes[to];
      const pA = scenes[from].dots.map(hex),
        pB = scenes[to].dots.map(hex);
      const isWord = scenes[to].shape === "word" && k > 0.6;
      // spin: a slow turn of its own, plus whatever the pointer throws at it
      const p = ptr.current;
      if (p.down) {
        vy += (p.vx * 60 - vy) * 0.35;
        vx += (p.vy * 60 - vx) * 0.35;
        p.vx *= 0.85;
        p.vy *= 0.85;
      } else {
        const base = isWord ? 0 : 0.22;
        vy += (base - vy) * Math.min(1, dt * 1.2);
        vx += (0 - vx) * Math.min(1, dt * 1.5);
      }
      if (!reduce) {
        ay += vy * dt;
        ax += vx * dt;
      }
      // a word should face you: ease the turn back to the front
      if (isWord && !p.down) {
        const target =
          Math.round(ay / (Math.PI * 2)) * Math.PI * 2 +
          Math.sin(t * 0.6) * 0.18;
        ay += (target - ay) * Math.min(1, dt * 2.2);
        ax += (-0.05 - ax) * Math.min(1, dt * 2.2);
      } else
        ax +=
          ((scenes[to].shape === "galaxy" ? -0.85 : -0.28) +
            Math.sin(t * 0.4) * 0.06 -
            ax) *
          Math.min(1, dt * 0.8);
      const cy = Math.cos(ay),
        sny = Math.sin(ay),
        cxx = Math.cos(ax),
        snx = Math.sin(ax);
      const S = Math.min(W * 0.25, H * 0.33),
        cam = 3.4;
      const ox = W / 2,
        oy = H / 2 + H * 0.02;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      // colour buckets so the canvas changes fill only a few dozen times a frame
      const buckets: number[][] = [];
      const bucketCol: string[] = [];
      const key = new Map<string, number>();
      for (let i = 0; i < N; i++) {
        const kk = Math.max(0, Math.min(1, (k - delay[i]) / (1 - 0.28)));
        const e = ease(kk);
        const sc = Math.sin(kk * Math.PI);
        const sp = 0.35 + rand[i] * 0.6;
        let x = A[i * 3] + (B[i * 3] - A[i * 3]) * e + dir[i * 3] * sc * sp;
        const y =
          A[i * 3 + 1] +
          (B[i * 3 + 1] - A[i * 3 + 1]) * e +
          dir[i * 3 + 1] * sc * sp;
        let z =
          A[i * 3 + 2] +
          (B[i * 3 + 2] - A[i * 3 + 2]) * e +
          dir[i * 3 + 2] * sc * sp;
        // a slow swirl through the cloud while it's between shapes
        if (sc > 0.01) {
          const sw = sc * 0.6 * Math.sin(t * 1.3 + rand[i] * 6);
          const tx = x * Math.cos(sw) - z * Math.sin(sw);
          z = x * Math.sin(sw) + z * Math.cos(sw);
          x = tx;
        }
        // turn, then project
        const x1 = x * cy + z * sny,
          z1 = -x * sny + z * cy;
        const y1 = y * cxx - z1 * snx,
          z2 = y * snx + z1 * cxx;
        const f = cam / (cam + z2);
        let px = ox + x1 * S * f,
          py = oy + y1 * S * f;
        // the points part round the pointer
        const dx = px - p.x,
          dy = py - p.y,
          d2 = dx * dx + dy * dy;
        let tx = 0,
          ty = 0;
        if (d2 < 90 * 90) {
          const d = Math.sqrt(d2) || 1,
            push = (1 - d / 90) * 22;
          tx = (dx / d) * push;
          ty = (dy / d) * push;
        }
        offX[i] += (tx - offX[i]) * 0.12;
        offY[i] += (ty - offY[i]) * 0.12;
        px += offX[i];
        py += offY[i];
        sx[i] = px;
        sy[i] = py;
        sd[i] = f;
        // colour: from the old palette to the new one, with glints mid-flight
        const pal =
          rand[i] * 4 > 3.3
            ? 3
            : rand[i] * 4 > 2.2
              ? 2
              : rand[i] * 4 > 1.1
                ? 1
                : 0;
        let col =
          e < 0.5 + (rand[i] - 0.5) * 0.4
            ? pA[pal % pA.length]
            : pB[pal % pB.length];
        if (sc > 0.45 && rand[i] > 0.78)
          col = glints[Math.floor(rand[i] * 97) % glints.length];
        const depth = Math.max(0, Math.min(3, Math.floor((f - 0.72) * 6)));
        const kk2 = `${col[0]},${col[1]},${col[2]},${depth}`;
        let bi = key.get(kk2);
        if (bi === undefined) {
          bi = buckets.length;
          key.set(kk2, bi);
          buckets.push([]);
          bucketCol.push(
            `rgba(${col[0]},${col[1]},${col[2]},${0.35 + depth * 0.2})`,
          );
        }
        buckets[bi].push(i);
      }
      for (let b = 0; b < buckets.length; b++) {
        g.fillStyle = bucketCol[b];
        const list = buckets[b];
        for (let j = 0; j < list.length; j++) {
          const i = list[j];
          const s = 0.9 + sd[i] * 0.55;
          g.fillRect(sx[i] - s / 2, sy[i] - s / 2, s, s);
        }
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(el);
    resize();
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes, brand[0], brand[1]]);

  const onMove = (e: RPointerEvent) => {
    const r = host.current!.getBoundingClientRect();
    const p = ptr.current;
    p.x = e.clientX - r.left;
    p.y = e.clientY - r.top;
    if (p.down) {
      p.vx = (p.x - p.lx) * 0.01;
      p.vy = (p.y - p.ly) * 0.01;
      p.lx = p.x;
      p.ly = p.y;
    }
  };

  const go = (i: number) => {
    touched.current = true;
    setSi(i);
    setTick((n) => n + 1);
  };
  // light or dark page: read from the page colour, so any scene colours work
  const [br, bgc, bb] = hex(scene.bg);
  const dark = (0.299 * br + 0.587 * bgc + 0.114 * bb) / 255 < 0.55;
  const sub = dark ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.5)";
  const line = dark ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.12)";

  return (
    <div
      ref={host}
      className={`relative w-full overflow-hidden rounded-[22px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      style={{
        height: 560,
        background: scene.bg,
        color: scene.ink,
        transition: "background-color 1.4s ease, color 1.2s ease",
        fontFamily: SANS,
      }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        ptr.current.x = ptr.current.y = -9999;
        ptr.current.down = false;
      }}
    >
      <canvas
        ref={cv}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          const r = host.current!.getBoundingClientRect();
          Object.assign(ptr.current, {
            down: true,
            lx: e.clientX - r.left,
            ly: e.clientY - r.top,
          });
          touched.current = true;
        }}
        onPointerUp={() => (ptr.current.down = false)}
      />

      {/* the top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-6 pt-5">
        <div className="text-[15px] font-extrabold leading-[0.95] tracking-[-0.02em]">
          {brand[0]}
          <br />
          {brand[1]}
        </div>
        <div
          className="pointer-events-auto absolute left-1/2 top-4 flex h-[34px] w-[44%] -translate-x-1/2 sm:w-[min(300px,52%)] items-center rounded-full px-4 text-[12px]"
          style={{
            background: dark ? "rgba(255,255,255,.04)" : "#111",
            color: dark ? sub : "rgba(255,255,255,.7)",
            boxShadow: `inset 0 0 0 1px ${dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.4)"}`,
            transition: "background-color 1.2s",
          }}
        >
          <span className="min-w-0 flex-1 truncate">
            {q}
            <span className="ml-px inline-block h-[12px] w-px translate-y-[2px] animate-pulse bg-current" />
          </span>
          <svg viewBox="0 0 256 256" width={13} height={13} aria-hidden="true">
            <path fill="currentColor" d={I.mic} />
          </svg>
        </div>
        <button
          type="button"
          className="pointer-events-auto flex h-[30px] items-center gap-2 rounded-full px-3.5 text-[10px] font-semibold uppercase outline-none focus-visible:shadow-[0_0_0_2px_#0a84ff]"
          style={{
            fontFamily: MONO,
            letterSpacing: "0.16em",
            background: dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)",
          }}
        >
          <span className="h-[5px] w-[5px] rounded-full bg-current" />
          Menu
        </button>
      </div>

      {/* the scene counter and list */}
      <div className="absolute right-6 top-1/2 hidden w-[150px] -translate-y-1/2 sm:block">
        <div className="flex items-start justify-end">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={si}
              className="text-[46px] font-light leading-none tabular-nums tracking-[-0.04em]"
              initial={{ y: 18, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -18, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {String(si + 1).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
          <span
            className="ml-1 mt-1 text-[8px]"
            style={{ fontFamily: MONO, color: sub }}
          >
            /{String(scenes.length).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-4" role="tablist" aria-label="Scenes">
          {scenes.map((s, i) => (
            <button
              key={s.name}
              type="button"
              role="tab"
              aria-selected={i === si}
              onClick={() => go(i)}
              className="relative flex h-[29px] w-full items-center gap-3 text-[10px] uppercase outline-none focus-visible:shadow-[0_0_0_2px_#0a84ff]"
              style={{
                fontFamily: MONO,
                letterSpacing: "0.16em",
                color: i === si ? scene.ink : sub,
                borderBottom: `1px solid ${line}`,
              }}
            >
              <span style={{ opacity: 0.7 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={i === si ? "font-semibold" : ""}>{s.name}</span>
              {i === si && dwell > 0 && (
                <motion.span
                  key={`${si}-${tick}`}
                  className="absolute -bottom-px left-0 h-px"
                  style={{ background: scene.ink }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: dwell, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* the words, bottom left */}
      <div className="pointer-events-none absolute bottom-6 left-6">
        <div
          className="text-[9px] uppercase"
          style={{
            fontFamily: MONO,
            letterSpacing: "0.2em",
            color: sub,
            whiteSpace: "pre",
          }}
        >
          {place}
        </div>
        <div className="mt-3 text-[22px] leading-[1.08] tracking-[-0.02em] sm:text-[26px]">
          {headline[0]}
          <br />
          <span className="italic" style={{ fontFamily: SERIF }}>
            {headline[1]}
          </span>
        </div>
        <button
          type="button"
          onClick={onCta}
          className="pointer-events-auto mt-4 flex items-center gap-2 border-b pb-1 text-[10px] font-semibold uppercase outline-none focus-visible:shadow-[0_0_0_2px_#0a84ff]"
          style={{
            fontFamily: MONO,
            letterSpacing: "0.16em",
            borderColor: scene.ink,
          }}
        >
          <span className="h-[5px] w-[5px] rounded-full bg-[#ff3b30]" />
          {cta}
          <svg viewBox="0 0 256 256" width={11} height={11} aria-hidden="true">
            <path fill="currentColor" d={I.arrow} />
          </svg>
        </button>
      </div>
    </div>
  );
}
