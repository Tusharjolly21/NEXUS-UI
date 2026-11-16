"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgentFace } from "./agent-face";
import { AGENT_DIRECTORY, EFFORT_LEVELS, MODELS, PLUGINS, PLUGIN_CATEGORIES, TEAM, type SettingsTab } from "./data";
import { COLORS, SPRING, tint } from "./theme";
import { Avatar, Icon, Segmented, Sheet, TextField, Toggle } from "./ui";

function AddButton({ on, onClick, name }: { on: boolean; onClick: () => void; name: string }) {
  return (
    <motion.button
      type="button"
      layout={true}
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? `Remove ${name}` : `Add ${name}`}
      whileTap={{
        scale: 0.92,
      }}
      transition={SPRING}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-3 text-[12.5px] font-[650]"
      style={{
        background: on ? "rgba(255,255,255,.06)" : COLORS.ink,
        color: on ? COLORS.ink : "#111",
        boxShadow: on ? `inset 0 0 0 1px ${COLORS.line2}` : "inset 0 1px 0 #fff",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={on ? "a" : "b"}
          initial={{
            y: 12,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          exit={{
            y: -12,
            opacity: 0,
          }}
          transition={SPRING}
          className="inline-flex items-center gap-1.5"
        >
          <Icon
            name={on ? "ph:check-bold" : "ph:plus-bold"}
            size={12}
            style={{
              color: on ? COLORS.ok : undefined,
            }}
          />
          {on ? "Added" : "Add"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

type SettingsProps = {
  open: boolean;
  tab: SettingsTab;
  setTab: (tab: SettingsTab) => void;
  onClose: () => void;
  /** Directory agents already on the team. */
  added: string[];
  onToggleAgent: (id: string) => void;
  plugins: string[];
  onTogglePlugin: (id: string) => void;
  notify: (text: string) => void;
};

export function Settings({
  open,
  tab,
  setTab,
  onClose,
  added,
  onToggleAgent,
  plugins,
  onTogglePlugin,
  notify,
}: SettingsProps) {
  const [query, setQuery] = useState("");
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [effort, setEffort] = useState("High");
  const [prefs, setPrefs] = useState({
    talk: true,
    summary: false,
    memory: true,
    mentions: true,
  });
  const [workspace, setWorkspace] = useState("Juniper Product");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const agents = AGENT_DIRECTORY.filter(
    (agent) => !query || `${agent.name} ${agent.role} ${agent.desc}`.toLowerCase().includes(query.toLowerCase()),
  );
  const onTabKey = (event: KeyboardEvent, index: number) => {
    const moves =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? -1
          : 0;
    if (!moves) {
      return;
    }
    event.preventDefault();
    const next = (index + moves + PLUGIN_CATEGORIES.length) % PLUGIN_CATEGORIES.length;
    setTab(PLUGIN_CATEGORIES[next].id);
    tabs.current[next]?.focus();
  };
  const row = (key: keyof typeof prefs, label: string, desc: string) => (
    <div className="flex items-center gap-4 py-3.5">
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-[550]">{label}</span>
        <span
          className="mt-0.5 block text-[12.5px] leading-snug"
          style={{
            color: COLORS.soft,
          }}
        >
          {desc}
        </span>
      </span>
      <Toggle
        on={prefs[key]}
        label={label}
        onChange={(on) =>
          setPrefs((prev) => ({
            ...prev,
            [key]: on,
          }))
        }
      />
    </div>
  );
  return (
    <Sheet open={open} onClose={onClose} label="Settings" width={860} full={true}>
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <div
          className="shrink-0 border-b p-3 sm:w-[200px] sm:border-b-0 sm:border-r"
          style={{
            borderColor: COLORS.line,
            background: "#111114",
          }}
        >
          <div className="mb-2 flex items-center justify-between px-2 pt-1 sm:mb-3">
            <span className="text-[15px] font-[650]">Settings</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="grid size-8 place-items-center rounded-[10px] hover:bg-white/[.06] sm:hidden"
              style={{
                color: COLORS.text,
              }}
            >
              <Icon name="ph:x" size={17} />
            </button>
          </div>
          <div
            role="tablist"
            aria-label="Settings sections"
            aria-orientation="vertical"
            className="hd-noscroll flex gap-1 overflow-x-auto sm:flex-col"
          >
            {PLUGIN_CATEGORIES.map((pluginCategory, i) => (
              <button
                key={pluginCategory.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={tab === pluginCategory.id}
                tabIndex={tab === pluginCategory.id ? 0 : -1}
                onKeyDown={(event) => onTabKey(event, i)}
                onClick={() => setTab(pluginCategory.id)}
                className="relative flex h-9 shrink-0 items-center gap-2.5 rounded-[10px] px-2.5 text-[13.5px] font-[550]"
                style={{
                  color: tab === pluginCategory.id ? COLORS.ink : COLORS.text,
                }}
              >
                {tab === pluginCategory.id && (
                  <motion.span
                    layoutId="set-tab"
                    transition={SPRING}
                    className="absolute inset-0 rounded-[10px]"
                    style={{
                      background: "rgba(255,255,255,.07)",
                      boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                    }}
                  />
                )}
                <Icon name={pluginCategory.icon} size={16} className="relative" />
                <span className="relative">{pluginCategory.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="absolute right-3 top-3 z-10 hidden size-9 place-items-center rounded-[11px] hover:bg-white/[.06] sm:grid"
            style={{
              color: COLORS.text,
            }}
          >
            <Icon name="ph:x" size={18} />
          </button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              role="tabpanel"
              aria-label={PLUGIN_CATEGORIES.find((pluginCategory) => pluginCategory.id === tab)?.label}
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
                y: -6,
              }}
              transition={{
                duration: 0.18,
              }}
              className="hd-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5"
            >
              {tab === "market" && (
                <>
                  <h3 className="text-[18px] font-[650] tracking-[-0.02em]">Marketplace</h3>
                  <p
                    className="mt-1 text-[13.5px]"
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    Agents other teams built and shared. Add one and it joins your sidebar.
                  </p>
                  <label
                    className="mt-4 flex h-10 items-center gap-2 rounded-[12px] px-3"
                    style={{
                      background: COLORS.raise,
                      boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                    }}
                  >
                    <Icon
                      name="ph:magnifying-glass"
                      size={15}
                      style={{
                        color: COLORS.soft,
                      }}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search the marketplace"
                      aria-label="Search the marketplace"
                      className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#7C7C86] focus-visible:outline-none"
                    />
                  </label>
                  <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    {agents.map((category) => (
                      <div
                        key={category.id}
                        className="flex flex-col rounded-[16px] p-3.5"
                        style={{
                          background: COLORS.raise,
                          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="grid size-[52px] shrink-0 place-items-center rounded-[14px]"
                            style={{
                              background: `radial-gradient(80% 80% at 50% 30%, ${category.color}26, transparent)`,
                            }}
                          >
                            <AgentFace
                              shape={category.shape}
                              color={category.color}
                              eyes={category.eyes}
                              size={40}
                              seed={category.id}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14.5px] font-[650]">{category.name}</p>
                            <p
                              className="text-[12.5px]"
                              style={{
                                color: tint(category.color),
                              }}
                            >
                              {category.role}
                            </p>
                          </div>
                          <AddButton
                            on={added.includes(category.id)}
                            name={category.name}
                            onClick={() => onToggleAgent(category.id)}
                          />
                        </div>
                        <p
                          className="mt-2.5 text-[13px] leading-[1.5]"
                          style={{
                            color: COLORS.text,
                          }}
                        >
                          {category.desc}
                        </p>
                        <p
                          className="mt-2.5 flex items-center gap-3 text-[12px]"
                          style={{
                            color: COLORS.soft,
                          }}
                        >
                          <span>
                            {"By "}
                            {category.by}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Icon name="ph:download-simple" size={12} />
                            {category.installs}
                          </span>
                        </p>
                      </div>
                    ))}
                    {!agents.length && (
                      <p
                        className="py-8 text-[13px]"
                        style={{
                          color: COLORS.soft,
                        }}
                      >
                        No agents match &ldquo;{query}&rdquo;.
                      </p>
                    )}
                  </div>
                </>
              )}
              {tab === "plugins" && (
                <>
                  <h3 className="text-[18px] font-[650] tracking-[-0.02em]">Plugins</h3>
                  <p
                    className="mt-1 text-[13.5px]"
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    Tools your agents can use. Added plugins show up in the composer&rsquo;s + menu.
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {PLUGINS.map((plugin) => (
                      <div
                        key={plugin.id}
                        className="flex items-center gap-3 rounded-[14px] p-3"
                        style={{
                          background: COLORS.raise,
                          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                        }}
                      >
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-[11px]"
                          style={{
                            background: "rgba(255,255,255,.05)",
                            boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
                          }}
                        >
                          <Icon name={plugin.icon} size={19} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-[600]">{plugin.name}</span>
                          <span
                            className="block truncate text-[12.5px]"
                            style={{
                              color: COLORS.soft,
                            }}
                          >
                            {plugin.desc}
                          </span>
                        </span>
                        <AddButton
                          on={plugins.includes(plugin.id)}
                          name={plugin.name}
                          onClick={() => onTogglePlugin(plugin.id)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {tab === "models" && (
                <>
                  <h3 className="text-[18px] font-[650] tracking-[-0.02em]">Models</h3>
                  <p
                    className="mt-1 text-[13.5px]"
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    The default for new conversations. You can switch per message in the composer.
                  </p>
                  <div role="radiogroup" aria-label="Default model" className="mt-4 space-y-1.5">
                    {MODELS.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        role="radio"
                        aria-checked={modelId === model.id}
                        onClick={() => setModelId(model.id)}
                        className="flex w-full items-center gap-3 rounded-[14px] p-3 text-left transition-colors"
                        style={{
                          background: modelId === model.id ? "rgba(255,255,255,.05)" : "transparent",
                          boxShadow: `inset 0 0 0 1px ${modelId === model.id ? COLORS.line3 : COLORS.line}`,
                        }}
                      >
                        <Icon name={model.icon} size={18} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-[600]">{model.name}</span>
                          <span
                            className="block text-[12.5px]"
                            style={{
                              color: COLORS.soft,
                            }}
                          >
                            {model.desc}
                          </span>
                        </span>
                        <span
                          className="grid size-[18px] place-items-center rounded-full"
                          style={{
                            boxShadow: `inset 0 0 0 1.5px ${modelId === model.id ? COLORS.acc : COLORS.faint}`,
                          }}
                        >
                          {modelId === model.id && (
                            <motion.span
                              layoutId="model-dot"
                              transition={SPRING}
                              className="size-[9px] rounded-full"
                              style={{
                                background: COLORS.acc,
                              }}
                            />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p
                    className="mb-2 mt-6 text-[12.5px] font-[550]"
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    Default effort
                  </p>
                  <div className="max-w-[360px]">
                    <Segmented
                      id="def-effort"
                      label="Default effort"
                      options={EFFORT_LEVELS}
                      value={effort}
                      onChange={setEffort}
                    />
                  </div>
                </>
              )}
              {tab === "workspace" && (
                <>
                  <h3 className="text-[18px] font-[650] tracking-[-0.02em]">Workspace</h3>
                  <div className="mt-4 max-w-[420px]">
                    <TextField id="ws-name" label="Workspace name" value={workspace} onChange={setWorkspace} />
                  </div>
                  <div className="mt-3 [&>*+*]:border-t [&>*+*]:border-white/[.07]">
                    {row(
                      "talk",
                      "Agents can talk to each other",
                      "In huddles, agents reply to and @mention one another.",
                    )}
                    {row("mentions", "Mention suggestions", "Typing @ in a huddle suggests who to ask.")}
                    {row("memory", "Remember across conversations", "Agents keep notes about your product and team.")}
                    {row("summary", "Post huddle summaries", "Send a summary to #launch when a huddle goes quiet.")}
                  </div>
                  <button
                    type="button"
                    onClick={() => notify("Workspace saved")}
                    className="mt-4 h-10 rounded-full px-5 text-[14px] font-[650]"
                    style={{
                      background: COLORS.ink,
                      color: "#111",
                    }}
                  >
                    Save changes
                  </button>
                </>
              )}
              {tab === "members" && (
                <>
                  <h3 className="text-[18px] font-[650] tracking-[-0.02em]">Members</h3>
                  <p
                    className="mt-1 text-[13.5px]"
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    People who can talk to this workspace&rsquo;s agents.
                  </p>
                  <div className="mt-4 space-y-1">
                    {TEAM.map((agent) => (
                      <div key={agent.name} className="flex items-center gap-3 rounded-[12px] px-2 py-2.5">
                        <Avatar name={agent.name} size={36} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-[600]">{agent.name}</span>
                          <span
                            className="block text-[12.5px]"
                            style={{
                              color: COLORS.soft,
                            }}
                          >
                            {agent.role}
                          </span>
                        </span>
                        <span
                          className="rounded-full px-2.5 py-1 text-[12px] font-[550]"
                          style={{
                            background: agent.tag === "Owner" ? COLORS.accSoft : "rgba(255,255,255,.05)",
                            color: agent.tag === "Owner" ? COLORS.acc : COLORS.text,
                          }}
                        >
                          {agent.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => notify("Invite link copied")}
                    className="mt-3 inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-[600]"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
                      color: COLORS.ink,
                    }}
                  >
                    <Icon name="ph:link-simple" size={15} />
                    Copy invite link
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Sheet>
  );
}
