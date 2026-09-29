/**
 * Playlists are paused. This file is disabled but kept intact so it can be
 * switched back on without rewriting it.
 *
 * Add and remove a song in a playlist. Off.
 *
 * To restore: delete the stub below, then unwrap the block.
 */

/*
 * BEGIN COMMENTED-OUT PLAYLIST CODE - do not edit inside the block
import { NextResponse } from "next/server";
import { handleError, requireSession } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const { admin } = await requireSession();
    const { id } = await params;

    const body = (await request.json().catch(() => null)) as { trackId?: unknown } | null;
    const trackId = typeof body?.trackId === "string" ? body.trackId : "";

    if (!trackId) {
      return NextResponse.json({ error: "Missing trackId." }, { status: 400 });
    }

    const { data: existing, error: existingError } = await admin
      .from("playlist_tracks")
      .select("track_id")
      .eq("playlist_id", id);

    if (existingError) throw existingError;

    if (existing?.some((row) => row.track_id === trackId)) {
      return NextResponse.json({ ok: true, alreadyAdded: true });
    }

    const { error } = await admin.from("playlist_tracks").insert({
      playlist_id: id,
      track_id: trackId,
      position: existing?.length ?? 0,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const { admin } = await requireSession();
    const { id } = await params;

    const trackId = new URL(request.url).searchParams.get("trackId");

    if (!trackId) {
      return NextResponse.json({ error: "Missing trackId." }, { status: 400 });
    }

    const { error } = await admin
      .from("playlist_tracks")
      .delete()
      .eq("playlist_id", id)
      .eq("track_id", trackId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

 */

import { NextResponse } from "next/server";

/** Playlists are paused, so this endpoint is intentionally inert. */
const disabled = () =>
  NextResponse.json({ error: "Playlists are paused" }, { status: 404 });

export const POST = disabled;

export const DELETE = disabled;