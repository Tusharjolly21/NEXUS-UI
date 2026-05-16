"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Country {
  iso: string;
  name: string;
  code: string;
  /** Maximum number of digits accepted for the local number. */
  max: number;
}

export const COUNTRIES: Country[] = [
  { iso: "US", name: "United States", code: "+1", max: 10 },
  { iso: "CA", name: "Canada", code: "+1", max: 10 },
  { iso: "MX", name: "Mexico", code: "+52", max: 10 },
  { iso: "GB", name: "United Kingdom", code: "+44", max: 10 },
  { iso: "FR", name: "France", code: "+33", max: 9 },
  { iso: "DE", name: "Germany", code: "+49", max: 11 },
  { iso: "IT", name: "Italy", code: "+39", max: 10 },
  { iso: "ES", name: "Spain", code: "+34", max: 9 },
  { iso: "NL", name: "Netherlands", code: "+31", max: 9 },
  { iso: "SE", name: "Sweden", code: "+46", max: 9 },
  { iso: "IE", name: "Ireland", code: "+353", max: 9 },
  { iso: "PT", name: "Portugal", code: "+351", max: 9 },
  { iso: "IN", name: "India", code: "+91", max: 10 },
  { iso: "CN", name: "China", code: "+86", max: 11 },
  { iso: "JP", name: "Japan", code: "+81", max: 10 },
  { iso: "KR", name: "South Korea", code: "+82", max: 10 },
  { iso: "SG", name: "Singapore", code: "+65", max: 8 },
  { iso: "HK", name: "Hong Kong", code: "+852", max: 8 },
  { iso: "AU", name: "Australia", code: "+61", max: 9 },
  { iso: "NZ", name: "New Zealand", code: "+64", max: 9 },
  { iso: "BR", name: "Brazil", code: "+55", max: 11 },
  { iso: "AR", name: "Argentina", code: "+54", max: 10 },
  { iso: "AE", name: "United Arab Emirates", code: "+971", max: 9 },
  { iso: "SA", name: "Saudi Arabia", code: "+966", max: 9 },
  { iso: "IL", name: "Israel", code: "+972", max: 9 },
  { iso: "EG", name: "Egypt", code: "+20", max: 10 },
  { iso: "ZA", name: "South Africa", code: "+27", max: 9 },
  { iso: "TR", name: "Turkey", code: "+90", max: 10 },
  { iso: "RU", name: "Russia", code: "+7", max: 10 },
];

/** ISO 3166-1 alpha-2 → flag emoji via regional indicator symbols. */
function flagFromIso(iso: string): string {
  return iso
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

/** Insert a space every 3 digits. Lightweight visual grouping that works for most locales. */
function formatDigits(digits: string): string {
  if (!digits) return "";
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 3) {
    groups.push(digits.slice(i, i + 3));
  }
  return groups.join(" ");
}

export interface PhoneInputValue {
  iso: string;
  code: string;
  number: string;
  isValid: boolean;
}

export interface PhoneInputProps {
  /** ISO 3166-1 alpha-2 for the initially selected country. */
  defaultCountry?: string;
  placeholder?: string;
  label?: string;
  /** Minimum digits required for a number to be considered valid. */
  minDigits?: number;
  onChange?: (value: PhoneInputValue) => void;
  className?: string;
}

export function PhoneInput({
  defaultCountry = "US",
  placeholder = "Phone number",
  label,
  minDigits = 7,
  onChange,
  className,
}: PhoneInputProps) {
  const [selectedIso, setSelectedIso] = useState(defaultCountry);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [digits, setDigits] = useState("");
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.iso === selectedIso) ?? COUNTRIES[0],
    [selectedIso],
  );

  const isValid = digits.length >= minDigits;
  const hasError = touched && !focused && digits.length > 0 && !isValid;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [search]);

  // Emit changes
  useEffect(() => {
    onChange?.({
      iso: selected.iso,
      code: selected.code,
      number: digits,
      isValid,
    });
  }, [selected.iso, selected.code, digits, isValid, onChange]);

  // Outside click closes dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Escape closes dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Autofocus search when dropdown opens
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const handleDigitsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      setDigits(raw.slice(0, selected.max));
    },
    [selected.max],
  );

  const handleSelect = useCallback((iso: string) => {
    setSelectedIso(iso);
    setOpen(false);
    setSearch("");
    requestAnimationFrame(() => phoneInputRef.current?.focus());
  }, []);

  const handleTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  // Border / glow color reflects state (focus → primary, error → red, idle → gray)
  const ringColor = focused
    ? "rgb(99,102,241)"
    : hasError
      ? "rgb(239,68,68)"
      : "rgb(229,231,235)";
  const ringShadow = focused
    ? "0 0 0 4px rgba(99,102,241,0.14), 0 1px 2px rgba(0,0,0,0.03)"
    : hasError
      ? "0 0 0 4px rgba(239,68,68,0.10)"
      : "0 1px 2px rgba(0,0,0,0.03)";
  const surfaceBg = focused ? "rgb(255,255,255)" : "rgb(250,250,250)";

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      )}

      <motion.div
        animate={{
          borderColor: ringColor,
          boxShadow: ringShadow,
          backgroundColor: surfaceBg,
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-stretch overflow-hidden rounded-xl border"
      >
        {/* Country selector trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          onKeyDown={handleTriggerKey}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country: ${selected.name}`}
          className="flex shrink-0 items-center gap-2 border-r border-gray-200 px-3 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
        >
          <span className="text-lg leading-none" aria-hidden>
            {flagFromIso(selected.iso)}
          </span>
          <span className="text-sm font-medium text-gray-900">{selected.code}</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-gray-400"
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </button>

        {/* Phone number input */}
        <div className="relative flex-1">
          <input
            ref={phoneInputRef}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={formatDigits(digits)}
            onChange={handleDigitsChange}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setTouched(true);
            }}
            placeholder={placeholder}
            aria-label={label ?? "Phone number"}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? "phone-input-error" : undefined}
            className="h-12 w-full bg-transparent px-3 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />

          {/* Validity check icon — only shown when valid and not focused */}
          <AnimatePresence>
            {isValid && !focused && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                aria-hidden
              >
                <Check className="size-4" strokeWidth={2.5} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            id="phone-input-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500"
          >
            <AlertCircle className="size-3.5" />
            That number looks too short — please add the remaining digits.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Country dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top center" }}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18),0_4px_8px_-2px_rgba(15,23,42,0.06)]"
            role="listbox"
            aria-label="Country list"
          >
            <div className="border-b border-gray-100 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code"
                  aria-label="Search countries"
                  className="h-9 w-full rounded-md bg-gray-50 pl-8 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:bg-gray-100"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-gray-400">
                  No countries match &ldquo;{search}&rdquo;
                </div>
              ) : (
                filtered.map((c) => {
                  const isSelected = c.iso === selected.iso;
                  return (
                    <button
                      key={c.iso}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(c.iso)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-indigo-50 text-indigo-900"
                          : "text-gray-900 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none",
                      )}
                    >
                      <span className="text-base leading-none" aria-hidden>
                        {flagFromIso(c.iso)}
                      </span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          isSelected ? "text-indigo-500" : "text-gray-400",
                        )}
                      >
                        {c.code}
                      </span>
                      {isSelected && (
                        <Check className="size-4 text-indigo-500" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
