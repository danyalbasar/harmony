import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const compiled = ts.transpileModule(
  readFileSync(new URL("../src/lib/audio-playback.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

function setup() {
  const elements = [];
  class Audio extends EventTarget {
    constructor() {
      super();
      this.src = "";
      this.volume = 1;
      this.muted = false;
      this.paused = true;
      this.ended = false;
      this.currentTime = 0;
      this.loadCount = 0;
      this.pending = [];
      elements.push(this);
    }
    getAttribute() { return this.src || null; }
    removeAttribute() { this.src = ""; }
    load() { this.loadCount++; this.currentTime = 0; }
    play() {
      this.paused = false;
      this.dispatchEvent(new Event("play"));
      return new Promise((resolve, reject) => this.pending.push({ resolve, reject }));
    }
    pause() {
      if (this.paused) return;
      this.paused = true;
      this.dispatchEvent(new Event("pause"));
    }
  }
  const exports = {};
  runInNewContext(compiled, { exports, Audio });
  let errors = 0;
  let playEvents = 0;
  const player = new exports.AudioPlayback({ play: () => playEvents++ }, () => errors++);
  return { player, elements, errors: () => errors, playEvents: () => playEvents };
}

test("prepared audio is promoted without discarding its buffer or volume settings", () => {
  const { player, elements, playEvents } = setup();
  const oldAudio = player.audio;
  oldAudio.volume = 0.35;
  oldAudio.muted = true;
  player.prepare("song-a.mp3");
  const prepared = elements[1];
  prepared.buffered = { length: 1 };
  player.prepare("song-a.mp3");
  assert.equal(elements.length, 2);
  player.load("song-a.mp3", true);
  assert.equal(player.audio, prepared);
  assert.equal(prepared.loadCount, 1);
  assert.equal(prepared.buffered.length, 1);
  assert.equal(prepared.volume, 0.35);
  assert.equal(prepared.muted, true);
  assert.equal(playEvents(), 1);
  assert.equal(oldAudio.src, "");
  oldAudio.dispatchEvent(new Event("play"));
  assert.equal(playEvents(), 1);
  player.dispose();
});

test("pause/resume and selecting the current song preserve progress without reloading", () => {
  const { player } = setup();
  player.load("song-a.mp3", true);
  player.audio.currentTime = 42;
  const loads = player.audio.loadCount;
  player.toggle();
  assert.equal(player.audio.paused, true);
  player.toggle();
  assert.equal(player.audio.paused, false);
  player.load("song-a.mp3", true);
  assert.equal(player.audio.currentTime, 42);
  assert.equal(player.audio.loadCount, loads);
  player.audio.ended = true;
  player.load("song-a.mp3", true);
  assert.equal(player.audio.currentTime, 0);
  assert.equal(player.audio.loadCount, loads);
  player.dispose();
});

test("replacing a preload leaves the playing song alone and cleanup stops both downloads", () => {
  const { player, elements } = setup();
  player.load("song-a.mp3", true);
  player.audio.currentTime = 12;
  player.prepare("song-b.mp3");
  player.prepare("song-c.mp3");
  assert.equal(elements[1].src, "");
  assert.equal(player.audio.src, "song-a.mp3");
  assert.equal(player.audio.currentTime, 12);
  assert.equal(player.audio.paused, false);
  player.dispose();
  assert.ok(elements.every((audio) => audio.src === "" && audio.paused));
});

test("explicitly queuing the current song again restarts it without reloading its buffer", () => {
  const { player } = setup();
  player.load("song-a.mp3", true);
  player.audio.currentTime = 42;
  const loads = player.audio.loadCount;
  player.load("song-a.mp3", true, true);
  assert.equal(player.audio.currentTime, 0);
  assert.equal(player.audio.loadCount, loads);
  player.dispose();
});

test("a rejected old play request cannot overwrite a newer song's playback state", async () => {
  const { player, errors } = setup();
  player.load("song-a.mp3", true);
  const first = player.audio.pending[0];
  player.prepare("song-b.mp3");
  player.load("song-b.mp3", true);
  first.reject(new Error("Interrupted by song switch"));
  await Promise.resolve();
  assert.equal(errors(), 0);
  player.audio.pending[0].reject(new Error("Current song unavailable"));
  await Promise.resolve();
  assert.equal(errors(), 1);
  player.dispose();
});
