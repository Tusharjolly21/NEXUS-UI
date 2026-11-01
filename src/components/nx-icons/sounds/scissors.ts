import { blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.76;

/** Two crisp metallic snips, on every close of the blades. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.3, 0.6].forEach((at, i) => {
    tick(c, o, t(at), 0.18, 4200);
    blip(c, o, N.E7 - i * 150, t(at), 0.05, 0.06);
    puff(c, o, t(at), 0.05, 7000, 0.035, "highpass");
  });
  swish(c, o, t(0.02), t(0.22), 900, 2800, 0.025);
}
