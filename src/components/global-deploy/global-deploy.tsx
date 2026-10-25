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
