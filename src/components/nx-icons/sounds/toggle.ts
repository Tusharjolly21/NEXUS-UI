import { blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.77;

/** A crisp switch click, a slide, and a bright blip as it lands on. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.16, 2600);
  thud(c, o, t(0.03), 220, 0.08, 0.05);
  blip(c, o, 520, t(0.06), 0.04, 0.1, 880);
  tick(c, o, t(0.28), 0.12, 3400);
  blip(c, o, N.E6, t(0.3), 0.07, 0.1);
}
