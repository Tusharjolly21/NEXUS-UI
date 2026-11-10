"use client";

import { Fragment, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Cover } from "./cover";
import { AUTHOR_ROLES, CATEGORIES, HERO_STORIES, STORIES, getCategory, type Category } from "./data";
import { Newsletter } from "./newsletter";
import { COLOR, CONTAINER, EASE, SPRING } from "./theme";
import {
  ArrowButton,
  Avatar,
  Icon,
  Link,
  Pill,
  Reveal,
  RevealHeading,
  SaveButton,
  SectionHead,
  StoryGrid,
  StoryMeta,
} from "./ui";
export function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const SLIDE_MS = 5200;
  const progress = useMotionValue(0);
  useEffect(() => {
    if (paused || reduce) {
      return;
    }
    progress.set(0);
    const c = animate(progress, 1, {
      duration: SLIDE_MS / 1000,
      ease: "linear",
      onComplete: () => setIndex((prev) => (prev + 1) % HERO_STORIES.length),
    });
    return () => c.stop();
  }, [index, paused, reduce, progress]);
  const progressWidth = useTransform(progress, (value) => `${value * 100}%`);
  return (
    <section className="pb-10 pt-10 sm:pt-16">
      <div className={CONTAINER}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1
            className="m-0 max-w-[900px] font-semibold"
            style={{
              fontSize: "clamp(48px, 8vw, 116px)",
              lineHeight: 0.92,
              letterSpacing: "-0.06em",
              color: COLOR.ink,
            }}
          >
            {"Stories worth slowing down for.".split(" ").map((item, index2) => (
              <span className="inline-block overflow-hidden pb-[0.06em] align-top" key={index2}>
                <motion.span
                  className="inline-block whitespace-pre"
                  initial={{
                    y: "105%",
                    rotate: 4,
                  }}
                  animate={{
                    y: "0%",
                    rotate: 0,
                  }}
                  transition={{
                    duration: 1,
                    ease: EASE,
                    delay: 0.1 + index2 * 0.07,
                  }}
                >
                  {index2 === 2 ? (
                    <span className="relative">
                      {item}
                      <motion.span
                        aria-hidden={true}
                        className="absolute inset-x-[-0.04em] bottom-[0.1em] -z-10 h-[0.32em] origin-left"
                        style={{
                          background: COLOR.hi,
                        }}
                        initial={{
                          scaleX: 0,
                        }}
                        animate={{
                          scaleX: 1,
                        }}
                        transition={{
                          duration: 0.8,
                          ease: EASE,
                          delay: 0.9,
                        }}
                      />
                    </span>
                  ) : (
                    item
                  )}{" "}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.7,
              duration: 0.8,
              ease: EASE,
            }}
            className="max-w-[300px] pb-2"
          >
            <p
              className="m-0 text-[15.5px] leading-[1.55]"
              style={{
                color: COLOR.soft,
              }}
            >
              Kiosk is an independent magazine about design, technology and the details of a good life. New stories
              every weekday.
            </p>
          </motion.div>
        </div>
        <div className="mt-10 flex h-[520px] gap-3 max-md:hidden" onMouseLeave={() => setPaused(false)}>
          {HERO_STORIES.map((heroStory, index2) => {
            const d = index === index2;
            return (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  flexGrow: d ? 3.2 : 1,
                }}
                transition={{
                  opacity: {
                    delay: 0.5 + index2 * 0.1,
                    duration: 0.8,
                  },
                  y: {
                    delay: 0.5 + index2 * 0.1,
                    duration: 0.9,
                    ease: EASE,
                  },
                  flexGrow: {
                    type: "spring",
                    stiffness: 160,
                    damping: 26,
                  },
                }}
                style={{
                  flexBasis: 0,
                }}
                className="relative min-w-0 overflow-hidden rounded-[24px]"
                onMouseEnter={() => {
                  setIndex(index2);
                  setPaused(true);
                }}
                key={heroStory.slug}
              >
                <Link
                  to={{
                    page: "article",
                    slug: heroStory.slug,
                  }}
                  className="absolute inset-0 block"
                  label={heroStory.title}
                  cursor="Read"
                >
                  <Cover cover={heroStory.cover} hot={d} className="absolute inset-0" />
                  <motion.span
                    className="absolute inset-0"
                    animate={{
                      opacity: d ? 1 : 0.55,
                    }}
                    style={{
                      background: d ? "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.66))" : "rgba(0,0,0,.18)",
                    }}
                  />
                  <span className="absolute left-4 top-4 flex gap-1.5">
                    <Pill onImage={true}>{getCategory(heroStory.cat).name}</Pill>
                    {heroStory.sponsored && d && <Pill onImage={true}>Sponsored</Pill>}
                  </span>
                  <AnimatePresence>
                    {d ? (
                      <motion.span
                        initial={{
                          opacity: 0,
                          y: 20,
                          filter: "blur(8px)",
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: EASE,
                          delay: 0.15,
                        }}
                        className="absolute inset-x-6 bottom-6 block text-white"
                        key="t"
                      >
                        <StoryMeta story={heroStory} light={true} />
                        <span
                          className="mt-2 block max-w-[560px] text-[clamp(24px,2.6vw,36px)] font-semibold leading-[1.05]"
                          style={{
                            letterSpacing: "-0.035em",
                          }}
                        >
                          {heroStory.title}
                        </span>
                        <span
                          className="mt-3 block max-w-[480px] text-[15px] leading-[1.5]"
                          style={{
                            color: "rgba(255,255,255,.8)",
                          }}
                        >
                          {heroStory.dek}
                        </span>
                      </motion.span>
                    ) : (
                      <motion.span
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="absolute bottom-6 left-5 block origin-bottom-left whitespace-nowrap text-[15px] font-semibold text-white"
                        style={{
                          transform: "rotate(-90deg) translateY(100%)",
                          letterSpacing: "-0.01em",
                        }}
                        key="v"
                      >
                        {heroStory.title.length > 34 ? heroStory.title.slice(0, 34) + "…" : heroStory.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {d && (
                    <span
                      className="absolute inset-x-6 bottom-0 h-[3px] overflow-hidden rounded-full"
                      style={{
                        background: "rgba(255,255,255,.25)",
                      }}
                    >
                      <motion.span
                        className="block h-full"
                        style={{
                          width: progressWidth,
                          background: COLOR.hi,
                        }}
                      />
                    </span>
                  )}
                </Link>
                {d && (
                  <span className="absolute right-4 top-4">
                    <SaveButton slug={heroStory.slug} onImage={true} />
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
        <div
          className="-mx-5 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:hidden"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {HERO_STORIES.map((heroStory) => (
            <Link
              to={{
                page: "article",
                slug: heroStory.slug,
              }}
              className="relative block w-[82%] shrink-0 snap-center overflow-hidden rounded-[22px]"
              key={heroStory.slug}
            >
              <Cover cover={heroStory.cover} className="aspect-[4/5]" />
              <span
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,.66))",
                }}
              />
              <span className="absolute left-3 top-3">
                <Pill onImage={true}>{getCategory(heroStory.cat).name}</Pill>
              </span>
              <span className="absolute inset-x-4 bottom-4 text-white">
                <StoryMeta story={heroStory} light={true} />
                <span
                  className="mt-1.5 block text-[21px] font-semibold leading-[1.1]"
                  style={{
                    letterSpacing: "-0.03em",
                  }}
                >
                  {heroStory.title}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
/** One desk (category) on the home page, with a spotlight that follows the pointer across its cover. */
export function DeskTile({ category, index }: { category: Category; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [spot, setSpot] = useState({
    x: 50,
    y: 50,
  });
  const count = STORIES.filter((story) => story.cat === category.slug).length;
  const track = (event: MouseEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setSpot({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    });
    setHovered(true);
  };
  return (
    <Reveal delay={(index % 6) * 0.04}>
      <Link
        to={{
          page: "category",
          slug: category.slug,
        }}
        cursor="Explore"
        className="group relative block aspect-square overflow-hidden rounded-[20px]"
        style={{
          background: COLOR.panel,
        }}
      >
        <span
          className="absolute inset-0"
          onMouseEnter={track}
          onMouseLeave={(event) => {
            const u = event.currentTarget.getBoundingClientRect();
            setSpot({
              x: ((event.clientX - u.left) / u.width) * 100,
              y: ((event.clientY - u.top) / u.height) * 100,
            });
            setHovered(false);
          }}
        />
        <motion.span
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{
            clipPath: hovered ? `circle(150% at ${spot.x}% ${spot.y}%)` : `circle(0% at ${spot.x}% ${spot.y}%)`,
          }}
          transition={{
            duration: 0.7,
            ease: EASE,
          }}
        >
          <Cover cover={category.cover} hot={hovered} className="absolute inset-0" />
          <span
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,.18)",
            }}
          />
        </motion.span>
        <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
          <span
            className="text-[15px] font-semibold transition-colors duration-300"
            style={{
              color: hovered ? "#fff" : COLOR.ink,
              letterSpacing: "-0.02em",
            }}
          >
            {category.name}
          </span>
          <motion.span
            animate={{
              opacity: hovered ? 1 : 0,
              y: hovered ? 0 : 6,
            }}
            className="mt-1 text-[12px]"
            style={{
              color: "rgba(255,255,255,.85)",
            }}
          >
            {count} {count === 1 ? "story" : "stories"}
          </motion.span>
        </span>
      </Link>
    </Reveal>
  );
}
export function Desks() {
  return (
    <section className="py-16 sm:py-24">
      <div className={CONTAINER}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <RevealHeading
            text="Browse by topic"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
            }}
          />
          <p
            className="m-0 max-w-[280px] text-[14.5px]"
            style={{
              color: COLOR.soft,
            }}
          >
            Twelve desks, one standard. Point at a topic to peek inside.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category, index) => (
            <DeskTile category={category} index={index} key={category.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
export function LatestStories() {
  return (
    <section className="py-16 sm:py-24">
      <div className={CONTAINER}>
        <SectionHead
          title="Fresh off the press"
          sub="The newest stories from every desk."
          to={{
            page: "articles",
          }}
        />
        <StoryGrid stories={STORIES.slice(3, 9)} />
      </div>
    </section>
  );
}
export function EditorsPicks() {
  const picks = [STORIES[9], STORIES[3], STORIES[12], STORIES[15], STORIES[5], STORIES[10], STORIES[16]];
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxScroll, setMaxScroll] = useState(0);
  useEffect(() => {
    // how far the rail can scroll: its content width minus what fits on screen
    const measure = () =>
      setMaxScroll(Math.max(0, (viewportRef.current?.scrollWidth ?? 0) - (trackRef.current?.clientWidth ?? 0)));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const scrolled = useTransform(x, (value) => (maxScroll ? -value / maxScroll : 0));
  const progressScale = useTransform(scrolled, (value) => 0.15 + value * 0.85);
  const nudge = (u: number) => animate(x, Math.max(-maxScroll, Math.min(0, x.get() - u * 380)), SPRING);
  return (
    <section
      className="overflow-hidden py-16 sm:py-24"
      style={{
        background: COLOR.ink,
        color: "#fff",
      }}
    >
      <div className={CONTAINER}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="m-0 text-[13px] font-medium"
              style={{
                color: COLOR.hi,
              }}
            >
              Editor&rsquo;s picks
            </p>
            <h2
              className="m-0 mt-2 font-semibold"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                letterSpacing: "-0.045em",
                lineHeight: 1,
              }}
            >
              Read these first
            </h2>
          </div>
          <div className="flex gap-2">
            {[-1, 1].map((item) => (
              <button
                type="button"
                onClick={() => nudge(item)}
                aria-label={item < 0 ? "Previous" : "Next"}
                className="ks-ring grid h-11 w-11 place-items-center rounded-full outline-none transition-colors hover:bg-white hover:text-black"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)",
                }}
                key={item}
              >
                <Icon name={item < 0 ? "ph:arrow-left" : "ph:arrow-right"} size={16} />
              </button>
            ))}
          </div>
        </div>
        <div ref={trackRef} className="mt-10 cursor-grab active:cursor-grabbing">
          <motion.div
            ref={viewportRef}
            drag="x"
            dragConstraints={{
              left: -maxScroll,
              right: 0,
            }}
            dragElastic={0.08}
            style={{
              x: x,
            }}
            className="flex w-max gap-4"
          >
            {picks.map((pick, index) => (
              <motion.article
                className="group w-[300px] shrink-0 sm:w-[360px]"
                whileHover={{
                  y: -6,
                }}
                transition={SPRING}
                key={pick.slug}
              >
                <div className="relative overflow-hidden rounded-[22px]">
                  <Cover cover={pick.cover} className="pointer-events-none aspect-[4/5]" />
                  <span className="absolute left-3 top-3">
                    <Pill onImage={true}>{getCategory(pick.cat).name}</Pill>
                  </span>
                  <span
                    className="absolute right-3 top-3 text-[44px] font-bold leading-none"
                    style={{
                      color: "rgba(255,255,255,.85)",
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-4">
                  <StoryMeta story={pick} light={true} />
                </div>
                <Link
                  to={{
                    page: "article",
                    slug: pick.slug,
                  }}
                  className="mt-2 block text-[20px] font-semibold leading-[1.15]"
                  style={{
                    letterSpacing: "-0.03em",
                    color: "#fff",
                  }}
                >
                  {pick.title}
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
        <div
          className="mt-8 h-[2px] overflow-hidden rounded-full"
          style={{
            background: "rgba(255,255,255,.14)",
          }}
        >
          <motion.div
            className="h-full origin-left"
            style={{
              scaleX: progressScale,
              background: COLOR.hi,
            }}
          />
        </div>
      </div>
    </section>
  );
}
export function MostRead() {
  const top = [...STORIES].sort((a, b) => b.views - a.views).slice(0, 6);
  const [hovered, setHovered] = useState<number | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const previewX = useSpring(pointerX, {
    stiffness: 260,
    damping: 26,
  });
  const previewY = useSpring(pointerY, {
    stiffness: 260,
    damping: 26,
  });
  const listRef = useRef<HTMLDivElement>(null);
  return (
    <section className="py-16 sm:py-24">
      <div className={CONTAINER}>
        <SectionHead
          title="Most read this month"
          to={{
            page: "articles",
          }}
        />
        <div
          ref={listRef}
          className="relative mt-10"
          onMouseMove={(event) => {
            const u = listRef.current!.getBoundingClientRect();
            pointerX.set(event.clientX - u.left);
            pointerY.set(event.clientY - u.top);
          }}
          onMouseLeave={() => setHovered(null)}
        >
          <ol
            className="m-0 list-none p-0"
            style={{
              borderTop: `1px solid ${COLOR.line}`,
            }}
          >
            {top.map((item, index) => (
              <li
                onMouseEnter={() => setHovered(index)}
                style={{
                  borderBottom: `1px solid ${COLOR.line}`,
                }}
                key={item.slug}
              >
                <Link
                  to={{
                    page: "article",
                    slug: item.slug,
                  }}
                  className="grid grid-cols-[48px_1fr_auto] items-center gap-4 py-6 sm:grid-cols-[80px_1fr_160px_120px]"
                >
                  <span
                    className="text-[28px] font-bold tabular-nums transition-colors duration-300 sm:text-[40px]"
                    style={{
                      letterSpacing: "-0.05em",
                      color: hovered === index ? COLOR.ink : COLOR.faint,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <motion.span
                    animate={{
                      x: hovered === index ? 12 : 0,
                    }}
                    transition={SPRING}
                    className="text-[20px] font-semibold leading-[1.15] sm:text-[28px]"
                    style={{
                      letterSpacing: "-0.035em",
                      color: COLOR.ink,
                    }}
                  >
                    {item.title}
                  </motion.span>
                  <span
                    className="hidden text-[13.5px] sm:block"
                    style={{
                      color: COLOR.soft,
                    }}
                  >
                    {getCategory(item.cat).name}
                  </span>
                  <span
                    className="flex items-center justify-end gap-1.5 text-[13px] tabular-nums"
                    style={{
                      color: COLOR.soft,
                    }}
                  >
                    <Icon name="ph:eye" size={14} />
                    {(item.views / 1000).toFixed(1)}k
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <motion.div
            aria-hidden={true}
            className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block"
            style={{
              x: previewX,
              y: previewY,
            }}
          >
            <AnimatePresence>
              {hovered !== null && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.6,
                    rotate: -8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: -4,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.6,
                  }}
                  transition={SPRING}
                  className="-translate-x-1/2 -translate-y-1/2"
                  style={{
                    marginLeft: 90,
                  }}
                  key="f"
                >
                  <div
                    className="relative h-[200px] w-[260px] overflow-hidden rounded-[18px]"
                    style={{
                      boxShadow: "0 30px 60px -24px rgba(0,0,0,.45)",
                    }}
                  >
                    <AnimatePresence initial={false}>
                      <motion.div
                        className="absolute inset-0"
                        initial={{
                          y: "100%",
                        }}
                        animate={{
                          y: 0,
                        }}
                        exit={{
                          y: "-100%",
                        }}
                        transition={{
                          duration: 0.45,
                          ease: EASE,
                        }}
                        key={hovered}
                      >
                        <Cover cover={top[hovered].cover} className="absolute inset-0" />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
export function AboutTeaser() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const lift = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const drop = useTransform(scrollYProgress, [0, 1], [-30, 50]);
  return (
    <section className="py-16 sm:py-24">
      <div ref={sectionRef} className={`${CONTAINER} grid items-center gap-12 lg:grid-cols-2`}>
        <div className="relative h-[440px] sm:h-[520px]">
          <motion.div
            style={{
              y: lift,
            }}
            className="absolute left-0 top-6 w-[64%] overflow-hidden rounded-[24px]"
          >
            <Cover
              cover={{
                v: 6,
                p: 5,
              }}
              className="aspect-[4/5]"
            />
          </motion.div>
          <motion.div
            style={{
              y: drop,
            }}
            className="absolute bottom-0 right-0 w-[52%] overflow-hidden rounded-[24px]"
          >
            <Cover
              cover={{
                v: 3,
                p: 2,
              }}
              className="aspect-[4/5]"
            />
          </motion.div>
          <motion.div
            style={{
              y: lift,
            }}
            className="absolute right-[8%] top-0 flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-[13px] font-medium shadow-[0_14px_30px_-16px_rgba(0,0,0,.4)]"
          >
            <span className="flex -space-x-2">
              {Object.keys(AUTHOR_ROLES)
                .slice(0, 4)
                .map((item) => (
                  <Avatar name={item} size={28} key={item} />
                ))}
            </span>
            7 editors, 1 desk
          </motion.div>
        </div>
        <div>
          <RevealHeading
            text="Why we write, and who we write for"
            style={{
              fontSize: "clamp(34px, 4.4vw, 56px)",
            }}
          />
          <p
            className="m-0 mt-6 max-w-[480px] text-[17px] leading-[1.6]"
            style={{
              color: COLOR.text,
            }}
          >
            Most news is written to be skimmed. We write for the ten quiet minutes with a coffee. Every story is
            reported, edited twice and checked by someone who did not write it.
          </p>
          <div className="mt-8 grid max-w-[460px] grid-cols-3 gap-4">
            {(
              [
                ["2019", "first issue"],
                ["1.2M", "monthly readers"],
                ["0", "clickbait headlines"],
              ] as const
            ).map(([s, i]) => (
              <div key={i}>
                <div
                  className="text-[32px] font-bold"
                  style={{
                    letterSpacing: "-0.05em",
                  }}
                >
                  {s}
                </div>
                <div
                  className="text-[13px]"
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  {i}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <ArrowButton
              dark={true}
              to={{
                page: "about",
              }}
            >
              About Kiosk
            </ArrowButton>
          </div>
        </div>
      </div>
    </section>
  );
}
export function HomePage() {
  return (
    <Fragment>
      <Hero />
      <Desks />
      <LatestStories />
      <EditorsPicks />
      <MostRead />
      <AboutTeaser />
      <Newsletter />
    </Fragment>
  );
}
