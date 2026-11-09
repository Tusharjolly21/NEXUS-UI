import { ding, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A metal clack as the lever hits the grip, a long airy hiss from the nozzle with three soft cloud puffs on top, a tiny bell as the gauge needle reaches the top, and a spring click as the lever returns. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.14), 160, 0.13, 0.08); // 0.16 the lever is squeezed down against the grip
  tick(c, o, t(0.16), 0.11, 3600); // 0.16 metal clack
  swish(c, o, t(0.12), 0.24, 3000, 5200, 0.018); // 0.12 to 0.36 the gauge needle sweeps over
  ding(c, o, 4800, t(0.36), 0.035, 0.22); // 0.36 the needle reaches its highest point
  swish(c, o, t(0.25), 0.62, 5200, 2800, 0.07); // 0.25 to 0.87 spray hisses out and the cloud fades away
  puff(c, o, t(0.44), 0.1, 2400, 0.05); // 0.44 first cloud puff is biggest
  puff(c, o, t(0.48), 0.1, 3000, 0.045); // 0.48 second puff
  puff(c, o, t(0.52), 0.1, 2000, 0.045); // 0.52 third puff
  tick(c, o, t(0.78), 0.1, 2700); // 0.8 the lever springs back to rest
}
