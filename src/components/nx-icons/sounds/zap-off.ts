import { plink, blip, swish, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.06;

/** A buzzing crackle of sparks, a harsh falling zap as the glow drains, and a low click when the power is cut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.02, 0.05, 0.08, 0.13, 0.17].forEach((at, i) => puff(c, o, t(at), 0.03, 5200 + i * 500, 0.07, "highpass"));
  blip(c, o, N.C7, t(0.04), 0.05, 0.3, 160, "sawtooth");
  blip(c, o, N.A4, t(0.16), 0.05, 0.22, 90, "sawtooth");
  swish(c, o, t(0.1), t(0.3), 4800, 300, 0.04);
  thud(c, o, t(0.44), 70, 0.22, 0.14);
  tick(c, o, t(0.42), 0.1, 1500);
  plink(c, o, N.G4, t(0.56), 0.04, 0.2);
}
