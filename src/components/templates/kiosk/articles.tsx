"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useScroll, useTransform } from "framer-motion";
import { Cover } from "./cover";
import { CATEGORIES, STORIES, getCategory } from "./data";
import { Newsletter } from "./newsletter";
import { COLOR, CONTAINER, EASE, FONT_SANS, SPRING } from "./theme";
import { ArrowButton, Icon, Link, RevealHeading, SectionHead, StoryCard, StoryRow } from "./ui";
export function ArticlesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [layout, setLayout] = useState("grid");
  const results = useMemo(() => {
    const u = query.trim().toLowerCase();
    let d = STORIES.filter(
      (story) =>
        (category === "all" || story.cat === category) &&
        (!u || (story.title + story.dek + story.author).toLowerCase().includes(u)),
    );
    if (sort === "popular") {
      d = [...d].sort((a, b) => b.views - a.views);
    }
    if (sort === "quick") {
      d = [...d].sort((a, b) => a.min - b.min);
    }
    return d;
  }, [query, category, sort]);
  return (
    <div className="pb-10 pt-12 sm:pt-16">
      <div className={CONTAINER}>
        <RevealHeading
          as="h1"
          text="Every story, in one place"
          style={{
            fontSize: "clamp(44px, 7vw, 96px)",
            letterSpacing: "-0.055em",
          }}
        />
        <p
          className="m-0 mt-4 text-[16px]"
          style={{
            color: COLOR.soft,
          }}
        >
          {STORIES.length} stories across {CATEGORIES.length} topics.
        </p>
        <div
          className="sticky top-[68px] z-30 -mx-5 mt-10 px-5 py-3 sm:-mx-8 sm:px-8"
          style={{
            background: "rgba(255,255,255,.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <label
              className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full px-4 py-2.5"
              style={{
                boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
              }}
            >
              <Icon
                name="ph:magnifying-glass"
                size={15}
                style={{
                  color: COLOR.soft,
                }}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, topic or writer"
                className="w-full border-0 bg-transparent text-[14.5px] outline-none"
                style={{
                  fontFamily: FONT_SANS,
                  color: COLOR.ink,
                }}
                aria-label="Search articles"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="ks-ring rounded-full outline-none"
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  <Icon name="ph:x" size={13} />
                </button>
              )}
            </label>
            <LayoutGroup id="sort">
              <div
                className="flex rounded-full p-1"
                style={{
                  background: COLOR.panel,
                }}
                role="radiogroup"
                aria-label="Sort"
              >
                {(
                  [
                    ["latest", "Latest"],
                    ["popular", "Popular"],
                    ["quick", "Quick reads"],
                  ] as const
                ).map(([u, d]) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={sort === u}
                    onClick={() => setSort(u)}
                    className="ks-ring relative rounded-full px-3.5 py-1.5 text-[13.5px] outline-none"
                    style={{
                      color: COLOR.ink,
                    }}
                    key={u}
                  >
                    {sort === u && (
                      <motion.span
                        layoutId="sort-pill"
                        className="absolute inset-0 rounded-full bg-white"
                        style={{
                          boxShadow: "0 1px 3px rgba(0,0,0,.12)",
                        }}
                        transition={SPRING}
                      />
                    )}
                    <span className="relative">{d}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
            <div
              className="flex rounded-full p-1"
              style={{
                background: COLOR.panel,
              }}
            >
              {(
                [
                  ["grid", "ph:squares-four"],
                  ["list", "ph:rows"],
                ] as const
              ).map(([u, d]) => (
                <button
                  type="button"
                  onClick={() => setLayout(u)}
                  aria-pressed={layout === u}
                  aria-label={`${u} view`}
                  className="ks-ring grid h-8 w-8 place-items-center rounded-full outline-none transition-colors"
                  style={{
                    background: layout === u ? "#fff" : "transparent",
                    color: COLOR.ink,
                  }}
                  key={u}
                >
                  <Icon name={d} size={15} />
                </button>
              ))}
            </div>
          </div>
          <LayoutGroup id="cats">
            <div
              className="mt-3 flex gap-1.5 overflow-x-auto pb-1"
              style={{
                scrollbarWidth: "none",
              }}
            >
              {[
                {
                  slug: "all",
                  name: "All",
                },
                ...CATEGORIES,
              ].map((item) => {
                const d = category === item.slug;
                const p =
                  item.slug === "all" ? STORIES.length : STORIES.filter((story) => story.cat === item.slug).length;
                return (
                  <button
                    type="button"
                    onClick={() => setCategory(item.slug)}
                    aria-pressed={d}
                    className="ks-ring relative shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] outline-none"
                    style={{
                      color: d ? "#fff" : COLOR.ink,
                      boxShadow: d ? undefined : `inset 0 0 0 1px ${COLOR.line}`,
                    }}
                    key={item.slug}
                  >
                    {d && (
                      <motion.span
                        layoutId="cat-pill"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: COLOR.ink,
                        }}
                        transition={SPRING}
                      />
                    )}
                    <span className="relative">
                      {item.name}{" "}
                      <span
                        style={{
                          opacity: 0.55,
                        }}
                      >
                        {p}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
        <motion.div
          layout={true}
          className={`mt-8 grid ${layout === "grid" ? "gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" : "gap-3"}`}
        >
          <AnimatePresence mode="popLayout">
            {results.map((result, index) => (
              <motion.div
                layout={true}
                initial={{
                  opacity: 0,
                  scale: 0.94,
                  filter: "blur(6px)",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  scale: 0.94,
                  filter: "blur(6px)",
                }}
                transition={{
                  ...SPRING,
                  opacity: {
                    duration: 0.3,
                  },
                }}
                key={result.slug}
              >
                {layout === "grid" ? <StoryCard story={result} index={index} /> : <StoryRow story={result} />}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {results.length === 0 && (
          <div className="py-24 text-center">
            <p
              className="m-0 text-[22px] font-semibold"
              style={{
                letterSpacing: "-0.03em",
              }}
            >
              No stories match that yet
            </p>
            <p
              className="m-0 mt-2 text-[15px]"
              style={{
                color: COLOR.soft,
              }}
            >
              Try a different word, or clear the filters.
            </p>
            <div className="mt-6">
              <ArrowButton
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                Clear filters
              </ArrowButton>
            </div>
          </div>
        )}
      </div>
      <Newsletter />
    </div>
  );
}
/** One desk: a big parallax cover, its stories, and a few from the other desks. */
export function CategoryPage({ slug }: { slug: string }) {
  const category = getCategory(slug);
  const stories = STORIES.filter((story) => story.cat === slug);
  const others = STORIES.filter((story) => story.cat !== slug).slice(0, 3);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const coverY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const coverScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  return (
    <div className="pb-6 pt-6">
      <div className={CONTAINER}>
        <div ref={heroRef} className="relative overflow-hidden rounded-[28px]">
          <motion.div
            style={{
              y: coverY,
              scale: coverScale,
            }}
            className="absolute inset-0"
          >
            <Cover cover={category.cover} className="absolute inset-0" />
          </motion.div>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.6))",
            }}
          />
          <div className="relative flex min-h-[420px] flex-col justify-end p-6 text-white sm:min-h-[480px] sm:p-10">
            <div
              className="flex items-center gap-2 text-[13px]"
              style={{
                color: "rgba(255,255,255,.8)",
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
                  page: "articles",
                }}
              >
                Articles
              </Link>
              <span>/</span>
              <span
                style={{
                  color: "#fff",
                }}
              >
                {category.name}
              </span>
            </div>
            <h1
              className="m-0 mt-3 font-semibold"
              style={{
                fontSize: "clamp(52px, 9vw, 128px)",
                letterSpacing: "-0.06em",
                lineHeight: 0.9,
              }}
            >
              {category.name.split("").map((item, index) => (
                <motion.span
                  className="inline-block whitespace-pre"
                  initial={{
                    y: "60%",
                    opacity: 0,
                    filter: "blur(8px)",
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    duration: 0.8,
                    ease: EASE,
                    delay: index * 0.03,
                  }}
                  key={`${slug}-${index}`}
                >
                  {item}
                </motion.span>
              ))}
            </h1>
            <p
              className="m-0 mt-4 max-w-[460px] text-[16px]"
              style={{
                color: "rgba(255,255,255,.85)",
              }}
            >
              {category.blurb}
            </p>
            <span
              className="mt-5 w-fit rounded-full px-3 py-1 text-[12.5px] font-semibold"
              style={{
                background: COLOR.hi,
                color: COLOR.hiInk,
              }}
            >
              {stories.length} {stories.length === 1 ? "story" : "stories"}
            </span>
          </div>
        </div>
        <div
          className="mt-6 flex gap-1.5 overflow-x-auto pb-1"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {CATEGORIES.map((category2) => (
            <Link
              to={{
                page: "category",
                slug: category2.slug,
              }}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] transition-colors"
              style={
                category2.slug === slug
                  ? {
                      background: COLOR.ink,
                      color: "#fff",
                    }
                  : {
                      boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
                      color: COLOR.ink,
                    }
              }
              key={category2.slug}
            >
              {category2.name}
            </Link>
          ))}
        </div>
        <div className="mt-12 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, index) => (
            <StoryCard story={story} index={index} key={story.slug} />
          ))}
        </div>
        <div className="mt-24">
          <SectionHead
            title="From other desks"
            to={{
              page: "articles",
            }}
          />
        </div>
        <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((other, index) => (
            <StoryCard story={other} index={index} key={other.slug} />
          ))}
        </div>
      </div>
      <Newsletter />
    </div>
  );
}
