"use client";
import { useEffect, useEffectEvent, useId, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useVelocity, type AnimationPlaybackControls } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface ZipperRevealProps {
  /** The invite code shown once the pouch is open, and copied by the button. */
  code?: string;
  /** Zips itself open and shut until someone grabs the pull. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const W = 320, H = 420, CX = W / 2;
const Z0 = 34, Z1 = 392, MAXO = 150, GAP = 8;

/** How far each edge has pulled away from the centre at height y. */
const openAt = (y: number, sy: number) => (y >= sy ? 0 : MAXO * (1 - Math.exp((-0.62 * (sy - y)) / MAXO)));

/**
 * A pouch you unzip to get your invite. Drag the pull down and the teeth
 * part above it into a V, the fabric edges pull back with a shadow under
 * them, and the code inside comes into view. The pull tab swings from the
 * slider as you move it. It stays where you leave it, like a real zip.
 */
export function ZipperReveal({ code = "NXS-8F2Q-PRO", autoplay = false, enableSound = true }: ZipperRevealProps) {
  const play = useSound(enableSound);
  const id = useId().replace(/[^a-z0-9]/gi, "");
  const reduce = useReducedMotion();
  const s = useMotionValue(0);
  const [v, setV] = useState(0);
  useMotionValueEvent(s, "change", setV);
  const vel = useVelocity(s);
  const swing = useSpring(0, { stiffness: 220, damping: 9 });
  useMotionValueEvent(vel, "change", (x) => swing.set(Math.max(-38, Math.min(38, -x * 22))));
  const [tab, setTab] = useState(0);
  useMotionValueEvent(swing, "change", setTab);
  const drag = useRef(false);
  const box = useRef<SVGSVGElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const tickAt = useRef({ y: 0, t: 0 });
  const atEnd = useRef(false);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);

  const sy = Z0 + v * (Z1 - Z0);
  const edge = (side: -1 | 1) => {
    const pts: string[] = [];
    for (let y = 0; y <= H; y += 4) pts.push(`${(CX + side * openAt(y, sy)).toFixed(1)},${y}`);
    return pts;
  };
  const L = edge(-1), R = edge(1);
  const leftPanel = `M0,0 L${L.join(" L")} L0,${H} Z`;
  const rightPanel = `M${W},0 L${R.join(" L")} L${W},${H} Z`;
  const leftEdge = `M${L.join(" L")}`, rightEdge = `M${R.join(" L")}`;

  const teeth: { x: number; y: number; a: number; side: number }[] = [];
  for (let k = 0, y = Z0 + 6; y < Z1 - 2; y += GAP / 2, k++) {
    const side = k % 2 ? 1 : -1;
    const o = openAt(y, sy);
    const dy = 2, slope = (openAt(y - dy, sy) - openAt(y + dy, sy)) / (2 * dy);
    teeth.push({ x: CX + side * (o + (o > 0.5 ? 3 : 1.5)), y, a: (Math.atan(slope) * 180) / Math.PI * side, side });
  }

  /** A quiet tick every few teeth, and one latch at the open end. `auto` is the autoplay demo (ticks spaced wider). */
  const sound = (to: number, y: number, step = 18, auto = false) => {
    const say = auto ? play.auto : play;
    const now = performance.now();
    if (Math.abs(y - tickAt.current.y) >= step && now - tickAt.current.t >= 50) {
      tickAt.current = { y, t: now };
      say("tick", 0.4);
    }
    if (to >= 1 && !atEnd.current) say("on");
    atEnd.current = to >= 1;
  };
  const autoSound = useEffectEvent((to: number) => sound(to, Z0 + to * (Z1 - Z0), 100, true));
  const setFromY = (clientY: number) => {
    const r = box.current!.getBoundingClientRect();
    const y = ((clientY - r.top) / r.height) * H;
    const to = Math.max(0, Math.min(1, (y - Z0) / (Z1 - Z0)));
    sound(to, Z0 + to * (Z1 - Z0));
    s.set(to);
  };
  const down = (e: RPointerEvent<SVGGElement>) => {
    touched.current = true;
    drag.current = true;
    run.current?.stop();
    s.stop();
    tickAt.current.y = Z0 + s.get() * (Z1 - Z0);
    atEnd.current = s.get() >= 1;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const move = (e: RPointerEvent) => { if (drag.current) setFromY(e.clientY); };
  const up = () => { drag.current = false; };
  const key = (e: KeyboardEvent) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 0.05 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -0.05 : e.key === "End" ? 1 : e.key === "Home" ? -1 : 0;
    if (d) {
      e.preventDefault();
      touched.current = true;
      run.current?.stop();
      const to = Math.max(0, Math.min(1, s.get() + d));
      if (to !== s.get()) sound(to, Z0 + to * (Z1 - Z0), 0);
      run.current = animate(s, to, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    const seq = [0.78, 0.18, 0.55, 0];
    let k = 0;
    let onScreen = true;
    const el = root.current;
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1]?.isIntersecting ?? true;
    });
    if (el) io.observe(el);
    const t = setInterval(() => {
      if (touched.current) { clearInterval(t); return; }
      if (document.hidden || !onScreen) return;
      tickAt.current.y = Z0 + s.get() * (Z1 - Z0);
      run.current = animate(s, seq[k++ % seq.length], { duration: 1.3, ease: [0.45, 0, 0.2, 1], onUpdate: autoSound });
    }, 2200);
    return () => {
      clearInterval(t);
      io.disconnect();
      run.current?.stop();
    };
  }, [autoplay, reduce, s]);

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  const copy = () => {
    play("tap");
    void navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  };

  const visible = v > 0.45;
  return (
    <div
      ref={root}
      className="flex flex-col items-center gap-3 [--zr-f0:#f2f2f5] [--zr-f1:#e3e3e8] [--zr-hem:#b9b9c0] [--zr-tape:#d4d4da] dark:[--zr-f0:#2c2c2e] dark:[--zr-f1:#1c1c1e] dark:[--zr-hem:#545458] dark:[--zr-tape:#48484a]"
    >
      <div className="relative" style={{ width: W, height: H }}>
        {/* what's inside */}
        <div className="absolute inset-0 overflow-hidden rounded-[30px] bg-[linear-gradient(160deg,#0a84ff,#5e5ce6_60%,#bf5af2)] p-7 text-white">
          <div className="mx-auto flex w-[180px] flex-col items-center pt-6 text-center">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/70">You&apos;re in</span>
            <span className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.03em]">Early access to Nexus Pro</span>
            <span className="mt-5 rounded-[12px] bg-white/15 px-3 py-2 font-mono text-[15px] tracking-[0.08em] backdrop-blur">{code}</span>
            <button
              type="button"
              tabIndex={visible ? 0 : -1}
              aria-hidden={!visible}
              onClick={copy}
              className="mt-3 h-9 rounded-full bg-white px-4 text-[13px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#5e5ce6]"
            >
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
        </div>

        <svg
          ref={box}
          className="absolute inset-0 overflow-visible"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          style={{ pointerEvents: "none" }}
        >
          <defs>
            <clipPath id={`pouch-${id}`}><rect width={W} height={H} rx="30" /></clipPath>
            <filter id={`weave-${id}`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="2" seed="4" result="n" />
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <filter id={`soft-${id}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
            <linearGradient id={`fab-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={{ stopColor: "var(--zr-f0)" }} /><stop offset="1" style={{ stopColor: "var(--zr-f1)" }} /></linearGradient>
            <linearGradient id={`metal-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f5f5f7" /><stop offset=".5" stopColor="#c4c4cb" /><stop offset="1" stopColor="#8e8e96" /></linearGradient>
          </defs>
          <g clipPath={`url(#pouch-${id})`}>
            {/* shadow the fabric casts into the opening */}
            <path d={leftEdge} stroke="#000" strokeOpacity=".35" strokeWidth="14" fill="none" filter={`url(#soft-${id})`} transform="translate(4 0)" />
            <path d={rightEdge} stroke="#000" strokeOpacity=".35" strokeWidth="14" fill="none" filter={`url(#soft-${id})`} transform="translate(-4 0)" />
            {[leftPanel, rightPanel].map((d, i) => (
              <g key={i}>
                <path d={d} fill={`url(#fab-${id})`} />
                <path d={d} fill="#000" filter={`url(#weave-${id})`} />
              </g>
            ))}
            {/* zip tape along each edge */}
            <path d={leftEdge} strokeWidth="9" fill="none" transform="translate(-4 0)" style={{ stroke: "var(--zr-tape)" }} />
            <path d={rightEdge} strokeWidth="9" fill="none" transform="translate(4 0)" style={{ stroke: "var(--zr-tape)" }} />
            {/* stitched hem */}
            <rect x="10" y="10" width={W - 20} height={H - 20} rx="22" fill="none" strokeWidth="1.2" strokeDasharray="5 4" style={{ stroke: "var(--zr-hem)" }} />
            {teeth.map((t, i) => (
              <rect key={i} x={-5} y={-2.2} width="10" height="4.4" rx="1.6" fill={`url(#metal-${id})`} stroke="rgba(0,0,0,.18)" strokeWidth=".5" transform={`translate(${t.x} ${t.y}) rotate(${t.a}) translate(${t.side * 2} 0)`} />
            ))}
            {/* bottom stop */}
            <rect x={CX - 7} y={Z1 - 1} width="14" height="7" rx="2" fill={`url(#metal-${id})`} />
          </g>

          {/* slider + pull tab */}
          <g
            transform={`translate(${CX} ${sy})`}
            style={{ pointerEvents: "auto", cursor: "grab", touchAction: "none" }}
            onPointerDown={down}
            role="slider"
            tabIndex={0}
            aria-label="Zip"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(v * 100)}
            aria-valuetext={visible ? "Open: invite code showing" : `${Math.round(v * 100)}% open`}
            onKeyDown={key}
            className="outline-none [&:focus-visible>rect:first-of-type]:stroke-[#0071e3] [&:focus-visible>rect:first-of-type]:stroke-[3px] dark:[&:focus-visible>rect:first-of-type]:stroke-[#2997ff]"
          >
            <rect x="-13" y="-17" width="26" height="30" rx="8" fill={`url(#metal-${id})`} stroke="rgba(0,0,0,.25)" strokeWidth="1" />
            <rect x="-9" y="-12" width="18" height="6" rx="3" fill="rgba(255,255,255,.6)" />
            <g transform={`rotate(${tab.toFixed(2)} 0 8)`}>
              <rect x="-8" y="8" width="16" height="44" rx="7" fill={`url(#metal-${id})`} stroke="rgba(0,0,0,.25)" strokeWidth="1" />
              <rect x="-3.5" y="38" width="7" height="9" rx="3.5" fill="#6e6e73" />
            </g>
            <rect x="-30" y="-24" width="60" height="84" fill="transparent" />
          </g>
        </svg>
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">{v < 0.05 ? "Pull the zip down." : visible ? "Copy it before someone else does." : "Keep going…"}</span>
    </div>
  );
}
