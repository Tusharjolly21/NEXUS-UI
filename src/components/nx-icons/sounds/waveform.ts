import { blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.79;

/** Seven bars pulse one after another from left to right: each bar's swell is a sine that sweeps up in pitch as the bars climb in tone, followed by a lower hollow drop as the bar collapses. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  const f = [233, 262, 311, 349, 415, 466, 554];
  const big = [1.7, 1.62, 1.7, 1.11, 1.7, 1.4, 1.7];
  f.forEach((hz, i) => {
    const d = 0.07 * i;
    // d + 0.10 the bar swells upward
    blip(c, o, hz, t(d + 0.1), 0.05 + 0.03 * big[i], 0.2, hz * 1.4);
    blip(c, o, hz * 2, t(d + 0.1), 0.015, 0.1, hz * 2.8);
    // d + 0.29 the bar collapses to its shortest
    blip(c, o, hz * 1.5, t(d + 0.29), 0.05, 0.2, hz * 0.6, "triangle");
  });
}
