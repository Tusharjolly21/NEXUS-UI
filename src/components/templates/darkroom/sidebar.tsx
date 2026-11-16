"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { PROJECTS, styleName } from "./data";
import { COLORS, EASE, SPRING, formatAgo } from "./theme";
import type { Chat, ImgMap, Theme } from "./types";
import { Avatar, CountUp, Icon, IconButton, Logo, MenuItem, MenuLabel, Popover, Segmented, useDismiss } from "./ui";

type SideButtonProps = { icon: string; label: string; onClick: () => void; hint?: ReactNode };

function SideButton({ icon, label, onClick, hint }: SideButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hov flex h-8 w-full items-center gap-2.5 rounded-[9px] px-2 text-[13.5px] transition-colors"
      style={{
        color: COLORS.text,
      }}
    >
      <Icon name={icon} size={16} />
      <span className="flex-1 text-left">{label}</span>
      {hint}
    </button>
  );
}

type SidebarProps = {
  chats: Chat[];
  active: string;
  setActive: (id: string) => void;
  newChat: () => void;
  openSearch: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  credits: number;
  quick: boolean;
  setQuick: (on: boolean) => void;
  now: number;
};

/** Workspace switcher, new chat and search, chats grouped by project, and the account and settings footer. */
export function Sidebar({
  chats,
  active,
  setActive,
  newChat,
  openSearch,
  theme,
  setTheme,
  credits,
  quick,
  setQuick,
  now,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [menu, setMenu] = useState<"ws" | "help" | "settings" | null>(null);
  const workspaceButton = useRef<HTMLDivElement>(null);
  const accountButton = useRef<HTMLDivElement>(null);
  const [workspace, setWorkspace] = useState("Fieldwork Studio");
  useDismiss(menu !== null, () => setMenu(null), workspaceButton, accountButton);
  return (
    <div
      className="flex h-full flex-col"
      style={{
        background: COLORS.bg,
      }}
    >
      <div ref={workspaceButton} className="relative px-2.5 pt-3">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menu === "ws"}
          onClick={() => setMenu(menu === "ws" ? null : "ws")}
          className="hov flex w-full items-center gap-2.5 rounded-[11px] p-1.5 text-left"
        >
          <Logo size={28} />
          <span className="min-w-0 flex-1">
            <span
              className="block text-[14px] font-[600] tracking-[-0.01em]"
              style={{
                color: COLORS.ink,
              }}
            >
              Darkroom
            </span>
            <span
              className="block truncate text-[12px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {workspace}
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
        <AnimatePresence>
          {menu === "ws" && (
            <Popover className="left-2.5 right-2.5 top-[calc(100%+6px)]" origin="top left">
              <p
                className="px-2.5 pb-1 pt-1.5 text-[11.5px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                Workspaces
              </p>
              {["Fieldwork Studio", "Personal"].map((name) => (
                <MenuItem
                  key={name}
                  icon="ph:buildings"
                  label={name}
                  checked={workspace === name}
                  onClick={() => {
                    setWorkspace(name);
                    setMenu(null);
                  }}
                />
              ))}
            </Popover>
          )}
        </AnimatePresence>
      </div>
      <div className="space-y-0.5 px-2.5 pt-3">
        <SideButton icon="ph:note-pencil" label="New chat" onClick={newChat} hint={<MenuLabel>N</MenuLabel>} />
        <SideButton icon="ph:magnifying-glass" label="Search" onClick={openSearch} hint={<MenuLabel>K</MenuLabel>} />
      </div>
      <div className="thin mt-4 min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">
        <p
          className="px-2 pb-1.5 text-[12px] font-[500]"
          style={{
            color: COLORS.soft,
          }}
        >
          Projects
        </p>
        <LayoutGroup id="side">
          {PROJECTS.map((project) => {
            const projectChats = chats.filter((chat) => chat.project === project.id).sort((a, b) => b.at - a.at);
            const open = !collapsed[project.id];
            return (
              <div key={project.id} className="mb-1">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() =>
                    setCollapsed((prev) => ({
                      ...prev,
                      [project.id]: open,
                    }))
                  }
                  className="hov flex h-8 w-full items-center gap-2 rounded-[9px] px-2 text-[13px] font-[500]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  <motion.span
                    animate={{
                      rotate: open ? 90 : 0,
                    }}
                    transition={SPRING}
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    <Icon name="ph:caret-right" size={11} />
                  </motion.span>
                  <Icon
                    name={open ? "ph:folder-open" : "ph:folder-simple"}
                    size={15}
                    style={{
                      color: COLORS.soft,
                    }}
                  />
                  <span className="flex-1 truncate text-left">{project.name}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
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
                      transition={{
                        duration: 0.25,
                        ease: EASE,
                      }}
                      className="overflow-hidden"
                    >
                      {projectChats.map((projectChat) => (
                        <button
                          key={projectChat.id}
                          type="button"
                          aria-current={projectChat.id === active ? "page" : undefined}
                          onClick={() => setActive(projectChat.id)}
                          className="relative flex h-8 w-full items-center gap-2 rounded-[9px] pl-[30px] pr-2 text-left text-[13px] transition-colors hover:text-[var(--ink)]"
                          style={{
                            color: projectChat.id === active ? COLORS.ink : COLORS.text,
                          }}
                        >
                          {projectChat.id === active && (
                            <motion.span
                              layoutId="side-active"
                              className="absolute inset-0 rounded-[9px]"
                              style={{
                                background: COLORS.raise,
                                boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                              }}
                              transition={SPRING}
                            />
                          )}
                          <span className="relative min-w-0 flex-1 truncate">{projectChat.title}</span>
                          <span
                            className="relative shrink-0 text-[11px] tabular-nums"
                            style={{
                              color: COLORS.soft,
                            }}
                          >
                            {formatAgo(projectChat.at, now)}
                          </span>
                        </button>
                      ))}
                      {projectChats.length === 0 && (
                        <p
                          className="py-1.5 pl-[30px] text-[12px]"
                          style={{
                            color: COLORS.soft,
                          }}
                        >
                          No chats yet
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </LayoutGroup>
      </div>
      <div
        ref={accountButton}
        className="relative space-y-2 px-2.5 pb-3 pt-2"
        style={{
          boxShadow: `0 -1px 0 ${COLORS.line}`,
        }}
      >
        <div className="flex items-center gap-1">
          <div className="flex-1">
            <Segmented
              id="theme"
              label="Theme"
              value={theme}
              onChange={setTheme}
              options={[
                {
                  v: "dark",
                  label: <Icon name="ph:moon" size={14} />,
                  aria: "Dark",
                },
                {
                  v: "light",
                  label: <Icon name="ph:sun" size={14} />,
                  aria: "Light",
                },
              ]}
            />
          </div>
          <IconButton
            icon="ph:keyboard"
            label="Shortcuts"
            active={menu === "help"}
            onClick={() => setMenu(menu === "help" ? null : "help")}
          />
          <IconButton
            icon="ph:gear-six"
            label="Settings"
            active={menu === "settings"}
            onClick={() => setMenu(menu === "settings" ? null : "settings")}
          />
        </div>
        <AnimatePresence>
          {menu === "help" && (
            <Popover className="bottom-[calc(100%-36px)] left-2.5 right-2.5 p-3" origin="bottom center">
              <p
                className="mb-2 text-[13px] font-[600]"
                style={{
                  color: COLORS.ink,
                }}
              >
                Shortcuts
              </p>
              {[
                ["Develop", "Enter"],
                ["New line", "Shift Enter"],
                ["Search", "Ctrl K"],
                ["New chat", "N"],
                ["Focus prompt", "/"],
                ["Next image", "Right"],
                ["Close", "Esc"],
              ].map(([action, keys]) => (
                <div
                  key={action}
                  className="flex items-center justify-between py-1 text-[12.5px]"
                  style={{
                    color: COLORS.text,
                  }}
                >
                  {action}
                  <span className="flex gap-1">
                    {keys.split(" ").map((key) => (
                      <MenuLabel key={key}>{key}</MenuLabel>
                    ))}
                  </span>
                </div>
              ))}
            </Popover>
          )}
          {menu === "settings" && (
            <Popover className="bottom-[calc(100%-36px)] left-2.5 right-2.5 p-3" origin="bottom center">
              <p
                className="mb-2 text-[13px] font-[600]"
                style={{
                  color: COLORS.ink,
                }}
              >
                Settings
              </p>
              <button
                type="button"
                role="switch"
                aria-checked={quick}
                onClick={() => setQuick(!quick)}
                className="flex w-full items-center gap-3 rounded-[9px] py-1.5 text-left"
              >
                <span className="flex-1">
                  <span
                    className="block text-[13px]"
                    style={{
                      color: COLORS.ink,
                    }}
                  >
                    Quick develop
                  </span>
                  <span
                    className="block text-[12px]"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    Shorter develop sequence
                  </span>
                </span>
                <span
                  className="relative h-5 w-9 rounded-full transition-colors"
                  style={{
                    background: quick ? COLORS.acc : COLORS.raise2,
                  }}
                >
                  <motion.span
                    className="absolute top-0.5 size-4 rounded-full bg-white shadow"
                    animate={{
                      left: quick ? 18 : 2,
                    }}
                    transition={SPRING}
                  />
                </span>
              </button>
            </Popover>
          )}
        </AnimatePresence>
        <div
          className="flex items-center gap-2.5 rounded-[12px] p-2"
          style={{
            background: COLORS.panel,
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
          }}
        >
          <Avatar name="Mira Castell" size={30} />
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[13px] font-[500]"
              style={{
                color: COLORS.ink,
              }}
            >
              Mira Castell
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="h-1 flex-1 overflow-hidden rounded-full"
                style={{
                  background: COLORS.raise2,
                }}
              >
                <motion.span
                  className="block h-full rounded-full"
                  style={{
                    background: COLORS.text,
                  }}
                  animate={{
                    width: `${(credits / 500) * 100}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: EASE,
                  }}
                />
              </span>
              <span
                className="text-[11px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                <CountUp value={credits} />
                {" left"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="h-7 rounded-[8px] px-2.5 text-[12px] font-[600] transition-[filter] hover:brightness-110"
            style={{
              background: COLORS.acc,
              color: COLORS.accInk,
            }}
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

type SearchDialogProps = {
  chats: Chat[];
  imgs: ImgMap;
  order: string[];
  onClose: () => void;
  openChat: (id: string) => void;
  openImg: (id: string) => void;
};

type Result = { kind: "chat" | "img"; id: string; title: string; sub: string };

/** Command-K search across chat titles and prints (title, prompt and style), driven by the arrow keys. */
export function SearchDialog({ chats, imgs, order, onClose, openChat, openImg }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const needle = query.trim().toLowerCase();
  const results: Result[] = [
    ...chats
      .filter((chat) => !needle || chat.title.toLowerCase().includes(needle))
      .slice(0, 5)
      .map((chat): Result => ({
        kind: "chat",
        id: chat.id,
        title: chat.title,
        sub: PROJECTS.find((project) => project.id === chat.project)?.name ?? "",
      })),
    ...order
      .map((id) => imgs[id])
      .filter(
        (img) =>
          img &&
          (!needle ||
            img.title.toLowerCase().includes(needle) ||
            img.spec.prompt.toLowerCase().includes(needle) ||
            styleName(img.spec.style).toLowerCase().includes(needle)),
      )
      .slice(0, 6)
      .map((img): Result => ({
        kind: "img",
        id: img.id,
        title: img.title,
        sub: styleName(img.spec.style),
      })),
  ];
  const openResult = (index: number) => {
    const result = results[index];
    if (result) {
      onClose();
      if (result.kind === "chat") {
        openChat(result.id);
      } else {
        openImg(result.id);
      }
    }
  };
  return (
    <motion.div
      className="fixed inset-0 z-[75] flex items-start justify-center px-4 pt-[12vh]"
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
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(8,7,6,.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-label="Search"
        initial={{
          y: -10,
          scale: 0.98,
          opacity: 0,
        }}
        animate={{
          y: 0,
          scale: 1,
          opacity: 1,
        }}
        exit={{
          y: -6,
          scale: 0.98,
          opacity: 0,
        }}
        transition={SPRING}
        className="relative w-full max-w-[560px] overflow-hidden rounded-[16px]"
        style={{
          background: COLORS.panel,
          boxShadow: `0 0 0 1px ${COLORS.line2}, 0 40px 80px -20px rgba(0,0,0,.6)`,
        }}
      >
        <div
          className="flex items-center gap-2.5 px-4"
          style={{
            boxShadow: `0 1px 0 ${COLORS.line}`,
          }}
        >
          <Icon
            name="ph:magnifying-glass"
            size={17}
            style={{
              color: COLORS.soft,
            }}
          />
          <input
            autoFocus={true}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            aria-label="Search chats and prints"
            placeholder="Search chats and prints"
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((prev) => Math.min(results.length - 1, prev + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((prev) => Math.max(0, prev - 1));
              }
              if (event.key === "Enter") {
                openResult(active);
              }
              if (event.key === "Escape") {
                onClose();
              }
            }}
            className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--soft)]"
            style={{
              color: COLORS.ink,
            }}
          />
          <MenuLabel>Esc</MenuLabel>
        </div>
        <div className="thin max-h-[52vh] overflow-y-auto p-1.5">
          {results.length === 0 && (
            <p
              className="px-3 py-8 text-center text-[13px]"
              style={{
                color: COLORS.soft,
              }}
            >
              Nothing matches &ldquo;{query}&rdquo;
            </p>
          )}
          {results.map((result, i) => (
            <button
              key={result.kind + result.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => openResult(i)}
              className="relative flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left"
            >
              {i === active && (
                <motion.span
                  layoutId="search-hi"
                  className="absolute inset-0 rounded-[10px]"
                  style={{
                    background: COLORS.raise,
                  }}
                  transition={SPRING}
                />
              )}
              <span
                className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-[8px]"
                style={{
                  background: COLORS.raise2,
                  color: COLORS.soft,
                }}
              >
                {result.kind === "img" ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a blob URL rendered from a canvas
                  <img src={imgs[result.id].url} alt="" className="size-full object-cover" />
                ) : (
                  <Icon name="ph:chat-circle" size={15} />
                )}
              </span>
              <span className="relative min-w-0 flex-1">
                <span
                  className="block truncate text-[13.5px]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {result.title}
                </span>
                <span
                  className="block truncate text-[12px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {result.sub}
                </span>
              </span>
              {i === active && (
                <span
                  className="relative"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  <Icon name="ph:arrow-elbow-down-left" size={14} />
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
