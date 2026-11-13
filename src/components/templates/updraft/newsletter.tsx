"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COLORS, CONTAINER } from "./theme";
import { Icon } from "./ui";

const TOPICS = [
  ["all", "Everything", "ph:sparkle"],
  ["desk", "Desk", "ph:app-window"],
  ["shell", "Shell", "ph:terminal-window"],
  ["lens", "Lens", "ph:code"],
  ["kit", "Kit", "ph:cube"],
];

export function Newsletter() {
  const [topics, setTopics] = useState(["all"]);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const toggle = (id: string) =>
    setTopics((prev) =>
      id === "all"
        ? ["all"]
        : (() => {
            const chosen = prev.filter((k) => k !== "all");
            const next = chosen.includes(id) ? chosen.filter((k) => k !== id) : [...chosen, id];
            return next.length ? next : ["all"];
          })(),
    );
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Enter an email address like you@company.com.");
    }
    if (!touched) {
      return setError("Tick the box to accept the terms first.");
    }
    setError("");
    setStatus("busy");
    window.setTimeout(() => setStatus("done"), 1100);
  };
  return (
    <section id="newsletter" className={`${CONTAINER} scroll-mt-24 pb-20`}>
      <div className="rounded-[32px] bg-[#F5F6F8] px-5 py-16 text-center sm:px-10 sm:py-20">
        <h2 className="text-[clamp(28px,3.4vw,44px)] font-[470] tracking-[-0.035em]">
          Get the changelog, not the noise
        </h2>
        <p
          className="mt-2 text-[15.5px]"
          style={{
            color: COLORS.text,
          }}
        >
          One email when something ships. Pick what you care about.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Topics">
          {TOPICS.map(([h, label, icon]) => {
            const on = topics.includes(h);
            return (
              <button
                key={h}
                type="button"
                onClick={() => toggle(h)}
                aria-pressed={on}
                className={`ud-ring flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-[500] transition-colors duration-300 ${on ? "bg-[#121317] text-white" : "bg-white text-[#4A4D56] hover:text-[#121317]"}`}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {on ? (
                    <motion.span
                      key="c"
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      exit={{
                        scale: 0,
                      }}
                    >
                      <Icon name="ph:check" size={13} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="i"
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      exit={{
                        scale: 0,
                      }}
                    >
                      <Icon name={icon} size={13} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {label}
              </button>
            );
          })}
        </div>
        <form onSubmit={submit} noValidate={true} className="mx-auto mt-5 max-w-[540px]">
          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_0_0_1px_#ECEDF0] transition-shadow focus-within:shadow-[0_0_0_2px_#121317]">
            <label htmlFor="nl-email" className="sr-only">
              Email address
            </label>
            <input
              id="nl-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              disabled={status !== "idle"}
              placeholder="you@company.com"
              className="h-10 min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-[#A9ACB4]"
            />
            <motion.button
              type="submit"
              layout={true}
              disabled={status !== "idle"}
              className="ud-ring flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#121317] px-5 text-[14px] font-[500] text-white"
              style={{
                background: status === "done" ? "#1E9E57" : undefined,
              }}
            >
              {status === "busy" ? (
                <Icon name="ph:circle-notch" size={16} className="ud-spin-fast" />
              ) : status === "done" ? (
                <>
                  <Icon name="ph:check" size={15} />
                  Subscribed
                </>
              ) : (
                "Subscribe"
              )}
            </motion.button>
          </div>
          <label
            className="mt-4 inline-flex cursor-pointer items-center gap-2 text-[12.5px]"
            style={{
              color: COLORS.soft,
            }}
          >
            <input
              type="checkbox"
              checked={touched}
              onChange={(event) => {
                setTouched(event.target.checked);
                setError("");
              }}
              className="peer sr-only"
            />
            <span className="grid size-4 place-items-center rounded-[5px] ring-1 ring-[#C9CBD1] transition-colors peer-checked:bg-[#121317] peer-checked:ring-[#121317] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#121317]">
              {touched && <Icon name="ph:check" size={10} className="text-white" />}
            </span>
            I accept the Updraft terms and privacy policy. Unsubscribe any time.
          </label>
          <p
            aria-live="polite"
            className="mt-2 min-h-[18px] text-[12.5px]"
            style={{
              color: status === "done" ? "#1E9E57" : "#C2352B",
            }}
          >
            {status === "done"
              ? `You are on the list for ${topics.includes("all") ? "everything" : topics.join(", ")}.`
              : error}
          </p>
        </form>
      </div>
    </section>
  );
}
