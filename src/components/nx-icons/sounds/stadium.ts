import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A floodlight rig: a power-drop slide as the lamps go dark, then a charge-up hiss and a buzzy zap as the left lamp ignites, the same a touch higher for the right lamp, and two quick flicker clicks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 900, t(0.0), 0.05, 0.1, 180, "square"); // 0.00 to 0.1 both lamps drop dark
  swish(c, o, t(0.16), 0.14, 300, 2400, 0.03); // 0.22 to 0.30 the left lamp charges
  blip(c, o, 1400, t(0.29), 0.05, 0.14, 700, "square"); // 0.30 the left lamp ignites with a zap
  thud(c, o, t(0.29), 95, 0.16, 0.12); // 0.30 the lamp relay clunks
  swish(c, o, t(0.41), 0.14, 400, 2900, 0.03); // 0.47 to 0.55 the right lamp charges
  blip(c, o, 1700, t(0.54), 0.05, 0.14, 850, "square"); // 0.55 the right lamp ignites
  thud(c, o, t(0.54), 110, 0.14, 0.12); // 0.55 its relay clunks
  tick(c, o, t(0.74), 0.1, 3300); // 0.76 both lamps flicker down
  tick(c, o, t(0.8), 0.08, 4000); // 0.82 and snap back on
}
