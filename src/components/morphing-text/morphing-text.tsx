"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Morphing Text: a keyword that melts into the next one. Two copies of the word sit on top of each
 * other; the outgoing one blurs out while the incoming one sharpens, and an SVG alpha threshold
 * turns the overlapping blur into one liquid shape, so the letters seem to flow into new letters
 * instead of cross-fading. The threshold is only on during the morph, so resting text stays crisp.
 * A pause button stops the cycle; reduced motion swaps words with a plain fade. Pauses off screen.
 */
export type MorphingTextProps = {
  /** Static line above the morphing word. Empty string hides it. */
  lead?: string;
  words?: string[];
  /** Seconds each morph takes. */
  morphTime?: number;
  /** Seconds each word rests before the next morph. */
  holdTime?: number;
  align?: "left" | "center" | "right";
  /** Colour of the morphing word. Leave it out for the house blue, which lightens in dark mode; pass "currentColor" to inherit. */
  color?: string;
  /** Cycles through the words on its own. Off, it rests on the first word until Play is pressed. */
  autoplay?: boolean;
  className?: string;
};

export function MorphingText({
  lead = "Interfaces that feel",
  words = ["alive.", "tactile.", "physical.", "inevitable.", "yours."],
  morphTime = 1.1,
  holdTime = 1.6,
  align = "center",
  color,
  autoplay = false,
  className,
}: MorphingTextProps) {
  const id = `morph-${useId().replace(/:/g, "")}`;
  const aRef = useRef<HTMLSpanElement>(null);
  const bRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(autoplay);
  const playingRef = useRef(autoplay);
  const visibleRef = useRef(true);
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  const wordsKey = words.join("\u0000");

  useEffect(() => {
    const a = aRef.current!, b = bRef.current!, box = boxRef.current!;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let phase: "hold" | "morph" = "hold";
    let t = 0;
    let raf = 0;
    let prev = performance.now();
    a.textContent = words[0];
    b.textContent = words[1 % words.length];
    b.style.opacity = "0";
    a.style.filter = "";
    a.style.opacity = "1";

    const setFrac = (f: number) => {
      // incoming word sharpens as f -> 1, outgoing blurs as f -> 0 of its own share
      const inF = Math.max(f, 0.0001);
      const outF = Math.max(1 - f, 0.0001);
      if (reduced) {
        a.style.opacity = String(outF);
        b.style.opacity = String(inF);
        return;
      }
      b.style.filter = `blur(${Math.min(8 / inF - 8, 100)}px)`;
      b.style.opacity = `${Math.pow(inF, 0.4) * 100}%`;
      a.style.filter = `blur(${Math.min(8 / outF - 8, 100)}px)`;
      a.style.opacity = `${Math.pow(outF, 0.4) * 100}%`;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.max(0, Math.min(0.05, (now - prev) / 1000));
      prev = now;
      if (!visibleRef.current || (!playingRef.current && phase === "hold")) return;
      t += dt;
      if (phase === "hold") {
        if (t >= holdTime) {
          phase = "morph";
          t = 0;
          if (!reduced) box.style.filter = `url(#${id})`;
        }
        return;
      }
      const f = Math.min(1, t / morphTime);
      setFrac(f);
      if (f >= 1) {
        // the incoming copy becomes the resting one
        index = (index + 1) % words.length;
        a.textContent = words[index];
        b.textContent = words[(index + 1) % words.length];
        a.style.filter = "";
        a.style.opacity = "1";
        b.style.filter = "";
        b.style.opacity = "0";
        box.style.filter = "";
        phase = "hold";
        t = 0;
        setCurrent(index);
      }
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    io.observe(box);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordsKey, morphTime, holdTime, id]);

  const justify = align === "left" ? "items-start text-left" : align === "right" ? "items-end text-right" : "items-center text-center";
  const longest = words.reduce((m, w) => (w.length > m.length ? w : m), "");

  return (
    <div className={cn("flex w-full flex-col gap-6", justify, className)} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={id}>
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
        </filter>
      </svg>
      <h3 className="m-0 font-semibold leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] dark:text-[#f5f5f7]" style={{ fontSize: "clamp(34px, 3.6vw, 60px)" }}>
        {lead ? <span className="block">{lead}</span> : null}
        <span ref={boxRef} className="relative inline-block" aria-live="polite">
          {/* invisible longest word reserves the width so nothing reflows */}
          <span className="invisible" aria-hidden="true">{longest}</span>
          <span ref={aRef} className={`absolute inset-0 ${align === "center" ? "text-center" : ""} ${color ? "" : "text-[#0071e3] dark:text-[#2997ff]"}`} style={color ? { color } : undefined} />
          <span ref={bRef} className={`absolute inset-0 ${align === "center" ? "text-center" : ""} ${color ? "" : "text-[#0071e3] dark:text-[#2997ff]"}`} style={color ? { color } : undefined} aria-hidden="true" />
          <span className="sr-only">{words[current]}</span>
        </span>
      </h3>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        aria-pressed={!playing}
        onClick={() => setPlaying((p) => !p)}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none dark:bg-white/10 dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.16)] focus-visible:ring-2 focus-visible:ring-[#0071e3]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l11-6.5z" />}
        </svg>
        {playing ? "Pause" : "Play"}
      </motion.button>
    </div>
  );
}
