import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Seven soft sine pulses that swell to the middle and fade away, each a little higher then lower, rolling like a wave. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [196, 233.08, 293.66, 369.99, 311.13, 261.63, 207.65].forEach((f, i) => {
    const g = 0.04 + 0.09 * Math.sin(((i + 0.5) / 7) * Math.PI);
    blip(c, o, f, t(0.02 + i * 0.07), g, 0.28);
    blip(c, o, f * 2, t(0.02 + i * 0.07), g * 0.25, 0.12);
  });
  swish(c, o, t(0.05), t(0.6), 500, 2400, 0.02);
  ding(c, o, 1174.66 * 1.0595, t(0.62), 0.04, 0.45);
}
