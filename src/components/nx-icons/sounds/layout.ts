import { plink, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.89;

/** A short downward swoosh and a soft knock as the header drops in, a rising slide and second knock for the sidebar, then two bubbly notes as the content bars draw. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.25), 1800, 500, 0.035);
  thud(c, o, t(0.3), 180, 0.1, 0.07);
  swish(c, o, t(0.16), t(0.3), 400, 1500, 0.03);
  thud(c, o, t(0.52), 150, 0.1, 0.08);
  plink(c, o, N.C5, t(0.55), 0.06, 0.12);
  plink(c, o, N.D6, t(0.67), 0.06, 0.14);
  plink(c, o, N.A5, t(0.78), 0.04, 0.14);
}
