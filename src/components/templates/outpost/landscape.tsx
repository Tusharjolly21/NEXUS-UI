"use client";

type Scene = "dusk" | "day";

const SKY_STOPS: Record<Scene, string[]> = {
  dusk: ["#0C0E1F", "#1E1C3A", "#4A2D52", "#A24E5E", "#EE9A62"],
  day: ["#A9CBEA", "#C6DCEE", "#E3E9EC", "#F2E6D3", "#F6DDBA"],
};

const SCENE_TONES: Record<
  Scene,
  { mesa: string; far: string; near: string; rim: string; haze: string; shade: string; sa: number }
> = {
  dusk: {
    mesa: "#4A2F4A",
    far: "#9A5562",
    near: "#140D16",
    rim: "255,184,130",
    haze: "238,150,108",
    shade: "#06030A",
    sa: 0.5,
  },
  day: {
    mesa: "#D2BFC0",
    far: "#EED9BC",
    near: "#B87A45",
    rim: "255,251,242",
    haze: "250,240,228",
    shade: "#6E3414",
    sa: 0.3,
  },
};

const mixHex = (from: string, to: string, amount: number) => {
  const toRgb = (hex: string) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
  const a = toRgb(from);
  const b = toRgb(to);
  return `rgb(${a.map((channel, i) => Math.round(channel + (b[i] - channel) * amount)).join(",")})`;
};

const RIDGES = Array.from(
  {
    length: 6,
  },
  (_, index) => {
    const base = 566 + index * 44 + index * index * 3;
    const amplitude = 12 + index * 16;
    const frequency = 0.0058 - index * 62e-5;
    const phase = index * 1.7 + 0.4;
    const points = [];
    for (let x = -20; x <= 1620; x += 16) {
      const wave = 1 - Math.abs(Math.sin(x * frequency + phase));
      const ripple = 1 - Math.abs(Math.sin(x * frequency * 2.3 + phase * 3));
      points.push([x, base - amplitude * (Math.pow(wave, 1.6) * 0.8 + Math.pow(ripple, 2) * 0.28)]);
    }
    let top = `M${points[0][0]} ${points[0][1].toFixed(1)}`;
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i][0] + points[i + 1][0]) / 2;
      const midY = (points[i][1] + points[i + 1][1]) / 2;
      top += ` Q${points[i][0]} ${points[i][1].toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    }
    const shades = [];
    let peak = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const [, prevY] = points[i - 1];
      const [x, y] = points[i];
      const [, nextY] = points[i + 1];
      if (y >= prevY && y >= nextY) {
        peak = i;
      }
      if (y < prevY && y <= nextY && i - peak > 1) {
        const [peakX, peakY] = points[peak];
        const drop = (peakY - y) * 1.5 + 30;
        let shade = `M${peakX} ${peakY.toFixed(1)}`;
        for (let j = peak + 1; j <= i; j++) {
          shade += ` L${points[j][0]} ${points[j][1].toFixed(1)}`;
        }
        shade += ` Q${(x + drop * 0.05).toFixed(1)} ${(y + drop * 0.5).toFixed(1)} ${(x + drop * 0.42).toFixed(1)} ${(y + drop).toFixed(1)} L${(peakX + (x - peakX) * 0.3).toFixed(1)} ${(peakY + drop * 0.6).toFixed(1)} Z`;
        shades.push(shade);
      }
    }
    return {
      top,
      fill: `${top} L1620 900 L-20 900 Z`,
      base,
      t: index / 5,
      shade: shades.join(" "),
    };
  },
);

const STARS = Array.from(
  {
    length: 46,
  },
  (_, i) => ({
    x: (i * 977) % 1600,
    y: (i * 613) % 330,
    r: i % 7 === 0 ? 1.6 : 0.9,
    o: 0.25 + ((i * 37) % 60) / 100,
  }),
);

type LandscapeProps = {
  scene?: Scene;
  sun?: [number, number];
  className?: string;
  grain?: boolean;
  /** prefix for the SVG gradient and filter ids, unique per instance */
  id: string;
};

/** Layered desert ridges under a dusk or daytime sky, drawn in one SVG. */
export function Landscape({
  scene = "dusk",
  sun = [1110, scene === "dusk" ? 548 : 210],
  className = "",
  grain = true,
  id,
}: LandscapeProps) {
  const tones = SCENE_TONES[scene];
  const stops = SKY_STOPS[scene];
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 size-full ${className}`}
      aria-hidden={true}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          {stops.map((color, i) => (
            <stop key={i} offset={[0, 0.3, 0.48, 0.58, 0.66][i]} stopColor={color} />
          ))}
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor={scene === "dusk" ? "#FFD49A" : "#FFFFFF"} stopOpacity=".95" />
          <stop offset=".25" stopColor={scene === "dusk" ? "#FFB070" : "#FFF7E6"} stopOpacity=".5" />
          <stop offset="1" stopColor={scene === "dusk" ? "#FF8A5B" : "#FFFFFF"} stopOpacity="0" />
        </radialGradient>
        {RIDGES.map((ridge, i) => (
          <linearGradient key={i} id={`${id}-r${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={mixHex(tones.far, tones.near, Math.pow(ridge.t, 0.9))} />
            <stop offset=".35" stopColor={mixHex(tones.far, tones.near, Math.min(1, Math.pow(ridge.t, 0.9) + 0.22))} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}-sh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tones.shade} stopOpacity={tones.sa} />
          <stop offset="1" stopColor={tones.shade} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`rgb(${tones.haze})`} stopOpacity="0" />
          <stop offset=".55" stopColor={`rgb(${tones.haze})`} stopOpacity={scene === "dusk" ? 0.32 : 0.55} />
          <stop offset="1" stopColor={`rgb(${tones.haze})`} stopOpacity="0" />
        </linearGradient>
        {grain && (
          <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .08 0" />
          </filter>
        )}
      </defs>
      <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
      {scene === "dusk" &&
        STARS.map((star, i) => (
          <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="#fff" opacity={star.o * 0.7} />
        ))}
      <circle cx={sun[0]} cy={sun[1]} r={scene === "dusk" ? 300 : 360} fill={`url(#${id}-sun)`} />
      <circle
        cx={sun[0]}
        cy={sun[1]}
        r={scene === "dusk" ? 30 : 24}
        fill={scene === "dusk" ? "#FFE2B8" : "#FFFFFF"}
        opacity={0.95}
      />
      <path
        d="M-20 566 L-20 536 L70 536 L84 514 L206 512 L222 534 L410 538 L426 522 L512 520 L528 540 L900 543 L916 526 L1004 525 L1020 545 L1240 548 L1260 530 L1376 528 L1392 550 L1620 552 L1620 600 L-20 600 Z"
        fill={tones.mesa}
        opacity={scene === "dusk" ? 0.85 : 0.5}
      />
      <rect y="505" width="1600" height="110" fill={`url(#${id}-haze)`} />
      {RIDGES.map((ridge, i) => (
        <g key={i}>
          <path d={ridge.fill} fill={`url(#${id}-r${i})`} />
          <path d={ridge.shade} fill={`url(#${id}-sh)`} opacity={0.55 + ridge.t * 0.45} />
          <path
            d={ridge.top}
            fill="none"
            stroke={`rgba(${tones.rim},${(scene === "dusk" ? 0.32 : 0.5) * (1 - ridge.t * 0.7)})`}
            strokeWidth="1"
          />
          {i < 5 && (
            <rect
              y={ridge.base - 6}
              width="1600"
              height={46 + i * 8}
              fill={`url(#${id}-haze)`}
              opacity={0.75 - i * 0.12}
            />
          )}
        </g>
      ))}
      {grain && <rect width="1600" height="900" filter={`url(#${id}-grain)`} />}
    </svg>
  );
}
