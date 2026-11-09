import { ding, blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft crumble of soil as the mound heaves, a rising creak while the stem pushes up, then two airy sweeps with a dewdrop glint each as the leaves unfurl. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.12, 380, 0.06, "lowpass"); // 0.02 mound heaves (squash peaks at 0.14)
  blip(c, o, 240, t(0.06), 0.045, 0.4, 700, "triangle"); // 0.05-0.50 the stem creaks upward as it grows
  swish(c, o, t(0.4), t(0.34), 1500, 4300, 0.035); // 0.40-0.74 left leaf unfurls
  swish(c, o, t(0.47), t(0.33), 1900, 4700, 0.03); // 0.475-0.80 right leaf unfurls
  ding(c, o, 3100, t(0.74), 0.03, 0.3); // 0.74 left leaf reaches full size
  ding(c, o, 3700, t(0.8), 0.025, 0.3); // 0.80 right leaf reaches full size
}
