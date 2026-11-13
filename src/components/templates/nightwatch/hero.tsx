"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { COLORS, CONTAINER, DAWN, DAWN_GRADIENT, FONT_MONO, clamp, seededRandom } from "./theme";
import { Button, Icon, Reveal, SplitHeading } from "./ui";

const HERO_ALERTS = [
  {
    t: "Latency spike on checkout",
    d: "p95 2.4s · 47 alerts grouped",
    icon: "ph:siren",
    tone: COLORS.bad,
  },
  {
    t: "Triaged by Nightwatch",
    d: "Cause: deploy #8812, 6 min ago",
    icon: "ph:magnifying-glass",
    tone: DAWN[1],
  },
  {
    t: "Rolling back #8812",
    d: "Runbook step 3 of 4",
    icon: "ph:arrow-counter-clockwise",
    tone: DAWN[2],
  },
  {
    t: "Resolved in 41 seconds",
    d: "Nobody was woken up",
    icon: "ph:check-circle-fill",
    tone: COLORS.ok,
  },
];

function AlertStorm() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [alertIndex, setAlertIndex] = useState(-1);
  const reduce = useReducedMotion();
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) {
      return;
    }
    const STEP = 6;
    const TICK = 0.11;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let visible = true;
    /** latency samples, one per STEP pixels, newest last */
    let samples: number[] = [];
    let phase = 0;
    let sinceTick = 0;
    let lastTime = performance.now();
    /** spike values waiting to be pushed in */
    let queue: number[] = [];
    const spike = {
      on: false,
      age: 0,
      s0: -1,
      s1: -1,
      peak: -1,
      peakV: 0,
      wait: reduce ? 0 : 2.4,
    };
    let shownAlert = -1;
    const random = seededRandom(4);
    const baseline = (A: number) =>
      0.2 +
      0.05 * Math.sin(A * 1.3) +
      0.035 * Math.sin(A * 3.7 + 1) +
      0.02 * Math.sin(A * 8.9 + 2) +
      (random() - 0.5) * 0.035;
    const resize = () => {
      const A = wrap.getBoundingClientRect();
      width = A.width;
      height = A.height;
      if (!width) {
        return;
      }
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const L = Math.ceil(width / STEP) + 4;
      if (samples.length < L) {
        const $ = L - samples.length;
        const I = [];
        for (let Le = 0; Le < $; Le++) {
          I.push(baseline(-Le * TICK));
        }
        samples = [...I.reverse(), ...samples];
      } else {
        samples = samples.slice(-L);
      }
    };
    const spikeShape = () => {
      const A = [];
      for (let L = 1; L <= 5; L++) {
        A.push(0.2 + 0.58 * (L / 5) ** 0.7);
      }
      for (let L = 0; L < 24; L++) {
        A.push(0.74 + Math.sin(L * 1.7) * 0.05 + (random() - 0.5) * 0.05);
      }
      for (let L = 1; L <= 10; L++) {
        A.push(0.74 * (1 - L / 10) + 0.2 * (L / 10));
      }
      return A;
    };
    const advance = () => {
      phase += TICK;
      let A = baseline(phase);
      if (queue.length) {
        A = Math.max(A, queue.shift()!);
      }
      samples.push(A);
      samples.shift();
      if (spike.s0 >= 0) {
        spike.s0--;
        spike.s1--;
        spike.peak--;
      }
    };
    const toY = (A: number) => height - 14 - A * (height - 40);
    const frame = (A: number) => {
      const L = Math.min(0.05, (A - lastTime) / 1e3);
      lastTime = A;
      if (reduce) {
        if (!spike.on) {
          const oe = spikeShape();
          const je = samples.length;
          const Ke = Math.floor(je * 0.6) - 20;
          oe.forEach((Ge, i) => {
            if (Ke + i < je) {
              samples[Ke + i] = Ge;
            }
          });
          spike.on = true;
          spike.age = 5;
          spike.s0 = Ke;
          spike.s1 = Ke + oe.length;
          spike.peak = Ke + 14;
          spike.peakV = 0.74;
        }
      } else {
        for (sinceTick += L; sinceTick >= TICK; ) {
          sinceTick -= TICK;
          advance();
        }
        if (spike.on) {
          spike.age += L;
          if (spike.age > 9.5) {
            spike.on = false;
            spike.wait = 2.5;
          }
        } else if (((spike.wait -= L), spike.wait <= 0)) {
          spike.on = true;
          spike.age = 0;
          queue = spikeShape();
          const oe = samples.length;
          spike.s0 = oe;
          spike.s1 = oe + queue.length;
          spike.peak = oe + 14;
          spike.peakV = 0.74;
        }
      }
      const $ = reduce ? 0 : (sinceTick / TICK) * STEP;
      const I = (oe: number) => (oe - (samples.length - 1)) * STEP + width - 4 - $ + STEP * 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(150,170,255,.07)";
      ctx.lineWidth = 1;
      for (let oe = 1; oe <= 3; oe++) {
        const je = Math.round(height * (oe / 4)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, je);
        ctx.lineTo(width, je);
        ctx.stroke();
      }
      const Le = Math.round(toY(0.55)) + 0.5;
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = "rgba(255,142,94,.28)";
      ctx.beginPath();
      ctx.moveTo(0, Le);
      ctx.lineTo(width, Le);
      ctx.stroke();
      ctx.setLineDash([]);
      const line = new Path2D();
      samples.forEach((sample, i) => {
        const Ke = I(i);
        const Ge = toY(sample);
        if (i === 0) {
          line.moveTo(Ke, Ge);
        } else {
          line.lineTo(Ke, Ge);
        }
      });
      const area = new Path2D(line);
      area.lineTo(I(samples.length - 1), height);
      area.lineTo(I(0), height);
      area.closePath();
      const fill = ctx.createLinearGradient(0, 0, 0, height);
      fill.addColorStop(0, "rgba(160,180,255,.16)");
      fill.addColorStop(1, "rgba(160,180,255,0)");
      ctx.fillStyle = fill;
      ctx.fill(area);
      ctx.lineWidth = 1.7;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(205,215,255,.65)";
      ctx.stroke(line);
      const st = spike.age < 1.2 ? 0 : spike.age < 2.4 ? 1 : spike.age < 3.6 ? 2 : 3;
      if (spike.on && spike.s1 > 0) {
        const oe = new Path2D();
        let je = true;
        for (let Ge = Math.max(0, spike.s0 - 1); Ge <= Math.min(samples.length - 1, spike.s1); Ge++) {
          const Bt = I(Ge);
          const cl = toY(samples[Ge]);
          if (je) {
            oe.moveTo(Bt, cl);
            je = false;
          } else {
            oe.lineTo(Bt, cl);
          }
        }
        const Ke = st < 3 ? 1 : clamp(1 - (spike.age - 3.6) / 3);
        ctx.globalAlpha = Ke;
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = st < 3 ? DAWN[0] : COLORS.ok;
        ctx.shadowColor = st < 3 ? "rgba(255,107,90,.8)" : "rgba(91,227,176,.7)";
        ctx.shadowBlur = 14;
        ctx.stroke(oe);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      const al = I(samples.length - 1);
      const ll = toY(samples[samples.length - 1]);
      ctx.fillStyle = "rgba(220,228,255,.95)";
      ctx.beginPath();
      ctx.arc(al, ll, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(220,228,255,.18)";
      ctx.beginPath();
      ctx.arc(al, ll, 7 + Math.sin(A / 300) * 2, 0, Math.PI * 2);
      ctx.fill();
      const tip = tipRef.current;
      if (tip) {
        if (spike.on && spike.peak < samples.length && spike.age < 8.5) {
          const je = I(Math.min(samples.length - 1, Math.max(0, spike.peak)));
          const Ke = toY(spike.peakV);
          const Ge = tip.offsetWidth;
          const Bt = clamp(je - Ge / 2, 8, width - Ge - 8);
          tip.style.transform = `translate(${Bt}px, ${Ke - tip.offsetHeight - 22}px)`;
          tip.style.setProperty("--ax", `${je - Bt}px`);
          tip.style.opacity = String(clamp((8.5 - spike.age) / 0.6) * clamp(je / (width * 0.18)));
          if (st !== shownAlert) {
            shownAlert = st;
            setAlertIndex(st);
          }
        } else {
          tip.style.opacity = "0";
          if (shownAlert !== -1) {
            shownAlert = -1;
            setAlertIndex(-1);
          }
        }
      }
    };
    const loop = (A: number) => {
      frame(A);
      rafId = visible && !reduce ? requestAnimationFrame(loop) : 0;
    };
    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      frame(performance.now());
    });
    resizeObserver.observe(wrap);
    const intersection = new IntersectionObserver(([A]) => {
      visible = A.isIntersecting;
      if (visible && !rafId && !reduce) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    });
    intersection.observe(wrap);
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else {
        if (visible && !reduce) {
          lastTime = performance.now();
          rafId = requestAnimationFrame(loop);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    if (reduce) {
      frame(performance.now());
    }
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);
  const alert = HERO_ALERTS[Math.max(0, alertIndex)];
  return (
    <div ref={wrapRef} className="relative h-full w-full" aria-hidden={true}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <span
        className="absolute right-3 text-[10.5px] tracking-[0.02em]"
        style={{
          top: "calc(100% - 14px - .55 * (100% - 40px) - 18px)",
          color: "rgba(255,142,94,.6)",
          fontFamily: FONT_MONO,
        }}
      >
        SLO 800 ms
      </span>
      <div ref={tipRef} className="absolute left-0 top-0 w-[248px] opacity-0 will-change-transform">
        <div
          className="relative rounded-2xl p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,.9)] backdrop-blur-md"
          style={{
            background: "rgba(14,21,44,.92)",
            boxShadow: `inset 0 0 0 1px ${alert.tone}55, 0 20px 50px -20px rgba(0,0,0,.9)`,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={alertIndex}
              initial={{
                opacity: 0,
                y: 6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -6,
              }}
              transition={{
                duration: 0.28,
              }}
              className="flex items-start gap-2.5"
            >
              <span
                className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full"
                style={{
                  background: `${alert.tone}22`,
                  color: alert.tone,
                }}
              >
                {alertIndex === 2 ? (
                  <Icon name="ph:circle-notch" size={14} className="nw-spin" />
                ) : (
                  <Icon name={alert.icon} size={14} />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className="block text-[13px] font-[600]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {alert.t}
                </span>
                <span
                  className="block text-[11.5px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {alert.d}
                </span>
              </span>
            </motion.div>
          </AnimatePresence>
          <div className="mt-2.5 flex gap-1">
            {HERO_ALERTS.map((heroAlert, i) => (
              <span
                key={i}
                className="h-[3px] flex-1 rounded-full transition-colors duration-500"
                style={{
                  background: i <= alertIndex ? alert.tone : "rgba(150,170,255,.14)",
                }}
              />
            ))}
          </div>
        </div>
        <span
          className="absolute top-full h-5 w-px"
          style={{
            left: "var(--ax)",
            background: `linear-gradient(${alert.tone}, transparent)`,
          }}
        />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-36 sm:pt-44">
      <div aria-hidden={true} className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 60% at 50% 120%, rgba(255,120,90,.20), transparent 60%), radial-gradient(60% 50% at 80% 0%, rgba(80,100,255,.18), transparent 70%)",
          }}
        />
        <Stars />
      </div>
      <div className={CONTAINER}>
        <Reveal y={10}>
          <a
            href="#product"
            className="nw-ring group inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] shadow-[inset_0_0_0_1px_rgba(150,170,255,.16)] transition-colors hover:bg-white/[.04]"
            style={{
              color: COLORS.text,
            }}
          >
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-[650] text-[#1C0F09]"
              style={{
                background: DAWN_GRADIENT,
              }}
            >
              New
            </span>
            Postmortems that write themselves
            <Icon name="ph:arrow-right" size={12} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </Reveal>
        <SplitHeading
          as="h1"
          text={`Sleep through
the page.`}
          delay={0.1}
          className="mt-6 text-[clamp(52px,9vw,120px)] font-[560] leading-[0.94] tracking-[-0.05em]"
          style={{
            color: COLORS.ink,
          }}
        />
        <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Reveal delay={0.45}>
            <p
              className="max-w-[500px] text-[17.5px] leading-[1.6]"
              style={{
                color: COLORS.text,
              }}
            >
              Nightwatch triages every alert, wakes only the person who can fix it and has the rollback ready before
              they open the laptop.
            </p>
          </Reveal>
          <Reveal delay={0.55} className="flex flex-wrap gap-3">
            <Button size="lg" icon="ph:arrow-right" href="#pricing">
              Start free
            </Button>
            <Button size="lg" kind="glass" href="#product">
              See it handle a page
            </Button>
          </Reveal>
        </div>
      </div>
      <motion.div
        initial={{
          clipPath: "inset(0 100% 0 0)",
        }}
        animate={{
          clipPath: "inset(0 0% 0 0)",
        }}
        transition={{
          duration: 1.8,
          delay: 0.5,
          ease: [0.65, 0, 0.35, 1],
        }}
        className="relative mt-10 h-[260px] sm:h-[320px]"
      >
        <AlertStorm />
      </motion.div>
    </section>
  );
}

function Stars() {
  const stars = useMemo(() => {
    const random = seededRandom(21);
    return Array.from(
      {
        length: 90,
      },
      () => [random() * 100, random() * 62, random() * 1.2 + 0.3, random() * 6, random() * 4 + 3],
    );
  }, []);
  return (
    <svg className="absolute inset-0 h-full w-full">
      {stars.map(([x, y, size, delay, duration], i) => (
        <circle
          key={i}
          cx={`${x}%`}
          cy={`${y}%`}
          r={size}
          fill="#DDE4FF"
          style={{
            animation: `nw-twinkle ${duration}s ease-in-out ${-delay}s infinite`,
          }}
        />
      ))}
    </svg>
  );
}
