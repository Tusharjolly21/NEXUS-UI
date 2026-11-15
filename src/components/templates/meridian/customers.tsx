"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { PLANS, STATUSES, STATUS_COLORS, formatAgo, monthlyRevenue } from "./data";
import { useDismiss } from "./hooks";
import type { Customer, ToastFn } from "./types";
import { COLORS, FONT_MONO, SPRING, SPRING_SOFT, formatMoney, sum } from "./theme";
import {
  Button,
  Card,
  Checkbox,
  CountUp,
  Dot,
  Dropdown,
  Icon,
  IconButton,
  InitialsAvatar,
  MenuItem,
  RollingText,
} from "./ui";

function StatusPill({ status, onClick }: { status: string; onClick: (event: MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Status: ${status}. Change status`}
      className="group/s inline-flex h-[26px] items-center gap-1.5 rounded-full pl-2 pr-1.5 text-[12.5px] font-[530] transition-colors"
      style={{
        background: COLORS.well,
        color: COLORS.ink,
        boxShadow: "inset 0 0 0 1px var(--line)",
      }}
    >
      <span
        className="size-[7px] rounded-full"
        style={{
          background: STATUS_COLORS[status],
          transition: "background-color .25s",
        }}
      />
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={status}
          initial={{
            y: 8,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          exit={{
            y: -8,
            opacity: 0,
          }}
          transition={{
            duration: 0.18,
          }}
        >
          {status}
        </motion.span>
      </AnimatePresence>
      <Icon name="ph:caret-down" size={11} className="opacity-50 transition-opacity group-hover/s:opacity-100" />
    </button>
  );
}

type FilterMenuProps = {
  label: string;
  options: string[];
  sel: Set<string>;
  toggle: (value: string) => void;
  clear: () => void;
  /** A coloured dot beside each option, when the options have colours. */
  dot?: (option: string) => string;
};

function FilterMenu({ label, options, sel, toggle, clear, dot }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="md-hov inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-[520]"
        style={{
          color: sel.size ? COLORS.ink : COLORS.text,
          boxShadow: `inset 0 0 0 1px ${sel.size ? "var(--line2)" : "var(--line)"}`,
        }}
      >
        <Icon name="ph:funnel-simple" size={14} />
        {label}
        <AnimatePresence>
          {sel.size > 0 && (
            <motion.span
              initial={{
                scale: 0,
                width: 0,
              }}
              animate={{
                scale: 1,
                width: "auto",
              }}
              exit={{
                scale: 0,
                width: 0,
              }}
              transition={SPRING}
              className="grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-[600] text-white"
              style={{
                background: COLORS.accent,
              }}
            >
              {sel.size}
            </motion.span>
          )}
        </AnimatePresence>
        <Icon
          name="ph:caret-down"
          size={12}
          style={{
            color: COLORS.soft,
          }}
        />
      </button>
      <Dropdown open={open} className="w-[200px]">
        <div role="menu" aria-label={label}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitemcheckbox"
              aria-checked={sel.has(option)}
              onClick={() => toggle(option)}
              className="md-hov flex h-8 w-full items-center gap-2.5 rounded-[9px] px-2.5 text-[13px]"
              style={{
                color: COLORS.ink,
              }}
            >
              <span
                className="grid size-4 place-items-center rounded-[5px]"
                style={{
                  background: sel.has(option) ? COLORS.accent : "transparent",
                  boxShadow: sel.has(option) ? "none" : "inset 0 0 0 1.5px var(--faint)",
                }}
              >
                {sel.has(option) && (
                  <Icon
                    name="ph:check"
                    size={11}
                    style={{
                      color: "#fff",
                    }}
                  />
                )}
              </span>
              {dot && <Dot color={dot(option)} />}
              {option}
            </button>
          ))}
          <div
            className="my-1 h-px"
            style={{
              background: COLORS.line,
            }}
          />
          <MenuItem
            icon="ph:x"
            onClick={() => {
              clear();
              setOpen(false);
            }}
          >
            Clear filter
          </MenuItem>
        </div>
      </Dropdown>
    </div>
  );
}

type SortKey = "name" | "seats" | "mrr" | "active";
type Sort = { k: SortKey; dir: 1 | -1 };

type SortHeaderProps = {
  sortKey?: SortKey;
  children: ReactNode;
  className?: string;
  sort: Sort;
  onSort: (key: SortKey) => void;
};

function SortHeader({ sortKey, children, className = "", sort, onSort }: SortHeaderProps) {
  return (
    <th
      scope="col"
      aria-sort={sortKey && sort.k === sortKey ? (sort.dir === 1 ? "ascending" : "descending") : undefined}
      className={`h-10 whitespace-nowrap px-3 text-left text-[12px] font-[520] ${className}`}
      style={{
        color: COLORS.soft,
      }}
    >
      {sortKey ? (
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className="group/h -mx-1 inline-flex items-center gap-1 rounded-[6px] px-1 py-0.5 transition-colors hover:text-[var(--ink)]"
          style={{
            color: sort.k === sortKey ? COLORS.ink : undefined,
          }}
        >
          {children}
          <motion.span
            animate={{
              rotate: sort.k === sortKey && sort.dir === 1 ? 180 : 0,
              opacity: sort.k === sortKey ? 1 : 0,
            }}
            transition={SPRING}
            className="grid group-hover/h:!opacity-60"
          >
            <Icon name="ph:arrow-down" size={12} />
          </motion.span>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

type CustomersTableProps = {
  customers: Customer[];
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  query: string;
  setQuery: (query: string) => void;
  toast: ToastFn;
};

/** A row menu or status menu opened from a cell, placed under it inside the table. */
type Popover = { id: string; kind: "row" | "status"; x: number; y: number };

export function CustomersTable({ customers, setCustomers, query, setQuery, toast }: CustomersTableProps) {
  const [planFilter, setPlanFilter] = useState(new Set<string>());
  const [statusFilter, setStatusFilter] = useState(new Set<string>());
  const [sort, setSort] = useState<Sort>({
    k: "mrr",
    dir: -1,
  });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(new Set<string>());
  const [popover, setPopover] = useState<Popover | null>(null);
  const table = useRef<HTMLDivElement>(null);
  const popoverPanel = useRef<HTMLDivElement>(null);
  useDismiss(popoverPanel, !!popover, () => setPopover(null));
  const PAGE_SIZE = 8;
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = customers.filter(
      (customer) =>
        (!planFilter.size || planFilter.has(customer.plan)) &&
        (!statusFilter.size || statusFilter.has(customer.status)) &&
        (!needle ||
          `${customer.name} ${customer.contact} ${customer.email} ${customer.id}`.toLowerCase().includes(needle)),
    );
    const valueOf = (customer: Customer) =>
      sort.k === "name"
        ? customer.name
        : sort.k === "seats"
          ? customer.seats
          : sort.k === "mrr"
            ? monthlyRevenue(customer)
            : customer.active;
    return list.sort((a, b) => {
      const va = valueOf(a);
      const vb = valueOf(b);
      return (
        (typeof va === "string" && typeof vb === "string" ? va.localeCompare(vb) : Number(va) - Number(vb)) * sort.dir
      );
    });
  }, [customers, planFilter, statusFilter, sort, query]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  // stay on a page that exists, and go back to the first page when the filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage((prev) => Math.min(prev, pages - 1));
  }, [pages]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [query, planFilter, statusFilter]);
  const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const allOnPage = pageRows.length > 0 && pageRows.every((pageRow) => selected.has(pageRow.id));
  const someOnPage = pageRows.some((pageRow) => selected.has(pageRow.id));
  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPage) {
        pageRows.forEach((pageRow) => next.delete(pageRow.id));
      } else {
        pageRows.forEach((pageRow) => next.add(pageRow.id));
      }
      return next;
    });
  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  const sortBy = (key: SortKey) =>
    setSort((prev) =>
      prev.k === key
        ? {
            k: key,
            dir: prev.dir === 1 ? -1 : 1,
          }
        : {
            k: key,
            dir: key === "name" ? 1 : -1,
          },
    );
  const toggleIn = (setter: Dispatch<SetStateAction<Set<string>>>) => (value: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  const openPopover = (event: MouseEvent<HTMLElement>, id: string, kind: Popover["kind"]) => {
    event.stopPropagation();
    const box = table.current?.getBoundingClientRect();
    if (!box) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (popover && popover.id === id && popover.kind === kind) {
      setPopover(null);
      return;
    }
    setPopover({
      id,
      kind,
      x: kind === "row" ? rect.right - box.left - 180 : rect.left - box.left,
      y: rect.bottom - box.top + 6,
    });
  };
  const setStatus = (ids: string[], status: string) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        ids.includes(customer.id)
          ? {
              ...customer,
              status,
            }
          : customer,
      ),
    );
    setPopover(null);
  };
  const archive = (ids: string[]) => {
    let removed: Customer[] = [];
    setCustomers(
      (prev) => (
        (removed = prev.filter((customer) => ids.includes(customer.id))),
        prev.filter((customer) => !ids.includes(customer.id))
      ),
    );
    setSelected(new Set());
    setPopover(null);
    toast(`Archived ${ids.length} customer${ids.length === 1 ? "" : "s"}`, () =>
      setCustomers((prev) => [...prev, ...removed]),
    );
  };
  const exportCsv = (ids: string[]) => {
    const rows = customers.filter((customer) => ids.includes(customer.id));
    const lines = [
      "id,name,contact,email,plan,seats,mrr,status",
      ...rows.map((customer) =>
        [
          customer.id,
          `"${customer.name}"`,
          customer.contact,
          customer.email,
          customer.plan,
          customer.seats,
          monthlyRevenue(customer),
          customer.status,
        ].join(","),
      ),
    ].join("\n");
    try {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([lines], {
          type: "text/csv",
        }),
      );
      link.download = "fieldnote-customers.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1e3);
    } catch {}
    toast(`Exported ${rows.length} customer${rows.length === 1 ? "" : "s"} to CSV`);
  };
  const selectedIds = [...selected].filter((id) => customers.some((customer) => customer.id === id));
  const totalMrr = sum(rows.map(monthlyRevenue));
  const sortProps = {
    sort,
    onSort: sortBy,
  };
  const popoverCustomer = popover ? customers.find((customer) => customer.id === popover.id) : null;
  return (
    <Card className="p-0" label="Customers">
      <div ref={table} className="relative">
        <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-baseline gap-2.5">
            <h3
              className="text-[15px] font-[600] tracking-[-0.01em]"
              style={{
                color: COLORS.ink,
              }}
            >
              Customers
            </h3>
            <span
              className="text-[12.5px] tabular-nums"
              style={{
                color: COLORS.soft,
              }}
            >
              <CountUp value={rows.length} />
              {" account"}
              {rows.length === 1 ? "" : "s"}
              {", "}
              <CountUp value={totalMrr} format={formatMoney} />
              {" MRR"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label
              className="md-field relative flex h-9 w-full min-w-0 items-center rounded-[10px] sm:w-[240px]"
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
                placeholder="Search name, contact, ID"
                aria-label="Search customers"
                className="h-full w-full bg-transparent pl-9 pr-8 text-[13px] outline-none"
                style={{
                  color: COLORS.ink,
                }}
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{
                      scale: 0,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    exit={{
                      scale: 0,
                    }}
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="absolute right-2 grid size-5 place-items-center rounded-full"
                    style={{
                      background: COLORS.faint,
                      color: COLORS.ink,
                    }}
                  >
                    <Icon name="ph:x" size={10} />
                  </motion.button>
                )}
              </AnimatePresence>
            </label>
            <FilterMenu
              label="Plan"
              options={PLANS}
              sel={planFilter}
              toggle={toggleIn(setPlanFilter)}
              clear={() => setPlanFilter(new Set())}
            />
            <FilterMenu
              label="Status"
              options={STATUSES}
              sel={statusFilter}
              toggle={toggleIn(setStatusFilter)}
              clear={() => setStatusFilter(new Set())}
              dot={(status) => STATUS_COLORS[status]}
            />
          </div>
        </div>
        <div className="md-scroll overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-0 text-[13px]">
            <thead>
              <tr
                style={{
                  background: COLORS.well,
                }}
              >
                <th scope="col" className="h-10 w-[52px] pl-5 text-left">
                  <Checkbox
                    on={allOnPage}
                    mixed={!allOnPage && someOnPage}
                    onChange={togglePage}
                    label="Select all on this page"
                  />
                </th>
                <SortHeader {...sortProps} sortKey="name">
                  Customer
                </SortHeader>
                <SortHeader {...sortProps}>Plan</SortHeader>
                <SortHeader {...sortProps} sortKey="seats" className="text-right">
                  Seats
                </SortHeader>
                <SortHeader {...sortProps} sortKey="mrr" className="text-right">
                  MRR
                </SortHeader>
                <SortHeader {...sortProps}>Status</SortHeader>
                <SortHeader {...sortProps} sortKey="active">
                  Last active
                </SortHeader>
                <th className="w-[56px]" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {pageRows.map((pageRow, i) => {
                  const isSelected = selected.has(pageRow.id);
                  return (
                    <motion.tr
                      key={pageRow.id}
                      layout="position"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                        transition: {
                          duration: 0.15,
                        },
                      }}
                      transition={{
                        ...SPRING_SOFT,
                        opacity: {
                          duration: 0.2,
                          delay: i * 0.02,
                        },
                      }}
                      className="md-row group/r cursor-default"
                      style={{
                        background: isSelected ? "var(--accent-soft)" : undefined,
                      }}
                      onClick={() => toggleRow(pageRow.id)}
                    >
                      <td
                        className="h-[58px] border-b pl-5"
                        style={{
                          borderColor: COLORS.line,
                        }}
                      >
                        <Checkbox
                          on={isSelected}
                          onChange={() => toggleRow(pageRow.id)}
                          label={`Select ${pageRow.name}`}
                        />
                      </td>
                      <td
                        className="border-b px-3"
                        style={{
                          borderColor: COLORS.line,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={pageRow.name} size={32} hue={pageRow.hue} />
                          <div className="min-w-0">
                            <div
                              className="truncate font-[560]"
                              style={{
                                color: COLORS.ink,
                              }}
                            >
                              {pageRow.name}
                            </div>
                            <div
                              className="truncate text-[12px]"
                              style={{
                                color: COLORS.soft,
                              }}
                            >
                              {pageRow.contact}
                              {", "}
                              {pageRow.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className="border-b px-3"
                        style={{
                          borderColor: COLORS.line,
                          color: COLORS.text,
                        }}
                      >
                        {pageRow.plan}
                      </td>
                      <td
                        className="border-b px-3 text-right tabular-nums"
                        style={{
                          borderColor: COLORS.line,
                          color: COLORS.text,
                        }}
                      >
                        {pageRow.seats}
                      </td>
                      <td
                        className="border-b px-3 text-right tabular-nums"
                        style={{
                          borderColor: COLORS.line,
                          color: monthlyRevenue(pageRow) ? COLORS.ink : COLORS.soft,
                          fontFamily: FONT_MONO,
                          fontSize: 12.5,
                        }}
                      >
                        {monthlyRevenue(pageRow) ? formatMoney(monthlyRevenue(pageRow)) : "-"}
                      </td>
                      <td
                        className="border-b px-3"
                        style={{
                          borderColor: COLORS.line,
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <StatusPill
                          status={pageRow.status}
                          onClick={(event) => openPopover(event, pageRow.id, "status")}
                        />
                      </td>
                      <td
                        className="border-b px-3 tabular-nums"
                        style={{
                          borderColor: COLORS.line,
                          color: COLORS.text,
                        }}
                      >
                        {formatAgo(pageRow.active)}
                      </td>
                      <td
                        className="border-b pr-4 text-right"
                        style={{
                          borderColor: COLORS.line,
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <IconButton
                          icon="ph:dots-three"
                          label={`Actions for ${pageRow.name}`}
                          size={30}
                          onClick={(event) => openPopover(event, pageRow.id, "row")}
                        />
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {pageRows.length === 0 && (
            <div className="grid place-items-center px-5 py-14 text-center">
              <span
                className="grid size-11 place-items-center rounded-[12px]"
                style={{
                  background: COLORS.well,
                  color: COLORS.soft,
                }}
              >
                <Icon name="ph:magnifying-glass" size={20} />
              </span>
              <p
                className="mt-3 text-[14px] font-[560]"
                style={{
                  color: COLORS.ink,
                }}
              >
                No customers match
              </p>
              <p
                className="mt-1 text-[13px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                Try a different search or clear the filters.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setPlanFilter(new Set());
                  setStatusFilter(new Set());
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 px-4 py-3.5 sm:flex-row sm:px-5">
          <span
            className="text-[12.5px] tabular-nums"
            style={{
              color: COLORS.soft,
            }}
          >
            {rows.length
              ? `${page * PAGE_SIZE + 1}-${Math.min(rows.length, page * PAGE_SIZE + PAGE_SIZE)} of ${rows.length}`
              : "0 results"}
          </span>
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <IconButton
              icon="ph:caret-left"
              label="Previous page"
              size={32}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            />
            <LayoutGroup id="pg">
              {Array.from(
                {
                  length: pages,
                },
                (_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-current={index === page ? "page" : undefined}
                    onClick={() => setPage(index)}
                    className="relative grid size-8 place-items-center rounded-[9px] text-[12.5px] font-[540] tabular-nums"
                    style={{
                      color: index === page ? COLORS.ink : COLORS.soft,
                    }}
                  >
                    {index === page && (
                      <motion.span
                        layoutId="pgpill"
                        className="absolute inset-0 rounded-[9px]"
                        style={{
                          background: COLORS.well,
                          boxShadow: "inset 0 0 0 1px var(--line2)",
                        }}
                        transition={SPRING}
                      />
                    )}
                    <span className="relative">{index + 1}</span>
                  </button>
                ),
              )}
            </LayoutGroup>
            <IconButton
              icon="ph:caret-right"
              label="Next page"
              size={32}
              onClick={() => setPage((prev) => Math.min(pages - 1, prev + 1))}
            />
          </nav>
        </div>
        <div ref={popoverPanel}>
          <AnimatePresence>
            {popover && popoverCustomer && (
              <motion.div
                key={popover.kind + popover.id}
                role="menu"
                initial={{
                  opacity: 0,
                  scale: 0.96,
                  y: -4,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.97,
                  transition: {
                    duration: 0.1,
                  },
                }}
                transition={SPRING}
                className="absolute z-40 w-[180px] rounded-[14px] p-1.5"
                style={{
                  left: Math.max(8, popover.x),
                  top: popover.y,
                  background: COLORS.pop,
                  boxShadow: "var(--pop-shadow)",
                  transformOrigin: popover.kind === "row" ? "top right" : "top left",
                }}
              >
                {popover.kind === "status" ? (
                  STATUSES.map((status) => (
                    <MenuItem
                      key={status}
                      onClick={() => setStatus([popover.id], status)}
                      active={popoverCustomer.status === status}
                      right={
                        popoverCustomer.status === status ? (
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
                        <Dot color={STATUS_COLORS[status]} />
                        {status}
                      </span>
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem
                      icon="ph:copy"
                      onClick={() => {
                        try {
                          navigator.clipboard?.writeText(popoverCustomer.email);
                        } catch {}
                        setPopover(null);
                        toast(`Copied ${popoverCustomer.email}`);
                      }}
                    >
                      Copy email
                    </MenuItem>
                    <MenuItem
                      icon="ph:export"
                      onClick={() => {
                        exportCsv([popoverCustomer.id]);
                        setPopover(null);
                      }}
                    >
                      Export row
                    </MenuItem>
                    <div
                      className="my-1 h-px"
                      style={{
                        background: COLORS.line,
                      }}
                    />
                    <MenuItem icon="ph:archive" danger={true} onClick={() => archive([popoverCustomer.id])}>
                      Archive
                    </MenuItem>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <BulkBar
        count={selectedIds.length}
        onClear={() => setSelected(new Set())}
        onArchive={() => archive(selectedIds)}
        onExport={() => exportCsv(selectedIds)}
        onStatus={(status) => {
          setStatus(selectedIds, status);
          toast(`Set ${selectedIds.length} to ${status}`);
        }}
      />
    </Card>
  );
}

type BulkBarProps = {
  count: number;
  onClear: () => void;
  onArchive: () => void;
  onExport: () => void;
  onStatus: (status: string) => void;
};

/** The bar that rises from the bottom while rows are selected. */
function BulkBar({ count, onClear, onArchive, onExport, onStatus }: BulkBarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, statusOpen, () => setStatusOpen(false));
  useEffect(() => {
    if (!count) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatusOpen(false);
    }
  }, [count]);
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{
            y: 90,
            opacity: 0,
            scale: 0.96,
          }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          exit={{
            y: 90,
            opacity: 0,
            scale: 0.96,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30,
          }}
          className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3 lg:left-[256px]"
          role="toolbar"
          aria-label="Bulk actions"
        >
          <div
            className="pointer-events-auto flex items-center gap-1 rounded-[16px] p-1.5 pl-3.5"
            style={{
              background: COLORS.pop,
              boxShadow: "var(--pop-shadow)",
            }}
          >
            <span
              className="mr-1.5 flex items-center gap-1.5 whitespace-nowrap text-[13px] font-[560]"
              style={{
                color: COLORS.ink,
              }}
            >
              <span
                className="grid h-[22px] min-w-[22px] place-items-center rounded-[7px] px-1 text-[12px] text-white"
                style={{
                  background: COLORS.accent,
                }}
              >
                <RollingText text={`${count}`} />
              </span>
              selected
            </span>
            <div ref={box} className="relative">
              <Button kind="ghost" size="sm" icon="ph:circle-half" onClick={() => setStatusOpen((prev) => !prev)}>
                <span className="hidden sm:inline">Set status</span>
              </Button>
              <AnimatePresence>
                {statusOpen && (
                  <motion.div
                    role="menu"
                    initial={{
                      opacity: 0,
                      y: 6,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 6,
                      scale: 0.97,
                    }}
                    transition={SPRING}
                    className="absolute bottom-[calc(100%+10px)] left-0 w-[170px] rounded-[14px] p-1.5"
                    style={{
                      background: COLORS.pop,
                      boxShadow: "var(--pop-shadow)",
                      transformOrigin: "bottom left",
                    }}
                  >
                    {STATUSES.map((status) => (
                      <MenuItem
                        key={status}
                        onClick={() => {
                          onStatus(status);
                          setStatusOpen(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Dot color={STATUS_COLORS[status]} />
                          {status}
                        </span>
                      </MenuItem>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button kind="ghost" size="sm" icon="ph:export" onClick={onExport}>
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button kind="ghost" size="sm" icon="ph:archive" onClick={onArchive}>
              <span className="hidden sm:inline">Archive</span>
            </Button>
            <span
              className="mx-1 h-5 w-px"
              style={{
                background: COLORS.line2,
              }}
            />
            <IconButton icon="ph:x" label="Clear selection" size={32} onClick={onClear} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
