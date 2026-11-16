"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { AgentFace } from "./agent-face";
import { ME } from "./data";
import { formatTime, plainText } from "./message";
import { COLORS, FONT_SANS, SPRING } from "./theme";
import { Avatar, AvatarStack, Icon, Logo, Menu, useHydrated } from "./ui";
import type { SettingsTab } from "./data";
import type { Agent, Thread } from "./types";

export const joinNames = (agents: Agent[]) =>
  agents.length < 2
    ? agents.map((agent) => agent.name).join("")
    : `${agents
        .slice(0, -1)
        .map((agent) => agent.name)
        .join(", ")} and ${agents[agents.length - 1].name}`;

type ThreadRowProps = {
  thread: Thread;
  agents: Agent[];
  active: boolean;
  onOpen: (id: string) => void;
};

function ThreadRow({ thread, agents, active, onOpen }: ThreadRowProps) {
  const hydrated = useHydrated();
  const last = thread.msgs[thread.msgs.length - 1];
  const busyAgent = agents.find((agent) => thread.busy.includes(agent.id));
  const first = agents[0];
  const title = thread.kind === "group" ? (thread.title ?? joinNames(agents)) : first == null ? undefined : first.name;
  return (
    <button
      type="button"
      onClick={() => onOpen(thread.id)}
      aria-current={active ? "true" : undefined}
      className="group/r relative flex w-full items-center gap-3 rounded-[13px] px-2.5 py-2 text-left"
    >
      {active && (
        <motion.span
          layoutId="row-active"
          transition={SPRING}
          className="absolute inset-0 rounded-[13px]"
          style={{
            background: "rgba(255,255,255,.065)",
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
          }}
        />
      )}
      <span
        className="absolute inset-0 rounded-[13px] opacity-0 transition-opacity group-hover/r:opacity-100"
        style={{
          background: "rgba(255,255,255,.03)",
        }}
      />
      <span className="relative grid w-[44px] shrink-0 place-items-center">
        {thread.kind === "group" ? (
          <AvatarStack agents={agents} size={22} />
        ) : (
          first && (
            <AgentFace
              shape={first.shape}
              color={first.color}
              eyes={first.eyes}
              size={36}
              mood={busyAgent ? "thinking" : "idle"}
              seed={first.id}
            />
          )
        )}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span
            className="min-w-0 flex-1 truncate text-[14px] font-[600]"
            style={{
              color: COLORS.ink,
            }}
          >
            {title}
          </span>
          {last && (
            <span
              className="shrink-0 text-[11.5px] tabular-nums"
              style={{
                color: thread.unread ? COLORS.acc : COLORS.soft,
              }}
            >
              {hydrated ? relativeDay(last.at) : null}
            </span>
          )}
        </span>
        <span className="mt-[1px] flex items-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={busyAgent ? "busy" : ((last == null ? undefined : last.id) ?? "none")}
              initial={{
                opacity: 0,
                y: 4,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -4,
              }}
              transition={{
                duration: 0.18,
              }}
              className={`min-w-0 flex-1 truncate text-[13px] ${busyAgent ? "hd-shimmer font-[500]" : ""}`}
              style={
                busyAgent
                  ? undefined
                  : {
                      color: COLORS.soft,
                    }
              }
            >
              {busyAgent
                ? thread.kind === "group"
                  ? `${busyAgent.name} is thinking...`
                  : "Thinking..."
                : last
                  ? `${last.from === "me" ? "You: " : thread.kind === "group" ? `${agents.find((agent) => agent.id === last.from)?.name ?? ""}: ` : ""}${plainText(last.text)}`
                  : "No messages yet"}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence>
            {thread.unread > 0 && !active && (
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
                className="grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-[700] tabular-nums"
                style={{
                  background: COLORS.acc,
                  color: COLORS.accInk,
                }}
              >
                {thread.unread}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </span>
    </button>
  );
}

const relativeDay = (at: number) => {
  const date = new Date(at);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return formatTime(at);
  }
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  return date.toDateString() === yesterday.toDateString()
    ? "Yesterday"
    : date.toLocaleDateString("en-GB", {
        weekday: "short",
      });
};

type SideButtonProps = {
  icon: string;
  label: string;
  onClick: () => void;
  btnRef?: RefObject<HTMLButtonElement | null>;
  expanded?: boolean;
};

function SideButton({ icon, label, onClick, btnRef, expanded }: SideButtonProps) {
  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      aria-haspopup={expanded != null ? "menu" : undefined}
      aria-expanded={expanded}
      className="flex h-9 w-full items-center gap-3 rounded-[11px] px-2.5 text-[13.5px] font-[500] transition-colors hover:bg-white/[.045]"
      style={{
        color: COLORS.text,
      }}
    >
      <Icon name={icon} size={17} />
      {label}
    </button>
  );
}

type SidebarProps = {
  agents: Agent[];
  threads: Thread[];
  active: string;
  onOpen: (id: string) => void;
  onNewAgent: () => void;
  onHuddle: () => void;
  onSettings: (tab?: SettingsTab) => void;
  notify: (text: string) => void;
  /** Shown on phones, where the sidebar is a drawer. */
  onClose?: () => void;
  searchRef: RefObject<HTMLInputElement | null>;
};

export function Sidebar({
  agents,
  threads,
  active,
  onOpen,
  onNewAgent,
  onHuddle,
  onSettings,
  notify,
  onClose,
  searchRef,
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<"new" | "help" | "acct" | null>(null);
  const newButton = useRef<HTMLButtonElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const helpButton = useRef<HTMLButtonElement>(null);
  const byId = useMemo(() => Object.fromEntries(agents.map((agent) => [agent.id, agent])), [agents]);
  const needle = query.trim().toLowerCase();
  const matches = (thread: Thread) => {
    if (!needle) {
      return true;
    }
    const members = thread.agents.map((id) => byId[id]).filter(Boolean);
    return (
      (thread.title ?? "").toLowerCase().includes(needle) ||
      members.some((agent) => agent.name.toLowerCase().includes(needle) || agent.role.toLowerCase().includes(needle)) ||
      thread.msgs.some((msg) => msg.text.toLowerCase().includes(needle))
    );
  };
  const groups = threads.filter((thread) => thread.kind === "group" && matches(thread));
  const dms = threads.filter((thread) => thread.kind === "dm" && byId[thread.agents[0]] && matches(thread));
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2.5 px-4">
        <Logo />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-[650] tracking-[-0.02em]">Huddle</span>
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="grid size-8 place-items-center rounded-[10px] hover:bg-white/[.06]"
            style={{
              color: COLORS.text,
            }}
          >
            <Icon name="ph:x" size={17} />
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 px-3 pb-3">
        <label
          className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[11px] px-2.5 transition-shadow"
          style={{
            background: COLORS.raise,
            boxShadow: `inset 0 0 0 1px ${showAll ? "rgba(255,255,255,.2)" : COLORS.line}`,
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
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setShowAll(true)}
            onBlur={() => setShowAll(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
                event.currentTarget.blur();
              }
            }}
            placeholder="Search"
            aria-label="Search agents and huddles"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-[#7C7C86] focus-visible:outline-none"
          />
          {!query && (
            <kbd
              className="hidden rounded-[5px] px-1.5 text-[11px] sm:block"
              style={{
                fontFamily: FONT_SANS,
                color: COLORS.soft,
                boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
              }}
            >
              ⌘K
            </kbd>
          )}
        </label>
        <button
          type="button"
          onClick={() => onSettings("market")}
          aria-label="Agent marketplace"
          title="Marketplace"
          className="grid size-9 shrink-0 place-items-center rounded-[11px] transition-colors hover:bg-white/[.06]"
          style={{
            background: COLORS.raise,
            color: COLORS.text,
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
          }}
        >
          <Icon name="ph:storefront" size={17} />
        </button>
        <motion.button
          ref={newButton}
          type="button"
          whileTap={{
            scale: 0.9,
          }}
          onClick={() => setMenuFor(menuFor === "new" ? null : "new")}
          aria-haspopup="menu"
          aria-expanded={menuFor === "new"}
          aria-label="New"
          className="grid size-9 shrink-0 place-items-center rounded-[11px]"
          style={{
            background: COLORS.acc,
            color: COLORS.accInk,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 4px 14px -4px rgba(212,242,106,.5)",
          }}
        >
          <motion.span
            animate={{
              rotate: menuFor === "new" ? 45 : 0,
            }}
            transition={SPRING}
            className="grid place-items-center"
          >
            <Icon name="ph:plus-bold" size={16} />
          </motion.span>
        </motion.button>
        <Menu
          open={menuFor === "new"}
          onClose={() => setMenuFor(null)}
          anchor={newButton}
          placement="bottom-end"
          width={280}
          label="New"
          items={[
            {
              id: "agent",
              label: "New agent",
              desc: "Give it a face, a name and a job",
              icon: "ph:smiley",
              onSelect: onNewAgent,
            },
            {
              id: "huddle",
              label: "Start a huddle",
              desc: "Put 2 to 4 agents in one chat",
              icon: "ph:users-three",
              onSelect: onHuddle,
            },
            {
              id: "market",
              label: "Browse marketplace",
              desc: "Add agents other teams have built",
              icon: "ph:storefront",
              onSelect: () => onSettings("market"),
            },
          ]}
        />
      </div>
      <nav aria-label="Conversations" className="hd-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <LayoutGroup id="rows">
          {groups.length > 0 && (
            <p
              className="px-2.5 pb-1 pt-1 text-[12px] font-[550]"
              style={{
                color: COLORS.soft,
              }}
            >
              Huddles
            </p>
          )}
          {groups.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              agents={thread.agents.map((id) => byId[id]).filter(Boolean)}
              active={thread.id === active}
              onOpen={onOpen}
            />
          ))}
          {dms.length > 0 && (
            <p
              className="px-2.5 pb-1 pt-4 text-[12px] font-[550]"
              style={{
                color: COLORS.soft,
              }}
            >
              Agents
            </p>
          )}
          {dms.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              agents={[byId[thread.agents[0]]]}
              active={thread.id === active}
              onOpen={onOpen}
            />
          ))}
          {!groups.length && !dms.length && (
            <p
              className="px-3 py-8 text-center text-[13px]"
              style={{
                color: COLORS.soft,
              }}
            >
              Nothing matches &ldquo;{query}&rdquo;.
            </p>
          )}
        </LayoutGroup>
      </nav>
      <div
        className="shrink-0 space-y-0.5 border-t px-2 pb-2 pt-2"
        style={{
          borderColor: COLORS.line,
        }}
      >
        <SideButton
          icon="ph:lifebuoy"
          label="Support"
          onClick={() => setMenuFor(menuFor === "help" ? null : "help")}
          btnRef={helpButton}
          expanded={menuFor === "help"}
        />
        <Menu
          open={menuFor === "help"}
          onClose={() => setMenuFor(null)}
          anchor={helpButton}
          placement="top-start"
          width={260}
          label="Support"
          items={[
            {
              id: "docs",
              label: "Help centre",
              desc: "Guides for agents and huddles",
              icon: "ph:book-open",
              onSelect: () => notify("Help centre opens in a new tab"),
            },
            {
              id: "keys",
              label: "Keyboard shortcuts",
              desc: "⌘K search, Enter send, Esc close",
              icon: "ph:keyboard",
              onSelect: () => notify("⌘K search · Enter send · Shift+Enter new line · Esc close"),
            },
            {
              id: "chat",
              label: "Talk to a person",
              desc: "Usually replies in 5 minutes",
              icon: "ph:chat-circle-dots",
              onSelect: () => notify("A support conversation has started"),
            },
          ]}
        />
        <SideButton icon="ph:gear-six" label="Settings" onClick={() => onSettings("workspace")} />
        <button
          ref={accountButton}
          type="button"
          onClick={() => setMenuFor(menuFor === "acct" ? null : "acct")}
          aria-haspopup="menu"
          aria-expanded={menuFor === "acct"}
          className="mt-1 flex w-full items-center gap-2.5 rounded-[12px] p-2 text-left transition-colors hover:bg-white/[.045]"
          style={{
            background: menuFor === "acct" ? "rgba(255,255,255,.05)" : undefined,
          }}
        >
          <Avatar name={ME} size={32} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-[600]">{ME}</span>
            <span
              className="block truncate text-[12px]"
              style={{
                color: COLORS.soft,
              }}
            >
              Juniper Product
            </span>
          </span>
          <Icon
            name="ph:caret-up-down"
            size={14}
            style={{
              color: COLORS.soft,
            }}
          />
        </button>
        <Menu
          open={menuFor === "acct"}
          onClose={() => setMenuFor(null)}
          anchor={accountButton}
          placement="top-start"
          width={268}
          label="Account"
          header={
            <div className="flex items-center gap-2.5 px-2.5 pb-2.5 pt-1.5">
              <Avatar name={ME} size={34} />
              <span className="min-w-0">
                <span className="block text-[13.5px] font-[600]">{ME}</span>
                <span
                  className="block truncate text-[12px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  ines@juniper.example
                </span>
              </span>
            </div>
          }
          items={[
            {
              id: "w1",
              label: "Juniper Product",
              desc: "8 agents, 5 people",
              iconNode: <Logo size={18} />,
              checked: true,
              section: "Workspaces",
            },
            {
              id: "w2",
              label: "Side projects",
              desc: "2 agents, just you",
              icon: "ph:buildings",
              checked: false,
              section: "Workspaces",
              onSelect: () => notify("Side projects is a demo workspace"),
            },
            {
              id: "prof",
              label: "Profile and preferences",
              icon: "ph:user-circle",
              section: "Account",
              onSelect: () => onSettings("workspace"),
            },
            {
              id: "out",
              label: "Sign out",
              icon: "ph:sign-out",
              danger: true,
              section: "Account",
              onSelect: () => notify("Sign-out is turned off in this preview"),
            },
          ]}
        />
      </div>
    </div>
  );
}
