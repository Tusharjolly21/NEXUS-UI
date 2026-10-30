import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { HERO, CUSTOMER_NAMES } from "./data";
import { EASE, Button, Section } from "./ui";
import { ReleaseDashboard } from "./release-dashboard";

export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [dashboardReady, setDashboardReady] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const tilt = useSpring(useTransform(scrollYProgress, [0, 0.35], [16, 0]), { stiffness: 120, damping: 24 });
  const lift = useTransform(scrollYProgress, [0, 0.35], [0, -30]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.55]);
  useEffect(() => {
    const f = window.setTimeout(() => setDashboardReady(true), reduced ? 0 : 700);
    return () => window.clearTimeout(f);
  }, [reduced]);
  const titleWords = HERO.title.map((f) => f.split(" "));
  let wordCount = 0;
  return (
    <div ref={ref} id="top" className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[38%] h-[900px]"
        style={{ opacity: glowOpacity }}
      >
        <div className="absolute left-1/2 top-0 h-[700px] w-[1400px] max-w-[160vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,122,47,.42),rgba(255,122,47,.12)_45%,transparent_75%)] blur-2xl" />
        <div className="absolute left-1/2 top-[120px] h-[2px] w-[1100px] max-w-[120vw] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,197,138,.75),transparent)]" />
      </motion.div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(60%_50%_at_50%_20%,#000,transparent)]"
      />
      <div className="relative mx-auto flex w-full max-w-[1180px] flex-col items-center px-5 text-center sm:px-8">
        <motion.a
          href="#product"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="group inline-flex items-center gap-2 rounded-full bg-white/[.04] py-1.5 pl-1.5 pr-3.5 text-[13px] text-[#d9d3cb] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] outline-none hover:bg-white/[.07] focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
        >
          <span className="rounded-full bg-[#ff7a2f] px-2 py-0.5 text-[11.5px] font-semibold text-black">
            New
          </span>
          {HERO.badge}
        </motion.a>
        <h1 className="mt-7 text-[clamp(44px,8.4vw,96px)] font-semibold leading-[0.98] tracking-[-0.055em]">
          {titleWords.map((f, d) => (
            <span key={d} className="block">
              {f.map((h) => {
                const y = wordCount++;
                return (
                  <motion.span
                    key={y}
                    className="inline-block bg-[linear-gradient(180deg,#fff_20%,#b8b0a6)] bg-clip-text pr-[0.24em] text-transparent last:pr-0"
                    initial={reduced ? false : { opacity: 0, y: 28, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1, ease: EASE, delay: 0.08 + y * 0.06 }}
                  >
                    {h}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </h1>
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          className="mt-6 max-w-[56ch] text-[18px] leading-[1.55] text-[#a39c94]"
        >
          {HERO.body}
        </motion.p>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.62 }}
          className="mt-9 flex flex-col items-center gap-3"
        >
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="#pricing" size="lg">
              {HERO.primary}
            </Button>
            <Button href="#demo" variant="ghost" size="lg">
              {HERO.secondary}
            </Button>
          </div>
          <span className="text-[13px] text-[#6a645e]">{HERO.note}</span>
        </motion.div>
        <div className="relative mt-16 w-full sm:mt-20" style={{ perspective: 1600 }}>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 90, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.55 }}
            style={{ rotateX: reduced ? 0 : tilt, y: lift, transformOrigin: "50% 0%" }}
          >
            <ReleaseDashboard ready={dashboardReady} />
          </motion.div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(transparent,#000)]"
          />
        </div>
      </div>
    </div>
  );
}

export function CustomerStrip() {
  return (
    <Section className="pb-8 pt-4">
      <p className="text-center text-[14px] text-[#6a645e]">Used by product teams at</p>
      <ul
        className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-5 lg:grid-cols-10"
        aria-label="Customers"
      >
        {CUSTOMER_NAMES.map((e, t) => (
          <li
            key={e}
            className="flex items-center justify-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-[#6a645e] transition-colors duration-300 hover:text-[#f3efe9]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
              {t % 4 === 0 && <circle cx="8" cy="8" r="6" />}
              {t % 4 === 1 && <path d="M8 1l7 13H1z" />}
              {t % 4 === 2 && <rect x="2" y="2" width="12" height="12" rx="3" />}
              {t % 4 === 3 && <path d="M2 8a6 6 0 0 1 12 0v6H2z" />}
            </svg>
            {e}
          </li>
        ))}
      </ul>
    </Section>
  );
}
