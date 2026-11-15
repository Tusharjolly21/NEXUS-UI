"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart } from "./charts";
import { COLUMNS, ME, PRIORITIES, TEAM_COLORS } from "./data";
import { formatDayDate } from "./dates";
import { useDismiss, useIsMobile } from "./hooks";
import { COLORS, EASE, FONT_MONO, SPRING_SOFT, sum } from "./theme";
import { Avatar, Checkbox, CountUp, Dot, Dropdown, Icon, IconButton, MenuItem, Metric } from "./ui";
import type { Task } from "./types";

type TaskDetailProps = {
  task: Task;
  /** The column the task is in. */
  col: string;
  onClose: () => void;
  setTasks: Dispatch<SetStateAction<Record<string, Task>>>;
  moveTo: (taskId: string, column: string) => void;
};

/** The task panel: a sheet from the right on wide screens, from the bottom on phones. */
export function TaskDrawer({
  task,
  col,
  onClose,
  setTasks,
  moveTo,
}: Omit<TaskDetailProps, "task" | "col"> & { task: Task | null; col: string | null }) {
  const narrow = useIsMobile(640);
  useEffect(() => {
    if (!task) {
      return;
    }
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [task, onClose]);
  return (
    <AnimatePresence>
      {task && col && (
        <motion.div key="drawer" className="fixed inset-0 z-[70]" initial="out" animate="in" exit="out">
          <motion.div
            className="absolute inset-0"
            style={{
              background: "rgba(5,5,8,.45)",
              backdropFilter: "blur(2px)",
            }}
            variants={{
              in: {
                opacity: 1,
              },
              out: {
                opacity: 0,
              },
            }}
            transition={{
              duration: 0.25,
            }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={task.title}
            variants={
              narrow
                ? {
                    in: {
                      y: 0,
                    },
                    out: {
                      y: "100%",
                    },
                  }
                : {
                    in: {
                      x: 0,
                    },
                    out: {
                      x: "105%",
                    },
                  }
            }
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 36,
            }}
            drag={narrow ? "y" : false}
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            dragElastic={{
              top: 0,
              bottom: 0.6,
            }}
            onDragEnd={(a, l) => {
              if (l.offset.y > 120 || l.velocity.y > 600) {
                onClose();
              }
            }}
            className={`absolute flex flex-col overflow-hidden ${narrow ? "inset-x-0 bottom-0 h-[92dvh] rounded-t-[22px]" : "bottom-2 right-2 top-2 w-[460px] rounded-[20px]"}`}
            style={{
              background: COLORS.panel,
              boxShadow: "var(--pop-shadow)",
            }}
          >
            {narrow && (
              <div className="flex justify-center pt-2">
                <span
                  className="h-1 w-10 rounded-full"
                  style={{
                    background: COLORS.faint,
                  }}
                />
              </div>
            )}
            <TaskDetail task={task} col={col} onClose={onClose} setTasks={setTasks} moveTo={moveTo} />
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TaskDetail({ task, col, onClose, setTasks, moveTo }: TaskDetailProps) {
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [assigning, setAssigning] = useState(false);
  const assignButton = useRef<HTMLDivElement>(null);
  const commentField = useRef<HTMLDivElement>(null);
  useDismiss(assignButton, assigning, () => setAssigning(false));
  const update = (change: (task: Task) => Task) =>
    setTasks((prev) => ({
      ...prev,
      [task.id]: change(prev[task.id]),
    }));
  const done = task.list.filter((item) => item.done).length;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = task.hours.map((hour, i) => ({
    l: days[i][0],
    long: `${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i]}`,
    v: hour,
    p: 0,
  }));
  const totalHours = sum(task.hours);
  const postComment = () => {
    const text = comment.trim();
    if (text) {
      update((current) => ({
        ...current,
        comments: [
          ...current.comments,
          {
            id: `${current.id}-c${Date.now()}`,
            who: ME.name,
            text,
            when: "Just now",
          },
        ],
      }));
      setComment("");
      requestAnimationFrame(() => {
        return commentField.current?.scrollTo({
          top: commentField.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  };
  const column = COLUMNS.find((item) => item.id === col) ?? COLUMNS[0];
  return (
    <>
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <span
            className="text-[12px]"
            style={{
              color: COLORS.soft,
              fontFamily: FONT_MONO,
            }}
          >
            {task.id}
          </span>
          <div ref={assignButton} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={assigning}
              onClick={() => setAssigning((prev) => !prev)}
              className="md-hov inline-flex h-7 items-center gap-1.5 rounded-[9px] px-2 text-[12.5px] font-[540]"
              style={{
                color: COLORS.ink,
                boxShadow: "inset 0 0 0 1px var(--line2)",
              }}
            >
              <Icon
                name={column.icon}
                size={14}
                style={{
                  color: col === "done" ? "var(--good)" : col === "progress" ? COLORS.accent : COLORS.soft,
                }}
              />

              {column.title}
              <Icon
                name="ph:caret-down"
                size={11}
                style={{
                  color: COLORS.soft,
                }}
              />
            </button>
            <Dropdown open={assigning} className="w-[180px]">
              <div role="menu">
                {COLUMNS.map((column) => (
                  <MenuItem
                    key={column.id}
                    icon={column.icon}
                    active={column.id === col}
                    onClick={() => {
                      moveTo(task.id, column.id);
                      setAssigning(false);
                    }}
                    right={
                      column.id === col ? (
                        <Icon
                          name="ph:check"
                          size={13}
                          style={{
                            color: COLORS.accentInk,
                          }}
                        />
                      ) : null
                    }
                  >
                    {column.title}
                  </MenuItem>
                ))}
              </div>
            </Dropdown>
          </div>
        </div>
        <IconButton icon="ph:x" label="Close task" onClick={onClose} />
      </div>
      <div ref={commentField} className="md-scroll flex-1 overflow-y-auto px-5 pb-4">
        <h2
          className="text-[20px] font-[600] leading-[1.25] tracking-[-0.02em]"
          style={{
            color: COLORS.ink,
          }}
        >
          {task.title}
        </h2>
        <dl className="mt-4 grid grid-cols-[96px_1fr] gap-y-2.5 text-[13px]">
          <dt
            style={{
              color: COLORS.soft,
            }}
          >
            Assignees
          </dt>
          <dd className="flex flex-wrap gap-x-3 gap-y-1.5">
            {task.who.map((name) => (
              <span
                key={name}
                className="flex items-center gap-1.5"
                style={{
                  color: COLORS.ink,
                }}
              >
                <Avatar name={name} size={20} />
                {name.split(" ")[0]}
              </span>
            ))}
          </dd>
          <dt
            style={{
              color: COLORS.soft,
            }}
          >
            Priority
          </dt>
          <dd
            className="flex items-center gap-1.5"
            style={{
              color: COLORS.ink,
            }}
          >
            <Icon
              name={PRIORITIES[task.prio].icon}
              size={14}
              style={{
                color: PRIORITIES[task.prio].color,
              }}
            />

            {task.prio}
          </dd>
          <dt
            style={{
              color: COLORS.soft,
            }}
          >
            Due
          </dt>
          <dd
            style={{
              color: COLORS.ink,
            }}
          >
            {formatDayDate(task.due)}
          </dd>
          <dt
            style={{
              color: COLORS.soft,
            }}
          >
            Team
          </dt>
          <dd
            className="flex items-center gap-1.5"
            style={{
              color: COLORS.ink,
            }}
          >
            <Dot color={TEAM_COLORS[task.tag]} />
            {task.tag}
          </dd>
        </dl>
        {task.desc && (
          <p
            className="mt-4 text-[13.5px] leading-[1.6]"
            style={{
              color: COLORS.text,
            }}
          >
            {task.desc}
          </p>
        )}
        <section className="mt-6" aria-label="Checklist">
          <div className="flex items-center justify-between">
            <h3
              className="text-[13.5px] font-[600]"
              style={{
                color: COLORS.ink,
              }}
            >
              Checklist
            </h3>
            <span
              className="text-[12px] tabular-nums"
              style={{
                color: COLORS.soft,
              }}
            >
              <CountUp value={done} />/{task.list.length}
            </span>
          </div>
          <div
            className="mt-2.5 h-[5px] overflow-hidden rounded-full"
            style={{
              background: COLORS.well,
            }}
          >
            <motion.div
              className="h-full rounded-full"
              animate={{
                width: `${task.list.length ? (done / task.list.length) * 100 : 0}%`,
                backgroundColor: done === task.list.length && done ? "var(--good)" : "var(--accent)",
              }}
              transition={SPRING_SOFT}
            />
          </div>
          <ul className="mt-2">
            {task.list.map((item, i) => (
              <li key={i}>
                <label className="md-row flex cursor-pointer items-center gap-3 rounded-[10px] px-2 py-2">
                  <Checkbox
                    on={item.done}
                    label={item.t}
                    onChange={() =>
                      update((current) => ({
                        ...current,
                        list: current.list.map((entry, j) =>
                          j === i
                            ? {
                                ...entry,
                                done: !entry.done,
                              }
                            : entry,
                        ),
                      }))
                    }
                  />

                  <span
                    className="relative text-[13.5px] transition-colors"
                    style={{
                      color: item.done ? COLORS.soft : COLORS.ink,
                    }}
                  >
                    {item.t}
                    <motion.span
                      aria-hidden={true}
                      className="absolute left-0 top-1/2 h-px"
                      style={{
                        background: COLORS.soft,
                      }}
                      initial={false}
                      animate={{
                        width: item.done ? "100%" : "0%",
                      }}
                      transition={{
                        duration: 0.25,
                        ease: EASE,
                      }}
                    />
                  </span>
                </label>
              </li>
            ))}
            {task.list.length === 0 && (
              <li
                className="px-2 py-2 text-[13px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                No checklist yet.
              </li>
            )}
          </ul>
        </section>
        <section
          className="mt-5 rounded-[16px] p-4"
          style={{
            background: COLORS.card,
            boxShadow: "var(--card-shadow)",
          }}
          aria-label="Time logged"
        >
          <Metric
            label={hoverDay != null ? `${hours[hoverDay].long}` : "Time logged this week"}
            text={`${(hoverDay != null ? hours[hoverDay].v : totalHours).toFixed(1)}h`}
            size={22}
          />

          <div className="mt-3">
            <BarChart data={hours} rangeKey={task.id} height={110} onHover={setHoverDay} label="Hours logged per day" />
          </div>
        </section>
        <section className="mt-6" aria-label="Comments">
          <h3
            className="text-[13.5px] font-[600]"
            style={{
              color: COLORS.ink,
            }}
          >
            {"Comments "}
            <span
              className="font-[450]"
              style={{
                color: COLORS.soft,
              }}
            >
              {task.comments.length}
            </span>
          </h3>
          <ul className="mt-3 flex flex-col gap-3.5">
            <AnimatePresence initial={false}>
              {task.comments.map((comment) => (
                <motion.li
                  key={comment.id}
                  layout={true}
                  initial={{
                    opacity: 0,
                    y: 12,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  transition={SPRING_SOFT}
                  className="flex gap-2.5"
                >
                  <Avatar name={comment.who} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 text-[12.5px]">
                      <span
                        className="font-[580]"
                        style={{
                          color: COLORS.ink,
                        }}
                      >
                        {comment.who}
                      </span>
                      <span
                        style={{
                          color: COLORS.soft,
                        }}
                      >
                        {comment.when}
                      </span>
                    </div>
                    <p
                      className="mt-0.5 text-[13.5px] leading-[1.5]"
                      style={{
                        color: COLORS.text,
                      }}
                    >
                      {comment.text}
                    </p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
            {task.comments.length === 0 && (
              <li
                className="text-[13px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                No comments yet. Start the thread.
              </li>
            )}
          </ul>
        </section>
      </div>
      <div
        className="border-t px-4 py-3"
        style={{
          borderColor: COLORS.line,
        }}
      >
        <div
          className="flex items-end gap-2 rounded-[14px] p-2 pl-3"
          style={{
            background: COLORS.card,
            boxShadow: "var(--card-shadow)",
          }}
        >
          <Avatar name={ME.name} size={24} />
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={1}
            placeholder="Write a comment"
            aria-label="Write a comment"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                postComment();
              }
            }}
            className="max-h-28 min-h-[28px] flex-1 resize-none bg-transparent py-1 text-[13.5px] outline-none"
            style={{
              color: COLORS.ink,
            }}
          />

          <motion.button
            type="button"
            aria-label="Post comment"
            onClick={postComment}
            disabled={!comment.trim()}
            whileTap={{
              scale: 0.9,
            }}
            className="grid size-8 shrink-0 place-items-center rounded-[10px] text-white transition-opacity disabled:opacity-40"
            style={{
              background: COLORS.btn,
            }}
          >
            <Icon name="ph:paper-plane-right" size={15} />
          </motion.button>
        </div>
      </div>
    </>
  );
}
