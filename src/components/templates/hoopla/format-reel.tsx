"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Doodle } from "./doodles";
import { BOUNCY, COLOR, EASE, FONT_SANS, INK, SPRING } from "./theme";
import { Avatar, Icon, Sticker, useCycle, useSteps, type Person } from "./ui";
/** text style shared by the hero reel tiles */
export const TILE_TEXT = "text-[clamp(13px,1.2vw,16px)] font-semibold";
/** A chat: "is this an ad?", typing, then "no, it's a mood." */
export function MoodTile() {
  const step = useSteps(3, 700);
  return (
    <div className="flex h-full flex-col items-end justify-center gap-1.5 px-4">
      <motion.span
        initial={{
          scale: 0.4,
          opacity: 0,
          originX: 1,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={BOUNCY}
        className={`rounded-[16px] rounded-br-[5px] px-3 py-1.5 text-white ${TILE_TEXT}`}
        style={{
          background: COLOR.sky,
        }}
      >
        is this an ad?
      </motion.span>
      <AnimatePresence mode="popLayout">
        {step === 1 && (
          <motion.span
            initial={{
              scale: 0.4,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.6,
            }}
            className="mr-auto flex gap-1 rounded-[16px] rounded-bl-[5px] bg-white px-3 py-2.5"
            key="d"
          >
            {[0, 1, 2].map((item) => (
              <motion.i
                className="block h-1.5 w-1.5 rounded-full"
                style={{
                  background: COLOR.muted,
                }}
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: item * 0.1,
                }}
                key={item}
              />
            ))}
          </motion.span>
        )}
        {step === 2 && (
          <motion.span
            initial={{
              scale: 0.4,
              opacity: 0,
              originX: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={BOUNCY}
            className={`mr-auto rounded-[16px] rounded-bl-[5px] bg-white px-3 py-1.5 ${TILE_TEXT}`}
            style={{
              color: INK,
            }}
            key="a"
          >
            no, it’s a mood.
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
export function ScrollTile() {
  return (
    <div className="flex h-full items-center justify-center gap-4 px-4">
      <div
        className="relative h-[82%] overflow-hidden rounded-[12px]"
        style={{
          aspectRatio: "9 / 15",
          background: `linear-gradient(160deg, ${COLOR.orange}, ${COLOR.pink} 60%, ${COLOR.lilac})`,
          boxShadow: `0 0 0 2px ${INK}`,
        }}
      >
        <Doodle
          name="sun"
          size={34}
          className="absolute left-1/2 top-[26%] -translate-x-1/2"
          style={{
            filter: "none",
          }}
        />
        <div className="absolute inset-x-1.5 bottom-1.5 h-1 overflow-hidden rounded-full bg-white/40">
          <motion.div
            className="h-full bg-white"
            initial={{
              width: "0%",
            }}
            animate={{
              width: "100%",
            }}
            transition={{
              duration: 2.6,
              ease: "linear",
            }}
          />
        </div>
        {[0, 1, 2].map((item) => (
          <motion.span
            className="absolute right-1.5 text-white"
            initial={{
              bottom: 10,
              opacity: 0,
            }}
            animate={{
              bottom: [10, 60],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.4,
              delay: 0.3 + item * 0.5,
            }}
            key={item}
          >
            <Icon name="ph:heart-fill" size={12} />
          </motion.span>
        ))}
      </div>
      <span
        className={TILE_TEXT}
        style={{
          color: INK,
        }}
      >
        that scrolls
      </span>
    </div>
  );
}
export function DesignTile() {
  const step = useSteps(3, 800);
  return (
    <div className="relative flex h-full items-center justify-center gap-2 px-4">
      <motion.span
        initial={{
          y: -70,
          rotate: -24,
        }}
        animate={{
          y: 0,
          rotate: -8,
          scale: step === 2 ? [1, 0.88, 1.08, 1] : 1,
        }}
        transition={{
          ...BOUNCY,
          // springs take two keyframes only, so the squash-and-pop runs on a short tween
          scale: { duration: 0.45, ease: "easeOut" },
        }}
        className="inline-block"
      >
        <Sticker
          size={22}
          bg={COLOR.orange}
          color="#fff"
          font={FONT_SANS}
          style={{
            fontWeight: 700,
          }}
        >
          Design
        </Sticker>
      </motion.span>
      <span
        className={TILE_TEXT}
        style={{
          color: INK,
        }}
      >
        that clicks
      </span>
      <motion.svg
        width="20"
        height="22"
        viewBox="0 0 30 34"
        className="absolute"
        initial={{
          left: "85%",
          top: "90%",
        }}
        animate={{
          left: step >= 1 ? "36%" : "85%",
          top: step >= 1 ? "52%" : "90%",
          scale: step === 2 ? 0.8 : 1,
        }}
        transition={{
          duration: 0.6,
          ease: EASE,
        }}
      >
        <path
          d="M3 2 L26 17 L15 19.5 L20 30 L15.5 32 L10.5 21.5 L3 28 Z"
          fill="#fff"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  );
}
export function CreatorTile() {
  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        className="absolute right-[18%] top-1/2 h-[220%] w-[160%] origin-right"
        style={{
          y: "-50%",
          clipPath: "polygon(0 18%, 100% 49%, 100% 51%, 0 82%)",
          background:
            "linear-gradient(90deg, rgba(126,190,255,.95), rgba(126,190,255,.5))",
        }}
        initial={{
          rotate: -14,
        }}
        animate={{
          rotate: [-14, 10, -4],
        }}
        transition={{
          duration: 2.6,
          ease: "easeInOut",
        }}
      />
      <span
        className="absolute right-[18%] top-1/2 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full"
        style={{
          background: "#1E8EF0",
          boxShadow: "0 0 0 3px #fff",
        }}
      />
      <motion.span
        className={`absolute left-4 top-1/2 -translate-y-1/2 ${TILE_TEXT}`}
        style={{
          color: INK,
        }}
        initial={{
          opacity: 0,
          x: -10,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          delay: 0.3,
        }}
      >
        for creators
      </motion.span>
    </div>
  );
}
export function NotificationTile() {
  const notes: [name: Person, action: string][] = [
    ["Ivy Chen", "saved your post"],
    ["Eli Navarro", "sent it to 4 friends"],
    ["Freya Bell", "needs this, now"],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-1 px-2.5 py-2">
      {notes.map(([name, action], index) => (
        <motion.div
          initial={{
            y: 30,
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          transition={{
            ...SPRING,
            delay: index * 0.28,
          }}
          className="flex items-center gap-2 rounded-[10px] bg-white px-2 py-1"
          style={{
            boxShadow: "0 3px 8px -4px rgba(11,18,51,.3)",
          }}
          key={name}
        >
          <Avatar name={name} size={22} />
          <span
            className="min-w-0 flex-1 truncate text-[11.5px] leading-tight"
            style={{
              color: INK,
            }}
          >
            <b className="font-semibold">{name.split(" ")[0]}</b>{" "}
            <span
              style={{
                color: COLOR.muted,
              }}
            >
              {action}
            </span>
          </span>
          <span
            className="text-[10px]"
            style={{
              color: COLOR.muted,
            }}
          >
            now
          </span>
        </motion.div>
      ))}
    </div>
  );
}
export const FORMAT_TILES = [
  MoodTile,
  ScrollTile,
  DesignTile,
  CreatorTile,
  NotificationTile,
];
/** The hero reel: one format tile after another, swapped every 2.9 seconds once the intro is done. */
export function FormatReel({ on }: { on: boolean }) {
  const current = useCycle(FORMAT_TILES.length, 2900, on);
  const Tile = FORMAT_TILES[current]!;
  return (
    <div
      role="img"
      aria-label="A loop of the formats we make: chat, short video, design, creator campaigns and the reactions they get."
      className="relative h-full w-full overflow-hidden rounded-[18px]"
      style={{
        background: "#ECEEF4",
        boxShadow: "inset 0 0 0 1px rgba(11,18,51,.06)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          className="absolute inset-0"
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -12,
          }}
          transition={{
            duration: 0.3,
          }}
          key={current}
        >
          <Tile />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
