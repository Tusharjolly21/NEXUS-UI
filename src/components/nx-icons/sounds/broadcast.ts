import { ding, blip, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low carrier throb under sonar pings that go out in two pairs, near ones first and far ones after, with a bed of radio hiss and three short morse blips. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 196, t(0.02), 0.08, 0.3, 240, "triangle");
  ding(c, o, 1120, t(0.03), 0.07, 0.4);
  ding(c, o, 1150, t(0.09), 0.05, 0.35);
  ding(c, o, 1680, t(0.31), 0.06, 0.45);
  ding(c, o, 1720, t(0.37), 0.045, 0.4);
  puff(c, o, t(0.1), 0.5, 5200, 0.012, "bandpass");
  [0.62, 0.7, 0.78].forEach((at) => blip(c, o, 2350, t(at), 0.03, 0.04));
}
