import { ding, blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.67;

/** A soft bowed sweep as each segment draws round, climbing a little each time, with a dry click at each join and a rubbery pop plus a bright ping as the orange piece pushes out and a last click as it settles home. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.01), 0.3, 500, 1500, 0.053); // 0.01 first segment starts drawing (fastest at the start)
  swish(c, o, t(0.3), 0.3, 650, 1900, 0.053); // 0.31 second segment draws on
  swish(c, o, t(0.59), 0.3, 800, 2400, 0.053); // 0.6 orange segment draws on
  tick(c, o, t(0.34), 0.08, 2600); // 0.34 first join closes
  tick(c, o, t(0.6), 0.08, 3000); // 0.6 second join, orange segment begins
  tick(c, o, t(0.89), 0.09, 3400); // 0.89 orange segment completes the ring
  blip(c, o, 520, t(0.88), 0.12, 0.13, 940, "triangle"); // 0.88 the orange piece springs outward
  ding(c, o, 3100, t(1.03), 0.05, 0.25); // 1.03 orange piece fully out, bright ping
  tick(c, o, t(1.18), 0.06, 2200); // 1.18 the piece settles back into place
}
