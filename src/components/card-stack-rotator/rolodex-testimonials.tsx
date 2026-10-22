"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent, type RefObject } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RolodexCard {
  /** The quote, without quotation marks. */
  quote: string;
  /** Who said it. */
  name: string;
  /** Their role and company. */
  role: string;
  /** Two colours for the avatar gradient. */
  hue: [string, string];
}

export interface RolodexTestimonialsProps {
  /** The testimonials, in drum order. Defaults to ten demo quotes. */
  cards?: RolodexCard[];
  /** Clicks the drum round to the next quote every 2.6s until someone touches it. */
  autoplay?: boolean;
  /** Called with the index of the card that is square at the front. */
  onChange?: (index: number) => void;
  /** Extra classes for the root. */
  className?: string;
}

const DEFAULT_CARDS: RolodexCard[] = [
  { quote: "We rebuilt our onboarding in a weekend. It finally feels like us.", name: "Maya Chen", role: "Design lead, Loop", hue: ["#ff9f0a", "#ff375f"] },
  { quote: "The motion explains the product before anyone reads a word.", name: "Arjun Rao", role: "Founder, Tally", hue: ["#30d158", "#0a84ff"] },
  { quote: "Our pricing page went from fine to the thing people screenshot.", name: "Lena Ortiz", role: "Growth, Wayfare", hue: ["#bf5af2", "#5e5ce6"] },
  { quote: "Copy, paste, ship. Nothing to fight with.", name: "Tom Becker", role: "Engineer, Relay", hue: ["#64d2ff", "#30d158"] },
  { quote: "Visitors play with the hero. Time on page doubled.", name: "Sara Kim", role: "PM, Orbitly", hue: ["#ff375f", "#bf5af2"] },
  { quote: "It feels expensive. It wasn't.", name: "Dev Patel", role: "Indie maker", hue: ["#ffd60a", "#ff9f0a"] },
  { quote: "Finally a library that respects reduced motion.", name: "Noor Haddad", role: "Accessibility, Quadrant", hue: ["#0a84ff", "#64d2ff"] },
  { quote: "Our devs and designers stopped arguing about animation.", name: "Eli Novak", role: "CTO, Parallel", hue: ["#5e5ce6", "#ff375f"] },
  { quote: "The small details are where it wins.", name: "Ana Lima", role: "Brand, Vela", hue: ["#30d158", "#ffd60a"] },
  { quote: "Clients ask who built our site. I just smile.", name: "Kai Ito", role: "Studio owner", hue: ["#ff9f0a", "#5e5ce6"] },
];

/** Height of one card in px. */
const CH = 150;

/** A ref that reads true while the element is on screen and the tab is visible. Read it inside timers. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const on = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => {
      on.current = inView && !document.hidden;
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.1 });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return on;
}

function Card({ card, i, step, radius, rot }: { card: RolodexCard; i: number; step: number; radius: number; rot: MotionValue<number> }) {
  // angle of this card relative to the front of the drum
  const rel = useTransform(rot, (r) => {
    let a = (i * step + r) % 360;
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    return a;
  });
  const opacity = useTransform(rel, (a) => Math.max(0, 1 - Math.abs(a) / 95));
  const shade = useTransform(rel, (a) => Math.min(0.5, Math.abs(a) / 180));
  // place on the drum: rotate about the drum's axis, then push out to its surface
  const transform = useTransform(rel, (a) => `translateZ(${-radius}px) rotateX(${a}deg) translateZ(${radius}px)`);
  return (
    <motion.figure
      className="absolute inset-x-0 top-1/2 m-0 flex flex-col justify-between rounded-[20px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_14px_30px_-18px_rgba(0,0,0,.35)] [backface-visibility:hidden] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_14px_30px_-18px_rgba(0,0,0,.9)]"
      style={{ height: CH, marginTop: -CH / 2, transform, opacity }}
    >
      <blockquote className="m-0 text-[16px] leading-[1.4] tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">“{card.quote}”</blockquote>
      <figcaption className="flex items-center gap-2.5">
        <span className="h-8 w-8 flex-none rounded-full" style={{ background: `linear-gradient(135deg, ${card.hue[0]}, ${card.hue[1]})` }} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{card.name}</span>
          <span className="truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{card.role}</span>
        </span>
      </figcaption>
      <motion.span className="pointer-events-none absolute inset-0 rounded-[20px] bg-[#1d1d1f] dark:bg-black" style={{ opacity: shade }} />
    </motion.figure>
  );
}

/**
 * Testimonials on a rolodex. The cards ride round a drum that clicks to the
 * next quote every few seconds; the ones above and below tip away and fade.
 * Drag it to spin, flick it hard and it keeps going, and it always
 * comes to rest square on a card. Arrow up and down turn it from the keyboard.
 */
export function RolodexTestimonials({ cards = DEFAULT_CARDS, autoplay = false, onChange, className }: RolodexTestimonialsProps) {
  const still = useReducedMotion() === true;
  const n = cards.length;
  const step = n > 0 ? 360 / n : 360;
  const radius = n > 2 ? Math.round(CH / 2 / Math.tan(Math.PI / n)) + 10 : 0;
  const rot = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const drag = useRef<{ y: number; r: number; t: number; v: number } | null>(null);
  const touched = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(root);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const last = useRef(0);

  useMotionValueEvent(rot, "change", (r) => {
    if (n === 0) return;
    const i = ((Math.round(-r / step) % n) + n) % n;
    setActive(i);
    if (i !== last.current) {
      last.current = i;
      onChangeRef.current?.(i);
    }
  });

  const settle = (velocity = 0) => {
    const projected = rot.get() + velocity * 0.25;
    const snap = Math.round(projected / step) * step;
    animate(rot, snap, still ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 20, velocity });
  };
  const goBy = useCallback(
    (k: number) => {
      animate(rot, Math.round(rot.get() / step) * step - k * step, still ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 18 });
    },
    [rot, step, still],
  );

  // Autoplay clicks to the next quote while the drum is on screen and the tab is visible.
  useEffect(() => {
    if (!autoplay || still || n < 2) return;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      if (onScreen.current) goBy(1);
    }, 2600);
    return () => window.clearInterval(id);
  }, [autoplay, still, n, goBy, onScreen]);

  const touch = () => {
    touched.current = true;
    setLive(true);
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    touch();
    rot.stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, r: rot.get(), t: performance.now(), v: 0 };
  };
  const move = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    const nr = d.r - (e.clientY - d.y) * 0.45;
    d.v = (nr - rot.get()) / Math.max(0.008, (now - d.t) / 1000);
    d.t = now;
    rot.set(nr);
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (d) settle(d.v);
  };
  const key = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      touch();
      goBy(1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      touch();
      goBy(-1);
    }
  };

  if (n === 0) return null;
  const front = cards[active] ?? cards[0];

  return (
    <div ref={root} className={cn("flex w-[380px] max-w-full flex-col items-center gap-4 text-[#1d1d1f] dark:text-[#f5f5f7]", className)}>
      <div
        className="relative h-[380px] w-full cursor-grab touch-none select-none rounded-[24px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] active:cursor-grabbing dark:focus-visible:outline-[#0a84ff]"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Testimonials. Use the up and down arrow keys to browse."
        aria-keyshortcuts="ArrowUp ArrowDown"
        onKeyDown={key}
      >
        {/* The fade at the top and bottom is a mask, so it follows whatever sits behind the drum. */}
        <div
          className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_21%,#000_79%,transparent)]"
          style={{ perspective: 900 }}
          aria-hidden="true"
        >
          <div className="absolute inset-x-4 inset-y-0" style={{ transformStyle: "preserve-3d" }}>
            {cards.map((c, i) => (
              <Card key={`${i}-${c.name}`} card={c} i={i} step={step} radius={radius} rot={rot} />
            ))}
          </div>
        </div>
        <p className="sr-only" aria-live={live ? "polite" : "off"}>
          Testimonial {active + 1} of {n}: {front.quote} {front.name}, {front.role}
        </p>
      </div>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {cards.map((c, i) => (
          <motion.span
            key={`${i}-${c.name}`}
            className="h-1.5 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
            initial={false}
            animate={{ width: i === active ? 18 : 6, opacity: i === active ? 1 : 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
