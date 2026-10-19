"use client";

import * as React from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  ChevronsUpDown,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Library,
  type LucideIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkbenchNavItem = { id: string; label: string; icon: LucideIcon; count?: number };
export type WorkbenchProject = { id: string; label: string; color: string };

export type WorkbenchSidebarProps = {
  workspace?: { name: string; plan?: string };
  items?: WorkbenchNavItem[];
  projects?: WorkbenchProject[];
  user?: { name: string; email: string };
  /** Usage shown in the meter card, 0–1. Pass `null` to hide the card. */
  usage?: number | null;
  activeId?: string;
  defaultActiveId?: string;
  onNavigate?: (id: string) => void;
  /** Start collapsed to an icon rail. */
  defaultCollapsed?: boolean;
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
  { id: "launch", label: "Autumn launch", color: "#f97316" },
  { id: "ds", label: "Design system", color: "#6366f1" },
  { id: "mobile", label: "Mobile app", color: "#10b981" },
];

/**
 * A product sidebar with a workspace switcher, search, a sliding active highlight, projects, a usage
 * meter and the signed-in user. Collapses to an icon rail.
 */
export function WorkbenchSidebar({
  workspace = { name: "Northwind", plan: "Pro plan" },
  items = ITEMS,
  projects = PROJECTS,
  user = { name: "Ada Park", email: "ada@northwind.co" },
  usage = 0.68,
  activeId,
  defaultActiveId = "overview",
  onNavigate,
  defaultCollapsed = false,
  className,
}: WorkbenchSidebarProps) {
  const reduce = useReducedMotion();
  const [internal, setInternal] = React.useState(defaultActiveId);
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const active = activeId ?? internal;
  const go = (id: string) => {
    setInternal(id);
    onNavigate?.(id);
  };

  const row =
    "relative flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-[13.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/50";

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 252 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36 }}
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden rounded-[22px] border border-zinc-200/80 bg-zinc-50 p-2.5 text-zinc-600",
        "dark:border-white/10 dark:bg-[#111116] dark:text-zinc-400",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-zinc-200/60 dark:hover:bg-white/5"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            {workspace.name[0]}
          </span>
          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-zinc-950 dark:text-white">{workspace.name}</span>
                {workspace.plan ? <span className="block truncate text-[11.5px]">{workspace.plan}</span> : null}
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0" />
            </>
          ) : null}
        </button>
      </div>

      <button
        type="button"
        className={cn(
          "mt-2 flex h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2.5 text-[13px] text-zinc-400 transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20",
          collapsed && "justify-center px-0",
        )}
        aria-label="Search"
      >
        <Search className="size-4 shrink-0" />
        {!collapsed ? (
          <>
            <span className="flex-1 text-left">Search</span>
            <kbd className="rounded-md border border-zinc-200 px-1.5 font-sans text-[10.5px] text-zinc-500 dark:border-white/10">⌘K</kbd>
          </>
        ) : null}
      </button>

      <LayoutGroup id="workbench-sidebar">
        <nav aria-label="Main" className="mt-3 space-y-0.5">
          {items.map(({ id, label, icon: Icon, count }) => {
            const on = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-current={on ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={cn(row, collapsed && "justify-center px-0", on ? "text-zinc-950 dark:text-white" : "hover:text-zinc-950 dark:hover:text-white")}
              >
                {on ? (
                  <motion.span
                    layoutId="workbench-active"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
                    className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgba(23,23,28,0.06),0_0_0_1px_rgba(23,23,28,0.06)] dark:bg-white/[0.07] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  />
                ) : null}
                <Icon className={cn("relative size-4 shrink-0", on && "text-indigo-600 dark:text-indigo-300")} />
                {!collapsed ? <span className="relative flex-1 truncate text-left">{label}</span> : null}
                {!collapsed && count ? (
                  <span className="relative rounded-full bg-indigo-600 px-1.5 text-[11px] font-semibold leading-[18px] text-white">{count}</span>
                ) : null}
                {collapsed && count ? <span className="absolute right-3 top-2 size-1.5 rounded-full bg-indigo-500" /> : null}
              </button>
            );
          })}
        </nav>
      </LayoutGroup>

      {!collapsed && projects.length ? (
        <div className="mt-5">
          <div className="flex items-center justify-between px-2.5">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-zinc-400 dark:text-zinc-500">Projects</p>
            <button type="button" aria-label="New project" className="grid size-6 place-items-center rounded-lg hover:bg-zinc-200/60 hover:text-zinc-950 dark:hover:bg-white/5 dark:hover:text-white">
              <Plus className="size-3.5" />
            </button>
          </div>
          <ul className="mt-1.5 space-y-0.5">
            {projects.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => go(p.id)} className={cn(row, "font-normal hover:text-zinc-950 dark:hover:text-white", active === p.id && "text-zinc-950 dark:text-white")}>
                  <span className="size-2 rounded-[3px]" style={{ backgroundColor: p.color }} />
                  <span className="truncate">{p.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto space-y-2 pt-4">
        {!collapsed && usage !== null ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-zinc-950 dark:text-white">Builds this month</span>
              <span className="tabular-nums">{Math.round(usage * 100)}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${Math.round(usage * 100)}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 text-[11.5px]">Resets in 9 days</p>
          </div>
        ) : null}

        <div className={cn("flex items-center gap-2.5 rounded-xl p-1.5", collapsed && "flex-col")}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-[12px] font-semibold text-white">
            {user.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </span>
          {!collapsed ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-zinc-950 dark:text-white">{user.name}</span>
              <span className="block truncate text-[11.5px]">{user.email}</span>
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid size-8 shrink-0 place-items-center rounded-lg hover:bg-zinc-200/60 hover:text-zinc-950 dark:hover:bg-white/5 dark:hover:text-white"
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
