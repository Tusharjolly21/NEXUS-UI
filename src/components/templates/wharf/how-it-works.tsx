"use client";

/* eslint-disable react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { HOW_STEPS, TOKENS } from "./data";
import { COLOR, CONTAINER, EASE, SPRING } from "./theme";
import { Icon, Mono, SectionTitle } from "./ui";
/**
 * A working checkout: pick a token and an amount, choose whether gas is sponsored, and pay. It routes, counts down
 * and settles in USDC, and the step on the left (Accept, Route, Sponsor, Settle) follows along.
 */
export function CheckoutDemo({ step }: { step: number }) {
  const [token, setToken] = useState("USDT");
  const [amount, setAmount] = useState("250.00");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sponsorGas, setSponsorGas] = useState(true);
  const [status, setStatus] = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [requoting, setRequoting] = useState(false);
  const tokenInfo = TOKENS[token];
  const amountNumber = parseFloat(amount) || 0;
  const usd = amountNumber * tokenInfo.usd;
  const tooMuch = amountNumber > tokenInfo.bal;
  const fee = usd * 0.0012;
  const received = Math.max(0, usd * 0.9988 - fee + fee);
  const quoted = (usd * 0.9988).toFixed(2);
  useEffect(() => {
    setRequoting(true);
    const timer = window.setTimeout(() => setRequoting(false), 380);
    return () => window.clearTimeout(timer);
  }, [amount, token]);
  useEffect(() => {
    if (step >= 3) {
      setStatus("done");
    } else {
      setStatus((prev) => (prev === "done" ? "idle" : prev));
    }
  }, [step]);
  const pay = () => {
    if (tooMuch || amountNumber <= 0) {
      return;
    }
    setStatus("confirm");
    setCountdown(3);
    let left = 3;
    const ticker = window.setInterval(() => {
      left--;
      setCountdown(left);
      if (left <= 0) {
        window.clearInterval(ticker);
        setStatus("done");
      }
    }, 450);
  };
  const fieldStyle = {
    background: "#F4F5F7",
    borderRadius: 14,
  };
  return (
    <div
      className="relative w-full max-w-[430px] overflow-hidden rounded-[22px] bg-white p-3"
      style={{
        boxShadow: `0 0 0 1px ${COLOR.line}, 0 40px 80px -40px rgba(17,18,20,.35)`,
      }}
    >
      <div className="flex items-center justify-between px-2 pb-3 pt-1.5">
        <span
          className="text-[14px] font-medium"
          style={{
            color: COLOR.ink,
          }}
        >
          Checkout
        </span>
        <Mono
          className="text-[11.5px]"
          style={{
            color: COLOR.soft,
          }}
        >
          ORDER 2841
        </Mono>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
              filter: "blur(6px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.4,
              ease: EASE,
            }}
            className="flex flex-col items-center px-2 pb-2 pt-6 text-center"
            key="done"
          >
            <motion.span
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.1,
              }}
              className="grid h-14 w-14 place-items-center rounded-full bg-white"
              style={{
                color: COLOR.green,
                boxShadow: `0 0 0 1px ${COLOR.line}, 0 10px 24px -12px rgba(17,18,20,.3)`,
              }}
            >
              <Icon name="ph:check" size={24} />
            </motion.span>
            <h3
              className="m-0 mt-4 text-[22px] font-medium tracking-[-0.02em]"
              style={{
                color: COLOR.ink,
              }}
            >
              Settled
            </h3>
            <p
              className="m-0 mt-1.5 flex items-center gap-1.5 text-[13.5px]"
              style={{
                color: COLOR.ink,
              }}
            >
              <i
                className="h-3 w-3 rounded-full"
                style={{
                  background: tokenInfo.col,
                }}
              />
              {amountNumber.toFixed(2)} {token}
              <span
                style={{
                  color: COLOR.faint,
                }}
              >
                →
              </span>
              <i
                className="h-3 w-3 rounded-full"
                style={{
                  background: COLOR.blue,
                }}
              />
              {quoted} USDC
            </p>
            <p
              className="m-0 mt-1 text-[12px]"
              style={{
                color: COLOR.soft,
              }}
            >
              Fee {fee.toFixed(2)} USDC · {sponsorGas ? "gas sponsored" : `gas ${tokenInfo.gas}`}
            </p>
            <button
              type="button"
              className="wf-ring mt-4 rounded-full px-3 py-1.5 text-[12.5px] outline-none"
              style={{
                background: "#F1F2F4",
                color: COLOR.ink,
              }}
            >
              View receipt
            </button>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="wf-ring mt-6 w-full rounded-full py-3 text-[14px] font-medium text-white outline-none"
              style={{
                background: COLOR.ink,
              }}
            >
              New payment
            </button>
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
              }}
              className="mt-3 flex w-full items-center justify-between px-4 py-3 text-[12.5px]"
              style={fieldStyle}
            >
              <span
                className="flex items-center gap-2"
                style={{
                  color: COLOR.ink,
                }}
              >
                <i
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: COLOR.green,
                  }}
                />
                Reconciled
              </span>
              <Mono
                className="text-[11px]"
                style={{
                  color: COLOR.soft,
                }}
              >
                BLOCK 21,408,377
              </Mono>
              <span
                style={{
                  color: COLOR.ink,
                }}
              >
                {quoted} USDC
              </span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              filter: "blur(6px)",
            }}
            transition={{
              duration: 0.3,
            }}
            key="form"
          >
            <AnimatePresence initial={false}>
              {sponsorGas && step >= 2 && (
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: EASE,
                  }}
                  className="overflow-hidden"
                >
                  <div
                    className="mb-1.5 flex items-center gap-2 rounded-[12px] px-3 py-2.5 text-[13px]"
                    style={{
                      background: COLOR.greenWash,
                      color: "#11592E",
                    }}
                  >
                    <Icon name="ph:check-circle-fill" size={15} />
                    Gas sponsored by Wharf
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div
              className="p-3.5"
              style={{
                ...fieldStyle,
                boxShadow: step === 0 ? `inset 0 0 0 1.5px ${COLOR.blue}` : undefined,
                transition: "box-shadow .3s",
              }}
            >
              <div
                className="flex justify-between text-[12px]"
                style={{
                  color: COLOR.soft,
                }}
              >
                <span>Pay with</span>
                <span
                  style={{
                    color: tooMuch ? "#D13B3B" : COLOR.soft,
                  }}
                >
                  {tooMuch ? "Exceeds balance " : "Balance "}
                  {tokenInfo.bal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <input
                  aria-label="Amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))}
                  className="wf-ring w-full min-w-0 rounded border-0 bg-transparent text-[26px] font-medium tracking-[-0.03em] tabular-nums outline-none"
                  style={{
                    color: tooMuch ? "#D13B3B" : COLOR.ink,
                  }}
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-expanded={menuOpen}
                    aria-haspopup="listbox"
                    className="wf-ring flex items-center gap-1.5 rounded-full bg-white py-1 pl-1.5 pr-2.5 text-[13px] font-medium outline-none"
                    style={{
                      boxShadow: `0 0 0 1px ${COLOR.line}`,
                      color: COLOR.ink,
                    }}
                  >
                    <i
                      className="h-4 w-4 rounded-full"
                      style={{
                        background: tokenInfo.col,
                      }}
                    />
                    {token}
                    <Icon name="ph:caret-down" size={11} />
                  </button>
                  <AnimatePresence>
                    {menuOpen && (
                      <motion.ul
                        role="listbox"
                        initial={{
                          opacity: 0,
                          y: -4,
                          scale: 0.96,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -4,
                          scale: 0.96,
                        }}
                        transition={SPRING}
                        className="absolute right-0 top-[calc(100%+6px)] z-20 m-0 w-[150px] list-none rounded-[12px] bg-white p-1"
                        style={{
                          boxShadow: `0 0 0 1px ${COLOR.line}, 0 16px 30px -14px rgba(17,18,20,.35)`,
                        }}
                      >
                        {Object.keys(TOKENS).map((item) => (
                          <li key={item}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={item === token}
                              onClick={() => {
                                setToken(item);
                                setMenuOpen(false);
                                setAmount(item !== "USDT" ? (item === "ETH" ? "0.08" : "1.50") : "250.00");
                              }}
                              className="wf-ring flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[13px] outline-none hover:bg-[#F4F5F7]"
                              style={{
                                color: COLOR.ink,
                              }}
                            >
                              <i
                                className="h-4 w-4 rounded-full"
                                style={{
                                  background: TOKENS[item].col,
                                }}
                              />
                              {item}
                              <span
                                className="ml-auto text-[11px]"
                                style={{
                                  color: COLOR.faint,
                                }}
                              >
                                {TOKENS[item].bal}
                              </span>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div
                className="mt-0.5 text-[12px] tabular-nums"
                style={{
                  color: COLOR.soft,
                }}
              >
                $
                {usd.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="relative z-10 -my-2.5 flex justify-center">
              <span
                className="grid h-7 w-7 place-items-center rounded-full bg-white"
                style={{
                  color: COLOR.blue,
                  boxShadow: `0 0 0 1px ${COLOR.line}`,
                }}
              >
                <Icon name="ph:arrow-down" size={13} />
              </span>
            </div>
            <div
              className="p-3.5"
              style={{
                ...fieldStyle,
                boxShadow: step === 1 ? `inset 0 0 0 1.5px ${COLOR.blue}` : undefined,
                transition: "box-shadow .3s",
              }}
            >
              <div
                className="flex justify-between text-[12px]"
                style={{
                  color: COLOR.soft,
                }}
              >
                <span>Merchant receives</span>
                <span className="flex items-center gap-1">
                  {requoting && (
                    <span
                      className="wf-anim inline-block"
                      style={{
                        animation: "wf-spin .8s linear infinite",
                      }}
                    >
                      <Icon name="ph:circle-notch" size={11} />
                    </span>
                  )}
                  {"Quote <400 ms"}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span
                  className="text-[26px] font-medium tracking-[-0.03em] tabular-nums"
                  style={{
                    color: requoting ? COLOR.faint : COLOR.ink,
                    transition: "color .2s",
                  }}
                >
                  {Number(quoted).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span
                  className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-1.5 pr-2.5 text-[13px] font-medium"
                  style={{
                    boxShadow: `0 0 0 1px ${COLOR.line}`,
                    color: COLOR.ink,
                  }}
                >
                  <i
                    className="h-4 w-4 rounded-full"
                    style={{
                      background: COLOR.blue,
                    }}
                  />
                  USDC
                </span>
              </div>
              <div
                className="mt-0.5 text-[12px]"
                style={{
                  color: COLOR.soft,
                }}
              >
                1 {token} ={" "}
                {(tokenInfo.usd * 0.9988).toLocaleString("en-US", {
                  maximumFractionDigits: 4,
                })}{" "}
                USDC
              </div>
              <AnimatePresence initial={false}>
                {step >= 1 && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: EASE,
                    }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-3 grid gap-1.5 pt-3"
                      style={{
                        borderTop: `1px dashed ${COLOR.line2}`,
                      }}
                    >
                      {(
                        [
                          ["Base", "Uniswap pool", 52],
                          ["Arbitrum", "Curve pool", 31],
                          ["Optimism", "Native swap", 17],
                        ] as const
                      ).map(([chain, venue, share], index) => (
                        <div className="flex items-center gap-2 text-[11.5px]" key={chain}>
                          <Mono
                            className="w-[66px]"
                            style={{
                              color: COLOR.ink,
                            }}
                          >
                            {chain}
                          </Mono>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                            <motion.span
                              className="block h-full rounded-full"
                              style={{
                                background: COLOR.blue,
                              }}
                              initial={{
                                width: 0,
                              }}
                              animate={{
                                width: `${share}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                ease: EASE,
                                delay: 0.1 + index * 0.1,
                              }}
                            />
                          </span>
                          <span
                            className="w-[84px] text-right"
                            style={{
                              color: COLOR.soft,
                            }}
                          >
                            {venue} {share}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div
              className="mt-2 px-2 text-[12.5px]"
              style={{
                boxShadow: step === 2 ? `inset 0 0 0 1.5px ${COLOR.blue}` : undefined,
                borderRadius: 12,
                transition: "box-shadow .3s",
              }}
            >
              <div
                className="flex items-center justify-between py-2"
                style={{
                  borderBottom: `1px solid ${COLOR.line}`,
                }}
              >
                <span
                  style={{
                    color: COLOR.ink,
                  }}
                >
                  Sponsor gas
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={sponsorGas}
                  aria-label="Sponsor gas"
                  onClick={() => setSponsorGas((prev) => !prev)}
                  className="wf-ring relative h-[22px] w-[38px] rounded-full outline-none transition-colors"
                  style={{
                    background: sponsorGas ? COLOR.blue : "#D4D6DB",
                  }}
                >
                  <motion.span
                    className="absolute top-[3px] h-4 w-4 rounded-full bg-white"
                    animate={{
                      left: sponsorGas ? 19 : 3,
                    }}
                    transition={SPRING}
                    style={{
                      boxShadow: "0 1px 3px rgba(0,0,0,.25)",
                    }}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <span
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  Network fee
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    style={{
                      color: sponsorGas ? COLOR.faint : COLOR.ink,
                      textDecoration: sponsorGas ? "line-through" : "none",
                    }}
                  >
                    {tokenInfo.gas}
                  </span>
                  {sponsorGas && (
                    <span
                      className="flex items-center gap-1"
                      style={{
                        color: COLOR.ink,
                      }}
                    >
                      <i
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: COLOR.green,
                        }}
                      />
                      Sponsored
                    </span>
                  )}
                </span>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={pay}
              disabled={tooMuch || amountNumber <= 0 || status === "confirm"}
              whileTap={{
                scale: 0.98,
              }}
              className="wf-ring mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-medium text-white outline-none disabled:cursor-not-allowed"
              style={{
                background: tooMuch || amountNumber <= 0 ? "#B9BCC2" : COLOR.ink,
              }}
            >
              {status === "confirm" ? (
                <Fragment>
                  <span
                    className="wf-anim inline-block"
                    style={{
                      animation: "wf-spin .8s linear infinite",
                    }}
                  >
                    <Icon name="ph:circle-notch" size={15} />
                  </span>
                  Confirming… {countdown}
                </Fragment>
              ) : tooMuch ? (
                "Insufficient balance"
              ) : amountNumber <= 0 ? (
                "Enter an amount"
              ) : (
                `Pay ${amountNumber.toLocaleString("en-US", {
                  maximumFractionDigits: 4,
                })} ${token}`
              )}
            </motion.button>
            <span className="hidden">{received}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    const a = window.matchMedia("(min-width: 1024px)");
    const u = () => setAuto(a.matches);
    u();
    a.addEventListener("change", u);
    return () => a.removeEventListener("change", u);
  }, []);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (auto) {
      setStep(Math.min(3, Math.max(0, Math.floor(value * 4.2 - 0.1))));
    }
  });
  const progress = useTransform(scrollYProgress, [0.02, 0.8], [0, 1]);
  return (
    <section
      id="how"
      ref={sectionRef}
      className="relative scroll-mt-20"
      style={{
        height: auto ? "320vh" : "auto",
      }}
    >
      <div className={`${auto ? "sticky top-0 flex h-[100svh] flex-col justify-center" : "py-24"}`}>
        <div className={CONTAINER}>
          <SectionTitle title="One payment." rest="Four moves, one call." />
          <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1fr_430px]">
            <ol className="relative m-0 list-none p-0 pl-10">
              <span
                aria-hidden={true}
                className="absolute bottom-6 left-[11px] top-6 w-px"
                style={{
                  background: COLOR.line2,
                }}
              />
              <motion.span
                aria-hidden={true}
                className="absolute left-[10px] top-6 w-[3px] origin-top rounded-full"
                style={{
                  bottom: 24,
                  scaleY: auto ? progress : step / 3,
                  background: `linear-gradient(${COLOR.blue}, ${COLOR.mid})`,
                  boxShadow: `0 0 12px ${COLOR.mid}`,
                }}
              />
              {HOW_STEPS.map(([a, u], index) => {
                const f = step === index;
                const d = step > index;
                return (
                  <li className="relative py-6" key={a}>
                    <span
                      aria-hidden={true}
                      className="absolute -left-[34px] top-[30px] grid h-[11px] w-[11px] place-items-center rounded-full transition-all duration-300"
                      style={{
                        background: f ? COLOR.blue : "#fff",
                        boxShadow: f
                          ? `0 0 0 4px ${COLOR.wash}, 0 0 14px ${COLOR.mid}`
                          : `inset 0 0 0 1.5px ${d ? COLOR.blue : COLOR.faint}`,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setStep(index)}
                      className="wf-ring rounded text-left outline-none"
                      aria-current={f ? "step" : undefined}
                    >
                      <span className="flex items-baseline gap-2.5">
                        <Mono
                          className="text-[12px]"
                          style={{
                            color: f ? COLOR.ink : COLOR.faint,
                          }}
                        >
                          0{index + 1}
                        </Mono>
                        <span
                          className="text-[22px] font-medium tracking-[-0.02em] transition-colors"
                          style={{
                            color: f ? COLOR.ink : "#8A8D93",
                          }}
                        >
                          {a}
                        </span>
                      </span>
                      <span
                        className="mt-1 block pl-[30px] text-[15px] transition-colors"
                        style={{
                          color: f ? COLOR.text : COLOR.faint,
                        }}
                      >
                        {u}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="flex justify-center lg:justify-end">
              <CheckoutDemo step={step} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
