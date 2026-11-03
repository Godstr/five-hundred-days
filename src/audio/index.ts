import { useSyncExternalStore } from 'react'
import { story } from '../config/story'
import { tx } from '../i18n'
import { asset } from '../lib/dom'
import { AudioEngine } from './engine'
import { SIDE_A, THEMES } from './themes'

export const SIDE_A_ID = 'side-a'
export const VOICE_NOTE_ID = 'voice-note'

const artist = () => tx(story.album.artist)
const album = () => `${tx(story.album.title)} (${tx(story.album.edition)})`

export const engine = new AudioEngine()

engine.configure({
  sources: [
    { id: SIDE_A_ID, title: () => tx(story.music.title), artist, album, file: asset(story.music.src), theme: SIDE_A, loop: true },
    { id: VOICE_NOTE_ID, title: () => tx(story.voiceNote.title), artist, album, file: asset(story.voiceNote.src), theme: THEMES.dawn, loop: false },
    ...story.tracks.map((track, i) => ({
      id: track.id,
      title: () => tx(track.title),
      artist,
      album,
      file: asset(track.audio),
      // Same mood, different melody: offset the seed per track
      theme: { ...THEMES[track.mood], seed: THEMES[track.mood].seed + i * 97 },
      loop: false,
    })),
  ],
  playlist: story.tracks.map((track) => track.id),
  fallbackId: SIDE_A_ID,
  artwork: new URL(asset('icon-512.png')!, window.location.href).href,
})

export function usePlayer() {
  return useSyncExternalStore(engine.subscribe, engine.getState)
}

/** True while `id` (or anything, without an id) is playing or about to. */
export function useIsPlaying(id?: string): boolean {
  const { currentId, status } = usePlayer()
  return (id === undefined || currentId === id) && (status === 'playing' || status === 'loading')
}
