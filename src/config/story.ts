/**
 * ════════════════════════════════════════════════════════════════════════
 *   FIVE HUNDRED DAYS: the story's shape. The content itself lives in
 *   src/content/story.json.
 * ════════════════════════════════════════════════════════════════════════
 *
 *  Easiest way to edit: run `npm run dev` and open http://localhost:5173/#admin
 *  to change memories, photos, songs, names and the letter, then press Save.
 *
 *  Editing the JSON by hand works too:
 *  • Any text can be one string (shown in both languages) or { "en": "…", "mn": "…" }.
 *  • Photos live in public/memories/ ("photo": "memories/01.jpg"),
 *    audio in public/audio/ ("audio": "audio/01.m4a").
 *  • Leave a track's "audio" out and the site composes a little instrumental for it.
 *  • "startDate" is local time; everything counts from it.
 */

import type { L } from '../i18n'
import content from '../content/story.json'

/** Sets the artwork for photo-less polaroids and the mood of the generated instrumental. */
export type Mood = 'dawn' | 'road' | 'night' | 'stage' | 'snow' | 'code' | 'golden' | 'encore'

export interface Track {
  /** Unique, URL-safe id. */
  id: string
  title: L
  /** Small badge next to the title, e.g. "Intro", "Interlude", "Bonus". */
  tag?: L
  /** The day it happened, YYYY-MM-DD. */
  date: string
  place: L
  /** The short romantic note in the memory card. */
  note: L
  /** Handwritten caption under the polaroid. */
  caption: L
  /** Written on the back of the polaroid (she taps the photo to flip it). */
  ps?: L
  /** e.g. 'memories/01.jpg'. Leave empty for generated artwork. */
  photo?: string
  /** e.g. 'audio/01-voice-note.m4a'. Leave empty for a generated instrumental. */
  audio?: string
  /** Label above the player, e.g. "Voice note · recorded at 2 a.m." */
  audioLabel?: L
  mood: Mood
}

export interface StoryConfig {
  her: { name: L; nameTo: L }
  me: { name: L }
  startDate: string
  album: { title: L; edition: L; artist: L }
  music: { title: L; src?: string }
  voiceNote: { title: L; src?: string }
  tracks: Track[]
  linerNotes: L
  credits: { role: L; name: L }[]
  vault: { code: string; hint: L; rescueHint: L }
  letter: { greeting: L; body: L<string[]>; closing: L; signature: L }
  secret: { note: L<string[]>; signature: L }
}

export const story = content as StoryConfig
