import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.95;

/** An airy lift as the layers part, then four different plops as they drop back in order: a soft bun thump, a crinkle of lettuce, a fat patty splat and a cushiony bottom bun. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.27), 350, 1100, 0.07); // 0.02-0.29 the top bun and lettuce lift, the layers part
  thud(c, o, t(0.72), 170, 0.2, 0.1); // 0.72 the top bun lands
  puff(c, o, t(0.72), 0.08, 700, 0.03, "lowpass");
  puff(c, o, t(0.79), 0.1, 3200, 0.05, "bandpass"); // 0.79 the lettuce lands, crinkling
  tick(c, o, t(0.79), 0.05, 4200);
  thud(c, o, t(0.86), 95, 0.22, 0.16); // 0.86 the patty lands with a fat plop
  blip(c, o, 300, t(0.86), 0.05, 0.1, 150);
  thud(c, o, t(0.93), 130, 0.15, 0.1); // 0.93 the bottom bun takes the weight and rebounds
  puff(c, o, t(0.93), 0.1, 500, 0.025, "lowpass");
}
