"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BoardPage } from "./board";
import { CalendarPage } from "./calendar";
import { CommandPalette } from "./command-palette";
import {
  COLUMNS,
  ME,
  NAV,
  PAGE_TITLES,
  STARTER_BOARD,
  STARTER_CUSTOMERS,
  STARTER_NOTIFICATIONS,
  STARTER_TASKS,
  eventsForMonth,
} from "./data";
import { TODAY, sameDay } from "./dates";
import { FinancePage } from "./finance";
import { HomePage } from "./home";
import { useIsMobile } from "./hooks";
import { Notifications, Sidebar } from "./sidebar";
import { TaskDrawer } from "./task-detail";
import { BASE_CSS, COLORS, EASE, FONT_CSS, SPRING, SPRING_SOFT } from "./theme";
import { Avatar, Button, Icon, IconButton } from "./ui";
import type { CalEvent, Command, Range, Task, Theme, Toast, ToastFn } from "./types";

/** The placeholder for pages still in development: what is coming, and a way back. */
function ComingSoon({ page, go }: { page: string; go: (page: string) => void }) {
  const copy: Record<string, [string, string]> = {
    marketing: [
      "Campaign reporting is in development",
      "Acquisition funnel, spend by channel and campaign performance, pulled from your ad and email accounts. Expected in the 4.13 release.",
    ],
    automations: [
      "Automations are in development",
      "Rules that act on your data: notify finance when a payment fails, assign a task when a customer churns.",
    ],
    settings: [
      "Workspace settings",
      "Members, billing, integrations and security live here. This demo workspace keeps them locked.",
    ],
    support: [
      "We're here to help",
      "Write to the Meridian team from here, browse guides, or check the status page. Typical reply time is under two hours.",
    ],
  };
  const [title, body] = copy[page] ?? ["Coming soon", ""];
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-[440px] text-center">
        <div className="relative mx-auto h-[120px] w-[220px]" aria-hidden={true}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 h-[86px] w-[150px] rounded-[16px] p-3"
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1 - i * 0.25,
                y: 0,
                x: `calc(-50% + ${(i - 1) * 34}px)`,
                rotate: (i - 1) * 7,
              }}
              transition={{
                ...SPRING_SOFT,
                delay: 0.05 * i,
              }}
              style={{
                translateY: "-50%",
                background: COLORS.card,
                boxShadow: "var(--card-shadow)",
                zIndex: i === 1 ? 2 : 1,
              }}
            >
              <div
                className="h-2 w-12 rounded-full"
                style={{
                  background: COLORS.well,
                }}
              />
              <div className="mt-3 flex h-10 items-end gap-1">
                {[0.4, 0.7, 0.5, 0.9, 0.6, 1].map((a, j) => (
                  <span
                    key={j}
                    className="flex-1 rounded-[3px]"
                    style={{
                      height: `${a * 100}%`,
                      background: i === 1 ? COLORS.accent : COLORS.well,
                      opacity: i === 1 ? 0.35 + a * 0.6 : 1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <h2
          className="mt-6 text-[20px] font-[600] tracking-[-0.02em]"
          style={{
            color: COLORS.ink,
          }}
        >
          {title}
        </h2>
        <p
          className="mt-2 text-[14px] leading-[1.6]"
          style={{
            color: COLORS.text,
          }}
        >
          {body}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={() => go("home")} icon="ph:house">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

function Toasts({ items, dismiss }: { items: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex flex-col items-center gap-2 px-3"
      aria-live="polite"
    >
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout={true}
            initial={{
              opacity: 0,
              y: -16,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.97,
            }}
            transition={SPRING}
            className="pointer-events-auto flex items-center gap-3 rounded-[13px] py-2 pl-3.5 pr-2 text-[13px]"
            style={{
              background: COLORS.ink,
              color: COLORS.card,
              boxShadow: "0 12px 30px -10px rgba(0,0,0,.5)",
            }}
          >
            <Icon name="ph:check-circle" size={16} />
            {item.msg}
            {item.undo && (
              <button
                type="button"
                onClick={() => {
                  item.undo?.();
                  dismiss(item.id);
                }}
                className="rounded-[8px] px-2 py-1 font-[600]"
                style={{
                  background: "color-mix(in srgb, var(--card) 14%, transparent)",
                }}
              >
                Undo
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function MeridianApp() {
  const reduce = useReducedMotion();
  const mobile = useIsMobile(1024);
  const [theme, setTheme] = useState<Theme>("dark");
  const [page, setPage] = useState("home");
  const [range, setRange] = useState<Range>("Month");
  const [customers, setCustomers] = useState(STARTER_CUSTOMERS);
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<Record<string, Task>>(() =>
    Object.fromEntries(STARTER_TASKS.map((starterTask) => [starterTask.id, starterTask])),
  );
  const [board, setBoard] = useState(STARTER_BOARD);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [extraEvents, setExtraEvents] = useState<CalEvent[]>([]);
  const [notes, setNotes] = useState(STARTER_NOTIFICATIONS);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [switching, setSwitching] = useState(false);
  const main = useRef<HTMLDivElement>(null);
  /** Resolves the view transition's promise once the new theme has rendered, so the reveal shows the new colours. */
  const finishTransition = useRef<(() => void) | null>(null);
  const toast: ToastFn = useCallback((text, undo) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [
      ...prev.slice(-2),
      {
        id,
        msg: text,
        undo,
      },
    ]);
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), undo ? 5e3 : 2600);
  }, []);
  const go = useCallback((next: string) => {
    setPage(next);
    setSideOpen(false);
    setAdding(null);
    main.current?.scrollTo({
      top: 0,
    });
  }, []);
  useLayoutEffect(() => {
    finishTransition.current?.();
    finishTransition.current = null;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  const toggleTheme = useCallback(
    (event: MouseEvent | null, to?: Theme) => {
      const next = to ?? (theme === "dark" ? "light" : "dark");
      const doc = document;
      // the new theme is revealed in a circle growing from the click, where the browser can do view transitions
      if (!doc.startViewTransition || reduce) {
        setTheme(next);
        return;
      }
      const cx = event?.clientX ?? innerWidth / 2;
      const cy = event?.clientY ?? innerHeight / 2;
      const radius = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
      doc
        .startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              finishTransition.current = resolve;
              setTheme(next);
            }),
        )
        .ready.then(() =>
          document.documentElement.animate(
            {
              clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`],
            },
            {
              duration: 620,
              easing: "cubic-bezier(.22,1,.36,1)",
              pseudoElement: "::view-transition-new(root)",
            },
          ),
        )
        .catch(() => {});
    },
    [theme, reduce],
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // the drawer only exists on small screens
  useEffect(() => {
    if (!mobile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSideOpen(false);
    }
  }, [mobile]);
  const columnOf = (taskId: string) => Object.keys(board).find((key) => board[key].includes(taskId)) ?? null;
  const moveTo = useCallback(
    (taskId: string, to: string) =>
      setBoard((prev) => {
        const next = {
          ...prev,
        };
        Object.keys(next).forEach((key) => {
          next[key] = next[key].filter((id) => id !== taskId);
        });
        next[to] = [taskId, ...next[to]];
        return next;
      }),
    [],
  );
  const myOpen = Object.keys(board)
    .filter((key) => key !== "done")
    .reduce((acc, key) => acc + board[key].filter((id) => tasks[id].who.includes(ME.name)).length, 0);
  const todayCount = [...eventsForMonth(2026, 10), ...extraEvents].filter((event) => sameDay(event.date, TODAY)).length;
  const closeTask = useCallback(() => setOpenTaskId(null), []);
  const commands = useMemo<Command[]>(
    () => [
      ...NAV.map((item) => ({
        id: `p-${item.id}`,
        group: "Pages" as const,
        label: item.label,
        sub: item.soon ? "In development" : undefined,
        icon: item.icon,
        run: () => go(item.id),
      })),
      {
        id: "a-task",
        group: "Actions",
        label: "Create a task",
        sub: "Board, Backlog",
        icon: "ph:plus",
        run: () => {
          go("board");
          setAdding("backlog");
        },
      },
      {
        id: "a-theme",
        group: "Actions",
        label: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
        icon: theme === "dark" ? "ph:sun" : "ph:moon",
        run: () => toggleTheme(null),
      },
      {
        id: "a-cal",
        group: "Actions",
        label: "Open today in Calendar",
        icon: "ph:calendar-blank",
        run: () => go("calendar"),
      },
      ...customers.map((customer) => ({
        id: `c-${customer.id}`,
        group: "Customers" as const,
        label: customer.name,
        sub: `${customer.plan}, ${customer.status}`,
        mono: {
          name: customer.name,
          hue: customer.hue,
        },
        run: () => {
          go("home");
          setQuery(customer.name);
          setTimeout(() => {
            return document.querySelector('[aria-label="Customers"]')?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 350);
        },
      })),
      ...Object.values(tasks).map((item) => {
        return {
          id: `t-${item.id}`,
          group: "Tasks" as const,
          label: item.title,
          sub: `${item.id}, ${COLUMNS.find((column) => column.id === columnOf(item.id))?.title ?? ""}`,
          face: item.who[0],
          run: () => {
            // go only reads its ref when the command runs, not while rendering
            // eslint-disable-next-line react-hooks/refs
            go("board");
            setTimeout(() => setOpenTaskId(item.id), 250);
          },
        };
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers, tasks, board, theme, go, toggleTheme],
  );
  const pageView =
    page === "home" ? (
      <HomePage
        range={range}
        setRange={setRange}
        customers={customers}
        setCustomers={setCustomers}
        query={query}
        setQuery={setQuery}
        toast={toast}
        onNewTask={() => {
          go("board");
          setAdding("backlog");
        }}
      />
    ) : page === "board" ? (
      <BoardPage
        board={board}
        setBoard={setBoard}
        tasks={tasks}
        setTasks={setTasks}
        openTask={setOpenTaskId}
        adding={adding}
        setAdding={setAdding}
        toast={toast}
      />
    ) : page === "finance" ? (
      <FinancePage toast={toast} />
    ) : page === "calendar" ? (
      <CalendarPage extra={extraEvents} setExtra={setExtraEvents} toast={toast} />
    ) : (
      <ComingSoon page={page} go={go} />
    );
  const shell = (
    <Sidebar
      page={page}
      go={go}
      theme={theme}
      toggleTheme={toggleTheme}
      openPalette={() => {
        setSideOpen(false);
        setPaletteOpen(true);
      }}
      myOpen={myOpen}
      todayCount={todayCount}
      toast={toast}
    />
  );
  return (
    <div
      className="md fixed inset-0 flex overflow-hidden"
      data-theme={theme}
      style={{
        background: COLORS.bg,
        color: COLORS.ink,
      }}
    >
      <style>{FONT_CSS + BASE_CSS}</style>
      {!mobile && (
        <aside className="w-[256px] shrink-0" aria-label="Sidebar">
          {shell}
        </aside>
      )}
      <AnimatePresence>
        {mobile && sideOpen && (
          <motion.div key="nav" className="fixed inset-0 z-[75]" initial="out" animate="in" exit="out">
            <motion.div
              className="absolute inset-0"
              style={{
                background: "rgba(5,5,8,.5)",
              }}
              variants={{
                in: {
                  opacity: 1,
                },
                out: {
                  opacity: 0,
                },
              }}
              onClick={() => setSideOpen(false)}
            />
            <motion.aside
              aria-label="Sidebar"
              variants={{
                in: {
                  x: 0,
                },
                out: {
                  x: "-100%",
                },
              }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 38,
              }}
              drag="x"
              dragConstraints={{
                left: 0,
                right: 0,
              }}
              dragElastic={{
                left: 0.5,
                right: 0,
              }}
              onDragEnd={(event, info) => {
                if (info.offset.x < -80 || info.velocity.x < -500) {
                  setSideOpen(false);
                }
              }}
              className="absolute inset-y-0 left-0 w-[284px] max-w-[86vw]"
              style={{
                background: COLORS.bg,
                boxShadow: "var(--pop-shadow)",
              }}
            >
              {shell}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      <main
        className="relative flex min-w-0 flex-1 flex-col overflow-hidden lg:my-2 lg:mr-2 lg:rounded-[20px]"
        style={{
          background: COLORS.panel,
          boxShadow: mobile ? "none" : "0 0 0 1px var(--line)",
        }}
      >
        <header
          className="relative z-30 flex h-14 shrink-0 items-center justify-between gap-3 px-3 sm:px-6 lg:px-8"
          style={{
            boxShadow: switching ? "0 1px 0 var(--line)" : "none",
            transition: "box-shadow .2s",
          }}
        >
          <div className="flex min-w-0 items-center gap-2">
            {mobile && <IconButton icon="ph:list" label="Open menu" onClick={() => setSideOpen(true)} />}
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13.5px]">
              <span
                className="hidden sm:inline"
                style={{
                  color: COLORS.soft,
                }}
              >
                Fieldnote
              </span>
              <Icon
                name="ph:caret-right"
                size={12}
                className="hidden sm:block"
                style={{
                  color: COLORS.faint,
                }}
              />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={page}
                  initial={{
                    opacity: 0,
                    y: 6,
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
                    duration: 0.18,
                  }}
                  className="truncate font-[560]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {PAGE_TITLES[page]}
                </motion.span>
              </AnimatePresence>
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <IconButton icon="ph:magnifying-glass" label="Search" onClick={() => setPaletteOpen(true)} />
            <Notifications notes={notes} setNotes={setNotes} />
            {mobile && (
              <span className="ml-1">
                <Avatar name={ME.name} size={30} />
              </span>
            )}
          </div>
        </header>
        <div
          ref={main}
          onScroll={(event) => setSwitching(event.currentTarget.scrollTop > 4)}
          className="md-scroll flex-1 overflow-y-auto overflow-x-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={page}
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
                transition: {
                  duration: 0.12,
                },
              }}
              transition={{
                duration: 0.32,
                ease: EASE,
              }}
              className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-3 sm:px-6 lg:px-8 lg:pt-4"
            >
              {pageView}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <TaskDrawer
        task={openTaskId ? tasks[openTaskId] : null}
        col={openTaskId ? columnOf(openTaskId) : null}
        onClose={closeTask}
        setTasks={setTasks}
        moveTo={moveTo}
      />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} cmds={commands} />
      <Toasts items={toasts} dismiss={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))} />
    </div>
  );
}
