import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.27;

/** A watery slosh as the glass tips, a bubbly plop at its fastest tilt, a bright long glass clink at the end of the tip, a tiny glint as the sparkle flashes and a small slosh as it rocks back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.42), t(0.22), 1200, 3000, 0.04); // 0.42-0.64 the glass tips and the drink sloshes
  blip(c, o, 360, t(0.51), 0.06, 0.1, 720); // 0.52 the drink bubbles at the fastest tilt
  ding(c, o, 2480, t(0.58), 0.09, 0.6); // 0.58 the glass reaches the end of its tip, a clink
  ding(c, o, 3150, t(0.58), 0.05, 0.4);
  ding(c, o, 5200, t(0.65), 0.03, 0.25); // 0.65 the sparkle flashes at its biggest
  blip(c, o, 380, t(0.79), 0.04, 0.1, 240); // 0.8 the glass rocks back, a small slosh
}
