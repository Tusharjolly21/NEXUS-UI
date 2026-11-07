import { ding, blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.78;

/** Cuff rustle as the hands part, a quick rush and a firm skin clasp as they meet, soft pump knocks of the shake, and a bright glassy sparkle as the star blooms over the joined hands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.03-0.22 the hands draw apart
  puff(c, o, t(0.03), 0.18, 700, 0.025, "lowpass");
  // 0.25-0.36 they rush together
  swish(c, o, t(0.25), t(0.11), 500, 1100, 0.04);
  // 0.36 the clasp
  thud(c, o, t(0.36), 105, 0.26, 0.11);
  puff(c, o, t(0.36), 0.07, 1100, 0.08, "bandpass");
  tick(c, o, t(0.36), 0.05, 2000);
  // 0.46 the sparkle starts to bloom
  blip(c, o, 2000, t(0.46), 0.04, 0.08, 3000);
  // 0.45-0.54 the shake pumps down
  swish(c, o, t(0.45), t(0.09), 700, 400, 0.025);
  thud(c, o, t(0.54), 130, 0.13, 0.07); // 0.54 the pump reaches its lowest point
  puff(c, o, t(0.54), 0.08, 800, 0.05, "lowpass");
  // 0.61 the sparkle is at its biggest
  ding(c, o, 3136, t(0.61), 0.05, 0.35);
  // 0.765 the shake settles
  thud(c, o, t(0.765), 120, 0.07, 0.06);
}
