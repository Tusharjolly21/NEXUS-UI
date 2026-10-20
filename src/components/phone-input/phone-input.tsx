"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Country {
  /** ISO 3166-1 alpha-2 code, shown on the country chip. */
  iso: string;
  name: string;
  /** Dialling code including the plus, e.g. "+44". */
  code: string;
  /** Maximum number of digits accepted for the local number. */
  max: number;
  /** Display mask, `#` for a digit, e.g. "(###) ###-####". Defaults to groups of three. */
  pattern?: string;
}

export const COUNTRIES: Country[] = [
  { iso: "US", name: "United States", code: "+1", max: 10, pattern: "(###) ###-####" },
  { iso: "CA", name: "Canada", code: "+1", max: 10, pattern: "(###) ###-####" },
  { iso: "MX", name: "Mexico", code: "+52", max: 10, pattern: "## #### ####" },
  { iso: "GB", name: "United Kingdom", code: "+44", max: 10, pattern: "#### ######" },
  { iso: "FR", name: "France", code: "+33", max: 9, pattern: "# ## ## ## ##" },
  { iso: "DE", name: "Germany", code: "+49", max: 11, pattern: "#### #######" },
  { iso: "IT", name: "Italy", code: "+39", max: 10, pattern: "### ### ####" },
  { iso: "ES", name: "Spain", code: "+34", max: 9, pattern: "### ## ## ##" },
  { iso: "NL", name: "Netherlands", code: "+31", max: 9, pattern: "# ########" },
  { iso: "SE", name: "Sweden", code: "+46", max: 9, pattern: "##-### ## ##" },
  { iso: "IE", name: "Ireland", code: "+353", max: 9, pattern: "## ### ####" },
  { iso: "PT", name: "Portugal", code: "+351", max: 9, pattern: "### ### ###" },
  { iso: "IN", name: "India", code: "+91", max: 10, pattern: "##### #####" },
  { iso: "CN", name: "China", code: "+86", max: 11, pattern: "### #### ####" },
  { iso: "JP", name: "Japan", code: "+81", max: 10, pattern: "##-####-####" },
  { iso: "KR", name: "South Korea", code: "+82", max: 10, pattern: "##-####-####" },
  { iso: "SG", name: "Singapore", code: "+65", max: 8, pattern: "#### ####" },
  { iso: "HK", name: "Hong Kong", code: "+852", max: 8, pattern: "#### ####" },
  { iso: "AU", name: "Australia", code: "+61", max: 9, pattern: "### ### ###" },
  { iso: "NZ", name: "New Zealand", code: "+64", max: 9, pattern: "## ### ####" },
  { iso: "BR", name: "Brazil", code: "+55", max: 11, pattern: "## #####-####" },
  { iso: "AR", name: "Argentina", code: "+54", max: 10, pattern: "## ####-####" },
  { iso: "AE", name: "United Arab Emirates", code: "+971", max: 9, pattern: "## ### ####" },
  { iso: "SA", name: "Saudi Arabia", code: "+966", max: 9, pattern: "## ### ####" },
  { iso: "IL", name: "Israel", code: "+972", max: 9, pattern: "##-###-####" },
  { iso: "EG", name: "Egypt", code: "+20", max: 10, pattern: "### ### ####" },
  { iso: "ZA", name: "South Africa", code: "+27", max: 9, pattern: "## ### ####" },
  { iso: "TR", name: "Turkey", code: "+90", max: 10, pattern: "### ### ## ##" },
  { iso: "RU", name: "Russia", code: "+7", max: 10, pattern: "### ###-##-##" },
];

export interface PhoneInputValue {
  iso: string;
  code: string;
  /** Digits only, without the dialling code. */
  number: string;
  isValid: boolean;
}

export interface PhoneInputProps {
  /** ISO 3166-1 alpha-2 code of the country selected at first. */
  defaultCountry?: string;
  /** Placeholder for the number. Defaults to an example in the country's format. */
  placeholder?: string;
  /** Visible label above the field (also its accessible name). */
  label?: string;
  /** Digits needed before the number counts as valid. Defaults to the country's full length. */
  minDigits?: number;
  /** The countries to offer. */
  countries?: Country[];
  /** Called with the country and digits whenever the user types or picks a country. */
  onChange?: (value: PhoneInputValue) => void;
  /** Types a few example numbers, switching country between them, until someone touches it. */
  autoplay?: boolean;
  className?: string;
}

/** Chip tints, picked by a stable hash of the ISO code. */
const TINTS = [
  ["#e8f1fe", "#0059b3", "#0a2b4d", "#7cb8ff"],
  ["#e9f8ee", "#1b7a35", "#0f2e19", "#6fe08f"],
  ["#fff3e0", "#a35a00", "#3a2405", "#ffc266"],
  ["#f6edfc", "#8a3fb5", "#2c1638", "#d9a6f5"],
  ["#ffecea", "#b3261e", "#3d1210", "#ff9e97"],
] as const;
const tintOf = (iso: string) => TINTS[(iso.charCodeAt(0) * 7 + (iso.charCodeAt(1) || 0)) % TINTS.length];

const SAMPLE = "2015550123456";
const DEMO: { iso: string; digits: string }[] = [
  { iso: "US", digits: "4155550132" },
  { iso: "GB", digits: "7700900461" },
  { iso: "JP", digits: "9012345678" },
  { iso: "DE", digits: "15112345678" },
];

function patternFor(c: Country) {
  if (c.pattern) return c.pattern;
  const groups: string[] = [];
  let left = c.max;
  while (left > 4) {
    groups.push("###");
    left -= 3;
  }
  groups.push("#".repeat(left));
  return groups.join(" ");
}

/** Fills the mask with as many digits as there are, so separators only appear once they're needed. */
function format(digits: string, pattern: string) {
  let out = "";
  let i = 0;
  for (const ch of pattern) {
    if (i >= digits.length) break;
    if (ch === "#") out += digits[i++];
    else out += ch;
  }
  return out + digits.slice(i);
}

function Chip({ iso }: { iso: string }) {
  const [bg, fg, dbg, dfg] = tintOf(iso);
  return (
    <span
      className="inline-grid h-[22px] w-[30px] place-items-center rounded-[6px] bg-[var(--chip-bg)] text-[10.5px] font-bold tracking-[0.04em] text-[var(--chip-fg)] dark:bg-[var(--chip-dbg)] dark:text-[var(--chip-dfg)]"
      style={{ "--chip-bg": bg, "--chip-fg": fg, "--chip-dbg": dbg, "--chip-dfg": dfg } as CSSProperties}
      aria-hidden="true"
    >
      {iso}
    </span>
  );
}

/**
 * A phone field with a country picker. Digits drop into place with a small
 * overshoot as they're typed, the mask fills in its own separators, a
 * hairline under the field fills toward a complete number, and the country
 * chip flips over when you pick another country.
 */
export function PhoneInput({
  defaultCountry = "US",
  placeholder,
  label,
  minDigits,
  countries = COUNTRIES,
  onChange,
  autoplay = false,
  className,
}: PhoneInputProps) {
  const uid = useId().replace(/:/g, "");
  const still = useReducedMotion() === true;
  const list = countries.length ? countries : COUNTRIES;
  const [iso, setIso] = useState(() => (list.some((c) => c.iso === defaultCountry) ? defaultCountry : list[0].iso));
  const [digits, setDigits] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [blurred, setBlurred] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const shakeX = useMotionValue(0);

  const country = list.find((c) => c.iso === iso) ?? list[0];
  const pattern = patternFor(country);
  const need = Math.max(1, Math.min(country.max, minDigits ?? country.max));
  const valid = digits.length >= need;
  const showError = blurred && !focused && digits.length > 0 && !valid;
  const shown = format(digits, pattern);
  const example = placeholder ?? format(SAMPLE.slice(0, country.max), pattern);

  const fill = useSpring(0, { stiffness: 260, damping: 24 });
  const fillWidth = useTransform(fill, (f) => `${Math.max(0, Math.min(1, f)) * 100}%`);
  useEffect(() => {
    fill.set(digits.length / country.max);
  }, [digits.length, country.max, fill]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.code.includes(q) || c.iso.toLowerCase() === q);
  }, [list, query]);

  const emit = (nextIso: string, nextDigits: string) => {
    const c = list.find((x) => x.iso === nextIso) ?? list[0];
    const n = Math.max(1, Math.min(c.max, minDigits ?? c.max));
    onChange?.({ iso: c.iso, code: c.code, number: nextDigits, isValid: nextDigits.length >= n });
  };

  const touch = () => {
    touched.current = true;
  };

  // Close the picker on an outside press.
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => search.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Keep the highlighted option in view while arrowing through the list.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    let typed = 0;
    let hold = 0;
    let phase: "type" | "hold" | "clear" = "type";
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const demo = DEMO[k % DEMO.length];
      if (phase === "type") {
        typed += 1;
        setDigits(demo.digits.slice(0, typed));
        if (typed >= demo.digits.length) phase = "hold";
      } else if (phase === "hold") {
        hold += 1;
        if (hold > 14) {
          phase = "clear";
          hold = 0;
        }
      } else {
        typed = Math.max(0, typed - 3);
        setDigits(demo.digits.slice(0, typed));
        if (typed === 0) {
          k += 1;
          setIso(DEMO[k % DEMO.length].iso);
          phase = "type";
        }
      }
    }, 120);
    return () => clearInterval(t);
  }, [autoplay]);

  const choose = (c: Country) => {
    const next = digits.slice(0, c.max);
    setIso(c.iso);
    setDigits(next);
    setOpen(false);
    setQuery("");
    emit(c.iso, next);
    requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  };

  const openPicker = () => {
    touch();
    setQuery("");
    setActive(Math.max(0, list.findIndex((c) => c.iso === iso)));
    setOpen(true);
  };

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (filtered.length ? (a + d + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = filtered[active];
      if (c) choose(c);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
    }
  };

  const onBlur = () => {
    setFocused(false);
    setBlurred(true);
    if (digits.length > 0 && digits.length < need && !still) {
      animate(shakeX, [0, -7, 6, -4, 3, 0], { duration: 0.42 });
    }
  };

  const helpId = `${uid}-help`;
  const labelId = `${uid}-label`;
  let help = "Type a number, or pick a country.";
  if (showError) help = `Add ${need - digits.length} more digit${need - digits.length === 1 ? "" : "s"}.`;
  else if (valid) help = `${country.code} ${shown}`;

  let d = 0;
  const glyphs = shown.split("").map((ch, i) => {
    if (/\d/.test(ch)) {
      const n = d++;
      return (
        <motion.span
          key={`d${n}`}
          className="inline-block"
          initial={still ? false : { y: -9, scale: 1.35, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 640, damping: 17, mass: 0.6 }}
        >
          {ch}
        </motion.span>
      );
    }
    return (
      <span key={`s${i}`} className="text-[#86868b] dark:text-[#98989d]">
        {ch}
      </span>
    );
  });

  return (
    <div ref={root} className={cn("relative w-full max-w-[340px]", className)} onPointerDown={touch} onKeyDown={touch}>
      {label ? (
        <span id={labelId} className="mb-1.5 block text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
          {label}
        </span>
      ) : null}
      <motion.div
        style={{ x: shakeX }}
        className={cn(
          "relative flex h-[54px] items-stretch overflow-hidden rounded-[16px] bg-white transition-shadow duration-200 dark:bg-[#1c1c1e]",
          focused
            ? "shadow-[0_0_0_1.5px_#0071e3,0_0_0_5px_rgba(0,113,227,.16)] dark:shadow-[0_0_0_1.5px_#0a84ff,0_0_0_5px_rgba(10,132,255,.22)]"
            : showError
              ? "shadow-[0_0_0_1.5px_#ff3b30,0_0_0_5px_rgba(255,59,48,.12)]"
              : "shadow-[0_0_0_1px_rgba(0,0,0,.08),0_14px_30px_-22px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_14px_30px_-22px_rgba(0,0,0,.9)]",
        )}
      >
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openPicker())}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              openPicker();
            }
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${uid}-list`}
          aria-label={`Country: ${country.name} ${country.code}. Change country`}
          className="flex shrink-0 items-center gap-2 pl-3 pr-2.5 outline-none transition-colors hover:bg-[#f5f5f7] focus-visible:bg-[#f0f0f3] dark:hover:bg-[#2c2c2e] dark:focus-visible:bg-[#2c2c2e]"
        >
          <span className="relative inline-grid" style={{ perspective: 300 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={iso}
                className="inline-grid"
                initial={still ? { opacity: 0 } : { rotateX: -100, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={still ? { opacity: 0 } : { rotateX: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
              >
                <Chip iso={iso} />
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="min-w-[2.6em] text-left text-[15px] font-medium tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{country.code}</span>
          <motion.svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden="true"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="text-[#86868b] dark:text-[#98989d]"
          >
            <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>
        <span className="my-3 w-px bg-[#e5e5ea] dark:bg-[#3a3a3c]" aria-hidden="true" />
        <div className="relative min-w-0 flex-1">
          <input
            ref={input}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={shown}
            placeholder={example}
            onChange={(e) => {
              touch();
              const next = e.target.value.replace(/\D/g, "").slice(0, country.max);
              setDigits(next);
              emit(iso, next);
            }}
            onFocus={() => setFocused(true)}
            onBlur={onBlur}
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : "Phone number"}
            aria-invalid={showError || undefined}
            aria-describedby={helpId}
            className="h-full w-full bg-transparent pl-3 pr-10 text-[17px] tracking-[0.01em] text-transparent tabular-nums caret-[#0071e3] outline-none [font-kerning:none] placeholder:text-[#a1a1a6] dark:caret-[#0a84ff] dark:placeholder:text-[#636366]"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-pre pl-3 text-[17px] tracking-[0.01em] text-[#1d1d1f] tabular-nums [font-kerning:none] dark:text-[#f5f5f7]"
            aria-hidden="true"
          >
            {glyphs}
          </div>
          <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <motion.circle cx="10" cy="10" r="9" fill="#30d158" initial={false} animate={{ scale: valid ? 1 : 0 }} transition={{ type: "spring", stiffness: 520, damping: 18 }} style={{ originX: "50%", originY: "50%" }} />
            <motion.path
              d="M6 10.2 8.6 12.8 14 7.4"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ pathLength: valid ? 1 : 0, opacity: valid ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24, delay: valid ? 0.08 : 0 }}
            />
          </svg>
        </div>
        <motion.span
          className={cn("absolute bottom-0 left-0 h-[2px] rounded-full", valid ? "bg-[#30d158]" : "bg-[#0071e3] dark:bg-[#0a84ff]")}
          style={{ width: fillWidth }}
          aria-hidden="true"
        />
      </motion.div>
      <p
        id={helpId}
        aria-live="polite"
        className={cn(
          "mt-2 px-1 text-[12px] tabular-nums",
          showError ? "text-[#d70015] dark:text-[#ff6961]" : valid ? "text-[#1b7a35] dark:text-[#30d158]" : "text-[#6e6e73] dark:text-[#a1a1a6]",
        )}
      >
        {help}
      </p>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={still ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={still ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.14 } }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            style={{ transformOrigin: "24px 0px", top: label ? 84 : 62 }}
            className="absolute left-0 right-0 z-50 overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_48px_-20px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_48px_-20px_rgba(0,0,0,.9)]"
          >
            <div className="p-2">
              <input
                ref={search}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onSearchKey}
                role="combobox"
                aria-expanded="true"
                aria-controls={`${uid}-list`}
                aria-activedescendant={filtered[active] ? `${uid}-opt-${filtered[active].iso}` : undefined}
                aria-label="Search countries"
                placeholder="Search country or code"
                className="h-9 w-full rounded-[10px] bg-[#f0f0f3] px-3 text-[14px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:placeholder:text-[#98989d] dark:focus-visible:ring-[#0a84ff]"
              />
            </div>
            <div ref={listRef} id={`${uid}-list`} role="listbox" aria-label="Countries" className="max-h-[188px] overflow-y-auto px-1.5 pb-1.5">
              {filtered.length === 0 ? (
                <p className="px-3 py-5 text-center text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">No country matches.</p>
              ) : (
                filtered.map((c, i) => {
                  const selected = c.iso === iso;
                  return (
                    <div
                      key={c.iso}
                      id={`${uid}-opt-${c.iso}`}
                      data-index={i}
                      role="option"
                      aria-selected={selected}
                      onPointerMove={() => setActive(i)}
                      onClick={() => choose(c)}
                      className={cn(
                        "relative flex h-10 cursor-pointer items-center gap-3 rounded-[10px] px-2.5 text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]",
                      )}
                    >
                      {i === active ? (
                        <motion.span
                          layoutId={`${uid}-hl`}
                          className="absolute inset-0 rounded-[10px] bg-[#f0f0f3] dark:bg-[#3a3a3c]"
                          transition={{ type: "spring", stiffness: 600, damping: 40 }}
                        />
                      ) : null}
                      <span className="relative">
                        <Chip iso={c.iso} />
                      </span>
                      <span className="relative flex-1 truncate">{c.name}</span>
                      <span className="relative text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{c.code}</span>
                      <span className="relative w-3.5">
                        {selected ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="text-[#0071e3] dark:text-[#0a84ff]">
                            <path d="M3 7.2 5.8 10 11 4.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
