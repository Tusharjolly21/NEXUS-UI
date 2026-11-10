"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as RPointerEvent,
  type ReactNode,
} from "react";

export type SignupValues = { name: string; email: string; password: string };

export type LanyardSignupProps = {
  /** printed down the strap; leave it out for a plain strap */
  brand?: string;
  title?: string;
  subtitle?: string;
  /** create the account; throw an Error to show its message instead */
  onSignup?: (values: SignupValues) => Promise<void> | void;
  /** the Continue button once the account exists */
  onContinue?: (values: SignupValues) => void;
  /** the "Sign in" link */
  onSignIn?: () => void;
  autoplay?: boolean;
  className?: string;
};

// Framework7 Icons (MIT) via Iconify, inlined
const ICON = {
  eye: "<path fill=\"currentColor\" d=\"M28.01 46.456c16.556 0 27.99-13.38 27.99-17.56c0-4.201-11.454-17.56-27.99-17.56C11.68 11.335 0 24.694 0 28.895c0 4.18 11.659 17.56 28.01 17.56m0-3.238c-13.482 0-24.424-11.434-24.424-14.323c0-2.438 10.942-14.322 24.424-14.322c13.442 0 24.404 11.884 24.404 14.322c0 2.89-10.962 14.323-24.404 14.323m0-2.848c6.373 0 11.495-5.225 11.495-11.475c0-6.413-5.122-11.474-11.495-11.474c-6.413 0-11.556 5.06-11.515 11.474c.02 6.25 5.102 11.475 11.515 11.475m0-7.663c-2.13 0-3.852-1.722-3.852-3.812c0-2.11 1.721-3.81 3.852-3.81c2.11 0 3.832 1.7 3.832 3.81c0 2.09-1.721 3.812-3.832 3.812\"/>",
  eyeSlash: "<path fill=\"currentColor\" d=\"M43.722 47.201c.303.303.727.465 1.11.465c.808 0 1.555-.727 1.555-1.555c0-.404-.16-.808-.464-1.11L12.137 11.233a1.56 1.56 0 0 0-1.11-.444c-.808 0-1.556.727-1.556 1.535c0 .424.142.828.445 1.11ZM28.01 12.386c-3.514 0-6.684.605-9.653 1.595l2.646 2.645c2.241-.666 4.503-1.05 7.007-1.05c13.692 0 24.456 11.713 24.456 14.116c0 1.636-3.534 6.039-9.128 9.472l2.484 2.484C52.204 37.508 56 32.075 56 29.692c0-4.14-11.269-17.306-27.99-17.306m0 34.613c3.756 0 7.19-.666 10.32-1.736l-2.646-2.646c-2.403.747-4.948 1.192-7.674 1.192c-13.692 0-24.476-11.269-24.476-14.116c0-1.414 3.756-6.12 9.694-9.694l-2.505-2.504C4 21.655 0 27.249 0 29.692C0 33.813 11.49 47 28.01 47m10.36-12.884a10.6 10.6 0 0 0 .97-4.423c0-6.32-5.05-11.309-11.33-11.309c-1.595 0-3.09.344-4.443.93Zm-10.36 6.887c1.777 0 3.453-.445 4.948-1.172L17.832 24.684c-.767 1.495-1.171 3.191-1.171 5.008c0 6.16 5.028 11.31 11.35 11.31\"/>",
  check: "<path fill=\"currentColor\" d=\"m45.646 14.646l.708.708a2 2 0 0 1 0 2.828l-22.94 22.94a2 2 0 0 1-2.828 0l-9.94-9.94a2 2 0 0 1 0-2.828l.708-.708a2 2 0 0 1 2.828 0l6.404 6.404a2 2 0 0 0 2.828 0l19.404-19.404a2 2 0 0 1 2.828 0\"/>",
  person: "<path fill=\"currentColor\" d=\"M28.012 27.367c5.039 0 9.375-4.5 9.375-10.36c0-5.788-4.36-10.077-9.375-10.077c-5.016 0-9.375 4.383-9.375 10.125c0 5.812 4.36 10.312 9.375 10.312M13.293 49.07h29.438c3.68 0 4.992-1.054 4.992-3.117c0-6.047-7.57-14.39-19.711-14.39c-12.164 0-19.735 8.343-19.735 14.39c0 2.063 1.313 3.117 5.016 3.117\"/>",
  alert: "<path fill=\"currentColor\" d=\"M28 51.906c13.055 0 23.906-10.828 23.906-23.906c0-13.055-10.875-23.906-23.93-23.906C14.899 4.094 4.095 14.945 4.095 28c0 13.078 10.828 23.906 23.906 23.906m-.023-20.39c-1.243 0-1.922-.727-1.97-1.97L25.68 17.97c-.047-1.29.937-2.203 2.273-2.203c1.313 0 2.32.937 2.274 2.226l-.329 11.555c-.047 1.265-.75 1.969-1.921 1.969m0 8.625c-1.36 0-2.626-1.078-2.626-2.532s1.243-2.53 2.626-2.53c1.359 0 2.624 1.054 2.624 2.53c0 1.477-1.289 2.532-2.624 2.532\"/>",
} as const;

function Icon({ name, className = "" }: { name: keyof typeof ICON; className?: string }) {
  return <svg viewBox="0 0 56 56" aria-hidden="true" className={className} dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

/** the password rules; each one, once met, stamps the pass */
const RULES = [
  { id: "len", label: "8 or more characters", stamp: "8+", ink: "#c93400", test: (p: string) => p.length >= 8 },
  { id: "num", label: "A number", stamp: "0-9", ink: "#8944ab", test: (p: string) => /\d/.test(p) },
  { id: "sym", label: "A symbol", stamp: "#!?", ink: "#248a3d", test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
] as const;

const AVATARS = [
  ["#0071e3", "#5ac8fa"],
  ["#bf5af2", "#ff2d55"],
  ["#ff9f0a", "#ff3b30"],
  ["#30d158", "#0071e3"],
  ["#5e5ce6", "#bf5af2"],
] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

// ───────────── the lanyard: a rope of points hanging from above, with the pass as a heavy weight on the end ─────────────

const BW = 200; // the clear badge holder
const BH = 292;
const CLIP = 58; // from the end of the strap, down through the crimp, swivel, clasp and split ring, to the top of the holder

// printed paper and stamp ink, as tiny inline noise textures
const PAPER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .42 0 0 0 0 .40 0 0 0 0 .36 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E")`;
const INK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.5' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.2 1.85'/%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23n)'/%3E%3C/svg%3E")`;
const LINKS = 12;
const DT = 1 / 120;

type Pt = { x: number; y: number; px: number; py: number };
type Sim = {
  pts: Pt[];
  c: Pt; // the middle of the pass
  seg: number;
  dist: number;
  reach: number;
  w: number;
  h: number;
  drag: { on: boolean; tx: number; ty: number; ox: number; oy: number };
  tw: number; // how far the holder has turned on its swivel, in degrees
  tv: number;
  lvx: number;
  t: number;
};

function makeSim(w: number, h: number): Sim {
  const ax = w / 2, ay = -8;
  const rope = Math.min(170, Math.max(70, h - BH - CLIP - 64));
  const seg = rope / (LINKS - 1);
  const dist = CLIP + BH / 2;
  const pts: Pt[] = [];
  for (let i = 0; i < LINKS; i++) pts.push({ x: ax, y: ay + i * seg, px: ax, py: ay + i * seg });
  const cy = ay + rope + dist;
  // it arrives with a little swing, so it reads as something hanging
  return { pts, c: { x: ax, y: cy, px: ax - 3, py: cy }, seg, dist, reach: (rope + dist) * 0.97, w, h, drag: { on: false, tx: 0, ty: 0, ox: 0, oy: 0 }, tw: 0, tv: 0, lvx: 0, t: 0 };
}

function link(a: Pt, b: Pt, len: number, wa: number, wb: number) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1e-6;
  const k = (d - len) / d / (wa + wb || 1);
  a.x += dx * k * wa;
  a.y += dy * k * wa;
  b.x -= dx * k * wb;
  b.y -= dy * k * wb;
}

function step(s: Sim) {
  const g = 2400 * DT * DT;
  for (let i = 1; i < s.pts.length; i++) {
    const p = s.pts[i]!;
    const vx = (p.x - p.px) * 0.985, vy = (p.y - p.py) * 0.985;
    p.px = p.x; p.py = p.y;
    p.x += vx; p.y += vy + g;
  }
  const c = s.c;
  if (s.drag.on) {
    // held: the pass follows the pointer, but no further than the strap reaches
    const a = s.pts[0]!;
    let tx = s.drag.tx - a.x, ty = s.drag.ty - a.y;
    const d = Math.hypot(tx, ty);
    if (d > s.reach) { tx *= s.reach / d; ty *= s.reach / d; }
    c.px = c.x; c.py = c.y;
    c.x += (a.x + tx - c.x) * 0.45;
    c.y += (a.y + ty - c.y) * 0.45;
  } else {
    const vx = (c.x - c.px) * 0.996, vy = (c.y - c.py) * 0.996;
    c.px = c.x; c.py = c.y;
    c.x += vx; c.y += vy + g;
  }
  for (let k = 0; k < 12; k++) {
    for (let i = 0; i < s.pts.length - 1; i++) link(s.pts[i]!, s.pts[i + 1]!, s.seg, i === 0 ? 0 : 1, 1);
    link(s.pts[s.pts.length - 1]!, c, s.dist, 1, s.drag.on ? 0 : 0.12);
  }
  // the swivel: sideways acceleration turns the holder, a torsion spring brings it back, and a faint draught keeps it alive
  s.t += DT;
  const vx = (c.x - c.px) / DT;
  const ax = (vx - s.lvx) / DT;
  s.lvx = vx;
  s.tv += (-42 * s.tw - 1.7 * s.tv + Math.max(-9000, Math.min(9000, ax)) * 0.42 + 30 * Math.sin(s.t * 0.8)) * DT;
  s.tw = Math.max(-68, Math.min(68, s.tw + s.tv * DT));
}

function ropePath(pts: Pt[]) {
  let d = `M${pts[0]!.x.toFixed(1)},${pts[0]!.y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i]!, n = pts[i + 1]!;
    d += ` Q${p.x.toFixed(1)},${p.y.toFixed(1)} ${((p.x + n.x) / 2).toFixed(1)},${((p.y + n.y) / 2).toFixed(1)}`;
  }
  const e = pts[pts.length - 1]!;
  return d + ` L${e.x.toFixed(1)},${e.y.toFixed(1)}`;
}

/**
 * A signup form whose member pass hangs beside it on a lanyard, and fills itself in as you type.
 *
 * The pass is a weight on a rope of points, simulated with verlet physics: every keystroke nudges it, each password
 * rule you meet slams a rubber stamp onto it, and a mistake shakes it. Grab it and fling it; it swings, turns towards
 * you as it moves and settles. Create the account and it flips over to show the finished pass.
 * The form is a plain, accessible form; the pass is decoration and is hidden from assistive technology.
 */
export function LanyardSignup({
  brand = "",
  title = "Create your account",
  subtitle = "Your member pass fills itself in as you type.",
  onSignup,
  onContinue,
  onSignIn,
  autoplay = false,
  className = "",
}: LanyardSignupProps) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<HTMLDivElement>(null);
  const ropeRef = useRef<SVGPathElement>(null);
  const strapRef = useRef<SVGPathElement>(null);
  const stitchRef = useRef<SVGPathElement>(null);
  const weaveRef = useRef<SVGPathElement>(null);
  const sheenRef = useRef<SVGPathElement>(null);
  const strapShadowRef = useRef<SVGPathElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const holoRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const sim = useRef<Sim | null>(null);
  const touched = useRef(false);
  const inView = useInView(stageRef, { margin: "120px" });

  const met = RULES.map((r) => r.test(password));
  const done = status === "done";

  // ── the physics loop ──
  const draw = () => {
    const s = sim.current;
    if (!s) return;
    const e = s.pts[s.pts.length - 1]!, c = s.c;
    const dx = c.x - e.x, dy = c.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const kx = e.x + (dx / d) * CLIP, ky = e.y + (dy / d) * CLIP;
    const ang = Math.atan2(-dx, dy);
    const place = `translate3d(${(kx - BW / 2).toFixed(2)}px,${ky.toFixed(2)}px,0) rotate(${ang.toFixed(4)}rad)`;
    if (badgeRef.current) badgeRef.current.style.transform = place;
    const tw = s.tw, deg = (ang * 180) / Math.PI;
    if (swayRef.current) swayRef.current.style.transform = `rotateY(${tw.toFixed(2)}deg)`;
    // light comes from the top left: the glare slides across the plastic as it turns, and it dims turning away
    if (glareRef.current) glareRef.current.style.backgroundPosition = `${(50 - tw * 1.6 - deg * 1.4).toFixed(1)}% 0`;
    if (shadeRef.current) shadeRef.current.style.opacity = Math.max(0, Math.sin((tw * Math.PI) / 180) * 0.35 + (deg > 0 ? deg * 0.004 : 0)).toFixed(3);
    if (holoRef.current) holoRef.current.style.filter = `hue-rotate(${(tw * 7 + deg * 9).toFixed(0)}deg) saturate(1.3)`;
    const rd = ropePath(s.pts);
    for (const r of [ropeRef, strapRef, stitchRef, weaveRef, sheenRef, strapShadowRef]) r.current?.setAttribute("d", rd);
    // its shadow falls on the wall behind, down and to the right, narrowing as it turns
    if (shadowRef.current) shadowRef.current.style.transform = `translate3d(${(kx - BW / 2 + 16).toFixed(2)}px,${(ky + 20).toFixed(2)}px,0) rotate(${ang.toFixed(4)}rad) scaleX(${Math.max(0.08, Math.abs(Math.cos((tw * Math.PI) / 180))).toFixed(3)})`;
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width < 10) return;
      const prev = sim.current;
      if (!prev || Math.abs(prev.w - r.width) > 1 || Math.abs(prev.h - r.height) > 1) {
        sim.current = makeSim(r.width, r.height);
        if (reduce) sim.current.c.px = sim.current.c.x;
        for (let i = 0; i < 60; i++) step(sim.current); // settle the rope before the first frame
        draw();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduce]);

  useEffect(() => {
    if (reduce || !inView) return;
    let raf = 0, last = performance.now(), acc = 0;
    const tick = (now: number) => {
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      if (s) {
        while (acc >= DT) { step(s); acc -= DT; }
        draw();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, inView]);

  /** push the pass, in pixels per second */
  const kick = (vx: number, vy = 0) => {
    const s = sim.current;
    if (!s || reduce || s.drag.on) return;
    s.c.px -= vx * DT;
    s.c.py -= vy * DT;
  };
  const nudge = () => kick((Math.random() - 0.5) * 70, -20);
  const shake = () => {
    if (reduce) return;
    [0, 90, 180, 270].forEach((t, i) => window.setTimeout(() => kick(i % 2 ? -260 : 260), t));
  };

  // a rule that has just been met stamps the pass, and the stamp knocks it
  const metKey = met.join("");
  const prevMet = useRef(met);
  useEffect(() => {
    met.forEach((m, i) => {
      if (m && !prevMet.current[i]) kick((i - 1) * 140 + 60, -90);
    });
    prevMet.current = met;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metKey]);

  // ── dragging the pass ──
  const onGrab = (e: RPointerEvent<HTMLDivElement>) => {
    const s = sim.current, st = stageRef.current;
    if (!s || !st || reduce) return;
    touched.current = true;
    const r = st.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    s.drag = { on: true, ox: x - s.c.x, oy: y - s.c.y, tx: s.c.x, ty: s.c.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDrag = (e: RPointerEvent<HTMLDivElement>) => {
    const s = sim.current, st = stageRef.current;
    if (!s || !st || !s.drag.on) return;
    const r = st.getBoundingClientRect();
    s.drag.tx = e.clientX - r.left - s.drag.ox;
    s.drag.ty = e.clientY - r.top - s.drag.oy;
  };
  const onDrop = () => {
    const s = sim.current;
    if (!s) return;
    s.drag.on = false;
    // keep the fling, within reason
    const vx = s.c.x - s.c.px, vy = s.c.y - s.c.py, v = Math.hypot(vx, vy), max = 26;
    if (v > max) { s.c.px = s.c.x - (vx * max) / v; s.c.py = s.c.y - (vy * max) / v; }
  };

  // ── the form ──
  const values = { name: name.trim(), email: email.trim(), password };
  const validate = (v: SignupValues) => {
    const e: typeof errors = {};
    if (!v.name) e.name = "Enter your name.";
    if (!EMAIL.test(v.email)) e.email = "Enter an email address, like you@example.com.";
    const missing = RULES.filter((r) => !r.test(v.password)).map((r) => r.label.toLowerCase());
    if (missing.length) e.password = `Your password still needs ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.`;
    return e;
  };

  const submit = async (v: SignupValues, focus: boolean) => {
    if (status !== "idle") return;
    const e = validate(v);
    setErrors(e);
    if (e.name || e.email || e.password) {
      shake();
      if (focus) (e.name ? nameRef : e.email ? emailRef : passRef).current?.focus();
      return;
    }
    setStatus("loading");
    try {
      if (onSignup) await onSignup(v);
      else await new Promise((r) => window.setTimeout(r, 1100));
      setStatus("done");
      // the pass flips over, and the turn sets it swinging
      window.setTimeout(() => {
        kick(420 * Math.min(1, (sim.current?.w ?? 500) / 520), -60);
        if (sim.current && !reduce) sim.current.tv += 260;
      }, 60);
    } catch (err) {
      setStatus("idle");
      setErrors({ form: err instanceof Error && err.message ? err.message : "We couldn't create your account. Try again in a moment." });
      shake();
    }
  };
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setErrors({});
    setStatus("idle");
    setShow(false);
  };

  // ── autoplay: it fills itself in until someone touches it ──
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const type = async (set: (v: string) => void, text: string, ms: number) => {
      for (let i = 1; i <= text.length; i++) {
        if (!ok()) return false;
        set(text.slice(0, i));
        nudge();
        await sleep(ms + Math.random() * 60);
      }
      return true;
    };
    (async () => {
      await sleep(1000);
      while (ok()) {
        if (!(await type(setName, "Ava Reyes", 95))) return;
        await sleep(350);
        if (!(await type(setEmail, "ava@studio.co", 70))) return;
        await sleep(350);
        if (!(await type(setPassword, "sun#down7", 150))) return;
        await sleep(700);
        if (!ok()) return;
        await submitRef.current({ name: "Ava Reyes", email: "ava@studio.co", password: "sun#down7" }, false);
        await sleep(4800);
        if (!ok()) return;
        reset();
        await sleep(1200);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const stop = () => {
    touched.current = true;
  };

  const first = values.name.split(/\s+/)[0] || "there";
  const ini = initials(name);
  const pal = AVATARS[hash(name.trim().toLowerCase()) % AVATARS.length]!;
  const passNo = useMemo(() => {
    const h = hash(email.trim().toLowerCase() || "member");
    return `${String(1000 + (h % 9000))} ${String(1000 + ((h >>> 13) % 9000))}`;
  }, [email]);

  const field =
    "h-11 w-full rounded-[12px] bg-[#f5f5f7] px-3.5 text-[15px] text-[#1d1d1f] outline-none ring-1 transition-[box-shadow,background-color] placeholder:text-[#86868b] focus:bg-white focus:ring-2";
  const ring = (bad?: string) => (bad ? "ring-[#ff3b30]/70 focus:ring-[#ff3b30]/60" : "ring-transparent focus:ring-[#0071e3]/50");
  const spring = { type: "spring", stiffness: 520, damping: 34 } as const;

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={stop}
      onKeyDownCapture={stop}
      className={`grid w-full max-w-[980px] grid-cols-1 overflow-hidden rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] ${className}`}
    >
      {/* the lanyard */}
      <div
        ref={stageRef}
        aria-hidden="true"
        className="relative order-first h-[460px] select-none overflow-hidden bg-[radial-gradient(90%_70%_at_30%_0%,#ffffff_0%,#f3f3f5_62%,#ebebee_100%)] md:order-last md:h-auto md:min-h-[540px]"
      >
        {/* the holder's shadow on the wall */}
        <div ref={shadowRef} className="pointer-events-none absolute left-0 top-0 rounded-[16px] bg-[rgba(28,32,48,.16)] blur-[10px]" style={{ width: BW, height: BH, transformOrigin: "50% 0" }} />
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <pattern id={`weave-${uid}`} width="3" height="3" patternUnits="userSpaceOnUse">
              <path d="M0 .5H3" stroke="rgba(255,255,255,.16)" strokeWidth=".7" />
              <path d="M.5 0V3" stroke="rgba(0,0,0,.14)" strokeWidth=".7" />
            </pattern>
            <filter id={`soft-${uid}`} x="-50%" y="-10%" width="200%" height="120%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
          </defs>
          {/* the strap: woven ribbon with a dark edge and a line of stitching inside it, and a brand printed down it if you give one */}
          <path ref={strapShadowRef} d="M0,0" fill="none" stroke="rgba(28,32,48,.16)" strokeWidth={13} strokeLinecap="round" transform="translate(12 16)" filter={`url(#soft-${uid})`} />
          <path ref={strapRef} d="M0,0" fill="none" stroke="#0a4c97" strokeWidth={15} />
          <path ref={stitchRef} d="M0,0" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth={12.6} strokeDasharray="2.2 1.6" />
          <path ref={ropeRef} id={`rope-${uid}`} d="M0,0" fill="none" stroke="#0a68d2" strokeWidth={11} />
          <path ref={weaveRef} d="M0,0" fill="none" stroke={`url(#weave-${uid})`} strokeWidth={11} />
          <path ref={sheenRef} d="M0,0" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={4} />
          {brand && (
            <text fill="rgba(255,255,255,.93)" fontSize={7.6} fontWeight={700} letterSpacing={1.8} dy={2.7} style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
              <textPath href={`#rope-${uid}`} startOffset="10">
                {Array.from({ length: 6 }, () => brand.toUpperCase()).join("   •   ")}
              </textPath>
            </text>
          )}
        </svg>

        {/* the badge: placed and turned by the simulation */}
        <div
          ref={badgeRef}
          onPointerDown={onGrab}
          onPointerMove={onDrag}
          onPointerUp={onDrop}
          onPointerCancel={onDrop}
          className="absolute left-0 top-0 cursor-grab touch-none active:cursor-grabbing"
          style={{ width: BW, height: BH, transformOrigin: "50% 0", perspective: 1000, willChange: "transform" }}
        >
          <div ref={swayRef} className="h-full w-full" style={{ transformStyle: "preserve-3d" }}>
            <motion.div
              className="relative h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: done ? 180 : 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 13, mass: 1.1 }}
            >
              {/* the holder has thickness: its side edges show as it turns */}
              <div className="absolute left-0 top-[16px] bottom-[16px] w-[3px] bg-[linear-gradient(#f1f3f6,#b8bec8)]" style={{ transform: "translateX(-1.5px) rotateY(90deg)" }} />
              <div className="absolute right-0 top-[16px] bottom-[16px] w-[3px] bg-[linear-gradient(#e4e7ec,#a9b0ba)]" style={{ transform: "translateX(1.5px) rotateY(90deg)" }} />

              {/* front: a printed card in a clear plastic holder */}
              <Holder side="front">
                <div className="flex h-full flex-col">
                  <div className="relative flex h-[44px] shrink-0 items-center justify-between overflow-hidden px-3 text-white" style={{ background: "linear-gradient(120deg,#0062c9,#0a84ff 62%,#53b6f5)" }}>
                    <span className="absolute inset-0 opacity-25" style={{ backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.35) 0 1px,transparent 1px 6px)" }} />
                    <span className="relative text-[11px] font-medium text-white/90">Member pass</span>
                  </div>
                  <div className="flex shrink-0 gap-3 px-3 pt-3">
                    <div className="relative h-[66px] w-[54px] shrink-0 rounded-[4px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]" style={{ background: ini ? `linear-gradient(150deg, ${pal[0]}, ${pal[1]})` : "#e6e6e9" }}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        {ini ? (
                          <motion.span key={ini} initial={{ scale: 0.4, opacity: 0, y: 6 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.6, opacity: 0, y: -6 }} transition={spring}
                            className="absolute inset-0 grid place-items-center text-[21px] font-semibold tracking-[-0.02em] text-white">
                            {ini}
                          </motion.span>
                        ) : (
                          <motion.span key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-end justify-center overflow-hidden text-[#b4b4ba]">
                            <Icon name="person" className="-mb-1 h-12 w-12" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {/* a holographic seal, catching the light as the badge turns */}
                      <span ref={holoRef} className="absolute -bottom-[7px] -right-[9px] h-[20px] w-[20px] rounded-full border border-white/80 shadow-[0_1px_2px_rgba(0,0,0,.2)]"
                        style={{ background: "conic-gradient(from 20deg,#ff9bd2,#a8c8ff,#9ff0d0,#fff0a0,#ffb59b,#e1a8ff,#ff9bd2)" }} />
                    </div>
                    <div className="flex min-w-0 flex-col justify-center gap-1.5 text-[9.5px] leading-[1.25] text-[#6e6e73]">
                      <span>
                        Pass no.
                        <span className="block text-[12.5px] font-semibold tabular-nums tracking-[0.01em] text-[#1d1d1f]">{passNo}</span>
                      </span>
                      <span>
                        Valid until
                        <span className="block text-[11px] font-medium tabular-nums text-[#1d1d1f]">Nov 2027</span>
                      </span>
                    </div>
                  </div>
                  <p className="m-0 mt-3 min-h-[24px] shrink-0 truncate px-3 text-[18.5px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#1d1d1f]">
                    {name ? (
                      <AnimatePresence initial={false} mode="popLayout">
                        {[...name].map((ch, i) => (
                          <motion.span key={`${i}${ch}`} className="inline-block"
                            initial={{ y: 10, opacity: 0, filter: "blur(3px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -6, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 600, damping: 30, filter: { duration: 0.25, ease: "easeOut" } }}>
                            {ch === " " ? " " : ch}
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <span className="text-[#8e8e93]">Your name</span>
                    )}
                  </p>
                  <p className="m-0 shrink-0 truncate px-3 text-[11px] text-[#6e6e73]">{email.trim() || "you@example.com"}</p>

                  <div className="mt-auto flex justify-between px-3 pt-2">
                    {RULES.map((r, i) => (
                      <div key={r.id} className="relative grid h-[40px] w-[40px] place-items-center rounded-full border border-dashed border-[#d6d6db]">
                        <AnimatePresence>
                          {met[i] && (
                            <motion.span
                              initial={reduce ? { opacity: 0 } : { scale: 2.4, opacity: 0, rotate: -40 + i * 25 }}
                              animate={{ scale: 1, opacity: 0.9, rotate: -14 + i * 12 }}
                              exit={{ scale: 0.6, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 700, damping: 20 }}
                              className="absolute inset-[-3px] grid place-items-center rounded-full border-[2.5px] text-[10.5px] font-extrabold tracking-[-0.01em]"
                              style={{ color: r.ink, borderColor: r.ink, boxShadow: `inset 0 0 0 2px transparent, inset 0 0 0 3px ${r.ink}66`, mixBlendMode: "multiply", WebkitMaskImage: INK, maskImage: INK, WebkitMaskSize: "44px", maskSize: "44px" }}
                            >
                              {r.stamp}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                  <div className="flex shrink-0 items-end gap-2 px-3 pb-2.5 pt-2.5">
                    <Barcode seed={passNo} />
                    <span className="pb-px text-[8.5px] tabular-nums text-[#6e6e73]">{passNo.replace(" ", "")}</span>
                  </div>
                </div>
              </Holder>

              {/* back: the reverse of the card */}
              <Holder side="back">
                <div className="flex h-full flex-col px-3 pb-3 pt-3.5">
                  <p className="m-0 text-[11.5px] text-[#6e6e73]">Welcome aboard,</p>
                  <p className="m-0 mt-0.5 truncate text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{first}</p>
                  <PassCode seed={`${email.trim().toLowerCase()}|${name.trim()}`} />
                  <p className="m-0 mt-auto text-[8.5px] leading-[1.4] text-[#6e6e73]">If you find this pass, please hand it in at any front desk.</p>
                  <div className="mt-1.5 flex items-end justify-end text-[9.5px] tabular-nums text-[#6e6e73]">{passNo}</div>
                </div>
              </Holder>
              {/* glare on the plastic, and shade as it turns away from the light */}
              <div ref={glareRef} className="pointer-events-none absolute inset-0 rounded-[16px] [backface-visibility:hidden]"
                style={{ transform: "translateZ(1.6px)", backgroundImage: "linear-gradient(112deg,transparent 0 36%,rgba(255,255,255,.5) 44%,rgba(255,255,255,.12) 50%,transparent 58%)", backgroundSize: "300% 100%", backgroundPosition: "50% 0" }} />
              <div ref={shadeRef} className="pointer-events-none absolute inset-0 rounded-[16px] bg-[#1c2030] opacity-0 [backface-visibility:hidden]" style={{ transform: "translateZ(1.7px)" }} />
            </motion.div>
          </div>

          {/* the hardware: crimp end, swivel, lobster clasp and a split ring through the holder's slot */}
          <svg className="pointer-events-none absolute overflow-visible" style={{ left: BW / 2 - 20, top: -CLIP }} width={40} height={CLIP + 14} viewBox={`0 0 40 ${CLIP + 14}`}>
            <defs>
              <linearGradient id={`chrome-${uid}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#8a9099" />
                <stop offset=".22" stopColor="#f6f7f9" />
                <stop offset=".5" stopColor="#c3c8cf" />
                <stop offset=".72" stopColor="#eef0f3" />
                <stop offset="1" stopColor="#7d838c" />
              </linearGradient>
              <clipPath id={`ring-${uid}`}>
                <rect x="0" y="0" width="40" height={CLIP + 6} />
                <rect x="7" y={CLIP + 6} width="26" height="6" rx="3" />
              </clipPath>
            </defs>
            <rect x="11" y="0" width="18" height="14" rx="2.6" fill={`url(#chrome-${uid})`} stroke="rgba(40,44,52,.35)" strokeWidth=".7" />
            {[4, 7, 10].map((y) => <path key={y} d={`M12 ${y}H28`} stroke="rgba(40,44,52,.22)" strokeWidth=".8" />)}
            <path d="M12.5 1.3H27.5" stroke="rgba(255,255,255,.8)" strokeWidth=".8" />
            <rect x="17" y="13.5" width="6" height="7" rx="2" fill={`url(#chrome-${uid})`} stroke="rgba(40,44,52,.35)" strokeWidth=".6" />
            <circle cx="20" cy="23" r="3" fill="none" stroke={`url(#chrome-${uid})`} strokeWidth="1.8" />
            <path d="M20 25.5C27.2 25.5 29.3 33 28.4 39C27.5 45 24.4 48 20 48C15.6 48 12.6 45 13.2 39.8C13.8 34 15 28.2 20 25.5Z" fill={`url(#chrome-${uid})`} stroke="rgba(40,44,52,.4)" strokeWidth=".7" />
            <ellipse cx="21.2" cy="40.2" rx="3.4" ry="4.6" fill="#f1f1f3" stroke="rgba(40,44,52,.3)" strokeWidth=".6" />
            <path d="M15.6 30.5V41" stroke="rgba(40,44,52,.45)" strokeWidth="1.1" strokeLinecap="round" />
            <rect x="12.6" y="31.4" width="3.2" height="4.2" rx="1" fill={`url(#chrome-${uid})`} stroke="rgba(40,44,52,.35)" strokeWidth=".5" />
            <g clipPath={`url(#ring-${uid})`}>
              <circle cx="20" cy={CLIP - 1.5} r="8.6" fill="none" stroke="rgba(40,44,52,.45)" strokeWidth="3.1" />
              <circle cx="20" cy={CLIP - 1.5} r="8.6" fill="none" stroke={`url(#chrome-${uid})`} strokeWidth="2.3" />
              <circle cx="20" cy={CLIP - 1.5} r="8.6" fill="none" stroke="rgba(40,44,52,.3)" strokeWidth=".45" />
            </g>
          </svg>
        </div>
        <p className="pointer-events-none absolute bottom-3 left-0 right-0 m-0 text-center text-[12px] text-[#6e6e73]">Grab the pass and fling it.</p>
      </div>

      {/* the form */}
      <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10">
        <AnimatePresence mode="popLayout" initial={false}>
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ ...spring, delay: 0.15 }} className="flex flex-col items-start">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#30d158]/15 text-[#248a3d]">
                <Icon name="check" className="h-7 w-7" />
              </span>
              <h2 className="m-0 mt-5 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em]">You&rsquo;re in, {first}.</h2>
              <p className="m-0 mt-2 max-w-[38ch] text-[15px] leading-[1.5] text-[#6e6e73]">
                We sent a link to <span className="font-medium text-[#1d1d1f]">{values.email}</span> to confirm your address. Your member pass is ready.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => (onContinue ? onContinue(values) : reset())}
                  className="h-11 rounded-full bg-[#0071e3] px-6 text-[15px] font-medium text-white outline-none transition-colors hover:bg-[#0077ed] focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 focus-visible:ring-offset-2"
                >
                  Continue
                </button>
                <button type="button" onClick={reset} className="h-11 rounded-full px-4 text-[15px] font-medium text-[#0066cc] outline-none hover:bg-[#0066cc]/[.07] focus-visible:ring-2 focus-visible:ring-[#0071e3]/50">
                  Start over
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" noValidate onSubmit={(e: FormEvent) => { e.preventDefault(); touched.current = true; void submit(values, true); }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring} className="flex flex-col">
              <h2 className="m-0 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em]">{title}</h2>
              <p className="m-0 mt-2 text-[15px] leading-[1.5] text-[#6e6e73]">{subtitle}</p>

              <div className="mt-7 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`name-${uid}`} className="text-[13px] font-medium">Name</label>
                  <input ref={nameRef} id={`name-${uid}`} name="name" autoComplete="name" value={name} placeholder="Ava Reyes"
                    onChange={(e) => { setName(e.target.value); nudge(); if (errors.name) setErrors((x) => ({ ...x, name: undefined })); }}
                    aria-invalid={!!errors.name} aria-describedby={errors.name ? `name-err-${uid}` : undefined} className={`${field} ${ring(errors.name)}`} />
                  {errors.name && <p id={`name-err-${uid}`} className="m-0 text-[12.5px] text-[#d70015]">{errors.name}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`email-${uid}`} className="text-[13px] font-medium">Email</label>
                  <input ref={emailRef} id={`email-${uid}`} name="email" type="email" inputMode="email" autoComplete="email" value={email} placeholder="you@example.com"
                    onChange={(e) => { setEmail(e.target.value); nudge(); if (errors.email) setErrors((x) => ({ ...x, email: undefined })); }}
                    aria-invalid={!!errors.email} aria-describedby={errors.email ? `email-err-${uid}` : undefined} className={`${field} ${ring(errors.email)}`} />
                  {errors.email && <p id={`email-err-${uid}`} className="m-0 text-[12.5px] text-[#d70015]">{errors.email}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`pass-${uid}`} className="text-[13px] font-medium">Password</label>
                  <div className="relative">
                    <input ref={passRef} id={`pass-${uid}`} name="password" type={show ? "text" : "password"} autoComplete="new-password" value={password}
                      onChange={(e) => { setPassword(e.target.value); nudge(); if (errors.password) setErrors((x) => ({ ...x, password: undefined })); }}
                      aria-invalid={!!errors.password} aria-describedby={`rules-${uid}${errors.password ? ` pass-err-${uid}` : ""}`} className={`${field} pr-12 ${ring(errors.password)}`} />
                    <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
                      className="absolute right-1.5 top-1/2 grid h-8 w-9 -translate-y-1/2 place-items-center rounded-[9px] text-[#6e6e73] outline-none hover:bg-black/[.05] focus-visible:ring-2 focus-visible:ring-[#0071e3]/50">
                      <Icon name={show ? "eyeSlash" : "eye"} className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                  <ul id={`rules-${uid}`} className="m-0 mt-1 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
                    {RULES.map((r, i) => (
                      <li key={r.id} className={`flex items-center gap-1.5 text-[12.5px] transition-colors ${met[i] ? "text-[#1d1d1f]" : "text-[#6e6e73]"}`}>
                        <span className={`grid h-4 w-4 place-items-center rounded-full transition-colors ${met[i] ? "bg-[#30d158] text-white" : "border border-[#c7c7cc]"}`}>
                          {met[i] && <Icon name="check" className="h-3 w-3" />}
                        </span>
                        {r.label}
                        <span className="sr-only">{met[i] ? ", done" : ", not yet"}</span>
                      </li>
                    ))}
                  </ul>
                  {errors.password && <p id={`pass-err-${uid}`} className="m-0 text-[12.5px] text-[#d70015]">{errors.password}</p>}
                </div>
              </div>

              <div aria-live="polite" className="min-h-0">
                {errors.form && (
                  <p role="alert" className="m-0 mt-4 flex items-start gap-2 rounded-[12px] bg-[#ff3b30]/[.08] px-3 py-2.5 text-[13px] text-[#d70015]">
                    <Icon name="alert" className="mt-px h-4 w-4 shrink-0" />
                    {errors.form}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="relative mt-6 h-11 overflow-hidden rounded-full bg-[#0071e3] px-6 text-[15px] font-medium text-white outline-none transition-colors hover:bg-[#0077ed] focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 focus-visible:ring-offset-2 disabled:cursor-progress"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {status === "loading" ? (
                    <motion.span key="l" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={spring} className="inline-flex items-center gap-2">
                      <motion.span aria-hidden className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                      Creating your pass
                    </motion.span>
                  ) : (
                    <motion.span key="i" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={spring} className="inline-block">
                      Create account
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <p className="m-0 mt-4 text-center text-[13px] text-[#6e6e73]">
                Already have an account?{" "}
                <button type="button" onClick={onSignIn} className="rounded font-medium text-[#0066cc] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#0071e3]/50">
                  Sign in
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** one side of the badge: a clear plastic holder, with a printed paper card slid into it and a slot punched at the top */
function Holder({ side, children }: { side: "front" | "back"; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0 rounded-[16px] [backface-visibility:hidden]"
      style={{
        transform: side === "front" ? "translateZ(1.5px)" : "rotateY(180deg) translateZ(1.5px)",
        background: "linear-gradient(160deg,rgba(255,255,255,.62),rgba(236,240,246,.5))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.9), inset 0 0 0 1.6px rgba(30,40,60,.13), inset 0 1.5px 0 rgba(255,255,255,1), 0 1px 1.5px rgba(0,0,0,.1)",
      }}
    >
      <span className="absolute left-1/2 top-[6px] h-[6px] w-[30px] -translate-x-1/2 rounded-full bg-[rgba(40,44,56,.2)] shadow-[inset_0_1px_1.5px_rgba(0,0,0,.35),0_.5px_0_rgba(255,255,255,.9)]" />
      <div
        className="absolute bottom-[8px] left-[8px] right-[8px] top-[20px] overflow-hidden rounded-[5px] shadow-[0_0_0_.5px_rgba(0,0,0,.1),0_1px_1.5px_rgba(0,0,0,.08)]"
        style={{ backgroundColor: "#fcfcfa", backgroundImage: PAPER }}
      >
        {children}
      </div>
    </div>
  );
}

/** a barcode for the pass number, the same for the same number */
function Barcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    let h = hash(seed) || 7;
    const out: { x: number; w: number }[] = [];
    let x = 0;
    while (x < 118) {
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
      const w = 0.7 + (h % 3) * 0.75;
      out.push({ x, w });
      x += w + 0.9 + ((h >>> 4) % 3) * 0.7;
    }
    return out;
  }, [seed]);
  return (
    <svg viewBox="0 0 120 18" className="h-[17px] min-w-0 flex-1" preserveAspectRatio="none">
      {bars.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={18} fill="#1d1d1f" />)}
    </svg>
  );
}

/** a scannable-looking code for the back of the pass, the same for the same person */
function PassCode({ seed }: { seed: string }) {
  const n = 13;
  const cells = useMemo(() => {
    let h = hash(seed || "member") || 1;
    const out: boolean[] = [];
    for (let i = 0; i < n * n; i++) {
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
      out.push((h & 7) < 3);
    }
    return out;
  }, [seed]);
  const corners = [[0, 0], [n - 4, 0], [0, n - 4]] as const;
  const inCorner = (x: number, y: number) => corners.some(([fx, fy]) => x >= fx && x < fx + 4 && y >= fy && y < fy + 4);
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="mx-auto mt-3 w-[116px] rounded-[8px] bg-white" role="presentation">
      {cells.map((on, i) => {
        const x = i % n, y = Math.floor(i / n);
        return on && !inCorner(x, y) ? <rect key={i} x={x + 0.1} y={y + 0.1} width={0.8} height={0.8} rx={0.28} fill="#1d1d1f" /> : null;
      })}
      {corners.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={3} height={3} rx={0.8} fill="#1d1d1f" />
          <rect x={x + 0.55} y={y + 0.55} width={1.9} height={1.9} rx={0.45} fill="#fff" />
          <rect x={x + 1} y={y + 1} width={1} height={1} rx={0.25} fill="#1d1d1f" />
        </g>
      ))}
    </svg>
  );
}
