"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COMMENTS, tone, type Comment } from "@/components/home/reddit-love";
import { RAINBOW_HUES } from "@/components/site/rainbow-word";
import { PRICES, formatPrice } from "@/lib/pricing";

/**
 * The pricing page's take on "what people say": one comment pulled out as a big quote (the one that
 * names a price), beside a fanned deck of the rest. The deck deals a new card to the top every few
 * seconds; the top card can be flung aside, or stepped with the arrows or the keyboard. Hovering or
 * focusing pauses it, it rests while off screen, and with reduced motion it only moves when asked.
 * The comments are the homepage's, quoted as written.
 */

const FEATURED = "aspiring_abundance";
const HIGHLIGHT = "$79 dollars";
/** Who leads the deck: the fullest, most specific comments first; the rest follow in the homepage's order. */
const LEAD = ["benjaminhu", "No_Speech8210", "Skaifessurk", "liuxueqi0044", "ds1008", "DarkBlade_12", "vrangnarr", "Actual-Deal-4445", "webdesign_786", "dfnslvtr", "velvetlane1", "ssmlee04"];
const DECK: Comment[] = [
  ...LEAD.map((u) => COMMENTS.find((c) => c.user === u)).filter((c): c is Comment => !!c),
  ...COMMENTS.filter((c) => c.user !== FEATURED && !LEAD.includes(c.user)),
];
const SHOWN = 3;
const STEP_MS = 4200;
const SPECTRUM = `linear-gradient(90deg, ${RAINBOW_HUES.join(", ")})`;

/** Where each layer of the fan sits: the top card square on, the two behind it tipped either way. */
const LAYERS = [
  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  { x: -18, y: 14, rotate: -5, scale: 0.95, opacity: 1 },
  { x: 20, y: 26, rotate: 6, scale: 0.9, opacity: 0.9 },
];

function Avatar({ c, size = 36 }: { c: Comment; size?: number }) {
  const [from, to] = tone(c.user);
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full font-semibold uppercase text-white"
      style={{ width: size, height: size, fontSize: size * 0.4, backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {c.user[0]}
    </span>
  );
}

function Source({ c }: { c: Comment }) {
  const insta = c.platform === "instagram";
  return insta ? (
    <Image src="/images/testimonials/instagram.png" alt="Instagram" width={22} height={22} className="size-[22px] shrink-0" />
  ) : (
    <Image src="/reddit-icon.png" alt="Reddit" width={22} height={22} className="size-[22px] shrink-0 rounded-[6px]" />
  );
}

function Byline({ c }: { c: Comment }) {
  const insta = c.platform === "instagram";
  return (
    <span className="min-w-0">
      <span className="flex items-center gap-1.5 text-[14px] font-medium text-foreground">
        <span className="truncate">{insta ? c.user : `u/${c.user}`}</span>
        {c.verified ? <Image src="/images/testimonials/verified.png" alt="Verified account" width={15} height={15} className="size-[15px] shrink-0" /> : null}
      </span>
      <span className="block text-[13px] text-muted-foreground">on {c.source}</span>
    </span>
  );
}

function DeckCard({ c }: { c: Comment }) {
  const [from, to] = tone(c.user);
  return (
    <figure className="relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] bg-card p-7 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_30px_60px_-30px_rgba(0,0,0,.4)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.09),0_30px_60px_-30px_rgba(0,0,0,.9)]">
      {/* a big soft quote mark in the commenter's own colours */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-6 top-[52%] -translate-y-1/2 select-none font-serif text-[190px] leading-[0.62] opacity-[0.14]"
        style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
      >
        &rdquo;
      </span>
      <blockquote className="relative text-[18px] leading-[1.45] tracking-[-0.25px] text-foreground sm:text-[19px]">&ldquo;{c.quote}&rdquo;</blockquote>
      <figcaption className="relative flex items-center gap-3">
        <Avatar c={c} />
        <Byline c={c} />
        <span className="ml-auto">
          <Source c={c} />
        </span>
      </figcaption>
    </figure>
  );
}

function Featured() {
  const c = COMMENTS.find((x) => x.user === FEATURED);
  if (!c) return null;
  const at = c.quote.indexOf(HIGHLIGHT);
  return (
    <figure className="flex flex-col gap-8">
      <blockquote className="pg-display text-[clamp(30px,4vw,46px)] leading-[1.08] tracking-[-0.03em] text-foreground">
        &ldquo;
        {at < 0 ? (
          c.quote
        ) : (
          <>
            {c.quote.slice(0, at)}
            <span className="whitespace-nowrap" style={{ backgroundImage: SPECTRUM, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              {HIGHLIGHT}
            </span>
            {c.quote.slice(at + HIGHLIGHT.length)}
          </>
        )}
        &rdquo;
      </blockquote>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="flex items-center gap-3">
          <Avatar c={c} size={40} />
          <Byline c={c} />
          <Source c={c} />
        </span>
        <span className="rounded-full bg-foreground/[0.06] px-3.5 py-1.5 text-[13px] text-muted-foreground">
          All-Access is {formatPrice(PRICES.allAccess)}, once. They weren&apos;t far off.
        </span>
      </figcaption>
    </figure>
  );
}

function Deck() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [top, setTop] = React.useState(0);
  const [dir, setDir] = React.useState<1 | -1>(1);
  const [paused, setPaused] = React.useState(false);
  const n = DECK.length;

  const go = React.useCallback((d: 1 | -1) => {
    setDir(d);
    setTop((t) => (t + d + n) % n);
  }, [n]);

  React.useEffect(() => {
    if (reduce || paused || !inView) return;
    const id = window.setTimeout(() => go(1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [top, reduce, paused, inView, go]);

  const shown = Array.from({ length: Math.min(SHOWN, n) }, (_, i) => DECK[(top + i) % n]);
  const fling = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) go(info.offset.x > 0 ? -1 : 1);
  };
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 26 };

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label="Comments from people using Nexus UI"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="rounded-[30px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="relative mx-auto h-[300px] w-full max-w-[440px] sm:h-[280px]">
        <AnimatePresence initial={false} custom={dir}>
          {shown
            .map((c, layer) => ({ c, layer }))
            .reverse()
            .map(({ c, layer }) => (
              <motion.div
                key={c.user}
                custom={dir}
                className="absolute inset-0"
                style={{ zIndex: SHOWN - layer, touchAction: layer === 0 ? "pan-y" : undefined }}
                variants={{
                  // AnimatePresence hands leaving cards the current direction, so these read it rather than the card's last render
                  enter: (d: 1 | -1) => (d === 1 ? { ...LAYERS[SHOWN - 1], opacity: 0, scale: 0.85 } : { x: -260, y: -10, rotate: -16, scale: 1, opacity: 0 }),
                  exit: (d: 1 | -1) =>
                    d === 1
                      ? { x: 300, y: -20, rotate: 16, opacity: 0, transition: reduce ? { duration: 0 } : { duration: 0.38, ease: [0.4, 0, 0.6, 1] } }
                      : { ...LAYERS[SHOWN - 1], opacity: 0, scale: 0.85, transition: { duration: reduce ? 0 : 0.25 } },
                }}
                initial="enter"
                animate={LAYERS[layer]}
                exit="exit"
                transition={spring}
                drag={layer === 0 && !reduce ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={layer === 0 ? fling : undefined}
                whileDrag={{ rotate: 0, cursor: "grabbing" }}
                aria-hidden={layer !== 0}
              >
                <DeckCard c={c} />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
      <div className="mt-12 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(-1)} aria-label="Previous comment" className="grid size-10 place-items-center rounded-full bg-foreground/[0.06] text-foreground/70 transition-colors hover:bg-foreground/[0.1] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <ChevronLeft className="size-[18px]" aria-hidden />
        </button>
        <span className="min-w-[64px] text-center text-[13px] tabular-nums text-muted-foreground" aria-live={paused || reduce ? "polite" : "off"}>
          {String(top + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => go(1)} aria-label="Next comment" className="grid size-10 place-items-center rounded-full bg-foreground/[0.06] text-foreground/70 transition-colors hover:bg-foreground/[0.1] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <ChevronRight className="size-[18px]" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function CommentDeck() {
  return (
    <div>
      <div className="max-w-[640px]">
        <h2 className="pg-display text-[clamp(36px,5vw,48px)] leading-[1.04] text-foreground">Don&apos;t take our word for it.</h2>
        <p className="mt-4 text-[17px] text-muted-foreground">Comments from Reddit and Instagram on the components, quoted as written.</p>
      </div>
      <div className="mt-14 grid items-center gap-16 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <Featured />
        <Deck />
      </div>
    </div>
  );
}
