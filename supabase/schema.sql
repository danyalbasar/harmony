-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.tracks (
  id           uuid primary key default gen_random_uuid(),
  title        text        not null,
  artist       text        not null,
  album        text,
  duration     numeric(8, 2) not null default 0,
  audio_path   text        not null,
  audio_mime   text        not null default 'audio/mpeg',
  audio_size   bigint      not null default 0,
  cover_path   text,
  cover_mime   text,
  created_by   uuid        references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists tracks_created_at_idx on public.tracks (created_at desc);

create table if not exists public.playlists (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  created_by  uuid        references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.playlist_tracks (
  playlist_id uuid        not null references public.playlists (id) on delete cascade,
  track_id    uuid        not null references public.tracks (id) on delete cascade,
  position    integer     not null default 0,
  added_at    timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

-- ============================================================
-- Row level security
-- Any signed-in person can read. Writes go through the Next.js
-- server (service role key), so client-side write policies stay
-- closed off.
-- ============================================================

alter table public.tracks          enable row level security;
alter table public.playlists       enable row level security;
alter table public.playlist_tracks enable row level security;

drop policy if exists "tracks are readable by signed in users" on public.tracks;
create policy "tracks are readable by signed in users"
  on public.tracks for select to authenticated using (true);

drop policy if exists "playlists are readable by signed in users" on public.playlists;
create policy "playlists are readable by signed in users"
  on public.playlists for select to authenticated using (true);

drop policy if exists "playlist tracks are readable by signed in users" on public.playlist_tracks;
create policy "playlist tracks are readable by signed in users"
  on public.playlist_tracks for select to authenticated using (true);

-- ============================================================
-- Storage buckets
-- audio  = the song files
-- covers = the album art
-- Both are public so the <audio> element can stream them with
-- range requests. Paths are random, so they are not guessable.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('audio',  'audio',  true, 104857600),
  ('covers', 'covers', true,   8388608)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "audio is publicly readable" on storage.objects;
create policy "audio is publicly readable"
  on storage.objects for select using (bucket_id = 'audio');

drop policy if exists "covers are publicly readable" on storage.objects;
create policy "covers are publicly readable"
  on storage.objects for select using (bucket_id = 'covers');

-- Signed in users may delete their own uploads from the dashboard.
drop policy if exists "signed in users manage audio objects" on storage.objects;
create policy "signed in users manage audio objects"
  on storage.objects for all to authenticated
  using (bucket_id = 'audio') with check (bucket_id = 'audio');

drop policy if exists "signed in users manage cover objects" on storage.objects;
create policy "signed in users manage cover objects"
  on storage.objects for all to authenticated
  using (bucket_id = 'covers') with check (bucket_id = 'covers');
