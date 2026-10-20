import { SiFramer, SiNextdotjs, SiReact, SiShadcnui, SiTailwindcss, SiTypescript } from "react-icons/si";

const STACK = [
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "React", Icon: SiReact },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Tailwind CSS", Icon: SiTailwindcss },
  { name: "Motion", Icon: SiFramer },
  { name: "shadcn CLI", Icon: SiShadcnui },
];

/** What the components are written with, so visitors know they'll drop into their stack. */
export function StackStrip() {
  return (
    <div className="flex flex-col items-center gap-5 pt-10 text-center md:flex-row md:justify-between md:text-left">
      <p className="text-[14px] text-muted-foreground">Written for the stack you already use</p>
      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        {STACK.map(({ name, Icon }) => (
          <li key={name} className="flex items-center gap-2 text-[15px] font-medium text-foreground/80">
            <Icon className="size-[18px]" aria-hidden />
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
