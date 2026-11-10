"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Cover } from "./cover";
import { AUTHOR_ROLES, STORIES, articleBody, getCategory, getStory } from "./data";
import { Newsletter } from "./newsletter";
import { useSite } from "./router";
import { COLOR, CONTAINER, FONT_SANS, FONT_SERIF, SPRING } from "./theme";
import { ArrowButton, Avatar, Icon, Link, Reveal, RevealHeading, SaveButton, SectionHead, StoryCard } from "./ui";
/**
 * A story: reading progress along the top, a cover that drifts as you scroll, a table of contents that follows
 * the section you are reading, share and clap buttons, the next and previous stories and related reading.
 */
export function ArticlePage({ slug }: { slug: string }) {
  // the router only sends known slugs here; the fallback keeps the types honest
  const story = getStory(slug) ?? STORIES[0]!;
  const { toast, saved, toggleSave } = useSite();
  const sections = useMemo(() => articleBody(story), [story]);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
  });
  const [activeSection, setActiveSection] = useState(sections[0]!.id);
  const [claps, setClaps] = useState(128 + (story.views % 300));
  const [myClaps, setMyClaps] = useState(0);
  const [burst, setBurst] = useState(0);
  const coverRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: coverProgress } = useScroll({
    target: coverRef,
    offset: ["start start", "end start"],
  });
  const coverY = useTransform(coverProgress, [0, 1], [0, 90]);

  // the table of contents lights the section in the middle of the screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }),
      {
        rootMargin: "-30% 0px -60% 0px",
      },
    );
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sections]);
  const position = STORIES.findIndex((item) => item.slug === slug);
  const previous = STORIES[(position - 1 + STORIES.length) % STORIES.length]!;
  const next = STORIES[(position + 1) % STORIES.length]!;
  // same desk or same writer first, then anything else, never twice
  const related = STORIES.filter(
    (item) => item.slug !== slug && (item.cat === story.cat || item.author === story.author),
  )
    .concat(STORIES.filter((item) => item.slug !== slug))
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 3);
  const copyLink = () => {
    const url = `${window.location.href.split("#")[0]}#/article/${slug}`;
    try {
      void navigator.clipboard?.writeText(url);
    } catch {
      // clipboard access can be blocked; the toast still confirms the intent
    }
    toast("Link copied to clipboard");
  };
  const MAX_CLAPS = 30;
  const clap = () => {
    if (myClaps >= MAX_CLAPS) return;
    setMyClaps((prev) => prev + 1);
    setClaps((prev) => prev + 1);
    setBurst((prev) => prev + 1);
  };
  const isSaved = saved.includes(slug);
  return (
    <article className="pb-6">
      <motion.div
        className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left"
        style={{
          scaleX: progress,
          background: COLOR.ink,
        }}
      >
        <span
          className="absolute right-0 top-0 h-full w-10"
          style={{
            background: COLOR.hi,
          }}
        />
      </motion.div>
      <header className={`${CONTAINER} pt-10 sm:pt-14`}>
        <div className="mx-auto max-w-[860px]">
          <div
            className="flex flex-wrap items-center gap-2 text-[13px]"
            style={{
              color: COLOR.soft,
            }}
          >
            <Link
              to={{
                page: "home",
              }}
            >
              Home
            </Link>
            <span>/</span>
            <Link
              to={{
                page: "category",
                slug: story.cat,
              }}
              className="rounded-full px-2.5 py-1 font-medium"
              style={{
                background: COLOR.hi,
                color: COLOR.hiInk,
              }}
            >
              {getCategory(story.cat).name}
            </Link>
          </div>
          <RevealHeading
            as="h1"
            text={story.title}
            className="mt-5"
            style={{
              fontSize: "clamp(36px, 5.4vw, 68px)",
              lineHeight: 1.02,
              letterSpacing: "-0.05em",
            }}
          />
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.4,
            }}
            className="m-0 mt-5 text-[19px] leading-[1.5]"
            style={{
              color: COLOR.text,
              fontFamily: FONT_SERIF,
            }}
          >
            {story.dek}
          </motion.p>
          <div
            className="mt-8 flex flex-wrap items-center justify-between gap-4 py-4"
            style={{
              borderTop: `1px solid ${COLOR.line}`,
              borderBottom: `1px solid ${COLOR.line}`,
            }}
          >
            <div className="flex items-center gap-3">
              <Avatar name={story.author} size={44} />
              <span className="leading-tight">
                <span className="block text-[15px] font-semibold">{story.author}</span>
                <span
                  className="text-[13px]"
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  {AUTHOR_ROLES[story.author]}
                </span>
              </span>
            </div>
            <div
              className="flex items-center gap-4 text-[13.5px]"
              style={{
                color: COLOR.soft,
              }}
            >
              <span className="flex items-center gap-1.5">
                <Icon name="ph:calendar-blank" size={14} />
                {story.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="ph:clock" size={14} />
                {story.min} min read
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <SaveButton slug={slug} />
              <ShareButtons onShare={toast} onCopyLink={copyLink} />
            </div>
          </div>
        </div>
      </header>
      <div ref={coverRef} className={`${CONTAINER} mt-10`}>
        <div className="relative overflow-hidden rounded-[28px]">
          <motion.div
            style={{
              y: coverY,
            }}
          >
            <Cover cover={story.cover} className="aspect-[16/8.5] scale-[1.12]" />
          </motion.div>
        </div>
        <p
          className="m-0 mt-3 text-center text-[12.5px]"
          style={{
            color: COLOR.faint,
          }}
        >
          Illustration by the Kiosk studio.
        </p>
      </div>
      <div className={`${CONTAINER} mt-14 grid gap-10 lg:grid-cols-[200px_1fr_200px]`}>
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-28">
            <p
              className="m-0 text-[12.5px] font-semibold"
              style={{
                color: COLOR.faint,
              }}
            >
              On this page
            </p>
            <ul
              className="relative m-0 mt-3 list-none p-0 pl-4"
              style={{
                borderLeft: `1px solid ${COLOR.line}`,
              }}
            >
              {sections.map((section) => (
                <li className="relative" key={section.id}>
                  {activeSection === section.id && (
                    <motion.span
                      layoutId="toc-mark"
                      className="absolute -left-[17px] top-1 h-5 w-[2px] rounded-full"
                      style={{
                        background: COLOR.ink,
                      }}
                      transition={SPRING}
                    />
                  )}
                  <a
                    href={`#${section.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      document.getElementById(section.id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="ks-ring block rounded py-1.5 text-[14px] no-underline outline-none transition-colors"
                    style={{
                      color: activeSection === section.id ? COLOR.ink : COLOR.soft,
                      fontWeight: activeSection === section.id ? 600 : 400,
                    }}
                  >
                    {section.h}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div
          className="ks-body mx-auto w-full max-w-[680px]"
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 20,
            lineHeight: 1.7,
            color: "#24252A",
          }}
        >
          {sections.map((section, index) => (
            <section id={section.id} className="scroll-mt-28" key={section.id}>
              {index > 0 && (
                <h2
                  className="m-0 mb-4 mt-12 text-[30px] font-semibold"
                  style={{
                    fontFamily: FONT_SANS,
                    letterSpacing: "-0.035em",
                    lineHeight: 1.1,
                    color: COLOR.ink,
                  }}
                >
                  {section.h}
                </h2>
              )}
              {section.paras.map((para, index2) => (
                <p className={index === 0 && index2 === 0 ? "ks-dropcap" : ""} key={index2}>
                  {para}
                </p>
              ))}
              {section.quote && (
                <Reveal>
                  <figure
                    className="relative my-10 rounded-[24px] px-7 py-8"
                    style={{
                      background: COLOR.panel,
                    }}
                  >
                    <span
                      className="absolute -top-5 left-6 grid h-10 w-10 place-items-center rounded-full"
                      style={{
                        background: COLOR.hi,
                        color: COLOR.hiInk,
                      }}
                    >
                      <Icon name="ph:quotes" size={18} />
                    </span>
                    <blockquote
                      className="m-0 text-[26px] leading-[1.35]"
                      style={{
                        fontStyle: "italic",
                        color: COLOR.ink,
                      }}
                    >
                      {section.quote}
                    </blockquote>
                    <figcaption
                      className="mt-4 text-[14px]"
                      style={{
                        fontFamily: FONT_SANS,
                        color: COLOR.soft,
                      }}
                    >
                      Overheard in the studio
                    </figcaption>
                  </figure>
                </Reveal>
              )}
              {section.list && (
                <ol className="my-6 grid list-none gap-3 p-0">
                  {section.list.map((item, index2) => (
                    <Reveal delay={index2 * 0.06} key={index2}>
                      <li className="flex gap-4">
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-semibold"
                          style={{
                            fontFamily: FONT_SANS,
                            background: COLOR.ink,
                            color: "#fff",
                          }}
                        >
                          {index2 + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    </Reveal>
                  ))}
                </ol>
              )}
              {section.figure && (
                <Reveal>
                  <figure className="my-10">
                    <Cover cover={section.figure} className="aspect-[16/10] rounded-[22px]" />
                    <figcaption
                      className="mt-3 text-center text-[13px]"
                      style={{
                        fontFamily: FONT_SANS,
                        color: COLOR.faint,
                      }}
                    >
                      One thing, done well.
                    </figcaption>
                  </figure>
                </Reveal>
              )}
            </section>
          ))}
          <div
            className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[24px] p-5"
            style={{
              boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
              fontFamily: FONT_SANS,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.86,
                  }}
                  onClick={clap}
                  className="ks-ring grid h-14 w-14 place-items-center rounded-full outline-none"
                  style={{
                    background: myClaps ? COLOR.hi : COLOR.panel,
                    color: COLOR.ink,
                  }}
                  aria-label="Applaud this story"
                >
                  <Icon name={myClaps ? "ph:hands-clapping-fill" : "ph:hands-clapping"} size={24} />
                </motion.button>
                <AnimatePresence>
                  {burst > 0 && (
                    <motion.span
                      initial={{
                        y: 0,
                        opacity: 1,
                        scale: 0.8,
                      }}
                      animate={{
                        y: -42,
                        opacity: 0,
                        scale: 1.1,
                      }}
                      transition={{
                        duration: 0.8,
                      }}
                      className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-full px-2 py-0.5 text-[12px] font-bold"
                      style={{
                        background: COLOR.ink,
                        color: COLOR.hi,
                      }}
                      key={burst}
                    >
                      +{myClaps}
                    </motion.span>
                  )}
                  {burst > 0 &&
                    Array.from(
                      {
                        length: 6,
                      },
                      (b, index) => (
                        <motion.i
                          className="pointer-events-none absolute left-1/2 top-1/2 block h-1.5 w-1.5 rounded-full"
                          style={{
                            background: index % 2 ? COLOR.ink : "#C7DD2E",
                          }}
                          initial={{
                            x: 0,
                            y: 0,
                            opacity: 1,
                          }}
                          animate={{
                            x: Math.cos((index / 6) * Math.PI * 2) * 38,
                            y: Math.sin((index / 6) * Math.PI * 2) * 38,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.6,
                          }}
                          key={`${burst}-${index}`}
                        />
                      ),
                    )}
                </AnimatePresence>
              </div>
              <span className="text-[14px]">
                <b className="block text-[18px] tabular-nums">{claps.toLocaleString()}</b>
                <span
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  {myClaps
                    ? `You clapped ${myClaps} time${myClaps > 1 ? "s" : ""}`
                    : "Enjoyed it? Clap up to 30 times."}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowButton onClick={() => toggleSave(slug)}>{isSaved ? "Saved" : "Save for later"}</ArrowButton>
              <ShareButtons onShare={toast} onCopyLink={copyLink} />
            </div>
          </div>
          <div
            className="mt-8 flex items-center gap-4 rounded-[24px] p-5"
            style={{
              background: COLOR.panel,
              fontFamily: FONT_SANS,
            }}
          >
            <Avatar name={story.author} size={64} />
            <div>
              <p
                className="m-0 text-[12.5px]"
                style={{
                  color: COLOR.soft,
                }}
              >
                Written by
              </p>
              <p
                className="m-0 text-[19px] font-semibold"
                style={{
                  letterSpacing: "-0.02em",
                }}
              >
                {story.author}
              </p>
              <p
                className="m-0 mt-1 text-[14.5px]"
                style={{
                  color: COLOR.soft,
                }}
              >
                {AUTHOR_ROLES[story.author]} at Kiosk. Writes about {getCategory(story.cat).name.toLowerCase()}, mostly
                in the mornings.
              </p>
            </div>
          </div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <p
              className="m-0 text-[12.5px] font-semibold"
              style={{
                color: COLOR.faint,
              }}
            >
              Share
            </p>
            <div className="mt-3">
              <ShareButtons vertical onShare={toast} onCopyLink={copyLink} />
            </div>
            <p
              className="m-0 mt-8 text-[12.5px] font-semibold"
              style={{
                color: COLOR.faint,
              }}
            >
              Reading
            </p>
            <div
              className="mt-3 h-24 w-[3px] overflow-hidden rounded-full"
              style={{
                background: COLOR.line,
              }}
            >
              <motion.div
                className="w-full origin-top"
                style={{
                  height: "100%",
                  scaleY: progress,
                  background: COLOR.ink,
                }}
              />
            </div>
          </div>
        </aside>
      </div>
      <div className={`${CONTAINER} mt-20 grid gap-3 sm:grid-cols-2`}>
        {(
          [
            ["Previous story", previous, "ph:arrow-left"],
            ["Next story", next, "ph:arrow-right"],
          ] as const
        ).map(([b, _, U], index) => (
          <Link
            to={{
              page: "article",
              slug: _.slug,
            }}
            className={`group flex items-center gap-4 rounded-[24px] p-3 transition-colors hover:bg-[#F6F6F7] ${index ? "sm:flex-row-reverse sm:text-right" : ""}`}
            style={{
              boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
            }}
            key={b}
          >
            <Cover cover={_.cover} className="h-20 w-24 shrink-0 rounded-[16px]" />
            <span className="min-w-0">
              <span
                className={`flex items-center gap-1.5 text-[12.5px] ${index ? "sm:justify-end" : ""}`}
                style={{
                  color: COLOR.soft,
                }}
              >
                <Icon name={U} size={12} />
                {b}
              </span>
              <span
                className="mt-1 line-clamp-2 block text-[17px] font-semibold leading-snug"
                style={{
                  letterSpacing: "-0.02em",
                }}
              >
                {_.title}
              </span>
            </span>
          </Link>
        ))}
      </div>
      <section className={`${CONTAINER} mt-24`}>
        <SectionHead
          title="Keep reading"
          to={{
            page: "articles",
          }}
        />
        <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item, index) => (
            <StoryCard story={item} index={index} key={item.slug} />
          ))}
        </div>
      </section>
      <Newsletter />
    </article>
  );
}
type ShareButtonsProps = {
  vertical?: boolean;
  onShare: (message: string) => void;
  onCopyLink: () => void;
};

/** Share buttons for the article. The networks only toast here: wire them to real share URLs in your app. */
function ShareButtons({ vertical = false, onShare, onCopyLink }: ShareButtonsProps) {
  return (
    <div className={`flex ${vertical ? "flex-col" : ""} gap-1.5`}>
      {(
        [
          ["ph:x-logo", "Share on X"],
          ["ph:linkedin-logo", "Share on LinkedIn"],
          ["ph:facebook-logo", "Share on Facebook"],
        ] as const
      ).map(([icon, label]) => (
        <motion.button
          type="button"
          whileHover={{
            y: -2,
          }}
          onClick={() => onShare(`${label.replace("Share on ", "")} share opened`)}
          aria-label={label}
          className="ks-ring grid h-9 w-9 place-items-center rounded-full outline-none"
          style={{
            boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
            color: COLOR.ink,
          }}
          key={label}
        >
          <Icon name={icon} size={15} />
        </motion.button>
      ))}
      <motion.button
        type="button"
        whileHover={{
          y: -2,
        }}
        onClick={onCopyLink}
        aria-label="Copy link"
        className="ks-ring grid h-9 w-9 place-items-center rounded-full outline-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
          color: COLOR.ink,
        }}
      >
        <Icon name="ph:link-simple" size={15} />
      </motion.button>
    </div>
  );
}
