"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type PostalSignupProps = {
  /** the newsletter's name, set on the letter like a masthead */
  title?: string;
  description?: string;
  placeholder?: string;
  cta?: string;
  /** what readers see once it's posted */
  doneTitle?: string;
  doneBody?: string;
  /** subscribe the address; throw to show an error instead of posting the letter */
  onSubscribe?: (email: string) => Promise<void> | void;
  autoplay?: boolean;
  className?: string;
};

// Phosphor (via Iconify), inlined
const ICON = {
  bird: { vb: 256, body: "<path fill=\"currentColor\" d=\"m236.44 73.34l-23.23-15.48A60 60 0 0 0 156 16h-.29C122.79 16.16 96 43.47 96 76.89v19.74L11.63 197.88l-.1.12A16 16 0 0 0 24 224h88a104.11 104.11 0 0 0 104-104v-19.72l20.44-13.62a8 8 0 0 0 0-13.32m-110.29 59.78l-60 72a8 8 0 1 1-12.29-10.24l60-72a8 8 0 1 1 12.29 10.24M164 80a12 12 0 1 1 12-12a12 12 0 0 1-12 12\"/>" },
  mail: { vb: 256, body: "<path fill=\"currentColor\" d=\"M224 48H32a8 8 0 0 0-8 8v136a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a8 8 0 0 0-8-8m-8 144H40V74.19l82.59 75.71a8 8 0 0 0 10.82 0L216 74.19z\"/>" },
  arrow: { vb: 256, body: "<path fill=\"currentColor\" d=\"m224.49 136.49l-72 72a12 12 0 0 1-17-17L187 140H40a12 12 0 0 1 0-24h147l-51.49-51.52a12 12 0 0 1 17-17l72 72a12 12 0 0 1-.02 17.01\"/>" },
  check: { vb: 256, body: "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m45.66 85.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32\"/>" },
} as const;

const LH = 330; // letter height; it folds in thirds
const THIRD = LH / 3;
const EH = 176; // envelope height
const ENV_TOP = 168;
const SLOT_Y = 458;
const STOP = Symbol("stop");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Phase = "idle" | "sending" | "posting" | "done";

const AIRMAIL = "repeating-linear-gradient(135deg, #e11d48 0 9px, #ffffff 9px 14px, #2563eb 14px 23px, #ffffff 23px 28px)";

/**
 * A newsletter signup written on a letter. Subscribe and the letter is addressed to you, folds in thirds,
 * slides into an envelope that seals itself; a stamp drops onto the corner and gets postmarked, then the
 * envelope goes through the mail slot. A mistyped address makes the letter shake instead.
 * Keyboard: it's a normal form; Enter subscribes.
 */
export function PostalSignup({
  title = "The Friday Letter",
  description = "One short email a week about building beautiful interfaces. Unsubscribe any time.",
  placeholder = "you@example.com",
  cta = "Subscribe",
  doneTitle = "You're on the list",
  doneBody = "Your first letter arrives on Friday.",
  onSubscribe,
  autoplay = false,
  className = "",
}: PostalSignupProps) {
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const [W, setW] = useState(380);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const LW = Math.min(300, W - 40);
  const EW = LW + 24;

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sent, setSent] = useState("");
  const [folding, setFolding] = useState(false); // the paper replica that folds
  const [flapFront, setFlapFront] = useState(false);

  // every moving part
  const shake = useMotionValue(0);
  const bottomA = useMotionValue(0); // bottom third folds up over the middle
  const topA = useMotionValue(0); // top third folds down over it
  const letterY = useMotionValue(0);
  const letterO = useMotionValue(1);
  const envO = useMotionValue(0);
  const envY = useMotionValue(36);
  const flapA = useMotionValue(180); // open, standing up behind the letter
  const stampY = useMotionValue(-90);
  const stampR = useMotionValue(-24);
  const stampO = useMotionValue(0);
  const stampSY = useMotionValue(1);
  const markO = useMotionValue(0);
  const markS = useMotionValue(1.3);
  const markP = useMotionValue(0);
  const groupY = useMotionValue(0);
  const groupR = useMotionValue(0);
  const slotA = useMotionValue(0);
  const bottomShade = useTransform(bottomA, [0, 90, 180], [0, 0.28, 0.06]);
  const topShade = useTransform(topA, [0, -90, -180], [0, 0.28, 0.06]);
  const markDash = useTransform(markP, (p) => `${p} 1`);

  const running = useRef(new Set<AnimationPlaybackControls>());
  const to = (mv: MotionValue<number>, v: number | number[], opts: Record<string, unknown> = {}) =>
    new Promise<void>((res) => {
      const c = animate(mv, v as never, { ...opts, onComplete: () => (running.current.delete(c), res()) } as never);
      running.current.add(c);
    });
  const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const reset = useCallback(() => {
    running.current.forEach((c) => c.stop());
    running.current.clear();
    [bottomA, topA, letterY, groupY, groupR, slotA, markP].forEach((m) => m.set(0));
    [envO, stampO, markO].forEach((m) => m.set(0));
    envY.set(36);
    flapA.set(180);
    stampY.set(-90);
    stampR.set(-24);
    stampSY.set(1);
    markS.set(1.3);
    setFlapFront(false);
    setFolding(false);
    setEmail("");
    setError(null);
    setPhase("idle");
    letterO.set(0);
    animate(letterO, 1, { duration: 0.35 });
  }, [bottomA, topA, letterY, groupY, groupR, slotA, markP, envO, stampO, markO, envY, flapA, stampY, stampR, stampSY, markS, letterO]);

  const post = useCallback(
    async (address: string) => {
      if (!EMAIL.test(address.trim())) {
        setError(address.trim() ? "That address doesn't look right. Check it and try again." : "Add your email address first.");
        if (!reduced) animate(shake, [0, -12, 10, -7, 5, -2, 0], { duration: 0.5, ease: "easeOut" });
        inputRef.current?.focus();
        return;
      }
      setError(null);
      setPhase("sending");
      try {
        await Promise.all([onSubscribe?.(address.trim()), pause(reduced ? 0 : 380)]);
      } catch (e) {
        setPhase("idle");
        setError(e instanceof Error && e.message ? e.message : "Something went wrong. Try again in a moment.");
        return;
      }
      setSent(address.trim());
      if (reduced) {
        setPhase("done");
        return;
      }
      setPhase("posting");
      setFolding(true);
      await pause(60);
      // fold in thirds
      await to(bottomA, 180, { duration: 0.55, ease: [0.55, 0, 0.25, 1] });
      await to(topA, -180, { duration: 0.55, ease: [0.55, 0, 0.25, 1] });
      // the envelope appears and the letter slides in
      await Promise.all([to(envO, 1, { duration: 0.3 }), to(envY, 0, { type: "spring", stiffness: 260, damping: 24 })]);
      await to(letterY, 76, { duration: 0.6, ease: [0.45, 0, 0.2, 1] });
      // the flap seals it
      setFlapFront(true);
      await to(flapA, 0, { type: "spring", stiffness: 210, damping: 17 });
      // a stamp, then the postmark
      stampO.set(1);
      await Promise.all([to(stampY, 0, { duration: 0.32, ease: [0.5, 0, 1, 1] }), to(stampR, -5, { duration: 0.32 })]);
      void to(stampSY, [1, 0.86, 1.04, 1], { duration: 0.35 });
      void to(groupY, [0, 2.5, 0], { duration: 0.3 });
      await pause(240);
      await Promise.all([to(markO, 0.82, { duration: 0.08 }), to(markS, 1, { type: "spring", stiffness: 700, damping: 30 }), to(markP, 1, { duration: 0.45, ease: "easeOut" })]);
      void to(groupY, [0, 1.5, 0], { duration: 0.25 });
      await pause(520);
      // and through the slot
      void to(slotA, -62, { type: "spring", stiffness: 260, damping: 16 });
      await to(groupY, -10, { duration: 0.22, ease: "easeOut" });
      void to(groupR, -2.5, { duration: 0.7 });
      await to(groupY, 380, { duration: 0.75, ease: [0.55, 0, 0.9, 0.5] });
      void to(slotA, 0, { type: "spring", stiffness: 380, damping: 11 });
      setPhase("done");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSubscribe, reduced],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (phase !== "idle") return;
    void post(email);
  };

  // ─── autoplay: type an address, subscribe, watch it go, then start again ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const own = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(60, Math.max(16, left)));
        };
        tk();
      });
    const run = (mv: MotionValue<number>, v: number, duration: number) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.01) return res();
        const c = animate(mv, v, { duration, ease: [0.4, 0, 0.2, 1], onComplete: () => (own.delete(c), res()) });
        own.add(c);
      });
    const tapEl = async (sel: string, fx = 0.5) => {
      const el = root.querySelector<HTMLElement>(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      const x = r.left - b.left + r.width * fx;
      const y = r.top - b.top + r.height / 2;
      if (go.get() < 0.5) {
        gx.set(x + 30);
        gy.set(y + 40);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, x, 0.5), run(gy, y, 0.5)]);
      await run(gs, 0.8, 0.1);
      await run(gs, 1, 0.12);
      return el;
    };
    const addresses = ["maya@studio.co", "theo@northwind.app"];
    (async () => {
      await wait(900);
      let n = 0;
      while (alive) {
        await tapEl("input", 0.3);
        await run(go, 0, 0.3);
        const a = addresses[n++ % addresses.length];
        for (let i = 1; i <= a.length; i++) {
          setEmail(a.slice(0, i));
          await wait(55 + (i % 4) * 18);
        }
        await wait(350);
        const btn = await tapEl("[data-subscribe]");
        await run(go, 0, 0.3);
        if (btn) await post(a);
        await wait(2600);
        await tapEl("[data-again]");
        reset();
        await run(go, 0, 0.3);
        await wait(1300);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const letterLeft = (W - LW) / 2;
  const envLeft = (W - EW) / 2;
  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;

  // the letter's face, used for the live form and (addressed) for the folding copy
  const masthead = (
    <>
      <div className="flex items-center justify-between">
        <span className="grid h-8 w-8 place-items-center rounded-full text-white shadow-[0_6px_14px_-6px_rgba(37,99,235,.8)]" style={{ background: "linear-gradient(140deg, #3b82f6, #1d4ed8)" }}>{ic("mail", 15)}</span>
        <span className="rounded-full bg-[#fff1f3] px-2.5 py-1 text-[11.5px] font-medium text-[#be123c]">Every Friday</span>
      </div>
      <h3 className="m-0 mt-5 font-serif text-[27px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#13235f]" style={{ fontFamily: '"New York", ui-serif, Georgia, serif' }}>
        {title}
      </h3>
      <p className="m-0 mt-2.5 text-[13.5px] leading-[1.5] text-[#6e6e73]">{description}</p>
    </>
  );
  const addressed = (
    <div className="absolute inset-0 flex flex-col px-6 pt-6" style={{ width: LW, height: LH }}>
      <span className="absolute inset-x-0 top-0 h-[6px]" style={{ background: AIRMAIL }} />
      {masthead}
      <div className="mt-auto pb-8">
        <p className="m-0 text-[12px] text-[#86868b]">Addressed to</p>
        <p className="m-0 mt-1 truncate border-b border-[#2563eb]/30 pb-2 text-[16px] font-medium text-[#13235f]">{sent}</p>
        <p className="m-0 mt-3 font-serif text-[15px] italic text-[#6e6e73]" style={{ fontFamily: '"New York", ui-serif, Georgia, serif' }}>
          See you on Friday.
        </p>
      </div>
    </div>
  );
  const paper = "bg-white shadow-[0_0_0_1px_rgba(19,35,95,.08)]";

  return (
    <div ref={rootRef} className={`relative mx-auto h-[520px] w-full max-w-[380px] select-none ${className}`}>
      {/* everything that ends up in the mail, clipped at the slot */}
      <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: SLOT_Y }}>
        <motion.div className="absolute inset-0" style={{ y: groupY, rotate: groupR, originX: 0.5, originY: 0.6 }}>
          {/* envelope back */}
          <motion.div aria-hidden="true" className="pointer-events-none absolute rounded-[10px] bg-[#b9cdfa] shadow-[0_18px_36px_-20px_rgba(29,78,216,.55)]" style={{ left: envLeft, top: ENV_TOP, width: EW, height: EH, opacity: envO, y: envY }} />
          {/* flap, while open it stands behind the letter */}
          {!flapFront && <Flap left={envLeft} width={EW} angle={flapA} opacity={envO} y={envY} />}

          {/* the letter */}
          <motion.div className="absolute" style={{ left: letterLeft, top: 22, width: LW, height: LH, x: shake, y: letterY, opacity: letterO }}>
            {!folding ? (
              <form onSubmit={onSubmit} noValidate className={`relative flex h-full flex-col rounded-[6px] px-6 pt-6 ${paper} shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_40px_-28px_rgba(0,0,0,.4)]`}>
                <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[6px] rounded-t-[6px]" style={{ background: AIRMAIL }} />
                {masthead}
                <div className="mt-auto pb-6">
                  <label htmlFor={`${uid}-email`} className="text-[12px] text-[#86868b]">
                    Your email
                  </label>
                  <input
                    ref={inputRef}
                    id={`${uid}-email`}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    disabled={phase !== "idle"}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${uid}-err` : undefined}
                    className={`mt-1 block w-full border-0 border-b bg-transparent pb-2 text-[16px] font-medium text-[#1d1d1f] outline-none transition-colors placeholder:font-normal placeholder:text-[#a1a1a6] focus:border-[#2563eb] ${error ? "border-[#d70015]" : "border-[#1d1d1f]/20"}`}
                  />
                  <p id={`${uid}-err`} role="alert" className="m-0 mt-1.5 min-h-[17px] text-[12px] leading-[1.4] text-[#d70015]">
                    {error}
                  </p>
                  <motion.button
                    type="submit"
                    data-subscribe
                    disabled={phase !== "idle"}
                    whileTap={{ scale: 0.97 }}
                    className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#f43f5e,#e11d48_55%,#be123c)] text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_10px_22px_-10px_rgba(225,29,72,.9)] outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
                  >
                    {phase === "sending" ? (
                      <>
                        <motion.span className="block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                        Sending
                      </>
                    ) : (
                      <>
                        {cta}
                        {ic("arrow", 14)}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            ) : (
              // the same sheet as three panels that fold; each panel shows its own third of the page
              <div aria-hidden="true" className="relative h-full w-full [perspective:1100px]">
                <Panel i={1} lw={LW} paper={paper} content={addressed} angle={undefined} shade={undefined} z={0} />
                <Panel i={2} lw={LW} paper={paper} content={addressed} angle={bottomA} shade={bottomShade} origin="50% 0%" z={1} />
                <Panel i={0} lw={LW} paper={paper} content={addressed} angle={topA} shade={topShade} origin="50% 100%" z={2} />
              </div>
            )}
          </motion.div>

          {/* envelope front pocket */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ left: envLeft, top: ENV_TOP, width: EW, height: EH, opacity: envO, y: envY }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[10px]" style={{ clipPath: "polygon(0 0, 50% 56%, 100% 0, 100% 100%, 0 100%)" }}>
              <div className="absolute inset-0" style={{ background: AIRMAIL }} />
              <div className="absolute inset-[6px] rounded-[5px] bg-[linear-gradient(180deg,#e4edff,#d3e2ff)]" />
            </div>
            <div className="absolute inset-0 rounded-[10px]" style={{ clipPath: "polygon(0 0, 50% 56%, 100% 0, 100% 2%, 50% 58%, 0 2%)", background: "rgba(29,78,216,.14)" }} />
            <span className="absolute bottom-[16px] left-[16px] -rotate-6 rounded-[4px] border-[1.5px] border-[#1d4ed8] bg-white/70 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#1d4ed8]">Par avion</span>
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-6 text-center">
              <span className="text-[11px] font-medium text-[#1d4ed8]">To</span>
              <span className="max-w-[80%] truncate text-[14px] font-medium text-[#13235f]">{sent}</span>
            </div>
          </motion.div>
          {flapFront && <Flap left={envLeft} width={EW} angle={flapA} opacity={envO} y={envY} front />}

          {/* stamp and postmark */}
          <motion.div aria-hidden="true" className="pointer-events-none absolute" style={{ left: envLeft + EW - 60, top: ENV_TOP + 12, y: stampY, rotate: stampR, scaleY: stampSY, opacity: stampO, originY: 1 }}>
            <Stamp id={`${uid}-perf`} bird={ICON.bird} />
          </motion.div>
          <motion.svg aria-hidden="true" width={110} height={56} viewBox="0 0 110 56" className="pointer-events-none absolute overflow-visible" style={{ left: envLeft + EW - 140, top: ENV_TOP + 14, opacity: markO, scale: markS, rotate: -8 }}>
            {[14, 22, 30, 38].map((y) => (
              <motion.path key={y} d={`M2 ${y} q 7 -5 14 0 t 14 0 t 14 0 t 14 0`} fill="none" stroke="#1f47d6" strokeWidth={1.4} pathLength={1} style={{ strokeDasharray: markDash }} />
            ))}
            <circle cx={86} cy={26} r={21} fill="none" stroke="#1f47d6" strokeWidth={1.5} />
            <circle cx={86} cy={26} r={17} fill="none" stroke="#1f47d6" strokeWidth={0.8} />
            <text x={86} y={24} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#1f47d6" style={{ letterSpacing: "0.06em" }}>
              {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase()}
            </text>
            <text x={86} y={34} textAnchor="middle" fontSize={7} fill="#1f47d6">
              {new Date().getFullYear()}
            </text>
          </motion.svg>
        </motion.div>
      </div>

      {/* the mail slot */}
      <div aria-hidden="true" className="absolute left-1/2 h-[30px] w-[270px] max-w-[85%] -translate-x-1/2 rounded-[10px] bg-[linear-gradient(180deg,#ffe9a8,#f2c14e_45%,#b9801c)] shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_8px_16px_-8px_rgba(150,90,10,.6)]" style={{ top: SLOT_Y - 15 }}>
        <div className="absolute inset-x-4 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-[#3a2205]" />
        <div className="absolute inset-x-4 top-[7px] [perspective:300px]">
          <motion.div className="h-[9px] rounded-[3px] bg-[linear-gradient(180deg,#ffe08a,#d9a032)] shadow-[inset_0_1px_0_rgba(255,255,255,.7)]" style={{ rotateX: slotA, originY: 0 }} />
        </div>
      </div>

      {/* posted */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            key="done"
            role="status"
            className="absolute inset-x-0 top-[96px] flex flex-col items-center px-8 text-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <span className="grid h-16 w-16 place-items-center rounded-full text-white shadow-[0_12px_26px_-10px_rgba(37,99,235,.8)]" style={{ background: "linear-gradient(140deg, #3b82f6, #1d4ed8)" }}>{ic("check", 34)}</span>
            <h3 className="m-0 mt-4 font-serif text-[26px] font-semibold tracking-[-0.02em] text-[#13235f]" style={{ fontFamily: '"New York", ui-serif, Georgia, serif' }}>
              {doneTitle}
            </h3>
            <p className="m-0 mt-2 max-w-[30ch] text-[14px] leading-[1.5] text-[#6e6e73]">
              {doneBody} We sent it to <span className="font-medium text-[#13235f]">{sent}</span>.
            </p>
            <button type="button" data-again onClick={reset} className="mt-5 rounded-full px-4 py-2 text-[14px] font-medium text-[#0066cc] outline-none hover:bg-[#0071e3]/[.06] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60">
              Use another email
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}

/** One third of the letter: a window onto the page, with a plain back for when it's folded over. */
function Panel({ i, lw, paper, content, angle, shade, origin, z }: { i: number; lw: number; paper: string; content: ReactNode; angle?: MotionValue<number>; shade?: MotionValue<number>; origin?: string; z: number }) {
  return (
    <motion.div className="absolute left-0 [transform-style:preserve-3d]" style={{ top: i * THIRD, width: lw, height: THIRD, rotateX: angle ?? 0, transformOrigin: origin ?? "50% 50%", z, zIndex: z }}>
      <div className={`absolute inset-0 overflow-hidden [backface-visibility:hidden] ${paper} ${i === 0 ? "rounded-t-[6px]" : i === 2 ? "rounded-b-[6px]" : ""}`}>
        <div className="absolute left-0" style={{ top: -i * THIRD, width: lw, height: LH }}>
          {content}
        </div>
        {shade && <motion.div className="absolute inset-0 bg-[#13235f]" style={{ opacity: shade }} />}
      </div>
      <div className={`absolute inset-0 bg-[#eaf1ff] [backface-visibility:hidden] ${paper}`} style={{ transform: "rotateX(180deg)" }} />
    </motion.div>
  );
}

/** The flap: a triangle hinged at the top edge, outside face and inside face. */
function Flap({ left, width, angle, opacity, y, front }: { left: number; width: number; angle: MotionValue<number>; opacity: MotionValue<number>; y: MotionValue<number>; front?: boolean }) {
  return (
    <motion.div aria-hidden="true" className="pointer-events-none absolute [perspective:900px]" style={{ left, top: ENV_TOP, width, height: EH * 0.6, opacity, y }}>
      <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateX: angle, originY: 0 }}>
        <div className={`absolute inset-0 [backface-visibility:hidden] ${front ? "drop-shadow-[0_3px_3px_rgba(0,0,0,.12)]" : ""}`}>
          <div className="absolute inset-0 overflow-hidden rounded-t-[10px]" style={{ clipPath: "polygon(0 0, 100% 0, 52% 100%, 48% 100%)" }}>
            <div className="absolute inset-0" style={{ background: AIRMAIL }} />
            <div className="absolute inset-x-0 bottom-0 top-[6px] bg-[linear-gradient(180deg,#d9e6ff,#c6d8ff)]" />
          </div>
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "rotateX(180deg)" }}>
          <div className="absolute inset-0 rounded-b-[10px] bg-[#a9c1f6]" style={{ clipPath: "polygon(0 100%, 100% 100%, 52% 0, 48% 0)" }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/** A postage stamp with perforated edges. */
function Stamp({ id, bird }: { id: string; bird: { vb: number; body: string } }) {
  const w = 44;
  const h = 52;
  const holes: [number, number][] = [];
  for (let x = 2; x <= w; x += 5) holes.push([x, 0], [x, h]);
  for (let y = 2; y <= h; y += 5) holes.push([0, y], [w, y]);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,.18)]">
      <defs>
        <mask id={id}>
          <rect width={w} height={h} fill="#fff" />
          {holes.map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={1.6} fill="#000" />
          ))}
        </mask>
      </defs>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="0.55" stopColor="#f43f5e" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="#ffffff" mask={`url(#${id})`} />
      <rect x={4} y={4} width={w - 8} height={h - 8} fill={`url(#${id}-sky)`} />
      <circle cx={w - 13} cy={13} r={5} fill="#fde68a" />
      <svg x={11} y={10} width={22} height={22} viewBox={`0 0 ${bird.vb} ${bird.vb}`} color="#ffffff" dangerouslySetInnerHTML={{ __html: bird.body }} />
      <text x={w / 2} y={h - 9} textAnchor="middle" fontSize={8} fontWeight={700} fill="#ffffff">
        50
      </text>
    </svg>
  );
}
