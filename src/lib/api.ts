import "server-only";

import { NextResponse } from "next/server";
import { getCurrentUserId, createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

class AuthError extends Error {
  constructor() {
    super("Not signed in");
    this.name = "AuthError";
  }
}

type Session = {
  userId: string;
  admin: ReturnType<typeof createAdminClient>;
};

/** Verifies the Supabase session cookie, otherwise returns a 401 response. */
export async function requireSession(): Promise<Session> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new AuthError();
  }

  return { userId, admin: createAdminClient() };
}

/**
 * Client for reads the public app is allowed to make.
 *
 * It deliberately does NOT use the service role key, so every row still goes
 * through RLS and stays behind the policies in supabase/schema.sql. That is
 * what lets a visitor who is not signed in still read the catalogue, and it
 * means this path keeps working if the service key is ever rotated.
 */
export async function publicClient() {
  return createServerSupabaseClient();
}

export function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: "You need to sign in first." }, { status: 401 });
  }

  const message = error instanceof Error ? error.message : "Something went wrong";
  return NextResponse.json({ error: message }, { status: 500 });
}
