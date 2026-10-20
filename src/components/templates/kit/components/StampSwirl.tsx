"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Stamp { name: string; date: string; value: string; art: string }

const STAMPS: Stamp[] = [
  { name: "Tidepool", date: "1974", value: "12c", art: "radial-gradient(60% 50% at 30% 30%, #ffe6b8, rgba(255,230,184,0) 60%), radial-gradient(50% 60% at 75% 70%, #2ec4b6, rgba(46,196,182,0) 65%), linear-gradient(160deg,#9be7d8,#126e82)" },
  { name: "Ember Fields", date: "1981", value: "20c", art: "radial-gradient(50% 50% at 70% 25%, #fff1c1, rgba(255,241,193,0) 60%), radial-gradient(60% 50% at 30% 75%, #e63946, rgba(230,57,70,0) 65%), linear-gradient(170deg,#ffb36b,#9d2b2b)" },
  { name: "Night Bloom", date: "1968", value: "8c", art: "radial-gradient(45% 45% at 50% 40%, #f0c3ff, rgba(240,195,255,0) 60%), radial-gradient(60% 60% at 20% 80%, #5e5ce6, rgba(94,92,230,0) 65%), linear-gradient(170deg,#3a2f6b,#0f0c29)" },
  { name: "Moss & Stone", date: "1990", value: "32c", art: "radial-gradient(55% 45% at 35% 35%, #e9f5c8, rgba(233,245,200,0) 60%), radial-gradient(60% 60% at 80% 80%, #3f6f3a, rgba(63,111,58,0) 65%), linear-gradient(160deg,#a7c47e,#2c3e2d)" },
];

function StampArt({ s, active, i }: { s: Stamp; active: boolean; i: number }) {
  const fid = "s" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const turb = useRef<SVGFETurbulenceElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const strength = useRef(10);

  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      const t = now / 1000 + i * 2.3;
      strength.current += ((active ? 34 : 12) - strength.current) * 0.06;
      turb.current?.setAttribute("baseFrequency", `${(0.012 + Math.sin(t * 0.7) * 0.004).toFixed(4)} ${(0.018 + Math.cos(t * 0.5) * 0.005).toFixed(4)}`);
      turb.current?.setAttribute("seed", String(1 + i));
      disp.current?.setAttribute("scale", strength.current.toFixed(1));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, i]);

  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={fid} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence ref={turb} type="turbulence" baseFrequency="0.012 0.018" numOctaves="2" result="n" />
          <feDisplacementMap ref={disp} in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="B" />
        </filter>
      </svg>
      <div className="absolute inset-[-8%]" style={{ background: s.art, filter: `url(#${fid})` }} />
    </>
  );
}

/**
 * Postage stamps whose artwork slowly swirls like wet ink (an SVG turbulence
 * field driving a displacement map). Hover one and it lifts out of the row,
 * the swirl gets stronger, and its name and year appear underneath.
 */
export default function StampSwirl({ stamps = STAMPS, autoplay = false }: { stamps?: Stamp[]; autoplay?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setHover((k++ % (stamps.length + 1)) === stamps.length ? null : (k - 1) % (stamps.length + 1));
    }, 1500);
    return () => clearInterval(t);
  }, [autoplay, stamps.length]);

  const holes = "radial-gradient(circle, #f5f5f7 3.2px, transparent 3.6px)";

  return (
    <div className="flex flex-col items-center gap-6" onPointerEnter={() => (touched.current = true)}>
      <div className="flex h-[210px] items-center gap-4">
        {stamps.map((s, i) => {
          const on = hover === i;
          return (
            <motion.button
              key={s.name}
              type="button"
              aria-label={`${s.name}, ${s.date}`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="relative outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4"
              initial={false}
              animate={{ scale: on ? 1.45 : hover !== null ? 0.92 : 1, rotate: on ? 0 : [-3, 2, -1.5, 3][i % 4], y: on ? -6 : 0, zIndex: on ? 10 : 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ width: 84, height: 104, filter: on ? "drop-shadow(0 18px 22px rgba(0,0,0,.28))" : "drop-shadow(0 6px 10px rgba(0,0,0,.14))" }}
            >
              <span className="absolute inset-0 bg-white" />
              {/* perforated edges */}
              <span className="absolute inset-x-0 -top-[4px] h-[8px]" style={{ background: holes, backgroundSize: "10px 8px", backgroundPosition: "1px 0" }} />
              <span className="absolute inset-x-0 -bottom-[4px] h-[8px]" style={{ background: holes, backgroundSize: "10px 8px", backgroundPosition: "1px 0" }} />
              <span className="absolute inset-y-0 -left-[4px] w-[8px]" style={{ background: holes, backgroundSize: "8px 10px", backgroundPosition: "0 2px" }} />
              <span className="absolute inset-y-0 -right-[4px] w-[8px]" style={{ background: holes, backgroundSize: "8px 10px", backgroundPosition: "0 2px" }} />
              <span className="absolute inset-[7px] overflow-hidden">
                <StampArt s={s} active={on} i={i} />
                <span className="absolute bottom-1 right-1.5 text-[11px] font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,.4)]">{s.value}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="relative h-11 w-[260px] overflow-hidden text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={hover ?? "none"} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} className="flex flex-col">
            {hover === null ? (
              <span className="text-[13px] text-[#86868b]">Hover a stamp.</span>
            ) : (
              <>
                <span className="font-serif text-[18px] italic text-[#1d1d1f]">{stamps[hover].name}</span>
                <span className="text-[12px] tabular-nums text-[#86868b]">Issued {stamps[hover].date}</span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
