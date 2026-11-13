import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Heavy iron whooshes as the kettlebell swings through the bottom of its arc, three times and quieter each time, with a small glint ring as the gleam sweeps. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), t(0.22), 300, 800, 0.03); // 0.05-0.27 the swing builds speed
  swish(c, o, t(0.3), t(0.14), 700, 350, 0.05); // 0.30-0.44 it passes the bottom, fastest at 0.37
  ding(c, o, 3300, t(0.45), 0.025, 0.25); // 0.45 the gleam is at the top of the belly
  swish(c, o, t(0.54), t(0.12), 350, 700, 0.035); // 0.54-0.66 it passes again, fastest at 0.60
  swish(c, o, t(0.76), t(0.1), 600, 350, 0.022); // 0.76-0.86 a last small pass
}
