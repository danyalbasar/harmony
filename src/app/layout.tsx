import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MusicProvider } from "@/context/music-context";
import { PlayerProvider } from "@/context/player-context";
import { ToastProvider } from "@/context/toast-context";
import { SleepProvider } from "@/context/sleep-context";
import { AppShell } from "@/components/app-shell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Harmony",
  // Playlists are paused, so the tagline no longer promises them.
  description: "Stream your songs.",
};

export const viewport: Viewport = {
  themeColor: "#08070d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-base font-sans text-text antialiased">
        <MusicProvider>
          <PlayerProvider>
            <ToastProvider>
              <SleepProvider>
                <AppShell>{children}</AppShell>
              </SleepProvider>
            </ToastProvider>
          </PlayerProvider>
        </MusicProvider>
      </body>
    </html>
  );
}
