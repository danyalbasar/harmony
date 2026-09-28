import { NextResponse } from "next/server";
import { handleError, requireSession } from "@/lib/api";
import {
  AUDIO_BUCKET,
  COVER_BUCKET,
  toTrack,
  withUrls,
  type TrackRow,
} from "@/lib/tracks";

/**
 * Step 2 of a direct upload. The browser has already PUT the files to Storage,
 * so this only records the metadata. Both objects are verified to exist first,
 * which keeps a failed or interrupted upload out of the library.
 */
export async function POST(request: Request) {
  try {
    const { userId, admin } = await requireSession();

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

    const id = typeof body?.id === "string" ? body.id : "";
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const artist = typeof body?.artist === "string" ? body.artist.trim() : "";
    const album = typeof body?.album === "string" ? body.album.trim() : "";
    const duration = Number(body?.duration ?? 0);
    const audioPath = typeof body?.audioPath === "string" ? body.audioPath : "";
    const audioMime = typeof body?.audioMime === "string" ? body.audioMime : "audio/mpeg";
    const audioSize = Number(body?.audioSize ?? 0);
    const coverPath = typeof body?.coverPath === "string" && body.coverPath ? body.coverPath : null;
    const coverMime = typeof body?.coverMime === "string" && body.coverMime ? body.coverMime : null;

    if (!id) return NextResponse.json({ error: "Missing upload id." }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Give the song a title." }, { status: 400 });
    if (!artist) return NextResponse.json({ error: "Give the song an artist." }, { status: 400 });

    // The ticket route generated these as "<uuid>.<ext>". Anything else means the
    // client is trying to claim a file it was never issued a URL for.
    const ownedPath = new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.[a-z0-9]+$`);

    if (!ownedPath.test(audioPath)) {
      return NextResponse.json({ error: "Invalid audio path." }, { status: 400 });
    }

    if (coverPath && !ownedPath.test(coverPath)) {
      return NextResponse.json({ error: "Invalid cover path." }, { status: 400 });
    }

    const { data: audioInfo, error: audioInfoError } = await admin.storage
      .from(AUDIO_BUCKET)
      .info(audioPath);

    if (audioInfoError || !audioInfo) {
      return NextResponse.json(
        { error: "The audio file never made it to storage. Please try again." },
        { status: 400 },
      );
    }

    if (coverPath) {
      const { error: coverInfoError } = await admin.storage.from(COVER_BUCKET).info(coverPath);

      if (coverInfoError) {
        await admin.storage.from(AUDIO_BUCKET).remove([audioPath]);
        return NextResponse.json({ error: "The cover art never made it to storage." }, { status: 400 });
      }
    }

    const { data, error } = await admin
      .from("tracks")
      .insert({
        id,
        title,
        artist,
        album: album || null,
        duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
        audio_path: audioPath,
        audio_mime: audioMime || audioInfo.contentType || "audio/mpeg",
        audio_size: audioSize || audioInfo.size || 0,
        cover_path: coverPath,
        cover_mime: coverMime,
        created_by: userId,
      })
      .select("*")
      .single();

    if (error) {
      await admin.storage.from(AUDIO_BUCKET).remove([audioPath]);
      if (coverPath) await admin.storage.from(COVER_BUCKET).remove([coverPath]);
      throw error;
    }

    return NextResponse.json({ track: withUrls(toTrack(data as TrackRow)) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
