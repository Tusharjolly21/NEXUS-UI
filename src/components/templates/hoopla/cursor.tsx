"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { BOUNCY, COLOR, INK } from "./theme";
/** On mouse and trackpad, a chunky arrow cursor on a spring that tilts and names what a link does (data-cursor). */
export function Cursor() {
  const pointerX = useMotionValue(-200);
  const pointerY = useMotionValue(-200);
  const cursorX = useSpring(pointerX, {
    stiffness: 900,
    damping: 50,
    mass: 0.4,
  });
  const cursorY = useSpring(pointerY, {
    stiffness: 900,
    damping: 50,
    mass: 0.4,
  });
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [fine, setFine] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFine(window.matchMedia("(pointer: fine)").matches);
    const onMove = (event: PointerEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      const target = (event.target as Element | null)?.closest?.(
        "[data-cursor]",
      );
      setLabel(target ? target.getAttribute("data-cursor") : null);
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [pointerX, pointerY]);
  if (fine) {
    return (
      <motion.div
        aria-hidden={true}
        className="pointer-events-none fixed left-0 top-0 z-[200]"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      >
        <motion.svg
          width="30"
          height="34"
          viewBox="0 0 30 34"
          animate={{
            scale: pressed ? 0.82 : 1,
            rotate: label ? -12 : 0,
          }}
          transition={BOUNCY}
          style={{
            filter: "drop-shadow(0 3px 4px rgba(11,18,51,.25))",
            originX: 0,
            originY: 0,
          }}
        >
          <path
            d="M3 2 L26 17 L15 19.5 L20 30 L15.5 32 L10.5 21.5 L3 28 Z"
            fill={COLOR.sky}
            stroke={INK}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M6 7 L19 16"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity=".7"
          />
        </motion.svg>
        <AnimatePresence>
          {label && (
            <motion.span
              initial={{
                opacity: 0,
                scale: 0.6,
                x: 10,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 24,
                y: 22,
              }}
              exit={{
                opacity: 0,
                scale: 0.6,
              }}
              transition={BOUNCY}
              className="absolute left-0 top-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[14px] font-semibold"
              style={{
                background: "#fff",
                color: INK,
                boxShadow: `0 0 0 2px ${INK}, 0 8px 16px -6px rgba(11,18,51,.35)`,
              }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    );
  } else {
    return null;
  }
}
