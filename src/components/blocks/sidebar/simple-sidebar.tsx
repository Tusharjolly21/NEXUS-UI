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
  BarChart2,
  BookOpen,
  Calendar,
  ChevronsUpDown,
  CircleDollarSign,
  Code2,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Settings,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
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

type NavSection = {
  id: string;
  title: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    id: "workspace",
    title: "Workspace",
    items: [
      { id: "home", label: "Home", icon: Home, active: true },
      { id: "inbox", label: "Inbox", icon: Inbox, badge: "4" },
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "analytics", label: "Analytics", icon: BarChart2 },
      { id: "projects", label: "Projects", icon: Zap },
      { id: "team", label: "Team", icon: Users },
      { id: "calendar", label: "Calendar", icon: Calendar },
      { id: "starred", label: "Starred", icon: Star },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    items: [
      { id: "docs", label: "Documentation", icon: BookOpen },
      { id: "api", label: "API reference", icon: Code2 },
      { id: "changelog", label: "Changelog", icon: FileText },
      { id: "support", label: "Support", icon: LifeBuoy },
      { id: "sponsor", label: "Sponsor", icon: CircleDollarSign },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap((section) => section.items);
const INITIAL_ID = ALL_ITEMS.find((item) => item.active)?.id ?? ALL_ITEMS[0].id;

/* -------------------------------------------------------------------------- */
/*  Motion                                                                    */
/* -------------------------------------------------------------------------- */

const HIGHLIGHT: Transition = { type: "spring", stiffness: 500, damping: 32, mass: 0.9 };
const SNAP: Transition = { type: "spring", stiffness: 420, damping: 34 };
const PANEL: Transition = { type: "spring", stiffness: 260, damping: 32 };
const INSTANT: Transition = { duration: 0 };

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
      // Let the first measurement land without animating, then enable springs.
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
/*  Sidebar row                                                               */
/* -------------------------------------------------------------------------- */

function SidebarRow({
  item,
  selected,
  highlightId,
  onSelect,
}: {
  item: NavItem;
  selected: boolean;
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
      aria-current={selected ? "page" : undefined}
      className={cn(
        "relative flex h-7 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[13px] font-medium transition-colors duration-150",
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
      <Icon
        aria-hidden
        strokeWidth={1.75}
        className={cn(
          "relative size-4 shrink-0 transition-colors duration-150",
          selected ? "text-white" : "text-[#0071e3] dark:text-[#2997ff]",
        )}
      />
      <span className="relative min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            "relative text-[12px] tabular-nums transition-colors duration-150",
            selected ? "text-white/80" : "text-[#86868b] dark:text-[#98989d]",
          )}
        >
          {item.badge}
          <span className="sr-only"> unread</span>
        </span>
      )}
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Toolbar title                                                             */
/* -------------------------------------------------------------------------- */

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

export type SimpleSidebarProps = {
  className?: string;
};

export default function SimpleSidebar({ className }: SimpleSidebarProps = {}) {
  const scope = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { compact, ready } = useCompact(rootRef);
  const [selected, setSelected] = React.useState(INITIAL_ID);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const open = compact && menuOpen;
  const current = ALL_ITEMS.find((item) => item.id === selected) ?? ALL_ITEMS[0];

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
          animate={{ x: compact && !menuOpen ? "-110%" : "0%" }}
          transition={ready ? PANEL : INSTANT}
          className={cn(
            "z-30 flex w-[244px] shrink-0 flex-col rounded-[18px] bg-white/70 backdrop-blur-2xl backdrop-saturate-150 dark:bg-[#1c1c1e]/75",
            compact
              ? "absolute inset-y-2 left-2 shadow-[0_0_0_.5px_rgba(0,0,0,.1),0_24px_48px_-20px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_.5px_rgba(255,255,255,.12),0_24px_48px_-20px_rgba(0,0,0,.8)]"
              : "relative my-2 ml-2 shadow-[0_0_0_.5px_rgba(0,0,0,.08),0_8px_24px_-14px_rgba(0,0,0,.18)] dark:shadow-[0_0_0_.5px_rgba(255,255,255,.1)]",
          )}
        >
          <div className="flex items-center gap-2.5 px-4 pb-2 pt-3.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-[#1d1d1f] text-[12px] font-semibold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">
              N
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.01em]">
              Nexus Labs
            </span>
            {compact && (
              <motion.button
                type="button"
                aria-label="Close sidebar"
                whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "grid size-7 place-items-center rounded-full text-[#6e6e73] transition-colors hover:bg-black/[0.05] dark:text-[#a1a1a6] dark:hover:bg-white/[0.08]",
                  focusRing,
                )}
              >
                <X className="size-4" strokeWidth={2} />
              </motion.button>
            )}
          </div>

          <nav
            aria-label="Main"
            className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 [scrollbar-width:none]"
          >
            {SECTIONS.map((section, index) => (
              <div key={section.id} className={index === 0 ? "mt-1" : "mt-4"}>
                <p className="px-2.5 pb-1 text-[11px] font-semibold text-[#86868b] dark:text-[#98989d]">
                  {section.title}
                </p>
                <ul className="flex flex-col gap-px">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <SidebarRow
                        item={item}
                        selected={item.id === selected}
                        highlightId={`${scope}-highlight`}
                        onSelect={() => {
                          setSelected(item.id);
                          setMenuOpen(false);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-black/[0.06] p-2 dark:border-white/[0.08]">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[12px] p-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                focusRing,
              )}
            >
              <Monogram name="Alex Morgan" className="size-8 text-[11px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">Alex Morgan</span>
                <span className="block truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
                  alex@nexuslabs.io
                </span>
              </span>
              <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-[#86868b]" strokeWidth={1.75} />
            </motion.button>
          </div>
        </motion.aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 shrink-0 items-center gap-2 px-4">
            {compact && (
              <motion.button
                type="button"
                aria-label="Show sidebar"
                aria-expanded={menuOpen}
                whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen(true)}
                className={cn(
                  "-ml-1.5 grid size-8 place-items-center rounded-full text-[#1d1d1f] transition-colors hover:bg-black/[0.05] dark:text-[#f5f5f7] dark:hover:bg-white/[0.08]",
                  focusRing,
                )}
              >
                <Menu className="size-[18px]" strokeWidth={1.75} />
              </motion.button>
            )}
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
