-- Run this once in the Supabase dashboard:
--   SQL Editor -> New query -> paste -> Run
--
-- The music app at / is public, so visitors who are not signed in need to be
-- able to read the catalogue. This file is the SQL that makes that true.
--
-- It is safe to run more than once.
--
-- NOTE: this only touches tables in the public schema. It deliberately does not
-- touch storage.objects, because that table belongs to Supabase's internal
-- storage role. Statements like ALTER TABLE on it fail with
-- "must be owner of table objects". The storage policies you need were already
-- created by the original schema.sql. Section 4 below just reports on them.

-- ============================================================
-- 1. Songs are readable by everyone
--    The player lists tracks for visitors who are not signed in.
--    This exposes titles, artists, albums and durations, which is the same
--    thing a public music catalogue exposes. The audio itself is already in a
--    public bucket, so nothing new is revealed.
-- ============================================================

drop policy if exists "tracks are readable by signed in users" on public.tracks;
drop policy if exists "tracks are publicly readable" on public.tracks;
create policy "tracks are publicly readable"
  on public.tracks for select using (true);

-- ============================================================
-- 2. Only a signed in admin can add or remove songs
--    /admin signs in, then writes. The server routes also require a session, so
--    these policies are the second of the two checks.
--
--    This is broad on purpose: it trusts the Supabase account. If you ever
--    reopen public sign-ups, anyone who makes an account can upload. See the
--    note at the bottom of this file.
-- ============================================================

drop policy if exists "signed in users can add tracks" on public.tracks;
create policy "signed in users can add tracks"
  on public.tracks for insert to authenticated with check (true);

drop policy if exists "signed in users can delete tracks" on public.tracks;
create policy "signed in users can delete tracks"
  on public.tracks for delete to authenticated using (true);

-- ============================================================
-- 3. Playlists belong to the site, not to a visitor
--    Everyone can see them, only a signed in admin can change them.
-- ============================================================

drop policy if exists "playlists are readable by signed in users" on public.playlists;
drop policy if exists "playlists are publicly readable" on public.playlists;
create policy "playlists are publicly readable"
  on public.playlists for select using (true);

drop policy if exists "playlists are writable by signed in users" on public.playlists;
create policy "playlists are writable by signed in users"
  on public.playlists for all to authenticated
  using (true) with check (true);

drop policy if exists "playlist tracks are readable by signed in users" on public.playlist_tracks;
drop policy if exists "playlist tracks are publicly readable" on public.playlist_tracks;
create policy "playlist tracks are publicly readable"
  on public.playlist_tracks for select using (true);

drop policy if exists "playlist tracks are writable by signed in users" on public.playlist_tracks;
create policy "playlist tracks are writable by signed in users"
  on public.playlist_tracks for all to authenticated
  using (true) with check (true);

-- ============================================================
-- 4. Report only -- these are SELECTs, they change nothing.
--    Check the grids at the bottom of the editor.
-- ============================================================

-- your two buckets: both must show public = t,
-- 104857600 bytes for audio and 8388608 for covers
select id, public, file_size_limit from storage.buckets order by id;

-- the four storage policies, created by the original schema.sql
select policyname, cmd, roles::text
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;

-- the app policies. Expect three for tracks, two each for playlists and
-- playlist_tracks.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
