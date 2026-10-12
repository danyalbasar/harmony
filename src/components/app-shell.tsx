"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { usePlayer } from "@/context/player-context";
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
  const { loading, tracks } = useMusic();
  const { prepare, current } = usePlayer();
  const firstTrack = tracks[0];
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    if (!isAdmin && !current) prepare(firstTrack);
  }, [isAdmin, current, firstTrack, prepare]);

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
      <div className="flex min-h-dvh flex-col pb-[calc(var(--player-height)+16px)]">
        <div className="flex flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 pb-8 pl-0 lg:pl-60">
            <div className="safe-inline page-content mx-auto w-full max-w-[1600px] pt-[calc(var(--mobile-nav-height)+20px)] lg:pt-6">
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
