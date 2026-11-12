"use client";

/**
 * The log behind Helix's approval queue: what the agents finished on their own, scrolling up steadily. Most rows
 * end in "done". Now and then one stops, in red, with "needs a person": those are the requests that land in the
 * queue in front of it. Pure CSS scroll, so it costs nothing while it runs; it stands still for reduced motion.
 */

const ROWS: [string, string, string, boolean?][] = [
  ["Support", "answered #9934 from the help center", "done"],
  ["Payables", "matched INV-2201 to PO-5507", "done"],
  ["Refunds", "refunded $42.00 to order #48190", "done"],
  ["Access", "removed an expired grant for j.amari", "done"],
  ["Renewals", "drafted a reminder for Northwind Dental", "done"],
  ["Refunds", "refund $1,240.00 is over the $500 limit", "needs a person", true],
  ["Support", "tagged 12 tickets as checkout", "done"],
  ["Payables", "matched INV-2203 to PO-5509", "done"],
  ["Support", "closed #9921 after the customer replied", "done"],
  ["Access", "granted read-only Figma to the new hire", "done"],
  ["Renewals", "scheduled 40 reminders for Monday", "done"],
  ["Payables", "bank details for Kestrel Freight changed", "needs a person", true],
  ["Refunds", "refunded $18.50 to order #48202", "done"],
  ["Support", "merged 3 duplicate tickets into #9940", "done"],
  ["Payables", "paid INV-2198 to Halden Paper, $640.00", "done"],
  ["Access", "production database for Theo, 4 hours", "needs a person", true],
  ["Support", "answered #9947 from the status page", "done"],
  ["Renewals", "updated 6 contacts from bounced mail", "done"],
  ["Refunds", "refunded $96.00 to order #48211", "done"],
  ["Payables", "matched INV-2207 to PO-5512", "done"],
  ["Renewals", "10% discount is above the 5% default", "needs a person", true],
  ["Support", "translated #9950 from Portuguese", "done"],
  ["Access", "rotated the shared Stripe key", "done"],
  ["Support", "46 tickets mention the same error", "needs a person", true],
];

function Row({ r, i, mono, ink, stop }: { r: (typeof ROWS)[number]; i: number; mono: string; ink: string; stop: string }) {
  const [who, what, state, flag] = r;
  const mm = String(41 + Math.floor(i / 6)).padStart(2, "0");
  const ss = String((i * 7) % 60).padStart(2, "0");
  return (
    <div className="flex h-[30px] items-center gap-4 whitespace-nowrap text-[12px]" style={{ fontFamily: mono, color: flag ? stop : ink }}>
      <span className="w-[62px] flex-none tabular-nums opacity-60">09:{mm}:{ss}</span>
      <span className="w-[72px] flex-none font-medium">{who}</span>
      <span className="min-w-0 flex-1 truncate">{what}</span>
      <span className="flex-none font-medium" style={flag ? { background: `${stop}18`, padding: "2px 8px", borderRadius: 999 } : { opacity: 0.6 }}>{state}</span>
    </div>
  );
}

export default function WorkWall({ mono, ink, stop, className = "" }: { mono: string; ink: string; stop: string; className?: string }) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true" style={{ maskImage: "linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)", WebkitMaskImage: "linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)" }}>
      <style>{`@keyframes hx-wall{from{transform:translateY(0)}to{transform:translateY(-50%)}}.hx-wall{animation:hx-wall 48s linear infinite}@media (prefers-reduced-motion:reduce){.hx-wall{animation:none}}`}</style>
      <div className="hx-wall">
        {[0, 1].map((copy) => (
          <div key={copy}>
            {ROWS.map((r, i) => <Row key={`${copy}-${i}`} r={r} i={i} mono={mono} ink={ink} stop={stop} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
