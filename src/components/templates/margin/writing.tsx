import { WRITING } from "./data";
import { Icon } from "./icons";

/** Essay list. Each row reveals its reading time on hover and nudges its arrow. */
export function WritingList() {
  return (
    <ul className="m-0 p-0">
      {WRITING.map((post) => (
        <li
          key={post.title}
          className="group flex list-none items-center justify-between gap-4 border-b py-5 last:border-b-0"
          style={{ borderColor: "var(--line)" }}
        >
          <span className="text-[15px] font-medium leading-6 transition-colors" style={{ color: "var(--fg2)" }}>
            {post.title}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span
              className="hidden text-[13px] tabular-nums opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:inline sm:translate-x-2"
              style={{ color: "var(--faint)" }}
            >
              {post.minutes} min read
            </span>
            <a
              href="#"
              onClick={(event) => event.preventDefault()}
              className="margin-ring margin-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium no-underline outline-none transition-transform active:scale-95"
            >
              Open
              <Icon
                name="ph:arrow-up-right"
                size={12}
                className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
              />
            </a>
          </span>
        </li>
      ))}
    </ul>
  );
}
