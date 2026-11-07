import { ding, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.77;

/** A bright whoosh that falls as the star streaks in from the corner, thin zips as the trail lines draw, then glassy twinkles as the star pulses. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.5), 6500, 1300, 0.07); // 0.00-0.50 star streaks in and slows
  swish(c, o, t(0.1), t(0.14), 7500, 5000, 0.025); // 0.10 first trail line draws
  swish(c, o, t(0.16), t(0.14), 7500, 4500, 0.025); // 0.16 second trail line draws
  swish(c, o, t(0.22), t(0.14), 7000, 4000, 0.025); // 0.22 third trail line draws
  ding(c, o, 5200, t(0.27), 0.03, 0.15); // 0.27 star shrinks in a glint
  ding(c, o, 3136, t(0.5), 0.08, 0.35); // 0.495 star lands and swells to 1.28
  tick(c, o, t(0.5), 0.07, 8200); // 0.495 sparkle at the swell
  ding(c, o, 4186, t(0.77), 0.05, 0.3); // 0.765 final twinkle
}
