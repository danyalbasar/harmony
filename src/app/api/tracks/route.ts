import { NextResponse } from "next/server";
import { handleError, publicClient } from "@/lib/api";
import { toTrack, withUrls, type TrackRow } from "@/lib/tracks";

/**
 * Public. Anyone can read the catalogue, signed in or not, so this goes through
 * RLS rather than the service role.
 */
export async function GET() {
  try {
    const supabase = await publicClient();

    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const tracks = (data as TrackRow[]).map((row) => withUrls(toTrack(row)));

    return NextResponse.json({ tracks });
  } catch (error) {
    return handleError(error);
  }
}
