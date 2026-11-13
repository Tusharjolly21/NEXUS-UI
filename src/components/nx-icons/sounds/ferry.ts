import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two deep ship horn blasts in time with the puffs of smoke, over a low wash of waves as the hull rocks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.9), 220, 520, 0.055); // 0.00-0.90 hull rocks on the waves
  blip(c, o, 147, t(0.1), 0.1, 0.34, 140, "sawtooth"); // 0.10 first smoke puff leaves the funnel
  blip(c, o, 110, t(0.45), 0.1, 0.4, 105, "sawtooth"); // 0.45 second puff, lower horn
}
