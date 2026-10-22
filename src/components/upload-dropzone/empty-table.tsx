"use client";
import { useEffect, useRef, useState, type DragEvent, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface EmptyTableData {
  /** File name shown in the row count ("248 rows from customers.csv"). */
  file: string;
  /** Column headings (up to four are shown). */
  cols: string[];
  /** The detected type badge of each column. */
  kinds: string[];
  /** The first rows, one array of cells per row. */
  rows: string[][];
  /** Total number of rows the count rolls up to. */
  total: number;
}

export interface EmptyTableProps {
  /** Heading of the table card. */
  title?: string;
  /** The table "Use sample data" loads, and the columns the ghost header shows. Defaults to a small customers file. */
  sample?: EmptyTableData;
  /** Called with the parsed table after a CSV is dropped or chosen, or the sample is loaded by hand. */
  onImport?: (table: EmptyTableData) => void;
  /** Drops the sample file in, shows the import, clears it and repeats, until someone touches the component. Never runs under reduced motion and pauses when off screen. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const EMPTY_TABLE_SAMPLE: EmptyTableData = {
  file: "customers.csv",
  cols: ["Name", "Email", "Plan", "MRR"],
  kinds: ["Text", "Email", "Option", "Currency"],
  rows: [
    ["Maya Chen", "maya@orbitly.example", "Pro", "$480"],
    ["Leo Park", "leo@northwind.example", "Team", "$1,200"],
    ["Ana Lima", "ana@vela.example", "Pro", "$480"],
    ["Kai Ito", "kai@quadrant.example", "Starter", "$90"],
    ["Noor Haddad", "noor@meridian.example", "Team", "$1,200"],
  ],
  total: 248,
};

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const MAX_BYTES = 2_000_000;

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

function guessKind(v: string) {
  if (/^\S+@\S+\.\S+$/.test(v)) return "Email";
  if (/^[$€£]?\s?[\d,.]+$/.test(v)) return /[$€£]/.test(v) ? "Currency" : "Number";
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return "Date";
  return "Text";
}

/** Reads a CSV in the browser: the header and the first five rows, with a type guessed from the first row. Nothing is uploaded. */
function parseCsv(name: string, text: string): EmptyTableData | null {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return null;
  const split = (l: string) => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.replace(/^"|"$/g, "").trim());
  const cols = split(lines[0]).slice(0, 4);
  const rows = lines.slice(1, 6).map((l) => split(l).slice(0, 4));
  return { file: name, cols, kinds: cols.map((_, i) => guessKind(rows[0]?.[i] ?? "")), rows, total: lines.length - 1 };
}

const template = (n: number) => (n === 4 ? "minmax(0,1.1fr) minmax(0,1.5fr) minmax(0,.95fr) minmax(0,.85fr)" : `repeat(${Math.max(1, n)}, minmax(0,1fr))`);

/**
 * An empty table that shows you exactly what goes where. Ghost columns wait
 * for data; drop a CSV (or take the sample) and a scan line reads down the
 * table while each cell fills in reading order, the columns label their
 * detected types, and the row count rolls up to the total. The file is read
 * in the browser and never sent anywhere. Under reduced motion the cells
 * simply fade in and the count settles quickly.
 */
export function EmptyTable({ title = "Customers", sample = EMPTY_TABLE_SAMPLE, onImport, autoplay = false, enableSound = true, className }: EmptyTableProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const root = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const raf = useRef(0);
  const touched = useRef(false);
  const [data, setData] = useState<EmptyTableData | null>(null);
  const [over, setOver] = useState(false);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(false);
  const active = useDemoActive(root, autoplay && !reduce);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /** Shows a table and rolls the row count up to its total; the done sound plays when the count lands. */
  const load = (t: EmptyTableData, from: "user" | "auto") => {
    cancelAnimationFrame(raf.current);
    setError(false);
    setData(t);
    setCount(0);
    if (from === "user") onImport?.(t);
    const delay = reduce ? 0 : 700;
    const span = reduce ? 250 : 900;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const k = Math.min(1, (now - t0 - delay) / span);
      setCount(Math.max(0, Math.round(t.total * (1 - Math.pow(1 - Math.max(0, k), 3)))));
      if (k < 1) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      if (from === "user") play("done", 0.5);
      else play.auto("done", 0.5);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const clear = () => {
    cancelAnimationFrame(raf.current);
    setData(null);
  };
  const readFile = (f?: File) => {
    if (!f) return;
    touched.current = true;
    if (f.size > MAX_BYTES) {
      setError(true);
      return;
    }
    void f.text().then((txt) => {
      const t = parseCsv(f.name, txt);
      if (t) load(t, "user");
      else setError(true);
    });
  };

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ load, clear });
  useEffect(() => {
    latest.current = { load, clear };
  });

  // Demo: drag the sample over, drop it, read the table, clear it, repeat.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    let alive = true;
    const go = (fn: () => void, t: number) =>
      ids.push(
        window.setTimeout(() => {
          if (alive && !touched.current) fn();
        }, t),
      );
    const loop = () => {
      if (!alive || touched.current) return;
      go(() => latest.current.clear(), 50);
      go(() => setOver(true), 1000);
      go(() => {
        setOver(false);
        latest.current.load(sample, "auto");
      }, 1900);
      go(() => latest.current.clear(), 7000);
      ids.push(window.setTimeout(loop, 7400));
    };
    loop();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
      setOver(false);
    };
  }, [autoplay, reduce, active, sample]);

  const cols = data?.cols ?? sample.cols;
  const grid = { gridTemplateColumns: template(cols.length) };
  const drag = {
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      touched.current = true;
      setOver(true);
    },
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setOver(false);
      readFile(e.dataTransfer.files[0]);
    },
  };

  return (
    <div
      ref={root}
      className={cn(
        "w-[560px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      {...drag}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h3>
          <div className="text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{data ? `${count} rows from ${data.file}` : "No data yet"}</div>
        </div>
        {data && (
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              clear();
            }}
            className={cn("h-8 rounded-full bg-[#f5f5f7] px-3.5 text-[12.5px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]", FOCUS)}
          >
            Clear
          </button>
        )}
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {data ? `Imported ${data.total} rows from ${data.file}` : error ? "That file could not be read as a CSV" : ""}
      </span>
      <div role={data ? "table" : undefined} aria-label={data ? `${title} preview` : undefined} className="relative mt-4 overflow-hidden rounded-[16px] border border-black/[.07] dark:border-white/[.08]">
        {/* header: becomes typed columns once data lands */}
        <div role={data ? "row" : undefined} aria-hidden={data ? undefined : true} className="grid border-b border-black/[.07] bg-[#fafafa] dark:border-white/[.08] dark:bg-white/[.04]" style={grid}>
          {cols.map((c, i) => (
            <div key={i} role={data ? "columnheader" : undefined} className="flex min-w-0 items-center gap-1.5 px-3 py-2.5">
              <span className={cn("min-w-0 truncate text-[12px] font-semibold", data ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#c7c7cc] dark:text-[#48484a]")}>{c}</span>
              <AnimatePresence>
                {data && (
                  <motion.span
                    className="hidden flex-none rounded-[5px] bg-[#eef5ff] px-1 py-[1px] text-[9.5px] font-semibold text-[#0071e3] sm:inline dark:bg-[#0a84ff]/20 dark:text-[#6cb4ff]"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: reduce ? 0 : 1.1 + i * 0.08 }}
                  >
                    {data.kinds[i]}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <div className="relative h-[230px]">
          <AnimatePresence mode="wait" initial={false}>
            {data ? (
              <motion.div key={"rows" + data.file} role="rowgroup" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {data.rows.map((r, ri) => (
                  <div key={ri} role="row" className="grid border-b border-black/[.05] dark:border-white/[.06]" style={grid}>
                    {r.map((cell, ci) => (
                      <motion.span
                        key={ci}
                        role="cell"
                        className={cn("truncate px-3 py-2.5 text-[13px]", ci === 1 ? "text-[#6e6e73] dark:text-[#a1a1a6]" : "text-[#1d1d1f] dark:text-[#f5f5f7]", ci === 3 && "tabular-nums")}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(5px)", x: -4 }}
                        animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                        transition={reduce ? { duration: 0.15 } : { delay: 0.25 + ri * 0.13 + ci * 0.04, duration: 0.3 }}
                      >
                        {cell}
                      </motion.span>
                    ))}
                  </div>
                ))}
                {/* the scan line reading down the table */}
                {!reduce && (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-[#0071e3]/10 to-transparent dark:via-[#0a84ff]/20"
                    initial={{ top: -40 }}
                    animate={{ top: 240, opacity: [1, 1, 0] }}
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                  >
                    <span className="absolute inset-x-0 top-1/2 h-px bg-[#0071e3]/50 dark:bg-[#0a84ff]/60" />
                  </motion.span>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                {/* ghost rows show the shape of what goes here */}
                <div aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <div key={k} className="grid border-b border-dashed border-black/[.06] dark:border-white/[.08]" style={grid}>
                      {[60, 80, 40, 50].slice(0, cols.length).map((w, c) => (
                        <span key={c} className="px-3 py-[15px]">
                          <span className="block h-2 rounded-full bg-[#f2f2f5] dark:bg-white/[.07]" style={{ width: `${w - k * 4}%` }} />
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center px-3 text-center backdrop-blur-[1.5px] transition-colors duration-200",
                    over ? "bg-[#eef5ff]/85 dark:bg-[#0a2540]/85" : "bg-white/70 dark:bg-[#1c1c1e]/70",
                  )}
                >
                  <motion.span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08),0_8px_18px_-10px_rgba(0,0,0,.3)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_8px_18px_-10px_rgba(0,0,0,.8)]"
                    animate={reduce ? undefined : { y: over ? -6 : 0, scale: over ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
                      <path d="M14 3v5h5M9 13h6M9 17h6" />
                    </svg>
                  </motion.span>
                  <span className="mt-3 text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{over ? "Drop to import" : "Bring in your customers"}</span>
                  <span className={cn("mt-0.5 text-[13px]", error ? "text-[#d70015] dark:text-[#ff453a]" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>
                    {error ? "That didn't look like a CSV with a header row. Try another." : "Drop a CSV here. We'll detect the columns."}
                  </span>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        touched.current = true;
                        play("tap");
                        file.current?.click();
                      }}
                      className={cn("h-8 rounded-full bg-[#1d1d1f] px-3.5 text-[12.5px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
                    >
                      Upload CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        touched.current = true;
                        play("tap");
                        load(sample, "user");
                      }}
                      className={cn(
                        "h-8 rounded-full bg-white px-3.5 text-[12.5px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.1)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.12)]",
                        FOCUS,
                      )}
                    >
                      Use sample data
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <input
        ref={file}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          readFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
