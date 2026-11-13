"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";

/**
 * Launchfolio's hero: the Fernway checkout redesign, played out on one screen. A shopper's cursor works through the
 * old three-step form, stalls at the password field, can't find the grey button and leaves. Then the redesign
 * happens in place: the promo banner, the step pills, the upsells and seven fields fold away, express pay and an
 * address lookup arrive, the grey button becomes the one obvious button, and the next shopper pays in one go.
 * It loops until someone presses Before or After. `progress` runs 100 (before) to 0 (after), for the metrics.
 * Laid out at 640 x 440; wrap it in Fit to scale it. Reduced motion shows the after state, no cursor.
 */

const W = 640;
const H = 440;

type Item = { id: string; label: string; before: boolean; after: boolean; half?: "l" | "r" };
const FIELDS: Item[] = [
  { id: "first", label: "First name*", before: true, after: false, half: "l" },
  { id: "last", label: "Last name*", before: true, after: false, half: "r" },
  { id: "email", label: "Email", before: true, after: true, half: "l" },
  { id: "confirm", label: "Confirm email*", before: true, after: false, half: "r" },
  { id: "phone", label: "Phone (for delivery updates)*", before: true, after: false },
  { id: "addr", label: "Address", before: true, after: true },
  { id: "line2", label: "Address line 2", before: true, after: false, half: "l" },
  { id: "city", label: "City*", before: true, after: false, half: "r" },
  { id: "post", label: "Postcode*", before: true, after: false, half: "l" },
  { id: "country", label: "Country*", before: true, after: false, half: "r" },
  { id: "pass", label: "Create a password to save your details*", before: true, after: false },
  { id: "card", label: "Card number", before: false, after: true },
  { id: "exp", label: "Expiry", before: false, after: true, half: "l" },
  { id: "cvc", label: "CVC", before: false, after: true, half: "r" },
];

const spring = { type: "spring", stiffness: 260, damping: 30 } as const;
const noop = () => () => {};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function RedesignReel({ progress, accent }: { progress: MotionValue<number>; accent: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduce = useReducedMotion();
  const still = hydrated && !!reduce;
  const [after, setAfter] = useState(false);
  const [paid, setPaid] = useState(false);
  const [quote, setQuote] = useState(false);
  const [manual, setManual] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const cx = useMotionValue(W + 40);
  const cy = useMotionValue(300);
  const press = useMotionValue(1);

  const show = useCallback(
    (a: boolean) => {
      setAfter(a);
      setPaid(false);
      setQuote(false);
      animate(progress, a ? 0 : 100, { duration: still ? 0 : 0.9, ease: [0.3, 0, 0.2, 1] });
    },
    [progress, still],
  );

  // where an element sits in the 640 x 440 design, whatever Fit has scaled it to
  const spot = (id: string, fx = 0.5, fy = 0.5) => {
    const c = canvas.current, el = c?.querySelector(`[data-k="${id}"]`);
    if (!c || !el) return { x: W / 2, y: H / 2 };
    const cr = c.getBoundingClientRect(), r = el.getBoundingClientRect();
    const s = cr.width / W || 1;
    return { x: (r.left - cr.left + r.width * fx) / s, y: (r.top - cr.top + r.height * fy) / s };
  };

  useEffect(() => {
    if (!hydrated) return;
    if (still) { progress.set(0); return; }
    if (manual) return;
    let alive = true;
    const go = (p: { x: number; y: number }, duration: number) =>
      Promise.all([animate(cx, p.x, { duration, ease: [0.45, 0, 0.25, 1] }), animate(cy, p.y, { duration, ease: [0.45, 0, 0.25, 1] })]);
    const click = () => animate(press, [1, 0.8, 1], { duration: 0.22 });
    (async () => {
      while (alive) {
        show(false);
        cx.set(W + 40); cy.set(330);
        await sleep(700); if (!alive) return;
        await go(spot("first", 0.3), 0.9); await sleep(250);
        await go(spot("confirm", 0.4), 0.7); await sleep(250);
        await go(spot("pass", 0.3), 0.8); if (!alive) return;
        setQuote(true);
        await sleep(1500); if (!alive) return;
        setQuote(false);
        // can't find the button: wanders over the side panel, tries the grey one, gives up
        await go(spot("upsell", 0.5), 0.6);
        await go(spot("cta", 0.5), 0.6); await click();
        await go({ x: spot("cta").x + 18, y: spot("cta").y - 6 }, 0.14);
        await go(spot("cta", 0.4), 0.14);
        await sleep(350); if (!alive) return;
        await go({ x: W + 60, y: 120 }, 0.9);
        await sleep(400); if (!alive) return;
        show(true);
        await sleep(1300); if (!alive) return;
        cx.set(-40); cy.set(300);
        await go(spot("addr", 0.35), 0.9); await click();
        await sleep(300);
        await go(spot("cta", 0.5), 0.8); await click(); if (!alive) return;
        setPaid(true);
        await sleep(2600);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, still, manual]);

  const shownAfter = still || after;
  const set = (k: string) => ({ "data-k": k });
  const shown = FIELDS.filter((f) => (shownAfter ? f.after : f.before));
  const size = shownAfter ? "h-[30px] rounded-[8px]" : "h-[17px] rounded-[4px]";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* the frame name, as it sits on a design canvas */}
      <div className="flex w-full items-center justify-between px-1 text-[12px] font-medium text-[#6e6e73]">
        <span className="flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 0v10M7 0v10M0 3h10M0 7h10" stroke="currentColor" strokeWidth="1.2" /></svg>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={shownAfter ? "a" : "b"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>{shownAfter ? "Checkout, v12 (shipped)" : "Checkout, v1 (live in 2025)"}</motion.span>
          </AnimatePresence>
        </span>
        <span>640 × 440</span>
      </div>
      <div ref={canvas} className="relative overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.08),0_40px_80px_-40px_rgba(30,20,10,.45)]" style={{ width: W, height: H }} aria-label={shownAfter ? "Fernway checkout after the redesign: one page, five fields, one button." : "Fernway checkout before the redesign: three steps, eleven fields and a grey button."} role="img">
        {/* browser bar */}
        <div className="flex h-[36px] items-center gap-1.5 border-b border-black/[.06] bg-[#f4f4f5] px-3">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-[9px] w-[9px] rounded-full" style={{ background: c }} />)}
          <span className="mx-auto rounded-full bg-white px-3 py-0.5 text-[10px] text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.05)]">fernway.shop/checkout</span>
        </div>

        <LayoutGroup>
          <AnimatePresence initial={false}>
            {!shownAfter && (
              <motion.div key="banner" initial={{ height: 0 }} animate={{ height: 22 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="flex items-center justify-center overflow-hidden bg-[#dc2626] text-[10px] font-bold text-white">
                Free shipping over $80! Use code SAVE10, ends tonight
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout className="flex items-center justify-between px-5 py-2.5">
            <motion.span layout className={shownAfter ? "text-[15px] font-semibold tracking-[-0.02em] text-[#1d1d1f]" : "text-[13px] font-extrabold tracking-[0.04em] text-[#1d1d1f]"}>{shownAfter ? "Fernway" : "FERNWAY"}</motion.span>
            <AnimatePresence mode="popLayout" initial={false}>
              {shownAfter ? (
                <motion.span key="secure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[11px] text-[#6e6e73]">Secure checkout</motion.span>
              ) : (
                <motion.span key="steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -6 }} className="flex gap-1 text-[9px] text-[#6e6e73]">
                  <span className="rounded bg-[#1d1d1f] px-1.5 py-0.5 text-white">1 Details</span><span className="rounded bg-[#e5e5ea] px-1.5 py-0.5">2 Shipping</span><span className="rounded bg-[#e5e5ea] px-1.5 py-0.5">3 Payment</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="grid grid-cols-[1.35fr_1fr] gap-5 px-5">
            {/* the form */}
            <motion.div layout className="flex flex-wrap content-start gap-x-2 gap-y-2">
              <AnimatePresence initial={false}>
                {shownAfter && (
                  <motion.div key="express" layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring} className="flex w-full flex-col gap-2">
                    <span className="flex h-[32px] items-center justify-center rounded-[8px] bg-[#1d1d1f] text-[12px] font-semibold text-white">Express pay</span>
                    <span className="flex items-center gap-2 text-[10px] text-[#86868b]"><span className="h-px flex-1 bg-[#e5e5ea]" />or pay by card<span className="h-px flex-1 bg-[#e5e5ea]" /></span>
                  </motion.div>
                )}
                {shown.map((f) => (
                  <motion.span
                    key={f.id}
                    {...set(f.id)}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                    transition={spring}
                    className="relative flex flex-col gap-0.5"
                    style={{ width: f.half ? "calc(50% - 4px)" : "100%" }}
                  >
                    <motion.span layout="position" className={`${shownAfter ? "text-[11px]" : "text-[9px]"} font-medium text-[#6e6e73]`}>
                      {f.id === "addr" ? (shownAfter ? "Delivery address" : "Address line 1*") : f.id === "email" && !shownAfter ? "Email*" : f.label}
                    </motion.span>
                    <motion.span layout className={`${size} border border-[#c7c7cc] bg-white`} />
                    {f.id === "addr" && shownAfter ? (
                      <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="absolute left-2 right-2 top-[44px] z-10 rounded-[6px] bg-white px-2 py-1 text-[10px] text-[#1d1d1f] shadow-[0_6px_16px_-6px_rgba(0,0,0,.3),0_0_0_1px_rgba(0,0,0,.06)]">
                        12 Larch Road, Bristol BS6. <span style={{ color: accent }}>Use this</span>
                      </motion.span>
                    ) : null}
                  </motion.span>
                ))}
                {!shownAfter && (
                  <motion.span key="deals" layout exit={{ opacity: 0 }} className="flex w-full items-center gap-1 text-[9px] text-[#6e6e73]"><span className="h-2 w-2 rounded-sm border border-[#86868b]" />Sign me up for deals (unticking may delay your order)</motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* the summary */}
            <motion.div layout className="flex flex-col gap-1.5 rounded-[10px] p-3" style={{ background: shownAfter ? "#f5f5f7" : "#ffffff", boxShadow: shownAfter ? "none" : "0 0 0 1px rgba(0,0,0,.08)" }}>
              <motion.span layout="position" className="text-[11px] font-semibold text-[#1d1d1f]">{shownAfter ? "3 items" : "Order summary (3)"}</motion.span>
              {[["Trail mug", "$24.00"], ["Wool socks", "$18.00"], ["Map case", "$22.20"]].map(([a, b]) => (
                <motion.span layout="position" key={a} className="flex justify-between text-[10px] text-[#424245]"><span>{a}</span><span className="tabular-nums">{shownAfter ? b : "$—"}</span></motion.span>
              ))}
              <AnimatePresence initial={false}>
                {!shownAfter ? (
                  <motion.div key="upsell" {...set("upsell")} layout exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-1 overflow-hidden">
                    <span className="mt-1 text-[10px] font-bold text-[#1d1d1f]">You may also like</span>
                    <span className="grid grid-cols-3 gap-1">{[0, 1, 2].map((i) => <span key={i} className="aspect-square rounded bg-[#fde68a]" />)}</span>
                    <span className="flex gap-1"><span className="h-[16px] flex-1 rounded border border-[#c7c7cc]" /><span className="rounded bg-[#e5e5ea] px-1.5 text-[9px] leading-[16px]">Apply code</span></span>
                  </motion.div>
                ) : (
                  <motion.span key="delivery" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between border-t border-black/[.08] pt-1.5 text-[10px] text-[#424245]"><span>Delivery Thu, 8 to 10 am</span><span>Free</span></motion.span>
                )}
              </AnimatePresence>
              <motion.span
                {...set("cta")}
                layout
                transition={spring}
                className={shownAfter ? "mt-auto flex h-[34px] items-center justify-center rounded-[8px] text-[12px] font-semibold text-white" : "mt-auto self-end rounded bg-[#d2d2d7] px-2 py-1 text-[9px] text-[#6e6e73]"}
                style={shownAfter ? { background: accent } : undefined}
              >
                {shownAfter ? "Pay $64.20" : "Continue to shipping ›"}
              </motion.span>
            </motion.div>
          </div>
        </LayoutGroup>

        {/* design notes pinned to the shipped version */}
        <AnimatePresence>
          {shownAfter && !paid
            ? [
                { t: "Lookup fills five fields", x: 200, y: 150 },
                { t: "Guest checkout by default", x: 430, y: 48 },
                { t: "One obvious button", x: 420, y: 276 },
              ].map((n, i) => (
                <motion.span
                  key={n.t}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.7 + i * 0.18 }}
                  className="absolute z-20 flex origin-bottom-left items-center gap-1.5 rounded-full rounded-bl-[3px] bg-[#1d1d1f] py-1 pl-1 pr-2.5 text-[11px] font-medium text-white shadow-[0_10px_22px_-10px_rgba(0,0,0,.6)]"
                  style={{ left: n.x, top: n.y }}
                >
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold" style={{ background: accent }}>MO</span>
                  {n.t}
                </motion.span>
              ))
            : null}
        </AnimatePresence>

        {/* what the shopper said, from the research sessions */}
        <AnimatePresence>
          {quote && (
            <motion.div key="q" initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} transition={{ type: "spring", stiffness: 420, damping: 28 }} className="absolute left-[150px] top-[300px] z-20 max-w-[250px] rounded-[12px] rounded-tl-[3px] bg-[#1d1d1f] px-3 py-2 text-[12px] leading-[1.35] text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,.5)]">
              &ldquo;Why does it need my password? I&rsquo;m buying socks.&rdquo;
              <span className="mt-1 block text-[10px] text-white/60">Shopper 3, research session</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {paid && (
            <motion.div key="paid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
              <motion.div initial={{ scale: 0.8, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 380, damping: 22 }} className="flex items-center gap-3 rounded-full bg-white py-2.5 pl-2.5 pr-5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_20px_40px_-20px_rgba(0,0,0,.4)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: accent }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                <span className="text-[14px] font-semibold text-[#1d1d1f]">Paid in 52 seconds</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the shopper's pointer */}
        {!still && !manual ? (
          <motion.svg width="22" height="22" viewBox="0 0 24 24" className="pointer-events-none absolute left-0 top-0 z-30 drop-shadow-[0_2px_3px_rgba(0,0,0,.35)]" style={{ x: cx, y: cy, scale: press }} aria-hidden="true">
            <path d="M4 2l15 9.5-6.6 1.4 3.9 7.6-2.8 1.4-3.9-7.6L4 19z" fill="#1d1d1f" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </motion.svg>
        ) : null}
      </div>

      <div className="flex rounded-full bg-[#f1f1f3] p-1" role="group" aria-label="Show the checkout">
        {[["Before", false], ["After", true]].map(([l, a]) => (
          <button
            key={l as string}
            type="button"
            aria-pressed={shownAfter === a}
            onClick={() => { setManual(true); show(a as boolean); }}
            className="relative rounded-full px-5 py-1.5 text-[13px] font-semibold outline-none focus-visible:ring-2"
            style={{ color: shownAfter === a ? "#1d1d1f" : "#6e6e73", ["--tw-ring-color" as string]: accent }}
          >
            {shownAfter === a && <motion.span layoutId="reel-pill" className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.12)]" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
            <span className="relative">{l as string}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
