import type { TrackWithUrls } from "@/lib/tracks";

// Playlists are paused. Kept so the client calls can be restored as they were.
// import type { Playlist } from "@/lib/tracks";
// export type PlaylistWithTracks = Playlist & { tracks: TrackWithUrls[] };

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readError(response: Response) {
  try {
    const body = await response.json();
    return typeof body?.error === "string" ? body.error : "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(path, {
    ...rest,
    headers: {
      ...(isFormData || body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: isFormData ? body : body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export const getTracks = () => api<{ tracks: TrackWithUrls[] }>("/api/tracks");

export type UploadTicket = {
  id: string;
  audio: { path: string; signedUrl: string; mime: string };
  cover: { path: string; signedUrl: string; mime: string } | null;
};

export const createUploadTicket = (body: {
  audioName: string;
  audioType: string;
  audioSize: number;
  coverName?: string;
  coverType?: string;
  coverSize?: number;
}) => api<UploadTicket>("/api/tracks/upload-ticket", { method: "POST", body });

export const confirmUpload = (body: {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioPath: string;
  audioMime: string;
  audioSize: number;
  coverPath: string | null;
  coverMime: string | null;
}) => api<{ track: TrackWithUrls }>("/api/tracks/confirm", { method: "POST", body });

/**
 * PUTs a file straight to Supabase Storage. Uses XHR rather than fetch so the
 * upload can report progress, which fetch still cannot do.
 */
export function putToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress: (fraction: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", signedUrl, true);
    request.setRequestHeader("content-type", file.type || "application/octet-stream");

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    });

    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(1);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${request.status}`));
      }
    });

    request.addEventListener("error", () => reject(new Error("Upload failed. Check your connection.")));
    request.addEventListener("abort", () => reject(new Error("Upload cancelled.")));

    request.send(file);
  });
}

export const updateTrack = (id: string, form: FormData) =>
  api<{ track: TrackWithUrls }>(`/api/tracks/${id}`, { method: "PATCH", body: form });

export const deleteTrack = (id: string) => api<{ ok: true }>(`/api/tracks/${id}`, { method: "DELETE" });

/*
 * Playlists are paused. The API routes behind these return 404 until the
 * feature is switched back on, so the calls are kept here but not used.
 *
 * export const getPlaylists = () => api<{ playlists: PlaylistWithTracks[] }>("/api/playlists");
 *
 * export const createPlaylist = (body: { name: string; description?: string }) =>
 *   api<{ playlist: PlaylistWithTracks }>("/api/playlists", { method: "POST", body });
 *
 * export const renamePlaylist = (id: string, body: { name?: string; description?: string }) =>
 *   api<{ playlist: Playlist }>(`/api/playlists/${id}`, { method: "PATCH", body });
 *
 * export const deletePlaylist = (id: string) =>
 *   api<{ ok: true }>(`/api/playlists/${id}`, { method: "DELETE" });
 *
 * export const addTrackToPlaylist = (playlistId: string, trackId: string) =>
 *   api<{ ok: true }>(`/api/playlists/${playlistId}/tracks`, { method: "POST", body: { trackId } });
 *
 * export const removeTrackFromPlaylist = (playlistId: string, trackId: string) =>
 *   api<{ ok: true }>(`/api/playlists/${playlistId}/tracks?trackId=${trackId}`, { method: "DELETE" });
 */
