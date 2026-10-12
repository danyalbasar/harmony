type MediaHandlers = Partial<Record<keyof HTMLMediaElementEventMap, EventListener>>;

/** Keep one candidate buffered, and promote that exact element on play. */
export class AudioPlayback {
  audio: HTMLAudioElement;
  private prepared: HTMLAudioElement | null = null;
  private request = 0;

  constructor(private handlers: MediaHandlers, private onPlayError: () => void) {
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.volume = 0.8;
    this.listen(this.audio, true);
  }

  private listen(audio: HTMLAudioElement, attach: boolean) {
    for (const [event, handler] of Object.entries(this.handlers)) {
      if (attach) audio.addEventListener(event, handler);
      else audio.removeEventListener(event, handler);
    }
  }

  private release(audio: HTMLAudioElement) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }

  prepare(source: string | undefined) {
    if (!source || this.audio.getAttribute("src") === source || this.prepared?.getAttribute("src") === source) return;
    if (this.prepared) this.release(this.prepared);
    this.prepared = new Audio();
    this.prepared.preload = "auto";
    this.prepared.src = source;
    this.prepared.load();
  }

  private start() {
    const audio = this.audio;
    const request = ++this.request;
    void audio.play().catch(() => {
      // Switching songs or pausing can reject an older play promise.
      if (request === this.request && audio === this.audio) this.onPlayError();
    });
  }

  load(source: string | undefined, autoplay: boolean, restart = false) {
    if (!source) return;
    ++this.request;
    if (this.prepared?.getAttribute("src") === source) {
      const previous = this.audio;
      this.listen(previous, false);
      this.audio = this.prepared;
      this.prepared = null;
      this.audio.volume = previous.volume;
      this.audio.muted = previous.muted;
      this.release(previous);
      this.listen(this.audio, true);
    } else if (this.audio.getAttribute("src") !== source) {
      this.audio.src = source;
      this.audio.load();
    } else if (restart || this.audio.ended) {
      this.audio.currentTime = 0;
    }
    if (autoplay) this.start();
  }

  toggle() {
    if (!this.audio.getAttribute("src")) return;
    if (this.audio.paused) this.start();
    else {
      ++this.request;
      this.audio.pause();
    }
  }

  dispose() {
    ++this.request;
    this.listen(this.audio, false);
    this.release(this.audio);
    if (this.prepared) this.release(this.prepared);
    this.prepared = null;
  }
}
