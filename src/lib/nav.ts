export type NavItem = { href: string; label: string };

export const NAV: readonly NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about/', label: 'About' },
  { href: '/career/', label: 'Career' },
  { href: '/projects/', label: 'Projects' },
  { href: '/troubleshooting/', label: 'Troubleshooting' },
  { href: '/contact/', label: 'Contact' },
];

export function isCurrent(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname === href.slice(0, -1) || pathname.startsWith(href);
}
