export const INSTALLATION_NAV = [
  { href: "/docs/installation", label: "Nexus-UI setup", external: false as const },
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
  {
    href: "https://ui.shadcn.com/docs/installation/next",
    label: "Add shadcn/ui",
    external: true as const,
  },
  {
    href: "https://motion.dev/docs/react-installation",
    label: "Framer Motion",
    external: true as const,
  },
] as const;

export type InstallationNavItem = (typeof INSTALLATION_NAV)[number];
