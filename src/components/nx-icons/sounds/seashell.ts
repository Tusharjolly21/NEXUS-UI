import { ding, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.16;

/** The hush of the sea you hear in a shell, a gritty scrape of sand at each end of its rocking and a high glassy glint. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(1.0), 400, 700, 0.03); // 0.00-1.00 the sound of the sea in the shell
  puff(c, o, t(0.22), 0.07, 5000, 0.03); // 0.22 sand scrapes as it rocks left
  puff(c, o, t(0.48), 0.06, 4600, 0.025); // 0.48 and right
  ding(c, o, 3700, t(0.68), 0.05, 0.3); // 0.70 the glint twinkles on the rim
  puff(c, o, t(0.74), 0.05, 4200, 0.018); // 0.74 a last small scrape
}
