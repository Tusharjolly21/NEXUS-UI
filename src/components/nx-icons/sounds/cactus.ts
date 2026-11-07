import { blip, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.61;

/** A dry desert wind that pushes the cactus left, right and back, a tiny springy pop as the flower bursts open and a soft suck as it closes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.03), t(0.22), 500, 1000, 0.03); // 0.03-0.25 gust leans cactus to the left
  swish(c, o, t(0.24), t(0.24), 1000, 450, 0.03); // 0.24-0.48 gust swings it to the right
  swish(c, o, t(0.47), t(0.24), 450, 800, 0.025); // 0.47-0.71 gust swings it back
  blip(c, o, 350, t(0.08), 0.08, 0.1, 1100); // 0.08 flower pops open from nothing
  tick(c, o, t(0.12), 0.08, 5200); // 0.12 pop at its fastest growth
  blip(c, o, 900, t(0.27), 0.03, 0.06, 1400); // 0.27 flower overshoots to 1.4 size
  blip(c, o, 1000, t(0.68), 0.04, 0.12, 300); // 0.68 flower shrinks closed
  puff(c, o, t(0.75), 0.1, 3000, 0.012, "highpass"); // 0.80 petals gone, last sand grains
}
