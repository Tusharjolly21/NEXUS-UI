import { ding, plink, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A buzzing electric zap as the bolt pulses twice, a rising whine as the cable runs out, a click of the plug seating, and four hopping plinks as the level bar fills and a spark of a bell. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 180, t(0.02), 0.06, 0.12, 520, "square");
  blip(c, o, 210, t(0.2), 0.06, 0.12, 640, "square");
  swish(c, o, t(0.1), t(0.35), 800, 4200, 0.03);
  blip(c, o, 500, t(0.3), 0.04, 0.35, 1500, "triangle");
  tick(c, o, t(0.48), 0.16, 3200);
  thud(c, o, t(0.49), 160, 0.1, 0.05);
  [N.G5, N.C5, N.D6, N.A5].forEach((f, i) => plink(c, o, f, t(0.55 + i * 0.1), 0.07, 0.2));
  ding(c, o, N.G7, t(0.92), 0.04, 0.4);
}
