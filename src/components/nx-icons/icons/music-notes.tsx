"use client";

import { useId } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

export type MusicNotesIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Not used by this icon (its notes are solid glyphs); kept so every icon takes the same props. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the beamed pair of notes, such as #bf5af2 (it is drawn with a soft gradient of it). Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** One lap, in seconds: each note hops once, the single note half a beat after the pair. */
const LAP = 1.4;
/** One hop sampled every lap/56: y lift, squash and stretch, lean, and the shadow's width and strength under it. */
const PAIR = { y: [0, 0, 0, 0, 0, 0, 0, 0, -0.032, -0.226, -0.411, -0.589, -0.758, -0.918, -1.071, -1.215, -1.351, -1.479, -1.598, -1.709, -1.812, -1.906, -1.993, -2.071, -2.14, -2.202, -2.255, -2.3, -2.336, -2.365, -2.385, -2.396, -2.4, -2.395, -2.382, -2.361, -2.331, -2.293, -2.247, -2.193, -2.13, -2.059, -1.979, -1.892, -1.796, -1.692, -1.579, -1.459, -1.33, -1.193, -1.047, -0.893, -0.731, -0.561, -0.382, -0.195, 0], sy: [0.9, 0.924, 0.945, 0.962, 0.976, 0.987, 0.994, 0.999, 1.001, 1.006, 1.011, 1.015, 1.019, 1.023, 1.026, 1.028, 1.03, 1.028, 1.026, 1.024, 1.022, 1.02, 1.019, 1.017, 1.015, 1.013, 1.011, 1.009, 1.007, 1.005, 1.004, 1.002, 1, 1.002, 1.004, 1.006, 1.008, 1.009, 1.011, 1.013, 1.015, 1.017, 1.019, 1.021, 1.023, 1.024, 1.026, 1.028, 1.03, 1.032, 1.034, 1.036, 1.038, 1.039, 1.041, 1.043, 0.9], sx: [1.054, 1.04, 1.029, 1.02, 1.012, 1.007, 1.003, 1.001, 1, 0.997, 0.995, 0.992, 0.99, 0.989, 0.987, 0.986, 0.985, 0.986, 0.987, 0.988, 0.989, 0.99, 0.991, 0.992, 0.993, 0.994, 0.995, 0.995, 0.996, 0.997, 0.998, 0.999, 1, 0.999, 0.998, 0.997, 0.996, 0.995, 0.994, 0.993, 0.993, 0.992, 0.991, 0.99, 0.989, 0.988, 0.987, 0.986, 0.985, 0.984, 0.984, 0.983, 0.982, 0.981, 0.98, 0.979, 1.054], r: [0, 0, 0, 0, 0, 0, 0, 0, -0.05, -0.345, -0.614, -0.854, -1.064, -1.246, -1.397, -1.519, -1.611, -1.673, -1.707, -1.714, -1.693, -1.647, -1.578, -1.485, -1.373, -1.241, -1.093, -0.931, -0.756, -0.572, -0.38, -0.183, 0.016, 0.215, 0.411, 0.602, 0.785, 0.958, 1.118, 1.263, 1.392, 1.502, 1.59, 1.656, 1.698, 1.714, 1.704, 1.665, 1.598, 1.501, 1.375, 1.219, 1.033, 0.817, 0.573, 0.3, 0], shx: [1, 1, 1, 1, 1, 1, 1, 1, 0.994, 0.961, 0.928, 0.897, 0.867, 0.839, 0.813, 0.787, 0.764, 0.741, 0.72, 0.701, 0.683, 0.666, 0.651, 0.638, 0.625, 0.615, 0.605, 0.598, 0.591, 0.586, 0.583, 0.581, 0.58, 0.581, 0.583, 0.587, 0.592, 0.599, 0.607, 0.616, 0.627, 0.64, 0.654, 0.669, 0.686, 0.704, 0.724, 0.745, 0.767, 0.791, 0.817, 0.844, 0.872, 0.902, 0.933, 0.966, 1], sho: [1, 1, 1, 1, 1, 1, 1, 1, 0.993, 0.948, 0.906, 0.865, 0.826, 0.79, 0.755, 0.722, 0.69, 0.661, 0.634, 0.608, 0.585, 0.563, 0.543, 0.525, 0.509, 0.495, 0.483, 0.473, 0.465, 0.458, 0.453, 0.451, 0.45, 0.451, 0.454, 0.459, 0.466, 0.474, 0.485, 0.498, 0.512, 0.528, 0.546, 0.566, 0.588, 0.612, 0.638, 0.666, 0.695, 0.727, 0.76, 0.795, 0.832, 0.871, 0.912, 0.955, 1] };
const SINGLE = { y: [-2.92, -2.956, -2.981, -2.996, -3, -2.994, -2.978, -2.951, -2.914, -2.866, -2.809, -2.741, -2.662, -2.573, -2.474, -2.365, -2.245, -2.115, -1.974, -1.823, -1.662, -1.491, -1.309, -1.117, -0.914, -0.701, -0.478, -0.244, 0, 0, 0, 0, 0, 0, 0, 0, -0.04, -0.282, -0.514, -0.736, -0.947, -1.148, -1.339, -1.519, -1.689, -1.848, -1.997, -2.136, -2.265, -2.383, -2.491, -2.588, -2.675, -2.752, -2.819, -2.875, -2.92], sy: [1.007, 1.005, 1.004, 1.002, 1, 1.002, 1.004, 1.006, 1.008, 1.009, 1.011, 1.013, 1.015, 1.017, 1.019, 1.021, 1.023, 1.024, 1.026, 1.028, 1.03, 1.032, 1.034, 1.036, 1.038, 1.039, 1.041, 1.043, 0.9, 0.924, 0.945, 0.962, 0.976, 0.987, 0.994, 0.999, 1.001, 1.006, 1.011, 1.015, 1.019, 1.023, 1.026, 1.028, 1.03, 1.028, 1.026, 1.024, 1.022, 1.02, 1.019, 1.017, 1.015, 1.013, 1.011, 1.009, 1.007], sx: [0.996, 0.997, 0.998, 0.999, 1, 0.999, 0.998, 0.997, 0.996, 0.995, 0.994, 0.993, 0.993, 0.992, 0.991, 0.99, 0.989, 0.988, 0.987, 0.986, 0.985, 0.984, 0.984, 0.983, 0.982, 0.981, 0.98, 0.979, 1.054, 1.04, 1.029, 1.02, 1.012, 1.007, 1.003, 1.001, 1, 0.997, 0.995, 0.992, 0.99, 0.989, 0.987, 0.986, 0.985, 0.986, 0.987, 0.988, 0.989, 0.99, 0.991, 0.992, 0.993, 0.994, 0.995, 0.995, 0.996], r: [1.008, 0.762, 0.506, 0.244, -0.021, -0.286, -0.548, -0.802, -1.046, -1.277, -1.491, -1.685, -1.856, -2.002, -2.12, -2.209, -2.264, -2.286, -2.272, -2.22, -2.13, -2.002, -1.833, -1.625, -1.377, -1.089, -0.763, -0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0.066, 0.461, 0.818, 1.138, 1.419, 1.661, 1.863, 2.025, 2.147, 2.231, 2.276, 2.285, 2.258, 2.197, 2.104, 1.981, 1.83, 1.655, 1.458, 1.241, 1.008], shx: [0.591, 0.586, 0.583, 0.581, 0.58, 0.581, 0.583, 0.587, 0.592, 0.599, 0.607, 0.616, 0.627, 0.64, 0.654, 0.669, 0.686, 0.704, 0.724, 0.745, 0.767, 0.791, 0.817, 0.844, 0.872, 0.902, 0.933, 0.966, 1, 1, 1, 1, 1, 1, 1, 1, 0.994, 0.961, 0.928, 0.897, 0.867, 0.839, 0.813, 0.787, 0.764, 0.741, 0.72, 0.701, 0.683, 0.666, 0.651, 0.638, 0.625, 0.615, 0.605, 0.598, 0.591], sho: [0.465, 0.458, 0.453, 0.451, 0.45, 0.451, 0.454, 0.459, 0.466, 0.474, 0.485, 0.498, 0.512, 0.528, 0.546, 0.566, 0.588, 0.612, 0.638, 0.666, 0.695, 0.727, 0.76, 0.795, 0.832, 0.871, 0.912, 0.955, 1, 1, 1, 1, 1, 1, 1, 1, 0.993, 0.948, 0.906, 0.865, 0.826, 0.79, 0.755, 0.722, 0.69, 0.661, 0.634, 0.608, 0.585, 0.563, 0.543, 0.525, 0.509, 0.495, 0.483, 0.473, 0.465] };

/**
 * A single note and a beamed pair stand on one floor and hop to a beat in turn, squashing as they land and stretching
 * as they leave, with a soft shadow beneath each that shrinks as it rises. A loop for loading music.
 */
export function MusicNotesIcon({ size = 24, className, speed = 1, accent = "currentColor", play }: MusicNotesIconProps) {
  const reduce = useReducedMotion();
  const on = !reduce && (play ?? true);
  const id = useId().replace(/:/g, "");

  const loop: Transition = { duration: LAP / speed, ease: "linear", repeat: Infinity };
  const rest: Transition = { duration: 0.3 / speed };
  // Sampled from a real hop: a short beat on the floor (squashed, recovering), then a gravity arc, stretched by its speed.
  const pair = on
    ? { y: PAIR.y, scaleY: PAIR.sy, scaleX: PAIR.sx, rotate: PAIR.r }
    : { y: 0, scaleY: 1, scaleX: 1, rotate: 0 };
  const single = on
    ? { y: SINGLE.y, scaleY: SINGLE.sy, scaleX: SINGLE.sx, rotate: SINGLE.r }
    : { y: 0, scaleY: 1, scaleX: 1, rotate: 0 };
  const pairShadow = on ? { scaleX: PAIR.shx, opacity: PAIR.sho } : { scaleX: 1, opacity: 1 };
  const singleShadow = on ? { scaleX: SINGLE.shx, opacity: SINGLE.sho } : { scaleX: 1, opacity: 1 };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      overflow="visible"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-pair`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: `color-mix(in srgb, ${accent} 72%, white)` }} />
          <stop offset="0.55" style={{ stopColor: accent }} />
          <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${accent} 80%, black)` }} />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.ellipse cx="4.9" cy="20.8" rx="2.8" ry="0.72" fill={`url(#${id}-shadow)`} style={{ originX: "50%", originY: "50%" }} initial={false} animate={singleShadow} transition={on ? loop : rest} />
      <motion.ellipse cx="15.9" cy="20.8" rx="5.4" ry="0.78" fill={`url(#${id}-shadow)`} style={{ originX: "50%", originY: "50%" }} initial={false} animate={pairShadow} transition={on ? loop : rest} />
      <motion.path
        d="M7.264 17.722A2.55 1.8 -22 1 1 2.536 19.632A2.55 1.8 -22 1 1 7.264 17.722ZM6.059 8.6H7.359C7.659 10.15 8.909 10.95 9.859 12.05C10.959 13.35 10.909 14.95 9.909 16.15C10.309 14.9 10.059 13.75 9.059 12.95C8.459 12.45 7.909 12.15 7.359 12.05V18.216L6.059 19.116Z"
        fill="currentColor"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={single}
        transition={on ? loop : rest}
      />
      <motion.path
        d="M15.264 17.722A2.55 1.8 -22 1 1 10.536 19.632A2.55 1.8 -22 1 1 15.264 17.722ZM21.264 16.322A2.55 1.8 -22 1 1 16.536 18.232A2.55 1.8 -22 1 1 21.264 16.322ZM14.059 5.4L21.359 4L21.359 6.15L14.059 7.55ZM14.059 5.6H15.359V18.216L14.059 19.116ZM20.059 4.449H21.359V16.816L20.059 17.716Z"
        fill={`url(#${id}-pair)`}
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={pair}
        transition={on ? loop : rest}
      />
    </svg>
  );
}
