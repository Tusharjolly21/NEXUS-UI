"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart2,
  FileText,
  Users,
  Settings,
  CreditCard,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Download,
  Menu,
  X,
  ChevronDown,
  DollarSign,
  Activity,
  MousePointerClick,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.ElementType;
  active?: boolean;
}

interface KPI {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: React.ElementType;
}

interface BarDatum {
  month: string;
  value: number;
}

interface TrafficSource {
  label: string;
  pct: number;
  color: string;
}

interface Transaction {
  id: string;
  initials: string;
  color: string;
  name: string;
  email: string;
  plan: "Pro" | "Starter" | "Enterprise";
  amount: string;
  status: "Active" | "Trial" | "Churned";
  date: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Analytics", icon: BarChart2 },
  { label: "Reports", icon: FileText },
  { label: "Users", icon: Users },
  { label: "Settings", icon: Settings },
  { label: "Billing", icon: CreditCard },
];

const KPIS: KPI[] = [
  {
    label: "Total Revenue",
    value: "$48,295",
    delta: "+12.3%",
    deltaPositive: true,
    icon: DollarSign,
  },
  {
    label: "Active Users",
    value: "8,421",
    delta: "+5.1%",
    deltaPositive: true,
    icon: Activity,
  },
  {
    label: "Conversion Rate",
    value: "3.24%",
    delta: "-0.8%",
    deltaPositive: false,
    icon: MousePointerClick,
  },
  {
    label: "Avg Session",
    value: "4m 32s",
    delta: "+2.1%",
    deltaPositive: true,
    icon: Clock,
  },
];

const REVENUE_DATA: BarDatum[] = [
  { month: "Jan", value: 62 },
  { month: "Feb", value: 45 },
  { month: "Mar", value: 78 },
  { month: "Apr", value: 55 },
  { month: "May", value: 88 },
  { month: "Jun", value: 73 },
  { month: "Jul", value: 91 },
  { month: "Aug", value: 67 },
  { month: "Sep", value: 82 },
  { month: "Oct", value: 95 },
  { month: "Nov", value: 70 },
  { month: "Dec", value: 100 },
];

const TRAFFIC_SOURCES: TrafficSource[] = [
  { label: "Organic", pct: 42, color: "#6366f1" },
  { label: "Direct", pct: 28, color: "#8b5cf6" },
  { label: "Social", pct: 18, color: "#a78bfa" },
  { label: "Referral", pct: 12, color: "#c4b5fd" },
];

const TRANSACTIONS: Transaction[] = [
  {
    id: "txn-001",
    initials: "AL",
    color: "#6366f1",
    name: "Alice Langford",
    email: "alice@example.com",
    plan: "Pro",
    amount: "$99.00",
    status: "Active",
    date: "May 18, 2026",
  },
  {
    id: "txn-002",
    initials: "BM",
    color: "#0ea5e9",
    name: "Brian Marsh",
    email: "brian@techcorp.io",
    plan: "Enterprise",
    amount: "$299.00",
    status: "Active",
    date: "May 17, 2026",
  },
  {
    id: "txn-003",
    initials: "CR",
    color: "#10b981",
    name: "Clara Reid",
    email: "clara@startup.dev",
    plan: "Starter",
    amount: "$29.00",
    status: "Trial",
    date: "May 17, 2026",
  },
  {
    id: "txn-004",
    initials: "DK",
    color: "#f59e0b",
    name: "David Kim",
    email: "david@agency.co",
    plan: "Pro",
    amount: "$99.00",
    status: "Active",
    date: "May 16, 2026",
  },
  {
    id: "txn-005",
    initials: "EV",
    color: "#ef4444",
    name: "Emma Vance",
    email: "emma@freelance.me",
    plan: "Starter",
    amount: "$29.00",
    status: "Churned",
    date: "May 15, 2026",
  },
  {
    id: "txn-006",
    initials: "FP",
    color: "#8b5cf6",
    name: "Felix Park",
    email: "felix@devshop.com",
    plan: "Enterprise",
    amount: "$299.00",
    status: "Active",
    date: "May 15, 2026",
  },
  {
    id: "txn-007",
    initials: "GH",
    color: "#ec4899",
    name: "Grace Ho",
    email: "grace@saas.io",
    plan: "Pro",
    amount: "$99.00",
    status: "Trial",
    date: "May 14, 2026",
  },
  {
    id: "txn-008",
    initials: "HN",
    color: "#14b8a6",
    name: "Henry Nash",
    email: "henry@cloudco.net",
    plan: "Pro",
    amount: "$99.00",
    status: "Active",
    date: "May 13, 2026",
  },
  {
    id: "txn-009",
    initials: "IR",
    color: "#f97316",
    name: "Iris Romano",
    email: "iris@designlab.io",
    plan: "Starter",
    amount: "$29.00",
    status: "Active",
    date: "May 12, 2026",
  },
  {
    id: "txn-010",
    initials: "JT",
    color: "#6366f1",
    name: "James Tran",
    email: "james@ventures.vc",
    plan: "Enterprise",
    amount: "$299.00",
    status: "Churned",
    date: "May 11, 2026",
  },
];

const DATE_RANGES = ["Today", "7d", "30d", "90d"] as const;
type DateRange = (typeof DATE_RANGES)[number];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const styles: Record<Transaction["status"], string> = {
    Active: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
    Trial: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    Churned: "bg-red-500/15 text-red-400 ring-1 ring-red-500/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: Transaction["plan"] }) {
  const styles: Record<Transaction["plan"], string> = {
    Starter: "bg-zinc-700 text-zinc-300",
    Pro: "bg-indigo-500/20 text-indigo-300",
    Enterprise: "bg-violet-500/20 text-violet-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[plan]}`}
    >
      {plan}
    </span>
  );
}

function Avatar({
  initials,
  color,
  size = "sm",
}: {
  initials: string;
  color: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${sizeClass}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}

// ─── Revenue Bar Chart ────────────────────────────────────────────────────────

function RevenueBarChart({ data }: { data: BarDatum[] }) {
  const [tooltip, setTooltip] = React.useState<{
    idx: number;
    x: number;
    y: number;
  } | null>(null);

  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div className="relative">
      <div className="flex items-end gap-1.5 h-40">
        {data.map((d, i) => {
          const heightPct = (d.value / maxVal) * 100;
          return (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center gap-1 group"
              onMouseEnter={(e) => {
                const rect = (e.target as HTMLElement)
                  .closest(".flex-1")!
                  .getBoundingClientRect();
                setTooltip({ idx: i, x: rect.left, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <div className="relative w-full flex items-end justify-center h-36">
                <motion.div
                  className="w-full rounded-t-sm cursor-pointer"
                  style={{ backgroundColor: "#6366f1" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
                  whileHover={{ backgroundColor: "#818cf8" }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 select-none">
                {d.month}
              </span>
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {tooltip !== null && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="rounded-lg bg-zinc-700 border border-zinc-600 px-3 py-1.5 text-xs text-zinc-100 shadow-xl whitespace-nowrap">
              {data[tooltip.idx].month} —{" "}
              <span className="font-semibold text-indigo-300">
                ${(data[tooltip.idx].value * 482).toLocaleString()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Traffic Horizontal Bar Chart ────────────────────────────────────────────

function TrafficChart({ data }: { data: TrafficSource[] }) {
  return (
    <div className="flex flex-col gap-4">
      {data.map((src, i) => (
        <div key={src.label} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-300 font-medium">{src.label}</span>
            <span className="text-zinc-400">{src.pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: src.color }}
              initial={{ width: 0 }}
              animate={{ width: `${src.pct}%` }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  collapsed,
  onToggle,
  activeNav,
  onNavChange,
}: {
  collapsed: boolean;
  onToggle: () => void;
  activeNav: string;
  onNavChange: (label: string) => void;
}) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex-shrink-0 flex flex-col h-full bg-zinc-950 border-r border-zinc-800 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="logo-text"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="text-white font-semibold text-base whitespace-nowrap overflow-hidden"
              >
                Aurora
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onToggle}
          className="ml-auto flex-shrink-0 p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;
            return (
              <li key={item.label}>
                <button
                  onClick={() => onNavChange(item.label)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 transition-colors ${
                      isActive
                        ? "text-indigo-400"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  />
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        key={`nav-${item.label}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="active-indicator"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom user */}
      <div className="flex-shrink-0 border-t border-zinc-800 p-3">
        <div className="flex items-center gap-3">
          <Avatar initials="TJ" color="#6366f1" size="sm" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 overflow-hidden"
              >
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  Tushar Jolly
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  tushar@aurora.io
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

// ─── Header Bar ───────────────────────────────────────────────────────────────

function HeaderBar({
  onMobileMenuToggle,
}: {
  onMobileMenuToggle: () => void;
}) {
  const [notifOpen, setNotifOpen] = React.useState(false);

  return (
    <header className="flex-shrink-0 h-16 flex items-center gap-4 px-6 border-b border-zinc-800 bg-zinc-900">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-900" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                key="notif-panel"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 rounded-xl bg-zinc-800 border border-zinc-700 shadow-2xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-100">
                    Notifications
                  </span>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {[
                  {
                    text: "Revenue milestone reached",
                    sub: "Monthly revenue hit $48k",
                    time: "2m ago",
                  },
                  {
                    text: "New Enterprise signup",
                    sub: "Felix Park joined",
                    time: "1h ago",
                  },
                  {
                    text: "Churn alert",
                    sub: "James Tran churned",
                    time: "3h ago",
                  },
                ].map((n, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 flex gap-3 hover:bg-zinc-700/50 transition-colors cursor-pointer border-b border-zinc-700 last:border-0"
                  >
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-200 font-medium truncate">
                        {n.text}
                      </p>
                      <p className="text-xs text-zinc-500">{n.sub}</p>
                    </div>
                    <span className="text-[11px] text-zinc-600 flex-shrink-0 ml-auto">
                      {n.time}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <Avatar initials="TJ" color="#6366f1" size="sm" />
      </div>
    </header>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ kpi }: { kpi: KPI }) {
  const Icon = kpi.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-zinc-800 rounded-xl p-5 border border-zinc-700/50 flex flex-col gap-3 hover:border-zinc-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400 font-medium">{kpi.label}</span>
        <div className="h-8 w-8 rounded-lg bg-zinc-700 flex items-center justify-center">
          <Icon className="h-4 w-4 text-indigo-400" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-zinc-100">{kpi.value}</span>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            kpi.deltaPositive
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {kpi.deltaPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {kpi.delta}
        </span>
      </div>
      <p className="text-xs text-zinc-600">vs. previous period</p>
    </motion.div>
  );
}

// ─── Transactions Table ───────────────────────────────────────────────────────

function TransactionsTable({
  rows,
  search,
  statusFilter,
  planFilter,
}: {
  rows: Transaction[];
  search: string;
  statusFilter: string;
  planFilter: string;
}) {
  const filtered = rows.filter((r) => {
    const matchSearch =
      search === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchPlan = planFilter === "All" || r.plan === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              User
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">
              Email
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">
              Plan
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Status
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-zinc-500 text-sm"
                >
                  No transactions match your filters.
                </td>
              </tr>
            )}
            {filtered.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className={`border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors ${
                  i % 2 === 0 ? "bg-transparent" : "bg-zinc-800/40"
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={row.initials}
                      color={row.color}
                      size="sm"
                    />
                    <span className="font-medium text-zinc-200 whitespace-nowrap">
                      {row.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-zinc-400 hidden sm:table-cell">
                  {row.email}
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <PlanBadge plan={row.plan} />
                </td>
                <td className="py-3 px-4 text-right font-semibold text-zinc-100">
                  {row.amount}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="py-3 px-4 text-right text-zinc-500 text-xs hidden lg:table-cell">
                  {row.date}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardAuroraAnalyticsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeNav, setActiveNav] = React.useState("Dashboard");
  const [activeDateRange, setActiveDateRange] = React.useState<DateRange>("30d");
  const [tableSearch, setTableSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [planFilter, setPlanFilter] = React.useState("All");

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-900 font-sans antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          activeNav={activeNav}
          onNavChange={setActiveNav}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              key="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <div className="h-full w-60">
                <Sidebar
                  collapsed={false}
                  onToggle={() => setMobileMenuOpen(false)}
                  activeNav={activeNav}
                  onNavChange={(label) => {
                    setActiveNav(label);
                    setMobileMenuOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <HeaderBar onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* ── Page Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-zinc-100">Overview</h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                  Welcome back, Tushar. Here's what's happening.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Date range pills */}
                <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1 border border-zinc-700">
                  {DATE_RANGES.map((range) => (
                    <button
                      key={range}
                      onClick={() => setActiveDateRange(range)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                        activeDateRange === range
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                {/* Export button */}
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700 hover:border-zinc-600 transition-all">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {KPIS.map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <KpiCard kpi={kpi} />
                </motion.div>
              ))}
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Revenue Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="lg:col-span-2 bg-zinc-800 rounded-xl border border-zinc-700/50 p-5"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-100">
                      Revenue
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Monthly revenue for 2026
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                      <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500 inline-block" />
                      Revenue
                    </span>
                  </div>
                </div>
                <RevenueBarChart data={REVENUE_DATA} />
              </motion.div>

              {/* Traffic Sources */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="bg-zinc-800 rounded-xl border border-zinc-700/50 p-5"
              >
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-zinc-100">
                    Traffic Sources
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Where visitors come from
                  </p>
                </div>
                <TrafficChart data={TRAFFIC_SOURCES} />
                {/* Legend totals */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {TRAFFIC_SOURCES.map((src) => (
                    <div
                      key={src.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: src.color }}
                      />
                      <span className="text-zinc-400 truncate">
                        {src.label}
                      </span>
                      <span className="text-zinc-300 font-medium ml-auto">
                        {src.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Transactions Section ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="bg-zinc-800 rounded-xl border border-zinc-700/50 overflow-hidden"
            >
              {/* Section header */}
              <div className="px-5 py-4 border-b border-zinc-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    Recent Transactions
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Latest customer activity
                  </p>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-700 px-2.5 py-1 rounded-full">
                  {TRANSACTIONS.length} records
                </span>
              </div>

              {/* Filters row */}
              <div className="px-5 py-3 border-b border-zinc-700/50 flex flex-wrap items-center gap-3 bg-zinc-800/50">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search users…"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 rounded-lg bg-zinc-700 border border-zinc-600 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Status filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 pl-3 pr-8 rounded-lg bg-zinc-700 border border-zinc-600 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 appearance-none cursor-pointer transition-all"
                  >
                    {["All", "Active", "Trial", "Churned"].map((s) => (
                      <option key={s} value={s}>
                        {s === "All" ? "All Statuses" : s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                </div>

                {/* Plan filter */}
                <div className="relative">
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="h-8 pl-3 pr-8 rounded-lg bg-zinc-700 border border-zinc-600 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 appearance-none cursor-pointer transition-all"
                  >
                    {["All", "Starter", "Pro", "Enterprise"].map((p) => (
                      <option key={p} value={p}>
                        {p === "All" ? "All Plans" : p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                </div>

                {/* Reset filters */}
                {(tableSearch || statusFilter !== "All" || planFilter !== "All") && (
                  <button
                    onClick={() => {
                      setTableSearch("");
                      setStatusFilter("All");
                      setPlanFilter("All");
                    }}
                    className="h-8 px-3 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 border border-zinc-600 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Table */}
              <TransactionsTable
                rows={TRANSACTIONS}
                search={tableSearch}
                statusFilter={statusFilter}
                planFilter={planFilter}
              />

              {/* Table footer */}
              <div className="px-5 py-3 border-t border-zinc-700/50 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  Showing{" "}
                  {
                    TRANSACTIONS.filter((r) => {
                      const ms =
                        tableSearch === "" ||
                        r.name
                          .toLowerCase()
                          .includes(tableSearch.toLowerCase()) ||
                        r.email
                          .toLowerCase()
                          .includes(tableSearch.toLowerCase());
                      const ss =
                        statusFilter === "All" || r.status === statusFilter;
                      const ps = planFilter === "All" || r.plan === planFilter;
                      return ms && ss && ps;
                    }).length
                  }{" "}
                  of {TRANSACTIONS.length} transactions
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled
                    className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-600 cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-xs font-medium text-white">
                    1
                  </span>
                  <button
                    disabled
                    className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-600 cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Bottom padding */}
            <div className="h-4" />
          </div>
        </main>
      </div>
    </div>
  );
}
