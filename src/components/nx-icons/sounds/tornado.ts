import { swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 4.21;

/** A low rumble that grows through the whole spin, with whooshes of rotating wind rising and falling in step with each sweep of the funnel lines, the biggest in the middle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.06), 0.9, 150, 320, 0.11); // 0.06 to 0.96 the funnel's roar grows
  swish(c, o, t(0.05), 0.28, 400, 900, 0.077); // 0.18 first lines swing out
  swish(c, o, t(0.23), 0.28, 1000, 500, 0.11); // 0.36 big swing across, fastest
  swish(c, o, t(0.39), 0.28, 600, 1400, 0.11); // 0.52 swing back
  swish(c, o, t(0.53), 0.28, 1500, 700, 0.088); // 0.66 next swing
  swish(c, o, t(0.69), 0.28, 800, 1200, 0.055); // 0.82 last small swings
}
