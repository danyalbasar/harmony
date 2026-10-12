"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, LibraryIcon, MusicIcon, SearchIcon } from "@/components/icons";

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", Icon: HomeIcon, active: pathname === "/" },
    { href: "/search", label: "Search", Icon: SearchIcon, active: pathname === "/search" },
    { href: "/library", label: "Library", Icon: LibraryIcon, active: pathname === "/library" || pathname.startsWith("/playlist") },
  ];

  return (
    <nav aria-label="Main navigation" className="safe-inline fixed inset-x-0 top-0 z-30 flex h-[var(--mobile-nav-height)] items-center gap-1 border-b border-line bg-base/95 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
      {items.map(({ href, label, Icon, active }) => (
        <Link key={href} href={href} aria-label={label === "Library" ? "Your library" : label} aria-current={active ? "page" : undefined}
          className={`flex min-h-12 min-w-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold transition-colors ${active ? "bg-card text-accent-soft" : "text-muted hover:text-text"}`}>
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
      <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-1 text-xs font-bold">
        <MusicIcon className="h-4 w-4 text-accent" />Harmony
      </span>
    </nav>
  );
}
