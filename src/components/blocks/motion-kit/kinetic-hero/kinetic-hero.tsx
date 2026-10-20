"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, SplitText);

export interface KineticHeroProps {
  /** Endings the last word of the headline turns through, like the faces of a drum. */
  words?: string[];
  /** First line of the headline. */
  lead?: string;
  /** Word before the turning drum on the second line. */
  subject?: string;
  /** Paragraph under the headline. */
  sub?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  /** Small label above the scroll cue at the bottom. */
  hint?: string;
  /**
   * Off (default): the section is 260vh tall and scrubbed by page scroll, with a sticky stage.
   * On: the section is its own scroll box `height` px tall with the tall track inside, for frames
   * and containers that clip overflow, where page scroll can't reach it.
   */
  contained?: boolean;
  /** Height of the scroll box in contained mode, in px. */
  height?: number;
  /** Contained mode only: scrolls the box down to the end and back in a loop until someone touches it. */
  autoplay?: boolean;
  /** Called with the button that was pressed. Buttons never navigate. */
  onAction?: (label: "primary" | "secondary") => void;
  className?: string;
}

const WORDS = ["love", "remember", "share", "pay for"];
/** Colours the section flips to at the end, in light and dark mode alike. */
const END = { bg: "#0b0b0c", fg: "#f5f5f7", sub: "#98989d" };
// The start colours come from classes (light / dark); `--kh-t` (0 → 1) mixes them into the end colours,
// so toggling dark mode mid-scroll stays correct.
const mix = (end: string, start: string) => `color-mix(in srgb, ${end} calc(var(--kh-t) * 100%), var(${start}))`;
const COLOURS = {
  "--bg": mix(END.bg, "--kh-bg0"),
  "--fg": mix(END.fg, "--kh-fg0"),
  "--sub": mix(END.sub, "--kh-sub0"),
  background: "var(--bg)",
} as CSSProperties;

/** Angle between faces and the drum's radius (as a fraction of the 1.1em face height) for n faces. */
function drumGeometry(n: number) {
  const step = n > 1 ? 360 / n : 0;
  const apothem = n > 2 ? 0.55 / Math.tan(Math.PI / n) : 0;
  return { step, origin: `50% 50% -${apothem.toFixed(4)}em` };
}

/**
 * A hero headline you scroll through. The letters tumble up into place one by one, then the last
 * word turns like a drum through the alternatives, and at the end the whole section flips to dark
 * and the call to action lands. Everything is scrubbed, so scrolling back plays it in reverse.
 * Built with GSAP ScrollTrigger and SplitText.
 */
export function KineticHero({
  words = WORDS,
  lead = "Build something",
  subject = "people",
  sub = "The component library for interfaces that feel made, not assembled.",
  primaryLabel = "Start building",
  secondaryLabel = "Browse components",
  hint = "Scroll",
  contained = false,
  height = 640,
  autoplay = false,
  onAction,
  className,
}: KineticHeroProps) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLHeadingElement>(null);
  const drum = useRef<HTMLSpanElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const hintEl = useRef<HTMLDivElement>(null);
  const sizer = useRef<HTMLSpanElement>(null);
  const touched = useRef(false);
  const reduce = useReducedMotion() ?? false;

  const list = words.length ? words : WORDS;
  const wordsKey = list.join("\u0000");
  const { step, origin } = drumGeometry(list.length);
  const last = list.length - 1;
  const h = Math.max(320, height);

  useLayoutEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (reduce || !el || !tr || !lines.current || !drum.current || !sizer.current || !cta.current) return;
    let raf = 0;
    const ctx = gsap.context(() => {
      const split = new SplitText(lines.current!.querySelectorAll("[data-split]"), { type: "words,chars", wordsClass: "kh-word", aria: "none" });
      gsap.set(lines.current, { perspective: 600 });
      const faces = drum.current!.querySelectorAll<HTMLElement>("[data-face]");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: contained
          ? { trigger: tr, scroller: el, start: "top top", end: "bottom bottom", scrub: 0.6 }
          : { trigger: tr, start: "top 75%", end: "bottom bottom", scrub: 0.6 },
      });
      tl.from(split.chars, { yPercent: 130, rotationX: -100, z: -120, opacity: 0, transformOrigin: "50% 100% -20px", stagger: 0.025, duration: 0.6, ease: "back.out(1.6)" }, 0)
        .from(drum.current, { opacity: 0, yPercent: 60, duration: 0.3, ease: "power2.out" }, 0.45)
        .to(hintEl.current, { opacity: 0, duration: 0.2 }, 0.2);
      // Turn the drum one face at a time. Widths are kept in em so they follow the headline's size.
      const fs = parseFloat(getComputedStyle(sizer.current!).fontSize) || 1;
      const widths = [...faces].map((f) => (f.querySelector<HTMLElement>("[data-word]")?.offsetWidth ?? 0) / fs);
      gsap.set(sizer.current, { width: `${widths[0]}em`, display: "block" });
      faces.forEach((_, i) => {
        if (!i) return;
        const at = 0.9 + (i - 1) * 0.55;
        tl.to(drum.current, { rotationX: -step * i, duration: 0.4, ease: "power2.inOut" }, at).to(
          sizer.current,
          { width: `${widths[i]}em`, duration: 0.4, ease: "power2.inOut" },
          at,
        );
      });
      const end = 0.9 + Math.max(0, faces.length - 1) * 0.55;
      tl.fromTo(el, { "--kh-t": 0 }, { "--kh-t": 1, duration: 0.45 }, end)
        .from(cta.current!.children, { y: 40, opacity: 0, scale: 0.9, stagger: 0.08, duration: 0.35, ease: "back.out(2)" }, end + 0.1)
        .to({}, { duration: 0.3 });
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => split.revert();
    }, el);

    // The box (or page) can change size without a window resize: keep the trigger's range current.
    let pending = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(pending);
      ro.disconnect();
      ctx.revert();
    };
  }, [reduce, contained, wordsKey, lead, subject, step]);

  // Contained demo: scroll the box to the end and back, forever, until the first touch.
  useEffect(() => {
    const box = root.current;
    if (!contained || !autoplay || reduce || !box || touched.current) return;
    const p = { v: 0 };
    const apply = () => {
      box.scrollTop = p.v * Math.max(0, box.scrollHeight - box.clientHeight);
    };
    const loop = gsap.timeline({ repeat: -1, delay: 0.8 });
    loop
      .to(p, { v: 1, duration: 6.5, ease: "sine.inOut", onUpdate: apply })
      .to(p, { v: 0, duration: 4, ease: "sine.inOut", onUpdate: apply }, "+=1.6")
      .to({}, { duration: 1 });
    let visible = true;
    const sync = () => {
      if (visible && !document.hidden) loop.resume();
      else loop.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(box);
    const events = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    const stop = () => {
      touched.current = true;
      loop.kill();
      events.forEach((t) => box.removeEventListener(t, stop));
    };
    events.forEach((t) => box.addEventListener(t, stop, { passive: true }));
    document.addEventListener("visibilitychange", sync);
    return () => {
      loop.kill();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      events.forEach((t) => box.removeEventListener(t, stop));
    };
  }, [contained, autoplay, reduce]);

  const press = (label: "primary" | "secondary") => (e: ReactMouseEvent) => {
    e.preventDefault();
    onAction?.(label);
  };

  const shown = reduce ? list[last] : list[0];
  const vars = {
    ...COLOURS,
    ...(contained ? { height: h } : null),
  } as CSSProperties;

  return (
    <section
      ref={root}
      aria-label="Hero"
      tabIndex={contained ? 0 : undefined}
      style={vars}
      className={cn(
        "relative w-full [--kh-bg0:#f5f5f7] [--kh-fg0:#1d1d1f] [--kh-sub0:#6e6e73] dark:[--kh-bg0:#1c1c1e] dark:[--kh-fg0:#f5f5f7] dark:[--kh-sub0:#a1a1a6]",
        reduce ? "[--kh-t:1]" : "[--kh-t:0]",
        contained &&
          "overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <div ref={track} className={cn("relative", !contained && !reduce && "h-[260vh]")} style={contained ? { height: reduce ? h : Math.round(h * 2.6) } : undefined}>
        <div
          className={cn(
            "@container sticky top-0 flex flex-col items-center justify-center overflow-hidden px-6 text-center",
            !contained && "h-screen min-h-[560px]",
          )}
          style={contained ? { height: h } : undefined}
        >
          <h2
            ref={lines}
            className="m-0 text-[clamp(40px,8cqi,104px)] font-semibold leading-[1.02] tracking-[-0.05em] [&_.kh-word]:inline-block [&_.kh-word]:whitespace-nowrap"
            style={{ color: "var(--fg)" }}
          >
            <span className="sr-only">{`${lead} ${subject} ${shown}.`}</span>
            <span key={lead} data-split className="block" aria-hidden="true">
              {lead}
            </span>
            <span className="flex flex-wrap items-baseline justify-center gap-x-[0.25em]" aria-hidden="true">
              <span key={subject} data-split>
                {subject}
              </span>
              <span className="relative inline-block h-[1.1em] align-baseline" style={{ perspective: "800px" }}>
                {/* Sized to the showing word; GSAP tweens the width as the drum turns. */}
                <span ref={sizer} className="invisible block h-[1.1em] whitespace-nowrap">
                  {shown}.
                </span>
                <span
                  ref={drum}
                  className="absolute inset-0 block"
                  style={{ transformStyle: "preserve-3d", transformOrigin: origin, transform: reduce ? `rotateX(${-step * last}deg)` : undefined }}
                >
                  {list.map((w, i) => (
                    <span
                      key={i}
                      data-face
                      className="absolute inset-0 flex items-center justify-center whitespace-nowrap bg-gradient-to-r from-[#0071e3] via-[#bf5af2] to-[#ff375f] bg-clip-text text-transparent [backface-visibility:hidden]"
                      style={{ transform: `rotateX(${i * step}deg)`, transformOrigin: origin }}
                    >
                      <span data-word>{w}.</span>
                    </span>
                  ))}
                </span>
              </span>
            </span>
          </h2>
          <p className="m-0 mt-6 max-w-[520px] text-[19px] leading-[1.45]" style={{ color: "var(--sub)" }}>
            {sub}
          </p>
          <div ref={cta} className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#"
              onClick={press("primary")}
              className="rounded-full bg-[#0071e3] px-6 py-3.5 text-[16px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
            >
              {primaryLabel}
            </a>
            <a
              href="#"
              onClick={press("secondary")}
              className="rounded-full px-6 py-3.5 text-[16px] font-medium outline-none ring-1 ring-current focus-visible:ring-2"
              style={{ color: "var(--fg)" }}
            >
              {secondaryLabel}
            </a>
          </div>
          {!reduce && (
            <div
              ref={hintEl}
              className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[12px]"
              style={{ color: "var(--sub)" }}
              aria-hidden="true"
            >
              {hint}
              <span className="block h-8 w-px animate-pulse" style={{ background: "var(--sub)" }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
