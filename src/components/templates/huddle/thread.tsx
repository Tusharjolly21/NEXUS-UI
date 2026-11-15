"use client";

import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgentFace } from "./agent-face";
import { MessageBubble, TypingRow, dayKey, dayLabel } from "./message";
import { joinNames } from "./sidebar";
import { COLORS, clamp, tint } from "./theme";
import { Icon, useHydrated } from "./ui";
import type { Agent, Msg, Thread } from "./types";

type MemberStripProps = {
  agents: Agent[];
  /** The agent whose reply is streaming in, if any. */
  speaker: string | null;
  /** Agents still working out what to say. */
  thinking: string[];
  onPick: (agent: Agent) => void;
};

/** The huddle's members above the composer: the one talking leans in and the rest turn to look at it. */
export function MemberStrip({ agents, speaker, thinking, onPick }: MemberStripProps) {
  const activeIndex = agents.findIndex((agent) => agent.id === speaker || (!speaker && thinking.includes(agent.id)));
  return (
    <div
      className="mb-2.5 flex items-end justify-center gap-1"
      role="group"
      aria-label="Huddle members. Click one to mention them."
    >
      {agents.map((agent, i) => {
        const speaking = i === activeIndex;
        const thinkingNow = thinking.includes(agent.id) && agent.id !== speaker;
        const lean = activeIndex < 0 ? [0, 0.7] : speaking ? [0, 0.6] : [Math.sign(activeIndex - i) * 1, -0.05];
        return (
          <motion.button
            key={agent.id}
            type="button"
            onClick={() => onPick(agent)}
            aria-label={`Mention ${agent.name}`}
            animate={{
              y: speaking ? -7 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 18,
            }}
            className="group/hb relative flex w-[62px] flex-col items-center rounded-[12px] pb-1 pt-1.5 transition-colors hover:bg-white/[.04]"
          >
            <AnimatePresence>
              {speaking && (
                <motion.span
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                  }}
                  className="absolute bottom-[18px] h-2 w-9 rounded-[50%]"
                  style={{
                    background: agent.color,
                    filter: "blur(8px)",
                    opacity: 0.8,
                  }}
                />
              )}
            </AnimatePresence>
            <AgentFace
              shape={agent.shape}
              color={agent.color}
              eyes={agent.eyes}
              size={30}
              look={lean}
              mood={agent.id === speaker ? "talking" : thinkingNow ? "thinking" : "idle"}
              seed={agent.id}
            />
            <span
              className="mt-1 text-[11px] font-[600] transition-colors"
              style={{
                color: speaking ? tint(agent.color) : COLORS.soft,
              }}
            >
              {agent.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

type HeaderButtonProps = {
  icon: string;
  label: string;
  onClick: () => void;
  on?: boolean;
  text?: string;
};

function HeaderButton({ icon, label, onClick, on, text }: HeaderButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{
        scale: 0.92,
      }}
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      title={label}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-[11px] text-[13px] font-[550] transition-colors hover:bg-white/[.06] ${text ? "px-3" : "w-9"}`}
      style={{
        color: on ? COLORS.ink : COLORS.text,
        background: on ? "rgba(255,255,255,.07)" : undefined,
      }}
    >
      <Icon name={icon} size={17} />
      {text}
    </motion.button>
  );
}

export function ThreadHeader({
  thread,
  members,
  narrow,
  editorOpen,
  onMenu,
  onEdit,
  onVoice,
  onHuddle,
  onAgent,
  unreadElsewhere,
}: {
  thread: Thread;
  members: Agent[];
  /** Below 900px the sidebar is a drawer, opened from a menu button here. */
  narrow: boolean;
  editorOpen: boolean;
  onMenu: () => void;
  onEdit: () => void;
  onVoice: () => void;
  onHuddle: () => void;
  onAgent: (id: string) => void;
  /** Unread messages in other threads, shown on the menu button. */
  unreadElsewhere: number;
}) {
  const isGroup = thread.kind === "group";
  const first = members[0];
  return (
    <header
      className="relative z-10 flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4"
      style={{
        borderColor: COLORS.line,
        background: "rgba(12,12,14,.8)",
        backdropFilter: "blur(12px)",
      }}
    >
      {narrow && (
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open conversations"
          className="relative grid size-9 place-items-center rounded-[11px] hover:bg-white/[.06]"
          style={{
            color: COLORS.text,
          }}
        >
          <Icon name="ph:list" size={19} />
          {unreadElsewhere > 0 && (
            <span
              className="absolute right-1.5 top-1.5 size-2 rounded-full"
              style={{
                background: COLORS.acc,
                boxShadow: `0 0 0 2px ${COLORS.bg}`,
              }}
            />
          )}
        </button>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={thread.id}
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
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          {isGroup ? (
            <span className="flex shrink-0 items-center">
              {members.map((member, i) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => onAgent(member.id)}
                  aria-label={`Edit ${member.name}`}
                  className="relative transition-transform hover:z-10 hover:-translate-y-0.5"
                  style={{
                    marginLeft: i ? -9 : 0,
                    zIndex: 10 - i,
                  }}
                >
                  <AgentFace
                    shape={member.shape}
                    color={member.color}
                    eyes={member.eyes}
                    size={28}
                    shadow={false}
                    seed={member.id}
                  />
                </button>
              ))}
            </span>
          ) : (
            first && (
              <button
                type="button"
                onClick={() => onAgent(first.id)}
                aria-label={`Edit ${first.name}`}
                className="shrink-0 transition-transform hover:scale-105"
              >
                <AgentFace
                  shape={first.shape}
                  color={first.color}
                  eyes={first.eyes}
                  size={30}
                  shadow={false}
                  mood={thread.busy.length ? "thinking" : "idle"}
                  seed={first.id}
                />
              </button>
            )
          )}
          <div className="min-w-0">
            <p className="truncate text-[14.5px] font-[650] leading-tight">
              {isGroup ? (thread.title ?? joinNames(members)) : first == null ? undefined : first.name}
            </p>
            <p
              className="truncate text-[12px] leading-tight"
              style={{
                color: COLORS.soft,
              }}
            >
              {isGroup ? joinNames(members) : first == null ? undefined : first.role}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex shrink-0 items-center gap-0.5">
        {!narrow && (
          <HeaderButton
            icon="ph:users-three"
            label="Start a huddle"
            onClick={onHuddle}
            text={isGroup ? undefined : "Huddle"}
          />
        )}
        <HeaderButton icon="ph:waveform" label="Voice mode" onClick={onVoice} />
        <HeaderButton
          icon={narrow ? "ph:pencil-simple" : "ph:sidebar-simple"}
          label={editorOpen ? "Hide agent editor" : "Edit agent"}
          on={editorOpen}
          onClick={onEdit}
        />
      </div>
    </header>
  );
}

function EmptyThread({ members }: { members: Agent[] }) {
  return (
    <div className="flex flex-col items-center pt-[12vh] text-center">
      <div className="flex items-end gap-2">
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{
              y: 30,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 16,
              delay: i * 0.08,
            }}
          >
            <AgentFace
              shape={member.shape}
              color={member.color}
              eyes={member.eyes}
              size={56}
              look={[clamp((members.length - 1) / 2 - i, -1, 1) * 0.9, 0]}
              seed={member.id}
            />
          </motion.div>
        ))}
      </div>
      <p className="mt-5 text-[16px] font-[600]">
        {joinNames(members)}
        {" are here"}
      </p>
      <p
        className="mt-1 text-[13.5px]"
        style={{
          color: COLORS.soft,
        }}
      >
        Ask the room, or @mention one of them.
      </p>
    </div>
  );
}

type MessageListProps = {
  thread: Thread;
  byId: Record<string, Agent>;
  names: Record<string, Agent>;
  onCopy: (msg: Msg) => void;
  onRetry: (msg: Msg) => void;
  onReact: (msg: Msg, emoji: string) => void;
  onAgent: (id: string) => void;
};

export function MessageList({ thread, byId, names, onCopy, onRetry, onReact, onAgent }: MessageListProps) {
  const hydrated = useHydrated();
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  useLayoutEffect(() => {
    atBottom.current = true;
    const el = scroller.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [thread.id]);
  useEffect(() => {
    const el = scroller.current;
    const inner = content.current;
    if (!el || !inner) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (atBottom.current) {
        el.scrollTop = el.scrollHeight;
      }
    });
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);
  const isGroup = thread.kind === "group";
  const lastAgentIndex = thread.msgs.map((msg) => msg.from !== "me").lastIndexOf(true);
  const members = thread.agents.map((id) => byId[id]).filter(Boolean);
  const busy = thread.busy.map((agentId) => byId[agentId]).filter(Boolean);
  return (
    <div
      ref={scroller}
      onScroll={() => {
        const el = scroller.current;
        if (el) {
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
        }
      }}
      className="hd-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      role="log"
      aria-live="polite"
      aria-label="Messages"
    >
      <div ref={content} className="mx-auto w-full max-w-[740px] px-4 pb-6 pt-2 sm:px-6">
        {!thread.msgs.length && isGroup && <EmptyThread members={members} />}
        {thread.msgs.map((msg, i) => {
          const prev = thread.msgs[i - 1];
          const newDay = !prev || dayKey(prev.at) !== dayKey(msg.at);
          return (
            <Fragment key={msg.id}>
              {newDay && (
                <div className="flex items-center gap-3 pb-1 pt-5">
                  <span
                    className="h-px flex-1"
                    style={{
                      background: COLORS.line,
                    }}
                  />
                  <span
                    className="rounded-full px-3 py-1 text-[11.5px] font-[600]"
                    style={{
                      color: COLORS.text,
                      background: COLORS.raise,
                      boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                    }}
                  >
                    {hydrated ? dayLabel(msg.at) : null}
                  </span>
                  <span
                    className="h-px flex-1"
                    style={{
                      background: COLORS.line,
                    }}
                  />
                </div>
              )}
              <MessageBubble
                msg={msg}
                agent={byId[msg.from]}
                names={names}
                group={isGroup}
                showHead={newDay || !prev || prev.from !== msg.from}
                onCopy={onCopy}
                onRetry={i === lastAgentIndex && !msg.streaming && !thread.busy.length ? onRetry : undefined}
                onReact={onReact}
                onAgent={onAgent}
              />
            </Fragment>
          );
        })}
        <AnimatePresence>
          {busy.map((agent) => (
            <TypingRow key={`t-${agent.id}`} agent={agent} group={isGroup} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
