"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SECURITY_POINTS, type SecurityPoint } from "./data";
import { COLOR, CONTAINER, EASE, FONT_MONO, r2 } from "./theme";
import { Mono, Reveal, TextLink } from "./ui";
export function AuditArt({ hot }: { hot: boolean }) {
  return (
    <svg viewBox="0 0 240 150" className="h-full w-full" aria-hidden={true}>
      {[10, 5, 0].map((item, index) => (
        <motion.g
          animate={{
            rotate: hot ? (2 - index) * -3 : (2 - index) * -1.5,
            x: hot ? (2 - index) * -4 : 0,
          }}
          style={{
            originX: "130px",
            originY: "120px",
          }}
          filter="url(#wf-tight)"
          key={index}
        >
          <rect x={76 + item} y={24 - item} width="118" height="92" rx="3" fill="#FFFFFF" />
        </motion.g>
      ))}
      <text x="88" y="38" fontFamily={FONT_MONO} fontSize="6.5" fill="#9EA2AA">
        AUDIT 03 / 03
      </text>
      <text x="172" y="38" fontFamily={FONT_MONO} fontSize="6.5" fill="#9EA2AA">
        PASS
      </text>
      {[50, 58, 66, 74].map((item, index) => (
        <rect x="88" y={item} width={index === 3 ? 60 : 90} height="3" rx="1.5" fill="#E2E5EA" key={item} />
      ))}
      <path d="M140 96 c 4 -10 8 6 12 -2 s 6 4 10 0" fill="none" stroke="#2B2D33" strokeWidth="1.2" />
      <motion.g
        initial={false}
        animate={{
          scale: hot ? [1.4, 0.92, 1] : 1,
          y: hot ? [-30, 0, 0] : 0,
        }}
        transition={{
          duration: 0.5,
          ease: EASE,
        }}
        style={{
          originX: "86px",
          originY: "88px",
        }}
      >
        <path d="M74 104 l-6 22 l10 -6 l6 10 l4 -22 z M98 104 l6 22 l-10 -6 l-6 10 l-4 -22 z" fill={COLOR.blue} />
        <circle cx="86" cy="90" r="22" fill="url(#wf-coin-d)" filter="url(#wf-tight)" />
        <circle cx="86" cy="90" r="15" fill="none" stroke="rgba(255,255,255,.2)" />
        <path
          d="M78 90 l6 6 l10 -12"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  );
}
export function UptimeArt({ hot }: { hot: boolean }) {
  const circumference = Math.PI * 2 * 44;
  return (
    <svg viewBox="0 0 240 150" className="h-full w-full" aria-hidden={true}>
      <circle cx="120" cy="75" r="62" fill="url(#wf-dial)" filter="url(#wf-soft)" />
      <circle cx="120" cy="75" r={44} fill="none" stroke="#E5E8EC" strokeWidth="9" />
      <motion.circle
        cx="120"
        cy="75"
        r={44}
        fill="none"
        stroke="#4CC38A"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circumference}
        transform="rotate(-90 120 75)"
        initial={{
          strokeDashoffset: circumference,
        }}
        whileInView={{
          strokeDashoffset: circumference * 0.0001 + (hot ? 0 : circumference * 0.004),
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 1.6,
          ease: EASE,
        }}
      />
      {Array.from(
        {
          length: 24,
        },
        (r, i) => {
          const s = (i / 24) * Math.PI * 2;
          return (
            <line
              x1={r2(120 + Math.cos(s) * 33)}
              y1={r2(75 + Math.sin(s) * 33)}
              x2={r2(120 + Math.cos(s) * 35.5)}
              y2={r2(75 + Math.sin(s) * 35.5)}
              stroke="#C3C7CE"
              key={i}
            />
          );
        },
      )}
      <text x="117" y="79" textAnchor="middle" fontSize="15" fontWeight="600" fill="#2B2D33">
        99.99
      </text>
      <text x="140" y="78" fontSize="7" fill="#9EA2AA">
        %
      </text>
      <text x="120" y="91" textAnchor="middle" fontFamily={FONT_MONO} fontSize="6" fill="#9EA2AA">
        12 MO
      </text>
      <motion.circle
        cx="120"
        cy={31}
        r="4"
        fill="#4CC38A"
        style={{
          originX: "120px",
          originY: "75px",
        }}
        animate={{
          rotate: hot ? 360 : 0,
        }}
        transition={{
          duration: 1.4,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}
export function KeysArt({ hot }: { hot: boolean }) {
  return (
    <svg viewBox="0 0 240 150" className="h-full w-full" aria-hidden={true}>
      <g filter="url(#wf-soft)">
        <rect x="70" y="18" width="100" height="112" rx="16" fill="#2A2C31" />
        <rect x="76" y="24" width="88" height="100" rx="12" fill="#34363C" />
      </g>
      <rect x="164" y="48" width="6" height="16" rx="2" fill="#1F2125" />
      <rect x="164" y="88" width="6" height="16" rx="2" fill="#1F2125" />
      <motion.g
        style={{
          originX: "120px",
          originY: "74px",
        }}
        animate={{
          rotate: hot ? [0, 140, 60, 210] : 0,
        }}
        transition={{
          duration: 1.4,
          ease: "easeInOut",
        }}
      >
        <circle cx="120" cy="74" r="30" fill="url(#wf-coin-g)" />
        {Array.from(
          {
            length: 40,
          },
          (t, index) => {
            const r = (index / 40) * Math.PI * 2;
            return (
              <line
                x1={r2(120 + Math.cos(r) * 26)}
                y1={r2(74 + Math.sin(r) * 26)}
                x2={r2(120 + Math.cos(r) * (index % 5 ? 28.5 : 30))}
                y2={r2(74 + Math.sin(r) * (index % 5 ? 28.5 : 30))}
                stroke="#5B5F67"
                strokeWidth=".9"
                key={index}
              />
            );
          },
        )}
        <circle cx="120" cy="74" r="14" fill="#C9CDD4" />
        <rect x="118" y="58" width="4" height="12" rx="2" fill="#5B5F67" />
      </motion.g>
      <circle cx="120" cy="40" r="2" fill={hot ? "#4ADE80" : COLOR.blue} />
    </svg>
  );
}
export function Security() {
  return (
    <section id="security" className="scroll-mt-20 pb-24 sm:pb-32">
      <div className={CONTAINER}>
        <div
          className="flex flex-wrap items-end justify-between gap-6 pb-10"
          style={{
            borderBottom: `1px solid ${COLOR.line}`,
          }}
        >
          <h2
            className="m-0 font-medium"
            style={{
              fontSize: "clamp(34px, 4.4vw, 58px)",
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
            }}
          >
            <span
              style={{
                color: "#74777E",
              }}
            >
              Built to be
            </span>
            <br />
            <span
              style={{
                color: COLOR.ink,
              }}
            >
              boring.
            </span>
          </h2>
          <div className="max-w-[340px]">
            <p
              className="m-0 text-[15.5px]"
              style={{
                color: COLOR.text,
              }}
            >
              Money infrastructure should be the least exciting part of your stack.
            </p>
            <div className="mt-2">
              <TextLink>Read the security overview</TextLink>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {SECURITY_POINTS.map((securityPoint, index) => (
            <SecurityCard point={securityPoint} index={index} key={securityPoint.n} />
          ))}
        </div>
      </div>
    </section>
  );
}
export function SecurityCard({ point, index }: { point: SecurityPoint; index: number }) {
  const [hot, setHot] = useState(false);
  const Art = point.Art;
  return (
    <Reveal delay={index * 0.08}>
      <div
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        className="relative flex flex-col items-center rounded-[24px] px-6 pb-8 pt-6 text-center transition-colors duration-300"
        style={{
          background: hot ? "#EEF0F3" : "#F1F2F4",
        }}
      >
        <Mono
          className="absolute right-6 top-5 text-[11px]"
          style={{
            color: COLOR.faint,
          }}
        >
          #{index + 1}
        </Mono>
        <div className="aspect-[8/5] w-full max-w-[260px]">
          <Art hot={hot} />
        </div>
        <h3
          className="m-0 mt-3 text-[20px] font-medium tracking-[-0.02em]"
          style={{
            color: COLOR.ink,
          }}
        >
          {point.n}
        </h3>
        <span
          className="my-4 block h-px w-20"
          style={{
            background: COLOR.line2,
          }}
        />
        <p
          className="m-0 text-[14.5px]"
          style={{
            color: COLOR.text,
          }}
        >
          {point.d}
        </p>
        <div className="mt-4">
          <TextLink>{point.l}</TextLink>
        </div>
      </div>
    </Reveal>
  );
}
