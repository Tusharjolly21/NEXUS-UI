"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type PointerEvent,
  type SetStateAction,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { COLUMNS, ME, PRIORITIES, TEAM_COLORS } from "./data";
import { DAY_MS, TODAY, addDays, formatShortDate } from "./dates";
import { COLORS, FONT_MONO, SPRING, SPRING_SOFT, clamp, sum } from "./theme";
import { AvatarStack, Button, CountUp, Dot, Icon, IconButton, Kbd, PageHeader, RollingText, Segmented } from "./ui";
import type { Board, Task, ToastFn } from "./types";

const dueLabel = (date: Date) => {
  const days = Math.round((date.getTime() - TODAY.getTime()) / DAY_MS);
  return days === 0 ? "Today" : days === 1 ? "Tomorrow" : days < 0 ? `${-days}d overdue` : formatShortDate(date);
};

/** What a board card shows: tag, title, checklist progress, due date, priority and assignees. */
export function TaskCardBody({ task, col }: { task: Task; col: string }) {
  const done = task.list.filter((item) => item.done).length;
  const overdue = Math.round((task.due.getTime() - TODAY.getTime()) / DAY_MS) < 0 && col !== "done";
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11.5px] tabular-nums"
          style={{
            color: COLORS.soft,
            fontFamily: FONT_MONO,
          }}
        >
          {task.id}
        </span>
        <span
          className="flex items-center gap-1 text-[11.5px]"
          style={{
            color: PRIORITIES[task.prio].color,
          }}
          title={`${task.prio} priority`}
        >
          <Icon name={PRIORITIES[task.prio].icon} size={13} />
          <span className="sr-only">
            {task.prio}
            {" priority"}
          </span>
        </span>
      </div>
      <p
        className="mt-1.5 text-[13.5px] font-[540] leading-[1.35] tracking-[-0.005em]"
        style={{
          color: col === "done" ? COLORS.text : COLORS.ink,
        }}
      >
        {task.title}
      </p>
      <div
        className="mt-2.5 flex items-center gap-1.5 text-[11.5px]"
        style={{
          color: COLORS.text,
        }}
      >
        <Dot color={TEAM_COLORS[task.tag]} size={6} />
        {task.tag}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <AvatarStack names={task.who} size={22} ring="var(--card)" />
        <div
          className="flex items-center gap-2.5 text-[11.5px] tabular-nums"
          style={{
            color: COLORS.soft,
          }}
        >
          {task.list.length > 0 && (
            <span
              className="flex items-center gap-1"
              style={{
                color: done === task.list.length ? "var(--good-ink)" : undefined,
              }}
            >
              <Icon name="ph:check-square" size={13} />
              {done}/{task.list.length}
            </span>
          )}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="ph:chat-circle" size={13} />
              {task.comments.length}
            </span>
          )}
          <span
            className="flex items-center gap-1"
            style={{
              color: overdue ? "var(--bad-ink)" : undefined,
            }}
          >
            <Icon name="ph:clock" size={13} />
            {col === "done" ? "Done" : dueLabel(task.due)}
          </span>
        </div>
      </div>
    </>
  );
}

type BoardPageProps = {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
  tasks: Record<string, Task>;
  setTasks: Dispatch<SetStateAction<Record<string, Task>>>;
  openTask: (id: string) => void;
  /** The column showing its new-task form, if any. */
  adding: string | null;
  setAdding: (column: string | null) => void;
  toast: ToastFn;
};

/** A card being dragged: its id, size, and where the pointer took hold of it. */
type Drag = { id: string; w: number; h: number; ox: number; oy: number };

export function BoardPage({ board, setBoard, tasks, setTasks, openTask, adding, setAdding, toast }: BoardPageProps) {
  const reduce = useReducedMotion();
  const [dragging, setDragging] = useState<Drag | null>(null);
  const [dropped, setDropped] = useState(false);
  const [team, setTeam] = useState("All");
  // the latest board, for the drag handlers attached to window
  const boardRef = useRef(board);
  useLayoutEffect(() => {
    boardRef.current = board;
  });
  const columnEls = useRef<Record<string, HTMLElement | null>>({});
  const cardEls = useRef(new Map<string, HTMLElement>());
  const boardEl = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const velocity = useVelocity(dragX);
  const tilt = useSpring(
    useTransform(velocity, [-1800, 0, 1800], [-9, 0, 9], {
      clamp: true,
    }),
    {
      stiffness: 260,
      damping: 22,
    },
  );
  const lift = useMotionValue(1);
  const drag = useRef<Drag | null>(null);
  const moveCard = useCallback(
    (x: number, y: number, id: string) => {
      const columns = COLUMNS.flatMap((column) => {
        const r = columnEls.current[column.id]?.getBoundingClientRect();
        return r ? [{ c: column.id, r }] : [];
      });
      if (!columns.length) {
        return;
      }
      const target =
        columns.find((column) => x >= column.r.left - 6 && x <= column.r.right + 6) ??
        columns.reduce((acc, column) =>
          Math.abs(x - (acc.r.left + acc.r.right) / 2) < Math.abs(x - (column.r.left + column.r.right) / 2)
            ? acc
            : column,
        );
      const current = boardRef.current;
      const others = current[target.c].filter((other) => other !== id);
      let at = others.findIndex((other) => {
        const el = cardEls.current.get(other);
        if (!el) {
          return false;
        }
        const rect = el.getBoundingClientRect();
        return y < rect.top + rect.height / 2;
      });
      if (at < 0) {
        at = others.length;
      }
      const from = Object.keys(current).find((key) => current[key].includes(id));
      if (!from) {
        return;
      }
      if (from === target.c && current[from].indexOf(id) === at) {
        return;
      }
      const next = {
        ...current,
      };
      next[from] = current[from].filter((other) => other !== id);
      const list = from === target.c ? next[from] : [...current[target.c]];
      list.splice(at, 0, id);
      next[target.c] = list;
      boardRef.current = next;
      setBoard(() => next);
    },
    [setBoard],
  );
  const onCardDown = (event: PointerEvent<HTMLElement>, id: string) => {
    if (event.button !== 0 || dropped) {
      return;
    }
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const touch = event.pointerType !== "mouse";
    let started = false;
    let armed = !touch;
    let holdTimer = 0;
    const start = (x: number, y: number) => {
      started = true;
      const box = el.getBoundingClientRect();
      const state = {
        id,
        w: box.width,
        h: box.height,
        ox: startX - rect.left,
        oy: startY - rect.top,
      };
      drag.current = state;
      setDragging(state);
      dragX.jump(x - state.ox);
      dragY.jump(y - state.oy);
      lift.set(1);
      animate(lift, 1.045, SPRING);
      if (touch && navigator.vibrate) {
        try {
          navigator.vibrate(8);
        } catch {}
      }
    };
    if (touch) {
      holdTimer = window.setTimeout(() => {
        armed = true;
        start(startX, startY);
      }, 260);
    }
    const onMove = (event: globalThis.PointerEvent) => {
      if (!started) {
        const moved = Math.hypot(event.clientX - startX, event.clientY - startY);
        if (touch) {
          if (moved > 8) {
            cleanup();
          }
          return;
        }
        if (armed && moved > 5) {
          start(event.clientX, event.clientY);
        } else {
          return;
        }
      }
      const state = drag.current;
      if (!state) {
        return;
      }
      dragX.set(event.clientX - state.ox);
      dragY.set(event.clientY - state.oy);
      const scroller = boardEl.current;
      if (scroller) {
        const edge = scroller.getBoundingClientRect();
        if (event.clientX > edge.right - 40) {
          scroller.scrollLeft += 12;
        } else {
          if (event.clientX < edge.left + 40) {
            scroller.scrollLeft -= 12;
          }
        }
      }
      moveCard(event.clientX, event.clientY - state.oy + state.h / 2, state.id);
    };
    const onTouchMove = (event: TouchEvent) => {
      if (started) {
        event.preventDefault();
      }
    };
    const onUp = () => {
      cleanup();
      if (!started) {
        if (!touch || !armed) {
          openTask(id);
        }
        return;
      }
      const state = drag.current;
      if (!state) {
        return;
      }
      setDropped(true);
      requestAnimationFrame(() => {
        const slot = cardEls.current.get(state.id)?.getBoundingClientRect();
        const finish = () => {
          drag.current = null;
          setDragging(null);
          setDropped(false);
        };
        if (!slot || reduce) {
          finish();
          return;
        }
        animate(lift, 1, {
          type: "spring",
          stiffness: 400,
          damping: 28,
        });
        animate(dragX, slot.left, {
          type: "spring",
          stiffness: 420,
          damping: 32,
        });
        animate(dragY, slot.top, {
          type: "spring",
          stiffness: 420,
          damping: 32,
          onComplete: finish,
        });
      });
    };
    function cleanup() {
      clearTimeout(holdTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("touchmove", onTouchMove);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("touchmove", onTouchMove, {
      passive: false,
    });
  };
  const onCardKey = (event: KeyboardEvent<HTMLElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openTask(id);
      return;
    }
    if (!(!event.altKey || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key))) {
      event.preventDefault();
      setBoard((prev) => {
        const from = Object.keys(prev).find((key) => prev[key].includes(id));
        if (!from) {
          return prev;
        }
        const col = COLUMNS.findIndex((column) => column.id === from);
        const index = prev[from].indexOf(id);
        const next = {
          ...prev,
        };
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          const to = clamp(index + (event.key === "ArrowUp" ? -1 : 1), 0, prev[from].length - 1);
          const list = [...prev[from]];
          list.splice(index, 1);
          list.splice(to, 0, id);
          next[from] = list;
          return next;
        }
        const toCol = COLUMNS[clamp(col + (event.key === "ArrowLeft" ? -1 : 1), 0, 3)].id;
        return toCol === from
          ? prev
          : ((next[from] = prev[from].filter((other) => other !== id)), (next[toCol] = [...prev[toCol], id]), next);
      });
      requestAnimationFrame(() => {
        return cardEls.current.get(id)?.focus();
      });
    }
  };
  const addTask = (columnId: string, title: string) => {
    const count = Object.keys(tasks).length;
    const id = `FN-${452 + count}`;
    const created = {
      id,
      title,
      tag: "Engineering",
      prio: "Medium",
      who: [ME.name],
      due: addDays(TODAY, 7),
      desc: "",
      list: [],
      comments: [],
      hours: [0, 0, 0, 0, 0, 0, 0],
    };
    setTasks((prev) => ({
      ...prev,
      [id]: created,
    }));
    setBoard((prev) => ({
      ...prev,
      [columnId]: [...prev[columnId], id],
    }));
    toast(`Created ${id} in ${COLUMNS.find((column) => column.id === columnId)?.title ?? "Backlog"}`);
  };
  const draggedTask = dragging ? tasks[dragging.id] : null;
  const dragColumn = dragging
    ? (Object.keys(board).find((b) => board[b].includes(dragging.id)) ?? "backlog")
    : "backlog";
  const total = sum(COLUMNS.map((column) => board[column.id].length));
  const teams = ["All", "Engineering", "Design", "Growth", "Ops"];
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title="Product board"
        sub={
          <>
            <CountUp value={total} />
            {" tasks this cycle. Drag cards between columns, or press Alt and an arrow key."}
          </>
        }
        right={
          <>
            <Segmented options={teams} value={team} onChange={setTeam} id="board-tag" label="Filter by team" />
            <Button kind="primary" icon="ph:plus" onClick={() => setAdding("backlog")}>
              New task
            </Button>
          </>
        }
      />

      <div
        ref={boardEl}
        className="md-noscroll -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0"
      >
        {COLUMNS.map((column) => {
          const ids = board[column.id];
          return (
            <div
              key={column.id}
              ref={(el) => {
                columnEls.current[column.id] = el;
              }}
              className="flex w-[282px] shrink-0 snap-start flex-col rounded-[18px] p-2 lg:w-auto"
              style={{
                background: "color-mix(in srgb, var(--card) 45%, transparent)",
                boxShadow: "inset 0 0 0 1px var(--line)",
              }}
            >
              <div className="flex h-10 items-center justify-between px-2">
                <div
                  className="flex items-center gap-2 text-[13px] font-[580]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  <Icon
                    name={column.icon}
                    size={16}
                    style={{
                      color:
                        column.id === "done" ? "var(--good)" : column.id === "progress" ? COLORS.accent : COLORS.soft,
                    }}
                  />

                  {column.title}
                  <span
                    className="grid h-5 min-w-[22px] place-items-center rounded-full px-1.5 text-[11.5px] font-[560]"
                    style={{
                      background: COLORS.well,
                      color: COLORS.text,
                    }}
                  >
                    <RollingText text={`${ids.length}`} />
                  </span>
                </div>
                <IconButton
                  icon="ph:plus"
                  label={`Add task to ${column.title}`}
                  size={28}
                  onClick={() => setAdding(column.id)}
                />
              </div>
              <div className="flex min-h-[120px] flex-1 flex-col gap-2 pt-1">
                {ids.map((taskId) => {
                  const card = tasks[taskId];
                  const isDragging = (dragging == null ? undefined : dragging.id) === taskId;
                  return team !== "All" && card.tag !== team && !isDragging ? null : (
                    <motion.div
                      key={taskId}
                      layout={reduce ? false : "position"}
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 42,
                      }}
                      ref={(el) => {
                        if (el) {
                          cardEls.current.set(taskId, el);
                        } else {
                          cardEls.current.delete(taskId);
                        }
                      }}
                      initial={{
                        opacity: 0,
                        scale: 0.94,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${card.id}: ${card.title}. ${column.title}. Press Enter to open.`}
                      data-task={taskId}
                      onPointerDown={(event) => onCardDown(event, taskId)}
                      onKeyDown={(event) => onCardKey(event, taskId)}
                      className="relative cursor-grab select-none rounded-[14px] active:cursor-grabbing"
                      style={{
                        touchAction: "pan-x pan-y",
                      }}
                    >
                      {isDragging && dragging ? (
                        <div
                          className="rounded-[14px]"
                          style={{
                            height: dragging.h,
                            background: "var(--accent-soft)",
                            boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--accent) 45%, transparent)",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-[14px] p-3.5 transition-[box-shadow,transform] duration-200 hover:-translate-y-px"
                          style={{
                            background: COLORS.card,
                            boxShadow: "var(--card-shadow)",
                          }}
                        >
                          <TaskCardBody task={card} col={column.id} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                <AnimatePresence initial={false}>
                  {adding === column.id && (
                    <NewTaskForm
                      key="add"
                      onCancel={() => setAdding(null)}
                      onAdd={(title) => addTask(column.id, title)}
                    />
                  )}
                </AnimatePresence>
                {adding !== column.id && (
                  <button
                    type="button"
                    onClick={() => setAdding(column.id)}
                    className="md-hov flex h-9 items-center gap-2 rounded-[11px] px-2.5 text-[12.5px]"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    <Icon name="ph:plus" size={14} />
                    Add task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {dragging && draggedTask && (
        <motion.div
          aria-hidden={true}
          className="pointer-events-none fixed left-0 top-0 z-[60] rounded-[14px] p-3.5"
          style={{
            x: dragX,
            y: dragY,
            width: dragging.w,
            rotate: tilt,
            scale: lift,
            background: COLORS.card,
            boxShadow: "0 0 0 1px var(--line2), 0 30px 60px -18px rgba(0,0,0,.55), 0 12px 24px -12px rgba(0,0,0,.35)",
          }}
        >
          <TaskCardBody task={draggedTask} col={dragColumn} />
        </motion.div>
      )}
    </div>
  );
}

function NewTaskForm({ onAdd, onCancel }: { onAdd: (title: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    field.current?.focus();
  }, []);
  const submit = () => {
    const value = title.trim();
    if (value) {
      onAdd(value);
      setTitle("");
    }
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
      }}
      exit={{
        opacity: 0,
        height: 0,
      }}
      transition={SPRING_SOFT}
      className="overflow-hidden"
    >
      <div
        className="rounded-[14px] p-3"
        style={{
          background: COLORS.card,
          boxShadow: "0 0 0 1.5px var(--accent), 0 8px 20px -10px rgba(0,0,0,.3)",
        }}
      >
        <textarea
          ref={field}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          rows={2}
          placeholder="What needs doing?"
          aria-label="New task title"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
            if (event.key === "Escape") {
              event.stopPropagation();
              onCancel();
            }
          }}
          className="w-full resize-none bg-transparent text-[13.5px] leading-[1.4] outline-none"
          style={{
            color: COLORS.ink,
          }}
        />

        <div className="mt-2 flex items-center justify-between">
          <span
            className="flex items-center gap-1 text-[11.5px]"
            style={{
              color: COLORS.soft,
            }}
          >
            <Kbd>Enter</Kbd>
            {" to add"}
          </span>
          <div className="flex gap-1.5">
            <Button kind="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button kind="primary" size="sm" onClick={submit} disabled={!title.trim()}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
