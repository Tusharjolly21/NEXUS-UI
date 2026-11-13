"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { COLORS, CONTAINER, EASE, FONT_MONO, SPECTRUM } from "./theme";
import { Button, Icon, LogoMark, TwoToneHeading } from "./ui";

function PostArt({ v: variant }: { v: number }) {
  const frameClass = "relative h-full w-full overflow-hidden";
  return variant === 0 ? (
    <div
      className={frameClass}
      style={{
        background: "linear-gradient(160deg,#2B1FD6 0%,#120B5C 55%,#06051A 100%)",
      }}
    >
      <div className="absolute inset-0 grid place-items-center">
        <span className="flex items-center gap-2 text-[30px] font-[480] tracking-[-0.03em] text-white">
          <LogoMark size={30} mono="#fff" />
          Draft 2
        </span>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: `radial-gradient(60% 80% at 50% 120%, ${SPECTRUM[2]}88, transparent)`,
        }}
      />
    </div>
  ) : variant === 1 ? (
    <div className={`${frameClass} bg-black`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 m-auto h-[78%]">
        {[80, 62, 44].map((n, i) => (
          <circle
            key={n}
            cx="100"
            cy="100"
            r={n}
            fill="none"
            stroke="rgba(255,255,255,.14)"
            strokeDasharray={i === 0 ? "2 6" : undefined}
          />
        ))}
        <circle
          cx="100"
          cy="100"
          r="62"
          fill="none"
          stroke={SPECTRUM[3]}
          strokeWidth="3"
          strokeDasharray="120 400"
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
        <line x1="100" y1="100" x2="100" y2="58" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <line x1="100" y1="100" x2="128" y2="112" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <text x="100" y="186" textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="13" fontFamily={FONT_MONO}>
          03:00 nightly
        </text>
      </svg>
    </div>
  ) : variant === 2 ? (
    <div
      className={frameClass}
      style={{
        background: "linear-gradient(160deg,#EFEDFF,#FCEFF7)",
      }}
    >
      <div className="absolute inset-x-[14%] top-[20%] rounded-xl bg-white p-3 shadow-[0_14px_30px_-16px_rgba(75,59,255,.5)]">
        {["Tests cover the bug", "Tests fail before fix", "Tests pass after fix"].map((n, i) => (
          <p
            key={n}
            className="flex items-center gap-2 py-1 text-[11.5px]"
            style={{
              color: COLORS.ink,
            }}
          >
            <span
              className="grid size-4 place-items-center rounded"
              style={{
                background: i < 2 ? SPECTRUM[0] : "#E6E7EB",
                color: "#fff",
              }}
            >
              {i < 2 && <Icon name="ph:check" size={10} />}
            </span>
            {n}
          </p>
        ))}
      </div>
    </div>
  ) : variant === 3 ? (
    <div
      className={`${frameClass} bg-[#0B0C10] p-5`}
      style={{
        fontFamily: FONT_MONO,
      }}
    >
      <p className="text-[22px] text-white">
        <span
          style={{
            color: SPECTRUM[3],
          }}
        >
          ›
        </span>
        {" updraft"}
        <span
          className="ud-blink ml-1 inline-block h-5 w-2.5 translate-y-1"
          style={{
            background: SPECTRUM[3],
          }}
        />
      </p>
      <p className="mt-2 text-[12px] text-white/45">Shell 1.0 · stable</p>
      <div className="absolute bottom-5 left-5 right-5 space-y-1.5">
        {[70, 52, 84].map((n, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full bg-white/10"
            style={{
              width: `${n}%`,
            }}
          />
        ))}
      </div>
    </div>
  ) : variant === 4 ? (
    <div
      className={frameClass}
      style={{
        background: "linear-gradient(180deg,#0E1A4F,#060A22)",
      }}
    >
      <div className="absolute inset-[16%] grid grid-cols-7 gap-1.5">
        {Array.from(
          {
            length: 35,
          },
          (n, r) => (
            <span
              key={r}
              className="rounded-[3px]"
              style={{
                background: [3, 9, 10, 16, 17, 18, 24, 31].includes(r) ? `${SPECTRUM[r % 4]}` : "rgba(255,255,255,.08)",
              }}
            />
          ),
        )}
      </div>
    </div>
  ) : variant === 5 ? (
    <div
      className={frameClass}
      style={{
        background: "linear-gradient(140deg,#FFE7D6,#FFD9E6 60%,#E9E3FF)",
      }}
    >
      <div className="absolute inset-x-[12%] top-[26%] overflow-hidden rounded-lg bg-white shadow-[0_14px_30px_-16px_rgba(18,19,23,.4)]">
        <div
          className="flex border-b text-[10.5px]"
          style={{
            borderColor: COLORS.line,
          }}
        >
          <span
            className="px-2.5 py-1.5"
            style={{
              color: COLORS.faint,
            }}
          >
            Main.kt
          </span>
          <span
            className="border-b-2 px-2.5 py-1.5 font-[540]"
            style={{
              borderColor: SPECTRUM[1],
            }}
          >
            Repo.kt
          </span>
        </div>
        <div className="space-y-1.5 p-2.5">
          {[80, 60, 72, 40].map((n, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full"
              style={{
                width: `${n}%`,
                background: i === 2 ? `${SPECTRUM[1]}55` : "#EEEFF2",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  ) : variant === 6 ? (
    <div
      className={frameClass}
      style={{
        background: "linear-gradient(160deg,#FFB547,#FF7A3D)",
      }}
    >
      <p className="absolute left-5 top-3 text-[120px] font-[500] leading-none text-white/35">“</p>
      <p className="absolute bottom-6 left-5 right-5 text-[18px] font-[480] leading-[1.2] tracking-[-0.02em] text-white">
        Name the invariant before you name the change.
      </p>
    </div>
  ) : (
    <div className={`${frameClass} bg-[#0B0C10]`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 m-auto h-[70%]">
        {[90, 70, 50].map((n) => (
          <circle key={n} cx="100" cy="100" r={n} fill="none" stroke="rgba(255,255,255,.08)" />
        ))}
        <path
          d="M100 54 136 68v32c0 22-15 38-36 46-21-8-36-24-36-46V68z"
          fill="none"
          stroke={SPECTRUM[0]}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="m84 100 11 11 22-23"
          fill="none"
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

const POSTS = [
  {
    t: "Draft 2 and scheduled agents",
    d: "Nov 10, 2026",
    tags: ["Model", "Product"],
    v: 0,
  },
  {
    t: "Let agents work the night shift",
    d: "Nov 6, 2026",
    tags: ["Product"],
    v: 1,
  },
  {
    t: "How we test agents that write tests",
    d: "Nov 3, 2026",
    tags: ["Research"],
    v: 2,
  },
  {
    t: "Updraft Shell reaches 1.0",
    d: "Oct 29, 2026",
    tags: ["Release"],
    v: 3,
  },
  {
    t: "Ten thousand sandboxes before breakfast",
    d: "Oct 22, 2026",
    tags: ["Engineering"],
    v: 4,
  },
  {
    t: "Lens comes to JetBrains IDEs",
    d: "Oct 14, 2026",
    tags: ["Release"],
    v: 5,
  },
  {
    t: "A field guide to prompts for refactors",
    d: "Oct 2, 2026",
    tags: ["Guide"],
    v: 6,
  },
  {
    t: "The Updraft security model, in plain words",
    d: "Sep 24, 2026",
    tags: ["Security"],
    v: 7,
  },
];

export function Journal() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState([true, false]);
  const measure = () => {
    const track = trackRef.current;
    if (track) {
      setEdges([track.scrollLeft < 8, track.scrollLeft + track.clientWidth > track.scrollWidth - 8]);
    }
  };
  useEffect(
    () => (measure(), window.addEventListener("resize", measure), () => window.removeEventListener("resize", measure)),
    [],
  );
  const scrollBy = (dir: number) => {
    const track = trackRef.current;
    if (track) {
      track.scrollBy({
        left: dir * Math.max(320, track.clientWidth * 0.75),
        behavior: "smooth",
      });
    }
  };
  return (
    <section
      id="journal"
      className="scroll-mt-20 border-t py-24 sm:py-28"
      style={{
        borderColor: COLORS.line,
      }}
    >
      <div className={`${CONTAINER} flex items-end justify-between gap-6`}>
        <TwoToneHeading a="From the journal" />
        <Button kind="light" size="sm" icon="ph:arrow-right" href="#journal" className="shrink-0">
          All posts
        </Button>
      </div>
      <div
        ref={trackRef}
        onScroll={measure}
        className="ud-noscroll mt-10 flex snap-x snap-mandatory overflow-x-auto scroll-px-5 sm:scroll-px-8 lg:scroll-px-12"
        style={{
          paddingLeft: "max(20px, calc((100vw - 1320px) / 2 + 48px))",
          paddingRight: 20,
        }}
      >
        {POSTS.map((post, i) => (
          <motion.a
            key={post.t}
            href="#journal"
            initial={{
              opacity: 0,
              y: 24,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: Math.min(i, 4) * 0.07,
              duration: 0.7,
              ease: EASE,
            }}
            className={`ud-ring group w-[78vw] max-w-[320px] shrink-0 snap-start pr-6 sm:w-[300px] ${i ? "border-l pl-6" : ""}`}
            style={{
              borderColor: COLORS.line,
            }}
          >
            <div className="aspect-square overflow-hidden rounded-[18px]">
              <div className="h-full w-full transition-transform duration-700 [transition-timing-function:cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]">
                <PostArt v={post.v} />
              </div>
            </div>
            <h3 className="mt-5 text-[21px] font-[470] leading-[1.18] tracking-[-0.02em]">
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                {post.t}
              </span>
            </h3>
            <p
              className="mt-3 flex flex-wrap gap-x-3 text-[13px]"
              style={{
                color: COLORS.soft,
              }}
            >
              <span className="tabular-nums">{post.d}</span>
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-[520]">
              Read post
              <Icon name="ph:caret-right" size={12} className="transition-transform group-hover:translate-x-1" />
            </span>
          </motion.a>
        ))}
      </div>
      <div className={`${CONTAINER} mt-10`}>
        <div className="inline-flex rounded-full bg-[#F2F3F5] p-1">
          <button
            onClick={() => scrollBy(-1)}
            disabled={edges[0]}
            aria-label="Previous posts"
            className="ud-ring grid size-10 place-items-center rounded-full transition hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Icon name="ph:caret-left" size={16} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={edges[1]}
            aria-label="Next posts"
            className="ud-ring grid size-10 place-items-center rounded-full transition hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Icon name="ph:caret-right" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
