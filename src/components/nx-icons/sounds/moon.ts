import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 2.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.27;

/** A music-box lullaby, four notes of Twinkle Twinkle, as the moon rocks and the stars come out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.15, N.C6], [0.4, N.C6], [0.65, N.G6], [0.9, N.G6]].forEach(([at, f]) => {
    ding(c, o, f, t(at), 0.07, 0.5);
    tick(c, o, t(at), 0.03, 6000);
  });
  blip(c, o, N.A6, t(1.15), 0.04, 0.4);
}
