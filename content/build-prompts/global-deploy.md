# Global Deploy

Add the "Global Deploy" component from Nexus UI to my project.

A deploy map drawn on real coastlines. Press Deploy, or click anywhere to ship from the nearest region: the release leaves as glowing blue arcs that spread from region to region until every one is live, and hovering a region shows its latency. Canvas arcs on a dotted world, with keyboard control, a live region that announces progress and no dependencies beyond Framer Motion.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` and `@/lib/ui-sounds-pro` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
5. Use it like this: `import { GlobalDeploy } from "@/components/global-deploy";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/global-deploy/global-deploy.tsx ---

```tsx
"use client";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProSound, type ProSoundName } from "@/lib/ui-sounds-pro";

/* ------------------------------------------------------------------ */
/* Land mask: 720 x 360 cells (0.5 degree), run-length + varint +      */
/* base64. Rows run north to south, columns eastward from 180W.        */
/* ------------------------------------------------------------------ */
const MW = 720, MH = 360;
const LAND = "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";
let MASK: Uint8Array | null = null;
function land(lat: number, lon: number) {
  if (!MASK) {
    const bin = atob(LAND);
    MASK = new Uint8Array(MW * MH);
    let p = 0, k = 0, v = 0;
    while (p < bin.length && k < MASK.length) {
      let run = 0, sh = 0, c = 0;
      do { c = bin.charCodeAt(p++); run += (c & 127) * 2 ** sh; sh += 7; } while (c & 128);
      if (v) MASK.fill(1, k, Math.min(MASK.length, k + run));
      k += run; v ^= 1;
    }
  }
  const y = Math.min(MH - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MH)));
  const x = ((Math.floor(((lon + 180) / 360) * MW) % MW) + MW) % MW;
  return MASK[y * MW + x] === 1;
}

/* Miller projection, cropped to the inhabited latitudes */
const LAT_N = 78, LAT_S = -56;
const millerY = (lat: number) => 1.25 * Math.log(Math.tan(Math.PI / 4 + (0.4 * lat * Math.PI) / 180));
const Y_N = millerY(LAT_N), Y_S = millerY(LAT_S);
const ASPECT = (2 * Math.PI) / (Y_N - Y_S); // width / height
const invMiller = (y: number) => ((2.5 * Math.atan(Math.exp(0.8 * y)) - 0.625 * Math.PI) * 180) / Math.PI;

const REGIONS = [
  { id: "sfo", name: "San Francisco", lat: 37.6, lon: -122.4 },
  { id: "iad", name: "Washington, D.C.", lat: 38.9, lon: -77.4 },
  { id: "gru", name: "São Paulo", lat: -23.5, lon: -46.6 },
  { id: "lhr", name: "London", lat: 51.5, lon: -0.1 },
  { id: "fra", name: "Frankfurt", lat: 50.1, lon: 8.7 },
  { id: "jnb", name: "Johannesburg", lat: -26.2, lon: 28.0 },
  { id: "dxb", name: "Dubai", lat: 25.2, lon: 55.3 },
  { id: "bom", name: "Mumbai", lat: 19.1, lon: 72.9 },
  { id: "sin", name: "Singapore", lat: 1.35, lon: 103.8 },
  { id: "icn", name: "Seoul", lat: 37.5, lon: 127.0 },
  { id: "hnd", name: "Tokyo", lat: 35.7, lon: 139.7 },
  { id: "syd", name: "Sydney", lat: -33.9, lon: 151.2 },
];
const N = REGIONS.length;
const ALL_LIVE = 2 ** N - 1;
/** great-circle distance in km */
function km(a: (typeof REGIONS)[number], b: (typeof REGIONS)[number]) {
  const r = Math.PI / 180, dφ = (b.lat - a.lat) * r, dλ = (b.lon - a.lon) * r;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dλ / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
/** round trip over fibre (about 200 km per ms each way) plus a little routing overhead */
const rtt = (a: number, b: number) => (a === b ? 2 : Math.round(4 + (km(REGIONS[a], REGIONS[b]) * 1.25) / 100));

type Edge = { a: number; b: number; t0: number; dur: number; seed: number };
type Plan = { start: number; edges: Edge[]; liveAt: number[]; origin: number; end: number };

/**
 * Plan a deploy: the origin pushes to its nearest regions, and every region that goes live
 * passes the release on to its own nearest neighbours that nobody has claimed yet.
 */
function plan(origin: number, start: number, px: (i: number) => [number, number]): Plan {
  const liveAt = new Array(N).fill(Infinity);
  const claimed = new Array(N).fill(false);
  const edges: Edge[] = [];
  liveAt[origin] = start; claimed[origin] = true;
  const done = new Array(N).fill(false);
  for (let step = 0; step < N; step++) {
    let i = -1;
    for (let k = 0; k < N; k++) if (!done[k] && claimed[k] && (i < 0 || liveAt[k] < liveAt[i])) i = k;
    if (i < 0) break;
    done[i] = true;
    const [ax, ay] = px(i);
    const near = [...Array(N).keys()].filter((k) => !claimed[k]).sort((p, q) => {
      const [px1, py1] = px(p), [px2, py2] = px(q);
      return Math.hypot(px1 - ax, py1 - ay) - Math.hypot(px2 - ax, py2 - ay);
    }).slice(0, i === origin ? 3 : 2);
    near.forEach((j, n) => {
      const [bx, by] = px(j);
      const d = Math.hypot(bx - ax, by - ay);
      const t0 = liveAt[i] + 0.1 + n * 0.12, dur = 0.5 + d * 0.0011;
      claimed[j] = true; liveAt[j] = t0 + dur;
      edges.push({ a: i, b: j, t0, dur, seed: (i * 7 + j * 13) % 10 / 10 });
    });
  }
  return { start, edges, liveAt, origin, end: Math.max(...liveAt) };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * A global deploy map. Press Deploy, or click anywhere on the map to ship from the nearest region:
 * the release leaves the origin as glowing blue arcs that spread from region to region until
 * every one is live, and then traffic keeps flowing along the links. Hover a region for its latency.
 * On the map, arrow keys choose the origin and Enter deploys.
 */
export interface GlobalDeployProps {
  /** Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. */
  autoplay?: boolean;
  /** Plays interface sounds that follow what happens on screen. They follow the visitor's sound switch (off until switched on on this site). */
  enableSound?: boolean;
  /** Extra classes for the outer card. */
  className?: string;
}

export function GlobalDeploy({ autoplay = false, enableSound = true, className = "" }: GlobalDeployProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touched = useRef(false);
  const [origin, setOrigin] = useState(0);
  const [version, setVersion] = useState(1);
  const [count, setCount] = useState(N);
  const [deploying, setDeploying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const [focusMap, setFocusMap] = useState(false);
  const [live, setLive] = useState("");
  const eng = useRef({ W: 0, H: 0, plan: null as Plan | null, time: 0, origin: 0, sel: 0, focus: false, count: N, mask: ALL_LIVE, deploying: false });
  const api = useRef<{ deploy: (o: number) => void }>({ deploy: () => {} });
  // render-safe mirrors of engine values the markup needs
  const [mapW, setMapW] = useState(0);
  const [liveMask, setLiveMask] = useState(ALL_LIVE);
  const lastKeyTick = useRef(0);

  // sounds: a real visitor uses play(), the autoplay ghost uses play.auto()
  const play = useProSound(enableSound);
  const sfx = (name: ProSoundName, volume?: number) => {
    if (typeof document !== "undefined" && document.hidden) return;
    if (touched.current) play(name, volume);
    else play.auto(name, volume);
  };
  const sfxRef = useRef(sfx);
  useLayoutEffect(() => { sfxRef.current = sfx; });

  useEffect(() => {
    const host = hostRef.current!, cv = canvasRef.current!, ctx = cv.getContext("2d")!;
    const e = eng.current;
    let dpr = 1, dots: HTMLCanvasElement | null = null;
    const px = (i: number): [number, number] => {
      const r = REGIONS[i];
      return [((r.lon + 180) / 360) * e.W, ((Y_N - millerY(r.lat)) / (Y_N - Y_S)) * e.H];
    };
    const layout = () => {
      const W = host.clientWidth; if (!W) return;
      const H = Math.round(W / ASPECT);
      host.style.height = `${H}px`;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      e.W = W; e.H = H;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      // the dotted continents, baked once per size; dots fade out toward the sides
      dots = document.createElement("canvas"); dots.width = cv.width; dots.height = cv.height;
      const d = dots.getContext("2d")!; d.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = Math.max(4.2, W / 150), r = Math.max(0.85, step * 0.2);
      for (let y = step / 2; y < H; y += step) {
        const lat = invMiller(Y_N - (y / H) * (Y_N - Y_S));
        for (let x = step / 2; x < W; x += step) {
          const lon = (x / W) * 360 - 180;
          if (!land(lat, lon)) continue;
          const edge = Math.min(x, W - x) / (W * 0.12);
          const a = 0.34 * Math.min(1, edge);
          if (a < 0.02) continue;
          d.fillStyle = `rgba(60,60,67,${a.toFixed(3)})`;
          d.beginPath(); d.arc(x, y, r, 0, Math.PI * 2); d.fill();
        }
      }
      // keep the current network, re-planned in the new pixel space
      if (e.plan) e.plan = { ...plan(e.plan.origin, e.plan.start, px) };
    };
    layout();
    const ro = new ResizeObserver(() => { if (host.clientWidth !== e.W) layout(); setMapW(e.W); });
    ro.observe(host);

    // start fully deployed: an existing release is already live everywhere
    e.plan = plan(0, -60, px);

    api.current.deploy = (o: number) => {
      e.origin = o; e.sel = o;
      e.plan = plan(o, e.time + 0.05, px);
      e.deploying = true; e.count = 0; e.mask = 0;
      setOrigin(o); setDeploying(true); setCount(0); setLiveMask(0); setVersion((v) => v + 1);
      sfxRef.current("scan-sweep", 0.5); // the release leaves the origin
      setLive(`Deploying from ${REGIONS[o].name}`);
    };

    const curve = (ed: Edge): [number, number, number, number, number, number] => {
      const [ax, ay] = px(ed.a), [bx, by] = px(ed.b);
      const d = Math.hypot(bx - ax, by - ay);
      return [ax, ay, (ax + bx) / 2, (ay + by) / 2 - d * 0.32 - 6, bx, by];
    };
    const at = (c: number[], t: number): [number, number] => {
      const u = 1 - t;
      return [u * u * c[0] + 2 * u * t * c[2] + t * t * c[4], u * u * c[1] + 2 * u * t * c[3] + t * t * c[5]];
    };
    const strokeTo = (c: number[], t1: number) => {
      ctx.beginPath(); ctx.moveTo(c[0], c[1]);
      const n = Math.max(2, Math.ceil(t1 * 36));
      for (let k = 1; k <= n; k++) { const [x, y] = at(c, (k / n) * t1); ctx.lineTo(x, y); }
      ctx.stroke();
    };

    let raf = 0, last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      e.time += dt;
      const t = e.time, P = e.plan;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      if (dots) ctx.drawImage(dots, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!P) return;
      ctx.lineCap = "round"; ctx.lineJoin = "round";

      // links: draw in, then settle to a quiet line that carries traffic
      for (const ed of P.edges) {
        const p = (t - ed.t0) / ed.dur;
        if (p <= 0) continue;
        const c = curve(ed), k = ease(Math.min(1, p));
        const settled = Math.min(1, Math.max(0, p - 1) * 1.5);
        ctx.strokeStyle = `rgba(0,113,227,${(0.5 - 0.28 * settled).toFixed(3)})`;
        ctx.lineWidth = 1.3;
        strokeTo(c, k);
        if (p < 1.25) {
          // the bright head and its comet tail
          const tail = Math.max(0, k - 0.3), [hx, hy] = at(c, k), [tx, ty] = at(c, tail);
          const fade = p < 1 ? 1 : 1 - (p - 1) * 4;
          const g = ctx.createLinearGradient(tx, ty, hx, hy);
          g.addColorStop(0, "rgba(100,210,255,0)"); g.addColorStop(1, `rgba(40,150,255,${fade})`);
          ctx.strokeStyle = g; ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(tx, ty);
          for (let s = 1; s <= 14; s++) { const [x, y] = at(c, tail + ((k - tail) * s) / 14); ctx.lineTo(x, y); }
          ctx.stroke();
          if (p < 1) {
            const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 9);
            hg.addColorStop(0, "rgba(255,255,255,1)"); hg.addColorStop(0.25, "rgba(100,200,255,.9)"); hg.addColorStop(1, "rgba(0,113,227,0)");
            ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, Math.PI * 2); ctx.fill();
          }
        } else {
          // traffic: small packets riding the links
          for (let q = 0; q < 2; q++) {
            const ph = (t * 0.32 + ed.seed + q * 0.5) % 1, [x, y] = at(c, ph);
            const a = Math.sin(ph * Math.PI) * 0.85 * settled;
            ctx.fillStyle = `rgba(0,122,255,${a.toFixed(3)})`;
            ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      // regions (markers shrink a little on small maps)
      const ms = Math.min(1, Math.max(0.62, e.W / 640));
      let n = 0, mask = 0;
      for (let i = 0; i < N; i++) {
        const [x, y] = px(i), la = P.liveAt[i], isLive = t >= la;
        if (isLive) { n++; mask |= 1 << i; }
        const since = t - la;
        if (isLive && since < 1.1) {
          // arrival ripple
          const k = since / 1.1;
          ctx.strokeStyle = `rgba(0,113,227,${((1 - k) * 0.55).toFixed(3)})`; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, y, (4 + k * 20) * ms, 0, Math.PI * 2); ctx.stroke();
        }
        if (i === P.origin && e.deploying) {
          const k = (t * 0.9) % 1;
          ctx.fillStyle = `rgba(0,113,227,${((1 - k) * 0.18).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(x, y, (6 + k * 16) * ms, 0, Math.PI * 2); ctx.fill();
        }
        const pop = ms * (isLive ? 1 + Math.max(0, 0.6 - since * 3) * Math.sin(Math.min(1, since * 5) * Math.PI) : 1);
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(x, y, 5.2 * pop, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = isLive ? "#0071e3" : "#c7c7cc";
        ctx.beginPath(); ctx.arc(x, y, 3.4 * pop, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = isLive ? "rgba(0,113,227,.25)" : "rgba(0,0,0,.12)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 5.7 * pop, 0, Math.PI * 2); ctx.stroke();
        if (e.focus && i === e.sel) {
          ctx.strokeStyle = "#0071e3"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(x, y, 10 * ms, 0, Math.PI * 2); ctx.stroke();
        }
      }
      if (n !== e.count || mask !== e.mask) {
        // regions that just went live (the origin is covered by the launch sound)
        const arrived = mask & ~e.mask & ~(1 << P.origin);
        e.count = n; e.mask = mask; setCount(n); setLiveMask(mask);
        if (e.deploying && arrived) sfxRef.current("glass-tap", 0.35);
        if (e.deploying && n === N) {
          e.deploying = false; setDeploying(false);
          const s = P.end - P.start; setElapsed(s);
          setLive(`Live in all ${N} regions in ${s.toFixed(1)} seconds`);
          sfxRef.current("access-granted", 0.6); // every region is live
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  /* autoplay: ship from a different region every few seconds until someone takes over */
  useEffect(() => {
    if (!autoplay) return;
    const order = [0, 4, 10, 2, 8, 6];
    let k = 0, timer = 0;
    const go = () => {
      if (touched.current) return;
      api.current.deploy(order[k++ % order.length]);
      timer = window.setTimeout(go, 6200);
    };
    timer = window.setTimeout(go, 1400);
    return () => clearTimeout(timer);
  }, [autoplay]);

  const nearest = (cx: number, cy: number, max = Infinity) => {
    const e = eng.current, host = hostRef.current!, r = host.getBoundingClientRect(), s = r.width / (host.offsetWidth || 1);
    const x = (cx - r.left) / s, y = (cy - r.top) / s;
    let best = -1, bd = max;
    REGIONS.forEach((g, i) => {
      const gx = ((g.lon + 180) / 360) * e.W, gy = ((Y_N - millerY(g.lat)) / (Y_N - Y_S)) * e.H;
      const d = Math.hypot(gx - x, gy - y);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  };
  const posOf = (i: number) => {
    const e = eng.current, g = REGIONS[i];
    return { x: ((g.lon + 180) / 360) * e.W, y: ((Y_N - millerY(g.lat)) / (Y_N - Y_S)) * e.H };
  };
  const onMove = (ev: RPointerEvent<HTMLDivElement>) => {
    const i = nearest(ev.clientX, ev.clientY, 18);
    if (i < 0) { if (hover) setHover(null); return; }
    if (!hover || hover.i !== i) setHover({ i, ...posOf(i) });
  };
  const onClick = (ev: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const i = nearest(ev.clientX, ev.clientY);
    if (i >= 0) api.current.deploy(i);
  };
  const onKey = (ev: RKeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    const e = eng.current;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown" || ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
      ev.preventDefault();
      e.sel = (e.sel + (ev.key === "ArrowRight" || ev.key === "ArrowDown" ? 1 : N - 1)) % N;
      const nowMs = performance.now();
      if (nowMs - lastKeyTick.current > 80) { lastKeyTick.current = nowMs; sfx("wood-tap", 0.3); }
      setHover({ i: e.sel, ...posOf(e.sel) });
      setLive(REGIONS[e.sel].name);
    } else if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      api.current.deploy(e.sel);
    }
  };

  const ver = `v2.4.${version}`;
  const lat = hover ? rtt(origin, hover.i) : 0;
  const hoverLive = hover ? (!deploying || ((liveMask >> hover.i) & 1) === 1) : false;

  return (
    <div
      className={`relative w-full max-w-[760px] overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      onPointerDownCapture={() => (touched.current = true)}
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#6e6e73]">Edge network</p>
          <h3 className="truncate text-[21px] font-semibold leading-tight tracking-[-0.022em] text-[#1d1d1f]">Global deploy</h3>
        </div>
        <div className="flex h-[30px] flex-none items-center gap-2 whitespace-nowrap rounded-full bg-[#f5f5f7] pl-2.5 pr-3 text-[13px] font-medium text-[#1d1d1f] tabular-nums">
          <span className={`h-2 w-2 rounded-full ${deploying ? "bg-[#ff9f0a]" : "bg-[#30d158]"}`} aria-hidden="true" />
          <span>{count} of {N}<span className="hidden sm:inline"> live</span></span>
        </div>
      </div>

      <div
        ref={hostRef}
        role="application"
        tabIndex={0}
        aria-label={`World map of ${N} regions. Arrow keys choose a region, Enter deploys from it. Click a spot to deploy from the nearest region.`}
        className="relative mx-auto mt-2 w-full cursor-pointer touch-manipulation outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3]"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onPointerUp={onClick}
        onKeyDown={onKey}
        onFocus={() => { eng.current.focus = true; setFocusMap(true); }}
        onBlur={() => { eng.current.focus = false; setFocusMap(false); setHover(null); }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <AnimatePresence>
          {hover && (
            <motion.div
              key={hover.i}
              aria-hidden="true"
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-[12px] bg-white/95 px-3 py-2 shadow-[0_0_0_.5px_rgba(0,0,0,.1),0_10px_24px_-10px_rgba(0,0,0,.3)] backdrop-blur"
              style={{ left: Math.min(Math.max(hover.x, 130), mapW - 130), top: hover.y < 76 ? hover.y + 14 : hover.y - 14, x: "-50%", y: hover.y < 76 ? 0 : "-100%" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 520, damping: 32 }}
            >
              <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{REGIONS[hover.i].name}</p>
              <p className="text-[12px] text-[#6e6e73] tabular-nums">
                {hover.i === origin ? "Origin" : `${lat} ms from ${REGIONS[origin].name}`} · {hoverLive ? ver : "waiting"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 border-t border-black/[.06] px-5 py-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="h-[22px] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={deploying ? "d" : `l${version}`}
                className="truncate text-[15px] font-semibold tracking-[-0.012em] text-[#1d1d1f] tabular-nums"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.12 } }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              >
                {deploying ? <>Deploying {ver}<span className="hidden sm:inline"> from {REGIONS[origin].name}</span></> : version === 1 ? `${ver} is live everywhere` : <>{ver} live<span className="hidden sm:inline"> in {N} regions</span> in {elapsed.toFixed(1)} s</>}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-[#ececf0]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: deploying ? "linear-gradient(90deg,#64d2ff,#0071e3)" : "#30d158", originX: 0 }}
              animate={{ scaleX: count / N }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => { touched.current = true; api.current.deploy(focusMap ? eng.current.sel : origin); }}
          className="h-9 flex-none whitespace-nowrap rounded-full bg-[#0071e3] px-4 text-[14px] font-medium text-white outline-none transition-colors hover:bg-[#0077ed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
        >
          Deploy
        </button>
      </div>
      <p className="px-5 pb-4 text-[12px] text-[#6e6e73] sm:px-6">Click anywhere on the map to deploy from the nearest region. Hover a region for its latency.</p>
      <div className="sr-only" aria-live="polite">{live}</div>
    </div>
  );
}
```

--- components/global-deploy/index.ts ---

```ts
export { GlobalDeploy } from "./global-deploy";
export type { GlobalDeployProps } from "./global-deploy";
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/ui-sounds-pro.ts ---

```ts
/**
 * The Nexus UI Pro sound pack: 39 more interface sounds in six sets (Glass, Paper and wood,
 * Arcade, Studio, Devices, Gallery), made the same way as the free ones, from oscillators and filtered noise with the
 * Web Audio API. No audio files. It builds on `@/lib/ui-sounds`, which installs with it, and follows
 * the same on/off switch.
 *
 *   import { playProSound } from "@/lib/ui-sounds-pro";
 *   <button onClick={() => playProSound("glass-chime")}>Done</button>
 *
 * In a component with an `enableSound` option:
 *
 *   const play = useProSound(enableSound);
 *   play("coin");
 */

import * as React from "react";
import { audioAwake, hiss, playDef, tone, useAutoplaySoundAllowed, type SoundDef } from "@/lib/ui-sounds";

export type ProSoundCategory = "Glass" | "Paper and wood" | "Arcade" | "Studio" | "Devices" | "Gallery";
type ProDef = SoundDef & { category: ProSoundCategory };

export const PRO_SOUNDS = {
  // Glass: small, bright, with a ring that fades.
  "glass-tap": { category: "Glass", label: "Glass tap", play: (c, o) => { tone(c, o, { freq: 2400, to: 2200, decay: 0.06, gain: 0.2 }); tone(c, o, { freq: 3600, decay: 0.04, gain: 0.08 }); hiss(c, o, { freq: 6500, decay: 0.012, gain: 0.08, filter: "highpass" }); } },
  "glass-chime": { category: "Glass", label: "Glass chime", play: (c, o) => [1, 2.32, 4.25].forEach((m, i) => tone(c, o, { freq: 1320 * m, decay: 1.0 / (i + 1), gain: 0.16 / (i + 1) })) },
  "glass-ping": { category: "Glass", label: "Glass ping", play: (c, o) => { tone(c, o, { freq: 2093, decay: 1.1, gain: 0.14 }); tone(c, o, { freq: 3136, decay: 0.6, gain: 0.06 }); } },
  "glass-open": { category: "Glass", label: "Glass open", play: (c, o) => { tone(c, o, { freq: 1568, decay: 0.16, gain: 0.14 }); tone(c, o, { at: 0.07, freq: 2093, decay: 0.2, gain: 0.14 }); tone(c, o, { at: 0.14, freq: 2637, decay: 0.45, gain: 0.12 }); hiss(c, o, { at: 0.05, attack: 0.06, decay: 0.16, freq: 5000, to: 9000, gain: 0.04, filter: "highpass" }); } },
  "glass-close": { category: "Glass", label: "Glass close", play: (c, o) => { tone(c, o, { freq: 2637, decay: 0.14, gain: 0.12 }); tone(c, o, { at: 0.07, freq: 2093, decay: 0.16, gain: 0.12 }); tone(c, o, { at: 0.14, freq: 1568, decay: 0.4, gain: 0.12 }); } },
  "glass-clink": { category: "Glass", label: "Clink", play: (c, o) => { tone(c, o, { freq: 3136, decay: 0.28, gain: 0.12 }); tone(c, o, { at: 0.018, freq: 3520, decay: 0.22, gain: 0.1 }); hiss(c, o, { freq: 7000, decay: 0.01, gain: 0.1, filter: "highpass" }); } },

  // Paper and wood: dry, close and physical.
  "paper-flip": { category: "Paper and wood", label: "Page flip", play: (c, o) => { hiss(c, o, { attack: 0.012, decay: 0.09, freq: 3600, to: 1500, gain: 0.16, q: 0.9 }); hiss(c, o, { at: 0.075, attack: 0.008, decay: 0.05, freq: 2600, to: 1800, gain: 0.08, q: 0.9 }); } },
  "paper-crumple": { category: "Paper and wood", label: "Crumple", play: (c, o) => [[0, 3200], [0.028, 4400], [0.05, 2600], [0.085, 5000], [0.115, 3000], [0.15, 4200], [0.19, 2800]].forEach(([at, f], i) => hiss(c, o, { at, attack: 0.002, decay: 0.03 + (i % 3) * 0.01, freq: f, gain: 0.22, q: 2.4 })) },
  "paper-tear": { category: "Paper and wood", label: "Tear", play: (c, o) => { hiss(c, o, { attack: 0.02, decay: 0.24, freq: 1800, to: 5200, gain: 0.13, filter: "highpass", q: 0.7 }); [0.02, 0.06, 0.1, 0.15, 0.2].forEach((at) => hiss(c, o, { at, attack: 0.002, decay: 0.02, freq: 4200, gain: 0.08, q: 3 })); } },
  "wood-tap": { category: "Paper and wood", label: "Wood tap", play: (c, o) => { tone(c, o, { freq: 520, to: 300, decay: 0.07, gain: 0.32, type: "triangle" }); hiss(c, o, { freq: 1200, decay: 0.02, gain: 0.14, q: 3 }); } },
  "wood-block": { category: "Paper and wood", label: "Wood block", play: (c, o) => { tone(c, o, { freq: 880, decay: 0.12, gain: 0.28, type: "triangle" }); tone(c, o, { freq: 1320, decay: 0.06, gain: 0.1 }); hiss(c, o, { freq: 2400, decay: 0.012, gain: 0.1, q: 2 }); } },
  "wood-drop": { category: "Paper and wood", label: "Wood drop", play: (c, o) => { tone(c, o, { freq: 220, to: 120, decay: 0.14, gain: 0.42 }); hiss(c, o, { freq: 700, decay: 0.06, gain: 0.16, filter: "lowpass" }); tone(c, o, { at: 0.15, freq: 240, to: 150, decay: 0.08, gain: 0.2 }); } },

  // Arcade: square waves and quick arpeggios.
  coin: { category: "Arcade", label: "Coin", play: (c, o) => { tone(c, o, { freq: 988, decay: 0.07, gain: 0.12, type: "square" }); tone(c, o, { at: 0.07, freq: 1319, decay: 0.3, gain: 0.12, type: "square" }); } },
  "power-up": { category: "Arcade", label: "Power up", play: (c, o) => [392, 523, 659, 784, 1047].forEach((f, i) => tone(c, o, { at: i * 0.05, freq: f, decay: 0.12, gain: 0.1, type: "square" })) },
  blip: { category: "Arcade", label: "Blip", play: (c, o) => tone(c, o, { freq: 660, decay: 0.05, gain: 0.12, type: "square" }) },
  laser: { category: "Arcade", label: "Laser", play: (c, o) => tone(c, o, { freq: 1800, to: 200, glide: 0.18, decay: 0.18, gain: 0.1, type: "square" }) },
  "level-up": { category: "Arcade", label: "Level up", play: (c, o) => { [523, 659, 784, 1047].forEach((f, i) => tone(c, o, { at: i * 0.09, freq: f, decay: 0.12, gain: 0.1, type: "triangle" })); tone(c, o, { at: 0.36, freq: 1319, decay: 0.5, gain: 0.1, type: "triangle" }); } },
  "game-over": { category: "Arcade", label: "Game over", play: (c, o) => { [392, 370, 349, 330].forEach((f, i) => tone(c, o, { at: i * 0.17, freq: f, decay: 0.16, gain: 0.1, type: "square" })); tone(c, o, { at: 0.7, freq: 165, decay: 0.55, gain: 0.12, type: "square" }); } },

  // Studio: bigger moments with a tail.
  riser: { category: "Studio", label: "Riser", play: (c, o) => { hiss(c, o, { attack: 0.5, decay: 0.12, freq: 300, to: 6000, gain: 0.14, q: 0.8 }); tone(c, o, { freq: 110, to: 440, glide: 0.6, attack: 0.5, decay: 0.15, gain: 0.07, type: "sawtooth" }); } },
  impact: { category: "Studio", label: "Impact", play: (c, o) => { tone(c, o, { freq: 70, to: 35, glide: 0.35, decay: 0.45, gain: 0.55 }); hiss(c, o, { freq: 500, decay: 0.25, gain: 0.25, filter: "lowpass" }); } },
  sparkle: { category: "Studio", label: "Sparkle", play: (c, o) => [[0, 4000], [0.04, 5200], [0.075, 6200], [0.12, 4800], [0.16, 6800]].forEach(([at, f]) => tone(c, o, { at, freq: f, decay: 0.16, gain: 0.08 })) },
  "confetti-pop": { category: "Studio", label: "Confetti pop", play: (c, o) => { hiss(c, o, { freq: 1200, decay: 0.09, gain: 0.26, filter: "highpass" }); tone(c, o, { freq: 220, to: 90, decay: 0.08, gain: 0.3 }); [0.06, 0.1, 0.15].forEach((at, i) => tone(c, o, { at, freq: 3600 + i * 700, decay: 0.12, gain: 0.04 })); } },
  fanfare: { category: "Studio", label: "Fanfare", play: (c, o) => [[0, [523, 659, 784]], [0.12, [587, 740, 880]], [0.24, [659, 784, 1047]]].forEach(([at, notes]) => (notes as number[]).forEach((f) => tone(c, o, { at: at as number, freq: f, decay: 0.5, gain: 0.07, type: "triangle" }))) },
  swell: { category: "Studio", label: "Swell", play: (c, o) => [196, 247, 294, 392].forEach((f) => tone(c, o, { freq: f, attack: 0.5, decay: 1.2, gain: 0.05 })) },

  // Devices: scanners, readers, relays and machines. Short, dry and a little electronic.
  "scan-sweep": { category: "Devices", label: "Scan sweep", play: (c, o) => { hiss(c, o, { attack: 0.06, decay: 0.3, freq: 600, to: 3800, gain: 0.1, q: 1.6 }); tone(c, o, { freq: 420, to: 1250, glide: 0.38, attack: 0.05, decay: 0.12, gain: 0.05, type: "triangle" }); } },
  "card-insert": { category: "Devices", label: "Card insert", play: (c, o) => { hiss(c, o, { attack: 0.02, decay: 0.13, freq: 1800, to: 500, gain: 0.14, q: 1.2 }); tone(c, o, { at: 0.12, freq: 150, to: 90, decay: 0.07, gain: 0.3 }); hiss(c, o, { at: 0.12, freq: 3200, decay: 0.012, gain: 0.16, filter: "highpass" }); } },
  "access-granted": { category: "Devices", label: "Access granted", play: (c, o) => { tone(c, o, { freq: 988, decay: 0.09, gain: 0.14, type: "triangle" }); tone(c, o, { at: 0.1, freq: 1480, decay: 0.26, gain: 0.14, type: "triangle" }); } },
  "access-denied": { category: "Devices", label: "Access denied", play: (c, o) => { tone(c, o, { freq: 196, decay: 0.13, gain: 0.15, type: "square" }); tone(c, o, { at: 0.16, freq: 165, decay: 0.24, gain: 0.15, type: "square" }); } },
  "relay-click": { category: "Devices", label: "Relay click", play: (c, o) => { hiss(c, o, { freq: 2800, decay: 0.008, gain: 0.3, filter: "highpass" }); tone(c, o, { freq: 1800, to: 700, decay: 0.02, gain: 0.12 }); tone(c, o, { at: 0.015, freq: 120, decay: 0.05, gain: 0.24 }); } },
  bloop: { category: "Devices", label: "Bloop", play: (c, o) => { tone(c, o, { freq: 300, to: 720, glide: 0.09, decay: 0.12, gain: 0.3 }); tone(c, o, { at: 0.05, freq: 640, to: 1200, glide: 0.05, decay: 0.06, gain: 0.1 }); } },
  crumble: { category: "Devices", label: "Crumble", play: (c, o) => { [[0, 2400], [0.03, 1900], [0.07, 2600], [0.1, 1500], [0.15, 2100], [0.19, 1200], [0.26, 1700], [0.31, 900]].forEach(([at, f]) => hiss(c, o, { at, attack: 0.002, decay: 0.035, freq: f, gain: 0.12, q: 2 })); tone(c, o, { freq: 95, to: 60, decay: 0.22, gain: 0.12 }); } },
  pour: { category: "Devices", label: "Pour", play: (c, o) => { hiss(c, o, { attack: 0.04, decay: 0.5, freq: 3000, to: 1600, gain: 0.09, q: 1.2 }); hiss(c, o, { at: 0.08, attack: 0.05, decay: 0.4, freq: 5200, gain: 0.05, filter: "highpass" }); } },

  // Gallery: a ring of photo cards. Light, papery and airy, with a soft glass edge. They are written to follow the
  // motion of the Ring Gallery: a tick for each card that passes, a thud when the ring settles, a whoosh that swells
  // and fades with the speed of the spin-in. None plays on hover.
  "ring-tick": { category: "Gallery", label: "Ring tick", play: (c, o) => { const j = 0.94 + Math.random() * 0.12; hiss(c, o, { freq: 3800 * j, decay: 0.013, gain: 0.36, q: 3.2 }); tone(c, o, { freq: 1300 * j, to: 920 * j, decay: 0.03, gain: 0.17, type: "triangle" }); } },
  "ring-settle": { category: "Gallery", label: "Ring settle", play: (c, o) => { tone(c, o, { freq: 150, to: 92, glide: 0.1, decay: 0.16, gain: 0.28 }); hiss(c, o, { freq: 700, decay: 0.06, gain: 0.1, filter: "lowpass" }); tone(c, o, { at: 0.01, freq: 2093, decay: 0.5, gain: 0.035 }); } },
  "ring-spool": {
    category: "Gallery",
    label: "Ring spool",
    length: 2.2,
    play: (c, o) => {
      // Two seconds shaped like the spin it goes with: slow, fastest in the middle, slow again. A band of air opens as
      // the ring picks up speed and closes as it slows, with a low whine that rises and falls the same way.
      const t0 = c.currentTime, T = 2, K = 64;
      const bell = (k: number) => Math.pow(Math.sin((Math.PI * k) / (K - 1)), 1.6);
      const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const air = c.createBufferSource();
      air.buffer = buf;
      air.loop = true;
      const band = c.createBiquadFilter();
      band.type = "bandpass";
      band.Q.value = 0.9;
      band.frequency.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 260 * Math.pow(10, bell(k))), t0, T);
      const ag = c.createGain();
      ag.gain.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 0.0001 + 0.15 * bell(k)), t0, T);
      air.connect(band).connect(ag).connect(o);
      air.start(t0);
      air.stop(t0 + T + 0.05);
      const whine = c.createOscillator();
      whine.type = "triangle";
      whine.frequency.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 90 * Math.pow(3.8, bell(k))), t0, T);
      const wg = c.createGain();
      wg.gain.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 0.0001 + 0.06 * bell(k) * bell(k)), t0, T);
      whine.connect(wg).connect(o);
      whine.start(t0);
      whine.stop(t0 + T + 0.05);
    },
  },
  "ring-open": { category: "Gallery", label: "Entry open", play: (c, o) => { hiss(c, o, { attack: 0.12, decay: 0.22, freq: 500, to: 3200, gain: 0.1, q: 0.9 }); tone(c, o, { freq: 196, to: 130, glide: 0.14, attack: 0.01, decay: 0.28, gain: 0.2 }); tone(c, o, { at: 0.2, freq: 1568, decay: 0.5, gain: 0.07 }); tone(c, o, { at: 0.24, freq: 2349, decay: 0.55, gain: 0.05 }); } },
  "ring-close": { category: "Gallery", label: "Entry close", play: (c, o) => { tone(c, o, { freq: 2349, decay: 0.25, gain: 0.05 }); tone(c, o, { at: 0.06, freq: 1568, decay: 0.3, gain: 0.07 }); hiss(c, o, { at: 0.02, attack: 0.06, decay: 0.22, freq: 3200, to: 500, gain: 0.09, q: 0.9 }); tone(c, o, { at: 0.22, freq: 170, to: 110, glide: 0.1, decay: 0.22, gain: 0.18 }); } },
  "ring-next": { category: "Gallery", label: "Next entry", play: (c, o) => { hiss(c, o, { attack: 0.01, decay: 0.08, freq: 2200, to: 4200, gain: 0.18, q: 0.9 }); tone(c, o, { freq: 740, to: 988, glide: 0.07, decay: 0.09, gain: 0.13, type: "triangle" }); } },
  "ring-prev": { category: "Gallery", label: "Previous entry", play: (c, o) => { hiss(c, o, { attack: 0.01, decay: 0.08, freq: 4200, to: 2200, gain: 0.18, q: 0.9 }); tone(c, o, { freq: 988, to: 740, glide: 0.07, decay: 0.09, gain: 0.13, type: "triangle" }); } },
} satisfies Record<string, ProDef>;

export type ProSoundName = keyof typeof PRO_SOUNDS;

/** Play a Pro sound by name. volume is 0..1 on top of the master level. Silent while sounds are off unless `force`. */
export function playProSound(name: ProSoundName, volume = 1, force = false) {
  if (!(name in PRO_SOUNDS)) return;
  playDef(name, PRO_SOUNDS[name], volume, force);
}

/**
 * Like useSound in `@/lib/ui-sounds`, for the Pro sounds: silent when `enabled` is false.
 * `play.auto(...)` is for a component that plays itself (autoplay).
 */
export type ProSoundPlayer = {
  (name: ProSoundName, volume?: number): void;
  auto: (name: ProSoundName, volume?: number) => void;
};

export function useProSound(enabled = true): ProSoundPlayer {
  const auto = useAutoplaySoundAllowed();
  return React.useMemo(
    () =>
      Object.assign(
        (name: ProSoundName, volume = 1) => {
          if (enabled) playProSound(name, volume);
        },
        {
          auto: (name: ProSoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playProSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}
```
