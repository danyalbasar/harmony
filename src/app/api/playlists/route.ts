import { NextResponse } from "next/server";
import { handleError, publicClient, requireSession } from "@/lib/api";
import { toPlaylist, toTrack, withUrls, type PlaylistRow, type TrackRow } from "@/lib/tracks";

type PlaylistWithTracks = ReturnType<typeof toPlaylist> & { tracks: ReturnType<typeof withUrls>[] };

/**
 * Public. Playlists belong to the site rather than to a visitor, so anyone can
 * read them. Creating and editing them still needs a session, handled below.
 */
export async function GET() {
  try {
    const supabase = await publicClient();

    const [{ data: playlistRows, error: playlistError }, { data: linkRows, error: linkError }] =
      await Promise.all([
        supabase.from("playlists").select("*").order("created_at", { ascending: false }),
        supabase.from("playlist_tracks").select("*").order("position", { ascending: true }),
      ]);

    if (playlistError) throw playlistError;
    if (linkError) throw linkError;

    const trackIds = Array.from(new Set((linkRows ?? []).map((link) => link.track_id)));

    const { data: trackRows, error: trackError } = trackIds.length
      ? await supabase.from("tracks").select("*").in("id", trackIds)
      : { data: [], error: null };

    if (trackError) throw trackError;

    const trackMap = new Map(
      ((trackRows ?? []) as TrackRow[]).map((row) => [row.id, withUrls(toTrack(row))]),
    );

    const grouped = new Map<string, ReturnType<typeof withUrls>[]>();
    for (const link of linkRows ?? []) {
      const track = trackMap.get(link.track_id);
      if (!track) continue;
      const list = grouped.get(link.playlist_id) ?? [];
      list.push(track);
      grouped.set(link.playlist_id, list);
    }

    const playlists: PlaylistWithTracks[] = ((playlistRows ?? []) as PlaylistRow[]).map((row) => ({
      ...toPlaylist(row),
      tracks: grouped.get(row.id) ?? [],
    }));

    return NextResponse.json({ playlists });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId, admin } = await requireSession();

    const body = (await request.json().catch(() => null)) as {
      name?: unknown;
      description?: unknown;
    } | null;

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const description =
      typeof body?.description === "string" && body.description.trim() ? body.description.trim() : null;

    if (!name) {
      return NextResponse.json({ error: "Give the playlist a name." }, { status: 400 });
    }

    const { data, error } = await admin
      .from("playlists")
      .insert({ name, description, created_by: userId })
      .select("*")
      .single();

    if (error) throw error;

    const playlist = toPlaylist(data as PlaylistRow);

    return NextResponse.json({ playlist: { ...playlist, tracks: [] } }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
