"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getPlaylists,
  getTracks,
  createPlaylist as createPlaylistRequest,
  deletePlaylist as deletePlaylistRequest,
  addTrackToPlaylist as addTrackRequest,
  removeTrackFromPlaylist as removeTrackRequest,
  deleteTrack as deleteTrackRequest,
  createUploadTicket,
  putToSignedUrl,
  confirmUpload,
  type PlaylistWithTracks,
} from "@/lib/api-client";
import type { TrackWithUrls } from "@/lib/tracks";

export type SongUpload = {
  audio: File;
  cover: File | null;
  title: string;
  artist: string;
  album: string;
  duration: number;
  onProgress: (fraction: number) => void;
};

type MusicContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  tracks: TrackWithUrls[];
  playlists: PlaylistWithTracks[];
  libraryLoading: boolean;
  libraryError: string | null;
  refreshLibrary: () => Promise<void>;
  uploadSong: (upload: SongUpload) => Promise<TrackWithUrls>;
  removeTrack: (id: string) => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<void>;
  removePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [tracks, setTracks] = useState<TrackWithUrls[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistWithTracks[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const refreshLibrary = useCallback(async () => {
    setLibraryLoading(true);
    setLibraryError(null);

    try {
      const [trackData, playlistData] = await Promise.all([getTracks(), getPlaylists()]);
      setTracks(trackData.tracks);
      setPlaylists(playlistData.playlists);
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : "Could not load your library");
    } finally {
      setLibraryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    let active = true;

    const handleSession = (nextSession: Session | null) => {
      if (!active) return;

      setSession(nextSession);
      setLoading(false);

      // The catalogue is public now, so it is loaded for signed out visitors
      // too. Writing still needs a session, but reading never did.
      void refreshLibrary();
    };

    void supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      handleSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshLibrary]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  const uploadSong = useCallback(async (upload: SongUpload) => {
    const { audio, cover, title, artist, album, duration, onProgress } = upload;

    const ticket = await createUploadTicket({
      audioName: audio.name,
      audioType: audio.type,
      audioSize: audio.size,
      coverName: cover?.name,
      coverType: cover?.type,
      coverSize: cover?.size,
    });

    const coverWeight = cover ? Math.min(cover.size / (audio.size + cover.size), 0.2) : 0;
    const audioWeight = 1 - coverWeight;

    // Audio first, it is the bulk of the bytes.
    await putToSignedUrl(ticket.audio.signedUrl, audio, (fraction) => {
      onProgress(fraction * audioWeight);
    });

    if (ticket.cover && cover) {
      await putToSignedUrl(ticket.cover.signedUrl, cover, (fraction) => {
        onProgress(audioWeight + fraction * coverWeight);
      });
    }

    onProgress(1);

    const { track } = await confirmUpload({
      id: ticket.id,
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim(),
      duration,
      audioPath: ticket.audio.path,
      audioMime: ticket.audio.mime,
      audioSize: audio.size,
      coverPath: ticket.cover?.path ?? null,
      coverMime: ticket.cover?.mime ?? null,
    });

    setTracks((current) => [track, ...current]);
    return track;
  }, []);

  const removeTrack = useCallback(
    async (id: string) => {
      await deleteTrackRequest(id);
      setTracks((current) => current.filter((track) => track.id !== id));
      setPlaylists((current) =>
        current.map((playlist) => ({
          ...playlist,
          tracks: playlist.tracks.filter((track) => track.id !== id),
        })),
      );
    },
    [],
  );

  const createPlaylist = useCallback(async (name: string, description?: string) => {
    const { playlist } = await createPlaylistRequest({ name, description });
    setPlaylists((current) => [playlist, ...current]);
  }, []);

  const removePlaylist = useCallback(async (id: string) => {
    await deletePlaylistRequest(id);
    setPlaylists((current) => current.filter((playlist) => playlist.id !== id));
  }, []);

  const addToPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    await addTrackRequest(playlistId, trackId);

    setPlaylists((current) =>
      current.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        if (playlist.tracks.some((track) => track.id === trackId)) return playlist;

        const track = tracks.find((item) => item.id === trackId);
        if (!track) return playlist;

        return { ...playlist, tracks: [...playlist.tracks, track] };
      }),
    );
  }, [tracks]);

  const removeFromPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    await removeTrackRequest(playlistId, trackId);
    setPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, tracks: playlist.tracks.filter((track) => track.id !== trackId) }
          : playlist,
      ),
    );
  }, []);

  const value = useMemo<MusicContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signOut,
      tracks,
      playlists,
      libraryLoading,
      libraryError,
      refreshLibrary,
      uploadSong,
      removeTrack,
      createPlaylist,
      removePlaylist,
      addToPlaylist,
      removeFromPlaylist,
    }),
    [
      session,
      loading,
      signOut,
      tracks,
      playlists,
      libraryLoading,
      libraryError,
      refreshLibrary,
      uploadSong,
      removeTrack,
      createPlaylist,
      removePlaylist,
      addToPlaylist,
      removeFromPlaylist,
    ],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);

  if (!context) {
    throw new Error("useMusic must be used inside MusicProvider");
  }

  return context;
}
