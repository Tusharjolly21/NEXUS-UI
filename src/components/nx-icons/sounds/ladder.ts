import { ding, blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.97;

/** Five dry wooden knocks climbing in pitch, one on each rung as it lights from the bottom to the top, with a hollow clack from the last one. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3, 4].forEach((i) => {
    const at = 0.07 + i * 0.13; // 0.07 0.20 0.33 0.46 0.59 a rung lights, bottom to top
    const f = 520 + i * 130;
    blip(c, o, f, t(at), 0.1, 0.06, f * 0.62);
    tick(c, o, t(at), 0.07, 2200 + i * 350);
    thud(c, o, t(at), 230 + i * 20, 0.08, 0.05);
  });
  ding(c, o, 2100, t(0.59), 0.025, 0.3); // 0.59 the top rung lights, the whole ladder rings hollow
}
