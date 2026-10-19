"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart2,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
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
  Users,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  badge?: string;
  active?: boolean;
};

const PRIMARY_NAV: NavItem[] = [
  { label: "Home", icon: <Home className="size-4" />, active: true },
  { label: "Inbox", icon: <Inbox className="size-4" />, badge: "4" },
  { label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { label: "Analytics", icon: <BarChart2 className="size-4" /> },
  { label: "Projects", icon: <Zap className="size-4" /> },
  { label: "Team", icon: <Users className="size-4" /> },
  { label: "Calendar", icon: <Calendar className="size-4" /> },
  { label: "Starred", icon: <Star className="size-4" /> },
  { label: "Settings", icon: <Settings className="size-4" /> },
];

const SECONDARY_NAV: NavItem[] = [
  { label: "Documentation", icon: <BookOpen className="size-4" /> },
  { label: "API Reference", icon: <Code2 className="size-4" /> },
  { label: "Changelog", icon: <FileText className="size-4" /> },
  { label: "Support", icon: <LifeBuoy className="size-4" /> },
  { label: "Sponsor", icon: <CircleDollarSign className="size-4" /> },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <motion.button
      type="button"
      whileHover={{ x: collapsed ? 0 : 3 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      title={collapsed ? item.label : undefined}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        collapsed ? "justify-center px-0" : "",
        item.active
          ? "bg-neutral-100 text-neutral-900 dark:bg-white/10 dark:text-white"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white",
      )}
    >
      <span
        className={cn(
          "relative shrink-0",
          item.active
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-400 dark:text-neutral-500",
        )}
      >
        {item.icon}
        {collapsed && item.badge && (
          <span className="absolute -right-1 -top-1 flex size-3 items-center justify-center rounded-full bg-violet-500 text-[7px] font-bold text-white">
            {item.badge}
          </span>
        )}
      </span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="flex flex-1 items-center overflow-hidden whitespace-nowrap"
          >
            <span className="flex-1 truncate text-left">{item.label}</span>
            {item.badge && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 text-[10px] font-semibold text-white">
                {item.badge}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

const REVENUE = [38, 44, 41, 52, 49, 58, 63, 57, 66, 72, 69, 81];
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function BentoPlaceholder() {
  const max = Math.max(...REVENUE);
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-4 text-neutral-900 dark:text-neutral-100">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Overview</p>
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Good morning, Alex</h2>
        </div>
        <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-500 dark:border-white/10 dark:text-neutral-400">
          Last 12 months
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Revenue", "$48,295", "+12.4%"],
          ["Active users", "3,842", "+4.1%"],
          ["Conversion", "5.27%", "−0.3%"],
        ].map(([label, value, delta]) => (
          <div key={label} className="rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{label}</p>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
              <span className="text-lg font-semibold tabular-nums">{value}</span>
              <span className={delta.startsWith("+") ? "text-[11px] font-medium text-emerald-600 dark:text-emerald-400" : "text-[11px] font-medium text-rose-500"}>
                {delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
        <div className="col-span-2 flex min-h-0 flex-col rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium">Monthly revenue</p>
            <p className="hidden text-[11px] tabular-nums text-neutral-500 sm:block dark:text-neutral-400">$81k in December</p>
          </div>
          <div className="mt-3 flex min-h-[90px] flex-1 items-end gap-1.5">
            {REVENUE.map((v, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div
                  className={i === REVENUE.length - 1 ? "w-full rounded-[4px] bg-neutral-900 dark:bg-white" : "w-full rounded-[4px] bg-neutral-200 dark:bg-white/15"}
                  style={{ height: `${(v / max) * 100}%` }}
                />
                <span className="text-[9px] text-neutral-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-col rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
          <p className="text-[12px] font-medium">Top pages</p>
          <ul className="mt-2 space-y-2 text-[11.5px]">
            {[
              ["/pricing", "38%"],
              ["/", "27%"],
              ["/docs/install", "16%"],
              ["/changelog", "9%"],
            ].map(([page, share]) => (
              <li key={page} className="flex items-center justify-between gap-2">
                <span className="truncate text-neutral-600 dark:text-neutral-300">{page}</span>
                <span className="tabular-nums text-neutral-500 dark:text-neutral-400">{share}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <p className="text-[12px] font-medium">Recent sign-ups</p>
        <ul className="mt-2 grid grid-cols-3 gap-2 text-[11.5px]">
          {[
            ["Maya Chen", "Team plan"],
            ["Jonas Weber", "Pro trial"],
            ["Ines Duarte", "Team plan"],
          ].map(([name, plan]) => (
            <li key={name} className="flex items-center gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                {name.split(" ").map((p) => p[0]).join("")}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{name}</span>
                <span className="block truncate text-[10.5px] text-neutral-500 dark:text-neutral-400">{plan}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function CollapsibleSidebar() {
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="relative flex h-[560px] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-950">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-20 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{
          width: isMobile ? 240 : (collapsed ? 60 : 240),
          x: isMobile ? (mobileOpen ? 0 : -240) : 0,
        }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 30 }}
        className={cn(
          "relative flex shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-white py-4 dark:border-white/10 dark:bg-neutral-950",
          isMobile && "absolute inset-y-0 left-0 z-30",
        )}
        onMouseEnter={() => !isMobile && setHovered(true)}
        onMouseLeave={() => !isMobile && setHovered(false)}
      >
        {/* Collapse toggle (desktop only) */}
        <AnimatePresence>
          {!isMobile && hovered && (
            <motion.button
              key="toggle"
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.14 }}
              onClick={() => setCollapsed((v) => !v)}
              className="absolute right-2.5 top-4 z-10 flex size-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm hover:text-neutral-900 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            </motion.button>
          )}
        </AnimatePresence>

        <div className={cn("flex flex-1 flex-col overflow-hidden px-3", (!isMobile && collapsed) && "px-2")}>
          {/* Brand */}
          <div className={cn("mb-5 flex items-center gap-3 pt-1", (!isMobile && collapsed) ? "justify-center px-0" : "px-3")}>
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">
              N
            </div>
            <AnimatePresence initial={false}>
              {(isMobile || !collapsed) && (
                <motion.div
                  key="brand"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="flex items-center justify-between overflow-hidden"
                >
                  <span className="whitespace-nowrap text-sm font-semibold text-neutral-900 dark:text-white">
                    Nexus Labs
                  </span>
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="ml-4 rounded-md p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Primary nav */}
          <nav className="flex flex-col gap-0.5 overflow-y-auto">
            {PRIMARY_NAV.map((item) => (
              <NavLink key={item.label} item={item} collapsed={!isMobile && collapsed} />
            ))}
          </nav>

          {/* Divider */}
          <div className="my-3 h-px bg-neutral-200 dark:bg-white/10" />

          {/* Secondary nav */}
          <nav className="flex flex-col gap-0.5">
            {SECONDARY_NAV.map((item) => (
              <NavLink key={item.label} item={item} collapsed={!isMobile && collapsed} />
            ))}
          </nav>
        </div>

        {/* User profile */}
        <div
          className={cn(
            "mt-auto flex items-center gap-3 px-3",
            (!isMobile && collapsed) ? "justify-center px-2" : "mx-3 rounded-lg px-3 py-2",
          )}
        >
          <div className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            AM
          </div>
          <AnimatePresence initial={false}>
            {(isMobile || !collapsed) && (
              <motion.div
                key="username"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="whitespace-nowrap text-sm font-medium text-neutral-800 dark:text-neutral-200">Alex Morgan</p>
                <p className="whitespace-nowrap text-[11px] text-neutral-400 dark:text-neutral-500">alex@nexuslabs.io</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col bg-neutral-50 dark:bg-neutral-900">
        {isMobile && (
          <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-neutral-950">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <Menu className="size-5" />
            </button>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">Nexus Labs</span>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <BentoPlaceholder />
        </div>
      </div>
    </div>
  );
}
