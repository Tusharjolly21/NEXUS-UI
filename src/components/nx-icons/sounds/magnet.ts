import { ding, blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.16;

/** A low electric hum as it shakes, and two metallic clinks as the filings snap to the poles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 110, t(0.02), 0.05, 0.4, 130, "sawtooth");
  [0.14, 0.24].forEach((at, i) => { tick(c, o, t(at), 0.14, 3200); ding(c, o, i ? N.E7 : N.C7, t(at), 0.07, 0.3); });
  thud(c, o, t(0.26), 130, 0.08, 0.06);
}
