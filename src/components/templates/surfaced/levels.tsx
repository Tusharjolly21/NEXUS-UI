"use client";

import { useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { AssistantIcon } from "./assistants";
import { COLORS, CONTAINER, FONT_SANS, clamp } from "./theme";
import { Avatar, Button, Reveal } from "./ui";

const LEVELS = ["Findable", "Understood", "Trusted", "Recommended"];

/** Isometric projection of (x, y, z) to SVG [x, y]. */
function iso(x: number, y: number, z: number) {
  return [(x - y) * 0.866, (x + y) * 0.5 - z];
}

function LevelTile({ i: index, prog, hot }: { i: number; prog: MotionValue<number>; hot: boolean }) {
  const place = (amount: number) => {
    const rise = clamp(amount * 4.4 - index * 0.85);
    return {
      z: index * 38 + (1 - rise) * 120,
      o: clamp(rise * 1.4),
    };
  };
  const [pose, setPose] = useState(() => place(prog.get()));
  useMotionValueEvent(prog, "change", (p) => setPose(place(p)));
  const point = (x: number, y: number, depth: number) =>
    iso(x, y, depth)
      .map((v) => v.toFixed(1))
      .join(",");
  const z = pose.z;
  const top = [
    point(-110, -110, z + 10),
    point(110, -110, z + 10),
    point(110, 110, z + 10),
    point(-110, 110, z + 10),
  ].join(" ");
  const front = [point(-110, 110, z + 10), point(110, 110, z + 10), point(110, 110, z), point(-110, 110, z)].join(" ");
  const side = [point(110, -110, z + 10), point(110, 110, z + 10), point(110, 110, z), point(110, -110, z)].join(" ");
  const stroke = hot ? "#8FA3FF" : "rgba(255,255,255,.75)";
  const [labelX, labelY] = iso(110, -110, z + 10 / 2);
  return (
    <g opacity={pose.o}>
      <polygon
        points={front}
        fill={hot ? "rgba(75,107,251,.12)" : "rgba(11,11,12,.92)"}
        stroke={stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <polygon
        points={side}
        fill={hot ? "rgba(75,107,251,.18)" : "rgba(11,11,12,.92)"}
        stroke={stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <polygon
        points={top}
        fill={hot ? "rgba(75,107,251,.10)" : "rgba(11,11,12,.6)"}
        stroke={stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {[
        [-110, -110],
        [110, -110],
        [110, 110],
        [-110, 110],
      ].map(([x, y], i) => {
        const [px, py] = iso(x, y, z + 10);
        return <circle key={i} cx={px} cy={py} r="2" fill="#0B0B0C" stroke={stroke} />;
      })}
      <text
        x={labelX + 14}
        y={labelY + 4}
        fontSize="11"
        fill={hot ? "#C7D2FE" : "rgba(255,255,255,.45)"}
        fontFamily={FONT_SANS}
      >
        {LEVELS[index]}
      </text>
    </g>
  );
}

export function Levels() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));
  const [hot, setHot] = useState(3);
  const [done, setDone] = useState(false);
  useMotionValueEvent(progress, "change", (v) => setDone(v > 0.95));
  const [baseX, baseY] = iso(0, 0, 3 * 38 + 10);
  return (
    <section
      ref={ref}
      className={`${CONTAINER} grid items-center gap-10 pb-32 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]`}
    >
      <div>
        <Reveal>
          <h2
            className="text-[clamp(30px,4vw,44px)] font-[600] leading-[1.08] tracking-[-0.04em]"
            style={{
              color: COLORS.ink,
            }}
          >
            Climb from findable
            <br />
            to first choice
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p
            className="mt-4 max-w-[400px] text-[15px] leading-[1.6]"
            style={{
              color: COLORS.text,
            }}
          >
            Assistants find your pages, then decide whether to trust them, then whether to say your name. Surfaced shows
            which step each question is stuck on, and what moves it up.
          </p>
        </Reveal>
        <Reveal delay={0.14} className="mt-6 flex flex-wrap gap-2.5">
          <Button kind="primary" href="#cta">
            Start free
          </Button>
          <Button kind="dark" href="#faq">
            How scoring works
          </Button>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-8 flex flex-wrap gap-1.5">
            {LEVELS.map((level, i) => (
              <button
                key={level}
                onPointerEnter={() => setHot(i)}
                onFocus={() => setHot(i)}
                onClick={() => setHot(i)}
                className="rounded-full px-3 py-1.5 text-[12.5px] font-[500] transition-colors"
                style={{
                  background: hot === i ? "rgba(75,107,251,.18)" : "rgba(255,255,255,.04)",
                  color: hot === i ? "#C7D2FE" : COLORS.text,
                  boxShadow: `inset 0 0 0 1px ${hot === i ? "rgba(143,163,255,.4)" : COLORS.line}`,
                }}
              >
                {i + 1}
                {". "}
                {level}
              </button>
            ))}
          </div>
        </Reveal>
      </div>
      <div className="relative" aria-hidden={true}>
        <svg viewBox="-230 -250 460 380" className="w-full overflow-visible">
          <defs>
            <pattern
              id="sfgrid"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
              patternTransform="matrix(0.866 0.5 -0.866 0.5 0 0)"
            >
              <path d="M22 0 L0 0 0 22" fill="none" stroke="rgba(255,255,255,.07)" />
            </pattern>
            <radialGradient id="sffade">
              <stop offset=".2" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sfbloom">
              <stop offset="0" stopColor="#4B6BFB" stopOpacity=".55" />
              <stop offset="1" stopColor="#4B6BFB" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sftile" cx=".28" cy="0" r="1.2">
              <stop offset="0" stopColor="#4462F0" />
              <stop offset=".52" stopColor="#1E2B7A" />
              <stop offset="1" stopColor="#0D1238" />
            </radialGradient>
            <linearGradient id="sfpin" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-50">
              <stop offset="0" stopColor="#8FA3FF" />
              <stop offset="1" stopColor="#8FA3FF" stopOpacity=".15" />
            </linearGradient>
            <mask id="sfmask">
              <rect x="-230" y="-120" width="460" height="250" fill="url(#sffade)" />
            </mask>
          </defs>
          <rect x="-230" y="-120" width="460" height="250" fill="url(#sfgrid)" mask="url(#sfmask)" />
          <line x1="0" y1="-250" x2="0" y2="40" stroke="rgba(255,255,255,.12)" strokeDasharray="3 4" />
          {LEVELS.map((level, i) => (
            <LevelTile key={i} i={i} prog={progress} hot={hot === i} />
          ))}
          <g
            transform={`translate(${baseX} ${baseY})`}
            opacity={done ? 1 : 0}
            style={{
              transition: "opacity .5s",
            }}
          >
            {!reduce &&
              done &&
              [0, 1.2].map((delay) => (
                <ellipse key={delay} rx="0" ry="0" fill="none" stroke="#8FA3FF" strokeWidth="1.2">
                  <animate attributeName="rx" values="7;78" dur="2.4s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animate attributeName="ry" values="4;45" dur="2.4s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values=".7;0"
                    dur="2.4s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                </ellipse>
              ))}
            <ellipse rx="9" ry="5.2" fill="#4B6BFB" stroke="#C7D2FE" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="-50" stroke="url(#sfpin)" strokeWidth="1.2" />
            <g
              style={{
                transform: done ? "translateY(0)" : "translateY(10px)",
                transition: "transform .7s cubic-bezier(.2,.9,.3,1.25)",
              }}
            >
              <ellipse cx="0" cy="-66" rx="26" ry="26" fill="url(#sfbloom)" />
              <rect
                x="-16"
                y="-82"
                width="32"
                height="32"
                rx="9"
                fill="url(#sftile)"
                stroke="rgba(196,208,255,.7)"
                strokeWidth="1"
              />
              <rect x="-13" y="-80" width="26" height="12" rx="6" fill="rgba(255,255,255,.14)" />
              <g transform="translate(-11 -77) scale(.92)" fill="none">
                <rect x="7.4" y="7.2" width="2.7" height="4.6" rx="1.35" fill="#fff" />
                <rect x="13.9" y="7.2" width="2.7" height="4.6" rx="1.35" fill="#fff" />
                <path
                  d="M6.6 14.1c1.3 2.35 3.15 3.55 5.4 3.55s4.1-1.2 5.4-3.55"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>
        </svg>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.6,
          }}
          className="absolute right-0 top-[2%] hidden max-w-[210px] sm:flex gap-2 rounded-xl p-2.5 text-[11.5px] leading-[1.4]"
          style={{
            background: "#1C1C1F",
            color: COLORS.ink,
            boxShadow: "0 0 0 1px rgba(255,255,255,.08), 0 18px 30px -14px rgba(0,0,0,.9)",
            animation: "sf-float 5s ease-in-out infinite",
          }}
        >
          <Avatar name="Ines Duarte" size={20} />
          <span>
            <b className="font-[600]">Ines</b>
            {" booking app that fills cancelled slots?"}
          </span>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.9,
          }}
          className="absolute left-[2%] top-[16%] hidden max-w-[210px] sm:flex gap-2 rounded-xl p-2.5 text-[11.5px] leading-[1.4]"
          style={{
            background: "#1C1C1F",
            color: COLORS.text,
            boxShadow: "0 0 0 1px rgba(255,255,255,.08), 0 18px 30px -14px rgba(0,0,0,.9)",
            animation: "sf-float 6s ease-in-out -2s infinite",
          }}
        >
          <AssistantIcon n="ChatGPT" size={18} />
          <span>
            <b
              className="font-[600]"
              style={{
                color: COLORS.ink,
              }}
            >
              Calmchair.
            </b>
            {" It texts your waitlist the moment a slot opens."}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
