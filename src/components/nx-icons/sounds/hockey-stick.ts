import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.05;

/** A low whoosh as the stick winds back, a fast swoosh into a hard crack of the slapshot, the puck hissing away, and a small tap as it slides back into place. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.31), 500, 300, 0.03); // 0.00-0.31 the stick winds back
  swish(c, o, t(0.31), t(0.13), 600, 2400, 0.05); // 0.31-0.44 the stick swings down at speed
  tick(c, o, t(0.43), 0.14, 2200); // 0.43 the blade cracks against the puck
  thud(c, o, t(0.43), 160, 0.1, 0.08); // 0.43 the weight of the slapshot
  swish(c, o, t(0.44), t(0.12), 3600, 5200, 0.03); // 0.44-0.56 the puck hisses out across the ice
  tick(c, o, t(0.86), 0.04, 3000); // 0.86 the puck is back in place
}
