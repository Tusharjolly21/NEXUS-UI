import { CONDITIONS, WEATHER, type Condition } from "../weather";

/** The sky gradient behind the canvas. All five are stacked and cross-fade over a second when `condition` changes. */
export function SkyBackdrop({ condition }: { condition: Condition }) {
  return (
    <>
      {CONDITIONS.map((c) => (
        <div
          key={c}
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: c === condition ? 1 : 0,
            background: `linear-gradient(180deg, ${WEATHER[c].sky[0]} 0%, ${WEATHER[c].sky[1]} 55%, ${WEATHER[c].sky[2]} 100%)`,
          }}
        />
      ))}
    </>
  );
}
