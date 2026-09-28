"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMusic } from "@/context/music-context";
import { useToast } from "@/context/toast-context";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { normalizeUsername, usernameToEmail } from "@/lib/auth-identity";
import { formatTime } from "@/lib/tracks";
import { UploadForm } from "./upload-form";
import { KeyIcon, LockIcon, MusicIcon, TrashIcon } from "@/components/icons";

type Stage = "login" | "ready";

export default function AdminPage() {
  return <Admin />;
}

function Admin() {
  const { user, tracks, libraryLoading, refreshLibrary, removeTrack, signOut } = useMusic();
  const toast = useToast();

  // "login" is the lock, "ready" is the actual admin screen. The Supabase
  // account is the only thing guarding this page.
  const [stage, setStage] = useState<Stage>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // An existing session skips the sign in, so a refresh does not ask again. This
  // also drops back to the form when the session goes away underneath us.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createClient();
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setStage("ready");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;

      if (event === "SIGNED_IN" || (event === "TOKEN_REFRESHED" && nextSession)) {
        setStage("ready");
        return;
      }

      if (event === "SIGNED_OUT") {
        setStage((current) => (current === "ready" ? "login" : current));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    const name = normalizeUsername(username);
    if (!name || !password) return;

    setBusy(true);
    setError(null);

    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: usernameToEmail(name),
      password,
    });

    setBusy(false);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "That username and password do not match."
          : signInError.message,
      );
      return;
    }

    setPassword("");
    void refreshLibrary();
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl">
        {stage === "login" ? (
          <Card
            icon={<KeyIcon className="h-5 w-5" />}
            title="Sign in"
            subtitle="Your Harmony account"
          >
            <form onSubmit={submitLogin} className="flex flex-col gap-4">
              <Field
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="your username"
                autoComplete="username"
                autoFocus
              />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="your password"
                autoComplete="current-password"
              />
              <Submit busy={busy} label="Sign in" />
            </form>
          </Card>
        ) : null}

        {stage === "ready" ? (
          <div className="flex flex-col gap-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
                <p className="mt-1 text-sm text-muted">
                  Signed in as{" "}
                  <span className="text-accent-soft">
                    {user?.user_metadata?.username ?? user?.email}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void signOut().then(() => setStage("login"));
                }}
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-text"
              >
                Sign out
              </button>
            </header>

            <UploadForm />

            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Songs
              </h2>

              {libraryLoading ? (
                <p className="text-sm text-dim">Loading…</p>
              ) : tracks.length === 0 ? (
                <p className="text-sm text-dim">Nothing uploaded yet.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-elevated/40">
                  {tracks.map((track) => (
                    <li
                      key={track.id}
                      className="flex items-center gap-3 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{track.title}</p>
                        <p className="truncate text-xs text-dim">
                          {track.artist} · {formatTime(track.duration)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!window.confirm(`Delete "${track.title}"? The audio goes too.`)) {
                            return;
                          }

                          void removeTrack(track.id)
                            .then(() => toast(`Deleted ${track.title}`))
                            .catch((removeError: unknown) =>
                              toast(
                                removeError instanceof Error
                                  ? removeError.message
                                  : "Could not delete that song",
                                "error",
                              ),
                            );
                        }}
                        className="rounded-full p-2 text-dim transition hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Delete ${track.title}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <p className="mt-10 text-center text-xs text-dim">
          <Link href="/" className="transition hover:text-muted">
            ← back to the music
          </Link>
        </p>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-elevated text-accent">
          {icon}
        </span>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-line bg-elevated/60 p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "password";
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-line bg-card px-3 py-2.5 text-sm text-text placeholder:text-dim focus:border-accent focus:outline-none"
      />
    </label>
  );
}

function Submit({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? <MusicIcon className="h-4 w-4 animate-pulse" /> : <LockIcon className="h-4 w-4" />}
      {busy ? "Checking…" : label}
    </button>
  );
}
