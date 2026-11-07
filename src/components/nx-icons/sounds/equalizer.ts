import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.28;

/** Five fader knobs on a synth: each slides with a gliding square-wave pitch that follows the knob up or down, a click where it turns around and a click where it lands home, staggered by 50 milliseconds like the picture. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  const base = [196, 247, 294, 349, 415];
  const pos = [[0, -8, -3, 0], [0, 6, 2, 0], [0, -4, 4, 0], [0, 8, 4, 0], [0, -6, -2, 0]];
  pos.forEach((p, i) => {
    const d = 0.05 * i;
    const pitch = (y: number) => base[i] * Math.pow(2, -y / 9);
    for (let k = 0; k < 3; k++) {
      // each third of the slide: the pitch glides with the knob
      blip(c, o, pitch(p[k]), t(d + 0.02 + k * 0.317), 0.032, 0.26, pitch(p[k + 1]), "square");
    }
    tick(c, o, t(d + 0.317), 0.08, 3000 + i * 350); // 0.32-0.52 the knob turns around
    tick(c, o, t(d + 0.633), 0.08, 2600 + i * 350); // 0.63-0.83 the knob turns around again
    tick(c, o, t(d + 0.95), 0.1, 2000 + i * 300); // 0.95-1.15 the knob lands home
  });
}
