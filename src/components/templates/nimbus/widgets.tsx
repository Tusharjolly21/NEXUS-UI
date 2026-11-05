"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Icon, type IconName } from "./icons";
import { LiveSky } from "./sky/live-sky";
import { EASE, INK, MUTED } from "./theme";
import { ForecastRow, Reveal, SectionTitle } from "./ui";
import { HOURLY, TEN_DAY, WEATHER, type Condition } from "./weather";

/** The widgets are laid out at this height; the row is scaled down if the window is too short for it. */
const ROW_HEIGHT = 362;
const SMALL = "h-[170px] w-[170px]";
const MEDIUM = "h-[170px] w-[360px]";
const LARGE = "h-[360px] w-[360px]";

const AQI_GRADIENT = "linear-gradient(90deg,#34c759,#ffd60a,#ff9f0a,#ff3b30,#af52de)";

/** A widget: a rounded tile with its own small live sky behind the content. */
function Widget({ condition, className, children }: { condition: Condition; className: string; children: ReactNode }) {
  const { sky } = WEATHER[condition];
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[26px] text-white ${className}`}
      style={{
        background: `linear-gradient(180deg, ${sky[0]}, ${sky[1]})`,
        boxShadow: "0 30px 50px -28px rgba(0,0,0,.5), inset 0 0 0 .5px rgba(255,255,255,.2)",
        textShadow: "0 1px 2px rgba(0,0,0,.15)",
      }}
    >
      <LiveSky mode={condition} density={0.14} moonless />
      <div className="relative h-full p-4">{children}</div>
    </div>
  );
}

function CityHeader({ city, temp, icon, summary, range }: { city: string; temp: string; icon: IconName; summary: string; range: string }) {
  return (
    <div className="flex justify-between">
      <div>
        <div className="text-[13px] font-semibold">{city}</div>
        <div className="text-[40px] font-light leading-none tracking-[-0.04em]">{temp}</div>
      </div>
      <div className="text-right text-[12.5px] font-semibold">
        <Icon name={icon} size={18} className="ml-auto" />
        <div>{summary}</div>
        <div className="opacity-85">{range}</div>
      </div>
    </div>
  );
}

/** A ring that fills to `fraction` of a 270-degree gauge when the lock screen scrolls into view. */
function Gauge({ label, fraction, color, caption }: { label: string; fraction: number; color: string; caption: string }) {
  return (
    <div className="relative grid h-[72px] w-[72px] place-items-center rounded-full" style={{ background: "rgba(255,255,255,.1)", backdropFilter: "blur(10px)" }}>
      <svg viewBox="0 0 72 72" className="absolute inset-0">
        <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="5" strokeDasharray="141 200" transform="rotate(135 36 36)" strokeLinecap="round" />
        <motion.circle
          cx="36"
          cy="36"
          r="30"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          transform="rotate(135 36 36)"
          initial={{ strokeDasharray: "0 200" }}
          whileInView={{ strokeDasharray: `${141 * fraction} 200` }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE }}
        />
      </svg>
      <div className="text-center leading-none">
        <div className="text-[17px] font-semibold">{label}</div>
        <div className="mt-1 text-[10px] font-semibold opacity-70">{caption}</div>
      </div>
    </div>
  );
}

const LOCK_GAUGES = [
  { label: "24°", fraction: 0.62, color: "#ffd60a", caption: "15  26" },
  { label: "UV", fraction: 0.55, color: "#ff9f0a", caption: "6" },
  { label: "AQI", fraction: 0.21, color: "#34c759", caption: "42" },
];

function LockScreenWidget() {
  return (
    <div
      className="relative h-[170px] w-[360px] shrink-0 overflow-hidden rounded-[26px] p-4 text-white"
      style={{ background: "radial-gradient(120% 140% at 20% 0%, #3a4a7a, #0d1330 70%)", boxShadow: "0 30px 50px -28px rgba(0,0,0,.5)" }}
    >
      <div className="text-[13px] font-semibold opacity-80">Lock Screen</div>
      <div className="mt-3 flex items-center gap-4">
        {LOCK_GAUGES.map((gauge) => (
          <Gauge key={gauge.label} {...gauge} />
        ))}
        <div className="min-w-0 flex-1 text-[13px] font-semibold leading-[1.3]">
          <div className="flex items-center gap-1.5">
            <Icon name="cloud-rain-fill" size={14} />
            Rain at 16:12
          </div>
          <div className="mt-1 opacity-70">Stops by 16:23</div>
        </div>
      </div>
    </div>
  );
}

/** Twenty-four bars of next-hour rain for the small widget. */
const WIDGET_BARS = Array.from({ length: 24 }, (_, i) => (i < 5 ? 6 : Math.round(20 + Math.sin(i / 3) * 30 + 40)));

/** The row of widgets, in the order they scroll past. */
function WidgetRow() {
  return (
    <>
      <Widget condition="sunny" className={SMALL}>
        <div className="text-[13px] font-semibold">Amsterdam</div>
        <div className="text-[46px] font-light leading-none tracking-[-0.04em]">24°</div>
        <Icon name="sun-fill" size={20} style={{ color: "#ffd60a" }} className="mt-4" />
        <div className="text-[12.5px] font-semibold">Sunny</div>
        <div className="text-[12.5px] font-medium opacity-85">H:26° L:15°</div>
      </Widget>

      <Widget condition="rain" className={MEDIUM}>
        <CityHeader city="London" temp="14°" icon="cloud-rain-fill" summary="Rain" range="H:16° L:11°" />
        <div className="mt-3 grid grid-cols-6 text-center text-[12px] font-medium">
          {HOURLY.rain.map((hour) => (
            <div key={hour.time} className="flex flex-col items-center gap-1">
              <span className="opacity-85">{hour.time}</span>
              <Icon name={hour.icon} size={16} />
              <span>{hour.temp}°</span>
            </div>
          ))}
        </div>
      </Widget>

      <Widget condition="storm" className={SMALL}>
        <div className="text-[13px] font-semibold">Next hour</div>
        <div className="mt-1 text-[15px] font-semibold leading-[1.2]">Rain in 12 min</div>
        <div className="mt-5 flex h-[56px] items-end gap-[2px]">
          {WIDGET_BARS.map((height, i) => (
            <span key={i} className="flex-1 rounded-t-[1px]" style={{ height: `${height}%`, background: i < 5 ? "rgba(255,255,255,.3)" : "#5ac8fa" }} />
          ))}
        </div>
      </Widget>

      <Widget condition="night" className={LARGE}>
        <CityHeader city="Reykjavík" temp="2°" icon="moon-stars-fill" summary="Clear" range="H:4° L:-1°" />
        <div className="mt-3">
          {TEN_DAY.slice(0, 6).map((entry) => (
            <ForecastRow key={entry.day + entry.low} day={entry.day} icon={entry.icon} low={entry.low - 12} high={entry.high - 12} min={-4} max={18} glass />
          ))}
        </div>
      </Widget>

      <Widget condition="snow" className={SMALL}>
        <div className="text-[13px] font-semibold">Air quality</div>
        <div className="mt-1 text-[46px] font-light leading-none tracking-[-0.04em]">42</div>
        <div className="text-[13px] font-semibold">Good</div>
        <div className="relative mt-6 h-1.5 rounded-full" style={{ background: AQI_GRADIENT }}>
          <span className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white" style={{ left: "18%", boxShadow: "0 0 0 2px rgba(0,0,0,.2)" }} />
        </div>
      </Widget>

      <Widget condition="sunny" className={MEDIUM}>
        <div className="flex h-full items-center gap-5">
          <Icon name="sun-horizon" size={44} style={{ color: "#ffd60a" }} />
          <div>
            <div className="text-[13px] font-semibold opacity-85">Sunset</div>
            <div className="text-[40px] font-light leading-none tracking-[-0.04em]">20:58</div>
            <div className="mt-1 text-[12.5px] font-semibold opacity-85">Sunrise tomorrow 06:43</div>
          </div>
        </div>
      </Widget>

      <LockScreenWidget />
    </>
  );
}

/**
 * "Widgets for every screen.": a horizontal gallery driven by vertical scroll. The section is taller than the
 * window by exactly the width the row overflows, and the row sticks in place while the page scrolls, sliding
 * left in step. If the window is too short, the whole row scales down to fit.
 *
 * `overflow` and `scale` are measured from the DOM and kept in motion values, so measuring never re-renders.
 */
export function Widgets() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  /** How far (px) the scaled row extends past the right edge of the window. */
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  useEffect(() => {
    const measure = () => {
      const headingHeight = headingRef.current?.offsetHeight ?? 200;
      const fit = Math.max(0.4, Math.min(1, (window.innerHeight - headingHeight - 48 - 40 - 60) / ROW_HEIGHT));
      scale.set(fit);
      const gutter = Math.max(20, (window.innerWidth - 1024) / 2 + 20);
      if (rowRef.current) overflow.set(Math.max(0, rowRef.current.scrollWidth * fit + gutter * 2 - window.innerWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (rowRef.current) observer.observe(rowRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [overflow, scale]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const sectionHeight = useTransform(overflow, (px) => `calc(100vh + ${px}px)`);
  const trackHeight = useTransform(scale, (s) => ROW_HEIGHT * s);
  const travel = useTransform([scrollYProgress, overflow], ([progress, px]: number[]) => -px * Math.min(1, Math.max(0, (progress - 0.04) / 0.92)));
  const x = useSpring(travel, { stiffness: 140, damping: 30, mass: 0.5 });
  const barWidth = useTransform(scrollYProgress, [0.04, 0.96], ["0%", "100%"]);

  return (
    <motion.section id="widgets" ref={sectionRef} className="relative scroll-mt-12" style={{ height: sectionHeight }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-12">
        <div ref={headingRef} className="mx-auto w-full max-w-[1024px] px-5">
          <Reveal>
            <SectionTitle>
              Widgets for
              <br />
              every screen.
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="m-0 mt-5 max-w-[480px] text-[19px] leading-[1.45] [@media(max-height:560px)]:hidden" style={{ color: MUTED }}>
              Small, medium and large, on your home screen and lock screen. Keep scrolling to see them all.
            </p>
          </Reveal>
        </div>
        <motion.div style={{ x, height: trackHeight }} className="relative mt-10 pl-[max(20px,calc((100vw-1024px)/2+20px))]">
          <motion.div ref={rowRef} className="absolute bottom-0 flex w-max items-end gap-5" style={{ scale, originX: 0, originY: 1 }}>
            <WidgetRow />
          </motion.div>
        </motion.div>
        <div className="mx-auto mt-8 w-full max-w-[1024px] px-5">
          <div className="h-[3px] w-40 overflow-hidden rounded-full" style={{ background: "#e5e5ea" }}>
            <motion.div className="h-full rounded-full" style={{ width: barWidth, background: INK, minWidth: 18 }} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
