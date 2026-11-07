"use client";

/**
 * Last Light: a landing page for an invented open-country western game, where every picture is drawn live in
 * characters. The hero is a full-screen scene that spills out from the sun when the page loads and carries a warm
 * lantern under the pointer; two more scenes are drawn in as you scroll to them. The gang scene has a hotspot on
 * every rider: point at one, or pick a name below, and the lantern moves to them and a card names them.
 *
 * Everything is sample content in last-light/data.ts. The scenes are WebGL 2 (with a plain 2D fallback) and need
 * only React: no animation library, no remote images, no web-font service. Pictures are in /public/templates/last-light
 * and the fonts are self-hosted from /public/fonts/last-light. With reduced motion the scenes are drawn once and
 * stay still.
 */

import * as React from "react";
import { COPY, RIDERS, SCENES } from "./last-light/data";
import { LAST_LIGHT_CSS } from "./last-light/styles";
import { useAsciiScene } from "./last-light/use-ascii-scene";
import type { SceneMapping } from "./last-light/scene";

/** In-page links scroll smoothly (or at once with reduced motion); anything else is a normal link. */
function Link({ href, className, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href?.startsWith("#")) return;
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  return (
    <a href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}

const Play = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
    <path d="M0 0l10 6-10 6z" fill="currentColor" />
  </svg>
);

function Hero() {
  const [count, setCount] = React.useState(COPY.countFallback);
  const { hostRef, canvasRef } = useAsciiScene<HTMLDivElement>(SCENES.top, { onCount: setCount });
  const h = COPY.hero;
  return (
    <div ref={hostRef} className="ll-hero" id="ll-top">
      <canvas ref={canvasRef} aria-hidden="true" />

      <header className="ll-bar">
        <Link className="ll-brand" href="#ll-top" aria-label={`${COPY.brand}, home`}>
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <defs>
              <clipPath id="ll-sun">
                <circle cx="11" cy="11" r="10" />
              </clipPath>
            </defs>
            <g clipPath="url(#ll-sun)" fill="currentColor">
              <rect x="0" y="1" width="22" height="7" />
              <rect x="0" y="10" width="22" height="3.2" />
              <rect x="0" y="15" width="22" height="1.8" />
              <rect x="0" y="18.6" width="22" height="1" />
            </g>
          </svg>
          {COPY.brand}
        </Link>
        <nav className="ll-links" aria-label="Main">
          {COPY.nav.map((n) => (
            <Link key={n.href} href={`#ll-${n.href}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link className="ll-cta-sm" href={`#ll-${COPY.navCta.href}`}>
          {COPY.navCta.label}
        </Link>
      </header>

      <section className="ll-stage" aria-labelledby="ll-title">
        <h1 id="ll-title" className="ll-rise ll-d1">
          {h.titleStart}
          <span className="ll-soft">{h.titleSoft}</span>
          {h.titleEnd}
        </h1>
        <p className="ll-lede ll-rise ll-d2">{h.lede}</p>
        <div className="ll-actions ll-rise ll-d3">
          <Link className="ll-btn ll-btn-main" href={h.primaryHref}>
            {h.primary}{" "}
            <span className="ll-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
          <Link className="ll-btn ll-btn-ghost" href={h.secondaryHref}>
            <Play />
            {h.secondary}
          </Link>
        </div>
      </section>

      <div className="ll-foot ll-rise ll-d4">
        <span className="ll-live">
          <span className="ll-dot" aria-hidden="true" />
          <span>{count}</span>
        </span>
        <span className="ll-credit">{h.place}</span>
      </div>
    </div>
  );
}

function Story() {
  const s = COPY.story;
  return (
    <section className="ll-story" id="ll-story" aria-labelledby="ll-story-title">
      <div className="ll-wrap">
        <div className="ll-say">
          <h2 id="ll-story-title">{s.title}</h2>
        </div>
        <div className="ll-say">
          {s.paragraphs.map((p) => (
            <p key={p} className="ll-body">
              {p}
            </p>
          ))}
          <dl className="ll-facts">
            {s.facts.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function World() {
  const [count, setCount] = React.useState(COPY.countFallback);
  const { hostRef, canvasRef } = useAsciiScene<HTMLDivElement>(SCENES.deacon, { onCount: setCount });
  const w = COPY.world;
  return (
    <section className="ll-world" id="ll-world" aria-labelledby="ll-world-title">
      <div className="ll-wrap ll-head">
        <h2 id="ll-world-title">{w.title}</h2>
        <p className="ll-body">{w.body}</p>
      </div>
      <div ref={hostRef} className="ll-band ll-band-deacon">
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
      <div className="ll-wrap ll-cap">
        <span className="ll-small">{w.caption}</span>
        <span className="ll-small">{count}</span>
      </div>
    </section>
  );
}

function Gang() {
  const [count, setCount] = React.useState(COPY.countFallback);
  const [M, setM] = React.useState<SceneMapping | null>(null);
  const [current, setCurrent] = React.useState(-1);
  // the card keeps the last rider's words while it fades out
  const [shown, setShown] = React.useState(0);
  const { hostRef, canvasRef, api } = useAsciiScene<HTMLDivElement>(SCENES.posse, {
    onCount: setCount,
    onResize: () => setM(api.current?.mapping() ?? null),
  });
  const g = COPY.gang;

  // the lantern follows the rider that is pointed at, picked or focused, and goes out when none is
  React.useEffect(() => {
    const scene = api.current;
    if (!scene) return;
    if (current < 0) scene.light(null);
    else scene.light(RIDERS[current].u, RIDERS[current].v - 0.06);
  }, [current, M, api]);

  const show = (i: number) => () => {
    setCurrent(i);
    if (i >= 0) setShown(i);
  };
  const rider = RIDERS[shown];
  const tagX = M ? Math.min(M.w - 130, Math.max(130, M.x0 + rider.u * M.dw)) : 0;
  const tagY = M ? Math.max(112, M.y0 + rider.head * M.dh) : 0;

  return (
    <section className="ll-gang" id="ll-gang" aria-labelledby="ll-gang-title">
      <div className="ll-wrap ll-head">
        <h2 id="ll-gang-title">{g.title}</h2>
        <p className="ll-body">{g.body}</p>
      </div>
      <div ref={hostRef} className="ll-band ll-band-gang">
        <canvas ref={canvasRef} aria-hidden="true" />
        {M &&
          RIDERS.map((r, i) => {
            const x = M.x0 + r.u * M.dw;
            const y = M.y0 + r.v * M.dh;
            return (
              <button
                key={r.name}
                type="button"
                className={`ll-who${current === i ? " ll-on" : ""}`}
                style={{ left: x, top: y }}
                hidden={x < 24 || x > M.w - 24}
                aria-label={`${r.name}: ${r.role}`}
                onPointerEnter={show(i)}
                onFocus={show(i)}
                onClick={show(i)}
                onPointerLeave={show(-1)}
                onBlur={show(-1)}
              />
            );
          })}
        <div className={`ll-tag${current >= 0 ? " ll-on" : ""}`} aria-hidden="true" style={{ left: tagX, top: tagY }}>
          <b>{rider.name}</b>
          <span>{rider.role}</span>
        </div>
      </div>
      <div className="ll-wrap">
        <ul className="ll-roster">
          {RIDERS.map((r, i) => (
            <li key={r.name}>
              <button
                type="button"
                className={current === i ? "ll-on" : undefined}
                onPointerEnter={show(i)}
                onFocus={show(i)}
                onClick={show(i)}
                onPointerLeave={show(-1)}
                onBlur={show(-1)}
              >
                <b>{r.name}</b>
                <span>{r.role.split(".")[0] + "."}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="ll-cap">
          <span className="ll-small">{g.caption}</span>
          <span className="ll-small">{count}</span>
        </div>
      </div>
    </section>
  );
}

function Ways() {
  return (
    <section className="ll-ways" aria-labelledby="ll-ways-title">
      <div className="ll-wrap">
        <h2 id="ll-ways-title">{COPY.ways.title}</h2>
        <ul>
          {COPY.ways.items.map(([title, body]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p className="ll-body">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LastCall() {
  const l = COPY.last;
  return (
    <section className="ll-last" id="ll-wishlist" aria-labelledby="ll-last-title">
      <div className="ll-wrap">
        <h2 id="ll-last-title">{l.title}</h2>
        <p className="ll-body">{l.body}</p>
        <div className="ll-actions">
          <Link className="ll-btn ll-btn-main" href={l.primaryHref}>
            {l.primary}{" "}
            <span className="ll-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
          <Link className="ll-btn ll-btn-ghost" href={l.secondaryHref} id="ll-trailer">
            <Play />
            {l.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LastLightPage() {
  return (
    <div className="ll">
      <style>{LAST_LIGHT_CSS}</style>
      <Hero />
      <main>
        <Story />
        <World />
        <Gang />
        <Ways />
        <LastCall />
      </main>
      <footer className="ll-site-foot">
        <div className="ll-wrap">
          <span className="ll-small">{COPY.footer.note}</span>
          <nav aria-label="Footer">
            {COPY.footer.links.map((l) => (
              <Link key={l.href} href={`#ll-${l.href}`}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default LastLightPage;
