"use client";

import { useMusic } from "@/context/music-context";

/**
 * Shown to a signed in admin so they can leave. The music app itself is open to
 * everyone, so this renders nothing at all when there is no session.
 */
export function SignOutButton() {
  const { signOut, user } = useMusic();
  const username = user?.user_metadata?.username ?? user?.email;

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-xs text-dim sm:inline">{username}</span>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-text"
      >
        Sign out
      </button>
    </div>
  );
}
