"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { NexusMark } from "@/components/brand/nexus-mark";
import { RAINBOW_HUES } from "@/components/site/rainbow-word";

/**
 * People who bought All-Access (the lifetime plan), shown by name under the plans with their
 * permission, each as a membership card in the site's own look (a white tile) with a thin rainbow foil, the hero's
 * colours, that catches the light. There is no
 * count on purpose: the names are the proof, and the fan simply gets more cards. Newest first. Keep it
 * to real buyers who said yes to being shown.
 *
 * Motion: the cards are dealt into a fan once, as the section scrolls in, and a glint runs across the
 * foil as each one lands. Under the pointer a card tilts toward it, lifts out of the fan and the foil
 * follows. With reduced motion they sit still in the fan.
 */
const MEMBERS: { name: string; country: string }[] = [
  { name: "GoCellar GoWinery", country: "Australia" },
  { name: "Jon Massey", country: "United Kingdom" },
];

/** Where each card rests in the fan, by position. */
const FAN = [
  { rotate: -5, x: 0, y: 8 },
  { rotate: 4, x: 0, y: 0 },
  { rotate: -2, x: 0, y: 12 },
];

function useFoil(reduced: boolean) {
  // where the light is on the card, 0..1 each way; it starts off the top-left corner
  const px = useMotionValue(-0.2);
  const py = useMotionValue(-0.2);
  const sx = useSpring(px, { stiffness: 180, damping: 22 });
  const sy = useSpring(py, { stiffness: 180, damping: 22 });
  // the tilt follows the pointer only, and rests flat (0.5) the rest of the time
  const tx = useMotionValue(0.5);
  const ty = useMotionValue(0.5);
  const stx = useSpring(tx, { stiffness: 180, damping: 22 });
  const sty = useSpring(ty, { stiffness: 180, damping: 22 });
  const rotateX = useTransform(sty, [0, 1], reduced ? [0, 0] : [9, -9]);
  const rotateY = useTransform(stx, [0, 1], reduced ? [0, 0] : [-11, 11]);
  return { px, py, sx, sy, tx, ty, rotateX, rotateY };
}

const SPECTRUM = RAINBOW_HUES.join(", ");

function Foil({ sx, sy }: { sx: MotionValue<number>; sy: MotionValue<number> }) {
  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);
  const angle = useTransform(sx, (v) => `${v * 140 + 200}deg`);
  const foil = useMotionTemplate`conic-gradient(from ${angle} at ${gx} ${gy}, ${SPECTRUM}, ${RAINBOW_HUES[0]})`;
  // the foil only shows near the light, so the card stays a clean white tile everywhere else
  const mask = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, #000 0%, rgba(0,0,0,.35) 30%, transparent 62%)`;
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.22] dark:opacity-[0.3]"
      style={{ backgroundImage: foil, maskImage: mask, WebkitMaskImage: mask }}
    />
  );
}

function MemberCard({ m, i, inView }: { m: (typeof MEMBERS)[number]; i: number; inView: boolean }) {
  const reduced = !!useReducedMotion();
  const { px, py, sx, sy, tx, ty, rotateX, rotateY } = useFoil(reduced);
  const [hover, setHover] = React.useState(false);
  const rest = FAN[i % FAN.length];

  // the glint runs across each card once as it lands in the fan
  React.useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setTimeout(() => {
      px.set(-0.2);
      py.set(0.1);
      animate(px, 1.2, { duration: 1.1, ease: [0.3, 0, 0.2, 1] });
      animate(py, 0.9, { duration: 1.1, ease: [0.3, 0, 0.2, 1] });
    }, 450 + i * 160);
    return () => window.clearTimeout(t);
  }, [inView, reduced, i, px, py]);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    px.set(x);
    py.set(y);
    tx.set(x);
    ty.set(y);
  };

  return (
    <motion.li
      className="relative [perspective:900px]"
      style={{ zIndex: hover ? 10 : MEMBERS.length - i }}
      initial={reduced ? false : { opacity: 0, y: 70, rotate: 0, x: 0 }}
      animate={inView || reduced ? { opacity: 1, y: hover ? rest.y - 10 : rest.y, rotate: hover ? 0 : rest.rotate, x: rest.x } : undefined}
      transition={{ type: "spring", stiffness: 170, damping: 19, delay: hover ? 0 : 0.15 + i * 0.16 }}
    >
      <motion.figure
        onPointerEnter={() => setHover(true)}
        onPointerMove={onMove}
        onPointerLeave={() => {
          setHover(false);
          // back to where the landing glint left it, just off the corner
          px.set(1.2);
          py.set(0.9);
          tx.set(0.5);
          ty.set(0.5);
        }}
        className="relative isolate flex aspect-[1.586] w-[300px] flex-col justify-between overflow-hidden rounded-[22px] bg-card p-5 text-foreground shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.09),0_24px_48px_-26px_rgba(0,0,0,.9)] sm:w-[340px] sm:p-6"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={{ scale: hover ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <Foil sx={sx} sy={sy} />
        {/* a big faint infinity, pressed into the card: the plan never runs out */}
        <span aria-hidden className="pointer-events-none absolute -bottom-10 -right-2 select-none text-[150px] font-light leading-none text-foreground/[0.045]">
          &infin;
        </span>

        <div className="relative flex items-center justify-between">
          <span className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.2px]">
            <NexusMark size={22} />
            Nexus UI
          </span>
          <span className="rounded-full bg-action/10 px-3 py-1 text-[12px] font-semibold text-link">Lifetime</span>
        </div>

        <figcaption className="relative">
          <span className="block text-[13px] text-muted-foreground">All-Access member</span>
          <span className="mt-1 block truncate text-[21px] font-semibold leading-tight tracking-[-0.4px] sm:text-[23px]">{m.name}</span>
          <span className="mt-1 block text-[14px] text-muted-foreground">{m.country}</span>
        </figcaption>
      </motion.figure>
    </motion.li>
  );
}

export function MembersRow() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (MEMBERS.length === 0) return null;
  return (
    <section
      aria-labelledby="members"
      className="mx-auto mt-20 flex max-w-[1000px] flex-col items-center px-2"
    >
      <div className="text-center">
        <h2 id="members" className="pg-display text-[clamp(30px,4vw,40px)] leading-[1.05] text-foreground">
          Recently joined <span className="whitespace-nowrap">All-Access</span>
        </h2>
        <p className="mx-auto mt-3 max-w-[460px] text-[16px] leading-[1.55] text-muted-foreground">
          They paid once and get every component, block and template, including the ones we haven&apos;t made yet.
        </p>
      </div>
      <div ref={ref} className="mt-10 flex justify-center">
        <ul className="flex flex-col items-center gap-7 sm:flex-row sm:gap-0 sm:[&>li+li]:-ml-3">
          {MEMBERS.map((m, i) => (
            <MemberCard key={m.name} m={m} i={i} inView={inView} />
          ))}
        </ul>
      </div>
    </section>
  );
}
