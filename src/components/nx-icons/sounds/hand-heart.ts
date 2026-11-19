import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.74;

/** A warm rising tone as the hand lifts the heart, two soft heartbeat thumps as it beats, and a gentle hush as the hand lowers. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 300, t(0.0), 0.04, 0.21, 450); // 0.00-0.21 the hand lifts the heart
  thud(c, o, t(0.342), 72, 0.28, 0.16); // 0.34 the heart beats
  thud(c, o, t(0.608), 66, 0.22, 0.16); // 0.61 the heart beats again
  swish(c, o, t(0.71), t(0.24), 700, 380, 0.018); // 0.71-0.95 the hand lowers back down
}
