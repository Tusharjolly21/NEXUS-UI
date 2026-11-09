import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A roaring burner blast at each flame flare (0.18, 0.58 and 0.98, each a little softer), a faint rope creak at each end of the sway (0.40 and 0.80) with a rustle of fabric, and a soft breath of air that swells as the balloon rises and eases as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.00-0.40 the balloon rises, a soft breath of air swells
  swish(c, o, t(0.0), t(0.45), 300, 700, 0.012);
  // 0.18 the flame flares, burner roar
  puff(c, o, t(0.18), 0.22, 1100, 0.15, "bandpass");
  swish(c, o, t(0.18), t(0.22), 500, 1400, 0.06);
  // 0.40 the basket reaches the end of its sway, rope creaks, fabric rustles
  blip(c, o, 230, t(0.4), 0.025, 0.14, 170, "triangle");
  puff(c, o, t(0.4), 0.1, 5200, 0.025, "highpass");
  // 0.58 the flame flares again
  puff(c, o, t(0.58), 0.2, 1000, 0.13, "bandpass");
  swish(c, o, t(0.58), t(0.2), 450, 1300, 0.05);
  // 0.80 the sway turns the other way, rope creaks
  blip(c, o, 200, t(0.8), 0.022, 0.14, 150, "triangle");
  puff(c, o, t(0.8), 0.1, 4800, 0.022, "highpass");
  // 0.98 the last flare
  puff(c, o, t(0.98), 0.17, 950, 0.1, "bandpass");
  // 0.80-1.20 the balloon eases back down, the air breath fades
  swish(c, o, t(0.8), t(0.4), 700, 300, 0.01);
}
