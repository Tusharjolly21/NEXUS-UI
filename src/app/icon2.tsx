import { ImageResponse } from "next/og";

// Larger PNG icon for Google Search and PWA
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon2() {
  const accent = "#7a96ff";
  const paper = "#F4F1EC";
  const ink = "#0E0E10";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: ink,
          borderRadius: 42,
        }}
      >
        <svg
          width="136"
          height="136"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="32" cy="6" r="3.5" fill={paper} />
          <circle cx="6" cy="50" r="3.5" fill={paper} />
          <circle cx="58" cy="50" r="3.5" fill={paper} />
          <path
            d="M32 9 L32 32 M9 49 L32 32 M55 49 L32 32"
            stroke={paper}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="32" cy="32" r="5.5" fill={accent} />
          <circle
            cx="32"
            cy="32"
            r="5.5"
            fill="none"
            stroke={paper}
            strokeWidth="1.4"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
