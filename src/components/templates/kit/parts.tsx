"use client";
/**
 * Shared building blocks for the Motion Kit landing page templates.
 * Imports only react and framer-motion, same as the components.
 */
import { Children, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type PointerEvent as RPointerEvent, type CSSProperties } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

export const ease = [0.16, 1, 0.3, 1] as const;

/** True while a media query matches. */
export function useMedia(q: string) {
  // Start false on server and client alike so hydration matches; the effect reads the real value.
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return m;
}

/** Smooth-scroll to an element id without touching the URL hash. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top: y, behavior: "smooth" });
}

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ children, delay = 0, y = 28, className = "", amount = 0.25 }: { children: ReactNode; delay?: number; y?: number; className?: string; amount?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers a list of children in as a group. */
export function Stagger({ children, className = "", gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div className={className} initial="hide" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={{ show: { transition: { staggerChildren: gap } } }}>
      {Children.map(children, (c) => (
        <motion.div className="min-w-0" variants={{ hide: { opacity: 0, y: 20, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 160, damping: 22 } } }}>
          {c}
        </motion.div>
      ))}
    </motion.div>
  );
}

/** A headline whose words arrive one after another out of a blur. */
export function Words({ text, className = "", delay = 0, accentWords = [], accent }: { text: string; className?: string; delay?: number; accentWords?: string[]; accent?: string }) {
  const words = text.split(" ");
  return (
    <span className={`inline-flex flex-wrap gap-x-[0.24em] ${className}`}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="inline-block"
            style={accentWords.includes(w) && accent ? { color: accent } : undefined}
            initial={{ y: "105%", opacity: 0, filter: "blur(8px)" }}
            whileInView={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: delay + i * 0.06 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * Scales a fixed-size component down so it never overflows a narrow column.
 * The wrapper keeps the scaled height so the layout around it stays correct.
 */
export function Fit({ children, className = "", max = 1 }: { children: ReactNode; className?: string; max?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  const [h, setH] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const o = outer.current, n = inner.current;
    if (!o || !n) return;
    const measure = () => {
      const iw = n.offsetWidth, ih = n.offsetHeight;
      const sc = Math.min(max, iw ? o.clientWidth / iw : 1);
      setS(sc);
      setH(ih * sc);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(n);
    return () => ro.disconnect();
  }, [max]);
  return (
    <div ref={outer} className={`flex w-full min-w-0 items-start justify-center ${className}`} style={{ height: h }}>
      <div ref={inner} className="w-max flex-none self-start" style={{ transform: `scale(${s})`, transformOrigin: "top center" }}>
        {children}
      </div>
    </div>
  );
}

/** Counts up to a number when it first scrolls into view. */
export function Counter({ to, from = 0, format = (n) => Math.round(n).toLocaleString("en-US"), duration = 1.6, className = "" }: { to: number; from?: number; format?: (n: number) => string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(from);
  const [text, setText] = useState(format(from));
  useMotionValueEvent(mv, "change", (v) => setText(format(v)));
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration, ease });
    return () => c.stop();
  }, [inView, to, duration, mv]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{text}</span>;
}

/** An endless row that drifts sideways and slows down under the pointer. */
export function Marquee({ children, speed = 40, className = "" }: { children: ReactNode; speed?: number; className?: string }) {
  const x = useMotionValue(0);
  const track = useRef<HTMLDivElement>(null);
  const rate = useSpring(1, { stiffness: 60, damping: 20 });
  useAnimationFrame((_, dt) => {
    const w = track.current ? track.current.scrollWidth / 2 : 0;
    if (!w) return;
    let v = x.get() - (speed * rate.get() * dt) / 1000;
    if (v <= -w) v += w;
    x.set(v);
  });
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ maskImage: "linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)" }}
      onPointerEnter={() => rate.set(0.2)}
      onPointerLeave={() => rate.set(1)}
    >
      <motion.div ref={track} className="flex w-max items-center" style={{ x }}>
        <div className="flex flex-none items-center">{children}</div>
        <div className="flex flex-none items-center" aria-hidden="true">{children}</div>
      </motion.div>
    </div>
  );
}

/** A button that leans toward the pointer and springs back when it leaves. */
export function Magnetic({ children, onClick, className = "", style, strength = 0.28, ariaLabel }: { children: ReactNode; onClick?: () => void; className?: string; style?: CSSProperties; strength?: number; ariaLabel?: string }) {
  const x = useSpring(0, { stiffness: 260, damping: 18 });
  const y = useSpring(0, { stiffness: 260, damping: 18 });
  const move = (e: RPointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerMove={move}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
      style={{ x, y, ...style }}
    >
      {children}
    </motion.button>
  );
}

/** Section header: small coloured eyebrow, big tight headline, soft subline. */
export function SectionHead({ eyebrow, title, sub, accent = "#0071e3", center = false, dark = false }: { eyebrow?: string; title: string; sub?: string; accent?: string; center?: boolean; dark?: boolean }) {
  return (
    <div className={`flex flex-col gap-4 ${center ? "items-center text-center" : ""}`}>
      {eyebrow && (
        <Reveal y={12}>
          <span className="text-[14px] font-semibold tracking-[-0.01em]" style={{ color: accent }}>{eyebrow}</span>
        </Reveal>
      )}
      <h2 className={`m-0 max-w-[820px] text-[clamp(34px,5.4vw,60px)] font-semibold leading-[1.04] tracking-[-0.04em] [text-wrap:balance] ${dark ? "text-[#f5f5f7]" : "text-[#1d1d1f]"}`}>
        <Words text={title} className={center ? "justify-center" : ""} />
      </h2>
      {sub && (
        <Reveal delay={0.15} y={14}>
          <p className={`m-0 max-w-[620px] text-[clamp(17px,2vw,21px)] leading-[1.42] tracking-[-0.015em] ${dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/** A card with a soft light that follows the pointer across its surface. */
export function Spotlight({ children, className = "", color = "rgba(0,113,227,.14)", style }: { children: ReactNode; className?: string; color?: string; style?: CSSProperties }) {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const bg = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, ${color}, transparent 70%)`;
  return (
    <div
      className={`group relative overflow-hidden ${className}`}
      style={style}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => { mx.set(-400); my.set(-400); }}
    >
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: bg }} aria-hidden="true" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/** Card surface used throughout the templates. */
export const card = "rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-32px_rgba(0,0,0,.35)]";

export interface NavProps { brand: ReactNode; links: { label: string; id: string }[]; cta: string; accent: string; onCta?: () => void; dark?: boolean }

/**
 * Sticky glass navigation. It condenses as the page scrolls, a pill follows
 * the hovered link, and the CTA is magnetic. On phones the links fold into a
 * sheet that drops down with staggered items.
 */
export function Nav({ brand, links, cta, accent, onCta, dark = false }: NavProps) {
  const { scrollY } = useScroll();
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const bgA = useTransform(scrollY, [0, 120], [0, dark ? 0.72 : 0.78]);
  const border = useTransform(scrollY, [0, 120], [0, 1]);
  const pad = useTransform(scrollY, [0, 120], [18, 10]);
  const bg = useMotionTemplate`rgba(${dark ? "22,22,23" : "251,251,253"},${bgA})`;
  const line = useMotionTemplate`0 1px 0 rgba(${dark ? "255,255,255" : "0,0,0"},${useTransform(border, (b) => b * 0.08)})`;
  const ink = dark ? "#f5f5f7" : "#1d1d1f";
  return (
    <motion.header className="sticky top-0 z-40 w-full backdrop-blur-xl backdrop-saturate-150" style={{ background: bg, boxShadow: line, paddingTop: pad, paddingBottom: pad }}>
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-6 px-5">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2" style={{ color: ink }} aria-label="Back to top">
          {brand}
        </button>
        <nav className="hidden items-center md:flex" aria-label="Sections" onPointerLeave={() => setHover(null)}>
          {links.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => scrollToId(l.id)}
              onPointerEnter={() => setHover(l.id)}
              onFocus={() => setHover(l.id)}
              className="relative rounded-full px-4 py-2 text-[14px] font-medium outline-none focus-visible:ring-2"
              style={{ color: dark ? "#d2d2d7" : "#424245" }}
            >
              {hover === l.id && (
                <motion.span layoutId={`navpill-${cta}`} className="absolute inset-0 rounded-full" style={{ background: dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.05)" }} transition={{ type: "spring", stiffness: 500, damping: 36 }} />
              )}
              <span className="relative">{l.label}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Magnetic onClick={onCta} className="!h-10 !px-5 !text-[14px] text-white" style={{ background: accent }}>
            {cta}
          </Magnetic>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full outline-none focus-visible:ring-2 md:hidden" style={{ color: ink }} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <motion.path initial={false} animate={{ d: open ? "M6 6L18 18" : "M4 8h16" }} transition={{ type: "spring", stiffness: 400, damping: 28 }} />
              <motion.path initial={false} animate={{ d: open ? "M6 18L18 6" : "M4 16h16" }} transition={{ type: "spring", stiffness: 400, damping: 28 }} />
            </svg>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            key="sheet"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="overflow-hidden md:hidden"
            aria-label="Sections"
          >
            <motion.ul className="m-0 flex list-none flex-col gap-1 px-5 pb-4 pt-3" initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.05 } } }}>
              {links.map((l) => (
                <motion.li key={l.id} variants={{ h: { opacity: 0, y: -8 }, s: { opacity: 1, y: 0 } }}>
                  <button type="button" onClick={() => { setOpen(false); scrollToId(l.id); }} className="w-full rounded-2xl px-3 py-3 text-left text-[20px] font-semibold tracking-[-0.02em]" style={{ color: ink }}>
                    {l.label}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/** Accordion FAQ. The open answer pushes the others down with a spring. */
export function Faq({ items, accent = "#0071e3", dark = false }: { items: { q: string; a: string }[]; accent?: string; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex w-full flex-col">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <motion.div key={i} layout className={`border-b ${dark ? "border-white/10" : "border-black/[.08]"}`}>
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left outline-none focus-visible:ring-2"
            >
              <span className={`text-[clamp(18px,2.2vw,22px)] font-semibold tracking-[-0.02em] ${dark ? "text-[#f5f5f7]" : "text-[#1d1d1f]"}`}>{it.q}</span>
              <motion.span animate={{ rotate: on ? 45 : 0, backgroundColor: on ? accent : dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.05)" }} transition={{ type: "spring", stiffness: 400, damping: 24 }} className="flex h-8 w-8 flex-none items-center justify-center rounded-full" style={{ color: on ? "#fff" : dark ? "#f5f5f7" : "#1d1d1f" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 30 }} className="overflow-hidden">
                  <p className={`m-0 max-w-[680px] pb-6 text-[17px] leading-[1.55] ${dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Scroll story: the text steps scroll past normally while the visual on the
 * right stays pinned and swaps to match whichever step is in the middle of
 * the screen. A progress rail fills as you go.
 */
export function StickyStory({ steps, accent = "#0071e3", dark = false }: { steps: { kicker: string; title: string; body: string; visual: ReactNode }[]; accent?: string; dark?: boolean }) {
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start center", "end center"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const wide = useMedia("(min-width: 1024px)");
  // Active step comes straight from scroll progress, so fast scrolls and jumps never skip one.
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.max(0, Math.min(steps.length - 1, Math.floor(p * steps.length)))));
  return (
    <div ref={wrap} className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
      <div className="relative flex flex-col">
        <div className={`absolute bottom-0 left-0 top-0 hidden w-[2px] rounded-full lg:block ${dark ? "bg-white/10" : "bg-black/[.06]"}`}>
          <motion.div className="w-full origin-top rounded-full" style={{ height: "100%", scaleY: fill, background: accent }} />
        </div>
        {steps.map((s, i) => (
          <Step key={i} active={active === i} accent={accent} dark={dark} s={s} wide={wide} />
        ))}
      </div>
      {wide && <div>
        <div className="sticky top-[14vh] flex h-[72vh] items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 40, scale: 0.94, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -40, scale: 0.96, filter: "blur(12px)" }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
              className="flex w-full justify-center"
            >
              {steps[active].visual}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>}
    </div>
  );
}

function Step({ s, active, accent, dark, wide }: { s: { kicker: string; title: string; body: string; visual: ReactNode }; active: boolean; accent: string; dark: boolean; wide: boolean }) {
  return (
    <div className="flex flex-col justify-center gap-4 py-10 lg:min-h-[72vh] lg:pl-10">
      <motion.span animate={{ color: active ? accent : dark ? "#6e6e73" : "#86868b" }} className="text-[14px] font-semibold">{s.kicker}</motion.span>
      <motion.h3 animate={{ opacity: active || !wide ? 1 : 0.35 }} className={`m-0 text-[clamp(28px,3.6vw,40px)] font-semibold leading-[1.08] tracking-[-0.035em] ${dark ? "text-[#f5f5f7]" : "text-[#1d1d1f]"}`}>{s.title}</motion.h3>
      <motion.p animate={{ opacity: active || !wide ? 1 : 0.35 }} className={`m-0 max-w-[460px] text-[18px] leading-[1.5] ${dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>{s.body}</motion.p>
      {!wide && <div className="mt-4 flex justify-center"><Fit>{s.visual}</Fit></div>}
    </div>
  );
}

/** A big closing call to action whose glow follows the pointer. */
export function CtaBand({ title, sub, cta, accent, glow, secondary, dark = true }: { title: string; sub: string; cta: string; accent: string; glow: string; secondary?: string; dark?: boolean }) {
  return (
    <Spotlight className={`rounded-[36px] px-6 py-20 sm:px-12 sm:py-28 ${dark ? "bg-[#1d1d1f]" : "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)]"}`} color={glow}>
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className={`m-0 max-w-[760px] text-[clamp(36px,6vw,68px)] font-semibold leading-[1.02] tracking-[-0.045em] [text-wrap:balance] ${dark ? "text-[#f5f5f7]" : "text-[#1d1d1f]"}`}>
          <Words text={title} className="justify-center" />
        </h2>
        <Reveal delay={0.2}><p className={`m-0 max-w-[520px] text-[19px] leading-[1.45] ${dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>{sub}</p></Reveal>
        <Reveal delay={0.3} className="flex flex-wrap justify-center gap-3">
          <Magnetic className="text-white" style={{ background: accent }}>{cta}</Magnetic>
          {secondary && <Magnetic className={dark ? "bg-white/10 text-white" : "bg-black/5 text-[#1d1d1f]"}>{secondary}</Magnetic>}
        </Reveal>
      </div>
    </Spotlight>
  );
}

/** Simple footer with link columns. */
export function Footer({ brand, columns, note, dark = false }: { brand: ReactNode; columns: { title: string; links: string[] }[]; note: string; dark?: boolean }) {
  return (
    <footer className={`w-full border-t ${dark ? "border-white/10 text-[#a1a1a6]" : "border-black/[.06] text-[#6e6e73]"}`}>
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-2 gap-10 px-5 py-16 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <span style={{ color: dark ? "#f5f5f7" : "#1d1d1f" }}>{brand}</span>
          <p className="m-0 max-w-[300px] text-[14px] leading-[1.5]">{note}</p>
        </div>
        {columns.map((c) => (
          <div key={c.title} className="flex flex-col gap-3 text-[14px]">
            <span className={`font-semibold ${dark ? "text-[#f5f5f7]" : "text-[#1d1d1f]"}`}>{c.title}</span>
            {c.links.map((l) => (
              <button type="button" key={l} className="w-fit text-left hover:underline">{l}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-28 text-[12px]">© 2026. All rights reserved.</div>
    </footer>
  );
}

/** A phone frame for showing mobile UI on a landing page. */
export function Phone({ children, tint = "#f5f5f7", className = "" }: { children: ReactNode; tint?: string; className?: string }) {
  return (
    <div className={`relative h-[640px] w-[316px] flex-none rounded-[54px] bg-[#1d1d1f] p-[10px] shadow-[0_0_0_1.5px_#3a3a3c,0_50px_100px_-40px_rgba(0,0,0,.55)] ${className}`}>
      <div className="relative h-full w-full overflow-hidden rounded-[44px]" style={{ background: tint }}>
        <div className="absolute left-1/2 top-[10px] z-20 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

/** Hook: progress of an element through the viewport, for parallax. */
export function useParallax(range = 80) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);
  return { ref, y, progress: scrollYProgress };
}
