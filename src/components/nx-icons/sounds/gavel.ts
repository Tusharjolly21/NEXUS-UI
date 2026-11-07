import { ding, blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.41;

/** A wood-handle swish as the gavel is raised, a short fast swing, a sharp crack and deep wooden knock on the block, and a brief ring of the block. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.04-0.32 the gavel is lifted
  swish(c, o, t(0.04), t(0.28), 300, 900, 0.04);
  // 0.40-0.47 it swings down fast
  swish(c, o, t(0.4), t(0.07), 700, 2600, 0.06);
  // 0.48 the gavel hits the block
  thud(c, o, t(0.48), 180, 0.38, 0.12);
  tick(c, o, t(0.48), 0.2, 3500);
  blip(c, o, 900, t(0.48), 0.12, 0.03, 300, "square");
  puff(c, o, t(0.48), 0.04, 2400, 0.2, "bandpass");
  ding(c, o, 1250, t(0.485), 0.05, 0.2);
  ding(c, o, 1900, t(0.485), 0.025, 0.12);
}
