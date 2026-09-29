"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, LibraryIcon, MusicIcon, SearchIcon } from "@/components/icons";

export function MobileNav() {
  const pathname = usePathname();

  return (
    // fixed, not sticky: sticky positions itself against its containing block,
    // so it shifted as the page height changed on scroll. fixed pins it to the
    // viewport. The -mx-4 and mb-6 are gone because it is no longer in flow;
    // the pt-14 on the content wrapper in app-shell reserves the space instead.
    <nav className="fixed inset-x-0 top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-line bg-base/95 px-4 py-2 backdrop-blur md:hidden">
      <Link
        href="/"
        aria-label="Home"
        className={`rounded-full p-2.5 ${pathname === "/" ? "text-text" : "text-muted"}`}
      >
        <HomeIcon className="h-5 w-5" />
      </Link>

      <Link
        href="/search"
        aria-label="Search"
        className={`rounded-full p-2.5 ${pathname === "/search" ? "text-text" : "text-muted"}`}
      >
        <SearchIcon className="h-5 w-5" />
      </Link>

      <Link
        href="/library"
        aria-label="Your library"
        className={`rounded-full p-2.5 ${
          // Left in place on purpose: the paused /playlist route still exists and
          // links back here, so the Library tab stays lit on that page.
          pathname === "/library" || pathname.startsWith("/playlist") ? "text-text" : "text-muted"
        }`}
      >
        <LibraryIcon className="h-5 w-5" />
      </Link>

      <span className="ml-auto flex items-center gap-2 pl-2 text-sm font-bold">
        <MusicIcon className="h-4 w-4 text-accent" />
        Harmony
      </span>
    </nav>
  );
}
