import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { animate, useReducedMotion } from "framer-motion";

/** A ref to put on an element, and that element's size, kept up to date as it resizes. */
export function useSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({
    w: 0,
    h: 0,
  });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    setSize({
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    });
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        w: Math.round(entry.contentRect.width),
        h: Math.round(entry.contentRect.height),
      }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

const noSubscribe = () => () => {};

/** False in the server render and during hydration, true after. For text only the browser knows: the clock and time zone. */
export function useHydrated() {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
}

/** True below the breakpoint. Reads false on the server and during hydration, so the first render always matches. */
export function useIsMobile(breakpoint = 1024) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(`(max-width:${breakpoint - 1}px)`);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [breakpoint],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(`(max-width:${breakpoint - 1}px)`).matches,
    () => false,
  );
}

/** Calls onDismiss on a pointer press outside the element, or on Escape, while open. */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onDismiss: () => void) {
  const latest = useRef(onDismiss);
  useEffect(() => {
    latest.current = onDismiss;
  });
  useEffect(() => {
    if (!open) {
      return;
    }
    const onDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        latest.current();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        latest.current();
      }
    };
    const timer = setTimeout(() => window.addEventListener("pointerdown", onDown), 0);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, ref]);
}

/**
 * A list of numbers that springs toward `target` whenever it changes (all of them on one spring, so a chart's points
 * move together). Starts from `initial` when given, so a chart can grow in from zero.
 */
export function useTweenedValues(target: number[], initial?: number[], delay = 0) {
  const reduce = useReducedMotion();
  const start = initial ?? target;
  const [values, setValues] = useState(start);
  const current = useRef(start);
  const key = target.map((value) => value.toFixed(3)).join(",");
  useEffect(() => {
    const from = current.current.slice();
    const to = target;
    if (reduce || from.length !== to.length) {
      current.current = to;
      setValues(to);
      return;
    }
    const controls = animate(0, 1, {
      type: "spring",
      stiffness: 130,
      damping: 19,
      restDelta: 5e-4,
      delay,
      onUpdate: (progress) => {
        const next = from.map((value, index) => value + (to[index] - value) * progress);
        current.current = next;
        setValues(next);
      },
    });
    return () => controls.stop();
    // keyed on the values themselves, so a new array with the same numbers does not restart the spring
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reduce]);
  return values;
}
