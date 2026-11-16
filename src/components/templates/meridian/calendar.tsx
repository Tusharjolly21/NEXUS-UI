"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EVENT_COLORS, EVENT_KINDS, ME, eventsForMonth } from "./data";
import { MONTHS, TODAY, WEEKDAYS_SHORT, formatDayDate, formatShortDate, monthGrid, sameDay } from "./dates";
import type { CalEvent, ToastFn } from "./types";
import { useIsMobile } from "./hooks";
import { COLORS, EASE, SPRING_SOFT } from "./theme";
import { AvatarStack, Button, Card, Dot, Icon, IconButton, PageHeader } from "./ui";

function EventChip({ event, compact }: { event: CalEvent; compact?: boolean }) {
  return (
    <motion.div
      layout={true}
      initial={{
        opacity: 0,
        scale: 0.7,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
      }}
      className="flex min-w-0 items-center gap-1.5 rounded-[7px] py-[3px] pl-1.5 pr-1 text-[11.5px] leading-tight"
      style={{
        background: `color-mix(in srgb, ${EVENT_COLORS[event.kind]} 16%, transparent)`,
        color: COLORS.ink,
      }}
    >
      <span
        className="h-3 w-[3px] shrink-0 rounded-full"
        style={{
          background: EVENT_COLORS[event.kind],
        }}
      />

      {!compact && event.time !== "All day" && (
        <span
          className="shrink-0 tabular-nums"
          style={{
            color: COLORS.text,
          }}
        >
          {event.time}
        </span>
      )}
      <span className="truncate font-[520]">{event.title}</span>
    </motion.div>
  );
}

type CalendarPageProps = {
  /** Events added in this visit, on top of the sample calendar. */
  extra: CalEvent[];
  setExtra: Dispatch<SetStateAction<CalEvent[]>>;
  toast: ToastFn;
};

/** The month shown (y, m) and the direction it was reached from, which decides which way it slides. */
type View = [{ y: number; m: number }, number];

export function CalendarPage({ extra, setExtra, toast }: CalendarPageProps) {
  const [[view, dir], setView] = useState<View>([
    {
      y: 2026,
      m: 10,
    },
    0,
  ]);
  const [day, setDay] = useState<Date | null>(null);
  const [hidden, setHidden] = useState(new Set<string>());
  const narrow = useIsMobile(1024);
  const phone = useIsMobile(640);
  const shift = (months: number) =>
    setView(([prev]) => {
      const next = new Date(prev.y, prev.m + months, 1);
      return [
        {
          y: next.getFullYear(),
          m: next.getMonth(),
        },
        months,
      ];
    });
  const goToday = () => {
    const monthsAway = TODAY.getFullYear() * 12 + TODAY.getMonth() - (view.y * 12 + view.m);
    setView([
      {
        y: TODAY.getFullYear(),
        m: TODAY.getMonth(),
      },
      Math.sign(monthsAway),
    ]);
    setDay(TODAY);
  };
  const events = useMemo(() => {
    // this month and its neighbours, so days from the next and previous months in the grid have events too
    const all: CalEvent[] = [];
    for (let offset = -1; offset <= 1; offset++) {
      const month = new Date(view.y, view.m + offset, 1);
      all.push(...eventsForMonth(month.getFullYear(), month.getMonth()));
    }
    return [...all, ...extra]
      .filter((event) => !hidden.has(event.kind))
      .sort((a, b) => (a.time === "All day" ? -1 : b.time === "All day" ? 1 : a.time.localeCompare(b.time)));
  }, [view, extra, hidden]);
  const eventsOn = (date: Date) => events.filter((event) => sameDay(event.date, date));
  const grid = monthGrid(view.y, view.m);
  const perCell = phone ? 0 : 3;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.target as HTMLElement).closest("input,textarea")) {
        if (event.key === "ArrowLeft" && !event.metaKey) {
          shift(-1);
        }
        if (event.key === "ArrowRight" && !event.metaKey) {
          shift(1);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const addEvent = (draft: Omit<CalEvent, "id">) => {
    setExtra((prev) => [
      ...prev,
      {
        ...draft,
        id: `u${Date.now()}`,
      },
    ]);
    toast(`Added "${draft.title}" on ${formatShortDate(draft.date)}`);
  };
  const upcoming = (
    <DayPanel
      key="panel"
      day={day}
      events={day ? eventsOn(day) : []}
      upcoming={events
        .filter((event) => event.date >= TODAY)
        .sort((y, S) => y.date.getTime() - S.date.getTime())
        .slice(0, 6)}
      onClose={() => setDay(null)}
      onAdd={addEvent}
    />
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title="Calendar"
        sub="Team schedule, launches and time away."
        right={
          <>
            <div className="hidden items-center gap-1 sm:flex" role="group" aria-label="Show event types">
              {EVENT_KINDS.map((eventKind) => (
                <button
                  key={eventKind}
                  type="button"
                  aria-pressed={!hidden.has(eventKind)}
                  onClick={() =>
                    setHidden((prev) => {
                      const next = new Set(prev);
                      if (next.has(eventKind)) {
                        next.delete(eventKind);
                      } else {
                        next.add(eventKind);
                      }
                      return next;
                    })
                  }
                  className="md-hov flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[12.5px] transition-opacity"
                  style={{
                    color: COLORS.text,
                    opacity: hidden.has(eventKind) ? 0.45 : 1,
                  }}
                >
                  <Dot color={EVENT_COLORS[eventKind]} />
                  {eventKind}
                </button>
              ))}
            </div>
            <Button kind="primary" icon="ph:plus" onClick={() => setDay((prev) => prev ?? TODAY)}>
              New event
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-4">
        <Card className="overflow-hidden p-0" label="Month view">
          <div className="flex items-center justify-between gap-2 px-4 py-3.5 sm:px-5">
            <div className="relative h-8 min-w-0 flex-1 overflow-hidden">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.h2
                  key={`${view.y}-${view.m}`}
                  custom={dir}
                  variants={{
                    a: (y) => ({
                      y: y >= 0 ? 18 : -18,
                      opacity: 0,
                    }),
                    b: {
                      y: 0,
                      opacity: 1,
                    },
                    c: (y) => ({
                      y: y >= 0 ? -18 : 18,
                      opacity: 0,
                    }),
                  }}
                  initial="a"
                  animate="b"
                  exit="c"
                  transition={SPRING_SOFT}
                  className="text-[20px] font-[600] leading-8 tracking-[-0.02em]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {MONTHS[view.m]}{" "}
                  <span
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    {view.y}
                  </span>
                </motion.h2>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={goToday}>
                Today
              </Button>
              <IconButton icon="ph:caret-left" label="Previous month" onClick={() => shift(-1)} />
              <IconButton icon="ph:caret-right" label="Next month" onClick={() => shift(1)} />
            </div>
          </div>
          <div
            className="grid grid-cols-7 border-y"
            style={{
              borderColor: COLORS.line,
              background: COLORS.well,
            }}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((y) => (
              <div
                key={y}
                className="py-2 text-center text-[11.5px] font-[520] sm:px-3 sm:text-left"
                style={{
                  color: COLORS.soft,
                }}
              >
                {phone ? y[0] : y}
              </div>
            ))}
          </div>
          <div className="relative overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={`${view.y}-${view.m}`}
                custom={dir}
                variants={{
                  a: (y) => ({
                    x: y >= 0 ? "28%" : "-28%",
                    opacity: 0,
                  }),
                  b: {
                    x: 0,
                    opacity: 1,
                  },
                  c: (y) => ({
                    x: y >= 0 ? "-28%" : "28%",
                    opacity: 0,
                  }),
                }}
                initial="a"
                animate="b"
                exit="c"
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 32,
                }}
                className="grid grid-cols-7"
              >
                {grid.map((y, i) => {
                  const inMonth = y.getMonth() === view.m;
                  const isToday = sameDay(y, TODAY);
                  const dayEvents = eventsOn(y);
                  const selected = day && sameDay(day, y);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDay(y)}
                      aria-label={`${formatDayDate(y)}, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`}
                      aria-pressed={!!selected}
                      className={`group/d relative flex flex-col items-stretch gap-1 border-b border-r p-1 text-left transition-colors sm:p-1.5 ${phone ? "h-[64px]" : "h-[106px]"}`}
                      style={{
                        borderColor: COLORS.line,
                        background: selected ? "var(--accent-soft)" : undefined,
                        borderRightWidth: i % 7 === 6 ? 0 : 1,
                      }}
                    >
                      <span
                        className="absolute inset-0 opacity-0 transition-opacity group-hover/d:opacity-100"
                        style={{
                          background: "color-mix(in srgb, var(--ink) 3%, transparent)",
                        }}
                      />

                      <span className="relative flex items-center justify-between px-1">
                        <span
                          className="grid size-[26px] place-items-center rounded-full text-[12.5px] font-[540] tabular-nums"
                          style={{
                            background: isToday ? COLORS.btn : "transparent",
                            color: isToday ? "#fff" : inMonth ? COLORS.ink : COLORS.faint,
                          }}
                        >
                          {y.getDate()}
                        </span>
                        {!phone && (
                          <Icon
                            name="ph:plus"
                            size={13}
                            className="opacity-0 transition-opacity group-hover/d:opacity-60"
                            style={{
                              color: COLORS.soft,
                            }}
                          />
                        )}
                      </span>
                      {perCell > 0 ? (
                        <span
                          className="relative flex min-w-0 flex-col gap-[3px]"
                          style={{
                            opacity: inMonth ? 1 : 0.45,
                          }}
                        >
                          {dayEvents.slice(0, perCell).map((event) => (
                            <EventChip key={event.id} event={event} compact={true} />
                          ))}
                          {dayEvents.length > perCell && (
                            <span
                              className="px-1.5 text-[11px]"
                              style={{
                                color: COLORS.soft,
                              }}
                            >
                              {dayEvents.length - perCell}
                              {" more"}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span
                          className="relative flex flex-wrap justify-center gap-[3px] px-1"
                          style={{
                            opacity: inMonth ? 1 : 0.45,
                          }}
                        >
                          {dayEvents.slice(0, 4).map((event) => (
                            <motion.span
                              key={event.id}
                              initial={{
                                scale: 0,
                              }}
                              animate={{
                                scale: 1,
                              }}
                              className="size-[6px] rounded-full"
                              style={{
                                background: EVENT_COLORS[event.kind],
                              }}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>
        {!narrow && (
          <Card className="overflow-hidden p-0" label="Day panel">
            {upcoming}
          </Card>
        )}
      </div>
      {narrow && (
        <AnimatePresence>
          {day && (
            <motion.div key="sheet" className="fixed inset-0 z-[70]" initial="out" animate="in" exit="out">
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "rgba(5,5,8,.45)",
                }}
                variants={{
                  in: {
                    opacity: 1,
                  },
                  out: {
                    opacity: 0,
                  },
                }}
                onClick={() => setDay(null)}
              />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Day"
                variants={{
                  in: {
                    y: 0,
                  },
                  out: {
                    y: "100%",
                  },
                }}
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 36,
                }}
                drag="y"
                dragConstraints={{
                  top: 0,
                  bottom: 0,
                }}
                dragElastic={{
                  top: 0,
                  bottom: 0.6,
                }}
                onDragEnd={(y, info) => {
                  if (info.offset.y > 110 || info.velocity.y > 600) {
                    setDay(null);
                  }
                }}
                className="absolute inset-x-0 bottom-0 max-h-[86dvh] overflow-hidden rounded-t-[22px]"
                style={{
                  background: COLORS.panel,
                  boxShadow: "var(--pop-shadow)",
                }}
              >
                <div className="flex justify-center pt-2">
                  <span
                    className="h-1 w-10 rounded-full"
                    style={{
                      background: COLORS.faint,
                    }}
                  />
                </div>
                {upcoming}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {narrow && (
        <Card className="overflow-hidden p-0" label="Upcoming">
          <DayPanel
            day={null}
            events={[]}
            upcoming={events
              .filter((event) => event.date >= TODAY)
              .sort((y, S) => y.date.getTime() - S.date.getTime())
              .slice(0, 5)}
            onClose={() => {}}
            onAdd={addEvent}
          />
        </Card>
      )}
    </div>
  );
}

function EventRow({ event, showDate }: { event: CalEvent; showDate?: boolean }) {
  return (
    <motion.li
      layout={true}
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={SPRING_SOFT}
      className="flex gap-3 rounded-[12px] px-2 py-2.5"
    >
      <span
        className="mt-0.5 w-[3px] shrink-0 self-stretch rounded-full"
        style={{
          background: EVENT_COLORS[event.kind],
        }}
      />

      <div className="min-w-0 flex-1">
        <div
          className="truncate text-[13.5px] font-[560]"
          style={{
            color: COLORS.ink,
          }}
        >
          {event.title}
        </div>
        <div
          className="mt-0.5 truncate text-[12px] tabular-nums"
          style={{
            color: COLORS.soft,
          }}
        >
          {`${showDate ? `${formatShortDate(event.date)}, ` : ""}${event.time}${event.place ? `, ${event.place}` : ""}`}
        </div>
      </div>
      {event.who.length > 0 && <AvatarStack names={event.who.slice(0, 3)} size={22} ring="var(--card)" />}
    </motion.li>
  );
}

type DayPanelProps = {
  /** The selected day, or null to list what is coming up. */
  day: Date | null;
  events: CalEvent[];
  upcoming: CalEvent[];
  onClose: () => void;
  onAdd: (draft: Omit<CalEvent, "id">) => void;
};

function DayPanel({ day, events, upcoming, onClose, onAdd }: DayPanelProps) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("14:00");
  const [kind, setKind] = useState("Meeting");
  const [adding, setAdding] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  // choosing another day closes the half-written event
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAdding(false);
    setTitle("");
  }, [day]);
  useEffect(() => {
    if (adding) {
      field.current?.focus();
    }
  }, [adding]);
  const add = () => {
    const k = title.trim();
    if (!(!k || !day)) {
      onAdd({
        title: k,
        time,
        kind,
        date: day,
        who: [ME.name],
      });
      setTitle("");
      setAdding(false);
    }
  };
  return (
    <div className="flex h-full flex-col">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={day ? day.toDateString() : "up"}
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -8,
          }}
          transition={{
            duration: 0.2,
            ease: EASE,
          }}
          className="flex flex-1 flex-col p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div
                className="text-[12.5px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                {day ? (sameDay(day, TODAY) ? "Today" : WEEKDAYS_SHORT[day.getDay()]) : "Coming up"}
              </div>
              <h3
                className="text-[18px] font-[600] tracking-[-0.02em]"
                style={{
                  color: COLORS.ink,
                }}
              >
                {day ? `${MONTHS[day.getMonth()]} ${day.getDate()}` : "Next on the calendar"}
              </h3>
            </div>
            {day && <IconButton icon="ph:x" label="Close day" size={30} onClick={onClose} />}
          </div>
          <ul className="mt-3 flex flex-col">
            <AnimatePresence initial={false}>
              {(day ? events : upcoming).map((event) => (
                <EventRow key={event.id} event={event} showDate={!day} />
              ))}
            </AnimatePresence>
            {day && events.length === 0 && (
              <li
                className="rounded-[12px] px-3 py-6 text-center text-[13px]"
                style={{
                  color: COLORS.soft,
                  background: COLORS.well,
                }}
              >
                Nothing scheduled. A rare quiet day.
              </li>
            )}
          </ul>
          {day && (
            <div className="mt-3">
              <AnimatePresence initial={false} mode="popLayout">
                {adding ? (
                  <motion.form
                    key="f"
                    initial={{
                      opacity: 0,
                      y: 8,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 8,
                    }}
                    transition={SPRING_SOFT}
                    onSubmit={(event) => {
                      event.preventDefault();
                      add();
                    }}
                    className="rounded-[14px] p-3"
                    style={{
                      background: COLORS.card,
                      boxShadow: "0 0 0 1.5px var(--accent)",
                    }}
                  >
                    <input
                      ref={field}
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Event title"
                      aria-label="Event title"
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.stopPropagation();
                          setAdding(false);
                        }
                      }}
                      className="w-full bg-transparent text-[14px] font-[540] outline-none"
                      style={{
                        color: COLORS.ink,
                      }}
                    />

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                        aria-label="Start time"
                        className="h-8 rounded-[8px] px-2 text-[12.5px] tabular-nums outline-none"
                        style={{
                          background: COLORS.well,
                          color: COLORS.ink,
                          colorScheme: "inherit",
                        }}
                      />

                      <div className="flex flex-wrap gap-1">
                        {EVENT_KINDS.map((eventKind) => (
                          <button
                            key={eventKind}
                            type="button"
                            aria-pressed={kind === eventKind}
                            onClick={() => setKind(eventKind)}
                            className="flex h-8 items-center gap-1.5 rounded-[8px] px-2 text-[12px] transition-colors"
                            style={{
                              background:
                                kind === eventKind
                                  ? `color-mix(in srgb, ${EVENT_COLORS[eventKind]} 18%, transparent)`
                                  : COLORS.well,
                              color: kind === eventKind ? COLORS.ink : COLORS.soft,
                            }}
                          >
                            <Dot color={EVENT_COLORS[eventKind]} size={6} />
                            {eventKind}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-1.5">
                      <Button kind="ghost" size="sm" onClick={() => setAdding(false)}>
                        Cancel
                      </Button>
                      <Button kind="primary" size="sm" type="submit" disabled={!title.trim()}>
                        Add event
                      </Button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="b"
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
                    <Button icon="ph:plus" className="w-full" onClick={() => setAdding(true)}>
                      Add event
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {!day && (
            <p
              className="mt-auto pt-4 text-[12px]"
              style={{
                color: COLORS.soft,
              }}
            >
              Pick a day to see its schedule or add an event.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
