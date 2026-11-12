"use client";

import * as React from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flag } from "@/components/pricing/flag";
import { MEMBERS } from "@/components/pricing/members";

/** The ink-line faces in /public/avatars (face-0.svg to face-4.svg), each on its own pastel. */
const FACE_BACKGROUNDS = ["#e7dcff", "#cdeee0", "#ffe1d6", "#fff0c9", "#d6ebff"];

/**
 * A few overlapping hand-drawn avatars (ink-line faces from the CC0 Notionists set, on pastel discs) and one quiet line under a buy button: who has already taken All-Access.
 * It names real buyers only (no photos, no made-up count) and shows nothing until there is one.
 *
 * Point at an avatar and a small card pops up above it with the name and country, tilting a little toward
 * the side of the avatar the pointer is on. On a touch screen a tap opens it and a tap anywhere else closes it.
 * With reduced motion it only fades. The avatars are decoration: the line beside them carries the names and
 * the flags carry the countries, so nothing is lost to someone who can't hover.
 */
export function MemberStack({ className }: { className?: string }) {
  const reduced = !!useReducedMotion();
  const [open, setOpen] = React.useState<number | null>(null);
  const root = React.useRef<HTMLSpanElement>(null);

  // where the pointer is across the avatar, from its left edge to its right: drives the tilt
  const pointerX = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 120, damping: 16 });
  const rotate = useTransform(x, [-20, 20], [-9, 9]);
  const shift = useTransform(x, [-20, 20], [-10, 10]);

  // The card is centred over its avatar. On a narrow screen that can push it past the edge of the page, so it is
  // measured as it opens and slid back in, keeping a little room for the tilt.
  const card = React.useRef<HTMLSpanElement>(null);
  const [nudge, setNudge] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = card.current;
    if (open === null || !el) return;
    const edge = 14;
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    setNudge(r.left < edge ? edge - r.left : r.right > vw - edge ? vw - edge - r.right : 0);
  }, [open]);

  // a tap anywhere else closes a card that a tap opened
  React.useEffect(() => {
    if (open === null) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (MEMBERS.length === 0) return null;
  const shown = MEMBERS.slice(0, 4);
  const rest = MEMBERS.length - 2;
  // each name carries its flag; with more than two we name the newest two and count the rest
  const tag = (m: (typeof MEMBERS)[number]) => (
    <span className="whitespace-nowrap">
      {m.name} <Flag code={m.code} country={m.country} className="ml-0.5 align-[-1px]" />
    </span>
  );
  const names =
    MEMBERS.length === 1 ? (
      tag(MEMBERS[0])
    ) : MEMBERS.length === 2 ? (
      <>
        {tag(MEMBERS[0])} and {tag(MEMBERS[1])}
      </>
    ) : (
      <>
        {tag(MEMBERS[0])}, {tag(MEMBERS[1])} and {rest} more
      </>
    );

  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    pointerX.set(e.clientX - r.left - r.width / 2);
  };

  return (
    <div className={cn("flex items-center justify-center gap-2.5", className)}>
      <span ref={root} aria-hidden className="flex shrink-0 -space-x-2">
        {shown.map((m, i) => {
          const face = (m.face ?? i) % FACE_BACKGROUNDS.length;
          const isOpen = open === i;
          return (
            <span
              key={m.name}
              className="group relative cursor-default"
              style={{ zIndex: isOpen ? 40 : shown.length - i }}
              onPointerEnter={(e) => {
                if (e.pointerType === "touch") return;
                pointerX.jump(0);
                setNudge(0);
                setOpen(i);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== "touch") setOpen((o) => (o === i ? null : o));
              }}
              onPointerMove={(e) => {
                if (e.pointerType !== "touch") tilt(e);
              }}
              onPointerDown={(e) => {
                if (e.pointerType !== "touch") return;
                setNudge(0);
                setOpen((o) => (o === i ? null : i));
              }}
            >
              <AnimatePresence>
                {isOpen ? (
                  <span
                    ref={card}
                    className="pointer-events-none absolute bottom-full left-1/2 mb-2"
                    style={{ transform: `translateX(calc(-50% + ${nudge}px))` }}
                  >
                    <motion.span
                      className="block origin-bottom whitespace-nowrap rounded-xl bg-foreground px-3 py-2 text-center shadow-[0_10px_28px_-10px_rgba(0,0,0,.5)]"
                      style={reduced ? undefined : { x: shift, rotate }}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.7 }}
                      animate={
                        reduced
                          ? { opacity: 1 }
                          : { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 16 } }
                      }
                      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.85, transition: { duration: 0.12 } }}
                    >
                      <span className="block text-[13px] font-semibold leading-tight tracking-[-0.1px] text-background">{m.name}</span>
                      <span className="mt-1.5 flex items-center justify-center gap-1.5 text-[12px] leading-none text-background/70">
                        <Flag code={m.code} country={m.country} />
                        {m.country}
                      </span>
                    </motion.span>
                  </span>
                ) : null}
              </AnimatePresence>
              <span
                className="block size-9 overflow-hidden rounded-full ring-2 ring-card transition-transform duration-200 ease-out group-hover:scale-110"
                style={{ background: FACE_BACKGROUNDS[face] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG, no optimisation needed */}
                <img
                  src={`/avatars/face-${face}.svg`}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  draggable={false}
                  className="size-full origin-[50%_32%] scale-[1.18] select-none object-cover"
                />
              </span>
            </span>
          );
        })}
      </span>
      <p className="min-w-0 text-[13px] leading-snug text-muted-foreground">
        Joined by <span className="font-medium text-foreground">{names}</span>
      </p>
    </div>
  );
}
