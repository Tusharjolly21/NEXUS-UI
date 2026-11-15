"use client";

import { useRef, useState, type Dispatch, type MouseEvent, type SetStateAction } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ME, NAV } from "./data";
import { useDismiss } from "./hooks";
import { COLORS, SPRING, SPRING_SOFT } from "./theme";
import { Avatar, Dropdown, Icon, IconButton, InitialsAvatar, Kbd, MenuItem, RollingText } from "./ui";
import type { Notification, Theme, ToastFn } from "./types";

function Logo({ size = 26 }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[8px]"
      style={{
        width: size,
        height: size,
        background: COLORS.btn,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 1px 2px rgba(0,0,0,.3)",
      }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.66} height={size * 0.66} fill="none" aria-hidden={true}>
        <circle cx="12" cy="12" r="8.2" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" />
        <path
          d="M12 3.8c-3.2 2.4-4.6 5.2-4.6 8.2s1.4 5.8 4.6 8.2"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <circle cx="12" cy="12" r="2.1" fill="#fff" />
      </svg>
    </span>
  );
}

function ThemeToggle({ theme, toggle }: { theme: Theme; toggle: (event: MouseEvent, to: Theme) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className="relative grid grid-cols-2 rounded-[11px] p-[3px]"
      style={{
        background: COLORS.well,
      }}
    >
      {(["light", "dark"] as const).map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={theme === option}
          onClick={(event) => theme !== option && toggle(event, option)}
          className="relative flex h-[28px] items-center justify-center gap-1.5 rounded-[8px] text-[12.5px] font-[530]"
          style={{
            color: theme === option ? COLORS.ink : COLORS.soft,
          }}
        >
          {theme === option && (
            <motion.span
              layoutId="theme-pill"
              className="absolute inset-0 rounded-[8px]"
              style={{
                background: "var(--seg)",
                boxShadow: "var(--seg-shadow)",
              }}
              transition={SPRING}
            />
          )}
          <motion.span
            className="relative grid"
            animate={{
              rotate: theme === option ? 0 : option === "light" ? -40 : 40,
            }}
            transition={SPRING_SOFT}
          >
            <Icon name={option === "light" ? "ph:sun" : "ph:moon"} size={14} />
          </motion.span>
          <span className="relative">{option === "light" ? "Light" : "Dark"}</span>
        </button>
      ))}
    </div>
  );
}

type SidebarProps = {
  page: string;
  go: (page: string) => void;
  theme: Theme;
  toggleTheme: (event: MouseEvent | null, to?: Theme) => void;
  openPalette: () => void;
  /** Open tasks assigned to you, shown on Board. */
  myOpen: number;
  /** Today's events, shown on Calendar. */
  todayCount: number;
  toast: ToastFn;
};

export function Sidebar({ page, go, theme, toggleTheme, openPalette, myOpen, todayCount, toast }: SidebarProps) {
  const [workspace, setWorkspace] = useState("Fieldnote");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const workspaceButton = useRef(null);
  const accountButton = useRef(null);
  useDismiss(workspaceButton, workspaceOpen, () => setWorkspaceOpen(false));
  useDismiss(accountButton, accountOpen, () => setAccountOpen(false));
  const badges: Record<string, number> = {
    board: myOpen,
    calendar: todayCount,
  };
  const navItem = (item: (typeof NAV)[number]) => {
    const active = page === item.id;
    return (
      <li key={item.id}>
        <button
          type="button"
          onClick={() => go(item.id)}
          aria-current={active ? "page" : undefined}
          className="group/n relative flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-[13.5px] font-[520] transition-colors"
          style={{
            color: active ? COLORS.ink : COLORS.text,
          }}
        >
          {active && (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 rounded-[10px]"
              style={{
                background: COLORS.card,
                boxShadow: "var(--card-shadow)",
              }}
              transition={SPRING}
            />
          )}
          <span
            className="absolute inset-0 rounded-[10px] opacity-0 transition-opacity group-hover/n:opacity-100"
            style={{
              background: active ? "transparent" : "color-mix(in srgb, var(--ink) 4%, transparent)",
            }}
          />

          <Icon
            name={item.icon}
            size={17}
            className="relative"
            style={{
              color: active ? COLORS.accent : COLORS.soft,
            }}
          />

          <span className="relative flex-1 text-left">{item.label}</span>
          {item.soon && (
            <span
              className="relative rounded-[6px] px-1.5 py-[1px] text-[10.5px] font-[560]"
              style={{
                background: COLORS.well,
                color: COLORS.soft,
              }}
            >
              Soon
            </span>
          )}
          {!!badges[item.id] && (
            <span
              className="relative grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[11px] font-[600] tabular-nums"
              style={{
                background: active ? COLORS.accentSoft : COLORS.well,
                color: active ? COLORS.accentInk : COLORS.text,
              }}
            >
              <RollingText text={`${badges[item.id]}`} />
            </span>
          )}
        </button>
      </li>
    );
  };
  return (
    <div className="flex h-full flex-col px-3 pb-3 pt-3">
      <div ref={workspaceButton} className="relative">
        <button
          type="button"
          onClick={() => setWorkspaceOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={workspaceOpen}
          className="md-hov flex w-full items-center gap-2.5 rounded-[12px] p-1.5 pr-2.5 text-left"
        >
          <Logo size={30} />
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-[14px] font-[600] tracking-[-0.01em]"
              style={{
                color: COLORS.ink,
              }}
            >
              {workspace}
            </div>
            <div
              className="truncate text-[12px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {workspace === "Fieldnote" ? "Team plan, 41 members" : "Test data only"}
            </div>
          </div>
          <Icon
            name="ph:caret-up-down"
            size={14}
            style={{
              color: COLORS.soft,
            }}
          />
        </button>
        <Dropdown open={workspaceOpen} className="w-full">
          <div role="menu" aria-label="Workspaces">
            <div
              className="px-2.5 pb-1 pt-1.5 text-[11.5px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {ME.email}
            </div>
            {["Fieldnote", "Fieldnote Sandbox"].map((m) => (
              <MenuItem
                key={m}
                onClick={() => {
                  setWorkspace(m);
                  setWorkspaceOpen(false);
                }}
                active={workspace === m}
                right={
                  workspace === m ? (
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
                <span className="flex items-center gap-2">
                  <InitialsAvatar name={m} size={20} hue={m === "Fieldnote" ? 0 : 4} />
                  {m}
                </span>
              </MenuItem>
            ))}
            <div
              className="my-1 h-px"
              style={{
                background: COLORS.line,
              }}
            />

            <MenuItem
              icon="ph:plus"
              onClick={() => {
                setWorkspaceOpen(false);
                toast("Workspace creation needs an owner role");
              }}
            >
              New workspace
            </MenuItem>
          </div>
        </Dropdown>
      </div>
      <button
        type="button"
        onClick={openPalette}
        className="mt-3 flex h-9 items-center gap-2 rounded-[10px] px-2.5 text-[13px] transition-colors"
        style={{
          background: COLORS.well,
          color: COLORS.soft,
          boxShadow: "inset 0 0 0 1px var(--line)",
        }}
      >
        <Icon name="ph:magnifying-glass" size={15} />
        <span className="flex-1 text-left">Search</span>
        <span className="flex gap-0.5">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <nav className="mt-4" aria-label="Main">
        <LayoutGroup id="nav">
          <ul className="flex flex-col gap-0.5">{NAV.filter((m) => !m.soon).map(navItem)}</ul>
          <div
            className="mb-1.5 mt-5 px-2.5 text-[11.5px] font-[520]"
            style={{
              color: COLORS.soft,
            }}
          >
            In development
          </div>
          <ul className="flex flex-col gap-0.5">{NAV.filter((m) => m.soon).map(navItem)}</ul>
          <ul className="mt-5 flex flex-col gap-0.5">
            {[
              {
                id: "support",
                label: "Support",
                icon: "ph:lifebuoy",
              },
              {
                id: "settings",
                label: "Settings",
                icon: "ph:gear-six",
              },
            ].map((m) =>
              navItem({
                ...m,
              }),
            )}
          </ul>
        </LayoutGroup>
      </nav>
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <ThemeToggle theme={theme} toggle={toggleTheme} />
        <div ref={accountButton} className="relative">
          <button
            type="button"
            onClick={() => setAccountOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            className="md-hov flex w-full items-center gap-2.5 rounded-[12px] p-1.5 text-left"
          >
            <span className="relative">
              <Avatar name={ME.name} size={32} />
              <span
                className="absolute -bottom-px -right-px size-[10px] rounded-full"
                style={{
                  background: COLORS.good,
                  boxShadow: "0 0 0 2px var(--bg)",
                }}
              />
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="truncate text-[13px] font-[560]"
                style={{
                  color: COLORS.ink,
                }}
              >
                {ME.name}
              </div>
              <div
                className="truncate text-[12px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                {ME.role}
              </div>
            </div>
            <Icon
              name="ph:dots-three"
              size={16}
              style={{
                color: COLORS.soft,
              }}
            />
          </button>
          <Dropdown open={accountOpen} className="!bottom-[calc(100%+6px)] !top-auto w-full" origin="bottom left">
            <div role="menu" aria-label="Keyboard shortcuts" className="p-1">
              <div
                className="px-1.5 pb-2 pt-1 text-[12px] font-[560]"
                style={{
                  color: COLORS.ink,
                }}
              >
                Keyboard shortcuts
              </div>
              {(
                [
                  ["Search everything", ["Ctrl", "K"]],
                  ["Move a focused card", ["Alt", "Arrows"]],
                  ["Change month", ["Left", "Right"]],
                  ["Close a panel", ["Esc"]],
                ] as [string, string[]][]
              ).map(([action, keys]) => (
                <div
                  key={action}
                  className="flex items-center justify-between gap-2 px-1.5 py-1.5 text-[12.5px]"
                  style={{
                    color: COLORS.text,
                  }}
                >
                  {action}
                  <span className="flex gap-0.5">
                    {keys.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

export function Notifications({
  notes,
  setNotes,
}: {
  notes: Notification[];
  setNotes: Dispatch<SetStateAction<Notification[]>>;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useDismiss(box, open, () => setOpen(false));
  const unread = notes.filter((note) => note.unread).length;
  return (
    <div ref={box} className="relative">
      <IconButton
        icon="ph:bell"
        label={`Notifications, ${unread} unread`}
        active={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <AnimatePresence>
          {unread > 0 && (
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
              className="absolute right-[3px] top-[3px] grid h-[16px] min-w-[16px] place-items-center rounded-full px-1 text-[10px] font-[650] text-white"
              style={{
                background: COLORS.btn,
                boxShadow: "0 0 0 2px var(--panel)",
              }}
            >
              <RollingText text={`${unread}`} />
            </motion.span>
          )}
        </AnimatePresence>
      </IconButton>
      <Dropdown
        open={open}
        align="right"
        className="w-[372px] !p-0 max-sm:!fixed max-sm:!left-3 max-sm:!right-3 max-sm:!top-[58px] max-sm:!w-auto"
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
          <div
            className="text-[14px] font-[600]"
            style={{
              color: COLORS.ink,
            }}
          >
            Notifications
          </div>
          <button
            type="button"
            onClick={() =>
              setNotes((prev) =>
                prev.map((note) => ({
                  ...note,
                  unread: false,
                })),
              )
            }
            disabled={!unread}
            className="rounded-[6px] px-1 text-[12.5px] font-[520] transition-opacity disabled:opacity-40"
            style={{
              color: COLORS.accentInk,
            }}
          >
            Mark all as read
          </button>
        </div>
        <ul className="max-h-[380px] overflow-y-auto px-1.5 pb-1.5">
          {notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() =>
                  setNotes((prev) =>
                    prev.map((c) =>
                      c.id === note.id
                        ? {
                            ...c,
                            unread: false,
                          }
                        : c,
                    ),
                  )
                }
                className="md-hov flex w-full gap-3 rounded-[12px] px-2.5 py-2.5 text-left"
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-[9px]"
                  style={{
                    background: COLORS.well,
                    color: COLORS.text,
                  }}
                >
                  <Icon name={note.icon} size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block text-[13px] font-[560]"
                    style={{
                      color: note.unread ? COLORS.ink : COLORS.text,
                    }}
                  >
                    {note.title}
                  </span>
                  <span
                    className="block truncate text-[12.5px]"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    {note.body}
                  </span>
                  <span
                    className="mt-0.5 block text-[11.5px]"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    {note.when}
                  </span>
                </span>
                <motion.span
                  className="mt-1.5 size-2 shrink-0 rounded-full"
                  animate={{
                    scale: note.unread ? 1 : 0,
                    opacity: note.unread ? 1 : 0,
                  }}
                  transition={SPRING}
                  style={{
                    background: COLORS.accent,
                  }}
                />
              </button>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
}
