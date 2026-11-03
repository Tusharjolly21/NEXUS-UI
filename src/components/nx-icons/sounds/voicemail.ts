import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.7;

/** A heavy click and a low motor hum as the tape engages, a whirring sweep with a ratchet of dry ticks as the reels turn, a wobbly fall as the tape flutters, and a long answering-machine beep. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.02), 140, 0.14, 0.08);
  blip(c, o, N.E4, t(0.05), 0.05, 0.4, N.G4, "triangle");
  tick(c, o, t(0.04), 0.1, 2600);
  swish(c, o, t(0.1), t(0.5), 300, 2200, 0.035);
  [0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6].forEach((at, i) => tick(c, o, t(at), 0.05, 3000 + i * 160));
  blip(c, o, 600, t(0.5), 0.04, 0.3, 380, "triangle");
  ding(c, o, N.B5, t(0.88), 0.07, 0.35);
}
