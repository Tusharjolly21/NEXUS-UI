"use client";

import { SpectrumRibbon } from "./spectrum";
import { COLORS, CONTAINER } from "./theme";
import { Button, useOpenDownload } from "./ui";

export function Plans() {
  const openDownload = useOpenDownload();
  const plans = [
    {
      badge: "Free while in preview",
      a: "For individuals",
      b: "Lift your solo work",
      btn: (
        <Button kind="dark" icon="ph:download-simple" onClick={openDownload}>
          Download
        </Button>
      ),
      note: "Generous limits, every surface, no card needed.",
    },
    {
      badge: "Now available",
      a: "For teams",
      b: "Give every engineer a crew",
      btn: (
        <Button kind="light" icon="ph:arrow-right" href="#newsletter">
          Talk to us
        </Button>
      ),
      note: "SSO, audit logs, private sandboxes and usage controls.",
    },
  ];
  return (
    <section
      id="plans"
      className="scroll-mt-20 border-t py-20 sm:py-28"
      style={{
        borderColor: COLORS.line,
      }}
    >
      <div className={CONTAINER}>
        <div className="relative overflow-hidden rounded-[32px]">
          <SpectrumRibbon className="absolute inset-0" />
          <div className="relative grid md:grid-cols-2">
            {plans.map((plan, i) => (
              <div
                key={plan.a}
                className={`relative flex flex-col items-center px-6 py-20 text-center sm:py-28 ${i === 1 ? "md:border-l" : ""}`}
                style={{
                  borderColor: COLORS.line,
                }}
              >
                <div
                  aria-hidden={true}
                  className="absolute left-1/2 top-1/2 h-[64%] w-[78%] -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,255,255,.7) 55%, transparent)",
                  }}
                />
                <span className="relative rounded-md bg-white px-2 py-1 text-[12px] font-[520] shadow-[0_0_0_1px_#ECEDF0]">
                  {plan.badge}
                </span>
                <h3 className="relative mt-5 text-[clamp(30px,3.2vw,42px)] font-[470] leading-[1.06] tracking-[-0.035em]">
                  <span className="block">{plan.a}</span>
                  <span
                    className="block"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    {plan.b}
                  </span>
                </h3>
                <div className="relative mt-7">{plan.btn}</div>
                <p
                  className="relative mt-4 text-[13px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {plan.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
