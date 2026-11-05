import { SHIPPED } from "./data";
import { Icon } from "./icons";

/** Release notes in one card: a purple branch glyph, title, date, a line of detail and a link. */
export function ShippedList() {
  return (
    <div className="margin-pill rounded-[14px] px-5 py-1">
      {SHIPPED.map((item) => (
        <div
          key={item.title}
          className="group flex items-start justify-between gap-4 border-b py-4 last:border-b-0"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <Icon name="ph:git-branch" size={15} className="mt-[3px] shrink-0" style={{ color: "#a855f7" }} />
            <div className="min-w-0">
              <span className="mr-2.5 text-[15px] font-medium leading-[1.4]" style={{ color: "var(--fg)" }}>
                {item.title}
              </span>
              <span className="whitespace-nowrap text-[12px] tabular-nums" style={{ color: "var(--faint)" }}>
                {item.date}
              </span>
              <p className="m-0 mt-1.5 text-[13px] leading-5" style={{ color: "var(--dim)" }}>
                {item.text}
              </p>
            </div>
          </div>
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            aria-label={`Read about ${item.title}`}
            className="margin-ring grid h-7 w-7 shrink-0 place-items-center rounded-[8px] outline-none transition-colors group-hover:bg-[var(--chip2)]"
            style={{ boxShadow: "inset 0 0 0 1px var(--line)", color: "var(--fg2)" }}
          >
            <Icon name="ph:arrow-up-right" size={13} />
          </a>
        </div>
      ))}
    </div>
  );
}
