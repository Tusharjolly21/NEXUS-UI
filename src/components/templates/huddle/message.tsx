"use client";

import { Fragment, memo, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgentFace } from "./agent-face";
import { visibleText } from "./replies";
import { COLORS, FONT_MONO, SPRING, SPRING_SOFT, tint } from "./theme";
import { Icon, Popover, useHydrated } from "./ui";
import type { Agent, Msg } from "./types";

/** A run of lines in a reply: a paragraph, a list, or a fenced code block (open while it is still streaming in). */
type Block =
  { kind: "p" | "ul" | "ol"; lines: string[] } | { kind: "code"; lang: string; lines: string[]; open: boolean };

/** Agent names by lower-case name, for turning @Name into a coloured mention. */
type Names = Record<string, Agent>;

/** Splits a reply into paragraphs, lists and code blocks: the small subset of Markdown the agents write. */
function parseBlocks(text: string) {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const code = [];
      for (index++; index < lines.length && !lines[index].startsWith("```");) {
        code.push(lines[index++]);
      }
      blocks.push({
        kind: "code",
        lang: fence[1] || "text",
        lines: code,
        open: index >= lines.length,
      });
      index++;
      continue;
    }
    if (/^\s*[-*] /.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*] /.test(lines[index])) {
        items.push(lines[index++].replace(/^\s*[-*] /, ""));
      }
      blocks.push({
        kind: "ul",
        lines: items,
      });
      continue;
    }
    if (/^\s*\d+\. /.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\. /.test(lines[index])) {
        items.push(lines[index++].replace(/^\s*\d+\. /, ""));
      }
      blocks.push({
        kind: "ol",
        lines: items,
      });
      continue;
    }
    if (!line.trim()) {
      index++;
      continue;
    }
    const para = [];
    while (index < lines.length && lines[index].trim() && !/^(```|\s*[-*] |\s*\d+\. )/.test(lines[index])) {
      para.push(lines[index++]);
    }
    blocks.push({
      kind: "p",
      lines: para,
    });
  }
  return blocks;
}

function Mentions({ text, names }: { text: string; names: Names }) {
  let source = text;
  if ((source.match(/\*\*/g) || []).length % 2) {
    source = source.replace(/\*\*(?!.*\*\*)/, "");
  }
  if ((source.match(/`/g) || []).length % 2) {
    source = source.replace(/`(?!.*`)/, "");
  }
  const parts = source.split(/(`[^`]+`|\*\*[^*]+\*\*|@[A-Z][a-z]+)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (!part) {
          return null;
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return (
            <code
              key={index}
              className="rounded-[6px] px-[5px] py-[1px] text-[0.88em]"
              style={{
                fontFamily: FONT_MONO,
                background: "rgba(255,255,255,.07)",
                color: "#E6E6EA",
                boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 3) {
          return (
            <strong
              key={index}
              className="font-[620]"
              style={{
                color: COLORS.ink,
              }}
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        const agent = part.startsWith("@") ? names[part.slice(1).toLowerCase()] : undefined;
        return agent ? (
          <span
            key={index}
            className="inline-flex translate-y-[1px] items-center gap-1 rounded-full py-[1px] pl-[3px] pr-2 align-baseline text-[0.92em] font-[600]"
            style={{
              background: `${agent.color}22`,
              color: tint(agent.color),
              boxShadow: `inset 0 0 0 1px ${agent.color}33`,
            }}
          >
            <AgentFace
              shape={agent.shape}
              color={agent.color}
              eyes={agent.eyes}
              size={15}
              shadow={false}
              blink={false}
            />
            {agent.name}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        );
      })}
    </>
  );
}

export const Caret = () => (
  <span
    aria-hidden={true}
    className="hd-caret ml-[2px] inline-block h-[1.05em] w-[7px] translate-y-[3px] rounded-[2px]"
    style={{
      background: COLORS.acc,
      boxShadow: `0 0 12px ${COLORS.acc}`,
    }}
  />
);

function CodeBlock({ lang, code, caret }: { lang: string; code: string; caret?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try {
      navigator.clipboard?.writeText(code).catch(() => {});
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div
      className="my-3 overflow-hidden rounded-[14px]"
      style={{
        background: "#09090B",
        boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
      }}
    >
      <div
        className="flex h-9 items-center justify-between pl-3.5 pr-1.5"
        style={{
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <span
          className="text-[12px]"
          style={{
            fontFamily: FONT_MONO,
            color: COLORS.soft,
          }}
        >
          {lang}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex h-7 items-center gap-1.5 rounded-[8px] px-2 text-[12px] font-[500] transition-colors hover:bg-white/[.06]"
          style={{
            color: copied ? COLORS.ok : COLORS.text,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={copied ? "y" : "n"}
              initial={{
                scale: 0.5,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.5,
                opacity: 0,
              }}
              transition={SPRING}
            >
              <Icon name={copied ? "ph:check-bold" : "ph:copy"} size={13} />
            </motion.span>
          </AnimatePresence>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="hd-scroll overflow-x-auto px-3.5 py-3 text-[12.5px] leading-[1.65]"
        style={{
          fontFamily: FONT_MONO,
          color: "#D9D9DE",
        }}
      >
        <code>{code}</code>
        {caret && <Caret />}
      </pre>
    </div>
  );
}

function RichText({ text, names, caret }: { text: string; names: Names; caret?: boolean }) {
  const blocks = parseBlocks(text);
  return (
    <div
      className="text-[14.5px] leading-[1.62]"
      style={{
        color: "#D4D4DA",
      }}
    >
      {blocks.map((block, i) => {
        const withCaret = caret && i === blocks.length - 1;
        if (block.kind === "code") {
          return <CodeBlock key={i} lang={block.lang ?? "text"} code={block.lines.join("\n")} caret={withCaret} />;
        }
        if (block.kind === "p") {
          return (
            <p key={i} className="my-2 first:mt-0 last:mb-0">
              {block.lines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  <Mentions text={line} names={names} />
                </Fragment>
              ))}
              {withCaret && <Caret />}
            </p>
          );
        }
        const List = block.kind === "ul" ? "ul" : "ol";
        return (
          <List key={i} className="my-2.5 space-y-1.5 first:mt-0 last:mb-0">
            {block.lines.map((line, i) => (
              <li key={i} className="flex gap-2.5">
                <span
                  className="mt-[1px] w-4 shrink-0 text-right tabular-nums"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {block.kind === "ul" ? (
                    <span
                      className="inline-block size-[5px] -translate-y-[3px] rounded-full"
                      style={{
                        background: COLORS.soft,
                      }}
                    />
                  ) : (
                    `${i + 1}.`
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <Mentions text={line} names={names} />
                  {withCaret && i === block.lines.length - 1 && <Caret />}
                </span>
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

function StreamedText({ msg, names }: { msg: Msg; names: Names }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!msg.streaming) {
      return;
    }
    let frame = 0;
    let timer = 0;
    const tick = (time: number) => {
      if (time - timer > 28) {
        timer = time;
        setNow(Date.now());
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [msg.streaming]);
  return <RichText text={visibleText(msg, now)} names={names} caret={msg.streaming} />;
}

const REACTIONS = [
  {
    id: "up",
    icon: "ph:thumbs-up-fill",
    label: "Agree",
  },
  {
    id: "heart",
    icon: "ph:heart-fill",
    label: "Love",
  },
  {
    id: "done",
    icon: "ph:check-circle-fill",
    label: "Done",
  },
  {
    id: "idea",
    icon: "ph:lightbulb-fill",
    label: "Good idea",
  },
  {
    id: "eyes",
    icon: "ph:eye-fill",
    label: "Looking",
  },
  {
    id: "clap",
    icon: "ph:hands-clapping-fill",
    label: "Nice work",
  },
];

export const formatTime = (at: number) =>
  new Date(at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const dayKey = (at: number) => new Date(at).toDateString();

export const dayLabel = (at: number) => {
  const date = new Date(at);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  return date.toDateString() === today.toDateString()
    ? "Today"
    : date.toDateString() === yesterday.toDateString()
      ? "Yesterday"
      : date.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "short",
        });
};

export const plainText = (text: string) =>
  text
    .replace(/```[\s\S]*?(```|$)/g, " ")
    .replace(/[*`]/g, "")
    .replace(/^\s*([-*]|\d+\.)\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

type BubbleActionProps = {
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  btnRef?: RefObject<HTMLButtonElement | null>;
};

function BubbleAction({ icon, label, onClick, active, btnRef }: BubbleActionProps) {
  return (
    <button
      ref={btnRef}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-[8px] transition-[background,color,transform] hover:bg-white/[.07] active:scale-90"
      style={{
        color: active ? COLORS.ink : COLORS.soft,
      }}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}

type ReactionPickerProps = {
  open: boolean;
  onClose: () => void;
  anchor: RefObject<HTMLElement | null>;
  onPick: (id: string) => void;
  /** The reactions already on the message, shown pressed. */
  mine: string[];
};

function ReactionPicker({ open, onClose, anchor, onPick, mine }: ReactionPickerProps) {
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => list.current?.querySelector("button")?.focus(), 30);
      return () => clearTimeout(timer);
    }
  }, [open]);
  const onKey = (event: KeyboardEvent) => {
    const buttons = Array.from(list.current?.querySelectorAll("button") ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      buttons[(index + 1) % buttons.length]?.focus();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    }
  };
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchor={anchor}
      placement="top-start"
      width={244}
      label="Add a reaction"
      role="toolbar"
      onKeyDown={onKey}
      panelRef={list}
      offset={6}
    >
      <div className="flex gap-0.5">
        {REACTIONS.map((reaction, i) => (
          <motion.button
            key={reaction.id}
            type="button"
            aria-label={reaction.label}
            title={reaction.label}
            aria-pressed={mine.includes(reaction.id)}
            onClick={() => {
              onPick(reaction.id);
              onClose();
            }}
            initial={{
              scale: 0.4,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              ...SPRING,
              delay: i * 0.025,
            }}
            whileHover={{
              scale: 1.22,
              y: -3,
            }}
            whileTap={{
              scale: 0.85,
            }}
            className="grid size-9 place-items-center rounded-[10px]"
            style={{
              color: REACTION_COLORS[reaction.id],
              background: mine.includes(reaction.id) ? "rgba(255,255,255,.08)" : undefined,
            }}
          >
            <Icon name={reaction.icon} size={19} />
          </motion.button>
        ))}
      </div>
    </Popover>
  );
}

const REACTION_COLORS: Record<string, string> = {
  up: "#F5D06B",
  heart: "#FF7A93",
  done: "#7DDB9A",
  idea: "#FFD45E",
  eyes: "#9CC8FF",
  clap: "#F2B98A",
};

function ReactionList({ list, onToggle }: { list: string[]; onToggle: (id: string) => void }) {
  return list.length ? (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <AnimatePresence initial={false}>
        {list.map((id) => {
          const reaction = REACTIONS.find((item) => item.id === id);
          if (!reaction) {
            return null;
          }
          return (
            <motion.button
              key={id}
              layout={true}
              type="button"
              initial={{
                scale: 0.3,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.3,
                opacity: 0,
              }}
              transition={SPRING}
              onClick={() => onToggle(id)}
              aria-label={`Remove ${reaction.label} reaction`}
              className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-[600]"
              style={{
                background: "rgba(255,255,255,.06)",
                boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
                color: COLORS.ink,
              }}
            >
              <Icon
                name={reaction.icon}
                size={14}
                style={{
                  color: REACTION_COLORS[id],
                }}
              />
              1
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  ) : null;
}

type MessageActionsProps = {
  msg: Msg;
  onCopy: () => void;
  onRetry?: () => void;
  onReact: (emoji: string) => void;
  align?: "left" | "right";
};

function MessageActions({ msg, onCopy, onRetry, onReact, align }: MessageActionsProps) {
  const hydrated = useHydrated();
  const [copied, setCopied] = useState(false);
  const [picking, setPicking] = useState(false);
  const reactButton = useRef<HTMLButtonElement>(null);
  return (
    <div
      className={`flex items-center gap-0.5 transition-opacity duration-150 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/m:opacity-100 [@media(hover:hover)]:group-hover/m:opacity-100 ${align === "right" ? "justify-end" : ""} ${picking ? "!opacity-100" : ""}`}
    >
      <BubbleAction
        icon={copied ? "ph:check-bold" : "ph:copy"}
        label={copied ? "Copied" : "Copy message"}
        active={copied}
        onClick={() => {
          onCopy();
          setCopied(true);
          setTimeout(() => setCopied(false), 1300);
        }}
      />
      {onRetry && <BubbleAction icon="ph:arrow-clockwise" label="Retry" onClick={onRetry} />}
      <BubbleAction
        icon="ph:smiley"
        label="Add a reaction"
        onClick={() => setPicking((open) => !open)}
        btnRef={reactButton}
        active={picking}
      />
      <ReactionPicker
        open={picking}
        onClose={() => setPicking(false)}
        anchor={reactButton}
        onPick={onReact}
        mine={msg.reactions ?? []}
      />
      <span
        className="ml-1.5 text-[11.5px] tabular-nums"
        style={{
          color: COLORS.faint,
        }}
      >
        {hydrated ? formatTime(msg.at) : null}
      </span>
    </div>
  );
}

type MessageBubbleProps = {
  msg: Msg;
  agent?: Agent;
  names: Names;
  /** In a group thread each agent's messages carry its name. */
  group: boolean;
  /** False when this message continues the one before it from the same sender. */
  showHead: boolean;
  onCopy: (msg: Msg) => void;
  /** Offered on the latest reply only. */
  onRetry?: (msg: Msg) => void;
  onReact: (msg: Msg, emoji: string) => void;
  onAgent: (id: string) => void;
};

export const MessageBubble = memo(function MessageBubble({
  msg,
  agent,
  names,
  group,
  showHead,
  onCopy,
  onRetry,
  onReact,
  onAgent,
}: MessageBubbleProps) {
  return msg.from === "me" ? (
    <motion.div
      layout="position"
      initial={{
        opacity: 0,
        y: 14,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={SPRING_SOFT}
      className="group/m flex flex-col items-end pt-4"
    >
      <div
        className="max-w-[min(520px,86%)] rounded-[20px] rounded-br-[7px] px-4 py-2.5 text-[14.5px] leading-[1.55]"
        style={{
          background: "linear-gradient(180deg,#26262C,#212126)",
          color: COLORS.ink,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,.06), inset 0 0 0 1px ${COLORS.line}`,
        }}
      >
        {msg.voice && (
          <span
            className="mb-1 flex items-center gap-1.5 text-[11.5px] font-[550]"
            style={{
              color: COLORS.soft,
            }}
          >
            <Icon name="ph:waveform" size={13} />
            Voice message
          </span>
        )}
        <Mentions text={msg.text} names={names} />
      </div>
      <ReactionList list={msg.reactions ?? []} onToggle={(emoji) => onReact(msg, emoji)} />
      <div className="mt-1">
        <MessageActions msg={msg} align="right" onCopy={() => onCopy(msg)} onReact={(emoji) => onReact(msg, emoji)} />
      </div>
    </motion.div>
  ) : agent ? (
    <motion.div
      layout="position"
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={SPRING_SOFT}
      className={`group/m relative flex gap-3 ${showHead ? "pt-5" : "pt-2"}`}
    >
      <div className="w-[34px] shrink-0">
        {showHead && (
          <button
            type="button"
            onClick={() => onAgent(agent.id)}
            aria-label={`Edit ${agent.name}`}
            className="rounded-full transition-transform hover:scale-105 active:scale-95"
          >
            <AgentFace
              shape={agent.shape}
              color={agent.color}
              eyes={agent.eyes}
              size={34}
              mood={msg.streaming ? "talking" : "idle"}
              seed={agent.id}
            />
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {showHead && (
          <div className="mb-1 flex items-baseline gap-2">
            <span
              className="text-[13.5px] font-[650]"
              style={{
                color: group ? tint(agent.color) : COLORS.ink,
              }}
            >
              {agent.name}
            </span>
            <span
              className="truncate text-[12px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {agent.role}
            </span>
          </div>
        )}
        {msg.streaming ? <StreamedText msg={msg} names={names} /> : <RichText text={msg.text} names={names} />}
        <ReactionList list={msg.reactions ?? []} onToggle={(emoji) => onReact(msg, emoji)} />
        {!msg.streaming && (
          <div className="-ml-1.5 mt-1">
            <MessageActions
              msg={msg}
              align="left"
              onCopy={() => onCopy(msg)}
              onRetry={onRetry ? () => onRetry(msg) : undefined}
              onReact={(emoji) => onReact(msg, emoji)}
            />
          </div>
        )}
      </div>
    </motion.div>
  ) : null;
});

export function TypingRow({ agent, group }: { agent: Agent; group: boolean }) {
  return (
    <motion.div
      layout={true}
      initial={{
        opacity: 0,
        y: 10,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.96,
        transition: {
          duration: 0.15,
        },
      }}
      transition={SPRING_SOFT}
      className="flex items-center gap-3 pt-5"
      role="status"
      aria-live="polite"
    >
      <AgentFace shape={agent.shape} color={agent.color} eyes={agent.eyes} size={34} mood="thinking" seed={agent.id} />
      <div
        className="flex items-center gap-2 rounded-full py-1.5 pl-3 pr-3.5"
        style={{
          background: "rgba(255,255,255,.04)",
          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
        }}
      >
        <span className="flex gap-[3px]">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="hd-dot size-[5px] rounded-full"
              style={{
                background: tint(agent.color),
                animationDelay: `${dot * 0.15}s`,
              }}
            />
          ))}
        </span>
        <span className="hd-shimmer text-[13px] font-[550]">{group ? `${agent.name} is thinking` : "Thinking"}</span>
      </div>
    </motion.div>
  );
}
