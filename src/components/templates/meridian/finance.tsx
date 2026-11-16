"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CashFlowSankey, Donut, Sparkline, type FlowHover } from "./charts";
import {
  CASH_FLOW,
  FINANCE_RANGES,
  INCOME_SOURCES,
  RANGE_PHRASES,
  SPEND_CATEGORIES,
  SPEND_COLORS,
  TRANSACTIONS,
} from "./data";
import { formatShortDate } from "./dates";
import type { FinanceRange, ToastFn } from "./types";
import { useIsMobile } from "./hooks";
import { COLORS, FONT_MONO, SPRING_SOFT, formatCompactMoney, formatMoney, sum } from "./theme";
import {
  Button,
  Card,
  CardHeader,
  CountUp,
  DeltaBadge,
  Dot,
  Icon,
  Metric,
  PageHeader,
  RollingText,
  Segmented,
} from "./ui";

export function FinancePage({ toast }: { toast: ToastFn }) {
  const [range, setRange] = useState<FinanceRange>("Month");
  const [flowHover, setFlowHover] = useState<FlowHover | null>(null);
  const [budgetHover, setBudgetHover] = useState<number | null>(null);
  const narrow = useIsMobile(640);
  const flow = CASH_FLOW[range];
  const income = sum(flow.src);
  const spend = sum(flow.use);
  const net = income - spend;
  const sources = INCOME_SOURCES.map((incomeSource, i) => ({
    name: incomeSource,
    v: flow.src[i],
  }));
  const uses = [
    ...SPEND_CATEGORIES.map((spendCategory, i) => ({
      name: spendCategory,
      v: flow.use[i],
      color: SPEND_COLORS[spendCategory],
    })),
    {
      name: "Kept",
      v: net,
      color: "var(--faint)",
    },
  ];

  const flowItem = flowHover ? (flowHover.side === "src" ? sources[flowHover.i] : uses[flowHover.i]) : null;
  const stats = [
    {
      t: "Balance",
      icon: "ph:bank",
      v: formatMoney(flow.balance[flow.balance.length - 1] * 1e3),
      d: flow.dBal,
      note: "All accounts",
      spark: flow.balance,
    },
    {
      t: "Income",
      icon: "ph:arrow-down",
      v: formatMoney(income),
      d: flow.dIn,
      note: `Collected ${RANGE_PHRASES[range]}`,
      spark: null,
    },
    {
      t: "Expenses",
      icon: "ph:arrow-up",
      v: formatMoney(spend),
      d: flow.dOut,
      note: `Paid out ${RANGE_PHRASES[range]}`,
      spark: null,
      invert: true,
    },
    {
      t: "Net margin",
      icon: "ph:chart-line-up",
      v: `${((net / income) * 100).toFixed(1)}%`,
      d: Math.round(((net / income) * 100 - 27.4) * 10) / 10,
      note: `${formatCompactMoney(net)} kept ${RANGE_PHRASES[range]}`,
      spark: null,
    },
  ];

  const budgets = SPEND_CATEGORIES.slice(0, 4).map((p, i) => ({
    name: p,
    v: flow.use[i],
    of: flow.budget[i],
    color: SPEND_COLORS[p],
  }));
  const budgetItem = budgetHover != null ? budgets[budgetHover] : null;
  const budgetUsed = sum(budgets.map((budget) => budget.v)) / sum(budgets.map((budget) => budget.of));
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title="Finance"
        sub="Operating account, synced 4 minutes ago."
        right={
          <>
            <Segmented options={FINANCE_RANGES} value={range} onChange={setRange} id="fin-range" label="Period" />
            <Button
              icon="ph:export"
              onClick={() => toast("Statement for " + RANGE_PHRASES[range] + " is being prepared")}
            >
              Statement
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.t}
            className="h-full"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              ...SPRING_SOFT,
              delay: i * 0.05,
            }}
          >
            <Card className="h-full p-4 sm:p-5" label={stat.t}>
              <div
                className="flex items-center gap-2 text-[13px]"
                style={{
                  color: COLORS.text,
                }}
              >
                <Icon
                  name={stat.icon}
                  size={15}
                  style={{
                    color: COLORS.soft,
                  }}
                />

                {stat.t}
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <RollingText
                  text={stat.v}
                  className="text-[20px] font-[600] tracking-[-0.03em] sm:text-[26px]"
                  style={{
                    color: COLORS.ink,
                  }}
                />

                {stat.spark && (
                  <div className="hidden pb-1 xl:block">
                    <Sparkline vals={stat.spark} rangeKey={range} w={70} h={28} />
                  </div>
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <DeltaBadge value={stat.d} invert={stat.invert} size="xs" />
                <span
                  className="truncate text-[12px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {stat.note}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <Card className="p-4 sm:p-5 lg:col-span-8" label="Cash flow">
          <CardHeader title="Cash flow" sub="Where income came from and where it went" />
          <div className="mt-4">
            <Metric
              label={
                flowItem && flowHover
                  ? flowHover.side === "src"
                    ? `${flowItem.name}, into income`
                    : flowItem.name === "Kept"
                      ? "Kept as cash"
                      : `Spent on ${flowItem.name.toLowerCase()}`
                  : `Income ${RANGE_PHRASES[range]}`
              }
              text={formatMoney(flowItem ? flowItem.v : income)}
              size={30}
              after={
                <span
                  className="text-[12.5px] tabular-nums"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {flowItem
                    ? `${((flowItem.v / income) * 100).toFixed(1)}% of income`
                    : `${((net / income) * 100).toFixed(1)}% kept`}
                </span>
              }
            />
          </div>
          <div className="mt-5">
            <CashFlowSankey
              src={sources}
              use={uses}
              hover={flowHover}
              setHover={setFlowHover}
              height={narrow ? 360 : 312}
            />
          </div>
        </Card>
        <Card className="flex flex-col p-4 sm:p-5 lg:col-span-4" label="Budget used">
          <CardHeader title="Budget used" sub={`Against plan, ${RANGE_PHRASES[range]}`} />
          <div className="relative mx-auto mt-5 grid place-items-center">
            <Donut items={budgets} size={204} hover={budgetHover} setHover={setBudgetHover} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <div
                  className="relative h-4 overflow-hidden text-[11.5px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.div
                      key={(budgetItem == null ? undefined : budgetItem.name) ?? "all"}
                      initial={{
                        y: 10,
                        opacity: 0,
                      }}
                      animate={{
                        y: 0,
                        opacity: 1,
                      }}
                      exit={{
                        y: -10,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      {(budgetItem == null ? undefined : budgetItem.name) ?? "All four"}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <RollingText
                  text={`${Math.round((budgetItem ? budgetItem.v / budgetItem.of : budgetUsed) * 100)}%`}
                  className="justify-center text-[24px] font-[600] tracking-[-0.03em]"
                  style={{
                    color: COLORS.ink,
                  }}
                />
              </div>
            </div>
          </div>
          <ul className="mt-5 flex flex-col gap-0.5">
            {budgets.map((budget, j) => (
              <li
                key={budget.name}
                onPointerEnter={() => setBudgetHover(j)}
                onPointerLeave={() => setBudgetHover(null)}
                className="md-row flex items-center gap-2.5 rounded-[10px] px-2 py-2 text-[13px]"
                style={{
                  opacity: budgetHover != null && budgetHover !== j ? 0.45 : 1,
                  transition: "opacity .2s",
                }}
              >
                <Dot color={budget.color} size={8} />
                <span
                  className="flex-1"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {budget.name}
                </span>
                <span
                  className="tabular-nums"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  <CountUp value={budget.v} format={formatCompactMoney} />
                  {" of "}
                  {formatCompactMoney(budget.of)}
                </span>
                <span
                  className="w-10 text-right font-[560] tabular-nums"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  <CountUp value={(budget.v / budget.of) * 100} format={(S) => `${Math.round(S)}%`} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Transactions />
    </div>
  );
}

function Transactions() {
  const [kind, setKind] = useState("All");
  const [query, setQuery] = useState("");
  const rows = TRANSACTIONS.filter(
    (transaction) =>
      (kind === "All" || (kind === "Income" ? transaction.kind === "in" : transaction.kind === "out")) &&
      (!query ||
        `${transaction.who} ${transaction.cat} ${transaction.method}`.toLowerCase().includes(query.toLowerCase())),
  );
  const total = sum(rows.map((row) => row.amt));
  return (
    <Card className="p-4 sm:p-5" label="Recent transactions">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2.5">
          <h3
            className="text-[15px] font-[600]"
            style={{
              color: COLORS.ink,
            }}
          >
            Recent transactions
          </h3>
          <span
            className="text-[12.5px] tabular-nums"
            style={{
              color: COLORS.soft,
            }}
          >
            <CountUp value={rows.length} />
            {" shown, net "}
            <CountUp value={total} format={(a) => `${a >= 0 ? "+" : "-"}${formatMoney(Math.abs(a))}`} />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            className="md-field relative flex h-9 min-w-0 flex-1 items-center rounded-[10px] sm:w-[200px] sm:flex-none"
            style={{
              background: COLORS.well,
            }}
          >
            <Icon
              name="ph:magnifying-glass"
              size={15}
              className="pointer-events-none absolute left-3"
              style={{
                color: COLORS.soft,
              }}
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label="Search transactions"
              className="h-full w-full bg-transparent pl-9 pr-3 text-[13px] outline-none"
              style={{
                color: COLORS.ink,
              }}
            />
          </label>
          <Segmented
            options={["All", "Income", "Expenses"]}
            value={kind}
            onChange={setKind}
            id="txn-kind"
            label="Transaction type"
          />
        </div>
      </div>
      <ul className="mt-3">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((row) => (
            <motion.li
              key={row.id}
              layout={true}
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
                transition: {
                  duration: 0.12,
                },
              }}
              transition={SPRING_SOFT}
              className="md-row grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-[12px] px-2 py-2.5 sm:grid-cols-[36px_1.4fr_1fr_110px_120px]"
            >
              <span
                className="grid size-9 place-items-center rounded-[10px]"
                style={{
                  background: COLORS.well,
                  color: COLORS.text,
                }}
              >
                <Icon name={row.icon} size={17} />
              </span>
              <div className="min-w-0">
                <div
                  className="truncate text-[13.5px] font-[540]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {row.who}
                </div>
                <div
                  className="truncate text-[12px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {row.method}
                  <span className="sm:hidden">
                    {", "}
                    {formatShortDate(row.date)}
                  </span>
                </div>
              </div>
              <div
                className="hidden items-center gap-2 text-[13px] sm:flex"
                style={{
                  color: COLORS.text,
                }}
              >
                <Dot color={SPEND_COLORS[row.cat] ?? "var(--soft)"} />
                {row.cat}
              </div>
              <div
                className="hidden text-[13px] tabular-nums sm:block"
                style={{
                  color: COLORS.text,
                }}
              >
                {formatShortDate(row.date)}
              </div>
              <div
                className="text-right text-[13.5px] font-[560] tabular-nums"
                style={{
                  color: row.kind === "in" ? "var(--good-ink)" : COLORS.ink,
                  fontFamily: FONT_MONO,
                }}
              >
                {row.kind === "in" ? "+" : "-"}
                {formatMoney(Math.abs(row.amt))}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {rows.length === 0 && (
          <li
            className="py-10 text-center text-[13px]"
            style={{
              color: COLORS.soft,
            }}
          >
            Nothing matches that search.
          </li>
        )}
      </ul>
    </Card>
  );
}
