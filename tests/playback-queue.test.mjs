import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const compiled = ts.transpileModule(
  readFileSync(new URL("../src/lib/playback-queue.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
const exports = {};
runInNewContext(compiled, { exports });
const { PlaybackQueue } = exports;
const songs = ["a", "b", "c", "d"].map((id) => ({ id, title: id, audioUrl: `${id}.mp3` }));
const ids = (queue) => Array.from(queue.snapshot().queue, (song) => song.id);

test("playing a library list and navigating it never populate the manual queue", () => {
  const queue = new PlaybackQueue();
  assert.equal(queue.next(), null);
  queue.start(songs, 1);
  assert.deepEqual(ids(queue), []);
  assert.equal(queue.next().id, "c");
  assert.equal(queue.previous().id, "b");
  assert.deepEqual(ids(queue), []);
});

test("adding songs neither starts playback nor replaces the current song", () => {
  const queue = new PlaybackQueue();
  queue.enqueue(songs[2]);
  assert.equal(queue.snapshot().current, null);
  queue.start(songs, 0);
  queue.enqueue(songs[3]);
  assert.equal(queue.snapshot().current.id, "a");
  assert.deepEqual(ids(queue), ["c", "d"]);
});

test("Play next gets priority and queued songs are consumed before library navigation", () => {
  const queue = new PlaybackQueue();
  queue.start(songs, 0);
  queue.enqueue(songs[3]);
  queue.enqueue(songs[2], true);
  assert.equal(queue.next(true, true).id, "c");
  assert.deepEqual(ids(queue), ["d"]);
  assert.equal(queue.next().id, "d");
  assert.deepEqual(ids(queue), []);
  assert.equal(queue.next().id, "b");
});

test("removing and clearing queued songs leave the current audio selection alone", () => {
  const queue = new PlaybackQueue();
  queue.start(songs, 0);
  queue.enqueue(songs[1]);
  queue.enqueue(songs[2]);
  queue.remove(0);
  assert.deepEqual(ids(queue), ["c"]);
  queue.clear();
  assert.deepEqual(ids(queue), []);
  assert.equal(queue.snapshot().current.id, "a");
});

test("selecting a queued song consumes through it and Previous returns to the last song", () => {
  const queue = new PlaybackQueue();
  queue.start(songs, 0);
  queue.enqueue(songs[1]);
  queue.enqueue(songs[2]);
  queue.enqueue(songs[3]);
  assert.equal(queue.playQueued(1).id, "c");
  assert.deepEqual(ids(queue), ["d"]);
  assert.equal(queue.previous().id, "a");
  assert.deepEqual(ids(queue), ["d"]);
});

test("manual repeats are allowed, while resuming the library avoids an immediate duplicate", () => {
  const queue = new PlaybackQueue();
  queue.start(songs, 0);
  queue.enqueue(songs[1]);
  queue.enqueue(songs[1]);
  assert.deepEqual(ids(queue), ["b", "b"]);
  assert.equal(queue.next().id, "b");
  assert.equal(queue.next().id, "b");
  assert.equal(queue.next().id, "c");
  assert.deepEqual(ids(queue), []);
});

test("invalid selections do not consume queued songs, and repeat-all still navigates the source", () => {
  const queue = new PlaybackQueue();
  queue.start(songs, 3);
  queue.enqueue(songs[1]);
  assert.equal(queue.playQueued(8), null);
  assert.deepEqual(ids(queue), ["b"]);
  assert.equal(queue.start(songs, -1), null);
  assert.equal(queue.snapshot().current.id, "d");
  queue.clear();
  assert.equal(queue.next(false, true).id, "a");
});
