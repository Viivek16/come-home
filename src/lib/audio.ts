// Thin wrapper around a single HTMLAudioElement. Single instance so lock-screen
// / media-session controls always target the same element.
class AudioController {
  private el = new Audio();

  load(src: string) {
    this.el.src = src;
    this.el.load();
  }

  play() {
    return this.el.play();
  }

  pause() {
    this.el.pause();
  }

  toggle() {
    return this.el.paused ? this.play() : (this.pause(), Promise.resolve());
  }

  seek(seconds: number) {
    this.el.currentTime = seconds;
  }

  setLoop(on: boolean) {
    this.el.loop = on;
  }

  setVolume(v: number) {
    this.el.volume = Math.max(0, Math.min(1, v));
  }

  get volume() {
    return this.el.volume;
  }

  get paused() {
    return this.el.paused;
  }

  get duration() {
    return this.el.duration;
  }

  get currentTime() {
    return this.el.currentTime;
  }

  on<K extends keyof HTMLMediaElementEventMap>(
    event: K,
    handler: (e: HTMLMediaElementEventMap[K]) => void,
  ) {
    this.el.addEventListener(event, handler);
    return () => this.el.removeEventListener(event, handler);
  }
}

export const audio = new AudioController();
