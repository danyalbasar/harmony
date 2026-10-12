import type { TrackWithUrls } from "@/lib/tracks";

type Position = { track: TrackWithUrls; sourceIndex: number };

/** Library navigation and the user's explicitly queued songs are independent. */
export class PlaybackQueue {
  private source: TrackWithUrls[] = [];
  private sourceIndex = -1;
  private history: Position[] = [];
  private current: TrackWithUrls | null = null;
  private upcoming: TrackWithUrls[] = [];

  snapshot() {
    return { current: this.current, queue: this.upcoming, next: this.upcoming[0] ?? this.source[this.sourceIndex + 1] };
  }

  start(tracks: TrackWithUrls[], index = 0) {
    const track = tracks[index];
    if (!track) return null;
    this.source = tracks;
    this.sourceIndex = index;
    this.history = [];
    this.current = track;
    return track;
  }

  enqueue(track: TrackWithUrls, playNext = false) {
    this.upcoming = playNext ? [track, ...this.upcoming] : [...this.upcoming, track];
  }

  private select(track: TrackWithUrls, sourceIndex = this.sourceIndex) {
    if (this.current) this.history.push({ track: this.current, sourceIndex: this.sourceIndex });
    this.sourceIndex = sourceIndex;
    this.current = track;
    return track;
  }

  playQueued(index: number) {
    const track = this.upcoming[index];
    if (!track) return null;
    this.upcoming = this.upcoming.slice(index + 1);
    return this.select(track);
  }

  next(shuffle = false, repeatAll = false) {
    if (this.upcoming.length > 0) return this.playQueued(0);
    if (shuffle) {
      const candidates = this.source.map((track, index) => ({ track, index }))
        .filter(({ track }) => track.id !== this.current?.id);
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        return this.select(pick.track, pick.index);
      }
    }
    let index = this.sourceIndex + 1;
    // A manually queued song may also be the next library song; avoid playing
    // that same song twice in succession when returning to the library list.
    while (this.source[index] && this.source[index].id === this.current?.id) index++;
    if (index >= this.source.length) {
      if (!repeatAll || this.source.length === 0) return null;
      index = 0;
    }
    return this.select(this.source[index], index);
  }

  previous() {
    const position = this.history.pop();
    if (position) {
      this.current = position.track;
      this.sourceIndex = position.sourceIndex;
      return position.track;
    }
    const track = this.source[Math.max(0, this.sourceIndex - 1)];
    if (track) {
      this.sourceIndex = Math.max(0, this.sourceIndex - 1);
      this.current = track;
    }
    return this.current;
  }

  remove(index: number) { this.upcoming = this.upcoming.filter((_, position) => position !== index); }
  clear() { this.upcoming = []; }
}
