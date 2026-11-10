"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Cover } from "./cover";
import { AUTHOR_ROLES, CATEGORIES, LEGAL, STORIES } from "./data";
import { Newsletter } from "./newsletter";
import { COLOR, CONTAINER, FONT_SANS, FONT_SERIF, SPRING } from "./theme";
import { ArrowButton, Avatar, Icon, Link, Reveal, RevealHeading, SectionHead, type IconName } from "./ui";
export function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const bandX = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const values: [icon: IconName, title: string, body: string][] = [
    ["ph:compass", "Reported, not repackaged", "Every story starts with a conversation, not a press release."],
    ["ph:eye", "Edited twice", "A second editor reads every piece before it goes live."],
    ["ph:sparkle", "Made to last", "We would rather publish one story you remember than five you skim."],
  ];
  return (
    <div className="pt-12 sm:pt-16">
      <div className={CONTAINER}>
        <RevealHeading
          as="h1"
          text="A magazine for the ten quiet minutes"
          style={{
            fontSize: "clamp(44px, 7vw, 100px)",
            letterSpacing: "-0.055em",
            lineHeight: 0.95,
          }}
          className="max-w-[1000px]"
        />
        <Reveal delay={0.2}>
          <p
            className="m-0 mt-8 max-w-[620px] text-[19px] leading-[1.55]"
            style={{
              color: COLOR.text,
              fontFamily: FONT_SERIF,
            }}
          >
            Kiosk started in 2019 as a weekly email between three friends who were tired of skimming. It is now a small,
            independent magazine with seven editors and a little over a million readers a month. We are still tired of
            skimming.
          </p>
        </Reveal>
      </div>
      <div ref={heroRef} className="mt-16 overflow-hidden">
        <motion.div
          style={{
            x: bandX,
          }}
          className="flex w-max gap-4 pl-5"
        >
          {STORIES.slice(0, 10).map((story, i) => (
            <Cover
              cover={story.cover}
              className={`${i % 2 ? "h-[260px] w-[220px]" : "h-[320px] w-[260px]"} shrink-0 rounded-[24px]`}
              key={i}
            />
          ))}
        </motion.div>
      </div>
      <div className={`${CONTAINER} mt-24 grid gap-4 md:grid-cols-3`}>
        {values.map(([s, i, o], index) => (
          <Reveal delay={index * 0.08} key={i}>
            <div
              className="h-full rounded-[24px] p-7"
              style={{
                background: COLOR.panel,
              }}
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-full"
                style={{
                  background: COLOR.hi,
                  color: COLOR.hiInk,
                }}
              >
                <Icon name={s} size={20} />
              </span>
              <h3
                className="m-0 mt-10 text-[22px] font-semibold"
                style={{
                  letterSpacing: "-0.03em",
                }}
              >
                {i}
              </h3>
              <p
                className="m-0 mt-2 text-[15px] leading-[1.55]"
                style={{
                  color: COLOR.soft,
                }}
              >
                {o}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <section className={`${CONTAINER} mt-24`}>
        <SectionHead title="The desk" sub="Seven editors, one long table and a kettle that never cools." />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(AUTHOR_ROLES).map(([s, i], index) => (
            <Reveal delay={(index % 4) * 0.06} key={s}>
              <motion.div
                whileHover={{
                  y: -6,
                }}
                transition={SPRING}
                className="group rounded-[24px] p-3"
                style={{
                  boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
                }}
              >
                <div
                  className="relative grid aspect-square place-items-center overflow-hidden rounded-[18px]"
                  style={{
                    background: COLOR.panel,
                  }}
                >
                  <Cover
                    cover={{
                      v: index % 8,
                      p: (index * 3) % 8,
                    }}
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span className="relative transition-transform duration-500 group-hover:scale-105">
                    <Avatar name={s} size={140} />
                  </span>
                </div>
                <p
                  className="m-0 mt-3 text-[16px] font-semibold"
                  style={{
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s}
                </p>
                <p
                  className="m-0 text-[13.5px]"
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  {i}
                </p>
                <p
                  className="m-0 mt-2 text-[12.5px]"
                  style={{
                    color: COLOR.faint,
                  }}
                >
                  {STORIES.filter((story) => story.author === s).length} stories
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>
      <Newsletter />
    </div>
  );
}
export function ContactPage() {
  const [topic, setTopic] = useState("A story idea");
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const fieldClass = "ks-ring w-full rounded-[14px] border-0 px-4 py-3.5 text-[15px] outline-none transition-shadow";
  const fieldStyle = {
    background: COLOR.panel,
    color: COLOR.ink,
    fontFamily: FONT_SANS,
  };
  return (
    <div className="pb-10 pt-12 sm:pt-16">
      <div className={`${CONTAINER} grid gap-12 lg:grid-cols-[1fr_1fr]`}>
        <div>
          <RevealHeading
            as="h1"
            text="Write to the desk"
            style={{
              fontSize: "clamp(44px, 7vw, 96px)",
              letterSpacing: "-0.055em",
            }}
          />
          <p
            className="m-0 mt-6 max-w-[440px] text-[17px] leading-[1.6]"
            style={{
              color: COLOR.text,
            }}
          >
            Story tips, corrections, partnerships or just a kind word. A real editor reads every message, usually within
            two working days.
          </p>
          <div className="mt-10 grid gap-3">
            {(
              [
                ["ph:envelope-simple", "hello@kiosk.press", "General and story ideas"],
                ["ph:newspaper", "corrections@kiosk.press", "We fix mistakes publicly"],
                ["ph:map-pin", "Studio 4, 18 Linden Lane", "Visits by appointment"],
              ] as const
            ).map(([c, u, d]) => (
              <div
                className="flex items-center gap-4 rounded-[18px] p-4"
                style={{
                  boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
                }}
                key={u}
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-full"
                  style={{
                    background: COLOR.panel,
                  }}
                >
                  <Icon name={c} size={18} />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">{u}</span>
                  <span
                    className="text-[13.5px]"
                    style={{
                      color: COLOR.soft,
                    }}
                  >
                    {d}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="rounded-[28px] p-6 sm:p-8"
          style={{
            boxShadow: `0 0 0 1px ${COLOR.line}, 0 30px 60px -40px rgba(0,0,0,.3)`,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={SPRING}
                className="flex min-h-[460px] flex-col items-center justify-center text-center"
                role="status"
                key="ok"
              >
                <motion.span
                  initial={{
                    scale: 0,
                    rotate: -40,
                  }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 14,
                  }}
                  className="grid h-16 w-16 place-items-center rounded-full"
                  style={{
                    background: COLOR.hi,
                    color: COLOR.hiInk,
                  }}
                >
                  <Icon name="ph:check" size={28} />
                </motion.span>
                <h2
                  className="m-0 mt-6 text-[28px] font-semibold"
                  style={{
                    letterSpacing: "-0.03em",
                  }}
                >
                  Thanks{name ? `, ${name.split(" ")[0]}` : ""}. It&rsquo;s on the desk.
                </h2>
                <p
                  className="m-0 mt-2 max-w-[320px] text-[15px]"
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  An editor will reply within two working days.
                </p>
                <div className="mt-6">
                  <ArrowButton onClick={() => setSent(false)}>Send another</ArrowButton>
                </div>
              </motion.div>
            ) : (
              <motion.form
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                onSubmit={(event) => {
                  event.preventDefault();
                  setSent(true);
                }}
                className="grid gap-4"
                key="f"
              >
                <fieldset className="m-0 border-0 p-0">
                  <legend className="mb-2 p-0 text-[13.5px] font-medium">What is it about?</legend>
                  <LayoutGroup id="topic">
                    <div className="flex flex-wrap gap-1.5">
                      {["A story idea", "A correction", "Partnership", "Something else"].map((item) => (
                        <button
                          type="button"
                          onClick={() => setTopic(item)}
                          aria-pressed={topic === item}
                          className="ks-ring relative rounded-full px-3.5 py-2 text-[13.5px] outline-none"
                          style={{
                            color: topic === item ? "#fff" : COLOR.ink,
                            boxShadow: topic === item ? undefined : `inset 0 0 0 1px ${COLOR.line}`,
                          }}
                          key={item}
                        >
                          {topic === item && (
                            <motion.span
                              layoutId="topic-pill"
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: COLOR.ink,
                              }}
                              transition={SPRING}
                            />
                          )}
                          <span className="relative">{item}</span>
                        </button>
                      ))}
                    </div>
                  </LayoutGroup>
                </fieldset>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-[13.5px] font-medium">
                    Name
                    <input
                      required={true}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </label>
                  <label className="grid gap-1.5 text-[13.5px] font-medium">
                    Email
                    <input
                      required={true}
                      type="email"
                      autoComplete="email"
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </label>
                </div>
                <label className="grid gap-1.5 text-[13.5px] font-medium">
                  Message
                  <textarea
                    required={true}
                    rows={6}
                    className={`${fieldClass} resize-none`}
                    style={fieldStyle}
                    placeholder={
                      topic === "A correction" ? "Which story, and what did we get wrong?" : "Tell us a little about it"
                    }
                  />
                </label>
                <div>
                  <ArrowButton dark={true} type="submit">
                    Send message
                  </ArrowButton>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
export function NotFoundPage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, {
    stiffness: 80,
    damping: 18,
  });
  const springY = useSpring(pointerY, {
    stiffness: 80,
    damping: 18,
  });
  const layersX = [
    useTransform(springX, (value) => value * -0.04),
    useTransform(springX, (value) => value * 0.03),
    useTransform(springX, (value) => value * -0.06),
  ];
  const layersY = [
    useTransform(springY, (value) => value * -0.05),
    useTransform(springY, (value) => value * 0.04),
    useTransform(springY, (value) => value * -0.03),
  ];
  return (
    <div
      ref={stageRef}
      className="relative flex min-h-[78vh] flex-col items-center justify-center overflow-hidden px-5 py-16 text-center"
      onMouseMove={(event) => {
        const c = stageRef.current!.getBoundingClientRect();
        pointerX.set(event.clientX - c.left - c.width / 2);
        pointerY.set(event.clientY - c.top - c.height / 2);
      }}
    >
      {(
        [
          [0, 0, "12%", "18%", 120],
          [3, 2, "78%", "12%", 100],
          [6, 7, "8%", "66%", 90],
          [7, 6, "82%", "62%", 130],
        ] as const
      ).map(([a, c, u, d, p], index) => (
        <motion.div
          drag={true}
          dragConstraints={stageRef}
          dragElastic={0.3}
          whileDrag={{
            scale: 1.1,
            rotate: 8,
          }}
          className="absolute z-10 hidden cursor-grab active:cursor-grabbing md:block"
          style={{
            left: u,
            top: d,
            x: layersX[index % 3],
            y: layersY[index % 3],
          }}
          key={index}
        >
          <div
            className="ks-anim"
            style={
              {
                "--r": `${index % 2 ? 6 : -6}deg`,
                animation: `ks-float ${5 + index}s ease-in-out infinite`,
              } as CSSProperties
            }
          >
            <Cover
              cover={{
                v: a,
                p: c,
              }}
              className="rounded-[22px]"
              style={{
                width: p,
                height: p,
                boxShadow: "0 24px 50px -24px rgba(0,0,0,.45)",
              }}
            />
          </div>
        </motion.div>
      ))}
      <div
        className="relative z-20 flex select-none font-bold"
        style={{
          fontSize: "clamp(120px, 24vw, 330px)",
          letterSpacing: "-0.08em",
          lineHeight: 1,
        }}
        aria-label="404"
      >
        {["4", "0", "4"].map((item, index) => (
          <motion.span
            drag={true}
            dragConstraints={stageRef}
            dragElastic={0.5}
            dragSnapToOrigin={true}
            whileDrag={{
              scale: 1.08,
              color: COLOR.hiInk,
            }}
            className="inline-block cursor-grab active:cursor-grabbing"
            style={{
              x: layersX[index],
              y: layersY[index],
              color: index === 1 ? "transparent" : COLOR.ink,
              WebkitTextStroke: index === 1 ? `3px ${COLOR.ink}` : undefined,
            }}
            initial={{
              opacity: 0,
              scale: 0.7,
              rotate: index === 1 ? 10 : -6,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 14,
              delay: index * 0.1,
            }}
            key={index}
          >
            {item}
          </motion.span>
        ))}
      </div>
      <RevealHeading
        as="h1"
        text="This page went to press without us."
        className="relative z-20 mt-4"
        style={{
          fontSize: "clamp(26px, 3.4vw, 40px)",
        }}
      />
      <p
        className="m-0 mt-3 max-w-[420px] text-[16px]"
        style={{
          color: COLOR.soft,
        }}
      >
        The link may be old or mistyped. Try one of these, or drag the numbers around while you think.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <ArrowButton
          dark={true}
          to={{
            page: "home",
          }}
        >
          Back to the front page
        </ArrowButton>
        <ArrowButton
          to={{
            page: "articles",
          }}
        >
          Browse all stories
        </ArrowButton>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-1.5">
        {CATEGORIES.slice(0, 6).map((category) => (
          <Link
            to={{
              page: "category",
              slug: category.slug,
            }}
            className="rounded-full px-3.5 py-1.5 text-[13.5px]"
            style={{
              background: COLOR.panel,
            }}
            key={category.slug}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
/** The privacy policy and terms: sample text to replace with your own, reviewed by someone qualified. */
export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const doc = LEGAL[kind];
  return (
    <div className="pb-16 pt-12 sm:pt-16">
      <div className={`${CONTAINER} grid gap-12 lg:grid-cols-[260px_1fr]`}>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p
            className="m-0 text-[12.5px] font-semibold"
            style={{
              color: COLOR.faint,
            }}
          >
            Utility pages
          </p>
          <div className="mt-3 grid gap-1">
            {(["privacy", "terms", "404"] as const).map((item) => (
              <Link
                to={{
                  page: item,
                }}
                className="rounded-[12px] px-3 py-2 text-[14.5px] transition-colors"
                style={
                  item === kind
                    ? {
                        background: COLOR.ink,
                        color: "#fff",
                      }
                    : {
                        color: COLOR.text,
                      }
                }
                key={item}
              >
                {item === "404" ? "404 page" : LEGAL[item].t}
              </Link>
            ))}
          </div>
        </aside>
        <div className="max-w-[720px]">
          <RevealHeading
            as="h1"
            text={doc.t}
            style={{
              fontSize: "clamp(40px, 6vw, 80px)",
              letterSpacing: "-0.05em",
            }}
          />
          <p
            className="m-0 mt-3 text-[14px]"
            style={{
              color: COLOR.soft,
            }}
          >
            {doc.upd}
          </p>
          <div
            className="mt-10 grid gap-8"
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 19,
              lineHeight: 1.7,
              color: "#2B2C31",
            }}
          >
            {doc.s.map(([n, r], index) => (
              <Reveal delay={index * 0.05} key={n}>
                <h2
                  className="m-0 text-[22px] font-semibold"
                  style={{
                    fontFamily: FONT_SANS,
                    letterSpacing: "-0.025em",
                    color: COLOR.ink,
                  }}
                >
                  {index + 1}. {n}
                </h2>
                <p className="m-0 mt-2">{r}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
