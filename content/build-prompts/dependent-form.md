# Dependent Form

Add the "Dependent Form" component from Nexus UI to my project.

A billing form whose fields follow your answers. Choose Business and the company fields unfold from the row above, hanging off a line that shows what they depend on. Change country and the fields that keep their meaning simply relabel, while the ones that no longer apply fold away.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { DependentForm } from "@/components/dependent-form";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/dependent-form/dependent-form.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Kind = "Personal" | "Business";
type Country = "United States" | "United Kingdom" | "India";
const COUNTRIES: { v: Country; short: string }[] = [
  { v: "United States", short: "US" },
  { v: "United Kingdom", short: "UK" },
  { v: "India", short: "India" },
];
/** What each country asks for. Fields that keep their meaning stay put and relabel; the rest fold away. */
const ADDRESS: Record<Country, { region?: { label: string; options: string[] }; postal: { label: string; placeholder: string } }> = {
  "United States": { region: { label: "State", options: ["California", "New York", "Texas", "Washington"] }, postal: { label: "ZIP code", placeholder: "94103" } },
  "United Kingdom": { postal: { label: "Postcode", placeholder: "SW1A 1AA" } },
  India: { region: { label: "State", options: ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu"] }, postal: { label: "PIN code", placeholder: "560001" } },
};
const SPRING = { type: "spring", stiffness: 420, damping: 36 } as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * DependentForm: a billing form whose fields follow your answers. Switch to Business and the company fields unfold out
 * of the row above, hanging off a line that shows what they depend on. Change country and the address re-forms: fields
 * that mean the same thing stay where they are and simply relabel (ZIP code becomes Postcode), fields that no longer
 * apply fold away, and everything below slides to its new place instead of jumping.
 *
 * `onSubmit` receives the answers. `autoplay` plays through the choices until the first real interaction.
 */
export function DependentForm({ autoplay = false, onSubmit }: { autoplay?: boolean; onSubmit?: (v: Record<string, string>) => void }) {
  const reduce = useReducedMotion();
  const [kind, setKind] = useState<Kind>("Personal");
  const [country, setCountry] = useState<Country>("United States");
  const [v, setV] = useState<Record<string, string>>({ email: "", company: "", vat: "", region: "", postal: "" });
  const touched = useRef(false);
  const addr = ADDRESS[country];

  const set = (k: string, val: string) => setV((s) => ({ ...s, [k]: val }));
  const pickCountry = (c: Country) => { setCountry(c); setV((s) => ({ ...s, region: "" })); };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const go = async (fn: () => unknown, wait: number) => { if (!live || touched.current) return false; fn(); await sleep(wait); return live && !touched.current; };
    const type = async (k: string, text: string) => { for (let i = 1; i <= text.length; i++) if (!(await go(() => set(k, text.slice(0, i)), 60))) return false; return true; };
    (async () => {
      await sleep(1000);
      while (live && !touched.current) {
        if (!(await go(() => setKind("Business"), 1300))) break;
        if (!(await type("company", "Orchard Labs"))) break;
        if (!(await go(() => {}, 900))) break;
        if (!(await go(() => pickCountry("United Kingdom"), 1700))) break;
        if (!(await go(() => pickCountry("India"), 1700))) break;
        if (!(await go(() => set("region", "Karnataka"), 1100))) break;
        if (!(await go(() => setKind("Personal"), 1500))) break;
        if (!(await go(() => { pickCountry("United States"); setV({ email: "", company: "", vat: "", region: "", postal: "" }); }, 1600))) break;
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const take = () => { touched.current = true; };

  return (
    <form
      noValidate
      onSubmit={(e) => { e.preventDefault(); onSubmit?.({ kind, country, ...v }); }}
      onPointerDownCapture={take}
      onKeyDownCapture={take}
      className="w-full max-w-[420px] rounded-[24px] bg-white px-7 pb-7 pt-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
    >
      <h3 className="m-0 text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Billing details</h3>
      <p className="m-0 mt-1 text-[14px] text-[#6e6e73]">Used on your invoices.</p>

      <motion.div layout transition={SPRING} className="mt-5 flex flex-col">
        <Label>Account</Label>
        <Segmented name="Account" options={["Personal", "Business"]} value={kind} onChange={(x) => setKind(x as Kind)} />
        <Branch show={kind === "Business"}>
          <Fold key="company"><Field id="company" label="Company name" value={v.company} placeholder="Orchard Labs Ltd" onChange={(x) => set("company", x)} /></Fold>
          <Fold key="vat"><Field id="vat" label="VAT number" value={v.vat} placeholder="Optional" onChange={(x) => set("vat", x)} /></Fold>
        </Branch>

        <motion.div layout="position" transition={SPRING} className="mt-5">
          <Label>Country</Label>
          <Segmented name="Country" options={COUNTRIES.map((c) => c.short)} value={COUNTRIES.find((c) => c.v === country)!.short} onChange={(x) => pickCountry(COUNTRIES.find((c) => c.short === x)!.v)} />
        </motion.div>
        <Branch show>
          {addr.region && (
            <Fold key="region">
              <Select id="region" label={addr.region.label} value={v.region} options={addr.region.options} swap={country} onChange={(x) => set("region", x)} />
            </Fold>
          )}
          <Fold key="postal">
            <Field id="postal" label={addr.postal.label} value={v.postal} placeholder={addr.postal.placeholder} onChange={(x) => set("postal", x)} />
          </Fold>
        </Branch>

        <motion.div layout="position" transition={SPRING} className="mt-5">
          <Field id="email" label="Email for receipts" type="email" value={v.email} placeholder="you@example.com" onChange={(x) => set("email", x)} />
        </motion.div>
        <motion.div layout="position" transition={SPRING} className="mt-6">
          <motion.button type="submit" whileTap={{ scale: 0.97 }} className="h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-medium text-white outline-none focus-visible:ring-4 focus-visible:ring-[#0071e3]/30">
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </form>
  );
}

/* ------------------------------------------------------------------ dependent fields hang off a line from the question above */
function Branch({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div key="b" layout="position" initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={SPRING} className="relative overflow-hidden pl-[18px]">
          <motion.span aria-hidden="true" className="absolute left-[7px] top-0 w-px origin-top bg-[#d2d2d7]" style={{ bottom: 23 }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }} transition={SPRING} />
          <div className="flex flex-col pb-px pt-1" style={{ perspective: 700 }}>
            <AnimatePresence initial={false}>{children}</AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** One field unfolding down from its top edge, like a card hinged to the row above. */
function Fold({ children }: { children: ReactNode }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, rotateX: -70, height: 0 }}
      animate={{ opacity: 1, rotateX: 0, height: "auto" }}
      exit={{ opacity: 0, rotateX: -70, height: 0 }}
      transition={{ ...SPRING, opacity: { duration: 0.2 } }}
      style={{ transformOrigin: "50% 0%" }}
      className="relative"
    >
      {/* the elbow joining this field to the line */}
      <span aria-hidden="true" className="absolute left-[-11px] top-[58px] h-px w-[8px] bg-[#d2d2d7]" />
      <div className="pt-3">{children}</div>
    </motion.div>
  );
}

function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-[#6e6e73]">{children}</label>;
}

/** A label that changes wording without the field moving: the old word lifts out, the new one drops in. */
function SwapLabel({ text, htmlFor }: { text: string; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="relative mb-1.5 block h-[18px] overflow-hidden text-[13px] font-medium text-[#6e6e73]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} className="block" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={SPRING}>{text}</motion.span>
      </AnimatePresence>
    </label>
  );
}

const INPUT = "h-11 w-full rounded-[12px] bg-[#f5f5f7] px-3.5 text-[15px] text-[#1d1d1f] outline-none transition-[background,box-shadow] placeholder:text-[#a1a1a6] focus:bg-white focus:shadow-[0_0_0_1.5px_#0071e3,0_0_0_4px_rgba(0,113,227,.15)]";

function Field({ id, label, value, placeholder, type = "text", onChange }: { id: string; label: string; value: string; placeholder?: string; type?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <SwapLabel text={label} htmlFor={`df-${id}`} />
      <input id={`df-${id}`} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={INPUT} />
    </div>
  );
}

function Select({ id, label, value, options, swap, onChange }: { id: string; label: string; value: string; options: string[]; swap: string; onChange: (v: string) => void }) {
  return (
    <div>
      <SwapLabel text={label} htmlFor={`df-${id}`} />
      <div className="relative">
        {/* the options change with the country: the field's text flips to show it */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={swap} initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} exit={{ rotateX: -90, opacity: 0 }} transition={SPRING}>
            <select id={`df-${id}`} value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT} appearance-none pr-10 ${value ? "" : "text-[#a1a1a6]"}`}>
              <option value="" disabled>Choose a {label.toLowerCase()}</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </motion.div>
        </AnimatePresence>
        <Glyph d={ICON.chevron_down} size={13} className="pointer-events-none absolute right-3.5 top-1/2 -mt-[6.5px] text-[#86868b]" />
      </div>
    </div>
  );
}

function Segmented({ name, options, value, onChange }: { name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" aria-label={name} className="relative flex h-10 rounded-[12px] bg-[#f0f0f2] p-[3px]">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)} className="relative h-full flex-1 rounded-[9px] text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
          {value === o && <motion.span layoutId={`df-seg-${name}`} className="absolute inset-0 rounded-[9px] bg-white shadow-[0_1px_3px_rgba(0,0,0,.14),0_0_0_.5px_rgba(0,0,0,.04)]" transition={SPRING} />}
          <span className={`relative transition-colors ${value === o ? "text-[#1d1d1f]" : "text-[#6e6e73]"}`}>{o}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ icons: Framework7 Icons (MIT), via Iconify */
const ICON = {
  chevron_down: "M28 39.46a2.1 2.1 0 0 0 1.57-.679l18.164-18.586a2.1 2.1 0 0 0 .633-1.5a2.12 2.12 0 0 0-2.156-2.156a2.27 2.27 0 0 0-1.523.61L28 34.21L11.313 17.148a2.23 2.23 0 0 0-1.524-.609a2.12 2.12 0 0 0-2.156 2.156c0 .586.234 1.102.633 1.524L26.43 38.78c.445.446.96.68 1.57.68",
};
function Glyph({ d, size = 16, className, style }: { d: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true" className={className} style={style}>
      <path d={d} />
    </svg>
  );
}
```

--- components/dependent-form/index.ts ---

```ts
import type { ComponentProps } from "react";
import { DependentForm } from "./dependent-form";

export { DependentForm };
export type DependentFormProps = ComponentProps<typeof DependentForm>;
```
