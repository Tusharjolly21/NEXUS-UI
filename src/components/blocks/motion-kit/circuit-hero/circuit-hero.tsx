"use client";

import { useEffect, useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CircuitHeroProps {
  /** Lets a ghost pointer wander over the board, warming and firing traces, until the visitor first moves a pointer over it. Ambient signals run either way. */
  autoplay?: boolean;
  /** Called with the button that was pressed. Buttons never navigate. */
  onAction?: (label: "primary" | "secondary") => void;
  className?: string;
}

type Pt = [number, number];
type Trace = { pts: Pt[]; cum: number[]; len: number; heat: number; last: number };
type Pulse = { t: Trace; d: number; v: number; dir: 1 | -1; c: string };

const G = 22;
const DIRS: Pt[] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const COLORS = ["#0a84ff", "#5e5ce6", "#0a84ff", "#30d158"];
const MAX_PULSES = 140;
const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** Small seeded generator, so the board lays out the same way every time. */
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

// lay out PCB-style traces: random walks on a grid that only bend by 45 degrees
function build(w: number, h: number, rand: () => number): Trace[] {
  const cols = Math.ceil(w / G) + 1;
  const rows = Math.ceil(h / G) + 1;
  const used = new Set<number>();
  const key = (c: number, r: number) => r * cols + c;
  const traces: Trace[] = [];
  const target = Math.round((cols * rows) / 9);
  for (let tries = 0; tries < target * 6 && traces.length < target; tries++) {
    let c = Math.floor(rand() * cols);
    let r = Math.floor(rand() * rows);
    if (used.has(key(c, r))) continue;
    let dir = Math.floor(rand() * 4) * 2; // start straight
    const cells: Pt[] = [[c, r]];
    used.add(key(c, r));
    const steps = 4 + Math.floor(rand() * 12);
    for (let s = 0; s < steps; s++) {
      if (s > 1 && rand() < 0.28) dir = (dir + (rand() < 0.5 ? 1 : 7)) % 8;
      const nc = c + DIRS[dir][0];
      const nr = r + DIRS[dir][1];
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || used.has(key(nc, nr))) break;
      // diagonals must not cross another diagonal
      if (dir % 2 && used.has(key(nc, r)) && used.has(key(c, nr))) break;
      c = nc;
      r = nr;
      used.add(key(c, r));
      cells.push([c, r]);
    }
    if (cells.length < 4) continue;
    // keep only the corners, so each trace is a few straight runs
    const pts: Pt[] = [];
    cells.forEach((p, i) => {
      if (i === 0 || i === cells.length - 1) {
        pts.push([p[0] * G, p[1] * G]);
        return;
      }
      const a = cells[i - 1];
      const b = cells[i + 1];
      if (p[0] - a[0] !== b[0] - p[0] || p[1] - a[1] !== b[1] - p[1]) pts.push([p[0] * G, p[1] * G]);
    });
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    traces.push({ pts, cum, len: cum[cum.length - 1], heat: 0, last: 0 });
  }
  return traces;
}

function at(t: Trace, d: number): Pt {
  d = Math.max(0, Math.min(t.len, d));
  let i = 1;
  while (i < t.cum.length - 1 && t.cum[i] < d) i++;
  const a = t.pts[i - 1];
  const b = t.pts[i];
  const k = (d - t.cum[i - 1]) / (t.cum[i] - t.cum[i - 1] || 1);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

function subPath(ctx: CanvasRenderingContext2D, t: Trace, d0: number, d1: number) {
  d0 = Math.max(0, d0);
  d1 = Math.min(t.len, d1);
  if (d1 <= d0) return;
  const p = at(t, d0);
  ctx.moveTo(p[0], p[1]);
  for (let i = 1; i < t.pts.length; i++) if (t.cum[i] > d0 && t.cum[i] < d1) ctx.lineTo(t.pts[i][0], t.pts[i][1]);
  const q = at(t, d1);
  ctx.lineTo(q[0], q[1]);
}

const distSeg = (px: number, py: number, a: Pt, b: Pt) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = dx * dx + dy * dy || 1;
  const k = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l));
  return Math.hypot(px - a[0] - dx * k, py - a[1] - dy * k);
};

type Api = { burst: (x: number, y: number) => void; poke: () => void };

/**
 * A hero that sits on a living circuit board. Signals race along the traces, the traces under your
 * pointer warm up and fire off their own pulses, and a click sends a burst out through every nearby
 * line. The middle fades to the page colour so the headline always reads. The canvas pauses when
 * it is off screen or the tab is hidden, and shows a still frame under reduced motion.
 */
export function CircuitHero({ autoplay = false, onAction, className }: CircuitHeroProps) {
  const wrap = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ptr = useRef({ x: -999, y: -999, inside: false });
  const touched = useRef(false);
  const api = useRef<Api | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = wrap.current;
    const canvas = cv.current;
    const ctx = canvas?.getContext("2d");
    if (!el || !canvas || !ctx) return;
    const still = !!reduce;
    const root = document.documentElement;
    let dark = root.classList.contains("dark");
    let W = 0;
    let H = 0;
    let traces: Trace[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let stillRaf = 0;
    let prev = 0;
    let spawnAcc = 0;
    let onScreen = true;
    const rnd = seeded(97);

    const fire = (t: Trace, fromEnd: boolean, c?: string) => {
      if (pulses.length > MAX_PULSES) return;
      pulses.push({
        t,
        d: fromEnd ? t.len : 0,
        v: 140 + rnd() * 160,
        dir: fromEnd ? -1 : 1,
        c: c ?? COLORS[Math.floor(rnd() * COLORS.length)],
      });
    };

    const draw = (now: number, dt: number, live: boolean) => {
      const col = dark
        ? { trace: "#2c2c2e", node: "#000", nodeLine: "#3a3a3c" }
        : { trace: "#e3e3e8", node: "#fff", nodeLine: "#d2d2d7" };
      // a ghost pointer wanders when nobody's hovering, so the effect shows without a visitor
      const p = ptr.current;
      const ghost = autoplay && !touched.current && !still;
      let gx = -9999;
      let gy = -9999;
      if (p.inside) {
        gx = p.x;
        gy = p.y;
      } else if (ghost) {
        gx = W * (0.5 + 0.36 * Math.sin(now / 2300));
        gy = H * (0.5 + 0.3 * Math.sin(now / 1700 + 1));
      }
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // base traces + pointer heat
      for (const t of traces) {
        let md = Infinity;
        for (let i = 1; i < t.pts.length; i++) md = Math.min(md, distSeg(gx, gy, t.pts[i - 1], t.pts[i]));
        const target = Math.max(0, 1 - md / 120);
        if (still) t.heat = target;
        else t.heat += (target - t.heat) * Math.min(1, dt * (target > t.heat ? 10 : 1.6)); // warm fast, cool slowly
        if (live && target > 0.55 && now - t.last > 900) {
          t.last = now;
          fire(t, rnd() < 0.5);
        }
        ctx.beginPath();
        t.pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
        ctx.strokeStyle = col.trace;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (t.heat > 0.02) {
          ctx.strokeStyle = `rgba(10,132,255,${t.heat * 0.55})`;
          ctx.lineWidth = 1.5 + t.heat;
          ctx.stroke();
        }
        for (const e of [t.pts[0], t.pts[t.pts.length - 1]]) {
          ctx.beginPath();
          ctx.arc(e[0], e[1], 3, 0, Math.PI * 2);
          ctx.fillStyle = col.node;
          ctx.fill();
          ctx.strokeStyle = t.heat > 0.05 ? `rgba(10,132,255,${0.35 + t.heat * 0.65})` : col.nodeLine;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // ambient signals
      if (live) {
        spawnAcc += (dt * (W * H)) / 90000;
        while (spawnAcc > 1) {
          spawnAcc -= 1;
          const t = traces[Math.floor(rnd() * traces.length)];
          if (t) fire(t, rnd() < 0.5);
        }
      }
      // pulses: a short glowing comet with a fading tail
      pulses = pulses.filter((s) => {
        if (live) s.d += s.v * s.dir * dt;
        const head = s.d;
        const tail = 46;
        const alive = s.dir > 0 ? head - tail < s.t.len : head + tail > 0;
        for (let k = 0; k < 6; k++) {
          ctx.beginPath();
          const a = head - (s.dir * (tail * k)) / 6;
          const b = head - (s.dir * (tail * (k + 1))) / 6;
          subPath(ctx, s.t, Math.min(a, b), Math.max(a, b));
          ctx.strokeStyle = s.c;
          ctx.globalAlpha = (1 - k / 6) * 0.9;
          ctx.lineWidth = 2.2;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        if (head > 0 && head < s.t.len) {
          const [x, y] = at(s.t, head);
          const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
          g.addColorStop(0, s.c + "aa");
          g.addColorStop(1, s.c + "00");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        return alive;
      });
    };

    /** One frame without advancing time: used while paused, on resize, and for the reduced-motion still. */
    const drawStatic = () => draw(performance.now(), 0, false);

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      draw(now, dt, true);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || still) return;
      prev = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      if (onScreen && !document.hidden && !still) start();
      else stop();
    };
    /** Reduced motion only: redraw once (at most once per frame) after the pointer or theme changes. */
    const queueStill = () => {
      if (stillRaf) return;
      stillRaf = requestAnimationFrame(() => {
        stillRaf = 0;
        drawStatic();
      });
    };

    const resize = () => {
      W = el.offsetWidth;
      H = el.offsetHeight;
      if (!W || !H) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      traces = build(W, H, seeded(5));
      pulses = [];
      if (still) {
        // freeze a few comets mid-trace so the still frame still reads as a live board
        const still01 = seeded(3);
        traces.forEach((t, i) => {
          if (i % 6 === 0) pulses.push({ t, d: t.len * (0.25 + 0.5 * still01()), v: 0, dir: 1, c: COLORS[i % COLORS.length] });
        });
      }
      if (!raf) drawStatic();
    };

    api.current = {
      burst(x, y) {
        if (still) return;
        for (const t of traces) {
          const a = t.pts[0];
          const b = t.pts[t.pts.length - 1];
          const da = Math.hypot(a[0] - x, a[1] - y);
          const db = Math.hypot(b[0] - x, b[1] - y);
          if (Math.min(da, db) < 190) {
            fire(t, db < da, "#0a84ff");
            t.heat = 1;
          }
        }
      },
      poke() {
        if (still) queueStill();
      },
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    // the page's dark class can flip while the canvas is running
    const mo = new MutationObserver(() => {
      dark = root.classList.contains("dark");
      if (!raf) queueStill();
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    // follow devicePixelRatio changes (browser zoom, moving between screens)
    let mq: MediaQueryList | null = null;
    const onDpr = () => {
      resize();
      watchDpr();
    };
    function watchDpr() {
      mq?.removeEventListener("change", onDpr);
      mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mq.addEventListener("change", onDpr);
    }
    watchDpr();

    resize();
    sync();

    return () => {
      stop();
      cancelAnimationFrame(stillRaf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
      mq?.removeEventListener("change", onDpr);
      api.current = null;
      pulses = [];
      traces = [];
    };
  }, [autoplay, reduce]);

  const local = (e: { clientX: number; clientY: number }) => {
    const r = wrap.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  };
  const press = (label: "primary" | "secondary") => (e: ReactMouseEvent<HTMLButtonElement>) => {
    // keyboard activation has no pointer, so the signal leaves from the button itself
    if (e.detail === 0) {
      const b = e.currentTarget.getBoundingClientRect();
      const p = local({ clientX: b.left + b.width / 2, clientY: b.top + b.height / 2 });
      api.current?.burst(p.x, p.y);
    }
    onAction?.(label);
  };
  const enter = reduce ? false : undefined;

  return (
    <section
      ref={wrap}
      aria-label="Edge network"
      className={cn(
        "relative isolate flex min-h-[560px] w-full items-center justify-center overflow-hidden bg-white px-6 py-20 [--ch-bg:#fff] dark:bg-black dark:[--ch-bg:#000]",
        className,
      )}
      onPointerMove={(e: ReactPointerEvent<HTMLElement>) => {
        const p = local(e);
        ptr.current = { ...p, inside: true };
        touched.current = true;
        api.current?.poke();
      }}
      onPointerLeave={() => {
        ptr.current.inside = false;
        api.current?.poke();
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a,button")) return;
        const p = local(e);
        api.current?.burst(p.x, p.y);
      }}
    >
      <canvas ref={cv} className="absolute inset-0 -z-10 h-full w-full" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 46% 42% at 50% 50%, var(--ch-bg) 30%, color-mix(in srgb, var(--ch-bg) 85%, transparent) 55%, transparent 100%)",
        }}
      />
      <div className="max-w-[620px] text-center">
        <motion.span
          initial={enter ?? { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_#3a3a3c]"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#34c759] opacity-60 motion-reduce:animate-none dark:bg-[#30d158]" />
            <span className="relative h-2 w-2 rounded-full bg-[#34c759] dark:bg-[#30d158]" />
          </span>
          Edge network · 312 regions
        </motion.span>
        <motion.h1
          initial={enter ?? { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="m-0 mt-5 text-[clamp(40px,7vw,68px)] font-semibold leading-[1.02] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]"
        >
          Every request,
          <br />
          on the shortest wire.
        </motion.h1>
        <motion.p
          initial={enter ?? { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mx-auto mt-5 max-w-[460px] text-[17px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]"
        >
          Your app runs next to your users, so pages answer before they finish clicking.
        </motion.p>
        <motion.div
          initial={enter ?? { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={press("primary")}
            className={cn(
              "rounded-full bg-[#0071e3] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#0077ed] dark:bg-[#0a84ff] dark:hover:bg-[#409cff]",
              ring,
            )}
          >
            Deploy now
          </button>
          <button
            type="button"
            onClick={press("secondary")}
            className={cn(
              "rounded-full bg-white px-6 py-3 text-[15px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.1)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_#3a3a3c]",
              ring,
            )}
          >
            See the map
          </button>
        </motion.div>
      </div>
      <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] text-[#86868b] dark:text-[#a1a1a6]">
        Click anywhere to send a signal
      </span>
    </section>
  );
}
