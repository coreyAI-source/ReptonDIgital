export const navItems = [
  { href: "/websites", label: "Websites" },
  { href: "/ai-automation", label: "AI automation" },
  { href: "/software", label: "Software" },
  { href: "/work", label: "Work" },
  { href: "/contact", label: "Contact" },
] as const;

export type NavItem = (typeof navItems)[number];
