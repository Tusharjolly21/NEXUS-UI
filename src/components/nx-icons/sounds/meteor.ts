import { ding, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A rising scream as the meteor bolts away, a crackle of fire, silence, then a lower whoosh as it swoops back in and a muffled thump as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.42), 600, 5200, 0.05);
  puff(c, o, t(0.08), 0.3, 3800, 0.04, "highpass");
  puff(c, o, t(0.22), 0.14, 6200, 0.03, "highpass");
  swish(c, o, t(0.46), t(0.5), 3400, 700, 0.04);
  [0.7, 0.82, 0.94].forEach((at, i) => puff(c, o, t(at), 0.06, 5200 - i * 700, 0.03, "highpass"));
  thud(c, o, t(1.02), 95, 0.22, 0.16);
  ding(c, o, N.A6, t(1.06), 0.03, 0.4);
  ding(c, o, N.E6, t(1.18), 0.025, 0.4);
}
