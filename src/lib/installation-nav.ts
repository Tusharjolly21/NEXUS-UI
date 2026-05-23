export const INSTALLATION_NAV = [
  { href: "/docs/introduction", label: "Introduction", external: false as const },
  { href: "/docs/installation", label: "Quick Start", external: false as const },
  {
    href: "/docs/install-nextjs",
    label: "Install Next.js",
    external: false as const,
  },
  {
    href: "/docs/install-tailwindcss",
    label: "Install Tailwind CSS",
    external: false as const,
  },
  {
    href: "/docs/add-utilities",
    label: "Add utilities",
    external: false as const,
  },
  {
    href: "/docs/cli",
    label: "CLI",
    external: false as const,
  },
] as const;

export type InstallationNavItem = (typeof INSTALLATION_NAV)[number];
