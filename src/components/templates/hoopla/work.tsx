"use client";

import { Fragment, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HEART_PATH } from "./doodles";
import { COLOR, CONTAINER, EASE, FONT_DISPLAY, INK, r2 } from "./theme";
import { Button, Title } from "./ui";
/** The artwork for each case study, drawn in SVG: four scenes. */
export function WorkArt({
  scene,
  className = "",
}: {
  scene: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className={`block h-full w-full ${className}`}
      aria-hidden={true}
    >
      {scene === 0 && (
        <Fragment>
          <rect width="400" height="400" fill="#2D63DB" />
          <path
            d="M-20 300 L420 120 M60 -20 L330 430 M-20 210 L240 -20"
            stroke="#fff"
            strokeWidth="10"
            opacity=".92"
          />
          {(
            [
              [200, 170],
              [272, 228],
              [228, 300],
              [318, 300],
            ] as const
          ).map(([x, y], index) => (
            <g key={index}>
              <ellipse
                cx={x + 22}
                cy={y + 26}
                rx="30"
                ry="14"
                fill="#0B1E5C"
                opacity=".45"
              />
              <circle cx={x} cy={y} r="26" fill="#E6F24A" />
              <path
                d={`M${x - 22} ${y - 10} Q${x} ${y + 4} ${x + 18} ${y - 18} M${x - 18} ${y + 18} Q${x + 2} ${y + 2} ${x + 24} ${y + 10}`}
                stroke="#fff"
                strokeWidth="3"
                fill="none"
                opacity=".85"
              />
            </g>
          ))}
        </Fragment>
      )}
      {scene === 1 && (
        <Fragment>
          <defs>
            <linearGradient id="hp-s1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#7CB9FF" />
              <stop offset="1" stopColor="#CFE6FF" />
            </linearGradient>
            <linearGradient id="hp-can" x1="0" x2="1">
              <stop offset="0" stopColor="#E85A2A" />
              <stop offset=".45" stopColor="#FF8A4C" />
              <stop offset="1" stopColor="#D2491C" />
            </linearGradient>
          </defs>
          <rect width="400" height="400" fill="url(#hp-s1)" />
          <g fill="#fff">
            <circle cx="70" cy="90" r="30" />
            <circle cx="105" cy="78" r="36" />
            <circle cx="140" cy="94" r="26" />
            <rect x="50" y="92" width="110" height="26" rx="13" />
            <circle cx="300" cy="150" r="22" />
            <circle cx="326" cy="140" r="28" />
            <rect x="282" y="152" width="80" height="20" rx="10" />
          </g>
          <g transform="rotate(-12 200 230)">
            <rect
              x="140"
              y="120"
              width="120"
              height="210"
              rx="22"
              fill="url(#hp-can)"
              stroke={INK}
              strokeWidth="4"
            />
            <rect
              x="140"
              y="182"
              width="120"
              height="70"
              fill={COLOR.yellow}
              stroke={INK}
              strokeWidth="4"
            />
            <text
              x="200"
              y="230"
              textAnchor="middle"
              fontFamily={FONT_DISPLAY}
              fontSize="38"
              fill={INK}
            >
              FIZZ
            </text>
            <rect
              x="152"
              y="110"
              width="96"
              height="18"
              rx="7"
              fill="#D9DCE5"
              stroke={INK}
              strokeWidth="4"
            />
            <path
              d="M162 140 V310"
              stroke="#fff"
              strokeWidth="8"
              strokeLinecap="round"
              opacity=".35"
            />
          </g>
          {(
            [
              [96, 260, 10],
              [80, 210, 6],
              [312, 250, 12],
              [330, 300, 7],
              [290, 210, 5],
              [112, 320, 8],
            ] as const
          ).map(([x, y, radius], index) => (
            <circle
              cx={x}
              cy={y}
              r={radius}
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              key={index}
            />
          ))}
        </Fragment>
      )}
      {scene === 2 && (
        <Fragment>
          <defs>
            <linearGradient id="hp-s2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#FF9A5A" />
              <stop offset=".6" stopColor="#FF6F9A" />
              <stop offset="1" stopColor="#C68BFF" />
            </linearGradient>
          </defs>
          <rect width="400" height="400" fill="url(#hp-s2)" />
          <circle cx="200" cy="200" r="70" fill={COLOR.sun} />
          {(
            [
              [230, "#4F9BFF"],
              [268, "#2E6FE0"],
              [306, "#1B4BB5"],
              [344, "#0F2E80"],
            ] as const
          ).map(([x, y], index) => (
            <path
              d={`M0 ${x} Q 50 ${x - 34} 100 ${x} T 200 ${x} T 300 ${x} T 400 ${x} V400 H0 Z`}
              fill={y}
              key={index}
            />
          ))}
          <path
            d="M120 232 q16 -14 32 0"
            stroke="#fff"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            opacity=".7"
          />
        </Fragment>
      )}
      {scene === 3 && (
        <Fragment>
          <rect width="400" height="400" fill="#E9B8F7" />
          {(
            [
              [90, 120, 46, COLOR.pink],
              [300, 90, 40, COLOR.sun],
              [220, 220, 58, "#FF8FB1"],
              [80, 310, 40, COLOR.orange],
              [330, 300, 50, "#fff"],
            ] as const
          ).map(([x, y, size, color], index) => (
            <g key={index}>
              <path
                d={`M${x} ${y + 20} Q ${x + 10} ${y + 120} ${x} 420`}
                stroke="#3E9C64"
                strokeWidth="8"
                fill="none"
              />
              {Array.from(
                {
                  length: 7,
                },
                (_, petal) => {
                  const angle = (petal / 7) * Math.PI * 2;
                  return (
                    <ellipse
                      cx={r2(x + Math.cos(angle) * size * 0.62)}
                      cy={r2(y + Math.sin(angle) * size * 0.62)}
                      rx={size * 0.48}
                      ry={size * 0.34}
                      transform={`rotate(${r2((angle * 180) / Math.PI)} ${r2(x + Math.cos(angle) * size * 0.62)} ${r2(y + Math.sin(angle) * size * 0.62)})`}
                      fill={color}
                      key={petal}
                    />
                  );
                },
              )}
              <circle
                cx={x}
                cy={y}
                r={size * 0.32}
                fill={index === 1 ? COLOR.orange : COLOR.sun}
              />
            </g>
          ))}
        </Fragment>
      )}
      {scene === 4 && (
        <Fragment>
          <rect width="400" height="400" fill="#B49BFF" />
          {Array.from(
            {
              length: 6,
            },
            (_, ring) => (
              <circle
                cx="200"
                cy="210"
                r={60 + ring * 40}
                fill="none"
                stroke="#fff"
                strokeOpacity={0.25 - ring * 0.03}
                strokeWidth="2"
                key={ring}
              />
            ),
          )}
          <g transform="rotate(8 200 210)">
            <rect x="128" y="70" width="144" height="280" rx="26" fill={INK} />
            <rect
              x="138"
              y="80"
              width="124"
              height="260"
              rx="18"
              fill={COLOR.orange}
            />
            <circle cx="200" cy="190" r="34" fill="#fff" />
            <path d="M192 174 L216 190 L192 206 Z" fill={COLOR.orange} />
            <rect
              x="152"
              y="300"
              width="96"
              height="8"
              rx="4"
              fill="#fff"
              opacity=".5"
            />
            <rect x="152" y="300" width="56" height="8" rx="4" fill="#fff" />
          </g>
          {(
            [
              [88, 120],
              [318, 160],
              [96, 290],
            ] as const
          ).map(([x, y], index) => (
            <path
              transform={`translate(${x - 20} ${y - 20}) scale(.4)`}
              d={HEART_PATH}
              fill={index === 1 ? COLOR.sun : COLOR.pink}
              stroke={INK}
              strokeWidth="7"
              key={index}
            />
          ))}
        </Fragment>
      )}
    </svg>
  );
}
/** [category, title, artwork scene] */
export const WORK: [category: string, title: string, scene: number][] = [
  ["Short-form video", "Game, Set, Post", 0],
  ["Creator campaign", "Fizz Friday", 1],
  ["Paid social", "Riding the Wave", 2],
  ["UGC series", "Bloom Season", 3],
];
/** Our work: four case studies in two columns. */
export function Work() {
  return (
    <section id="work" className="scroll-mt-24 bg-white pb-24 sm:pb-36">
      <div className={CONTAINER}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Title>Our work</Title>
          <Button tone="white">See all work</Button>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-14 sm:mt-16 md:grid-cols-2">
          {WORK.map(([category, title, scene], index) => (
            <WorkCard
              category={category}
              title={title}
              scene={scene}
              index={index}
              key={title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
/** A case study in a cloud-bottomed card that tips upright as it scrolls in; the art zooms on hover. */
export function WorkCard({
  category,
  title,
  scene,
  index,
}: {
  category: string;
  title: string;
  scene: number;
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 35%"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [index % 2 ? 9 : -9, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const [hot, setHot] = useState(false);
  return (
    <motion.a
      ref={ref}
      href="#"
      onClick={(event) => event.preventDefault()}
      data-cursor="View project"
      style={{
        rotate: rotate,
        y: y,
      }}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      className="hp-ring group block rounded-[24px] text-center no-underline outline-none"
    >
      <div
        className="relative aspect-[1/1] w-full"
        style={{
          clipPath: "url(#hp-cloudcard)",
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: hot ? 1.07 : 1,
          }}
          transition={{
            duration: 0.8,
            ease: EASE,
          }}
        >
          <WorkArt scene={scene} />
        </motion.div>
      </div>
      <p
        className="m-0 mt-1 text-[16px] font-medium"
        style={{
          color: COLOR.muted,
        }}
      >
        {category}
      </p>
      <h3
        className="m-0 mt-1 text-[clamp(30px,3.6vw,48px)] font-semibold"
        style={{
          color: INK,
          letterSpacing: "-0.05em",
          lineHeight: 1.05,
        }}
      >
        {title}
      </h3>
    </motion.a>
  );
}
