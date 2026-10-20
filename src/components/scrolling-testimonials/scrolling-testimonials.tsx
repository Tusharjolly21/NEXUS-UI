"use client";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
  /** Avatar image URL. Initials on a gradient are drawn when it's missing. */
  avatar?: string;
  /** 0–5 stars, drawn when `showStars` is on. */
  rating?: number;
};

export interface ScrollingTestimonialsProps {
  testimonials?: Testimonial[];
  /** Number of columns. They drop to fewer on narrow containers. */
  columns?: 1 | 2 | 3;
  /** Time in ms for the first column to scroll through its cards once. Lower is faster. */
  speed?: number;
  /** Per-column loop times in ms; overrides `speed` for each index given. */
  columnSpeeds?: number[];
  /** Per-column direction; true scrolls that column downward. */
  reverseColumns?: boolean[];
  /** Ease the wall to a stop while the pointer is over it. */
  pauseOnHover?: boolean;
  /** Show the badge, title and subtitle above the wall. */
  showHeader?: boolean;
  badge?: string;
  title?: string;
  subtitle?: string;
  /** Height of the moving wall in px. */
  height?: number;
  /** Overrides the wall background (transparent by default). */
  backgroundColor?: string;
  /** Overrides the card surface colour. */
  cardBackground?: string;
  /** Overrides the hairline around each card. */
  borderColor?: string;
  /** Overrides the quote and name colour. */
  textColor?: string;
  /** Overrides the role colour. */
  mutedTextColor?: string;
  avatarSize?: number;
  showStars?: boolean;
  /** Fade the wall out at its top and bottom edges. */
  fadeMask?: boolean;
  /** Flings the wall up and down every few seconds until someone touches it. */
  autoplay?: boolean;
  className?: string;
}

export const DEFAULT_SCROLLING_TESTIMONIALS: Testimonial[] = [
  { id: "s1", quote: "Shipped the whole marketing site in a weekend. Nobody believes the animations were copy-paste.", name: "Lena Moritz", role: "Design lead", company: "Halcyon", rating: 5 },
  { id: "s2", quote: "Motion that feels intentional, never gimmicky. Our designers stopped writing animation specs.", name: "Kwame Asante", role: "Staff engineer", company: "Ferrous", rating: 5 },
  { id: "s3", quote: "Conversion on the pricing page went up 18% the week we swapped in the new cards.", name: "Ines Duarte", role: "Growth", company: "Ledgerly", rating: 5 },
  { id: "s4", quote: "Accessibility was built in from the start. The audit came back with two notes, both ours.", name: "Ravi Menon", role: "Eng manager", company: "Cobalt Row", rating: 5 },
  { id: "s5", quote: "We replaced three component kits with one. Less code, fewer bugs, faster pages.", name: "Astrid Holm", role: "CTO", company: "Nordvik", rating: 5 },
  { id: "s6", quote: "Dark mode, responsive and animated out of the box. It saved our team two full sprints.", name: "Marcus Bell", role: "Founder", company: "Papertrail Co", rating: 5 },
  { id: "s7", quote: "The handoff between design and code basically disappeared. Devs grab a component and ship.", name: "Yara Haddad", role: "Product designer", company: "Mintleaf", rating: 5 },
  { id: "s8", quote: "I tried a dozen UI kits this year. This is the first one I actually wanted to keep.", name: "Theo Laurent", role: "Frontend lead", company: "Quarry", rating: 5 },
  { id: "s9", quote: "Clients keep asking how we built the scroll effects. We just smile and send the invoice.", name: "Nadia Petrova", role: "Studio owner", company: "Fieldhouse", rating: 5 },
];

const TONES = [
  ["#5ac8fa", "#0071e3"],
  ["#ffb340", "#ff6b3d"],
  ["#7ee0a1", "#1fa463"],
  ["#d6a4ff", "#8e44ec"],
  ["#ff8fa3", "#ff375f"],
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

type Look = Pick<ScrollingTestimonialsProps, "cardBackground" | "borderColor" | "textColor" | "mutedTextColor">;

function Stars({ n }: { n: number }) {
  const k = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${k} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className={i < k ? "fill-[#ff9f0a]" : "fill-[#d2d2d7] dark:fill-[#48484a]"}>
          <path d="M6 .8 7.6 4l3.5.5-2.6 2.4.7 3.5L6 8.7 2.8 10.4l.7-3.5L.9 4.5 4.4 4Z" />
        </svg>
      ))}
    </span>
  );
}

function Card({ t, tone, look, avatarSize, showStars, hidden }: { t: Testimonial; tone: string[]; look: Look; avatarSize: number; showStars: boolean; hidden?: boolean }) {
  const surface: CSSProperties = {
    background: look.cardBackground,
    color: look.textColor,
    boxShadow: look.borderColor ? `0 0 0 1px ${look.borderColor}, 0 20px 40px -26px rgba(0,0,0,.35)` : undefined,
  };
  return (
    <li aria-hidden={hidden || undefined} className="list-none">
      <figure
        className="m-0 rounded-[22px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] transition-[opacity,transform] duration-300 group-hover/wall:opacity-55 hover:!opacity-100 hover:-translate-y-0.5 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
        style={surface}
      >
        {showStars && typeof t.rating === "number" ? <Stars n={t.rating} /> : null}
        <blockquote className={`m-0 text-[14px] leading-[1.5] tracking-[-0.01em] [text-wrap:pretty] ${showStars && typeof t.rating === "number" ? "mt-2.5" : ""}`}>{t.quote}</blockquote>
        <figcaption className="mt-4 flex items-center gap-2.5">
          {t.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- consumer-supplied avatar of any origin
            <img src={t.avatar} alt="" className="shrink-0 rounded-full object-cover" style={{ width: avatarSize, height: avatarSize }} draggable={false} />
          ) : (
            <span
              aria-hidden="true"
              className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
              style={{ width: avatarSize, height: avatarSize, fontSize: Math.round(avatarSize * 0.36), background: `linear-gradient(135deg, ${tone[0]}, ${tone[1]})` }}
            >
              {initials(t.name)}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold tracking-[-0.01em]">{t.name}</span>
            <span className="block truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]" style={{ color: look.mutedTextColor }}>
              {t.role}
              {t.company ? `, ${t.company}` : ""}
            </span>
          </span>
        </figcaption>
      </figure>
    </li>
  );
}

function Column({
  items,
  offset,
  skew,
  setRef,
  className,
  ...card
}: {
  items: { t: Testimonial; tone: string[] }[];
  offset: MotionValue<number>;
  skew: MotionValue<number>;
  setRef: (el: HTMLUListElement | null) => void;
  className: string;
  look: Look;
  avatarSize: number;
  showStars: boolean;
}) {
  return (
    <div className={`min-w-0 flex-1 ${className}`}>
      <motion.div style={{ y: offset, skewY: skew }} className="flex flex-col">
        <ul ref={setRef} className="m-0 flex flex-col gap-3 p-0 pb-3">
          {items.map(({ t, tone }) => (
            <Card key={t.id} t={t} tone={tone} {...card} />
          ))}
        </ul>
        <ul className="m-0 flex flex-col gap-3 p-0 pb-3" aria-hidden="true">
          {items.map(({ t, tone }) => (
            <Card key={t.id} t={t} tone={tone} hidden {...card} />
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

/**
 * A wall of testimonials scrolling in columns at different speeds. Hover and
 * the wall glides to a stop instead of freezing, the card under the pointer
 * stays lit while the rest dim; wheel or drag over it and the columns take
 * the push, lean with the speed and coast back to cruising.
 */
export function ScrollingTestimonials({
  testimonials = DEFAULT_SCROLLING_TESTIMONIALS,
  columns = 3,
  speed = 32000,
  columnSpeeds,
  reverseColumns = [false, true, false],
  pauseOnHover = true,
  showHeader = true,
  badge = "Wall of love",
  title = "Trusted by product teams",
  subtitle = "Designers and engineers ship faster with it.",
  height = 420,
  backgroundColor,
  cardBackground,
  borderColor,
  textColor,
  mutedTextColor,
  avatarSize = 32,
  showStars = true,
  fadeMask = true,
  autoplay = false,
  className = "",
}: ScrollingTestimonialsProps) {
  const reduce = useReducedMotion() === true;
  const cols = Math.max(1, Math.min(3, columns));
  const o0 = useMotionValue(0);
  const o1 = useMotionValue(0);
  const o2 = useMotionValue(0);
  const push = useMotionValue(0);
  const skewRaw = useTransform(push, [-1800, 0, 1800], [-3, 0, 3], { clamp: true });
  const skew = useSpring(skewRaw, { stiffness: 220, damping: 24 });
  const lists = useRef<(HTMLUListElement | null)[]>([null, null, null]);
  const hover = useRef(false);
  const [playing, setPlaying] = useState(true);
  const playRef = useRef(true);
  const touched = useRef(false);
  const drag = useRef<{ y: number; t: number } | null>(null);

  const conf = useRef({ speed, columnSpeeds, reverseColumns, pauseOnHover, reduce });
  useEffect(() => {
    conf.current = { speed, columnSpeeds, reverseColumns, pauseOnHover, reduce };
  });
  useEffect(() => {
    playRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const offs = [o0, o1, o2];
    let raf = 0;
    let last = 0;
    let factor = 1;
    const pos = [0, 0, 0];
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const c = conf.current;
      const want = c.reduce || !playRef.current || (c.pauseOnHover && hover.current && !drag.current) ? 0 : 1;
      factor += (want - factor) * (1 - Math.exp(-dt * 5));
      const v = push.get();
      // The push decays like a flywheel.
      const nv = Math.abs(v) < 2 ? 0 : v * Math.exp(-dt * 2.6);
      if (nv !== v) push.set(nv);
      for (let i = 0; i < 3; i++) {
        const h = lists.current[i]?.offsetHeight ?? 0;
        if (!h) continue;
        const dur = Math.max(2000, c.columnSpeeds?.[i] ?? c.speed * (1 + i * 0.22));
        const dir = c.reverseColumns?.[i] ? 1 : -1;
        pos[i] += (dir * (h / (dur / 1000)) * factor + (c.reduce ? 0 : nv * (0.8 + i * 0.15))) * dt;
        pos[i] = (((pos[i] % h) + h) % h) - h;
        offs[i].set(Math.round(pos[i] * 100) / 100);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [o0, o1, o2, push]);

  useEffect(() => {
    if (!autoplay || reduce) return;
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      push.set(k++ % 2 === 0 ? -1500 : 1100);
    }, 3200);
    return () => window.clearInterval(t);
  }, [autoplay, reduce, push]);

  const touch = () => {
    touched.current = true;
  };

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touch();
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, t: e.timeStamp };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g) return;
    const dt = Math.max(8, e.timeStamp - g.t) / 1000;
    const v = (e.clientY - g.y) / dt;
    push.set(push.get() * 0.6 + Math.max(-4000, Math.min(4000, v)) * 0.4);
    g.y = e.clientY;
    g.t = e.timeStamp;
  };
  const onUp = () => {
    drag.current = null;
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      touch();
      push.set(push.get() + (e.key === "ArrowDown" ? -900 : 900));
    }
  };

  const look: Look = { cardBackground, borderColor, textColor, mutedTextColor };
  const buckets: { t: Testimonial; tone: string[] }[][] = Array.from({ length: cols }, () => []);
  testimonials.forEach((t, i) => buckets[i % cols].push({ t, tone: TONES[i % TONES.length] }));
  const offs = [o0, o1, o2];
  // Narrow containers drop the later columns.
  const colClass = ["block", cols === 3 ? "hidden @min-[400px]:block" : "hidden @min-[340px]:block", "hidden @min-[560px]:block"];
  const mask = fadeMask ? "linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)" : undefined;

  return (
    <section className={`@container w-full ${className}`} aria-label={title || "Testimonials"}>
      {showHeader && (badge || title || subtitle) ? (
        <header className="mb-6 text-center">
          {badge ? <p className="m-0 text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{badge}</p> : null}
          {title ? <h2 className="m-0 mt-1 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h2> : null}
          {subtitle ? <p className="m-0 mt-1.5 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="relative">
        <div
          tabIndex={0}
          role="region"
          aria-roledescription="scrolling testimonials"
          aria-label="Testimonials wall. Arrow keys push it."
          onKeyDown={onKey}
          onPointerEnter={() => {
            hover.current = true;
          }}
          onPointerLeave={() => {
            hover.current = false;
            drag.current = null;
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onWheel={(e) => {
            touch();
            if (!reduce) push.set(Math.max(-4000, Math.min(4000, push.get() - e.deltaY * 6)));
          }}
          className="group/wall relative flex select-none gap-3 overflow-hidden rounded-[24px] px-1 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
          style={{ height, background: backgroundColor, WebkitMaskImage: mask, maskImage: mask }}
        >
          {buckets.map((items, i) => (
            <Column
              key={i}
              items={items}
              offset={offs[i]}
              skew={skew}
              setRef={(el) => {
                lists.current[i] = el;
              }}
              className={colClass[i]}
              look={look}
              avatarSize={avatarSize}
              showStars={showStars}
            />
          ))}
        </div>
        {!reduce ? (
          <button
            type="button"
            onClick={() => {
              touch();
              setPlaying((p) => !p);
            }}
            aria-label={playing ? "Pause testimonials" : "Play testimonials"}
            className="absolute bottom-3 right-3 z-10 grid size-8 place-items-center rounded-full bg-white/90 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_6px_16px_-8px_rgba(0,0,0,.35)] outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e]/90 dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
          >
            {playing ? (
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true" fill="currentColor">
                <rect x="0.5" y="0.5" width="3" height="11" rx="1" />
                <rect x="6.5" y="0.5" width="3" height="11" rx="1" />
              </svg>
            ) : (
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true" fill="currentColor">
                <path d="M1 1.2v9.6c0 .6.6.9 1.1.6l7.3-4.8a.7.7 0 0 0 0-1.2L2.1.6C1.6.3 1 .6 1 1.2Z" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
    </section>
  );
}
