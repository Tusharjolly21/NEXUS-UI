"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgentFace } from "./agent-face";
import { EFFORT_LEVELS, MODELS, MODES, PLUGINS, SAMPLE_FILES } from "./data";
import { COLORS, SPRING, SPRING_SOFT } from "./theme";
import { Chip, Icon, Menu, PillButton, Segmented } from "./ui";
import type { Agent, Attachment } from "./types";

/** What the app can do to the composer: drop an @mention in, or put the caret back. */
export type ComposerHandle = {
  insert: (snippet: string) => void;
  focus: () => void;
};

type ComposerProps = {
  placeholder: string;
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  onVoice: () => void;
  /** Who can be @mentioned: the thread's agents in a group, nobody in a DM. */
  members: Agent[];
  /** On narrow phones the model and permission pills drop their labels. */
  compact: boolean;
  notify: (text: string) => void;
};

export const Composer = forwardRef<ComposerHandle, ComposerProps>(function Composer(
  { placeholder, busy, onSend, onStop, onVoice, members, compact, notify },
  ref,
) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [task, setTask] = useState<string | null>(null);
  const [search, setSearch] = useState(false);
  const [plugins, setPlugins] = useState<string[]>([]);
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [effort, setEffort] = useState("High");
  const [modeId, setModeId] = useState("ask");
  const [menu, setMenu] = useState<"plus" | "model" | "perm" | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const goalField = useRef<HTMLInputElement>(null);
  const plusButton = useRef<HTMLButtonElement>(null);
  const modelButton = useRef<HTMLButtonElement>(null);
  const permButton = useRef<HTMLButtonElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      insert: (snippet) => {
        setText((prev) => (prev && !prev.endsWith(" ") ? prev + " " : prev) + snippet);
        setTimeout(() => field.current?.focus(), 0);
      },
      focus: () => field.current?.focus(),
    }),
    [],
  );
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) {
      return;
    }
    el.style.height = "0px";
    const height = Math.ceil(el.scrollHeight) + 1;
    el.style.height = Math.min(200, height) + "px";
    el.style.overflowY = height > 200 ? "auto" : "hidden";
    const mask =
      height > 200 ? "linear-gradient(180deg, transparent 0, #000 18px, #000 calc(100% - 6px), transparent)" : "";
    el.style.maskImage = mask;
    el.style.webkitMaskImage = mask;
  }, [text]);
  const mention = members.length > 1 ? text.match(/(^|\s)@(\w*)$/) : null;
  const matches = mention
    ? members.filter((member) => member.name.toLowerCase().startsWith(mention[2].toLowerCase()))
    : [];
  const pickMention = (agent: Agent) => {
    setText((prev) => prev.replace(/@(\w*)$/, `@${agent.name} `));
    setMentionIndex(0);
    field.current?.focus();
  };
  const send = () => {
    const value = text.trim();
    if (!(!value || busy)) {
      onSend(value);
      setText("");
      setFiles([]);
    }
  };
  const onKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (matches.length) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setMentionIndex((prev) => (prev + 1) % matches.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setMentionIndex((prev) => (prev - 1 + matches.length) % matches.length);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        pickMention(matches[mentionIndex % matches.length]);
        return;
      }
    }
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };
  const modelInfo = MODELS.find((model) => model.id === modelId) ?? MODELS[0];
  const modeInfo = MODES.find((mode) => mode.id === modeId) ?? MODES[0];
  const canSend = !!text.trim() && !busy;
  const pluginTones: Record<string, string> = {
    docs: "#7FB2FF",
    sheets: "#7DDB9A",
    slides: "#F5C26B",
    code: "#C9A8FF",
  };
  return (
    <div className="relative">
      <AnimatePresence>
        {matches.length > 0 && (
          <motion.div
            role="listbox"
            aria-label="Mention an agent"
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 6,
              scale: 0.98,
            }}
            transition={SPRING}
            className="absolute bottom-full left-2 z-30 mb-2 w-[250px] rounded-[14px] p-1.5"
            style={{
              background: "rgba(27,27,32,.96)",
              backdropFilter: "blur(16px)",
              boxShadow: `0 0 0 1px ${COLORS.line2}, 0 16px 40px rgba(0,0,0,.6)`,
            }}
          >
            {matches.map((match, i) => (
              <button
                key={match.id}
                type="button"
                role="option"
                aria-selected={i === mentionIndex % matches.length}
                onMouseEnter={() => setMentionIndex(i)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  pickMention(match);
                }}
                className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left"
                style={{
                  background: i === mentionIndex % matches.length ? "rgba(255,255,255,.07)" : undefined,
                }}
              >
                <AgentFace shape={match.shape} color={match.color} eyes={match.eyes} size={24} shadow={false} />
                <span className="text-[13.5px] font-[600]">{match.name}</span>
                <span
                  className="truncate text-[12px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {match.role}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="rounded-[22px] p-2 transition-shadow duration-200"
        style={{
          background: "linear-gradient(180deg,#18181C,#141417)",
          boxShadow: `inset 0 0 0 1px ${focused ? "rgba(255,255,255,.18)" : COLORS.line2}, inset 0 1px 0 rgba(255,255,255,.05), 0 20px 50px -20px rgba(0,0,0,.8)`,
        }}
      >
        <AnimatePresence initial={false}>
          {(files.length > 0 || task !== null || search || plugins.length > 0) && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={SPRING_SOFT}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 px-1 pb-1 pt-0.5">
                <AnimatePresence initial={false}>
                  {task !== null && (
                    <Chip key="goal" icon="ph:flag-banner" tone={COLORS.acc} onRemove={() => setTask(null)}>
                      <span
                        style={{
                          color: COLORS.text,
                        }}
                      >
                        Goal
                      </span>
                      <input
                        ref={goalField}
                        aria-label="Goal"
                        value={task}
                        onChange={(event) => setTask(event.target.value)}
                        placeholder="What does done look like?"
                        size={Math.max(16, task.length)}
                        className="min-w-0 bg-transparent outline-none placeholder:text-[#80808A] focus-visible:outline-none"
                        style={{
                          color: COLORS.ink,
                        }}
                      />
                    </Chip>
                  )}
                  {search && (
                    <Chip key="plan" icon="ph:list-checks" tone="#9CC8FF" onRemove={() => setSearch(false)}>
                      Plan mode
                    </Chip>
                  )}
                  {plugins.map((pluginId) => {
                    const info = PLUGINS.find((plugin) => plugin.id === pluginId);
                    if (!info) {
                      return null;
                    }
                    return (
                      <Chip
                        key={pluginId}
                        icon={info.icon}
                        tone={pluginTones[pluginId]}
                        onRemove={() => setPlugins((prev) => prev.filter((item) => item !== pluginId))}
                      >
                        {info.name}
                      </Chip>
                    );
                  })}
                  {files.map((file) => (
                    <Chip
                      key={file.id}
                      icon={file.icon}
                      onRemove={() => setFiles((prev) => prev.filter((item) => item.id !== file.id))}
                    >
                      {file.name}
                      <span
                        style={{
                          color: COLORS.soft,
                        }}
                      >
                        {file.size}
                      </span>
                    </Chip>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <textarea
          ref={field}
          value={text}
          rows={1}
          onChange={(event) => {
            setText(event.target.value);
            setMentionIndex(0);
          }}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          aria-label="Message"
          className="hd-noscroll block max-h-[200px] w-full resize-none overflow-y-hidden bg-transparent px-2.5 pb-1 pt-2 text-[15px] leading-[1.5] outline-none placeholder:text-[#7C7C86] focus-visible:outline-none"
          style={{
            color: COLORS.ink,
            minHeight: 34,
          }}
        />
        <div className="mt-1 flex items-center gap-1">
          <PillButton
            ref={plusButton}
            open={menu === "plus"}
            onClick={() => setMenu(menu === "plus" ? null : "plus")}
            label="Add files, goals and plugins"
            className="size-9 justify-center !rounded-full"
            style={{
              boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
            }}
          >
            <motion.span
              animate={{
                rotate: menu === "plus" ? 45 : 0,
              }}
              transition={SPRING}
              className="grid place-items-center"
            >
              <Icon name="ph:plus" size={17} />
            </motion.span>
          </PillButton>
          <Menu
            open={menu === "plus"}
            onClose={() => setMenu(null)}
            anchor={plusButton}
            placement="top-start"
            width={300}
            label="Add"
            items={[
              {
                id: "files",
                label: "Add files",
                desc: "PDFs, sheets, images up to 50 MB",
                icon: "ph:paperclip",
                onSelect: () => {
                  const sample = SAMPLE_FILES[files.length % SAMPLE_FILES.length];
                  setFiles((prev) => [
                    ...prev,
                    {
                      ...sample,
                      id: `${sample.name}-${Date.now()}`,
                    },
                  ]);
                },
              },
              {
                id: "goal",
                label: "Set a goal",
                desc: "The agent keeps working until it's met",
                icon: "ph:flag-banner",
                onSelect: () => {
                  setTask((prev) => prev ?? "Ship Instant Payouts on Thursday");
                  setTimeout(() => goalField.current?.focus(), 60);
                },
              },
              {
                id: "plan",
                label: "Plan mode",
                desc: "Get a plan first, run nothing yet",
                icon: "ph:list-checks",
                check: "toggle",
                checked: search,
                keepOpen: true,
                onSelect: () => setSearch((prev) => !prev),
              },
              ...PLUGINS.slice(0, 4).map((plugin) => ({
                id: plugin.id,
                label: plugin.name,
                desc: plugin.desc,
                icon: plugin.icon,
                section: "Plugins",
                check: "toggle" as const,
                checked: plugins.includes(plugin.id),
                keepOpen: true,
                onSelect: () =>
                  setPlugins((prev) =>
                    prev.includes(plugin.id) ? prev.filter((item) => item !== plugin.id) : [...prev, plugin.id],
                  ),
              })),
            ]}
          />
          <PillButton
            ref={modelButton}
            open={menu === "model"}
            onClick={() => setMenu(menu === "model" ? null : "model")}
            label={`Model: ${modelInfo.name}, effort ${effort}`}
            className="h-9 px-2.5 text-[13px] font-[550]"
          >
            <Icon name={modelInfo.icon} size={15} />
            {!compact && <span>{modelInfo.name}</span>}
            <span
              className="rounded-[6px] px-1.5 py-[1px] text-[11px] font-[600]"
              style={{
                background: "rgba(255,255,255,.07)",
                color: COLORS.text,
              }}
            >
              {effort}
            </span>
            <Icon name="ph:caret-down" size={11} />
          </PillButton>
          <Menu
            open={menu === "model"}
            onClose={() => setMenu(null)}
            anchor={modelButton}
            placement="top-start"
            width={290}
            label="Model"
            items={MODELS.map((model) => ({
              id: model.id,
              label: model.name,
              desc: model.desc,
              icon: model.icon,
              checked: model.id === modelId,
              onSelect: () => setModelId(model.id),
            }))}
            footer={
              <div
                data-nonav={true}
                className="mt-1.5 border-t px-2 pb-1.5 pt-2.5"
                style={{
                  borderColor: COLORS.line,
                }}
              >
                <div
                  className="mb-2 flex items-center justify-between text-[12px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  <span>Effort</span>
                  <span>
                    {effort === "Max"
                      ? "Slowest, most thorough"
                      : effort === "Low"
                        ? "Quick and light"
                        : effort === "Medium"
                          ? "A sensible default"
                          : "Takes time to think"}
                  </span>
                </div>
                <Segmented id="effort" label="Effort" options={EFFORT_LEVELS} value={effort} onChange={setEffort} />
              </div>
            }
          />
          <PillButton
            ref={permButton}
            open={menu === "perm"}
            onClick={() => setMenu(menu === "perm" ? null : "perm")}
            label={`Permissions: ${modeInfo.name}`}
            className="h-9 px-2.5 text-[13px] font-[550]"
            style={
              modeId === "bypass"
                ? {
                    color: COLORS.danger,
                  }
                : undefined
            }
          >
            <Icon name={modeInfo.icon} size={15} />
            {!compact && <span>{modeInfo.name}</span>}
            <Icon name="ph:caret-down" size={11} />
          </PillButton>
          <Menu
            open={menu === "perm"}
            onClose={() => setMenu(null)}
            anchor={permButton}
            placement="top-start"
            width={300}
            label="Permissions"
            items={MODES.map((mode) => ({
              id: mode.id,
              label: mode.name,
              desc: mode.desc,
              icon: mode.icon,
              danger: mode.id === "bypass",
              checked: mode.id === modeId,
              onSelect: () => {
                setModeId(mode.id);
                if (mode.id === "bypass") {
                  notify("Bypass is on. Agents won't ask before acting.");
                }
              },
            }))}
          />
          <div className="flex-1" />
          <motion.button
            type="button"
            onClick={onVoice}
            whileTap={{
              scale: 0.9,
            }}
            aria-label="Talk instead of typing"
            title="Voice"
            className="grid size-9 place-items-center rounded-full transition-colors hover:bg-white/[.06]"
            style={{
              color: COLORS.text,
            }}
          >
            <Icon name="ph:microphone" size={18} />
          </motion.button>
          <AnimatePresence mode="popLayout" initial={false}>
            {busy ? (
              <motion.button
                key="stop"
                type="button"
                onClick={onStop}
                aria-label="Stop"
                initial={{
                  scale: 0.6,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.6,
                  opacity: 0,
                }}
                transition={SPRING}
                className="grid size-9 place-items-center rounded-full"
                style={{
                  background: COLORS.ink,
                  color: "#111",
                }}
              >
                <span className="size-[11px] rounded-[3px] bg-current" />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                type="button"
                onClick={send}
                disabled={!canSend}
                aria-label="Send"
                initial={{
                  scale: 0.6,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.6,
                  opacity: 0,
                }}
                whileTap={
                  canSend
                    ? {
                        scale: 0.88,
                      }
                    : undefined
                }
                transition={SPRING}
                className="grid size-9 place-items-center rounded-full transition-[background,color,box-shadow] duration-200"
                style={{
                  background: canSend ? COLORS.acc : "#2A2A30",
                  color: canSend ? COLORS.accInk : "#6E6E78",
                  boxShadow: canSend
                    ? "0 0 0 4px rgba(212,242,106,.12), 0 6px 18px -4px rgba(212,242,106,.45)"
                    : "none",
                }}
              >
                <Icon name="ph:arrow-up-bold" size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});
