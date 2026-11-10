"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { Cover } from "./cover";
import { CATEGORIES, STORIES, TICKER_ITEMS, getCategory, getStory, type Story } from "./data";
import { NAV_LINKS, useSite, type Route } from "./router";
import { COLOR, CONTAINER, EASE, FONT_SANS, SPRING } from "./theme";
import { ArrowButton, Icon, Link } from "./ui";
export function Ticker() {
  return (
    <div
      className="relative z-[60] flex h-9 items-center overflow-hidden text-[12.5px]"
      style={{
        background: COLOR.ink,
        color: "#fff",
      }}
    >
      <span
        className="relative z-10 flex h-full shrink-0 items-center gap-1.5 px-4 font-semibold"
        style={{
          background: COLOR.hi,
          color: COLOR.hiInk,
        }}
      >
        <span
          className="ks-anim block h-1.5 w-1.5 rounded-full"
          style={{
            background: COLOR.hiInk,
            animation: "ks-float 1.2s ease-in-out infinite",
          }}
        />
        Today
      </span>
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)",
        }}
      >
        <div
          className="ks-anim flex w-max gap-10 whitespace-nowrap"
          style={{
            animation: "ks-marquee 48s linear infinite",
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
            <span
              className="flex items-center gap-10"
              style={{
                color: "rgba(255,255,255,.82)",
              }}
              key={index}
            >
              {item}
              <span
                style={{
                  color: COLOR.hi,
                }}
              >
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
export function Header() {
  const { route, go, saved, openSearch, openSaved } = useSite();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));
  const isCurrent = (w: string) =>
    (w === "Home" && route.page === "home") ||
    (w === "Articles" && route.page === "articles") ||
    (w === "Categories" && route.page === "category") ||
    (w === "About" && route.page === "about");
  return (
    <header
      className="sticky top-0 z-50 transition-[background,box-shadow] duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,.82)" : "#fff",
        backdropFilter: "blur(16px) saturate(170%)",
        WebkitBackdropFilter: "blur(16px) saturate(170%)",
        boxShadow: scrolled ? `0 1px 0 ${COLOR.line}` : "none",
      }}
      onMouseLeave={() => {
        setCategoriesOpen(false);
        setHoveredLink(null);
      }}
    >
      <div className={`${CONTAINER} flex h-[68px] items-center justify-between`}>
        <Link
          to={{
            page: "home",
          }}
          className="text-[22px] font-bold"
          style={{
            letterSpacing: "-0.06em",
            color: COLOR.ink,
          }}
          label="Kiosk, home"
        >
          <span className="inline-flex items-center gap-1.5">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden={true}>
              <path d="M3 6 L12 3 L21 6 V18 L12 21 L3 18 Z" fill={COLOR.ink} />
              <path d="M12 3 V21" stroke={COLOR.hi} strokeWidth="2" />
              <path d="M3 6 L12 9 L21 6" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".5" />
            </svg>
            kiosk
            <span
              style={{
                color: COLOR.faint,
              }}
            >
              .
            </span>
          </span>
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <LayoutGroup id="ks-nav">
            <ul className="m-0 flex list-none gap-1 p-0">
              {NAV_LINKS.map(([w, C]) => (
                <li
                  className="relative"
                  onMouseEnter={() => {
                    setHoveredLink(w);
                    setCategoriesOpen(w === "Categories");
                  }}
                  key={w}
                >
                  {(hoveredLink === w || (!hoveredLink && isCurrent(w))) && (
                    <motion.span
                      layoutId="ks-nav-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: COLOR.panel,
                      }}
                      transition={SPRING}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (w === "Categories") {
                        setCategoriesOpen((prev) => !prev);
                      } else {
                        go(C);
                      }
                    }}
                    aria-expanded={w === "Categories" ? categoriesOpen : undefined}
                    className="ks-ring relative flex items-center gap-1 rounded-full px-3.5 py-2 text-[14.5px] outline-none"
                    style={{
                      color: COLOR.ink,
                    }}
                  >
                    {w}
                    {w === "Categories" && (
                      <motion.span
                        animate={{
                          rotate: categoriesOpen ? 180 : 0,
                        }}
                        transition={SPRING}
                      >
                        <Icon name="ph:caret-down" size={11} />
                      </motion.span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </LayoutGroup>
        </nav>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openSearch}
            className="ks-ring hidden items-center gap-2 rounded-full py-2 pl-3 pr-2 text-[13.5px] outline-none sm:flex"
            style={{
              boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
              color: COLOR.soft,
            }}
            aria-label="Search articles"
          >
            <Icon name="ph:magnifying-glass" size={14} />
            Search
            <kbd
              className="rounded-[6px] px-1.5 text-[11px]"
              style={{
                background: COLOR.panel,
                color: COLOR.soft,
                fontFamily: FONT_SANS,
              }}
            >
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={openSaved}
            className="ks-ring relative grid h-9 w-9 place-items-center rounded-full outline-none"
            style={{
              boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
              color: COLOR.ink,
            }}
            aria-label={`Saved articles, ${saved.length}`}
          >
            <Icon name="ph:bookmark-simple" size={16} />
            <AnimatePresence>
              {saved.length > 0 && (
                <motion.span
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  exit={{
                    scale: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 600,
                    damping: 16,
                  }}
                  className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10.5px] font-bold"
                  style={{
                    background: COLOR.hi,
                    color: COLOR.hiInk,
                  }}
                  key={saved.length}
                >
                  {saved.length}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <span className="hidden sm:block">
            <ArrowButton
              dark={true}
              to={{
                page: "contact",
              }}
            >
              Contact
            </ArrowButton>
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen((w) => !w)}
            aria-expanded={menuOpen}
            aria-label="Menu"
            className="ks-ring grid h-9 w-9 place-items-center rounded-full outline-none md:hidden"
            style={{
              background: COLOR.ink,
              color: "#fff",
            }}
          >
            <Icon name={menuOpen ? "ph:x" : "ph:list"} size={16} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {categoriesOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
              filter: "blur(6px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: -8,
              filter: "blur(6px)",
            }}
            transition={{
              duration: 0.3,
              ease: EASE,
            }}
            className="absolute inset-x-0 top-full hidden md:block"
          >
            <div className={`${CONTAINER}`}>
              <div
                className="grid grid-cols-[1fr_300px] gap-4 rounded-[24px] bg-white p-3"
                style={{
                  boxShadow: `0 0 0 1px ${COLOR.line}, 0 30px 60px -30px rgba(0,0,0,.3)`,
                }}
              >
                <div className="grid grid-cols-4 gap-1">
                  {CATEGORIES.map((w, index) => (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.02,
                      }}
                      key={w.slug}
                    >
                      <Link
                        to={{
                          page: "category",
                          slug: w.slug,
                        }}
                        onClick={() => setCategoriesOpen(false)}
                        className="group flex items-center gap-3 rounded-[14px] p-2 transition-colors hover:bg-[#F6F6F7]"
                      >
                        <Cover cover={w.cover} className="h-11 w-11 shrink-0 rounded-[10px]" />
                        <span>
                          <span
                            className="block text-[14px] font-medium"
                            style={{
                              color: COLOR.ink,
                            }}
                          >
                            {w.name}
                          </span>
                          <span
                            className="text-[12px]"
                            style={{
                              color: COLOR.faint,
                            }}
                          >
                            {(() => {
                              const m = STORIES.filter((h) => h.cat === w.slug).length;
                              return `${m} ${m === 1 ? "story" : "stories"}`;
                            })()}
                          </span>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                {(() => {
                  const w = STORIES[4];
                  return (
                    <Link
                      to={{
                        page: "article",
                        slug: w.slug,
                      }}
                      onClick={() => setCategoriesOpen(false)}
                      className="group relative block overflow-hidden rounded-[18px]"
                    >
                      <Cover cover={w.cover} className="h-full min-h-[200px]" />
                      <span
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,.65))",
                        }}
                      />
                      <span className="absolute inset-x-4 bottom-4 text-white">
                        <span
                          className="text-[11.5px] font-medium"
                          style={{
                            color: COLOR.hi,
                          }}
                        >
                          Most read this week
                        </span>
                        <span
                          className="mt-1 block text-[16px] font-semibold leading-tight"
                          style={{
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {w.title}
                        </span>
                      </span>
                    </Link>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Mobile"
            initial={{
              height: 0,
            }}
            animate={{
              height: "auto",
            }}
            exit={{
              height: 0,
            }}
            transition={{
              duration: 0.4,
              ease: EASE,
            }}
            className="overflow-hidden md:hidden"
            style={{
              borderTop: `1px solid ${COLOR.line}`,
            }}
          >
            <div className={`${CONTAINER} grid gap-1 py-4`}>
              {NAV_LINKS.filter(([w]) => w !== "Categories").map(([w, C]) => (
                <Link
                  to={C}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-[12px] px-3 py-3 text-[20px] font-semibold"
                  style={{
                    letterSpacing: "-0.03em",
                  }}
                  key={w}
                >
                  {w}
                </Link>
              ))}
              <p
                className="m-0 mt-3 px-3 text-[12.5px]"
                style={{
                  color: COLOR.faint,
                }}
              >
                Categories
              </p>
              <div className="flex flex-wrap gap-1.5 px-2 pt-1">
                {CATEGORIES.map((w) => (
                  <Link
                    to={{
                      page: "category",
                      slug: w.slug,
                    }}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full px-3 py-1.5 text-[13.5px]"
                    style={{
                      background: COLOR.panel,
                    }}
                    key={w.slug}
                  >
                    {w.name}
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openSearch();
                }}
                className="ks-ring mt-3 flex items-center gap-2 rounded-[12px] px-3 py-3 text-left text-[15px] outline-none"
                style={{
                  boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
                  color: COLOR.soft,
                }}
              >
                <Icon name="ph:magnifying-glass" size={15} />
                Search articles
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
type OverlayProps = {
  open: boolean;
  onClose: () => void;
};

/** Search over titles, desks and writers, with matched letters highlighted; arrow keys and Enter pick a story. */
export function SearchOverlay({ open, onClose }: OverlayProps) {
  const { go } = useSite();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      // a fresh search every time it opens
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STORIES.filter(
      (story) =>
        !q ||
        story.title.toLowerCase().includes(q) ||
        getCategory(story.cat).name.toLowerCase().includes(q) ||
        story.author.toLowerCase().includes(q),
    ).slice(0, 7);
  }, [query]);
  const topics = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? CATEGORIES.filter((category) => category.name.toLowerCase().includes(q)).slice(0, 4) : [];
  }, [query]);
  const openStory = (story: Story) => {
    onClose();
    go({
      page: "article",
      slug: story.slug,
    });
  };
  const highlight = (f: string) => {
    const y = query.trim();
    if (!y) {
      return f;
    }
    const v = f.toLowerCase().indexOf(y.toLowerCase());
    if (v < 0) {
      return f;
    } else {
      return (
        <Fragment>
          {f.slice(0, v)}
          <mark
            style={{
              background: COLOR.hi,
              color: COLOR.hiInk,
              borderRadius: 3,
            }}
          >
            {f.slice(v, v + y.length)}
          </mark>
          {f.slice(v + y.length)}
        </Fragment>
      );
    }
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          onMouseDown={onClose}
          style={{
            background: "rgba(12,12,13,.35)",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            role="dialog"
            aria-modal={true}
            aria-label="Search"
            onMouseDown={(event) => event.stopPropagation()}
            initial={{
              y: -14,
              scale: 0.97,
              opacity: 0,
            }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
            }}
            exit={{
              y: -10,
              scale: 0.98,
              opacity: 0,
            }}
            transition={SPRING}
            className="w-full max-w-[620px] overflow-hidden rounded-[22px] bg-white"
            style={{
              boxShadow: "0 40px 80px -30px rgba(0,0,0,.45)",
            }}
          >
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{
                borderBottom: `1px solid ${COLOR.line}`,
              }}
            >
              <Icon
                name="ph:magnifying-glass"
                size={18}
                style={{
                  color: COLOR.soft,
                }}
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                placeholder="Search stories, topics or writers"
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActive((y) => Math.min(results.length - 1, y + 1));
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActive((y) => Math.max(0, y - 1));
                  }
                  if (event.key === "Enter" && results[active]) {
                    openStory(results[active]);
                  }
                  if (event.key === "Escape") {
                    onClose();
                  }
                }}
                className="w-full border-0 bg-transparent text-[17px] outline-none"
                style={{
                  color: COLOR.ink,
                  fontFamily: FONT_SANS,
                }}
                aria-label="Search"
              />
              <kbd
                className="rounded-[6px] px-1.5 py-0.5 text-[11px]"
                style={{
                  background: COLOR.panel,
                  color: COLOR.soft,
                }}
              >
                Esc
              </kbd>
            </div>
            <div className="max-h-[56vh] overflow-y-auto p-2">
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-2 pt-1">
                  {topics.map((topic) => (
                    <Link
                      to={{
                        page: "category",
                        slug: topic.slug,
                      }}
                      onClick={onClose}
                      className="rounded-full px-3 py-1 text-[13px]"
                      style={{
                        background: COLOR.panel,
                      }}
                      key={topic.slug}
                    >
                      {topic.name}
                    </Link>
                  ))}
                </div>
              )}
              {results.length === 0 && (
                <p
                  className="m-0 px-4 py-10 text-center text-[14px]"
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  No stories match &ldquo;{query}&rdquo;. Try a topic like design or travel.
                </p>
              )}
              {results.map((result, y) => (
                <button
                  type="button"
                  onMouseEnter={() => setActive(y)}
                  onClick={() => openStory(result)}
                  className="ks-ring relative flex w-full items-center gap-3 rounded-[14px] p-2 text-left outline-none"
                  key={result.slug}
                >
                  {active === y && (
                    <motion.span
                      layoutId="ks-search-sel"
                      className="absolute inset-0 rounded-[14px]"
                      style={{
                        background: COLOR.panel,
                      }}
                      transition={SPRING}
                    />
                  )}
                  <Cover cover={result.cover} className="relative h-12 w-16 shrink-0 rounded-[10px]" />
                  <span className="relative min-w-0 flex-1">
                    <span
                      className="block truncate text-[14.5px] font-medium"
                      style={{
                        color: COLOR.ink,
                      }}
                    >
                      {highlight(result.title)}
                    </span>
                    <span
                      className="text-[12.5px]"
                      style={{
                        color: COLOR.soft,
                      }}
                    >
                      {getCategory(result.cat).name} · {result.author} · {result.min} min
                    </span>
                  </span>
                  {active === y && (
                    <span
                      className="relative"
                      style={{
                        color: COLOR.soft,
                      }}
                    >
                      <Icon name="ph:arrow-right" size={14} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
/** The reading list: stories saved with the bookmark, newest first. */
export function SavedDrawer({ open, onClose }: OverlayProps) {
  const { saved, toggleSave } = useSite();
  const stories = saved.map(getStory).filter((story): story is Story => Boolean(story));
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(12,12,13,.3)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal={true}
            aria-label="Saved articles"
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 34,
            }}
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col bg-white"
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{
                borderBottom: `1px solid ${COLOR.line}`,
              }}
            >
              <h2
                className="m-0 text-[22px] font-semibold"
                style={{
                  letterSpacing: "-0.03em",
                }}
              >
                Saved{" "}
                <span
                  style={{
                    color: COLOR.faint,
                  }}
                >
                  {stories.length}
                </span>
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="ks-ring grid h-9 w-9 place-items-center rounded-full outline-none"
                style={{
                  background: COLOR.panel,
                }}
                aria-label="Close"
              >
                <Icon name="ph:x" size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {stories.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span
                    className="ks-anim grid h-16 w-16 place-items-center rounded-[18px]"
                    style={{
                      background: COLOR.hi,
                      color: COLOR.hiInk,
                      animation: "ks-float 3s ease-in-out infinite",
                    }}
                  >
                    <Icon name="ph:bookmark-simple" size={26} />
                  </span>
                  <p
                    className="m-0 mt-5 text-[17px] font-semibold"
                    style={{
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Nothing saved yet
                  </p>
                  <p
                    className="m-0 mt-1 max-w-[240px] text-[14px]"
                    style={{
                      color: COLOR.soft,
                    }}
                  >
                    Tap the bookmark on any story to keep it here for later.
                  </p>
                </div>
              ) : (
                <ul className="m-0 grid list-none gap-2 p-0">
                  <AnimatePresence initial={false}>
                    {stories.map((i) => (
                      <motion.li
                        layout={true}
                        initial={{
                          opacity: 0,
                          x: 20,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        exit={{
                          opacity: 0,
                          x: 40,
                        }}
                        transition={SPRING}
                        className="flex items-center gap-3 rounded-[16px] p-2"
                        style={{
                          boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
                        }}
                        key={i.slug}
                      >
                        <Link
                          to={{
                            page: "article",
                            slug: i.slug,
                          }}
                          onClick={onClose}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          <Cover cover={i.cover} className="h-14 w-16 shrink-0 rounded-[10px]" />
                          <span className="min-w-0">
                            <span
                              className="line-clamp-2 block text-[14px] font-medium leading-snug"
                              style={{
                                color: COLOR.ink,
                              }}
                            >
                              {i.title}
                            </span>
                            <span
                              className="text-[12px]"
                              style={{
                                color: COLOR.soft,
                              }}
                            >
                              {i.min} min read
                            </span>
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleSave(i.slug)}
                          className="ks-ring grid h-8 w-8 shrink-0 place-items-center rounded-full outline-none"
                          style={{
                            color: COLOR.soft,
                          }}
                          aria-label={`Remove ${i.title}`}
                        >
                          <Icon name="ph:x" size={13} />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function Footer() {
  const { go } = useSite();
  const columns: [heading: string, links: [label: string, to: Route][]][] = [
    [
      "Categories",
      CATEGORIES.slice(0, 6).map((category) => [
        category.name,
        {
          page: "category",
          slug: category.slug,
        },
      ]),
    ],
    [
      "Navigation",
      [
        [
          "Home",
          {
            page: "home",
          },
        ],
        [
          "Articles",
          {
            page: "articles",
          },
        ],
        [
          "About us",
          {
            page: "about",
          },
        ],
        [
          "Contact",
          {
            page: "contact",
          },
        ],
      ],
    ],
    [
      "Utility pages",
      [
        [
          "404 page",
          {
            page: "404",
          },
        ],
        [
          "Privacy policy",
          {
            page: "privacy",
          },
        ],
        [
          "Terms & conditions",
          {
            page: "terms",
          },
        ],
      ],
    ],
  ];
  const strip = [...STORIES.slice(0, 9), ...STORIES.slice(0, 9)];
  return (
    <footer className="pt-8">
      <div
        className="overflow-hidden py-4"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        <div
          className="ks-anim flex w-max gap-3"
          style={{
            animation: "ks-marquee 60s linear infinite",
          }}
        >
          {strip.map((item, index) => (
            <motion.button
              type="button"
              onClick={() =>
                go({
                  page: "article",
                  slug: item.slug,
                })
              }
              whileHover={{
                y: -8,
                rotate: index % 2 ? 2 : -2,
                scale: 1.04,
              }}
              transition={SPRING}
              className="ks-ring shrink-0 overflow-hidden rounded-[18px] outline-none"
              aria-label={item.title}
              key={index}
            >
              <Cover cover={item.cover} className="h-32 w-40 sm:h-36 sm:w-44" />
            </motion.button>
          ))}
        </div>
      </div>
      <div className={`${CONTAINER} grid gap-12 pb-10 pt-14 lg:grid-cols-[1.1fr_1.9fr]`}>
        <div>
          <span
            className="text-[26px] font-bold"
            style={{
              letterSpacing: "-0.06em",
            }}
          >
            kiosk
            <span
              style={{
                color: COLOR.faint,
              }}
            >
              .
            </span>
          </span>
          <p
            className="m-0 mt-4 max-w-[320px] text-[14.5px] leading-[1.6]"
            style={{
              color: COLOR.soft,
            }}
          >
            Stories on design, technology, culture and the details of a good life. Independent, ad-light and written by
            people.
          </p>
          <div className="mt-6 flex gap-1.5">
            {(
              [
                ["ph:x-logo", "X"],
                ["ph:instagram-logo", "Instagram"],
                ["ph:linkedin-logo", "LinkedIn"],
                ["ph:pinterest-logo", "Pinterest"],
                ["ph:youtube-logo", "YouTube"],
              ] as const
            ).map(([r, s]) => (
              <motion.a
                href="#"
                onClick={(i) => i.preventDefault()}
                whileHover={{
                  y: -3,
                }}
                aria-label={s}
                className="ks-ring grid h-9 w-9 place-items-center rounded-full outline-none"
                style={{
                  boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
                  color: COLOR.ink,
                }}
                key={s}
              >
                <Icon name={r} size={16} />
              </motion.a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map(([r, s]) => (
            <div key={r}>
              <h3 className="m-0 text-[14px] font-semibold">{r}</h3>
              <ul className="m-0 mt-4 grid list-none gap-2.5 p-0">
                {s.map(([i, o]) => (
                  <li key={i}>
                    <Link
                      to={o}
                      className="group inline-flex items-center gap-1 text-[14.5px] transition-colors"
                      style={{
                        color: COLOR.soft,
                      }}
                    >
                      <span className="transition-colors group-hover:text-[#0C0C0D]">{i}</span>
                      <span
                        className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        style={{
                          color: COLOR.ink,
                        }}
                      >
                        <Icon name="ph:arrow-up-right" size={12} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className={CONTAINER}>
        <div
          aria-hidden={true}
          className="select-none overflow-hidden font-bold"
          style={{
            fontSize: "clamp(110px, 27vw, 380px)",
            letterSpacing: "-0.08em",
            lineHeight: 0.8,
            height: "0.74em",
            color: COLOR.ink,
          }}
        >
          {"kiosk.".split("").map((item, index) => (
            <motion.span
              className="inline-block"
              initial={{
                y: "70%",
              }}
              whileInView={{
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1,
                ease: EASE,
                delay: index * 0.05,
              }}
              style={{
                color: item === "." ? COLOR.hi : COLOR.ink,
              }}
              key={index}
            >
              {item}
            </motion.span>
          ))}
        </div>
        <div
          className="flex flex-wrap justify-between gap-3 py-6 text-[13px]"
          style={{
            borderTop: `1px solid ${COLOR.line}`,
            color: COLOR.soft,
          }}
        >
          <span>© 2026 Kiosk, a fictional magazine made for this template.</span>
          <span className="flex gap-5">
            <Link
              to={{
                page: "privacy",
              }}
            >
              Privacy
            </Link>
            <Link
              to={{
                page: "terms",
              }}
            >
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
/** A small ink dot that follows the pointer on desktop and grows into a label over links that name one. */
export function Cursor() {
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const x = useSpring(pointerX, {
    stiffness: 500,
    damping: 40,
  });
  const y = useSpring(pointerY, {
    stiffness: 500,
    damping: 40,
  });
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // only on a mouse or trackpad; touch screens keep their own pointer. Known only in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(window.matchMedia("(pointer: fine)").matches);
    const onMove = (event: PointerEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      // links can name what the cursor says over them: <Link cursor="Read">
      const target = (event.target as HTMLElement | null)?.closest?.("[data-cursor]");
      setLabel(target ? target.getAttribute("data-cursor") : null);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointerX, pointerY]);
  if (visible) {
    return (
      <motion.div
        aria-hidden={true}
        className="pointer-events-none fixed left-0 top-0 z-[200]"
        style={{
          x: x,
          y: y,
        }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              initial={{
                scale: 0,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 26,
              }}
              className="-ml-9 -mt-9 grid h-[72px] w-[72px] place-items-center rounded-full text-[13px] font-semibold"
              style={{
                background: COLOR.hi,
                color: COLOR.hiInk,
                boxShadow: "0 10px 30px -10px rgba(0,0,0,.35)",
              }}
              key={label}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    );
  } else {
    return null;
  }
}
