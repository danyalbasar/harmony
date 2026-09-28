# Harmony

A dark, purple-and-black music site. The public app is open to everyone: no account, no
sign-in wall, straight to the player. Songs are added in private at `/admin`.

Next.js (App Router) + React + Tailwind on the front end. Supabase on the back end —
Postgres for the library, Storage for the audio files and images, Auth for the admin, and
row level security so that reading is public and writing is not.

## How access works

| | Who can do it |
|---|---|
| Browse, search, listen, queue | everyone, no account |
| Add songs to playlists, delete songs, upload | signed-in admin, at `/admin` |
| Reach `/admin` | your Harmony account |

There is exactly one account: yours. The app has no sign-up form, and the
`POST /api/auth/register` endpoint was removed, so nobody can make an account through the
site at all.

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard/projects> and create a free project.
2. **Region: `eu-central-1` (Central EU, Frankfurt).** Supabase has no Middle East
   region, and Frankfurt is the best available option for a Gulf user. Do not
   over-think this — audio is delivered through Cloudflare's CDN from an edge near
   you, not from the project region.
3. Save the database password in a password manager. There is no reset link in the
   dashboard and you will need it during setup.

### Check reachability from your network

Do this from your Wi-Fi in Dubai, before going further. `*.supabase.co` has been
blocked by UAE ISPs before (TDRA, September 2025, roughly 18 days), so it is worth
confirming it works from your connection and not someone else's:

```powershell
nslookup your-project-ref.supabase.co
curl.exe -o NUL -w "status %{http_code} in %{time_total}s`n" https://your-project-ref.supabase.co/storage/v1/status
```

You want the hostname to resolve and the status to come back fast. If it hangs or
fails, Supabase is not going to work for you on that network and you would want the
custom-domain route instead of debugging app code.

## 2. Run the schema

In the dashboard: **SQL Editor → New query**. Paste the whole contents of
[`supabase/schema.sql`](./supabase/schema.sql) and run it. That creates the `tracks`,
`playlists` and `playlist_tracks` tables, the RLS policies, and the `audio` + `covers`
storage buckets. Every statement uses `if not exists`, so re-running it is harmless.

Verify it worked: `tracks`, `playlists` and `playlist_tracks` should now appear under
**Table Editor**, and `audio` + `covers` under **Storage**.

## 2b. Run the public-access SQL

Out of the box, `schema.sql` only lets signed-in accounts read the catalogue, which a
public visitor is not. So run this second file once:

**SQL Editor → New query**, paste all of
[`supabase/public-access.sql`](./supabase/public-access.sql), run it.

It opens up **read** access to `tracks`, `playlists` and `playlist_tracks` for everyone,
and keeps **write** access limited to signed-in users. It is safe to run more than once.

It deliberately does not touch `storage.objects` — that table belongs to Supabase's
internal role, so `ALTER TABLE` on it fails with *must be owner of table objects*. The
storage policies you need are already in `schema.sql`; this file only reports on them.

At the bottom it prints three read-only grids. Check that `audio` and `covers` both show
`public` as `t`.

## 3. Your account

There is no sign-up anywhere in the app, so you create the account in the dashboard:

**Authentication → Users → Add user**

- Email must be `username@harmony.local`, for example `admin@harmony.local`
- Set a strong password and tick **Auto Confirm User**

### How the no-email login works

Supabase Auth only understands email addresses, so a username is translated into a
private, non-routable placeholder address:

```
you  ->  you@harmony.local
```

That address is never sent anywhere. It exists only as a key inside the project, and
`harmony.local` cannot receive mail, so a confirmation email is impossible by
construction.

The domain is a single constant in `src/lib/auth-identity.ts` (`EMAIL_DOMAIN`). Change it
if you ever want, though doing so orphans existing accounts because the stored address
would no longer match.

### The one thing to be aware of

Registration is open to anyone who can reach the site, and every signed-in account can
read the whole library, because the RLS policies grant `authenticated` read access to all
tracks. That is fine while the app is only on your machine or a private URL. Before
putting it on a public domain, consider adding an invite code.

## 4. Configure the environment

`.env.local` already exists with the three placeholders. Fill it in from
**Project Settings → Data API** (newer projects: **API Keys**):

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret / service_role key |

`SUPABASE_SERVICE_ROLE_KEY` is only read on the server (`src/lib/supabase/admin.ts` is
marked `server-only`). Never put it in a `NEXT_PUBLIC_` variable or commit `.env.local`.

## 5. Run it

```powershell
npm run dev
```

Open <http://localhost:3000> — that is the public site, no sign-in needed.

To add music, go to <http://localhost:3000/admin> and sign in with your username and
password.

## Deploying

Push to GitHub and connect the repo to Vercel. Add the same three environment variables
in the Vercel project settings, then deploy. Supabase's free tier gives 1 GB of storage
and 500 MB of egress per month, which is plenty for a personal collection.

## How an upload actually works

Uploading only happens at `/admin`, and only after you sign in.

The audio bytes never pass through Next.js. The browser goes directly to Supabase
Storage, which is both faster and unconstrained by any serverless request body limit.

1. `POST /api/tracks/upload-ticket` — the server validates the file names, types and
   sizes, generates a random id, and returns a short-lived signed URL for the audio
   (and one for the cover, if there is one).
2. The browser `PUT`s each file straight to its signed URL. These URLs only work for a
   few minutes and only grant write access to that one random filename.
3. `POST /api/tracks/confirm` — the server checks both objects really landed in
   Storage, then writes the title, artist, album and duration to Postgres and returns
   the finished track.

If step 3 never happens the files are orphans in the bucket with no database row, which
is harmless. Deleting a song removes its row, its audio file and its cover image.

### One thing that has to be true

Steps 1 and 3 use the service role key. If `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` is
stale or revoked, every upload fails even though the sign-in succeeded. Reads are
unaffected, because those go through RLS with the publishable key instead, so the public
site keeps working with a broken service key.

If uploads fail, copy the current secret key from **Project Settings → API Keys** and
restart the dev server.

## What is where

```
supabase/schema.sql            tables, RLS policies, storage buckets
supabase/public-access.sql     opens reads to the public, keeps writes admin-only
src/proxy.ts                   refreshes the Supabase session cookie on every request
src/lib/supabase/admin.ts      service role client, server only
src/lib/supabase/server.ts     cookie client: identifies the admin, serves public reads
src/lib/supabase/client.ts     browser client used for admin sign in
src/lib/tracks.ts              shared types, limits and formatting helpers
src/lib/api.ts                 publicClient + requireSession + error handling
src/lib/api-client.ts          typed fetch wrappers + the signed-URL uploader
src/app/admin/                 sign in, upload form, song list
src/app/api/...                upload ticket, confirm, track CRUD, playlist CRUD
src/context/                   music library, player, toasts, sleep sounds
src/components/                sidebar, player bar, queue, track row / card
```

## Notes and limits

- Audio up to 100 MB, cover art up to 8 MB, per the bucket limits in `schema.sql`.
- Durations are read in the browser from the file before upload, so no server-side audio
  parsing is needed.
- Public reads go through RLS with the publishable key on purpose. It is a smaller blast
  radius than a service role client, and it means rotating the secret key cannot take the
  public site offline.
- The storage buckets are public. That is what lets the `<audio>` element stream with
  range requests, which is what makes seeking instant. File names are random UUIDs, so
  links are not guessable — but if you ever need truly private audio, switch the buckets
  to private and stream them through a signed-URL route instead. That costs a request
  per playback, so it is a real tradeoff, not a free win.
- Playback speed here is bounded by how close Supabase's storage CDN is to you, not by
  the app code.
