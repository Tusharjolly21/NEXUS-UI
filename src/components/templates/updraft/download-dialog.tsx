"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COLORS, EASE, SPECTRUM_GRADIENT } from "./theme";
import { Icon, LogoMark } from "./ui";

const PLATFORMS = [
  {
    id: "mac",
    label: "macOS",
    icon: "ph:apple-logo",
    builds: [
      {
        t: "Apple silicon",
        d: "M1 and newer · 148 MB",
      },
      {
        t: "Intel",
        d: "macOS 13 or later · 156 MB",
      },
    ],
  },
  {
    id: "win",
    label: "Windows",
    icon: "ph:windows-logo",
    builds: [
      {
        t: "x64 installer",
        d: "Windows 10 or later · 162 MB",
      },
      {
        t: "Arm64 installer",
        d: "Snapdragon laptops · 158 MB",
      },
    ],
  },
  {
    id: "linux",
    label: "Linux",
    icon: "ph:linux-logo",
    builds: [
      {
        t: ".deb package",
        d: "Ubuntu, Debian · 151 MB",
      },
      {
        t: ".rpm package",
        d: "Fedora, RHEL · 151 MB",
      },
      {
        t: "AppImage",
        d: "Any distro · 160 MB",
      },
    ],
  },
];

export function DownloadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeId, setActiveId] = useState("mac");
  const [copied, setCopied] = useState<string | null>(null);
  const dialogRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.documentElement.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      return dialogRef.current?.focus();
    }, 50);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = "";
      window.clearTimeout(timer);
      setCopied(null);
    };
  }, [open, onClose]);
  const current = PLATFORMS.find((platform) => platform.id === activeId) ?? PLATFORMS[0];
  const copy = (text: string) => {
    setCopied(text);
    window.setTimeout(() => setCopied((prev) => (prev === text ? text + "!" : prev)), 1300);
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center p-4"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.25,
          }}
        >
          <div className="absolute inset-0 bg-[#121317]/35 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dl-title"
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 12,
              scale: 0.98,
            }}
            transition={{
              duration: 0.45,
              ease: EASE,
            }}
            className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_40px_100px_-30px_rgba(18,19,23,.45)] sm:p-8"
          >
            <div
              aria-hidden={true}
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{
                background: SPECTRUM_GRADIENT,
              }}
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <LogoMark size={30} />
                <h3 id="dl-title" className="mt-4 text-[26px] font-[470] tracking-[-0.03em]">
                  Download Updraft
                </h3>
                <p
                  className="mt-1 text-[14px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  Version 1.4.2 · Free while in preview
                </p>
              </div>
              <button
                ref={dialogRef}
                onClick={onClose}
                aria-label="Close"
                className="ud-ring grid size-9 place-items-center rounded-full bg-[#F2F3F5] transition-colors hover:bg-[#E9EAEE]"
              >
                <Icon name="ph:x" size={16} />
              </button>
            </div>
            <div role="tablist" className="relative mt-6 grid grid-cols-3 rounded-full bg-[#F2F3F5] p-1">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  role="tab"
                  aria-selected={activeId === platform.id}
                  onClick={() => {
                    setActiveId(platform.id);
                    setCopied(null);
                  }}
                  className="ud-ring relative z-10 flex h-9 items-center justify-center gap-1.5 rounded-full text-[13.5px] font-[500]"
                >
                  {activeId === platform.id && (
                    <motion.span
                      layoutId="dl-tab"
                      className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.08)]"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 38,
                      }}
                    />
                  )}
                  <Icon name={platform.icon} size={15} />
                  {platform.label}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.ul
                key={activeId}
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -4,
                }}
                transition={{
                  duration: 0.25,
                  ease: EASE,
                }}
                className="mt-4 space-y-2"
              >
                {current.builds.map((build) => {
                  const state = copied === build.t ? "busy" : copied === build.t + "!" ? "done" : "idle";
                  return (
                    <li key={build.t}>
                      <button
                        onClick={() => copy(build.t)}
                        className="ud-ring group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-[#F7F7F9]"
                        style={{
                          borderColor: COLORS.line,
                        }}
                      >
                        <span className="grid size-10 place-items-center rounded-xl bg-[#F2F3F5]">
                          <Icon name={current.icon} size={20} />
                        </span>
                        <span className="flex-1">
                          <span className="block text-[15px] font-[520]">{build.t}</span>
                          <span
                            className="block text-[13px]"
                            style={{
                              color: COLORS.soft,
                            }}
                          >
                            {build.d}
                          </span>
                        </span>
                        <span className="relative grid size-9 place-items-center rounded-full bg-[#121317] text-white">
                          {state === "busy" ? (
                            <Icon name="ph:circle-notch" size={16} className="ud-spin-fast" />
                          ) : state === "done" ? (
                            <Icon name="ph:check" size={16} />
                          ) : (
                            <Icon
                              name="ph:download-simple"
                              size={16}
                              className="transition-transform group-hover:translate-y-0.5"
                            />
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            </AnimatePresence>
            <p
              className="mt-5 text-[12.5px]"
              style={{
                color: COLORS.soft,
              }}
              aria-live="polite"
            >
              {copied != null && copied.endsWith("!")
                ? "Your download has started. Open the file to install."
                : "By downloading you agree to the Updraft terms."}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
