/**
 * Playlists are paused. This file is disabled but kept intact so it can be
 * switched back on without rewriting it.
 *
 * Rename and delete of a single playlist. Off.
 *
 * To restore: delete the stub below, then unwrap the block.
 */

/*
 * BEGIN COMMENTED-OUT PLAYLIST CODE - do not edit inside the block
import { NextResponse } from "next/server";
import { handleError, requireSession } from "@/lib/api";
import type { Database } from "@/lib/database.types";
import { toPlaylist, type PlaylistRow } from "@/lib/tracks";

type PlaylistUpdate = Database["public"]["Tables"]["playlists"]["Update"];

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { admin } = await requireSession();
    const { id } = await params;

    const body = (await request.json().catch(() => null)) as {
      name?: unknown;
      description?: unknown;
    } | null;

    const updates: PlaylistUpdate = {};

    if (typeof body?.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (typeof body?.description === "string") {
      updates.description = body.description.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const { data, error } = await admin
      .from("playlists")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ playlist: toPlaylist(data as PlaylistRow) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { admin } = await requireSession();
    const { id } = await params;

    const { error } = await admin.from("playlists").delete().eq("id", id);

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

export const PATCH = disabled;

export const DELETE = disabled;