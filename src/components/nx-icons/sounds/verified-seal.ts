import { ding, blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.36;

/** A turning shuffle and a firm stamp press as the seal rotates one notch, then a rising sweep as the tick draws itself and a clear bright chime when it completes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.39), 700, 1800, 0.03); // 0.00-0.39 the seal turns one notch
  thud(c, o, t(0.39), 118, 0.16, 0.12); // 0.39 the seal presses down like a stamp
  blip(c, o, 830, t(0.45), 0.04, 0.29, 1245); // 0.45-0.74 the check mark draws itself
  ding(c, o, 1397, t(0.738), 0.08, 0.45); // 0.74 the check mark is complete
}
