import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.72;

/** A deep blast and a low rumble while the cone shakes, three rising whooshes with a crackle each as sparks fly out, a sizzle as lava creeps down, and soft puffs of smoke. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.25, 700, 0.03, "lowpass"); // 0.02 smoke starts to rise and fade (until 0.36)
  thud(c, o, t(0.08), 70, 0.28, 0.3); // 0.08 the eruption blast, cone starts to shake
  swish(c, o, t(0.08), t(0.55), 110, 70, 0.1); // 0.08-0.63 rumble while the cone shakes
  swish(c, o, t(0.1), t(0.3), 700, 2200, 0.04); // 0.10 spark 1 launches
  swish(c, o, t(0.22), t(0.3), 600, 2000, 0.04); // 0.22 spark 2 launches
  swish(c, o, t(0.34), t(0.3), 800, 2400, 0.04); // 0.34 spark 3 launches
  tick(c, o, t(0.41), 0.07, 6200); // 0.41 spark 1 at its highest
  tick(c, o, t(0.53), 0.07, 5400); // 0.53 spark 2 at its highest
  tick(c, o, t(0.65), 0.07, 7000); // 0.65 spark 3 at its highest
  swish(c, o, t(0.3), t(0.6), 4200, 6200, 0.02); // 0.27-0.90 lava creeps down the cone with a sizzle
  puff(c, o, t(0.47), 0.2, 600, 0.03, "lowpass"); // 0.45 fresh smoke rises back in
  tick(c, o, t(0.72), 0.04, 6600); // 0.72 spark 1 dies out
  tick(c, o, t(0.84), 0.035, 6000); // 0.84 spark 2 dies out
  tick(c, o, t(0.96), 0.03, 7200); // 0.96 spark 3 dies out
}
