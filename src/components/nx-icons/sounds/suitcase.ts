import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.95;

/** Ratchet clicks as the telescopic handle slides down and locks, a quick ratchet run and lock as it is pulled out again, a plastic scrape as the case tips, and small wheels rumbling as it rolls forward and back, ending in a soft knock as it stands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.09, 0.13, 0.17].forEach((at, i) => tick(c, o, t(at), 0.09, 2600 + i * 300)); // 0.04-0.17 the handle ratchets down
  tick(c, o, t(0.18), 0.12, 1700); // 0.18 the handle bottoms out
  thud(c, o, t(0.18), 200, 0.1, 0.05); // 0.18 small plastic clunk
  [0.31, 0.35, 0.4, 0.46, 0.54, 0.64].forEach((at, i) => tick(c, o, t(at), 0.08, 3400 - i * 250)); // 0.31-0.64 the handle shoots back out, ticks slowing as it eases
  swish(c, o, t(0.3), t(0.2), 200, 450, 0.03); // 0.30-0.50 the case tips onto its wheels
  tick(c, o, t(0.7), 0.14, 1600); // 0.70 the handle locks out
  thud(c, o, t(0.7), 170, 0.12, 0.06); // 0.70 lock clunk
  swish(c, o, t(0.5), t(0.25), 300, 900, 0.045); // 0.50-0.75 the wheels roll forward (fastest 0.64)
  [0.53, 0.58, 0.63, 0.68, 0.73].forEach((at, i) => thud(c, o, t(at), 140 + (i % 2) * 30, 0.06, 0.04)); // 0.53-0.73 wheels bump over the floor
  swish(c, o, t(0.75), t(0.25), 900, 250, 0.04); // 0.75-1.00 it rolls back and tips upright (fastest 0.9)
  [0.78, 0.84, 0.9, 0.95].forEach((at, i) => thud(c, o, t(at), 130 + (i % 2) * 30, 0.05, 0.04)); // 0.78-0.95 wheel bumps on the way back
  thud(c, o, t(0.99), 100, 0.2, 0.1); // 0.99 the case settles upright
}
