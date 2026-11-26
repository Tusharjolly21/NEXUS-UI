"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flag } from "@/components/pricing/flag";
import { MEMBERS as ALL_MEMBERS } from "@/components/pricing/members";

/** The ink-line faces in /public/avatars (face-0.svg to face-5.svg), each on its own pastel. */
const FACE_BACKGROUNDS = ["#e7dcff", "#cdeee0", "#ffe1d6", "#fff0c9", "#d6ebff", "#ffdcec"];
const SHOWN = 4;

type Member = (typeof ALL_MEMBERS)[number];

export function Face({ m, i, size }: { m: Member; i: number; size: number }) {
  const face = (m.face ?? i) % FACE_BACKGROUNDS.length;
  return (
    <span
      className="block shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size, background: FACE_BACKGROUNDS[face] }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG, no optimisation needed */}
      <img
        src={`/avatars/face-${face}.svg`}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        draggable={false}
        className="size-full origin-[50%_32%] scale-[1.18] select-none object-cover"
      />
    </span>
  );
}

/**
 * Who has already taken All-Access, under the buy buttons: up to four hand-drawn faces (ink-line Notionists,
 * CC0, on pastel discs), each wearing its country's flag as a small round badge, and one line naming the newest
 * buyer, "Joined by Miao Deng and 3 others for life". Real buyers only, no photos and no made-up count; nothing
 * shows until there is one.
 *
 * "3 others" (and the faces) open the full list above: every member, newest first, with name, flag and country.
 * A pointer opens it on hover; a tap, Enter or Space toggles it, and Escape or a press anywhere else closes it.
 * It rises in with a small spring; with reduced motion it only fades.
 */
export function MemberStack({ className, plan = "all-access" }: { className?: string; plan?: "all-access" | "pro" | "all" }) {
  // each plan shows its own people; the All-Access line says "for life", the Pro one does not
  const MEMBERS = plan === "all" ? ALL_MEMBERS : ALL_MEMBERS.filter((m) => (m.plan ?? "all-access") === plan);
  const reduced = !!useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const card = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();

  // The list is centred over the line. On a narrow screen that can push it past the edge of the page, so it is
  // measured as it opens and slid back in.
  const [nudge, setNudge] = React.useState(0);
  // It also opens below the line instead when there is no room above, such as under the floating header.
  const [below, setBelow] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = card.current;
    if (!open || !el) return;
    const edge = 12;
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    setNudge(r.left < edge ? edge - r.left : r.right > vw - edge ? vw - edge - r.right : 0);
    if (!below && r.top < 88) setBelow(true);
  }, [open, below]);

  React.useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  if (MEMBERS.length === 0) return null;
  const newest = MEMBERS[0];
  const others = MEMBERS.length - 1;
  const canOpen = MEMBERS.length > 1;

  // hover opens for a mouse or pen; touch relies on the tap
  const hover = canOpen
    ? {
        onPointerEnter: (e: React.PointerEvent) => {
          if (e.pointerType !== "touch") {
            setNudge(0);
            setBelow(false);
            setOpen(true);
          }
        },
        onPointerLeave: (e: React.PointerEvent) => {
          if (e.pointerType !== "touch") setOpen(false);
        },
      }
    : {};
  // A mouse has already opened the list by hovering, so its click keeps it open; a tap or the keyboard toggles it.
  const press = (e: React.MouseEvent) => {
    const type = (e.nativeEvent as PointerEvent).pointerType;
    setNudge(0);
    setBelow(false);
    if (type === "mouse" || type === "pen") setOpen(true);
    else setOpen((o) => !o);
  };

  return (
    <div ref={root} className={cn("relative flex items-center justify-center gap-3", className)} {...hover}>
      <span
        aria-hidden
        className={cn("flex shrink-0", canOpen && "cursor-pointer")}
        onClick={canOpen ? press : undefined}
      >
        {MEMBERS.slice(0, SHOWN).map((m, i) => (
          <span key={m.name} className={cn("relative", i > 0 && "-ml-2")} style={{ zIndex: SHOWN - i }}>
            <span className="block rounded-full ring-2 ring-card">
              <Face m={m} i={i} size={34} />
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 block size-[15px] overflow-hidden rounded-full ring-2 ring-card">
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG, no optimisation needed */}
              <img src={`/flags/${m.code}.svg`} alt="" width={15} height={15} className="size-full object-cover" />
              {/* a hairline so a mostly white flag (Japan) still reads as a badge against the white ring */}
              <span className="absolute inset-0 rounded-full shadow-[inset_0_0_0_0.5px_rgba(0,0,0,.25)]" />
            </span>
          </span>
        ))}
      </span>

      <p className="min-w-0 text-[13px] leading-snug text-muted-foreground">
        Joined by{" "}
        <span className="font-semibold text-foreground">
          {newest.name}
          <span className="sr-only"> from {newest.country}</span>
        </span>
        {canOpen ? (
          <>
            {" "}
            and{" "}
            <button
              type="button"
              aria-expanded={open}
              aria-controls={listId}
              onClick={press}
              className="rounded-sm font-semibold text-foreground underline decoration-dashed decoration-1 underline-offset-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {others === 1 ? "1 other" : `${others} others`}
            </button>
          </>
        ) : null}
        {plan === "all-access" ? " for life" : null}
      </p>

      <AnimatePresence>
        {open ? (
          <div
            ref={card}
            id={listId}
            className={cn("absolute left-1/2 z-40", below ? "top-full pt-2.5" : "bottom-full pb-2.5")}
            style={{ transform: `translateX(calc(-50% + ${nudge}px))` }}
          >
            <motion.div
              className="w-[min(300px,calc(100vw-24px))] rounded-2xl bg-foreground p-1.5 text-background shadow-[0_24px_50px_-20px_rgba(0,0,0,.55)]"
              style={{ transformOrigin: below ? "top" : "bottom" }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: below ? -10 : 10, scale: 0.96 }}
              animate={
                reduced
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 28 } }
              }
              exit={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: below ? -6 : 6, scale: 0.98, transition: { duration: 0.12 } }
              }
            >
              <p className="px-2.5 pb-1 pt-2 text-[11.5px] text-background/60">{plan === "all" ? "Members, newest first" : plan === "pro" ? "Pro members, newest first" : "All-Access members, newest first"}</p>
              <ul>
                {MEMBERS.map((m, i) => (
                  <li key={m.name} className="flex items-center gap-2.5 rounded-xl px-2.5 py-[7px]">
                    <Face m={m} i={i} size={26} />
                    <span className="min-w-0 truncate text-[13px] font-semibold">{m.name}</span>
                    {plan === "all" ? (
                      <span className="shrink-0 rounded-full bg-background/12 px-1.5 py-px text-[10.5px] font-medium text-background/70">
                        {m.plan === "pro" ? "Pro" : "All-Access"}
                      </span>
                    ) : null}
                    <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[12px] text-background/70">
                      <Flag code={m.code} country={m.country} />
                      {m.country}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
