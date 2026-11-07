import { ding, blip, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low creaking hinge that slides up as the lid opens, a cascade of coin tinkles rising in pitch, and a dull wooden thud when it closes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 150, t(0.04), 0.07, 0.4, 290, "sawtooth");
  puff(c, o, t(0.06), 0.3, 900, 0.03, "bandpass");
  [N.G6, N.C7, N.E7, N.G7, N.D7, N.C8].forEach((f, i) => ding(c, o, f, t(0.34 + i * 0.07), 0.05, 0.3));
  tick(c, o, t(0.5), 0.07, 7000);
  thud(c, o, t(0.98), 140, 0.28, 0.16);
  blip(c, o, 120, t(0.82), 0.05, 0.25, 90, "sawtooth");
}
