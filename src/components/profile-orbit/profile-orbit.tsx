"use client";

import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProfilePerson = {
  seed: number;
  name: string;
  role: string;
  email: string;
};

export interface ProfileOrbitProps {
  people?: ProfilePerson[];
  /** Auto-rotation interval in ms. */
  autoRotateInterval?: number;
  className?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEFAULT_PEOPLE: ProfilePerson[] = [
  { seed: 10, name: "Jordan Lee",   role: "Head of Product",  email: "jordan@example.com"  },
  { seed: 20, name: "Alex Chen",    role: "Lead Designer",    email: "alex@example.com"    },
  { seed: 30, name: "Maya Patel",   role: "Engineering Lead", email: "maya@example.com"    },
  { seed: 40, name: "Sam Rivera",   role: "Marketing Dir.",   email: "sam@example.com"     },
  { seed: 50, name: "Chris Morgan", role: "Head of Sales",    email: "chris@example.com"   },
];

// 5 orbital slots. Upper-left and upper-right are pulled closer to the card
// than a pure pentagon would place them.
const ORBIT: { top: string; left: string }[] = [
  { top: "17%", left: "50%" },  // top center
  { top: "40%", left: "71%" },  // upper right  (pulled in)
  { top: "77%", left: "68%" },  // lower right
  { top: "77%", left: "32%" },  // lower left
  { top: "40%", left: "29%" },  // upper left   (pulled in)
];

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ArrowButton({
  onClick,
  direction,
  ariaLabel,
}: {
  onClick: () => void;
  direction: "left" | "right";
  ariaLabel: string;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: hovered ? "#e0e0e0" : "#f0f0f0",
        border: "none",
        cursor: "pointer",
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "#111",
        transition: "background 0.2s ease",
        userSelect: "none",
      }}
    >
      {direction === "left" ? "←" : "→"}
    </button>
  );
}

function ConnectButton() {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        margin: "0 10px",
        background: hovered ? "#333" : "#111",
        color: "white",
        borderRadius: 100,
        padding: "10px 0",
        fontSize: 14,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s ease",
      }}
    >
      Connect
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileOrbit({
  people = DEFAULT_PEOPLE,
  autoRotateInterval = 3000,
  className,
}: ProfileOrbitProps) {
  const [activeIndex, setActiveIndex]   = React.useState(0);
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const cardInnerRef = React.useRef<HTMLDivElement>(null);
  const timerRef     = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef    = React.useRef(false);
  const count = people.length;

  // ── Card fade: fade out → swap content → fade in ──────────────────────────
  React.useEffect(() => {
    const el = cardInnerRef.current;
    if (!el) return;
    el.style.opacity   = "0";
    el.style.transform = "translateY(6px)";
    const t = setTimeout(() => {
      setDisplayIndex(activeIndex);
      el.style.opacity   = "1";
      el.style.transform = "translateY(0)";
    }, 200);
    return () => clearTimeout(t);
  }, [activeIndex]);

  // ── Auto-rotation ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setActiveIndex((i) => (i + 1) % count);
      }
    }, autoRotateInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRotateInterval, count]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setActiveIndex((i) => (i - 1 + count) % count);
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  const pause  = () => { pausedRef.current = true;  };
  const resume = () => { pausedRef.current = false; };
  const prev   = () => setActiveIndex((i) => (i - 1 + count) % count);
  const next   = () => setActiveIndex((i) => (i + 1) % count);

  const person = people[displayIndex];

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#0a0e1a",
        backgroundImage: [
          "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(100,40,180,0.5) 0%, transparent 70%)",
          "radial-gradient(ellipse 50% 60% at 20% 60%, rgba(20,80,160,0.4) 0%, transparent 70%)",
        ].join(", "),
      }}
    >
      {/* Dot-grid texture overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      {/* ── Orbit avatars ──────────────────────────────────────────────────── */}
      {people.map((p, i) => {
        const isActive  = i === activeIndex;
        // Each avatar slides to a new slot every time activeIndex changes —
        // the active person always lands on slot 0 (top center).
        const slotIndex = (i - activeIndex + count) % count;
        const slot      = ORBIT[slotIndex];

        return (
          <button
            key={p.seed}
            aria-label={`View ${p.name}`}
            onClick={() => setActiveIndex(i)}
            onMouseEnter={pause}
            onMouseLeave={resume}
            style={{
              position: "absolute",
              top:  slot.top,
              left: slot.left,
              transform: "translate(-50%, -50%)",
              width:  isActive ? 72 : 64,
              height: isActive ? 72 : 64,
              borderRadius: "50%",
              border: `3px solid ${isActive ? "white" : "rgba(255,255,255,0.3)"}`,
              boxShadow: isActive ? "0 0 0 4px rgba(255,255,255,0.15)" : "none",
              padding: 0,
              background: "none",
              cursor: "pointer",
              overflow: "hidden",
              zIndex: isActive ? 3 : 2,
              // top + left drive the physical movement; spring easing creates the bounce
              transition: [
                `top        0.55s ${SPRING}`,
                `left       0.55s ${SPRING}`,
                `width      0.4s ease`,
                `height     0.4s ease`,
                `box-shadow 0.4s ease`,
                `border     0.4s ease`,
              ].join(", "),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://picsum.photos/seed/${p.seed}/300/300`}
              alt={p.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block",
                pointerEvents: "none",
              }}
            />
          </button>
        );
      })}

      {/* ── Card + dots (stacked, centered as one unit) ─────────────────────
        paddingTop: 48 reserves the space that the peeking avatar
        overflows upward, so the whole visual block is truly centered.
      ─────────────────────────────────────────────────────────────────────── */}
      <div
        onMouseEnter={pause}
        onMouseLeave={resume}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 48,
          zIndex: 4,
        }}
      >
        {/* Card */}
        <div
          style={{
            width: 280,
            background: "white",
            borderRadius: 20,
            padding: "0 24px 24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Fading inner — opacity & translateY swap on index change */}
          <div
            ref={cardInnerRef}
            style={{ transition: "opacity 0.25s ease, transform 0.25s ease" }}
          >
            {/* Profile photo — peeks 48px above card top */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://picsum.photos/seed/${person.seed}/300/300`}
                alt={person.name}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  marginTop: -48,
                  display: "block",
                }}
              />
            </div>

            {/* Name */}
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111",
                marginTop: 12,
                textAlign: "center",
                lineHeight: 1.3,
                margin: "12px 0 0",
              }}
            >
              {person.name}
            </p>

            {/* Role */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                marginTop: 6,
                fontSize: 13,
                color: "#666",
              }}
            >
              <span aria-hidden>💼</span>
              <span>{person.role}</span>
            </div>

            {/* Email */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                marginTop: 4,
                fontSize: 13,
                color: "#666",
              }}
            >
              <span aria-hidden>✉️</span>
              <span>{person.email}</span>
            </div>

            {/* Nav row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 16,
              }}
            >
              <ArrowButton onClick={prev} direction="left"  ariaLabel="Previous profile" />
              <ConnectButton />
              <ArrowButton onClick={next} direction="right" ariaLabel="Next profile" />
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {people.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                aria-label={`Go to profile ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                style={{
                  width:        isActive ? 24 : 8,
                  height:       8,
                  borderRadius: isActive ? 4 : "50%",
                  background:   isActive ? "white" : "rgba(255,255,255,0.3)",
                  border:       "none",
                  cursor:       "pointer",
                  padding:      0,
                  transition:   "all 0.3s ease",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProfileOrbit;
