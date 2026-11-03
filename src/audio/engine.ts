import { ENVELOPE_RATE, renderTheme, type Theme } from './synth'
import { silentWav } from './wav'

export interface AudioSource {
  id: string
  /** Resolved on demand, so the lock screen follows the site language. */
  title: () => string
  artist: () => string
  album: () => string
  /** A real audio file (already resolved to a URL). */
  file?: string
  /** The generated instrumental, used when there's no file or it fails to load. */
  theme: Theme
  loop: boolean
}

export type Status = 'idle' | 'loading' | 'playing' | 'paused'

export interface PlayerState {
  currentId: string | null
  status: Status
}

interface Ready {
  url: string
  envelope?: Float32Array
  generated: boolean
}

/** Rendered instrumentals kept in memory (~6 MB each). */
const MAX_CACHED = 4

/**
 * One <audio> element for the whole site.
 *
 * iOS only lets an <audio> element start inside a tap. Once it has played
 * that way it may switch sources and play again freely. So when something isn't
 * ready yet, a silent clip starts inside the tap and the real audio is swapped
 * in once it has been rendered.
 */
export class AudioEngine {
  private el: HTMLAudioElement | null = null
  private sources = new Map<string, AudioSource>()
  private playlist: string[] = []
  private fallbackId = ''
  private artwork = ''
  private ready = new Map<string, Ready>()
  private inflight = new Map<string, Promise<Ready>>()
  private broken = new Set<string>()
  private renderQueue: Promise<unknown> = Promise.resolve()
  private wanted: string | null = null
  private swapping = false
  private silentUrl = ''
  private listeners = new Set<() => void>()
  private state: PlayerState = { currentId: null, status: 'idle' }
  private level = 0
  private levelAt = 0

  configure(options: { sources: AudioSource[]; playlist: string[]; fallbackId: string; artwork: string }) {
    for (const source of options.sources) this.sources.set(source.id, source)
    this.playlist = options.playlist
    this.fallbackId = options.fallbackId
    this.artwork = options.artwork
    this.setupMediaSession()
  }

  /* ── Subscriptions (for useSyncExternalStore) ── */

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getState = () => this.state

  getSource(id: string | null | undefined): AudioSource | undefined {
    return id ? this.sources.get(id) : undefined
  }

  isGenerated(id: string): boolean {
    const source = this.sources.get(id)
    return !source?.file || this.broken.has(id)
  }

  private set(patch: Partial<PlayerState>) {
    const next = { ...this.state, ...patch }
    if (next.currentId === this.state.currentId && next.status === this.state.status) return
    this.state = next
    this.listeners.forEach((listener) => listener())
    this.syncMediaSession()
  }

  /* ── Transport ── */

  play(id?: string) {
    const target = id ?? this.state.currentId ?? this.fallbackId
    const el = this.media()
    const ready = this.ready.get(target)
    this.wanted = target

    if (ready && this.state.currentId === target && el.src === ready.url) {
      this.set({ status: 'playing' })
      this.attempt(el)
      return
    }

    this.set({ currentId: target, status: 'loading' })
    if (ready) {
      this.start(target, ready)
      return
    }
    this.swap(el, this.silent(), true)
    this.resolve(target).then(
      (r) => {
        if (this.wanted === target) this.start(target, r)
      },
      (error) => {
        console.error('[500 days] could not prepare audio', error)
        if (this.wanted === target) this.set({ status: 'paused' })
      },
    )
  }

  pause() {
    this.wanted = null
    this.el?.pause()
    if (this.state.currentId) this.set({ status: 'paused' })
  }

  toggle(id?: string) {
    const target = id ?? this.state.currentId ?? this.fallbackId
    const active = this.state.currentId === target && (this.state.status === 'playing' || this.state.status === 'loading')
    if (active) this.pause()
    else this.play(target)
  }

  next() {
    const id = this.neighbour(1)
    if (id) this.play(id)
  }

  prev() {
    if (this.el && this.time > 3) {
      this.seek(0)
      return
    }
    const id = this.neighbour(-1)
    if (id) this.play(id)
  }

  /** The track before or after the current one in album order. */
  neighbour(direction: 1 | -1, from = this.state.currentId): string | null {
    const index = this.playlist.indexOf(from ?? '')
    if (index === -1) return direction === 1 ? (this.playlist[0] ?? null) : null
    return this.playlist[index + direction] ?? null
  }

  seek(seconds: number) {
    const duration = this.duration
    if (this.el && duration) this.el.currentTime = Math.max(0, Math.min(duration - 0.05, seconds))
  }

  /** Render ahead of time so playback starts instantly. */
  prefetch(id: string) {
    this.resolve(id).catch(() => undefined)
  }

  get time(): number {
    return this.el && !this.isSilent() ? this.el.currentTime : 0
  }

  get duration(): number {
    const d = this.el?.duration
    return d && Number.isFinite(d) && !this.isSilent() ? d : 0
  }

  /** Smoothed loudness 0–1 of whatever is playing: the real envelope for generated music, a gentle simulation for files. */
  getLevel(): number {
    const now = performance.now()
    if (now - this.levelAt < 8) return this.level
    const dt = Math.min(0.1, (now - this.levelAt) / 1000)
    this.levelAt = now
    let target = 0
    if (this.state.status === 'playing' && this.el && !this.isSilent()) {
      const t = this.el.currentTime
      const envelope = this.ready.get(this.state.currentId ?? '')?.envelope
      target = envelope
        ? (envelope[Math.floor(t * ENVELOPE_RATE)] ?? 0)
        : 0.55 + 0.2 * Math.sin(t * 2.3) * Math.sin(t * 0.9 + 1.3) + 0.15 * Math.sin(t * 7.1)
    }
    this.level += (target - this.level) * (1 - Math.exp(-dt / 0.09))
    return this.level
  }

  /* ── Internals ── */

  private media(): HTMLAudioElement {
    if (this.el) return this.el
    const el = new Audio()
    el.preload = 'auto'
    el.addEventListener('playing', () => {
      if (!this.isSilent()) this.set({ status: 'playing' })
    })
    el.addEventListener('pause', () => {
      if (!this.swapping && !this.isSilent() && !el.ended) this.set({ status: 'paused' })
    })
    el.addEventListener('ended', () => this.onEnded())
    el.addEventListener('error', () => this.onError())
    this.el = el
    return el
  }

  private silent(): string {
    if (!this.silentUrl) this.silentUrl = URL.createObjectURL(silentWav())
    return this.silentUrl
  }

  private isSilent(): boolean {
    return !!this.el && !!this.silentUrl && this.el.src === this.silentUrl
  }

  private start(id: string, ready: Ready) {
    // Most recently used goes to the back of the eviction line
    this.ready.delete(id)
    this.ready.set(id, ready)
    this.swap(this.media(), ready.url, this.sources.get(id)?.loop ?? false)
  }

  private swap(el: HTMLAudioElement, url: string, loop: boolean) {
    this.swapping = true
    el.loop = loop
    el.src = url
    this.attempt(el)
  }

  private attempt(el: HTMLAudioElement) {
    el.play().then(
      () => {
        this.swapping = false
      },
      (error: DOMException) => {
        this.swapping = false
        // AbortError just means a newer source replaced this one
        if (error.name !== 'AbortError' && !this.isSilent()) this.set({ status: 'paused' })
      },
    )
  }

  private onEnded() {
    if (this.isSilent()) return
    const id = this.state.currentId
    if (!id || this.sources.get(id)?.loop) return
    // Album mode: roll on to the next track; after the last one, back to Side A
    const next = this.playlist.includes(id) ? (this.neighbour(1, id) ?? this.fallbackId) : null
    if (next) this.play(next)
    else this.set({ status: 'paused' })
  }

  private onError() {
    if (this.isSilent()) return
    const id = this.state.currentId
    const ready = id ? this.ready.get(id) : undefined
    if (!id || !ready || ready.generated) {
      this.set({ status: 'paused' })
      return
    }
    console.warn(`[500 days] Couldn't load "${ready.url}". Playing the generated instrumental instead.`)
    this.broken.add(id)
    this.ready.delete(id)
    if (this.wanted === id) this.play(id)
  }

  private resolve(id: string): Promise<Ready> {
    const hit = this.ready.get(id)
    if (hit) return Promise.resolve(hit)
    const pending = this.inflight.get(id)
    if (pending) return pending
    const source = this.sources.get(id)
    if (!source) return Promise.reject(new Error(`Unknown track "${id}"`))

    let job: Promise<Ready>
    if (source.file && !this.broken.has(id)) {
      // Absolute, so it compares equal to `el.src` and pausing resumes instead of restarting
      job = Promise.resolve({ url: new URL(source.file, document.baseURI).href, generated: false })
    } else {
      // One render at a time keeps phones responsive
      const render = this.renderQueue.then(() => renderTheme(source.theme))
      this.renderQueue = render.catch(() => undefined)
      job = render.then((r) => ({ url: r.url, envelope: r.envelope, generated: true }))
    }

    const tracked = job.then(
      (ready) => {
        this.inflight.delete(id)
        this.ready.set(id, ready)
        this.evict()
        return ready
      },
      (error) => {
        this.inflight.delete(id)
        throw error
      },
    )
    this.inflight.set(id, tracked)
    return tracked
  }

  private evict() {
    const generated = [...this.ready].filter(([, r]) => r.generated)
    for (const [id, r] of generated.slice(0, Math.max(0, generated.length - MAX_CACHED))) {
      if (id === this.state.currentId || id === this.wanted) continue
      URL.revokeObjectURL(r.url)
      this.ready.delete(id)
    }
  }

  /* ── Lock screen / Control Center ── */

  private setupMediaSession() {
    if (!('mediaSession' in navigator)) return
    const handle = (action: MediaSessionAction, handler: MediaSessionActionHandler) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        /* action not supported on this browser */
      }
    }
    handle('play', () => this.play())
    handle('pause', () => this.pause())
    handle('nexttrack', () => this.next())
    handle('previoustrack', () => this.prev())
    handle('seekto', (details) => {
      if (details.seekTime != null) this.seek(details.seekTime)
    })
  }

  private syncMediaSession() {
    if (!('mediaSession' in navigator)) return
    const session = navigator.mediaSession
    const source = this.getSource(this.state.currentId)
    if (source && session.metadata?.title !== source.title()) {
      session.metadata = new MediaMetadata({
        title: source.title(),
        artist: source.artist(),
        album: source.album(),
        artwork: [{ src: this.artwork, sizes: '512x512', type: 'image/png' }],
      })
    }
    session.playbackState = this.state.status === 'playing' ? 'playing' : this.state.status === 'paused' ? 'paused' : 'none'
  }
}
