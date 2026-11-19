import { blip, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.27;

/** A shrill referee whistle with a fast trill from the spinning pea, held for the length of the blast. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7].forEach((at, i) => blip(c, o, i % 2 ? 2920 : 3150, t(at), 0.05 - i * 0.002, 0.07)); // 0.00-0.78 the blast, the pea trilling as it whirls
  puff(c, o, t(0.0), 0.12, 4200, 0.04); // 0.00 the breath hits the mouthpiece
}
