import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Something mystical: a breathy rising whoosh as the star is drawn in, a bright glassy chime as it blooms, a fine shimmer sweeping across the glass and a tiny high twinkle at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.28), 700, 2600, 0.03); // 0.00-0.28 the star shrinks, pulled in
  ding(c, o, 1760, t(0.6), 0.06, 0.7); // 0.60 the star blooms at its biggest
  swish(c, o, t(0.5), t(0.5), 4200, 6500, 0.014); // 0.50-1.00 the glint sweeps over the glass
  ding(c, o, 3520, t(0.98), 0.02, 0.3); // 0.98 the glint finishes with a twinkle
}
