import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.37;

/** Liquid sloshing as a soft low wash that rises and falls with each tilt of the tube, and three bubbles that pop in the order they rose, each pop higher than the last. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0-0.9 the tube rocks and the liquid sloshes to each side
  swish(c, o, t(0.0), t(0.22), 300, 650, 0.05);
  swish(c, o, t(0.22), t(0.23), 650, 280, 0.05);
  swish(c, o, t(0.45), t(0.22), 280, 600, 0.045);
  swish(c, o, t(0.67), t(0.2), 600, 250, 0.035);
  // 0.22 and 0.46 the wave slaps up the glass at each end
  puff(c, o, t(0.22), 0.1, 800, 0.04, "lowpass");
  puff(c, o, t(0.46), 0.1, 700, 0.04, "lowpass");
  // 0-0.36, 0.2-0.56, 0.4-0.76 bubbles wobble up through the liquid
  blip(c, o, 420, t(0.0), 0.02, 0.3, 700);
  blip(c, o, 480, t(0.2), 0.02, 0.3, 800);
  blip(c, o, 560, t(0.4), 0.02, 0.3, 950);
  // 0.36 / 0.56 / 0.76 bubble 1, 2, 3 reaches the surface and pops
  blip(c, o, 700, t(0.36), 0.09, 0.05, 1500);
  blip(c, o, 900, t(0.56), 0.085, 0.05, 1900);
  blip(c, o, 1200, t(0.76), 0.08, 0.05, 2500);
}
