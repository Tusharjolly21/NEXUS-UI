"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProSound, type ProSoundName } from "@/lib/ui-sounds-pro";

type Kind = "photos" | "notes" | "files" | "mail" | "contact";
type Phase = "idle" | "backing" | "paused" | "done";
type ItemSt = "orbit" | "fly" | "absorbed" | "emerge";

const ITEMS: { kind: Kind; name: string; col: [number, number, number] }[] = [
  { kind: "photos", name: "Photos", col: [255, 120, 120] },
  { kind: "notes", name: "Notes", col: [255, 190, 50] },
  { kind: "files", name: "Files", col: [60, 165, 255] },
  { kind: "mail", name: "Mail", col: [125, 120, 255] },
  { kind: "contact", name: "Contacts", col: [50, 205, 155] },
];
const COUNT = ITEMS.length;
const N = 120; // outline samples
const STAGE_H = 320;
const FOCAL = 1000;
const ELEV = 0.27; // orbit plane elevation, radians
const RISE = 0.55; // seconds an item takes to bob out of the cloud

// Cloud silhouette as a signed distance field: flat rounded base smoothly unioned with three lobes.
function sdCloud(x: number, y: number) {
  const circ = (cx: number, cy: number, r: number) => Math.hypot(x - cx, y - cy) - r;
  const qx = Math.abs(x + 0.04) - 0.88 + 0.26, qy = Math.abs(y - 0.26) - 0.26 + 0.26;
  let d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - 0.26;
  const smin = (a: number, b: number, k: number) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
  d = smin(d, circ(0.06, -0.2, 0.52), 0.18);
  d = smin(d, circ(-0.56, 0.06, 0.34), 0.16);
  d = smin(d, circ(0.56, 0.04, 0.36), 0.16);
  return d;
}
// outermost boundary radius per angle (unit space)
const BASE_R = (() => {
  const r = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2, dx = Math.cos(th), dy = Math.sin(th);
    let t = 1.6;
    while (t > 0 && sdCloud(dx * t, dy * t) > 0) t -= 0.01;
    let lo = t, hi = t + 0.01;
    for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (sdCloud(dx * m, dy * m) > 0) hi = m; else lo = m; }
    r[i] = lo;
  }
  return r;
})();
const TOP_U = 0.72, BOT_U = 0.52; // vertical extents in unit space

const BLOBS = [
  { x: -0.45, y: 0.05, r: 0.62, c: "255,176,222", fx: 0.31, fy: 0.23, p: 0.0, d: 1.0 },
  { x: 0.1, y: -0.32, r: 0.66, c: "180,166,255", fx: 0.27, fy: 0.35, p: 1.7, d: 0.6 },
  { x: 0.55, y: 0.05, r: 0.58, c: "150,212,255", fx: 0.37, fy: 0.29, p: 3.1, d: 1.3 },
  { x: -0.05, y: 0.28, r: 0.55, c: "162,238,214", fx: 0.22, fy: 0.41, p: 4.4, d: 0.8 },
  { x: 0.3, y: 0.32, r: 0.46, c: "255,214,168", fx: 0.43, fy: 0.19, p: 5.6, d: 1.6 },
];

/** Original app glyphs: one coloured tile each, a white mark on top, nothing else. */
const ICON_GRAD: Record<Kind, [string, string]> = {
  photos: ["#ff9a6b", "#ff4f7b"],
  notes: ["#ffd25e", "#ff9f0a"],
  files: ["#62cdfb", "#0a7cff"],
  mail: ["#8f8cff", "#5b58e8"],
  contact: ["#4fe0b0", "#11b583"],
};
function AppIcon({ kind, uid }: { kind: Kind; uid: string }) {
  const id = `${uid}${kind}g`;
  const [c0, c1] = ICON_GRAD[kind];
  const round = kind === "contact";
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stopColor={c0} /><stop offset="1" stopColor={c1} /></linearGradient>
      </defs>
      {round ? <circle cx="30" cy="30" r="30" fill={`url(#${id})`} /> : <rect width="60" height="60" rx="15.6" fill={`url(#${id})`} />}
      {kind === "photos" && (
        <>
          <circle cx="40.5" cy="19.5" r="5.2" fill="#fff" opacity="0.95" />
          <path d="M9.5 46.5 22.6 28.4a2 2 0 0 1 3.2 0L33 38.2l4.4-5.6a2 2 0 0 1 3.1 0l10 13.9Z" fill="#fff" />
        </>
      )}
      {kind === "notes" && (
        <>
          <rect x="14" y="17" width="27" height="4" rx="2" fill="#fff" />
          <rect x="14" y="26.5" width="21" height="4" rx="2" fill="#fff" opacity="0.92" />
          <rect x="14" y="36" width="14" height="4" rx="2" fill="#fff" opacity="0.85" />
          <path d="M45.4 30.2 48.8 33.6 36.2 46.2 31.5 47.5 32.8 42.8Z" fill="#fff" />
        </>
      )}
      {kind === "files" && (
        <>
          <path d="M12.5 20.5a3.5 3.5 0 0 1 3.5-3.5h8.4a3 3 0 0 1 2.2 1l2.6 2.8H44a3.5 3.5 0 0 1 3.5 3.5v16.2A3.5 3.5 0 0 1 44 44H16a3.5 3.5 0 0 1-3.5-3.5Z" fill="#fff" />
          <rect x="12.5" y="26" width="35" height="2.4" fill={c1} opacity="0.28" />
        </>
      )}
      {kind === "mail" && (
        <>
          <rect x="12.5" y="18.5" width="35" height="24" rx="4" fill="#fff" />
          <path d="M14.5 21.5 30 33l15.5-11.5" fill="none" stroke={c1} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
        </>
      )}
      {kind === "contact" && (
        <>
          <circle cx="30" cy="23.5" r="8.6" fill="#fff" />
          <path d="M14.6 47.2C16.8 39.6 22.6 35.6 30 35.6s13.2 4 15.4 11.6A27.6 27.6 0 0 1 30 52.6a27.6 27.6 0 0 1-15.4-5.4Z" fill="#fff" />
        </>
      )}
    </svg>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" className="flex-none">
      <motion.circle cx="10" cy="10" r="10" fill="#30d158" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 520, damping: 20 }} style={{ originX: "50%", originY: "50%" }} />
      <motion.path d="M5.6 10.4l3 3 5.8-6.4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.12, duration: 0.42, ease: [0.65, 0, 0.35, 1] }} />
    </svg>
  );
}

type Item = {
  st: ItemSt; t: number; T: number; behind: boolean; cleared: boolean; contact: boolean;
  x: number; y: number; s: number; z: number; op: number; px: number; py: number;
  p0x: number; p0y: number; p0s: number; p1x: number; p1y: number; ex: number; ey: number; side: number;
  str: number; ang: number; bank: number;
};

/**
 * A backup status shown as a glass cloud. Your apps orbit it in 3D; press Back up
 * now (or Enter) and they leave the orbit one by one, arc up and sink into the
 * cloud, which wobbles with each one while a level of iridescent light rises
 * inside it. Pause and resume at any time; when it is up to date the icons drift
 * back out into orbit. Hover or drag the cloud to tilt it.
 */
export interface CloudSyncProps {
  /** Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. */
  autoplay?: boolean;
  /** Plays interface sounds that follow what happens on screen. They follow the visitor's sound switch (off until switched on on this site). */
  enableSound?: boolean;
  /** Extra classes for the outer card. */
  className?: string;
}

export function CloudSync({ autoplay = false, enableSound = true, className = "" }: CloudSyncProps) {
  const uid = useId().replace(/:/g, "");
  const [ui, setUi] = useState<{ phase: Phase; cur: number; name: string }>({ phase: "idle", cur: 0, name: "" });
  const [last, setLast] = useState("Yesterday, 11:42 PM");
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touched = useRef(false);
  const autoRef = useRef(autoplay);
  const play = useProSound(enableSound);
  const playRef = useRef(play);
  useLayoutEffect(() => {
    autoRef.current = autoplay;
    playRef.current = play;
  });

  // all simulation state lives here; React only hears about discrete changes
  const sim = useRef({
    W: 480, H: STAGE_H, S: 130, R: 200, cx: 240, cy: 160, icon: 40, dpr: 1,
    t: 0, orbit: 0.4,
    d: new Float32Array(N), v: new Float32Array(N),
    g: 0, gv: 0, bob: 0, bobV: 0,
    tx: 0, ty: 0, txv: 0, tyv: 0, tgx: 0, tgy: 0,
    hover: false, drag: null as null | { id: number; x0: number; y0: number; lx: number; ly: number; moved: number; vx: number; vy: number },
    L: 0.22, Lv: 0, Lt: 0.22, slosh: 0, sloshV: 0,
    phase: "idle" as Phase, launched: 0, absorbed: 0, nextLaunch: 0, ts: 1, emergeAt: -1, doneAt: -1, glow: 0,
    items: ITEMS.map(() => ({ st: "orbit", t: 0, T: 1.05, behind: false, cleared: false, contact: false, x: 0, y: 0, s: 1, z: 0, op: 1, px: 0, py: 0, p0x: 0, p0y: 0, p0s: 1, p1x: 0, p1y: 0, ex: 0, ey: 0, side: 1, str: 1, ang: 0, bank: 0 }) as Item),
    splash: [] as { x: number; y: number; y0: number; age: number; c: string; r: number }[],
    px: new Float32Array(N), py: new Float32Array(N),
    ap: { t: 0, cycle: 0, started: false, paused: false, resumed: false, idleAt: -1 },
    lastUi: "",
  });

  const api = useRef({
    start: () => {},
    toggle: () => {},
    primary: () => {},
  });

  useEffect(() => {
    const s = sim.current;
    const stage = stageRef.current!, canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const layout = () => {
      const W = stage.offsetWidth || 480;
      s.W = W;
      s.S = Math.max(84, Math.min(138, W * 0.29));
      s.R = Math.min(W * 0.42 - 4, s.S * 1.62);
      s.cx = W / 2;
      s.H = Math.round(Math.max(250, Math.min(STAGE_H, W * 0.5 + 80)));
      s.cy = Math.round(s.H * 0.5 - 2);
      stage.style.height = `${s.H}px`;
      s.icon = Math.round(Math.max(32, Math.min(40, W * 0.085)));
      s.dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * s.dpr);
      canvas.height = Math.round(s.H * s.dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${s.H}px`;
      iconRefs.current.forEach((el) => { if (el) { el.style.width = `${s.icon}px`; el.style.height = `${s.icon}px`; } });
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    // a sound from the visitor plays normally; one from the component playing itself uses the autoplay path
    const sfx = (name: ProSoundName, volume?: number) => {
      if (document.hidden) return;
      if (touched.current) playRef.current(name, volume);
      else playRef.current.auto(name, volume);
    };

    const pushUi = (phase: Phase, cur: number, name: string) => {
      const key = `${phase}|${cur}|${name}`;
      if (key === s.lastUi) return;
      s.lastUi = key;
      setUi({ phase, cur, name });
    };

    // projection with the current tilt (rotateY then rotateX, then perspective about the cloud centre)
    let PX = 0, PY = 0, PZ = 0, PK = 1;
    const proj = (x: number, y: number, z: number) => {
      const cY = Math.cos(s.ty), sY = Math.sin(s.ty), cX = Math.cos(s.tx), sX = Math.sin(s.tx);
      const x1 = x * cY + z * sY, z1 = -x * sY + z * cY;
      const y1 = y * cX - z1 * sX, z2 = y * sX + z1 * cX;
      PK = FOCAL / (FOCAL - z2);
      PX = s.cx + x1 * PK; PY = s.cy + s.bob + y1 * PK; PZ = z2;
    };
    const slot = (i: number) => {
      const a = s.orbit + (i * Math.PI * 2) / COUNT;
      const zf = s.R * Math.sin(a);
      proj(s.R * Math.cos(a), zf * Math.sin(ELEV), zf * Math.cos(ELEV));
    };
    const inside = (x: number, y: number) => {
      let c = false;
      for (let i = 0, j = N - 1; i < N; j = i++) {
        const xi = s.px[i], yi = s.py[i], xj = s.px[j], yj = s.py[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const kick = (ang: number, amp: number, width = 0.3, bulge = 0) => {
      for (let i = 0; i < N; i++) {
        let da = (i / N) * Math.PI * 2 - ang;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        s.v[i] += -amp * Math.exp(-(da / width) * (da / width)) + bulge;
      }
    };

    const launch = () => {
      // take the item nearest the side of the orbit (clear of the cloud, not behind it) so it can arc up and over
      let best = -1, bz = -1e9;
      s.items.forEach((it, i) => {
        if (it.st !== "orbit") return;
        const free = it.z > -s.R * 0.45 && !inside(it.x, it.y);
        const score = (free ? 1000 : 0) + Math.abs(it.x - s.cx) + it.z * 0.3;
        if (score > bz) { bz = score; best = i; }
      });
      if (best < 0) return false;
      const it = s.items[best];
      const vx = (it.x - it.px) * 60, vy = (it.y - it.py) * 60;
      it.st = "fly"; it.t = 0; it.T = 1.05; it.cleared = false; it.contact = false;
      it.p0x = it.x; it.p0y = it.y; it.p0s = it.s;
      it.side = it.x < s.cx ? -1 : 1;
      it.p1x = it.x + vx * 0.7 + it.side * s.S * 0.3;
      it.p1y = it.y + vy * 0.7 - s.S * 0.7;
      it.ex = s.cx + (((s.launched * 37) % 5) - 2) * s.S * 0.09;
      it.ey = s.cy - s.S * 0.18;
      s.launched++;
      sfx("glass-tap", 0.4);
      pushUi("backing", s.launched, ITEMS[best].name);
      return true;
    };

    const start = () => {
      if (s.phase === "backing" || s.phase === "paused") return;
      s.phase = "backing"; s.launched = 0; s.absorbed = 0; s.nextLaunch = 0.45; s.Lt = 0; s.doneAt = -1;
      s.sloshV += 0.6;
      sfx("scan-sweep", 0.55);
      pushUi("backing", 0, "");
    };
    const toggle = () => {
      if (s.phase === "backing") { s.phase = "paused"; sfx("glass-close", 0.5); pushUi("paused", s.launched, ""); }
      else if (s.phase === "paused") { s.phase = "backing"; sfx("glass-open", 0.5); const cur = s.items.findIndex((it) => it.st === "fly"); pushUi("backing", Math.max(1, s.launched), cur >= 0 ? ITEMS[cur].name : ""); }
    };
    api.current.start = start;
    api.current.toggle = toggle;
    api.current.primary = () => { if (s.phase === "backing" || s.phase === "paused") toggle(); else start(); };

    let raf = 0, prev = performance.now();
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(0.033, Math.max(0.001, (now - prev) / 1000));
      prev = now;
      s.t += dt;
      const t = s.t;

      // ---- autoplay script ----
      if (autoRef.current && !touched.current) {
        const ap = s.ap;
        ap.t += dt;
        if (!ap.started && ap.t > 1.1) { ap.started = true; start(); }
        if (ap.cycle % 2 === 1 && ap.started && !ap.paused && s.absorbed >= 2 && s.phase === "backing") { ap.paused = true; toggle(); ap.resumed = false; ap.idleAt = ap.t; }
        if (ap.paused && !ap.resumed && ap.t - ap.idleAt > 1.5) { ap.resumed = true; toggle(); ap.idleAt = -1; }
        const settled = s.phase === "done" && s.items.every((it) => it.st === "orbit");
        if (ap.started && settled) {
          if (ap.idleAt < 0) ap.idleAt = ap.t;
          if (ap.t - ap.idleAt > 2.2) { s.ap = { t: 0, cycle: ap.cycle + 1, started: false, paused: false, resumed: false, idleAt: -1 }; }
        }
        if (!s.hover && !s.drag) { s.tgx = Math.sin(t * 0.53) * 0.1; s.tgy = Math.sin(t * 0.41 + 1) * 0.2; }
      }

      // ---- controller ----
      const tsT = s.phase === "paused" ? 0 : 1;
      s.ts += (tsT - s.ts) * (1 - Math.exp(-dt * 5));
      if (s.phase === "backing") {
        s.nextLaunch -= dt;
        const inFlight = s.items.filter((it) => it.st === "fly").length;
        if (s.nextLaunch <= 0 && s.launched < COUNT && inFlight < 2) { if (launch()) s.nextLaunch = 0.78; }
      }
      if (s.doneAt > 0 && t >= s.doneAt) { s.doneAt = -1; s.phase = "done"; pushUi("done", COUNT, ""); setLast("Just now"); sfx("access-granted", 0.7); sfx("glass-chime", 0.5); s.emergeAt = t + 1.5; }
      if (s.emergeAt > 0 && t >= s.emergeAt) {
        s.emergeAt = -1;
        let k = 0;
        s.items.forEach((it) => {
          if (it.st !== "absorbed") return;
          it.st = "emerge"; it.t = -k * 0.16; it.cleared = false; it.behind = true; k++;
          it.p0x = s.cx + (k - 3) * s.S * 0.12; it.p0y = s.cy - s.S * 0.1; it.p0s = 0.42;
          it.x = it.p0x; it.y = it.p0y; it.px = it.x; it.py = it.y;
          it.side = k % 2 ? -1 : 1;
        });
      }

      // ---- physics ----
      const sub = 2, h = dt / sub;
      for (let k = 0; k < sub; k++) {
        for (let i = 0; i < N; i++) {
          const l = s.d[(i + N - 1) % N], r = s.d[(i + 1) % N];
          const a = -150 * s.d[i] - 6.5 * s.v[i] + 1400 * (l + r - 2 * s.d[i]);
          s.v[i] += a * h;
        }
        for (let i = 0; i < N; i++) s.d[i] += s.v[i] * h;
      }
      s.gv += (-110 * s.g - 8 * s.gv) * dt; s.g += s.gv * dt;
      s.bobV += (-90 * s.bob - 9 * s.bobV) * dt; s.bob += s.bobV * dt;
      // tilt springs (slightly underdamped)
      s.txv += (90 * (s.tgx - s.tx) - 12 * s.txv) * dt; s.tx += s.txv * dt;
      s.tyv += (90 * (s.tgy - s.ty) - 12 * s.tyv) * dt; s.ty += s.tyv * dt;
      s.Lv += (34 * (s.Lt - s.L) - 9 * s.Lv) * dt; s.L += s.Lv * dt;
      s.sloshV += (-18 * s.slosh - 1.8 * s.sloshV - s.tyv * 0.6) * dt; s.slosh += s.sloshV * dt;
      s.orbit += dt * 0.42;
      const glowT = s.phase === "done" ? 1 : 0;
      s.glow += (glowT - s.glow) * (1 - Math.exp(-dt * 2.5));

      // ---- outline (local -> projected) ----
      const S = s.S, float = Math.sin(t * 1.25) * 3;
      const sx = 1 + 0.05 * s.g, sy = 1 - 0.06 * s.g, yb = BOT_U * S;
      for (let i = 0; i < N; i++) {
        const th = (i / N) * Math.PI * 2, r = BASE_R[i] * S + s.d[i];
        const lx = Math.cos(th) * r * sx, ly = yb + (Math.sin(th) * r - yb) * sy + float;
        proj(lx, ly, 0);
        s.px[i] = PX; s.py[i] = PY;
      }

      // ---- items ----
      const half = s.icon / 2;
      for (let i = 0; i < COUNT; i++) {
        const it = s.items[i];
        it.px = it.x; it.py = it.y;
        slot(i);
        const sx0 = PX, sy0 = PY + float * 0.4, sz = PZ, sk = PK;
        if (it.st === "orbit") {
          it.x = sx0; it.y = sy0; it.s = sk; it.z = sz; it.op = 1; it.behind = sz < 0;
        } else if (it.st === "fly") {
          it.t += (dt * s.ts) / it.T;
          const tt = Math.min(1, it.t), u = (tt + tt * tt) / 2, w = 1 - u;
          const p2x = it.ex + it.side * S * 0.62, p2y = s.cy - TOP_U * S - 50;
          const hover = Math.sin(t * 3.2) * 2.5 * (1 - s.ts);
          it.x = w * w * w * it.p0x + 3 * w * w * u * it.p1x + 3 * w * u * u * p2x + u * u * u * it.ex;
          it.y = w * w * w * it.p0y + 3 * w * w * u * it.p1y + 3 * w * u * u * p2y + u * u * u * it.ey + hover;
          it.s = it.p0s + (0.5 - it.p0s) * Math.pow(u, 1.3);
          it.z = 1;
          const vx = (it.x - it.px) / dt, vy = (it.y - it.py) / dt, sp = Math.hypot(vx, vy);
          if (!it.cleared && u > 0.25 && !inside(it.x, it.y + half * it.s)) it.cleared = true;
          if (it.cleared && !it.behind && sp > 1) {
            const lx = it.x + (vx / sp) * half * it.s * 0.9, ly = it.y + (vy / sp) * half * it.s * 0.9;
            if (inside(lx, ly)) {
              it.behind = true; it.contact = true;
              kick(Math.atan2(ly - s.cy - s.bob, lx - s.cx), Math.min(260, sp * 0.32), 0.26, 0);
              s.gv += 0.35;
            }
          } else if (!it.cleared) it.behind = false;
          it.op = it.behind ? Math.max(0, 1 - Math.pow(Math.max(0, (u - 0.72) / 0.28), 1.4)) : 1;
          if (tt >= 1) {
            it.st = "absorbed"; it.op = 0;
            s.absorbed++;
            sfx("bloop", 0.6);
            s.Lt = s.absorbed / COUNT;
            s.gv += 0.9; s.bobV += 26; s.sloshV += 1.2 * (it.side > 0 ? 1 : -1);
            for (let k2 = 0; k2 < N; k2++) s.v[k2] += 26; // the whole membrane swells
            const c = ITEMS[i].col;
            s.splash.push({ x: it.ex, y: it.ey, y0: it.ey, age: 0, c: `${c[0]},${c[1]},${c[2]}`, r: 0 });
            if (s.absorbed >= COUNT) s.doneAt = t + 0.45;
            else if (s.phase === "backing" && s.launched === s.absorbed) pushUi("backing", s.launched, ITEMS[i].name);
          }
        } else if (it.st === "absorbed") {
          it.op = 0; it.x = it.ex; it.y = it.ey;
        } else if (it.st === "emerge") {
          const t0 = it.t;
          it.t += dt;
          if (t0 < 0 && it.t >= 0) sfx("glass-ping", 0.3);
          if (it.t < 0) { it.op = 0; it.x = it.p0x; it.y = it.p0y; it.behind = true; }
          else if (it.t < RISE) {
            // stage 1: bob up out of the top of the glass (still inside it, so drawn behind the front face)
            let top = 1e9;
            for (let k2 = 0; k2 < N; k2++) if (s.py[k2] < top) top = s.py[k2];
            const e = 1 - Math.pow(1 - it.t / RISE, 3);
            const ax = it.p0x + it.side * S * 0.22, ay = top - half * 0.75 - 12;
            it.x = it.p0x + (ax - it.p0x) * e;
            it.y = it.p0y + (ay - it.p0y) * e;
            it.s = it.p0s + (0.72 - it.p0s) * e;
            it.op = Math.min(1, it.t / 0.3);
            it.behind = true; it.z = sz;
            it.p1x = ax; it.p1y = ay;
          } else {
            // stage 2: spring from the apex into its orbit slot (the slot keeps moving, so the curve is rebuilt each frame)
            const tau = it.t - RISE, om = 6.2, ze = 0.58, wd = om * Math.sqrt(1 - ze * ze);
            const u = 1 - Math.exp(-ze * om * tau) * (Math.cos(wd * tau) + ((ze * om) / wd) * Math.sin(wd * tau));
            const w = 1 - u;
            const ax = it.p1x, ay = it.p1y;
            const c1x = ax + (sx0 - ax) * 0.15, c1y = ay - S * 0.18;
            const c2x = sx0 + (sx0 - s.cx) * 0.3, c2y = Math.min(sy0 - S * 0.5, ay + S * 0.1);
            it.x = w * w * w * ax + 3 * w * w * u * c1x + 3 * w * u * u * c2x + u * u * u * sx0;
            it.y = w * w * w * ay + 3 * w * w * u * c1y + 3 * w * u * u * c2y + u * u * u * sy0;
            it.s = 0.72 + (sk - 0.72) * Math.min(1.06, u);
            it.z = sz; it.op = 1;
            it.behind = sz < 0;
            if (tau > 1.6) it.st = "orbit";
          }
        }
        // stretch along velocity + a little banking
        const vx = (it.x - it.px) / dt, vy = (it.y - it.py) / dt, sp = Math.hypot(vx, vy);
        const moving = it.st === "fly" || it.st === "emerge";
        const strT = moving ? 1 + Math.min(0.2, sp / 3200) : 1;
        it.str += (strT - it.str) * Math.min(1, dt * 14);
        if (sp > 30) it.ang = Math.atan2(vy, vx);
        const bankT = moving ? Math.max(-0.22, Math.min(0.22, vx / 1600)) : Math.cos(s.orbit + (i * Math.PI * 2) / COUNT) * -0.06;
        it.bank += (bankT - it.bank) * Math.min(1, dt * 8);
        const el = iconRefs.current[i];
        if (el) {
          const st = it.str, a = it.ang;
          el.style.transform = `translate3d(${(it.x - half).toFixed(2)}px,${(it.y - half).toFixed(2)}px,0) rotate(${a.toFixed(4)}rad) scale(${st.toFixed(4)},${(1 / st).toFixed(4)}) rotate(${(-a + it.bank).toFixed(4)}rad) scale(${it.s.toFixed(4)})`;
          el.style.opacity = it.op.toFixed(3);
          el.style.zIndex = String(it.behind ? 100 + Math.round(Math.max(-90, Math.min(90, it.z / 4))) : 600 + Math.round(Math.max(-90, Math.min(90, it.z / 4))));
        }
      }

      for (const sp of s.splash) sp.age += dt;
      // progress bar
      if (barRef.current) {
        let f = s.absorbed;
        s.items.forEach((it) => { if (it.st === "fly") f += Math.min(1, it.t) * 0.9; });
        const p = s.phase === "idle" ? 0 : s.phase === "done" ? 1 : f / COUNT;
        barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      }

      draw(ctx, float);
    };

    const softEllipse = (x: number, y: number, rx: number, ry: number, col: string, a: number) => {
      if (a <= 0.002) return;
      ctx.save();
      ctx.translate(x, y); ctx.scale(rx, ry);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.45})`); gr.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = gr; ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    };

    const draw = (c: CanvasRenderingContext2D, float: number) => {
      const S = s.S, t = s.t;
      c.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      c.clearRect(0, 0, s.W, s.H);
      // ground shadows: cloud then icons (all on the floor plane under the orbit)
      const gh = S * 0.72;
      proj(0, gh * Math.cos(ELEV), -gh * Math.sin(ELEV));
      const lift = 1 - float / 30;
      softEllipse(PX, PY - s.bob, S * 0.82 * lift, S * 0.12 * lift, "60,70,130", 0.2);
      softEllipse(PX, PY - s.bob, S * 0.5, S * 0.06, "60,60,110", 0.16);
      softEllipse(PX, PY - s.bob - 6, S * 1.0, S * 0.22, "170,150,255", 0.08 + s.glow * 0.08);
      for (let i = 0; i < COUNT; i++) {
        const it = s.items[i];
        if (it.st !== "orbit" && it.st !== "emerge") continue;
        const a = s.orbit + (i * Math.PI * 2) / COUNT, zf = s.R * Math.sin(a);
        proj(s.R * Math.cos(a), gh * Math.cos(ELEV) + zf * Math.sin(ELEV), -gh * Math.sin(ELEV) + zf * Math.cos(ELEV));
        softEllipse(PX, PY - s.bob, s.icon * 0.5 * PK, s.icon * 0.11 * PK, "40,50,90", 0.13 * it.op);
      }

      // cloud path
      const path = new Path2D();
      const px = s.px, py = s.py;
      let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (let i = 0; i < N; i++) { if (px[i] < minX) minX = px[i]; if (px[i] > maxX) maxX = px[i]; if (py[i] < minY) minY = py[i]; if (py[i] > maxY) maxY = py[i]; }
      path.moveTo((px[0] + px[1]) / 2, (py[0] + py[1]) / 2);
      for (let i = 1; i <= N; i++) { const a = i % N, b = (i + 1) % N; path.quadraticCurveTo(px[a], py[a], (px[a] + px[b]) / 2, (py[a] + py[b]) / 2); }
      path.closePath();
      const bw = maxX - minX, bh = maxY - minY;
      const ccx = (minX + maxX) / 2;
      const parX = s.ty * 60, parY = -s.tx * 60;

      c.save();
      c.clip(path);
      // frosted body
      let gr = c.createLinearGradient(0, minY, 0, maxY);
      gr.addColorStop(0, "rgba(255,255,255,0.78)"); gr.addColorStop(1, "rgba(240,238,255,0.7)");
      c.fillStyle = gr; c.fillRect(minX - 4, minY - 4, bw + 8, bh + 8);
      // drifting pastel interior, each blob at its own depth for parallax
      for (const b of BLOBS) {
        const bx = s.cx + (b.x + 0.16 * Math.sin(t * b.fx + b.p)) * S + parX * b.d;
        const by = s.cy + s.bob + (b.y + 0.1 * Math.cos(t * b.fy + b.p * 1.3)) * S + parY * b.d + float;
        const r = b.r * S;
        gr = c.createRadialGradient(bx, by, 0, bx, by, r);
        gr.addColorStop(0, `rgba(${b.c},0.8)`); gr.addColorStop(0.5, `rgba(${b.c},0.4)`); gr.addColorStop(1, `rgba(${b.c},0)`);
        c.fillStyle = gr; c.fillRect(minX, minY, bw, bh);
      }
      // liquid light
      const Lc = Math.max(0, s.L);
      if (Lc > 0.004) {
        const top = minY + bh * 0.12, bot = maxY + 2;
        const lvl = bot - (bot - top) * Math.min(1.08, Lc) * 0.66;
        const amp = (1.8 + Math.min(6, Math.abs(s.slosh) * 6 + Math.abs(s.sloshV) * 1.2)) * Math.min(1, Lc * 6);
        const slope = s.slosh * 0.16 - s.ty * 0.22;
        const surf = (x: number) => lvl + (x - ccx) * slope + amp * (Math.sin(x * 0.034 + t * 2.1) * 0.6 + Math.sin(x * 0.071 - t * 1.6) * 0.4);
        const lq = new Path2D();
        lq.moveTo(minX - 4, surf(minX - 4));
        for (let x = minX - 4; x <= maxX + 8; x += 6) lq.lineTo(x, surf(x));
        lq.lineTo(maxX + 8, bot + 6); lq.lineTo(minX - 4, bot + 6); lq.closePath();
        const sh = Math.sin(t * 0.5) * bw * 0.12 + parX * 0.8;
        gr = c.createLinearGradient(minX - bw * 0.1 + sh, 0, maxX + bw * 0.1 + sh, 0);
        gr.addColorStop(0, "rgba(110,190,255,0.52)"); gr.addColorStop(0.35, "rgba(160,140,255,0.5)"); gr.addColorStop(0.68, "rgba(255,140,205,0.46)"); gr.addColorStop(1, "rgba(255,190,140,0.5)");
        c.fillStyle = gr; c.fill(lq);
        gr = c.createLinearGradient(0, lvl - amp, 0, bot);
        gr.addColorStop(0, "rgba(255,255,255,0.5)"); gr.addColorStop(0.18, "rgba(255,255,255,0.08)"); gr.addColorStop(1, "rgba(70,80,200,0.16)");
        c.fillStyle = gr; c.fill(lq);
        // meniscus: bright line of light along the surface
        const ln = new Path2D();
        ln.moveTo(minX - 4, surf(minX - 4));
        for (let x = minX - 4; x <= maxX + 8; x += 6) ln.lineTo(x, surf(x));
        const gl = 0.75 + s.glow * 0.25 * (0.6 + 0.4 * Math.sin(t * 2.4));
        c.lineJoin = "round";
        c.strokeStyle = `rgba(255,255,255,${0.16 * gl})`; c.lineWidth = 12; c.stroke(ln);
        c.strokeStyle = `rgba(255,255,255,${0.32 * gl})`; c.lineWidth = 5; c.stroke(ln);
        c.strokeStyle = `rgba(255,255,255,${0.95 * gl})`; c.lineWidth = 1.4; c.stroke(ln);
      }
      // each absorbed item blooms into a puff of its colour that sinks into the light
      for (let k = s.splash.length - 1; k >= 0; k--) {
        const sp = s.splash[k];
        if (sp.age > 1.4) { s.splash.splice(k, 1); continue; }
        const e = 1 - Math.pow(1 - Math.min(1, sp.age / 1.1), 3);
        const a = Math.min(1, sp.age / 0.12) * (1 - Math.min(1, Math.max(0, (sp.age - 0.35) / 1.05)));
        const yy = sp.y0 + (maxY - bh * 0.25 - sp.y0) * e;
        softEllipse(sp.x + parX * 0.5, yy, S * (0.14 + e * 0.42), S * (0.12 + e * 0.3), sp.c, 0.7 * a);
      }
      // top frost and lower glass thickness
      gr = c.createLinearGradient(0, minY, 0, minY + bh * 0.6);
      gr.addColorStop(0, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = gr; c.fillRect(minX - 4, minY - 4, bw + 8, bh * 0.6 + 4);
      gr = c.createLinearGradient(0, maxY - bh * 0.28, 0, maxY);
      gr.addColorStop(0, "rgba(120,110,210,0)"); gr.addColorStop(1, "rgba(120,110,210,0.14)");
      c.fillStyle = gr; c.fillRect(minX - 4, maxY - bh * 0.28, bw + 8, bh * 0.28 + 4);
      // fresnel: bright inner rim, built from soft layered strokes
      c.lineJoin = "round";
      c.strokeStyle = "rgba(255,255,255,0.20)"; c.lineWidth = 26; c.stroke(path);
      c.strokeStyle = "rgba(255,255,255,0.30)"; c.lineWidth = 13; c.stroke(path);
      c.strokeStyle = "rgba(255,255,255,0.75)"; c.lineWidth = 4.5; c.stroke(path);
      // specular highlight, sliding against the tilt
      c.save();
      c.translate(ccx - bw * 0.2 - parX * 0.9, minY + bh * 0.3 - parY * 0.7);
      c.rotate(-0.42);
      c.scale(S * 0.36, S * 0.1);
      gr = c.createRadialGradient(0, 0, 0, 0, 0, 1);
      gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.5, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = gr; c.fillRect(-1, -1, 2, 2);
      c.restore();
      softEllipse(ccx + bw * 0.28 - parX * 0.6, minY + bh * 0.24 - parY * 0.5, S * 0.12, S * 0.06, "255,255,255", 0.7);
      c.restore();

      // outer edge: a hairline for definition, then a bright rim on the top
      c.strokeStyle = "rgba(96,104,160,0.20)"; c.lineWidth = 1.6; c.stroke(path);
      gr = c.createLinearGradient(0, minY, 0, maxY);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.6, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(220,214,255,0.5)");
      c.strokeStyle = gr; c.lineWidth = 0.9; c.stroke(path);
    };

    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    // the simulation is set up once; sounds and autoplay are read through refs
  }, []);

  // ---- pointer: hover / drag to tilt, tap to back up ----
  const local = (e: RPointerEvent<HTMLDivElement>) => {
    const el = stageRef.current!, r = el.getBoundingClientRect(), k = r.width / el.offsetWidth || 1;
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = sim.current, p = local(e);
    const dg = s.drag;
    if (dg && dg.id === e.pointerId) {
      const dx = p.x - dg.x0, dy = p.y - dg.y0;
      dg.moved = Math.max(dg.moved, Math.hypot(dx, dy));
      dg.vx = (p.x - dg.lx) * 60; dg.vy = (p.y - dg.ly) * 60; dg.lx = p.x; dg.ly = p.y;
      s.tgy = Math.max(-0.55, Math.min(0.55, dx * 0.006 + (dg.x0 - s.cx) * 0.0016));
      s.tgx = Math.max(-0.5, Math.min(0.5, -dy * 0.006));
      return;
    }
    if (e.pointerType === "touch") return;
    s.hover = true;
    s.tgy = Math.max(-0.3, Math.min(0.3, ((p.x - s.cx) / s.W) * 0.7));
    s.tgx = Math.max(-0.25, Math.min(0.25, (-(p.y - s.cy) / s.H) * 0.6));
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const s = sim.current, p = local(e);
    s.drag = { id: e.pointerId, x0: p.x, y0: p.y, lx: p.x, ly: p.y, moved: 0, vx: 0, vy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const s = sim.current, dg = s.drag;
    if (!dg || dg.id !== e.pointerId) return;
    s.drag = null;
    const p = local(e);
    if (dg.moved < 6) {
      // a tap: poke the membrane where it was touched, and act
      const ang = Math.atan2(p.y - s.cy, p.x - s.cx);
      for (let i = 0; i < N; i++) { let da = (i / N) * Math.PI * 2 - ang; da = Math.atan2(Math.sin(da), Math.cos(da)); s.v[i] -= 120 * Math.exp(-((da / 0.35) ** 2)); }
      s.gv += 0.4;
      api.current.primary();
    } else {
      s.gv += Math.min(1.4, Math.hypot(dg.vx, dg.vy) / 900);
      s.sloshV += dg.vx / 900;
    }
    if (e.pointerType === "touch") { s.tgx = 0; s.tgy = 0; s.hover = false; }
    else onMove(e);
  };
  const onLeave = () => { const s = sim.current; if (s.drag) return; s.hover = false; s.tgx = 0; s.tgy = 0; };
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    if (e.key !== "Enter" && e.key !== " ") return;
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    if (e.key === " " && e.target !== stageRef.current) return;
    e.preventDefault();
    sim.current.gv += 0.5;
    api.current.primary();
  };

  const { phase, cur, name } = ui;
  const busy = phase === "backing" || phase === "paused";
  const title = phase === "backing" ? `Backing up ${Math.max(1, cur)} of ${COUNT}` : phase === "paused" ? `Paused at ${Math.max(1, cur)} of ${COUNT}` : phase === "done" ? "Up to date" : "Not backed up today";
  const sub = phase === "backing" ? (name ? `Uploading ${name}` : "Preparing backup") : phase === "paused" ? "Resume to continue the backup" : `Last backup: ${last}`;
  const live = phase === "backing" ? `Backing up ${Math.max(1, cur)} of ${COUNT}` : phase === "paused" ? "Backup paused" : phase === "done" ? "Backup complete. Up to date." : "";

  return (
    <div
      className={`relative w-full max-w-[480px] select-none overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDown={onKey}
    >
      <div className="flex items-start justify-between px-5 pt-5">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#6e6e73]">iCloud</p>
          <h3 className="text-[21px] font-semibold leading-tight tracking-[-0.022em] text-[#1d1d1f]">Backup</h3>
        </div>
        <p className="pt-1 text-right text-[12px] leading-[1.35] text-[#6e6e73] tabular-nums">iPhone<br />42.6 GB of 200 GB</p>
      </div>

      <div
        ref={stageRef}
        role="button"
        tabIndex={0}
        aria-label={busy ? (phase === "paused" ? "Resume backup" : "Pause backup") : "Back up now"}
        className="relative mt-[-18px] w-full touch-none outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#0071e3]"
        style={{ height: STAGE_H, cursor: "grab", background: "radial-gradient(60% 46% at 50% 50%, rgba(206,198,255,.22), rgba(255,255,255,0) 70%), radial-gradient(40% 30% at 30% 62%, rgba(170,220,255,.16), rgba(255,255,255,0) 70%)" }}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onLeave}
      >
        {ITEMS.map((it, i) => (
          <div
            key={it.kind}
            ref={(el) => { iconRefs.current[i] = el; }}
            className="pointer-events-none absolute left-0 top-0"
            style={{ width: 40, height: 40, willChange: "transform, opacity", borderRadius: it.kind === "contact" ? "50%" : "26%", boxShadow: "0 10px 18px -10px rgba(30,40,90,.5)", transform: "translate3d(-100px,-100px,0)" }}
          >
            <AppIcon kind={it.kind} uid={uid} />
          </div>
        ))}
        <canvas ref={canvasRef} className="pointer-events-none absolute left-0 top-0" style={{ zIndex: 500 }} aria-hidden="true" />
      </div>

      <div className="flex items-center gap-4 border-t border-black/[.06] px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex h-[22px] items-center gap-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={phase === "backing" ? "b" : phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="flex items-center gap-2">
                {phase === "done" && <Check />}
                <span className="truncate text-[15px] font-semibold tracking-[-0.012em] text-[#1d1d1f] tabular-nums">{title}</span>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-[#ececf0]">
            <div ref={barRef} className="h-full w-full origin-left rounded-full" style={{ transform: "scaleX(0)", background: phase === "paused" ? "#a1a1a6" : phase === "done" ? "#30d158" : "linear-gradient(90deg,#64d2ff,#0071e3)", transition: "background-color .3s" }} />
          </div>
          <p className="mt-1.5 truncate text-[12px] text-[#6e6e73]">{sub}</p>
        </div>
        <button
          type="button"
          onClick={() => { touched.current = true; api.current.primary(); }}
          className={`h-9 flex-none rounded-full px-4 text-[14px] font-medium outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] ${busy ? "bg-[#f0f0f3] text-[#1d1d1f] hover:bg-[#e8e8ed]" : "bg-[#0071e3] text-white hover:bg-[#0077ed]"}`}
        >
          {phase === "backing" ? "Pause" : phase === "paused" ? "Resume" : "Back up now"}
        </button>
      </div>
      <p className="px-5 pb-4 text-[12px] text-[#6e6e73]">Press Back up now or Enter. Hover or drag the cloud to tilt it.</p>
      <div className="sr-only" aria-live="polite">{live}</div>
    </div>
  );
}
