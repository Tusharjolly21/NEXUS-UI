import { ding, blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.33;

/** A servo whine that opens and then closes in as the sight ring tightens, a hard metal clack the moment it locks on, two sonar style pulses from the red dot, and a faint rising shimmer as the ripple spreads. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.18), 500, 1800, 0.025); // 0.00-0.18 the ring opens wide
  swish(c, o, t(0.18), t(0.225), 2400, 700, 0.04); // 0.18-0.41 the ring and the ticks close in
  tick(c, o, t(0.405), 0.14, 4200); // 0.41 the ring snaps tight: lock on
  ding(c, o, 2100, t(0.405), 0.05, 0.12); // 0.41 a short metal ring of the lock
  thud(c, o, t(0.405), 190, 0.1, 0.08); // 0.41 the sight settles with weight
  swish(c, o, t(0.4), t(0.45), 1400, 3200, 0.02); // 0.40-0.85 the ripple spreads out from the dot
  blip(c, o, 860, t(0.44), 0.07, 0.1, 1300); // 0.47 the red dot swells: first pulse
  blip(c, o, 860, t(0.68), 0.04, 0.1, 1100); // 0.70 the dot swells again: a smaller pulse
  tick(c, o, t(0.9), 0.05, 2600); // 0.90 the ring comes to rest
}
