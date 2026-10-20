"use client";

import * as React from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type Transition,
} from "framer-motion";
import {
  BarChart3,
  Check,
  ChevronsUpDown,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  X,
} from "lucide-react";

type IconComponent = React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

export type WorkbenchNavItem = { id: string; label: string; icon: IconComponent; count?: number };
export type WorkbenchProject = { id: string; label: string; color: string };
export type WorkbenchWorkspace = { name: string; plan?: string; color?: string };

export type WorkbenchSidebarProps = {
  /** Workspace shown in the switcher. */
  workspace?: WorkbenchWorkspace;
  /** Other workspaces listed in the switcher menu. The current one is matched by name. */
  workspaces?: WorkbenchWorkspace[];
  /** Called with the workspace picked from the switcher. */
  onWorkspaceChange?: (workspace: WorkbenchWorkspace) => void;
  items?: WorkbenchNavItem[];
  projects?: WorkbenchProject[];
  /** Called by the + next to Projects. */
  onNewProject?: () => void;
  user?: { name: string; email: string };
  /** Usage shown in the meter card, 0–1. Pass `null` to hide the card. */
  usage?: number | null;
  /** Meter caption. */
  usageLabel?: string;
  /** Line under the meter. */
  usageNote?: string;
  activeId?: string;
  defaultActiveId?: string;
  onNavigate?: (id: string) => void;
  /** Start collapsed to an icon rail. */
  defaultCollapsed?: boolean;
  /** Called when the sidebar collapses or expands. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Walks through items, a search and a collapse until someone touches it. */
  autoplay?: boolean;
  className?: string;
};

const ITEMS: WorkbenchNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inbox", label: "Inbox", icon: Inbox, count: 4 },
  { id: "library", label: "Library", icon: Library },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

const PROJECTS: WorkbenchProject[] = [
  { id: "launch", label: "Autumn launch", color: "#ff9f0a" },
  { id: "ds", label: "Design system", color: "#bf5af2" },
  { id: "mobile", label: "Mobile app", color: "#30d158" },
];

const WORKSPACES: WorkbenchWorkspace[] = [
  { name: "Northwind", plan: "Pro plan", color: "linear-gradient(135deg,#5ac8fa,#0071e3)" },
  { name: "Side quests", plan: "Free plan", color: "linear-gradient(135deg,#ffd60a,#ff9f0a)" },
];

const WIDE = 248;
const RAIL = 64;
const DEMO: (string | { q: string } | "collapse" | "expand")[] = [
  "inbox",
  "analytics",
  { q: "a" },
  { q: "an" },
  { q: "" },
  "collapse",
  "expand",
  "launch",
  "overview",
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/** A label that trails the width: each later row starts a touch later, so the column ripples. */
function Trail({
  i,
  collapsed,
  still,
  children,
  className = "",
}: {
  i: number;
  collapsed: boolean;
  still: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={`relative min-w-0 flex-1 truncate text-left ${className}`}
      initial={false}
      animate={collapsed ? { opacity: 0, x: -10, filter: "blur(2px)" } : { opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30, delay: collapsed ? 0 : 0.05 + i * 0.025 }}
      aria-hidden={collapsed}
    >
      {children}
    </motion.span>
  );
}

/**
 * A product sidebar: workspace switcher, a search that filters the list as
 * you type, a highlight that springs between rows, projects, a usage meter
 * and the signed-in user. Collapsing springs the width down to an icon rail
 * while the labels trail after it, one row at a time.
 */
export function WorkbenchSidebar({
  workspace = WORKSPACES[0],
  workspaces = WORKSPACES,
  onWorkspaceChange,
  items = ITEMS,
  projects = PROJECTS,
  onNewProject,
  user = { name: "Ada Park", email: "ada@northwind.co" },
  usage = 0.68,
  usageLabel = "Builds this month",
  usageNote = "Resets in 9 days",
  activeId,
  defaultActiveId = "overview",
  onNavigate,
  defaultCollapsed = false,
  onCollapsedChange,
  autoplay = false,
  className = "",
}: WorkbenchSidebarProps) {
  const still = useReducedMotion() === true;
  const group = React.useId();
  const menuId = React.useId();
  const [internal, setInternal] = React.useState(defaultActiveId);
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [query, setQuery] = React.useState("");
  const [menu, setMenu] = React.useState(false);
  const [current, setCurrent] = React.useState(workspace);
  const active = activeId ?? internal;
  const touched = React.useRef(false);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const rootRef = React.useRef<HTMLElement>(null);

  const go = (id: string) => {
    touched.current = true;
    setInternal(id);
    onNavigate?.(id);
  };
  const setFold = (next: boolean) => {
    setCollapsed(next);
    if (next) setMenu(false);
    onCollapsedChange?.(next);
  };

  const q = query.trim().toLowerCase();
  const shownItems = q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items;
  const shownProjects = q ? projects.filter((p) => p.label.toLowerCase().includes(q)) : projects;

  // Meter: the bar and the number ride the same spring.
  const meter = useSpring(0, { stiffness: 90, damping: 16 });
  const meterWidth = useTransform(meter, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`);
  const meterText = useTransform(meter, (v) => `${Math.round(Math.max(0, Math.min(1, v)) * 100)}%`);
  React.useEffect(() => {
    if (usage === null) return;
    if (still) meter.jump(usage);
    else meter.set(usage);
  }, [usage, still, meter]);

  // ⌘K / Ctrl+K and "/" jump to search.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /input|textarea|select/i.test(e.target.tagName);
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        touched.current = true;
        setCollapsed(false);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !rootRef.current?.querySelector("[data-ws]")?.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [menu]);

  React.useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      const step = DEMO[k++ % DEMO.length];
      if (step === "collapse") setCollapsed(true);
      else if (step === "expand") setCollapsed(false);
      else if (typeof step === "string") setInternal(step);
      else setQuery(step.q);
    }, 1300);
    return () => window.clearInterval(t);
  }, [autoplay]);

  const spring: Transition = still ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 24 };
  const pill: Transition = still ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 34 };
  const focus = "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";
  const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
  const soft = "text-[#6e6e73] dark:text-[#a1a1a6]";

  const onNavKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const rows = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-row]"));
    const i = rows.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    rows[(i + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length]?.focus();
  };

  const row = (on: boolean) =>
    `group relative flex h-8 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-[13.5px] font-medium tracking-[-0.01em] transition-colors ${focus} ${
      on ? ink : `${soft} hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]`
    }`;

  return (
    <motion.aside
      ref={rootRef}
      aria-label="Sidebar"
      initial={false}
      animate={{ width: collapsed ? RAIL : WIDE }}
      transition={spring}
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`relative flex h-full shrink-0 flex-col rounded-[22px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
    >
      {/* Workspace switcher */}
      <div className="relative" data-ws>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menu}
          aria-controls={menu ? menuId : undefined}
          aria-label={collapsed ? `Workspace: ${current.name}` : undefined}
          onClick={() => {
            touched.current = true;
            if (collapsed) setFold(false);
            else setMenu((m) => !m);
          }}
          className={`flex h-11 w-full items-center gap-2.5 overflow-hidden rounded-[12px] px-1.5 text-left transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06] ${focus}`}
        >
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-[9px] text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3)]"
            style={{ background: current.color ?? "linear-gradient(135deg,#5ac8fa,#0071e3)" }}
            aria-hidden
          >
            {current.name[0]?.toUpperCase()}
          </span>
          <Trail collapsed={collapsed} still={still} i={0}>
            <span className={`block truncate text-[13.5px] font-semibold tracking-[-0.01em] ${ink}`}>{current.name}</span>
            {current.plan && <span className={`block truncate text-[11.5px] ${soft}`}>{current.plan}</span>}
          </Trail>
          <motion.span initial={false} animate={{ opacity: collapsed ? 0 : 1 }} className={`shrink-0 ${soft}`} aria-hidden>
            <ChevronsUpDown className="size-3.5" />
          </motion.span>
        </button>
        <AnimatePresence>
          {menu && !collapsed && (
            <motion.div
              id={menuId}
              role="menu"
              aria-label="Switch workspace"
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={still ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}
              className="absolute inset-x-0 top-[calc(100%+4px)] z-20 origin-top rounded-[14px] bg-white p-1 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_18px_36px_-16px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_18px_36px_-16px_rgba(0,0,0,.9)]"
            >
              {workspaces.map((w) => {
                const on = w.name === current.name;
                return (
                  <button
                    key={w.name}
                    type="button"
                    role="menuitemradio"
                    aria-checked={on}
                    onClick={() => {
                      setCurrent(w);
                      setMenu(false);
                      onWorkspaceChange?.(w);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left text-[13px] font-medium ${ink} hover:bg-black/[.04] dark:hover:bg-white/[.06] ${focus}`}
                  >
                    <span className="size-5 shrink-0 rounded-[6px]" style={{ background: w.color ?? "linear-gradient(135deg,#5ac8fa,#0071e3)" }} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{w.name}</span>
                    {on && <Check className="size-3.5 text-[#0071e3] dark:text-[#0a84ff]" aria-hidden />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search */}
      <div className="relative mt-1.5">
        {collapsed ? (
          <button
            type="button"
            aria-label="Search"
            onClick={() => {
              touched.current = true;
              setFold(false);
              requestAnimationFrame(() => searchRef.current?.focus());
            }}
            className={`flex h-8 w-full items-center justify-center rounded-[10px] bg-[#f0f0f3] ${soft} dark:bg-[#2c2c2e] ${focus}`}
          >
            <Search className="size-4" aria-hidden />
          </button>
        ) : (
          <label className="flex h-8 w-full items-center gap-2 rounded-[10px] bg-[#f0f0f3] px-2.5 focus-within:ring-2 focus-within:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-within:ring-[#0a84ff]">
            <Search className={`size-4 shrink-0 ${soft}`} aria-hidden />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                touched.current = true;
                setQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              placeholder="Search"
              aria-label="Search the sidebar"
              className={`min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#86868b] dark:placeholder:text-[#8e8e93] ${ink}`}
            />
            {query ? (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className={`rounded-full ${soft} ${focus}`}>
                <X className="size-3.5" aria-hidden />
              </button>
            ) : (
              <kbd className={`rounded-[5px] bg-white px-1.5 font-sans text-[10.5px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#3a3a3c] ${soft}`}>⌘K</kbd>
            )}
          </label>
        )}
      </div>

      {/* Navigation and projects */}
      <div
        className="mt-2 min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: "linear-gradient(180deg,#000 calc(100% - 16px),transparent)", WebkitMaskImage: "linear-gradient(180deg,#000 calc(100% - 16px),transparent)" }}
      >
        <LayoutGroup id={group}>
          <nav aria-label="Main" onKeyDown={onNavKey}>
            <ul className="space-y-0.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {shownItems.map(({ id, label, icon: Icon, count }, i) => {
                  const on = active === id;
                  return (
                    <motion.li
                      key={id}
                      layout={still ? false : "position"}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={pill}
                    >
                      <button
                        type="button"
                        data-row
                        onClick={() => go(id)}
                        aria-current={on ? "page" : undefined}
                        aria-label={collapsed ? (count ? `${label}, ${count} new` : label) : undefined}
                        title={collapsed ? label : undefined}
                        className={row(on)}
                      >
                        {on && (
                          <motion.span
                            layoutId="active"
                            transition={pill}
                            className="absolute inset-0 rounded-[10px] bg-[#f0f0f3] dark:bg-[#2c2c2e]"
                          />
                        )}
                        <motion.span
                          className={`relative shrink-0 ${on ? "text-[#0071e3] dark:text-[#0a84ff]" : ""}`}
                          animate={on && !still ? { scale: [1, 1.22, 1] } : { scale: 1 }}
                          transition={{ duration: 0.38, ease: [0.3, 1.6, 0.5, 1] }}
                        >
                          <Icon className="size-4" aria-hidden />
                        </motion.span>
                        <Trail collapsed={collapsed} still={still} i={i + 1}>{label}</Trail>
                        {count && !collapsed ? (
                          <span className="relative flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0071e3] px-1.5 text-[11px] font-semibold tabular-nums text-white dark:bg-[#0a84ff]" aria-hidden>
                            {count}
                          </span>
                        ) : null}
                        <AnimatePresence>
                          {count && collapsed ? (
                            <motion.span
                              key="dot"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={still ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 14, delay: 0.15 }}
                              className="absolute right-3 top-1.5 size-2 rounded-full bg-[#0071e3] shadow-[0_0_0_2px_#fff] dark:bg-[#0a84ff] dark:shadow-[0_0_0_2px_#1c1c1e]"
                              aria-hidden
                            />
                          ) : null}
                        </AnimatePresence>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            {shownProjects.length > 0 && (
              <motion.div layout={still ? false : "position"} transition={pill} className="mt-4">
                <div className="flex h-7 items-center justify-between px-2.5">
                  <Trail collapsed={collapsed} still={still} i={items.length + 1} className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#6e6e73] dark:text-[#98989d]">
                    Projects
                  </Trail>
                  {!collapsed && (
                    <button
                      type="button"
                      aria-label="New project"
                      onClick={onNewProject}
                      className={`flex size-6 items-center justify-center rounded-[7px] ${soft} hover:bg-black/[.05] hover:text-[#1d1d1f] dark:hover:bg-white/[.08] dark:hover:text-[#f5f5f7] ${focus}`}
                    >
                      <Plus className="size-3.5" aria-hidden />
                    </button>
                  )}
                </div>
                <ul className="mt-0.5 space-y-0.5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {shownProjects.map((p, i) => {
                      const on = active === p.id;
                      return (
                        <motion.li
                          key={p.id}
                          layout={still ? false : "position"}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={pill}
                        >
                          <button
                            type="button"
                            data-row
                            onClick={() => go(p.id)}
                            aria-current={on ? "page" : undefined}
                            aria-label={collapsed ? p.label : undefined}
                            title={collapsed ? p.label : undefined}
                            className={`${row(on)} font-normal`}
                          >
                            {on && <motion.span layoutId="active" transition={pill} className="absolute inset-0 rounded-[10px] bg-[#f0f0f3] dark:bg-[#2c2c2e]" />}
                            <span className="relative flex size-4 shrink-0 items-center justify-center" aria-hidden>
                              <span className="size-2.5 rounded-[3.5px]" style={{ backgroundColor: p.color }} />
                            </span>
                            <Trail collapsed={collapsed} still={still} i={items.length + 2 + i}>{p.label}</Trail>
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </motion.div>
            )}
            {q && shownItems.length === 0 && shownProjects.length === 0 && !collapsed && (
              <p role="status" className={`px-2.5 py-2 text-[12.5px] ${soft}`}>
                Nothing matches “{query}”.
              </p>
            )}
          </nav>
        </LayoutGroup>
      </div>

      {/* Usage and user */}
      <div className="space-y-1.5 pt-2">
        <AnimatePresence initial={false}>
          {usage !== null && !collapsed && (
            <motion.div
              key="usage"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
              className="overflow-hidden"
            >
              <div className="rounded-[14px] bg-[#f5f5f7] p-3 dark:bg-[#2c2c2e]">
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className={`truncate font-medium ${ink}`}>{usageLabel}</span>
                  <motion.span className={`tabular-nums ${soft}`}>{meterText}</motion.span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]"
                  role="meter"
                  aria-label={usageLabel}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(usage * 100)}
                >
                  <motion.div
                    className={`h-full rounded-full ${usage >= 0.9 ? "bg-[#ff9f0a]" : "bg-[#0071e3] dark:bg-[#0a84ff]"}`}
                    style={{ width: meterWidth }}
                  />
                </div>
                {usageNote && <p className={`mt-1.5 truncate text-[11.5px] ${soft}`}>{usageNote}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex items-center gap-2.5 rounded-[12px] p-1 ${collapsed ? "flex-col" : ""}`}>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#ffb38a,#ff375f)" }}
            aria-hidden
          >
            {initials(user.name)}
          </span>
          {!collapsed && (
            <Trail collapsed={collapsed} still={still} i={items.length + projects.length + 3}>
              <span className={`block truncate text-[13px] font-medium ${ink}`}>{user.name}</span>
              <span className={`block truncate text-[11.5px] ${soft}`}>{user.email}</span>
            </Trail>
          )}
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              setFold(!collapsed);
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={`flex size-8 shrink-0 items-center justify-center rounded-[9px] ${soft} hover:bg-black/[.05] hover:text-[#1d1d1f] dark:hover:bg-white/[.08] dark:hover:text-[#f5f5f7] ${focus}`}
          >
            {collapsed ? <PanelLeftOpen className="size-4" aria-hidden /> : <PanelLeftClose className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
