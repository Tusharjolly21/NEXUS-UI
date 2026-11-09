import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.08;

/** A power-drop slide as the floodlights go dark, a charge-up hiss and buzzy zap with a relay clunk as each lamp ignites in turn and the pitch glows back, then two flicker clicks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 700, t(0.0), 0.05, 0.28, 150, "square"); // 0.00 to 0.30 the lamps fade out
  swish(c, o, t(0.2), t(0.12), 300, 2400, 0.03); // 0.20 to 0.32 the left lamp charges
  blip(c, o, 1400, t(0.3), 0.05, 0.14, 700, "square"); // 0.30 the left lamp ignites with a zap
  thud(c, o, t(0.3), 95, 0.16, 0.12); // 0.30 the lamp relay clunks
  swish(c, o, t(0.4), t(0.12), 400, 2900, 0.03); // 0.40 to 0.52 the right lamp charges
  blip(c, o, 1700, t(0.5), 0.05, 0.14, 850, "square"); // 0.50 the right lamp ignites and the pitch is lit
  thud(c, o, t(0.5), 110, 0.14, 0.12); // 0.50 its relay clunks
  tick(c, o, t(0.73), 0.1, 3300); // 0.73 both lamps flicker down
  tick(c, o, t(0.79), 0.08, 4000); // 0.79 and snap back on
}
