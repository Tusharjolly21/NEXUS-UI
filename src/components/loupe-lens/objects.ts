/**
 * The printed objects the glass is dragged over. Each one is drawn once to its own canvas (at 2x or more), then
 * placed on the table. All coordinates are in the object's own pixels, with the origin at its top left corner.
 * Much of the text is set far too small to read without the lens, on purpose.
 */

/** Canvas font stack (the original page embedded Geist Variable; here it falls back to the system UI font). */
export const FONT_STACK = '"Geist Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

/** Primary ink colour of the print. */
export const INK = "#1d1d1f";

const TAU = 6.283;

export type PrintedObject = {
  id: string;
  /** Spoken description, used for documentation; the canvas itself is decorative. */
  label: string;
  w: number;
  h: number;
  /** True when the drawing depends on the time and must be redrawn every second. */
  live?: boolean;
  draw: (ctx: CanvasRenderingContext2D, now: Date) => void;
};

// ───────────────────────── drawing helpers ─────────────────────────

/** A font shorthand in the canvas font stack. */
export const font = (weight: number, size: number) => `${weight} ${size}px ${FONT_STACK}`;

export const setLetterSpacing = (ctx: CanvasRenderingContext2D, px: number) => {
  ctx.letterSpacing = `${px}px`;
};

/** A small seeded random number generator (mulberry32), so the "random" print is the same on every load. */
export function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 1831565813) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Begins a rounded rectangle path. */
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

/** Repeats `unit` along a line until it is as wide as `maxWidth`, as micro-print borders and fine print. */
function fillRepeated(ctx: CanvasRenderingContext2D, unit: string, x: number, y: number, maxWidth: number, size: number) {
  ctx.font = font(500, size);
  setLetterSpacing(ctx, 0.05);
  let line = "";
  while (ctx.measureText(line + unit).width < maxWidth) line += unit;
  ctx.fillText(line, x, y);
}

/** Sets text around a circle, upright letters facing outward, spread to fill the whole ring. */
function fillTextOnCircle(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  size: number,
  weight = 600,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.font = font(weight, size);
  setLetterSpacing(ctx, 0);
  const total = [...text].reduce((sum, ch) => sum + ctx.measureText(ch).width, 0);
  const gap = (2 * Math.PI * radius - total) / text.length;
  let angle = -Math.PI / 2;
  for (const ch of text) {
    const width = ctx.measureText(ch).width;
    angle += width / 2 / radius;
    ctx.save();
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(ch, -width / 2, -radius);
    ctx.restore();
    angle += (width / 2 + gap) / radius;
  }
  ctx.restore();
}

/** Punches a ring of round perforation holes out of whatever has been drawn, around a w by h sheet. */
function punchPerforations(ctx: CanvasRenderingContext2D, w: number, h: number, pitch: number, radius: number) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  for (let x = pitch / 2; x < w; x += pitch) {
    ctx.moveTo(x + radius, 0);
    ctx.arc(x, 0, radius, 0, TAU);
    ctx.moveTo(x + radius, h);
    ctx.arc(x, h, radius, 0, TAU);
  }
  for (let y = pitch / 2; y < h; y += pitch) {
    ctx.moveTo(radius, y);
    ctx.arc(0, y, radius, 0, TAU);
    ctx.moveTo(w + radius, y);
    ctx.arc(w, y, radius, 0, TAU);
  }
  ctx.fill();
  ctx.restore();
}

// ───────────────────────── the objects ─────────────────────────

/** The eight printed objects, in the order they are stacked on the table (later ones start on top). */
export const PRINTED_OBJECTS: PrintedObject[] = [
  {
    id: "stamp",
    label: "A blue postage stamp worth 42",
    w: 150,
    h: 186,
    draw(ctx) {
      const blue = "#0a4fae";
      ctx.fillStyle = "#fbfbf8";
      ctx.fillRect(0, 0, 150, 186);
      punchPerforations(ctx, 150, 186, 10.6, 3.9);
      ctx.fillStyle = "#e6effb";
      ctx.fillRect(13, 13, 124, 160);
      ctx.strokeStyle = blue;
      ctx.lineWidth = 1.1;
      ctx.strokeRect(13, 13, 124, 160);
      ctx.save();
      ctx.translate(150 / 2, 88);
      ctx.lineWidth = 0.32;
      ctx.strokeStyle = "rgba(10,79,174,.7)";
      for (let i = 0; i < 56; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 56);
        ctx.beginPath();
        ctx.ellipse(0, 0, 47, 17, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = "#e6effb";
      ctx.beginPath();
      ctx.arc(0, 0, 21, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = blue;
      ctx.stroke();
      ctx.fillStyle = blue;
      ctx.font = font(700, 24);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setLetterSpacing(ctx, -1);
      ctx.fillText("42", 0, 1);
      ctx.restore();
      ctx.fillStyle = blue;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.font = font(650, 11);
      setLetterSpacing(ctx, 2.2);
      ctx.fillText("LOUPE POST", 150 / 2, 38);
      ctx.font = font(600, 9.5);
      setLetterSpacing(ctx, 1.6);
      ctx.fillText("SEEN CLOSE  2026", 150 / 2, 162);
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(10,79,174,.85)";
      fillRepeated(ctx, "LOOK CLOSER ", 17, 18.6, 116, 2.3);
      fillRepeated(ctx, "LOOK CLOSER ", 17, 171, 116, 2.3);
      ctx.save();
      ctx.translate(16.2, 169);
      ctx.rotate(-Math.PI / 2);
      fillRepeated(ctx, "LOOK CLOSER ", 0, 0, 152, 2.3);
      ctx.restore();
      ctx.save();
      ctx.translate(150 - 16.2, 17);
      ctx.rotate(Math.PI / 2);
      fillRepeated(ctx, "LOOK CLOSER ", 0, 0, 152, 2.3);
      ctx.restore();
    },
  },
  {
    id: "ticket",
    label: "An admit-one ticket, row 4 seat 12",
    w: 300,
    h: 122,
    draw(ctx) {
      const red = "#b6412b";
      roundRectPath(ctx, 0, 0, 300, 122, 6);
      ctx.fillStyle = "#f4ede0";
      ctx.fill();
      // the notches punched out of the edges
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(0, 122 / 2, 10, 0, TAU);
      ctx.arc(300, 122 / 2, 10, 0, TAU);
      ctx.arc(228, 0, 6, 0, TAU);
      ctx.arc(228, 122, 6, 0, TAU);
      ctx.fill();
      ctx.restore();
      // the guilloche band along the top
      ctx.save();
      roundRectPath(ctx, 12, 10, 206, 26, 3);
      ctx.clip();
      ctx.strokeStyle = "rgba(182,65,43,.5)";
      ctx.lineWidth = 0.35;
      for (let o = 0; o < 22; o++) {
        ctx.beginPath();
        for (let x = 12; x <= 218; x += 1.5) {
          const y = 23 + Math.sin(x / 9 + o * 0.29) * 9 * Math.sin(x / 47 + o * 0.05);
          if (x === 12) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      // the tear-off line
      ctx.strokeStyle = "rgba(29,29,31,.35)";
      ctx.setLineDash([2.5, 2.5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(228, 9);
      ctx.lineTo(228, 113);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = INK;
      ctx.font = font(750, 30);
      setLetterSpacing(ctx, -0.6);
      ctx.fillText("ADMIT ONE", 14, 70);
      ctx.font = font(500, 10.5);
      setLetterSpacing(ctx, 0.2);
      ctx.fillStyle = "#3a3a3c";
      ctx.fillText("Row 4    Seat 12    Door B    20:30", 15, 88);
      ctx.fillStyle = red;
      fillRepeated(
        ctx,
        "If you can read this line, the glass is working exactly as intended. Nothing else on the ticket is printed this small. ",
        15,
        104,
        204,
        2.6,
      );
      ctx.save();
      ctx.translate(252, 122 / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = INK;
      ctx.font = font(650, 11);
      setLetterSpacing(ctx, 1.2);
      ctx.textAlign = "center";
      ctx.fillText("Nº 004812", 0, 4);
      ctx.restore();
      // the barcode
      const random = mulberry32(7);
      ctx.fillStyle = INK;
      for (let x = 268; x < 290; ) {
        const barWidth = 0.6 + random() * 1.8;
        ctx.fillRect(x, 18, barWidth, 86);
        x += barWidth + 0.8 + random() * 1.6;
      }
    },
  },
  {
    id: "dial",
    label: "A watch dial showing the current time",
    w: 176,
    h: 176,
    live: true,
    draw(ctx, now) {
      const caseGradient = ctx.createLinearGradient(0, 0, 176, 176);
      caseGradient.addColorStop(0, "#f2f2f4");
      caseGradient.addColorStop(1, "#a1a1a6");
      ctx.fillStyle = caseGradient;
      ctx.beginPath();
      ctx.arc(88, 88, 86, 0, TAU);
      ctx.fill();
      const faceGradient = ctx.createRadialGradient(68, 62, 10, 88, 88, 86);
      faceGradient.addColorStop(0, "#ffffff");
      faceGradient.addColorStop(1, "#ececee");
      ctx.fillStyle = faceGradient;
      ctx.beginPath();
      ctx.arc(88, 88, 80, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * TAU;
        const length = i % 5 ? 4 : 9;
        ctx.lineWidth = i % 5 ? 0.7 : 1.7;
        ctx.beginPath();
        ctx.moveTo(88 + Math.sin(angle) * 74, 88 - Math.cos(angle) * 74);
        ctx.lineTo(88 + Math.sin(angle) * (74 - length), 88 - Math.cos(angle) * (74 - length));
        ctx.stroke();
      }
      ctx.fillStyle = INK;
      ctx.font = font(600, 15);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setLetterSpacing(ctx, -0.3);
      (
        [
          ["12", 0],
          ["3", 1],
          ["6", 2],
          ["9", 3],
        ] as const
      ).forEach(([numeral, quarter]) => {
        const angle = (quarter / 4) * TAU;
        ctx.fillText(numeral, 88 + Math.sin(angle) * 56, 88 - Math.cos(angle) * 56 + 0.5);
      });
      ctx.font = font(650, 8.5);
      setLetterSpacing(ctx, 2);
      ctx.fillText("LOUPE", 88, 58);
      ctx.fillStyle = "#6e6e73";
      ctx.font = font(500, 2.5);
      setLetterSpacing(ctx, 0.1);
      ctx.fillText("READ SLOWLY  WORN LIGHTLY  NO HURRY INSIDE", 88, 118);
      ctx.fillText("CALIBRE 0.01  HAND SET", 88, 122);
      const seconds = now.getSeconds() + now.getMilliseconds() / 1e3;
      const minutes = now.getMinutes() + seconds / 60;
      const hours = (now.getHours() % 12) + minutes / 60;
      const hand = (angle: number, length: number, width: number, color: string, tail = 10) => {
        ctx.save();
        ctx.translate(88, 88);
        ctx.rotate(angle);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, tail);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.restore();
      };
      ctx.shadowColor = "rgba(0,0,0,.25)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = 1;
      hand((hours / 12) * TAU, 40, 3.4, INK);
      hand((minutes / 60) * TAU, 62, 2.3, INK);
      hand((Math.floor(seconds) / 60) * TAU, 68, 0.9, "#ff3b30", 16);
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#ff3b30";
      ctx.beginPath();
      ctx.arc(88, 88, 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(88, 88, 1, 0, TAU);
      ctx.fill();
    },
  },
  {
    id: "map",
    label: "A map of the Amsterdam canal ring",
    w: 236,
    h: 170,
    draw(ctx) {
      roundRectPath(ctx, 0, 0, 236, 170, 10);
      ctx.fillStyle = "#f3f1ea";
      ctx.fill();
      ctx.save();
      roundRectPath(ctx, 0, 0, 236, 170, 10);
      ctx.clip();
      ctx.fillStyle = "#d8e8d0";
      ctx.beginPath();
      ctx.ellipse(30, 150, 60, 34, -0.3, 0, TAU);
      ctx.fill();
      // the canals: concentric arcs around a point below the map
      const cx = 150;
      const cy = 210;
      (
        [
          ["Singel", 70],
          ["Herengracht", 94],
          ["Keizersgracht", 118],
          ["Prinsengracht", 142],
        ] as const
      ).forEach(([name, radius]) => {
        ctx.strokeStyle = "#bcd7ee";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-1.15);
        ctx.fillStyle = "#4a6f8f";
        ctx.font = font(500, 3);
        setLetterSpacing(ctx, 0.2);
        ctx.textAlign = "center";
        ctx.fillText(name, 0, -radius + 1);
        ctx.restore();
      });
      // the streets that cross them
      const random = mulberry32(3);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.2;
      for (let s = 0; s < 16; s++) {
        const angle = Math.PI * (1.08 + s * 0.054) + random() * 0.02;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 60);
        ctx.lineTo(cx + Math.cos(angle) * 152, cy + Math.sin(angle) * 152);
        ctx.stroke();
      }
      ctx.strokeStyle = "#e0ddd3";
      ctx.lineWidth = 0.5;
      for (let s = 0; s < 16; s++) {
        const angle = Math.PI * (1.08 + s * 0.054);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 60);
        ctx.lineTo(cx + Math.cos(angle) * 152, cy + Math.sin(angle) * 152);
        ctx.stroke();
      }
      ctx.fillStyle = "#8a8a8e";
      ctx.font = font(500, 2.6);
      setLetterSpacing(ctx, 0.1);
      ["Leidsestraat", "Spiegelgracht", "Vijzelstraat", "Reguliersdwarsstraat", "Huidenstraat", "Wolvenstraat"].forEach((name, index) => {
        const angle = Math.PI * (1.2 + index * 0.12);
        ctx.save();
        ctx.translate(cx + Math.cos(angle) * 104, cy + Math.sin(angle) * 104);
        ctx.rotate(angle + Math.PI / 2 + (angle > Math.PI * 1.5 ? 0 : Math.PI));
        ctx.textAlign = "center";
        ctx.fillText(name, 0, 1);
        ctx.restore();
      });
      ctx.restore();
      // the pin
      ctx.save();
      ctx.translate(122, 74);
      ctx.fillStyle = "#ff3b30";
      ctx.shadowColor = "rgba(0,0,0,.25)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.bezierCurveTo(-9, 1, -8, -10, 0, -10);
      ctx.bezierCurveTo(8, -10, 9, 1, 0, 12);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, -3, 3, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#6e6e73";
      ctx.font = font(500, 2.7);
      ctx.textAlign = "center";
      ctx.fillText("You are here. Probably reading this.", 122, 94);
      ctx.fillStyle = INK;
      ctx.textAlign = "left";
      ctx.font = font(600, 10);
      setLetterSpacing(ctx, 0);
      ctx.fillText("52.3676 N  4.9041 E", 12, 158);
    },
  },
  {
    id: "specimen",
    label: "A type specimen card for Geist",
    w: 188,
    h: 232,
    draw(ctx) {
      roundRectPath(ctx, 0, 0, 188, 232, 14);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.font = font(600, 100);
      setLetterSpacing(ctx, -5);
      ctx.fillText("Aa", 14, 104);
      ctx.font = font(600, 10.5);
      setLetterSpacing(ctx, 0);
      ctx.fillText("Geist", 16, 128);
      ctx.fillStyle = "#6e6e73";
      ctx.font = font(450, 10);
      ctx.fillText("Weights 100 to 900", 16, 142);
      ctx.fillStyle = "#3a3a3c";
      ctx.font = font(500, 3.1);
      setLetterSpacing(ctx, 0.15);
      [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "abcdefghijklmnopqrstuvwxyz",
        "0123456789  & ? ! @ # % ( ) [ ] { }",
        "The quick brown fox jumps over the lazy dog.",
        "Sphinx of black quartz, judge my vow.",
        "Pack my box with five dozen liquor jugs.",
      ].forEach((line, index) => ctx.fillText(line, 16, 160 + index * 6.2));
      ctx.fillStyle = "rgba(0,0,0,.1)";
      ctx.fillRect(16, 202, 156, 0.6);
      ctx.fillStyle = INK;
      ctx.font = font(600, 9);
      setLetterSpacing(ctx, 1.4);
      ctx.fillText("SPECIMEN 01", 16, 216);
      ctx.textAlign = "right";
      ctx.fillStyle = "#6e6e73";
      ctx.font = font(500, 2.6);
      setLetterSpacing(ctx, 0.1);
      ctx.fillText("set at 3.1 px, for your eyes only", 172, 216);
    },
  },
  {
    id: "film",
    label: "A strip of four film frames",
    w: 328,
    h: 96,
    draw(ctx) {
      ctx.fillStyle = "#2b2219";
      roundRectPath(ctx, 0, 0, 328, 96, 3);
      ctx.fill();
      // sprocket holes
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (let x = 6; x < 322; x += 12) {
        roundRectPath(ctx, x, 5, 6, 8, 1.4);
        ctx.fill();
        roundRectPath(ctx, x, 83, 6, 8, 1.4);
        ctx.fill();
      }
      ctx.restore();
      // the four frames: sky top, sky bottom, hills
      (
        [
          ["#f7b267", "#f4845f", "#3d2b56"],
          ["#a1c4fd", "#c2e9fb", "#3b6e4a"],
          ["#2a3a6b", "#6b5ea8", "#151a2e"],
          ["#ffd9a0", "#ff9a8b", "#5a3d5c"],
        ] as const
      ).forEach(([skyTop, skyBottom, hills], index) => {
        const x = 10 + index * 79;
        const y = 19;
        const w = 72;
        const h = 58;
        ctx.save();
        roundRectPath(ctx, x, y, w, h, 2);
        ctx.clip();
        const sky = ctx.createLinearGradient(0, y, 0, y + h);
        sky.addColorStop(0, skyTop);
        sky.addColorStop(1, skyBottom);
        ctx.fillStyle = sky;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = index === 2 ? "#f5f5f7" : "rgba(255,255,240,.9)";
        ctx.beginPath();
        ctx.arc(x + 20 + index * 9, y + 22 - index * 2, index === 2 ? 4 : 7, 0, TAU);
        ctx.fill();
        ctx.fillStyle = hills;
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        for (let step = 0; step <= 8; step++) {
          ctx.lineTo(x + (step / 8) * w, y + h * (0.62 + Math.sin(step * 1.3 + index) * 0.08));
        }
        ctx.lineTo(x + w, y + h);
        ctx.fill();
        ctx.restore();
      });
      ctx.fillStyle = "#f0a83c";
      ctx.font = font(600, 3.4);
      setLetterSpacing(ctx, 0.4);
      ["14", "14A", "15", "15A"].forEach((frame, index) => ctx.fillText(frame, 12 + index * 79, 17.2));
      ctx.fillText("SAFETY FILM 400      KEEP IN A COOL DRY PLACE      DEVELOP BEFORE DATE", 46, 84.2);
    },
  },
  {
    id: "facts",
    label: "A Closer Look Facts label",
    w: 160,
    h: 212,
    draw(ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 160, 212);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, 150, 202);
      ctx.fillStyle = INK;
      ctx.font = font(800, 16.5);
      setLetterSpacing(ctx, -0.5);
      ctx.fillText("Closer Look", 11, 25);
      ctx.fillText("Facts", 11, 42);
      ctx.fillRect(11, 48, 138, 0.7);
      ctx.font = font(500, 8.5);
      setLetterSpacing(ctx, 0);
      ctx.fillText("Serving size", 11, 60);
      ctx.textAlign = "right";
      ctx.fillText("1 slow glance", 149, 60);
      ctx.textAlign = "left";
      ctx.fillRect(11, 65, 138, 6);
      (
        [
          ["Detail", "100%", true],
          ["Patience", "80%", false],
          ["Curiosity", "120%", true],
          ["Hurry", "0%", false],
          ["Scrolling past", "0%", false],
        ] as const
      ).forEach(([name, value, bold], index) => {
        const y = 84 + index * 15;
        ctx.font = font(bold ? 750 : 500, 9.5);
        ctx.fillText(name, 11, y);
        ctx.textAlign = "right";
        ctx.font = font(750, 9.5);
        ctx.fillText(value, 149, y);
        ctx.textAlign = "left";
        ctx.fillRect(11, y + 4.5, 138, 0.5);
      });
      ctx.fillRect(11, 158, 138, 3);
      ctx.fillStyle = "#3a3a3c";
      ctx.font = font(500, 2.7);
      setLetterSpacing(ctx, 0.05);
      [
        "* Percent daily values are based on a 2,000 second",
        "attention span. Your values may be higher if you",
        "have read this far. Contains traces of whitespace.",
        "Best enjoyed under glass. Do not skim.",
      ].forEach((line, index) => ctx.fillText(line, 11, 170 + index * 4.4));
    },
  },
  {
    id: "badge",
    label: "A round black badge that says seen up close",
    w: 122,
    h: 122,
    draw(ctx) {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(61, 61, 60, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(61, 61, 40, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "#f5f5f7";
      fillTextOnCircle(ctx, "SEEN UP CLOSE  •  SEEN UP CLOSE  •  ", 61, 61, 47, 9, 650);
      ctx.fillStyle = "rgba(245,245,247,.75)";
      fillTextOnCircle(ctx, "YOU FOUND THE SMALLEST LINE ON THE WHOLE PAGE  ", 61, 61, 36, 2.3, 500);
      // the eye
      ctx.strokeStyle = "#f5f5f7";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(41, 61);
      ctx.quadraticCurveTo(61, 44, 81, 61);
      ctx.quadraticCurveTo(61, 78, 41, 61);
      ctx.stroke();
      ctx.fillStyle = "#0a84ff";
      ctx.beginPath();
      ctx.arc(61, 61, 8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(61, 61, 3.6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(61 - 2.6, 61 - 2.8, 1.4, 0, TAU);
      ctx.fill();
    },
  },
];

// ───────────────────────── layouts ─────────────────────────

/** Where each object sits relative to the middle of the table: [dx, dy, rotation in degrees]. */
export type Layout = Record<string, [number, number, number]>;

/** Wide table (760px and up): one long spread. */
export const WIDE_LAYOUT: Layout = {
  specimen: [-440, 10, -7],
  stamp: [-262, -46, 6],
  ticket: [-104, 108, -4],
  dial: [34, -38, 0],
  badge: [150, 52, -12],
  film: [250, 128, 5],
  map: [318, -44, 8],
  facts: [478, 36, -6],
};

/** Narrow table (phones): the same objects stacked in a tall spread. */
export const TALL_LAYOUT: Layout = {
  stamp: [-104, -210, -7],
  dial: [86, -196, 4],
  ticket: [-4, -66, 4],
  badge: [-150, 34, -10],
  specimen: [-62, 108, -5],
  map: [108, 58, 7],
  facts: [116, 236, -4],
  film: [-38, 270, 6],
};

/** The size of the area each layout was composed in; the layout is scaled down to fit. */
export const WIDE_EXTENT = { w: 1160, h: 380 };
export const TALL_EXTENT = { w: 440, h: 700 };
