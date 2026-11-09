import { ding, blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.73;

/** A soft rubbery squeeze as the grips close, a steel click with a short ring as the jaw tips meet, a spring creak as they open and a tick as they come to rest. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.18), 900, 1800, 0.03); // 0.04-0.22 the handles are squeezed
  tick(c, o, t(0.19), 0.2, 3600); // 0.19 the jaw tips meet
  ding(c, o, 2100, t(0.19), 0.08, 0.2); // 0.19 steel rings
  thud(c, o, t(0.19), 160, 0.12, 0.05); // 0.19 the rubber grips touch
  blip(c, o, 520, t(0.4), 0.05, 0.25, 340, "triangle"); // 0.40-0.66 the jaws spring open
  tick(c, o, t(0.68), 0.08, 2200); // 0.68 fully open again
}
