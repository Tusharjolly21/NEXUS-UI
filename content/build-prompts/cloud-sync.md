# Cloud Sync

Add the "Cloud Sync" component from Nexus UI to my project.

A backup button shaped like a glass cloud. Press it and the apps leave their orbit one by one and sink into the cloud, which wobbles with each one as a level of coloured light rises inside. A soft-body canvas with a 3D orbit, a progress readout and keyboard support.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` and `@/lib/ui-sounds-pro` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
5. Use it like this: `import { CloudSync } from "@/components/cloud-sync";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/cloud-sync/cloud-sync.tsx ---

```tsx
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
```

--- components/cloud-sync/index.ts ---

```ts
export { CloudSync } from "./cloud-sync";
export type { CloudSyncProps } from "./cloud-sync";
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
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
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
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
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
  "ring-spool": { category: "Gallery", label: "Ring spool", length: 2.2, play: (c, o) => {
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
  } },
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
