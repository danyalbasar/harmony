import { NextResponse } from "next/server";
import { handleError, requireSession } from "@/lib/api";
import {
  AUDIO_BUCKET,
  AUDIO_MIME_TYPES,
  COVER_BUCKET,
  COVER_MIME_TYPES,
  MAX_AUDIO_BYTES,
  MAX_COVER_BYTES,
  extensionFor,
} from "@/lib/tracks";

/**
 * Step 1 of a direct upload.
 *
 * The browser asks for a short-lived signed URL, then PUTs the file straight to
 * Storage. The audio bytes never pass through this server, so there is no body
 * size limit here and no double hop to the CDN.
 */
export async function POST(request: Request) {
  try {
    const { admin } = await requireSession();

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

    const audioName = typeof body?.audioName === "string" ? body.audioName : "";
    const audioType = typeof body?.audioType === "string" ? body.audioType : "";
    const audioSize = Number(body?.audioSize ?? 0);
    const coverName = typeof body?.coverName === "string" ? body.coverName : "";
    const coverType = typeof body?.coverType === "string" ? body.coverType : "";
    const coverSize = Number(body?.coverSize ?? 0);

    if (!audioName) {
      return NextResponse.json({ error: "Missing audio file name." }, { status: 400 });
    }

    if (!AUDIO_MIME_TYPES.includes(audioType)) {
      return NextResponse.json(
        { error: `That audio type is not supported (${audioType || "unknown"}).` },
        { status: 400 },
      );
    }

    if (audioSize > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Audio files need to be under 100 MB." }, { status: 400 });
    }

    const hasCover = Boolean(coverName);

    if (hasCover && !COVER_MIME_TYPES.includes(coverType)) {
      return NextResponse.json(
        { error: "Cover art has to be a JPEG, PNG, WebP or GIF image." },
        { status: 400 },
      );
    }

    if (hasCover && coverSize > MAX_COVER_BYTES) {
      return NextResponse.json({ error: "Cover art needs to be under 8 MB." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const audioPath = `${id}.${extensionFor(audioName)}`;
    const coverPath = hasCover ? `${id}.${extensionFor(coverName)}` : null;

    const { data: audioTicket, error: audioError } = await admin.storage
      .from(AUDIO_BUCKET)
      .createSignedUploadUrl(audioPath, { upsert: false });

    if (audioError) throw audioError;

    let coverTicket: { path: string; signedUrl: string } | null = null;

    if (coverPath) {
      const { data, error } = await admin.storage
        .from(COVER_BUCKET)
        .createSignedUploadUrl(coverPath, { upsert: false });

      if (error) throw error;

      coverTicket = { path: data.path, signedUrl: data.signedUrl };
    }

    return NextResponse.json({
      id,
      audio: { path: audioTicket.path, signedUrl: audioTicket.signedUrl, mime: audioType },
      cover: coverTicket ? { ...coverTicket, mime: coverType } : null,
    });
  } catch (error) {
    return handleError(error);
  }
}
