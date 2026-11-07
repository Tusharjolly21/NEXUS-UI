import { plink, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three layered swells of surf rolling in one after another, each rising to a soft crest and fading out with a hiss of foam. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.55), 300, 1200, 0.06);
  swish(c, o, t(0.18), t(0.55), 350, 1400, 0.055);
  swish(c, o, t(0.34), t(0.55), 400, 1600, 0.05);
  puff(c, o, t(0.45), 0.2, 3600, 0.025, "highpass");
  puff(c, o, t(0.6), 0.2, 3200, 0.025, "highpass");
  puff(c, o, t(0.76), 0.25, 2800, 0.025, "highpass");
  plink(c, o, N.G4, t(0.9), 0.04, 0.3);
  plink(c, o, N.C6, t(1.0), 0.03, 0.25);
}
