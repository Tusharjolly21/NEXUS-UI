"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgentFace } from "./agent-face";
import { HUDDLE_TOPICS } from "./replies";
import { COLORS, SPRING, clamp } from "./theme";
import { INPUT_CLASS, Icon, Sheet, SheetHeader, inputStyle } from "./ui";
import type { Agent } from "./types";

const ORBIT_SLOTS = [
  [-1, 0],
  [-0.36, -0.3],
  [0.36, -0.3],
  [1, 0],
];

type HuddleSetupProps = {
  open: boolean;
  onClose: () => void;
  agents: Agent[];
  /** Agent ids already picked when the sheet opens (the DM's agent, or the group's). */
  initial: string[];
  onStart: (agentIds: string[], topic: string) => void;
};

export function HuddleSetup({ open, onClose, agents, initial, onStart }: HuddleSetupProps) {
  const [picked, setPicked] = useState(initial);
  const [topic, setTopic] = useState(HUDDLE_TOPICS[0]);
  const [bumps, setBumps] = useState(0);
  // each time the sheet opens it starts again from whoever is in the current thread
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPicked(initial);
      setTopic(HUDDLE_TOPICS[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const toggle = (id: string) =>
    setPicked((list) =>
      list.includes(id)
        ? list.filter((item) => item !== id)
        : list.length >= 4
          ? (setBumps((count) => count + 1), list)
          : [...list, id],
    );
  const members = picked
    .map((id) => agents.find((agent) => agent.id === id))
    .filter((agent): agent is Agent => !!agent);
  const ready = members.length >= 2 && !!topic.trim();
  const count = members.length;
  return (
    <Sheet open={open} onClose={onClose} label="Start a huddle" width={600}>
      <SheetHeader
        title="Start a huddle"
        sub="Pick 2 to 4 agents. They take turns, build on each other and @mention who should go next."
        onClose={onClose}
      />
      <div className="hd-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-2">
        <div
          className="relative mb-4 h-[132px] overflow-hidden rounded-[18px]"
          style={{
            background: "radial-gradient(70% 90% at 50% 100%, rgba(212,242,106,.07), transparent 70%), #0F0F12",
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
          }}
          aria-hidden={true}
        >
          <div
            className="absolute bottom-[14px] left-1/2 h-[26px] w-[64%] -translate-x-1/2 rounded-[50%]"
            style={{
              background: "rgba(255,255,255,.03)",
              boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
            }}
          />
          {ORBIT_SLOTS.map(
            (orbitSlot, i) =>
              i >= count && (
                <div
                  key={`s${i}`}
                  className="absolute bottom-[34px] size-[42px] rounded-[16px] border border-dashed"
                  style={{
                    left: `calc(50% + ${(i - 1.5) * 76}px - 21px)`,
                    borderColor: "rgba(255,255,255,.1)",
                  }}
                />
              ),
          )}
          <AnimatePresence>
            {members.map((agent, i) => {
              const x = (i - 1.5) * 76;
              const lift = Math.abs(i - 1.5) < 1 ? 10 : 0;
              return (
                <motion.div
                  key={agent.id}
                  layout={true}
                  initial={{
                    opacity: 0,
                    y: 60,
                    scale: 0.4,
                  }}
                  animate={{
                    opacity: 1,
                    y: -lift,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 50,
                    scale: 0.4,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 19,
                  }}
                  className="absolute bottom-[26px]"
                  style={{
                    left: `calc(50% + ${x}px - 27px)`,
                  }}
                >
                  <AgentFace
                    shape={agent.shape}
                    color={agent.color}
                    eyes={agent.eyes}
                    size={54}
                    look={[count < 2 ? 0 : clamp(((count - 1) / 2 - i) * 0.9, -1, 1), 0.15]}
                    seed={agent.id}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          {count === 0 && (
            <p
              className="absolute inset-x-0 top-5 text-center text-[13px]"
              style={{
                color: COLORS.soft,
              }}
            >
              Nobody here yet
            </p>
          )}
        </div>
        <div className="mb-2 flex items-center justify-between">
          <span
            className="text-[12.5px] font-[550]"
            style={{
              color: COLORS.text,
            }}
          >
            Agents
          </span>
          <span
            key={bumps}
            className={`text-[12.5px] tabular-nums ${bumps ? "hd-shake" : ""}`}
            style={{
              color: count >= 4 && bumps ? COLORS.danger : COLORS.soft,
            }}
          >
            {count}
            {" of 4 picked"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {agents.map((agent) => {
            const chosen = picked.includes(agent.id);
            return (
              <motion.button
                key={agent.id}
                type="button"
                aria-pressed={chosen}
                onClick={() => toggle(agent.id)}
                whileTap={{
                  scale: 0.97,
                }}
                transition={SPRING}
                className="relative flex items-center gap-3 rounded-[14px] px-2.5 py-2 text-left transition-colors"
                style={{
                  background: chosen ? `${agent.color}14` : COLORS.raise,
                  boxShadow: `inset 0 0 0 1px ${chosen ? `${agent.color}66` : COLORS.line}`,
                }}
              >
                <AgentFace
                  shape={agent.shape}
                  color={agent.color}
                  eyes={agent.eyes}
                  size={32}
                  shadow={false}
                  seed={agent.id}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-[600]">{agent.name}</span>
                  <span
                    className="block truncate text-[12px]"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    {agent.role}
                  </span>
                </span>
                <span
                  className="grid size-[20px] shrink-0 place-items-center rounded-full transition-colors"
                  style={{
                    background: chosen ? agent.color : "transparent",
                    boxShadow: chosen ? "none" : `inset 0 0 0 1.5px ${COLORS.faint}`,
                    color: "#111",
                  }}
                >
                  <AnimatePresence>
                    {chosen && (
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
                        transition={SPRING}
                      >
                        <Icon name="ph:check-bold" size={11} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
            );
          })}
        </div>
        <label
          htmlFor="hd-topic"
          className="mb-2 mt-5 block text-[12.5px] font-[550]"
          style={{
            color: COLORS.text,
          }}
        >
          What should they talk about?
        </label>
        <input
          id="hd-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && ready) {
              onStart(picked, topic.trim());
            }
          }}
          className={`${INPUT_CLASS} h-[42px]`}
          style={inputStyle(false)}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {HUDDLE_TOPICS.map((huddleTopic) => (
            <button
              key={huddleTopic}
              type="button"
              onClick={() => setTopic(huddleTopic)}
              className="rounded-full px-3 py-1.5 text-[12.5px] transition-colors hover:bg-white/[.07]"
              style={{
                color: huddleTopic === topic ? COLORS.ink : COLORS.text,
                background: huddleTopic === topic ? "rgba(255,255,255,.07)" : "transparent",
                boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
              }}
            >
              {huddleTopic}
            </button>
          ))}
        </div>
      </div>
      <div
        className="flex shrink-0 items-center justify-end gap-2 border-t px-5 py-3.5"
        style={{
          borderColor: COLORS.line,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-full px-4 text-[14px] font-[550] transition-colors hover:bg-white/[.06]"
          style={{
            color: COLORS.text,
          }}
        >
          Cancel
        </button>
        <motion.button
          type="button"
          disabled={!ready}
          whileTap={
            ready
              ? {
                  scale: 0.96,
                }
              : undefined
          }
          onClick={() => onStart(picked, topic.trim())}
          className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-[650] transition-[background,color] disabled:cursor-not-allowed"
          style={{
            background: ready ? COLORS.acc : "#2A2A30",
            color: ready ? COLORS.accInk : "#7C7C86",
            boxShadow: ready ? "inset 0 1px 0 rgba(255,255,255,.45)" : "none",
          }}
        >
          <Icon name="ph:users-three-fill" size={16} />
          Start huddle
        </motion.button>
      </div>
    </Sheet>
  );
}
