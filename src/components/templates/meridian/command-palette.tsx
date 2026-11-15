"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { COLORS } from "./theme";
import { Avatar, Icon, InitialsAvatar, Kbd } from "./ui";
import type { Command } from "./types";

/** How well `query` matches `text` as a subsequence: runs and word starts score higher; 0 when it does not match. */
function fuzzyScore(query: string, text: string) {
  if (!query) {
    return 1;
  }
  const needle = query.toLowerCase().replace(/\s+/g, "");
  const hay = text.toLowerCase();
  let matched = 0;
  let score = 0;
  let last = -2;
  for (let index = 0; index < hay.length && matched < needle.length; index++) {
    if (hay[index] === needle[matched]) {
      score += 1 + (index === last + 1 ? 2 : 0) + (index === 0 || hay[index - 1] === " " ? 2 : 0);
      last = index;
      matched++;
    }
  }
  return matched === needle.length ? score - hay.length * 0.01 : 0;
}

export function CommandPalette({ open, onClose, cmds }: { open: boolean; onClose: () => void; cmds: Command[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const field = useRef<HTMLDivElement>(null);
  // each opening starts empty
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setActive(0);
    }
  }, [open]);
  const results = useMemo(() => {
    if (!query.trim()) {
      return cmds.filter(
        (cmd) =>
          cmd.group === "Pages" ||
          cmd.group === "Actions" ||
          (cmd.group === "Tasks" && ["FN-377", "FN-412", "FN-433"].includes(cmd.id.slice(2))),
      );
    }
    const scored = cmds
      .map((cmd) => ({
        cmd,
        score: Math.max(fuzzyScore(query, cmd.label) * 1.2, fuzzyScore(query, `${cmd.label} ${cmd.sub ?? ""}`)),
      }))
      .filter((item) => item.score > 0);
    // the best five of each group, groups in a fixed order
    return (["Pages", "Actions", "Customers", "Tasks"] as const).flatMap((group) =>
      scored
        .filter((item) => item.cmd.group === group)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => item.cmd),
    );
  }, [query, cmds]);
  // typing moves the highlight back to the best match
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(0);
  }, [query]);
  useEffect(() => {
    field.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({
      block: "nearest",
    });
  }, [active]);
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((prev) => (results.length ? (prev + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((prev) => (results.length ? (prev - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const h = results[active];
      if (h) {
        onClose();
        h.run();
      }
    } else {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-[12vh]"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.15,
            },
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(5,5,8,.5)",
              backdropFilter: "blur(3px)",
            }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{
              opacity: 0,
              scale: 0.96,
              y: -10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
              y: -6,
            }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 32,
            }}
            className="relative w-full max-w-[600px] overflow-hidden rounded-[18px]"
            style={{
              background: COLORS.pop,
              boxShadow: "var(--pop-shadow)",
            }}
          >
            <div
              className="flex items-center gap-3 border-b px-4"
              style={{
                borderColor: COLORS.line,
              }}
            >
              <Icon
                name="ph:magnifying-glass"
                size={18}
                style={{
                  color: COLORS.soft,
                }}
              />

              <input
                autoFocus={true}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKey}
                placeholder="Search pages, customers and tasks"
                aria-label="Search"
                role="combobox"
                aria-expanded={true}
                aria-controls="md-cmd-list"
                aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                className="h-[54px] flex-1 bg-transparent text-[15px] outline-none"
                style={{
                  color: COLORS.ink,
                }}
              />

              <Kbd>Esc</Kbd>
            </div>
            <div
              ref={field}
              id="md-cmd-list"
              role="listbox"
              className="md-scroll max-h-[min(400px,56dvh)] overflow-y-auto p-1.5"
            >
              {results.length === 0 && (
                <div
                  className="px-3 py-10 text-center text-[13.5px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}
              <LayoutGroup id="cmd">
                {results.map((result, j) => {
                  const x = result.group !== results[j - 1]?.group;
                  return (
                    <Fragment key={result.id}>
                      {x && (
                        <div
                          className="px-2.5 pb-1 pt-2.5 text-[11.5px] font-[540]"
                          style={{
                            color: COLORS.soft,
                          }}
                        >
                          {result.group}
                        </div>
                      )}
                      <button
                        type="button"
                        id={`cmd-${result.id}`}
                        role="option"
                        aria-selected={j === active}
                        data-i={j}
                        onMouseMove={() => j !== active && setActive(j)}
                        onClick={() => {
                          onClose();
                          result.run();
                        }}
                        className="relative flex h-11 w-full items-center gap-3 rounded-[11px] px-2.5 text-left"
                      >
                        {j === active && (
                          <motion.span
                            layoutId="cmd-pill"
                            className="absolute inset-0 rounded-[11px]"
                            style={{
                              background: COLORS.well,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 600,
                              damping: 40,
                            }}
                          />
                        )}
                        <span className="relative grid size-7 shrink-0 place-items-center">
                          {result.face ? (
                            <Avatar name={result.face} size={26} />
                          ) : result.mono ? (
                            <InitialsAvatar name={result.mono.name} size={26} hue={result.mono.hue} />
                          ) : (
                            <span
                              className="grid size-7 place-items-center rounded-[8px]"
                              style={{
                                background: COLORS.card2,
                                color: j === active ? COLORS.accentInk : COLORS.text,
                                boxShadow: "inset 0 0 0 1px var(--line)",
                              }}
                            >
                              <Icon name={result.icon ?? "ph:arrow-right"} size={15} />
                            </span>
                          )}
                        </span>
                        <span className="relative min-w-0 flex-1">
                          <span
                            className="block truncate text-[13.5px] font-[530]"
                            style={{
                              color: COLORS.ink,
                            }}
                          >
                            {result.label}
                          </span>
                        </span>
                        {result.sub && (
                          <span
                            className="relative hidden max-w-[45%] truncate text-[12.5px] sm:block"
                            style={{
                              color: COLORS.soft,
                            }}
                          >
                            {result.sub}
                          </span>
                        )}
                        {j === active && (
                          <span className="relative">
                            <Icon
                              name="ph:arrow-elbow-down-left"
                              size={14}
                              style={{
                                color: COLORS.soft,
                              }}
                            />
                          </span>
                        )}
                      </button>
                    </Fragment>
                  );
                })}
              </LayoutGroup>
            </div>
            <div
              className="hidden items-center gap-4 border-t px-4 py-2.5 text-[12px] sm:flex"
              style={{
                borderColor: COLORS.line,
                color: COLORS.soft,
              }}
            >
              <span className="flex items-center gap-1.5">
                <Kbd>
                  <Icon name="ph:arrow-up" size={10} />
                </Kbd>
                <Kbd>
                  <Icon name="ph:arrow-down" size={10} />
                </Kbd>
                to move
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>
                  <Icon name="ph:arrow-elbow-down-left" size={10} />
                </Kbd>
                to open
              </span>
              <span className="ml-auto">
                {results.length}
                {" result"}
                {results.length === 1 ? "" : "s"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
