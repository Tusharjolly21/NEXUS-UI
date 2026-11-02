"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { animate, motion, motionValue, useInView, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/* Icons: Framework7 Icons (MIT), via Iconify. */
const ICONS: Record<string, string> = {
  "doc-text": '<path fill="currentColor" d="M15.555 53.125h24.89c4.852 0 7.266-2.461 7.266-7.336V24.508c0-3.024-.328-4.336-2.203-6.258L32.57 5.102c-1.78-1.829-3.234-2.227-5.882-2.227H15.555c-4.828 0-7.266 2.484-7.266 7.36v35.554c0 4.898 2.438 7.336 7.266 7.336m.187-3.773c-2.414 0-3.68-1.29-3.68-3.633V10.305c0-2.32 1.266-3.657 3.704-3.657h10.406v13.618c0 2.953 1.5 4.406 4.406 4.406h13.36v21.047c0 2.343-1.243 3.633-3.68 3.633ZM31 21.132c-.914 0-1.29-.374-1.29-1.312V7.375l13.5 13.758Zm5.625 9.985h-17.79c-.843 0-1.452.633-1.452 1.43c0 .82.61 1.453 1.453 1.453h17.789a1.43 1.43 0 0 0 1.453-1.453c0-.797-.633-1.43-1.453-1.43m0 8.18h-17.79c-.843 0-1.452.656-1.452 1.476c0 .797.61 1.407 1.453 1.407h17.789c.82 0 1.453-.61 1.453-1.407c0-.82-.633-1.476-1.453-1.476"/>',
  "checkmark-alt": '<path fill="currentColor" d="m45.646 14.646l.708.708a2 2 0 0 1 0 2.828l-22.94 22.94a2 2 0 0 1-2.828 0l-9.94-9.94a2 2 0 0 1 0-2.828l.708-.708a2 2 0 0 1 2.828 0l6.404 6.404a2 2 0 0 0 2.828 0l19.404-19.404a2 2 0 0 1 2.828 0"/>',
  "doc-on-doc": '<path fill="currentColor" d="M11.505 56h21.4c4.561 0 6.721-2.314 6.721-6.92v-4.077h4.298c4.54 0 6.81-2.314 6.81-6.92V19.636c0-2.71-.53-4.43-2.182-6.126L37.422 2.182C35.836.573 34.006 0 31.648 0h-9.013c-4.54 0-6.833 2.314-6.833 6.92v4.077h-4.297c-4.54 0-6.832 2.314-6.832 6.92V49.08c0 4.628 2.292 6.92 6.832 6.92m28.121-24.683c0-2.821-.33-4.055-2.093-5.863L25.389 13.092c-1.675-1.72-3.063-2.094-5.553-2.094h-.485V6.964c0-2.16 1.19-3.416 3.46-3.416h9.3v11.526c0 2.535 1.256 3.769 3.769 3.769h11.306v19.196c0 2.181-1.169 3.416-3.46 3.416h-4.1Zm-3.217-15.67c-.794 0-1.102-.33-1.102-1.101V4.253l11.195 11.394ZM11.68 52.452c-2.27 0-3.46-1.234-3.46-3.438V17.96c0-2.16 1.19-3.415 3.482-3.415h7.648v12.782c0 2.777 1.41 4.143 4.143 4.143h12.584v17.543c0 2.204-1.19 3.438-3.482 3.438Zm12.232-24.309c-.882 0-1.234-.352-1.234-1.212V15.23l12.716 12.914Z"/>',
};

function Icon({ name, size = 18, className, style }: { name: keyof typeof ICONS; size?: number; className?: string; style?: CSSProperties }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} className={className} style={style} fill="currentColor" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}

export interface SealedAndSentStep {
  /** Short heading for the step. */
  title: string;
  /** One or two sentences that say what happens. */
  text: string;
  /**
   * How long this step holds while the demo runs by itself, in milliseconds. Never shorter than the scene needs to
   * finish (about 3000, 5200 and 4200 for the three steps).
   */
  ms?: number;
}

export interface SealedAndSentProps {
  /**
   * The story beside the scene. The scene has three phases (the file arrives, it is read and sealed, it ships), so
   * give it three steps. Extra steps are ignored; fewer steps stop the story earlier.
   */
  steps?: SealedAndSentStep[];
  /** Heading above the steps. */
  title?: string;
  /** Name shown on the file that lands on the desk. */
  fileName?: string;
  /** The live link shown at the end, with or without a scheme. Copying it adds `https://` when there is none. */
  linkText?: string;
  /** Accent for the ticks, wax seal, envelope lining and Copy button. Defaults to `#0071e3`. */
  accent?: string;
  /** Accent in dark mode. Defaults to `accent` when that is set, otherwise `#2997ff`. */
  accentDark?: string;
  /**
   * Plays the three steps in turn by itself, looping, until the first pointer, key or touch on the block, then holds
   * for good (select a step to play it). Off under reduced motion; paused while less than 30% of the block is in view.
   */
  autoplay?: boolean;
  className?: string;
}

const STEPS: SealedAndSentStep[] = [
  { title: "Drop in your file", text: "Drag in a document or paste a link. It lands on your desk, ready to go.", ms: 3000 },
  { title: "We read every line", text: "Each line is checked and ticked off, then the whole file is sealed with your mark.", ms: 5200 },
  { title: "It ships", text: "Your page goes live in seconds, and you get a link you can share straight away.", ms: 4200 },
];
/** The least each phase needs to finish playing. */
const MIN_MS = [3000, 5200, 4200];
const LINES = [0.9, 0.66, 0.82, 0.54];

const dataUri = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`;
const GRAIN_URI = dataUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='a'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .5 -.24'/></filter><rect width='100%' height='100%' filter='url(#a)'/></svg>`,
);
const LINEN_URI = dataUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='l'><feTurbulence type='fractalNoise' baseFrequency='.012 .9' numOctaves='2' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4 0 0 0 0 .38 0 0 0 0 .34 0 0 0 .55 -.27'/></filter><rect width='100%' height='100%' filter='url(#l)'/><rect width='100%' height='100%' filter='url(#l)' transform='rotate(90 110 110)'/></svg>`,
);
const GRAIN = `url("${GRAIN_URI}")`;
const LINEN = `url("${LINEN_URI}")`;

/** The wax: an irregular blob, the way a poured seal never lands perfectly round. */
const BLOB = (() => {
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const n = 22;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rad = 25 + (r() - 0.5) * 3.6 + (i % 5 === 0 ? 2.2 : 0);
    return [32 + Math.cos(a) * rad, 32 + Math.sin(a) * rad];
  });
  return (
    pts
      .map((p, i) => {
        const q = pts[(i + 1) % n];
        const start = i ? "" : `M${((p[0] + pts[n - 1][0]) / 2).toFixed(1)} ${((p[1] + pts[n - 1][1]) / 2).toFixed(1)} `;
        return `${start}Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2).toFixed(1)}`;
      })
      .join(" ") + "Z"
  );
})();

/* Scene space in px; the stage scales it to fit. */
const W = 420;
const HS = 380;
const ENV = { x: 84, y: 196, w: 252, h: 164 };
const CARD = { w: 196, h: 128, x: 112, rest: 44, inside: 212 };
const PAPER = "#fbfaf7";
const LINER =
  "repeating-linear-gradient(135deg, var(--a) 0 3px, color-mix(in srgb, var(--a) 70%, #000) 3px 4px, var(--a) 4px 9px, color-mix(in srgb, var(--a) 55%, #fff) 9px 10px)";

/* ---- the scene: motion values and the functions that drive them, kept out of React state ---- */

type MV = MotionValue<number>;
type Scene = ReturnType<typeof createScene>;

function createScene() {
  const mv = (v: number) => motionValue(v);
  const s = {
    cx: mv(CARD.x), cy: mv(-200), cr: mv(-14),
    scanY: mv(0), scanO: mv(0),
    flap: mv(180),
    sealS: mv(0), sealO: mv(0),
    pkX: mv(0), pkY: mv(0), pkR: mv(0), pkS: mv(1), pkO: mv(1),
    linkY: mv(16), linkO: mv(0),
    opens: mv(0),
    progress: mv(0),
    ticks: LINES.map(() => mv(0)),
  };
  const all: MV[] = [
    s.cx, s.cy, s.cr, s.scanY, s.scanO, s.flap, s.sealS, s.sealO, s.pkX, s.pkY, s.pkR, s.pkS, s.pkO, s.linkY, s.linkO, s.opens, ...s.ticks,
  ];
  return { ...s, all };
}

/** The state at the start of phase `p`, set instantly. */
function poseScene(S: Scene, p: number, keepLink = false) {
  S.all.forEach((m) => m.stop());
  S.pkX.set(0); S.pkY.set(0); S.pkR.set(0); S.pkS.set(1); S.pkO.set(1);
  if (!keepLink) { S.linkO.set(0); S.linkY.set(16); S.opens.set(0); }
  S.scanO.set(0); S.scanY.set(0);
  S.cx.set(CARD.x); S.cr.set(0);
  if (p === 0) { S.cy.set(-200); S.flap.set(180); S.sealO.set(0); S.sealS.set(0); S.ticks.forEach((t) => t.set(0)); }
  if (p === 1) { S.cy.set(CARD.rest); S.flap.set(180); S.sealO.set(0); S.sealS.set(0); S.ticks.forEach((t) => t.set(0)); }
  if (p >= 2) { S.cy.set(CARD.inside); S.flap.set(0); S.sealO.set(1); S.sealS.set(1); S.ticks.forEach((t) => t.set(1)); }
}

/** Reduced motion: show where each phase ends, with nothing in between. */
function restScene(S: Scene, p: number) {
  poseScene(S, Math.min(p + 1, 2));
  if (p >= 2) { S.pkO.set(0); S.linkO.set(1); S.linkY.set(0); S.opens.set(3); }
}

/** Plays phase `p` from its start. Returns a function that cancels everything it started. */
function playScene(S: Scene, p: number): () => void {
  const timers: number[] = [];
  let alive = true;
  const later = (ms: number, f: () => void) => {
    timers.push(window.setTimeout(() => alive && f(), ms));
  };

  if (p === 0) {
    // a fresh envelope slides up, then the file falls onto the desk, swaying like paper
    const hadLink = S.linkO.get() > 0;
    poseScene(S, 0, hadLink);
    if (hadLink) animate(S.linkO, 0, { duration: 0.3 });
    const d = hadLink ? 0.25 : 0;
    S.pkY.set(26); S.pkO.set(0);
    animate(S.pkO, 1, { duration: 0.4, delay: d });
    animate(S.pkY, 0, { type: "spring", stiffness: 160, damping: 20, delay: d });
    S.cy.set(-200); S.cr.set(-14); S.cx.set(CARD.x);
    later(250 + d * 1000, () => {
      animate(S.cx, [CARD.x, CARD.x + 22, CARD.x - 14, CARD.x + 4, CARD.x], { duration: 1.5, ease: "easeInOut" });
      animate(S.cr, [-14, 8, -5, 1.5, 0], { duration: 1.5, ease: "easeInOut" });
      animate(S.cy, CARD.rest, { type: "spring", stiffness: 46, damping: 12, mass: 1.5 });
    });
  } else {
    poseScene(S, p);
  }

  if (p === 1) {
    // read it: a light passes down, each line ticked as it is reached
    animate(S.scanO, 1, { duration: 0.2 });
    animate(S.scanY, 1, { duration: 1.8, ease: [0.45, 0, 0.55, 1] });
    S.ticks.forEach((t, i) => later(420 + i * 360, () => { animate(t, 1, { type: "spring", stiffness: 140, damping: 18 }); }));
    later(1900, () => { animate(S.scanO, 0, { duration: 0.25 }); });
    // then into the envelope, the flap over, and the seal pressed on
    later(2150, () => { animate(S.cy, CARD.inside, { duration: 0.8, ease: [0.65, 0, 0.35, 1] }); });
    later(2950, () => { animate(S.flap, 0, { type: "spring", stiffness: 95, damping: 15 }); });
    later(3550, () => {
      animate(S.sealO, 1, { duration: 0.08 });
      animate(S.sealS, [1.7, 0.84, 1.06, 1], { duration: 0.62, times: [0, 0.42, 0.72, 1], ease: ["easeIn", "easeOut", "easeInOut"] });
      animate(S.pkY, [0, 3, 0], { duration: 0.35, delay: 0.24 }); // the desk takes the press
    });
  }

  if (p >= 2) {
    // it lifts, leans, and goes
    animate(S.pkS, 1.05, { type: "spring", stiffness: 220, damping: 18 });
    animate(S.pkY, -14, { type: "spring", stiffness: 220, damping: 18 });
    later(420, () => {
      animate(S.pkR, [0, -4, 16], { duration: 1.0, times: [0, 0.25, 1], ease: "easeIn" });
      animate(S.pkX, [0, -18, 560], { duration: 1.0, times: [0, 0.25, 1], ease: ["easeOut", [0.55, 0, 0.8, 0.4]] });
      animate(S.pkY, [-14, -4, -330], { duration: 1.0, times: [0, 0.25, 1], ease: ["easeOut", [0.5, 0, 0.75, 0.3]] });
      animate(S.pkO, [1, 1, 0], { duration: 1.0, times: [0, 0.75, 1] });
    });
    later(1050, () => {
      S.opens.set(0);
      S.linkY.set(18);
      animate(S.linkO, 1, { duration: 0.3 });
      animate(S.linkY, 0, { type: "spring", stiffness: 260, damping: 20 });
      [700, 1300, 1800, 2400].forEach((t, i) => later(t, () => S.opens.set(i + 1)));
    });
  }

  return () => {
    alive = false;
    timers.forEach((t) => window.clearTimeout(t));
    S.all.forEach((m) => m.stop());
  };
}

/** A pencil tick that draws itself. */
function Tick({ progress }: { progress: MV }) {
  const opacity = useTransform(progress, [0, 0.12], [0, 1]);
  return (
    <svg width={13} height={13} viewBox="0 0 13 13" className="shrink-0" aria-hidden="true">
      <motion.path d="M2 7.2 L5.2 10.2 L11 2.8" fill="none" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--a)", pathLength: progress, opacity }} />
    </svg>
  );
}

/**
 * How it works, told as a letter being sent. The file drops onto a linen desk, swaying as paper does, and settles.
 * A light reads down it and each line gets its tick; then it slides into an envelope, the flap folds over and a wax
 * seal presses down. Last, the envelope lifts and flies off, and what is left is a live link with a Copy button
 * that works. The three steps beside the desk tell the same story in words; the demo walks through them on its own
 * until the first touch, and after that you select a step to play it.
 */
export function SealedAndSent({
  steps = STEPS,
  title = "From file to shipped, in three steps.",
  fileName = "pricing-update.md",
  linkText = "launch.example/p/8f3k",
  accent,
  accentDark,
  autoplay = true,
  className,
}: SealedAndSentProps) {
  const reduce = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [S] = useState(createScene);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const copyTimer = useRef(0);
  const inView = useInView(root, { amount: 0.3 });
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(1);

  const list = (steps.length ? steps : STEPS).slice(0, 3);
  const count = list.length;
  const cur = Math.min(step, count - 1);
  const auto = autoplay && !reduce && !stopped && inView;
  const dwell = Math.max(list[cur]?.ms ?? MIN_MS[cur], MIN_MS[cur]);

  const a = accent ?? "#0071e3";
  const ad = accentDark ?? accent ?? "#2997ff";

  // derived values for the scene
  const flapZ = useTransform(S.flap, (v) => (v > 90 ? 2 : 5));
  const flapShadow = useTransform(S.flap, [0, 70], [1, 0]);
  const scanTop = useTransform(S.scanY, (v) => v * (CARD.h + 30) - 30);
  // shadows answer height: the file's grows soft as it falls, the envelope's spreads as it lifts
  const cardShadow = useTransform(S.cy, (y) => {
    const h = Math.max(0, Math.min(1, (CARD.rest - y) / 240));
    return `0 0 0 .5px rgba(40,30,20,.07), 0 ${2 + h * 26}px ${4 + h * 40}px rgba(40,30,20,${(0.14 - h * 0.08).toFixed(3)})`;
  });
  const pkShadowS = useTransform([S.pkS, S.pkY], ([s, y]: number[]) => 1 + (s - 1) * 4 + Math.max(0, -y) * 0.004);
  const pkShadowO = useTransform([S.pkO, S.pkY], ([o, y]: number[]) => o * Math.max(0, 1 - Math.max(0, -y) / 140));
  const linkVisible = useTransform(S.linkO, (v) => (v > 0.02 ? "visible" : "hidden"));
  const openedText = useTransform(S.opens, (n) => `Opened ${Math.round(n)} ${Math.round(n) === 1 ? "time" : "times"}`);

  // scale the fixed-size scene to the width of the stage
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1.15, el.offsetWidth / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the scene: play the current phase (or show where it ends under reduced motion)
  useEffect(() => {
    if (reduce) {
      restScene(S, cur);
      return;
    }
    if (!inView) return;
    return playScene(S, cur);
  }, [S, cur, replay, reduce, inView]);

  // the dwell: the step holds with its bar filling, then moves on
  useEffect(() => {
    if (!auto) return;
    S.progress.set(0);
    let raf = 0;
    let last = performance.now();
    let t = 0;
    const tick = (now: number) => {
      t += now - last;
      last = now;
      S.progress.set(Math.min(1, t / dwell));
      if (t >= dwell) {
        setStep((s) => (Math.min(s, count - 1) + 1) % count);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [S, auto, cur, dwell, count]);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const halt = () => {
    if (!stopped) setStopped(true);
  };
  const go = (i: number) => {
    setStopped(true);
    if (i === cur) setReplay((k) => k + 1);
    else setStep(i);
  };
  const copy = async () => {
    const href = /^[a-z][a-z0-9+.-]*:\/\//i.test(linkText) ? linkText : `https://${linkText}`;
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      /* clipboard blocked; still show the state */
    }
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  const rootVars = { "--sas-a": a, "--sas-ad": ad } as CSSProperties;
  const gid = (n: string) => `${uid}-${n}`;

  return (
    <section
      ref={root}
      aria-label={title}
      className={cn(
        "@container w-full overflow-hidden bg-white px-4 py-14 text-[#1d1d1f] [--a:var(--sas-a)] @2xl:px-8 @2xl:py-20 dark:bg-black dark:text-[#f5f5f7] dark:[--a:var(--sas-ad)]",
        className,
      )}
      style={rootVars}
      onPointerDown={halt}
      onPointerMove={halt}
      onTouchStart={halt}
      onKeyDown={halt}
    >
      <div className="mx-auto grid w-full max-w-[1040px] gap-x-14 gap-y-8 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] @4xl:gap-y-6">
        <h2 className="m-0 max-w-[460px] text-[clamp(28px,7cqi,48px)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance @4xl:col-start-1 @4xl:row-start-1 @4xl:self-end">
          {title}
        </h2>

        {/* the desk */}
        <div className="relative min-w-0 @4xl:col-start-2 @4xl:row-span-2 @4xl:row-start-1">
          <div
            ref={stage}
            className="relative overflow-hidden rounded-[24px] bg-[radial-gradient(120%_90%_at_20%_0%,#fbfbfa,#efeeeb_70%,#e9e8e4)] shadow-[inset_0_0_0_1px_rgba(0,0,0,.05),inset_0_-30px_60px_-40px_rgba(60,50,40,.18)] @2xl:rounded-[28px] dark:bg-[radial-gradient(120%_90%_at_20%_0%,#2b2a2a,#212121_70%,#191919)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.07),inset_0_-30px_60px_-40px_rgba(0,0,0,.7)]"
            style={{ height: HS * scale }}
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-55 mix-blend-multiply dark:opacity-[.14] dark:mix-blend-screen" style={{ backgroundImage: `${LINEN}, ${GRAIN}` }} />
            <div aria-hidden="true" className="absolute top-0 left-1/2" style={{ width: W, height: HS, transform: `translateX(-50%) scale(${scale})`, transformOrigin: "50% 0" }}>
              {/* the envelope's shadow on the desk */}
              <motion.span
                className="absolute rounded-[50%] bg-[rgba(40,30,20,.28)] blur-[10px] dark:bg-black/60"
                style={{ left: ENV.x + 8, top: ENV.y + ENV.h - 14, width: ENV.w - 16, height: 26, scaleX: pkShadowS, opacity: pkShadowO, x: S.pkX }}
              />

              {/* the packet: envelope, file and seal move together once it ships */}
              <motion.div className="absolute inset-0" style={{ x: S.pkX, y: S.pkY, rotate: S.pkR, scale: S.pkS, opacity: S.pkO, transformOrigin: `${ENV.x + ENV.w / 2}px ${ENV.y + ENV.h / 2}px` }}>
                {/* back of the envelope: the lining shows through the opening */}
                <div className="absolute overflow-hidden rounded-[5px]" style={{ left: ENV.x, top: ENV.y, width: ENV.w, height: ENV.h, zIndex: 1, background: LINER, boxShadow: "0 1px 1px rgba(40,30,20,.12), 0 10px 22px -12px rgba(40,30,20,.35)" }}>
                  <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,0) 45%)" }} />
                </div>

                {/* the flap: lining inside, paper outside; it folds over the file */}
                <motion.div className="absolute" style={{ left: ENV.x, top: ENV.y, width: ENV.w, height: 96, zIndex: flapZ, rotateX: S.flap, transformOrigin: "50% 0", transformStyle: "preserve-3d", transformPerspective: 900 }}>
                  <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", clipPath: "polygon(0 0, 100% 0, 52% 98%, 48% 98%)", background: `linear-gradient(180deg, #f6f4ef, ${PAPER} 70%)` }}>
                    <span className="absolute inset-0 mix-blend-multiply" style={{ backgroundImage: GRAIN, opacity: 0.6 }} />
                    <span className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(40,30,20,.08), transparent 30%)" }} />
                    <svg className="absolute inset-0" width="100%" height="100%" viewBox={`0 0 ${ENV.w} 96`} preserveAspectRatio="none" aria-hidden="true">
                      <path d={`M0 0 L${ENV.w * 0.48} ${96 * 0.98} L${ENV.w * 0.52} ${96 * 0.98} L${ENV.w} 0`} fill="none" stroke="rgba(60,45,30,.16)" strokeWidth={1.6} />
                    </svg>
                  </div>
                  <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)", clipPath: "polygon(48% 2%, 52% 2%, 100% 100%, 0 100%)", background: LINER }}>
                    <span className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,0,0,.18), transparent 60%)" }} />
                  </div>
                </motion.div>

                {/* the file */}
                <motion.div className="absolute overflow-hidden rounded-[6px] bg-white p-3.5" style={{ left: 0, top: 0, x: S.cx, y: S.cy, rotate: S.cr, width: CARD.w, height: CARD.h, zIndex: 3, boxShadow: cardShadow }}>
                  <span className="pointer-events-none absolute inset-0 mix-blend-multiply" style={{ backgroundImage: GRAIN, opacity: 0.4 }} />
                  <p className="relative m-0 flex min-w-0 items-center gap-1.5 text-[12px] font-semibold text-[#1d1d1f]">
                    <Icon name="doc-text" size={14} className="shrink-0" style={{ color: "var(--a)" }} />
                    <span className="truncate">{fileName}</span>
                  </p>
                  <div className="relative mt-3.5 flex flex-col gap-[10px]">
                    {LINES.map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="h-[5px] rounded-full bg-[#e6e5e1]" style={{ width: `${w * 82}%` }} />
                        <span className="ml-auto">
                          <Tick progress={S.ticks[i]} />
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* the reading light */}
                  <motion.span
                    className="pointer-events-none absolute inset-x-0 h-[30px]"
                    style={{ top: scanTop, opacity: S.scanO, background: "linear-gradient(180deg, transparent, color-mix(in srgb, var(--a) 14%, transparent) 75%, color-mix(in srgb, var(--a) 70%, transparent) 97%, transparent)" }}
                  />
                </motion.div>

                {/* the front of the envelope: side flaps and bottom flap, folded */}
                <svg className="absolute" style={{ left: ENV.x, top: ENV.y, zIndex: 4, overflow: "visible" }} width={ENV.w} height={ENV.h} viewBox={`0 0 ${ENV.w} ${ENV.h}`} aria-hidden="true">
                  <defs>
                    <linearGradient id={gid("side")} x1="0" x2="1">
                      <stop offset="0" stopColor="#f4f2ec" />
                      <stop offset="1" stopColor={PAPER} />
                    </linearGradient>
                    <linearGradient id={gid("bottom")} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0" stopColor="#f3f1eb" />
                      <stop offset="1" stopColor="#fdfcfa" />
                    </linearGradient>
                    <filter id={gid("fold")} x="-10%" y="-20%" width="120%" height="140%">
                      <feDropShadow dx="0" dy="-1" stdDeviation="1.4" floodColor="#3a2e22" floodOpacity=".16" />
                    </filter>
                    <pattern id={gid("grain")} width="160" height="160" patternUnits="userSpaceOnUse">
                      <image href={GRAIN_URI} width="160" height="160" />
                    </pattern>
                  </defs>
                  <path d={`M0 2 Q0 0 2 0 L${ENV.w / 2 - 4} ${ENV.h * 0.56} Q${ENV.w / 2} ${ENV.h * 0.59} ${ENV.w / 2 - 4} ${ENV.h * 0.62} L2 ${ENV.h} Q0 ${ENV.h} 0 ${ENV.h - 2}Z`} fill={`url(#${gid("side")})`} />
                  <path d={`M${ENV.w} 2 Q${ENV.w} 0 ${ENV.w - 2} 0 L${ENV.w / 2 + 4} ${ENV.h * 0.56} Q${ENV.w / 2} ${ENV.h * 0.59} ${ENV.w / 2 + 4} ${ENV.h * 0.62} L${ENV.w - 2} ${ENV.h} Q${ENV.w} ${ENV.h} ${ENV.w} ${ENV.h - 2}Z`} fill={`url(#${gid("side")})`} />
                  <path d={`M0 ${ENV.h - 3} L${ENV.w / 2 - 10} ${ENV.h * 0.5} Q${ENV.w / 2} ${ENV.h * 0.45} ${ENV.w / 2 + 10} ${ENV.h * 0.5} L${ENV.w} ${ENV.h - 3} Q${ENV.w} ${ENV.h} ${ENV.w - 4} ${ENV.h} L4 ${ENV.h} Q0 ${ENV.h} 0 ${ENV.h - 3}Z`} fill={`url(#${gid("bottom")})`} filter={`url(#${gid("fold")})`} />
                  <rect width={ENV.w} height={ENV.h} fill={`url(#${gid("grain")})`} opacity=".5" style={{ mixBlendMode: "multiply", clipPath: "polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)" }} />
                </svg>

                {/* the closed flap's shadow on the envelope */}
                <motion.svg className="absolute" style={{ left: ENV.x, top: ENV.y, zIndex: 4, opacity: flapShadow, overflow: "visible" }} width={ENV.w} height={110} aria-hidden="true">
                  <path d={`M0 0 L${ENV.w / 2} 100 L${ENV.w} 0Z`} fill="rgba(40,30,20,.22)" style={{ filter: "blur(4px)" }} />
                </motion.svg>

                {/* the seal */}
                <motion.div className="absolute grid place-items-center" style={{ left: ENV.x + ENV.w / 2 - 32, top: ENV.y + 96 - 36, width: 64, height: 64, zIndex: 6, scale: S.sealS, opacity: S.sealO }}>
                  <svg viewBox="0 0 64 64" width={64} height={64} className="absolute inset-0" aria-hidden="true" style={{ filter: "drop-shadow(0 2px 2px rgba(20,10,0,.3)) drop-shadow(0 6px 8px rgba(20,10,0,.18))" }}>
                    <defs>
                      <radialGradient id={gid("wax")} cx="38%" cy="32%" r="75%">
                        <stop offset="0" style={{ stopColor: "color-mix(in srgb, var(--a) 70%, #fff)" }} />
                        <stop offset=".45" style={{ stopColor: "var(--a)" }} />
                        <stop offset="1" style={{ stopColor: "color-mix(in srgb, var(--a) 45%, #000)" }} />
                      </radialGradient>
                    </defs>
                    <path d={BLOB} fill={`url(#${gid("wax")})`} />
                    {/* the pressed ring, raised at one edge and sunk at the other */}
                    <circle cx={32} cy={32} r={16.5} fill="none" stroke="rgba(0,0,0,.28)" strokeWidth={2.2} transform="translate(.6 .9)" />
                    <circle cx={32} cy={32} r={16.5} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={1.4} transform="translate(-.5 -.7)" />
                    <circle cx={32} cy={32} r={15.2} style={{ fill: "color-mix(in srgb, var(--a) 88%, #000)" }} />
                    <ellipse cx={23} cy={18} rx={7} ry={3.4} fill="rgba(255,255,255,.4)" transform="rotate(-30 23 18)" style={{ filter: "blur(1.2px)" }} />
                  </svg>
                  <span className="relative" style={{ color: "color-mix(in srgb, var(--a) 60%, #000)", filter: "drop-shadow(0 -.8px 0 rgba(0,0,0,.4)) drop-shadow(0 .8px 0 rgba(255,255,255,.35))" }}>
                    <Icon name="checkmark-alt" size={17} />
                  </span>
                </motion.div>
              </motion.div>
            </div>

            {/* what is left: the live link, set at full size so its controls stay easy to hit */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center px-4 pb-3">
              <motion.div
                className="pointer-events-auto w-full max-w-[340px] rounded-[18px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_40px_-24px_rgba(40,30,20,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_40px_-24px_rgba(0,0,0,.9)]"
                style={{ y: S.linkY, opacity: S.linkO, visibility: linkVisible }}
              >
                <p className="m-0 flex items-center gap-2 text-[13px] font-medium">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className={cn("absolute inset-0 rounded-full bg-[#30d158] opacity-60", inView && "motion-safe:animate-ping")} />
                    <span className="relative h-2 w-2 rounded-full bg-[#30d158]" />
                  </span>
                  Live
                  <motion.span className="ml-auto text-[#6e6e73] tabular-nums dark:text-[#98989d]">{openedText}</motion.span>
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex h-11 min-w-0 flex-1 items-center rounded-xl bg-[#f5f5f7] px-3 text-[14px] dark:bg-black">
                    <span className="truncate">{linkText}</span>
                  </span>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={copy}
                    className={cn(
                      "inline-flex h-11 min-w-[88px] shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 text-[14px] font-medium outline-hidden transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[color:var(--a)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1c1c1e]",
                      copied ? "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-black" : "bg-[var(--a)] text-white dark:text-black",
                    )}
                  >
                    {copied ? <Icon name="checkmark-alt" size={13} /> : <Icon name="doc-on-doc" size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </motion.button>
                </div>
                <span role="status" className="sr-only">
                  {copied ? "Link copied" : ""}
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* the steps: the same story in words */}
        <ol className="m-0 flex max-w-[560px] list-none flex-col gap-1 p-0 @4xl:col-start-1 @4xl:row-start-2">
          {list.map((s, i) => {
            const on = i === cur;
            const done = i < cur;
            return (
              <li key={`${i}-${s.title}`} className="relative">
                {i < count - 1 && (
                  <span aria-hidden="true" className={cn("absolute top-[52px] -bottom-3 left-[27.5px] w-px transition-colors duration-500", done ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#d2d2d7] dark:bg-[#3a3a3c]")} />
                )}
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={on ? "step" : undefined}
                  className={cn(
                    "relative grid min-h-11 w-full grid-cols-[2rem_1fr] gap-x-4 rounded-[18px] px-3 py-4 text-left outline-hidden transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[color:var(--a)]",
                    on ? "bg-[#f5f5f7] dark:bg-[#1c1c1e]" : "hover:bg-black/[.035] dark:hover:bg-white/[.06]",
                  )}
                >
                  <span
                    className={cn(
                      "row-span-2 grid h-8 w-8 place-items-center rounded-full text-[14px] font-semibold tabular-nums transition-colors duration-500",
                      on
                        ? "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-black"
                        : done
                          ? "bg-[#e8e8ed] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
                          : "bg-white text-[#6e6e73] shadow-[inset_0_0_0_1.5px_#d2d2d7] dark:bg-black dark:text-[#98989d] dark:shadow-[inset_0_0_0_1.5px_#3a3a3c]",
                    )}
                  >
                    {done ? <Icon name="checkmark-alt" size={16} /> : i + 1}
                  </span>
                  <span className="self-center text-[18px] leading-[1.25] font-semibold tracking-[-0.015em]">{s.title}</span>
                  <span className="col-start-2 pt-1 text-[15px] leading-[1.5] text-[#6e6e73] dark:text-[#98989d]">{s.text}</span>
                  {on && auto && (
                    <span aria-hidden="true" className="absolute inset-x-4 bottom-2 h-[2px] overflow-hidden rounded-full bg-black/[.07] dark:bg-white/[.1]">
                      <motion.span className="block h-full origin-left rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ scaleX: S.progress }} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
