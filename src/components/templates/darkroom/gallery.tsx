"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { DragControls } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { STYLES, styleName } from "./data";
import { seededRandom } from "./random";
import { ASPECTS, renderPrint } from "./render";
import { COLORS, EASE, SPRING, SPRING_SOFT, hashString } from "./theme";
import type { Draft, Flight, GalleryTab, Img, ImgMap, SeedPlaceholder, StyleId, ViewerActs } from "./types";
import { CountUp, Icon, IconButton } from "./ui";

/** A ref plus the live width of the element it is attached to. */
function useWidth(): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/** Breathing dots shown while a print is still being painted. */
export function Placeholder({ seed }: { seed: string }) {
  const rand = seededRandom(hashString(seed));
  return (
    <div className="absolute inset-0 grid grid-cols-8 place-items-center p-2" aria-hidden={true}>
      {Array.from(
        {
          length: 64,
        },
        (_, dot) => (
          <span
            key={dot}
            className="breathe rounded-full"
            style={{
              width: 3 + rand() * 4,
              height: 3 + rand() * 4,
              background: COLORS.faint,
              animationDelay: `${rand() * 2}s`,
            }}
          />
        ),
      )}
    </div>
  );
}

type TileProps = {
  im: Img | null;
  x: number;
  y: number;
  w: number;
  h: number;
  hidden: boolean;
  inViewer: boolean;
  acts: ViewerActs;
  pending: string;
};

/** One print in the masonry grid, positioned absolutely so reflows animate with springs. */
function Tile({ im: img, x, y, w, h, hidden, inViewer, acts, pending }: TileProps) {
  return (
    <motion.div
      data-gal-id={img?.id ?? pending}
      layout={false}
      initial={{
        x,
        y,
        opacity: 0,
        scale: 0.94,
      }}
      animate={{
        x,
        y,
        opacity: hidden ? 0 : 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.86,
        filter: "blur(6px)",
        transition: {
          duration: 0.25,
        },
      }}
      transition={{
        x: SPRING_SOFT,
        y: SPRING_SOFT,
        opacity: {
          duration: hidden ? 0 : 0.01,
        },
        scale: SPRING_SOFT,
      }}
      className="group/g absolute left-0 top-0 overflow-hidden rounded-[12px]"
      style={{
        width: w,
        height: h,
        background: COLORS.raise,
        boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
      }}
    >
      {img ? (
        <>
          <button
            type="button"
            onClick={() => acts.open(img.id)}
            aria-label={`Open ${img.title}`}
            className="absolute inset-0 block size-full"
          >
            {!inViewer && (
              <motion.img
                layoutId={`g-${img.id}`}
                src={img.url}
                alt={img.title}
                draggable={false}
                initial={{
                  opacity: 0,
                  filter: "blur(8px)",
                }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  opacity: {
                    duration: 0.5,
                  },
                  filter: {
                    duration: 0.6,
                  },
                  layout: SPRING_SOFT,
                }}
                className="size-full object-cover"
              />
            )}
          </button>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] opacity-0 transition-opacity duration-300 group-hover/g:opacity-100 group-focus-within/g:opacity-100"
            style={{
              background: "linear-gradient(180deg,rgba(8,7,6,0) 0%,rgba(8,7,6,.78) 100%)",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-1 items-end gap-1 p-2 opacity-0 transition-[opacity,transform] duration-300 group-hover/g:translate-y-0 group-hover/g:opacity-100 group-focus-within/g:translate-y-0 group-focus-within/g:opacity-100">
            <div className="min-w-0 flex-1 pb-0.5 pl-0.5">
              <p
                className="truncate text-[12.5px] font-[600]"
                style={{
                  color: "#F6F2EC",
                }}
              >
                {img.title}
              </p>
              <p
                className="truncate text-[11px]"
                style={{
                  color: "rgba(246,242,236,.72)",
                }}
              >
                {styleName(img.spec.style)}
              </p>
            </div>
            {(
              [
                ["ph:download-simple", "Download PNG", () => acts.download(img.id)],
                ["ph:trash", "Delete", () => acts.remove(img.id)],
              ] as const
            ).map(([icon, label, onClick]) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                data-tip={label}
                onClick={onClick}
                className="pointer-events-auto grid size-7 shrink-0 place-items-center rounded-[8px] backdrop-blur-md transition-colors hover:bg-[rgba(255,255,255,.2)]"
                style={{
                  background: "rgba(255,255,255,.12)",
                  color: "#F6F2EC",
                }}
              >
                <Icon name={icon} size={14} />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label={img.fav ? "Remove from favourites" : "Add to favourites"}
            aria-pressed={img.fav}
            onClick={() => acts.fav(img.id)}
            className={`absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-[8px] backdrop-blur-md transition-opacity duration-200 ${img.fav ? "opacity-100" : "opacity-0 group-hover/g:opacity-100 group-focus-within/g:opacity-100"}`}
            style={{
              background: "rgba(10,9,8,.42)",
              color: img.fav ? "#FF8A63" : "#F6F2EC",
            }}
          >
            <motion.span
              key={String(img.fav)}
              initial={{
                scale: 0.5,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 600,
                damping: 14,
              }}
            >
              <Icon name={img.fav ? "ph:heart-fill" : "ph:heart"} size={14} />
            </motion.span>
          </button>
        </>
      ) : (
        <Placeholder seed={pending} />
      )}
    </motion.div>
  );
}

type MasonryProps = {
  ids: string[];
  imgs: ImgMap;
  cols: number;
  landing: Set<string>;
  viewing: string | null;
  acts: ViewerActs;
  pendingSeeds: SeedPlaceholder[];
};

/** Shortest-column masonry: each tile goes under whichever column is currently shortest. */
function Masonry({ ids, imgs, cols, landing, viewing, acts, pendingSeeds }: MasonryProps) {
  const [box, width] = useWidth();
  const GAP = 8;
  const colW = width > 0 ? (width - GAP * (cols - 1)) / cols : 0;
  const heights = Array(cols).fill(0);
  const items = [
    ...ids.map((id) => ({
      id,
      ratio: imgs[id] ? imgs[id].h / imgs[id].w : 1.25,
    })),
    ...pendingSeeds.map((pendingSeed) => ({
      id: pendingSeed.id,
      ratio: ASPECTS[pendingSeed.aspect],
    })),
  ].map(({ id, ratio }) => {
    let col = 0;
    for (let next = 1; next < cols; next++) {
      if (heights[next] < heights[col] - 1) {
        col = next;
      }
    }
    const h = colW * ratio;
    const tile = {
      id,
      x: col * (colW + GAP),
      y: heights[col],
      w: colW,
      h,
    };
    heights[col] += h + GAP;
    return tile;
  });
  return (
    <div
      ref={box}
      className="relative w-full"
      style={{
        height: Math.max(0, ...heights),
      }}
    >
      {width > 0 && (
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <Tile
              key={item.id}
              im={imgs[item.id] && ids.includes(item.id) ? imgs[item.id] : null}
              pending={item.id}
              x={item.x}
              y={item.y}
              w={item.w}
              h={item.h}
              hidden={landing.has(item.id)}
              inViewer={viewing === item.id}
              acts={acts}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

type StylesPanelProps = { draft: Draft; pickStyle: (style: StyleId | null) => void };

/** Every style as a card, previewed live with the prompt being typed (debounced), or a sample prompt. */
function StylesPanel({ draft, pickStyle }: StylesPanelProps) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const rendered = useRef(new Set<string>());
  const [subject, setSubject] = useState(draft.text.trim());
  useEffect(() => {
    const timer = setTimeout(() => setSubject(draft.text.trim()), 650);
    return () => clearTimeout(timer);
  }, [draft.text]);
  useEffect(() => {
    let alive = true;
    const queue: number[] = [];
    STYLES.forEach((style, index) => {
      const prompt = subject || style.sample;
      const key = `${style.id}|${prompt}`;
      if (rendered.current.has(key)) {
        return;
      }
      queue.push(
        window.setTimeout(
          () => {
            if (!alive) {
              return;
            }
            rendered.current.add(key);
            const url = renderPrint(
              {
                prompt,
                style: style.id,
                seed: hashString(prompt),
                aspect: "4:5",
              },
              280,
            ).canvas.toDataURL("image/jpeg", 0.86);
            setPreviews((prev) => ({
              ...prev,
              [key]: url,
            }));
          },
          40 + index * 45,
        ),
      );
    });
    return () => {
      alive = false;
      queue.forEach(clearTimeout);
    };
  }, [subject]);
  return (
    <div className="pb-6">
      <p
        className="mb-3 text-[12.5px] leading-snug"
        style={{
          color: COLORS.soft,
        }}
      >
        {subject ? (
          <>
            {"Previews use your prompt: "}
            <span
              style={{
                color: COLORS.text,
              }}
            >
              {subject.length > 48 ? subject.slice(0, 48) + "..." : subject}
            </span>
          </>
        ) : (
          "Pick a style for your next print. Previews redraw as you type."
        )}
      </p>
      <button
        type="button"
        onClick={() => pickStyle(null)}
        aria-pressed={draft.style === null}
        className="mb-2 flex w-full items-center gap-3 rounded-[12px] p-2.5 text-left transition-colors hover:bg-[var(--raise)]"
        style={{
          boxShadow: draft.style === null ? `inset 0 0 0 1.5px ${COLORS.acc}` : `inset 0 0 0 1px ${COLORS.line}`,
        }}
      >
        <span
          className="grid size-9 place-items-center rounded-[9px]"
          style={{
            background: COLORS.raise,
            color: COLORS.acc,
          }}
        >
          <Icon name="ph:sparkle" size={17} />
        </span>
        <span className="flex-1">
          <span
            className="block text-[13px] font-[600]"
            style={{
              color: COLORS.ink,
            }}
          >
            Auto
          </span>
          <span
            className="block text-[12px]"
            style={{
              color: COLORS.soft,
            }}
          >
            Darkroom chooses from what you describe
          </span>
        </span>
      </button>
      <div className="grid grid-cols-2 gap-2">
        {STYLES.map((style) => {
          const selected = draft.style === style.id;
          const preview = previews[`${style.id}|${subject || style.sample}`];
          return (
            <motion.button
              key={style.id}
              type="button"
              aria-pressed={selected}
              onClick={() => pickStyle(selected ? null : style.id)}
              whileTap={{
                scale: 0.98,
              }}
              className="group/s relative overflow-hidden rounded-[12px] text-left"
              style={{
                background: COLORS.raise,
                boxShadow: selected ? `0 0 0 1.5px ${COLORS.acc}` : `inset 0 0 0 1px ${COLORS.line}`,
              }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {preview ? (
                  <motion.img
                    key={preview}
                    src={preview}
                    alt=""
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{
                      duration: 0.5,
                    }}
                    className="size-full object-cover transition-transform duration-500 group-hover/s:scale-[1.03]"
                  />
                ) : (
                  <Placeholder seed={style.id} />
                )}
                {selected && (
                  <motion.span
                    layoutId="style-check"
                    className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full"
                    style={{
                      background: COLORS.acc,
                      color: COLORS.accInk,
                    }}
                    transition={SPRING}
                  >
                    <Icon name="ph:check-bold" size={12} />
                  </motion.span>
                )}
              </div>
              <div className="px-2.5 pb-2.5 pt-2">
                <p
                  className="text-[12.5px] font-[600]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {style.name}
                </p>
                <p
                  className="mt-0.5 text-[11.5px] leading-snug"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {style.desc}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

type GalleryPanelProps = {
  tab: GalleryTab;
  setTab: (tab: GalleryTab) => void;
  ids: string[];
  imgs: ImgMap;
  landing: Set<string>;
  viewing: string | null;
  acts: ViewerActs;
  draft: Draft;
  pickStyle: (style: StyleId | null) => void;
  wide: boolean;
  setWide: (wide: boolean) => void;
  onClose: () => void;
  onNew: () => void;
  pendingSeeds: SeedPlaceholder[];
  scrollRef: RefObject<HTMLDivElement | null>;
  favOnly: boolean;
  setFavOnly: (on: boolean) => void;
  sheet?: boolean;
};

/** The right panel (or bottom sheet on phones): the gallery of prints and the styles picker. */
export function GalleryPanel({
  tab,
  setTab,
  ids,
  imgs,
  landing,
  viewing,
  acts,
  draft,
  pickStyle,
  wide,
  setWide,
  onClose,
  onNew,
  pendingSeeds,
  scrollRef,
  favOnly,
  setFavOnly,
  sheet,
}: GalleryPanelProps) {
  const shown = favOnly
    ? ids.filter((id) => {
        return imgs[id]?.fav;
      })
    : ids;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 px-3 pb-2 pt-3">
        <div
          className="relative flex rounded-[10px] p-[3px]"
          style={{
            background: COLORS.raise,
          }}
          role="tablist"
          aria-label="Panel"
        >
          {(["gallery", "styles"] as const).map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className="relative z-[1] flex h-7 items-center gap-1.5 rounded-[8px] px-3 text-[12.5px] font-[500] transition-colors"
              style={{
                color: tab === name ? COLORS.ink : COLORS.soft,
              }}
            >
              {tab === name && (
                <motion.span
                  layoutId={sheet ? "tab-pill-sheet" : "tab-pill"}
                  className="absolute inset-0 -z-[1] rounded-[8px]"
                  style={{
                    background: COLORS.panel,
                    boxShadow: `0 0 0 1px ${COLORS.line2}`,
                  }}
                  transition={SPRING}
                />
              )}
              {name === "gallery" ? (
                <>
                  {"Gallery "}
                  <CountUp value={ids.length} className="text-[11px] opacity-70" />
                </>
              ) : (
                "Styles"
              )}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {tab === "gallery" && (
          <IconButton
            icon={favOnly ? "ph:heart-fill" : "ph:heart"}
            label={favOnly ? "Show all" : "Favourites only"}
            pressed={favOnly}
            active={favOnly}
            onClick={() => setFavOnly(!favOnly)}
            tipSide="bottom"
            style={
              favOnly
                ? {
                    color: COLORS.acc,
                  }
                : undefined
            }
          />
        )}
        <IconButton icon="ph:plus" label="New image" onClick={onNew} tipSide="bottom" />
        {!sheet && (
          <IconButton
            icon={wide ? "ph:arrows-in-simple" : "ph:arrows-out-simple"}
            label={wide ? "Narrow panel" : "Widen panel"}
            onClick={() => setWide(!wide)}
            tipSide="bottom"
          />
        )}
        <IconButton
          icon={sheet ? "ph:x" : "ph:sidebar-simple"}
          label={sheet ? "Close" : "Hide panel"}
          onClick={onClose}
          tipSide="bottom"
          style={
            sheet
              ? undefined
              : {
                  transform: "scaleX(-1)",
                }
          }
        />
      </div>
      <div ref={scrollRef} className="thin min-h-0 flex-1 overflow-y-auto px-3 pt-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{
              opacity: 0,
              x: tab === "styles" ? 16 : -16,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: tab === "styles" ? 16 : -16,
            }}
            transition={{
              duration: 0.22,
              ease: EASE,
            }}
          >
            {tab === "gallery" ? (
              <div className="pb-6">
                {favOnly && shown.length === 0 ? (
                  <p
                    className="py-16 text-center text-[13px]"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    No favourites yet. Tap the heart on any print.
                  </p>
                ) : (
                  <Masonry
                    ids={shown}
                    imgs={imgs}
                    cols={wide ? 3 : 2}
                    landing={landing}
                    viewing={viewing}
                    acts={acts}
                    pendingSeeds={favOnly ? [] : pendingSeeds}
                  />
                )}
              </div>
            ) : (
              <StylesPanel draft={draft} pickStyle={pickStyle} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** A finished print flying from its chat card into its gallery slot (or onto the gallery button). */
export function FlyToGallery({ f: flight, onDone }: { f: Flight; onDone: () => void }) {
  const dx = flight.from.left - flight.to.left;
  const dy = flight.from.top - flight.to.top;
  const sx = flight.from.width / flight.to.width;
  const sy = flight.from.height / flight.to.height;
  return (
    <motion.img
      src={flight.url}
      alt=""
      aria-hidden={true}
      className="pointer-events-none fixed z-[90] object-cover"
      style={{
        left: flight.to.left,
        top: flight.to.top,
        width: flight.to.width,
        height: flight.to.height,
        transformOrigin: "0 0",
        borderRadius: 12,
      }}
      initial={{
        x: dx,
        y: dy,
        scaleX: sx,
        scaleY: sy,
        rotate: 0,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
      }}
      animate={{
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotate: [0, -2.5, 0],
        opacity: flight.toButton ? [1, 1, 0] : 1,
        boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 30px 60px -10px rgba(0,0,0,.55)", "0 0 0 rgba(0,0,0,0)"],
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 1,
        rotate: {
          duration: 0.8,
          ease: EASE,
        },
        opacity: {
          duration: 0.8,
        },
        boxShadow: {
          duration: 0.8,
        },
      }}
      onAnimationComplete={onDone}
    />
  );
}

/** The grab bar on the phone sheet: drag it down to close. */
export function GalleryHandle({ onClose, controls }: { onClose: () => void; controls: DragControls }) {
  return (
    <button
      type="button"
      aria-label="Close gallery"
      onClick={onClose}
      onPointerDown={(event) => controls.start(event)}
      className="mx-auto mt-1 grid h-7 w-24 shrink-0 touch-none place-items-center"
    >
      <span
        className="h-1 w-10 rounded-full"
        style={{
          background: COLORS.line2,
        }}
      />
    </button>
  );
}
