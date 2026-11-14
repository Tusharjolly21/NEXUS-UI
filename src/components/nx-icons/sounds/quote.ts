import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.23;

/** Two woody pops, a higher one then a lower one, each preceded by a whoosh as the mark swings in on its head, and a small settle tick as the tails come to rest. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.0-0.39 the first mark swings in
  swish(c, o, t(0.02), t(0.37), 700, 2400, 0.05);
  // 0.39 the first mark reaches its overshoot
  blip(c, o, 520, t(0.39), 0.1, 0.1, 380, "triangle");
  // 0.2-0.59 the second mark swings in
  swish(c, o, t(0.22), t(0.37), 600, 2100, 0.05);
  // 0.59 the second mark reaches its overshoot
  blip(c, o, 430, t(0.59), 0.1, 0.1, 320, "triangle");
  // 0.8 the second mark settles
  tick(c, o, t(0.8), 0.06, 3400);
}
