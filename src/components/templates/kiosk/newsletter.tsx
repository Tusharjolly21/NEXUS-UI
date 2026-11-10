"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cover } from "./cover";
import { COLOR, CONTAINER, FONT_SANS, SPRING } from "./theme";
import { Icon, Reveal, RevealHeading } from "./ui";
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "flying" | "done">("idle");
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter an email like you@domain.com");
      return;
    }
    setError("");
    setStatus("flying");
    window.setTimeout(() => setStatus("done"), 1100);
  };
  return (
    <section className="py-16 sm:py-24">
      <div className={CONTAINER}>
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[32px] px-6 py-16 text-center sm:px-10 sm:py-20"
            style={{
              background: COLOR.panel,
            }}
          >
            {(
              [
                [0, 1, "8%", "18%", -10],
                [3, 5, "84%", "14%", 8],
                [6, 2, "6%", "70%", 6],
                [7, 6, "88%", "66%", -6],
              ] as const
            ).map(([a, c, u, d, p], index) => (
              <div
                className="ks-anim pointer-events-none absolute hidden md:block"
                style={
                  {
                    left: u,
                    top: d,
                    "--r": `${p}deg`,
                    animation: `ks-float ${5 + index}s ease-in-out infinite`,
                  } as CSSProperties
                }
                key={index}
              >
                <Cover
                  cover={{
                    v: a,
                    p: c,
                  }}
                  className="h-24 w-24 rounded-[20px]"
                  style={{
                    boxShadow: "0 20px 40px -20px rgba(0,0,0,.4)",
                  }}
                />
              </div>
            ))}
            <RevealHeading
              text="The good stuff, once a week."
              className="mx-auto max-w-[620px]"
              style={{
                fontSize: "clamp(34px, 4.6vw, 56px)",
              }}
            />
            <p
              className="mx-auto m-0 mt-4 max-w-[420px] text-[16px]"
              style={{
                color: COLOR.soft,
              }}
            >
              Six stories every Friday, picked by the editors. No noise, unsubscribe in one click.
            </p>
            <AnimatePresence mode="wait" initial={false}>
              {status === "done" ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={SPRING}
                  className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium"
                  style={{
                    background: COLOR.hi,
                    color: COLOR.hiInk,
                  }}
                  role="status"
                  key="ok"
                >
                  <Icon name="ph:check-circle-fill" size={18} />
                  You&rsquo;re in. First issue lands Friday.
                </motion.div>
              ) : (
                <motion.form
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  onSubmit={submit}
                  className="relative mx-auto mt-8 flex max-w-[440px] items-center gap-1 rounded-full bg-white p-1.5 pl-5"
                  style={{
                    boxShadow: error
                      ? "0 0 0 1.5px #D8452F"
                      : `0 0 0 1px ${COLOR.line}, 0 14px 30px -18px rgba(0,0,0,.3)`,
                  }}
                  noValidate={true}
                  key="f"
                >
                  <label htmlFor="ks-mail" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="ks-mail"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="you@domain.com"
                    className="min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none"
                    style={{
                      color: COLOR.ink,
                      fontFamily: FONT_SANS,
                    }}
                    aria-invalid={!!error}
                    aria-describedby="ks-mail-err"
                  />
                  <button
                    type="submit"
                    className="ks-ring relative flex items-center gap-2 overflow-visible rounded-full px-4 py-2.5 text-[14px] font-medium text-white outline-none"
                    style={{
                      background: COLOR.ink,
                    }}
                  >
                    Subscribe
                    <motion.span
                      animate={
                        status === "flying"
                          ? {
                              x: [0, 30, 220],
                              y: [0, -20, -160],
                              rotate: [0, -20, -35],
                              opacity: [1, 1, 0],
                            }
                          : {
                              x: 0,
                              y: 0,
                              rotate: 0,
                              opacity: 1,
                            }
                      }
                      transition={{
                        duration: 1,
                        ease: "easeIn",
                      }}
                      className="inline-block"
                    >
                      <Icon name="ph:paper-plane-tilt" size={15} />
                    </motion.span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            <p
              id="ks-mail-err"
              className="m-0 mt-3 min-h-[20px] text-[13px]"
              style={{
                color: "#D8452F",
              }}
            >
              {error}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
