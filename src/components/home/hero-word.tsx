"use client";

import * as React from "react";
import { rainbowColor } from "@/components/site/rainbow-word";

/** What people build with the library; the headline cycles through them. */
const WORDS = ["landing page", "dashboard", "portfolio", "pricing page", "waitlist", "product tour"];
/** Milliseconds a word rests, and (the first time) how long before the first morph. */
const HOLD_MS = 2600;
const FIRST_HOLD_MS = 3000;
/** Seconds one morph takes. */
const MORPH_S = 1;
/**
 * The most the blur ever goes to. Past this the threshold has already hidden the word, so the look is the same, but a heavier
 * blur makes a letter's painted area huge, and the browser then reports that letter as the page's main content.
 */
const MAX_BLUR_PX = 16;

/**
 * One word, every letter a stop on the spectrum, so a word keeps the same colours as the headline always had. Each letter
 * is its own box on purpose: as one text block a word is bigger than the paragraph under the headline, and when it first
 * morphed in the browser would count it as the page's main content (a late one, which is what the speed score reports).
 */
function Word({ word }: { word: string }) {
  const chars = Array.from(word);
  const last = Math.max(1, chars.length - 1);
  return (
    <>
      {chars.map((char, i) => (
        <span key={i} className="inline-block" style={{ color: rainbowColor(i / last) }}>
          {char === " " ? " " : char}
        </span>
      ))}
    </>
  );
}

/**
 * "Make your ___ move." One word melts into the next, as in Morphing Text: two copies sit on top of each other, the
 * outgoing one blurs away while the incoming one sharpens, and an SVG alpha threshold fuses the overlapping blur into one
 * liquid shape. The threshold is on only while a morph runs, so the resting word is crisp, and nothing runs between
 * morphs (timers, no animation frame loop). It pauses off screen and while the tab is hidden; reduced motion keeps the
 * first word still. Screen readers always get "landing page".
 */
export function HeroWord({ className }: { className?: string }) {
  const id = `hw-${React.useId().replace(/:/g, "")}`;
  const boxRef = React.useRef<HTMLSpanElement>(null);
  const aRef = React.useRef<HTMLSpanElement>(null);
  const bRef = React.useRef<HTMLSpanElement>(null);
  const [index, setIndex] = React.useState(0);
  const indexRef = React.useRef(0);
  const longest = React.useMemo(() => WORDS.reduce((m, w) => (w.length > m.length ? w : m), ""), []);

  // A finished morph has made the incoming copy the resting one: put both copies back to rest for the new pair.
  React.useLayoutEffect(() => {
    indexRef.current = index;
    const a = aRef.current;
    const b = bRef.current;
    const box = boxRef.current;
    if (!a || !b || !box) return;
    a.style.filter = "";
    a.style.opacity = "1";
    b.style.filter = "";
    b.style.opacity = "0";
    box.style.filter = "";
  }, [index]);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = boxRef.current;
    if (!box) return;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(box);

    let timer = 0;
    let raf = 0;

    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        if (visible && document.visibilityState === "visible") morph();
        else schedule(HOLD_MS);
      }, delay);
    };

    const morph = () => {
      const a = aRef.current;
      const b = bRef.current;
      if (!a || !b) return;
      box.style.filter = `url(#${id})`;
      const start = performance.now();
      const step = (now: number) => {
        const f = Math.min(1, (now - start) / (MORPH_S * 1000));
        // the incoming copy sharpens as f goes to 1, the outgoing one blurs away
        const inF = Math.max(f, 0.0001);
        const outF = Math.max(1 - f, 0.0001);
        b.style.filter = `blur(${Math.min(8 / inF - 8, MAX_BLUR_PX)}px)`;
        b.style.opacity = f < 0.05 ? "0" : `${Math.pow(inF, 0.4) * 100}%`;
        a.style.filter = `blur(${Math.min(8 / outF - 8, MAX_BLUR_PX)}px)`;
        a.style.opacity = `${Math.pow(outF, 0.4) * 100}%`;
        if (f < 1) raf = requestAnimationFrame(step);
        else {
          setIndex((indexRef.current + 1) % WORDS.length);
          schedule(HOLD_MS);
        }
      };
      raf = requestAnimationFrame(step);
    };

    schedule(FIRST_HOLD_MS);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [id]);

  const next = (index + 1) % WORDS.length;
  // two copies share one grid cell; the longest word (hidden) keeps the width fixed so the line never reflows
  const copy = "col-start-1 row-start-1 justify-self-center lg:justify-self-start";

  return (
    <span className={className}>
      <span className="sr-only">landing page</span>
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id={id} colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
        </filter>
      </svg>
      <span ref={boxRef} aria-hidden className="inline-grid whitespace-nowrap">
        <span className="invisible col-start-1 row-start-1">{longest}</span>
        <span ref={aRef} className={copy}>
          <Word word={WORDS[index]} />
        </span>
        <span ref={bRef} className={copy} style={{ opacity: 0 }}>
          <Word word={WORDS[next]} />
        </span>
      </span>
    </span>
  );
}
