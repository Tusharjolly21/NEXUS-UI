import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.27;

/** Four dry wooden ticks climbing in pitch as the marks are drawn, then a springy twang that wobbles away as the ruler shivers. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3].forEach((i) => {
    tick(c, o, t(0.1 + i * 0.14), 0.1, 3200 + i * 700);
    blip(c, o, 420 + i * 80, t(0.1 + i * 0.14), 0.04, 0.06, undefined, "square");
  });
  ding(c, o, N.G4, t(0.5), 0.07, 0.5);
  ding(c, o, N.D5, t(0.66), 0.03, 0.4);
  blip(c, o, 220, t(0.52), 0.04, 0.3, 235, "triangle");
}
