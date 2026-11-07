import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.42;

/** A servo whirr that rises and falls with each pan, a gear tick where the camera reverses, and three short square beeps as the red record light blinks back on. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.02, 0.25, 1], [0.25, 0.6, -1], [0.6, 0.85, 1], [0.85, 1.0, -1]].forEach(([s, e, dir]) => {
    const n = Math.round((e - s) / 0.035);
    for (let k = 0; k < n; k++) {
      const p = (k + 0.5) / n;
      const f = dir > 0 ? 360 + 300 * p : 700 - 300 * p;
      blip(c, o, f, t(s + k * 0.035), 0.012 + 0.03 * Math.sin(Math.PI * p), 0.05, f, "sawtooth"); // the servo whirrs while the camera pans, pitch rising one way and falling the other
    }
    swish(c, o, t(s), t(e - s), dir > 0 ? 2500 : 3800, dir > 0 ? 3800 : 2500, 0.022);
  });
  [0.25, 0.6, 0.85].forEach((at) => tick(c, o, t(at), 0.07, 3000)); // 0.25 0.6 0.85 the pan reverses, the gears tick
  [0.33, 0.67, 1.0].forEach((at) => blip(c, o, 2600, t(at), 0.04, 0.07, 2600, "square")); // 0.33 0.67 1.0 the red light blinks back on, a beep each time
  tick(c, o, t(0.99), 0.05, 3000); // 1.0 the camera comes to rest
}
