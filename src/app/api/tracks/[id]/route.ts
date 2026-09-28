import { NextResponse } from "next/server";
import { handleError, requireSession } from "@/lib/api";
import type { Database } from "@/lib/database.types";
import {
  AUDIO_BUCKET,
  COVER_BUCKET,
  COVER_MIME_TYPES,
  MAX_COVER_BYTES,
  extensionFor,
  toTrack,
  withUrls,
  type TrackRow,
} from "@/lib/tracks";

export const maxDuration = 300;

type TrackUpdate = Database["public"]["Tables"]["tracks"]["Update"];

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { admin } = await requireSession();
    const { id } = await params;

    const form = await request.formData();
    const cover = form.get("cover");
    const title = String(form.get("title") ?? "").trim();
    const artist = String(form.get("artist") ?? "").trim();
    const album = String(form.get("album") ?? "").trim();

    const updates: TrackUpdate = {};

    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (form.has("album")) updates.album = album || null;

    let newCoverPath: string | null = null;

    if (cover instanceof File && cover.size > 0) {
      if (!COVER_MIME_TYPES.includes(cover.type)) {
        return NextResponse.json(
          { error: "Cover art has to be a JPEG, PNG, WebP or GIF image." },
          { status: 400 },
        );
      }

      if (cover.size > MAX_COVER_BYTES) {
        return NextResponse.json({ error: "Cover art needs to be under 8 MB." }, { status: 400 });
      }

      newCoverPath = `${crypto.randomUUID()}.${extensionFor(cover.name)}`;

      const { error } = await admin.storage
        .from(COVER_BUCKET)
        .upload(newCoverPath, cover, { contentType: cover.type, upsert: false });

      if (error) throw error;

      updates.cover_path = newCoverPath;
      updates.cover_mime = cover.type;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const { data, error } = await admin
      .from("tracks")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (newCoverPath) await admin.storage.from(COVER_BUCKET).remove([newCoverPath]);
      throw error;
    }

    const previous = data as TrackRow;

    if (newCoverPath && previous.cover_path && previous.cover_path !== newCoverPath) {
      await admin.storage.from(COVER_BUCKET).remove([previous.cover_path]);
    }

    return NextResponse.json({ track: withUrls(toTrack(previous)) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { admin } = await requireSession();
    const { id } = await params;

    const { data, error } = await admin.from("tracks").delete().eq("id", id).select("*").single();

    if (error) throw error;

    const track = data as TrackRow;
    const paths: Record<string, string[]> = { [AUDIO_BUCKET]: [track.audio_path] };
    if (track.cover_path) paths[COVER_BUCKET] = [track.cover_path];

    await Promise.all(
      Object.entries(paths).map(([bucket, keys]) => admin.storage.from(bucket).remove(keys)),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
