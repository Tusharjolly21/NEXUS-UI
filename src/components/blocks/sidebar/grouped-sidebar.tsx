"use client";

import * as React from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import {
  Archive,
  BarChart2,
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronsUpDown,
  CreditCard,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  PanelLeft,
  Shield,
  Table2,
  TrendingDown,
  TrendingUp,
  UserSquare2,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  active?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  children: NavItem[];
};

const FLAT_TOP: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "inbox", label: "Inbox", icon: Inbox, badge: "6" },
  { id: "notifications", label: "Notifications", icon: Bell, badge: "2" },
];

const NAV_GROUPS: NavGroup[] = [
  {
    id: "platform",
    label: "Platform",
    children: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "analytics", label: "Analytics", icon: BarChart2, active: true },
      { id: "reports", label: "Reports", icon: Table2 },
      { id: "automation", label: "Automation", icon: Zap },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    children: [
      { id: "projects", label: "Projects", icon: FileText },
      { id: "calendar", label: "Calendar", icon: Calendar },
      { id: "archives", label: "Archives", icon: Archive },
      { id: "documents", label: "Documents", icon: BookOpen },
    ],
  },
  {
    id: "team",
    label: "Team",
    children: [
      { id: "members", label: "Members", icon: UserSquare2 },
      { id: "roles", label: "Roles and permissions", icon: Shield },
      { id: "support", label: "Support", icon: LifeBuoy },
      { id: "billing", label: "Billing", icon: CreditCard },
    ],
  },
];

const ALL_ITEMS = [...FLAT_TOP, ...NAV_GROUPS.flatMap((group) => group.children)];
const INITIAL_ID = ALL_ITEMS.find((item) => item.active)?.id ?? ALL_ITEMS[0].id;

const EXPANDED_WIDTH = 256;
const COLLAPSED_WIDTH = 64;

/* -------------------------------------------------------------------------- */
/*  Motion                                                                    */
/* -------------------------------------------------------------------------- */

const HIGHLIGHT: Transition = { type: "spring", stiffness: 500, damping: 32, mass: 0.9 };
const SNAP: Transition = { type: "spring", stiffness: 420, damping: 34 };
const DISCLOSE: Transition = { type: "spring", stiffness: 380, damping: 36 };
const PANEL: Transition = { type: "spring", stiffness: 260, damping: 30 };
const INSTANT: Transition = { duration: 0 };

function labelTransition(collapsed: boolean): Transition {
  return collapsed
    ? { duration: 0.12, ease: [0.4, 0, 1, 1] }
    : { duration: 0.28, delay: 0.08, ease: [0, 0, 0.2, 1] };
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";

/** Switches to the overlay layout when the block itself (not the window) is narrow. */
function useCompact(ref: React.RefObject<HTMLElement | null>, breakpoint = 640) {
  const [state, setState] = React.useState({ compact: false, ready: false });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? el.clientWidth;
      const compact = width < breakpoint;
      setState((prev) => (prev.compact === compact ? prev : { ...prev, compact }));
      if (!frame) {
        frame = requestAnimationFrame(() =>
          setState((prev) => (prev.ready ? prev : { ...prev, ready: true })),
        );
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref, breakpoint]);

  return state;
}

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

function FadeLabel({
  collapsed,
  className,
  children,
}: {
  collapsed: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={false}
      animate={{
        opacity: collapsed ? 0 : 1,
        filter: collapsed && !reduce ? "blur(4px)" : "blur(0px)",
      }}
      transition={labelTransition(collapsed)}
      className={className}
    >
      {children}
    </motion.span>
  );
}

function SidebarRow({
  item,
  selected,
  collapsed,
  highlightId,
  onSelect,
}: {
  item: NavItem;
  selected: boolean;
  collapsed: boolean;
  highlightId: string;
  onSelect: () => void;
}) {
  const Icon = item.icon;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.97 }}
      transition={SNAP}
      title={collapsed ? item.label : undefined}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "relative flex h-7 w-full items-center gap-2.5 overflow-hidden rounded-[10px] pl-[14px] pr-2.5 text-left text-[13px] font-medium transition-colors duration-150",
        focusRing,
        selected
          ? "text-white"
          : "text-[#1d1d1f] hover:bg-black/[0.04] dark:text-[#f5f5f7] dark:hover:bg-white/[0.06]",
      )}
    >
      {selected && (
        <motion.span
          layoutId={highlightId}
          transition={HIGHLIGHT}
          className="absolute inset-0 rounded-[10px] bg-[#0071e3] shadow-[0_1px_2px_rgba(0,0,0,.12),inset_0_.5px_0_rgba(255,255,255,.2)]"
        />
      )}
      <span className="relative shrink-0">
        <Icon
          aria-hidden
          strokeWidth={1.75}
          className={cn(
            "size-4 transition-colors duration-150",
            selected ? "text-white" : "text-[#0071e3] dark:text-[#2997ff]",
          )}
        />
        {item.badge && (
          <motion.span
            aria-hidden
            initial={false}
            animate={{ opacity: collapsed ? 1 : 0, scale: collapsed ? 1 : 0.4 }}
            transition={SNAP}
            className={cn(
              "absolute -right-1 -top-1 size-2 rounded-full ring-2",
              selected
                ? "bg-white ring-[#0071e3]"
                : "bg-[#0071e3] ring-white dark:bg-[#2997ff] dark:ring-[#1c1c1e]",
            )}
          />
        )}
      </span>
      <FadeLabel collapsed={collapsed} className="relative min-w-0 flex-1 whitespace-nowrap">
        {item.label}
      </FadeLabel>
      {item.badge && (
        <FadeLabel
          collapsed={collapsed}
          className={cn(
            "relative shrink-0 text-[12px] tabular-nums transition-colors duration-150",
            selected ? "text-white/80" : "text-[#86868b] dark:text-[#98989d]",
          )}
        >
          {item.badge}
          <span className="sr-only"> unread</span>
        </FadeLabel>
      )}
    </motion.button>
  );
}

function GroupSection({
  group,
  collapsed,
  open,
  onToggle,
  selected,
  highlightId,
  onSelect,
}: {
  group: NavGroup;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  selected: string;
  highlightId: string;
  onSelect: (id: string) => void;
}) {
  const listId = React.useId();
  // When the sidebar is folded to icons every group shows its children.
  const expanded = open || collapsed;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onToggle}
        disabled={collapsed}
        tabIndex={collapsed ? -1 : undefined}
        aria-expanded={expanded}
        aria-controls={listId}
        className={cn(
          "group relative flex h-6 w-full items-center gap-1 rounded-[8px] px-2.5 text-left text-[11px] font-semibold text-[#86868b] transition-colors hover:text-[#1d1d1f] disabled:pointer-events-none dark:text-[#98989d] dark:hover:text-[#f5f5f7]",
          focusRing,
        )}
      >
        <FadeLabel collapsed={collapsed} className="min-w-0 flex-1 whitespace-nowrap">
          {group.label}
        </FadeLabel>
        <FadeLabel collapsed={collapsed} className="shrink-0">
          <motion.span
            aria-hidden
            initial={false}
            animate={{ rotate: open ? 0 : -90 }}
            transition={DISCLOSE}
            className="grid size-4 place-items-center"
          >
            <ChevronDown className="size-3.5" strokeWidth={2} />
          </motion.span>
        </FadeLabel>
        <motion.span
          aria-hidden
          initial={false}
          animate={{ opacity: collapsed ? 1 : 0, scaleX: collapsed ? 1 : 0.3 }}
          transition={SNAP}
          className="absolute left-[14px] top-1/2 h-px w-4 bg-black/[0.12] dark:bg-white/[0.16]"
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            id={listId}
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: DISCLOSE, opacity: { duration: 0.2 } }}
            className="flex flex-col gap-px overflow-hidden"
          >
            {group.children.map((child) => (
              <li key={child.id}>
                <SidebarRow
                  item={child}
                  collapsed={collapsed}
                  selected={child.id === selected}
                  highlightId={highlightId}
                  onSelect={() => onSelect(child.id)}
                />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function SwapTitle({ title }: { title: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-6 min-w-0 flex-1 overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.h2
          key={title}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(6px)" }}
          transition={SNAP}
          className="truncate text-[15px] font-semibold leading-6 tracking-[-0.01em]"
        >
          {title}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Placeholder canvas                                                        */
/* -------------------------------------------------------------------------- */

const REVENUE = [38, 44, 41, 52, 49, 58, 63, 57, 66, 72, 69, 81];
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const STATS = [
  { label: "Revenue", value: "$48,295", delta: "+12.4%", up: true },
  { label: "Active users", value: "3,842", delta: "+4.1%", up: true },
  { label: "Conversion", value: "5.27%", delta: "−0.3%", up: false },
];
const PAGES = [
  ["/pricing", "38%"],
  ["/", "27%"],
  ["/docs/install", "16%"],
  ["/changelog", "9%"],
];
const SIGNUPS = [
  ["Maya Chen", "Team plan"],
  ["Jonas Weber", "Pro trial"],
  ["Ines Duarte", "Team plan"],
];

const card =
  "rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_1px_2px_rgba(0,0,0,.04)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]";

function Monogram({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-[linear-gradient(180deg,#a1a1a6,#86868b)] font-semibold text-white dark:bg-[linear-gradient(180deg,#8e8e93,#636366)]",
        className,
      )}
    >
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")}
    </span>
  );
}

function DashboardCanvas() {
  const reduce = useReducedMotion();
  const max = Math.max(...REVENUE);

  return (
    <div className="@container flex h-full flex-col gap-3 overflow-hidden px-4 pb-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Tuesday, 14 October</p>
          <h3 className="truncate text-[22px] font-semibold leading-[1.1] tracking-[-0.025em]">
            Good morning, Alex
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-[#e8e8ed] px-3 py-1 text-[12px] font-medium dark:bg-[#2c2c2e]">
          Last 12 months
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 @md:gap-3">
        {STATS.map((stat) => {
          const Trend = stat.up ? TrendingUp : TrendingDown;
          return (
            <div key={stat.label} className={cn(card, "min-w-0 p-3")}>
              <p className="truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{stat.label}</p>
              <p className="mt-1 truncate text-[16px] font-semibold tracking-[-0.02em] tabular-nums @md:text-[20px]">
                {stat.value}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
                <Trend
                  aria-hidden
                  strokeWidth={2}
                  className={cn("size-3.5", stat.up ? "text-[#34c759]" : "text-[#ff3b30]")}
                />
                {stat.delta}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 @md:grid-cols-3">
        <div className={cn(card, "flex min-h-0 flex-col p-4 @md:col-span-2")}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold">Monthly revenue</p>
            <p className="text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">$81k in December</p>
          </div>
          <div className="mt-3 flex min-h-[90px] flex-1 items-end gap-1.5">
            {REVENUE.map((v, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <motion.div
                  initial={reduce ? { opacity: 0 } : { scaleY: 0, opacity: 0 }}
                  whileInView={{ scaleY: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ type: "spring", stiffness: 260, damping: 30, delay: i * 0.03 }}
                  className={cn(
                    "w-full origin-bottom rounded-[5px]",
                    i === REVENUE.length - 1 ? "bg-[#0071e3]" : "bg-[#e8e8ed] dark:bg-[#3a3a3c]",
                  )}
                  style={{ height: `${(v / max) * 100}%` }}
                />
                <span className="text-[10px] text-[#86868b] dark:text-[#98989d]">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={cn(card, "hidden min-h-0 flex-col p-4 @md:flex")}>
          <p className="text-[13px] font-semibold">Top pages</p>
          <ul className="mt-3 space-y-2.5 text-[12px]">
            {PAGES.map(([page, share]) => (
              <li key={page} className="flex items-center justify-between gap-2">
                <span className="truncate text-[#1d1d1f] dark:text-[#f5f5f7]">{page}</span>
                <span className="tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{share}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cn(card, "p-4")}>
        <p className="text-[13px] font-semibold">Recent sign-ups</p>
        <ul className="mt-3 grid grid-cols-2 gap-3 text-[12px] @md:grid-cols-3">
          {SIGNUPS.map(([name, plan], i) => (
            <li key={name} className={cn("flex min-w-0 items-center gap-2", i === 2 && "hidden @md:flex")}>
              <Monogram name={name} className="size-7 text-[10px]" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{name}</span>
                <span className="block truncate text-[#6e6e73] dark:text-[#a1a1a6]">{plan}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Block                                                                     */
/* -------------------------------------------------------------------------- */

export type GroupedSidebarProps = {
  className?: string;
  /** Start with the sidebar collapsed to icons. */
  defaultCollapsed?: boolean;
  /** Group ids that start disclosed. */
  defaultOpenGroups?: string[];
};

export default function GroupedSidebar({
  className,
  defaultCollapsed = false,
  defaultOpenGroups = ["platform"],
}: GroupedSidebarProps = {}) {
  const scope = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { compact, ready } = useCompact(rootRef);
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(
    () => new Set(defaultOpenGroups),
  );
  const [selected, setSelected] = React.useState(INITIAL_ID);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isCollapsed = !compact && collapsed;
  const open = compact && menuOpen;
  const current = ALL_ITEMS.find((item) => item.id === selected) ?? ALL_ITEMS[0];
  const highlightId = `${scope}-highlight`;

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function select(id: string) {
    setSelected(id);
    setMenuOpen(false);
  }

  const toggleLabel = compact
    ? "Show sidebar"
    : isCollapsed
      ? "Expand sidebar"
      : "Collapse sidebar";

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        onKeyDown={(event) => {
          if (event.key === "Escape") setMenuOpen(false);
        }}
        className={cn(
          "relative flex h-[560px] w-full overflow-hidden rounded-[22px] bg-[#f5f5f7] text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:bg-black dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
          className,
        )}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              key="scrim"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 z-20 bg-black/20 dark:bg-black/50"
            />
          )}
        </AnimatePresence>

        <motion.aside
          aria-label="Sidebar"
          inert={compact && !menuOpen}
          initial={false}
          animate={{
            width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
            x: compact && !menuOpen ? -(EXPANDED_WIDTH + 24) : 0,
          }}
          transition={ready ? PANEL : INSTANT}
          className={cn(
            "z-30 flex shrink-0 flex-col overflow-hidden rounded-[18px] bg-white/70 backdrop-blur-2xl backdrop-saturate-150 dark:bg-[#1c1c1e]/75",
            compact
              ? "absolute inset-y-2 left-2 shadow-[0_0_0_.5px_rgba(0,0,0,.1),0_24px_48px_-20px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_.5px_rgba(255,255,255,.12),0_24px_48px_-20px_rgba(0,0,0,.8)]"
              : "relative my-2 ml-2 shadow-[0_0_0_.5px_rgba(0,0,0,.08),0_8px_24px_-14px_rgba(0,0,0,.18)] dark:shadow-[0_0_0_.5px_rgba(255,255,255,.1)]",
          )}
        >
          <div className="flex items-center gap-2.5 pb-2 pl-[18px] pr-3 pt-3.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-[#1d1d1f] text-[12px] font-semibold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">
              N
            </span>
            <FadeLabel
              collapsed={isCollapsed}
              className="min-w-0 flex-1 whitespace-nowrap text-[14px] font-semibold tracking-[-0.01em]"
            >
              Nexus Labs
            </FadeLabel>
            {compact && (
              <motion.button
                type="button"
                aria-label="Close sidebar"
                whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-[#6e6e73] transition-colors hover:bg-black/[0.05] dark:text-[#a1a1a6] dark:hover:bg-white/[0.08]",
                  focusRing,
                )}
              >
                <X className="size-4" strokeWidth={2} />
              </motion.button>
            )}
          </div>

          <nav
            aria-label="Main"
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 pb-2 [scrollbar-width:none]"
          >
            <ul className="mt-1 flex flex-col gap-px">
              {FLAT_TOP.map((item) => (
                <li key={item.id}>
                  <SidebarRow
                    item={item}
                    collapsed={isCollapsed}
                    selected={item.id === selected}
                    highlightId={highlightId}
                    onSelect={() => select(item.id)}
                  />
                </li>
              ))}
            </ul>

            {NAV_GROUPS.map((group) => (
              <GroupSection
                key={group.id}
                group={group}
                collapsed={isCollapsed}
                open={openGroups.has(group.id)}
                onToggle={() => toggleGroup(group.id)}
                selected={selected}
                highlightId={highlightId}
                onSelect={select}
              />
            ))}
          </nav>

          <div className="border-t border-black/[0.06] p-2 dark:border-white/[0.08]">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              title={isCollapsed ? "Alex Morgan" : undefined}
              className={cn(
                "flex w-full items-center gap-2.5 overflow-hidden rounded-[12px] p-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                focusRing,
              )}
            >
              <Monogram name="Alex Morgan" className="size-8 text-[11px]" />
              <FadeLabel collapsed={isCollapsed} className="min-w-0 flex-1 whitespace-nowrap">
                <span className="block text-[13px] font-medium">Alex Morgan</span>
                <span className="block text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
                  alex@nexuslabs.io
                </span>
              </FadeLabel>
              <FadeLabel collapsed={isCollapsed} className="shrink-0">
                <ChevronsUpDown aria-hidden className="size-4 text-[#86868b]" strokeWidth={1.75} />
              </FadeLabel>
            </motion.button>
          </div>
        </motion.aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 shrink-0 items-center gap-2 px-4">
            <motion.button
              type="button"
              aria-label={toggleLabel}
              aria-expanded={compact ? menuOpen : !isCollapsed}
              whileTap={{ scale: 0.92 }}
              onClick={() => (compact ? setMenuOpen(true) : setCollapsed((value) => !value))}
              className={cn(
                "-ml-1.5 grid size-8 shrink-0 place-items-center rounded-full text-[#1d1d1f] transition-colors hover:bg-black/[0.05] dark:text-[#f5f5f7] dark:hover:bg-white/[0.08]",
                focusRing,
              )}
            >
              <PanelLeft className="size-[18px]" strokeWidth={1.75} />
            </motion.button>
            <SwapTitle title={current.label} />
          </header>
          <div className="min-h-0 flex-1">
            <DashboardCanvas />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
