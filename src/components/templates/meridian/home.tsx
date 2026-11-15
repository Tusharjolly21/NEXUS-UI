"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AreaChart, BarChart, Heatmap, Sparkline, heatColor } from "./charts";
import { CustomersTable } from "./customers";
import {
  HOME_RANGES,
  KPIS,
  ME,
  NET_CASH,
  NET_TOTALS,
  RANGE_LABELS,
  REVENUE_BY_RANGE,
  SHIPPING_ACTIVITY,
  TEAM,
  TEAM_PAGE,
} from "./data";
import { DAY_MS, TODAY, formatDayDate, formatShortDate } from "./dates";
import { useHydrated } from "./hooks";
import type { Customer, Range, ToastFn } from "./types";
import { COLORS, SPRING, SPRING_SOFT, clamp, formatMoney, formatNumber, formatSignedMoney, sum } from "./theme";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CountUp,
  DeltaBadge,
  Icon,
  IconButton,
  Metric,
  PageHeader,
  RollingText,
  Segmented,
} from "./ui";

type Kpi = (typeof KPIS)[number];

function KpiCard({ kpi, range, index }: { kpi: Kpi; range: Range; index: number }) {
  return (
    <motion.div
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
        delay: index * 0.05,
      }}
    >
      <Card className="h-full p-4 sm:p-5" label={kpi.title}>
        <div
          className="flex items-center gap-2 text-[13px]"
          style={{
            color: COLORS.text,
          }}
        >
          <Icon
            name={kpi.icon}
            size={15}
            style={{
              color: COLORS.soft,
            }}
          />
          {kpi.title}
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <RollingText
            text={kpi.fmt(kpi.value[range])}
            className="text-[22px] font-[600] tracking-[-0.03em] sm:text-[26px]"
            style={{
              color: COLORS.ink,
            }}
          />
          <div className="hidden pb-1 sm:block">
            <Sparkline vals={kpi.spark[range]} rangeKey={range} w={78} h={28} />
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <DeltaBadge value={kpi.delta[range]} invert={kpi.invert} size="xs" />
          <span
            className="truncate text-[12px]"
            style={{
              color: COLORS.soft,
            }}
          >
            {kpi.note[range]}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

function RevenueCard({ range }: { range: Range }) {
  const data = REVENUE_BY_RANGE[range];
  const [hover, setHover] = useState<number | null>(null);
  const current = sum(data.map((point) => point.v));
  const previous = sum(data.map((point) => point.p));
  const point = hover != null ? data[hover] : null;
  const change = point ? ((point.v - point.p) / point.p) * 100 : ((current - previous) / previous) * 100;
  return (
    <Card className="p-4 sm:p-5 lg:col-span-8" label="Revenue">
      <CardHeader
        title="Revenue"
        sub="Recognised revenue, all plans"
        right={
          <div
            className="hidden items-center gap-4 text-[12px] sm:flex"
            style={{
              color: COLORS.soft,
            }}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="h-[2px] w-3.5 rounded-full"
                style={{
                  background: COLORS.accent,
                }}
              />
              This period
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 border-t-[1.5px] border-dashed"
                style={{
                  borderColor: COLORS.soft,
                }}
              />
              Previous
            </span>
          </div>
        }
      />
      <div className="mt-4">
        <Metric
          label={point ? point.long : RANGE_LABELS[range]}
          text={formatMoney(point ? point.v : current)}
          size={32}
          after={
            <>
              <DeltaBadge value={Math.round(change * 10) / 10} />
              <span
                className="text-[12px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                {point ? `vs. ${formatMoney(point.p)}` : "vs. previous period"}
              </span>
            </>
          }
        />
      </div>
      <div className="-mx-1 mt-3">
        <AreaChart data={data} onHover={setHover} label={`Revenue by ${range === "Year" ? "month" : "day"}`} />
      </div>
    </Card>
  );
}

function NetCashCard({ range }: { range: Range }) {
  const data = NET_CASH[range];
  const [hover, setHover] = useState<number | null>(null);
  const total = sum(data.map((point) => point.v));
  const point = hover != null ? data[hover] : null;
  const [newMrr, expansion, churn] = NET_TOTALS[range];
  return (
    <Card className="flex flex-col p-4 sm:p-5 lg:col-span-4" label="Net new MRR">
      <CardHeader title="Net new MRR" sub="New plus expansion, minus churn" />
      <div className="mt-4">
        <Metric
          label={point ? (point.v < 0 ? `${point.long}, net contraction` : point.long) : RANGE_LABELS[range]}
          text={formatSignedMoney(point ? point.v : total)}
          size={32}
        />
      </div>
      <div className="mt-auto pt-4">
        <BarChart data={data} rangeKey={range} onHover={setHover} label="Net new MRR per period" />
      </div>
      <div
        className="mt-4 grid grid-cols-3 gap-2 border-t pt-3.5"
        style={{
          borderColor: COLORS.line,
        }}
      >
        {(
          [
            ["New", newMrr],
            ["Expansion", expansion],
            ["Churn", churn],
          ] as [string, number][]
        ).map(([label, value]) => (
          <div key={label} className="min-w-0">
            <div
              className="text-[11.5px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {label}
            </div>
            <CountUp
              value={value}
              format={formatSignedMoney}
              className="text-[13.5px] font-[580]"
              style={{
                color: COLORS.ink,
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ShippingCard() {
  const [hover, setHover] = useState<number | null>(null);
  const day = hover != null ? SHIPPING_ACTIVITY.days[hover] : null;
  return (
    <Card className="p-4 sm:p-5 lg:col-span-7" label="Shipping activity">
      <CardHeader
        title="Shipping activity"
        sub="Pull requests merged per day"
        right={
          <div
            className="hidden items-center gap-1.5 text-[11.5px] sm:flex"
            style={{
              color: COLORS.soft,
            }}
          >
            Less
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className="size-[11px] rounded-[3px]"
                style={{
                  background: heatColor(level),
                }}
              />
            ))}
            More
          </div>
        }
      />
      <div className="mt-4">
        <Metric
          label={day ? formatDayDate(day.d) : "Last 26 weeks"}
          text={day ? `${day.v} merged` : `${formatNumber(SHIPPING_ACTIVITY.total)} merged`}
          size={28}
        />
      </div>
      <div className="mt-4">
        <Heatmap onHover={setHover} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Releases", `${SHIPPING_ACTIVITY.releases}`],
          ["Median cycle time", `${SHIPPING_ACTIVITY.cycle} days`],
          ["Longest streak", `${SHIPPING_ACTIVITY.best} days`],
          ["Busiest day", "Tuesday"],
        ].map(([r, s]) => (
          <div
            key={r}
            className="rounded-[12px] px-3 py-2.5"
            style={{
              background: COLORS.well,
            }}
          >
            <div
              className="text-[11.5px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {r}
            </div>
            <div
              className="mt-0.5 text-[14px] font-[580] tabular-nums"
              style={{
                color: COLORS.ink,
              }}
            >
              {s}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TeamCard() {
  const [[page, dir], setPage] = useState([0, 0]);
  const pages = Math.ceil(TEAM.length / TEAM_PAGE);
  const step = (delta: number) => setPage(([current]) => [clamp(current + delta, 0, pages - 1), delta]);
  const members = TEAM.slice(page * TEAM_PAGE, page * TEAM_PAGE + TEAM_PAGE);
  const newHires = TEAM.filter((member) => (TODAY.getTime() - member.start.getTime()) / DAY_MS < 30).length;
  return (
    <Card className="flex flex-col p-4 sm:p-5 lg:col-span-5" label="New this quarter">
      <CardHeader
        title="New this quarter"
        sub={`${TEAM.length} hires, ${newHires} still onboarding`}
        right={
          <div className="flex items-center gap-1">
            <span
              className="mr-1 text-[12px] tabular-nums"
              style={{
                color: COLORS.soft,
              }}
            >
              {page + 1}
              {" / "}
              {pages}
            </span>
            <IconButton icon="ph:caret-left" label="Previous hires" size={30} onClick={() => step(-1)} />
            <IconButton icon="ph:caret-right" label="Next hires" size={30} onClick={() => step(1)} />
          </div>
        }
      />
      <div className="relative mt-4 flex-1 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={dir}>
          <motion.ul
            key={page}
            custom={dir}
            variants={{
              enter: (dir) => ({
                x: dir >= 0 ? 60 : -60,
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
              },
              exit: (dir) => ({
                x: dir >= 0 ? -60 : 60,
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SPRING_SOFT}
            className="flex flex-col gap-1"
          >
            {members.map((member, i) => {
              const days = Math.floor((TODAY.getTime() - member.start.getTime()) / DAY_MS) + 1;
              const upcoming = days <= 0;
              const ramp = clamp(days / 30);
              return (
                <motion.li
                  key={member.name}
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    ...SPRING_SOFT,
                    delay: 0.04 * i,
                  }}
                  className="md-row flex items-center gap-3 rounded-[12px] px-2 py-2"
                >
                  <Avatar name={member.name} size={38} />
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-[13.5px] font-[560]"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      {member.name}
                    </div>
                    <div
                      className="truncate text-[12px]"
                      style={{
                        color: COLORS.soft,
                      }}
                    >
                      {member.role}
                    </div>
                    <div
                      className="mt-1 flex items-center gap-1.5 text-[11.5px]"
                      style={{
                        color: COLORS.soft,
                      }}
                    >
                      <Avatar name={member.buddy} size={16} />
                      {"Buddy: "}
                      {member.buddy.split(" ")[0]}
                    </div>
                  </div>
                  <div className="w-[104px] shrink-0 text-right">
                    <div
                      className="text-[12px] tabular-nums"
                      style={{
                        color: upcoming ? COLORS.accentInk : COLORS.text,
                      }}
                    >
                      {upcoming
                        ? `Starts ${formatShortDate(member.start)}`
                        : days > 30
                          ? "Onboarded"
                          : `Day ${days} of 30`}
                    </div>
                    <div
                      className="ml-auto mt-1.5 h-[4px] w-[84px] overflow-hidden rounded-full"
                      style={{
                        background: COLORS.well,
                      }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: days > 30 ? COLORS.good : COLORS.accent,
                        }}
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${ramp * 100}%`,
                        }}
                        transition={{
                          ...SPRING_SOFT,
                          delay: 0.1 + i * 0.05,
                        }}
                      />
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["Open roles", "4"],
          ["Avg. ramp-up", "19 days"],
          ["Offer accept", "86%"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[12px] px-3 py-2.5"
            style={{
              background: COLORS.well,
            }}
          >
            <div
              className="truncate text-[11.5px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {label}
            </div>
            <div
              className="mt-0.5 text-[14px] font-[580] tabular-nums"
              style={{
                color: COLORS.ink,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {Array.from(
          {
            length: pages,
          },
          (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Page ${index + 1}`}
              onClick={() => setPage(([current]) => [index, index - current])}
              className="grid h-4 place-items-center px-0.5"
            >
              <motion.span
                className="block h-[5px] rounded-full"
                animate={{
                  width: index === page ? 18 : 5,
                  backgroundColor: index === page ? "var(--ink)" : "var(--faint)",
                }}
                transition={SPRING}
              />
            </button>
          ),
        )}
      </div>
    </Card>
  );
}

type HomePageProps = {
  range: Range;
  setRange: (range: Range) => void;
  customers: Customer[];
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  query: string;
  setQuery: (query: string) => void;
  toast: ToastFn;
  onNewTask: () => void;
};

export function HomePage({
  range,
  setRange,
  customers,
  setCustomers,
  query,
  setQuery,
  toast,
  onNewTask,
}: HomePageProps) {
  // The visitor's own clock, read only after hydration so the server render cannot disagree with it.
  const hydrated = useHydrated();
  const hour = hydrated ? new Date().getHours() : 12;
  const greeting = !hydrated ? "Hello" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={`${greeting}, ${ME.first}`}
        sub={
          <>
            {"Friday, November 13. Revenue is up "}
            <span
              style={{
                color: COLORS.ink,
              }}
            >
              6.2%
            </span>
            {" on the previous 30 days."}
          </>
        }
        right={
          <>
            <Segmented options={HOME_RANGES} value={range} onChange={setRange} id="home-range" label="Date range" />
            <Button kind="primary" icon="ph:plus" onClick={onNewTask}>
              New task
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {KPIS.map((kpi, i) => (
          <KpiCard key={kpi.key} kpi={kpi} range={range} index={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <RevenueCard range={range} />
        <NetCashCard range={range} />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <ShippingCard />
        <TeamCard />
      </div>
      <CustomersTable
        customers={customers}
        setCustomers={setCustomers}
        query={query}
        setQuery={setQuery}
        toast={toast}
      />
    </div>
  );
}
