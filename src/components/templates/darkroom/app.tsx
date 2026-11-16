"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { JobResult, Landing, UserMessage } from "./chat";
import { Composer } from "./composer";
import {
  PROJECTS,
  STARTER_PRINTS,
  describePrint,
  fileSlug,
  modelById,
  seedId,
  shortTitle,
  starterChats,
  styleName,
  titleFor,
} from "./data";
import { FlyToGallery, GalleryHandle, GalleryPanel } from "./gallery";
import { parsePrompt, pickStyle } from "./prompt";
import { canvasUrl, printCache, renderPrint, resolveJob } from "./render";
import { SearchDialog, Sidebar } from "./sidebar";
import { BASE_CSS, COLORS, EASE, FONT_CSS, FONT_SANS, SPRING, SPRING_SOFT, hashString, uid } from "./theme";
import type {
  Chat,
  DevelopOptions,
  Draft,
  Flight,
  GalleryTab,
  ImgMap,
  Job,
  PrintActs,
  PrintSpec,
  SeedPlaceholder,
  StyleId,
  Theme,
  Toast,
  ViewerActs,
} from "./types";
import { CountUp, Icon, IconButton, useIsMobile } from "./ui";
import { Viewer } from "./viewer";

/**
 * Darkroom: a chat-first image studio. Prompts develop into prints on screen, land in a masonry gallery,
 * and open in a zoomable viewer. Every print is painted live on a canvas from its prompt and seed.
 */
export function DarkroomApp() {
  const isMobile = useIsMobile(1024);
  const isNarrow = useIsMobile(1280);
  const reduce = useReducedMotion();
  const [openedAt] = useState(() => Date.now());
  const [now, setNow] = useState(openedAt);
  const [theme, setTheme] = useState<Theme>("dark");
  const [imgs, setImgs] = useState<ImgMap>({});
  const [order, setOrder] = useState<string[]>([]);
  const [seeding, setSeeding] = useState<SeedPlaceholder[]>(() =>
    STARTER_PRINTS.map((starterPrint, i) => ({
      id: seedId(i),
      aspect: starterPrint.aspect,
    })),
  );
  const [chats, setChats] = useState(() => starterChats(openedAt));
  const [activeChat, setActiveChat] = useState("c-menu");
  const [draft, setDraft] = useState<Draft>({
    text: "",
    style: null,
    aspect: "4:5",
    count: 1,
    ref: null,
    model: "emulsion",
    mode: "agent",
  });
  const updateDraft = useCallback(
    (change: Partial<Draft>) =>
      setDraft((prev) => ({
        ...prev,
        ...change,
      })),
    [],
  );
  const [tab, setTab] = useState<GalleryTab>("gallery");
  const [galleryOpen, setGalleryOpen] = useState(true);
  const [galleryWide, setGalleryWide] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [gallerySheet, setGallerySheet] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);
  const [landing, setLanding] = useState(() => new Set<string>());
  const [flights, setFlights] = useState<Flight[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [credits, setCredits] = useState(412);
  const [quick, setQuick] = useState(false);
  const [galleryBump, setGalleryBump] = useState(0);
  const promptField = useRef<HTMLTextAreaElement>(null);
  const galleryScroll = useRef<HTMLDivElement>(null);
  const sheetScroll = useRef<HTMLDivElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  // Async callbacks (timers, canvas blobs, rAF) read the latest prints from here.
  const imgsRef = useRef(imgs);
  useLayoutEffect(() => {
    imgsRef.current = imgs;
  }, [imgs]);
  const sheetDrag = useDragControls();
  const chat = chats.find((item) => item.id === activeChat) ?? chats[0];
  const developing = chat.msgs.some((msg) => msg.role === "art" && msg.job.status === "developing");
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 3e4);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let alive = true;
    let next = 0;
    const seedOne = () => {
      if (!alive || next >= STARTER_PRINTS.length) {
        return;
      }
      const index = next++;
      const seed = STARTER_PRINTS[index];
      const spec: PrintSpec = {
        prompt: seed.prompt,
        style: seed.style,
        seed: hashString(seed.prompt),
        aspect: seed.aspect,
      };
      const { canvas, meta } = renderPrint(spec, 768);
      printCache.set(seedId(index), canvas);
      canvasUrl(canvas).then((url) => {
        if (alive) {
          setImgs((prev) => ({
            ...prev,
            [seedId(index)]: {
              id: seedId(index),
              url,
              w: meta.w,
              h: meta.h,
              spec,
              palette: meta.palette,
              title: seed.title,
              model: "emulsion",
              at: openedAt - seed.ago,
              fav: !!seed.fav,
              chat: seed.chat,
              scale: 1,
            },
          }));
          setOrder((prev) => [...prev, seedId(index)]);
          setSeeding((prev) => prev.filter((placeholder) => placeholder.id !== seedId(index)));
        }
      });
      setTimeout(seedOne, 16);
    };
    const timer = setTimeout(seedOne, 120);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [openedAt]);
  const toast = useCallback((text: string, undo?: () => void) => {
    const id = uid();
    setToasts((prev) => [
      ...prev.slice(-2),
      {
        id,
        text,
        undo,
      },
    ]);
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), undo ? 6e3 : 2600);
  }, []);
  const updateJob = useCallback(
    (jobId: string, change: Partial<Job>) =>
      setChats((prev) =>
        prev.map((item) => ({
          ...item,
          msgs: item.msgs.map((msg) =>
            msg.role === "art" && msg.job.id === jobId
              ? {
                  ...msg,
                  job: {
                    ...msg.job,
                    ...change,
                  },
                }
              : msg,
          ),
        })),
      ),
    [],
  );
  const develop = useCallback(
    (prompt: string, options: DevelopOptions) => {
      const parsed = parsePrompt(prompt);
      const seedBase = (options.seedBase ?? hashString(prompt)) >>> 0;
      const style = options.style ?? pickStyle(parsed, seedBase);
      const specs = Array.from(
        {
          length: options.count,
        },
        (_, take): PrintSpec => ({
          prompt,
          style,
          seed: (seedBase + take * 7919) >>> 0,
          aspect: options.aspect,
          palette: options.palette ?? null,
        }),
      );
      const ids = specs.map(() => uid());
      const model = modelById(options.model);
      const size = model.long * (options.upscale ? 2 : 1);
      const palette = resolveJob(specs[0]).palette;
      const title = titleFor(prompt, seedBase);
      const job: Job = {
        id: uid(),
        prompt,
        specs,
        ids,
        model: options.model,
        mode: options.mode,
        status: "developing",
        at: performance.now() + 60,
        dur: quick ? model.ms * 0.5 : model.ms,
        vote: 0,
        note: options.upscale
          ? "Re-printing the same seed at twice the resolution. Grain and edges are drawn again at the new size, not stretched."
          : describePrint(prompt, style, options.aspect, palette, options.count, !options.style),
        upscale: options.upscale,
      };
      if (reduce) {
        job.at = performance.now() - 1e5;
      }
      specs.forEach((spec, i) =>
        setTimeout(
          () => {
            const { canvas, meta } = renderPrint(spec, size);
            printCache.set(ids[i], canvas);
            canvasUrl(canvas).then((url) =>
              setImgs((prev) => ({
                ...prev,
                [ids[i]]: {
                  id: ids[i],
                  url,
                  w: meta.w,
                  h: meta.h,
                  spec,
                  palette: meta.palette,
                  title:
                    options.count > 1
                      ? `${title} ${["I", "II", "III", "IV"][i]}`
                      : options.upscale
                        ? `${title} 2x`
                        : title,
                  model: options.model,
                  at: Date.now(),
                  fav: false,
                  chat: activeChat,
                  scale: options.upscale ? 2 : 1,
                },
              })),
            );
            if (options.upscale && i === 0) {
              updateJob(job.id, {
                label: `${meta.w} × ${meta.h}`,
              });
            }
          },
          90 + i * 70,
        ),
      );
      setChats((prev) =>
        prev.map((item): Chat =>
          item.id !== activeChat
            ? item
            : {
                ...item,
                at: Date.now(),
                title: item.title === "New chat" ? shortTitle(prompt) : item.title,
                ctx: Math.min(100, item.ctx + 3 + 2 * options.count),
                msgs: [
                  ...item.msgs,
                  {
                    id: uid(),
                    role: "user",
                    text: options.userText ?? prompt,
                    tags: options.tags ?? [],
                  },
                  {
                    id: uid(),
                    role: "art",
                    job,
                  },
                ],
              },
        ),
      );
      setCredits((prev) => Math.max(0, prev - model.cost * options.count * (options.upscale ? 2 : 1)));
    },
    [activeChat, updateJob, quick, reduce],
  );
  const send = () => {
    const text = draft.text.trim();
    if (!text || developing) {
      return;
    }
    const reference = draft.ref ? imgs[draft.ref] : null;
    const options = [
      draft.style ? styleName(draft.style) : "",
      draft.aspect !== "4:5" ? draft.aspect : "",
      draft.count > 1 ? `${draft.count} images` : "",
      reference ? `Palette from ${reference.title}` : "",
    ].filter(Boolean);
    develop(text, {
      style: draft.style,
      aspect: draft.aspect,
      count: draft.count,
      model: draft.model,
      mode: draft.mode,
      palette: reference?.palette ?? null,
      tags: options,
    });
    updateDraft({
      text: "",
      ref: null,
    });
  };
  /**
   * A job finished developing: mark it done, put its prints at the top of the gallery, and fly each print
   * from its chat card into its gallery slot (or onto the gallery button when the panel is closed).
   */
  const toGallery = useCallback(
    (jobId: string) => {
      let moved: string[] = [];
      setChats((prev) =>
        prev.map((item) => ({
          ...item,
          msgs: item.msgs.map((msg) => {
            if (msg.role !== "art" || msg.job.id !== jobId || msg.job.status === "done") {
              return msg;
            }
            moved = msg.job.ids;
            return { ...msg, job: { ...msg.job, status: "done" as const } };
          }),
        })),
      );
      setTimeout(() => {
        moved = moved.filter((id) => imgsRef.current[id]);
        if (!moved.length) {
          return;
        }
        setOrder((prev) => [...moved, ...prev.filter((id) => !moved.includes(id))]);
        if (reduce) {
          return;
        }
        setLanding((prev) => new Set([...prev, ...moved]));
        requestAnimationFrame(() => {
          if (galleryScroll.current) {
            galleryScroll.current.scrollTop = 0;
          }
          // Two frames: one for the gallery to lay the new tiles out, one for their positions to settle.
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              const next: Flight[] = [];
              const button = [...document.querySelectorAll<HTMLElement>("[data-gal-target]")].find(
                (el) => el.offsetParent !== null,
              );
              for (const id of moved) {
                const card = document.querySelector(`[data-art-id="${id}"]`);
                const slot = document.querySelector(`[data-gal-id="${id}"]`);
                if (!card) {
                  continue;
                }
                const from = card.getBoundingClientRect();
                if (slot && slot.getBoundingClientRect().width > 0) {
                  next.push({
                    id,
                    url: imgsRef.current[id].url,
                    from,
                    to: slot.getBoundingClientRect(),
                    toButton: false,
                  });
                } else if (button) {
                  const target = button.getBoundingClientRect();
                  const size = 26;
                  next.push({
                    id,
                    url: imgsRef.current[id].url,
                    from,
                    to: new DOMRect(
                      target.left + target.width / 2 - size / 2,
                      target.top + target.height / 2 - size / 2,
                      size,
                      size * (from.height / from.width),
                    ),
                    toButton: true,
                  });
                }
              }
              if (next.length) {
                setFlights((prev) => [...prev, ...next]);
              }
              const flying = new Set(next.map((flight) => flight.id));
              setLanding((prev) => new Set([...prev].filter((id) => !moved.includes(id) || flying.has(id))));
            }),
          );
        });
      }, 30);
    },
    [reduce],
  );
  const download = useCallback(
    (id: string) => {
      const img = imgsRef.current[id];
      if (!img) {
        return;
      }
      const link = document.createElement("a");
      link.href = img.url;
      link.download = `${fileSlug(img.title)}-${img.w}x${img.h}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast(`Saved ${fileSlug(img.title)}.png`);
    },
    [toast],
  );
  const copyPrompt = useCallback(
    (text: string) => {
      try {
        navigator.clipboard?.writeText(text).catch(() => {});
      } catch {}
      toast("Prompt copied");
    },
    [toast],
  );
  const toggleFav = useCallback(
    (id: string) =>
      setImgs((prev) =>
        prev[id]
          ? {
              ...prev,
              [id]: {
                ...prev[id],
                fav: !prev[id].fav,
              },
            }
          : prev,
      ),
    [],
  );
  const removeFromGallery = useCallback(
    (id: string) => {
      const img = imgsRef.current[id];
      let at = 0;
      setOrder((prev) => {
        at = prev.indexOf(id);
        return prev.filter((item) => item !== id);
      });
      setViewing((prev) => (prev === id ? null : prev));
      toast(`Deleted "${img?.title ?? "print"}"`, () =>
        setOrder((prev) => (prev.includes(id) ? prev : [...prev.slice(0, at), id, ...prev.slice(at)])),
      );
    },
    [toast],
  );
  const viewerActs = useMemo<ViewerActs>(
    () => ({
      open: (id) => setViewing(id),
      fav: toggleFav,
      download,
      remove: removeFromGallery,
    }),
    [toggleFav, download, removeFromGallery],
  );
  const printActs: PrintActs = {
    open: (id) => setViewing(id),
    download,
    copy: copyPrompt,
    finish: toGallery,
    vote: (jobId, vote) => {
      const msg = chat.msgs.find((item) => item.role === "art" && item.job.id === jobId);
      if (msg && msg.role === "art") {
        updateJob(jobId, {
          vote: msg.job.vote === vote ? 0 : vote,
        });
      }
    },
    variations: (job) =>
      develop(job.prompt, {
        style: job.specs[0].style,
        aspect: job.specs[0].aspect,
        count: 4,
        model: draft.model,
        mode: draft.mode,
        seedBase: (Math.random() * 1e9) | 0,
        palette: job.specs[0].palette,
        userText: `Variations of "${job.prompt}"`,
        tags: [styleName(job.specs[0].style), "4 images"],
      }),
    upscale: (id) => {
      const img = imgsRef.current[id];
      if (img) {
        develop(img.spec.prompt, {
          style: img.spec.style,
          aspect: img.spec.aspect,
          count: 1,
          model: draft.model,
          mode: "agent",
          seedBase: img.spec.seed,
          palette: img.palette,
          upscale: true,
          userText: `Upscale "${img.title}" to 2x`,
          tags: [],
        });
      }
    },
  };
  const chooseStyle = (style: StyleId | null) => {
    updateDraft({
      style,
    });
    if (isMobile) {
      setGallerySheet(false);
      setTimeout(() => {
        return promptField.current?.focus();
      }, 300);
    }
  };
  const openStyles = () => {
    setTab("styles");
    if (isMobile) {
      setGallerySheet(true);
    } else {
      setGalleryOpen(true);
    }
  };
  const newChat = useCallback(() => {
    const id = uid();
    setChats((prev) => [
      {
        id,
        title: "New chat",
        project: (prev.find((item) => item.id === activeChat) ?? prev[0]).project,
        at: Date.now(),
        msgs: [],
        ctx: 0,
      },
      ...prev,
    ]);
    setActiveChat(id);
    setSideOpen(false);
    setTimeout(() => {
      return promptField.current?.focus();
    }, 50);
  }, [activeChat]);
  const viewerOrder = order.includes(viewing ?? "") ? order : viewing ? [viewing] : [];
  const viewerIndex = viewing ? viewerOrder.indexOf(viewing) : -1;
  const viewingImg = viewing ? imgs[viewing] : null;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typingInField = /INPUT|TEXTAREA/.test((event.target as HTMLElement).tagName);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }
      if (!(typingInField || viewing || searchOpen)) {
        if (event.key === "/") {
          event.preventDefault();
          promptField.current?.focus();
        }
        if (event.key.toLowerCase() === "n" && !event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          newChat();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [newChat, viewing, searchOpen]);
  const doneCount = chat.msgs.filter((msg) => msg.role === "art" && msg.job.status === "done").length;
  useEffect(() => {
    const timer = setTimeout(() => {
      chatEnd.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "end",
      });
    }, 60);
    return () => clearTimeout(timer);
  }, [chat.msgs.length, doneCount, activeChat, reduce]);
  // Leaving the phone layout closes the drawer and the sheet, so they are not open when it comes back.
  const [wasMobile, setWasMobile] = useState(isMobile);
  if (wasMobile !== isMobile) {
    setWasMobile(isMobile);
    if (!isMobile) {
      setSideOpen(false);
      setGallerySheet(false);
    }
  }
  const galleryWidth = galleryWide ? 580 : isNarrow ? 340 : 392;
  const projectName = PROJECTS.find((project) => project.id === chat.project)?.name ?? "";
  const galleryProps = {
    tab,
    setTab,
    ids: order,
    imgs,
    landing,
    viewing,
    acts: viewerActs,
    draft,
    pickStyle: chooseStyle,
    wide: galleryWide,
    setWide: setGalleryWide,
    favOnly,
    setFavOnly,
    pendingSeeds: seeding,
    onNew: () => {
      setGallerySheet(false);
      promptField.current?.focus();
    },
  };
  const sidebar = (
    <Sidebar
      chats={chats}
      active={activeChat}
      setActive={(id) => {
        setActiveChat(id);
        setSideOpen(false);
      }}
      newChat={newChat}
      openSearch={() => {
        setSearchOpen(true);
        setSideOpen(false);
      }}
      theme={theme}
      setTheme={setTheme}
      credits={credits}
      quick={quick}
      setQuick={setQuick}
      now={now}
    />
  );
  return (
    <div
      className="dr fixed inset-0 flex overflow-hidden antialiased"
      data-theme={theme}
      style={{
        background: COLORS.bg,
        color: COLORS.ink,
        fontFamily: FONT_SANS,
      }}
    >
      <style>{FONT_CSS + BASE_CSS}</style>
      {!isMobile && (
        <aside className="w-[264px] shrink-0" aria-label="Sidebar">
          {sidebar}
        </aside>
      )}
      <div
        className={`flex min-w-0 flex-1 overflow-hidden ${isMobile ? "" : "my-2 mr-2 rounded-[18px]"}`}
        style={{
          background: COLORS.panel,
          boxShadow: isMobile ? undefined : `0 0 0 1px ${COLORS.line}, 0 20px 50px -30px rgba(0,0,0,.6)`,
        }}
      >
        <main className="relative flex min-w-0 flex-1 flex-col">
          <header
            className="flex h-[52px] shrink-0 items-center gap-1 px-3"
            style={{
              boxShadow: `0 1px 0 ${COLORS.line}`,
            }}
          >
            {isMobile && (
              <IconButton icon="ph:list" label="Open sidebar" onClick={() => setSideOpen(true)} tipSide="bottom" />
            )}
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 px-1.5 text-[13.5px]">
              {!isMobile && (
                <>
                  <Icon
                    name="ph:folder-simple"
                    size={15}
                    style={{
                      color: COLORS.soft,
                    }}
                  />
                  <span
                    style={{
                      color: COLORS.soft,
                    }}
                    className="shrink-0"
                  >
                    {projectName}
                  </span>
                  <Icon
                    name="ph:caret-right"
                    size={11}
                    style={{
                      color: COLORS.faint,
                    }}
                  />
                </>
              )}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={chat.id + chat.title}
                  initial={{
                    opacity: 0,
                    y: 4,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -4,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
                  className="truncate font-[500]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {chat.title}
                </motion.span>
              </AnimatePresence>
            </nav>
            <div className="flex-1" />
            {isMobile ? (
              <button
                type="button"
                data-gal-target={true}
                onClick={() => {
                  setTab("gallery");
                  setGallerySheet(true);
                }}
                aria-label={`Open gallery, ${order.length} prints`}
                className="relative flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[13px] font-[500]"
                style={{
                  color: COLORS.ink,
                  boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
                }}
              >
                <Icon name="ph:images-square" size={16} />
                Gallery
                <motion.span
                  key={galleryBump}
                  initial={{
                    scale: galleryBump ? 1.5 : 1,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 12,
                  }}
                  className="grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10.5px] tabular-nums"
                  style={{
                    background: COLORS.acc,
                    color: COLORS.accInk,
                  }}
                >
                  {order.length}
                </motion.span>
              </button>
            ) : (
              !galleryOpen && (
                <button
                  type="button"
                  data-gal-target={true}
                  onClick={() => setGalleryOpen(true)}
                  className="flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[13px] transition-colors hover:bg-[var(--raise)]"
                  style={{
                    color: COLORS.text,
                  }}
                >
                  <Icon
                    name="ph:sidebar-simple"
                    size={16}
                    style={{
                      transform: "scaleX(-1)",
                    }}
                  />
                  {"Gallery "}
                  <CountUp value={order.length} className="text-[12px] opacity-70" />
                </button>
              )
            )}
          </header>
          <div className="thin relative min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={chat.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.22,
                  ease: EASE,
                }}
                className="mx-auto flex min-h-full w-full max-w-[780px] flex-col px-4 pt-6 sm:px-6"
              >
                {chat.msgs.length === 0 ? (
                  <Landing
                    onPick={(text, style) => {
                      updateDraft({
                        text,
                        style,
                      });
                      promptField.current?.focus();
                    }}
                  />
                ) : (
                  <div className="flex flex-col gap-7 pb-8">
                    {chat.msgs.map((msg) =>
                      msg.role === "user" ? (
                        <UserMessage key={msg.id} m={msg} />
                      ) : (
                        <JobResult key={msg.id} job={msg.job} imgs={imgs} light={theme === "light"} act={printActs} />
                      ),
                    )}
                  </div>
                )}
                <div ref={chatEnd} className="h-px" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="relative shrink-0 px-3 pb-3 sm:px-6 sm:pb-4">
            <div
              className="pointer-events-none absolute inset-x-0 -top-8 h-8"
              style={{
                background: `linear-gradient(180deg, transparent, ${COLORS.panel})`,
              }}
            />
            <div className="mx-auto w-full max-w-[780px]">
              <Composer
                d={draft}
                set={updateDraft}
                onSend={send}
                busy={developing}
                imgs={imgs}
                order={order}
                openStyles={openStyles}
                projects={PROJECTS}
                project={chat.project}
                setProject={(project) =>
                  setChats((prev) => prev.map((item) => (item.id === chat.id ? { ...item, project } : item)))
                }
                ctx={chat.ctx}
                narrow={isMobile}
                inputRef={promptField}
              />
            </div>
          </div>
        </main>
        {!isMobile && (
          <motion.aside
            aria-label="Gallery and styles"
            initial={false}
            animate={{
              width: galleryOpen ? galleryWidth : 0,
            }}
            transition={SPRING_SOFT}
            className="shrink-0 overflow-hidden"
            style={{
              boxShadow: `-1px 0 0 ${COLORS.line}`,
            }}
          >
            <div
              className="h-full"
              style={{
                width: galleryWidth,
              }}
            >
              <GalleryPanel {...galleryProps} onClose={() => setGalleryOpen(false)} scrollRef={galleryScroll} />
            </div>
          </motion.aside>
        )}
      </div>
      <AnimatePresence>
        {isMobile && sideOpen && (
          <motion.div
            key="drawer"
            className="fixed inset-0 z-[60]"
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
                background: "rgba(8,7,6,.5)",
              }}
              onClick={() => setSideOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-label="Sidebar"
              className="absolute inset-y-0 left-0 w-[86vw] max-w-[300px]"
              initial={{
                x: "-100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "-100%",
              }}
              transition={SPRING_SOFT}
              drag="x"
              dragConstraints={{
                left: 0,
                right: 0,
              }}
              dragElastic={{
                left: 0.4,
                right: 0,
              }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) {
                  setSideOpen(false);
                }
              }}
              style={{
                boxShadow: "20px 0 60px rgba(0,0,0,.4)",
              }}
            >
              {sidebar}
            </motion.div>
          </motion.div>
        )}
        {isMobile && gallerySheet && (
          <motion.div
            key="sheet"
            className="fixed inset-0 z-[60]"
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
                background: "rgba(8,7,6,.5)",
              }}
              onClick={() => setGallerySheet(false)}
            />
            <motion.div
              role="dialog"
              aria-label="Gallery"
              className="absolute inset-x-0 bottom-0 flex h-[88dvh] flex-col overflow-hidden rounded-t-[22px]"
              style={{
                background: COLORS.panel,
                boxShadow: `0 -1px 0 ${COLORS.line2}, 0 -30px 60px rgba(0,0,0,.4)`,
              }}
              initial={{
                y: "100%",
              }}
              animate={{
                y: 0,
              }}
              exit={{
                y: "100%",
              }}
              transition={SPRING_SOFT}
              drag="y"
              dragListener={false}
              dragControls={sheetDrag}
              dragConstraints={{
                top: 0,
                bottom: 0,
              }}
              dragElastic={{
                top: 0,
                bottom: 0.6,
              }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 600) {
                  setGallerySheet(false);
                }
              }}
            >
              <GalleryHandle controls={sheetDrag} onClose={() => setGallerySheet(false)} />
              <div className="min-h-0 flex-1">
                <GalleryPanel
                  {...galleryProps}
                  sheet={true}
                  onClose={() => setGallerySheet(false)}
                  scrollRef={sheetScroll}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {searchOpen && (
          <SearchDialog
            chats={chats}
            imgs={imgs}
            order={order}
            onClose={() => setSearchOpen(false)}
            openChat={(id) => setActiveChat(id)}
            openImg={(id) => setViewing(id)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {viewingImg && (
          <Viewer
            key="viewer"
            im={viewingImg}
            now={now}
            acts={viewerActs}
            copy={copyPrompt}
            onClose={() => setViewing(null)}
            onPrev={viewerIndex > 0 ? () => setViewing(viewerOrder[viewerIndex - 1]) : undefined}
            onNext={
              viewerIndex >= 0 && viewerIndex < viewerOrder.length - 1
                ? () => setViewing(viewerOrder[viewerIndex + 1])
                : undefined
            }
            onUse={() => {
              updateDraft({
                text: viewingImg.spec.prompt,
                style: viewingImg.spec.style,
                aspect: viewingImg.spec.aspect,
              });
              setViewing(null);
              setGallerySheet(false);
              setTimeout(() => {
                return promptField.current?.focus();
              }, 250);
            }}
            onRemix={() => {
              const spec = viewingImg.spec;
              setViewing(null);
              setGallerySheet(false);
              develop(spec.prompt, {
                style: spec.style,
                aspect: spec.aspect,
                count: 1,
                model: draft.model,
                mode: draft.mode,
                seedBase: (Math.random() * 1e9) | 0,
                palette: spec.palette ?? null,
                userText: `Remix "${viewingImg.title}"`,
                tags: [styleName(spec.style), "New seed"],
              });
            }}
          />
        )}
      </AnimatePresence>
      {flights.map((flight) => (
        <FlyToGallery
          key={flight.id}
          f={flight}
          onDone={() => {
            setFlights((prev) => prev.filter((item) => item.id !== flight.id));
            setLanding((prev) => {
              const next = new Set(prev);
              next.delete(flight.id);
              return next;
            });
            if (flight.toButton) {
              setGalleryBump((prev) => prev + 1);
            }
          }}
        />
      ))}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[95] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout={true}
              initial={{
                opacity: 0,
                y: 16,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 8,
                scale: 0.96,
              }}
              transition={SPRING}
              className="pointer-events-auto flex items-center gap-3 rounded-[12px] py-2 pl-3.5 pr-2 text-[13px]"
              style={{
                background: "var(--tip-bg)",
                color: "var(--tip-ink)",
                boxShadow: "0 16px 40px -12px rgba(0,0,0,.5)",
              }}
            >
              {item.text}
              {item.undo ? (
                <button
                  type="button"
                  onClick={() => {
                    item.undo?.();
                    setToasts((prev) => prev.filter((other) => other.id !== item.id));
                  }}
                  className="rounded-[8px] px-2.5 py-1 text-[12.5px] font-[600]"
                  style={{
                    color: "var(--acc)",
                  }}
                >
                  Undo
                </button>
              ) : (
                <span className="w-1" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
