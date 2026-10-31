"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { audioAwake, playDef, useAutoplaySoundAllowed } from "@/lib/ui-sounds";
import { statusMorphSounds, type StatusMorphSound } from "./status-morph-sound";

/**
 * Status Morph: an iPhone-style status bar (signal, Wi-Fi, battery) that takes itself apart to connect.
 * The battery drains and its outline rounds into a ring around the Wi-Fi, the signal bars sink into dots
 * that ride the ring's gap while it spins and the Wi-Fi arcs ripple outward, then the ring closes over the
 * dots and the arcs fill in. Tap again and it all folds back into the bar, this time charging.
 */

type Phase = "bar" | "search" | "settle" | "connected";

// Geometry in viewBox units (132 x 60). The ring and the Wi-Fi share the centre (CX, CY).
const CX = 66;
const CY = 30;
const R = 18;
const C = 2 * Math.PI * R;
const GAP = C * 0.3;
const BASE = 37;
const WIFI_RADII = [5, 10, 15];
const ARC_ANGLE = (46 * Math.PI) / 180;
const BAR_W = 3.6;
const BAR_HEIGHTS = [5, 8, 11, 14];
const BAR_X = (i: number) => 26.8 + i * 6;
const DOT = 3.4;
const DOT_ANGLES = [126, 102, 78, 54].map((a) => (a * Math.PI) / 180);
// The dots swing below the ring (clear of its stroke) on their way between the bar and the gap.
const DIP_Y = 51;
const BATTERY = { attrX: 84, attrY: 23, width: 28, height: 14, rx: 4.2 };
const FILL = { x: 86, y: 25, width: 24, height: 10 };
const LEVEL = 0.8;
// The bar is wider on the battery side, so it sits a little left to look centred; the ring sits dead centre.
const BAR_SHIFT = -5.15;

const arc = (r: number) => `M ${CX - r * Math.sin(ARC_ANGLE)} ${BASE - r * Math.cos(ARC_ANGLE)} A ${r} ${r} 0 0 1 ${CX + r * Math.sin(ARC_ANGLE)} ${BASE - r * Math.cos(ARC_ANGLE)}`;
const BOLT = "M99.4 24.4 L94.4 31 H97.8 L96.6 35.6 L101.6 29 H98.2 Z";

const THEMES = {
  light: { ink: "#1d1d1f", card: "#ffffff", muted: "#86868b", ring: "0 0 0 1px rgba(0,0,0,.05), 0 18px 40px -24px rgba(0,0,0,.35)" },
  dark: { ink: "#f5f5f7", card: "#1c1c1e", muted: "#98989d", ring: "0 0 0 1px rgba(255,255,255,.08), 0 18px 40px -24px rgba(0,0,0,.8)" },
} as const;
const GREEN = "#30d158";
const AMBER = "#ff9f0a";
const RED = "#ff3b30";

const pace = (speed = 1) => Math.min(4, Math.max(0.25, Number.isFinite(speed) ? speed : 1));

export function StatusMorph({
  autoplay = false,
  theme = "light",
  size = 260,
  speed = 1,
  network = "Nexus",
  enableSound = true,
  volume = 0.8,
}: {
  /** Connects and disconnects by itself until the visitor taps it. Pauses while off screen. */
  autoplay?: boolean;
  /** Light (graphite on white) or dark (white on graphite). */
  theme?: "light" | "dark";
  /** Width of the drawing in pixels. Kept between 160 and 480. */
  size?: number;
  /** How fast it plays: 1 is the designed pace, 2 is twice as fast. Kept between 0.25 and 4. */
  speed?: number;
  /** The network name shown under the icons while joining and once connected. */
  network?: string;
  /** Plays its own soft, glassy sounds, timed to the animation. They follow the site-wide sound switch. */
  enableSound?: boolean;
  /** Loudness of the sounds, 0 to 1. */
  volume?: number;
}) {
  const p = pace(speed);
  const t = (s: number) => s / p;
  const spring = (stiffness: number, damping: number, delay = 0) => ({ type: "spring" as const, stiffness: stiffness * p * p, damping: damping * p, delay: t(delay) });
  const colors = THEMES[theme] ?? THEMES.light;
  const width = Math.min(480, Math.max(160, Number.isFinite(size) ? size : 260));

  const reduce = useReducedMotion();
  const root = useRef<HTMLButtonElement>(null);
  const inView = useInView(root, { amount: 0.3 });
  const autoSoundOk = useAutoplaySoundAllowed();
  const soundCfg = useRef({ enableSound, volume, p, autoSoundOk });
  const touched = useRef(false);

  const [phase, setPhase] = useState<Phase>("bar");
  // After the first round trip the battery comes back charging (green, with a bolt).
  const [charging, setCharging] = useState(false);

  const spinner = useRef<SVGGElement>(null);
  const rot = useMotionValue(0);
  const gap = useMotionValue(0);
  const dash = useMotionValue(`${C / 2} 0 ${C / 2} 0`);

  useEffect(() => {
    soundCfg.current = { enableSound, volume, p, autoSoundOk };
  }, [enableSound, volume, p, autoSoundOk]);

  // Rotation and the ring's gap are driven by hand: the rotation has to spin forever, then coast to rest exactly
  // where the dots line up, and the dash pattern is written out from the gap so it always centres on the bottom.
  useEffect(() => {
    const unRot = rot.on("change", (v) => spinner.current?.setAttribute("transform", `rotate(${v} ${CX} ${CY})`));
    const unGap = gap.on("change", (g) => dash.set(`${(C - g) / 2} ${g} ${(C - g) / 2} 0`));
    return () => {
      unRot();
      unGap();
    };
  }, [rot, gap, dash]);

  // Autoplay only makes sound where demos may (see AutoplaySound) and once the visitor has used the page.
  const sound = (name: StatusMorphSound) => {
    const c = soundCfg.current;
    if (!c.enableSound) return;
    if (!touched.current && !(c.autoSoundOk && audioAwake())) return;
    playDef(`status-morph:${name}`, statusMorphSounds(c.p)[name], Math.min(1, Math.max(0, c.volume)));
  };

  // Imperative half of each phase: the spin, the gap, and the hand-off to the next phase.
  useEffect(() => {
    let live: ReturnType<typeof animate> | null = null;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const cleanups: (() => void)[] = [];
    const after = (s: number, fn: () => void) => timers.push(setTimeout(() => !cancelled && fn(), t(s) * 1000));

    if (phase === "bar") {
      rot.set(0);
      gap.set(0);
    }

    if (phase === "search") {
      // A faint tick climbs with each ripple of the Wi-Fi arcs, landing as each arc peaks.
      let ripple: ReturnType<typeof setInterval> | undefined;
      if (!reduce) {
        after(1.3, () => {
          sound("ripple");
          ripple = setInterval(() => sound("ripple"), t(1.05) * 1000);
        });
        timers.push(setTimeout(() => clearInterval(ripple), t(3.2) * 1000));
      }
      cleanups.push(() => clearInterval(ripple));
      after(0.8, () => {
        live = animate(gap, GAP, { duration: t(0.35), ease: "easeOut" });
        if (reduce) return;
        // Ease into the spin for one turn, then hold a steady pace.
        live = animate(rot, 360, { duration: t(1.1), ease: "easeIn" });
        live.then(() => {
          if (cancelled) return;
          rot.set(0);
          live = animate(rot, 360, { duration: t(0.85), ease: "linear", repeat: Infinity });
        });
      });
      after(3.2, () => setPhase("settle"));
    }

    if (phase === "settle") {
      // The search effect's cleanup has just stopped the spin; the value keeps its velocity for the coast.
      const at = rot.get();
      // Coast forward to the next full turn (at least a third of one) so the gap ends up at the bottom.
      const target = Math.ceil((at + 120) / 360) * 360;
      if (reduce || at === 0) {
        rot.set(target % 360);
        after(0.1, () => setPhase("connected"));
      } else {
        live = animate(rot, target, { type: "spring", stiffness: 40 * p * p, damping: 11 * p, restDelta: 0.5 });
        live.then(() => {
          if (cancelled) return;
          rot.set(0);
          setPhase("connected");
        });
      }
    }

    if (phase === "connected") {
      live = animate(gap, 0, { duration: t(0.32), ease: [0.4, 0, 0.2, 1] });
      sound("connected");
    }

    return () => {
      cancelled = true;
      live?.stop();
      timers.forEach(clearTimeout);
      cleanups.forEach((f) => f());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduce, p]);

  const go = () => {
    if (phase === "bar") {
      sound("connect");
      setPhase("search");
    } else {
      sound(phase === "connected" ? "disconnect" : "cancel");
      setCharging(true);
      setPhase("bar");
    }
  };

  // Autoplay: wait on the bar, connect, hold, let go. Only while on screen and until the first tap.
  useEffect(() => {
    if (!autoplay || touched.current || !inView) return;
    if (phase !== "bar" && phase !== "connected") return;
    const id = setTimeout(() => go(), t(phase === "bar" ? 1.6 : 2.4) * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, phase, p]);

  const ring = phase !== "bar";
  const closed = phase === "connected";
  const searching = phase === "search" || phase === "settle";

  const label = phase === "bar" ? "Wi-Fi" : closed ? `Connected to ${network}` : `Joining ${network}…`;

  return (
    <motion.button
      ref={root}
      type="button"
      aria-label={phase === "bar" ? `Join ${network}` : `Disconnect from ${network}`}
      onPointerDown={() => (touched.current = true)}
      onClick={() => {
        touched.current = true;
        go();
      }}
      whileTap={{ scale: 0.97 }}
      transition={spring(500, 30)}
      style={{ background: colors.card, boxShadow: colors.ring, color: colors.ink, borderRadius: Math.round(width * 0.12) }}
      className="flex select-none flex-col items-center gap-1 px-6 pb-5 pt-4 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
    >
      <svg width={width} height={(width * 60) / 132} viewBox="0 0 132 60" fill="none" aria-hidden="true">
        <motion.g initial={false} animate={{ x: ring ? 0 : BAR_SHIFT }} transition={spring(170, 22, ring ? 0.35 : 0.1)}>
          {/* Battery fill: drains (going amber, then red) before the outline lets go, charges back green afterwards. */}
          <motion.rect
            x={FILL.x}
            y={FILL.y}
            height={FILL.height}
            rx={2.4}
            initial={false}
            animate={
              ring
                ? { width: 0, fill: [charging ? GREEN : colors.ink, AMBER, RED], opacity: [1, 1, 0] }
                : { width: FILL.width * LEVEL, fill: charging ? GREEN : colors.ink, opacity: 1 }
            }
            transition={ring ? { duration: t(0.4), ease: "easeIn", opacity: { duration: t(0.45), times: [0, 0.8, 1] } } : { duration: t(0.6), delay: t(0.55), ease: "easeOut", fill: { duration: 0, delay: t(0.55) } }}
          />
          <AnimatePresence>
            {charging && !ring && (
              <motion.path
                key="bolt"
                d={BOLT}
                fill={colors.card}
                stroke={colors.card}
                strokeWidth={0.9}
                strokeLinejoin="round"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: spring(520, 16, 1.0) }}
                exit={{ scale: 0, opacity: 0, transition: { duration: t(0.12) } }}
              />
            )}
          </AnimatePresence>
          <motion.rect
            x={113.4}
            y={27.6}
            width={2}
            height={4.8}
            rx={1}
            fill={colors.ink}
            initial={false}
            animate={{ opacity: ring ? 0 : 0.4, attrX: ring ? 110 : 113.4 }}
            transition={{ duration: t(0.2), delay: t(ring ? 0.2 : 0.75) }}
          />

          <g ref={spinner}>
            {/* The battery outline: a rounded rectangle that rounds itself into the ring, then opens a gap and spins. */}
            <motion.rect
              stroke={colors.ink}
              strokeLinecap="round"
              style={{ strokeDasharray: dash }}
              initial={false}
              animate={
                ring
                  ? { attrX: CX - R, attrY: CY - R, width: R * 2, height: R * 2, rx: R, strokeWidth: 3.2, strokeOpacity: 1 }
                  : { ...BATTERY, strokeWidth: 1.6, strokeOpacity: 0.4 }
              }
              transition={ring ? spring(170, 20, 0.35) : spring(190, 22, 0.15)}
            />
            {/* A pulse of the ring as it closes. */}
            <motion.circle
              cx={CX}
              cy={CY}
              r={R}
              stroke={colors.ink}
              initial={false}
              animate={closed ? { opacity: [0, 0.35, 0], strokeWidth: [3.2, 3.2, 12] } : { opacity: 0, strokeWidth: 3.2 }}
              transition={closed ? { duration: t(0.7), delay: t(0.3), ease: "easeOut" } : { duration: 0 }}
            />

            {/* Signal bars: they sink into dots, ride the ring's gap, and are swallowed when it closes. */}
            {BAR_HEIGHTS.map((h, i) => {
              const dx = CX + R * Math.cos(DOT_ANGLES[i]) - DOT / 2;
              const dy = CY + R * Math.sin(DOT_ANGLES[i]) - DOT / 2;
              const bx = BAR_X(i);
              const mid = (bx + dx) / 2;
              // Shrink to a dot where the bar stands, then swing under the ring and up into its gap (and the reverse).
              const out = { attrX: [bx, bx, mid, dx], attrY: [BASE - h, BASE - DOT, DIP_Y, dy], width: [BAR_W, DOT, DOT, DOT], height: [h, DOT, DOT, DOT], rx: [1.2, DOT / 2, DOT / 2, DOT / 2] };
              const back = { attrX: [dx, mid, bx, bx], attrY: [dy, DIP_Y, BASE - DOT, BASE - h], width: [DOT, DOT, DOT, BAR_W], height: [DOT, DOT, DOT, h], rx: [DOT / 2, DOT / 2, DOT / 2, 1.2] };
              return (
                <motion.rect
                  key={i}
                  fill={colors.ink}
                  initial={false}
                  animate={ring ? { ...out, scale: closed ? 0 : 1 } : { ...back, scale: 1 }}
                  transition={
                    closed
                      ? { scale: { duration: t(0.22), delay: t(0.05 + i * 0.04) } }
                      : ring
                        ? { duration: t(0.8), delay: t(0.2 + (3 - i) * 0.07), times: [0, 0.25, 0.65, 1], ease: "easeInOut" }
                        : { duration: t(0.75), delay: t(0.1 + i * 0.06), times: [0, 0.4, 0.75, 1], ease: "easeInOut", scale: { duration: t(0.2), delay: t(0.05) } }
                  }
                />
              );
            })}
            {/* While searching the dots breathe one after another, like a loading indicator. */}
            {searching && !reduce && (
              <g>
                {DOT_ANGLES.map((a, i) => (
                  <motion.circle
                    key={i}
                    cx={CX + R * Math.cos(a)}
                    cy={CY + R * Math.sin(a)}
                    r={DOT / 2 + 0.9}
                    fill={colors.ink}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.18, 0] }}
                    transition={{ duration: t(0.9), delay: t(1.1 + i * 0.12), repeat: Infinity, repeatDelay: t(0.25) }}
                  />
                ))}
              </g>
            )}
          </g>

          {/* Wi-Fi: steady on the bar, rippling outward while searching, filling in arc by arc once connected. */}
          <motion.g
            initial={false}
            animate={closed ? { scale: [1, 1.14, 1] } : { scale: 1 }}
            transition={closed ? { duration: t(0.5), delay: t(0.3), times: [0, 0.4, 1], ease: "easeOut" } : { duration: t(0.2) }}
          >
            <circle cx={CX} cy={BASE} r={2.3} fill={colors.ink} />
            {WIFI_RADII.map((r, i) => (
              <motion.path
                key={r}
                d={arc(r)}
                stroke={colors.ink}
                strokeWidth={3.2}
                strokeLinecap="round"
                initial={false}
                animate={
                  searching && !reduce
                    ? { opacity: [0.22, 1, 0.22] }
                    : closed
                      ? { opacity: [0.22, 1] }
                      : { opacity: 1 }
                }
                transition={
                  searching && !reduce
                    ? { duration: t(1.05), delay: t(0.8 + i * 0.17), repeat: Infinity, ease: "easeInOut" }
                    : closed
                      ? { duration: t(0.2), delay: t(0.32 + i * 0.1) }
                      : { duration: t(0.25) }
                }
              />
            ))}
          </motion.g>
        </motion.g>
      </svg>

      <span className="relative h-5 w-full overflow-hidden text-center text-[13px] font-medium" style={{ color: colors.muted }} aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            className="absolute inset-x-0"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={spring(500, 32)}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
