"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useMusic } from "@/context/music-context";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { PlayerBar } from "@/components/player-bar";
import { QueuePanel } from "@/components/queue-panel";
import { NowPlayingOverlay } from "@/components/now-playing";
import { SleepButton } from "@/components/sleep-button";

/**
 * The music app is open to everyone, so the chrome is mounted whether or not
 * anyone is signed in. Only /admin is its own screen, because it is the one
 * place that has to behave like a private tool.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { loading } = useMusic();
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  return (
    <>
      {/* min-h-dvh rather than min-h-screen: on mobile vh measures the viewport
          with the URL bar showing, so scrolling down leaves a gap. */}
      <div className="flex min-h-dvh flex-col pb-24">
        <div className="flex flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 pb-8 pl-0 md:pl-60">
            {/* pt-14 clears the fixed mobile nav, which is hidden from md up. */}
            <div className="mx-auto w-full max-w-[1600px] px-4 pt-14 sm:px-6 md:pt-6">
              <MobileNav />
              {children}
            </div>
          </main>
        </div>
        <PlayerBar />
      </div>
      <NowPlayingOverlay />
      <QueuePanel />
      <SleepButton />
    </>
  );
}
